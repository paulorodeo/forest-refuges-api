import { createFileRoute, notFound } from "@tanstack/react-router";
import { ListingView } from "@/components/ListingView";
import { fetchProperties, fetchTerms } from "@/lib/properties.functions";
import { SeoBreadcrumbs } from "@/components/SeoBreadcrumbs";

export const Route = createFileRoute("/tipo-de-propriedade/$slug")({
  validateSearch: (search: Record<string, unknown>) => ({
    page: typeof search["page"] === "number" ? Math.max(1, Math.trunc(search["page"] as number)) : 1,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps }) => {
    const terms = await fetchTerms({ data: { taxonomy: "property_type" } });
    const term = terms.find((item) => item.slug === params.slug);
    if (!term) throw notFound();
    const result = await fetchProperties({ data: { typeSlugs: [term.slug], page: deps.page, perPage: 24 } });
    return { ...result, term };
  },
  head: ({ loaderData }) => ({ links: loaderData ? [{ rel: "canonical", href: `https://www.casanafloresta.com.br/tipo-de-propriedade/${loaderData.term.slug}` }] : [] }),
  component: PropertyTypePage,
});

function PropertyTypePage() {
  const { items, total, page, totalPages, unavailable, term } = Route.useLoaderData();
  return (
    <><SeoBreadcrumbs items={[{ name: "Início", href: "/" }, { name: "Tipos de propriedade", href: "/tipos-de-imoveis-rurais" }, { name: term.name }]} /><ListingView
      title={term.name}
      intro={`Imóveis do tipo ${term.name.toLowerCase()} publicados no portal Casa na Floresta.`}
      typeSlug={term.slug}
      items={items}
      total={total}
      page={page}
      totalPages={totalPages}
      paginationPath={`/tipo-de-propriedade/${term.slug}`}
      unavailable={unavailable}
    /></>
  );
}
