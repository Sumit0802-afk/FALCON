/**
 * aiStudio.service.ts
 *
 * AI Studio's reference-aware pipeline. A person gives a reference picture
 * (the visual blueprint) and a written request (what to make with it), and
 * the work is done in steps the browser calls one after another, so what it
 * shows as progress is what is really happening:
 *
 *   analyse   the reference is looked at: layout, type, colour, effects, density
 *   compile   the request is read for its content, and a full generation
 *             prompt is put together from the content, the analysis and the
 *             person's settings, with the things to avoid worked out from the
 *             reference rather than fixed
 *   artwork   one finished picture is made, with the reference handed to the
 *             picture model as a picture, not described to it
 *   evaluate  the result is compared with the reference and scored, so a
 *             poor match can be made again with the reasons given
 *
 * Making a finished picture needs a picture model (AI_ARTWORK_MODEL, or the
 * one the Portrait panel uses). When there is none, or it is not answering,
 * `layout` builds an editable design with Falcon's own layout engine instead,
 * using the reference's colours, type and density. The browser is told which
 * of the two it got; one is never passed off as the other.
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { z } from "zod";
import { prisma } from "../database/prismaClient";
import { AppError } from "../utils/AppError";
import { FONT_PAIRS, STYLES, contrastRatio, onColor } from "../templates/library/core";
import {
  COPY_RULES, DesignSpec, GeneratedDesign, PHOTO_LAYOUT_IDS, SIZE_BY_ID,
  ai, aiError, askForSpecs, buildChecked, checkSpecs, choosePhotos, present, provider, readJson,
} from "./aiDesign.service";
import { AI_ASSET_DIR } from "./aiImages";

// ─── What the browser and the server pass between them ────────────────────────

const LEVELS3 = ["low", "medium", "high"] as const;
const DENSITIES = ["low", "medium", "high", "ultra"] as const;
const STRENGTHS = ["creative", "balanced", "strong", "exact"] as const;
const USAGES = ["full", "composition", "style", "colors", "typography"] as const;
const ROLES = ["full", "layout", "color", "typography", "hero"] as const;

const HEX = /^#[0-9a-fA-F]{6}$/;
const text = (max: number) => z.string().trim().max(max).default("");
const list = (max: number, each = 160) => z.array(z.string().trim().max(each)).max(max).default([]);
const colours = z.array(z.string().regex(HEX)).max(6).default([]);

export const settingsSchema = z.object({
  strength: z.enum(STRENGTHS).default("strong"),
  usage: z.enum(USAGES).default("full"),
  density: z.enum(DENSITIES).default("medium"),
  creativity: z.enum(LEVELS3).default("medium"),
  typographyFidelity: z.enum(LEVELS3).default("high"),
  layoutFidelity: z.enum(LEVELS3).default("high"),
  colorFidelity: z.enum(LEVELS3).default("high"),
  detail: z.enum(DENSITIES).default("high"),
  quality: z.enum(["standard", "high"]).default("high"),
  variations: z.number().int().min(1).max(4).default(1),
});
export type StudioSettings = z.infer<typeof settingsSchema>;

/** What was seen in the reference */
export const analysisSchema = z.object({
  summary: text(400),
  format: text(80),
  subject: text(200),
  artDirection: text(300),
  layout: z.object({
    header: text(200), logos: text(200), title: text(200), subtitle: text(200), hero: text(240),
    information: text(240), cta: text(200), footer: text(200), side: text(200), decoration: text(240),
  }).default({}),
  typography: z.object({
    headline: text(240), category: text(80), weight: text(60), width: text(60), letterCase: text(60),
    spacing: text(80), hierarchy: text(300), treatments: list(8, 60),
  }).default({}),
  color: z.object({ primary: colours, secondary: colours, accent: colours, background: colours, text: colours, glow: colours }).default({}),
  effects: list(14, 60),
  lighting: text(200),
  background: text(240),
  border: text(160),
  icons: text(160),
  texture: text(160),
  density: z.object({
    level: z.enum(DENSITIES).default("medium"),
    emptySpace: z.number().min(0).max(100).default(30),
    decoration: z.enum(LEVELS3).default("medium"),
    text: z.enum(LEVELS3).default("medium"),
    objects: z.enum(LEVELS3).default("medium"),
    background: z.enum(LEVELS3).default("medium"),
  }).default({}),
  /** The words that could be read in the reference. Never used as content: the content is the person's own */
  wording: list(12, 120),
});
export type Analysis = z.infer<typeof analysisSchema>;

/** The look to keep from one generation to the next */
export const dnaSchema = z.object({
  composition: text(400), palette: z.array(z.string().regex(HEX)).max(8).default([]), typography: text(300), spacing: text(160),
  density: z.enum(DENSITIES).default("medium"), effects: list(14, 60), hero: text(240), background: text(240),
  border: text(160), icons: text(160), lighting: text(200), texture: text(160),
});
export type DesignDna = z.infer<typeof dnaSchema>;

/** What the person asked to appear. Only ever taken from their own words */
export const contentSchema = z.object({
  title: text(160), subtitle: text(200), tagline: text(240), date: text(120), venue: text(160), cta: text(80),
  prize: text(120), brand: text(120), details: z.array(z.object({ label: text(40), value: text(120) })).max(8).default([]),
  supporting: list(8, 200), footer: text(200), subject: text(240), changes: list(8, 200),
});
export type StudioContent = z.infer<typeof contentSchema>;

const picture = z.string().min(100).max(9_000_000);
export const referenceSchema = z.object({ image: picture, role: z.enum(ROLES).default("full") });
export type Reference = z.infer<typeof referenceSchema>;

// ─── Small helpers ────────────────────────────────────────────────────────────

