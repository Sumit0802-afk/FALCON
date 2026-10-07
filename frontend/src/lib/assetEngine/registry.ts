// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Asset Engine – Master Registry + Search Engine
// ─────────────────────────────────────────────────────────────────────────────

import { AssetDef, AssetCategoryId, SearchOptions, AssetPage } from "./types";
import { getShapeAssets, SHAPE_COUNT } from "./shapesEngine";
import { getGraphicsAssets, GRAPHICS_COUNT } from "./graphicsEngine";
import { get3DAssets, THREED_COUNT } from "./threeDEngine";
import { getAnimationAssets, ANIMATIONS_COUNT } from "./animationsEngine";
import { getFrameAssets, FRAMES_COUNT } from "./framesEngine";
import { getStickerAssets, STICKERS_COUNT } from "./stickersEngine";
import { getRealAssets, realAssetCount } from "./realEngine";
import { load3DArtAssets, loadAnimationAssets, loadIconAssets } from "./artEngine";

/** Real artwork first, then Falcon's own generated pieces */
async function withArt(art: Promise<AssetDef[]>, own: AssetDef[]): Promise<AssetDef[]> {
  return [...(await art), ...own];
}

// Photos come from the existing massive seedPhotos.ts (2,384 entries)
let _photoAssets: AssetDef[] | null = null;

async function getPhotoAssets(): Promise<AssetDef[]> {
  if (_photoAssets) return _photoAssets;
  // Dynamically import to avoid loading 944KB on startup
  const { SEED_PHOTOS } = await import("@/data/seedPhotos");
  _photoAssets = SEED_PHOTOS.map((photo) => ({
    id: `photo-${photo.id}`,
    name: photo.name,
    category: "photos" as AssetCategoryId,
    subcategory: photo.category ?? "general",
    tags: photo.tags ?? [],
    keywords: [photo.name.toLowerCase(), ...(photo.tags ?? [])],
    thumbnailUrl: photo.thumbnailUrl,
    fileUrl: photo.fileUrl,
    templateId: "photo-cdn",
    params: { originalId: photo.id, author: photo.author ?? "" },
    format: "image" as const,
    width: photo.width ?? 1200,
    height: photo.height ?? 800,
    editable: false,
    animated: false,
    style: "flat" as const,
    colors: [],
    license: photo.license ?? "Unsplash License",
    source: photo.source ?? "Unsplash",
    author: photo.author,
  }));
  return _photoAssets;
}

// ── Category registry ─────────────────────────────────────────────────────────
const CATEGORY_LOADERS: Record<AssetCategoryId, () => AssetDef[] | Promise<AssetDef[]>> = {
  shapes:     () => getShapeAssets(),
  graphics:   () => withArt(loadIconAssets(), getGraphicsAssets()),
  "3d":       () => withArt(load3DArtAssets(), get3DAssets()),
  animations: () => withArt(loadAnimationAssets(), getAnimationAssets()),
  photos:     () => getPhotoAssets(),
  stickers:   () => getStickerAssets(),
  frames:     () => getFrameAssets(),
  grids:      () => getRealAssets("grids"),
  forms:      () => getRealAssets("forms"),
  mockups:    () => getRealAssets("mockups"),
  charts:     () => getRealAssets("charts"),
  sheets:     () => getRealAssets("sheets"),
  tables:     () => getRealAssets("tables"),
};

const CATEGORY_COUNTS: Record<AssetCategoryId, number> = {
  shapes:     SHAPE_COUNT,
  graphics:   GRAPHICS_COUNT,
  "3d":       THREED_COUNT,
  animations: ANIMATIONS_COUNT,
  photos:     2384,
  stickers:   STICKERS_COUNT,
  frames:     FRAMES_COUNT,
  grids:      realAssetCount("grids"),
  forms:      realAssetCount("forms"),
  mockups:    realAssetCount("mockups"),
  charts:     realAssetCount("charts"),
  sheets:     realAssetCount("sheets"),
  tables:     realAssetCount("tables"),
};

export function getTotalAssetCount(): number {
  return Object.values(CATEGORY_COUNTS).reduce((a, b) => a + b, 0);
}

export function getCategoryCount(category: AssetCategoryId): number {
  return CATEGORY_COUNTS[category] ?? 0;
}

export function getAllCategoryCounts(): Record<AssetCategoryId, number> {
  return { ...CATEGORY_COUNTS };
}

// ── Asset loading ─────────────────────────────────────────────────────────────
export async function loadCategoryAssets(category: AssetCategoryId): Promise<AssetDef[]> {
  const loader = CATEGORY_LOADERS[category];
  if (!loader) return [];
  return Promise.resolve(loader());
}

// ── Search Engine ─────────────────────────────────────────────────────────────
// Lightweight fuzzy-ish search: tokenize and score matches

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[\s,\-_/]+/).filter(Boolean);
}

