/**
 * Layout building blocks for generated email templates.
 *
 * A template is assembled from one header, one hero, a sequence of body
 * modules, one call-to-action and one footer. Each builder returns ordinary
 * editable sections, so every generated template opens in the editor exactly
 * like one a person built by hand.
 */
import {
  EmailBlock, EmailSection, FontWeight, TextAlign, createBlock as B, createSection as S,
} from "./core/schema";
import { ArtStyle, artPath } from "./art";
import { photoUrl } from "./photos";
import { Archetype, CategoryDef, SubcategoryDef, ThemeDef } from "./catalog";
import { FontPair, Palette } from "./styles";

export type ButtonStyle = "solid" | "pill" | "square" | "outline";
export type Density = "compact" | "standard" | "rich";

export interface LayoutContext {
  palette: Palette;
  font: FontPair;
  category: CategoryDef;
  sub: SubcategoryDef;
  theme?: ThemeDef;
  brand: string;
  headline: string;
  subhead: string;
  cta: string;
  cta2: string;
  kicker: string;
  items: [string, string][];
  details: [string, string][];
  prices: string[];
  artStyle: ArtStyle;
  buttonStyle: ButtonStyle;
  seed: number;
  /** Photo ids for this template, or empty to use generated artwork */
  photos: string[];
  /** Counter so each image in a template gets its own picture */
  imageIndex: number;
}

