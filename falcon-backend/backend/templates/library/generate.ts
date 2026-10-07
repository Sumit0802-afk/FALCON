/**
 * Turns a template number into a finished design.
 *
 * Template n of a type always produces the same design, so the library stores
 * only what is needed to find a template (its description and attributes) and
 * rebuilds the design itself whenever it is previewed or used.
 *
 * Numbers are spread over the combinations of subject, style, layout, size and
 * palette in a way that never repeats a combination, so no two templates of a
 * type share the same look for the same subject.
 */

import { photoUrl, CATEGORY_PHOTOS } from "../email/photos";
import {
  FONT_BY_ID, LibPage, PALETTE_BY_ID, STYLES, Sheet, backgroundCss, decorate, hashString, makeBackground, pick, rngFrom,
} from "./core";
import { DETAIL_SETS, POSTER_GROUPS, POSTER_SIZES, POSTER_SUBCATEGORIES } from "./posterCatalog";
import { POSTER_LAYOUTS, PosterCtx } from "./posterLayouts";
import { DECK_FORMATS, DECK_GROUPS, DECK_LENGTHS, DECK_SUBCATEGORIES } from "./deckCatalog";
import { DeckTheme, MOTIFS, drawSlide, planDeck } from "./deckSlides";
import { CERT_GROUPS, buildCertificate, certificateRecipe } from "./certificates";

export type LibraryType = "poster" | "presentation" | "certificate";

export const LIBRARY_TYPES: LibraryType[] = ["poster", "presentation", "certificate"];

export const LIBRARY_COUNTS: Record<LibraryType, number> = { poster: 100000, presentation: 100000, certificate: 20000 };

/** The start of every id of a type, as in POSTER-000001 */
export const ID_PREFIX: Record<LibraryType, string> = { poster: "POSTER", presentation: "PRESENTATION", certificate: "CERTIFICATE" };

const BRANDS = ["Northwind Labs", "Studio Meridian", "Atlas & Co", "Brightline", "Kite Collective", "Orbit Works", "Harbor Institute", "Lumen Group", "Cedar & Stone", "Pixel Foundry"];

/** A step that shares no factor with the number of combinations visits every one of them once */
const STEP = 7919;

// 25 styles, 22 layouts and 9 sizes share no common factor, so a slot's remainders by
// each pick one of every style/layout/size combination exactly once per 3,600 slots.
// That keeps every pairing a user can filter by evenly stocked.
const POSTER_CYCLE = STYLES.length * POSTER_LAYOUTS.length * POSTER_SIZES.length;
const POSTER_SPACE = POSTER_CYCLE * 6;
// Likewise 25 styles, 8 deck lengths and 3 palette pairs for presentations
const DECK_CYCLE = STYLES.length * DECK_LENGTHS.length * 3;
const DECK_SPACE = DECK_CYCLE * MOTIFS.length * DECK_FORMATS.length * 2 * 2;

export function templateId(type: LibraryType, seq: number): string {
  return `${ID_PREFIX[type]}-${String(seq).padStart(6, "0")}`;
}

export function parseTemplateId(id: string): { type: LibraryType; seq: number } | null {
  const match = /^(POSTER|PRESENTATION|CERTIFICATE)-(\d{6})$/.exec(id);
  if (!match) return null;
  const type = LIBRARY_TYPES.find((t) => ID_PREFIX[t] === match[1])!;
  const seq = Number(match[2]);
  return seq >= 1 && seq <= LIBRARY_COUNTS[type] ? { type, seq } : null;
}

function photoList(key: string): string[] {
  return CATEGORY_PHOTOS[key] || CATEGORY_PHOTOS.events || [];
}

// ─── Posters ──────────────────────────────────────────────────────────────────

