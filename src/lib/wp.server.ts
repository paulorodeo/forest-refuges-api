/**
 * Adapter do WordPress (headless).
 * Fonte legada: www2.casanafloresta.com.br — REST API pública /wp-json/wp/v2.
 * Nunca inventar campos: tudo aqui foi confirmado na auditoria da API.
 */

import { siteConfig, toPublicUrl } from "./site-config";
import { normalizeEmbeddedImageUrls, normalizeWordPressMediaUrl } from "./media";
import type { BlogListPost, BlogListResult, BlogPost, BlogPostResult } from "./blog.types";

const WP_BASE = `${siteConfig.wordpressOrigin}/wp-json/wp/v2`;
const FRESH_TTL_MS = 5 * 60 * 1000;
const STALE_TTL_MS = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10_000;
type WpResponse = { json: any; total: number; totalPages: number };
type CacheEntry = { at: number; value: WpResponse };
type InFlightEntry = { promise: Promise<WpResponse>; startedAt: number };
type WpFetchOptions = {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  freshTtlMs?: number;
  staleTtlMs?: number;
  requestTimeoutMs?: number;
  hardTimeoutMs?: number;
  cacheMaxEntries?: number;
  now?: () => number;
  log?: (message: string, error?: unknown) => void;
};

/**
 * A small per-process cache for the WordPress REST upstream. The hard timeout is deliberately
 * separate from AbortSignal: a socket or fetch implementation may ignore abortion, but callers
 * must never inherit a permanently pending shared Promise.
 */
export function createWordPressFetchCache(options: WpFetchOptions = {}) {
  const baseUrl = options.baseUrl ?? WP_BASE;
  const fetchImpl = options.fetchImpl ?? fetch;
  const freshTtlMs = options.freshTtlMs ?? FRESH_TTL_MS;
  const staleTtlMs = options.staleTtlMs ?? STALE_TTL_MS;
  const requestTimeoutMs = options.requestTimeoutMs ?? REQUEST_TIMEOUT_MS;
  const hardTimeoutMs = options.hardTimeoutMs ?? requestTimeoutMs + 1_000;
  const cacheMaxEntries = options.cacheMaxEntries ?? 200;
  const now = options.now ?? Date.now;
  const log = options.log ?? ((message, error) => (error ? console.error(message, error) : console.info(message)));
  const cache = new Map<string, CacheEntry>();
  const inFlight = new Map<string, InFlightEntry>();

  function logFetch(path: string, startedAt: number, status: number | string, cacheState: string) {
    log(`[wp-fetch] endpoint=${path} duration_ms=${now() - startedAt} status=${status} cache=${cacheState}`);
  }

  // Empty `?slug=` answers are overwhelmingly crawler probes. Keeping them has no reuse value
  // and used to evict active listing/taxonomy entries from this intentionally small cache.
  function shouldCache(path: string, value: WpResponse) {
    return !(path.includes("slug=") && Array.isArray(value.json) && value.json.length === 0);
  }

  function isLowPriority(path: string) {
    return path.includes("slug=");
  }

  function cacheValue(path: string, value: WpResponse) {
    if (!shouldCache(path, value)) return;
    cache.set(path, { at: now(), value });
    while (cache.size > cacheMaxEntries) {
      const lowPriority = [...cache.keys()].find(isLowPriority);
      cache.delete(lowPriority ?? cache.keys().next().value!);
    }
  }

  function hardTimeout<T>(source: Promise<T>, path: string, cacheState: "miss" | "revalidate", startedAt: number, abandon: () => void) {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        abandon();
        logFetch(path, startedAt, "hard-timeout", cacheState);
        reject(new Error(`WordPress request hard timed out after ${hardTimeoutMs}ms`));
      }, hardTimeoutMs);
      source.then(
        (value) => { clearTimeout(timer); resolve(value); },
        (error) => { clearTimeout(timer); reject(error); },
      );
    });
  }

  function fetchFromWordPress(path: string, cacheState: "miss" | "revalidate"): Promise<WpResponse> {
    const existing = inFlight.get(path);
    if (existing) {
      logFetch(path, now(), "pending", "deduped");
      return existing.promise;
    }

    const startedAt = now();
    let abandoned = false;
    const source = (async () => {
      try {
        const res = await fetchImpl(`${baseUrl}${path}`, {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(requestTimeoutMs),
        });
        if (!res.ok) {
          const body = await res.text();
          logFetch(path, startedAt, res.status, cacheState);
          log(`WordPress request failed [${res.status}] ${path}: ${body.slice(0, 500)}`);
          throw new Error(`WordPress request failed [${res.status}]`);
        }
        const value = {
          json: await res.json(),
          total: Number(res.headers.get("x-wp-total") ?? "0"),
          totalPages: Number(res.headers.get("x-wp-totalpages") ?? "0"),
        };
        // A late socket must not overwrite a newer retry's cache entry.
        if (!abandoned) cacheValue(path, value);
        logFetch(path, startedAt, res.status, cacheState);
        return value;
      } catch (error) {
        if (error instanceof Error && error.name === "TimeoutError") {
          logFetch(path, startedAt, "timeout", cacheState);
          throw new Error(`WordPress request timed out after ${requestTimeoutMs}ms`);
        }
        throw error;
      }
    })();
    // The race attaches a rejection handler, and this extra handler makes a late source
    // rejection explicitly harmless after its wrapper has already timed out.
    void source.catch(() => undefined);
    const request = hardTimeout(source, path, cacheState, startedAt, () => { abandoned = true; });
    const entry: InFlightEntry = { promise: request, startedAt };
    inFlight.set(path, entry);
    void request.finally(() => {
      // Never let a late completion delete a newer retry for the same path.
      if (inFlight.get(path) === entry) inFlight.delete(path);
    }).catch(() => undefined);
    return request;
  }

  async function wpFetch(path: string): Promise<WpResponse> {
    const startedAt = now();
    const cached = cache.get(path);
    const age = cached ? now() - cached.at : Number.POSITIVE_INFINITY;
    if (cached && age < freshTtlMs) {
      logFetch(path, startedAt, 200, "hit");
      return cached.value;
    }
    if (cached && age < staleTtlMs) {
      logFetch(path, startedAt, 200, "stale");
      void fetchFromWordPress(path, "revalidate").catch((error) => {
        log(`[wp-fetch] background revalidation failed endpoint=${path}`, error);
      });
      return cached.value;
    }
    try {
      return await fetchFromWordPress(path, cached ? "revalidate" : "miss");
    } catch (error) {
      if (cached) {
        logFetch(path, startedAt, "upstream-error", "stale-if-error");
        return cached.value;
      }
      throw error;
    }
  }

  return {
    wpFetch,
    getDebugState: () => ({ cacheSize: cache.size, inFlightSize: inFlight.size, inFlightPaths: [...inFlight.keys()] }),
  };
}

