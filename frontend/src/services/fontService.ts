import {
  GOOGLE_FONTS_CATALOG,
  GoogleFontMeta,
  FontCategory,
} from "@/data/googleFonts";

export interface FontItem extends GoogleFontMeta {}

export const GOOGLE_FONTS_LIST: string[] = GOOGLE_FONTS_CATALOG.map((f) => f.family);

const GOOGLE_FONTS_CSS2 = "https://fonts.googleapis.com/css2";

/* In-memory set of loaded fonts and preview links to avoid duplicate network tags */
const loadedFontStyles = new Set<string>();
const loadedFontPreviews = new Set<string>();

/* Cache of full Google Fonts list if fetched from API */
let remoteFontCatalog: FontItem[] | null = null;
let isFetchingRemote = false;

/**
 * Fetch the complete Google Fonts catalog dynamically using the Google Fonts Webfonts API
 * if GOOGLE_FONTS_API_KEY is configured in the environment.
 * Falls back gracefully to GOOGLE_FONTS_CATALOG.
 */
export async function fetchAllGoogleFonts(): Promise<FontItem[]> {
  if (remoteFontCatalog) {
    return remoteFontCatalog;
  }

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY ||
    process.env.GOOGLE_FONTS_API_KEY;

  if (
    !apiKey ||
    apiKey === "YOUR_API_KEY_HERE" ||
    isFetchingRemote
  ) {
    return GOOGLE_FONTS_CATALOG;
  }

  try {
    isFetchingRemote = true;
    const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Fonts API responded with status ${res.status}`);
    }
    const data = await res.json();
    if (data && Array.isArray(data.items)) {
      const items: FontItem[] = data.items.map(
        (item: any, idx: number) => {
          const variants: string[] = [];
          let hasItalic = false;

          (item.variants || []).forEach((v: string) => {
            if (v.includes("italic")) {
              hasItalic = true;
            }
            const numeric = v.replace(/[^0-9]/g, "");
            const weight = numeric || "400";
            if (!variants.includes(weight)) {
              variants.push(weight);
            }
          });

          return {
            family: item.family,
            category: (item.category as FontCategory) || "sans-serif",
            variants: variants.sort(),
            hasItalic,
            isVariable: (item.axes && item.axes.length > 0) || false,
            popularityRank: idx + 1,
          };
        }
      );

      remoteFontCatalog = items;
      return items;
    }
  } catch (err) {
    // Graceful fallback to bundled catalog
    console.warn("Could not load Google Fonts API catalog, using bundled library:", err);
  } finally {
    isFetchingRemote = false;
  }

  return GOOGLE_FONTS_CATALOG;
}

/**
 * Synchronous accessor that returns the currently loaded catalog (or bundled catalog).
 */
export function getFontCatalog(): FontItem[] {
  return remoteFontCatalog || GOOGLE_FONTS_CATALOG;
}

/**
 * Loads a full Google font with specified weights and italic support into the document.
 * Caches loaded links so subsequent calls are instantaneous.
 */
export function loadGoogleFont(
  family: string,
  weights: number[] = [400, 500, 600, 700],
  italic = false
): Promise<void> {
  if (typeof document === "undefined") {
    return Promise.resolve();
  }

  const cacheKey = `${family}_${weights.sort().join(",")}_${italic}`;
  if (loadedFontStyles.has(cacheKey)) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const linkId = `gfont-${family.replace(/\s+/g, "-").toLowerCase()}`;
    let link = document.getElementById(linkId) as HTMLLinkElement | null;

    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    // Construct Google Fonts CSS2 URL
    // e.g. https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,700;1,400;1,700&display=swap
    const sortedWeights = Array.from(new Set(weights)).sort((a, b) => a - b);
    const weightSegments: string[] = [];

    if (italic) {
      sortedWeights.forEach((w) => weightSegments.push(`0,${w}`));
      sortedWeights.forEach((w) => weightSegments.push(`1,${w}`));
    } else {
      sortedWeights.forEach((w) => weightSegments.push(`0,${w}`));
    }

    const weightQuery = weightSegments.length > 0 ? `:ital,wght@${weightSegments.join(";")}` : "";
    const href = `${GOOGLE_FONTS_CSS2}?family=${encodeURIComponent(family)}${weightQuery}&display=swap`;

    link.onload = () => {
      loadedFontStyles.add(cacheKey);
      resolve();
    };

    link.onerror = () => {
      // Resolve anyway so editor UI doesn't hang
      resolve();
    };

    link.href = href;
  });
}

/**
 * Loads a lightweight font preview subset containing just the font name and "Ag".
 * This is ultra-lightweight (~1-2KB) and prevents downloading heavy font files for previews.
 */
export function loadFontPreview(family: string): void {
  if (typeof document === "undefined") {
    return;
  }

  const previewId = `gfont-prev-${family.replace(/\s+/g, "-").toLowerCase()}`;
  if (loadedFontPreviews.has(previewId) || document.getElementById(previewId)) {
    return;
  }

  loadedFontPreviews.add(previewId);

  const link = document.createElement("link");
  link.id = previewId;
  link.rel = "stylesheet";
  const previewText = encodeURIComponent(`${family} Ag123`);
  link.href = `${GOOGLE_FONTS_CSS2}?family=${encodeURIComponent(family)}&text=${previewText}&display=swap`;
  document.head.appendChild(link);
}

/* =============================================================================
   FAVORITES AND RECENT FONTS (LOCAL STORAGE)
   ============================================================================= */

const FAVORITES_STORAGE_KEY = "falcon_favorite_fonts";
const RECENT_STORAGE_KEY = "falcon_recent_fonts";

export function getFavoriteFonts(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : ["Inter", "Playfair Display", "Poppins", "Montserrat"];
  } catch {
    return [];
  }
}

export function isFavoriteFont(family: string): boolean {
  return getFavoriteFonts().includes(family);
}

export function toggleFavoriteFont(family: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getFavoriteFonts();
    const exists = current.includes(family);
    const updated = exists ? current.filter((f) => f !== family) : [...current, family];
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    return !exists;
  } catch {
    return false;
  }
}

export function getRecentFonts(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : ["Inter", "Roboto", "Playfair Display"];
  } catch {
    return [];
  }
}

export function addRecentFont(family: string): void {
  if (typeof window === "undefined" || !family) return;
  try {
    const current = getRecentFonts().filter((f) => f !== family);
    const updated = [family, ...current].slice(0, 15);
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

/* =============================================================================
   SEARCH & FILTER
   ============================================================================= */

export type FilterCategory =
  | "all"
  | "sans-serif"
  | "serif"
  | "display"
  | "handwriting"
  | "monospace"
  | "variable"
  | "favorites"
  | "recent";

export function filterAndSearchFonts(
  query: string,
  category: FilterCategory = "all",
  catalog: FontItem[] = getFontCatalog()
): FontItem[] {
  const cleanQuery = query.trim().toLowerCase();
  const favorites = getFavoriteFonts();
  const recents = getRecentFonts();

  return catalog.filter((font) => {
    // Name match
    if (cleanQuery && !font.family.toLowerCase().includes(cleanQuery)) {
      return false;
    }

    // Category filter
    if (category === "all") return true;
    if (category === "variable") return font.isVariable;
    if (category === "favorites") return favorites.includes(font.family);
    if (category === "recent") return recents.includes(font.family);
    return font.category === category;
  });
}

// Backwards compatibility for existing imports
export const POPULAR_FONTS = GOOGLE_FONTS_CATALOG;
export function searchFonts(query: string): FontItem[] {
  return filterAndSearchFonts(query, "all");
}