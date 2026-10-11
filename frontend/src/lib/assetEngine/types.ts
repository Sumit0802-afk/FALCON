// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Asset Engine – Core Type System
// ─────────────────────────────────────────────────────────────────────────────

export type AssetCategoryId =
  | "shapes"
  | "graphics"
  | "3d"
  | "animations"
  | "photos"
  | "stickers"
  | "frames"
  | "grids"
  | "forms"
  | "mockups"
  | "charts"
  | "sheets"
  | "tables";

export type AssetFormat = "svg" | "image" | "gif" | "webm" | "lottie" | "png" | "webp";
export type AssetStyle =
  | "minimal" | "flat" | "outlined" | "filled" | "gradient" | "3d" | "isometric"
  | "glassmorphism" | "neumorphism" | "neon" | "hand-drawn" | "line-art"
  | "bold" | "elegant" | "playful" | "corporate" | "retro" | "modern" | "dark" | "light";

export interface AssetColor {
  name: string;
  hex: string;
}

export interface Palette {
  id: string;
  name: string;
  tags: string[];
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  light: string;
  mid?: string;
}

export interface AssetDef {
  id: string;
  name: string;
  category: AssetCategoryId;
  subcategory: string;
  tags: string[];
  keywords: string[];
  thumbnailUrl?: string;       // If CDN-backed (photos)
  fileUrl?: string;            // If CDN-backed (photos)
  templateId: string;          // References renderer
  params: Record<string, unknown>; // Color palette, style variant, etc.
  format: AssetFormat;
  width: number;
  height: number;
  editable: boolean;
  animated: boolean;
  style: AssetStyle;
  colors: string[];            // Main colors present in asset
  license: string;
  source: string;
  author?: string;
}

export interface AssetPage {
  items: AssetDef[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SearchOptions {
  query?: string;
  category?: AssetCategoryId;
  subcategory?: string;
  style?: AssetStyle;
  colors?: string[];
  animated?: boolean;
  editable?: boolean;
  format?: AssetFormat;
  sortBy?: "relevance" | "newest" | "popular";
  page?: number;
  pageSize?: number;
}
