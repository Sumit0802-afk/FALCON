/**
 * Visual systems the template generator draws from: colour palettes and
 * typography pairings. Fonts are limited to stacks that exist on virtually
 * every mail client, each ending in a generic fallback.
 */

export interface Palette {
  key: string;
  name: string;
  family: string;
  mode: "light" | "dark";
  /** Area around the email */
  page: string;
  /** Email body background */
  surface: string;
  /** Alternate band background */
  alt: string;
  /** Headings */
  ink: string;
  /** Body copy */
  body: string;
  muted: string;
  accent: string;
  onAccent: string;
  /** Strong contrast band (hero, CTA, footer) */
  deep: string;
  onDeep: string;
  line: string;
  /** Three colours used for generated artwork */
  art: [string, string, string];
}

export const PALETTES: Palette[] = [
  { key: "ink", name: "Ink & Paper", family: "neutral", mode: "light", page: "#eef0f2", surface: "#ffffff", alt: "#f5f6f7", ink: "#111418", body: "#3d4651", muted: "#7a8491", accent: "#111418", onAccent: "#ffffff", deep: "#111418", onDeep: "#f5f6f7", line: "#e1e4e8", art: ["#1f2933", "#52606d", "#cbd2d9"] },
  { key: "cobalt", name: "Cobalt", family: "blue", mode: "light", page: "#e9eefb", surface: "#ffffff", alt: "#f1f5fe", ink: "#0f1f4b", body: "#3b4a6b", muted: "#7c89a6", accent: "#2451e6", onAccent: "#ffffff", deep: "#0f1f4b", onDeep: "#e9eefb", line: "#dbe3f5", art: ["#2451e6", "#6d8cf5", "#c9d6fd"] },
  { key: "emerald", name: "Emerald Grove", family: "green", mode: "light", page: "#e8f3ee", surface: "#ffffff", alt: "#f0f8f4", ink: "#0b3b2c", body: "#35584b", muted: "#74917f", accent: "#0f8a5f", onAccent: "#ffffff", deep: "#0b3b2c", onDeep: "#e8f3ee", line: "#d5e8de", art: ["#0f8a5f", "#4fc59a", "#c8efdd"] },
  { key: "coral", name: "Coral Sunset", family: "red", mode: "light", page: "#fdeeea", surface: "#ffffff", alt: "#fff5f2", ink: "#3b1410", body: "#6b3a34", muted: "#a37871", accent: "#f0543c", onAccent: "#ffffff", deep: "#3b1410", onDeep: "#fdeeea", line: "#f7d9d2", art: ["#f0543c", "#f9a05a", "#fde0c8"] },
  { key: "saffron", name: "Saffron", family: "orange", mode: "light", page: "#fdf3e1", surface: "#fffdf8", alt: "#fff6e3", ink: "#3a2406", body: "#6a4a1c", muted: "#a08557", accent: "#e8890c", onAccent: "#221300", deep: "#4a2c05", onDeep: "#fdf3e1", line: "#f3e1bd", art: ["#e8890c", "#f6c445", "#b83b1d"] },
  { key: "plum", name: "Plum Velvet", family: "purple", mode: "light", page: "#f1eaf6", surface: "#ffffff", alt: "#f7f1fb", ink: "#2c1140", body: "#55396a", muted: "#8f7a9e", accent: "#7b2fbe", onAccent: "#ffffff", deep: "#2c1140", onDeep: "#f1eaf6", line: "#e4d7ee", art: ["#7b2fbe", "#c264d6", "#f0d3f7"] },
  { key: "rose", name: "Rosewater", family: "pink", mode: "light", page: "#fbeaef", surface: "#ffffff", alt: "#fdf3f6", ink: "#451225", body: "#703a4d", muted: "#a87f8d", accent: "#d6336c", onAccent: "#ffffff", deep: "#451225", onDeep: "#fbeaef", line: "#f4d6df", art: ["#d6336c", "#f78fb3", "#fddbe6"] },
  { key: "teal", name: "Lagoon", family: "teal", mode: "light", page: "#e4f3f4", surface: "#ffffff", alt: "#eef9f9", ink: "#083a40", body: "#31595d", muted: "#739396", accent: "#0b8f9c", onAccent: "#ffffff", deep: "#083a40", onDeep: "#e4f3f4", line: "#d0e8ea", art: ["#0b8f9c", "#48c6cf", "#c5eef0"] },
  { key: "sand", name: "Desert Sand", family: "beige", mode: "light", page: "#f3ede3", surface: "#fbf8f2", alt: "#f3ede3", ink: "#2e2618", body: "#5a4f3b", muted: "#94896f", accent: "#a6672d", onAccent: "#ffffff", deep: "#2e2618", onDeep: "#f3ede3", line: "#e5dccb", art: ["#a6672d", "#d9a05b", "#efe0c4"] },
  { key: "slate", name: "Slate Mist", family: "gray", mode: "light", page: "#e9edf1", surface: "#ffffff", alt: "#f3f5f8", ink: "#1e293b", body: "#475569", muted: "#8494a8", accent: "#475569", onAccent: "#ffffff", deep: "#1e293b", onDeep: "#e9edf1", line: "#dde3ea", art: ["#475569", "#94a3b8", "#e2e8f0"] },
  { key: "citrus", name: "Citrus Pop", family: "yellow", mode: "light", page: "#fbf7d9", surface: "#fffef5", alt: "#fdf9d4", ink: "#2b2a05", body: "#55531f", muted: "#8f8c4f", accent: "#d9c800", onAccent: "#1c1b00", deep: "#2b2a05", onDeep: "#fbf7d9", line: "#eee9a8", art: ["#f4e409", "#8fd14f", "#ff8c42"] },
  { key: "sky", name: "Open Sky", family: "blue", mode: "light", page: "#e3f2fd", surface: "#ffffff", alt: "#eef7fe", ink: "#0a2e4d", body: "#345672", muted: "#7895ab", accent: "#0c8ce9", onAccent: "#ffffff", deep: "#0a2e4d", onDeep: "#e3f2fd", line: "#cfe6f8", art: ["#0c8ce9", "#6cc4f5", "#d6effd"] },
  { key: "forest", name: "Night Forest", family: "green", mode: "dark", page: "#07140f", surface: "#0d2019", alt: "#132b22", ink: "#eaf7f0", body: "#b4cfc2", muted: "#7d9a8c", accent: "#5fe0a2", onAccent: "#04130c", deep: "#04100b", onDeep: "#d7efe3", line: "#1f3d31", art: ["#0d3b2a", "#1f7a56", "#5fe0a2"] },
  { key: "midnight", name: "Midnight", family: "navy", mode: "dark", page: "#070b18", surface: "#0e1528", alt: "#141d36", ink: "#eef2ff", body: "#b6c0db", muted: "#7b88a8", accent: "#6ea8ff", onAccent: "#04102a", deep: "#050915", onDeep: "#dbe4fb", line: "#222d4d", art: ["#16224a", "#2f55b8", "#6ea8ff"] },
  { key: "onyx", name: "Onyx Gold", family: "black", mode: "dark", page: "#0a0a0a", surface: "#141312", alt: "#1c1b19", ink: "#f8f3e6", body: "#c8c1b0", muted: "#8f8876", accent: "#d4af37", onAccent: "#1a1403", deep: "#050505", onDeep: "#efe8d6", line: "#2c2a25", art: ["#1c1a14", "#7a6220", "#d4af37"] },
  { key: "aubergine", name: "Aubergine", family: "purple", mode: "dark", page: "#120818", surface: "#1c0f26", alt: "#261535", ink: "#f6eefb", body: "#cbb9d8", muted: "#9580a5", accent: "#e08bff", onAccent: "#1f0730", deep: "#0c0511", onDeep: "#ead9f4", line: "#352046", art: ["#3a1657", "#8b3fc4", "#e08bff"] },
  { key: "ember", name: "Ember", family: "red", mode: "dark", page: "#150706", surface: "#1f0d0b", alt: "#2b1310", ink: "#fff1ec", body: "#dcbdb5", muted: "#a5827a", accent: "#ff6a3d", onAccent: "#2a0a02", deep: "#0d0403", onDeep: "#f5dcd4", line: "#3d1d18", art: ["#5a140b", "#c8341a", "#ff9a5a"] },
  { key: "mint", name: "Fresh Mint", family: "green", mode: "light", page: "#e6f7f1", surface: "#ffffff", alt: "#effbf6", ink: "#10362b", body: "#3b6154", muted: "#7ea093", accent: "#17b890", onAccent: "#04241b", deep: "#10362b", onDeep: "#e6f7f1", line: "#cfeee3", art: ["#17b890", "#7be0c3", "#fff3b0"] },
  { key: "clay", name: "Terracotta", family: "brown", mode: "light", page: "#f6e9e2", surface: "#fffaf7", alt: "#f9efe9", ink: "#3d1d10", body: "#69412f", muted: "#a17f6f", accent: "#c0502a", onAccent: "#ffffff", deep: "#3d1d10", onDeep: "#f6e9e2", line: "#ecd7cc", art: ["#c0502a", "#e39a6b", "#f4dccb"] },
  { key: "arctic", name: "Arctic", family: "blue", mode: "light", page: "#edf3f7", surface: "#ffffff", alt: "#f4f8fb", ink: "#14303f", body: "#3f5a69", muted: "#8399a6", accent: "#2f7ea1", onAccent: "#ffffff", deep: "#14303f", onDeep: "#edf3f7", line: "#d9e5ec", art: ["#2f7ea1", "#8fc4d9", "#e3f1f7"] },
];

