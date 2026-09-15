import { Link } from "@tanstack/react-router";
import { BlogPostCard } from "@/components/BlogPostCard";
import { ListingView } from "@/components/ListingView";
import { ServiceGrid } from "@/components/ServiceGrid";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SeoBreadcrumbs } from "@/components/SeoBreadcrumbs";
import type { RegionConfig } from "@/lib/region-data";
import type { PropertyListResult } from "@/lib/properties.functions";
import type { BlogListResult } from "@/lib/blog.functions";
import { whatsappUrl } from "@/lib/whatsapp";

export function RegionalHub({ region, properties, posts }: { region: RegionConfig; properties: PropertyListResult; posts: BlogListResult }) {
  const whatsapp = whatsappUrl(region.name, `https://www.casanafloresta.com.br/regiao/${region.slug}`);
  return <div className="min-h-screen bg-background"><SiteHeader /><SeoBreadcrumbs items={[{ name: "Início", href: "/" }, { name: "Regiões", href: "/regiao/sorocaba" }, { name: region.name }]} /><main>
    <header className="bg-forest py-16 text-forest-foreground"><div className="mx-auto max-w-6xl px-4"><p className="text-xs uppercase tracking-[0.18em] text-forest-foreground/70">Hub regional</p><h1 className="mt-3 text-4xl sm:text-5xl">Imóveis na {region.name}</h1><p className="mt-4 max-w-2xl text-forest-foreground/80">{region.intro}</p></div></header>
    <section className="mx-auto max-w-6xl px-4 py-12"><h2 className="text-2xl">Cidades desta região</h2><div className="mt-4 flex flex-wrap gap-2">{region.cities.map((city) => <span key={city} className="rounded-full border border-border bg-card px-3 py-1.5 text-sm">{city}</span>)}</div></section>
    <section className="mx-auto max-w-6xl px-4 pb-12"><ListingView title={`Propriedades na ${region.name}`} intro="Imóveis reais publicados no WordPress e filtrados pelas cidades desta região." items={properties.items} total={properties.total} page={properties.page} totalPages={properties.totalPages} paginationPath={`/regiao/${region.slug}`} unavailable={properties.unavailable} /></section>
    <section className="mx-auto max-w-6xl px-4 pb-12"><a href={whatsapp} className="inline-flex rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground">Falar sobre esta região pelo WhatsApp</a></section>
    <section className="mx-auto max-w-6xl px-4 pb-12"><h2 className="mb-5 text-2xl">Serviços relacionados</h2><ServiceGrid /></section>
    {posts.items.length > 0 && <section className="mx-auto max-w-6xl px-4 pb-12"><h2 className="mb-5 text-2xl">Artigos relacionados</h2><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{posts.items.map((post) => <BlogPostCard key={post.id} post={post} />)}</div></section>}
    {region.nearby.length > 0 && <section className="mx-auto max-w-6xl px-4 pb-16"><h2 className="text-2xl">Regiões próximas</h2><div className="mt-4 flex flex-wrap gap-3">{region.nearby.map((name) => { const target = Object.values({ sorocaba: "sorocaba", campinas: "campinas", "ribeirao-preto": "ribeirao-preto", barretos: "barretos", bauru: "bauru", "vale-do-ribeira": "vale-do-ribeira" }).find((slug) => slug.replaceAll("-", " ").includes(name.toLowerCase().split(" ")[0] ?? "")); return target ? <Link key={name} to="/regiao/$slug" params={{ slug: target }} search={{ page: 1 }} className="text-sm text-primary hover:underline">{name}</Link> : <span key={name} className="text-sm text-muted-foreground">{name}</span>; })}</div></section>}
  </main><SiteFooter /></div>;
}
