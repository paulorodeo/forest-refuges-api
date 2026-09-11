/**
 * Adapter do WordPress (headless).
 * Fonte de verdade: casanafloresta.com.br — REST API pública /wp-json/wp/v2.
 * Nunca inventar campos: tudo aqui foi confirmado na auditoria da API.
 */

const WP_BASE = "https://www.casanafloresta.com.br/wp-json/wp/v2";
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { at: number; value: { json: any; total: number } }>();

async function wpFetch(path: string): Promise<{ json: any; total: number }> {
  const cached = cache.get(path);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value;

  const res = await fetch(`${WP_BASE}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`WordPress request failed [${res.status}] ${path}: ${body.slice(0, 500)}`);
    throw new Error(`WordPress request failed [${res.status}]`);
  }
  const total = Number(res.headers.get("x-wp-total") ?? "0");
  const value = { json: await res.json(), total };
  cache.set(path, { at: Date.now(), value });
  if (cache.size > 200) cache.delete(cache.keys().next().value as string);
  return value;
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
    `/${taxonomy}?per_page=${perPage}&orderby=count&order=desc&hide_empty=true`,
  );
  return (json as any[]).map((t) => ({
    id: t.id,
    name: decodeEntities(String(t.name)),
    slug: t.slug,
    count: t.count ?? 0,
  }));
}

async function getTermIds(taxonomy: string, slugs: string[]): Promise<number[]> {
  if (!slugs.length) return [];
  const { json } = await wpFetch(
    `/${taxonomy}?per_page=100&slug=${slugs.map(encodeURIComponent).join(",")}`,
  );
  return (json as any[]).map((t) => t.id);
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
};

export type PropertyDetail = PropertyCardData & {
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

function featured(p: any): { src: string | null; alt: string } {
  const media = p?._embedded?.["wp:featuredmedia"]?.[0];
  const src: string | null =
    media?.media_details?.sizes?.large?.source_url ??
    media?.media_details?.sizes?.medium_large?.source_url ??
    media?.source_url ??
    null;
  return { src, alt: media?.alt_text ? decodeEntities(media.alt_text) : "" };
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

export type ListParams = {
  typeSlugs?: string[];
  excludeTypeSlugs?: string[];
  statusSlugs?: string[];
  citySlug?: string;
  search?: string;
  page?: number;
  perPage?: number;
};

export async function listProperties(params: ListParams): Promise<{
  items: PropertyCardData[];
  total: number;
}> {
  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.min(24, Math.max(1, params.perPage ?? 12));
  const qs = new URLSearchParams({
    per_page: String(perPage),
    page: String(page),
    _embed: "1",
    orderby: "date",
    order: "desc",
  });

  if (params.typeSlugs?.length) {
    const ids = await getTermIds("property_type", params.typeSlugs);
    if (!ids.length) return { items: [], total: 0 };
    qs.set("property_type", ids.join(","));
  }
  if (params.excludeTypeSlugs?.length) {
    const ids = await getTermIds("property_type", params.excludeTypeSlugs);
    if (ids.length) qs.set("property_type_exclude", ids.join(","));
  }
  if (params.statusSlugs?.length) {
    const ids = await getTermIds("property_status", params.statusSlugs);
    if (ids.length) qs.set("property_status", ids.join(","));
  }
  if (params.citySlug) {
    const ids = await getTermIds("property_city", [params.citySlug]);
    if (ids.length) qs.set("property_city", ids.join(","));
  }
  if (params.search) qs.set("search", params.search);

  const { json, total } = await wpFetch(`/properties?${qs.toString()}`);
  return { items: (json as any[]).map(toCard), total };
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
        .map((m) => ({
          src:
            m?.media_details?.sizes?.large?.source_url ??
            m?.source_url ??
            "",
          alt: m?.alt_text ? decodeEntities(m.alt_text) : card.title,
        }))
        .filter((g) => g.src);
    } catch {
      gallery = [];
    }
  }

  return {
    ...card,
    contentHtml: p.content?.rendered ?? "",
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
    originalUrl: p.link,
  };
}