function readPicture(dataUrl: string): { mime: string; data: Buffer } {
  const match = /^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl);
  if (!match) throw AppError.badRequest("That reference is not a picture Falcon can read. Use a PNG, JPEG or WebP.");
  const data = Buffer.from(match[2].replace(/\s+/g, ""), "base64");
  if (data.length < 200) throw AppError.badRequest("That reference picture is empty.");
  return { mime: `image/${match[1] === "jpg" ? "jpeg" : match[1]}`, data };
}

/** A reference at a size the models read well and quickly */
async function shrink(dataUrl: string, side = 1280): Promise<string> {
  const jpeg = await sharp(readPicture(dataUrl).data).rotate().flatten({ background: "#ffffff" }).resize(side, side, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 86 }).toBuffer();
  return jpeg.toString("base64");
}

const step = <T extends readonly string[]>(scale: T, value: T[number], by: number): T[number] => scale[Math.min(scale.length - 1, Math.max(0, scale.indexOf(value) + by))];

const ROLE_WORDS: Record<(typeof ROLES)[number], string> = {
  full: "the whole look: layout, colour, type and effects",
  layout: "LAYOUT and composition only",
  color: "COLOUR only",
  typography: "TYPOGRAPHY only",
  hero: "the HERO OBJECT only",
};

