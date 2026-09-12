import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { BlogPost } from "@/lib/blog.types";
import { getFallbackImage } from "@/lib/fallback-images";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function BlogPostCard({ post }: { post: BlogPost }) {
  const date = new Date(post.publishedAt);
  const formattedDate = Number.isNaN(date.getTime()) ? "" : dateFormatter.format(date);
  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <Link to="/blog/$slug" params={{ slug: post.slug }} className="block">
        <div className="aspect-[3/2] overflow-hidden bg-secondary">
          <img
            src={post.image ?? getFallbackImage({ contentType: "article" })}
            alt={post.imageAlt || post.title}
            width={900}
            height={600}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-5">
          {formattedDate && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="size-4" aria-hidden="true" />
              {formattedDate}
            </p>
          )}
          <h2 className="mt-3 line-clamp-2 text-xl leading-snug">{post.title}</h2>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
            Ler artigo <ArrowRight className="size-4" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
}