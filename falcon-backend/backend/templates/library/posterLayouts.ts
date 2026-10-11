/**
 * Poster compositions. Each layout arranges the same ingredients (label, title,
 * supporting line, facts, call to action, sometimes a photo) in its own way.
 *
 * Content is placed as stacks of blocks inside regions. A stack that would not
 * fit its region is rebuilt slightly smaller until it does, which is what keeps
 * one layout working from a wide banner to a tall story.
 */

import { FontPair, FrameShape, Palette, Rng, Sheet, StyleDef, fitText, onColor, textWidth, titleCase, wrapText } from "./core";

export interface PosterCtx {
  W: number;
  H: number;
  /** Base unit: one hundredth of the shorter side */
  u: number;
  /** Outer margin */
  m: number;
  orient: "portrait" | "square" | "landscape";
  pal: Palette;
  fonts: FontPair;
  style: StyleDef;
  sheet: Sheet;
  rng: Rng;
  kicker: string;
  title: string;
  tagline: string;
  cta: string;
  details: [string, string][];
  brand: string;
  /** URL of a photo cropped to the given box; `n` picks another photo of the same subject */
  photo: (w: number, h: number, n?: number) => string;
  variant: number;
}

interface Tone {
  text: string;
  muted: string;
  accent: string;
  /** Text colour to use on top of the accent */
  onAccent: string;
}

type Align = "left" | "center" | "right";

interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Block {
  h: number;
  draw: (x: number, y: number) => void;
}

function baseTone(c: PosterCtx): Tone {
  return { text: c.pal.text, muted: c.pal.muted, accent: c.pal.accent, onAccent: onColor(c.pal.accent) };
}

/** Tone for content sitting on a solid colour */
function toneOn(color: string, accent: string): Tone {
  const text = onColor(color);
  return { text, muted: text, accent: accent === color ? text : accent, onAccent: onColor(accent === color ? text : accent) };
}

function alignX(x: number, w: number, itemW: number, align: Align): number {
  if (align === "center") return x + (w - itemW) / 2;
  if (align === "right") return x + w - itemW;
  return x;
}

/**
 * Places a photo. Soft, rounded styles get it in a rounded frame and the rest
 * get square corners, so the photo's edges match the rest of the design.
 */
function photoBox(c: PosterCtx, x: number, y: number, w: number, h: number, n = 0, shape?: FrameShape): void {
  const pick = shape ?? (c.style.radius >= 1.2 ? "rounded-rect" : undefined);
  if (pick) c.sheet.frame(x, y, w, h, pick, c.photo(w, h, n));
  else c.sheet.image(x, y, w, h, c.photo(w, h, n));
}

// ─── Blocks ───────────────────────────────────────────────────────────────────

function kickerBlock(c: PosterCtx, w: number, k: number, tone: Tone, align: Align, look: "plain" | "pill" | "line"): Block {
  const size = Math.max(11, c.u * 2.3 * k);
  const spacing = size * c.style.tracking;
  const text = c.kicker.toUpperCase();
  const font = { family: c.fonts.body, weight: 600 };
  const tw = Math.min(w, textWidth(text, size, font.family, font.weight, spacing));
  if (look === "pill") {
    const padX = size * 1.1;
    const h = size * 2.3;
    const pw = Math.min(w, tw + padX * 2);
    return {
      h,
      draw: (x, y) => {
        const px = alignX(x, w, pw, align);
        c.sheet.rect(px, y, pw, h, tone.accent, { radius: c.style.radius > 0 ? h / 2 : 0 });
        c.sheet.text(px, y + (h - size * 1.2) / 2, pw, text, size, { ...font, color: tone.onAccent, align: "center", spacing });
      },
    };
  }
  if (look === "line") {
    const lineW = size * 2.4;
    const gap = size * 0.8;
    return {
      h: size * 1.3,
      draw: (x, y) => {
        const total = Math.min(w, lineW + gap + tw);
        const sx = alignX(x, w, total, align);
        c.sheet.rect(sx, y + size * 0.55, lineW, Math.max(2, Math.round(c.u * 0.28)), tone.accent);
        c.sheet.text(sx + lineW + gap, y, w - lineW - gap, text, size, { ...font, color: tone.muted, spacing });
      },
    };
  }
  return { h: size * 1.3, draw: (x, y) => c.sheet.text(x, y, w, text, size, { ...font, color: tone.accent, align, spacing }) };
}

function titleBlock(c: PosterCtx, w: number, k: number, tone: Tone, align: Align, o: { max?: number; lines?: number; color?: string } = {}): Block {
  const text = titleCase(c.title, c.style.caps);
  const lineHeight = c.style.caps ? 1.0 : 1.08;
  const fit = fitText(text, w, c.fonts.heading, c.fonts.weight, { max: c.u * (o.max ?? 13) * k, min: c.u * 4.2 * k, maxLines: o.lines ?? 3 });
  return {
    h: fit.lines.length * fit.size * lineHeight,
    draw: (x, y) => c.sheet.text(x, y, w, fit.lines, fit.size, { family: c.fonts.heading, weight: c.fonts.weight, color: o.color ?? tone.text, align, lineHeight }),
  };
}

function taglineBlock(c: PosterCtx, w: number, k: number, tone: Tone, align: Align, maxLines = 3): Block {
  const fit = fitText(c.tagline, w, c.fonts.body, 400, { max: c.u * 3.3 * k, min: c.u * 2.3 * k, maxLines });
  return {
    h: fit.lines.length * fit.size * 1.45,
    draw: (x, y) => c.sheet.text(x, y, w, fit.lines, fit.size, { family: c.fonts.body, weight: 400, color: tone.muted, align, lineHeight: 1.45, opacity: tone.muted === tone.text ? 0.82 : 1 }),
  };
}

function ruleBlock(c: PosterCtx, w: number, k: number, tone: Tone, align: Align, length = 12): Block {
  const h = Math.max(3, Math.round(c.u * 0.5 * k));
  const lw = Math.min(w, c.u * length);
  return { h, draw: (x, y) => c.sheet.rect(alignX(x, w, lw, align), y, lw, h, tone.accent) };
}

function spacer(h: number): Block {
  return { h, draw: () => undefined };
}

