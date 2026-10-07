/**
 * Shared building blocks for the generated design library (posters and
 * presentations): colour palettes, type pairings, visual styles, text fitting
 * and the element constructors that produce Falcon editor elements.
 *
 * Everything here is deterministic: the same inputs always give the same design,
 * so a template can be rebuilt from its number alone and never needs its full
 * design stored.
 */

// ─── Editor elements ──────────────────────────────────────────────────────────

/** A Falcon canvas element, as the poster editor stores it */
export interface LibElement {
  id: string;
  type: "rectangle" | "ellipse" | "text" | "image" | "frame";
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  hidden: boolean;
  [key: string]: unknown;
}

export interface Background {
  kind: "solid" | "linear" | "radial";
  from: string;
  to: string;
  angle: number;
}

export interface LibPage {
  name: string;
  width: number;
  height: number;
  /** CSS the editor uses for the page background */
  background: string;
  /** The same background in a form the thumbnail renderer can draw */
  backgroundSpec: Background;
  elements: LibElement[];
}

export function backgroundCss(bg: Background): string {
  if (bg.kind === "linear") return `linear-gradient(${bg.angle}deg, ${bg.from} 0%, ${bg.to} 100%)`;
  if (bg.kind === "radial") return `radial-gradient(circle at 50% 35%, ${bg.from} 0%, ${bg.to} 75%)`;
  return bg.from;
}

// ─── Deterministic randomness ─────────────────────────────────────────────────

export type Rng = () => number;

