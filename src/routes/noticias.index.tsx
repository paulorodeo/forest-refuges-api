import { createFileRoute } from "@tanstack/react-router";
import { BlogPostCard } from "@/components/BlogPostCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { fetchBlogPosts } from "@/lib/blog.functions";
import { siteConfig } from "@/lib/site-config";
import { Pagination } from "@/components/Pagination";

export const Route = createFileRoute("/noticias/")({
  validateSearch: (search: Record<string, unknown>) => ({
    page:
      typeof search["page"] === "number"
        ? Math.max(1, Math.trunc(search["page"] as number))
        : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => fetchBlogPosts({ data: { page: deps.page ?? 1, perPage: 18 } }),
  head: () => ({
    meta: [
      { title: "Notícias Casa na Floresta | Guias, turismo e mercado" },
      {
        name: "description",
        content:
          "Notícias, guias e conteúdos para comprar, alugar e aproveitar chácaras, sítios, chalés e destinos de natureza.",
      },
      { property: "og:title", content: "Notícias Casa na Floresta" },
      {
        property: "og:description",
        content: "Notícias, turismo rural, documentação e mercado para escolher seu refúgio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${siteConfig.publicSiteUrl}/noticias` }],
  }),
  component: NoticiasPage,
});

function NoticiasPage() {
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
            <h1 className="mt-3 text-4xl sm:text-5xl">Notícias Casa na Floresta</h1>
            <p className="mt-4 max-w-2xl text-forest-foreground/80">
              Notícias, guias, destinos, documentação e mercado para quem busca natureza, descanso e
              um bom refúgio.
            </p>
          </div>
        </header>
        <section className="mx-auto max-w-6xl px-4 py-14">
          {result.unavailable ? (
            <div className="border-y border-border py-12 text-center">
              <h2 className="text-2xl">As notícias estão demorando para carregar</h2>
              <p className="mt-3 text-muted-foreground">Tente novamente em alguns instantes.</p>
            </div>
          ) : result.items.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-muted-foreground">Nenhuma notícia encontrada.</p>
          )}
          {!result.unavailable && (
            <Pagination page={result.page} totalPages={result.totalPages} pathname="/noticias" />
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
