import { createFileRoute } from "@tanstack/react-router";
import { ListingView } from "@/components/ListingView";
import { fetchProperties } from "@/lib/properties.functions";

export const Route = createFileRoute("/pesqueiros")({
  loader: () => fetchProperties({ data: { typeSlugs: ["pesqueiro"], perPage: 24 } }),
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
  const { items, total } = Route.useLoaderData();

  return (
    <ListingView
      title="Pesqueiros"
      intro="Propriedades com lago, represa ou rio: pesca esportiva, área de lazer à beira d'água e potencial de renda."
      typeSlug="pesqueiro"
      items={items}
      total={total}
    />
  );
}