/** The facts as columns, a list or a grid of small cards */
function detailsBlock(c: PosterCtx, w: number, k: number, tone: Tone, align: Align, look: "row" | "list" | "cards", cardFill?: string): Block {
  const labelSize = Math.max(10, c.u * 1.9 * k);
  const valueSize = Math.max(13, c.u * 2.8 * k);
  const spacing = labelSize * c.style.tracking;
  const labelFont = { family: c.fonts.body, weight: 600 };
  const valueFont = { family: c.fonts.body, weight: 700 };
  const items = c.details;

  if (look === "list") {
    const rowH = labelSize * 1.3 + valueSize * 1.35 + c.u * 1.6 * k;
    return {
      h: rowH * items.length - c.u * 1.6 * k,
      draw: (x, y) => items.forEach(([label, value], i) => {
        const top = y + i * rowH;
        c.sheet.text(x, top, w, label.toUpperCase(), labelSize, { ...labelFont, color: tone.accent, align, spacing });
        const v = fitText(value, w, valueFont.family, valueFont.weight, { max: valueSize, min: valueSize * 0.7, maxLines: 1 });
        c.sheet.text(x, top + labelSize * 1.3, w, v.lines[0], v.size, { ...valueFont, color: tone.text, align });
      }),
    };
  }

  const gap = c.u * 2 * k;
  const colW = (w - gap * (items.length - 1)) / items.length;
  const cards = look === "cards";
  const pad = cards ? c.u * 1.8 * k : 0;
  const innerW = colW - pad * 2;
  const values = items.map(([, value]) => fitText(value, innerW, valueFont.family, valueFont.weight, { max: valueSize, min: valueSize * 0.62, maxLines: 2 }));
  const valueH = Math.max(...values.map((v) => v.lines.length * v.size * 1.2));
  const h = pad * 2 + labelSize * 1.5 + valueH;
  const itemAlign: Align = cards ? "center" : align;
  return {
    h,
    draw: (x, y) => items.forEach(([label], i) => {
      const cx = x + i * (colW + gap);
      if (cards) c.sheet.rect(cx, y, colW, h, cardFill ?? c.pal.surface, { radius: c.u * c.style.radius * 0.8, stroke: tone.accent, strokeWidth: c.style.radius === 0 ? Math.max(2, Math.round(c.u * 0.25)) : 0 });
      else if (i > 0) c.sheet.rect(cx - gap / 2, y, Math.max(1, Math.round(c.u * 0.14)), h, tone.text, { opacity: 0.22 });
      const cardTone = cards ? toneOn(cardFill ?? c.pal.surface, c.pal.accent) : tone;
      c.sheet.text(cx + pad, y + pad, innerW, label.toUpperCase(), labelSize, { ...labelFont, color: cards ? cardTone.accent : tone.accent, align: itemAlign, spacing });
      c.sheet.text(cx + pad, y + pad + labelSize * 1.5, innerW, values[i].lines, values[i].size, { ...valueFont, color: cardTone.text, align: itemAlign, lineHeight: 1.2 });
    }),
  };
}

function buttonBlock(c: PosterCtx, w: number, k: number, tone: Tone, align: Align, look: "solid" | "outline" = "solid"): Block {
  const size = Math.max(13, c.u * 2.4 * k);
  const text = c.style.caps ? c.cta.toUpperCase() : c.cta;
  const spacing = c.style.caps ? size * 0.08 : 0;
  const font = { family: c.fonts.body, weight: 700 };
  const h = size * 2.7;
  const bw = Math.min(w, textWidth(text, size, font.family, font.weight, spacing) + size * 3.4);
  const radius = c.style.radius === 0 ? 0 : c.style.radius > 1.5 ? h / 2 : c.u * c.style.radius;
  return {
    h,
    draw: (x, y) => {
      const bx = alignX(x, w, bw, align);
      if (look === "outline") c.sheet.rect(bx, y, bw, h, "transparent", { radius, stroke: tone.accent, strokeWidth: Math.max(2, Math.round(c.u * 0.3)) });
      else c.sheet.rect(bx, y, bw, h, tone.accent, { radius });
      c.sheet.text(bx, y + (h - size * 1.2) / 2, bw, text, size, { ...font, color: look === "outline" ? tone.accent : tone.onAccent, align: "center", spacing });
    },
  };
}

function brandBlock(c: PosterCtx, w: number, k: number, tone: Tone, align: Align): Block {
  const size = Math.max(11, c.u * 1.9 * k);
  return { h: size * 1.3, draw: (x, y) => c.sheet.text(x, y, w, c.brand.toUpperCase(), size, { family: c.fonts.body, weight: 700, color: tone.text, align, spacing: size * 0.22 }) };
}

// ─── Stacking ─────────────────────────────────────────────────────────────────

type Build = (w: number, k: number) => (Block | number)[];

/**
 * Places a stack of blocks in a region. Numbers in the stack are gaps in base
 * units. The stack is rebuilt at a smaller scale until it fits the region.
 */
function stack(c: PosterCtx, region: Region, build: Build, valign: "top" | "middle" | "bottom" = "top"): void {
  let k = 1;
  let blocks: Block[] = [];
  let total = 0;
  for (let attempt = 0; attempt < 14; attempt++) {
    blocks = build(region.w, k).map((item) => (typeof item === "number" ? spacer(item * c.u * k) : item));
    total = blocks.reduce((sum, b) => sum + b.h, 0);
    if (total <= region.h) break;
    k *= 0.9;
  }
  let y = region.y;
  if (valign === "middle") y += Math.max(0, (region.h - total) / 2);
  if (valign === "bottom") y += Math.max(0, region.h - total);
  for (const block of blocks) {
    block.draw(region.x, y);
    y += block.h;
  }
}

/** Splits the safe area into a main part and a secondary part: stacked when tall, side by side when wide */
function split(c: PosterCtx, mainShare: number): { main: Region; aside: Region; wide: boolean } {
  const { W, H, m } = c;
  const gap = c.u * 4;
  if (c.orient === "landscape") {
    const mainW = (W - m * 2 - gap) * mainShare;
    return {
      wide: true,
      main: { x: m, y: m, w: mainW, h: H - m * 2 },
      aside: { x: m + mainW + gap, y: m, w: W - m * 2 - gap - mainW, h: H - m * 2 },
    };
  }
  const mainH = (H - m * 2 - gap) * mainShare;
  return {
    wide: false,
    main: { x: m, y: m, w: W - m * 2, h: mainH },
    aside: { x: m, y: m + mainH + gap, w: W - m * 2, h: H - m * 2 - gap - mainH },
  };
}

