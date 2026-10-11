// GENERATED FILE - do not edit. Source: frontend/src/lib/emailCore. Run `npm run email:sync` to update.
/**
 * Renders an email document as a compact SVG preview.
 *
 * The preview is drawn from the document itself (real colours, real copy, real
 * layout), so a template's thumbnail always matches what opens in the editor.
 * Text metrics are estimated, which is plenty for a thumbnail and keeps this
 * free of any DOM or font dependency. The same pass yields the email's height.
 */

import { EmailBlock, EmailColumn, EmailDocument, EmailSection, TextAlign } from "./schema";
import { SOCIAL_LABELS, contrastColor, videoPoster } from "./renderHtml";

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function plain(value: string): string {
  return String(value ?? "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
}

function visible(color: string): boolean {
  return !!color && color !== "transparent";
}

function genericFamily(stack: string): string {
  const s = (stack || "").toLowerCase();
  if (s.includes("mono") || s.includes("courier") || s.includes("console")) return "monospace";
  if (s.includes("sans")) return "sans-serif";
  if (s.includes("serif")) return "serif";
  return "sans-serif";
}

function charWidth(family: string, bold: boolean): number {
  const base = family === "monospace" ? 0.6 : family === "serif" ? 0.5 : 0.53;
  return bold ? base * 1.07 : base;
}

function wrap(text: string, maxWidth: number, fontSize: number, family: string, bold: boolean, spacing = 0): string[] {
  const perChar = fontSize * charWidth(family, bold) + spacing;
  const maxChars = Math.max(4, Math.floor(maxWidth / Math.max(1, perChar)));
  const lines: string[] = [];
  for (const paragraph of plain(text).split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      if (!word) continue;
      const next = line ? `${line} ${word}` : word;
      if (next.length > maxChars && line) {
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

interface Drawn {
  h: number;
  svg: string;
}

interface TextOptions {
  size: number;
  family: string;
  color: string;
  bold?: boolean;
  align?: TextAlign;
  lineHeight?: number;
  spacing?: number;
  upper?: boolean;
}

function drawText(text: string, x: number, y: number, w: number, o: TextOptions): Drawn {
  const family = genericFamily(o.family);
  const content = o.upper ? plain(text).toUpperCase() : text;
  const lines = wrap(content, w, o.size, family, !!o.bold, o.spacing || 0);
  const lh = o.size * (o.lineHeight || 1.4);
  const anchor = o.align === "center" ? "middle" : o.align === "right" ? "end" : "start";
  const tx = o.align === "center" ? x + w / 2 : o.align === "right" ? x + w : x;
  const spans = lines
    .map((line, i) => `<tspan x="${tx.toFixed(1)}" y="${(y + lh * i + o.size * 0.95 + (lh - o.size) / 2).toFixed(1)}">${esc(line)}</tspan>`)
    .join("");
  const svg = `<text font-family="${family}" font-size="${o.size}" fill="${esc(o.color)}" text-anchor="${anchor}"${o.bold ? ` font-weight="700"` : ""}${o.spacing ? ` letter-spacing="${o.spacing}"` : ""}>${spans}</text>`;
  return { h: lines.length * lh, svg };
}

function drawButton(text: string, x: number, y: number, w: number, align: TextAlign, bg: string, color: string, radius: number, size = 14, padV = 12, padH = 28, full = false, outline = ""): Drawn {
  const bw = full ? w : Math.min(w, plain(text).length * size * 0.58 + padH * 2);
  const bh = size * 1.2 + padV * 2;
  const bx = align === "center" ? x + (w - bw) / 2 : align === "right" ? x + w - bw : x;
  const r = Math.min(radius, bh / 2);
  const stroke = outline ? ` stroke="${esc(outline)}" stroke-width="2"` : "";
  return {
    h: bh,
    svg: `<rect x="${bx.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="${r}" fill="${esc(bg)}"${stroke}/>` +
      `<text x="${(bx + bw / 2).toFixed(1)}" y="${(y + bh / 2 + size * 0.36).toFixed(1)}" font-family="sans-serif" font-size="${size}" font-weight="700" fill="${esc(color)}" text-anchor="middle">${esc(plain(text))}</text>`,
  };
}

// ─── Images ───────────────────────────────────────────────────────────────────

export interface ArtRef {
  style: string;
  colors: string[];
  seed: number;
  width: number;
  height: number;
}

/** Falcon's generated artwork encodes everything needed to redraw it in its URL. */
export function parseArtUrl(url: string): ArtRef | null {
  const m = /\/email-assets\/art\/([a-z]+)\/([0-9a-f]{6}(?:-[0-9a-f]{6}){1,3})\/(\d+)\/(\d+)x(\d+)\.png/i.exec(url || "");
  if (!m) return null;
  return {
    style: m[1].toLowerCase(),
    colors: m[2].split("-").map((c) => `#${c}`),
    seed: parseInt(m[3], 10),
    width: parseInt(m[4], 10),
    height: parseInt(m[5], 10),
  };
}

let gradientCounter = 0;

/** Aspect ratio (height / width) when an image URL states its crop size, e.g. "?w=600&h=400". */
function ratioFromUrl(src: string): number | null {
  const w = /[?&]w=(\d+)/.exec(src);
  const h = /[?&]h=(\d+)/.exec(src);
  return w && h && Number(w[1]) > 0 ? Number(h[1]) / Number(w[1]) : null;
}

/** A lighter rendition of a remote photo for use inside a preview. */
function previewPhotoUrl(src: string): string {
  return src.replace(/([?&])w=(\d+)/, (_m, sep: string, w: string) => `${sep}w=${Math.min(600, Number(w))}`)
    .replace(/([?&])h=(\d+)/, (_m, sep: string, h: string) => {
      const w = /[?&]w=(\d+)/.exec(src);
      const scale = w ? Math.min(1, 600 / Number(w[1])) : 1;
      return `${sep}h=${Math.round(Number(h) * scale)}`;
    })
    .replace(/([?&])q=\d+/, "$1q=55");
}

function isRemote(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

/**
 * A real photo. The placeholder underneath shows wherever the picture cannot
 * load (an SVG used as an <img> may not fetch other files).
 */
function photoLayer(src: string, x: number, y: number, w: number, h: number, r: number): string {
  const id = `p${(gradientCounter = (gradientCounter + 1) % 100000)}`;
  return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath></defs>` +
    `<image href="${esc(previewPhotoUrl(src))}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>`;
}

function drawImage(src: string, x: number, y: number, w: number, radius: number, label: string, fallbackRatio = 0.5): Drawn {
  const art = parseArtUrl(src);
  const ratio = art ? art.height / art.width : ratioFromUrl(src) ?? fallbackRatio;
  const h = Math.round(w * ratio);
  const r = Math.min(radius, h / 2);
  if (!art) {
    const filled = !!src;
    return {
      h,
      svg: `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${filled ? "#cbd5e1" : "#e5e7eb"}"/>` +
        `<circle cx="${x + w * 0.3}" cy="${y + h * 0.36}" r="${Math.min(w, h) * 0.09}" fill="#f8fafc" opacity="0.8"/>` +
        `<path d="M${x} ${y + h} L${x + w * 0.38} ${y + h * 0.5} L${x + w * 0.58} ${y + h * 0.74} L${x + w * 0.76} ${y + h * 0.56} L${x + w} ${y + h} Z" fill="#94a3b8" opacity="0.55"/>` +
        (filled ? "" : `<text x="${x + w / 2}" y="${y + h / 2 + 4}" font-family="sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle">${esc(label)}</text>`) +
        (isRemote(src) ? photoLayer(src, x, y, w, h, r) : ""),
    };
  }

  const id = `g${(gradientCounter = (gradientCounter + 1) % 100000)}`;
  const [c1, c2, c3 = art.colors[0]] = art.colors;
  const rnd = (n: number) => ((art.seed * (n * 2 + 7) * 2654435761) >>> 0) / 4294967295;
  let shapes = "";
  if (art.style === "orbs" || art.style === "sun") {
    shapes += `<circle cx="${x + w * (0.2 + rnd(1) * 0.6)}" cy="${y + h * (0.3 + rnd(2) * 0.4)}" r="${h * (0.28 + rnd(3) * 0.2)}" fill="${c3}" opacity="0.55"/>`;
    shapes += `<circle cx="${x + w * (0.1 + rnd(4) * 0.8)}" cy="${y + h * (0.2 + rnd(5) * 0.6)}" r="${h * (0.14 + rnd(6) * 0.16)}" fill="#ffffff" opacity="0.18"/>`;
  } else if (art.style === "stripes" || art.style === "waves") {
    for (let i = 0; i < 4; i++) {
      shapes += `<rect x="${x}" y="${y + (h / 4) * i + h * 0.06}" width="${w}" height="${h * 0.1}" fill="${i % 2 ? c3 : "#ffffff"}" opacity="0.22"/>`;
    }
  } else if (art.style === "grid" || art.style === "blocks") {
    for (let i = 0; i < 6; i++) {
      shapes += `<rect x="${x + (w / 6) * i}" y="${y + h * rnd(i + 1) * 0.5}" width="${w / 6 - 2}" height="${h * 0.5}" fill="${i % 2 ? c3 : "#ffffff"}" opacity="${0.12 + rnd(i + 9) * 0.25}"/>`;
    }
  } else {
    shapes += `<path d="M${x} ${y + h} L${x + w * (0.3 + rnd(1) * 0.4)} ${y + h * 0.35} L${x + w} ${y + h} Z" fill="${c3}" opacity="0.45"/>`;
  }
  return {
    h,
    svg: `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><clipPath id="${id}c"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath></defs>` +
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#${id})"/><g clip-path="url(#${id}c)">${shapes}</g>`,
  };
}

// ─── Blocks ───────────────────────────────────────────────────────────────────

function drawBlock(block: EmailBlock, x: number, y: number, w: number): Drawn {
  const px = x + block.paddingLeft;
  const pw = Math.max(20, w - block.paddingLeft - block.paddingRight);
  let cy = y + block.paddingTop;
  let svg = "";
  const add = (d: Drawn, gapAfter = 0) => { svg += d.svg; cy += d.h + gapAfter; };

  switch (block.type) {
    case "text":
      add(drawText(block.content, px, cy, pw, {
        size: block.fontSize, family: block.fontFamily, color: block.color, align: block.textAlign,
        lineHeight: block.lineHeight, bold: block.fontWeight !== "normal", spacing: block.letterSpacing,
      }));
      break;
    case "heading":
      add(drawText(block.content, px, cy, pw, {
        size: block.fontSize, family: block.fontFamily, color: block.color, align: block.textAlign,
        lineHeight: block.lineHeight, bold: block.fontWeight !== "normal", spacing: block.letterSpacing, upper: block.uppercase,
      }));
      break;
    case "image": {
      const iw = block.width === "100%" ? pw : Math.min(block.width, pw);
      const ix = block.alignment === "center" ? px + (pw - iw) / 2 : block.alignment === "right" ? px + pw - iw : px;
      add(drawImage(block.src, ix, cy, iw, block.borderRadius, block.alt));
      break;
    }
    case "button":
      add(drawButton(block.text, px, cy, pw, block.alignment, block.bgColor, block.textColor, block.borderRadius, block.fontSize, block.paddingV, block.paddingH, block.width === "full", block.outlineColor));
      break;
    case "divider": {
      const dw = (pw * block.widthPercent) / 100;
      svg += `<rect x="${px + (pw - dw) / 2}" y="${cy}" width="${dw}" height="${block.thickness}" fill="${esc(block.color)}"/>`;
      cy += block.thickness;
      break;
    }
    case "spacer":
      cy += block.height;
      break;
    case "social": {
      const total = block.icons.length * block.iconSize + Math.max(0, block.icons.length - 1) * block.gap;
      let sx = block.alignment === "center" ? px + (pw - total) / 2 : block.alignment === "right" ? px + pw - total : px;
      for (const icon of block.icons) {
        const r = block.iconSize / 2;
        const label = SOCIAL_LABELS[icon.platform]?.short || "";
        svg += `<circle cx="${sx + r}" cy="${cy + r}" r="${r}" fill="${esc(block.color)}"/>` +
          `<text x="${sx + r}" y="${cy + r + block.iconSize * 0.13}" font-family="sans-serif" font-size="${Math.round(block.iconSize * 0.38)}" font-weight="700" fill="${contrastColor(block.color)}" text-anchor="middle">${esc(label)}</text>`;
        sx += block.iconSize + block.gap;
      }
      cy += block.iconSize;
      break;
    }
    case "logo":
      if (block.src) {
        const lw = Math.min(block.width, pw);
        const lx = block.alignment === "center" ? px + (pw - lw) / 2 : block.alignment === "right" ? px + pw - lw : px;
        add(drawImage(block.src, lx, cy, lw, 4, block.alt, 0.35));
      } else {
        add(drawText(block.text, px, cy, pw, {
          size: block.fontSize, family: block.fontFamily, color: block.textColor, align: block.alignment, bold: true,
          spacing: block.letterSpacing, lineHeight: 1.3,
        }));
      }
      break;
    case "html":
      add(drawText(plain(block.html).trim().slice(0, 400) || "Custom HTML", px, cy, pw, { size: 14, family: "sans-serif", color: "#555555", lineHeight: 1.5 }));
      break;
    case "video": {
      const poster = drawImage(block.thumbnailSrc || videoPoster(block.videoUrl), px, cy, pw, block.borderRadius, block.alt, 0.56);
      const r = Math.min(34, poster.h * 0.22);
      svg += poster.svg +
        `<circle cx="${px + pw / 2}" cy="${cy + poster.h / 2}" r="${r}" fill="#000000" opacity="0.55"/>` +
        `<path d="M${px + pw / 2 - r * 0.3} ${cy + poster.h / 2 - r * 0.45} L${px + pw / 2 + r * 0.5} ${cy + poster.h / 2} L${px + pw / 2 - r * 0.3} ${cy + poster.h / 2 + r * 0.45} Z" fill="#ffffff"/>`;
      cy += poster.h + 12;
      add(drawButton(block.buttonText, px, cy, pw, "center", block.buttonBg, block.buttonColor, 999, 14, 10, 22));
      break;
    }
    case "icons": {
      const size = block.iconSize;
      if (block.layout === "list") {
        for (const item of block.items) {
          const tx = px + size + 14;
          svg += `<circle cx="${px + size / 2}" cy="${cy + size / 2}" r="${size / 2}" fill="${esc(block.iconBg)}"/>` +
            `<text x="${px + size / 2}" y="${cy + size / 2 + size * 0.16}" font-family="sans-serif" font-size="${Math.round(size * 0.45)}" fill="${esc(block.iconColor)}" text-anchor="middle">${esc(item.glyph)}</text>`;
          const label = drawText(item.label, tx, cy, pw - size - 14, { size: block.fontSize + 1, family: block.fontFamily, color: block.labelColor, bold: true });
          const text = item.text ? drawText(item.text, tx, cy + label.h, pw - size - 14, { size: block.fontSize, family: block.fontFamily, color: block.textColor, lineHeight: 1.5 }) : { h: 0, svg: "" };
          svg += label.svg + text.svg;
          cy += Math.max(size, label.h + text.h) + 12;
        }
      } else if (block.items.length) {
        const cw = pw / block.items.length;
        let tallest = 0;
        block.items.forEach((item, i) => {
          const cx = px + cw * i;
          let iy = cy;
          svg += `<circle cx="${cx + cw / 2}" cy="${iy + size / 2}" r="${size / 2}" fill="${esc(block.iconBg)}"/>` +
            `<text x="${cx + cw / 2}" y="${iy + size / 2 + size * 0.16}" font-family="sans-serif" font-size="${Math.round(size * 0.45)}" fill="${esc(block.iconColor)}" text-anchor="middle">${esc(item.glyph)}</text>`;
          iy += size + 8;
          const label = drawText(item.label, cx + 6, iy, cw - 12, { size: block.fontSize + 1, family: block.fontFamily, color: block.labelColor, bold: true, align: "center" });
          iy += label.h;
          const text = item.text ? drawText(item.text, cx + 6, iy, cw - 12, { size: block.fontSize, family: block.fontFamily, color: block.textColor, align: "center", lineHeight: 1.5 }) : { h: 0, svg: "" };
          svg += label.svg + text.svg;
          tallest = Math.max(tallest, iy + text.h - cy);
        });
        cy += tallest + 8;
      }
      break;
    }
    case "menu": {
      const joined = block.links.map((l) => l.label).join(block.separator ? `   ${block.separator}   ` : "      ");
      add(drawText(joined, px, cy, pw, {
        size: block.fontSize, family: block.fontFamily, color: block.color, align: block.alignment,
        bold: block.fontWeight !== "normal", spacing: block.letterSpacing, upper: block.uppercase,
      }));
      break;
    }
    case "hero": {
      const parts: Drawn[] = [];
      let hy = cy;
      const heading = drawText(block.heading, px, hy, pw, { size: block.headingSize, family: block.headingFont, color: block.headingColor, bold: true, align: block.textAlign, lineHeight: 1.2 });
      hy += heading.h + 12;
      const sub = drawText(block.subheading, px, hy, pw, { size: 16, family: block.fontFamily, color: block.subheadingColor, align: block.textAlign, lineHeight: 1.55 });
      hy += sub.h;
      parts.push(heading, sub);
      if (block.buttonText) {
        hy += 24;
        const cta = drawButton(block.buttonText, px, hy, pw, block.textAlign, block.buttonBg, block.buttonColor, block.buttonRadius, 15, 13, 30);
        hy += cta.h;
        parts.push(cta);
      }
      const total = hy + block.paddingBottom - y;
      const art = parseArtUrl(block.imageSrc);
      let bg = `<rect x="${x}" y="${y}" width="${w}" height="${total}" fill="${esc(block.fallbackColor)}"/>`;
      if (art) {
        const id = `g${(gradientCounter = (gradientCounter + 1) % 100000)}`;
        bg = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${art.colors[0]}"/><stop offset="1" stop-color="${art.colors[1]}"/></linearGradient></defs>` +
          `<rect x="${x}" y="${y}" width="${w}" height="${total}" fill="url(#${id})"/>` +
          `<circle cx="${x + w * 0.82}" cy="${y + total * 0.25}" r="${total * 0.42}" fill="${art.colors[2] || art.colors[0]}" opacity="0.4"/>` +
          `<rect x="${x}" y="${y}" width="${w}" height="${total}" fill="${esc(block.overlayColor)}" opacity="${block.overlayOpacity}"/>`;
      } else if (block.imageSrc) {
        bg = `<rect x="${x}" y="${y}" width="${w}" height="${total}" fill="#64748b"/>` +
          (isRemote(block.imageSrc) ? photoLayer(block.imageSrc, x, y, w, total, 0) : "") +
          `<rect x="${x}" y="${y}" width="${w}" height="${total}" fill="${esc(block.overlayColor)}" opacity="${block.overlayOpacity}"/>`;
      }
      return { h: total, svg: bg + parts.map((p) => p.svg).join("") };
    }
    case "feature": {
      const iw = Math.round(pw * 0.4) - 16;
      const tw = pw - iw - 16;
      const ix = block.imageAlign === "left" ? px : px + tw + 16;
      const tx = block.imageAlign === "left" ? px + iw + 16 : px;
      const img = drawImage(block.imageSrc, ix, cy, iw, block.imageRadius, "Image", 0.75);
      const heading = drawText(block.heading, tx, cy, tw, { size: 20, family: block.headingFont, color: block.color, bold: true, lineHeight: 1.3 });
      const body = drawText(block.body, tx, cy + heading.h + 8, tw, { size: 14, family: block.fontFamily, color: block.color, lineHeight: 1.6 });
      svg += img.svg + heading.svg + body.svg;
      cy += Math.max(img.h, heading.h + 8 + body.h);
      break;
    }
    case "product": {
      add(drawImage(block.imageSrc, px, cy, pw, block.imageRadius, "Product", 0.7), 16);
      if (block.badge) {
        const bw = plain(block.badge).length * 7.4 + 24;
        const bx = block.textAlign === "center" ? px + (pw - bw) / 2 : block.textAlign === "right" ? px + pw - bw : px;
        svg += `<rect x="${bx}" y="${cy}" width="${bw}" height="22" rx="11" fill="${esc(block.badgeBg)}"/>` +
          `<text x="${bx + bw / 2}" y="${cy + 15}" font-family="sans-serif" font-size="11" font-weight="700" letter-spacing="1" fill="${esc(block.badgeColor)}" text-anchor="middle">${esc(plain(block.badge).toUpperCase())}</text>`;
        cy += 32;
      }
      add(drawText(block.name, px, cy, pw, { size: 22, family: block.headingFont, color: block.nameColor, bold: true, align: block.textAlign, lineHeight: 1.3 }), 4);
      add(drawText(block.price, px, cy, pw, { size: 20, family: block.fontFamily, color: block.priceColor, bold: true, align: block.textAlign, lineHeight: 1.3 }), 8);
      add(drawText(block.description, px, cy, pw, { size: 14, family: block.fontFamily, color: block.descriptionColor, align: block.textAlign, lineHeight: 1.6 }), block.buttonText ? 16 : 0);
      if (block.buttonText) add(drawButton(block.buttonText, px, cy, pw, block.textAlign, block.buttonBg, block.buttonColor, block.buttonRadius, 14, 11, 24));
      break;
    }
    case "cta":
      add(drawText(block.heading, px, cy, pw, { size: 28, family: block.headingFont, color: block.headingColor, bold: true, align: block.textAlign, lineHeight: 1.25 }), 8);
      add(drawText(block.subheading, px, cy, pw, { size: 15, family: block.fontFamily, color: block.subheadingColor, align: block.textAlign, lineHeight: 1.6 }), block.buttonText ? 24 : 0);
      if (block.buttonText) add(drawButton(block.buttonText, px, cy, pw, block.textAlign, block.buttonBg, block.buttonColor, block.buttonRadius, 15, 13, 30));
      break;
    case "footer_block": {
      const o = { size: block.fontSize, family: block.fontFamily, color: block.textColor, align: block.textAlign, lineHeight: 1.5 };
      add(drawText(block.companyName, px, cy, pw, { ...o, bold: true }), 6);
      add(drawText(block.address, px, cy, pw, o), 6);
      add(drawText(block.unsubscribeText, px, cy, pw, o));
      break;
    }
  }

  const h = cy + block.paddingBottom - y;
  let frame = "";
  if (visible(block.backgroundColor) || block.borderWidth > 0) {
    frame = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${block.cornerRadius}" fill="${visible(block.backgroundColor) ? esc(block.backgroundColor) : "none"}"${block.borderWidth > 0 ? ` stroke="${esc(block.borderColor)}" stroke-width="${block.borderWidth}"` : ""}/>`;
  }
  return { h, svg: frame + svg };
}

function drawColumn(column: EmailColumn, x: number, y: number, w: number): Drawn {
  let cy = y + column.padding;
  let svg = "";
  for (const block of column.blocks) {
    const d = drawBlock(block, x + column.padding, cy, w - column.padding * 2);
    svg += d.svg;
    cy += d.h;
  }
  return { h: cy + column.padding - y, svg };
}

function drawSection(section: EmailSection, y: number, width: number): Drawn {
  const s = section.settings;
  const innerX = s.paddingLeft + s.borderWidth;
  const innerW = Math.max(80, width - s.paddingLeft - s.paddingRight - s.borderWidth * 2);
  const top = y + s.paddingTop + s.borderWidth;
  const count = section.columns.length;
  const gapTotal = s.gap * (count - 1);

  let x = innerX;
  let tallest = 0;
  const drawn: { d: Drawn; x: number; w: number; column: EmailColumn }[] = [];
  for (const column of section.columns) {
    const w = count === 1 ? innerW : ((innerW - gapTotal) * column.width) / 100;
    const d = drawColumn(column, x, top, w);
    drawn.push({ d, x, w, column });
    tallest = Math.max(tallest, d.h);
    x += w + s.gap;
  }

  let svg = "";
  for (const item of drawn) {
    if (visible(item.column.backgroundColor)) {
      svg += `<rect x="${item.x}" y="${top}" width="${item.w}" height="${tallest}" rx="${item.column.borderRadius}" fill="${esc(item.column.backgroundColor)}"/>`;
    }
    // Shift shorter columns down when they are middle/bottom aligned
    const slack = tallest - item.d.h;
    const offset = item.column.verticalAlign === "middle" ? slack / 2 : item.column.verticalAlign === "bottom" ? slack : 0;
    svg += offset > 0.5 ? `<g transform="translate(0 ${offset.toFixed(1)})">${item.d.svg}</g>` : item.d.svg;
  }

  const h = tallest + s.paddingTop + s.paddingBottom + s.borderWidth * 2;
  let frame = "";
  if (visible(s.backgroundColor) || s.borderWidth > 0) {
    frame = `<rect x="0" y="${y}" width="${width}" height="${h}" fill="${visible(s.backgroundColor) ? esc(s.backgroundColor) : "none"}"${s.borderWidth > 0 ? ` stroke="${esc(s.borderColor)}" stroke-width="${s.borderWidth}"` : ""}/>`;
  }
  return { h, svg: frame + svg };
}

function layout(doc: EmailDocument): { width: number; height: number; svg: string } {
  const width = doc.document.settings.emailWidth;
  let y = 0;
  let svg = "";
  for (const section of doc.blocks) {
    const d = drawSection(section, y, width);
    svg += d.svg;
    y += d.h;
  }
  return { width, height: Math.max(120, Math.round(y)), svg };
}

/** Approximate rendered height of the email body in pixels. */
export function estimateEmailHeight(doc: EmailDocument): number {
  return layout(doc).height;
}

export interface ThumbnailOptions {
  /** Crop to this aspect ratio (height / width). Omit to show the whole email. */
  maxRatio?: number;
}

export function renderThumbnailSvg(doc: EmailDocument, options: ThumbnailOptions = {}): string {
  gradientCounter = 0;
  const { width, height, svg } = layout(doc);
  const settings = doc.document.settings;
  const shown = options.maxRatio ? Math.min(height, Math.round(width * options.maxRatio)) : height;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${shown}" width="100%" height="100%" preserveAspectRatio="xMidYMin slice">` +
    `<rect width="${width}" height="${shown}" fill="${esc(settings.contentBackground)}"/>${svg}</svg>`;
}
