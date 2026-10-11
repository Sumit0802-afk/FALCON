// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Asset Engine – SVG Utilities
// ─────────────────────────────────────────────────────────────────────────────

/** Encode SVG string as a data URI */
export function svgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

/** Linear gradient stop string */
export function linearGrad(id: string, c1: string, c2: string, angle = 135): string {
  const rad = (angle * Math.PI) / 180;
  const x2 = (50 + 50 * Math.cos(rad)).toFixed(1);
  const y2 = (50 + 50 * Math.sin(rad)).toFixed(1);
  return `<linearGradient id="${id}" x1="0%" y1="0%" x2="${x2}%" y2="${y2}%">
    <stop offset="0%" stop-color="${c1}"/>
    <stop offset="100%" stop-color="${c2}"/>
  </linearGradient>`;
}

/** Radial gradient stop string */
export function radialGrad(id: string, c1: string, c2: string, cx = 35, cy = 30): string {
  return `<radialGradient id="${id}" cx="${cx}%" cy="${cy}%" r="70%">
    <stop offset="0%" stop-color="${c1}"/>
    <stop offset="100%" stop-color="${c2}"/>
  </radialGradient>`;
}

/** Glass-morphism filter */
export const GLASS_FILTER = `<filter id="blur-f" x="-20%" y="-20%" width="140%" height="140%">
  <feGaussianBlur in="SourceGraphic" stdDeviation="6"/>
</filter>`;

/** Glow filter */
export function glowFilter(id: string, color: string, stdDev = 4): string {
  return `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="${stdDev}" result="blur"/>
    <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0" result="glow"/>
    <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
}

/** Drop shadow filter */
export function dropShadow(id: string, dx = 2, dy = 4, blur = 6, opacity = 0.3): string {
  return `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="${dx}" dy="${dy}" stdDeviation="${blur}" flood-opacity="${opacity}"/>
  </filter>`;
}

/** Generates a polygon points string for an n-sided star */
export function starPoints(n: number, cx: number, cy: number, outerR: number, innerR: number): string {
  const points: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const angle = (i * Math.PI) / n - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    points.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
  }
  return points.join(" ");
}

/** Generates regular polygon points string */
export function polyPoints(n: number, cx: number, cy: number, r: number, rotation = 0): string {
  const points: string[] = [];
  for (let i = 0; i < n; i++) {
    const angle = (i * 2 * Math.PI) / n + (rotation * Math.PI) / 180 - Math.PI / 2;
    points.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
  }
  return points.join(" ");
}

/** Wrap content in a standard SVG element */
export function wrapSvg(content: string, w = 200, h = 200, extra = ""): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" ${extra}>${content}</svg>`;
}

/** Convert hex to rgb components */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/** Lighten a hex color by a factor (0-1) */
export function lighten(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (v: number) => Math.min(255, Math.round(v + (255 - v) * factor));
  return `#${[clamp(r), clamp(g), clamp(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** Darken a hex color by a factor (0-1) */
export function darken(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (v: number) => Math.max(0, Math.round(v * (1 - factor)));
  return `#${[clamp(r), clamp(g), clamp(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}