// ─── Layouts ──────────────────────────────────────────────────────────────────

export interface PosterLayout {
  id: string;
  name: string;
  /** Uses a photograph */
  photo?: boolean;
  draw: (c: PosterCtx) => void;
}

const centeredStack: PosterLayout = {
  id: "centered-stack",
  name: "Centered Stack",
  draw: (c) => {
    const tone = baseTone(c);
    const { main, aside, wide } = split(c, wide_(c) ? 0.6 : 0.66);
    stack(c, main, (w, k) => [kickerBlock(c, w, k, tone, wide ? "left" : "center", "pill"), 4, titleBlock(c, w, k, tone, wide ? "left" : "center", { max: 15 }), 3, taglineBlock(c, w, k, tone, wide ? "left" : "center")], "middle");
    stack(c, aside, (w, k) => [detailsBlock(c, w, k, tone, "center", wide ? "list" : "row"), 5, buttonBlock(c, w, k, tone, "center")], wide ? "middle" : "bottom");
  },
};

function wide_(c: PosterCtx): boolean {
  return c.orient === "landscape";
}

const leftEditorial: PosterLayout = {
  id: "left-editorial",
  name: "Left Editorial",
  draw: (c) => {
    const tone = baseTone(c);
    const bar = Math.max(4, Math.round(c.u * 0.7));
    c.sheet.rect(c.m, c.m, bar, c.H - c.m * 2, c.pal.accent);
    const inset = c.m + bar + c.u * 4;
    const area: Region = { x: inset, y: c.m, w: c.W - inset - c.m, h: c.H - c.m * 2 };
    const topH = area.h * (wide_(c) ? 0.62 : 0.68);
    stack(c, { ...area, h: topH }, (w, k) => [brandBlock(c, w, k, tone, "left"), 5, kickerBlock(c, w, k, tone, "left", "plain"), 3, titleBlock(c, w * (wide_(c) ? 0.72 : 1), k, tone, "left", { max: 14 }), 3, taglineBlock(c, w * 0.82, k, tone, "left")]);
    stack(c, { x: area.x, y: area.y + topH, w: area.w, h: area.h - topH }, (w, k) => [ruleBlock(c, w, k, tone, "left", 100), 3, detailsBlock(c, w, k, tone, "left", "row"), 4, buttonBlock(c, w, k, tone, "left", "outline")], "bottom");
  },
};

const topBand: PosterLayout = {
  id: "top-band",
  name: "Top Band",
  draw: (c) => {
    const band = toneOn(c.pal.accent, c.pal.accent);
    const tone = baseTone(c);
    if (wide_(c)) {
      const bw = c.W * 0.52;
      c.sheet.rect(0, 0, bw, c.H, c.pal.accent);
      stack(c, { x: c.m, y: c.m, w: bw - c.m * 2, h: c.H - c.m * 2 }, (w, k) => [kickerBlock(c, w, k, band, "left", "plain"), 3, titleBlock(c, w, k, band, "left", { max: 14 })], "middle");
      stack(c, { x: bw + c.m, y: c.m, w: c.W - bw - c.m * 2, h: c.H - c.m * 2 }, (w, k) => [taglineBlock(c, w, k, tone, "left"), 4, detailsBlock(c, w, k, tone, "left", "list"), 4, buttonBlock(c, w, k, tone, "left")], "middle");
      return;
    }
    const bh = c.H * 0.46;
    c.sheet.rect(0, 0, c.W, bh, c.pal.accent);
    stack(c, { x: c.m, y: c.m, w: c.W - c.m * 2, h: bh - c.m * 1.6 }, (w, k) => [brandBlock(c, w, k, band, "left"), 4, kickerBlock(c, w, k, band, "left", "plain"), 3, titleBlock(c, w, k, band, "left", { max: 15 })], "bottom");
    stack(c, { x: c.m, y: bh + c.u * 5, w: c.W - c.m * 2, h: c.H - bh - c.u * 5 - c.m }, (w, k) => [taglineBlock(c, w, k, tone, "left"), 5, detailsBlock(c, w, k, tone, "left", "cards"), 5, buttonBlock(c, w, k, tone, "left")], "top");
  },
};

const bottomTitle: PosterLayout = {
  id: "bottom-title",
  name: "Bottom Title",
  draw: (c) => {
    const tone = baseTone(c);
    const d = Math.min(c.W, c.H) * (wide_(c) ? 0.9 : 0.74);
    c.sheet.ellipse(c.W - d * 0.72, -d * 0.28, d, d, c.pal.accent, { opacity: 0.92 });
    c.sheet.ellipse(c.W - d * 0.5, d * 0.06, d * 0.5, d * 0.5, c.pal.accent2, { opacity: 0.85 });
    stack(c, { x: c.m, y: c.m, w: c.W * 0.5, h: c.u * 8 }, (w, k) => [brandBlock(c, w, k, tone, "left")]);
    stack(c, { x: c.m, y: c.H * (wide_(c) ? 0.2 : 0.38), w: (c.W - c.m * 2) * (wide_(c) ? 0.6 : 1), h: c.H * (wide_(c) ? 0.8 : 0.62) - c.m }, (w, k) => [
      kickerBlock(c, w, k, tone, "left", "line"), 3, titleBlock(c, w, k, tone, "left", { max: 16 }), 3, taglineBlock(c, w * 0.86, k, tone, "left"), 5, detailsBlock(c, w, k, tone, "left", "row"),
    ], "bottom");
  },
};