/** Asks the language model a question that is answered in JSON, with pictures if any are given */
async function askJson(system: string, user: string, pictures: string[] = []): Promise<any> {
  const models = provider().textModels;
  if (!models.length) models.push("gpt-5.4-mini");
  const content: any[] = [{ type: "text", text: user }, ...pictures.map((data) => ({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${data}` } }))];
  let failure: any;
  for (let round = 0; round < 2; round++) {
    if (round) await new Promise((done) => setTimeout(done, 4000));
    for (const model of models) {
      try {
        const response = await ai().chat.completions.create({
          model,
          messages: [{ role: "system", content: `${system}\n\nAnswer with one JSON object and nothing else.` }, { role: "user", content: pictures.length ? content : user }],
          response_format: { type: "json_object" },
        } as any);
        return readJson(response.choices[0]?.message?.content || "{}");
      } catch (err: any) {
        failure = err;
        const status = Number(err?.status) || 0;
        console.error(`[studio] model ${model} did not answer (status: ${status || "n/a"})`);
        if (status && ![404, 408, 429, 500, 502, 503, 504, 529].includes(status)) throw err;
      }
    }
  }
  throw failure;
}

// ─── 1. Looking at the reference ──────────────────────────────────────────────

const ANALYSIS_SHAPE = `{
  "summary": one sentence saying what kind of design this is,
  "format": "poster" | "instagram post" | "story" | "banner" | "flyer" | "certificate" | "presentation" | "thumbnail" | "invitation" | "social graphic",
  "subject": what the design is about,
  "artDirection": the overall art direction in one sentence,
  "layout": { "header", "logos", "title", "subtitle", "hero", "information", "cta", "footer", "side", "decoration" }, each saying where that part sits and how large it is, or "" if the design has none,
  "typography": { "headline": how the main title is drawn, "category": "condensed sans" | "wide sans" | "geometric sans" | "serif" | "slab" | "brush" | "handwritten" | "futuristic" | "display" | "monospace", "weight", "width", "letterCase", "spacing", "hierarchy": the sizes from largest to smallest, "treatments": any of outlined, metallic, distressed, 3D, glow, gradient, stroked, shadowed },
  "color": { "primary", "secondary", "accent", "background", "text", "glow" }, each a list of up to three hex colours such as "#0B1026", taken from the picture,
  "effects": the visual effects present, from: shadows, glow, gradients, texture, scratches, grain, metallic, 3D, depth, lighting, particles, sparks, blur, halftone, smoke, lens flare,
  "lighting": how the scene is lit,
  "background": what the background is made of,
  "border": any frame or border,
  "icons": the style of any icons or small graphics,
  "texture": any surface texture,
  "density": { "level": "low" | "medium" | "high" | "ultra", "emptySpace": the share of the design that is empty, 0 to 100, "decoration": "low" | "medium" | "high", "text": same, "objects": same, "background": same },
  "wording": the lines of text that can be read in the picture
}`;

/** The model's reading of the reference, keeping every usable part of it */
function readAnalysis(raw: any): Analysis {
  const word = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
  const words = (value: unknown, max: number, each: number) => (Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : []).map((v: unknown) => word(v, each)).filter(Boolean).slice(0, max);
  const hexes = (value: unknown) => (Array.isArray(value) ? value : typeof value === "string" ? [value] : []).filter((v: unknown): v is string => typeof v === "string" && HEX.test(v.trim())).map((v: string) => v.trim()).slice(0, 6);
  const level = <T extends readonly string[]>(scale: T, value: unknown, fallback: T[number]): T[number] => (scale.includes(String(value).toLowerCase()) ? (String(value).toLowerCase() as T[number]) : fallback);
  const part = (group: any, keys: string[], max: number) => Object.fromEntries(keys.map((k) => [k, word(group?.[k], max)]));
  return analysisSchema.parse({
    summary: word(raw?.summary, 400), format: word(raw?.format, 80), subject: word(raw?.subject, 200), artDirection: word(raw?.artDirection, 300),
    layout: part(raw?.layout, ["header", "logos", "title", "subtitle", "hero", "information", "cta", "footer", "side", "decoration"], 200),
    typography: { ...part(raw?.typography, ["headline", "category", "weight", "width", "letterCase", "spacing", "hierarchy"], 240), category: word(raw?.typography?.category, 80), weight: word(raw?.typography?.weight, 60), width: word(raw?.typography?.width, 60), letterCase: word(raw?.typography?.letterCase, 60), spacing: word(raw?.typography?.spacing, 80), treatments: words(raw?.typography?.treatments, 8, 60) },
    color: Object.fromEntries(["primary", "secondary", "accent", "background", "text", "glow"].map((k) => [k, hexes(raw?.color?.[k])])),
    effects: words(raw?.effects, 14, 60), lighting: word(raw?.lighting, 200), background: word(raw?.background, 240), border: word(raw?.border, 160),
    icons: word(raw?.icons, 160), texture: word(raw?.texture, 160),
    density: {
      level: level(DENSITIES, raw?.density?.level, "medium"),
      emptySpace: Math.min(100, Math.max(0, Math.round(Number(raw?.density?.emptySpace) || 0))),
      decoration: level(LEVELS3, raw?.density?.decoration, "medium"), text: level(LEVELS3, raw?.density?.text, "medium"),
      objects: level(LEVELS3, raw?.density?.objects, "medium"), background: level(LEVELS3, raw?.density?.background, "medium"),
    },
    wording: words(raw?.wording, 12, 120),
  });
}

function dnaOf(a: Analysis): DesignDna {
  const palette = [...a.color.background, ...a.color.primary, ...a.color.accent, ...a.color.secondary, ...a.color.text, ...a.color.glow];
  return dnaSchema.parse({
    composition: [a.layout.title && `title: ${a.layout.title}`, a.layout.hero && `hero: ${a.layout.hero}`, a.layout.information && `information: ${a.layout.information}`, a.layout.cta && `call to action: ${a.layout.cta}`, a.layout.footer && `footer: ${a.layout.footer}`].filter(Boolean).join("; ").slice(0, 400),
    palette: [...new Set(palette.map((c) => c.toLowerCase()))].slice(0, 8),
    typography: [a.typography.category, a.typography.weight, a.typography.letterCase, ...a.typography.treatments].filter(Boolean).join(", ").slice(0, 300),
    spacing: `${a.density.emptySpace}% of the design is empty`,
    density: a.density.level,
    effects: a.effects,
    hero: a.layout.hero,
    background: a.background,
    border: a.border,
    icons: a.icons,
    lighting: a.lighting,
    texture: a.texture,
  });
}

/** Settings chosen from what the reference is like, so a dense poster and a minimal one do not start the same */
function defaultsFor(a: Analysis): StudioSettings {
  const dense = a.density.level === "high" || a.density.level === "ultra";
  const typeLed = a.typography.treatments.length > 0 || /brush|handwritten|display|futuristic|condensed/i.test(a.typography.category);
  return settingsSchema.parse({
    strength: "strong",
    usage: "full",
    density: a.density.level,
    creativity: "medium",
    typographyFidelity: typeLed ? "high" : "medium",
    layoutFidelity: dense ? "high" : "medium",
    colorFidelity: "high",
    detail: a.density.level,
    quality: "high",
    variations: 1,
  });
}

// ─── 2. Reading the request and compiling the prompt ──────────────────────────

const CONTENT_SHAPE = `{
  "title": the main title, "subtitle", "tagline", "date", "venue", "cta": button or call-to-action wording, "prize", "brand": organiser or brand,
  "details": [{ "label", "value" }] for other facts such as time, price, contact or website,
  "supporting": other lines of text that must appear, "footer",
  "subject": what the design is about and what its main picture should show,
  "changes": what the person asked to be changed, added or removed compared with the reference
}`;

/** The model's brief as content, taking what is usable and leaving out what is not, so one odd field does not lose the rest */
function readContent(raw: any): StudioContent {
  const word = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : typeof value === "number" ? String(value) : "");
  const words = (value: unknown, max: number, each: number) => (Array.isArray(value) ? value.map((v) => word(v, each)).filter(Boolean).slice(0, max) : []);
  return contentSchema.parse({
    title: word(raw?.title, 160), subtitle: word(raw?.subtitle, 200), tagline: word(raw?.tagline, 240), date: word(raw?.date, 120),
    venue: word(raw?.venue, 160), cta: word(raw?.cta, 80), prize: word(raw?.prize, 120), brand: word(raw?.brand, 120),
    details: (Array.isArray(raw?.details) ? raw.details : []).map((d: any) => ({ label: word(d?.label, 40), value: word(d?.value, 120) })).filter((d: { value: string }) => d.value).slice(0, 8),
    supporting: words(raw?.supporting, 8, 200), footer: word(raw?.footer, 200), subject: word(raw?.subject, 240), changes: words(raw?.changes, 8, 200),
  });
}

/** What a person's words say about the previous result, turned into settings */
function applyFeedback(prompt: string, settings: StudioSettings): { settings: StudioSettings; notes: string[] } {
  const next = { ...settings };
  const notes: string[] = [];
  if (/\b(too|very|so)\s+(simple|plain|empty|basic|boring|minimal)\b|\bmore\s+(detail|detailed|complex)\b|\bnot\s+enough\s+detail\b/i.test(prompt)) {
    next.density = step(DENSITIES, settings.density, 1);
    next.detail = step(DENSITIES, settings.detail, 1);
    notes.push(`You said it was too simple, so visual density is raised to ${next.density} and detail to ${next.detail}.`);
  }
  if (/\b(follow|match|copy|same as|exactly like|stick to)\b[^.]{0,40}\breference\b|\breference\b[^.]{0,30}\bexact/i.test(prompt)) {
    next.strength = "exact";
    next.layoutFidelity = "high"; next.colorFidelity = "high"; next.typographyFidelity = "high";
    notes.push("You asked for the reference to be followed exactly, so reference strength is set to Exact.");
  }
  if (/\b(more|be|get)\s+creative\b|\bless\s+(like|close to)\s+the\s+reference\b|\bsurprise me\b/i.test(prompt)) {
    next.strength = step(STRENGTHS, settings.strength, -1);
    next.creativity = step(LEVELS3, settings.creativity, 1);
    notes.push(`You asked for something more creative, so reference strength is eased to ${next.strength}. The colours, type and mood are still kept.`);
  }
  return { settings: next, notes };
}

const STRENGTH_WORDS: Record<StudioSettings["strength"], string> = {
  creative: "Take the reference as inspiration only. Keep its mood, palette and type character, and compose freely.",
  balanced: "Keep the reference's design language and overall arrangement, with room to rework the details.",
  strong: "Follow the reference closely: the same arrangement of parts, the same palette, the same type treatment, the same density and effects. Change only what the content requires.",
  exact: "Reproduce the reference's design as exactly as possible: every part in the same place and at the same size, the same colours, the same type treatment, the same effects and density. Only the wording and the subject change.",
};

const DENSITY_WORDS: Record<StudioSettings["density"], string> = {
  low: "Sparse and calm: a few elements and generous empty space.",
  medium: "Balanced: a clear focal picture, supporting graphics, some breathing room.",
  high: "Rich: a detailed background, layered decorative elements, several blocks of information, little empty space.",
  ultra: "Very dense and intricate: a complex layered background, many decorative and technical details, particles and texture, a highly detailed hero object, strong type and several information sections. No large empty areas.",
};

/** What must not come out, worked out from the reference and the settings rather than fixed */
function negativesFor(analysis: Analysis | null, settings: StudioSettings): string[] {
  const out = new Set<string>(["website or app user interface", "template gallery or several designs in one image", "watermarks or stock-photo marks", "misspelt, garbled or invented text"]);
  const dense = settings.density === "high" || settings.density === "ultra";
  if (dense) ["large empty areas", "minimal layout", "low-detail or flat background", "simple card design", "generic corporate flyer"].forEach((n) => out.add(n));
  else ["cluttered background", "decoration that crowds the text"].forEach((n) => out.add(n));
  if (settings.strength === "strong" || settings.strength === "exact") ["a different composition from the reference", "colours that are not in the reference palette", "a generic template look"].forEach((n) => out.add(n));
  if (analysis) {
    if (analysis.typography.treatments.length || /brush|handwritten|display|futuristic|condensed|slab/i.test(analysis.typography.category)) out.add("plain default typography for the title");
    if (/condensed/i.test(analysis.typography.category)) out.add("wide or rounded title lettering");
    if (/serif/i.test(analysis.typography.category) && !/sans/i.test(analysis.typography.category)) out.add("sans-serif title lettering");
    if (analysis.effects.some((e) => /glow|neon|particles|sparks|lighting/i.test(e))) out.add("flat lighting with no glow");
    if (analysis.effects.some((e) => /texture|grain|scratch|distress/i.test(e))) out.add("clean untextured surfaces");
    if (analysis.effects.some((e) => /3d|depth|metallic/i.test(e))) out.add("flat two-dimensional shapes where the reference has depth");
    if (analysis.density.emptySpace < 20) out.add("weak visual hierarchy");
    if (/photo/i.test(analysis.layout.hero) === false && analysis.layout.hero) out.add("an unrelated stock photograph in place of the hero");
  }
  return [...out];
}

function contentLines(c: StudioContent): string[] {
  const lines: string[] = [];
  const add = (label: string, value: string) => { if (value) lines.push(`${label}: "${value}"`); };
  add("Main title (the largest text)", c.title);
  add("Secondary title", c.subtitle);
  add("Tagline", c.tagline);
  add("Date", c.date);
  add("Venue", c.venue);
  add("Prize", c.prize);
  for (const d of c.details) if (d.value) lines.push(`${d.label || "Detail"}: "${d.value}"`);
  for (const s of c.supporting) lines.push(`Supporting line: "${s}"`);
  add("Call to action", c.cta);
  add("Organiser or brand", c.brand);
  add("Footer", c.footer);
  return lines;
}

/** Puts the generation prompt together from its parts */
function compilePrompt(input: { content: StudioContent; analysis: Analysis | null; dna: DesignDna | null; settings: StudioSettings; sizeName: string; plan: string; negatives: string[] }): string {
  const { content: c, analysis: a, dna, settings: s } = input;
  const use = (part: "composition" | "style" | "colors" | "typography") => !!a && (s.usage === "full" || s.usage === part);
  const lines = contentLines(c);
  const section = (name: string, body: (string | false | undefined)[]) => {
    const kept = body.filter(Boolean) as string[];
    return kept.length ? `${name}\n${kept.map((l) => `- ${l}`).join("\n")}` : "";
  };

  return [
    section("FORMAT", [`One complete, finished ${input.sizeName} design. A single artwork that fills the whole frame, not a mock-up, not a set of options.`]),
    section("CONTENT", [
      c.subject && `Subject: ${c.subject}`,
      ...lines,
      lines.length ? "Render every line of text above exactly as written, correctly spelt. Add no other words, dates, prices, names, logos or sponsors." : "The person gave no wording. Do not invent any text, dates, prices, names or logos.",
      ...c.changes.map((change) => `Requested change: ${change}`),
    ]),
    section("COMPOSITION", [
      input.plan,
      use("composition") && a!.layout.header && `Header: ${a!.layout.header}`,
      use("composition") && a!.layout.logos && `Logo positions: ${a!.layout.logos}`,
      use("composition") && a!.layout.title && `Title: ${a!.layout.title}`,
      use("composition") && a!.layout.subtitle && `Subtitle: ${a!.layout.subtitle}`,
      use("composition") && a!.layout.hero && `Hero: ${a!.layout.hero}`,
      use("composition") && a!.layout.information && `Information blocks: ${a!.layout.information}`,
      use("composition") && a!.layout.side && `Side content: ${a!.layout.side}`,
      use("composition") && a!.layout.cta && `Call to action: ${a!.layout.cta}`,
      use("composition") && a!.layout.footer && `Footer: ${a!.layout.footer}`,
      use("composition") && a!.layout.decoration && `Decorative elements: ${a!.layout.decoration}`,
    ]),
    section("STYLE", [
      use("style") && a!.artDirection,
      use("style") && a!.background && `Background: ${a!.background}`,
      use("style") && a!.border && `Border: ${a!.border}`,
      use("style") && a!.icons && `Icons and small graphics: ${a!.icons}`,
      use("style") && a!.texture && `Texture: ${a!.texture}`,
      `Visual density, ${s.density}: ${DENSITY_WORDS[s.density]}`,
      `Detail level: ${s.detail}. ${s.quality === "high" ? "High resolution, sharp edges, realistic materials, consistent lighting, professional finishing." : "Clean, sharp and well finished."}`,
    ]),
    section("TYPOGRAPHY", [
      "Text is part of the composition. Keep a clear hierarchy: main title largest, then the secondary title, tagline, event information, supporting lines and footer. Never set all the text at one size.",
      use("typography") && a!.typography.headline && `Title lettering: ${a!.typography.headline}`,
      use("typography") && a!.typography.category && `Typeface character: ${[a!.typography.category, a!.typography.weight, a!.typography.width, a!.typography.letterCase, a!.typography.spacing].filter(Boolean).join(", ")}`,
      use("typography") && a!.typography.treatments.length > 0 && `Lettering treatments to keep: ${a!.typography.treatments.join(", ")}`,
      use("typography") && a!.typography.hierarchy && `Hierarchy in the reference: ${a!.typography.hierarchy}`,
      use("typography") && `Typography fidelity: ${s.typographyFidelity}.`,
    ]),
    section("COLOR", [
      use("colors") && !!dna && dna.palette.length > 0 && `Palette, to be used as given: ${dna.palette.join(", ")}`,
      use("colors") && a!.color.background.length > 0 && `Background colours: ${a!.color.background.join(", ")}`,
      use("colors") && a!.color.accent.length > 0 && `Accent colours: ${a!.color.accent.join(", ")}`,
      use("colors") && a!.color.text.length > 0 && `Text colours: ${a!.color.text.join(", ")}`,
      use("colors") && a!.color.glow.length > 0 && `Glow colours: ${a!.color.glow.join(", ")}`,
      use("colors") && `Colour fidelity: ${s.colorFidelity}.`,
      !use("colors") && "Choose a palette that suits the subject and mood, with strong contrast between text and background.",
    ]),
    section("EFFECTS AND LIGHTING", [
      use("style") && a!.effects.length > 0 && `Effects: ${a!.effects.join(", ")}`,
      use("style") && a!.lighting && `Lighting: ${a!.lighting}`,
    ]),
    a ? section("REFERENCE FIDELITY", [
      `The attached reference is the visual blueprint. ${STRENGTH_WORDS[s.strength]}`,
      s.usage !== "full" && `Take only the reference's ${s.usage} from it; everything else is free.`,
      `Layout fidelity: ${s.layoutFidelity}. Creativity: ${s.creativity}.`,
      "Do not copy the reference's own wording, logos or people. The wording is the CONTENT above.",
    ]) : "",
    section("NEGATIVE CONSTRAINTS (do not produce)", input.negatives),
  ].filter(Boolean).join("\n\n");
}

// ─── 3. Making the artwork ────────────────────────────────────────────────────

let artworkDownUntil = 0;

function artworkModel(): string {
  return (process.env.AI_ARTWORK_MODEL || process.env.PORTRAIT_IMAGE_MODEL || process.env.TRANSFORM_IMAGE_MODEL || "").trim();
}

function canMakeArtwork(): boolean {
  return artworkModel() !== "" && !!(process.env.AI_API_KEY || "").trim() && Date.now() > artworkDownUntil;
}

/** The picture model's nearest shape to a format */
function aspectOf(width: number, height: number): string {
  const shapes: [string, number][] = [["1:1", 1], ["4:5", 0.8], ["3:4", 0.75], ["2:3", 0.667], ["9:16", 0.5625], ["5:4", 1.25], ["4:3", 1.333], ["3:2", 1.5], ["16:9", 1.778], ["21:9", 2.333]];
  const ratio = width / height;
  return shapes.reduce((best, shape) => (Math.abs(shape[1] - ratio) < Math.abs(best[1] - ratio) ? shape : best))[0];
}

const ARTWORK_NAME = /^s-[0-9a-f]{24}\.jpg$/;

function artworkFile(address: string): string {
  const name = (address.split("/").pop() || "").split("?")[0];
  const file = path.join(AI_ASSET_DIR, name);
  if (!ARTWORK_NAME.test(name) || !fs.existsSync(file)) throw AppError.badRequest("That design is no longer available. Generate it again.");
  return file;
}

async function generateArtwork(prompt: string, pictures: { label: string; data: string }[], width: number, height: number): Promise<Buffer> {
  const key = (process.env.AI_API_KEY || "").trim();
  const parts: any[] = [{ text: prompt }];
  for (const p of pictures) parts.push({ text: p.label }, { inlineData: { mimeType: "image/jpeg", data: p.data } });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000);
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(artworkModel())}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseModalities: ["TEXT", "IMAGE"], imageConfig: { aspectRatio: aspectOf(width, height) } } }),
    });
    if (!res.ok) {
      // No allowance or no access is not going to change in the next few minutes
      if ([401, 403, 404, 429].includes(res.status)) artworkDownUntil = Date.now() + 10 * 60_000;
      console.error(`[studio] picture model answered ${res.status}`);
      throw new AppError(
        res.status === 429 ? "The picture model has no allowance on this server's AI account, so a finished artwork cannot be made. Billing has to be enabled for the account whose key is in the backend's .env file." : "The picture model is not answering just now.",
        503, "ARTWORK_UNAVAILABLE",
      );
    }
    const body: any = await res.json();
    const part = (body.candidates?.[0]?.content?.parts || []).find((p: any) => p.inlineData?.data);
    if (!part) throw new AppError("The picture model returned no picture. Try wording the request differently.", 502, "ARTWORK_EMPTY");
    return Buffer.from(part.inlineData.data, "base64");
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    throw new AppError("Falcon could not reach the picture model. Check the connection and try again.", 502, "ARTWORK_UNREACHABLE");
  } finally {
    clearTimeout(timer);
  }
}

