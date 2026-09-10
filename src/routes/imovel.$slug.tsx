import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BedDouble, Bath, MapPin, Ruler } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { fetchProperty } from "@/lib/properties.functions";
import { getFallbackImage } from "@/lib/fallback-images";
import { formatLocation, formatPrice, formatSize } from "@/lib/format";

export const Route = createFileRoute("/imovel/$slug")({
  loader: async ({ params }) => {
    const property = await fetchProperty({ data: { slug: params.slug } });
    if (!property) throw notFound();
    return property;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Imóvel não encontrado" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = loaderData.seoTitle ?? `${loaderData.title} | Casa na Floresta`;
    const description =
      loaderData.seoDescription ??
      loaderData.excerpt ??
      `${loaderData.typeName ?? "Imóvel"} em ${formatLocation(loaderData.city, loaderData.state)}.`;
    const image = loaderData.image ?? loaderData.gallery[0]?.src;
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
      links: [{ rel: "canonical", href: loaderData.originalUrl }],
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
  const property = Route.useLoaderData();
  const cover =
    property.image ??
    property.gallery[0]?.src ??
    getFallbackImage({
      contentType: "property",
      propertyTypeSlug: property.typeSlug,
      statusSlug: property.statusSlug,
    });
  const size = formatSize(property.size);
  const rest = property.gallery.filter((g) => g.src !== cover).slice(0, 8);

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

        <div className="mt-6 overflow-hidden rounded-xl bg-secondary">
          <img
            src={cover}
            alt={property.imageAlt || property.title}
            width={1600}
            height={900}
            className="aspect-[16/9] w-full object-cover"
          />
        </div>

        {rest.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {rest.map((image) => (
              <img
                key={image.src}
                src={image.src}
                alt={image.alt}
                width={600}
                height={450}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
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

          <aside className="h-fit rounded-xl border border-border bg-card p-6 lg:sticky lg:top-24">
            <p className="text-sm text-muted-foreground">Valor</p>
            <p className="mt-1 text-2xl font-medium text-primary">
              {formatPrice(property.price, property.pricePostfix)}
            </p>
            {property.address && (
              <p className="mt-4 text-sm text-muted-foreground">{property.address}</p>
            )}
            {property.refId && (
              <p className="mt-4 text-xs text-muted-foreground">Referência {property.refId}</p>
            )}
            <a
              href={property.originalUrl}
              className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
              rel="noopener"
            >
              Falar com o anunciante
            </a>
            <p className="mt-3 text-xs text-muted-foreground">
              Confirme área, valores e documentação diretamente com o anunciante.
            </p>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
