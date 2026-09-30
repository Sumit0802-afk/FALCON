// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Design Editor – Sticker Source Catalog & Registry Types
// ─────────────────────────────────────────────────────────────────────────────

export interface StickerSource {
  id: string;
  name: string;
  url: string;
  apiEndpoint?: string;
  license: string;
  licenseUrl: string;
  commercialUse: boolean;
  redistribution: boolean;
  attributionRequired: boolean;
  attributionText?: string;
  enabled: boolean;
  description: string;
  allowedFormats: ("svg" | "png" | "webp")[];
  importedCount?: number;
}

export interface IngestionAuditLog {
  id: string;
  stickerId: string;
  sourceId: string;
  sourceUrl: string;
  license: string;
  hash: string;
  status: "draft" | "published" | "rejected" | "disabled";
  validationPassed: boolean;
  rejectionReason?: string;
  importedAt: string;
  publishedAt?: string;
}
