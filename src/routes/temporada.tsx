import { createFileRoute } from "@tanstack/react-router";
import { ListingView } from "@/components/ListingView";
import { fetchProperties } from "@/lib/properties.functions";

export const Route = createFileRoute("/temporada")({
  loader: () =>
    fetchProperties({ data: { statusSlugs: ["temporada", "airbnb"], perPage: 24 } }),
  head: () => ({
    meta: [
      { title: "Casas de campo para temporada | Casa na Floresta" },
      {
        name: "description",
        content:
          "Chácaras, chalés e casas de campo para alugar por temporada: piscina, churrasqueira, natureza e descanso a poucas horas da cidade.",
      },
      { property: "og:title", content: "Casas de campo para temporada" },
      {
        property: "og:description",
        content: "Fim de semana no campo: piscina, churrasqueira e natureza.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TemporadaPage,
});

function TemporadaPage() {
  const { items, total } = Route.useLoaderData();

  return (
    <ListingView
      title="Temporada no campo"
      intro="Para quem quer o campo por alguns dias: casas, chácaras e chalés disponíveis para aluguel por temporada, com lazer e natureza."
      statusSlug="temporada"
      items={items}
      total={total}
    />
  );
}
