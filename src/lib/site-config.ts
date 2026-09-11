export const siteConfig = {
  publicSiteUrl: "https://www.casanafloresta.com.br",
  wordpressOrigin: "https://portal.casanafloresta.com.br",
  payloadOrigin: null as string | null,
} as const;

export function toPublicUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (
      url.hostname === "portal.casanafloresta.com.br" ||
      url.hostname === "www.portal.casanafloresta.com.br"
    ) {
      const publicOrigin = new URL(siteConfig.publicSiteUrl);
      url.protocol = publicOrigin.protocol;
      url.host = publicOrigin.host;
    }
    return url.toString();
  } catch {
    return value;
  }
}