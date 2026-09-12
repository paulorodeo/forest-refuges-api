import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
export type { BlogListResult, BlogPost, BlogPostResult } from "./blog.types";

export const fetchBlogPosts = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => {
    const value = (data as { limit?: unknown } | undefined)?.limit;
    const limit = typeof value === "number" && Number.isFinite(value) ? Math.trunc(value) : 12;
    return { limit: Math.min(24, Math.max(1, limit)) };
  })
  .handler(async ({ data }) => {
    const { WordPressBlogAdapter } = await import("./wp.server");
    return new WordPressBlogAdapter().list(data.limit);
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