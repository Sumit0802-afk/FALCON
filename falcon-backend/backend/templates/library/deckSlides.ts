/**
 * Presentation slides. A deck is one visual system (palette, type, a recurring
 * motif, a footer) applied to a sequence of slide types, so every slide of a
 * template looks like it belongs with the others.
 */

import { FontPair, Palette, Rng, Sheet, StyleDef, fitText, onColor, pick, titleCase } from "./core";
import { DeckSubcategory, GENERIC_SECTIONS, QUOTES, TEAM_ROLES } from "./deckCatalog";

export type Motif = "bar-left" | "top-rule" | "corner-dot" | "footer-band" | "side-number" | "grid-lines" | "frame" | "corner-block";

export const MOTIFS: Motif[] = ["bar-left", "top-rule", "corner-dot", "footer-band", "side-number", "grid-lines", "frame", "corner-block"];

export interface DeckTheme {
  W: number;
  H: number;
  /** Base unit: one hundredth of the slide height */
  u: number;
  /** Side margin */
  m: number;
  pal: Palette;
  fonts: FontPair;
  style: StyleDef;
  motif: Motif;
  titleAlign: "left" | "center";
  deckTitle: string;
  org: string;
  sub: DeckSubcategory;
  photo: (w: number, h: number, n: number) => string;
  variant: number;
}

export interface SlideCtx extends DeckTheme {
  sheet: Sheet;
  index: number;
  total: number;
  rng: Rng;
}

export interface SlideSpec {
  kind: string;
  title: string;
  /** Which of the deck's content this slide shows (for example which generic section) */
  arg: number;
}

interface TextOpts {
  size: number;
  color: string;
  family?: string;
  weight?: number;
  align?: "left" | "center" | "right";
  maxLines?: number;
  lineHeight?: number;
  spacing?: number;
  opacity?: number;
  min?: number;
}

/** Draws wrapped text, shrinking it if needed to stay within its lines. Returns the height used. */
function put(s: SlideCtx, x: number, y: number, w: number, text: string, o: TextOpts): number {
  const family = o.family ?? s.fonts.body;
  const weight = o.weight ?? 400;
  const lineHeight = o.lineHeight ?? 1.35;
  const fit = fitText(text, w, family, weight, { max: o.size, min: o.min ?? o.size * 0.62, maxLines: o.maxLines ?? 3, spacing: o.spacing ? o.spacing / o.size : 0 });
  s.sheet.text(x, y, w, fit.lines, fit.size, { family, weight, color: o.color, align: o.align, lineHeight, spacing: o.spacing, opacity: o.opacity });
  return fit.lines.length * fit.size * lineHeight;
}

function label(s: SlideCtx, x: number, y: number, w: number, text: string, color: string, align: "left" | "center" | "right" = "left"): number {
  const size = s.u * 1.7;
  s.sheet.text(x, y, w, text.toUpperCase(), size, { family: s.fonts.body, weight: 600, color, align, spacing: size * s.style.tracking });
  return size * 1.3;
}

function radius(s: SlideCtx, scale = 1): number {
  return s.u * s.style.radius * scale;
}

const line = (s: SlideCtx) => Math.max(2, Math.round(s.u * 0.28));

// ─── Recurring chrome ─────────────────────────────────────────────────────────

/** The deck's motif and footer, drawn on every content slide */
function chrome(s: SlideCtx, footer = true): void {
  const { W, H, u, m, pal } = s;
  switch (s.motif) {
    case "bar-left": s.sheet.rect(0, 0, u * 1.4, H, pal.accent); break;
    case "top-rule": s.sheet.rect(m, u * 5, W - m * 2, line(s), pal.accent); break;
    case "corner-dot": s.sheet.ellipse(W - u * 16, -u * 10, u * 26, u * 26, pal.accent, { opacity: 0.9 }); break;
    case "footer-band": s.sheet.rect(0, H - u * 7, W, u * 7, pal.surface); break;
    case "side-number":
      s.sheet.text(W - m - u * 30, H - u * 34, u * 30, String(s.index + 1).padStart(2, "0"), u * 26, { family: s.fonts.heading, weight: s.fonts.weight, color: pal.text, align: "right", lineHeight: 1, opacity: 0.07 });
      break;
    case "grid-lines":
      for (let i = 1; i < 6; i++) s.sheet.rect((W / 6) * i, 0, 1, H, pal.text, { opacity: 0.06 });
      break;
    case "frame": s.sheet.rect(u * 2.5, u * 2.5, W - u * 5, H - u * 5, "transparent", { stroke: pal.accent, strokeWidth: line(s), opacity: 0.5 }); break;
    case "corner-block":
      s.sheet.rect(W - u * 9, 0, u * 9, u * 9, pal.accent);
      s.sheet.rect(W - u * 13.5, 0, u * 4.5, u * 4.5, pal.accent2, { opacity: 0.9 });
      break;
  }
  if (!footer) return;
  const fy = H - u * 5;
  const size = u * 1.5;
  s.sheet.text(m, fy, W * 0.5, s.deckTitle.toUpperCase(), size, { family: s.fonts.body, weight: 600, color: pal.muted, spacing: size * 0.16 });
  s.sheet.text(W - m - u * 20, fy, u * 20, `${String(s.index + 1).padStart(2, "0")} / ${String(s.total).padStart(2, "0")}`, size, { family: s.fonts.body, weight: 600, color: pal.muted, align: "right", spacing: size * 0.1 });
}

