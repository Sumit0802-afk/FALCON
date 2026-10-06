import { TemplatePageData } from "../templates/clone";

export type TemplateStatus = "draft" | "published" | "archived";
export type TemplateSort =
  | "recommended"
  | "popular"
  | "most-used"
  | "newest"
  | "trending"
  | "featured";

export interface TemplateCardDTO {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  categorySlug: string;
  subcategory: string;
  subcategorySlug: string;
  tags: string[];
  style: string;
  industry: string;
  audience: string;
  platform: string;
  orientation: string;
  width: number;
  height: number;
  colorFamily: string;
  theme: string;
  language: string;
  thumbnailUrl: string | null;
  previewUrl: string | null;
  featured: boolean;
  status: string;
  usageCount: number;
  favoriteCount: number;
  viewCount: number;
  isFavorite: boolean;
  createdAt: string;
}

export interface TemplateDetailDTO extends TemplateCardDTO {
  designData?: TemplatePageData;
  related?: TemplateCardDTO[];
}

export interface TemplateListQuery {
  q?: string;
  category?: string;
  subcategory?: string;
  style?: string;
  industry?: string;
  platform?: string;
  orientation?: string;
  tag?: string;
  audience?: string;
  colorFamily?: string;
  theme?: string;
  language?: string;
  featured?: boolean;
export interface TemplateListQuery {
  q?: string;
  category?: string;
  subcategory?: string;
  style?: string;
  industry?: string;
  platform?: string;
  orientation?: string;
  tag?: string;
  audience?: string;
  colorFamily?: string;
  theme?: string;
  language?: string;
  featured?: boolean;
  favoritesOnly?: boolean;
  status?: TemplateStatus | "all";
  sort?: TemplateSort;
  limit?: number;
  cursor?: string;
  includeDesign?: boolean;
}
  limit?: number;
  cursor?: string;
  includeDesign?: boolean;
}

export interface ImportTemplateInput {
  slug?: string;
  name: string;
  description?: string;
  categorySlug: string;
  subcategorySlug: string;
  tags?: string[];
  style?: string;
  industry?: string;
  audience?: string;
  platform?: string;
  orientation?: string;
  width?: number;
  height?: number;
  colorFamily?: string;
  theme?: string;
  language?: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  featured?: boolean;
  status?: TemplateStatus;
  designData: TemplatePageData;
}

export const TEMPLATE_LIST_SELECT = {
  id: true,
  slug: true,
  name: true,
  description: true,
  status: true,
  featured: true,
  style: true,
  industry: true,
  audience: true,
  platform: true,
  orientation: true,
  width: true,
  height: true,
  colorFamily: true,
  theme: true,
  language: true,
  thumbnailUrl: true,
  previewUrl: true,
  usageCount: true,
  favoriteCount: true,
  viewCount: true,
  createdAt: true,
  category: { select: { name: true, slug: true } },
  subcategory: { select: { name: true, slug: true } },
  tags: { select: { tag: { select: { name: true, slug: true } } } },
} as const;
