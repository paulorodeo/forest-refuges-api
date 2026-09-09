import { createServerFn } from "@tanstack/react-start";

export type { PropertyCardData, PropertyDetail, WpTerm } from "./wp.server";

type ListInput = {
  typeSlugs?: string[];
  excludeTypeSlugs?: string[];
  statusSlugs?: string[];
  citySlug?: string;
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
  return {
    typeSlugs: asStringArray(d.typeSlugs),
    excludeTypeSlugs: asStringArray(d.excludeTypeSlugs),
    statusSlugs: asStringArray(d.statusSlugs),
    citySlug: typeof d.citySlug === "string" && d.citySlug ? d.citySlug : undefined,
    search: typeof d.search === "string" && d.search ? d.search.slice(0, 120) : undefined,
    page: typeof d.page === "number" && Number.isFinite(d.page) ? Math.trunc(d.page) : 1,
    perPage:
      typeof d.perPage === "number" && Number.isFinite(d.perPage) ? Math.trunc(d.perPage) : 12,
  };
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
    return getPropertyBySlug(data.slug);
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
    return getTerms(data.taxonomy);
  });