export interface Part {
  key: string;
  label: string;
  tags: string[];
  build: (c: LayoutContext) => EmailSection[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Tone = { bg: string; ink: string; body: string; muted: string; btnBg: string; btnInk: string; line: string };

function tone(c: LayoutContext, kind: "surface" | "alt" | "deep" | "accent"): Tone {
  const p = c.palette;
  if (kind === "deep") return { bg: p.deep, ink: p.onDeep, body: p.onDeep, muted: p.muted, btnBg: p.accent, btnInk: p.onAccent, line: p.muted };
  if (kind === "accent") return { bg: p.accent, ink: p.onAccent, body: p.onAccent, muted: p.onAccent, btnBg: p.onAccent, btnInk: p.accent, line: p.onAccent };
  return { bg: kind === "alt" ? p.alt : "transparent", ink: p.ink, body: p.body, muted: p.muted, btnBg: p.accent, btnInk: p.onAccent, line: p.line };
}

const pad = (top: number, bottom: number, side = 0) => ({ paddingTop: top, paddingBottom: bottom, paddingLeft: side, paddingRight: side });

function img(c: LayoutContext, width: number, height: number): string {
  c.imageIndex += 1;
  if (c.photos.length) return photoUrl(c.photos[(c.imageIndex - 1) % c.photos.length], width, height);
  return artPath(c.artStyle, c.palette.art, c.seed + c.imageIndex * 13, width, height);
}

function size(c: LayoutContext, px: number): number {
  return Math.round(px * c.font.scale);
}

interface TextOpts { color?: string; align?: TextAlign; top?: number; bottom?: number; side?: number; weight?: FontWeight; spacing?: number }

function heading(c: LayoutContext, content: string, px: number, o: TextOpts & { level?: 1 | 2 | 3 } = {}): EmailBlock {
  return B("heading", {
    content, level: o.level || 2, fontSize: size(c, px), fontFamily: c.font.heading, color: o.color || c.palette.ink,
    textAlign: o.align || "left", fontWeight: o.weight || "bold", uppercase: c.font.upper, letterSpacing: c.font.spacing,
    lineHeight: 1.25,
    ...pad(o.top ?? 0, o.bottom ?? 8, o.side ?? 0),
  });
}

function text(c: LayoutContext, content: string, px = 15, o: TextOpts = {}): EmailBlock {
  return B("text", {
    content, fontSize: px, fontFamily: c.font.body, color: o.color || c.palette.body, textAlign: o.align || "left",
    fontWeight: o.weight || "normal", letterSpacing: o.spacing || 0, lineHeight: 1.6,
    ...pad(o.top ?? 0, o.bottom ?? 12, o.side ?? 0),
  });
}

function kicker(c: LayoutContext, content: string, color: string, align: TextAlign = "left", side = 0): EmailBlock {
  return B("text", {
    content: content.toUpperCase(), fontSize: 11, fontFamily: c.font.body, color, textAlign: align, fontWeight: "bold",
    letterSpacing: 2, lineHeight: 1.4, ...pad(0, 10, side),
  });
}

function button(c: LayoutContext, label: string, o: { bg?: string; ink?: string; align?: TextAlign; top?: number; bottom?: number; side?: number; full?: boolean; small?: boolean } = {}): EmailBlock {
  const bg = o.bg || c.palette.accent;
  const ink = o.ink || c.palette.onAccent;
  const outline = c.buttonStyle === "outline";
  return B("button", {
    text: label, linkUrl: "#", bgColor: outline ? "transparent" : bg, textColor: outline ? bg : ink,
    outlineColor: outline ? bg : "", fontFamily: c.font.body, fontSize: o.small ? 13 : 15, alignment: o.align || "left",
    borderRadius: c.buttonStyle === "pill" ? 999 : c.buttonStyle === "square" ? 0 : 6, width: o.full ? "full" : "auto",
    paddingV: o.small ? 9 : 13, paddingH: o.small ? 18 : 28, ...pad(o.top ?? 4, o.bottom ?? 0, o.side ?? 0),
  });
}

function image(c: LayoutContext, width: number, height: number, alt: string, o: { radius?: number; top?: number; bottom?: number; side?: number } = {}): EmailBlock {
  return B("image", { src: img(c, width, height), alt, borderRadius: o.radius ?? 0, ...pad(o.top ?? 0, o.bottom ?? 0, o.side ?? 0) });
}

function logo(c: LayoutContext, color: string, align: TextAlign, o: { top?: number; bottom?: number; side?: number } = {}): EmailBlock {
  return B("logo", {
    text: c.brand, textColor: color, fontFamily: c.font.heading, fontSize: 18, letterSpacing: 3, alignment: align,
    ...pad(o.top ?? 0, o.bottom ?? 0, o.side ?? 0),
  });
}

const MENUS: Record<Archetype, string[]> = {
  newsletter: ["Latest", "Archive", "About"],
  promo: ["New in", "Bestsellers", "Sale"],
  product: ["Features", "Pricing", "Stories"],
  transactional: ["My account", "Orders", "Help"],
  event: ["Details", "Programme", "RSVP"],
  announcement: ["Overview", "Details", "Contact"],
  listing: ["Browse", "Featured", "Contact"],
};

function menu(c: LayoutContext, color: string, align: TextAlign, labels = MENUS[c.sub.archetype], separator = ""): EmailBlock {
  return B("menu", {
    links: labels.map((label) => ({ label, url: "#" })), color, alignment: align, fontFamily: c.font.body,
    fontSize: 12, uppercase: true, letterSpacing: 1, separator, ...pad(0, 0, 0),
  });
}

function item(c: LayoutContext, index: number): [string, string] {
  return c.items[index % c.items.length];
}

function price(c: LayoutContext, index: number): string {
  return c.prices[index % c.prices.length];
}

const SECTION_SIDE = 32;

// ─── Headers ──────────────────────────────────────────────────────────────────

export const HEADERS: Part[] = [
  { key: "h-center", label: "centred logo", tags: [], build: (c) => [
    S([100], [[logo(c, c.palette.ink, "center")]], { name: "Header", ...pad(28, 20, SECTION_SIDE) }),
  ] },
  { key: "h-split", label: "logo with navigation", tags: ["navigation"], build: (c) => [
    S([40, 60], [[logo(c, c.palette.ink, "left")], [menu(c, c.palette.body, "right")]],
      { name: "Header", ...pad(24, 24, SECTION_SIDE), stackOnMobile: false }),
  ] },
  { key: "h-stacked", label: "logo over navigation", tags: ["navigation"], build: (c) => [
    S([100], [[
      logo(c, c.palette.ink, "center", { bottom: 14 }),
      B("divider", { color: c.palette.line, ...pad(0, 12, 0) }),
      menu(c, c.palette.muted, "center", undefined, "·"),
    ]], { name: "Header", ...pad(28, 16, SECTION_SIDE) }),
  ] },
  { key: "h-deep", label: "dark header bar", tags: ["dark header"], build: (c) => [
    S([100], [[logo(c, c.palette.onDeep, "center")]], { name: "Header", backgroundColor: c.palette.deep, ...pad(22, 22, SECTION_SIDE) }),
  ] },
  { key: "h-stripe", label: "accent stripe header", tags: ["accent"], build: (c) => [
    S([100], [[B("spacer", { height: 6, backgroundColor: c.palette.accent })]], { name: "Accent stripe" }),
    S([60, 40], [[logo(c, c.palette.ink, "left")], [text(c, "View in browser", 12, { color: c.palette.muted, align: "right", bottom: 0 })]],
      { name: "Header", ...pad(22, 18, SECTION_SIDE), stackOnMobile: false }),
  ] },
  { key: "h-tagline", label: "logo with tagline", tags: [], build: (c) => [
    S([100], [[
      logo(c, c.palette.accent, "center", { bottom: 6 }),
      text(c, c.category.description, 12, { color: c.palette.muted, align: "center", bottom: 0 }),
    ]], { name: "Header", backgroundColor: c.palette.alt, ...pad(26, 22, SECTION_SIDE) }),
  ] },
];

// ─── Heroes ───────────────────────────────────────────────────────────────────

export const HEROES: Part[] = [
  { key: "r-overlay", label: "image hero", tags: ["hero image"], build: (c) => [
    S([100], [[B("hero", {
      imageSrc: img(c, 1200, 640), heading: c.headline, subheading: c.subhead, buttonText: c.cta, buttonBg: "#ffffff",
      buttonColor: c.palette.deep, headingColor: "#ffffff", subheadingColor: "#f1f5f9", overlayColor: c.palette.deep,
      overlayOpacity: 0.5, fallbackColor: c.palette.deep, headingFont: c.font.heading, fontFamily: c.font.body,
      headingSize: size(c, 36), buttonRadius: c.buttonStyle === "pill" ? 999 : c.buttonStyle === "square" ? 0 : 6,
      ...pad(64, 64, 40),
    })]], { name: "Hero" }),
  ] },
  { key: "r-split-right", label: "split hero", tags: ["split layout"], build: (c) => [
    S([52, 48], [
      [kicker(c, c.kicker, c.palette.accent), heading(c, c.headline, 30, { level: 1 }), text(c, c.subhead), button(c, c.cta)],
      [image(c, 520, 560, c.headline, { radius: 10 })],
    ], { name: "Hero", backgroundColor: c.palette.alt, ...pad(36, 36, SECTION_SIDE), gap: 24 }),
  ] },
  { key: "r-split-left", label: "image-left hero", tags: ["split layout"], build: (c) => [
    S([45, 55], [
      [image(c, 480, 600, c.headline, { radius: 4 })],
      [heading(c, c.headline, 28, { level: 1, top: 8 }), text(c, c.subhead), button(c, c.cta)],
    ], { name: "Hero", ...pad(32, 32, SECTION_SIDE), gap: 28 }),
  ] },
  { key: "r-statement", label: "centred statement", tags: ["typographic"], build: (c) => [
    S([100], [[
      kicker(c, c.kicker, c.palette.accent, "center"),
      heading(c, c.headline, 38, { level: 1, align: "center", bottom: 14 }),
      text(c, c.subhead, 16, { align: "center", bottom: 20 }),
      button(c, c.cta, { align: "center" }),
    ]], { name: "Hero", ...pad(44, 44, 44) }),
  ] },
  { key: "r-left", label: "left-aligned intro", tags: ["typographic"], build: (c) => [
    S([100], [[
      B("divider", { color: c.palette.accent, thickness: 4, widthPercent: 18, ...pad(0, 20, 0) }),
      heading(c, c.headline, 34, { level: 1, bottom: 12 }),
      text(c, c.subhead, 16, { bottom: 18 }),
      button(c, c.cta),
    ]], { name: "Hero", ...pad(36, 36, 40) }),
  ] },
  { key: "r-image-top", label: "banner image hero", tags: ["hero image"], build: (c) => [
    S([100], [[image(c, 1200, 520, c.headline)]], { name: "Hero image" }),
    S([100], [[
      heading(c, c.headline, 32, { level: 1, align: "center", bottom: 12 }),
      text(c, c.subhead, 16, { align: "center", bottom: 18 }),
      button(c, c.cta, { align: "center" }),
    ]], { name: "Hero copy", ...pad(32, 36, 44) }),
  ] },
  { key: "r-accent", label: "colour-block hero", tags: ["colour block"], build: (c) => {
    const t = tone(c, "accent");
    return [S([100], [[
      kicker(c, c.kicker, t.ink, "center"),
      heading(c, c.headline, 36, { level: 1, align: "center", color: t.ink, bottom: 12 }),
      text(c, c.subhead, 16, { align: "center", color: t.body, bottom: 20 }),
      button(c, c.cta, { align: "center", bg: t.btnBg, ink: t.btnInk }),
    ]], { name: "Hero", backgroundColor: t.bg, ...pad(52, 52, 44) })];
  } },
  { key: "r-deep", label: "dark statement hero", tags: ["dark hero"], build: (c) => {
    const t = tone(c, "deep");
    return [S([100], [[
      kicker(c, c.kicker, c.palette.accent),
      heading(c, c.headline, 36, { level: 1, color: t.ink, bottom: 14 }),
      text(c, c.subhead, 16, { color: t.body, bottom: 22 }),
      button(c, c.cta, { bg: t.btnBg, ink: t.btnInk }),
    ]], { name: "Hero", backgroundColor: t.bg, ...pad(52, 52, 40) })];
  } },
  { key: "r-framed", label: "framed hero", tags: ["bordered"], build: (c) => [
    S([100], [[
      kicker(c, c.kicker, c.palette.muted, "center"),
      heading(c, c.headline, 32, { level: 1, align: "center", bottom: 12 }),
      B("divider", { color: c.palette.accent, thickness: 2, widthPercent: 14, ...pad(4, 16, 0) }),
      text(c, c.subhead, 15, { align: "center", bottom: 18 }),
      button(c, c.cta, { align: "center" }),
    ]], { name: "Hero", backgroundColor: c.palette.alt, borderWidth: 2, borderColor: c.palette.ink, ...pad(40, 40, 36) }),
  ] },
  { key: "r-card", label: "card hero", tags: ["card"], build: (c) => {
    const section = S([100], [[
      image(c, 1040, 440, c.headline, { radius: 8, bottom: 22 }),
      heading(c, c.headline, 28, { level: 1, bottom: 10 }),
      text(c, c.subhead, 15, { bottom: 16 }),
      button(c, c.cta),
    ]], { name: "Hero", backgroundColor: c.palette.alt, ...pad(28, 28, 28) });
    section.columns[0].backgroundColor = c.palette.surface;
    section.columns[0].padding = 24;
    section.columns[0].borderRadius = 12;
    return [section];
  } },
];

// ─── Body modules ─────────────────────────────────────────────────────────────

const STATS: Record<Archetype, [string, string][]> = {
  newsletter: [["12", "Stories this month"], ["5 min", "Average read"], ["3", "Things to do next"]],
  promo: [["50%", "Maximum saving"], ["48h", "Until it ends"], ["Free", "Delivery on all orders"]],
  product: [["2×", "Faster than before"], ["30 days", "To try it free"], ["24/7", "Support included"]],
  transactional: [["1", "Order placed"], ["2–4", "Days to deliver"], ["30", "Days to return"]],
  event: [["40", "Speakers"], ["2", "Days"], ["800", "Guests"]],
  announcement: [["3", "Key changes"], ["1", "Date to remember"], ["0", "Action needed"]],
  listing: [["4", "New this week"], ["3", "Ways to book"], ["1", "Call away"]],
};

function quoteFor(c: LayoutContext): [string, string] {
  const [title] = item(c, 1);
  return [`“${title}. It is the reason we keep coming back, and the reason we tell our friends.”`, `A happy ${c.sub.archetype === "event" ? "guest" : "customer"} of ${c.brand}`];
}

export const MODULES: Part[] = [
  { key: "m-article-rows", label: "article rows", tags: ["articles"], build: (c) => [
    S([100], [[0, 1, 2].map((i) => B("feature", {
      imageSrc: img(c, 420, 320), heading: item(c, i)[0], body: item(c, i)[1], color: c.palette.ink,
      imageAlign: i % 2 ? "right" : "left", headingFont: c.font.heading, fontFamily: c.font.body, imageRadius: 6, ...pad(12, 12, 0),
    }))], { name: "Articles", ...pad(20, 20, SECTION_SIDE) }),
  ] },
  { key: "m-grid-2", label: "two-column cards", tags: ["two columns", "cards"], build: (c) => [
    S([50, 50], [0, 1].map((i) => [
      image(c, 520, 340, item(c, i)[0], { radius: 8, bottom: 14 }),
      heading(c, item(c, i)[0], 18, { level: 3 }),
      text(c, item(c, i)[1], 14),
    ]), { name: "Story grid", ...pad(24, 12, SECTION_SIDE), gap: 20 }),
    S([50, 50], [2, 3].map((i) => [
      image(c, 520, 340, item(c, i)[0], { radius: 8, bottom: 14 }),
      heading(c, item(c, i)[0], 18, { level: 3 }),
      text(c, item(c, i)[1], 14),
    ]), { name: "Story grid", ...pad(12, 24, SECTION_SIDE), gap: 20 }),
  ] },
  { key: "m-grid-3", label: "three-column highlights", tags: ["three columns"], build: (c) => [
    S([33.33, 33.33, 33.34], [0, 1, 2].map((i) => [
      image(c, 360, 300, item(c, i)[0], { radius: 6, bottom: 12 }),
      heading(c, item(c, i)[0], 15, { level: 3, bottom: 6 }),
      text(c, item(c, i)[1], 13, { bottom: 0 }),
    ]), { name: "Highlights", backgroundColor: c.palette.alt, ...pad(28, 28, 28), gap: 16 }),
  ] },
  { key: "m-intro", label: "editorial intro", tags: ["long read"], build: (c) => [
    S([100], [[
      heading(c, item(c, 0)[0], 22, { bottom: 10 }),
      text(c, `${item(c, 0)[1]} ${c.subhead}`, 15),
      text(c, `${item(c, 1)[0]}. ${item(c, 1)[1]}`, 15, { bottom: 0 }),
    ]], { name: "Introduction", ...pad(28, 28, 40) }),
  ] },
  { key: "m-quote", label: "pull quote", tags: ["testimonial"], build: (c) => {
    const [quote, by] = quoteFor(c);
    return [S([100], [[
      heading(c, quote, 20, { align: "center", color: c.palette.ink, bottom: 12, weight: "normal" }),
      text(c, by, 13, { align: "center", color: c.palette.muted, bottom: 0 }),
    ]], { name: "Quote", backgroundColor: c.palette.alt, ...pad(36, 36, 48) })];
  } },
  { key: "m-stats", label: "key numbers", tags: ["stats"], build: (c) => [
    S([33.33, 33.33, 33.34], STATS[c.sub.archetype].map(([value, label]) => [
      heading(c, value, 32, { align: "center", color: c.palette.accent, bottom: 4 }),
      text(c, label, 13, { align: "center", color: c.palette.muted, bottom: 0 }),
    ]), { name: "Key numbers", ...pad(28, 28, SECTION_SIDE), stackOnMobile: false }),
  ] },
  { key: "m-icons-row", label: "benefit icons", tags: ["icons"], build: (c) => [
    S([100], [[B("icons", {
      items: [0, 1, 2].map((i) => ({ glyph: ["★", "✓", "➜"][i], label: item(c, i)[0], text: item(c, i)[1].split(".")[0], url: "" })),
      layout: "row", iconBg: c.palette.accent, iconColor: c.palette.onAccent, labelColor: c.palette.ink,
      textColor: c.palette.muted, fontFamily: c.font.body, iconSize: 44, ...pad(0, 0, 0),
    })]], { name: "Benefits", ...pad(28, 24, SECTION_SIDE) }),
  ] },
  { key: "m-steps", label: "numbered steps", tags: ["steps"], build: (c) => [
    S([100], [[
      heading(c, "How it works", 20, { bottom: 12 }),
      B("icons", {
        items: [0, 1, 2, 3].map((i) => ({ glyph: String(i + 1), label: item(c, i)[0], text: item(c, i)[1], url: "" })),
        layout: "list", iconBg: c.palette.ink, iconColor: c.palette.surface, labelColor: c.palette.ink,
        textColor: c.palette.body, fontFamily: c.font.body, iconSize: 34, fontSize: 14, ...pad(0, 0, 0),
      }),
    ]], { name: "Steps", ...pad(28, 24, 40) }),
  ] },
  { key: "m-checklist", label: "checklist", tags: ["checklist"], build: (c) => [
    S([100], [[
      heading(c, "What's included", 20, { bottom: 12 }),
      B("icons", {
        items: [0, 1, 2, 3].map((i) => ({ glyph: "✓", label: item(c, i)[0], text: "", url: "" })),
        layout: "list", iconBg: c.palette.accent, iconColor: c.palette.onAccent, labelColor: c.palette.ink,
        textColor: c.palette.body, fontFamily: c.font.body, iconSize: 26, fontSize: 14, ...pad(0, 0, 0),
      }),
    ]], { name: "Checklist", backgroundColor: c.palette.alt, ...pad(28, 24, 40) }),
  ] },
  { key: "m-products-2", label: "two-up product grid", tags: ["products", "two columns"], build: (c) => [
    S([50, 50], [0, 1].map((i) => [B("product", {
      imageSrc: img(c, 520, 520), name: item(c, i)[0], price: price(c, i), description: item(c, i)[1].split(".")[0],
      badge: i === 0 ? "New" : "", badgeBg: c.palette.accent, badgeColor: c.palette.onAccent, buttonText: c.cta2,
      buttonBg: c.palette.ink, buttonColor: c.palette.surface, nameColor: c.palette.ink, priceColor: c.palette.accent,
      descriptionColor: c.palette.muted, headingFont: c.font.heading, fontFamily: c.font.body, imageRadius: 8,
      buttonRadius: c.buttonStyle === "pill" ? 999 : c.buttonStyle === "square" ? 0 : 6, ...pad(0, 0, 0),
    })]), { name: "Products", ...pad(28, 28, SECTION_SIDE), gap: 24 }),
  ] },
  { key: "m-products-3", label: "three-up product row", tags: ["products", "three columns"], build: (c) => [
    S([100], [[heading(c, "Picked for you", 20, { align: "center", bottom: 0 })]], { name: "Products title", ...pad(28, 12, SECTION_SIDE) }),
    S([33.33, 33.33, 33.34], [0, 1, 2].map((i) => [
      image(c, 360, 360, item(c, i)[0], { radius: 6, bottom: 10 }),
      heading(c, item(c, i)[0], 14, { level: 3, align: "center", bottom: 4 }),
      text(c, price(c, i), 14, { align: "center", color: c.palette.accent, weight: "bold", bottom: 0 }),
    ]), { name: "Products", ...pad(8, 28, 28), gap: 14 }),
  ] },
  { key: "m-spotlight", label: "product spotlight", tags: ["products", "spotlight"], build: (c) => [
    S([100], [[B("product", {
      imageSrc: img(c, 1040, 560), name: item(c, 0)[0], price: price(c, 1), description: item(c, 0)[1],
      badge: "Bestseller", badgeBg: c.palette.deep, badgeColor: c.palette.onDeep, buttonText: c.cta2,
      buttonBg: c.palette.accent, buttonColor: c.palette.onAccent, nameColor: c.palette.ink, priceColor: c.palette.ink,
      descriptionColor: c.palette.body, headingFont: c.font.heading, fontFamily: c.font.body, imageRadius: 10,
      buttonRadius: c.buttonStyle === "pill" ? 999 : c.buttonStyle === "square" ? 0 : 6, ...pad(0, 0, 0),
    })]], { name: "Spotlight", backgroundColor: c.palette.alt, ...pad(32, 32, 40) }),
  ] },
  { key: "m-offer", label: "offer banner with code", tags: ["coupon", "offer"], build: (c) => {
    const t = tone(c, "deep");
    return [S([100], [[
      heading(c, "Extra 20% off", 34, { align: "center", color: t.ink, bottom: 6 }),
      text(c, "Enter this code at checkout", 14, { align: "center", color: t.body, bottom: 16 }),
      B("text", {
        content: "WELCOME20", fontSize: 20, fontFamily: "'Courier New', Courier, monospace", fontWeight: "bold",
        color: c.palette.accent, textAlign: "center", letterSpacing: 4, borderWidth: 2, borderStyle: "dashed",
        borderColor: c.palette.accent, cornerRadius: 6, ...pad(14, 14, 20),
      }),
    ]], { name: "Offer", backgroundColor: t.bg, ...pad(36, 36, 72) })];
  } },
  { key: "m-details", label: "details table", tags: ["details"], build: (c) => [
    S([100], [[heading(c, c.sub.archetype === "event" ? "The details" : "Summary", 20, { bottom: 0 })]], { name: "Details title", ...pad(28, 10, 40) }),
    ...c.details.map(([label, value], i) => S([36, 64], [
      [text(c, label, 13, { color: c.palette.muted, weight: "bold", bottom: 0 })],
      [text(c, value, 15, { color: c.palette.ink, bottom: 0 })],
    ], { name: "Detail row", backgroundColor: i % 2 ? "transparent" : c.palette.alt, ...pad(12, 12, 40), stackOnMobile: false })),
    S([100], [[B("spacer", { height: 16 })]], { name: "Spacing" }),
  ] },
  { key: "m-agenda", label: "agenda", tags: ["agenda", "schedule"], build: (c) => [
    S([100], [[heading(c, "What to expect", 20, { bottom: 0 })]], { name: "Agenda title", ...pad(28, 8, 40) }),
    ...[0, 1, 2, 3].map((i) => S([14, 86], [
      [heading(c, String(i + 1).padStart(2, "0"), 22, { color: c.palette.accent, bottom: 0 })],
      [heading(c, item(c, i)[0], 16, { level: 3, bottom: 4 }), text(c, item(c, i)[1], 14, { bottom: 0 })],
    ], { name: "Agenda item", ...pad(12, 12, 40), stackOnMobile: false, borderWidth: 0 })),
    S([100], [[B("spacer", { height: 12 })]], { name: "Spacing" }),
  ] },
  { key: "m-video", label: "video feature", tags: ["video"], build: (c) => [
    S([100], [[
      heading(c, item(c, 2)[0], 20, { align: "center", bottom: 14 }),
      B("video", {
        thumbnailSrc: img(c, 1040, 585), alt: item(c, 2)[0], buttonText: "▶  Watch now", buttonBg: c.palette.accent,
        buttonColor: c.palette.onAccent, borderRadius: 10, ...pad(0, 0, 0),
      }),
    ]], { name: "Video", ...pad(28, 28, 40) }),
  ] },
  { key: "m-image-band", label: "full-width image", tags: ["image"], build: (c) => [
    S([100], [[image(c, 1200, 420, item(c, 3)[0])]], { name: "Image" }),
    S([100], [[text(c, item(c, 3)[1], 13, { align: "center", color: c.palette.muted, bottom: 0 })]], { name: "Caption", ...pad(12, 20, 40) }),
  ] },
  { key: "m-split-story", label: "image and story", tags: ["split layout"], build: (c) => {
    const copy = [heading(c, item(c, 2)[0], 22, { top: 6 }), text(c, item(c, 2)[1], 15), button(c, c.cta2, { small: true })];
    const picture = [image(c, 520, 440, item(c, 2)[0], { radius: 8 })];
    return [S([50, 50], c.seed % 2 ? [copy, picture] : [picture, copy], { name: "Story", ...pad(28, 28, SECTION_SIDE), gap: 24 })];
  } },
  { key: "m-testimonials", label: "testimonial cards", tags: ["testimonial", "cards"], build: (c) => {
    const section = S([50, 50], [0, 1].map((i) => [
      text(c, `“${item(c, i)[1]}”`, 15, { color: c.palette.ink, bottom: 10 }),
      text(c, i ? "Jordan, member since 2021" : "Priya, verified customer", 12, { color: c.palette.muted, weight: "bold", bottom: 0 }),
    ]), { name: "Testimonials", ...pad(28, 28, SECTION_SIDE), gap: 16 });
    for (const column of section.columns) {
      column.backgroundColor = c.palette.alt;
      column.padding = 20;
      column.borderRadius = 10;
    }
    return [section];
  } },
  { key: "m-faq", label: "questions and answers", tags: ["faq"], build: (c) => [
    S([100], [[
      heading(c, "Good to know", 20, { bottom: 14 }),
      ...[1, 2, 3].flatMap((i) => [
        heading(c, item(c, i)[0].replace(/[:?]$/, "") + "?", 15, { level: 3, bottom: 4 }),
        text(c, item(c, i)[1], 14, { bottom: 14 }),
      ]),
    ]], { name: "FAQ", ...pad(28, 16, 40) }),
  ] },
  { key: "m-note", label: "highlighted note", tags: ["note"], build: (c) => [
    S([100], [[B("text", {
      content: `${item(c, 3)[0]} ${item(c, 3)[1]}`, fontSize: 14, fontFamily: c.font.body, color: c.palette.ink,
      lineHeight: 1.6, backgroundColor: c.palette.alt, borderWidth: 1, borderColor: c.palette.line, cornerRadius: 8,
      ...pad(18, 18, 20),
    })]], { name: "Note", ...pad(20, 24, 40) }),
  ] },
  { key: "m-listings", label: "listing cards", tags: ["listings", "cards"], build: (c) => [0, 1].map((i) =>
    S([42, 58], [
      [image(c, 440, 360, item(c, i)[0], { radius: 8 })],
      [
        heading(c, item(c, i)[0], 18, { level: 3, bottom: 4 }),
        text(c, price(c, i + 1), 16, { color: c.palette.accent, weight: "bold", bottom: 6 }),
        text(c, item(c, i)[1], 14, { bottom: 10 }),
        button(c, c.cta2, { small: true }),
      ],
    ], { name: "Listing", backgroundColor: i ? "transparent" : c.palette.alt, ...pad(24, 24, SECTION_SIDE), gap: 22 })
  ) },
  { key: "m-menu", label: "priced menu", tags: ["menu", "price list"], build: (c) => [
    S([100], [[heading(c, "On the menu", 22, { align: "center", bottom: 0 })]], { name: "Menu title", ...pad(28, 10, 40) }),
    ...[0, 1, 2, 3].map((i) => S([76, 24], [
      [heading(c, item(c, i)[0], 16, { level: 3, bottom: 2 }), text(c, item(c, i)[1], 13, { color: c.palette.muted, bottom: 0 })],
      [text(c, price(c, i), 16, { align: "right", color: c.palette.accent, weight: "bold", bottom: 0 })],
    ], { name: "Menu item", ...pad(10, 10, 44), stackOnMobile: false })),
    S([100], [[B("divider", { color: c.palette.line, widthPercent: 30, ...pad(14, 18, 0) })]], { name: "Divider" }),
  ] },
];

/** Modules each kind of email can use. `lead` modules always come first. */
export const MODULE_PLAN: Record<Archetype, { lead: string[]; pool: string[] }> = {
  newsletter: { lead: [], pool: ["m-article-rows", "m-grid-2", "m-grid-3", "m-intro", "m-quote", "m-stats", "m-video", "m-image-band", "m-split-story", "m-testimonials", "m-faq", "m-icons-row"] },
  promo: { lead: [], pool: ["m-products-2", "m-products-3", "m-spotlight", "m-offer", "m-icons-row", "m-checklist", "m-split-story", "m-quote", "m-image-band", "m-testimonials", "m-faq", "m-stats"] },
  product: { lead: [], pool: ["m-spotlight", "m-icons-row", "m-article-rows", "m-grid-3", "m-stats", "m-video", "m-split-story", "m-quote", "m-checklist", "m-faq", "m-image-band", "m-testimonials"] },
  transactional: { lead: ["m-details"], pool: ["m-steps", "m-note", "m-checklist", "m-products-3", "m-faq", "m-intro", "m-icons-row", "m-split-story", "m-quote"] },
  event: { lead: ["m-details"], pool: ["m-agenda", "m-icons-row", "m-grid-3", "m-image-band", "m-video", "m-quote", "m-faq", "m-split-story", "m-note", "m-stats"] },
  announcement: { lead: [], pool: ["m-intro", "m-steps", "m-checklist", "m-quote", "m-stats", "m-split-story", "m-faq", "m-note", "m-grid-2", "m-video", "m-icons-row"] },
  listing: { lead: ["m-listings"], pool: ["m-icons-row", "m-image-band", "m-quote", "m-split-story", "m-grid-2", "m-faq", "m-stats", "m-testimonials", "m-note"] },
};

// ─── Calls to action ──────────────────────────────────────────────────────────

function ctaBlock(c: LayoutContext, t: Tone, bordered = false): EmailBlock {
  return B("cta", {
    heading: c.cta === c.cta2 ? "Ready when you are" : `${c.cta2}?`, subheading: c.subhead, buttonText: c.cta,
    buttonBg: t.btnBg, buttonColor: t.btnInk, headingColor: t.ink, subheadingColor: t.body, backgroundColor: "transparent",
    headingFont: c.font.heading, fontFamily: c.font.body, buttonRadius: c.buttonStyle === "pill" ? 999 : c.buttonStyle === "square" ? 0 : 6,
    borderWidth: bordered ? 2 : 0, borderColor: c.palette.accent, cornerRadius: bordered ? 10 : 0, ...pad(36, 36, 32),
  });
}

export const CTAS: Part[] = [
  { key: "c-deep", label: "dark call-to-action band", tags: [], build: (c) => [
    S([100], [[ctaBlock(c, tone(c, "deep"))]], { name: "Call to action", backgroundColor: c.palette.deep, ...pad(8, 8, 16) }),
  ] },
  { key: "c-accent", label: "accent call-to-action band", tags: [], build: (c) => [
    S([100], [[ctaBlock(c, tone(c, "accent"))]], { name: "Call to action", backgroundColor: c.palette.accent, ...pad(8, 8, 16) }),
  ] },
  { key: "c-button", label: "simple button close", tags: ["minimal"], build: (c) => [
    S([100], [[
      B("divider", { color: c.palette.line, ...pad(0, 24, 0) }),
      button(c, c.cta, { align: "center", bottom: 10 }),
      text(c, "Questions? Just reply to this email.", 12, { align: "center", color: c.palette.muted, bottom: 0 }),
    ]], { name: "Call to action", ...pad(12, 32, 40) }),
  ] },
  { key: "c-split", label: "split call-to-action", tags: ["split layout"], build: (c) => [
    S([62, 38], [
      [heading(c, c.cta2, 20, { bottom: 4 }), text(c, c.subhead, 13, { color: c.palette.muted, bottom: 0 })],
      [button(c, c.cta, { align: "right", top: 8, small: true })],
    ], { name: "Call to action", backgroundColor: c.palette.alt, ...pad(26, 26, SECTION_SIDE) }),
  ] },
  { key: "c-boxed", label: "outlined call-to-action", tags: ["bordered"], build: (c) => [
    S([100], [[ctaBlock(c, tone(c, "surface"), true)]], { name: "Call to action", ...pad(24, 28, SECTION_SIDE) }),
  ] },
];

// ─── Footers ──────────────────────────────────────────────────────────────────

function footerBlock(c: LayoutContext, color: string, align: TextAlign): EmailBlock {
  return B("footer_block", {
    companyName: titleCase(c.brand), address: "18 Example Street, Your City", textColor: color, textAlign: align,
    fontFamily: c.font.body, ...pad(0, 0, 0),
  });
}

function social(c: LayoutContext, color: string, align: TextAlign): EmailBlock {
  return B("social", {
    icons: [{ platform: "instagram", url: "#" }, { platform: "facebook", url: "#" }, { platform: "twitter", url: "#" }, { platform: "youtube", url: "#" }],
    color, alignment: align, iconSize: 30, ...pad(0, 16, 0),
  });
}

export function titleCase(value: string): string {
  return value.toLowerCase().replace(/(^|[\s&.'-])([a-z])/g, (_m, lead: string, ch: string) => lead + ch.toUpperCase());
}

export const FOOTERS: Part[] = [
  { key: "f-simple", label: "simple footer", tags: [], build: (c) => [
    S([100], [[footerBlock(c, c.palette.muted, "center")]], { name: "Footer", ...pad(28, 32, 40) }),
  ] },
  { key: "f-social", label: "social footer", tags: ["social"], build: (c) => [
    S([100], [[social(c, c.palette.ink, "center"), footerBlock(c, c.palette.muted, "center")]],
      { name: "Footer", backgroundColor: c.palette.alt, ...pad(30, 32, 40) }),
  ] },
  { key: "f-deep", label: "dark footer", tags: ["dark footer", "social"], build: (c) => [
    S([100], [[
      logo(c, c.palette.onDeep, "center", { bottom: 16 }),
      social(c, c.palette.accent, "center"),
      footerBlock(c, c.palette.muted, "center"),
    ]], { name: "Footer", backgroundColor: c.palette.deep, ...pad(34, 34, 40) }),
  ] },
  { key: "f-columns", label: "two-column footer", tags: ["navigation"], build: (c) => [
    S([56, 44], [
      [footerBlock(c, c.palette.muted, "left")],
      [menu(c, c.palette.body, "right", ["Help", "Privacy", "Terms"])],
    ], { name: "Footer", backgroundColor: c.palette.alt, ...pad(28, 28, SECTION_SIDE) }),
  ] },
  { key: "f-minimal", label: "minimal footer", tags: ["minimal"], build: (c) => [
    S([100], [[
      B("divider", { color: c.palette.line, ...pad(0, 18, 0) }),
      footerBlock(c, c.palette.muted, "left"),
    ]], { name: "Footer", ...pad(8, 28, 40) }),
  ] },
];
