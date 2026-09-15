import type { PartnerPropertyCandidate } from "./types";
import { mercadoDeTerrasAdapter } from "./mercado-terras";

/** Fixture editorial para inspeção local; não publica nem contém preço, telefone ou pessoa. */
export const mercadoDeTerrasPilotExample: PartnerPropertyCandidate = {
  sourceUrl: "https://www.mercadodeterras.com.br/imoveis/all/sp/all?page=27",
  regionName: "Região de Sorocaba",
  regionSlug: "sorocaba",
  sourceType: "partner", partnerId: "mercado-de-terras", partnerName: "Mercado de Terras", partnerSourceUrl: "https://www.mercadodeterras.com.br/imoveis/all/sp/all?page=27", partnerPropertyId: "piedade-44000m2-pilot", lastSyncedAt: null, sourceStatus: "candidate", contentRewriteVersion: "p6-v1", partnerCoverMode: "remote_first", normalizedKey: "mercado de terras|piedade 44000m2 pilot", duplicateReview: false, duplicateSignals: [], title: "Propriedade rural em Piedade", city: "Piedade", state: "SP", size: 44000, bedrooms: null, features: ["localização rural"], gallery: [], editorialTitle: "Área rural para pesquisa em Piedade", editorialDescription: "Área rural anunciada em Piedade, na região de Sorocaba, com 44.000 m². O candidato foi separado para revisão antes de qualquer publicação.", publicPrice: "Sob Consulta",
};

export async function inspectMercadoDeTerrasPilot() {
  return { adapter: mercadoDeTerrasAdapter, example: mercadoDeTerrasPilotExample };
}