/** Slide heading. Returns the y where the slide's content can start. */
function heading(s: SlideCtx, title: string, kicker?: string): number {
  const { m, u, W, pal } = s;
  let y = u * 9;
  const w = W - m * 2 - (s.motif === "corner-dot" || s.motif === "corner-block" ? u * 12 : 0);
  if (kicker) y += label(s, m, y, w, kicker, pal.accent, s.titleAlign) + u * 1.2;
  y += put(s, m, y, w, titleCase(title, s.style.caps), { size: u * 5.6, color: pal.text, family: s.fonts.heading, weight: s.fonts.weight, align: s.titleAlign, maxLines: 2, lineHeight: 1.12, min: u * 3.6 });
  return y + u * 4;
}

const bottom = (s: SlideCtx) => s.H - s.u * 9;

// ─── Slides ───────────────────────────────────────────────────────────────────

/** Title slide with a full-height photograph beside the title */
function photoTitleSlide(s: SlideCtx): void {
  const { W, H, u, m, pal } = s;
  const pw = W * 0.44;
  const right = s.variant % 2 === 0;
  const px = right ? W - pw : 0;
  s.sheet.image(px, 0, pw, H, s.photo(pw, H, 7));
  s.sheet.rect(px, 0, pw, H, pal.bg, { opacity: 0.12 });
  s.sheet.rect(right ? px - u * 0.6 : pw - u * 0.6, 0, u * 1.2, H, pal.accent);
  const x = right ? m : pw + u * 7;
  const w = W - pw - m - u * 7;
  const title = fitText(titleCase(s.deckTitle, s.style.caps), w, s.fonts.heading, s.fonts.weight, { max: u * 10.5, min: u * 5.4, maxLines: 4 });
  const lh = s.style.caps ? 1.02 : 1.08;
  const titleH = title.lines.length * title.size * lh;
  let y = (H - (u * 4 + titleH + u * 3 + u * 8)) / 2;
  y += label(s, x, y, w, s.sub.name, pal.accent) + u * 2;
  s.sheet.text(x, y, w, title.lines, title.size, { family: s.fonts.heading, weight: s.fonts.weight, color: pal.text, lineHeight: lh });
  y += titleH + u * 3;
  put(s, x, y, w, s.sub.subtitle, { size: u * 2.9, color: pal.muted, maxLines: 3 });
  s.sheet.text(x, H - u * 9, w, `${s.org.toUpperCase()}   ·   2026`, u * 1.7, { family: s.fonts.body, weight: 600, color: pal.muted, spacing: u * 1.7 * 0.2 });
}

/** Title slide set over a full-bleed photograph */
function coverTitleSlide(s: SlideCtx): void {
  const { W, H, u, m, pal } = s;
  s.sheet.image(0, 0, W, H, s.photo(W, H, 7));
  s.sheet.rect(0, 0, W, H, "#06080C", { opacity: 0.62 });
  const accent = pal.mode === "dark" ? pal.accent : pal.accent2;
  const align = s.titleAlign;
  const w = align === "center" ? W - m * 2 : W * 0.62;
  const title = fitText(titleCase(s.deckTitle, s.style.caps), w, s.fonts.heading, s.fonts.weight, { max: u * 12, min: u * 6, maxLines: 3 });
  const lh = s.style.caps ? 1.02 : 1.08;
  const titleH = title.lines.length * title.size * lh;
  let y = (H - (u * 4 + titleH + u * 3 + u * 6)) / 2;
  y += label(s, m, y, w, s.sub.name, "#FFFFFF", align) + u * 2;
  s.sheet.text(m, y, w, title.lines, title.size, { family: s.fonts.heading, weight: s.fonts.weight, color: "#FFFFFF", align, lineHeight: lh });
  y += titleH + u * 2.4;
  s.sheet.rect(align === "center" ? W / 2 - u * 6 : m, y, u * 12, line(s) * 1.5, accent);
  put(s, m, y + u * 2.6, w, s.sub.subtitle, { size: u * 3, color: "#FFFFFF", align, maxLines: 2, opacity: 0.86 });
  s.sheet.text(m, H - u * 9, W - m * 2, `${s.org.toUpperCase()}   ·   2026`, u * 1.7, { family: s.fonts.body, weight: 600, color: "#FFFFFF", align, spacing: u * 1.7 * 0.2, opacity: 0.8 });
}

