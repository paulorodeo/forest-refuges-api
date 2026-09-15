import { createFileRoute, notFound } from "@tanstack/react-router";
import { ListingView } from "@/components/ListingView";
import { fetchProperties, fetchTerms } from "@/lib/properties.functions";

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
  component: PropertyTypePage,
});

function PropertyTypePage() {
  const { items, total, page, totalPages, unavailable, term } = Route.useLoaderData();
  return (
    <ListingView
      title={term.name}
      intro={`Imóveis do tipo ${term.name.toLowerCase()} publicados no portal Casa na Floresta.`}
      typeSlug={term.slug}
      items={items}
      total={total}
      page={page}
      totalPages={totalPages}
      paginationPath={`/tipo-de-propriedade/${term.slug}`}
      unavailable={unavailable}
    />
  );
}
