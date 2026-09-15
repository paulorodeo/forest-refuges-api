export type RegionConfig = {
  slug: string;
  name: string;
  intro: string;
  cities: string[];
  citySlugs: string[];
  nearby: string[];
};

export const REGIONS: Record<string, RegionConfig> = {
  "vale-do-ribeira": { slug: "vale-do-ribeira", name: "Vale do Ribeira", intro: "Encontre propriedades e refúgios publicados no portal para pesquisar no Vale do Ribeira.", cities: ["Registro", "Iguape", "Itariri", "Juquiá", "Miracatu"], citySlugs: ["registro", "iguape", "itariri", "juquia", "miracatu"], nearby: ["Sorocaba"] },
  sorocaba: { slug: "sorocaba", name: "Região de Sorocaba", intro: "Pesquise imóveis publicados em Sorocaba e nos municípios próximos configurados para esta região.", cities: ["Sorocaba", "Votorantim", "Araçoiaba da Serra", "Iperó", "Boituva", "Porto Feliz", "Salto de Pirapora", "Piedade", "São Roque", "Mairinque", "Alumínio"], citySlugs: ["sorocaba", "votorantim", "aracoiaba-da-serra", "ipero", "boituva", "porto-feliz", "salto-de-pirapora", "piedade", "sao-roque", "mairinque", "aluminio"], nearby: ["Campinas"] },
  campinas: { slug: "campinas", name: "Região de Campinas", intro: "Pesquise propriedades publicadas na região de Campinas e use os municípios listados como ponto de partida.", cities: ["Campinas", "Valinhos", "Vinhedo", "Jaguariúna", "Atibaia"], citySlugs: ["campinas", "valinhos", "vinhedo", "jaguariuna", "atibaia"], nearby: ["Sorocaba", "Ribeirão Preto"] },
  "ribeirao-preto": { slug: "ribeirao-preto", name: "Região de Ribeirão Preto", intro: "Veja imóveis publicados para pesquisa na região de Ribeirão Preto e municípios associados.", cities: ["Ribeirão Preto", "Sertãozinho", "Cravinhos", "Brodowski"], citySlugs: ["ribeirao-preto", "sertaozinho", "cravinhos", "brodowski"], nearby: ["Barretos", "Bauru"] },
  barretos: { slug: "barretos", name: "Região de Barretos", intro: "Encontre imóveis publicados para pesquisa na região de Barretos.", cities: ["Barretos", "Bebedouro", "Colina", "Guaíra"], citySlugs: ["barretos", "bebedouro", "colina", "guaira"], nearby: ["Ribeirão Preto"] },
  bauru: { slug: "bauru", name: "Região de Bauru", intro: "Pesquise imóveis publicados na região de Bauru e nos municípios associados.", cities: ["Bauru", "Agudos", "Pederneiras", "Jaú"], citySlugs: ["bauru", "agudos", "pederneiras", "jau"], nearby: ["Ribeirão Preto"] },
};