function titleSlide(s: SlideCtx): void {
  // Two decks in three open on a photograph
  if (s.variant % 3 === 1) return photoTitleSlide(s);
  if (s.variant % 3 === 2) return coverTitleSlide(s);
  const { W, H, u, m, pal } = s;
  const center = s.titleAlign === "center";
  const d = H * 1.1;
  if (!center) {
    s.sheet.ellipse(W - d * 0.62 - u * 1.6, (H - d) / 2 - u * 1.6, d + u * 3.2, d + u * 3.2, pal.accent);
    s.sheet.frame(W - d * 0.62, (H - d) / 2, d, d, "circle", s.photo(d, d, 7));
    s.sheet.ellipse(W - d * 0.7, H * 0.7, d * 0.2, d * 0.2, pal.accent2);
  } else {
    s.sheet.rect(0, 0, W, u * 2, pal.accent);
    s.sheet.rect(0, H - u * 2, W, u * 2, pal.accent);
  }
  // Left-aligned titles stop short of the circle on the right, whatever the slide's proportions
  const w = center ? W - m * 2 : Math.min(W * 0.56, W - d * 0.62 - m - u * 4);
  const align = s.titleAlign;
  const title = fitText(titleCase(s.deckTitle, s.style.caps), w, s.fonts.heading, s.fonts.weight, { max: u * 12, min: u * 6, maxLines: 3 });
  const lh = s.style.caps ? 1.02 : 1.08;
  const titleH = title.lines.length * title.size * lh;
  const blockH = u * 4 + titleH + u * 3 + u * 6;
  let y = (H - blockH) / 2;
  y += label(s, m, y, w, s.sub.name, pal.accent, align) + u * 2;
  s.sheet.text(m, y, w, title.lines, title.size, { family: s.fonts.heading, weight: s.fonts.weight, color: pal.text, align, lineHeight: lh });
  y += titleH + u * 3;
  put(s, m, y, w, s.sub.subtitle, { size: u * 3, color: pal.muted, align, maxLines: 2 });
  const fy = H - u * 9;
  s.sheet.text(m, fy, w, `${s.org.toUpperCase()}   ·   2026`, u * 1.7, { family: s.fonts.body, weight: 600, color: pal.muted, align, spacing: u * 1.7 * 0.2 });
}

function agendaSlide(s: SlideCtx, spec: SlideSpec, entries: string[]): void {
  chrome(s);
  const top = heading(s, spec.title, "Overview");
  const { W, m, u, pal } = s;
  const cols = entries.length > 4 ? 2 : 1;
  const perCol = Math.ceil(entries.length / cols);
  const gap = u * 5;
  const colW = (W - m * 2 - gap * (cols - 1)) / cols;
  const rowH = Math.min(u * 12, (bottom(s) - top) / perCol);
  entries.forEach((entry, i) => {
    const col = Math.floor(i / perCol);
    const x = m + col * (colW + gap);
    const y = top + (i % perCol) * rowH;
    s.sheet.text(x, y, u * 9, String(i + 1).padStart(2, "0"), u * 4.4, { family: s.fonts.heading, weight: s.fonts.weight, color: pal.accent, lineHeight: 1.1 });
    put(s, x + u * 10, y + u * 0.9, colW - u * 10, entry, { size: u * 3.1, color: pal.text, weight: 600, maxLines: 1 });
    s.sheet.rect(x, y + rowH - u * 2.2, colW, 1, pal.text, { opacity: 0.16 });
  });
}

function sectionSlide(s: SlideCtx, spec: SlideSpec): void {
  const { W, H, u, m, pal } = s;
  s.sheet.rect(0, 0, W, H, pal.accent);
  const on = onColor(pal.accent);
  const num = String(spec.arg + 1).padStart(2, "0");
  s.sheet.text(m, H * 0.2, W * 0.5, num, u * 22, { family: s.fonts.heading, weight: s.fonts.weight, color: on, lineHeight: 1, opacity: 0.28 });
  const y = H * 0.52;
  s.sheet.rect(m, y - u * 3, u * 10, line(s) * 2, on);
  const d = H * 0.68;
  s.sheet.ellipse(W - m - d - u * 1.4, (H - d) / 2 - u * 1.4, d + u * 2.8, d + u * 2.8, "transparent", { stroke: on, strokeWidth: line(s), opacity: 0.5 });
  s.sheet.frame(W - m - d, (H - d) / 2, d, d, "circle", s.photo(d, d, spec.arg + 3));
  put(s, m, y, W - m * 2 - d - u * 6, titleCase(spec.title, s.style.caps), { size: u * 9, color: on, family: s.fonts.heading, weight: s.fonts.weight, maxLines: 3, lineHeight: 1.08, min: u * 4.6 });
}