export function rngFrom(seed: number): Rng {
  let a = (seed >>> 0) || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pick<T>(list: readonly T[], n: number): T {
  return list[((n % list.length) + list.length) % list.length];
}

// ─── Colour ───────────────────────────────────────────────────────────────────

export interface Palette {
  id: string;
  name: string;
  family: string;
  mode: "dark" | "light";
  bg: string;
  bg2: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
}

type PaletteRow = [string, string, string, "dark" | "light", string, string, string, string, string, string, string];

// id, name, colour family, mode, bg, bg2, surface, text, muted, accent, accent2
const PALETTE_ROWS: PaletteRow[] = [
  ["midnight-blue", "Midnight Blue", "blue", "dark", "#070B1A", "#101B3D", "#121C36", "#F4F7FF", "#93A0C2", "#3B82F6", "#22D3EE"],
  ["deep-ocean", "Deep Ocean", "blue", "dark", "#04121F", "#0A2A43", "#0E2438", "#EAF6FF", "#8FB0C8", "#38BDF8", "#34D399"],
  ["royal-night", "Royal Night", "purple", "dark", "#0D0720", "#24104F", "#1A1038", "#F6F1FF", "#A99BCB", "#8B5CF6", "#F472B6"],
  ["violet-haze", "Violet Haze", "purple", "dark", "#140A26", "#3B1D6E", "#22133F", "#FBF7FF", "#B9A6DA", "#C084FC", "#38BDF8"],
  ["carbon", "Carbon", "black", "dark", "#0A0A0B", "#1B1B1F", "#161618", "#FAFAFA", "#9A9AA3", "#FFFFFF", "#A1A1AA"],
  ["onyx-gold", "Onyx Gold", "black", "dark", "#0B0A08", "#1F1A10", "#17140E", "#FBF6EA", "#A99F8A", "#D4AF37", "#F5E6B3"],
  ["neon-lime", "Neon Lime", "green", "dark", "#06090A", "#0E1A12", "#0F1613", "#F2FFF4", "#8FA596", "#A3E635", "#22D3EE"],
  ["cyber-pink", "Cyber Pink", "pink", "dark", "#0C0614", "#2A0B3D", "#190C28", "#FFF3FB", "#B79BC4", "#FF2E97", "#22E5FF"],
  ["matrix", "Matrix", "green", "dark", "#030806", "#06200F", "#08160D", "#E8FFEF", "#7FA58B", "#22C55E", "#86EFAC"],
  ["ember", "Ember", "red", "dark", "#120606", "#3A0D0D", "#1E0C0C", "#FFF4F1", "#C19A94", "#EF4444", "#F59E0B"],
  ["sunset-dark", "Sunset Dark", "orange", "dark", "#150A05", "#42190B", "#22110A", "#FFF6EE", "#C3A08C", "#FB923C", "#F472B6"],
  ["forest-night", "Forest Night", "green", "dark", "#06110C", "#113422", "#0C1F16", "#F0FBF4", "#8DB09B", "#34D399", "#FBBF24"],
  ["teal-depth", "Teal Depth", "teal", "dark", "#041314", "#0B3537", "#0A2223", "#EFFFFE", "#87B3B3", "#2DD4BF", "#F472B6"],
  ["graphite", "Graphite", "grey", "dark", "#111315", "#262A2F", "#1B1E22", "#F5F6F7", "#9BA1A9", "#60A5FA", "#F59E0B"],
  ["plum-wine", "Plum Wine", "purple", "dark", "#170813", "#451339", "#260F20", "#FFF2FA", "#C39AB4", "#E879F9", "#FBBF24"],
  ["cocoa", "Cocoa", "brown", "dark", "#150E0A", "#3A2416", "#211610", "#FFF6EC", "#BFA48F", "#D97706", "#FDE68A"],
  ["electric-indigo", "Electric Indigo", "blue", "dark", "#060818", "#1A1F6B", "#101437", "#F3F4FF", "#9CA3D8", "#6366F1", "#A3E635"],
  ["aurora", "Aurora", "multicolor", "dark", "#050B14", "#12324A", "#0C1B2B", "#F0FAFF", "#8BA9BD", "#22D3EE", "#C084FC"],

  ["paper-ink", "Paper & Ink", "white", "light", "#FAFAF7", "#EDEDE6", "#FFFFFF", "#111111", "#6B6B6B", "#111111", "#E11D48"],
  ["snow-blue", "Snow Blue", "blue", "light", "#F5F9FF", "#DCEBFF", "#FFFFFF", "#0B1B3A", "#5B6B88", "#2563EB", "#06B6D4"],
  ["cloud-violet", "Cloud Violet", "purple", "light", "#F8F5FF", "#E7DDFF", "#FFFFFF", "#1E1238", "#6C5F86", "#7C3AED", "#EC4899"],
  ["mint-fresh", "Mint Fresh", "green", "light", "#F2FBF6", "#D5F2E2", "#FFFFFF", "#0B2A1C", "#57756A", "#059669", "#F59E0B"],
  ["peach-cream", "Peach Cream", "orange", "light", "#FFF7F0", "#FFE2CC", "#FFFFFF", "#33170A", "#86695A", "#EA580C", "#DB2777"],
  ["blush", "Blush", "pink", "light", "#FFF5F8", "#FFDCE8", "#FFFFFF", "#3A0E20", "#8A5F6E", "#DB2777", "#7C3AED"],
  ["sand", "Sand", "brown", "light", "#F8F3EA", "#EADFC9", "#FFFDF8", "#2B2116", "#7C6E5C", "#B45309", "#0F766E"],
  ["lemon", "Lemon", "yellow", "light", "#FFFBE8", "#FFF0A8", "#FFFFFF", "#231F05", "#77703D", "#CA8A04", "#1D4ED8"],
  ["sky-teal", "Sky Teal", "teal", "light", "#F0FBFB", "#CDEFEF", "#FFFFFF", "#06282A", "#54777A", "#0D9488", "#F97316"],
  ["stone", "Stone", "grey", "light", "#F4F4F5", "#E0E0E4", "#FFFFFF", "#18181B", "#6B6B76", "#3F3F46", "#2563EB"],
  ["coral-reef", "Coral Reef", "red", "light", "#FFF4F2", "#FFD9D2", "#FFFFFF", "#3B0D08", "#8C635D", "#DC2626", "#0891B2"],
  ["ivory-gold", "Ivory Gold", "yellow", "light", "#FBF8EF", "#F0E6C8", "#FFFEFA", "#1F1A0E", "#7A7058", "#A16207", "#111111"],
  ["lilac-sky", "Lilac Sky", "multicolor", "light", "#F6F4FF", "#DDEBFF", "#FFFFFF", "#151238", "#676489", "#6366F1", "#F43F5E"],
  ["sage", "Sage", "green", "light", "#F3F6F0", "#DCE6D3", "#FFFFFF", "#1A2416", "#687562", "#4D7C0F", "#B45309"],

  ["retro-sun", "Retro Sun", "orange", "light", "#FBEFD5", "#F3D9A4", "#FFF7E3", "#2A1B0F", "#7E6748", "#D9480F", "#1E6F6A"],
  ["retro-teal", "Retro Teal", "teal", "dark", "#12302F", "#1E4A47", "#183B39", "#FBEFD5", "#B4C4B3", "#F2A541", "#EF6B4A"],
  ["vintage-rose", "Vintage Rose", "pink", "light", "#F4E4DC", "#E8C9BC", "#FBF1EA", "#3A2320", "#84655E", "#A8453C", "#3F6C63"],
  ["newsprint", "Newsprint", "grey", "light", "#EFEBE2", "#DDD6C7", "#F8F5EE", "#171512", "#6E685C", "#B91C1C", "#171512"],
  ["brutal-yellow", "Brutal Yellow", "yellow", "light", "#FFE600", "#FFD000", "#FFFFFF", "#0A0A0A", "#3A3A1A", "#0A0A0A", "#FF2E2E"],
  ["brutal-red", "Brutal Red", "red", "light", "#FF3B30", "#E62A20", "#FFFFFF", "#0A0A0A", "#3D1512", "#0A0A0A", "#FFE600"],
  ["brutal-blue", "Brutal Blue", "blue", "light", "#2F5BFF", "#1E3FD8", "#FFFFFF", "#FFFFFF", "#D6DEFF", "#FFE600", "#0A0A0A"],
  ["candy", "Candy", "multicolor", "light", "#FFF0F7", "#E3F1FF", "#FFFFFF", "#22113A", "#74648C", "#F0438D", "#3B82F6"],
  ["emerald-luxe", "Emerald Luxe", "green", "dark", "#06140F", "#0E3326", "#0B2219", "#F6F2E4", "#A5AE9B", "#C9A227", "#34D399"],
  ["burgundy-luxe", "Burgundy Luxe", "red", "dark", "#17070C", "#4A1022", "#260C14", "#FBF1E6", "#BB9CA0", "#D4AF37", "#F87171"],
  ["arctic", "Arctic", "white", "light", "#FFFFFF", "#EEF2F6", "#F7F9FB", "#0F172A", "#64748B", "#0EA5E9", "#0F172A"],
  ["finance-navy", "Finance Navy", "blue", "dark", "#081226", "#12264D", "#0F1D3A", "#F2F6FC", "#94A6C4", "#10B981", "#60A5FA"],
];

export const PALETTES: Palette[] = PALETTE_ROWS.map(([id, name, family, mode, bg, bg2, surface, text, muted, accent, accent2]) => ({
  id, name, family, mode, bg, bg2, surface, text, muted, accent, accent2,
}));

export const PALETTE_BY_ID: Record<string, Palette> = Object.fromEntries(PALETTES.map((p) => [p.id, p]));

function channel(hex: string, index: number): number {
  return parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16);
}

