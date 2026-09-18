import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/noticias")({
  component: NoticiasLayout,
});

function NoticiasLayout() {
  return <Outlet />;
}