function bulletsSlide(s: SlideCtx, spec: SlideSpec): void {
  chrome(s);
  const section = pick(GENERIC_SECTIONS, spec.arg);
  const top = heading(s, section.title, `${s.sub.name}`);
  const { W, m, u, pal } = s;
  const panelW = (W - m * 2) * 0.34;
  const listW = W - m * 2 - panelW - u * 6;
  const rowH = (bottom(s) - top) / section.bullets.length;
  section.bullets.forEach((bullet, i) => {
    const y = top + i * rowH;
    const text = bullet.replace("{topic}", s.sub.topic);
    s.sheet.ellipse(m, y + u * 1.1, u * 1.6, u * 1.6, pal.accent);
    put(s, m + u * 4, y, listW - u * 4, text, { size: u * 3.2, color: pal.text, maxLines: 2, lineHeight: 1.3 });
  });
  const px = W - m - panelW;
  const ph = bottom(s) - top;
  s.sheet.rect(px, top, panelW, ph, pal.surface, { radius: radius(s, 1.2) });
  const panelText = onColor(pal.surface);
  const stat = pick(s.sub.stats, spec.arg);
  const fig = fitText(stat[0], panelW - u * 8, s.fonts.heading, s.fonts.weight, { max: u * 11, min: u * 5, maxLines: 1 });
  const figY = top + (ph - fig.size - u * 9) / 2;
  s.sheet.text(px + u * 4, figY, panelW - u * 8, fig.lines, fig.size, { family: s.fonts.heading, weight: s.fonts.weight, color: pal.accent, lineHeight: 1 });
  put(s, px + u * 4, figY + fig.size + u * 2, panelW - u * 8, stat[1], { size: u * 2.4, color: panelText, maxLines: 3, opacity: 0.8 });
}

function cardsSlide(s: SlideCtx, spec: SlideSpec): void {
  chrome(s);
  const items = spec.arg % 2 === 0 ? s.sub.points : s.sub.steps;
  const top = heading(s, spec.title, s.sub.name);
  const { W, m, u, pal } = s;
  const gap = u * 3;
  const cardW = (W - m * 2 - gap * (items.length - 1)) / items.length;
  const cardH = bottom(s) - top;
  const on = onColor(pal.surface);
  items.forEach(([head, body], i) => {
    const x = m + i * (cardW + gap);
    s.sheet.rect(x, top, cardW, cardH, pal.surface, { radius: radius(s, 1.2) });
    s.sheet.rect(x, top, cardW, u * 0.9, i % 2 ? pal.accent2 : pal.accent, { radius: radius(s, 0.4) });
    const pad = u * 3.4;
    s.sheet.text(x + pad, top + pad + u * 1, cardW - pad * 2, String(i + 1).padStart(2, "0"), u * 3.4, { family: s.fonts.heading, weight: s.fonts.weight, color: pal.accent, lineHeight: 1.1 });
    const hy = top + pad + u * 7.5;
    const hh = put(s, x + pad, hy, cardW - pad * 2, head, { size: u * 3.3, color: on, family: s.fonts.heading, weight: s.fonts.weight, maxLines: 2, lineHeight: 1.18 });
    put(s, x + pad, hy + hh + u * 2, cardW - pad * 2, body, { size: u * 2.3, color: on, maxLines: 5, lineHeight: 1.45, opacity: 0.78 });
  });
}

function statsSlide(s: SlideCtx, spec: SlideSpec): void {
  chrome(s);
  const top = heading(s, spec.title, s.sub.name);
  const { W, m, u, pal } = s;
  const colW = (W - m * 2) / s.sub.stats.length;
  const areaH = bottom(s) - top;
  s.sub.stats.forEach(([figure, caption], i) => {
    const x = m + i * colW;
    if (i > 0) s.sheet.rect(x, top + Math.max(areaH * 0.04, (areaH - u * 34) / 2), 1, Math.min(areaH * 0.9, u * 34), pal.text, { opacity: 0.18 });
    const fig = fitText(figure, colW - u * 8, s.fonts.heading, s.fonts.weight, { max: u * 14, min: u * 6, maxLines: 1 });
    const fy = top + Math.max(areaH * 0.08, (areaH - u * 30) / 2);
    s.sheet.text(x + u * 4, fy, colW - u * 8, fig.lines, fig.size, { family: s.fonts.heading, weight: s.fonts.weight, color: i === 1 ? pal.accent2 : pal.accent, lineHeight: 1 });
    s.sheet.rect(x + u * 4, fy + fig.size + u * 2.4, u * 6, line(s), pal.text, { opacity: 0.5 });
    put(s, x + u * 4, fy + fig.size + u * 5, colW - u * 8, caption, { size: u * 2.7, color: pal.muted, maxLines: 3 });
  });
}

function imageTextSlide(s: SlideCtx, spec: SlideSpec): void {
  const { W, H, u, m, pal } = s;
  const left = spec.arg % 2 === 0;
  const pw = W * 0.44;
  if (s.style.radius >= 1.2) {
    const fw = pw - u * 10;
    const fh = H - u * 20;
    const fx = left ? u * 6 : W - pw + u * 4;
    s.sheet.ellipse(fx + fw - u * 9, u * 10 + fh - u * 9, u * 14, u * 14, pal.accent2, { opacity: 0.9 });
    s.sheet.rect(fx - u * 1.6, u * 10 + u * 1.6, fw, fh, pal.accent, { radius: Math.min(fw, fh) * 0.16 });
    s.sheet.frame(fx, u * 10, fw, fh, "rounded-rect", s.photo(fw, fh, spec.arg));
  } else {
    s.sheet.image(left ? 0 : W - pw, 0, pw, H, s.photo(pw, H, spec.arg));
    s.sheet.rect(left ? pw - u * 0.5 : W - pw - u * 0.5, 0, u, H, pal.accent);
  }
  const x = left ? pw + u * 7 : m;
  const w = W - pw - u * 7 - m;
  let y = u * 14;
  y += label(s, x, y, w, s.sub.name, pal.accent) + u * 1.5;
  y += put(s, x, y, w, titleCase(spec.title, s.style.caps), { size: u * 5.4, color: pal.text, family: s.fonts.heading, weight: s.fonts.weight, maxLines: 2, lineHeight: 1.12 }) + u * 3;
  const point = pick(s.sub.points, spec.arg);
  y += put(s, x, y, w, `${point[0]}. ${point[1]}.`, { size: u * 2.8, color: pal.muted, maxLines: 4, lineHeight: 1.5 }) + u * 3.5;
  s.sub.steps.slice(0, 3).forEach(([head]) => {
    s.sheet.rect(x, y + u * 1.3, u * 2.4, line(s), pal.accent);
    y += put(s, x + u * 4.5, y, w - u * 4.5, head, { size: u * 2.7, color: pal.text, weight: 600, maxLines: 1 }) + u * 1.8;
  });
  const size = u * 1.5;
  s.sheet.text(x, H - u * 5, w, `${String(s.index + 1).padStart(2, "0")} / ${String(s.total).padStart(2, "0")}`, size, { family: s.fonts.body, weight: 600, color: pal.muted, align: left ? "right" : "left" });
}

