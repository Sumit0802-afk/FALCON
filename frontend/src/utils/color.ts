/** Curated starter palette shown in the color picker. */
export const SWATCHES: string[] = [
  "#1A1A1A",
  "#FFFFFF",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#0EA5E9",
  "#6366F1",
  "#A855F7",
  "#EC4899",
];

/** Adds an alpha channel to a hex color, e.g. withAlpha('#000000', 0.5) */
export function withAlpha(hex: string, alpha: number): string {
  const clamped = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
  return `${hex}${clamped.toString(16).padStart(2, "0")}`;
}

/** Picks readable text color (black/white) for a given background hex. */
export function getContrastText(backgroundHex: string): "#000000" | "#FFFFFF" {
  const hex = backgroundHex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#000000" : "#FFFFFF";
}
