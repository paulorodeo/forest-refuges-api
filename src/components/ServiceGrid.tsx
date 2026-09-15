export type Service = { title: string; description: string };

export const SERVICES: Service[] = [
  { title: "Atendimento Personalizado", description: "Acompanhamento conforme o objetivo de cada cliente." },
  { title: "Análise de Perfil", description: "Organização das necessidades para orientar a busca pelo imóvel." },
  { title: "Valorização de Investimento", description: "Apoio para avaliar possibilidades de valorização do patrimônio." },
  { title: "Regularização Imobiliária", description: "Orientação para organizar a documentação do imóvel." },
  { title: "Usucapião e Ações Jurídicas", description: "Encaminhamento de demandas jurídicas relacionadas ao imóvel." },
  { title: "Georreferenciamento e Topografia", description: "Serviços técnicos para compreender limites e características da propriedade." },
  { title: "Relatórios Interativos", description: "Informações organizadas para apoiar a análise de oportunidades." },
  { title: "Assessoria Jurídica", description: "Suporte jurídico durante as etapas da negociação imobiliária." },
  { title: "Negociação Transparente", description: "Intermediação com comunicação clara entre as partes." },
  { title: "Desmembramento e Loteamento", description: "Orientação para projetos de divisão e organização de áreas." },
  { title: "Anúncios Imobiliários Online", description: "Apresentação do imóvel nos canais digitais do portal." },
  { title: "Avaliação Imobiliária", description: "Apoio na avaliação do imóvel para orientar decisões." },
];

export function ServiceGrid() {
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{SERVICES.map((service) => <article key={service.title} className="rounded-xl border border-border bg-card p-5"><h2 className="text-lg">{service.title}</h2><p className="mt-2 text-sm text-muted-foreground">{service.description}</p></article>)}</div>;
}