const bigWord: PosterLayout = {
  id: "big-word",
  name: "Big Type",
  draw: (c) => {
    const tone = baseTone(c);
    const words = titleCase(c.title, true).split(" ");
    const first = words[0];
    const rest = words.slice(1).join(" ") || titleCase(c.kicker, true);
    const w = c.W - c.m * 2;
    const giant = fitText(first, w, c.fonts.heading, c.fonts.weight, { max: c.u * (wide_(c) ? 26 : 34), min: c.u * 8, maxLines: 1 });
    const second = fitText(rest, w, c.fonts.heading, c.fonts.weight, { max: giant.size * 0.5, min: c.u * 4, maxLines: 2 });
    const top = c.m + c.u * (wide_(c) ? 6 : 12);
    c.sheet.text(c.m, c.m, w, c.kicker.toUpperCase(), c.u * 2, { family: c.fonts.body, weight: 600, color: tone.accent, spacing: c.u * 2 * c.style.tracking });
    c.sheet.text(c.m, top, w, giant.lines, giant.size, { family: c.fonts.heading, weight: c.fonts.weight, color: tone.text, lineHeight: 0.95 });
    const secondY = top + giant.size * 0.98;
    c.sheet.text(c.m, secondY, w, second.lines, second.size, { family: c.fonts.heading, weight: c.fonts.weight, color: tone.accent, lineHeight: 1 });
    const used = secondY + second.lines.length * second.size + c.u * 3;
    stack(c, { x: c.m, y: used, w, h: c.H - used - c.m }, (bw, k) => [taglineBlock(c, bw * (wide_(c) ? 0.6 : 0.9), k, tone, "left", 2), 4, ruleBlock(c, bw, k, tone, "left", 100), 3, detailsBlock(c, bw, k, tone, "left", "row")], "bottom");
  },
};

const framed: PosterLayout = {
  id: "framed",
  name: "Framed",
  draw: (c) => {
    const tone = baseTone(c);
    const inset = c.u * 5;
    const line = Math.max(2, Math.round(c.u * 0.32));
    c.sheet.rect(inset, inset, c.W - inset * 2, c.H - inset * 2, "transparent", { stroke: c.pal.text, strokeWidth: line, opacity: 0.85 });
    c.sheet.rect(inset + c.u * 1.6, inset + c.u * 1.6, c.W - (inset + c.u * 1.6) * 2, c.H - (inset + c.u * 1.6) * 2, "transparent", { stroke: c.pal.accent, strokeWidth: Math.max(1, Math.round(line / 2)), opacity: 0.7 });
    const pad = inset + c.u * 6;
    const area: Region = { x: pad, y: pad, w: c.W - pad * 2, h: c.H - pad * 2 };
    stack(c, area, (w, k) => [
      brandBlock(c, w, k, tone, "center"), 5, ruleBlock(c, w, k, tone, "center", 8), 5, kickerBlock(c, w, k, tone, "center", "plain"), 3,
      titleBlock(c, w, k, tone, "center", { max: 13 }), 3, taglineBlock(c, w * 0.9, k, tone, "center", 2), 6,
      detailsBlock(c, w, k, tone, "center", wide_(c) ? "row" : "row"), 5, buttonBlock(c, w, k, tone, "center", "outline"),
    ], "middle");
  },
};

const circleFocus: PosterLayout = {
  id: "circle-focus",
  name: "Circle Focus",
  draw: (c) => {
    const tone = baseTone(c);
    const on = toneOn(c.pal.accent, c.pal.accent);
    if (wide_(c)) {
      const d = c.H * 1.25;
      const photo = c.variant % 2 === 0;
      if (photo) c.sheet.frame(-d * 0.22, (c.H - d) / 2, d, d, "circle", c.photo(d, d));
      c.sheet.ellipse(-d * 0.22, (c.H - d) / 2, d, d, c.pal.accent, { opacity: photo ? 0.86 : 1 });
      stack(c, { x: c.m, y: c.m, w: d * 0.6, h: c.H - c.m * 2 }, (w, k) => [kickerBlock(c, w, k, on, "left", "plain"), 3, titleBlock(c, w, k, on, "left", { max: 13 })], "middle");
      stack(c, { x: d * 0.82, y: c.m, w: c.W - d * 0.82 - c.m, h: c.H - c.m * 2 }, (w, k) => [taglineBlock(c, w, k, tone, "left"), 4, detailsBlock(c, w, k, tone, "left", "list"), 4, buttonBlock(c, w, k, tone, "left")], "middle");
      return;
    }
    const d = c.W * 1.18;
    const cy = c.H * 0.34;
    const photo = c.variant % 2 === 0;
    if (photo) c.sheet.frame((c.W - d) / 2, cy - d / 2, d, d, "circle", c.photo(d, d));
    c.sheet.ellipse((c.W - d) / 2, cy - d / 2, d, d, c.pal.accent, { opacity: photo ? 0.86 : 1 });
    const inner = d * 0.62;
    stack(c, { x: (c.W - inner) / 2, y: Math.max(c.m, cy - inner * 0.42), w: inner, h: inner * 0.84 }, (w, k) => [kickerBlock(c, w, k, on, "center", "plain"), 3, titleBlock(c, w, k, on, "center", { max: 13 })], "middle");
    const below = cy + d / 2 + c.u * 4;
    stack(c, { x: c.m, y: Math.min(below, c.H * 0.72), w: c.W - c.m * 2, h: c.H - Math.min(below, c.H * 0.72) - c.m }, (w, k) => [taglineBlock(c, w, k, tone, "center", 2), 4, detailsBlock(c, w, k, tone, "center", "row"), 4, buttonBlock(c, w, k, tone, "center")], "middle");
  },
};

const blocks: PosterLayout = {
  id: "blocks",
  name: "Colour Blocks",
  draw: (c) => {
    const tone = baseTone(c);
    const topH = c.H * (wide_(c) ? 0.3 : 0.2);
    const leftW = c.W * 0.62;
    c.sheet.rect(0, 0, leftW, topH, c.pal.accent);
    c.sheet.rect(leftW, 0, c.W - leftW, topH, c.pal.text);
    const onA = toneOn(c.pal.accent, c.pal.accent);
    const onT = toneOn(c.pal.text, c.pal.accent);
    stack(c, { x: c.m, y: 0, w: leftW - c.m * 1.5, h: topH }, (w, k) => [kickerBlock(c, w, k, onA, "left", "plain")], "middle");
    stack(c, { x: leftW + c.u * 3, y: 0, w: c.W - leftW - c.u * 3 - c.m, h: topH }, (w, k) => [brandBlock(c, w, k, onT, "right")], "middle");
    const botH = c.H * (wide_(c) ? 0.3 : 0.2);
    const midY = topH + c.u * 4;
    stack(c, { x: c.m, y: midY, w: c.W - c.m * 2, h: c.H - topH - botH - c.u * 8 }, (w, k) => [titleBlock(c, w, k, tone, "left", { max: 16 }), 3, taglineBlock(c, w * 0.8, k, tone, "left", 2)], "middle");
    const cellW = c.W / c.details.length;
    c.details.forEach(([label, value], i) => {
      const fill = i % 2 === 0 ? c.pal.surface : c.pal.accent2;
      const cellTone = toneOn(fill, c.pal.accent);
      c.sheet.rect(i * cellW, c.H - botH, cellW, botH, fill);
      const size = Math.max(10, c.u * 1.6);
      const v = fitText(value, cellW - c.u * 6, c.fonts.body, 700, { max: c.u * 2.7, min: c.u * 1.7, maxLines: 2 });
      const blockH = size * 1.6 + v.lines.length * v.size * 1.2;
      const ty = c.H - botH + (botH - blockH) / 2;
      c.sheet.text(i * cellW + c.u * 3, ty, cellW - c.u * 6, label.toUpperCase(), size, { family: c.fonts.body, weight: 600, color: cellTone.text, spacing: size * c.style.tracking, opacity: 0.75 });
      c.sheet.text(i * cellW + c.u * 3, ty + size * 1.6, cellW - c.u * 6, v.lines, v.size, { family: c.fonts.body, weight: 700, color: cellTone.text, lineHeight: 1.2 });
    });
  },
};

