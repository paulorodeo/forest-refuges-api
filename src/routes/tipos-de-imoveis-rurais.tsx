import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PropertyCard } from "@/components/PropertyCard";
import { fetchProperties, fetchTerms } from "@/lib/properties.functions";
import { getFallbackImage, heroImage } from "@/lib/fallback-images";

const STRONG_PAGES: Record<string, string> = {
  chacara: "/chacaras",
  "condominio-fechado": "/chacaras",
  sitio: "/sitios",
  chale: "/chales",
  pesqueiro: "/pesqueiros",
};

const OTHER_TYPES = [
  "fazenda",
  "haras",
  "rancho",
  "terreno",
  "lote",
  "loteamento",
  "area",
  "veraneio",
  "refugio-urbano",
  "galpao",
  "comercial",
  "camping",
  "conteiner",
  "lodges",
  "host",
];

export const Route = createFileRoute("/tipos-de-imoveis-rurais")({
  loader: async () => {
    const [terms, others] = await Promise.all([
      fetchTerms({ data: { taxonomy: "property_type" } }),
      fetchProperties({ data: { typeSlugs: OTHER_TYPES, perPage: 12 } }),
    ]);
    return {
      terms,
      others: others.items,
      othersTotal: others.total,
      unavailable: others.unavailable,
    };
  },
  head: () => ({
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
  const { terms, others, othersTotal, unavailable } = Route.useLoaderData();
  const strong = terms.filter((t) => STRONG_PAGES[t.slug]);
  const rest = terms.filter((t) => !STRONG_PAGES[t.slug]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

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
        <h2 className="text-2xl">Categorias principais</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {strong.map((term) => (
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
        </div>

        <h2 className="mt-16 text-2xl">Outros refúgios e tipos</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Fazendas de lazer, haras, ranchos, terrenos, áreas e refúgios urbanos ainda têm poucos
          imóveis publicados. Eles ficam reunidos aqui até formarem uma seleção própria.
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {rest.map((term) => (
            <li
              key={term.id}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground/80"
            >
              {term.name}
              <span className="ml-1.5 text-muted-foreground">{term.count}</span>
            </li>
          ))}
        </ul>

        {unavailable ? (
          <p className="mt-10 rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            Os imóveis estão demorando para carregar. Tente novamente em alguns instantes.
          </p>
        ) : others.length > 0 && (
          <>
            <h3 className="mt-10 text-lg">
              {othersTotal} {othersTotal === 1 ? "imóvel" : "imóveis"} nesses tipos
            </h3>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
