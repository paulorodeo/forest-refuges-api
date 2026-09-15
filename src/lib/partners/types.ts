export type PartnerId = "mercado-de-terras" | "viva-rural" | "banco-de-terras";

export type PartnerCoverMode = "remote_first" | "fixed_partner_cover" | "generated_from_gallery";

export type PartnerSourceRecord = {
  sourceType: "partner";
  partnerId: PartnerId;
  partnerName: string;
  partnerSourceUrl: string;
  partnerPropertyId: string;
  lastSyncedAt: string | null;
  sourceStatus: "candidate" | "review" | "published" | "rejected";
  contentRewriteVersion: string;
  partnerCoverMode: PartnerCoverMode;
};

export type PartnerPropertyRaw = {
  partnerPropertyId: string;
  sourceUrl: string;
  title: string;
  description: string;
  city: string | null;
  state: string | null;
  size: number | null;
  bedrooms: number | null;
  features: string[];
  gallery: string[];
};

export type PartnerPropertyCandidate = PartnerSourceRecord & Pick<PartnerPropertyRaw, "partnerPropertyId" | "sourceUrl" | "title" | "city" | "state" | "size" | "bedrooms" | "features" | "gallery"> & {
  normalizedKey: string;
  duplicateReview: boolean;
  duplicateSignals: string[];
  editorialTitle: string;
  editorialDescription: string;
  publicPrice: "Sob Consulta";
};

export interface PartnerAdapter {
  readonly id: PartnerId;
  readonly name: string;
  discover(): Promise<string[]>;
  fetchProperty(sourceUrl: string): Promise<PartnerPropertyRaw | null>;
  normalize(raw: PartnerPropertyRaw): PartnerPropertyCandidate | null;
}
