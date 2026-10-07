/**
 * Falcon email document schema (version 1).
 *
 * This folder is the single source of truth for the email format. It is pure
 * TypeScript with no DOM, React or Node dependencies, and is copied verbatim
 * into the backend (`npm run email:sync`) so the editor, the HTML exporter,
 * the thumbnail renderer and the template generator all agree on one shape.
 *
 *   document → sections → columns → blocks
 */

export const EMAIL_SCHEMA_VERSION = 1;

export type TextAlign = "left" | "center" | "right";
export type FontWeight = "normal" | "bold" | "600" | "700";
export type BorderStyle = "solid" | "dashed" | "dotted";

export type BlockType =
  | "text"
  | "heading"
  | "image"
  | "button"
  | "divider"
  | "spacer"
  | "social"
  | "logo"
  | "html"
  | "video"
  | "icons"
  | "menu"
  | "hero"
  | "feature"
  | "product"
  | "cta"
  | "footer_block";

export const BLOCK_TYPES: BlockType[] = [
  "text", "heading", "image", "button", "divider", "spacer", "social", "logo", "html",
  "video", "icons", "menu", "hero", "feature", "product", "cta", "footer_block",
];

// ─── Blocks ───────────────────────────────────────────────────────────────────

export interface BaseBlock {
  id: string;
  type: BlockType;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  backgroundColor: string;
  borderWidth: number;
  borderColor: string;
  borderStyle: BorderStyle;
  cornerRadius: number;
}

export interface TextBlock extends BaseBlock {
  type: "text";
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: FontWeight;
  color: string;
  textAlign: TextAlign;
  lineHeight: number;
  letterSpacing: number;
}

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  content: string;
  level: 1 | 2 | 3;
  fontSize: number;
  fontFamily: string;
  fontWeight: FontWeight;
  color: string;
  textAlign: TextAlign;
  lineHeight: number;
  letterSpacing: number;
  uppercase: boolean;
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  src: string;
  alt: string;
  width: number | "100%";
  borderRadius: number;
  alignment: TextAlign;
  linkUrl: string;
}

export interface ButtonBlock extends BaseBlock {
  type: "button";
  text: string;
  linkUrl: string;
  bgColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  borderRadius: number;
  alignment: TextAlign;
  width: "auto" | "full";
  fontWeight: FontWeight;
  paddingV: number;
  paddingH: number;
  outlineColor: string;
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
  color: string;
  thickness: number;
  style: BorderStyle;
  widthPercent: number;
}

export interface SpacerBlock extends BaseBlock {
  type: "spacer";
  height: number;
}

export type SocialPlatform =
  | "twitter" | "instagram" | "facebook" | "linkedin" | "youtube"
  | "github" | "tiktok" | "pinterest" | "whatsapp" | "website";

export interface SocialIcon {
  platform: SocialPlatform;
  url: string;
}

export interface SocialBlock extends BaseBlock {
  type: "social";
  icons: SocialIcon[];
  alignment: TextAlign;
  iconSize: number;
  color: string;
  gap: number;
}

/** Shows an image when `src` is set, otherwise an email-safe text wordmark. */
export interface LogoBlock extends BaseBlock {
  type: "logo";
  src: string;
  alt: string;
  width: number;
  alignment: TextAlign;
  linkUrl: string;
  text: string;
  textColor: string;
  fontFamily: string;
  fontSize: number;
  letterSpacing: number;
}

export interface HtmlBlock extends BaseBlock {
  type: "html";
  html: string;
}

/** Email clients cannot play video, so this is a linked poster image with a play button. */
export interface VideoBlock extends BaseBlock {
  type: "video";
  videoUrl: string;
  thumbnailSrc: string;
  alt: string;
  buttonText: string;
  buttonBg: string;
  buttonColor: string;
  borderRadius: number;
}

export interface IconItem {
  glyph: string;
  label: string;
  text: string;
  url: string;
}