export interface FontPair {
  key: string;
  name: string;
  style: string;
  heading: string;
  body: string;
  /** Scales heading sizes: display faces want more room than compact sans */
  scale: number;
  upper: boolean;
  spacing: number;
}

const ARIAL = "Arial, Helvetica, sans-serif";
const HELV = "Helvetica, Arial, sans-serif";
const VERDANA = "Verdana, Geneva, sans-serif";
const TAHOMA = "Tahoma, Geneva, sans-serif";
const TREB = "'Trebuchet MS', Tahoma, sans-serif";
const SEGOE = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const GEORGIA = "Georgia, 'Times New Roman', serif";
const TIMES = "'Times New Roman', Times, serif";
const PALATINO = "'Palatino Linotype', Palatino, Georgia, serif";
const GARAMOND = "Garamond, Georgia, serif";
const COURIER = "'Courier New', Courier, monospace";

export const FONT_PAIRS: FontPair[] = [
  { key: "clean-sans", name: "Clean Sans", style: "modern", heading: HELV, body: ARIAL, scale: 1, upper: false, spacing: 0 },
  { key: "classic-serif", name: "Classic Serif", style: "elegant", heading: GEORGIA, body: GEORGIA, scale: 1.02, upper: false, spacing: 0 },
  { key: "editorial", name: "Editorial", style: "editorial", heading: GEORGIA, body: ARIAL, scale: 1.06, upper: false, spacing: 0 },
  { key: "friendly", name: "Friendly Rounded", style: "playful", heading: TREB, body: VERDANA, scale: 0.98, upper: false, spacing: 0 },
  { key: "system", name: "System UI", style: "tech", heading: SEGOE, body: SEGOE, scale: 1, upper: false, spacing: 0 },
  { key: "caps-sans", name: "Bold Caps", style: "bold", heading: ARIAL, body: ARIAL, scale: 0.9, upper: true, spacing: 1.5 },
  { key: "luxe", name: "Luxe Serif", style: "luxury", heading: PALATINO, body: GARAMOND, scale: 1.04, upper: false, spacing: 0.5 },
  { key: "newsprint", name: "Newsprint", style: "editorial", heading: TIMES, body: GEORGIA, scale: 1.08, upper: false, spacing: 0 },
  { key: "mono-tech", name: "Mono Tech", style: "tech", heading: COURIER, body: ARIAL, scale: 0.92, upper: false, spacing: 0 },
  { key: "compact", name: "Compact Tahoma", style: "corporate", heading: TAHOMA, body: TAHOMA, scale: 0.96, upper: false, spacing: 0 },
  { key: "serif-caps", name: "Engraved Caps", style: "luxury", heading: GARAMOND, body: GEORGIA, scale: 0.92, upper: true, spacing: 2.5 },
  { key: "contrast", name: "Sans on Serif", style: "modern", heading: VERDANA, body: GEORGIA, scale: 0.92, upper: false, spacing: 0 },
];
