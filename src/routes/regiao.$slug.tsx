import { createFileRoute, notFound } from "@tanstack/react-router";
import { RegionalHub } from "@/components/RegionalHub";
import { fetchBlogPosts } from "@/lib/blog.functions";
import { REGIONS } from "@/lib/region-data";
import { fetchProperties } from "@/lib/properties.functions";

export const Route = createFileRoute("/regiao/$slug")({
  validateSearch: (search: Record<string, unknown>) => ({ page: typeof search["page"] === "number" ? Math.max(1, Math.trunc(search["page"] as number)) : 1 }),
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps }) => {
    const region = REGIONS[params.slug];
    if (!region) throw notFound();
    const [properties, posts] = await Promise.all([
      fetchProperties({ data: { citySlugs: region.citySlugs, page: deps.page, perPage: 24 } }),
      fetchBlogPosts({ data: { perPage: 3 } }),
    ]);
    return { region, properties, posts };
  },
  head: ({ loaderData }) => ({ links: loaderData ? [{ rel: "canonical", href: `https://www.casanafloresta.com.br/regiao/${loaderData.region.slug}` }] : [] }),
  component: RegionPage,
});

function RegionPage() {
  const { region, properties, posts } = Route.useLoaderData();
  return <RegionalHub region={region} properties={properties} posts={posts} />;
}
