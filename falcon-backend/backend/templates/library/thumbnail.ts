/**
 * Draws a generated page as an SVG preview. It reads the same elements the
 * editor receives, so a preview shows exactly the design the user will open.
 */

import { FRAME_PATHS, FrameShape, LibElement, LibPage } from "./core";

const CONDENSED = new Set(["Bebas Neue", "Anton", "Oswald", "Rajdhani"]);
const SERIF = new Set(["Playfair Display", "DM Serif Display", "Cormorant Garamond", "Libre Baskerville", "Lora"]);
const MONO = new Set(["JetBrains Mono", "Space Mono"]);
const SCRIPT = new Set(["Dancing Script"]);

function esc(value: unknown): string {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** The named font first, then a system font of similar proportions for when it is not loaded */
function fontStack(family: string): string {
  const fallback = MONO.has(family) ? "Consolas, monospace"
    : SCRIPT.has(family) ? "'Segoe Script', 'Brush Script MT', cursive"
    : SERIF.has(family) ? "Georgia, serif"
    : CONDENSED.has(family) ? "Impact, 'Arial Narrow', sans-serif"
    : "Arial, Helvetica, sans-serif";
  return `'${family}', ${fallback}`;
}

function transform(el: LibElement): string {
  return el.rotation ? ` transform="rotate(${el.rotation} ${el.x + el.width / 2} ${el.y + el.height / 2})"` : "";
}

function opacity(el: LibElement): string {
  return el.opacity < 1 ? ` opacity="${Math.round(el.opacity * 100) / 100}"` : "";
}

/** A lighter version of a photo URL: previews are shown small */
function previewPhoto(src: string): string {
  return src.replace(/w=(\d+)&h=(\d+)/, (_m, w: string, h: string) => {
    const scale = Math.min(1, 520 / Number(w));
    return `w=${Math.round(Number(w) * scale)}&h=${Math.round(Number(h) * scale)}`;
  });
}

function drawElement(el: LibElement, index: number): string {
  const common = `${opacity(el)}${transform(el)}`;
  if (el.type === "frame") {
    const path = FRAME_PATHS[el.frameShape as FrameShape] || FRAME_PATHS.circle;
    const place = `translate(${el.x} ${el.y}) scale(${el.width / 100} ${el.height / 100})`;
    const strokeWidth = Number(el.strokeWidth) || 0;
    const outline = strokeWidth > 0
      ? `<path d="${path}" transform="${place}" fill="none" stroke="${esc(el.stroke)}" stroke-width="${strokeWidth}" vector-effect="non-scaling-stroke"/>`
      : "";
    return `<g${common}><clipPath id="f${index}"><path d="${path}" transform="${place}"/></clipPath>`
      + `<image href="${esc(previewPhoto(String(el.imageSrc)))}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" preserveAspectRatio="xMidYMid slice" clip-path="url(#f${index})"/>${outline}</g>`;
  }
  if (el.type === "rectangle" || el.type === "ellipse") {
    const strokeWidth = Number(el.strokeWidth) || 0;
    const stroke = strokeWidth > 0 ? ` stroke="${esc(el.stroke)}" stroke-width="${strokeWidth}"` : "";
    const fill = el.fill === "transparent" ? "none" : esc(el.fill);
    // The editor draws borders inside the box, so the outline is inset by half its width
    const inset = strokeWidth / 2;
    if (el.type === "ellipse") {
      return `<ellipse cx="${el.x + el.width / 2}" cy="${el.y + el.height / 2}" rx="${Math.max(0, el.width / 2 - inset)}" ry="${Math.max(0, el.height / 2 - inset)}" fill="${fill}"${stroke}${common}/>`;
    }
    const radius = Number(el.cornerRadius) || 0;
    return `<rect x="${el.x + inset}" y="${el.y + inset}" width="${Math.max(0, el.width - strokeWidth)}" height="${Math.max(0, el.height - strokeWidth)}"${radius ? ` rx="${radius}"` : ""} fill="${fill}"${stroke}${common}/>`;
  }
  if (el.type === "image") {
    return `<image href="${esc(previewPhoto(String(el.src)))}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" preserveAspectRatio="xMidYMid slice"${common}/>`;
  }
  const size = Number(el.fontSize);
  const lineHeight = Number(el.lineHeight) || 1.2;
  const align = String(el.align);
  const anchor = align === "center" ? "middle" : align === "right" ? "end" : "start";
  const x = align === "center" ? el.x + el.width / 2 : align === "right" ? el.x + el.width : el.x;
  const spacing = Number(el.letterSpacing) || 0;
  const lines = String(el.text).split("\n");
  // Text sits in line boxes; the baseline is a little above the bottom of each box
  const first = el.y + (size * lineHeight - size) / 2 + size * 0.8;
  const spans = lines.map((line, i) => `<tspan x="${x}" y="${Math.round((first + i * size * lineHeight) * 10) / 10}">${esc(line)}</tspan>`).join("");
  return `<text font-family="${esc(fontStack(String(el.fontFamily)))}" font-size="${size}" font-weight="${el.fontWeight}"${el.italic ? ' font-style="italic"' : ""} fill="${esc(el.color)}" text-anchor="${anchor}"${spacing ? ` letter-spacing="${spacing}"` : ""}${common}>${spans}</text>`;
}

export function renderPageSvg(page: LibPage): string {
  const { width: W, height: H, backgroundSpec: bg } = page;
  let defs = "";
  let fill = esc(bg.from);
  if (bg.kind === "linear") {
    // CSS angles run clockwise from "up"; convert to the two end points SVG wants
    const rad = (bg.angle * Math.PI) / 180;
    const dx = Math.sin(rad) / 2;
    const dy = -Math.cos(rad) / 2;
    defs = `<defs><linearGradient id="g1" x1="${0.5 - dx}" y1="${0.5 - dy}" x2="${0.5 + dx}" y2="${0.5 + dy}"><stop offset="0" stop-color="${esc(bg.from)}"/><stop offset="1" stop-color="${esc(bg.to)}"/></linearGradient></defs>`;
    fill = "url(#g1)";
  } else if (bg.kind === "radial") {
    defs = `<defs><radialGradient id="g1" cx="0.5" cy="0.35" r="0.75"><stop offset="0" stop-color="${esc(bg.from)}"/><stop offset="1" stop-color="${esc(bg.to)}"/></radialGradient></defs>`;
    fill = "url(#g1)";
  }
  const body = page.elements.map(drawElement).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs}<rect width="${W}" height="${H}" fill="${fill}"/>${body}</svg>`;
}
