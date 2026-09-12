import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, UserRound } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { fetchBlogPost } from "@/lib/blog.functions";
import { getFallbackImage } from "@/lib/fallback-images";
import { siteConfig } from "@/lib/site-config";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const result = await fetchBlogPost({ data: { slug: params.slug } });
    if (result.status === "not-found") throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    if (!loaderData || loaderData.status !== "ok") {
      return { meta: [{ title: "Artigo indisponível | Casa na Floresta" }, { name: "robots", content: "noindex" }] };
    }
    const post = loaderData.post;
    const title = post.seoTitle ?? `${post.title} | Casa na Floresta`;
    const description = post.seoDescription ?? post.excerpt;
    const image = post.image;
    return {
      meta: [
        { title }, { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
      ],
      links: [{ rel: "canonical", href: post.canonicalUrl }],
    };
  },
  notFoundComponent: BlogNotFound,
  component: BlogDetailPage,
});

function BlogNotFound() {
  return <div className="min-h-screen bg-background"><SiteHeader /><main className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="text-3xl">Artigo não encontrado</h1><p className="mt-4 text-muted-foreground">Este conteúdo pode ter sido removido ou atualizado.</p><Link to="/blog" className="mt-8 inline-flex rounded-md bg-accent px-6 py-3 text-sm font-medium text-accent-foreground">Ver todos os artigos</Link></main><SiteFooter /></div>;
}

function BlogDetailPage() {
  const result = Route.useLoaderData();
  if (result.status === "unavailable") {
    return <div className="min-h-screen bg-background"><SiteHeader /><main className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="text-3xl">Artigo temporariamente indisponível</h1><p className="mt-4 text-muted-foreground">Não foi possível consultar o conteúdo agora. Tente novamente em alguns instantes.</p><Link to="/blog" className="mt-8 inline-flex rounded-md bg-accent px-6 py-3 text-sm font-medium text-accent-foreground">Voltar ao blog</Link></main><SiteFooter /></div>;
  }
  const post = result.post;
  const cover = post.image ?? getFallbackImage({ contentType: "article" });
  const date = new Date(post.publishedAt);
  const published = Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(date);
  const schema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, datePublished: post.publishedAt, dateModified: post.modifiedAt, image: post.image ?? undefined, author: post.authorName ? { "@type": "Person", name: post.authorName } : undefined, mainEntityOfPage: post.canonicalUrl, publisher: { "@type": "Organization", name: "Casa na Floresta", url: siteConfig.publicSiteUrl } };
  return <div className="min-h-screen bg-background"><SiteHeader /><main><article><header className="mx-auto max-w-3xl px-4 pb-8 pt-12"><nav className="text-sm text-muted-foreground" aria-label="Trilha de navegação"><Link to="/">Início</Link><span className="mx-2">/</span><Link to="/blog">Blog</Link></nav><h1 className="mt-6 text-4xl leading-tight sm:text-5xl">{post.title}</h1><div className="mt-5 flex flex-wrap gap-5 text-sm text-muted-foreground">{published && <span className="flex items-center gap-2"><CalendarDays className="size-4" />{published}</span>}{post.authorName && <span className="flex items-center gap-2"><UserRound className="size-4" />{post.authorName}</span>}</div></header><div className="mx-auto max-w-5xl px-4"><img src={cover} alt={post.imageAlt || post.title} width={1400} height={800} loading="eager" fetchPriority="high" className="aspect-[7/4] w-full rounded-lg object-cover" /></div><div className="wp-content mx-auto max-w-3xl px-4 py-12 text-foreground/90" dangerouslySetInnerHTML={{ __html: post.contentHtml }} /></article><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /></main><SiteFooter /></div>;
}