const photoTop: PosterLayout = {
  id: "photo-top",
  name: "Photo Top",
  photo: true,
  draw: (c) => {
    const tone = baseTone(c);
    if (wide_(c)) {
      const pw = c.W * 0.46;
      c.sheet.image(0, 0, pw, c.H, c.photo(pw, c.H));
      c.sheet.rect(pw - c.u * 0.6, 0, c.u * 1.2, c.H, c.pal.accent);
      stack(c, { x: pw + c.m, y: c.m, w: c.W - pw - c.m * 2, h: c.H - c.m * 2 }, (w, k) => [kickerBlock(c, w, k, tone, "left", "plain"), 3, titleBlock(c, w, k, tone, "left", { max: 12 }), 3, taglineBlock(c, w, k, tone, "left", 2), 4, detailsBlock(c, w, k, tone, "left", "row"), 4, buttonBlock(c, w, k, tone, "left")], "middle");
      return;
    }
    const ph = c.H * 0.46;
    c.sheet.image(0, 0, c.W, ph, c.photo(c.W, ph));
    c.sheet.rect(0, ph - c.u * 0.6, c.W, c.u * 1.2, c.pal.accent);
    stack(c, { x: c.m, y: ph + c.u * 5, w: c.W - c.m * 2, h: c.H - ph - c.u * 5 - c.m }, (w, k) => [kickerBlock(c, w, k, tone, "left", "line"), 3, titleBlock(c, w, k, tone, "left", { max: 12 }), 3, taglineBlock(c, w * 0.9, k, tone, "left", 2), 5, detailsBlock(c, w, k, tone, "left", "row"), 5, buttonBlock(c, w, k, tone, "left")], "middle");
  },
};

const photoFull: PosterLayout = {
  id: "photo-full",
  name: "Full Photo",
  photo: true,
  draw: (c) => {
    c.sheet.image(0, 0, c.W, c.H, c.photo(c.W, c.H));
    c.sheet.rect(0, 0, c.W, c.H, "#06080C", { opacity: 0.62 });
    const tone: Tone = { text: "#FFFFFF", muted: "#FFFFFF", accent: c.pal.mode === "dark" ? c.pal.accent : c.pal.accent2, onAccent: "#FFFFFF" };
    tone.onAccent = onColor(tone.accent);
    const panelH = c.H * (wide_(c) ? 0.3 : 0.2);
    stack(c, { x: c.m, y: c.m, w: c.W - c.m * 2, h: c.H - panelH - c.m * 1.6 }, (w, k) => [brandBlock(c, w, k, tone, "center"), 6, kickerBlock(c, w, k, tone, "center", "pill"), 4, titleBlock(c, w, k, tone, "center", { max: 15 }), 3, taglineBlock(c, w * 0.84, k, tone, "center", 2)], "middle");
    c.sheet.rect(0, c.H - panelH, c.W, panelH, "#06080C", { opacity: 0.72 });
    stack(c, { x: c.m, y: c.H - panelH, w: c.W - c.m * 2, h: panelH }, (w, k) => [detailsBlock(c, w, k, tone, "center", "row")], "middle");
  },
};

const sidebar: PosterLayout = {
  id: "sidebar",
  name: "Sidebar",
  draw: (c) => {
    const tone = baseTone(c);
    const sw = c.W * (wide_(c) ? 0.28 : 0.3);
    c.sheet.rect(0, 0, sw, c.H, c.pal.accent);
    const side = toneOn(c.pal.accent, c.pal.accent);
    const pad = c.u * 4;
    stack(c, { x: pad, y: c.m, w: sw - pad * 2, h: c.H - c.m * 2 }, (w, k) => [brandBlock(c, w, k, side, "left"), 6, detailsBlock(c, w, k, side, "left", "list")], "bottom");
    stack(c, { x: sw + c.u * 5, y: c.m, w: c.W - sw - c.u * 5 - c.m, h: c.H - c.m * 2 }, (w, k) => [kickerBlock(c, w, k, tone, "left", "line"), 4, titleBlock(c, w, k, tone, "left", { max: 13 }), 3, taglineBlock(c, w, k, tone, "left"), 5, buttonBlock(c, w, k, tone, "left")], "middle");
  },
};

const card: PosterLayout = {
  id: "card",
  name: "Floating Card",
  draw: (c) => {
    const cw = c.W * (wide_(c) ? 0.72 : 0.82);
    const ch = c.H * (wide_(c) ? 0.74 : 0.7);
    const cx = (c.W - cw) / 2;
    const cy = (c.H - ch) / 2;
    const radius = c.u * c.style.radius * 1.4;
    c.sheet.rect(cx + c.u * 1.4, cy + c.u * 1.4, cw, ch, c.pal.accent, { radius, opacity: 0.9 });
    c.sheet.rect(cx, cy, cw, ch, c.pal.surface, { radius });
    const tone = toneOn(c.pal.surface, c.pal.accent);
    tone.muted = c.pal.mode === "dark" ? c.pal.muted : "#5B5B66";
    const pad = c.u * 6;
    stack(c, { x: cx + pad, y: cy + pad, w: cw - pad * 2, h: ch - pad * 2 }, (w, k) => [
      kickerBlock(c, w, k, tone, "center", "pill"), 4, titleBlock(c, w, k, tone, "center", { max: 12 }), 3, taglineBlock(c, w, k, tone, "center", 2), 5,
      detailsBlock(c, w, k, tone, "center", "row"), 5, buttonBlock(c, w, k, tone, "center"),
    ], "middle");
  },
};

