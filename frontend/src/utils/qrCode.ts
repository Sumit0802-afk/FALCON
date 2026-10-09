/**
 * Drawing a QR code for the poster editor, and judging whether it will scan.
 *
 * The code is drawn as an SVG picture, so it stays sharp at any size on the
 * page and in every export. The pattern of dark and light modules is worked
 * out elsewhere (see qrDesign.ts) and handed in as `modules`.
 */

export interface QrSpec {
  /** The text the code holds */
  data: string;
  /** Rows of 0 and 1, separated by "/" */
  modules: string;
  /** square | rounded | dots | circular */
  pattern: string;
  foreground: string;
  /** Second colour for a gradient across the code; "" for one colour */
  foreground2: string;
  background: string;
  /** Clear margin around the code, in modules */
  quietZone: number;
  /** none | solid | rounded | decorative */
  frame: string;
  frameColor: string;
  /** An embedded picture (a data URL); a QR picture cannot load one from the web */
  logoUrl: string;
  /** Width of the logo as a percent of the code */
  logoSize: number;
  caption: string;
  /** above | below */
  captionPosition: string;
  captionColor: string;
}

// ─── Colours ──────────────────────────────────────────────────────────────────

function rgbOf(color: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color ?? "").trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** A colour that is safe to write into the picture: a hex colour, or the fallback */
function color(value: string, fallback: string): string {
  const rgb = rgbOf(value);
  return rgb ? "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("") : fallback;
}

function luminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** How strongly two colours differ, from 1 (the same) to 21 (black on white) */
export function contrastOf(a: string, b: string): number {
  const ra = rgbOf(a);
  const rb = rgbOf(b);
  if (!ra || !rb) return 21;
  const la = luminance(ra);
  const lb = luminance(rb);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function escapeText(value: string): string {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function embedded(value: string): string {
  const url = String(value ?? "").trim();
  return /^data:image\/(png|jpe?g|gif|webp);base64,[a-z0-9+/=]+$/i.test(url) ? url : "";
}

// ─── The grid ─────────────────────────────────────────────────────────────────

/** The stored pattern as rows of booleans, or null when it is missing or not a square grid */
export function qrGrid(modules: string): boolean[][] | null {
  const rows = String(modules ?? "").split("/");
  const n = rows.length;
  if (n < 21 || n > 177) return null;
  const grid: boolean[][] = [];
  for (const row of rows) {
    if (row.length !== n || /[^01]/.test(row)) return null;
    grid.push(row.split("").map((ch) => ch === "1"));
  }
  return grid;
}

/** The three large corner squares a scanner looks for */
function inFinder(r: number, c: number, n: number): boolean {
  return (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
}

/** One module is this many units in the drawing */
const M = 10;

interface Layout {
  n: number;
  quiet: number;
  /** Clear space between the code and the edge of its background */
  pad: number;
  /** Thickness taken by the border */
  border: number;
  /** Width of the whole picture */
  width: number;
  /** Height of the text line, 0 when there is none */
  text: number;
  /** How many modules wide the logo is; 0 for none */
  logo: number;
}

function layoutOf(spec: QrSpec, n: number): Layout {
  const quiet = Math.max(0, Math.min(8, Math.round(spec.quietZone)));
  // A round badge has to clear the code's corners, which takes about a fifth of its width on each side
  const pad = spec.pattern === "circular" ? Math.ceil(n * M * 0.21) + quiet * M : quiet * M;
  const border = spec.frame === "decorative" ? M * 1.6 : spec.frame === "solid" || spec.frame === "rounded" ? M * 0.6 : 0;
  const width = n * M + pad * 2 + border * 2;
  const text = String(spec.caption ?? "").trim() ? Math.round(width * 0.14) : 0;
  let logo = 0;
  if (embedded(spec.logoUrl)) {
    logo = Math.round((n * Math.max(10, Math.min(30, spec.logoSize || 20))) / 100);
    if (logo % 2 === 0) logo += 1;
    logo = Math.max(3, Math.min(logo, Math.floor(n * 0.3) | 1));
  }
  return { n, quiet, pad, border, width, text, logo };
}

/** Width divided by height of the drawn picture, so the editor can size its box to match */
export function qrAspect(spec: QrSpec): number {
  const grid = qrGrid(spec.modules);
  if (!grid) return 1;
  const { width, text } = layoutOf(spec, grid.length);
  return width / (width + text);
}

// ─── The picture ──────────────────────────────────────────────────────────────

/**
 * The QR code as an SVG document. Returns "" when there is no pattern to draw.
 * `pixels` is how wide the picture says it is; being SVG it is sharp at any size.
 */
export function renderQrSvg(spec: QrSpec, pixels = 1024): string {
  const grid = qrGrid(spec.modules);
  if (!grid) return "";
  const { n, pad, border, width, text, logo } = layoutOf(spec, grid.length);
  const height = width + text;
  const top = spec.captionPosition === "above" ? text : 0;
  const bg = color(spec.background, "#ffffff");
  const fg = color(spec.foreground, "#111111");
  const fg2 = rgbOf(spec.foreground2) ? color(spec.foreground2, fg) : "";
  const frameColor = color(spec.frameColor, "#111111");
  const soft = spec.pattern !== "square";
  const round = spec.pattern === "circular";
  const ox = border + pad;
  const oy = top + border + pad;
  const fill = fg2 ? "url(#qr-fill)" : fg;
  const logoStart = logo ? (n - logo) / 2 : -1;
  const underLogo = (r: number, c: number) => logo > 0 && r >= logoStart && r < logoStart + logo && c >= logoStart && c < logoStart + logo;

  let shapes = "";
  let path = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!grid[r][c] || underLogo(r, c)) continue;
      // With a soft pattern the three corner squares are drawn as their own rounded shapes below
      if (soft && inFinder(r, c, n)) continue;
      const x = ox + c * M;
      const y = oy + r * M;
      if (spec.pattern === "square") path += `M${x} ${y}h${M}v${M}h-${M}z`;
      else if (spec.pattern === "rounded") shapes += `<rect x="${x + 0.15}" y="${y + 0.15}" width="${M - 0.3}" height="${M - 0.3}" rx="2.6"/>`;
      // Dots that touch their neighbours: a scanner reads the gaps between smaller dots as light modules
      else shapes += `<circle cx="${x + M / 2}" cy="${y + M / 2}" r="${M * 0.5}"/>`;
    }
  }
  let finders = "";
  if (soft) {
    const corner = spec.pattern === "rounded" ? 1 : 1.25;
    for (const [fr, fc] of [[0, 0], [0, n - 7], [n - 7, 0]]) {
      const x = ox + fc * M;
      const y = oy + fr * M;
      finders += `<rect x="${x}" y="${y}" width="${7 * M}" height="${7 * M}" rx="${18 * corner}" fill="${fill}"/>`
        + `<rect x="${x + M}" y="${y + M}" width="${5 * M}" height="${5 * M}" rx="${11 * corner}" fill="${bg}"/>`
        + `<rect x="${x + 2 * M}" y="${y + 2 * M}" width="${3 * M}" height="${3 * M}" rx="${7 * corner}" fill="${fill}"/>`;
    }
  }

  // Background, then border
  const box = width - border * 2;
  const bx = border;
  const by = top + border;
  const radius = round ? box / 2 : spec.frame === "rounded" ? M * 3 : spec.frame === "decorative" ? M * 2 : 0;
  let back = `<rect x="${bx}" y="${by}" width="${box}" height="${box}" rx="${radius}" fill="${bg}"/>`;
  if (spec.frame === "solid" || spec.frame === "rounded") {
    back += `<rect x="${bx - border / 2}" y="${by - border / 2}" width="${box + border}" height="${box + border}" rx="${radius ? radius + border / 2 : 0}" fill="none" stroke="${frameColor}" stroke-width="${border}"/>`;
  } else if (spec.frame === "decorative") {
    back += `<rect x="${M * 0.25}" y="${top + M * 0.25}" width="${width - M * 0.5}" height="${width - M * 0.5}" rx="${radius ? radius + border : 0}" fill="none" stroke="${frameColor}" stroke-width="${M * 0.5}"/>`
      + `<rect x="${M * 1.15}" y="${top + M * 1.15}" width="${width - M * 2.3}" height="${width - M * 2.3}" rx="${radius ? radius + M * 0.5 : 0}" fill="none" stroke="${frameColor}" stroke-width="${M * 0.25}"/>`;
  }

  let logoArt = "";
  if (logo) {
    const size = logo * M;
    const x = ox + logoStart * M;
    const y = oy + logoStart * M;
    logoArt = `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${M * 0.8}" fill="${bg}"/>`
      + `<image href="${embedded(spec.logoUrl)}" x="${x + M * 0.5}" y="${y + M * 0.5}" width="${size - M}" height="${size - M}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  const caption = String(spec.caption ?? "").trim();
  // The text is as large as its line allows, and smaller when it is long, so it never runs past the code
  const fontSize = caption ? Math.max(8, Math.round(Math.min(text * 0.56, (width * 0.94) / (caption.length * 0.6)))) : 0;
  const captionArt = caption
    ? `<text x="${width / 2}" y="${spec.captionPosition === "above" ? text * 0.68 : width + text * 0.74}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${fontSize}" fill="${color(spec.captionColor, "#111111")}">${escapeText(caption)}</text>`
    : "";

  const defs = fg2 ? `<defs><linearGradient id="qr-fill" gradientUnits="userSpaceOnUse" x1="${ox}" y1="${oy}" x2="${ox + n * M}" y2="${oy + n * M}"><stop offset="0" stop-color="${fg}"/><stop offset="1" stop-color="${fg2}"/></linearGradient></defs>` : "";
  const px = Math.round(pixels);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${px}" height="${Math.round((px * height) / width)}" shape-rendering="${spec.pattern === "square" ? "crispEdges" : "geometricPrecision"}">${defs}${back}`
    + (path ? `<path d="${path}" fill="${fill}"/>` : "")
    + (shapes ? `<g fill="${fill}">${shapes}</g>` : "")
    + `${finders}${logoArt}${captionArt}</svg>`;
}

/** The picture as something an <img> or a canvas element can show */
export function qrDataUrl(spec: QrSpec, pixels = 1024): string {
  const svg = renderQrSvg(spec, pixels);
  return svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : "";
}

// ─── Will it scan? ────────────────────────────────────────────────────────────

export interface QrWarning {
  /** "problem" means it may well not scan; "note" is worth knowing */
  level: "problem" | "note";
  reason: string;
  recommendation: string;
}

/**
 * What could make this code hard to scan. `widthOnPage` is how wide it is drawn
 * on the design, in the design's own pixels, when that is known.
 * Nothing is changed; the author decides.
 */
export function qrWarnings(spec: QrSpec, widthOnPage?: number): QrWarning[] {
  const out: QrWarning[] = [];
  const grid = qrGrid(spec.modules);
  if (!grid) return [{ level: "problem", reason: "The code has no content yet.", recommendation: "Enter what the code should open." }];
  const { n, width, logo } = layoutOf(spec, grid.length);

  const bg = color(spec.background, "#ffffff");
  const shades = [color(spec.foreground, "#000000"), ...(rgbOf(spec.foreground2) ? [color(spec.foreground2, "#000000")] : [])];
  const weakest = Math.min(...shades.map((shade) => contrastOf(shade, bg)));
  if (weakest < 2.5) out.push({ level: "problem", reason: `Very low contrast between the code and its background (${weakest.toFixed(1)} to 1).`, recommendation: "Use a much darker code colour or a lighter background. Aim for at least 4 to 1." });
  else if (weakest < 4) out.push({ level: "note", reason: `Low contrast between the code and its background (${weakest.toFixed(1)} to 1).`, recommendation: "Increase the contrast. Aim for at least 4 to 1." });
  const fgRgb = rgbOf(shades[0]);
  const bgRgb = rgbOf(bg);
  if (fgRgb && bgRgb && luminance(fgRgb) > luminance(bgRgb)) out.push({ level: "note", reason: "The code is lighter than its background.", recommendation: "Some scanners cannot read a light code on a dark background. A dark code on a light background is the safe choice." });

  const quiet = Math.round(spec.quietZone);
  if (quiet < 2) out.push({ level: "problem", reason: `The clear margin around the code is ${quiet} module${quiet === 1 ? "" : "s"}.`, recommendation: "Scanners need a clear margin to find the code. Use 4 modules." });
  else if (quiet < 4) out.push({ level: "note", reason: `The clear margin around the code is ${quiet} modules; the standard asks for 4.`, recommendation: "Widen the margin to 4 if the code sits on a busy or dark part of the design." });

  if (widthOnPage) {
    const module = (widthOnPage * M) / width;
    if (module < 3) out.push({ level: "problem", reason: `At this size each module is only ${module.toFixed(1)}px wide.`, recommendation: "Make the code larger on the page, or shorten its content so it needs fewer modules." });
    else if (module < 5) out.push({ level: "note", reason: `At this size each module is ${module.toFixed(1)}px wide, which is small.`, recommendation: "Make the code larger if the design will be viewed small or printed." });
  }
  if (n > 57) out.push({ level: "note", reason: "The code holds a lot of data, which makes its modules small.", recommendation: "A short link scans far more easily than long text." });

  if (logo) {
    const share = (logo * logo) / (n * n);
    if (share > 0.07) out.push({ level: share > 0.1 ? "problem" : "note", reason: `The logo covers ${Math.round(share * 100)}% of the code.`, recommendation: "Make the logo smaller. Beyond roughly a tenth of the code, scanning becomes unreliable." });
  }
  return out;
}
