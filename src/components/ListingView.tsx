import type { PropertyCardData } from "@/lib/properties.functions";
import { PropertyCard } from "@/components/PropertyCard";
import { getFallbackImage } from "@/lib/fallback-images";
import { Pagination } from "@/components/Pagination";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ElfsightWidget } from "@/components/ElfsightWidget";

export function ListingView({
  title,
  intro,
  typeSlug,
  statusSlug,
  items,
  total,
  page = 1,
  totalPages = 0,
  paginationPath,
  paginationSearch,
  unavailable = false,
  children,
  shell = true,
}: {
  title: string;
  intro: string;
  typeSlug?: string;
  statusSlug?: string;
  items: PropertyCardData[];
  total: number;
  page?: number;
  totalPages?: number;
  paginationPath?: string;
  paginationSearch?: Record<string, string | undefined>;
  unavailable?: boolean;
  children?: React.ReactNode;
  shell?: boolean;
}) {
  const cover = getFallbackImage({
    contentType: "type",
    propertyTypeSlug: typeSlug ?? null,
    statusSlug: statusSlug ?? null,
  });

  const content = (
    <>

      <section className="relative isolate overflow-hidden">
        <img
          src={cover}
          alt=""
          width={1600}
          height={900}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-forest/70" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-forest-foreground sm:py-20">
          <h1 className="max-w-2xl text-3xl sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-sm text-forest-foreground/85 sm:text-base">{intro}</p>
          {!unavailable && (
            <p className="mt-6 text-sm text-forest-foreground/75">
              {total} {total === 1 ? "imóvel publicado" : "imóveis publicados"}
            </p>
          )}
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-12">
        {children}
        {unavailable ? (
          <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            Os imóveis estão demorando para carregar. Tente novamente em alguns instantes.
          </p>
        ) : items.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            Nenhum imóvel publicado nesta seleção no momento. Veja outros refúgios disponíveis no
            portal.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((property, i) => (
              <PropertyCard key={property.id} property={property} priority={i < 3} />
            ))}
          </div>
        )}
        {paginationPath && !unavailable && (paginationSearch ? <Pagination page={page} totalPages={totalPages} pathname={paginationPath} search={paginationSearch} /> : <Pagination page={page} totalPages={totalPages} pathname={paginationPath} />)}
      </main>

    </>
  );
  return shell ? <div className="min-h-screen bg-background"><SiteHeader />{content}<ElfsightWidget id={1} /><SiteFooter /></div> : <>{content}<ElfsightWidget id={1} /></>;
}