// ─── The layout engine, when no artwork can be made ───────────────────────────

/** The library font pairing closest to the reference's lettering */
function fontFor(category: string): string | null {
  const wanted: [RegExp, RegExp][] = [
    [/brush|handwritten|script/i, /script|hand|brush|caveat|pacifico|marker/i],
    [/condensed/i, /bebas|oswald|anton|condensed|league|archivo narrow|barlow/i],
    [/serif|slab/i, /playfair|serif|cormorant|lora|merriweather|dm serif|libre|abril/i],
    [/futuristic|display|monospace/i, /orbitron|rajdhani|space|mono|audiowide|exo|syne|unbounded/i],
    [/wide|geometric|sans/i, /poppins|montserrat|inter|manrope|outfit|jakarta|sora|dm sans/i],
  ];
  for (const [test, fonts] of wanted) {
    if (!test.test(category)) continue;
    const found = FONT_PAIRS.find((f: any) => fonts.test(`${f.id} ${f.name || ""} ${f.heading || ""} ${f.display || ""}`));
    if (found) return found.id;
  }
  return null;
}

/** The reference's colours laid over a design, kept readable */
function recolour(spec: DesignSpec, analysis: Analysis): void {
  const bg = analysis.color.background[0] || analysis.color.primary[0];
  if (!bg) return;
  const pickReadable = (candidates: string[], floor: number, fallback: string) => candidates.find((c) => contrastRatio(c, bg) >= floor) || fallback;
  const textColour = pickReadable([...analysis.color.text, "#ffffff", "#0a0a0a"], 4.5, onColor(bg));
  // An accent has to be a colour of its own: one that is the text colour again would vanish beside the text
  const coloured = (c: string) => c.toLowerCase() !== textColour.toLowerCase() && contrastRatio(c, textColour) >= 1.25;
  const accent = pickReadable([...analysis.color.primary, ...analysis.color.glow, ...analysis.color.accent, ...analysis.color.secondary].filter(coloured), 1.8, spec.colors.accent);
  const accent2 = pickReadable([...analysis.color.secondary, ...analysis.color.glow, ...analysis.color.accent, ...analysis.color.primary].filter((c) => coloured(c) && c.toLowerCase() !== accent.toLowerCase()), 1.5, accent);
  const light = contrastRatio("#000000", bg) > contrastRatio("#ffffff", bg);
  spec.colors = { ...spec.colors, background: bg, text: textColour, accent, accent2, surface: analysis.color.background[1] || spec.colors.surface };
  spec.mode = light ? "light" : "dark";
}

