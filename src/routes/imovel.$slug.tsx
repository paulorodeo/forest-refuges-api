import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BedDouble, Bath, MapPin, Ruler } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { fetchProperty } from "@/lib/properties.functions";
import { fetchPropertyWithRelated } from "@/lib/properties.functions";
import { getFallbackImage } from "@/lib/fallback-images";
import { formatLocation, formatPrice, formatSize } from "@/lib/format";
import { BlogPostCard } from "@/components/BlogPostCard";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyGallery } from "@/components/PropertyGallery";
import { ElfsightWidget } from "@/components/ElfsightWidget";

export const Route = createFileRoute("/imovel/$slug")({
  loader: async ({ params }) => {
    const result = await fetchPropertyWithRelated({ data: { slug: params.slug } });
    if (result.status === "not-found") throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    if (!loaderData || loaderData.status !== "ok") {
      return {
        meta: [{ title: "Imóvel não encontrado" }, { name: "robots", content: "noindex" }],
      };
    }
    const property = loaderData.property;
    const title = property.seoTitle ?? `${property.title} | Casa na Floresta`;
    const description =
      property.seoDescription ??
      property.excerpt ??
      `${property.typeName ?? "Imóvel"} em ${formatLocation(property.city, property.state)}.`;
    const image = property.image ?? property.gallery[0]?.src;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: property.originalUrl }],
    };
  },
  notFoundComponent: PropertyNotFound,
  component: PropertyDetailPage,
});

function PropertyNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl">Imóvel não encontrado</h1>
        <p className="mt-4 text-muted-foreground">
          Este anúncio pode ter sido vendido ou retirado do portal.
        </p>
        <Link
          to="/busca"
          className="mt-8 inline-flex rounded-md bg-accent px-6 py-3 text-sm font-medium text-accent-foreground"
        >
          Ver imóveis disponíveis
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

function PropertyDetailPage() {
  const result = Route.useLoaderData();
  if (result.status === "unavailable") {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="text-3xl">Imóvel temporariamente indisponível</h1>
          <p className="mt-4 text-muted-foreground">
            Não foi possível consultar este anúncio agora. Tente novamente em alguns instantes.
          </p>
          <Link to="/busca" className="mt-8 inline-flex rounded-md bg-accent px-6 py-3 text-sm font-medium text-accent-foreground">
            Ver outros imóveis
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }
  const property = result.property;
  const related = result.related;
  const cover =
    property.image ??
    property.gallery[0]?.src ??
    getFallbackImage({
      contentType: "property",
      propertyTypeSlug: property.typeSlug,
      statusSlug: property.statusSlug,
    });
  const size = formatSize(property.size);
  const gallery = [
    { src: cover, alt: property.imageAlt || property.title },
    ...property.gallery.filter((image) => image.src !== cover),
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <nav className="text-sm text-muted-foreground" aria-label="Trilha de navegação">
          <Link to="/" className="hover:text-primary">
            Início
          </Link>
          <span className="mx-2">/</span>
          <Link to="/tipos-de-imoveis-rurais" className="hover:text-primary">
            {property.typeName ?? "Imóveis"}
          </Link>
        </nav>

        <header className="mt-4">
          <h1 className="text-3xl leading-tight sm:text-4xl">{property.title}</h1>
          <p className="mt-3 flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-4" aria-hidden="true" />
            {formatLocation(property.city, property.state)}
            {property.area ? ` · ${property.area}` : ""}
          </p>
        </header>

        <PropertyGallery images={gallery} />

        <div className="mt-8">
          <aside className="mb-10 rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Valor</p>
            <p className="mt-1 text-2xl font-medium text-primary">
              {property.sourceType === "partner" || property.isSeasonal ? "Sob Consulta" : formatPrice(property.price, property.pricePostfix)}
            </p>
            {property.address && (
              <p className="mt-4 text-sm text-muted-foreground">{property.address}</p>
            )}
            {property.refId && (
              <p className="mt-4 text-xs text-muted-foreground">Referência {property.refId}</p>
            )}
          </aside>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div>
            <div className="flex flex-wrap gap-3">
              {property.typeName && (
                <span className="rounded-full bg-secondary px-3 py-1.5 text-sm">
                  {property.typeName}
                </span>
              )}
              {property.statusName && (
                <span className="rounded-full bg-accent px-3 py-1.5 text-sm text-accent-foreground">
                  {property.statusName}
                </span>
              )}
              {size && (
                <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm">
                  <Ruler className="size-4" aria-hidden="true" />
                  {size}
                </span>
              )}
              {property.bedrooms ? (
                <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm">
                  <BedDouble className="size-4" aria-hidden="true" />
                  {property.bedrooms} quartos
                </span>
              ) : null}
              {property.bathrooms ? (
                <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm">
                  <Bath className="size-4" aria-hidden="true" />
                  {property.bathrooms} banheiros
                </span>
              ) : null}
            </div>

            <h2 className="mt-10 text-2xl">Sobre este refúgio</h2>
            <div
              className="wp-content mt-3 text-[15px] text-foreground/85"
              dangerouslySetInnerHTML={{ __html: property.contentHtml }}
            />

            {property.features.length > 0 && (
              <>
                <h2 className="mt-10 text-2xl">Comodidades</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {property.features.map((f) => (
                    <li
                      key={f}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-sm"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </>
            )}
            </div>
            <aside className="h-fit rounded-xl border border-border bg-card p-6 lg:sticky lg:top-24" aria-label="Atendimento sobre este imóvel">
              <h2 className="text-xl">Atendimento</h2>
              <ElfsightWidget id={10} fallbackWhatsApp />
              <p className="mt-3 text-xs text-muted-foreground">
                A equipe Casa na Floresta fará o atendimento inicial e orientará os próximos passos.
              </p>
            </aside>
          </div>
        </div>
        {related.properties.length > 0 && (
          <section className="mt-14" aria-labelledby="similar-properties">
            <h2 id="similar-properties" className="text-2xl">Imóveis semelhantes</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.properties.map(({ item }) => <PropertyCard key={item.id} property={item} />)}
            </div>
          </section>
        )}
        {related.articles.length > 0 && (
          <section className="mt-14" aria-labelledby="helpful-content">
            <h2 id="helpful-content" className="text-2xl">Conteúdos que podem ajudar</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.articles.map(({ item }) => <BlogPostCard key={item.id} post={item} />)}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