function timelineSlide(s: SlideCtx, spec: SlideSpec): void {
  chrome(s);
  const top = heading(s, spec.title, s.sub.name);
  const { W, m, u, pal } = s;
  const steps = s.sub.steps;
  const colW = (W - m * 2) / steps.length;
  const railY = top + Math.max(u * 4, (bottom(s) - top - u * 28) / 2);
  s.sheet.rect(m, railY, W - m * 2, line(s), pal.text, { opacity: 0.25 });
  steps.forEach(([head, body], i) => {
    const x = m + i * colW;
    const d = u * 4.4;
    s.sheet.ellipse(x, railY - d / 2 + line(s) / 2, d, d, i % 2 ? pal.accent2 : pal.accent);
    s.sheet.text(x, railY - d / 2 + line(s) / 2 + (d - u * 2 * 1.2) / 2, d, String(i + 1), u * 2, { family: s.fonts.body, weight: 700, color: onColor(i % 2 ? pal.accent2 : pal.accent), align: "center" });
    const ty = railY + u * 6;
    const hh = put(s, x, ty, colW - u * 4, head, { size: u * 3.4, color: pal.text, family: s.fonts.heading, weight: s.fonts.weight, maxLines: 2, lineHeight: 1.18 });
    put(s, x, ty + hh + u * 1.6, colW - u * 4, body, { size: u * 2.4, color: pal.muted, maxLines: 4, lineHeight: 1.45 });
  });
}

function chartSlide(s: SlideCtx, spec: SlideSpec): void {
  chrome(s);
  const top = heading(s, spec.title, s.sub.name);
  const { W, m, u, pal } = s;
  const chartW = (W - m * 2) * 0.62;
  const chartH = bottom(s) - top - u * 5;
  const labels = spec.arg % 2 === 0 ? ["2022", "2023", "2024", "2025", "2026"] : ["Q1", "Q2", "Q3", "Q4", "Q1", "Q2"];
  const base = 28 + s.rng() * 14;
  const values = labels.map((_, i) => Math.round(base + i * (9 + s.rng() * 6) + s.rng() * 6));
  const max = Math.max(...values);
  const slot = chartW / labels.length;
  const barW = slot * 0.56;
  s.sheet.rect(m, top + chartH, chartW, line(s), pal.text, { opacity: 0.4 });
  for (let g = 1; g <= 3; g++) s.sheet.rect(m, top + chartH - (chartH * 0.9 * g) / 3, chartW, 1, pal.text, { opacity: 0.1 });
  values.forEach((value, i) => {
    const h = (value / max) * chartH * 0.9;
    const x = m + i * slot + (slot - barW) / 2;
    const last = i === values.length - 1;
    s.sheet.rect(x, top + chartH - h, barW, h, last ? pal.accent2 : pal.accent, { radius: radius(s, 0.5), opacity: last ? 1 : 0.88 });
    s.sheet.text(x - slot * 0.2, top + chartH - h - u * 3.6, barW + slot * 0.4, String(value), u * 2.2, { family: s.fonts.body, weight: 700, color: pal.text, align: "center" });
    s.sheet.text(x - slot * 0.2, top + chartH + u * 1.6, barW + slot * 0.4, labels[i], u * 1.9, { family: s.fonts.body, weight: 600, color: pal.muted, align: "center" });
  });
  const nx = m + chartW + u * 6;
  const nw = W - m - nx;
  const stat = pick(s.sub.stats, spec.arg + 1);
  let y = top + u * 2;
  y += label(s, nx, y, nw, "Takeaway", pal.accent) + u * 2;
  const fig = fitText(stat[0], nw, s.fonts.heading, s.fonts.weight, { max: u * 9, min: u * 4.5, maxLines: 1 });
  s.sheet.text(nx, y, nw, fig.lines, fig.size, { family: s.fonts.heading, weight: s.fonts.weight, color: pal.text, lineHeight: 1 });
  y += fig.size + u * 2;
  y += put(s, nx, y, nw, stat[1], { size: u * 2.6, color: pal.muted, maxLines: 3 }) + u * 3;
  put(s, nx, y, nw, "Replace these bars with your own figures: every bar and label is editable.", { size: u * 2, color: pal.muted, maxLines: 4, opacity: 0.8 });
}