function layoutInstructions(count: number, sizeName: string, analysis: Analysis | null, content: StudioContent, settings: StudioSettings, keep?: DesignSpec): string {
  return [
    "You are the senior designer inside Falcon, a design tool. Falcon will set your answer out as an editable design with its own layout engine.",
    `Produce exactly ${count} design${count > 1 ? "s" : ""} for a ${sizeName}.`,
    keep
      ? "You are given a finished design as JSON. Keep its words, colours, font pairing, mode and pictures exactly. Change only the layout and the style of decoration, so every version is recognisably the same design."
      : "This is one finished design, not a set of alternatives.",
    "The wording is given to you below. Use it exactly, and where a field has no wording leave it as an empty string. Never invent a date, place, price, prize, name or brand.",
    ...COPY_RULES.slice(2),
    analysis ? `A reference picture was analysed. Follow it: ${JSON.stringify({ artDirection: analysis.artDirection, typography: analysis.typography.category, density: analysis.density.level, effects: analysis.effects, background: analysis.background, colours: analysis.color })}` : "",
    `Visual density wanted: ${settings.density}. For high or ultra choose the richest style and the layout that fills the page; for low choose a spare one.`,
    `Every design is built around a picture, so layout must be one of: ${PHOTO_LAYOUT_IDS.join(", ")}.`,
    `style must be one of: ${STYLES.map((s) => s.id).join(", ")}.`,
    "imageQueries are four stock photo searches in English for the picture this design is built around, most exact first and the last two a single common word. imagePrompt describes that picture with no words in it.",
    `The wording: ${JSON.stringify(content)}`,
  ].filter(Boolean).join("\n");
}

