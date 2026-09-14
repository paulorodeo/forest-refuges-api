import type { BlogListPost, BlogPost } from "./blog.types";
import type { PropertyCardData, PropertyDetail } from "./wp.server";
import {
  articlesForProperty,
  propertiesForArticle,
  relatedArticles,
  relatedProperties,
  type RelatedArticle,
  type RelatedProperty,
} from "./related";

export type RelatedBlogCandidate = BlogListPost & Pick<BlogPost, "categories" | "tags" | "contentHtml" | "canonicalUrl">;
export type RelatedPropertyCandidate = PropertyCardData & Pick<PropertyDetail, "publishedAt" | "contentHtml" | "features" | "bedrooms">;

export function asRelatedArticle<T extends RelatedArticle>(post: T): T {
  return post;
}

export function asRelatedProperty<T extends RelatedProperty>(property: T): T {
  return property;
}

/**
 * Server-side composition only. Callers provide already batched candidates so no relationship
 * calculation performs network I/O or creates N+1 WordPress requests.
 */
export function getRelatedForArticle(
  article: BlogPost,
  articles: readonly RelatedBlogCandidate[],
  properties: readonly RelatedPropertyCandidate[],
) {
  return {
    articles: relatedArticles(article, articles),
    properties: propertiesForArticle(article, properties),
  };
}

export function getRelatedForProperty(
  property: PropertyDetail,
  properties: readonly RelatedPropertyCandidate[],
  articles: readonly RelatedBlogCandidate[],
) {
  return {
    properties: relatedProperties(property, properties),
    articles: articlesForProperty(property, articles),
  };
}
