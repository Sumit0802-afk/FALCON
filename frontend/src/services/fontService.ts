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

const FONTSHARE_CSS = "https://api.fontshare.com/v2/css";

/** The bundled catalogue by family name, for looking up what a font really offers */
const CATALOG_BY_FAMILY = new Map<string, GoogleFontMeta>(GOOGLE_FONTS_CATALOG.map((f) => [f.family.toLowerCase(), f]));

export function getFontMeta(family: string): GoogleFontMeta | undefined {
  return CATALOG_BY_FAMILY.get(family.toLowerCase()) || remoteFontCatalog?.find((f) => f.family === family);
}

/**
 * The weights to ask for. Asking a font service for a weight a family does not
 * have makes the whole request fail, so each wanted weight is swapped for the
 * nearest one the family really has.
 */
function availableWeights(meta: GoogleFontMeta | undefined, wanted: number[]): number[] {
  const has = (meta?.variants || []).map(Number).filter(Number.isFinite);
  if (!has.length) return [];
  const nearest = (w: number) => has.reduce((best, x) => (Math.abs(x - w) < Math.abs(best - w) ? x : best), has[0]);
  return Array.from(new Set(wanted.map(nearest))).sort((x, y) => x - y);
}

function fontStylesheetUrl(family: string, weights: number[], italic: boolean, text?: string): string {
  const meta = getFontMeta(family);
  const list = availableWeights(meta, weights);

  if (meta?.source === "fontshare" && meta.slug) {
    return `${FONTSHARE_CSS}?f[]=${meta.slug}@${(list.length ? list : [400]).join(",")}&display=swap`;
  }

  let axis = "";
  if (list.length) {
    const withItalic = italic && !!meta?.hasItalic;
    axis = withItalic
      ? `:ital,wght@${[...list.map((w) => `0,${w}`), ...list.map((w) => `1,${w}`)].join(";")}`
      : `:wght@${list.join(";")}`;
  }
  // A family that is not in the catalogue is asked for plainly, which gives its regular weight
  const subset = text ? `&text=${encodeURIComponent(text)}` : "";
  return `${GOOGLE_FONTS_CSS2}?family=${encodeURIComponent(family).replace(/%20/g, "+")}${axis}${subset}&display=swap`;
}

/**
 * Loads a font with the given weights (and italics, where the family has them)
 * into the document. Loading the same thing twice costs nothing.
 */
export function loadGoogleFont(
  family: string,
  weights: number[] = [400, 500, 600, 700],
  italic = false
): Promise<void> {
  if (typeof document === "undefined" || !family) {
    return Promise.resolve();
  }

  const href = fontStylesheetUrl(family, weights, italic);
  if (loadedFontStyles.has(href)) {
    return Promise.resolve();
  }
  loadedFontStyles.add(href);

  return new Promise((resolve) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.dataset.falconFont = family;
    // Resolve either way so the editor never waits on a font that will not come
    link.onload = () => resolve();
    link.onerror = () => {
      loadedFontStyles.delete(href);
      resolve();
    };
    link.href = href;
    document.head.appendChild(link);
  });
}

/**
 * Loads only the letters of `text` in a font, for previews: a few kilobytes
 * instead of the whole font file. Fontshare has no such option, so its fonts
 * are loaded whole.
 */
export function loadFontSubset(family: string, text: string, weight = 400, italic = false): void {
  if (typeof document === "undefined" || !family) {
    return;
  }

  const href = fontStylesheetUrl(family, [weight], italic, text);
  if (loadedFontPreviews.has(href)) {
    return;
  }
  loadedFontPreviews.add(href);

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.dataset.falconFontPreview = family;
  link.href = href;
  document.head.appendChild(link);
}

/** Loads just enough of a font to show its name and a sample in the font list */
export function loadFontPreview(family: string): void {
  loadFontSubset(family, `${family} Ag123`);
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