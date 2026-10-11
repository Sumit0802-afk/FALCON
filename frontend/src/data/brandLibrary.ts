/**
 * The Brand Kit's library: ready-made colour palettes and font pairings.
 *
 * Neither list is written out by hand. Palettes are worked out from a hue, a
 * colour scheme and a mood; pairings from the most used families in the font
 * catalogue. Both are built the first time they are asked for.
 */

import { GOOGLE_FONTS_CATALOG, FontCategory } from "@/data/googleFonts";

/**
 * The same items in an order that mixes them, so the first screenful shows the range
 * of the library instead of forty near-identical neighbours. The order is the same every time.
 */
function mixed<T>(items: T[]): T[] {
  const n = items.length;
  // A step that shares no factor with the length visits every item once
  let step = Math.max(1, Math.floor(n * 0.382)) | 1;
  const shares = (a: number, b: number): number => (b ? shares(b, a % b) : a);
  while (shares(step, n) !== 1) step += 2;
  return items.map((_, i) => items[(i * step) % n]);
}

// ─── Colour ───────────────────────────────────────────────────────────────────

function hex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.max(0, Math.min(100, s)) / 100;
  const lig = Math.max(0, Math.min(100, l)) / 100;
  const a = sat * Math.min(lig, 1 - lig);
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12;
    return Math.round(255 * (lig - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, "0");
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

/** One name for every fifth degree round the colour wheel, starting at red */
const HUE_NAMES = [
  "Scarlet", "Vermilion", "Poppy", "Tomato", "Coral", "Persimmon",
  "Tangerine", "Pumpkin", "Marigold", "Amber", "Saffron", "Honey",
  "Sunflower", "Lemon", "Citron", "Chartreuse", "Pear", "Lime",
  "Spring", "Apple", "Leaf", "Fern", "Clover", "Grass",
  "Emerald", "Jade", "Shamrock", "Malachite", "Mint", "Seafoam",
  "Aquamarine", "Spearmint", "Pine", "Viridian", "Turquoise", "Lagoon",
  "Aqua", "Teal", "Cyan", "Pacific", "Cerulean", "Azure",
  "Sky", "Cornflower", "Cobalt", "Sapphire", "Royal", "Ultramarine",
  "Indigo", "Iris", "Periwinkle", "Violet", "Amethyst", "Grape",
  "Purple", "Orchid", "Plum", "Mulberry", "Magenta", "Fuchsia",
  "Mauve", "Heliotrope", "Peony", "Hot Pink", "Raspberry", "Cerise",
  "Rose", "Blush", "Carmine", "Ruby", "Cherry", "Crimson",
];

/** The twelve parts of the wheel a palette can be looked for by, with a colour to show each */
export const COLOR_FAMILIES = ["Red", "Orange", "Yellow", "Lime", "Green", "Mint", "Cyan", "Sky", "Blue", "Violet", "Magenta", "Rose"].map((name, i) => ({ name, swatch: hex(i * 30, 75, 52) }));

interface Mood {
  name: string;
  /** Saturation and lightness of the main colour */
  s: number;
  l: number;
  /** How far the second colour is darkened, and the accent's saturation */
  drop: number;
  accent: number;
}

const MOODS: Mood[] = [
  { name: "Vivid", s: 80, l: 50, drop: 18, accent: 88 },
  { name: "Bold", s: 92, l: 44, drop: 16, accent: 95 },
  { name: "Neon", s: 100, l: 55, drop: 30, accent: 100 },
  { name: "Fresh", s: 68, l: 58, drop: 22, accent: 78 },
  { name: "Pastel", s: 62, l: 78, drop: 34, accent: 70 },
  { name: "Soft", s: 42, l: 68, drop: 28, accent: 55 },
  { name: "Muted", s: 28, l: 50, drop: 18, accent: 42 },
  { name: "Vintage", s: 36, l: 56, drop: 22, accent: 50 },
  { name: "Earthy", s: 42, l: 40, drop: 14, accent: 52 },
  { name: "Corporate", s: 58, l: 40, drop: 16, accent: 70 },
  { name: "Deep", s: 62, l: 28, drop: 10, accent: 76 },
  { name: "Luxury", s: 34, l: 24, drop: 8, accent: 58 },
];
export const PALETTE_MOODS = MOODS.map((mood) => mood.name);

/** Hue of the second colour and of the accent, measured from the main one */
const SCHEMES: { name: string; second: number; accent: number }[] = [
  { name: "Monochrome", second: 0, accent: 0 },
  { name: "Analogous", second: 30, accent: -30 },
  { name: "Complementary", second: 0, accent: 180 },
  { name: "Split complementary", second: 150, accent: 210 },
  { name: "Triadic", second: 120, accent: 240 },
  { name: "Tetradic", second: 90, accent: 180 },
];
export const PALETTE_SCHEMES = SCHEMES.map((scheme) => scheme.name);

export interface LibraryPalette {
  id: string;
  name: string;
  mood: string;
  scheme: string;
  family: string;
  /** Primary, secondary, accent, a light tint and a dark shade */
  colors: { label: string; value: string; type: "primary" | "secondary" | "accent" | "custom" }[];
}

let palettes: LibraryPalette[] | null = null;

export function libraryPalettes(): LibraryPalette[] {
  if (palettes) return palettes;
  const out: LibraryPalette[] = [];
  for (const mood of MOODS) {
    for (let step = 0; step < HUE_NAMES.length; step++) {
      const hue = step * 5;
      for (const scheme of SCHEMES) {
        const mono = scheme.name === "Monochrome";
        const name = `${mood.name} ${HUE_NAMES[step]}`;
        out.push({
          id: `${mood.name}-${step}-${scheme.name}`.toLowerCase().replace(/\s+/g, "-"),
          name,
          mood: mood.name,
          scheme: scheme.name,
          family: COLOR_FAMILIES[Math.floor((((hue + 15) % 360) / 30))].name,
          colors: [
            { label: `${name}`, value: hex(hue, mood.s, mood.l), type: "primary" },
            { label: `${name} Second`, value: hex(hue + scheme.second, mood.s - (mono ? 6 : 10), Math.max(12, mood.l - mood.drop)), type: "secondary" },
            { label: `${name} Accent`, value: mono ? hex(hue, mood.accent, Math.min(84, mood.l + 22)) : hex(hue + scheme.accent, mood.accent, Math.max(46, Math.min(62, mood.l + 6))), type: "accent" },
            { label: `${name} Light`, value: hex(hue, Math.min(40, mood.s), 95), type: "custom" },
            { label: `${name} Dark`, value: hex(hue + scheme.second, Math.min(38, mood.s), 11), type: "custom" },
          ],
        });
      }
    }
  }
  palettes = mixed(out);
  return palettes;
}

// ─── Type ─────────────────────────────────────────────────────────────────────

export interface LibraryPairing {
  id: string;
  heading: string;
  headingWeight: number;
  body: string;
  bodyWeight: number;
  /** What kind of face the heading is set in */
  style: string;
}

const STYLE_OF: Record<FontCategory, string> = { "sans-serif": "Modern", serif: "Classic", display: "Display", handwriting: "Script", monospace: "Technical" };
export const PAIRING_STYLES = ["Modern", "Classic", "Display", "Script", "Technical"];

/** Families made for other writing systems, or for symbols, which would mislead as a Latin brand font */
const NOT_LATIN = /\b(Noto|Nanum|Sawarabi|Zen|Kosugi|Shippori|Yuji|M PLUS|JP|KR|SC|TC|HK|Arabic|Hebrew|Thai|Khmer|Lao|Tamil|Telugu|Bengali|Devanagari|Gujarati|Gurmukhi|Kannada|Malayalam|Sinhala|Myanmar|Armenian|Georgian|Ethiopic|Icons?|Symbols?|Emoji|Barcode|Math)\b|Material/i;

const nearest = (weights: string[], wanted: number) => {
  const have = weights.map(Number).filter((n) => n >= 100);
  return have.length ? have.reduce((best, w) => (Math.abs(w - wanted) < Math.abs(best - wanted) ? w : best)) : wanted;
};

let pairings: LibraryPairing[] | null = null;

export function libraryPairings(): LibraryPairing[] {
  if (pairings) return pairings;
  // The catalogue is in order of use, so the first of each kind are the best known
  const usable = GOOGLE_FONTS_CATALOG.filter((font) => !NOT_LATIN.test(font.family) && font.variants.includes("400"));
  const top = (category: FontCategory, count: number) => usable.filter((font) => font.category === category).slice(0, count);
  const headings = [...top("sans-serif", 26), ...top("serif", 26), ...top("display", 26), ...top("handwriting", 14), ...top("monospace", 8)];
  const bodies = [...top("sans-serif", 36), ...top("serif", 12)];
  const out: LibraryPairing[] = [];
  for (const heading of headings) {
    for (const body of bodies) {
      if (heading.family === body.family) continue;
      out.push({
        id: `${heading.family}+${body.family}`,
        heading: heading.family,
        headingWeight: nearest(heading.variants, heading.category === "handwriting" || heading.category === "display" ? 400 : 700),
        body: body.family,
        bodyWeight: 400,
        style: STYLE_OF[heading.category],
      });
    }
  }
  pairings = mixed(out);
  return pairings;
}
