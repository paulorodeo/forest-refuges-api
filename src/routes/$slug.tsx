import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { fetchBlogPost } from "@/lib/blog.functions";

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => {
    const result = await fetchBlogPost({ data: { slug: params.slug } });
    if (result.status === "ok" && result.post.historicalPath === `/${params.slug}/`) {
      throw redirect({ to: "/blog/$slug", params: { slug: params.slug }, statusCode: 301 });
    }
    throw notFound();
  },
});