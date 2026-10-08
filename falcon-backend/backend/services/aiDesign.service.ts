/**
 * aiDesign.service.ts
 *
 * AI Studio: turns a written request into finished, editable designs.
 *
 * The language model does the thinking a designer would: it reads the
 * request and, for each option, writes the copy and chooses a style, a layout,
 * a typeface and a colour scheme. Falcon's own layout engine (the one behind
 * the template library) then sets that out as real elements, so every option
 * opens in the editor with text that can be edited and nothing baked in.
 *
 * A picture, when asked for, is made by the image model and saved on this
 * server; otherwise photo layouts use a stock photograph on the same subject.
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { z } from "zod";
import { prisma } from "../database/prismaClient";
import { AppError } from "../utils/AppError";
import {
  FONT_BY_ID, FONT_PAIRS, LibPage, Palette, PALETTE_BY_ID, STYLES, STYLE_BY_ID, Sheet,
  backgroundCss, contrastRatio, decorate, hashString, makeBackground, onColor, pick, rngFrom,
} from "../templates/library/core";
import { POSTER_LAYOUTS, PosterCtx } from "../templates/library/posterLayouts";
import { POSTER_SIZES } from "../templates/library/posterCatalog";
import { renderPageSvg } from "../templates/library/thumbnail";
import { CATEGORY_PHOTOS, photoUrl } from "../templates/email/photos";

/** Where generated pictures are kept; served from /ai-assets */
export const AI_ASSET_DIR = path.join(__dirname, "..", "storage", "ai-images");

/**
 * Which AI service is used. By default it is OpenAI with OPENAI_API_KEY. Any
 * service that speaks the same protocol (Gemini, Groq, OpenRouter and others)
 * can be used instead by giving its address in AI_BASE_URL, its key in
 * AI_API_KEY and one of its models in AI_TEXT_MODEL. Read on each request, so
 * a changed .env takes effect on the next restart without code changes.
 */
function provider() {
  const baseURL = process.env.AI_BASE_URL?.trim() || "";
  return {
    baseURL,
    apiKey: (process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "").trim(),
    textModel: process.env.AI_TEXT_MODEL?.trim() || "gpt-5.4-mini",
    // Another service only makes pictures if it is told which of its models to use
    imageModel: process.env.AI_IMAGE_MODEL?.trim() || (baseURL ? "" : "gpt-image-1-mini"),
  };
}

const STYLE_IDS = STYLES.map((s) => s.id);
const LAYOUT_IDS = POSTER_LAYOUTS.map((l) => l.id);
const PHOTO_LAYOUT_IDS = POSTER_LAYOUTS.filter((l) => l.photo).map((l) => l.id);
const FONT_IDS = FONT_PAIRS.map((f) => f.id);
const SUBJECTS = Object.keys(CATEGORY_PHOTOS);
const SIZE_BY_ID = Object.fromEntries(POSTER_SIZES.map((s) => [s.id, s]));

export const AI_DESIGN_SIZES = POSTER_SIZES.map((s) => ({ id: s.id, name: s.name, width: s.width, height: s.height }));

// ─── The brief the model fills in ─────────────────────────────────────────────

const HEX = /^#[0-9a-fA-F]{6}$/;
const hex = z.string().regex(HEX);
const line = (max: number) => z.string().trim().max(max);

/** One design as the model describes it. Also what the browser sends back to open a design. */
export const designSpecSchema = z.object({
  name: line(80).min(1),
  style: z.enum(STYLE_IDS as [string, ...string[]]),
  layout: z.enum(LAYOUT_IDS as [string, ...string[]]),
  font: z.enum(FONT_IDS as [string, ...string[]]),
  mode: z.enum(["dark", "light"]),
  colors: z.object({ background: hex, surface: hex, text: hex, muted: hex, accent: hex, accent2: hex }),
  kicker: line(60),
  title: line(80).min(1),
  tagline: line(200),
  cta: line(40),
  details: z.array(z.object({ label: line(24), value: line(48) })).max(3),
  brand: line(48),
  subject: z.enum(SUBJECTS as [string, ...string[]]),
  imagePrompt: line(600),
  /** A picture made for this request, by its file name on this server */
  image: z.string().regex(/^[0-9a-f]{32}\.(jpg|png)$/).optional(),
});

export type DesignSpec = z.infer<typeof designSpecSchema>;

