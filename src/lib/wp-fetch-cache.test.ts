import assert from "node:assert/strict";
import test from "node:test";
import { createWordPressFetchCache } from "./wp.server";

function response(json: unknown) {
  return new Response(JSON.stringify(json), {
    status: 200,
    headers: { "content-type": "application/json", "x-wp-total": "1", "x-wp-totalpages": "1" },
  });
}

test("WordPress cache serves a normal upstream response and clears inFlight", async () => {
  const cache = createWordPressFetchCache({ fetchImpl: async () => response([{ id: 1 }]), log: () => undefined });
  const result = await cache.wpFetch("/posts?per_page=1");
  assert.deepEqual(result.json, [{ id: 1 }]);
  assert.deepEqual(cache.getDebugState(), { cacheSize: 1, inFlightSize: 0, inFlightPaths: [] });
});

test("dedupes simultaneous calls to the same upstream path", async () => {
  let calls = 0;
  let resolveFetch: ((value: Response) => void) | undefined;
  const cache = createWordPressFetchCache({
    fetchImpl: () => {
      calls += 1;
      return new Promise<Response>((resolve) => { resolveFetch = resolve; });
    },
    log: () => undefined,
  });
  const first = cache.wpFetch("/properties?per_page=1");
  const second = cache.wpFetch("/properties?per_page=1");
  assert.equal(calls, 1);
  resolveFetch?.(response([{ id: 2 }]));
  assert.deepEqual(await first, await second);
  assert.equal(cache.getDebugState().inFlightSize, 0);
});

test("hard timeout releases a stuck inFlight entry and permits a retry", async () => {
  let calls = 0;
  const cache = createWordPressFetchCache({
    hardTimeoutMs: 10,
    requestTimeoutMs: 5,
    fetchImpl: () => {
      calls += 1;
      return calls === 1 ? new Promise<Response>(() => undefined) : Promise.resolve(response([{ id: 3 }]));
    },
    log: () => undefined,
  });
  await assert.rejects(cache.wpFetch("/property_state?include=110"), /hard timed out/);
  assert.equal(cache.getDebugState().inFlightSize, 0);
  assert.deepEqual((await cache.wpFetch("/property_state?include=110")).json, [{ id: 3 }]);
  assert.equal(calls, 2);
});

test("serves stale data immediately when background revalidation fails", async () => {
  let time = 0;
  let calls = 0;
  const cache = createWordPressFetchCache({
    freshTtlMs: 1,
    staleTtlMs: 100,
    now: () => time,
    fetchImpl: () => {
      calls += 1;
      return calls === 1 ? Promise.resolve(response([{ id: 4 }])) : Promise.reject(new Error("upstream down"));
    },
    log: () => undefined,
  });
  await cache.wpFetch("/posts?per_page=1");
  time = 2;
  assert.deepEqual((await cache.wpFetch("/posts?per_page=1")).json, [{ id: 4 }]);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(cache.getDebugState().inFlightSize, 0);
});

test("does not cache empty slug probes that would evict reusable entries", async () => {
  const cache = createWordPressFetchCache({ fetchImpl: async () => response([]), log: () => undefined });
  await cache.wpFetch("/posts?slug=random-crawler-probe.php");
  assert.equal(cache.getDebugState().cacheSize, 0);
});