const { wpFetch } = createWordPressFetchCache();
const { wpFetch: wpCustomFetch } = createWordPressFetchCache({
  baseUrl: `${siteConfig.wordpressOrigin}/wp-json`,
  freshTtlMs: 60_000,
});

export async function getElfsightWidgetConfig(id: number) {
  const { json } = await wpCustomFetch(`/cnf/v1/elfsight-whatsapp-widget/${id}`);
  const value = json as Record<string, unknown>;
  if (
    !value || typeof value !== "object" || typeof value["id"] !== "number" ||
    typeof value["version"] !== "string" || typeof value["scriptUrl"] !== "string" ||
    !value["options"] || typeof value["options"] !== "object"
  ) return null;
  return {
    id: value["id"],
    version: value["version"],
    optionsJson: JSON.stringify(value["options"]),
    scriptUrl: value["scriptUrl"],
  };
}


export type WpTerm = { id: number; name: string; slug: string; count: number };

function decodeEntities(input: string): string {
  return input
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&aacute;/g, "á")
    .replace(/&eacute;/g, "é")
    .replace(/&iacute;/g, "í")
    .replace(/&oacute;/g, "ó")
    .replace(/&ecirc;/g, "ê")
    .replace(/&atilde;/g, "ã")
    .replace(/&ccedil;/g, "ç")
    .replace(/&#(\d+);/g, (_m, d) => String.fromCharCode(Number(d)));
}

export function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
}

export async function getTerms(taxonomy: string, perPage = 100): Promise<WpTerm[]> {
  const { json } = await wpFetch(
    `/${taxonomy}?per_page=${perPage}&orderby=count&order=desc&hide_empty=true&_fields=id,name,slug,count`,
  );
  return (json as any[]).map((t) => ({
    id: t.id,
    name: decodeEntities(String(t.name)),
    slug: t.slug,
    count: t.count ?? 0,
  }));
}