const numberLed: PosterLayout = {
  id: "number-led",
  name: "Number Led",
  draw: (c) => {
    const tone = baseTone(c);
    const lead = (c.details[0][1].match(/\d+%?/) || ["01"])[0];
    const w = c.W - c.m * 2;
    const numW = wide_(c) ? w * 0.34 : w * 0.6;
    const num = fitText(lead, numW, c.fonts.heading, c.fonts.weight, { max: c.u * (wide_(c) ? 40 : 48), min: c.u * 12, maxLines: 1 });
    c.sheet.text(c.m, c.m - num.size * 0.08, numW, num.lines, num.size, { family: c.fonts.heading, weight: c.fonts.weight, color: tone.accent, lineHeight: 0.92 });
    const afterNum = c.m + num.size * 0.9;
    if (wide_(c)) {
      stack(c, { x: c.m + numW + c.u * 5, y: c.m, w: w - numW - c.u * 5, h: c.H - c.m * 2 }, (bw, k) => [kickerBlock(c, bw, k, tone, "left", "line"), 3, titleBlock(c, bw, k, tone, "left", { max: 12 }), 3, taglineBlock(c, bw, k, tone, "left", 2), 4, detailsBlock(c, bw, k, tone, "left", "row")], "middle");
      return;
    }
    stack(c, { x: c.m, y: afterNum + c.u * 2, w, h: c.H - afterNum - c.u * 2 - c.m }, (bw, k) => [kickerBlock(c, bw, k, tone, "left", "line"), 3, titleBlock(c, bw, k, tone, "left", { max: 13 }), 3, taglineBlock(c, bw * 0.9, k, tone, "left", 2), 5, detailsBlock(c, bw, k, tone, "left", "cards"), 4, buttonBlock(c, bw, k, tone, "left")], "bottom");
  },
};

const bands: PosterLayout = {
  id: "bands",
  name: "Stacked Bands",
  draw: (c) => {
    const tone = baseTone(c);
    const words = titleCase(c.title, true).split(" ");
    const rows = words.length >= 3 ? [words[0], words[1], words.slice(2).join(" ")] : words.length === 2 ? words : [words[0], titleCase(c.kicker, true).split(" ")[0]];
    const top = c.m + c.u * 7;
    const area = c.H * (wide_(c) ? 0.56 : 0.5);
    const bandH = area / rows.length;
    stack(c, { x: c.m, y: c.m, w: c.W - c.m * 2, h: c.u * 6 }, (w, k) => [kickerBlock(c, w, k, tone, "left", "plain")]);
    rows.forEach((word, i) => {
      const fill = i % 2 === 0 ? c.pal.accent : c.pal.surface;
      const bandTone = toneOn(fill, c.pal.accent);
      c.sheet.rect(0, top + i * bandH, c.W, bandH - c.u * 0.8, fill);
      const fit = fitText(word, c.W - c.m * 2, c.fonts.heading, c.fonts.weight, { max: bandH * 0.72, min: c.u * 4, maxLines: 1 });
      c.sheet.text(c.m, top + i * bandH + (bandH - c.u * 0.8 - fit.size) / 2, c.W - c.m * 2, fit.lines, fit.size, { family: c.fonts.heading, weight: c.fonts.weight, color: bandTone.text, lineHeight: 1 });
    });
    const below = top + area + c.u * 3;
    stack(c, { x: c.m, y: below, w: c.W - c.m * 2, h: c.H - below - c.m }, (w, k) => [taglineBlock(c, w * 0.9, k, tone, "left", 2), 4, detailsBlock(c, w, k, tone, "left", "row")], "middle");
  },
};

const ticket: PosterLayout = {
  id: "ticket",
  name: "Ticket",
  draw: (c) => {
    const tone = baseTone(c);
    const stubH = c.H * (wide_(c) ? 0.3 : 0.24);
    const stubY = c.H - stubH - c.m;
    stack(c, { x: c.m, y: c.m, w: c.W - c.m * 2, h: stubY - c.m - c.u * 4 }, (w, k) => [brandBlock(c, w, k, tone, "left"), 6, kickerBlock(c, w, k, tone, "left", "pill"), 4, titleBlock(c, w, k, tone, "left", { max: 15 }), 3, taglineBlock(c, w * 0.86, k, tone, "left", 2)], "middle");
    const radius = c.u * Math.max(1, c.style.radius);
    c.sheet.rect(c.m, stubY, c.W - c.m * 2, stubH, c.pal.surface, { radius, stroke: c.pal.accent, strokeWidth: Math.max(2, Math.round(c.u * 0.3)) });
    const notch = c.u * 4;
    c.sheet.ellipse(c.m - notch / 2, stubY + stubH / 2 - notch / 2, notch, notch, c.pal.bg);
    c.sheet.ellipse(c.W - c.m - notch / 2, stubY + stubH / 2 - notch / 2, notch, notch, c.pal.bg);
    const stubTone = toneOn(c.pal.surface, c.pal.accent);
    stack(c, { x: c.m + c.u * 5, y: stubY, w: c.W - c.m * 2 - c.u * 10, h: stubH }, (w, k) => [detailsBlock(c, w, k, stubTone, "left", "row")], "middle");
  },
};

const splitPanel: PosterLayout = {
  id: "split-panel",
  name: "Split Panel",
  photo: true,
  draw: (c) => {
    const tone = baseTone(c);
    const inset = c.u * 5;
    if (wide_(c)) {
      const pw = c.W * 0.4;
      photoBox(c, c.W - pw - inset, inset, pw, c.H - inset * 2);
      stack(c, { x: c.m, y: c.m, w: c.W - pw - inset - c.m * 2, h: c.H - c.m * 2 }, (w, k) => [kickerBlock(c, w, k, tone, "left", "pill"), 3, titleBlock(c, w, k, tone, "left", { max: 12 }), 3, taglineBlock(c, w, k, tone, "left", 2), 4, detailsBlock(c, w, k, tone, "left", "row")], "middle");
      return;
    }
    const ph = c.H * 0.36;
    stack(c, { x: c.m, y: c.m, w: c.W - c.m * 2, h: c.H - ph - inset - c.m - c.u * 4 }, (w, k) => [kickerBlock(c, w, k, tone, "left", "pill"), 4, titleBlock(c, w, k, tone, "left", { max: 14 }), 3, taglineBlock(c, w * 0.9, k, tone, "left", 2), 5, detailsBlock(c, w, k, tone, "left", "row")], "middle");
    photoBox(c, inset, c.H - ph - inset, c.W - inset * 2, ph);
    const tag = buttonBlock(c, c.W - inset * 2 - c.u * 6, 1, tone, "left");
    tag.draw(inset + c.u * 3, c.H - inset - tag.h - c.u * 3);
  },
};

