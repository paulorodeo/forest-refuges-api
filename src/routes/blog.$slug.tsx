import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { fetchBlogPost } from "@/lib/blog.functions";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const result = await fetchBlogPost({ data: { slug: params.slug } });
    if (result.status === "not-found") throw notFound();
    if (result.status === "ok") {
      throw redirect({ to: "/$slug", params: { slug: params.slug }, statusCode: 301 });
    }
    return result;
  },
  head: () => ({
    meta: [
      { title: "Redirecionando artigo | Casa na Floresta" },
      { name: "description", content: "Este artigo possui um endereço histórico permanente." },
      { property: "og:title", content: "Redirecionando artigo | Casa na Floresta" },
      { property: "og:description", content: "Este artigo possui um endereço histórico permanente." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BlogRedirectUnavailable,
});

function BlogRedirectUnavailable() {
  return null;
}