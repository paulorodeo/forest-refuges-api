import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { fetchTerms } from "@/lib/properties.functions";
import { getFallbackImage, heroImage } from "@/lib/fallback-images";
import { SeoBreadcrumbs } from "@/components/SeoBreadcrumbs";
import { PropertySearch } from "@/components/PropertySearch";

const STRONG_PAGES: Record<string, string> = {
  chacara: "/chacaras",
  "condominio-fechado": "/chacaras",
  sitio: "/sitios",
  chale: "/chales",
  "refugio-urbano": "/refugios-urbanos",
  pesqueiro: "/pesqueiros",
};
const PRIMARY_TYPE_ORDER = ["chacara", "sitio", "chale", "refugio-urbano", "pesqueiro"];

export const Route = createFileRoute("/tipos-de-imoveis-rurais")({
  loader: async () => {
    const terms = await fetchTerms({ data: { taxonomy: "property_type" } });
    return {
      terms,
    };
  },
  head: () => ({
    links: [{ rel: "canonical", href: "https://www.casanafloresta.com.br/tipos-de-imoveis-rurais" }],
    meta: [
      { title: "Tipos de imóveis rurais: chácara, sítio, fazenda e mais | Casa na Floresta" },
      {
        name: "description",
        content:
          "Entenda os tipos de imóveis rurais do portal — chácara, sítio, chalé, pesqueiro, fazenda, haras, rancho, terreno e área — e veja o que está publicado em cada um.",
      },
      { property: "og:title", content: "Tipos de imóveis rurais" },
      {
        property: "og:description",
        content: "Chácara, sítio, chalé, pesqueiro, fazenda, haras, rancho, terreno e área.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TiposPage,
});

function TiposPage() {
  const { terms } = Route.useLoaderData();
  const strong = PRIMARY_TYPE_ORDER.flatMap((slug) => terms.filter((term) => term.slug === slug));
  const rest = terms.filter((term) => !PRIMARY_TYPE_ORDER.includes(term.slug));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <SeoBreadcrumbs items={[{ name: "Início", href: "/" }, { name: "Tipos de propriedade" }]} />

      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt=""
          width={1600}
          height={900}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-forest/75" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-forest-foreground sm:py-20">
          <h1 className="max-w-2xl text-3xl sm:text-4xl">Tipos de imóveis rurais</h1>
          <p className="mt-4 max-w-2xl text-sm text-forest-foreground/85 sm:text-base">
            Cada tipo de propriedade atende a um projeto de vida diferente. Comece pelas categorias
            com mais imóveis publicados e explore os demais refúgios abaixo.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-12 rounded-xl bg-sand p-5"><h2 className="text-xl">Encontre um imóvel</h2><p className="mt-1 mb-4 text-sm text-muted-foreground">Pesquise por cidade, região ou tipo de propriedade.</p><PropertySearch /></div>
        <h2 className="text-2xl">Categorias principais</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {strong.filter((term) => term.slug !== "pesqueiro").map((term) => (
            <Link
              key={term.id}
              to={STRONG_PAGES[term.slug] as "/chacaras"}
              search={{ page: 1 }}
              className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="aspect-[3/2] overflow-hidden bg-secondary">
                <img
                  src={getFallbackImage({ contentType: "type", propertyTypeSlug: term.slug })}
                  alt={term.name}
                  width={1200}
                  height={800}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg">{term.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {term.count} {term.count === 1 ? "imóvel" : "imóveis"} publicados
                </p>
              </div>
            </Link>
          ))}
          <Link to="/temporada" search={{ page: 1 }} className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
            <div className="aspect-[3/2] overflow-hidden bg-secondary">
              <img src={getFallbackImage({ contentType: "type", statusSlug: "temporada" })} alt="Temporada" width={1200} height={800} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="p-4"><h3 className="text-lg">Temporada</h3><p className="mt-1 text-sm text-muted-foreground">Casas e refúgios para temporada</p></div>
          </Link>
          {strong.filter((term) => term.slug === "pesqueiro").map((term) => (
            <Link key={term.id} to={STRONG_PAGES[term.slug] as "/pesqueiros"} search={{ page: 1 }} className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
              <div className="aspect-[3/2] overflow-hidden bg-secondary"><img src={getFallbackImage({ contentType: "type", propertyTypeSlug: term.slug })} alt={term.name} width={1200} height={800} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
              <div className="p-4"><h3 className="text-lg">{term.name}</h3><p className="mt-1 text-sm text-muted-foreground">{term.count} {term.count === 1 ? "imóvel" : "imóveis"} publicados</p></div>
            </Link>
          ))}
        </div>

        <h2 className="mt-16 text-2xl">Todos os tipos de propriedade</h2>
        <ul className="mt-5 flex flex-wrap gap-2">
          {rest.map((term) => (
            <li
              key={term.id}
              className="rounded-full border border-border bg-card text-sm text-foreground/80 hover:border-primary"
            >
              <Link to="/tipo-de-propriedade/$slug" params={{ slug: term.slug }} search={{ page: 1 }} className="inline-flex px-3 py-1.5">
                {term.name}<span className="ml-1.5 text-muted-foreground">{term.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <SiteFooter />
    </div>
  );
}
