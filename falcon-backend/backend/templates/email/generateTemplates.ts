/**
 * Email template generator.
 *
 * Combines the catalogue (what the email is about) with layouts (how it is
 * arranged), palettes and typography into complete, editable email documents.
 *
 * Variation is structural, not cosmetic: within a subcategory every template
 * has a different arrangement of header, hero, body modules, call-to-action
 * and footer. Colour and type are then varied on top of that. Generation is
 * deterministic, so the same index always yields the same template and seeding
 * can be resumed or re-run safely.
 */
import { createHash } from "crypto";
import { EmailDocument, compactDocument, countBlocks, createDocument } from "./core/schema";
import { estimateEmailHeight } from "./core/renderThumbnail";
import { ART_STYLES } from "./art";
import { CategoryDef, SubcategoryDef, ThemeDef, allEmailSubcategories } from "./catalog";
import {
  ButtonStyle, CTAS, Density, FOOTERS, HEADERS, HEROES, LayoutContext, MODULES, MODULE_PLAN, Part, titleCase,
} from "./layouts";
import { photosFor } from "./photos";
import { FONT_PAIRS, PALETTES } from "./styles";

export interface GeneratedEmailTemplate {
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  subcategorySlug: string;
  tags: string[];
  keywords: string;
  layoutKey: string;
  paletteKey: string;
  fontKey: string;
  width: number;
  height: number;
  isFeatured: boolean;
  isPremium: boolean;
  shuffleKey: number;
  fingerprint: string;
  blockCount: number;
  document: EmailDocument;
  /** Compact JSON (defaults omitted) ready to store */
  templateData: string;
}

const BUTTON_STYLES: ButtonStyle[] = ["solid", "pill", "square", "outline"];
const DENSITIES: { key: Density; modules: number }[] = [
  { key: "compact", modules: 2 },
  { key: "standard", modules: 3 },
  { key: "rich", modules: 4 },
];
const MODULE_BY_KEY = new Map(MODULES.map((m) => [m.key, m]));

function hash32(value: string): number {
  return createHash("sha256").update(value).digest().readUInt32BE(0);
}

function rng(seed: number) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(list: readonly T[], rand: () => number): T {
  return list[Math.floor(rand() * list.length)];
}

