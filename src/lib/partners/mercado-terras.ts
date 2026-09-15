import { approvedLocation } from "./geography";
import { dedupeKey, duplicateSignals } from "./dedupe";
import type { PartnerAdapter, PartnerPropertyCandidate, PartnerPropertyRaw } from "./types";

const PARTNER_ID = "mercado-de-terras" as const;
const BASE_URL = "https://www.mercadodeterras.com.br/imoveis/all/sp/all";
const strip = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const absoluteUrl = (value: string) => value.startsWith("http") ? value : `https://www.mercadodeterras.com.br${value}`;
function parseArea(value: string | undefined): number | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  const numeric = normalized.match(/[\d.,]+/)?.[0];
  if (!numeric) return null;
  const number = normalized.includes("m²") ? Number(numeric.replaceAll(".", "").replace(",", ".")) : Number(numeric.replace(",", "."));
  if (!Number.isFinite(number)) return null;
  return normalized.includes("ha") ? number * 10000 : number;
}

export const mercadoDeTerrasAdapter: PartnerAdapter = {
  id: PARTNER_ID,
  name: "Mercado de Terras",
  async discover() {
    const response = await fetch(BASE_URL, { headers: { Accept: "text/html" }, signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error(`Mercado de Terras respondeu ${response.status}`);
    const html = await response.text();
    return [...new Set([...html.matchAll(/href=["']([^"']+)["']/gi)].flatMap((match) => { const href = match[1]; return href && href.includes("/imovel/") ? [absoluteUrl(href)] : []; }))];
  },
  async fetchProperty(sourceUrl) {
    const url = absoluteUrl(sourceUrl);
    const response = await fetch(url, { headers: { Accept: "text/html" }, signal: AbortSignal.timeout(10_000) });
    if (!response.ok) return null;
    const html = await response.text();
    const text = strip(html);
    const title = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ? strip(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "") : html.match(/<title[^>]*>([^<]+)/i)?.[1]?.trim();
    if (!title) return null;
    const pathParts = new URL(url).pathname.split("/").filter(Boolean);
    const city = pathParts[2] ? pathParts[2].replaceAll("-", " ") : null;
    const areaMatch = html.match(/Área total<\/span>\s*<span[^>]*>([^<]+)/i);
    const size = parseArea(areaMatch?.[1]);
    const features = [...html.matchAll(/mt-qf-label">([^<]+)<\/span>\s*<span class="mt-qf-value">([^<]+)/gi)].map((match) => `${strip(match[1] ?? "")}: ${strip(match[2] ?? "")}`).filter(Boolean).slice(0, 20);
    const gallery = [...new Set([...html.matchAll(/(?:src|data-src)=["']([^"']+\.(?:jpg|jpeg|png|webp))["']/gi)].map((match) => absoluteUrl(match[1] ?? "")).filter((image) => image && !image.toLowerCase().includes("logo")))].slice(0, 12);
    const bedroomMatch = text.match(/(\d+)\s+(?:dormitórios|quartos)/i);
    return { partnerPropertyId: pathParts.at(-1) ?? url, sourceUrl: url, title: strip(title), description: text.slice(0, 3000), city: city ? city.replace(/\b\w/g, (letter) => letter.toUpperCase()) : null, state: "SP", size: Number.isFinite(size) ? size : null, bedrooms: bedroomMatch ? Number(bedroomMatch[1]) : null, features, gallery };
  },
  normalize(raw, existing = []) {
    const location = approvedLocation(raw.city, raw.state);
    if (!location) return null;
    const signals = duplicateSignals(raw, existing);
    const area = raw.size ? `${new Intl.NumberFormat("pt-BR").format(raw.size)} m²` : "área não informada";
    const rooms = raw.bedrooms ? ` A página informa ${raw.bedrooms} dormitórios.` : "";
    const facts = raw.features.length ? ` Entre os dados objetivos estão: ${raw.features.slice(0, 4).join("; ")}.` : "";
    return { partnerPropertyId: raw.partnerPropertyId, sourceUrl: raw.sourceUrl, title: raw.title, city: location.cityName, state: raw.state, size: raw.size, bedrooms: raw.bedrooms, features: raw.features, gallery: raw.gallery, sourceType: "partner", partnerId: PARTNER_ID, partnerName: "Mercado de Terras", partnerSourceUrl: raw.sourceUrl, lastSyncedAt: new Date().toISOString(), sourceStatus: "candidate", contentRewriteVersion: "p6-v1", partnerCoverMode: "remote_first", normalizedKey: dedupeKey(raw, "Mercado de Terras"), duplicateReview: signals.length > 0, duplicateSignals: signals, regionName: location.regionName, regionSlug: location.region, editorialTitle: `Área rural para pesquisa em ${location.cityName}`, editorialDescription: `Esta oportunidade está localizada em ${location.cityName}, na ${location.regionName}, e possui aproximadamente ${area}.${rooms}${facts} A descrição foi reorganizada editorialmente para destacar somente informações objetivas disponíveis na origem. Consulte a equipe Casa na Floresta para confirmar disponibilidade, documentação e demais detalhes.`, publicPrice: "Sob Consulta" };
  },
};
