export const DEFAULT_WHATSAPP_NUMBER = "556540426464";

export type WhatsAppSources = {
  property?: string | null;
  agent?: string | null;
  agency?: string | null;
};

export function normalizeWhatsAppNumber(value: string | null | undefined): string | null {
  const digits = (value ?? "").replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export function selectWhatsAppNumber(sources: WhatsAppSources): string {
  return (
    normalizeWhatsAppNumber(sources.property) ??
    normalizeWhatsAppNumber(sources.agent) ??
    normalizeWhatsAppNumber(sources.agency) ??
    DEFAULT_WHATSAPP_NUMBER
  );
}

export function whatsappMessage(title: string, url: string): string {
  return `Olá, tenho interesse neste imóvel no Casa na Floresta:\n\n${title}\n\nPágina:\n${url}\n\nOrigem: Casa na Floresta`;
}

export function whatsappUrl(title: string, url: string, sources: WhatsAppSources = {}): string {
  return `https://wa.me/${selectWhatsAppNumber(sources)}?text=${encodeURIComponent(whatsappMessage(title, url))}`;
}
