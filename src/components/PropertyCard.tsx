import { Link } from "@tanstack/react-router";
import { MapPin, Ruler } from "lucide-react";
import type { PropertyCardData } from "@/lib/properties.functions";
import { getFallbackImage } from "@/lib/fallback-images";
import { formatLocation, formatPrice, formatSize } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import { whatsappUrl } from "@/lib/whatsapp";

export function PropertyCard({
  property,
  priority = false,
}: {
  property: PropertyCardData;
  priority?: boolean;
}) {
  const image =
    property.image ??
    getFallbackImage({
      contentType: "property",
      propertyTypeSlug: property.typeSlug,
      statusSlug: property.statusSlug,
    });
  const size = formatSize(property.size);
  const publicUrl = `${siteConfig.publicSiteUrl}/imovel/${encodeURIComponent(property.slug)}`;

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link to="/imovel/$slug" params={{ slug: property.slug }} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <img
            src={image}
            alt={property.imageAlt || property.title}
            width={1200}
            height={900}
            loading="lazy"
            fetchPriority={priority ? "auto" : "low"}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {property.typeName && (
            <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground">
              {property.typeName}
            </span>
          )}
          {property.statusName && (
            <span className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              {property.statusName}
            </span>
          )}
        </div>

        <div className="space-y-2 p-4">
          <h3 className="line-clamp-2 text-base leading-snug">{property.title}</h3>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {formatLocation(property.city, property.state)}
          </p>
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="font-medium text-primary">
              {property.sourceType === "partner" || property.isSeasonal ? "Sob Consulta" : formatPrice(property.price, property.pricePostfix)}
            </span>
            {size && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Ruler className="size-4" aria-hidden="true" />
                {size}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="border-t border-border px-4 py-3">
        <a
          href={whatsappUrl(property.title, publicUrl)}
          target="_blank"
          rel="nofollow noopener noreferrer"
          aria-label={`Falar sobre ${property.title} pelo WhatsApp`}
          className="inline-flex min-h-11 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          WhatsApp
        </a>
      </div>
    </article>
  );
}
