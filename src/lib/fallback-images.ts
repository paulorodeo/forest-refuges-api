import chacara from "@/assets/fallback-chacara.jpg";
import sitio from "@/assets/fallback-sitio.jpg";
import chale from "@/assets/fallback-chale.jpg";
import temporada from "@/assets/fallback-temporada.jpg";
import pesqueiro from "@/assets/fallback-pesqueiro.jpg";
import haras from "@/assets/fallback-haras.jpg";
import fazenda from "@/assets/fallback-fazenda.jpg";
import refugioUrbano from "@/assets/fallback-refugio-urbano.jpg";
import terreno from "@/assets/fallback-terreno.jpg";
import generico from "@/assets/fallback-generico.jpg";

export type ContentType =
  | "property"
  | "type"
  | "article"
  | "destination"
  | "agent"
  | "testimonial";

/**
 * Fallback por tipo de conteúdo — nunca uma única imagem genérica.
 * Ordem de resolução (ver resolveImage): imagem destacada > galeria >
 * tipo de imóvel > destino > fallback global.
 */
const BY_TYPE_SLUG: Record<string, string> = {
  chacara: chacara,
  "condominio-fechado": chacara,
  "refugio-urbano": refugioUrbano,
  sitio: sitio,
  chale: chale,
  lodges: chale,
  camping: chale,
  conteiner: chale,
  host: temporada,
  veraneio: temporada,
  pesqueiro: pesqueiro,
  haras: haras,
  rancho: haras,
  fazenda: fazenda,
  terreno: terreno,
  lote: terreno,
  loteamento: terreno,
  area: terreno,
  galpao: terreno,
  comercial: terreno,
};

const BY_STATUS_SLUG: Record<string, string> = {
  temporada: temporada,
  airbnb: temporada,
};

export function getFallbackImage(opts: {
  contentType?: ContentType;
  propertyTypeSlug?: string | null;
  statusSlug?: string | null;
  locationSlug?: string | null;
}): string {
  const { propertyTypeSlug, statusSlug } = opts;
  if (propertyTypeSlug && BY_TYPE_SLUG[propertyTypeSlug]) {
    return BY_TYPE_SLUG[propertyTypeSlug];
  }
  if (statusSlug && BY_STATUS_SLUG[statusSlug]) {
    return BY_STATUS_SLUG[statusSlug];
  }
  return generico;
}

export const heroImage = generico;
