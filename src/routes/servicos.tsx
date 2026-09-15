import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ServiceGrid } from "@/components/ServiceGrid";
import { SeoBreadcrumbs } from "@/components/SeoBreadcrumbs";

export const Route = createFileRoute("/servicos")({ head: () => ({ links: [{ rel: "canonical", href: "https://www.casanafloresta.com.br/servicos" }] }), component: ServicesPage });

function ServicesPage() {
  return <div className="min-h-screen bg-background"><SiteHeader /><SeoBreadcrumbs items={[{ name: "Início", href: "/" }, { name: "Serviços" }]} /><main className="mx-auto max-w-6xl px-4 py-14"><h1 className="text-4xl">Serviços</h1><p className="mt-4 max-w-2xl text-muted-foreground">Soluções imobiliárias para encontrar, avaliar, anunciar e organizar propriedades no campo.</p><section className="mt-10"><ServiceGrid /></section></main><SiteFooter /></div>;
}