function twoColumnSlide(s: SlideCtx, spec: SlideSpec): void {
  chrome(s);
  const top = heading(s, spec.title, s.sub.name);
  const { W, m, u, pal } = s;
  const gap = u * 7;
  const colW = (W - m * 2 - gap) / 2;
  const pair = [pick(s.sub.points, spec.arg), pick(s.sub.points, spec.arg + 2)];
  pair.forEach(([head, body], i) => {
    const x = m + i * (colW + gap);
    s.sheet.rect(x, top, u * 8, line(s) * 1.5, i ? pal.accent2 : pal.accent);
    let y = top + u * 3.5;
    y += put(s, x, y, colW, head, { size: u * 4, color: pal.text, family: s.fonts.heading, weight: s.fonts.weight, maxLines: 2, lineHeight: 1.15 }) + u * 2.4;
    y += put(s, x, y, colW, `${body}. Use this space to explain the idea in two or three plain sentences, with an example your audience will recognise.`, { size: u * 2.5, color: pal.muted, maxLines: 6, lineHeight: 1.55 }) + u * 3;
    const step = pick(s.sub.steps, spec.arg + i);
    s.sheet.rect(x, y, colW, u * 9, pal.surface, { radius: radius(s) });
    put(s, x + u * 3, y + u * 2.9, colW - u * 6, `${step[0]}: ${step[1]}`, { size: u * 2.3, color: onColor(pal.surface), weight: 600, maxLines: 2, lineHeight: 1.3 });
  });
}

function quoteSlide(s: SlideCtx, spec: SlideSpec): void {
  chrome(s);
  const { W, H, u, m, pal } = s;
  const w = W - m * 2 - u * 16;
  const x = (W - w) / 2;
  s.sheet.text(x - u * 2, H * 0.14, u * 20, "“", u * 30, { family: s.fonts.heading, weight: s.fonts.weight, color: pal.accent, lineHeight: 1, opacity: 0.9 });
  const quote = pick(QUOTES, spec.arg + s.variant);
  const fit = fitText(quote, w, s.fonts.heading, s.fonts.weight, { max: u * 6.4, min: u * 3.6, maxLines: 4 });
  const qh = fit.lines.length * fit.size * 1.22;
  const y = (H - qh) / 2 + u * 2;
  s.sheet.text(x, y, w, fit.lines, fit.size, { family: s.fonts.heading, weight: s.fonts.weight, color: pal.text, lineHeight: 1.22 });
  s.sheet.rect(x, y + qh + u * 4, u * 8, line(s), pal.accent);
  s.sheet.text(x, y + qh + u * 6, w, `${s.org}  ·  ${s.sub.name}`.toUpperCase(), u * 1.8, { family: s.fonts.body, weight: 600, color: pal.muted, spacing: u * 1.8 * 0.2 });
}

function tableSlide(s: SlideCtx, spec: SlideSpec): void {
  chrome(s);
  const top = heading(s, spec.title, s.sub.name);
  const { W, m, u, pal } = s;
  const headers = ["Phase", "Focus", "Owner", "Timing"];
  const owners = TEAM_ROLES.map(([, role]) => role);
  const timings = ["Weeks 1-2", "Weeks 3-6", "Weeks 7-10", "Weeks 11-12"];
  const rows = s.sub.steps.map(([head, body], i) => [head, body, pick(owners, i + spec.arg), timings[i % timings.length]]);
  const widths = [0.18, 0.42, 0.2, 0.2];
  const tableW = W - m * 2;
  const rowH = Math.min(u * 11, (bottom(s) - top) / (rows.length + 1));
  s.sheet.rect(m, top, tableW, rowH, pal.accent, { radius: radius(s, 0.6) });
  const onHead = onColor(pal.accent);
  let x = m;
  headers.forEach((header, c) => {
    s.sheet.text(x + u * 2.5, top + (rowH - u * 2 * 1.2) / 2, tableW * widths[c] - u * 5, header.toUpperCase(), u * 2, { family: s.fonts.body, weight: 700, color: onHead, spacing: u * 2 * 0.14 });
    x += tableW * widths[c];
  });
  rows.forEach((row, r) => {
    const y = top + rowH * (r + 1);
    if (r % 2 === 1) s.sheet.rect(m, y, tableW, rowH, pal.surface, { opacity: 0.7 });
    s.sheet.rect(m, y + rowH - 1, tableW, 1, pal.text, { opacity: 0.14 });
    let cx = m;
    row.forEach((cell, c) => {
      const cw = tableW * widths[c] - u * 5;
      const fit = fitText(cell, cw, s.fonts.body, c === 0 ? 700 : 400, { max: u * 2.4, min: u * 1.7, maxLines: 2 });
      s.sheet.text(cx + u * 2.5, y + (rowH - fit.lines.length * fit.size * 1.3) / 2, cw, fit.lines, fit.size, { family: s.fonts.body, weight: c === 0 ? 700 : 400, color: c === 0 ? pal.text : pal.muted, lineHeight: 1.3 });
      cx += tableW * widths[c];
    });
  });
}