/** The same shape as a JSON Schema, which is what the model is held to */
function specJsonSchema(count: number) {
  const text = { type: "string" };
  const color = { type: "string", description: "Hex colour such as #0F172A" };
  return {
    type: "object",
    additionalProperties: false,
    required: ["designs"],
    properties: {
      designs: {
        type: "array",
        minItems: count,
        maxItems: count,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "style", "layout", "font", "mode", "colors", "kicker", "title", "tagline", "cta", "details", "brand", "subject", "imagePrompt"],
          properties: {
            name: { ...text, description: "Two to four words naming this design direction" },
            style: { type: "string", enum: STYLE_IDS },
            layout: { type: "string", enum: LAYOUT_IDS },
            font: { type: "string", enum: FONT_IDS },
            mode: { type: "string", enum: ["dark", "light"] },
            colors: {
              type: "object",
              additionalProperties: false,
              required: ["background", "surface", "text", "muted", "accent", "accent2"],
              properties: { background: color, surface: color, text: color, muted: color, accent: color, accent2: color },
            },
            kicker: { ...text, description: "Short label above the headline, at most 4 words" },
            title: { ...text, description: "The headline, at most 5 words" },
            tagline: { ...text, description: "One supporting sentence, at most 16 words" },
            cta: { ...text, description: "Button text, at most 3 words" },
            details: {
              type: "array",
              maxItems: 3,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["label", "value"],
                properties: { label: text, value: text },
              },
            },
            brand: { ...text, description: "Name of the organiser or brand" },
            subject: { type: "string", enum: SUBJECTS, description: "Closest subject for a stock photograph" },
            imagePrompt: { ...text, description: "A description of one photograph or illustration that would suit this design, with no text in it" },
          },
        },
      },
    },
  };
}

function instructions(count: number, sizeName: string, photoOnly: boolean): string {
  return [
    "You are the senior designer inside Falcon, a design tool. A person describes what they need and you produce finished design options for them.",
    `Produce exactly ${count} options for a ${sizeName} design. Make them clearly different from each other: a different style, layout and colour scheme each, as a studio would present alternatives.`,
    "For every option write the real copy for this request. Use any names, dates, places, prices or wording the person gave, exactly. Where a fact was not given, do not invent one: write a short placeholder the person will replace, such as \"Add date\" or \"Your venue\".",
    "Write in the language of the request. Keep the headline to five words or fewer so it can be set large.",
    "details are up to three label and value pairs such as Date, Time, Venue, Price or Contact, chosen to suit the request.",
    "Choose colours as a designer would for this subject and mood. text must be clearly readable on background, and accent must stand out from background. surface is a panel colour close to background. muted is a quieter text colour.",
    "Choose the font pairing and style that fit the mood, and a layout that suits the amount of text.",
    photoOnly
      ? `A picture is being made for this design, so every option must use one of these picture layouts: ${PHOTO_LAYOUT_IDS.join(", ")}.`
      : "Use a mix of layouts with and without photographs.",
    "imagePrompt describes a single picture for the design, in one or two sentences, with no words or lettering in the picture.",
  ].join("\n");
}

// ─── Talking to the model ─────────────────────────────────────────────────────

let client: OpenAI | null = null;
let clientFor = "";

function ai(): OpenAI {
  const { apiKey, baseURL } = provider();
  if (!apiKey) throw new AppError("AI Studio is not set up on this server yet. Add an AI key (AI_API_KEY or OPENAI_API_KEY) to the backend's .env file.", 503, "AI_NOT_CONFIGURED");
  const wanted = `${baseURL}|${apiKey.length}|${apiKey.slice(-4)}`;
  if (!client || clientFor !== wanted) {
    client = new OpenAI({ apiKey, baseURL: baseURL || undefined, timeout: 120_000, maxRetries: 1 });
    clientFor = wanted;
  }
  return client;
}

/** Whether a picture can be made with the service in use */
export function canMakeAiImages(): boolean {
  return provider().imageModel !== "";
}

/** Says what went wrong in terms the person can act on, without passing on the provider's own text */
function aiError(err: any, what: string): AppError {
  if (err instanceof AppError) return err;
  const status = Number(err?.status) || 0;
  console.error(`[ai] ${what} failed (status: ${status || "n/a"}, code: ${err?.code || err?.name || "unknown"})`);
  if (!status && /timed out|connection|ECONN|ENOTFOUND|fetch failed/i.test(`${err?.name} ${err?.message} ${err?.code}`)) return new AppError("Falcon could not reach the AI service. Check the internet connection and try again.", 502, "AI_UNREACHABLE");
  if (status === 401 || status === 403) return new AppError("The AI service refused Falcon's key. Check the AI key in the backend's .env file.", 502, "AI_KEY_REJECTED");
  if (status === 404) return new AppError("The AI service does not know the model Falcon asked for. Check AI_TEXT_MODEL and AI_BASE_URL in the backend's .env file.", 502, "AI_MODEL_UNKNOWN");
  // Out of credit is not something waiting will fix, so it is told apart from a busy moment
  if (/credit_balance_exhausted|insufficient_quota|billing/i.test(`${err?.code} ${err?.type}`)) return new AppError("The AI account has run out of credit, so AI Studio cannot make designs. Add credit to the account whose key is in the backend's .env file, then try again.", 502, "AI_NO_CREDIT");
  if (status === 429) return new AppError("The AI service is at its usage limit right now. Check the account's credit, or try again in a little while.", 502, "AI_LIMIT");
  if (status === 400 && /moderation|safety|content_policy/i.test(String(err?.code || err?.type || ""))) return new AppError("The AI service would not make that. Try describing it differently.", 400, "AI_REFUSED");
  return new AppError(`Falcon could not ${what} just now. Please try again.`, 502, "AI_FAILED");
}

