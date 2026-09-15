import { createFileRoute } from "@tanstack/react-router";
import { ListingView } from "@/components/ListingView";
import { fetchProperties } from "@/lib/properties.functions";

export const Route = createFileRoute("/refugios-urbanos")({
  validateSearch: (search: Record<string, unknown>) => ({
    page: typeof search["page"] === "number" ? Math.max(1, Math.trunc(search["page"] as number)) : 1,
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => fetchProperties({ data: { typeSlugs: ["refugio-urbano"], page: deps.page, perPage: 24 } }),
  component: RefugiosUrbanosPage,
});

function RefugiosUrbanosPage() {
  const { items, total, page, totalPages, unavailable } = Route.useLoaderData();
  return (
    <ListingView
      title="Refúgios Urbanos"
      intro="Casas e propriedades com natureza por perto, para viver com tranquilidade sem abrir mão da cidade."
      typeSlug="refugio-urbano"
      items={items}
      total={total}
      page={page}
      totalPages={totalPages}
      paginationPath="/refugios-urbanos"
      unavailable={unavailable}
    />
  );
}
