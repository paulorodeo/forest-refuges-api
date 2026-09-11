import { createFileRoute } from "@tanstack/react-router";
import { ListingView } from "@/components/ListingView";
import { fetchProperties } from "@/lib/properties.functions";

export const Route = createFileRoute("/sitios")({
  loader: () => fetchProperties({ data: { typeSlugs: ["sitio"], perPage: 24 } }),
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
  const { items, total, unavailable } = Route.useLoaderData();

  return (
    <ListingView
      title="Sítios"
      intro="Mais área e mais liberdade: sítios com casa, gramado, mata e água para quem quer viver no campo ou ter um refúgio de fim de semana."
      typeSlug="sitio"
      items={items}
      total={total}
      unavailable={unavailable}
    />
  );
}