/** Relative luminance of a #rrggbb colour, 0 (black) to 1 (white) */
export function luminance(hex: string): number {
  const lin = [0, 1, 2].map((i) => {
    const c = channel(hex, i) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Black or white, whichever reads better on the given colour */
export function onColor(hex: string): string {
  return contrastRatio(hex, "#0B0B0C") >= contrastRatio(hex, "#FFFFFF") ? "#0B0B0C" : "#FFFFFF";
}

// ─── Type ─────────────────────────────────────────────────────────────────────

export interface FontPair {
  id: string;
  heading: string;
  body: string;
  /** Weight used for headings in this pairing */
  weight: number;
}

export const FONT_PAIRS: FontPair[] = [
  { id: "inter", heading: "Inter", body: "Inter", weight: 800 },
  { id: "poppins", heading: "Poppins", body: "DM Sans", weight: 700 },
  { id: "montserrat", heading: "Montserrat", body: "Inter", weight: 800 },
  { id: "grotesk", heading: "Space Grotesk", body: "Inter", weight: 700 },
  { id: "sora", heading: "Sora", body: "Manrope", weight: 700 },
  { id: "outfit", heading: "Outfit", body: "DM Sans", weight: 700 },
  { id: "bebas", heading: "Bebas Neue", body: "Inter", weight: 400 },
  { id: "oswald", heading: "Oswald", body: "Source Sans 3", weight: 600 },
  { id: "anton", heading: "Anton", body: "DM Sans", weight: 400 },
  { id: "archivo", heading: "Archivo Black", body: "Inter", weight: 400 },
  { id: "playfair", heading: "Playfair Display", body: "Lora", weight: 700 },
  { id: "dm-serif", heading: "DM Serif Display", body: "DM Sans", weight: 400 },
  { id: "cormorant", heading: "Cormorant Garamond", body: "Manrope", weight: 600 },
  { id: "baskerville", heading: "Libre Baskerville", body: "Source Sans 3", weight: 700 },
  { id: "syne", heading: "Syne", body: "Inter", weight: 800 },
  { id: "orbitron", heading: "Orbitron", body: "Rajdhani", weight: 700 },
  { id: "rajdhani", heading: "Rajdhani", body: "Inter", weight: 700 },
  { id: "jetbrains", heading: "JetBrains Mono", body: "JetBrains Mono", weight: 700 },
  { id: "space-mono", heading: "Space Mono", body: "Space Grotesk", weight: 700 },
  { id: "unbounded", heading: "Unbounded", body: "Manrope", weight: 700 },
  { id: "manrope", heading: "Manrope", body: "Manrope", weight: 800 },
  { id: "plex", heading: "IBM Plex Sans", body: "IBM Plex Sans", weight: 700 },
];

export const FONT_BY_ID: Record<string, FontPair> = Object.fromEntries(FONT_PAIRS.map((f) => [f.id, f]));

/**
 * How wide each family sets compared with a typical sans, used to estimate line
 * widths. Checked against the real fonts in a browser: an estimate that comes
 * out narrow makes the editor wrap a line the design meant to keep whole.
 */
const FAMILY_WIDTH: Record<string, number> = {
  "Bebas Neue": 0.74, Oswald: 0.82, Anton: 0.84, Rajdhani: 0.86, "Cormorant Garamond": 0.97,
  "Archivo Black": 1.12, Unbounded: 1.28, Orbitron: 1.2, Syne: 1.6, Montserrat: 1.08, Poppins: 1.06, Sora: 1.08,
  "JetBrains Mono": 1.14, "Space Mono": 1.16, "Playfair Display": 1.0, "DM Serif Display": 0.98,
  "Libre Baskerville": 1.13, Lora: 1.02, "Dancing Script": 0.84,
};

const MONO = new Set(["JetBrains Mono", "Space Mono"]);

function charUnits(ch: string): number {
  if (ch === " ") return 0.3;
  if ("iljtfI.,:;'!|()[]".includes(ch)) return 0.34;
  if ("mwMW@%".includes(ch)) return 0.92;
  if (ch >= "A" && ch <= "Z") return 0.7;
  if (ch >= "0" && ch <= "9") return 0.6;
  return 0.56;
}

/**
 * Estimated width of one line of text. It leans slightly wide on purpose, so a
 * line that is judged to fit will also fit once a real font renders it.
 */
export function textWidth(text: string, size: number, family: string, weight = 400, spacing = 0): number {
  let units = 0;
  if (MONO.has(family)) units = text.length * 0.62;
  else for (const ch of text) units += charUnits(ch);
  const factor = (FAMILY_WIDTH[family] ?? 1) * (weight >= 700 ? 1.06 : 1) * 1.04;
  return units * size * factor + Math.max(0, text.length - 1) * spacing;
}

export function wrapText(text: string, maxWidth: number, size: number, family: string, weight = 400, spacing = 0): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (line && textWidth(next, size, family, weight, spacing) > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    lines.push(line);
  }
  return lines;
}

export interface Fit {
  size: number;
  lines: string[];
}

/** The largest size at which the text fits the width in at most `maxLines` lines */
export function fitText(
  text: string, maxWidth: number, family: string, weight: number,
  opts: { max: number; min: number; maxLines: number; spacing?: number }
): Fit {
  const spacingRatio = opts.spacing ?? 0;
  let size = opts.max;
  for (let i = 0; i < 40; i++) {
    const lines = wrapText(text, maxWidth, size, family, weight, size * spacingRatio);
    const widest = Math.max(...lines.map((l) => textWidth(l, size, family, weight, size * spacingRatio)));
    if ((lines.length <= opts.maxLines && widest <= maxWidth) || size <= opts.min) return { size: Math.round(size), lines };
    size = Math.max(opts.min, size * 0.93);
  }
  return { size: Math.round(size), lines: wrapText(text, maxWidth, size, family, weight, size * spacingRatio) };
}

// ─── Element constructors ─────────────────────────────────────────────────────

/**
 * Outlines of the editor's photo frames on a 100 x 100 grid. They match the
 * editor's own frame shapes, so a preview clips a photo exactly as the editor will.
 */
export const FRAME_PATHS = {
  circle: "M 50, 0 A 50, 50 0 1, 1 50, 100 A 50, 50 0 1, 1 50, 0 Z",
  "rounded-rect": "M 16,0 L 84,0 A 16,16 0 0 1 100,16 L 100,84 A 16,16 0 0 1 84,100 L 16,100 A 16,16 0 0 1 0,84 L 0,16 A 16,16 0 0 1 16,0 Z",
  arch: "M 0,50 A 50,50 0 0 1 100,50 L 100,100 L 0,100 Z",
  hexagon: "M 50,0 L 93,25 L 93,75 L 50,100 L 7,75 L 7,25 Z",
  pill: "M 25,0 L 75,0 C 89,0 100,11 100,25 L 100,75 C 100,89 89,100 75,100 L 25,100 C 11,100 0,89 0,75 L 0,25 C 0,11 11,0 25,0 Z",
  parallelogram: "M 20,0 L 100,0 L 80,100 L 0,100 Z",
} as const;

export type FrameShape = keyof typeof FRAME_PATHS;

/** Collects the elements of one page and numbers them in drawing order */
export class Sheet {
  readonly elements: LibElement[] = [];
  constructor(private readonly prefix: string) {}

  private add(el: { type: LibElement["type"]; x: number; y: number; width: number; height: number; rotation?: number; opacity?: number; [key: string]: unknown }): LibElement {
    const index = this.elements.length;
    const full: LibElement = {
      rotation: 0, opacity: 1, ...el,
      id: `${this.prefix}-${index}`, zIndex: index, locked: false, hidden: false,
      x: Math.round(el.x), y: Math.round(el.y), width: Math.max(1, Math.round(el.width)), height: Math.max(1, Math.round(el.height)),
    } as LibElement;
    this.elements.push(full);
    return full;
  }

  rect(x: number, y: number, w: number, h: number, fill: string, o: { radius?: number; stroke?: string; strokeWidth?: number; opacity?: number; rotation?: number } = {}) {
    return this.add({
      type: "rectangle", x, y, width: w, height: h, fill, stroke: o.stroke ?? "transparent", strokeWidth: o.strokeWidth ?? 0,
      cornerRadius: Math.round(o.radius ?? 0), opacity: o.opacity, rotation: o.rotation,
    });
  }

  ellipse(x: number, y: number, w: number, h: number, fill: string, o: { stroke?: string; strokeWidth?: number; opacity?: number } = {}) {
    return this.add({ type: "ellipse", x, y, width: w, height: h, fill, stroke: o.stroke ?? "transparent", strokeWidth: o.strokeWidth ?? 0, opacity: o.opacity });
  }

  image(x: number, y: number, w: number, h: number, src: string, o: { opacity?: number } = {}) {
    return this.add({ type: "image", x, y, width: w, height: h, src, naturalWidth: Math.round(w), naturalHeight: Math.round(h), filter: "none", opacity: o.opacity });
  }

  /** A photo clipped to one of the editor's frame shapes; the user can swap or reposition the photo */
  frame(x: number, y: number, w: number, h: number, shape: FrameShape, src: string, o: { stroke?: string; strokeWidth?: number; opacity?: number } = {}) {
    return this.add({
      type: "frame", x, y, width: w, height: h, frameShape: shape, imageSrc: src,
      imageNaturalWidth: Math.round(w), imageNaturalHeight: Math.round(h), imageZoom: 1, imageOffsetX: 0, imageOffsetY: 0,
      stroke: o.stroke ?? "transparent", strokeWidth: o.strokeWidth ?? 0, opacity: o.opacity,
    });
  }

  /**
   * Text already broken into the lines it should show on, so it looks the same
   * in the editor, in thumbnails and in exports. Returns the element; its
   * height is the space the lines take.
   */
  text(
    x: number, y: number, w: number, lines: string[] | string, size: number,
    o: { family: string; weight?: number; color: string; align?: "left" | "center" | "right"; lineHeight?: number; spacing?: number; italic?: boolean; opacity?: number; rotation?: number }
  ) {
    const list = Array.isArray(lines) ? lines : [lines];
    const lineHeight = o.lineHeight ?? 1.2;
    return this.add({
      type: "text", x, y, width: w, height: Math.ceil(list.length * size * lineHeight),
      text: list.join("\n"), fontFamily: o.family, fontSize: Math.round(size), fontWeight: o.weight ?? 400, color: o.color,
      align: o.align ?? "left", lineHeight, letterSpacing: Math.round((o.spacing ?? 0) * 10) / 10, italic: o.italic ?? false,
      opacity: o.opacity, rotation: o.rotation,
    });
  }
}

// ─── Visual styles ────────────────────────────────────────────────────────────

export type DecorationId =
  | "none" | "rings" | "dots" | "grid" | "blobs" | "stripes" | "corners" | "frame" | "bars" | "halo" | "confetti" | "scan" | "cross";

export interface StyleDef {
  id: string;
  name: string;
  palettes: string[];
  fonts: string[];
  decorations: DecorationId[];
  backgrounds: Background["kind"][];
  /** Corner radius as a share of the design's base unit */
  radius: number;
  /** Headings set in capitals */
  caps: boolean;
  /** Letter spacing of small labels, as a share of their size */
  tracking: number;
}

export const STYLES: StyleDef[] = [
  { id: "minimal", name: "Minimal", palettes: ["paper-ink", "arctic", "stone", "carbon", "sand", "sage"], fonts: ["inter", "manrope", "plex", "outfit"], decorations: ["none", "frame", "cross"], backgrounds: ["solid"], radius: 0.4, caps: false, tracking: 0.18 },
  { id: "modern", name: "Modern", palettes: ["snow-blue", "midnight-blue", "cloud-violet", "mint-fresh", "graphite", "lilac-sky"], fonts: ["sora", "outfit", "poppins", "grotesk"], decorations: ["blobs", "rings", "dots", "halo"], backgrounds: ["solid", "linear"], radius: 1.6, caps: false, tracking: 0.14 },
  { id: "premium", name: "Premium", palettes: ["onyx-gold", "carbon", "emerald-luxe", "ivory-gold", "burgundy-luxe", "graphite"], fonts: ["dm-serif", "playfair", "manrope", "cormorant"], decorations: ["frame", "rings", "none", "corners"], backgrounds: ["solid", "radial"], radius: 0.3, caps: false, tracking: 0.3 },
  { id: "corporate", name: "Corporate", palettes: ["snow-blue", "finance-navy", "arctic", "stone", "midnight-blue", "sky-teal"], fonts: ["plex", "inter", "montserrat", "manrope"], decorations: ["grid", "corners", "none", "bars"], backgrounds: ["solid", "linear"], radius: 0.6, caps: false, tracking: 0.16 },
  { id: "futuristic", name: "Futuristic", palettes: ["electric-indigo", "aurora", "deep-ocean", "midnight-blue", "teal-depth", "violet-haze"], fonts: ["orbitron", "grotesk", "rajdhani", "unbounded"], decorations: ["grid", "rings", "scan", "halo"], backgrounds: ["linear", "radial"], radius: 0.8, caps: true, tracking: 0.3 },
  { id: "cyberpunk", name: "Cyberpunk", palettes: ["cyber-pink", "neon-lime", "electric-indigo", "matrix", "violet-haze", "aurora"], fonts: ["orbitron", "rajdhani", "space-mono", "unbounded"], decorations: ["scan", "grid", "stripes", "cross"], backgrounds: ["linear", "solid"], radius: 0, caps: true, tracking: 0.28 },
  { id: "3d", name: "3D", palettes: ["candy", "lilac-sky", "cloud-violet", "snow-blue", "royal-night", "peach-cream"], fonts: ["unbounded", "poppins", "sora", "outfit"], decorations: ["blobs", "halo", "rings", "confetti"], backgrounds: ["linear", "radial"], radius: 3, caps: false, tracking: 0.12 },
  { id: "glassmorphism", name: "Glassmorphism", palettes: ["aurora", "violet-haze", "deep-ocean", "royal-night", "lilac-sky", "teal-depth"], fonts: ["sora", "outfit", "manrope", "poppins"], decorations: ["blobs", "halo", "rings"], backgrounds: ["linear", "radial"], radius: 2.4, caps: false, tracking: 0.16 },
  { id: "gradient", name: "Gradient", palettes: ["violet-haze", "sunset-dark", "aurora", "candy", "peach-cream", "electric-indigo"], fonts: ["poppins", "sora", "montserrat", "syne"], decorations: ["blobs", "halo", "dots", "none"], backgrounds: ["linear", "radial"], radius: 1.8, caps: false, tracking: 0.14 },
  { id: "dark", name: "Dark Mode", palettes: ["carbon", "graphite", "midnight-blue", "forest-night", "plum-wine", "cocoa"], fonts: ["inter", "grotesk", "manrope", "sora"], decorations: ["dots", "grid", "none", "rings"], backgrounds: ["solid", "radial"], radius: 1, caps: false, tracking: 0.18 },
  { id: "neon", name: "Neon", palettes: ["neon-lime", "cyber-pink", "matrix", "electric-indigo", "aurora", "royal-night"], fonts: ["bebas", "unbounded", "rajdhani", "syne"], decorations: ["rings", "scan", "stripes", "halo"], backgrounds: ["solid", "radial"], radius: 0.6, caps: true, tracking: 0.26 },
  { id: "editorial", name: "Editorial", palettes: ["newsprint", "paper-ink", "sand", "vintage-rose", "stone", "ivory-gold"], fonts: ["playfair", "baskerville", "dm-serif", "cormorant"], decorations: ["frame", "none", "cross", "corners"], backgrounds: ["solid"], radius: 0, caps: false, tracking: 0.22 },
  { id: "luxury", name: "Luxury", palettes: ["onyx-gold", "burgundy-luxe", "emerald-luxe", "ivory-gold", "plum-wine", "cocoa"], fonts: ["cormorant", "playfair", "dm-serif", "baskerville"], decorations: ["frame", "rings", "corners", "none"], backgrounds: ["solid", "radial"], radius: 0.2, caps: true, tracking: 0.36 },
  { id: "retro", name: "Retro", palettes: ["retro-sun", "retro-teal", "vintage-rose", "lemon", "peach-cream", "sunset-dark"], fonts: ["archivo", "bebas", "oswald", "anton"], decorations: ["stripes", "halo", "rings", "confetti"], backgrounds: ["solid", "linear"], radius: 1.2, caps: true, tracking: 0.2 },
  { id: "vintage", name: "Vintage", palettes: ["vintage-rose", "newsprint", "sand", "retro-sun", "cocoa", "ivory-gold"], fonts: ["baskerville", "playfair", "oswald", "dm-serif"], decorations: ["frame", "corners", "cross", "none"], backgrounds: ["solid"], radius: 0.3, caps: true, tracking: 0.26 },
  { id: "brutalist", name: "Brutalist", palettes: ["brutal-yellow", "brutal-red", "brutal-blue", "paper-ink", "carbon", "newsprint"], fonts: ["archivo", "anton", "space-mono", "bebas"], decorations: ["bars", "cross", "stripes", "none"], backgrounds: ["solid"], radius: 0, caps: true, tracking: 0.1 },
  { id: "abstract", name: "Abstract", palettes: ["candy", "lilac-sky", "sunset-dark", "aurora", "blush", "sky-teal"], fonts: ["syne", "unbounded", "sora", "outfit"], decorations: ["blobs", "confetti", "halo", "rings"], backgrounds: ["solid", "linear"], radius: 2.2, caps: false, tracking: 0.14 },
  { id: "geometric", name: "Geometric", palettes: ["snow-blue", "lemon", "coral-reef", "sky-teal", "graphite", "electric-indigo"], fonts: ["montserrat", "grotesk", "outfit", "syne"], decorations: ["corners", "bars", "grid", "rings"], backgrounds: ["solid"], radius: 0.2, caps: true, tracking: 0.18 },
  { id: "typography", name: "Typography-focused", palettes: ["paper-ink", "carbon", "brutal-yellow", "newsprint", "arctic", "ember"], fonts: ["anton", "bebas", "archivo", "syne"], decorations: ["none", "cross", "bars"], backgrounds: ["solid"], radius: 0, caps: true, tracking: 0.12 },
  { id: "photography", name: "Photography-focused", palettes: ["carbon", "paper-ink", "graphite", "arctic", "sand", "onyx-gold"], fonts: ["inter", "playfair", "manrope", "oswald"], decorations: ["none", "frame", "corners"], backgrounds: ["solid"], radius: 0.6, caps: false, tracking: 0.2 },
  { id: "ai-technology", name: "AI / Technology", palettes: ["electric-indigo", "deep-ocean", "aurora", "midnight-blue", "teal-depth", "snow-blue"], fonts: ["grotesk", "sora", "jetbrains", "orbitron"], decorations: ["grid", "dots", "rings", "halo"], backgrounds: ["linear", "radial"], radius: 1.2, caps: false, tracking: 0.22 },
  { id: "finance", name: "Finance", palettes: ["finance-navy", "emerald-luxe", "arctic", "stone", "forest-night", "snow-blue"], fonts: ["plex", "manrope", "inter", "montserrat"], decorations: ["bars", "grid", "none", "corners"], backgrounds: ["solid", "linear"], radius: 0.6, caps: false, tracking: 0.18 },
  { id: "startup", name: "Startup", palettes: ["cloud-violet", "mint-fresh", "snow-blue", "peach-cream", "royal-night", "lilac-sky"], fonts: ["sora", "poppins", "outfit", "grotesk"], decorations: ["blobs", "dots", "halo", "confetti"], backgrounds: ["solid", "linear"], radius: 2, caps: false, tracking: 0.14 },
  { id: "developer", name: "Developer", palettes: ["matrix", "carbon", "graphite", "deep-ocean", "neon-lime", "midnight-blue"], fonts: ["jetbrains", "space-mono", "grotesk", "plex"], decorations: ["grid", "scan", "dots", "cross"], backgrounds: ["solid"], radius: 0.5, caps: false, tracking: 0.12 },
  { id: "gaming", name: "Gaming", palettes: ["cyber-pink", "ember", "electric-indigo", "neon-lime", "royal-night", "sunset-dark"], fonts: ["unbounded", "orbitron", "anton", "rajdhani"], decorations: ["stripes", "scan", "halo", "bars"], backgrounds: ["linear", "radial"], radius: 0.4, caps: true, tracking: 0.24 },
];

export const STYLE_BY_ID: Record<string, StyleDef> = Object.fromEntries(STYLES.map((s) => [s.id, s]));

// ─── Backgrounds and decoration ───────────────────────────────────────────────

export function makeBackground(kind: Background["kind"], pal: Palette, variant: number): Background {
  if (kind === "linear") return { kind, from: pal.bg, to: pal.bg2, angle: pick([135, 160, 200, 180], variant) };
  if (kind === "radial") return { kind, from: pal.bg2, to: pal.bg, angle: 0 };
  return { kind: "solid", from: variant % 3 === 2 ? pal.bg2 : pal.bg, to: pal.bg, angle: 0 };
}

/**
 * Background ornament for a style. It is drawn first and kept faint, so it adds
 * character without competing with the text placed over it.
 */
export function decorate(sheet: Sheet, id: DecorationId, W: number, H: number, pal: Palette, rng: Rng): void {
  const u = Math.min(W, H) / 100;
  const faint = pal.mode === "dark" ? 0.16 : 0.12;
  switch (id) {
    case "rings": {
      const cx = W * (0.62 + rng() * 0.3);
      const cy = H * (0.08 + rng() * 0.3);
      for (let i = 0; i < 4; i++) {
        const d = u * (34 + i * 22);
        sheet.ellipse(cx - d / 2, cy - d / 2, d, d, "transparent", { stroke: i % 2 ? pal.accent2 : pal.accent, strokeWidth: Math.max(1, Math.round(u * 0.22)), opacity: faint + 0.1 - i * 0.03 });
      }
      break;
    }
    case "dots": {
      const step = u * 5.2;
      const cols = 7;
      const rows = 7;
      const ox = rng() < 0.5 ? W - u * 8 - cols * step : u * 8;
      const oy = rng() < 0.5 ? u * 8 : H - u * 8 - rows * step;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        sheet.ellipse(ox + c * step, oy + r * step, u * 0.9, u * 0.9, pal.accent, { opacity: faint + 0.12 });
      }
      break;
    }
    case "grid": {
      const step = Math.max(W, H) / 12;
      const line = Math.max(1, Math.round(u * 0.12));
      for (let x = step; x < W; x += step) sheet.rect(x, 0, line, H, pal.text, { opacity: 0.06 });
      for (let y = step; y < H; y += step) sheet.rect(0, y, W, line, pal.text, { opacity: 0.06 });
      break;
    }
    case "blobs": {
      const spots: [number, number, number, string][] = [
        [0.82, 0.12, 62, pal.accent], [0.08, 0.86, 54, pal.accent2], [0.9, 0.78, 34, pal.accent2],
      ];
      for (const [fx, fy, d, color] of spots) sheet.ellipse(W * fx - (u * d) / 2, H * fy - (u * d) / 2, u * d, u * d, color, { opacity: faint + 0.06 });
      break;
    }
    case "stripes": {
      const band = u * 3.2;
      for (let i = 0; i < 5; i++) {
        sheet.rect(W * 0.55 + i * band * 2.1, -H * 0.1, band, H * 0.55, i % 2 ? pal.accent2 : pal.accent, { rotation: 28, opacity: faint + 0.1 });
      }
      break;
    }
    case "corners": {
      const s = u * 16;
      sheet.rect(W - s, 0, s, s, pal.accent, { opacity: faint + 0.14 });
      sheet.rect(0, H - s * 0.6, s * 0.6, s * 0.6, pal.accent2, { opacity: faint + 0.14 });
      sheet.rect(W - s * 1.5, 0, s * 0.5, s * 0.5, pal.text, { opacity: 0.1 });
      break;
    }
    case "frame": {
      const inset = u * 4;
      sheet.rect(inset, inset, W - inset * 2, H - inset * 2, "transparent", { stroke: pal.accent, strokeWidth: Math.max(2, Math.round(u * 0.3)), opacity: 0.55 });
      break;
    }
    case "bars": {
      const bw = u * 3;
      const heights = [18, 30, 12, 38, 24, 44, 16];
      heights.forEach((h, i) => sheet.rect(W - u * 8 - (heights.length - i) * bw * 1.5, H - u * 6 - u * h, bw, u * h, i % 3 === 0 ? pal.accent2 : pal.accent, { opacity: faint + 0.14 }));
      break;
    }
    case "halo": {
      const d = Math.min(W, H) * 0.95;
      sheet.ellipse(W * 0.5 - d / 2, H * 0.3 - d / 2, d, d, pal.accent, { opacity: faint * 0.7 });
      sheet.ellipse(W * 0.5 - d * 0.3, H * 0.3 - d * 0.3, d * 0.6, d * 0.6, pal.accent2, { opacity: faint * 0.7 });
      break;
    }
    case "confetti": {
      for (let i = 0; i < 16; i++) {
        const size = u * (1.2 + rng() * 2.4);
        const edge = rng() < 0.5;
        const x = edge ? rng() * W : (rng() < 0.5 ? rng() * W * 0.14 : W - rng() * W * 0.14);
        const y = edge ? (rng() < 0.5 ? rng() * H * 0.12 : H - rng() * H * 0.12) : rng() * H;
        const color = pick([pal.accent, pal.accent2, pal.text], i);
        if (i % 2) sheet.ellipse(x, y, size, size, color, { opacity: 0.55 });
        else sheet.rect(x, y, size, size, color, { rotation: Math.round(rng() * 60), opacity: 0.55 });
      }
      break;
    }
    case "scan": {
      const gap = u * 2.6;
      for (let y = gap; y < H; y += gap * 2) sheet.rect(0, y, W, Math.max(1, Math.round(u * 0.16)), pal.accent, { opacity: 0.07 });
      break;
    }
    case "cross": {
      const arm = u * 3;
      const t = Math.max(2, Math.round(u * 0.3));
      const marks: [number, number][] = [[u * 6, u * 6], [W - u * 6, u * 6], [u * 6, H - u * 6], [W - u * 6, H - u * 6]];
      for (const [x, y] of marks) {
        sheet.rect(x - arm / 2, y - t / 2, arm, t, pal.text, { opacity: 0.5 });
        sheet.rect(x - t / 2, y - arm / 2, t, arm, pal.text, { opacity: 0.5 });
      }
      break;
    }
    default:
      break;
  }
}

export function titleCase(text: string, caps: boolean): string {
  return caps ? text.toUpperCase() : text;
}
