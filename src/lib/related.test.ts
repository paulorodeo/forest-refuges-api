import assert from "node:assert/strict";
import test from "node:test";
import {
  articlesForProperty,
  propertiesForArticle,
  relatedArticles,
  relatedProperties,
  scoreRelatedProperty,
  type RelatedArticle,
  type RelatedProperty,
} from "./related";

const article = (id: number, title: string, extra: Partial<RelatedArticle> = {}): RelatedArticle => ({
  id,
  slug: `article-${id}`,
  canonicalUrl: `https://example.test/article-${id}`,
  title,
  excerpt: "Guia de compra e lazer no campo.",
  contentHtml: "",
  publishedAt: "2026-09-01T00:00:00",
  categories: ["Guias"],
  tags: ["chacara"],
  ...extra,
});

const property = (id: number, extra: Partial<RelatedProperty> = {}): RelatedProperty => ({
  id,
  slug: `property-${id}`,
  title: "Chácara para lazer",
  excerpt: "",
  contentHtml: "",
  city: "Atibaia",
  area: "Centro",
  state: "SP",
  typeName: "Chácara",
  typeSlug: "chacara",
  statusName: "Venda",
  statusSlug: "venda",
  price: 500000,
  size: 1000,
  bedrooms: 3,
  features: ["piscina", "lazer"],
  publishedAt: "2026-09-01T00:00:00",
  ...extra,
});

test("never recommends the current item or duplicate canonical URLs", () => {
  const current = article(1, "Chácaras em Atibaia");
  const result = relatedArticles(current, [current, article(2, "Chácaras em Atibaia"), article(3, "Outro", { canonicalUrl: "https://example.test/article-2" })]);
  assert.deepEqual(result.map(({ item }) => item.id), [2]);
});

test("property location outranks a type-only match", () => {
  const current = property(1);
  const sameCity = property(2, { price: 900000, size: 4000 });
  const typeOnly = property(3, { city: "Campinas", area: null, state: "SP" });
  assert.ok(scoreRelatedProperty(current, sameCity) > scoreRelatedProperty(current, typeOnly));
});

test("price and size proximity refine property ranking", () => {
  const current = property(1);
  const close = property(2, { price: 520000, size: 1100 });
  const distant = property(3, { price: 1500000, size: 8000 });
  assert.equal(relatedProperties(current, [distant, close])[0]?.item.id, 2);
});

test("article geographic context prioritizes properties in that city", () => {
  const current = article(1, "Onde comprar chácara em Atibaia", { contentHtml: "Atibaia SP lazer" });
  const result = propertiesForArticle(current, [property(2), property(3, { city: "Campinas", area: null })]);
  assert.equal(result[0]?.item.id, 2);
});

test("property prioritizes articles relevant to its location and type", () => {
  const current = property(1);
  const result = articlesForProperty(current, [
    article(2, "Guia para comprar chácara em Atibaia", { contentHtml: "Atibaia SP compra" }),
    article(3, "Documentação para apartamento", { categories: ["Documentação"], tags: [] }),
  ]);
  assert.equal(result[0]?.item.id, 2);
});

test("minimum score removes weak relationships", () => {
  const current = article(1, "Turismo rural no Brasil", { categories: ["Turismo"], tags: [] });
  const weak = article(2, "Mercado de tecnologia", { categories: ["Tecnologia"], tags: [], excerpt: "Computadores" });
  assert.equal(relatedArticles(current, [weak]).length, 0);
});

test("fallback returns same-type properties when richer location signals are absent", () => {
  const current = property(1, { city: null, area: null, state: null, price: null, size: null, bedrooms: null, features: [] });
  const fallback = property(2, { city: null, area: null, state: null, price: null, size: null, bedrooms: null, features: [] });
  assert.equal(relatedProperties(current, [fallback])[0]?.item.id, 2);
});