const photoSplit: PosterLayout = {
  id: "photo-split",
  name: "Photo Split",
  photo: true,
  draw: (c) => {
    const tone = toneOn(c.pal.accent, c.pal.accent);
    tone.accent = tone.text;
    tone.onAccent = c.pal.accent;
    if (wide_(c)) {
      const pw = c.W * 0.5;
      c.sheet.image(0, 0, pw, c.H, c.photo(pw, c.H));
      c.sheet.rect(pw, 0, c.W - pw, c.H, c.pal.accent);
      stack(c, { x: pw + c.m, y: c.m, w: c.W - pw - c.m * 2, h: c.H - c.m * 2 }, (w, k) => [brandBlock(c, w, k, tone, "left"), 4, titleBlock(c, w, k, tone, "left", { max: 12 }), 3, taglineBlock(c, w, k, tone, "left", 2), 4, detailsBlock(c, w, k, tone, "left", "row"), 4, buttonBlock(c, w, k, tone, "left")], "middle");
      return;
    }
    const ph = c.H * 0.5;
    c.sheet.image(0, 0, c.W, ph, c.photo(c.W, ph));
    c.sheet.rect(0, ph, c.W, c.H - ph, c.pal.accent);
    stack(c, { x: c.m, y: ph + c.m * 0.7, w: c.W - c.m * 2, h: c.H - ph - c.m * 1.5 }, (w, k) => [kickerBlock(c, w, k, tone, "left", "plain"), 3, titleBlock(c, w, k, tone, "left", { max: 13 }), 3, taglineBlock(c, w * 0.92, k, tone, "left", 2), 5, detailsBlock(c, w, k, tone, "left", "row"), 5, buttonBlock(c, w, k, tone, "left")], "middle");
  },
};

const photoTint: PosterLayout = {
  id: "photo-tint",
  name: "Tinted Photo",
  photo: true,
  draw: (c) => {
    c.sheet.image(0, 0, c.W, c.H, c.photo(c.W, c.H));
    // A wash of the palette's own background keeps the photo in the design's colours
    c.sheet.rect(0, 0, c.W, c.H, c.pal.bg, { opacity: 0.8 });
    c.sheet.rect(c.m, c.m, c.u * 1.2, c.H - c.m * 2, c.pal.accent);
    const tone = baseTone(c);
    const x = c.m + c.u * 6;
    stack(c, { x, y: c.m, w: (c.W - x - c.m) * (wide_(c) ? 0.7 : 1), h: c.H - c.m * 2 }, (w, k) => [brandBlock(c, w, k, tone, "left"), 6, kickerBlock(c, w, k, tone, "left", "pill"), 4, titleBlock(c, w, k, tone, "left", { max: 15 }), 3, taglineBlock(c, w * 0.9, k, tone, "left", 2), 6, detailsBlock(c, w, k, tone, "left", "list"), 5, buttonBlock(c, w, k, tone, "left")], "middle");
  },
};

const photoFrame: PosterLayout = {
  id: "photo-frame",
  name: "Framed Photo",
  photo: true,
  draw: (c) => {
    const tone = baseTone(c);
    const off = c.u * 2.2;
    if (wide_(c)) {
      const pw = c.W * 0.4;
      const ph = c.H - c.m * 2 - off;
      const px = c.W - c.m - pw;
      c.sheet.rect(px - off, c.m + off, pw, ph, c.pal.accent, { radius: c.style.radius >= 1.2 ? Math.min(pw, ph) * 0.16 : 0 });
      photoBox(c, px, c.m, pw, ph);
      stack(c, { x: c.m, y: c.m, w: px - off - c.m * 1.8, h: c.H - c.m * 2 }, (w, k) => [kickerBlock(c, w, k, tone, "left", "line"), 3, titleBlock(c, w, k, tone, "left", { max: 12 }), 3, taglineBlock(c, w, k, tone, "left", 2), 4, detailsBlock(c, w, k, tone, "left", "row"), 4, buttonBlock(c, w, k, tone, "left")], "middle");
      return;
    }
    const pw = c.W - c.m * 2 - off;
    const ph = c.H * 0.44;
    c.sheet.rect(c.m + off, c.m + off, pw, ph, c.pal.accent, { radius: c.style.radius >= 1.2 ? Math.min(pw, ph) * 0.16 : 0 });
    photoBox(c, c.m, c.m, pw, ph);
    const top = c.m + ph + off + c.u * 5;
    stack(c, { x: c.m, y: top, w: c.W - c.m * 2, h: c.H - top - c.m }, (w, k) => [kickerBlock(c, w, k, tone, "center", "plain"), 3, titleBlock(c, w, k, tone, "center", { max: 12 }), 3, taglineBlock(c, w * 0.86, k, tone, "center", 2), 5, detailsBlock(c, w, k, tone, "center", "row"), 5, buttonBlock(c, w, k, tone, "center")], "middle");
  },
};

