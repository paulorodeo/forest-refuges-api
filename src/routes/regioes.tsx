import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PropertySearch } from "@/components/PropertySearch";
import { SeoBreadcrumbs } from "@/components/SeoBreadcrumbs";
import { REGIONS } from "@/lib/region-data";

export const Route = createFileRoute("/regioes")({ head: () => ({ links: [{ rel: "canonical", href: "https://www.casanafloresta.com.br/regioes" }], meta: [{ title: "Regiões de imóveis rurais | Casa na Floresta" }] }), component: RegionsPage });
function RegionsPage() {
  const regions = ["sao-paulo", "sorocaba", "campinas", "vale-do-ribeira", "ribeirao-preto", "barretos", "bauru"].map((slug) => REGIONS[slug]).filter((region): region is (typeof REGIONS)[string] => Boolean(region));
  return <div className="min-h-screen bg-background"><SiteHeader /><SeoBreadcrumbs items={[{ name: "Início", href: "/" }, { name: "Regiões" }]} /><main className="mx-auto max-w-6xl px-4 py-12"><h1 className="text-4xl">Regiões</h1><p className="mt-4 max-w-3xl text-muted-foreground">A pesquisa regional reúne imóveis, cidades, conteúdos e serviços relacionados para ajudar você a comparar possibilidades e encontrar o lugar certo.</p><div className="mt-8 max-w-2xl"><PropertySearch /></div><div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{regions.map((region) => <Link key={region.slug} to="/regiao/$slug" params={{ slug: region.slug }} search={{ page: 1 }} className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"><h2 className="text-xl">{region.name}</h2><p className="mt-2 text-sm text-muted-foreground">Imóveis e localidades para pesquisar nesta região.</p></Link>)}</div></main><SiteFooter /></div>;
}
