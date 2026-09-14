import type { BlogPost } from "./blog.types";
import type { PropertyDetail } from "./wp.server";

/**
 * Dados que já existem nos adapters WordPress. Não há inferência remota nem IA:
 * os sinais textuais são extraídos de título, resumo e conteúdo já carregados.
 */
export type RelatedArticle = Pick<
  BlogPost,
  "id" | "slug" | "title" | "excerpt" | "contentHtml" | "publishedAt" | "categories" | "tags" | "canonicalUrl"
>;

export type RelatedProperty = Pick<
  PropertyDetail,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "city"
  | "area"
  | "state"
  | "typeName"
  | "typeSlug"
  | "statusName"
  | "statusSlug"
  | "price"
  | "size"
  | "bedrooms"
  | "features"
  | "publishedAt"
  | "contentHtml"
>;

export type RelatedResult<T> = { item: T; score: number };

export const RELATED_WEIGHTS = {
  article: {
    category: 30,
    tag: 16,
    location: 24,
    propertyType: 12,
    intent: 10,
    tokenSimilarity: 18,
    recency: 5,
    minimum: 12,
  },
  property: {
    city: 50,
    area: 30,
    state: 20,
    type: 15,
    price: 12,
    size: 8,
    bedrooms: 6,
    features: 12,
    intent: 8,
    recency: 4,
    minimum: 12,
  },
  cross: {
    city: 45,
    area: 30,
    state: 15,
    propertyType: 16,
    intent: 10,
    features: 12,
    tokenSimilarity: 10,
    minimum: 12,
  },
} as const;

const STOP_WORDS = new Set([
  "a", "ao", "as", "com", "da", "das", "de", "do", "dos", "e", "em", "na", "nas", "no", "nos", "o", "os", "para", "por", "um", "uma",
]);
const INTENT_TERMS = ["compra", "venda", "temporada", "lazer", "investimento", "moradia", "refugio", "praia", "documentacao", "mercado"];

function normalize(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tokens(value: string | null | undefined): Set<string> {
  return new Set(
    normalize(value)
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token)),
  );
}

function overlap(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const value of a) if (b.has(value)) count++;
  return count;
}

function hasSame(a: string | null | undefined, b: string | null | undefined): boolean {
  return Boolean(a && b && normalize(a) === normalize(b));
}

function textSimilarity(a: Set<string>, b: Set<string>, weight: number): number {
  const shared = overlap(a, b);
  if (!shared) return 0;
  return Math.round((shared / Math.max(1, Math.min(a.size, b.size))) * weight);
}

function recencyScore(date: string, weight: number): number {
  const age = Date.now() - new Date(date).getTime();
  if (!Number.isFinite(age) || age < 0) return 0;
  const days = age / 86_400_000;
  return days <= 30 ? weight : days <= 180 ? Math.ceil(weight / 2) : 0;
}

function articleText(article: RelatedArticle): Set<string> {
  return tokens(`${article.title} ${article.excerpt} ${article.contentHtml}`);
}

function propertyText(property: RelatedProperty): Set<string> {
  return tokens(
    `${property.title} ${property.excerpt} ${property.contentHtml} ${property.features.join(" ")} ${property.statusName ?? ""}`,
  );
}

function locationTokens(property: RelatedProperty): Set<string> {
  return tokens(`${property.city ?? ""} ${property.area ?? ""} ${property.state ?? ""}`);
}

function intentTokens(text: Set<string>): Set<string> {
  return new Set(INTENT_TERMS.filter((term) => text.has(term)));
}

function proximity(value: number | null, other: number | null, weight: number): number {
  if (!value || !other || value <= 0 || other <= 0) return 0;
  const difference = Math.abs(value - other) / Math.max(value, other);
  if (difference <= 0.15) return weight;
  if (difference <= 0.35) return Math.ceil(weight / 2);
  return 0;
}

