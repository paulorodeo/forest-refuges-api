import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ServiceGrid } from "@/components/ServiceGrid";
import { SeoBreadcrumbs } from "@/components/SeoBreadcrumbs";
import { whatsappUrl } from "@/lib/whatsapp";
import { ElfsightWidget } from "@/components/ElfsightWidget";

export const Route = createFileRoute("/servicos")({ head: () => ({ links: [{ rel: "canonical", href: "https://www.casanafloresta.com.br/servicos" }] }), component: ServicesPage });

function ServicesPage() {
  return <div className="min-h-screen bg-background"><SiteHeader /><SeoBreadcrumbs items={[{ name: "Início", href: "/" }, { name: "Serviços" }]} /><main className="mx-auto max-w-6xl px-4 py-14"><h1 className="text-4xl">Serviços</h1><p className="mt-4 max-w-2xl text-muted-foreground">Apoiamos cada etapa da pesquisa, negociação e preparação de imóveis rurais, conectando você à rede de especialistas quando a situação exige análise habilitada.</p><section className="mt-10"><ServiceGrid /></section><a href={whatsappUrl("serviços", "https://www.casanafloresta.com.br/servicos")} className="mt-10 inline-flex rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground">Falar pelo WhatsApp</a></main><ElfsightWidget id={2} /><SiteFooter /></div>;
}
