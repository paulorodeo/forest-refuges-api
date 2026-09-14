import assert from "node:assert/strict";
import test from "node:test";
import { featuredFromMedia, normalizeMediaUrl } from "./wp.server";

test("normalizes known legacy WordPress upload hosts to www2", () => {
  assert.equal(
    normalizeMediaUrl("https://www.casanafloresta.com.br/wp-content/uploads/2025/07/image.jpg"),
    "https://www2.casanafloresta.com.br/wp-content/uploads/2025/07/image.jpg",
  );
});

test("rejects direct object-storage URLs instead of selecting them as frontend media", () => {
  assert.equal(normalizeMediaUrl("https://usc1.contabostorage.com/bucket/image.jpg"), null);
});

test("prefers the WordPress original when a generated variant is stale", () => {
  const image = featuredFromMedia({
    source_url: "https://www2.casanafloresta.com.br/wp-content/uploads/2025/07/original.jpg",
    media_details: {
      sizes: {
        large: { source_url: "https://img.casanafloresta.com.br/wp-content/uploads/2025/07/original-768x576.jpg" },
      },
    },
  });
  assert.equal(image.src, "https://www2.casanafloresta.com.br/wp-content/uploads/2025/07/original.jpg");
});