function uniqueBy<T>(items: readonly T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = key(item);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/** Category/tag overlap has priority, then shared geography and textual context. */
export function scoreRelatedArticle(current: RelatedArticle, candidate: RelatedArticle): number {
  if (current.id === candidate.id || current.canonicalUrl === candidate.canonicalUrl) return 0;
  const currentText = articleText(current);
  const candidateText = articleText(candidate);
  const categoryScore = overlap(tokens(current.categories.join(" ")), tokens(candidate.categories.join(" "))) ? RELATED_WEIGHTS.article.category : 0;
  const tagScore = overlap(tokens(current.tags.join(" ")), tokens(candidate.tags.join(" "))) ? RELATED_WEIGHTS.article.tag : 0;
  const locationScore = textSimilarity(currentText, candidateText, RELATED_WEIGHTS.article.location);
  const typeScore = textSimilarity(currentText, candidateText, RELATED_WEIGHTS.article.propertyType);
  const intentScore = textSimilarity(intentTokens(currentText), intentTokens(candidateText), RELATED_WEIGHTS.article.intent);
  return categoryScore + tagScore + locationScore + typeScore + intentScore + textSimilarity(currentText, candidateText, RELATED_WEIGHTS.article.tokenSimilarity) + recencyScore(candidate.publishedAt, RELATED_WEIGHTS.article.recency);
}

/** Location is deliberately dominant; price, size and bedrooms only refine local matches. */
export function scoreRelatedProperty(current: RelatedProperty, candidate: RelatedProperty): number {
  if (current.id === candidate.id || current.slug === candidate.slug) return 0;
  const currentText = propertyText(current);
  const candidateText = propertyText(candidate);
  const featureScore = textSimilarity(tokens(current.features.join(" ")), tokens(candidate.features.join(" ")), RELATED_WEIGHTS.property.features);
  return (
    (hasSame(current.city, candidate.city) ? RELATED_WEIGHTS.property.city : 0) +
    (hasSame(current.area, candidate.area) ? RELATED_WEIGHTS.property.area : 0) +
    (hasSame(current.state, candidate.state) ? RELATED_WEIGHTS.property.state : 0) +
    (hasSame(current.typeSlug, candidate.typeSlug) ? RELATED_WEIGHTS.property.type : 0) +
    proximity(current.price, candidate.price, RELATED_WEIGHTS.property.price) +
    proximity(current.size, candidate.size, RELATED_WEIGHTS.property.size) +
    proximity(current.bedrooms, candidate.bedrooms, RELATED_WEIGHTS.property.bedrooms) +
    featureScore +
    textSimilarity(intentTokens(currentText), intentTokens(candidateText), RELATED_WEIGHTS.property.intent) +
    recencyScore(candidate.publishedAt, RELATED_WEIGHTS.property.recency)
  );
}

export function scoreArticleToProperty(article: RelatedArticle, property: RelatedProperty): number {
  const text = articleText(article);
  const propertyTokens = propertyText(property);
  const locations = locationTokens(property);
  return (
    (text.has(normalize(property.city)) ? RELATED_WEIGHTS.cross.city : 0) +
    (text.has(normalize(property.area)) ? RELATED_WEIGHTS.cross.area : 0) +
    (text.has(normalize(property.state)) ? RELATED_WEIGHTS.cross.state : 0) +
    (property.typeSlug && text.has(normalize(property.typeSlug)) ? RELATED_WEIGHTS.cross.propertyType : 0) +
    textSimilarity(intentTokens(text), intentTokens(propertyTokens), RELATED_WEIGHTS.cross.intent) +
    textSimilarity(text, tokens(property.features.join(" ")), RELATED_WEIGHTS.cross.features) +
    textSimilarity(text, locations, RELATED_WEIGHTS.cross.tokenSimilarity)
  );
}

export function scorePropertyToArticle(property: RelatedProperty, article: RelatedArticle): number {
  return scoreArticleToProperty(article, property);
}

function select<T>(items: readonly T[], score: (item: T) => number, minimum: number, limit: number, key: (item: T) => string): RelatedResult<T>[] {
  return uniqueBy(items, key)
    .map((item) => ({ item, score: score(item) }))
    .filter((result) => result.score >= minimum)
    .sort((a, b) => b.score - a.score || key(a.item).localeCompare(key(b.item)))
    .slice(0, limit);
}

export function relatedArticles<T extends RelatedArticle>(current: RelatedArticle, candidates: readonly T[], limit = 3): RelatedResult<T>[] {
  return select(candidates, (candidate) => scoreRelatedArticle(current, candidate), RELATED_WEIGHTS.article.minimum, Math.min(limit, 3), (article) => article.canonicalUrl);
}

export function relatedProperties<T extends RelatedProperty>(current: RelatedProperty, candidates: readonly T[], limit = 6): RelatedResult<T>[] {
  return select(candidates, (candidate) => scoreRelatedProperty(current, candidate), RELATED_WEIGHTS.property.minimum, Math.min(limit, 6), (property) => property.slug);
}

export function propertiesForArticle<T extends RelatedProperty>(article: RelatedArticle, candidates: readonly T[], limit = 3): RelatedResult<T>[] {
  return select(candidates, (property) => scoreArticleToProperty(article, property), RELATED_WEIGHTS.cross.minimum, Math.min(limit, 3), (property) => property.slug);
}

export function articlesForProperty<T extends RelatedArticle>(property: RelatedProperty, candidates: readonly T[], limit = 2): RelatedResult<T>[] {
  return select(candidates, (article) => scorePropertyToArticle(property, article), RELATED_WEIGHTS.cross.minimum, Math.min(limit, 2), (article) => article.canonicalUrl);
}
