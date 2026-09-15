import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { getSitemapItems, getTerms } from "./lib/wp.server";
import { REGIONS } from "./lib/region-data";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

const PUBLIC_ORIGIN = "https://www.casanafloresta.com.br";
const PAGE_PATHS = ["/", "/blog", "/chacaras", "/sitios", "/chales", "/temporada", "/pesqueiros", "/refugios-urbanos", "/tipos-de-imoveis-rurais", "/servicos", ...Object.keys(REGIONS).map((slug) => `/regiao/${slug}`)];

function xmlEscape(value: string) { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;"); }
function urlset(paths: string[]) { return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${xmlEscape(`${PUBLIC_ORIGIN}${path}`)}</loc></url>`).join("")}</urlset>`; }
function sitemapIndex() { const names = ["pages", "properties", "posts", "property-types", "regions", "services"]; return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${names.map((name) => `<sitemap><loc>${PUBLIC_ORIGIN}/sitemap-${name}.xml</loc></sitemap>`).join("")}</sitemapindex>`; }
async function seoResponse(pathname: string): Promise<Response | undefined> {
  const headers = { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300" };
  if (pathname === "/robots.txt") return new Response(`User-agent: *\nDisallow: /wp-admin/\nDisallow: /wp-login.php\nDisallow: /wp-json/\nDisallow: /_server/\nDisallow: /api/\nSitemap: ${PUBLIC_ORIGIN}/sitemap_index.xml\n`, { headers: { "content-type": "text/plain; charset=utf-8" } });
  if (pathname === "/sitemap_index.xml") return new Response(sitemapIndex(), { headers });
  if (pathname === "/sitemap-pages.xml") return new Response(urlset(PAGE_PATHS), { headers });
  if (pathname === "/sitemap-regions.xml") return new Response(urlset(Object.keys(REGIONS).map((slug) => `/regiao/${slug}`)), { headers });
  if (pathname === "/sitemap-services.xml") return new Response(urlset(["/servicos"]), { headers });
  if (pathname === "/sitemap-property-types.xml") { const terms = await getTerms("property_type"); return new Response(urlset(terms.map((term) => `/tipo-de-propriedade/${term.slug}`)), { headers }); }
  if (pathname === "/sitemap-properties.xml") { const slugs = await getSitemapItems("properties"); return new Response(urlset(slugs.map((slug) => `/imovel/${slug}`)), { headers }); }
  if (pathname === "/sitemap-posts.xml") { const slugs = await getSitemapItems("posts"); return new Response(urlset(slugs.map((slug) => `/${slug}/`)), { headers }); }
  return undefined;
}

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const seo = await seoResponse(new URL(request.url).pathname);
      if (seo) return seo;
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