function scoreAsset(asset: AssetDef, queryTokens: string[]): number {
  const nameTokens = tokenize(asset.name);
  const tagSet = new Set([...asset.tags, ...asset.keywords].map((t) => t.toLowerCase()));
  const subcatTokens = tokenize(asset.subcategory);

  let score = 0;
  for (const qt of queryTokens) {
    // Exact name token match
    if (nameTokens.some((nt) => nt === qt)) { score += 10; continue; }
    // Starts-with match in name
    if (nameTokens.some((nt) => nt.startsWith(qt))) { score += 7; continue; }
    // Tag exact match
    if (tagSet.has(qt)) { score += 8; continue; }
    // Tag starts-with
    if ([...tagSet].some((t) => t.startsWith(qt))) { score += 5; continue; }
    // Subcategory match
    if (subcatTokens.some((st) => st.startsWith(qt))) { score += 4; continue; }
    // Partial match anywhere (slower but thorough)
    const fullText = `${asset.name} ${asset.tags.join(" ")} ${asset.subcategory}`.toLowerCase();
    if (fullText.includes(qt)) { score += 2; }
  }
  return score;
}

function filterByOptions(asset: AssetDef, opts: SearchOptions): boolean {
  if (opts.style && asset.style !== opts.style) return false;
  if (opts.animated !== undefined && asset.animated !== opts.animated) return false;
  if (opts.editable !== undefined && asset.editable !== opts.editable) return false;
  if (opts.format && asset.format !== opts.format) return false;
  if (opts.subcategory && asset.subcategory.toLowerCase() !== opts.subcategory.toLowerCase()) return false;
  if (opts.colors && opts.colors.length > 0) {
    // Simple color tag filter
    const colorTags = opts.colors.map((c) => c.toLowerCase());
    if (!asset.tags.some((t) => colorTags.some((ct) => t.includes(ct)))) return false;
  }
  return true;
}

export async function searchAssets(opts: SearchOptions): Promise<AssetPage> {
  const {
    query = "",
    category,
    page = 0,
    pageSize = 48,
    sortBy = "relevance",
  } = opts;

  let assets: AssetDef[];

  if (category) {
    assets = await loadCategoryAssets(category);
  } else {
    // Cross-category search — load all (expensive, only for search)
    const allCategories = (Object.keys(CATEGORY_LOADERS) as AssetCategoryId[]).filter((c) => c !== "stickers" && c !== "graphics" && c !== "3d" && c !== "animations");
    const loaded = await Promise.all(allCategories.map((c) => loadCategoryAssets(c)));
    assets = loaded.flat();
  }

  // Filter
  assets = assets.filter((a) => filterByOptions(a, opts));

  // Score and sort
  const queryTokens = tokenize(query);
  if (queryTokens.length > 0) {
    const scored = assets
      .map((a) => ({ asset: a, score: scoreAsset(a, queryTokens) }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);
    assets = scored.map((s) => s.asset);
  } else if (sortBy === "newest") {
    // For non-search, shuffle deterministically by category for variety
    assets = [...assets];
  }

  const total = assets.length;
  const start = page * pageSize;
  const items = assets.slice(start, start + pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    hasMore: start + pageSize < total,
  };
}

export async function getAssetPage(
  category: AssetCategoryId,
  page = 0,
  pageSize = 48,
  subcategory?: string,
): Promise<AssetPage> {
  let assets = await loadCategoryAssets(category);

  if (subcategory && subcategory !== "All") {
    assets = assets.filter((a) => a.subcategory === subcategory);
  }

  const total = assets.length;
  const start = page * pageSize;
  const items = assets.slice(start, start + pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    hasMore: start + pageSize < total,
  };
}

// Get subcategories for a category
export async function getCategorySubcategories(category: AssetCategoryId): Promise<string[]> {
  const assets = await loadCategoryAssets(category);
  const subs = new Set(assets.map((a) => a.subcategory));
  return Array.from(subs).sort();
}

// Autocomplete suggestions from tags + names
export async function getAutocompleteSuggestions(partial: string, limit = 8): Promise<string[]> {
  if (partial.length < 2) return [];
  const lower = partial.toLowerCase();

  // Use shapes + graphics as a representative sample for autocomplete
  const sample = [...getShapeAssets().slice(0, 100), ...getGraphicsAssets().slice(0, 100)];
  const suggestions = new Set<string>();

  for (const asset of sample) {
    if (suggestions.size >= limit) break;
    for (const tag of asset.tags) {
      if (tag.toLowerCase().startsWith(lower) && tag.length > lower.length) {
        suggestions.add(tag);
      }
    }
    const words = asset.name.split(" ");
    for (const word of words) {
      if (word.toLowerCase().startsWith(lower) && word.length > lower.length) {
        suggestions.add(word.toLowerCase());
      }
    }
  }

  return Array.from(suggestions).slice(0, limit);
}

export const ASSET_SUMMARY = {
  total: getTotalAssetCount(),
  byCategoryRaw: CATEGORY_COUNTS,
};
