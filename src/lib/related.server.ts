import type { BlogPost } from "./blog.types";
import type { PropertyDetail } from "./wp.server";
import {
  articlesForProperty,
  propertiesForArticle,
  relatedArticles,
  relatedProperties,
  type RelatedArticle,
  type RelatedProperty,
} from "./related";

export function asRelatedArticle(post: BlogPost): RelatedArticle {
  return post;
}

export function asRelatedProperty(property: PropertyDetail): RelatedProperty {
  return property;
}

/**
 * Server-side composition only. Callers provide already batched candidates so no relationship
 * calculation performs network I/O or creates N+1 WordPress requests.
 */
export function getRelatedForArticle(
  article: BlogPost,
  articles: readonly BlogPost[],
  properties: readonly PropertyDetail[],
) {
  const current = asRelatedArticle(article);
  return {
    articles: relatedArticles(current, articles.map(asRelatedArticle)),
    properties: propertiesForArticle(current, properties.map(asRelatedProperty)),
  };
}

export function getRelatedForProperty(
  property: PropertyDetail,
  properties: readonly PropertyDetail[],
  articles: readonly BlogPost[],
) {
  const current = asRelatedProperty(property);
  return {
    properties: relatedProperties(current, properties.map(asRelatedProperty)),
    articles: articlesForProperty(current, articles.map(asRelatedArticle)),
  };
}