export interface IconsBlock extends BaseBlock {
  type: "icons";
  items: IconItem[];
  layout: "row" | "list";
  iconBg: string;
  iconColor: string;
  iconSize: number;
  labelColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: number;
}

export interface MenuLink {
  label: string;
  url: string;
}

export interface MenuBlock extends BaseBlock {
  type: "menu";
  links: MenuLink[];
  color: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: FontWeight;
  alignment: TextAlign;
  separator: string;
  uppercase: boolean;
  letterSpacing: number;
}

export interface HeroBlock extends BaseBlock {
  type: "hero";
  imageSrc: string;
  heading: string;
  subheading: string;
  buttonText: string;
  buttonUrl: string;
  buttonBg: string;
  buttonColor: string;
  headingColor: string;
  subheadingColor: string;
  textAlign: TextAlign;
  overlayColor: string;
  overlayOpacity: number;
  fallbackColor: string;
  headingFont: string;
  fontFamily: string;
  headingSize: number;
  buttonRadius: number;
}

export interface FeatureBlock extends BaseBlock {
  type: "feature";
  imageSrc: string;
  heading: string;
  body: string;
  color: string;
  imageAlign: "left" | "right";
  headingFont: string;
  fontFamily: string;
  imageRadius: number;
}

export interface ProductBlock extends BaseBlock {
  type: "product";
  imageSrc: string;
  name: string;
  price: string;
  description: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  buttonText: string;
  buttonUrl: string;
  buttonBg: string;
  buttonColor: string;
  nameColor: string;
  priceColor: string;
  descriptionColor: string;
  textAlign: TextAlign;
  headingFont: string;
  fontFamily: string;
  buttonRadius: number;
  imageRadius: number;
}

export interface CtaBlock extends BaseBlock {
  type: "cta";
  heading: string;
  subheading: string;
  buttonText: string;
  buttonUrl: string;
  buttonBg: string;
  buttonColor: string;
  headingColor: string;
  subheadingColor: string;
  textAlign: TextAlign;
  headingFont: string;
  fontFamily: string;
  buttonRadius: number;
}

export interface FooterBlock extends BaseBlock {
  type: "footer_block";
  companyName: string;
  address: string;
  unsubscribeUrl: string;
  unsubscribeText: string;
  textColor: string;
  fontSize: number;
  textAlign: TextAlign;
  fontFamily: string;
}

export type EmailBlock =
  | TextBlock | HeadingBlock | ImageBlock | ButtonBlock | DividerBlock | SpacerBlock
  | SocialBlock | LogoBlock | HtmlBlock | VideoBlock | IconsBlock | MenuBlock
  | HeroBlock | FeatureBlock | ProductBlock | CtaBlock | FooterBlock;

// ─── Layout ───────────────────────────────────────────────────────────────────

export interface EmailColumn {
  id: string;
  /** Percent of the section's inner width. Columns in a section add up to 100. */
  width: number;
  backgroundColor: string;
  padding: number;
  verticalAlign: "top" | "middle" | "bottom";
  borderRadius: number;
  blocks: EmailBlock[];
}

export interface SectionSettings {
  name: string;
  backgroundColor: string;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  gap: number;
  stackOnMobile: boolean;
  borderWidth: number;
  borderColor: string;
  borderStyle: BorderStyle;
}

export interface EmailSection {
  id: string;
  type: "section";
  settings: SectionSettings;
  columns: EmailColumn[];
}

export interface EmailSettings {
  subject: string;
  preheader: string;
  senderName: string;
  replyTo: string;
  emailWidth: number;
  backgroundColor: string;
  contentBackground: string;
  defaultFont: string;
}

export interface EmailDocument {
  version: number;
  document: { type: "email"; settings: EmailSettings };
  blocks: EmailSection[];
}

// ─── Fonts ────────────────────────────────────────────────────────────────────