/** The model's reply as data, whether or not it wrapped the JSON in a code block or added words around it */
function readJson(content: string): any {
  const text = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(text.slice(start, end + 1));
    throw new Error("The model did not answer with JSON");
  }
}

async function askForSpecs(prompt: string, count: number, sizeName: string, photoOnly: boolean): Promise<unknown[]> {
  const { textModel } = provider();
  const schema = specJsonSchema(count);
  const system = instructions(count, sizeName, photoOnly);
  const ask = (format: any, extra = "") =>
    ai().chat.completions.create({
      model: textModel,
      messages: [
        { role: "system", content: system + extra },
        { role: "user", content: prompt },
      ],
      response_format: format,
    });

  let response;
  try {
    response = await ask({ type: "json_schema", json_schema: { name: "falcon_designs", strict: true, schema } });
  } catch (err: any) {
    // Some services do not take a schema. They are given it in words and asked for plain JSON instead;
    // every design is checked against the same rules afterwards either way
    if (Number(err?.status) !== 400) throw err;
    response = await ask({ type: "json_object" }, `\n\nAnswer with one JSON object and nothing else. It must match this JSON Schema exactly:\n${JSON.stringify(schema)}`);
  }
  const choice = response.choices[0]?.message;
  if (choice?.refusal) throw new AppError("The AI service would not make that. Try describing it differently.", 400, "AI_REFUSED");
  const parsed = readJson(choice?.content || "{}");
  return Array.isArray(parsed.designs) ? parsed.designs : [];
}

/** Makes one picture and saves it, returning its file name */
async function makeImage(prompt: string, width: number, height: number): Promise<string> {
  const size = width > height * 1.2 ? "1536x1024" : height > width * 1.2 ? "1024x1536" : "1024x1024";
  const result = await ai().images.generate({
    model: provider().imageModel,
    prompt: `${prompt}\n\nNo text, letters, numbers, logos or watermarks anywhere in the picture.`,
    size,
    quality: "medium",
    output_format: "jpeg",
    n: 1,
  } as any);
  const data = result.data?.[0]?.b64_json;
  if (!data) throw new Error("The image model returned no picture");
  fs.mkdirSync(AI_ASSET_DIR, { recursive: true });
  const name = `${crypto.randomBytes(16).toString("hex")}.jpg`;
  fs.writeFileSync(path.join(AI_ASSET_DIR, name), Buffer.from(data, "base64"));
  return name;
}

// ─── From a brief to a page ───────────────────────────────────────────────────

function mix(a: string, b: string, share: number): string {
  const part = (hexColor: string, i: number) => parseInt(hexColor.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2].map((i) => Math.round(part(a, i) * (1 - share) + part(b, i) * share).toString(16).padStart(2, "0")).join("")}`;
}

/** The model's colours as a palette, corrected wherever they would be hard to read */
function paletteOf(spec: DesignSpec): Palette {
  const style = STYLE_BY_ID[spec.style];
  const fallback = PALETTE_BY_ID[style.palettes[0]];
  const c = spec.colors;
  const bg = c.background.toLowerCase();
  const text = contrastRatio(c.text, bg) >= 4.5 ? c.text : onColor(bg);
  const accent = contrastRatio(c.accent, bg) >= 1.8 ? c.accent : fallback.accent;
  const accent2 = contrastRatio(c.accent2, bg) >= 1.5 ? c.accent2 : accent;
  const muted = contrastRatio(c.muted, bg) >= 3 ? c.muted : mix(text, bg, 0.35);
  const surface = contrastRatio(c.surface, text) >= 3 ? c.surface : mix(bg, text, 0.08);
  return {
    id: "ai", name: spec.name, family: "ai", mode: spec.mode,
    bg, bg2: mix(bg, accent, 0.14), surface, text, muted, accent, accent2,
  };
}

export function assetUrl(baseUrl: string, name: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/ai-assets/${name}`;
}

