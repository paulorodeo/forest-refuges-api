import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/blog/")({
  loader: () => {
    throw redirect({ to: "/noticias", search: { page: 1 }, statusCode: 301 });
  },
  head: () => ({
    meta: [
      { title: "Redirecionando para Notícias | Casa na Floresta" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BlogIndexRedirect,
});

function BlogIndexRedirect() {
  return null;
}