function teamSlide(s: SlideCtx, spec: SlideSpec): void {
  chrome(s);
  const top = heading(s, spec.title, s.sub.name);
  const { W, m, u, pal } = s;
  const people = [0, 1, 2, 3].map((i) => pick(TEAM_ROLES, i + spec.arg + s.variant));
  const colW = (W - m * 2) / people.length;
  const d = Math.min(colW * 0.56, (bottom(s) - top) * 0.5);
  const blockTop = top + Math.max(0, (bottom(s) - top - d - u * 12) / 2);
  people.forEach(([name, role], i) => {
    const cx = m + i * colW + colW / 2;
    const fill = i % 2 ? pal.accent2 : pal.accent;
    s.sheet.ellipse(cx - d / 2, blockTop, d, d, fill);
    const initials = name.split(" ").map((p) => p[0]).join("");
    s.sheet.text(cx - d / 2, blockTop + (d - u * 6 * 1.1) / 2, d, initials, u * 6, { family: s.fonts.heading, weight: s.fonts.weight, color: onColor(fill), align: "center", lineHeight: 1.1 });
    put(s, cx - colW / 2 + u * 2, blockTop + d + u * 3, colW - u * 4, name, { size: u * 3, color: pal.text, family: s.fonts.heading, weight: s.fonts.weight, align: "center", maxLines: 1 });
    put(s, cx - colW / 2 + u * 2, blockTop + d + u * 7.4, colW - u * 4, role, { size: u * 2.2, color: pal.muted, align: "center", maxLines: 1 });
  });
}

function comparisonSlide(s: SlideCtx, spec: SlideSpec): void {
  chrome(s);
  const top = heading(s, spec.title, s.sub.name);
  const { W, m, u, pal } = s;
  const gap = u * 3;
  const colW = (W - m * 2 - gap) / 2;
  const h = bottom(s) - top;
  const sides: [string, string, string[]][] = [
    ["Before", pal.surface, pick(GENERIC_SECTIONS, 4).bullets],
    ["After", pal.accent, s.sub.points.slice(0, 3).map(([head, body]) => `${head}: ${body}`)],
  ];
  sides.forEach(([name, fill, bullets], i) => {
    const x = m + i * (colW + gap);
    const on = onColor(fill);
    s.sheet.rect(x, top, colW, h, fill, { radius: radius(s, 1.2) });
    const pad = u * 4;
    s.sheet.text(x + pad, top + pad, colW - pad * 2, name.toUpperCase(), u * 2, { family: s.fonts.body, weight: 700, color: on, spacing: u * 2 * 0.22, opacity: 0.75 });
    const rowH = (h - pad * 2 - u * 5) / bullets.length;
    bullets.forEach((bullet, r) => {
      const y = top + pad + u * 5 + r * rowH;
      s.sheet.rect(x + pad, y + u * 1.5, u * 2, line(s), on, { opacity: 0.7 });
      put(s, x + pad + u * 3.6, y, colW - pad * 2 - u * 3.6, bullet, { size: u * 2.6, color: on, maxLines: 3, lineHeight: 1.35 });
    });
  });
}

function bigNumberSlide(s: SlideCtx, spec: SlideSpec): void {
  chrome(s);
  const { W, H, u, m, pal } = s;
  const stat = pick(s.sub.stats, spec.arg);
  const w = W - m * 2;
  const fig = fitText(stat[0], w * 0.62, s.fonts.heading, s.fonts.weight, { max: u * 34, min: u * 14, maxLines: 1 });
  const y = (H - fig.size - u * 12) / 2;
  label(s, m, y - u * 4, w, spec.title, pal.accent, s.titleAlign);
  s.sheet.text(m, y, w, fig.lines, fig.size, { family: s.fonts.heading, weight: s.fonts.weight, color: pal.accent, align: s.titleAlign, lineHeight: 1 });
  put(s, s.titleAlign === "center" ? m + w * 0.15 : m, y + fig.size + u * 3, w * 0.7, `${stat[1]}. Explain in one sentence why this figure matters for ${s.sub.topic}.`, { size: u * 3.1, color: pal.text, align: s.titleAlign, maxLines: 3 });
}

