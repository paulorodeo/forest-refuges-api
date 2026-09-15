import { createFileRoute } from "@tanstack/react-router";
import { ListingView } from "@/components/ListingView";
import { fetchProperties } from "@/lib/properties.functions";

export const Route = createFileRoute("/chacaras")({
  validateSearch: (search: Record<string, unknown>) => ({ page: typeof search["page"] === "number" ? Math.max(1, Math.trunc(search["page"] as number)) : 1 }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    fetchProperties({
      data: { typeSlugs: ["chacara", "condominio-fechado"], page: deps.page, perPage: 24 },
    }),
  head: () => ({
    meta: [
      { title: "Chácaras à venda e para temporada | Casa na Floresta" },
      {
        name: "description",
        content:
          "Chácaras selecionadas para lazer, moradia e investimento: área verde, casa de campo, piscina e acesso fácil a partir da cidade.",
      },
      { property: "og:title", content: "Chácaras à venda e para temporada" },
      {
        property: "og:description",
        content: "Refúgios próximos à cidade, com espaço para descansar, receber e viver.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChacarasPage,
});

function ChacarasPage() {
  const { items, total, page, totalPages, unavailable } = Route.useLoaderData();

  return (
    <ListingView
      title="Chácaras"
      intro="O refúgio mais procurado do portal: perto da cidade, com área verde, casa de campo e espaço para lazer, moradia ou investimento."
      typeSlug="chacara"
      items={items}
      total={total}
      unavailable={unavailable}
      page={page}
      totalPages={totalPages}
      paginationPath="/chacaras"
    />
  );
}