/** Sets a design out as a page of editable elements */
export function buildDesign(spec: DesignSpec, sizeId: string, baseUrl: string): LibPage {
  const size = SIZE_BY_ID[sizeId] || SIZE_BY_ID["portrait-4x5"];
  const { width: W, height: H } = size;
  const style = STYLE_BY_ID[spec.style];
  const layout = POSTER_LAYOUTS.find((l) => l.id === spec.layout) || POSTER_LAYOUTS[0];
  const palette = paletteOf(spec);
  // Seeded from the brief, so the same design is rebuilt identically when it is opened
  const h = hashString(`${spec.name}|${spec.title}|${spec.layout}|${spec.style}`);
  const rng = rngFrom(h);
  const sheet = new Sheet(`ai${(h >>> 0).toString(36)}`);
  // A wide banner is read from further away than its short side suggests, so its type runs larger
  const u = (Math.min(W, H) / 100) * (W > H * 1.25 ? 1.3 : 1);
  const bg = makeBackground(pick(style.backgrounds, h >>> 6), palette, h >>> 9);
  // Layouts that are built on a photo carry their own backdrop
  if (!["photo-full", "photo-tint", "photo-card"].includes(layout.id)) decorate(sheet, pick(style.decorations, h >>> 3), W, H, palette, rng);

  const photos = CATEGORY_PHOTOS[spec.subject] || CATEGORY_PHOTOS.events || [];
  const ctx: PosterCtx = {
    W, H, u, m: u * 7,
    orient: W > H * 1.25 ? "landscape" : Math.abs(W - H) < 4 ? "square" : "portrait",
    pal: palette, fonts: FONT_BY_ID[spec.font] || FONT_BY_ID[style.fonts[0]], style, sheet, rng,
    kicker: spec.kicker || spec.brand,
    title: spec.title,
    tagline: spec.tagline,
    cta: spec.cta || "Learn more",
    details: spec.details.filter((d) => d.label && d.value).map((d) => [d.label, d.value] as [string, string]),
    brand: spec.brand || "Your brand",
    photo: (w, hh, n = 0) =>
      spec.image
        ? assetUrl(baseUrl, spec.image)
        : photoUrl(pick(photos, (h >>> 4) + n), Math.min(1600, w), Math.min(1600, w) * (hh / w)),
    variant: h % 97,
  };
  layout.draw(ctx);
  return { name: "Page 1", width: W, height: H, background: backgroundCss(bg), backgroundSpec: bg, elements: sheet.elements };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface GeneratedDesign {
  spec: DesignSpec;
  name: string;
  width: number;
  height: number;
  /** A preview of the page as SVG markup */
  preview: string;
}

export const aiDesignService = {
  /** Reads the request and returns design options, each ready to open in the editor */
  async generate(input: { prompt: string; sizeId: string; count: number; withImage: boolean; baseUrl: string }): Promise<{ designs: GeneratedDesign[]; imageMade: boolean }> {
    const size = SIZE_BY_ID[input.sizeId] || SIZE_BY_ID["portrait-4x5"];
    let raw: unknown[];
    try {
      raw = await askForSpecs(input.prompt, input.count, size.name, input.withImage);
    } catch (err) {
      throw aiError(err, "design that");
    }

    const specs: DesignSpec[] = [];
    for (const item of raw) {
      const checked = designSpecSchema.safeParse(item);
      if (checked.success) specs.push(checked.data);
    }
    if (!specs.length) throw new AppError("Falcon could not design that just now. Please try again.", 502, "AI_FAILED");

    // One picture is made and shared by the options, which keeps a request quick and its cost low
    let imageMade = false;
    if (input.withImage && canMakeAiImages()) {
      try {
        const image = await makeImage(specs[0].imagePrompt || input.prompt, size.width, size.height);
        for (const spec of specs) spec.image = image;
        imageMade = true;
      } catch (err) {
        // The designs are still worth having; they fall back to stock photographs
        aiError(err, "make a picture");
      }
    }

    const designs = specs.map((spec) => {
      const page = buildDesign(spec, size.id, input.baseUrl);
      return { spec, name: spec.name, width: page.width, height: page.height, preview: renderPageSvg(page) };
    });
    return { designs, imageMade };
  },

  /** Saves a chosen design as a project of the signed-in user */
  async use(userId: string, input: { spec: DesignSpec; sizeId: string; baseUrl: string }): Promise<{ projectId: string }> {
    const size = SIZE_BY_ID[input.sizeId] || SIZE_BY_ID["portrait-4x5"];
    if (input.spec.image && !fs.existsSync(path.join(AI_ASSET_DIR, input.spec.image))) delete input.spec.image;
    const page = buildDesign(input.spec, size.id, input.baseUrl);
    const project = await prisma.project.create({
      data: {
        title: (input.spec.title || input.spec.name).slice(0, 190),
        ownerId: userId,
        pages: {
          create: [{
            name: page.name,
            width: page.width,
            height: page.height,
            presetName: size.name,
            background: page.background,
            elements: JSON.stringify(page.elements),
            order: 0,
          }],
        },
      },
      select: { id: true },
    });
    return { projectId: project.id };
  },
};
