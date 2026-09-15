import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
export type { BlogListPost, BlogListResult, BlogPost, BlogPostResult } from "./blog.types";

export const fetchBlogPosts = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => {
    const input = (data as { page?: unknown; perPage?: unknown } | undefined) ?? {};
    const page = typeof input.page === "number" && Number.isFinite(input.page) ? Math.trunc(input.page) : 1;
    const perPage = typeof input.perPage === "number" && Number.isFinite(input.perPage) ? Math.trunc(input.perPage) : 12;
    return { page: Math.max(1, page), perPage: Math.min(24, Math.max(1, perPage)) };
  })
  .handler(async ({ data }) => {
    const { WordPressBlogAdapter } = await import("./wp.server");
    return new WordPressBlogAdapter().list(data.page, data.perPage);
  });

export const fetchBlogPost = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => {
    const slug = (data as { slug?: unknown } | undefined)?.slug;
    if (typeof slug !== "string" || !slug) throw new Error("slug inválido");
    return { slug: slug.slice(0, 200) };
  })
  .handler(async ({ data }) => {
    const { WordPressBlogAdapter } = await import("./wp.server");
    const result = await new WordPressBlogAdapter().getBySlug(data.slug);
    if (result.status === "unavailable") setResponseStatus(503);
    return result;
  });

export const fetchBlogPostWithRelated = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => {
    const slug = (data as { slug?: unknown } | undefined)?.slug;
    if (typeof slug !== "string" || !slug) throw new Error("slug inválido");
    return { slug: slug.slice(0, 200) };
  })
  .handler(async ({ data }) => {
    const { WordPressBlogAdapter, listRelatedPropertyCandidates } = await import("./wp.server");
    const { getRelatedForArticle } = await import("./related.server");
    const adapter = new WordPressBlogAdapter();
    const result = await adapter.getBySlug(data.slug);
    if (result.status === "unavailable") setResponseStatus(503);
    if (result.status !== "ok") return result;
    try {
      const [articles, properties] = await Promise.all([adapter.listRelatedCandidates(), listRelatedPropertyCandidates()]);
      return { ...result, related: getRelatedForArticle(result.post, articles, properties) };
    } catch (error) {
      console.error("[wp-related] article candidates unavailable", error);
      return { ...result, related: { articles: [], properties: [] } };
    }
  });
