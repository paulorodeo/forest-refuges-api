import { createFileRoute } from "@tanstack/react-router";
import { ListingView } from "@/components/ListingView";
import { fetchProperties } from "@/lib/properties.functions";

export const Route = createFileRoute("/sitios")({
  validateSearch: (search: Record<string, unknown>) => ({ page: typeof search["page"] === "number" ? Math.max(1, Math.trunc(search["page"] as number)) : 1 }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => fetchProperties({ data: { typeSlugs: ["sitio"], page: deps.page, perPage: 24 } }),
  head: () => ({
    meta: [
      { title: "Sítios à venda | Casa na Floresta" },
      {
        name: "description",
        content:
          "Sítios com natureza, gramado, casa rural, mata e água: espaço para viver, receber a família e cultivar seu próprio ritmo.",
      },
      { property: "og:title", content: "Sítios à venda" },
      {
        property: "og:description",
        content: "Espaço para viver e produzir, com natureza por todos os lados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SitiosPage,
});

function SitiosPage() {
  const { items, total, page, totalPages, unavailable } = Route.useLoaderData();

  return (
    <ListingView
      title="Sítios"
      intro="Mais área e mais liberdade: sítios com casa, gramado, mata e água para quem quer viver no campo ou ter um refúgio de fim de semana."
      typeSlug="sitio"
      items={items}
      total={total}
      unavailable={unavailable}
      page={page}
      totalPages={totalPages}
      paginationPath="/sitios"
    />
  );
}