function sample<T>(list: readonly T[], count: number, rand: () => number): T[] {
  const pool = [...list];
  const out: T[] = [];
  while (out.length < count && pool.length) out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  return out;
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function sentenceList(parts: string[]): string {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

interface Structure {
  header: Part;
  hero: Part;
  modules: Part[];
  cta: Part;
  footer: Part;
  density: Density;
  signature: string;
}

function chooseStructure(sub: SubcategoryDef, rand: () => number): Structure {
  const plan = MODULE_PLAN[sub.archetype];
  const density = pick(DENSITIES, rand);
  const lead = plan.lead.map((key) => MODULE_BY_KEY.get(key)!);
  const extra = sample(plan.pool, Math.max(1, density.modules - lead.length), rand).map((key) => MODULE_BY_KEY.get(key)!);
  const header = pick(HEADERS, rand);
  const hero = pick(HEROES, rand);
  const cta = pick(CTAS, rand);
  const footer = pick(FOOTERS, rand);
  const modules = [...lead, ...extra];
  return {
    header, hero, modules, cta, footer, density: density.key,
    signature: [header.key, hero.key, modules.map((m) => m.key).join("+"), cta.key, footer.key].join("|"),
  };
}

/**
 * Builds template number `index` of a subcategory. `taken` holds the layout
 * signatures already used in that subcategory; a clash is re-rolled so no two
 * templates there share a structure.
 */
export function generateOne(
  category: CategoryDef,
  sub: SubcategoryDef,
  index: number,
  taken: Set<string>
): GeneratedEmailTemplate {
  const base = hash32(`${category.slug}/${sub.slug}`);

  let structure: Structure | null = null;
  let rand = rng(base + index * 7919);
  for (let attempt = 0; attempt < 200; attempt++) {
    rand = rng(base + index * 7919 + attempt * 104729);
    const candidate = chooseStructure(sub, rand);
    if (!taken.has(candidate.signature)) {
      structure = candidate;
      break;
    }
  }
  if (!structure) {
    throw new Error(`Layout capacity exhausted for ${category.slug}/${sub.slug} at index ${index}`);
  }
  taken.add(structure.signature);

  // Themed subcategories cycle through every occasion before repeating
  const theme: ThemeDef | undefined = sub.themes?.length ? sub.themes[index % sub.themes.length] : undefined;
  const palettePool = theme?.palettes?.length && rand() < 0.75
    ? PALETTES.filter((p) => theme.palettes!.includes(p.key))
    : PALETTES;
  const palette = pick(palettePool.length ? palettePool : PALETTES, rand);
  const font = pick(FONT_PAIRS, rand);
  const brand = pick(category.brands, rand);
  const headline = theme ? theme.headline : pick(sub.headlines, rand);
  const rotation = Math.floor(rand() * sub.items.length);
  const items = sub.items.map((_item, i) => sub.items[(i + rotation) % sub.items.length]);
  const ctas = sample(sub.ctas, 2, rand);

  // Roughly three in five templates use real photography; the rest keep generated artwork.
  // Derived from its own hash so adding photos did not reshuffle any template's layout or colours.
  const imageryHash = hash32(`${category.slug}/${sub.slug}/${index}/imagery`);
  const pool = photosFor(category.slug, theme?.name);
  const photos = pool.length && imageryHash % 5 < 3
    ? pool.map((_id, i) => pool[(i + imageryHash) % pool.length])
    : [];

  const context: LayoutContext = {
    palette, font, category, sub, theme, brand, headline,
    subhead: pick(sub.subs, rand),
    cta: ctas[0],
    cta2: ctas[1] || ctas[0],
    kicker: theme ? theme.name : sub.name,
    items,
    details: sub.details || [["When", "To be announced"], ["Where", "Details to follow"], ["Contact", "hello@example.com"]],
    prices: category.prices,
    artStyle: pick(ART_STYLES, rand),
    buttonStyle: pick(BUTTON_STYLES, rand),
    seed: (base + index) % 1_000_000,
    photos,
    imageIndex: 0,
  };

  const sections = [
    ...structure.header.build(context),
    ...structure.hero.build(context),
    ...structure.modules.flatMap((m) => m.build(context)),
    ...structure.cta.build(context),
    ...structure.footer.build(context),
  ];

  const document = createDocument(sections, {
    subject: headline,
    preheader: context.subhead,
    senderName: titleCase(brand),
    backgroundColor: palette.page,
    contentBackground: palette.surface,
    defaultFont: font.body,
  });

  const subject = theme ? `${theme.name} ${sub.name}` : sub.name;
  const title = `${subject}: ${titleCase(structure.hero.label)} with ${structure.modules[structure.modules.length - 1].label} (${palette.name})`;
  const description =
    `A ${structure.density} ${subject.toLowerCase()} email with ${/^[aeiou]/.test(structure.hero.label) ? "an" : "a"} ${structure.hero.label}, ` +
    `${sentenceList(structure.modules.map((m) => m.label))}, and ${/^[aeiou]/.test(structure.cta.label) ? "an" : "a"} ${structure.cta.label}. ` +
    `${palette.name} palette with ${font.name} typography.`;

  const tags = [...new Set([
    ...sub.tags,
    ...(theme?.tags || []),
    category.name.toLowerCase(),
    sub.archetype,
    palette.family,
    palette.mode === "dark" ? "dark" : "light",
    // Counted after the layout was built, so a template with no pictures is not labelled as having photos
    context.imageIndex === 0 ? "text only" : photos.length ? "photo" : "illustrated",
    font.style,
    structure.density,
    ...structure.hero.tags,
    ...structure.modules.flatMap((m) => m.tags),
  ])].slice(0, 16);

  const keywords = [category.name, sub.name, theme?.name || "", headline, palette.name, font.name, ...tags].join(" ").toLowerCase();
  const fingerprint = createHash("sha256")
    .update([category.slug, sub.slug, structure.signature, palette.key, font.key, headline, theme?.name || ""].join("|"))
    .digest("hex");
  const slug = `${slugify(subject)}-${slugify(structure.hero.label)}-${palette.key}-${(base % 1296).toString(36)}${index.toString(36)}`;

  return {
    slug,
    title,
    description,
    categorySlug: category.slug,
    subcategorySlug: sub.slug,
    tags,
    keywords,
    layoutKey: structure.signature,
    paletteKey: palette.key,
    fontKey: font.key,
    width: document.document.settings.emailWidth,
    height: estimateEmailHeight(document),
    // The first few layouts of each subcategory are the hand-checked showcase set
    isFeatured: index < 6,
    isPremium: structure.density === "rich" && index % 4 === 3,
    shuffleKey: hash32(slug) % 2_000_000_000,
    fingerprint,
    blockCount: countBlocks(document),
    document,
    templateData: JSON.stringify(compactDocument(document, { dropIds: true })),
  };
}

/** How many structurally distinct layouts exist for a subcategory's kind of email. */
export function layoutCapacity(sub: SubcategoryDef): number {
  const plan = MODULE_PLAN[sub.archetype];
  let bodies = 0;
  for (const density of DENSITIES) {
    const picks = Math.max(1, density.modules - plan.lead.length);
    let permutations = 1;
    for (let i = 0; i < picks; i++) permutations *= plan.pool.length - i;
    bodies += permutations;
  }
  return HEADERS.length * HEROES.length * bodies * CTAS.length * FOOTERS.length;
}

export function totalLayoutCapacity(): number {
  return allEmailSubcategories().reduce((sum, { sub }) => sum + layoutCapacity(sub), 0);
}

/**
 * Yields `count` templates spread evenly across every subcategory, starting at
 * per-subcategory index `offset`. Generated lazily so 50,000+ templates never
 * sit in memory at once.
 */
export function* generateEmailTemplates(count: number, offset = 0): Generator<GeneratedEmailTemplate> {
  const subs = allEmailSubcategories();
  const perSub = Math.ceil(count / subs.length);
  const taken = subs.map(() => new Set<string>());

  // Replay earlier indexes so resumed runs keep the same de-duplication state
  if (offset > 0) {
    subs.forEach(({ category, sub }, s) => {
      for (let i = 0; i < offset; i++) generateOne(category, sub, i, taken[s]);
    });
  }

  let produced = 0;
  for (let i = offset; i < offset + perSub && produced < count; i++) {
    for (let s = 0; s < subs.length && produced < count; s++) {
      yield generateOne(subs[s].category, subs[s].sub, i, taken[s]);
      produced++;
    }
  }
}
