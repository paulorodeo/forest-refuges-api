import { createFileRoute } from "@tanstack/react-router";
import { ListingView } from "@/components/ListingView";
import { fetchProperties } from "@/lib/properties.functions";

export const Route = createFileRoute("/pesqueiros")({
  validateSearch: (search: Record<string, unknown>) => ({ page: typeof search["page"] === "number" ? Math.max(1, Math.trunc(search["page"] as number)) : 1 }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => fetchProperties({ data: { typeSlugs: ["pesqueiro"], page: deps.page, perPage: 24 } }),
  head: () => ({
    meta: [
      { title: "Pesqueiros à venda | Casa na Floresta" },
      {
        name: "description",
        content:
          "Pesqueiros e propriedades com lago, represa e área de lazer à beira d'água, para uso próprio ou operação de pesca esportiva.",
      },
      { property: "og:title", content: "Pesqueiros à venda" },
      {
        property: "og:description",
        content: "Lagos, represas e estrutura de lazer à beira d'água.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PesqueirosPage,
});

function PesqueirosPage() {
  const { items, total, page, totalPages, unavailable } = Route.useLoaderData();

  return (
    <ListingView
      title="Pesqueiros"
      intro="Propriedades com lago, represa ou rio: pesca esportiva, área de lazer à beira d'água e potencial de renda."
      typeSlug="pesqueiro"
      items={items}
      total={total}
      unavailable={unavailable}
      page={page}
      totalPages={totalPages}
      paginationPath="/pesqueiros"
    />
  );
}