export async function getSitemapItems(endpoint: "properties" | "posts") {
  const first = await wpFetch(`/${endpoint}?page=1&per_page=100&_fields=slug`);
  const items = [...(first.json as Array<{ slug?: string }>)] ;
  for (let page = 2; page <= first.totalPages; page += 1) {
    const next = await wpFetch(`/${endpoint}?page=${page}&per_page=100&_fields=slug`);
    items.push(...(next.json as Array<{ slug?: string }>));
  }
  return items.flatMap((item) => item.slug ? [item.slug] : []);
}

async function getTermIds(taxonomy: string, slugs: string[]): Promise<number[]> {
  if (!slugs.length) return [];
  const { json } = await wpFetch(
    `/${taxonomy}?per_page=${Math.min(100, slugs.length)}&slug=${slugs.map(encodeURIComponent).join(",")}&_fields=id`,
  );
  return (json as any[]).map((t) => t.id);
}

async function getTermsByIds(taxonomy: string, ids: number[]): Promise<WpTerm[]> {
  const uniqueIds = [...new Set(ids)].filter((id) => Number.isFinite(id) && id > 0);
  if (!uniqueIds.length) return [];
  const { json } = await wpFetch(
    `/${taxonomy}?include=${uniqueIds.join(",")}&per_page=${uniqueIds.length}&_fields=id,name,slug`,
  );
  return (json as any[]).map((t) => ({
    id: t.id,
    name: decodeEntities(String(t.name)),
    slug: t.slug,
    count: 0,
  }));
}

export type PropertyCardData = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: string | null;
  imageAlt: string;
  price: number | null;
  pricePostfix: string | null;
  size: number | null;
  city: string | null;
  state: string | null;
  area: string | null;
  typeName: string | null;
  typeSlug: string | null;
  statusName: string | null;
  statusSlug: string | null;
  sourceType?: "own" | "partner";
  partnerId?: string | null;
  partnerName?: string | null;
  partnerSourceUrl?: string | null;
  partnerPropertyId?: string | null;
  lastSyncedAt?: string | null;
  sourceStatus?: "published" | "candidate" | "review" | "rejected" | null;
  contentRewriteVersion?: string | null;
  partnerCoverMode?: "remote_first" | "fixed_partner_cover" | "generated_from_gallery" | null;
};

export type PropertyListResult = {
  items: PropertyCardData[];
  total: number;
  page: number;
  totalPages: number;
  unavailable: boolean;
};

export type PropertyDetail = PropertyCardData & {
  publishedAt: string;
  contentHtml: string;
  gallery: { src: string; alt: string }[];
  address: string | null;
  zip: string | null;
  lat: number | null;
  lng: number | null;
  features: string[];
  bedrooms: number | null;
  bathrooms: number | null;
  refId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  originalUrl: string;
};

function meta(p: any, key: string): string | null {
  const v = p?.property_meta?.[key];
  const first = Array.isArray(v) ? v[0] : v;
  if (first === undefined || first === null || first === "") return null;
  return String(first);
}