/** The person's wording set on a design, whatever the model put there */
function setWording(spec: DesignSpec, content: StudioContent): void {
  const details = [
    content.date && { label: "Date", value: content.date },
    content.venue && { label: "Venue", value: content.venue },
    content.prize && { label: "Prize", value: content.prize },
    ...content.details.filter((d) => d.value).map((d) => ({ label: d.label || "Info", value: d.value })),
  ].filter(Boolean) as { label: string; value: string }[];
  if (content.title) spec.title = content.title.slice(0, 80);
  if (content.tagline || content.subtitle) spec.tagline = (content.tagline || content.subtitle).slice(0, 200);
  if (content.subtitle && content.tagline) spec.kicker = content.subtitle.slice(0, 60);
  if (content.cta) spec.cta = content.cta.slice(0, 40);
  if (content.brand) spec.brand = content.brand.slice(0, 48);
  if (details.length) spec.details = details.slice(0, 3).map((d) => ({ label: d.label.slice(0, 24), value: d.value.slice(0, 48) }));
}

// ─── Public API ───────────────────────────────────────────────────────────────

const PARTS = ["composition", "typography", "color", "density", "placement", "background", "effects", "artDirection"] as const;

export const aiStudioService = {
  /** Whether a finished artwork can be made right now, or only an editable layout */
  status() {
    return { artwork: canMakeArtwork(), configured: artworkModel() !== "" };
  },

  /** Looks at the reference pictures and says what they are made of */
  async analyze(input: { references: Reference[] }): Promise<{ analysis: Analysis; dna: DesignDna; defaults: StudioSettings }> {
    const pictures = await Promise.all(input.references.map((r) => shrink(r.image)));
    const roles = input.references.length > 1
      ? `There are ${input.references.length} pictures. ${input.references.map((r, i) => `Picture ${i + 1} is the reference for ${ROLE_WORDS[r.role]}.`).join(" ")} Describe one combined design, taking each part from the picture that is the reference for it.`
      : "There is one reference picture.";
    let raw: any;
    try {
      raw = await askJson(
        "You are a senior art director analysing a reference design so that another designer can recreate its visual language without seeing it. Be specific and concrete: say where things are, how big, what colour, what style. Report only what is in the picture.",
        `${roles}\nAnswer with this JSON shape:\n${ANALYSIS_SHAPE}`,
        pictures,
      );
    } catch (err) {
      throw aiError(err, "read the reference");
    }
    const analysis = readAnalysis(raw);
    if (!analysis.summary && !analysis.color.background.length && !analysis.layout.title) throw new AppError("Falcon could not make sense of that reference. Try another picture.", 502, "AI_FAILED");
    return { analysis, dna: dnaOf(analysis), defaults: defaultsFor(analysis) };
  },

  /** Reads the request for its content and puts the generation prompt together */
  async compile(input: { prompt: string; sizeId: string; analysis: Analysis | null; dna: DesignDna | null; settings: StudioSettings }): Promise<{ content: StudioContent; compiled: string; negatives: string[]; settings: StudioSettings; notes: string[] }> {
    const size = SIZE_BY_ID[input.sizeId] || SIZE_BY_ID["portrait-4x5"];
    const { settings, notes } = applyFeedback(input.prompt, input.settings);
    let raw: any;
    try {
      raw = await askJson(
        [
          "You prepare a design brief from what a person wrote. Separate the words that must appear in the design from the instructions about how it should look.",
          "Take wording only from what the person wrote, exactly as they wrote it. Never invent a title, date, venue, price, prize, name, sponsor or claim. A field the person gave nothing for is an empty string.",
          "If the person gave only a topic and no wording, write a short fitting title of at most five words from that topic and leave every factual field empty.",
          `"plan" is one or two sentences on how the content should be arranged in a ${size.name}${input.analysis ? ", following the reference's arrangement described below" : ""}.`,
          input.analysis ? `The reference's layout: ${JSON.stringify(input.analysis.layout)}` : "",
        ].filter(Boolean).join("\n"),
        `What the person wrote:\n"""\n${input.prompt}\n"""\nAnswer with this JSON shape, plus a "plan" string:\n${CONTENT_SHAPE}`,
      );
    } catch (err) {
      throw aiError(err, "read your request");
    }
    const content = readContent(raw);
    const negatives = negativesFor(input.analysis, settings);
    const compiled = compilePrompt({ content, analysis: input.analysis, dna: input.dna, settings, sizeName: size.name, plan: String(raw?.plan || "").slice(0, 400), negatives });
    return { content, compiled, negatives, settings, notes };
  },

  /**
   * Makes one finished artwork. The references go to the picture model as
   * pictures. `base` is an earlier result to work from, for making it again,
   * for a variation or for a fix, so the design stays the same design.
   */
  async artwork(input: { compiled: string; sizeId: string; references: Reference[]; base?: string; instruction?: string; baseUrl: string }): Promise<{ url: string; width: number; height: number }> {
    if (!artworkModel()) throw new AppError("No picture model is set up on this server, so a finished artwork cannot be made.", 503, "ARTWORK_UNAVAILABLE");
    if (!canMakeArtwork()) throw new AppError("The picture model has no allowance on this server's AI account, so a finished artwork cannot be made. Billing has to be enabled for the account whose key is in the backend's .env file.", 503, "ARTWORK_UNAVAILABLE");
    const size = SIZE_BY_ID[input.sizeId] || SIZE_BY_ID["portrait-4x5"];
    const pictures: { label: string; data: string }[] = [];
    for (const [i, ref] of input.references.entries()) pictures.push({ label: `Reference ${i + 1}: the visual blueprint for ${ROLE_WORDS[ref.role]}.`, data: await shrink(ref.image) });
    if (input.base) pictures.push({ label: "The design made so far. Keep it the same design: same composition, colours and type. Apply only the instruction.", data: (await sharp(artworkFile(input.base)).resize(1280, 1280, { fit: "inside" }).jpeg({ quality: 88 }).toBuffer()).toString("base64") });
    const lead = input.base && input.instruction ? `INSTRUCTION\n- ${input.instruction}\n\n` : "";
    const made = await generateArtwork(`${lead}Design one finished piece of graphic design from the brief below.\n\n${input.compiled}`, pictures, size.width, size.height);

    fs.mkdirSync(AI_ASSET_DIR, { recursive: true });
    const name = `s-${crypto.randomBytes(12).toString("hex")}.jpg`;
    const info = await sharp(made).resize(size.width, size.height, { fit: "cover" }).jpeg({ quality: 92, mozjpeg: true }).toFile(path.join(AI_ASSET_DIR, name));
    return { url: `${input.baseUrl.replace(/\/+$/, "")}/ai-assets/${name}`, width: info.width, height: info.height };
  },

  /** Compares a result with the reference and scores how well it follows it */
  async evaluate(input: { reference: string; result: string; content: StudioContent }): Promise<{ score: number; parts: Record<string, number>; checks: { label: string; passed: boolean }[]; refine: string }> {
    const result = (await sharp(artworkFile(input.result)).resize(1024, 1024, { fit: "inside" }).jpeg({ quality: 84 }).toBuffer()).toString("base64");
    const wording = contentLines(input.content);
    let raw: any;
    try {
      raw = await askJson(
        "You are a strict art director checking a new design against the reference it was meant to follow. Picture 1 is the reference. Picture 2 is the new design. Score honestly: a generic or much simpler design scores low.",
        [
          `Score each from 0 to 100 for how closely picture 2 follows picture 1: ${PARTS.join(", ")}.`,
          wording.length ? `The new design must show this wording exactly:\n${wording.join("\n")}` : "No wording was required.",
          'Answer with: { "parts": { each name above: number }, "textCorrect": true or false, "objectsPresent": true or false, "genericTemplate": true or false, "refine": one sentence saying the most important thing to change so picture 2 follows picture 1 better, or "" }',
        ].join("\n"),
        [await shrink(input.reference, 1024), result],
      );
    } catch (err) {
      throw aiError(err, "check the result");
    }
    const parts: Record<string, number> = {};
    for (const part of PARTS) parts[part] = Math.min(100, Math.max(0, Math.round(Number(raw?.parts?.[part]) || 0)));
    // Composition and overall direction matter most; a look-alike palette on a different layout is not a match
    const weights: Record<string, number> = { composition: 2, typography: 1.5, color: 1.2, density: 1.2, placement: 1.2, background: 1, effects: 1, artDirection: 2 };
    const total = PARTS.reduce((sum, part) => sum + weights[part], 0);
    const score = Math.round(PARTS.reduce((sum, part) => sum + parts[part] * weights[part], 0) / total);
    const checks = [
      { label: "Composition respected", passed: parts.composition >= 60 },
      { label: "Style respected", passed: parts.artDirection >= 60 },
      { label: "Required text included", passed: raw?.textCorrect !== false },
      { label: "Important objects included", passed: raw?.objectsPresent !== false },
      { label: "Typography hierarchy", passed: parts.typography >= 55 },
      { label: "Colour palette", passed: parts.color >= 60 },
      { label: "Visual density", passed: parts.density >= 55 },
      { label: "Effects and lighting", passed: parts.effects >= 50 },
      { label: "Background", passed: parts.background >= 50 },
      { label: "Not a generic template", passed: raw?.genericTemplate !== true },
    ];
    return { score, parts, checks, refine: String(raw?.refine || "").slice(0, 300) };
  },

  /**
   * An editable design from Falcon's layout engine, for when no artwork can be
   * made. It takes the reference's colours, type and density, but it is a set
   * layout, not a recreation of the reference. With `keep`, the versions share
   * that design's words, colours, type and pictures and differ in layout only.
   */
  async layout(input: { prompt: string; sizeId: string; content: StudioContent; analysis: Analysis | null; settings: StudioSettings; count: number; keep?: DesignSpec; baseUrl: string }): Promise<{ designs: GeneratedDesign[] }> {
    const size = SIZE_BY_ID[input.sizeId] || SIZE_BY_ID["portrait-4x5"];
    let raw: unknown[];
    try {
      raw = await askForSpecs(layoutInstructions(input.count, size.name, input.analysis, input.content, input.settings, input.keep), input.keep ? JSON.stringify({ ...input.keep, photos: undefined }) : input.prompt, input.count);
    } catch (err) {
      throw aiError(err, "design that");
    }
    const specs = checkSpecs(raw);
    const taken = new Set<string>(input.keep ? [input.keep.layout] : []);
    for (const spec of specs) {
      if (input.keep) {
        const k = input.keep;
        Object.assign(spec, { colors: k.colors, mode: k.mode, font: k.font, kicker: k.kicker, title: k.title, tagline: k.tagline, cta: k.cta, details: k.details, brand: k.brand, subject: k.subject, imageQueries: k.imageQueries, imagePrompt: k.imagePrompt, photos: k.photos, direction: k.direction });
      } else {
        setWording(spec, input.content);
        if (input.analysis && input.settings.usage !== "composition" && input.settings.usage !== "typography") recolour(spec, input.analysis);
        const font = input.analysis && (input.settings.usage === "full" || input.settings.usage === "typography" || input.settings.usage === "style") ? fontFor(input.analysis.typography.category) : null;
        if (font) spec.font = font;
      }
      // Versions of one design never repeat its layout or each other's
      if (taken.has(spec.layout) || !PHOTO_LAYOUT_IDS.includes(spec.layout)) spec.layout = PHOTO_LAYOUT_IDS.find((id) => !taken.has(id)) || spec.layout;
      taken.add(spec.layout);
    }
    if (!input.keep) await choosePhotos(specs, input.content.subject || input.prompt);
    const designs = await Promise.all(specs.map(async (spec) => present(spec, await buildChecked(spec, size.id, input.baseUrl))));
    return { designs };
  },

  /** Saves a finished artwork as a project, as one picture filling the page, so it opens in the editor */
  async open(userId: string, input: { url: string; sizeId: string; title: string }): Promise<{ projectId: string }> {
    artworkFile(input.url);
    const size = SIZE_BY_ID[input.sizeId] || SIZE_BY_ID["portrait-4x5"];
    const element = {
      id: `el_${crypto.randomBytes(6).toString("hex")}`, type: "image", name: "AI Studio artwork", src: input.url,
      x: 0, y: 0, width: size.width, height: size.height, rotation: 0, opacity: 1, locked: false, hidden: false,
      naturalWidth: size.width, naturalHeight: size.height, filter: "none", zIndex: 0,
    };
    const project = await prisma.project.create({
      data: {
        title: (input.title || "AI Studio design").slice(0, 190),
        ownerId: userId,
        pages: { create: [{ name: "Page 1", width: size.width, height: size.height, presetName: size.name, background: "#000000", elements: JSON.stringify([element]), order: 0 }] },
      },
      select: { id: true },
    });
    return { projectId: project.id };
  },
};
