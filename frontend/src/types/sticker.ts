// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Design Editor – Sticker Asset Model & Types
// ─────────────────────────────────────────────────────────────────────────────

export type StickerFormat = "svg" | "png" | "webp";

export type StickerStatus = "draft" | "published" | "disabled";

export interface Sticker {
  id: string;
  name: string;
  fileUrl: string;
  thumbnailUrl: string;
  format: StickerFormat;
  category: string;
  subcategory?: string;
  tags: string[];
  author: string;
  source: string;
  sourceUrl: string;
  license: string;
  attributionRequired: boolean;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
  status: StickerStatus;
  isDemo?: boolean;
}

export interface StickerCategory {
  id: string;
  label: string;
  emoji: string;
  description?: string;
}

export interface StickerQueryParams {
  query?: string;
  category?: string;
  subcategory?: string;
  tag?: string;
  format?: StickerFormat;
  status?: StickerStatus;
  limit?: number;
  offset?: number;
  favoritesOnly?: boolean;
  recentOnly?: boolean;
}

export interface PaginatedStickers {
  items: Sticker[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface StickerImportInput {
  name: string;
  fileUrl: string;
  thumbnailUrl?: string;
  format?: StickerFormat;
  category: string;
  subcategory?: string;
  tags: string[] | string;
  author: string;
  source: string;
  sourceUrl: string;
  license: string;
  attributionRequired?: boolean;
  width?: number;
  height?: number;
  status?: StickerStatus;
  svgContent?: string;
}

export interface BulkImportResult {
  total: number;
  successCount: number;
  failedCount: number;
  errors: { itemIndex: number; name?: string; error: string }[];
  imported: Sticker[];
}
