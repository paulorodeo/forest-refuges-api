export const siteConfig = {
  publicSiteUrl: "https://www.casanafloresta.com.br",
  wordpressOrigin: "https://www2.casanafloresta.com.br",
  payloadOrigin: null as string | null,
} as const;

const TECHNICAL_PATH_PREFIXES = [
  "/wp-json/",
  "/wp-admin/",
  "/wp-login.php",
  "/wp-content/",
  "/wp-includes/",
] as const;

export function toPublicPermalink(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    const isWordPressHost = url.hostname === new URL(siteConfig.wordpressOrigin).hostname;
    const isTechnicalPath = TECHNICAL_PATH_PREFIXES.some((prefix) =>
      url.pathname.startsWith(prefix),
    );
    const looksLikeFile = /\/[^/]+\.[a-z0-9]{2,8}$/i.test(url.pathname);
    if (isWordPressHost && !isTechnicalPath && !looksLikeFile) {
      const publicOrigin = new URL(siteConfig.publicSiteUrl);
      url.protocol = publicOrigin.protocol;
      url.host = publicOrigin.host;
    }
    return url.toString();
  } catch {
    return value;
  }
}

export const toPublicUrl = toPublicPermalink;