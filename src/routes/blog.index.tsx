import { createFileRoute } from "@tanstack/react-router";
import { BlogPostCard } from "@/components/BlogPostCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { fetchBlogPosts } from "@/lib/blog.functions";
import { siteConfig } from "@/lib/site-config";

export const Route = createFileRoute("/blog/")({
  loader: () => fetchBlogPosts({ data: { limit: 18 } }),
  head: () => ({
    meta: [
      { title: "Blog Casa na Floresta | Guias, turismo e mercado" },
      {
        name: "description",
        content: "Guias para comprar, alugar e aproveitar chácaras, sítios, chalés e destinos de natureza.",
      },
      { property: "og:title", content: "Blog Casa na Floresta" },
      {
        property: "og:description",
        content: "Guias, turismo rural, documentação e mercado para escolher seu refúgio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${siteConfig.publicSiteUrl}/blog` }],
  }),
  component: BlogPage,
});

function BlogPage() {
  const result = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <header className="bg-forest py-16 text-forest-foreground">
          <div className="mx-auto max-w-6xl px-4">
            <p className="text-xs uppercase tracking-[0.18em] text-forest-foreground/70">
              Conhecimento para viver melhor no campo
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl">Blog Casa na Floresta</h1>
            <p className="mt-4 max-w-2xl text-forest-foreground/80">
              Guias, destinos, documentação e mercado para quem busca natureza, descanso e um bom refúgio.
            </p>
          </div>
        </header>
        <section className="mx-auto max-w-6xl px-4 py-14">
          {result.unavailable ? (
            <div className="border-y border-border py-12 text-center">
              <h2 className="text-2xl">Os artigos estão demorando para carregar</h2>
              <p className="mt-3 text-muted-foreground">Tente novamente em alguns instantes.</p>
            </div>
          ) : result.items.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((post) => <BlogPostCard key={post.id} post={post} />)}
            </div>
          ) : (
            <p className="py-12 text-center text-muted-foreground">Nenhum artigo encontrado.</p>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}