/** Every stack ends in a generic family so the email still reads well when the first choice is missing. */
export const FONT_STACKS: { label: string; value: string }[] = [
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', Tahoma, sans-serif" },
  { label: "Segoe UI", value: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Palatino", value: "'Palatino Linotype', Palatino, Georgia, serif" },
  { label: "Garamond", value: "Garamond, Georgia, serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
  { label: "Lucida Console", value: "'Lucida Console', Monaco, monospace" },
];

const SANS = FONT_STACKS[0].value;

// ─── Ids ──────────────────────────────────────────────────────────────────────

let idCounter = 0;

export function uid(prefix = "blk"): string {
  idCounter = (idCounter + 1) % 1679616;
  return `${prefix}_${Date.now().toString(36)}${idCounter.toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
// These are part of schema version 1: stored documents omit any field equal to
// its default, so changing a value here requires a new schema version.

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  subject: "My Email Subject",
  preheader: "",
  senderName: "Falcon",
  replyTo: "",
  emailWidth: 600,
  backgroundColor: "#f4f4f4",
  contentBackground: "#ffffff",
  defaultFont: SANS,
};

const BASE_DEFAULTS = {
  paddingTop: 16,
  paddingBottom: 16,
  paddingLeft: 24,
  paddingRight: 24,
  backgroundColor: "transparent",
  borderWidth: 0,
  borderColor: "#e5e7eb",
  borderStyle: "solid" as BorderStyle,
  cornerRadius: 0,
};

type Defaults<T> = Omit<T, "id" | "type">;

const BLOCK_DEFAULTS: { [K in BlockType]: Defaults<Extract<EmailBlock, { type: K }>> } = {
  text: {
    ...BASE_DEFAULTS, content: "Your text goes here. Click to edit.", fontSize: 16, fontFamily: SANS,
    fontWeight: "normal", color: "#333333", textAlign: "left", lineHeight: 1.6, letterSpacing: 0,
  },
  heading: {
    ...BASE_DEFAULTS, content: "Your Heading", level: 2, fontSize: 28, fontFamily: SANS, fontWeight: "bold",
    color: "#111111", textAlign: "left", lineHeight: 1.3, letterSpacing: 0, uppercase: false,
  },
  image: { ...BASE_DEFAULTS, src: "", alt: "Image", width: "100%", borderRadius: 0, alignment: "center", linkUrl: "" },
  button: {
    ...BASE_DEFAULTS, text: "Click Here", linkUrl: "#", bgColor: "#000000", textColor: "#ffffff", fontSize: 14,
    fontFamily: SANS, borderRadius: 6, alignment: "center", width: "auto", fontWeight: "bold", paddingV: 12,
    paddingH: 28, outlineColor: "",
  },
  divider: { ...BASE_DEFAULTS, color: "#e0e0e0", thickness: 1, style: "solid", widthPercent: 100 },
  spacer: { ...BASE_DEFAULTS, paddingTop: 0, paddingBottom: 0, height: 32 },
  social: {
    ...BASE_DEFAULTS,
    icons: [{ platform: "twitter", url: "#" }, { platform: "instagram", url: "#" }, { platform: "linkedin", url: "#" }],
    alignment: "center", iconSize: 32, color: "#333333", gap: 8,
  },
  logo: {
    ...BASE_DEFAULTS, src: "", alt: "Logo", width: 120, alignment: "center", linkUrl: "#", text: "YOUR BRAND",
    textColor: "#111111", fontFamily: SANS, fontSize: 20, letterSpacing: 3,
  },
  html: { ...BASE_DEFAULTS, html: "<p>Custom HTML goes here</p>" },
  video: {
    ...BASE_DEFAULTS, videoUrl: "#", thumbnailSrc: "", alt: "Watch the video", buttonText: "▶  Watch the video",
    buttonBg: "#111111", buttonColor: "#ffffff", borderRadius: 8,
  },
  icons: {
    ...BASE_DEFAULTS,
    items: [
      { glyph: "★", label: "Quality", text: "Made to last", url: "" },
      { glyph: "✓", label: "Trusted", text: "Loved by teams", url: "" },
      { glyph: "➜", label: "Fast", text: "Ships in days", url: "" },
    ],
    layout: "row", iconBg: "#111111", iconColor: "#ffffff", iconSize: 40, labelColor: "#111111",
    textColor: "#666666", fontFamily: SANS, fontSize: 13,
  },
  menu: {
    ...BASE_DEFAULTS, paddingTop: 10, paddingBottom: 10,
    links: [{ label: "Shop", url: "#" }, { label: "About", url: "#" }, { label: "Contact", url: "#" }],
    color: "#333333", fontSize: 13, fontFamily: SANS, fontWeight: "600", alignment: "center", separator: "",
    uppercase: false, letterSpacing: 0,
  },
  hero: {
    ...BASE_DEFAULTS, paddingTop: 48, paddingBottom: 48, imageSrc: "", heading: "Bold Headline Here",
    subheading: "Support your headline with a compelling subheading that drives action.", buttonText: "Get Started",
    buttonUrl: "#", buttonBg: "#000000", buttonColor: "#ffffff", headingColor: "#ffffff",
    subheadingColor: "#eeeeee", textAlign: "center", overlayColor: "#000000", overlayOpacity: 0.55,
    fallbackColor: "#222222", headingFont: SANS, fontFamily: SANS, headingSize: 36, buttonRadius: 6,
  },
  feature: {
    ...BASE_DEFAULTS, imageSrc: "", heading: "Feature Name",
    body: "Describe the feature value here with a short compelling sentence.", color: "#333333",
    imageAlign: "left", headingFont: SANS, fontFamily: SANS, imageRadius: 6,
  },
  product: {
    ...BASE_DEFAULTS, imageSrc: "", name: "Product Name", price: "$99.00", description: "Short product description.",
    badge: "", badgeBg: "#111111", badgeColor: "#ffffff", buttonText: "Buy Now", buttonUrl: "#",
    buttonBg: "#000000", buttonColor: "#ffffff", nameColor: "#111111", priceColor: "#111111",
    descriptionColor: "#666666", textAlign: "center", headingFont: SANS, fontFamily: SANS, buttonRadius: 6,
    imageRadius: 0,
  },
  cta: {
    ...BASE_DEFAULTS, paddingTop: 40, paddingBottom: 40, backgroundColor: "#111111", heading: "Ready to get started?",
    subheading: "Join thousands of teams already using Falcon.", buttonText: "Start for free", buttonUrl: "#",
    buttonBg: "#00D084", buttonColor: "#000000", headingColor: "#ffffff", subheadingColor: "#aaaaaa",
    textAlign: "center", headingFont: SANS, fontFamily: SANS, buttonRadius: 6,
  },
  footer_block: {
    ...BASE_DEFAULTS, companyName: "Falcon Inc.", address: "123 Main Street, San Francisco, CA 94107",
    unsubscribeUrl: "#", unsubscribeText: "Unsubscribe", textColor: "#999999", fontSize: 12, textAlign: "center",
    fontFamily: SANS,
  },
};

export const DEFAULT_SECTION_SETTINGS: SectionSettings = {
  name: "",
  backgroundColor: "transparent",
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  paddingRight: 0,
  gap: 16,
  stackOnMobile: true,
  borderWidth: 0,
  borderColor: "#e5e7eb",
  borderStyle: "solid",
};

const COLUMN_DEFAULTS = {
  backgroundColor: "transparent",
  padding: 0,
  verticalAlign: "top" as const,
  borderRadius: 0,
};

function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// ─── Factories ────────────────────────────────────────────────────────────────

export function createBlock<K extends BlockType>(
  type: K,
  overrides: Partial<Extract<EmailBlock, { type: K }>> = {}
): Extract<EmailBlock, { type: K }> {
  const defaults = BLOCK_DEFAULTS[type] ?? BLOCK_DEFAULTS.text;
  return { ...deepCopy(defaults), ...overrides, id: overrides.id || uid("blk"), type } as unknown as Extract<EmailBlock, { type: K }>;
}

export function createColumn(width: number, blocks: EmailBlock[] = [], overrides: Partial<EmailColumn> = {}): EmailColumn {
  return { ...COLUMN_DEFAULTS, ...overrides, id: overrides.id || uid("col"), width, blocks };
}

/** `widths` are percentages, e.g. [100], [50, 50] or [33.33, 66.67]. */
export function createSection(
  widths: number[] = [100],
  blocks: EmailBlock[][] = [],
  settings: Partial<SectionSettings> = {}
): EmailSection {
  return {
    id: uid("sec"),
    type: "section",
    settings: { ...DEFAULT_SECTION_SETTINGS, ...settings },
    columns: widths.map((w, i) => createColumn(w, blocks[i] || [])),
  };
}

export function createDocument(sections: EmailSection[] = [], settings: Partial<EmailSettings> = {}): EmailDocument {
  return {
    version: EMAIL_SCHEMA_VERSION,
    document: { type: "email", settings: { ...DEFAULT_EMAIL_SETTINGS, ...settings } },
    blocks: sections,
  };
}

/** Rescales column widths so they add up to exactly 100. */
export function balanceWidths(widths: number[]): number[] {
  const total = widths.reduce((sum, w) => sum + (w > 0 ? w : 0), 0);
  if (!widths.length) return [];
  if (total <= 0) return widths.map(() => Math.round(10000 / widths.length) / 100);
  const scaled = widths.map((w) => Math.round(((w > 0 ? w : 0) / total) * 10000) / 100);
  const drift = Math.round((100 - scaled.reduce((sum, w) => sum + w, 0)) * 100) / 100;
  scaled[scaled.length - 1] = Math.round((scaled[scaled.length - 1] + drift) * 100) / 100;
  return scaled;
}

// ─── Normalisation ────────────────────────────────────────────────────────────

export class EmailSchemaError extends Error {}

const LIMITS = { sections: 80, columns: 4, blocksPerColumn: 40, text: 20000, html: 400000, items: 12 };

/** True when the markup is a whole HTML document rather than a fragment. */
export function isFullHtmlDocument(html: string): boolean {
  return /<!doctype\s+html|<html[\s>]|<body[\s>]/i.test(String(html ?? "").slice(0, 20000));
}

/**
 * An email imported "as is" is stored as one HTML block holding the complete
 * original document. Returns that document, or null for an ordinary design.
 */
export function exactHtmlOf(doc: EmailDocument): string | null {
  if (doc.blocks.length !== 1 || doc.blocks[0].columns.length !== 1) return null;
  const blocks = doc.blocks[0].columns[0].blocks;
  if (blocks.length !== 1 || blocks[0].type !== "html") return null;
  return isFullHtmlDocument(blocks[0].html) ? blocks[0].html : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function num(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function str(value: unknown, fallback: string, max = LIMITS.text): string {
  if (typeof value !== "string") return fallback;
  return value.length > max ? value.slice(0, max) : value;
}

function normalizeBlock(raw: unknown): EmailBlock | null {
  if (!isRecord(raw)) return null;
  const type = raw.type as BlockType;
  if (!BLOCK_TYPES.includes(type)) return null;

  const defaults = BLOCK_DEFAULTS[type] as Record<string, unknown>;
  const out: Record<string, unknown> = { id: typeof raw.id === "string" && raw.id ? raw.id : uid("blk"), type };

  // Only known fields survive, each coerced to the type of its default
  for (const key of Object.keys(defaults)) {
    const fallback = defaults[key];
    const value = raw[key];
    if (value === undefined || value === null) {
      out[key] = deepCopy(fallback);
    } else if (typeof fallback === "number") {
      out[key] = num(value, fallback, -100, 4000);
    } else if (typeof fallback === "boolean") {
      out[key] = Boolean(value);
    } else if (typeof fallback === "string") {
      if (key === "width" && typeof value === "number") out[key] = num(value, 300, 10, 4000);
      else out[key] = str(value, fallback, key === "html" ? LIMITS.html : LIMITS.text);
    } else if (Array.isArray(fallback)) {
      const template = (fallback[0] || {}) as Record<string, unknown>;
      out[key] = (Array.isArray(value) ? value : [])
        .slice(0, LIMITS.items)
        .filter(isRecord)
        .map((item) => {
          const clean: Record<string, unknown> = {};
          for (const field of Object.keys(template)) clean[field] = str(item[field], "", 2000);
          return clean;
        });
    } else {
      out[key] = deepCopy(fallback);
    }
  }
  return out as unknown as EmailBlock;
}

function normalizeColumn(raw: unknown, fallbackWidth: number): EmailColumn {
  const source = isRecord(raw) ? raw : {};
  const blocks = (Array.isArray(source.blocks) ? source.blocks : [])
    .slice(0, LIMITS.blocksPerColumn)
    .map(normalizeBlock)
    .filter((b): b is EmailBlock => b !== null);
  const align = source.verticalAlign;
  return {
    id: typeof source.id === "string" && source.id ? source.id : uid("col"),
    width: num(typeof source.width === "string" ? parseFloat(source.width) : source.width, fallbackWidth, 5, 100),
    backgroundColor: str(source.backgroundColor, COLUMN_DEFAULTS.backgroundColor, 64),
    padding: num(source.padding, 0, 0, 80),
    verticalAlign: align === "middle" || align === "bottom" ? align : "top",
    borderRadius: num(source.borderRadius, 0, 0, 60),
    blocks,
  };
}

function normalizeSection(raw: unknown): EmailSection | null {
  if (!isRecord(raw)) return null;
  const rawColumns = Array.isArray(raw.columns) ? raw.columns.slice(0, LIMITS.columns) : [];
  if (!rawColumns.length) return null;

  const settingsIn = isRecord(raw.settings) ? raw.settings : {};
  const d = DEFAULT_SECTION_SETTINGS;
  const borderStyle = settingsIn.borderStyle;
  const settings: SectionSettings = {
    name: str(settingsIn.name, d.name, 80),
    backgroundColor: str(settingsIn.backgroundColor, d.backgroundColor, 64),
    paddingTop: num(settingsIn.paddingTop, d.paddingTop, 0, 200),
    paddingBottom: num(settingsIn.paddingBottom, d.paddingBottom, 0, 200),
    paddingLeft: num(settingsIn.paddingLeft, d.paddingLeft, 0, 200),
    paddingRight: num(settingsIn.paddingRight, d.paddingRight, 0, 200),
    gap: num(settingsIn.gap, d.gap, 0, 80),
    stackOnMobile: settingsIn.stackOnMobile === undefined ? d.stackOnMobile : Boolean(settingsIn.stackOnMobile),
    borderWidth: num(settingsIn.borderWidth, d.borderWidth, 0, 20),
    borderColor: str(settingsIn.borderColor, d.borderColor, 64),
    borderStyle: borderStyle === "dashed" || borderStyle === "dotted" ? borderStyle : "solid",
  };

  const even = 100 / rawColumns.length;
  const columns = rawColumns.map((c) => normalizeColumn(c, even));
  const widths = balanceWidths(columns.map((c) => c.width));
  columns.forEach((c, i) => { c.width = widths[i]; });

  return { id: typeof raw.id === "string" && raw.id ? raw.id : uid("sec"), type: "section", settings, columns };
}

/** Converts the pre-section editor format (one flat list of blocks) into sections. */
function legacyBlocksToSections(blocks: unknown[]): EmailSection[] {
  const sections: EmailSection[] = [];
  // Sections that hold exactly one imported block, and so can share a row if space runs out
  const single = new Set<EmailSection>();
  for (const raw of blocks) {
    if (!isRecord(raw)) continue;
    if (raw.type === "columns2" || raw.type === "columns3") {
      const cells = Array.isArray(raw.columns) ? raw.columns.filter(isRecord) : [];
      if (!cells.length) continue;
      const section = createSection(
        cells.map(() => 100 / cells.length),
        cells.map((cell) => [
          createBlock("text", {
            content: str(cell.content, ""), fontSize: num(cell.fontSize, 14, 8, 120),
            color: str(cell.color, "#333333", 64), fontFamily: str(cell.fontFamily, SANS, 200),
            textAlign: (cell.textAlign as TextAlign) || "left", fontWeight: (cell.fontWeight as FontWeight) || "normal",
            paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0,
          }),
        ]),
        {
          backgroundColor: str(raw.backgroundColor, "transparent", 64), gap: num(raw.gap, 16, 0, 80),
          paddingTop: num(raw.paddingTop, 16, 0, 200), paddingBottom: num(raw.paddingBottom, 16, 0, 200),
          paddingLeft: num(raw.paddingLeft, 24, 0, 200), paddingRight: num(raw.paddingRight, 24, 0, 200),
        }
      );
      const widths = balanceWidths(section.columns.map((c) => c.width));
      section.columns.forEach((c, i) => { c.width = widths[i]; });
      sections.push(section);
      continue;
    }
    const block = normalizeBlock(raw);
    if (block) {
      const section = createSection([100], [[block]]);
      single.add(section);
      sections.push(section);
    }
  }
  return fitSectionLimit(sections, single);
}

/**
 * A long imported email can produce more one-block rows than a document may
 * hold. Rather than refuse it, neighbouring one-block rows are stacked into
 * shared rows, using the smallest group size that brings the email within
 * the limit. Order and content are unchanged.
 */
function fitSectionLimit(sections: EmailSection[], single: Set<EmailSection>): EmailSection[] {
  if (sections.length <= LIMITS.sections) return sections;
  for (let size = 2; size <= LIMITS.blocksPerColumn; size++) {
    const merged: EmailSection[] = [];
    let open: EmailSection | null = null;
    for (const section of sections) {
      if (!single.has(section)) {
        open = null;
        merged.push(section);
        continue;
      }
      if (open && open.columns[0].blocks.length < size) {
        open.columns[0].blocks.push(section.columns[0].blocks[0]);
      } else {
        open = createSection([100], [[section.columns[0].blocks[0]]]);
        merged.push(open);
      }
    }
    if (merged.length <= LIMITS.sections) return merged;
  }
  return sections;
}

/**
 * Accepts any stored or user-supplied email document and returns a complete,
 * validated version-1 document. Understands compact documents (defaults
 * omitted) and the legacy flat-block format. Throws EmailSchemaError when the
 * input is not an email document at all.
 */
export function normalizeDocument(raw: unknown): EmailDocument {
  let data = raw;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      throw new EmailSchemaError("Email document is not valid JSON");
    }
  }
  if (!isRecord(data)) throw new EmailSchemaError("Email document must be an object");

  const version = data.version === undefined ? 0 : Number(data.version);
  if (!Number.isFinite(version) || version > EMAIL_SCHEMA_VERSION) {
    throw new EmailSchemaError(`Unsupported email document version: ${String(data.version)}`);
  }

  const documentIn = isRecord(data.document) ? data.document : {};
  const settingsIn = isRecord(documentIn.settings) ? documentIn.settings : isRecord(data.settings) ? data.settings : {};
  const d = DEFAULT_EMAIL_SETTINGS;
  const settings: EmailSettings = {
    subject: str(settingsIn.subject, d.subject, 300),
    preheader: str(settingsIn.preheader, d.preheader, 300),
    senderName: str(settingsIn.senderName, d.senderName, 120),
    replyTo: str(settingsIn.replyTo, d.replyTo, 254),
    emailWidth: num(settingsIn.emailWidth, d.emailWidth, 320, 900),
    backgroundColor: str(settingsIn.backgroundColor, d.backgroundColor, 64),
    contentBackground: str(settingsIn.contentBackground, d.contentBackground, 64),
    defaultFont: str(settingsIn.defaultFont, d.defaultFont, 200),
  };

  const list = Array.isArray(data.blocks) ? data.blocks : Array.isArray(data.sections) ? data.sections : [];
  const looksLegacy = list.some((item) => isRecord(item) && item.type !== "section");
  const sections = looksLegacy
    ? legacyBlocksToSections(list)
    : list.map(normalizeSection).filter((s): s is EmailSection => s !== null);

  if (sections.length > LIMITS.sections) {
    throw new EmailSchemaError(`This email is too long: it has ${sections.length} rows and the most an email can hold is ${LIMITS.sections}. Remove some content and try again.`);
  }

  return { version: EMAIL_SCHEMA_VERSION, document: { type: "email", settings }, blocks: sections };
}

/**
 * Drops every field that equals its schema default. `normalizeDocument` restores them.
 * With `dropIds`, element ids are omitted too and fresh ones are assigned on load,
 * which suits library templates that are always cloned before use.
 */
export function compactDocument(doc: EmailDocument, options: { dropIds?: boolean } = {}): unknown {
  const strip = (value: Record<string, unknown>, defaults: Record<string, unknown>, keep: string[]) => {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      if (key === "id" && options.dropIds) continue;
      if (keep.includes(key) || JSON.stringify(value[key]) !== JSON.stringify(defaults[key])) out[key] = value[key];
    }
    return out;
  };
  return {
    version: doc.version,
    document: {
      type: "email",
      settings: strip(doc.document.settings as unknown as Record<string, unknown>, DEFAULT_EMAIL_SETTINGS as unknown as Record<string, unknown>, []),
    },
    blocks: doc.blocks.map((section) => ({
      ...(options.dropIds ? {} : { id: section.id }),
      type: "section",
      settings: strip(section.settings as unknown as Record<string, unknown>, DEFAULT_SECTION_SETTINGS as unknown as Record<string, unknown>, []),
      columns: section.columns.map((column) => ({
        ...strip(column as unknown as Record<string, unknown>, COLUMN_DEFAULTS, ["id", "width"]),
        blocks: column.blocks.map((block) =>
          strip(block as unknown as Record<string, unknown>, BLOCK_DEFAULTS[block.type] as Record<string, unknown>, ["id", "type"])
        ),
      })),
    })),
  };
}

/** Deep copy with fresh ids, so a copy never shares identity with its source. */
export function cloneDocument(doc: EmailDocument): EmailDocument {
  const copy = deepCopy(doc);
  for (const section of copy.blocks) {
    section.id = uid("sec");
    for (const column of section.columns) {
      column.id = uid("col");
      for (const block of column.blocks) block.id = uid("blk");
    }
  }
  return copy;
}

export function cloneSection(section: EmailSection): EmailSection {
  return cloneDocument({ version: EMAIL_SCHEMA_VERSION, document: { type: "email", settings: DEFAULT_EMAIL_SETTINGS }, blocks: [section] }).blocks[0];
}

export function cloneBlock<T extends EmailBlock>(block: T): T {
  return { ...deepCopy(block), id: uid("blk") };
}

export function countBlocks(doc: EmailDocument): number {
  return doc.blocks.reduce((sum, s) => sum + s.columns.reduce((n, c) => n + c.blocks.length, 0), 0);
}

/** Every image URL the document references (for asset tracking and previews). */
export function collectImageUrls(doc: EmailDocument): string[] {
  const urls = new Set<string>();
  for (const section of doc.blocks) {
    for (const column of section.columns) {
      for (const block of column.blocks) {
        if (block.type === "image" || block.type === "logo") { if (block.src) urls.add(block.src); }
        else if (block.type === "video") { if (block.thumbnailSrc) urls.add(block.thumbnailSrc); }
        else if (block.type === "hero" || block.type === "feature" || block.type === "product") {
          if (block.imageSrc) urls.add(block.imageSrc);
        }
      }
    }
  }
  return [...urls];
}
