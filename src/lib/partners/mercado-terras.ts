import { approvedLocation } from "./geography";
import { dedupeKey, duplicateSignals } from "./dedupe";
import type { PartnerAdapter, PartnerPropertyCandidate, PartnerPropertyRaw } from "./types";

const PARTNER_ID = "mercado-de-terras" as const;
const BASE_URL = "https://www.mercadodeterras.com.br/imoveis/all/sp/all";
const strip = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export const mercadoDeTerrasAdapter: PartnerAdapter = {
  id: PARTNER_ID,
  name: "Mercado de Terras",
  async discover() {
    const response = await fetch(BASE_URL, { headers: { Accept: "text/html" }, signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error(`Mercado de Terras respondeu ${response.status}`);
    const html = await response.text();
    return [...html.matchAll(/href=["']([^"']+)["']/gi)].flatMap((match) => { const href = match[1]; return href && href.includes("/imovel") ? [href] : []; });
  },
  async fetchProperty(sourceUrl) {
    const response = await fetch(sourceUrl, { headers: { Accept: "text/html" }, signal: AbortSignal.timeout(10_000) });
    if (!response.ok) return null;
    const html = await response.text();
    const text = strip(html);
    const title = html.match(/<title[^>]*>([^<]+)/i)?.[1]?.trim();
    if (!title) return null;
    return { partnerPropertyId: sourceUrl.split("/").filter(Boolean).at(-1) ?? sourceUrl, sourceUrl, title, description: text.slice(0, 3000), city: null, state: "SP", size: null, bedrooms: null, features: [], gallery: [] };
  },
  normalize(raw) {
    const location = approvedLocation(raw.city, raw.state);
    if (!location) return null;
    const existing: PartnerPropertyCandidate[] = [];
    const signals = duplicateSignals(raw, existing);
    return { partnerPropertyId: raw.partnerPropertyId, sourceUrl: raw.sourceUrl, title: raw.title, city: raw.city, state: raw.state, size: raw.size, bedrooms: raw.bedrooms, features: raw.features, gallery: raw.gallery, sourceType: "partner", partnerId: PARTNER_ID, partnerName: "Mercado de Terras", partnerSourceUrl: raw.sourceUrl, lastSyncedAt: new Date().toISOString(), sourceStatus: "candidate", contentRewriteVersion: "p6-v1", partnerCoverMode: "remote_first", normalizedKey: dedupeKey(raw, "Mercado de Terras"), duplicateReview: signals.length > 0, duplicateSignals: signals, editorialTitle: raw.title.trim(), editorialDescription: "Imóvel rural anunciado em " + raw.city + ", com os atributos objetivos disponíveis na origem. Consulte a equipe Casa na Floresta para confirmar disponibilidade, documentação e detalhes do imóvel.", publicPrice: "Sob Consulta" };
  },
};
