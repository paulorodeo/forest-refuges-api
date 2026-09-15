export type BlogPost = {
  id: number;
  source: "wordpress" | "payload";
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  image: string | null;
  imageAlt: string;
  authorName: string | null;
  publishedAt: string;
  modifiedAt: string;
  categories: string[];
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  historicalUrl: string | null;
  historicalPath: string;
  canonicalUrl: string;
};

export type BlogListPost = Pick<
  BlogPost,
  "id" | "source" | "slug" | "title" | "excerpt" | "image" | "imageAlt" | "publishedAt"
>;

export type BlogListResult = {
  items: BlogListPost[];
  total: number;
  totalPages: number;
  page: number;
  unavailable: boolean;
};

export type BlogPostResult =
  | { status: "ok"; post: BlogPost }
  | { status: "not-found" }
  | { status: "unavailable" };

export interface BlogAdapter {
  list(page?: number, perPage?: number): Promise<BlogListResult>;
  getBySlug(slug: string): Promise<BlogPostResult>;
}

export class PayloadBlogAdapter implements BlogAdapter {
  async list(): Promise<BlogListResult> {
    return { items: [], total: 0, totalPages: 0, page: 1, unavailable: false };
  }

  async getBySlug(): Promise<BlogPostResult> {
    return { status: "not-found" };
  }
}
