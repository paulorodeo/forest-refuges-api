import { siteConfig } from "./site-config";

const LEGACY_WORDPRESS_MEDIA_HOSTS = new Set([
  "www.casanafloresta.com.br",
  "img.casanafloresta.com.br",
]);

/**
 * Normalizes only known WordPress upload URLs. Unknown absolute URLs are deliberately rejected
 * here so the WordPress adapter cannot accidentally serve an arbitrary storage origin.
 */
export function normalizeWordPressMediaUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value, siteConfig.wordpressOrigin);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const isUpload = url.pathname.startsWith("/wp-content/uploads/");
    if (url.hostname === new URL(siteConfig.wordpressOrigin).hostname) return url.toString();
    if (isUpload && LEGACY_WORDPRESS_MEDIA_HOSTS.has(url.hostname)) {
      return new URL(`${url.pathname}${url.search}${url.hash}`, siteConfig.wordpressOrigin).toString();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Shared display boundary for local assets, legacy WordPress uploads and future Payload URLs.
 * Payload provides a public absolute URL; it is kept as-is and never rewritten to WordPress.
 */
export function resolveMediaUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  if (value.startsWith("/")) return value;
  const wordpressUrl = normalizeWordPressMediaUrl(value);
  if (wordpressUrl) return wordpressUrl;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function publicMediaUrl(publicOrigin: string, objectKey: string): string {
  const origin = publicOrigin.replace(/\/$/, "");
  const key = objectKey.replace(/^\/+/, "");
  return `${origin}/${key.split("/").map(encodeURIComponent).join("/")}`;
}
