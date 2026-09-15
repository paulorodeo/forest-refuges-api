import type { PartnerPropertyCandidate, PartnerPropertyRaw } from "./types";

const normalizeText = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
export function dedupeKey(raw: Pick<PartnerPropertyRaw, "partnerPropertyId" | "city" | "size" | "title" | "features">, partnerName: string) {
  return `${normalizeText(partnerName)}|${normalizeText(raw.partnerPropertyId)}`;
}
export function duplicateSignals(raw: PartnerPropertyRaw, existing: PartnerPropertyCandidate[]) {
  const title = normalizeText(raw.title);
  return existing.filter((item) => item.city === raw.city && item.size === raw.size && normalizeText(item.title) === title && item.features.slice().sort().join("|") === raw.features.slice().sort().join("|")).map((item) => item.partnerPropertyId);
}