function posterRecipe(seq: number) {
  const i = seq - 1;
  const sub = POSTER_SUBCATEGORIES[i % POSTER_SUBCATEGORIES.length];
  const turn = Math.floor(i / POSTER_SUBCATEGORIES.length);
  const slot = (turn * STEP + (hashString(sub.slug) % POSTER_SPACE)) % POSTER_SPACE;
  const style = STYLES[slot % STYLES.length];
  const layout = POSTER_LAYOUTS[slot % POSTER_LAYOUTS.length];
  const size = POSTER_SIZES[slot % POSTER_SIZES.length];
  const palette = PALETTE_BY_ID[style.palettes[Math.floor(slot / POSTER_CYCLE) % 6]];
  const h = hashString(`poster:${seq}`);
  return {
    sub, style, layout, size, palette, h,
    fonts: FONT_BY_ID[pick(style.fonts, h)],
    decoration: pick(style.decorations, h >>> 3),
    background: pick(style.backgrounds, h >>> 6),
  };
}

export function buildPoster(seq: number): LibPage[] {
  const r = posterRecipe(seq);
  const { width: W, height: H } = r.size;
  const rng = rngFrom(r.h);
  const sheet = new Sheet(`p${seq}`);
  // A wide banner is read from further away than its short side suggests, so its type runs larger
  const u = (Math.min(W, H) / 100) * (W > H * 1.25 ? 1.3 : 1);
  const bg = makeBackground(r.background, r.palette, r.h >>> 9);
  // Layouts that are built on a photo carry their own backdrop
  if (!["photo-full", "photo-tint", "photo-card"].includes(r.layout.id)) decorate(sheet, r.decoration, W, H, r.palette, rng);

  const photos = photoList(r.sub.photos);
  const ctx: PosterCtx = {
    W, H, u, m: u * 7,
    orient: W > H * 1.25 ? "landscape" : Math.abs(W - H) < 4 ? "square" : "portrait",
    pal: r.palette, fonts: r.fonts, style: r.style, sheet, rng,
    kicker: pick(r.sub.kickers, r.h >>> 2),
    title: pick(r.sub.titles, r.h >>> 5),
    tagline: pick(r.sub.taglines, r.h >>> 8),
    cta: pick(r.sub.ctas, r.h >>> 11),
    details: pick(DETAIL_SETS[r.sub.details], r.h >>> 14),
    brand: pick(BRANDS, r.h >>> 17),
    photo: (w, h, n = 0) => photoUrl(pick(photos, (r.h >>> 4) + n), Math.min(1600, w), Math.min(1600, w) * (h / w)),
    variant: r.h % 97,
  };
  r.layout.draw(ctx);
  return [{ name: "Page 1", width: W, height: H, background: backgroundCss(bg), backgroundSpec: bg, elements: sheet.elements }];
}

// ─── Presentations ────────────────────────────────────────────────────────────

function deckRecipe(seq: number) {
  const i = seq - 1;
  const sub = DECK_SUBCATEGORIES[i % DECK_SUBCATEGORIES.length];
  const turn = Math.floor(i / DECK_SUBCATEGORIES.length);
  const slot = (turn * STEP + (hashString(sub.slug) % DECK_SPACE)) % DECK_SPACE;
  const style = STYLES[slot % STYLES.length];
  const length = DECK_LENGTHS[slot % DECK_LENGTHS.length];
  let rest = Math.floor(slot / DECK_CYCLE);
  const take = (n: number) => { const v = rest % n; rest = Math.floor(rest / n); return v; };
  const motif = MOTIFS[take(MOTIFS.length)];
  const format = DECK_FORMATS[take(DECK_FORMATS.length)];
  const titleAlign = take(2) === 0 ? "left" as const : "center" as const;
  const palette = PALETTE_BY_ID[style.palettes[(slot % 3) * 2 + take(2)]];
  const h = hashString(`deck:${seq}`);
  return { sub, style, motif, palette, length, format, titleAlign, h, fonts: FONT_BY_ID[pick(style.fonts, h)], background: pick(style.backgrounds, h >>> 6) };
}