function closingSlide(s: SlideCtx): void {
  const { W, H, u, m, pal } = s;
  const center = s.titleAlign === "center";
  // Decks that open on a photograph close on one too, faded into the background
  if (s.variant % 3 !== 0) {
    s.sheet.image(0, 0, W, H - u * 22, s.photo(W, H - u * 22, 11));
    s.sheet.rect(0, 0, W, H - u * 22, pal.bg, { opacity: 0.84 });
  }
  s.sheet.rect(0, H - u * 22, W, u * 22, pal.surface);
  s.sheet.rect(0, H - u * 22, W, line(s) * 1.5, pal.accent);
  const w = W - m * 2;
  const align = s.titleAlign;
  const y = H * 0.22;
  label(s, m, y, w, s.deckTitle, pal.accent, align);
  put(s, m, y + u * 5, w, titleCase("Thank You", s.style.caps), { size: u * 14, color: pal.text, family: s.fonts.heading, weight: s.fonts.weight, align, maxLines: 1, lineHeight: 1.05 });
  put(s, center ? m + w * 0.15 : m, y + u * 23, w * 0.7, "Questions and feedback are welcome.", { size: u * 3.2, color: pal.muted, align, maxLines: 2 });
  const on = onColor(pal.surface);
  const contacts = ["hello@yourcompany.com", "www.yourcompany.com", "+91 00000 00000"];
  const colW = w / contacts.length;
  contacts.forEach((contact, i) => {
    s.sheet.text(m + i * colW, H - u * 12.5, colW, contact, u * 2.4, { family: s.fonts.body, weight: 600, color: on, align: center ? "center" : "left" });
  });
}

// ─── Sequencing ───────────────────────────────────────────────────────────────

const TITLES: Record<string, string[]> = {
  cards: ["Key Points", "Highlights", "What Matters Most", "The Essentials"],
  stats: ["By The Numbers", "Results At A Glance", "Key Figures"],
  timeline: ["Roadmap", "How It Works", "The Process", "Timeline"],
  imageText: ["In Focus", "A Closer Look", "The Story"],
  chart: ["Growth Over Time", "Performance", "The Trend"],
  twoColumn: ["Two Things To Know", "In Detail", "Side By Side"],
  quote: ["In A Sentence"],
  table: ["Plan At A Glance", "Schedule", "Who Does What"],
  team: ["The Team", "Who Is Involved", "Our People"],
  comparison: ["Before & After", "What Changes"],
  bigNumber: ["The Headline Number", "One Figure To Remember"],
};

const SECTION_NAMES = ["Overview", "The Details", "Evidence", "The Plan", "Outlook", "Wrap Up"];

/** The slide order for a deck of the given length */
export function planDeck(length: number, rng: Rng, variant: number): SlideSpec[] {
  const lead = ["cards", "stats", "timeline"];
  const rest = ["imageText", "chart", "twoColumn", "bullets", "table", "comparison", "quote", "bullets", "team", "bigNumber", "bullets", "imageText", "bullets", "chart", "cards", "bullets", "stats", "bullets", "twoColumn", "bullets", "quote", "bullets", "timeline", "bullets", "bullets", "table"];
  // A light shuffle so decks of the same length do not all run in the same order
  for (let i = rest.length - 1; i > 0; i--) {
    const j = i - Math.floor(rng() * Math.min(4, i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  const pool = [...lead, ...rest];
  const withAgenda = length >= 8;
  const sections = length >= 12 ? Math.min(SECTION_NAMES.length, Math.floor(length / 5)) : 0;
  const contentCount = length - 2 - (withAgenda ? 1 : 0) - sections;
  const seen: Record<string, number> = {};
  const content: SlideSpec[] = pool.slice(0, contentCount).map((kind) => {
    const n = seen[kind] ?? 0;
    seen[kind] = n + 1;
    if (kind === "bullets") return { kind, title: pick(GENERIC_SECTIONS, n + variant).title, arg: n + variant };
    return { kind, title: pick(TITLES[kind], n + variant), arg: n + variant };
  });
  const body: SlideSpec[] = [];
  const per = sections ? Math.ceil(content.length / sections) : content.length;
  content.forEach((slide, i) => {
    if (sections && i % per === 0) body.push({ kind: "section", title: SECTION_NAMES[Math.floor(i / per)], arg: Math.floor(i / per) });
    body.push(slide);
  });
  return [
    { kind: "title", title: "Title", arg: 0 },
    ...(withAgenda ? [{ kind: "agenda", title: "Agenda", arg: 0 }] : []),
    ...body,
    { kind: "closing", title: "Thank You", arg: 0 },
  ];
}

export function drawSlide(s: SlideCtx, spec: SlideSpec, plan: SlideSpec[]): void {
  switch (spec.kind) {
    case "title": return titleSlide(s);
    case "agenda": {
      const sections = plan.filter((p) => p.kind === "section").map((p) => p.title);
      const entries = sections.length >= 3 ? sections : plan.filter((p) => !["title", "agenda", "closing", "section"].includes(p.kind)).map((p) => p.title);
      return agendaSlide(s, spec, [...new Set(entries)].slice(0, 6));
    }
    case "section": return sectionSlide(s, spec);
    case "bullets": return bulletsSlide(s, spec);
    case "cards": return cardsSlide(s, spec);
    case "stats": return statsSlide(s, spec);
    case "imageText": return imageTextSlide(s, spec);
    case "timeline": return timelineSlide(s, spec);
    case "chart": return chartSlide(s, spec);
    case "twoColumn": return twoColumnSlide(s, spec);
    case "quote": return quoteSlide(s, spec);
    case "table": return tableSlide(s, spec);
    case "team": return teamSlide(s, spec);
    case "comparison": return comparisonSlide(s, spec);
    case "bigNumber": return bigNumberSlide(s, spec);
    default: return closingSlide(s);
  }
}
