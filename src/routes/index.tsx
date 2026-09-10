import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, Trees, Waves, KeyRound } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PropertyCard } from "@/components/PropertyCard";
import { fetchProperties } from "@/lib/properties.functions";
import { getFallbackImage } from "@/lib/fallback-images";

const DESTAQUES = [
  {
    to: "/chacaras" as const,
    label: "Chácaras",
    text: "Perto da cidade, com área verde e lazer.",
    slug: "chacara",
  },
  {
    to: "/sitios" as const,
    label: "Sítios",
    text: "Mais terra, mata e liberdade para viver.",
    slug: "sitio",
  },
  {
    to: "/chales" as const,
    label: "Chalés e cabanas",
    text: "Madeira, serra e silêncio.",
    slug: "chale",
  },
  {
    to: "/temporada" as const,
    label: "Temporada",
    text: "O campo por alguns dias, sem compromisso.",
    slug: "veraneio",
  },
  {
    to: "/pesqueiros" as const,
    label: "Pesqueiros",
    text: "Lagos, represas e pesca esportiva.",
    slug: "pesqueiro",
  },
  {
    to: "/tipos-de-imoveis-rurais" as const,
    label: "Outros refúgios",
    text: "Fazendas de lazer, haras, ranchos e áreas.",
    slug: "fazenda",
  },
];

export const Route = createFileRoute("/")({
  loader: () => fetchProperties({ data: { perPage: 6 } }),
  head: () => ({
    meta: [
      { title: "Casa na Floresta | Chácaras, sítios e chalés para viver e descansar" },
      {
        name: "description",
        content:
          "Portal de refúgios no campo: chácaras, sítios, chalés e casas de temporada com natureza, lazer e espaço para respirar.",
      },
      {
        property: "og:title",
        content: "Casa na Floresta | Refúgios no campo",
      },
      {
        property: "og:description",
        content: "Chácaras, sítios, chalés e casas de temporada com natureza e lazer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { items } = Route.useLoaderData();
  const navigate = useNavigate();
  const hero = getFallbackImage({ contentType: "type", propertyTypeSlug: "chacara" });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative isolate overflow-hidden">
        <img
          src={hero}
          alt=""
          width={1920}
          height={1080}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-forest/70" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-forest-foreground sm:py-32">
          <p className="text-xs uppercase tracking-[0.22em] text-forest-foreground/70">
            Refúgios, natureza e descanso
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-[1.1] sm:text-5xl">
            Sua casa na floresta começa aqui
          </h1>
          <p className="mt-5 max-w-xl text-base text-forest-foreground/85">
            Chácaras, sítios, chalés e casas de temporada selecionados para quem quer viver, receber
            e descansar cercado de verde.
          </p>

          <form
            className="mt-9 flex max-w-2xl flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              const value = new FormData(event.currentTarget).get("q");
              navigate({
                to: "/busca",
                search: typeof value === "string" && value ? { q: value } : {},
              });
            }}
          >
            <label className="sr-only" htmlFor="home-q">
              Onde você procura?
            </label>
            <input
              id="home-q"
              name="q"
              placeholder="Cidade, região ou tipo de imóvel"
              className="w-full rounded-md border border-white/20 bg-white/95 px-4 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-7 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              <Search className="size-4" aria-hidden="true" />
              Buscar
            </button>
          </form>
        </div>
      </section>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl sm:text-3xl">Escolha seu tipo de refúgio</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {DESTAQUES.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="aspect-[3/2] overflow-hidden bg-secondary">
                  <img
                    src={getFallbackImage({ contentType: "type", propertyTypeSlug: item.slug })}
                    alt={item.label}
                    width={1200}
                    height={800}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg">{item.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-sand py-16">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3">
            <div>
              <Trees className="size-6 text-primary" aria-hidden="true" />
              <h2 className="mt-3 text-lg">Natureza em primeiro lugar</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Propriedades escolhidas pelo verde, pela água e pelo silêncio — não pelo tamanho da
                lavoura.
              </p>
            </div>
            <div>
              <Waves className="size-6 text-primary" aria-hidden="true" />
              <h2 className="mt-3 text-lg">Lazer e descanso</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Piscina, lago, varanda e trilha: espaço para receber a família e recarregar.
              </p>
            </div>
            <div>
              <KeyRound className="size-6 text-primary" aria-hidden="true" />
              <h2 className="mt-3 text-lg">Comprar ou passar o fim de semana</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Imóveis à venda e opções de temporada, para quem quer morar ou apenas viver o campo
                por alguns dias.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl">Últimos imóveis publicados</h2>
            <Link to="/busca" className="text-sm font-medium text-primary hover:underline">
              Ver todos os imóveis
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((property, i) => (
              <PropertyCard key={property.id} property={property} priority={i < 3} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
