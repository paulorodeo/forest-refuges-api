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
  const out: ListInput = {};

  const typeSlugs = asStringArray(d["typeSlugs"]);
  if (typeSlugs) out.typeSlugs = typeSlugs;
  const excludeTypeSlugs = asStringArray(d["excludeTypeSlugs"]);
  if (excludeTypeSlugs) out.excludeTypeSlugs = excludeTypeSlugs;
  const statusSlugs = asStringArray(d["statusSlugs"]);
  if (statusSlugs) out.statusSlugs = statusSlugs;

  const citySlug = d["citySlug"];
  if (typeof citySlug === "string" && citySlug) out.citySlug = citySlug;
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