/** Builds a deck. `limit` stops after that many slides, which keeps previews quick. */
export function buildDeck(seq: number, limit = Infinity): LibPage[] {
  const r = deckRecipe(seq);
  const { width: W, height: H } = r.format;
  const u = H / 100;
  const bg = makeBackground(r.background, r.palette, r.h >>> 9);
  const photos = photoList(r.sub.photos);
  const theme: DeckTheme = {
    W, H, u, m: W * 0.06, pal: r.palette, fonts: r.fonts, style: r.style, motif: r.motif, titleAlign: r.titleAlign,
    deckTitle: pick(r.sub.titles, r.h >>> 2), org: pick(BRANDS, r.h >>> 17), sub: r.sub,
    photo: (w, h, n) => photoUrl(pick(photos, (r.h >>> 4) + n), Math.min(1600, w), Math.min(1600, w) * (h / w)),
    variant: r.h % 97,
  };
  const plan = planDeck(r.length, rngFrom(r.h), theme.variant);
  const pages: LibPage[] = [];
  plan.slice(0, limit).forEach((spec, index) => {
    const sheet = new Sheet(`d${seq}s${index + 1}`);
    drawSlide({ ...theme, sheet, index, total: plan.length, rng: rngFrom(r.h + index * 7919) }, spec, plan);
    pages.push({ name: `${index + 1}. ${spec.title}`, width: W, height: H, background: backgroundCss(bg), backgroundSpec: bg, elements: sheet.elements });
  });
  return pages;
}

export function buildTemplate(type: LibraryType, seq: number, limit = Infinity): LibPage[] {
  if (type === "certificate") return buildCertificate(seq);
  return type === "poster" ? buildPoster(seq) : buildDeck(seq, limit);
}

// ─── Catalogue entries ────────────────────────────────────────────────────────

export interface LibraryEntry {
  id: string;
  type: LibraryType;
  seq: number;
  title: string;
  description: string;
  keywords: string;
  category: string;
  categoryName: string;
  subcategory: string;
  subcategoryName: string;
  style: string;
  styleName: string;
  industry: string;
  colorFamily: string;
  mode: string;
  orientation: string;
  width: number;
  height: number;
  sizeId: string;
  sizeName: string;
  slideCount: number;
  aspect: string;
  layout: string;
  palette: string;
  fonts: string;
  isFeatured: boolean;
  shuffleKey: number;
}

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