const photoDuo: PosterLayout = {
  id: "photo-duo",
  name: "Photo Duo",
  photo: true,
  draw: (c) => {
    const tone = baseTone(c);
    const gap = c.u * 2;
    if (wide_(c)) {
      const pw = c.W * 0.24;
      const x1 = c.W - c.m - pw * 2 - gap;
      const ph = c.H - c.m * 2 - c.u * 8;
      const shape: FrameShape | undefined = c.variant % 3 === 0 ? "arch" : c.variant % 3 === 1 ? "pill" : undefined;
      photoBox(c, x1, c.m, pw, ph, 0, shape);
      photoBox(c, x1 + pw + gap, c.m + c.u * 8, pw, ph, 1, shape);
      stack(c, { x: c.m, y: c.m, w: x1 - c.m * 2, h: c.H - c.m * 2 }, (w, k) => [kickerBlock(c, w, k, tone, "left", "pill"), 3, titleBlock(c, w, k, tone, "left", { max: 12 }), 3, taglineBlock(c, w, k, tone, "left", 2), 4, detailsBlock(c, w, k, tone, "left", "row"), 4, buttonBlock(c, w, k, tone, "left")], "middle");
      return;
    }
    const pw = (c.W - c.m * 2 - gap) / 2;
    const ph = c.H * 0.36;
    const top = c.H - c.m - ph - c.u * 6;
    stack(c, { x: c.m, y: c.m, w: c.W - c.m * 2, h: top - c.m - c.u * 4 }, (w, k) => [kickerBlock(c, w, k, tone, "left", "pill"), 4, titleBlock(c, w, k, tone, "left", { max: 14 }), 3, taglineBlock(c, w * 0.9, k, tone, "left", 2), 5, detailsBlock(c, w, k, tone, "left", "row")], "middle");
    const shape: FrameShape | undefined = c.variant % 3 === 0 ? "arch" : c.variant % 3 === 1 ? "pill" : undefined;
    photoBox(c, c.m, top + c.u * 6, pw, ph, 0, shape);
    photoBox(c, c.m + pw + gap, top, pw, ph, 1, shape);
    c.sheet.rect(c.m + pw + gap, top + ph + c.u * 2, pw, c.u * 1.2, c.pal.accent);
  },
};

const photoStrip: PosterLayout = {
  id: "photo-strip",
  name: "Photo Strip",
  photo: true,
  draw: (c) => {
    const tone = baseTone(c);
    const gap = c.u * 1.6;
    if (wide_(c)) {
      const pw = c.W * 0.3;
      const ph = (c.H - gap * 2) / 3;
      for (let i = 0; i < 3; i++) c.sheet.image(c.W - pw, i * (ph + gap), pw, ph, c.photo(pw, ph, i));
      c.sheet.rect(c.W - pw - gap - c.u * 0.8, 0, c.u * 0.8, c.H, c.pal.accent);
      stack(c, { x: c.m, y: c.m, w: c.W - pw - gap - c.m * 2.4, h: c.H - c.m * 2 }, (w, k) => [kickerBlock(c, w, k, tone, "left", "line"), 3, titleBlock(c, w, k, tone, "left", { max: 12 }), 3, taglineBlock(c, w, k, tone, "left", 2), 4, detailsBlock(c, w, k, tone, "left", "row"), 4, buttonBlock(c, w, k, tone, "left")], "middle");
      return;
    }
    const ph = c.H * 0.24;
    const pw = (c.W - gap * 2) / 3;
    const sy = c.H * 0.36;
    stack(c, { x: c.m, y: c.m, w: c.W - c.m * 2, h: sy - c.m - c.u * 4 }, (w, k) => [kickerBlock(c, w, k, tone, "center", "pill"), 4, titleBlock(c, w, k, tone, "center", { max: 13 }), 3, taglineBlock(c, w * 0.86, k, tone, "center", 2)], "middle");
    if (c.variant % 2 === 0) {
      const d = Math.min(ph, (c.W - c.m * 2 - gap * 4) / 3);
      const left = (c.W - d * 3 - gap * 4) / 2;
      for (let i = 0; i < 3; i++) c.sheet.frame(left + i * (d + gap * 2), sy + (ph - d) / 2, d, d, "circle", c.photo(d, d, i), { stroke: c.pal.accent, strokeWidth: Math.max(2, Math.round(c.u * 0.5)) });
    } else {
      for (let i = 0; i < 3; i++) c.sheet.image(i * (pw + gap), sy, pw, ph, c.photo(pw, ph, i));
    }
    const top = sy + ph + c.u * 5;
    stack(c, { x: c.m, y: top, w: c.W - c.m * 2, h: c.H - top - c.m }, (w, k) => [detailsBlock(c, w, k, tone, "center", "cards", c.pal.surface), 5, buttonBlock(c, w, k, tone, "center"), 4, brandBlock(c, w, k, tone, "center")], "middle");
  },
};

const photoCard: PosterLayout = {
  id: "photo-card",
  name: "Photo Card",
  photo: true,
  draw: (c) => {
    c.sheet.image(0, 0, c.W, c.H, c.photo(c.W, c.H));
    c.sheet.rect(0, 0, c.W, c.H, "#06080C", { opacity: 0.22 });
    const tone = toneOn(c.pal.surface, c.pal.accent);
    // An accent as light (or as dark) as the card itself would not read on it
    if (onColor(c.pal.accent) === onColor(c.pal.surface)) {
      tone.accent = tone.text;
      tone.onAccent = c.pal.surface;
    }
    const pad = c.u * 6;
    const r = c.u * c.style.radius;
    const box: Region = wide_(c)
      ? { x: c.m * 0.8, y: c.m * 0.8, w: c.W * 0.46, h: c.H - c.m * 1.6 }
      : { x: c.m * 0.8, y: c.H * 0.46, w: c.W - c.m * 1.6, h: c.H * 0.54 - c.m * 0.8 };
    c.sheet.rect(box.x, box.y, box.w, box.h, c.pal.surface, { radius: r });
    c.sheet.rect(box.x, box.y, box.w, c.u * 1.2, c.pal.accent, { radius: r });
    stack(c, { x: box.x + pad, y: box.y + pad, w: box.w - pad * 2, h: box.h - pad * 2 }, (w, k) => [kickerBlock(c, w, k, tone, "left", "plain"), 3, titleBlock(c, w, k, tone, "left", { max: 11 }), 3, taglineBlock(c, w, k, tone, "left", 2), 4, detailsBlock(c, w, k, tone, "left", "row"), 4, buttonBlock(c, w, k, tone, "left")], "middle");
  },
};

// 22 layouts share no factor with the 25 styles and 9 sizes, which is what
// lets every style, layout and size combination come up equally often
export const POSTER_LAYOUTS: PosterLayout[] = [
  centeredStack, leftEditorial, topBand, bottomTitle, bigWord, framed, circleFocus, blocks,
  photoTop, photoFull, sidebar, card, numberLed, bands, ticket, splitPanel,
  photoSplit, photoTint, photoFrame, photoDuo, photoStrip, photoCard,
];

// Kept for layouts that want to wrap free text without fitting it
export { wrapText };
