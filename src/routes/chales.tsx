import { createFileRoute } from "@tanstack/react-router";
import { ListingView } from "@/components/ListingView";
import { fetchProperties } from "@/lib/properties.functions";

export const Route = createFileRoute("/chales")({
  loader: () =>
    fetchProperties({
      data: { typeSlugs: ["chale", "lodges", "camping", "conteiner"], perPage: 24 },
    }),
  head: () => ({
    meta: [
      { title: "Chalés e cabanas na natureza | Casa na Floresta" },
      {
        name: "description",
        content:
          "Chalés e cabanas em meio à mata e à serra: madeira, lareira, vista e silêncio para descansar ou receber hóspedes.",
      },
      { property: "og:title", content: "Chalés e cabanas na natureza" },
      {
        property: "og:description",
        content: "Refúgios de madeira na serra e na floresta, para descanso e hospedagem.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChalesPage,
});

function ChalesPage() {
  const { items, total, unavailable } = Route.useLoaderData();

  return (
    <ListingView
      title="Chalés e cabanas"
      intro="Madeira, mata e silêncio. Chalés e cabanas para quem busca um refúgio pequeno, aconchegante e cercado de natureza."
      typeSlug="chale"
      items={items}
      total={total}
      unavailable={unavailable}
    />
  );
}