/** The searchable description of a template, derived from the same recipe as its design */
export function describe(type: LibraryType, seq: number): LibraryEntry {
  const id = templateId(type, seq);
  const shuffleKey = hashString(`shuffle:${id}`) % 1000000;
  if (type === "poster") {
    const r = posterRecipe(seq);
    const group = POSTER_GROUPS.find((g) => g.slug === r.sub.group)!;
    const { width, height } = r.size;
    const orientation = width > height * 1.05 ? "landscape" : height > width * 1.05 ? "portrait" : "square";
    return {
      id, type, seq, shuffleKey,
      title: `${r.style.name} ${r.sub.name} Poster: ${r.layout.name}, ${r.palette.name}`,
      description: `${r.style.name} ${r.sub.name.toLowerCase()} poster in ${r.palette.name}, ${r.size.name}. Fully editable text, colours, shapes and images.`,
      keywords: [r.sub.name, group.name, r.style.name, r.style.id, r.palette.name, r.palette.family, r.palette.mode, r.layout.name, r.size.name, r.sub.industry, orientation, "poster", "flyer", r.fonts.heading, r.layout.photo ? "photo photography image" : "", ...r.sub.titles].join(" "),
      category: group.slug, categoryName: group.name, subcategory: r.sub.slug, subcategoryName: r.sub.name,
      style: r.style.id, styleName: r.style.name, industry: r.sub.industry, colorFamily: r.palette.family, mode: r.palette.mode,
      orientation, width, height, sizeId: r.size.id, sizeName: r.size.name, slideCount: 1,
      aspect: `${width / gcd(width, height)}:${height / gcd(width, height)}`, layout: r.layout.id,
      palette: [r.palette.bg, r.palette.accent, r.palette.accent2, r.palette.text].join(","),
      fonts: [...new Set([r.fonts.heading, r.fonts.body])].join(","),
      isFeatured: hashString(`feature:${id}`) % 150 === 0,
    };
  }
  if (type === "certificate") {
    const r = certificateRecipe(seq);
    const group = CERT_GROUPS.find((g) => g.slug === r.sub.group)!;
    const { width, height } = r.size;
    const orientation = width > height ? "landscape" : "portrait";
    const fonts = [...new Set([r.fonts.heading, r.fonts.body, r.nameLook.family || r.fonts.heading, "Dancing Script"])];
    return {
      id, type, seq, shuffleKey,
      title: `${r.layout.styleName} ${r.sub.name}: ${r.layout.name}, ${r.palette.name}`,
      description: `${r.layout.styleName} ${r.sub.name.toLowerCase()} in ${r.palette.name}, ${r.size.name}. Name, wording, signatures, seal and colours are all editable.`,
      keywords: [r.sub.name, group.name, r.layout.styleName, r.layout.style, r.layout.name, r.palette.name, r.palette.family, r.palette.mode, r.size.name, r.sub.industry, orientation,
        "certificate", "award", "diploma", r.sub.word, r.sub.line, r.sub.seal, r.fonts.heading, r.layout.photo ? "photo photography image" : "", /gold/i.test(r.palette.name) ? "gold" : ""].join(" "),
      category: group.slug, categoryName: group.name, subcategory: r.sub.slug, subcategoryName: r.sub.name,
      style: r.layout.style, styleName: r.layout.styleName, industry: r.sub.industry, colorFamily: r.palette.family, mode: r.palette.mode,
      orientation, width, height, sizeId: r.size.id, sizeName: r.size.name, slideCount: 1,
      aspect: orientation === "landscape" ? "A4" : "A4", layout: r.layout.id,
      palette: [r.palette.paper, r.palette.primary, r.palette.metal, r.palette.ink].join(","),
      fonts: fonts.join(",").slice(0, 80),
      isFeatured: hashString(`feature:${id}`) % 150 === 0,
    };
  }
  const r = deckRecipe(seq);
  const group = DECK_GROUPS.find((g) => g.slug === r.sub.group)!;
  const deckTitle = pick(r.sub.titles, r.h >>> 2);
  return {
    id, type, seq, shuffleKey,
    title: `${r.style.name} ${r.sub.name} Presentation: ${r.palette.name}, ${r.length} slides`,
    description: `${r.length}-slide ${r.style.name.toLowerCase()} ${r.sub.name.toLowerCase()} deck in ${r.palette.name} (${r.format.aspect}). One consistent visual system with title, content, chart, table and closing slides, all editable.`,
    keywords: [r.sub.name, group.name, r.style.name, r.style.id, r.palette.name, r.palette.family, r.palette.mode, r.sub.industry, "presentation", "deck", "slides", "pitch", `${r.length} slides`, r.format.aspect, r.fonts.heading, deckTitle, r.sub.topic].join(" "),
    category: group.slug, categoryName: group.name, subcategory: r.sub.slug, subcategoryName: r.sub.name,
    style: r.style.id, styleName: r.style.name, industry: r.sub.industry, colorFamily: r.palette.family, mode: r.palette.mode,
    orientation: "landscape", width: r.format.width, height: r.format.height, sizeId: r.format.id, sizeName: r.format.name,
    slideCount: r.length, aspect: r.format.aspect, layout: r.motif,
    palette: [r.palette.bg, r.palette.accent, r.palette.accent2, r.palette.text].join(","),
    fonts: [...new Set([r.fonts.heading, r.fonts.body])].join(","),
    isFeatured: hashString(`feature:${id}`) % 150 === 0,
  };
}

/** What makes a template's look distinct. Two templates of a type never share one. */
export function signature(type: LibraryType, seq: number): string {
  if (type === "poster") {
    const r = posterRecipe(seq);
    return [r.sub.slug, r.style.id, r.layout.id, r.size.id, r.palette.id].join("|");
  }
  if (type === "certificate") {
    const r = certificateRecipe(seq);
    return [r.sub.slug, r.layout.id, r.palette.id, r.size.id, r.fonts.id].join("|");
  }
  const r = deckRecipe(seq);
  return [r.sub.slug, r.style.id, r.motif, r.palette.id, r.length, r.format.id, r.titleAlign].join("|");
}
