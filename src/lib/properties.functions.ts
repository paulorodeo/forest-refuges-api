import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";

export type { PropertyCardData, PropertyDetail, PropertyListResult, WpTerm } from "./wp.server";

type ListInput = {
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

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out = value.filter((v): v is string => typeof v === "string" && v.length > 0);
  return out.length ? out : undefined;
}

function validateList(data: unknown): ListInput {
  const d = (data ?? {}) as Record<string, unknown>;
  const out: ListInput = {};

  const typeSlugs = asStringArray(d["typeSlugs"]);
  if (typeSlugs) out.typeSlugs = typeSlugs;
  const excludeTypeSlugs = asStringArray(d["excludeTypeSlugs"]);
  if (excludeTypeSlugs) out.excludeTypeSlugs = excludeTypeSlugs;
  const statusSlugs = asStringArray(d["statusSlugs"]);
  if (statusSlugs) out.statusSlugs = statusSlugs;

  const citySlug = d["citySlug"];
  if (typeof citySlug === "string" && citySlug) out.citySlug = citySlug;
  const citySlugs = asStringArray(d["citySlugs"]);
  if (citySlugs) out.citySlugs = citySlugs;
  const areaSlug = d["areaSlug"];
  if (typeof areaSlug === "string" && areaSlug) out.areaSlug = areaSlug;
  const search = d["search"];
  if (typeof search === "string" && search) out.search = search.slice(0, 120);

  const page = d["page"];
  out.page = typeof page === "number" && Number.isFinite(page) ? Math.trunc(page) : 1;
  const perPage = d["perPage"];
  out.perPage = typeof perPage === "number" && Number.isFinite(perPage) ? Math.trunc(perPage) : 12;

  return out;
}

export const fetchProperties = createServerFn({ method: "GET" })
  .inputValidator(validateList)
  .handler(async ({ data }) => {
    const { listProperties } = await import("./wp.server");
    return listProperties(data);
  });

export const fetchProperty = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => {
    const slug = (data as { slug?: unknown })?.slug;
    if (typeof slug !== "string" || !slug) throw new Error("slug inválido");
    return { slug: slug.slice(0, 200) };
  })
  .handler(async ({ data }) => {
    const { getPropertyBySlug } = await import("./wp.server");
    try {
      const property = await getPropertyBySlug(data.slug);
      return property ? { status: "ok" as const, property } : { status: "not-found" as const };
    } catch (error) {
      console.error("[wp-property] returning controlled unavailable detail", error);
      setResponseStatus(503);
      return { status: "unavailable" as const };
    }
  });

export const fetchPropertyWithRelated = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => {
    const slug = (data as { slug?: unknown })?.slug;
    if (typeof slug !== "string" || !slug) throw new Error("slug inválido");
    return { slug: slug.slice(0, 200) };
  })
  .handler(async ({ data }) => {
    const { getPropertyBySlug, listRelatedPropertyCandidates, WordPressBlogAdapter } = await import("./wp.server");
    const { getRelatedForProperty } = await import("./related.server");
    try {
      const property = await getPropertyBySlug(data.slug);
      if (!property) return { status: "not-found" as const };
      try {
        const [properties, articles] = await Promise.all([listRelatedPropertyCandidates(), new WordPressBlogAdapter().listRelatedCandidates()]);
        return { status: "ok" as const, property, related: getRelatedForProperty(property, properties, articles) };
      } catch (error) {
        console.error("[wp-related] property candidates unavailable", error);
        return { status: "ok" as const, property, related: { properties: [], articles: [] } };
      }
    } catch (error) {
      console.error("[wp-property] returning controlled unavailable detail", error);
      setResponseStatus(503);
      return { status: "unavailable" as const };
    }
  });

export const fetchTerms = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => {
    const taxonomy = (data as { taxonomy?: unknown })?.taxonomy;
    const allowed = ["property_type", "property_status", "property_city", "property_area"];
    if (typeof taxonomy !== "string" || !allowed.includes(taxonomy)) {
      throw new Error("taxonomia inválida");
    }
    return { taxonomy };
  })
  .handler(async ({ data }) => {
    const { getTerms } = await import("./wp.server");
    try {
      return await getTerms(data.taxonomy);
    } catch (error) {
      console.error("[wp-terms] returning safe empty result", error);
      return [];
    }
  });
