export type Service = { title: string; description: string };

export const SERVICES: Service[] = [
  { title: "Compra e Venda de Imóveis Rurais", description: "Intermediação de chácaras, sítios, casas de campo, áreas e outros imóveis." },
  { title: "Busca Personalizada de Imóveis", description: "Pesquisa direcionada por perfil, finalidade, localização e características desejadas." },
  { title: "Avaliação e Posicionamento de Mercado", description: "Análise para apoiar decisões de venda, compra e posicionamento comercial." },
  { title: "Análise Documental do Imóvel", description: "Organização e verificação inicial da documentação e identificação de pontos que merecem análise especializada." },
  { title: "Regularização Imobiliária Rural", description: "Apoio na identificação de pendências cadastrais, registrais e documentais." },
  { title: "Georreferenciamento, Topografia e INCRA", description: "Encaminhamento e acompanhamento de serviços técnicos com profissionais habilitados." },
  { title: "Desmembramento e Parcelamento de Áreas", description: "Orientação inicial e conexão com profissionais habilitados para divisão e organização de propriedades." },
  { title: "Usucapião, Posse e Questões Imobiliárias", description: "Encaminhamento de situações que exigem análise jurídica especializada." },
  { title: "Negociação e Estruturação da Venda", description: "Apoio na organização da negociação e comunicação entre as partes." },
  { title: "Anúncios e Marketing Imobiliário", description: "Produção e divulgação digital de imóveis nos canais do Casa na Floresta." },
  { title: "Valorização e Preparação do Imóvel para Venda", description: "Identificação de melhorias de apresentação, documentação e posicionamento." },
  { title: "Refúgios para Lazer, Temporada e Investimento", description: "Apoio na identificação de imóveis para segunda residência, temporada, cabanas, chalés e projetos ligados à natureza." },
];

export function ServiceGrid() {
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{SERVICES.map((service) => <article key={service.title} className="rounded-xl border border-border bg-card p-5"><h2 className="text-lg">{service.title}</h2><p className="mt-2 text-sm text-muted-foreground">{service.description}</p></article>)}</div>;
}