function num(value: string | null): number | null {
  if (!value) return null;
  const n = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function embeddedTerms(p: any, taxonomy: string): WpTerm[] {
  const groups: any[][] = p?._embedded?.["wp:term"] ?? [];
  const flat = groups.flat().filter(Boolean);
  return flat
    .filter((t) => t.taxonomy === taxonomy)
    .map((t) => ({ id: t.id, name: decodeEntities(String(t.name)), slug: t.slug, count: 0 }));
}

/**
 * WordPress is the media origin. Prefer its original attachment URL because generated size
 * variants can be stale after migrations; only rewrite known legacy upload hosts.
 */
export const normalizeMediaUrl = normalizeWordPressMediaUrl;

export function featuredFromMedia(media: any): { src: string | null; alt: string } {
  const src = [
    media?.source_url,
    media?.media_details?.sizes?.large?.source_url,
    media?.media_details?.sizes?.medium_large?.source_url,
  ]
    .map(normalizeMediaUrl)
    .find((url): url is string => Boolean(url)) ?? null;
  return { src, alt: media?.alt_text ? decodeEntities(media.alt_text) : "" };
}

function featured(p: any): { src: string | null; alt: string } {
  return featuredFromMedia(p?._embedded?.["wp:featuredmedia"]?.[0]);
}

async function getFeaturedMediaById(ids: number[]): Promise<Map<number, any>> {
  const uniqueIds = [...new Set(ids)].filter((id) => Number.isFinite(id) && id > 0);
  if (!uniqueIds.length) return new Map();
  const { json } = await wpFetch(
    `/media?include=${uniqueIds.join(",")}&per_page=${uniqueIds.length}&_fields=id,source_url,alt_text,media_details`,
  );
  return new Map((json as any[]).map((media) => [Number(media.id), media]));
}

function taxonomyIds(p: any, taxonomy: string): number[] {
  const values = Array.isArray(p?.[taxonomy]) ? p[taxonomy] : [];
  return values.map(Number).filter((id: number) => Number.isFinite(id) && id > 0);
}

function toCard(p: any): PropertyCardData {
  const type = embeddedTerms(p, "property_type")[0] ?? null;
  const status = embeddedTerms(p, "property_status")[0] ?? null;
  const city = embeddedTerms(p, "property_city")[0] ?? null;
  const state = embeddedTerms(p, "property_state")[0] ?? null;
  const area = embeddedTerms(p, "property_area")[0] ?? null;
  const img = featured(p);
  return {
    id: p.id,
    slug: p.slug,
    title: decodeEntities(p.title?.rendered ?? ""),
    excerpt: stripHtml(p.excerpt?.rendered ?? "").slice(0, 180),
    image: img.src,
    imageAlt: img.alt,
    price: num(meta(p, "fave_property_price")),
    pricePostfix: meta(p, "fave_property_price_postfix"),
    size: num(meta(p, "fave_property_size")),
    city: city?.name ?? null,
    state: state?.name ?? null,
    area: area?.name ?? null,
    typeName: type?.name ?? null,
    typeSlug: type?.slug ?? null,
    statusName: status?.name ?? null,
    statusSlug: status?.slug ?? null,
  };
}

const PROPERTY_CARD_TAXONOMIES = [
  "property_type",
  "property_status",
  "property_city",
  "property_state",
  "property_area",
] as const;

type PropertyCardTaxonomy = (typeof PROPERTY_CARD_TAXONOMIES)[number];
type TermsByTaxonomy = Record<PropertyCardTaxonomy, Map<number, WpTerm>>;

function listedTerm(
  p: any,
  taxonomy: PropertyCardTaxonomy,
  termsByTaxonomy: TermsByTaxonomy,
): WpTerm | null {
  const id = taxonomyIds(p, taxonomy)[0];
  return id ? termsByTaxonomy[taxonomy].get(id) ?? null : null;
}

function toListedPropertyCard(
  p: any,
  mediaById: Map<number, any>,
  termsByTaxonomy: TermsByTaxonomy,
): PropertyCardData {
  const type = listedTerm(p, "property_type", termsByTaxonomy);
  const status = listedTerm(p, "property_status", termsByTaxonomy);
  const city = listedTerm(p, "property_city", termsByTaxonomy);
  const state = listedTerm(p, "property_state", termsByTaxonomy);
  const area = listedTerm(p, "property_area", termsByTaxonomy);
  const image = featuredFromMedia(mediaById.get(Number(p.featured_media)));
  return {
    id: p.id,
    slug: p.slug,
    title: decodeEntities(p.title?.rendered ?? ""),
    excerpt: "",
    image: image.src,
    imageAlt: image.alt,
    price: num(meta(p, "fave_property_price")),
    pricePostfix: meta(p, "fave_property_price_postfix"),
    size: num(meta(p, "fave_property_size")),
    city: city?.name ?? null,
    state: state?.name ?? null,
    area: area?.name ?? null,
    typeName: type?.name ?? null,
    typeSlug: type?.slug ?? null,
    statusName: status?.name ?? null,
    statusSlug: status?.slug ?? null,
  };
}

export type ListParams = {
  typeSlugs?: string[];
  excludeTypeSlugs?: string[];
  statusSlugs?: string[];
  citySlug?: string;
  citySlugs?: string[];
  areaSlug?: string;
  search?: string;
  page?: number;
  perPage?: number;
};

export async function listProperties(params: ListParams): Promise<PropertyListResult> {
  try {
    const page = Math.max(1, params.page ?? 1);
    const perPage = Math.min(24, Math.max(1, params.perPage ?? 12));
    const qs = new URLSearchParams({
      per_page: String(perPage),
      page: String(page),
      orderby: "date",
      order: "desc",
      _fields: [
        "id",
        "slug",
        "title",
        "featured_media",
        "property_meta.fave_property_price",
        "property_meta.fave_property_price_postfix",
        "property_meta.fave_property_size",
        ...PROPERTY_CARD_TAXONOMIES,
      ].join(","),
    });

    const [typeIds, excludedTypeIds, statusIds, cityIds, areaIds, citiesIds] = await Promise.all([
      params.typeSlugs?.length ? getTermIds("property_type", params.typeSlugs) : [],
      params.excludeTypeSlugs?.length
        ? getTermIds("property_type", params.excludeTypeSlugs)
        : [],
      params.statusSlugs?.length ? getTermIds("property_status", params.statusSlugs) : [],
      params.citySlug ? getTermIds("property_city", [params.citySlug]) : [],
      params.areaSlug ? getTermIds("property_area", [params.areaSlug]) : [],
      params.citySlugs?.length ? getTermIds("property_city", params.citySlugs) : [],
    ]);

    if (params.typeSlugs?.length) {
      if (!typeIds.length) return { items: [], total: 0, page, totalPages: 0, unavailable: false };
      qs.set("property_type", typeIds.join(","));
    }
    if (params.excludeTypeSlugs?.length && excludedTypeIds.length) {
      qs.set("property_type_exclude", excludedTypeIds.join(","));
    }
    if (params.statusSlugs?.length) {
      if (!statusIds.length) return { items: [], total: 0, page, totalPages: 0, unavailable: false };
      qs.set("property_status", statusIds.join(","));
    }
    if (params.citySlug) {
      if (!cityIds.length) return { items: [], total: 0, page, totalPages: 0, unavailable: false };
      qs.set("property_city", cityIds.join(","));
    }
    if (params.citySlugs?.length) {
      if (!citiesIds.length) return { items: [], total: 0, page, totalPages: 0, unavailable: false };
      qs.set("property_city", citiesIds.join(","));
    }
    if (params.areaSlug) {
      if (!areaIds.length) return { items: [], total: 0, page, totalPages: 0, unavailable: false };
      qs.set("property_area", areaIds.join(","));
    }
    if (params.search) qs.set("search", params.search);

    const { json, total, totalPages } = await wpFetch(`/properties?${qs.toString()}`);
    const properties = json as any[];
    const mediaIds = properties.map((property) => Number(property.featured_media));
    const termIdsByTaxonomy = Object.fromEntries(
      PROPERTY_CARD_TAXONOMIES.map((taxonomy) => [
        taxonomy,
        properties.flatMap((property) => taxonomyIds(property, taxonomy)),
      ]),
    ) as Record<PropertyCardTaxonomy, number[]>;
    const [mediaById, ...termLists] = await Promise.all([
      getFeaturedMediaById(mediaIds),
      ...PROPERTY_CARD_TAXONOMIES.map((taxonomy) =>
        getTermsByIds(taxonomy, termIdsByTaxonomy[taxonomy]),
      ),
    ]);
    const termsByTaxonomy = Object.fromEntries(
      PROPERTY_CARD_TAXONOMIES.map((taxonomy, index) => [
        taxonomy,
        new Map((termLists[index] ?? []).map((term) => [term.id, term])),
      ]),
    ) as TermsByTaxonomy;

    return {
      items: properties.map((property) => toListedPropertyCard(property, mediaById, termsByTaxonomy)),
      total,
      page,
      totalPages: totalPages || Math.ceil(total / perPage),
      unavailable: false,
    };
  } catch (error) {
    console.error("[wp-properties] returning safe unavailable result", error);
    return { items: [], total: 0, page: Math.max(1, params.page ?? 1), totalPages: 0, unavailable: true };
  }
}

/** Limited candidate feed for related-content scoring. It resolves media and terms in batches. */
export async function listRelatedPropertyCandidates(limit = 24) {
  const perPage = Math.min(24, Math.max(1, limit));
  const { json } = await wpFetch(
    `/properties?per_page=${perPage}&orderby=date&order=desc&_fields=${encodeURIComponent([
      "id", "slug", "title", "excerpt", "date", "featured_media", "property_feature",
      "property_meta.fave_property_price", "property_meta.fave_property_price_postfix",
      "property_meta.fave_property_size", "property_meta.fave_property_bedrooms",
      ...PROPERTY_CARD_TAXONOMIES,
    ].join(","))}`,
  );
  const properties = json as any[];
  const termIdsByTaxonomy = Object.fromEntries(
    PROPERTY_CARD_TAXONOMIES.map((taxonomy) => [taxonomy, properties.flatMap((p) => taxonomyIds(p, taxonomy))]),
  ) as Record<PropertyCardTaxonomy, number[]>;
  const featureIds = properties.flatMap((property) => taxonomyIds(property, "property_feature"));
  const [mediaById, ...termLists] = await Promise.all([
    getFeaturedMediaById(properties.map((property) => Number(property.featured_media))),
    ...PROPERTY_CARD_TAXONOMIES.map((taxonomy) => getTermsByIds(taxonomy, termIdsByTaxonomy[taxonomy])),
    getTermsByIds("property_feature", featureIds),
  ]);
  const termsByTaxonomy = Object.fromEntries(
    PROPERTY_CARD_TAXONOMIES.map((taxonomy, index) => [taxonomy, new Map((termLists[index] ?? []).map((term) => [term.id, term]))]),
  ) as TermsByTaxonomy;
  const featuresById = new Map((termLists[PROPERTY_CARD_TAXONOMIES.length] ?? []).map((term) => [term.id, term]));
  return properties.map((property) => ({
    ...toListedPropertyCard(property, mediaById, termsByTaxonomy),
    publishedAt: String(property.date ?? ""),
    contentHtml: "",
    bedrooms: num(meta(property, "fave_property_bedrooms")),
    features: taxonomyIds(property, "property_feature").flatMap((id) => {
      const term = featuresById.get(id);
      return term ? [term.name] : [];
    }),
  }));
}

export async function getPropertyBySlug(slug: string): Promise<PropertyDetail | null> {
  const { json } = await wpFetch(`/properties?slug=${encodeURIComponent(slug)}&_embed=1`);
  const p = (json as any[])[0];
  if (!p) return null;

  const card = toCard(p);
  const location = meta(p, "fave_property_location");
  const [latRaw, lngRaw] = (location ?? "").split(",");

  let gallery: { src: string; alt: string }[] = [];
  const imageIds = (p?.property_meta?.fave_property_images ?? [])
    .map((v: any) => Number(v))
    .filter((n: number) => Number.isFinite(n) && n > 0);
  if (imageIds.length) {
    try {
      const { json: media } = await wpFetch(
        `/media?include=${imageIds.slice(0, 20).join(",")}&per_page=20`,
      );
      gallery = (media as any[])
        .map((m) => {
          const image = featuredFromMedia(m);
          return { src: image.src ?? "", alt: image.alt || card.title };
        })
        .filter((g) => g.src);
    } catch {
      gallery = [];
    }
  }

  return {
    ...card,
    publishedAt: String(p.date ?? ""),
    contentHtml: normalizeEmbeddedImageUrls(p.content?.rendered ?? ""),
    gallery,
    address: meta(p, "fave_property_address"),
    zip: meta(p, "fave_property_zip"),
    lat: num(latRaw ?? null),
    lng: num(lngRaw ?? null),
    features: embeddedTerms(p, "property_feature").map((t) => t.name),
    bedrooms: num(meta(p, "fave_property_bedrooms")),
    bathrooms: num(meta(p, "fave_property_bathrooms")),
    refId: meta(p, "fave_property_id"),
    seoTitle: p?.yoast_head_json?.title ?? null,
    seoDescription: p?.yoast_head_json?.description ?? null,
    originalUrl:
      toPublicUrl(p.link) ?? `${siteConfig.publicSiteUrl}/imovel/${encodeURIComponent(card.slug)}`,
  };
}

function toBlogPost(post: any): BlogPost {
  const media = featured(post);
  const categories = embeddedTerms(post, "category").map((term) => term.name);
  const tags = embeddedTerms(post, "post_tag").map((term) => term.name);
  const author = post?._embedded?.author?.[0];
  const slug = String(post.slug ?? "");
  const historicalUrl = typeof post.link === "string" ? post.link : null;
  return {
    id: Number(post.id),
    source: "wordpress",
    slug,
    title: decodeEntities(String(post?.title?.rendered ?? "")),
    excerpt: stripHtml(String(post?.excerpt?.rendered ?? "")).slice(0, 240),
    contentHtml: normalizeEmbeddedImageUrls(String(post?.content?.rendered ?? "")),
    image: media.src,
    imageAlt: media.alt,
    authorName: author?.name ? decodeEntities(String(author.name)) : null,
    publishedAt: String(post.date ?? ""),
    modifiedAt: String(post.modified ?? post.date ?? ""),
    categories,
    tags,
    seoTitle: post?.yoast_head_json?.title ?? null,
    seoDescription: post?.yoast_head_json?.description ?? null,
    historicalUrl,
    historicalPath: historicalUrl ? new URL(historicalUrl).pathname : `/${slug}/`,
    canonicalUrl: `${siteConfig.publicSiteUrl}/${encodeURIComponent(slug)}/`,
  };
}

function toBlogListPost(post: any, mediaById: Map<number, any>): BlogListPost {
  const media = featuredFromMedia(mediaById.get(Number(post.featured_media)));
  return {
    id: Number(post.id),
    source: "wordpress",
    slug: String(post.slug ?? ""),
    title: decodeEntities(String(post?.title?.rendered ?? "")),
    excerpt: stripHtml(String(post?.excerpt?.rendered ?? "")).slice(0, 240),
    image: media.src,
    imageAlt: media.alt,
    publishedAt: String(post.date ?? ""),
  };
}

export class WordPressBlogAdapter {
  async list(page = 1, perPage = 12): Promise<BlogListResult> {
    try {
      const safePage = Math.max(1, page);
      const safePerPage = Math.min(24, Math.max(1, perPage));
      const { json, total, totalPages } = await wpFetch(
        `/posts?page=${safePage}&per_page=${safePerPage}&orderby=date&order=desc&_fields=id,slug,title,excerpt,date,featured_media`,
      );
      const listedPosts = json as any[];
      const mediaById = await getFeaturedMediaById(
        listedPosts.map((post) => Number(post.featured_media)),
      );
      const posts = listedPosts.map((post) => toBlogListPost(post, mediaById));
      return { items: posts, total, totalPages: totalPages || Math.ceil(total / safePerPage), page: safePage, unavailable: false };
    } catch (error) {
      console.error("[wp-blog] returning safe unavailable list", error);
      return { items: [], total: 0, totalPages: 0, page: Math.max(1, page), unavailable: true };
    }
  }

  /** Limited candidate feed for related-content scoring without _embed. */
  async listRelatedCandidates(limit = 24) {
    const perPage = Math.min(24, Math.max(1, limit));
    const { json } = await wpFetch(
      `/posts?per_page=${perPage}&orderby=date&order=desc&_fields=id,slug,title,excerpt,content,date,featured_media,categories,tags`,
    );
    const posts = json as any[];
    const [mediaById, categories, tags] = await Promise.all([
      getFeaturedMediaById(posts.map((post) => Number(post.featured_media))),
      getTermsByIds("categories", posts.flatMap((post) => taxonomyIds(post, "categories"))),
      getTermsByIds("tags", posts.flatMap((post) => taxonomyIds(post, "tags"))),
    ]);
    const categoriesById = new Map(categories.map((term) => [term.id, term.name]));
    const tagsById = new Map(tags.map((term) => [term.id, term.name]));
    return posts.map((post) => {
      const card = toBlogListPost(post, mediaById);
      return {
        ...card,
        contentHtml: normalizeEmbeddedImageUrls(String(post.content?.rendered ?? "")),
        categories: taxonomyIds(post, "categories").flatMap((id) => categoriesById.get(id) ?? []),
        tags: taxonomyIds(post, "tags").flatMap((id) => tagsById.get(id) ?? []),
        canonicalUrl: `${siteConfig.publicSiteUrl}/${encodeURIComponent(card.slug)}/`,
      };
    });
  }

  async getBySlug(slug: string): Promise<BlogPostResult> {
    try {
      const { json } = await wpFetch(`/posts?slug=${encodeURIComponent(slug)}&_embed=1`);
      const post = (json as any[])[0];
      if (!post) return { status: "not-found" };
      return { status: "ok", post: toBlogPost(post) };
    } catch (error) {
      console.error("[wp-blog] returning controlled unavailable detail", error);
      return { status: "unavailable" };
    }
  }
}
