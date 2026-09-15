import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PropertyCard } from "@/components/PropertyCard";
import { fetchProperties } from "@/lib/properties.functions";
import { Pagination } from "@/components/Pagination";

type BuscaSearch = { q?: string; finalidade?: string; page?: number };

const FINALIDADES = [
  { slug: "", label: "Todas" },
  { slug: "compra-e-venda", label: "Comprar" },
  { slug: "temporada", label: "Temporada" },
];

export const Route = createFileRoute("/busca")({
  validateSearch: (search: Record<string, unknown>): BuscaSearch => {
    const out: BuscaSearch = {};
    if (typeof search["q"] === "string" && search["q"]) out.q = search["q"].slice(0, 120);
    if (typeof search["finalidade"] === "string" && search["finalidade"]) {
      out.finalidade = search["finalidade"].slice(0, 40);
    }
    if (typeof search["page"] === "number" && Number.isFinite(search["page"])) out.page = Math.max(1, Math.trunc(search["page"]));
    return out;
  },
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    fetchProperties({
      data: {
        perPage: 24,
        page: deps.page,
        ...(deps.q ? { search: deps.q } : {}),
        ...(deps.finalidade ? { statusSlugs: [deps.finalidade] } : {}),
      },
    }),
  head: () => ({
    meta: [
      { title: "Buscar imóveis no campo | Casa na Floresta" },
      {
        name: "description",
        content:
          "Busque chácaras, sítios, chalés e casas de temporada por cidade, região ou palavra-chave no portal Casa na Floresta.",
      },
      { property: "og:title", content: "Buscar imóveis no campo" },
      {
        property: "og:description",
        content: "Encontre seu refúgio por cidade, região ou tipo de propriedade.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  component: BuscaPage,
});

function BuscaPage() {
  const { items, total, page, totalPages, unavailable } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/busca" });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl">Encontre seu lugar no campo</h1>

        <form
          className="mt-6 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            const value = new FormData(event.currentTarget).get("q");
            navigate({
              search: {
                ...(typeof value === "string" && value ? { q: value } : {}),
                ...(search.finalidade ? { finalidade: search.finalidade } : {}),
                page: 1,
              },
            });
          }}
        >
          <label className="sr-only" htmlFor="q">
            Onde você procura?
          </label>
          <input
            id="q"
            name="q"
            defaultValue={search.q ?? ""}
            placeholder="Onde você procura? Cidade, região ou tipo"
            className="w-full rounded-md border border-input bg-card px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            <Search className="size-4" aria-hidden="true" />
            Buscar
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {FINALIDADES.map((f) => {
            const active = (search.finalidade ?? "") === f.slug;
            return (
              <Link
                key={f.label}
                to="/busca"
                search={{
                  ...(search.q ? { q: search.q } : {}),
                  ...(f.slug ? { finalidade: f.slug } : {}),
                  page: 1,
                }}
                className={
                  active
                    ? "rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground"
                    : "rounded-full border border-border bg-card px-4 py-1.5 text-sm text-foreground/80 hover:border-primary"
                }
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        {!unavailable && (
          <p className="mt-6 text-sm text-muted-foreground">
            {total} {total === 1 ? "imóvel encontrado" : "imóveis encontrados"}
          </p>
        )}
        {!unavailable && <Pagination page={page} totalPages={totalPages} pathname="/busca" search={{ q: search.q, finalidade: search.finalidade }} />}

        {unavailable ? (
          <p className="mt-6 rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            Os imóveis estão demorando para carregar. Tente novamente em alguns instantes.
          </p>
        ) : items.length === 0 ? (
          <p className="mt-6 rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            Nada encontrado para essa busca. Tente uma cidade, uma região ou um tipo de imóvel.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((property, i) => (
              <PropertyCard key={property.id} property={property} priority={i < 3} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
