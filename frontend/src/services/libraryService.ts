import { apiFetch, getApiBaseUrl } from "./api";

export type LibraryType = "poster" | "presentation" | "certificate";

export interface LibraryCard {
  id: string;
  type: LibraryType;
  title: string;
  description: string;
  category: string;
  categoryName: string;
  subcategory: string;
  subcategoryName: string;
  style: string;
  styleName: string;
  industry: string;
  colorFamily: string;
  mode: string;
  orientation: string;
  width: number;
  height: number;
  sizeId: string;
  sizeName: string;
  slideCount: number;
  aspect: string;
  palette: string[];
  fonts: string[];
  isFeatured: boolean;
  usageCount: number;
  favoriteCount: number;
  author: string;
  editable: boolean;
  isFavorite: boolean;
  thumbnailUrl: string;
}

export interface LibraryPage {
  items: LibraryCard[];
  nextCursor: string | null;
  total: number;
  /** True when there are more results than `total` reports */
  totalCapped: boolean;
}

export interface LibraryQuery {
  type: LibraryType;
  q?: string;
  category?: string;
  subcategory?: string;
  style?: string;
  industry?: string;
  color?: string;
  size?: string;
  orientation?: string;
  aspect?: string;
  slides?: string;
  featured?: boolean;
  favorites?: boolean;
  sort?: "recommended" | "popular" | "newest";
  cursor?: string | null;
  limit?: number;
}

interface Counted {
  slug: string;
  name: string;
  count: number;
}

export interface LibraryFacets {
  type: LibraryType;
  total: number;
  categories: (Counted & { children: Counted[] })[];
  styles: Counted[];
  industries: Counted[];
  colors: Counted[];
  sizes: (Counted & { width: number; height: number })[];
  slideCounts: { value: number; count: number }[];
  orientations: { slug: string; count: number }[];
  aspects: { slug: string; count: number }[];
}

function queryString(query: object): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "" || value === false) continue;
    params.set(key, String(value));
  }
  return params.toString();
}

export function listLibrary(query: LibraryQuery, signal?: AbortSignal): Promise<LibraryPage> {
  return apiFetch<LibraryPage>(`/library?${queryString(query)}`, { signal });
}

export function getLibraryFacets(type: LibraryType): Promise<LibraryFacets> {
  return apiFetch<LibraryFacets>(`/library/facets?type=${type}`);
}

/** Address of the SVG preview of one page of a template (pages count from 1) */
const PREVIEW_VERSION = 4;

export function libraryPageUrl(id: string, page = 1): string {
  const root = getApiBaseUrl().replace(/\/$/, "");
  // Previews are cached for a long time; the version moves on whenever the designs themselves are improved
  return page === 1 ? `${root}/library/${id}/thumbnail.svg?v=${PREVIEW_VERSION}` : `${root}/library/${id}/pages/${page}.svg?v=${PREVIEW_VERSION}`;
}

export interface LibraryDesignPage {
  name: string;
  width: number;
  height: number;
  background: string;
  elements: unknown[];
}

/** The full design of a template: every page with its editable elements */
export async function getLibraryDesign(id: string): Promise<LibraryDesignPage[]> {
  return (await apiFetch<{ pages: LibraryDesignPage[] }>(`/library/${encodeURIComponent(id)}/design?v=${PREVIEW_VERSION}`)).pages;
}

/** Templates on the same subject or in the same style as this one */
export async function getRelatedTemplates(id: string, limit = 6, signal?: AbortSignal): Promise<LibraryCard[]> {
  return (await apiFetch<{ items: LibraryCard[] }>(`/library/${encodeURIComponent(id)}/related?limit=${limit}`, { signal })).items;
}

/** Copies the template into a new project owned by the signed-in user */
export function copyLibraryTemplate(id: string): Promise<{ projectId: string; pageCount: number }> {
  return apiFetch(`/library/${encodeURIComponent(id)}/use`, { method: "POST" });
}

export function setLibraryFavorite(id: string, favorite: boolean): Promise<{ id: string; isFavorite: boolean }> {
  return apiFetch(`/library/${encodeURIComponent(id)}/favorite`, { method: favorite ? "POST" : "DELETE" });
}
