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
 * Every design carries a picture on its subject. The model says what to look
 * for, a photograph is found and cut to fit the layout (see aiImages.ts), and
 * a design that somehow ends up without one is sent back to a picture layout
 * before anyone sees it. A picture can also be made by the image model.
 */

import OpenAI from "openai";
import { z } from "zod";
import { prisma } from "../database/prismaClient";
import { AppError } from "../utils/AppError";
import {
  FONT_BY_ID, FONT_PAIRS, LibPage, Palette, PALETTE_BY_ID, STYLES, STYLE_BY_ID, Sheet,
  backgroundCss, contrastRatio, decorate, hashString, makeBackground, onColor, pick, rngFrom,
} from "../templates/library/core";
import { POSTER_LAYOUTS, PosterCtx } from "../templates/library/posterLayouts";
import { DeckTheme, MOTIFS, OutlineSlide, drawOutlineSlide, drawTitleSlide } from "../templates/library/deckSlides";
import { POSTER_SIZES } from "../templates/library/posterCatalog";
import { renderPageSvg } from "../templates/library/thumbnail";
import { CATEGORY_PHOTOS, photoUrl } from "../templates/email/photos";
import { AI_ASSET_DIR, cropSource, fetchSource, findPhotos, hasSource, saveSource } from "./aiImages";

export { AI_ASSET_DIR };

/**
 * Which AI service is used. By default it is OpenAI with OPENAI_API_KEY. Any
 * service that speaks the same protocol (Gemini, Groq, OpenRouter and others)
 * can be used instead by giving its address in AI_BASE_URL, its key in
 * AI_API_KEY and one of its models in AI_TEXT_MODEL. Read on each request, so
 * a changed .env takes effect on the next restart without code changes.
 */
export function provider() {
  const baseURL = process.env.AI_BASE_URL?.trim() || "";
  return {
    baseURL,
    apiKey: (process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "").trim(),
    // Several models may be listed, separated by commas; the next is tried when one is busy or gone
    textModels: (process.env.AI_TEXT_MODEL || "").split(",").map((m) => m.trim()).filter(Boolean),
    // Another service only makes pictures if it is told which of its models to use
    imageModel: process.env.AI_IMAGE_MODEL?.trim() || (baseURL ? "" : "gpt-image-1-mini"),
  };
}

const STYLE_IDS = STYLES.map((s) => s.id);
const LAYOUT_IDS = POSTER_LAYOUTS.map((l) => l.id);
export const PHOTO_LAYOUT_IDS = POSTER_LAYOUTS.filter((l) => l.photo).map((l) => l.id);
const FONT_IDS = FONT_PAIRS.map((f) => f.id);
const SUBJECTS = Object.keys(CATEGORY_PHOTOS);
/** Formats AI Studio designs for: the library's poster sizes and a few more that people ask for by name */
const SIZES = [
  ...POSTER_SIZES.map((s) => ({ id: s.id, name: s.name, width: s.width, height: s.height })),
  { id: "youtube", name: "YouTube thumbnail 1280 × 720", width: 1280, height: 720 },
  { id: "presentation", name: "Presentation 1920 × 1080", width: 1920, height: 1080 },
];
export const SIZE_BY_ID = Object.fromEntries(SIZES.map((s) => [s.id, s]));

export const AI_DESIGN_SIZES = SIZES;

/** The four directions every request is answered in, so the options are real alternatives */
const DIRECTIONS = ["modern", "premium", "bold", "creative"] as const;
const DIRECTION_NOTES: Record<(typeof DIRECTIONS)[number], string> = {
  modern: "Modern: clean and current, generous space, a confident sans-serif, one clear accent colour.",
  premium: "Premium: refined and expensive-looking, restrained palette, elegant serif or fine sans, quiet luxury.",
  bold: "Bold: loud and high-contrast, very large heavy type, strong saturated colour, built to stop a scroll.",
  creative: "Creative: unexpected and expressive, unusual colour pairing and layout, playful or artistic.",
};

// ─── The brief the model fills in ─────────────────────────────────────────────

const HEX = /^#[0-9a-fA-F]{6}$/;
const hex = z.string().regex(HEX);
const line = (max: number) => z.string().trim().max(max);

const SLIDE_KINDS = ["points", "list", "steps", "focus", "compare", "statement", "section", "closing"] as const;

/** One slide of a presentation: what kind it is and the words on it */
const slideSchema = z.object({
  kind: z.enum(SLIDE_KINDS),
  title: line(80).min(1),
  body: line(360).default(""),
  points: z.array(z.object({ head: line(70), body: line(180).default("") })).max(5).default([]),
});

/** The id of the format that is a deck of slides */
export const DECK_SIZE = "presentation";
/** The most slides written for one deck, the opening slide aside */
const MAX_SLIDES = 12;

/** One design as the model describes it. Also what the browser sends back to open a design. */
export const designSpecSchema = z.object({
  name: line(80).min(1),
  direction: z.enum(DIRECTIONS).default("modern"),
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
  /** What to search for to find this design's photograph, from exact to general */
  imageQueries: z.array(line(60)).max(5).default([]),
  imagePrompt: line(600),
  /** The pictures chosen for this design, by the id they are kept under on this server */
  photos: z.array(z.string().regex(/^[0-9a-f]{32}$/)).max(4).default([]),
  /** A presentation's slides after the opening one. Empty for a design of one page */
  slides: z.array(slideSchema).max(MAX_SLIDES).default([]),
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
          required: ["name", "direction", "style", "layout", "font", "mode", "colors", "kicker", "title", "tagline", "cta", "details", "brand", "subject", "imageQueries", "imagePrompt"],
          properties: {
            name: { ...text, description: "Two to four words naming this design direction" },
            direction: { type: "string", enum: [...DIRECTIONS] },
            style: { type: "string", enum: STYLE_IDS },
            layout: { type: "string", enum: PHOTO_LAYOUT_IDS },
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
            subject: { type: "string", enum: SUBJECTS, description: "Closest subject, used only if no photograph is found" },
            imageQueries: {
              type: "array",
              minItems: 4,
              maxItems: 4,
              items: text,
              description: "Four stock photo searches in English for this design's picture: most exact first, and the last two a single common word each",
            },
            imagePrompt: { ...text, description: "A description of one photograph or illustration that would suit this design, with no text in it" },
          },
        },
      },
    },
  };
}

export const COPY_RULES = [
  "Use any names, dates, places, prices or wording the person gave, exactly.",
  "Never invent facts. If the person did not give a date, time, place, price, prize, deadline, number, organiser or brand name, do not make one up: write a short placeholder they will replace, such as \"Add date\", \"Add venue\", \"Add prize\" or \"Your brand\". Headlines, labels and taglines are yours to write freely, as long as they state no made-up facts.",
  "Write in the language of the request. Keep the headline to five words or fewer so it can be set large.",
  "details are up to three label and value pairs such as Date, Time, Venue, Price or Contact, chosen to suit the request.",
];

export const LOOK_RULES = [
  "Choose colours as a designer would for this subject and mood, not at random: for example dark blues and cyan for technology, black and gold for luxury, neon and high contrast for gaming, calm trustworthy tones for finance, clean light tones for education. text must be clearly readable on background, and accent must stand out from background. surface is a panel colour close to background. muted is a quieter text colour.",
  "Choose one font pairing that fits the mood and the kind of design, and a layout that suits the amount of text and the shape of the page.",
  `Every design is built around a photograph, so layout must be one of: ${PHOTO_LAYOUT_IDS.join(", ")}.`,
];

export const IMAGE_RULES = [
  "imageQueries are three or four stock photo searches, in English, for the one picture this design is built around. Think about the subject, the audience and the mood: a hackathon wants developers at laptops, a sports day wants athletes in action, a food offer wants the dish itself. Start exact and end very general, so that something is always found: the first search is two or three words, the next is two words, and the last two are each ONE common word. For example: \"students coding hackathon\", \"programmer laptop\", \"coding\", \"technology\". Use plain everyday words a photo library would tag a real photograph with (things, people, places), never abstract or stylistic words such as glitch, neon, premium or futuristic, and never the name of the event or brand.",
  "Give each option a different picture idea.",
  "imagePrompt describes that picture in one or two sentences, with no words or lettering in it.",
];

function instructions(count: number, sizeName: string): string {
  return [
    "You are the senior designer inside Falcon, a design tool. A person describes what they need and you produce finished design options for them, as a studio would present alternatives to a client.",
    `Produce exactly ${count} options for a ${sizeName} design, one in each of these directions and in this order:`,
    ...DIRECTIONS.slice(0, count).map((d, i) => `${i + 1}. ${DIRECTION_NOTES[d]}`),
    "The options must look clearly different from one another: a different style, layout, font pairing and colour scheme each. Never give two options the same layout.",
    "For every option write the real copy for this request.",
    ...COPY_RULES,
    ...LOOK_RULES,
    ...IMAGE_RULES,
  ].join("\n");
}

function variationInstructions(count: number, sizeName: string): string {
  return [
    "You are the senior designer inside Falcon, a design tool. You are given one finished design as JSON. The person likes its content and wants to see it designed differently.",
    `Produce exactly ${count} new versions for a ${sizeName} design. Keep every piece of text exactly as it is. Change only how it looks: the style, layout, font pairing, colour scheme and mode.`,
    "Make the versions clearly different from the original and from one another, each in a recognisable look such as minimal, luxury, futuristic, editorial, neon, corporate, brutalist, gradient, dark cinematic or magazine. name says which look it is, in two to four words. Never give two versions the same layout.",
    ...LOOK_RULES,
    "Copy imageQueries and imagePrompt from the original unchanged.",
  ].join("\n");
}

// ─── Talking to the model ─────────────────────────────────────────────────────

/** The longest one model is waited on. A model that has not answered by then is passed over for the next */
const MODEL_TIMEOUT = 32_000;
/**
 * The longest a piece of work may spend going through the models. Hosts that run
 * the API as functions end a request after a minute, and the person is then shown
 * nothing useful; stopping first lets Falcon say what happened.
 */
const WORK_BUDGET = 52_000;
/** How long a model that was busy or silent is kept at the back of the queue */
const REST = 90_000;

const resting = new Map<string, number>();

/** The text models to try, those that answered last time first */
export function modelsInOrder(): string[] {
  const listed = provider().textModels;
  const models = listed.length ? listed : ["gpt-5.4-mini"];
  const now = Date.now();
  const tired = (model: string) => (resting.get(model) || 0) > now;
  return [...models.filter((m) => !tired(m)), ...models.filter(tired)];
}

/**
 * Does a piece of work with the first model that manages it. A model that is
 * overloaded, rate limited, withdrawn or slow is passed over for the next and
 * kept at the back for a while, so the requests that follow do not wait on it
 * again. A bad key or an empty account fails the same way on every model, so
 * those stop at once. The whole of it stays inside WORK_BUDGET.
 */
export async function withModels<T>(what: string, work: (model: string, timeout: number) => Promise<T>): Promise<T> {
  const started = Date.now();
  const left = () => WORK_BUDGET - (Date.now() - started);
  let failure: any;
  for (let round = 0; round < 2; round++) {
    // A service that is busy or over its per-minute allowance often answers a few seconds later
    if (round) {
      if (left() < 12_000) break;
      await new Promise((done) => setTimeout(done, 3000));
    }
    for (const model of modelsInOrder()) {
      if (failure && left() < 6000) break;
      try {
        return await work(model, Math.max(6000, Math.min(MODEL_TIMEOUT, left())));
      } catch (err: any) {
        failure = err;
        const status = Number(err?.status) || 0;
        const outOfCredit = /credit_balance_exhausted|insufficient_quota|billing/i.test(`${err?.code} ${err?.type}`);
        console.error(`[ai] model ${model} did not ${what} (status: ${status || "n/a"})`);
        if (outOfCredit || (status && ![404, 408, 429, 500, 502, 503, 504, 529].includes(status))) throw err;
        resting.set(model, Date.now() + REST);
      }
    }
  }
  throw failure;
}

let client: OpenAI | null = null;
let clientFor = "";

export function ai(): OpenAI {
  const { apiKey, baseURL } = provider();
  if (!apiKey) throw new AppError("AI Studio is not set up on this server yet. Add an AI key (AI_API_KEY or OPENAI_API_KEY) to the backend's .env file.", 503, "AI_NOT_CONFIGURED");
  const wanted = `${baseURL}|${apiKey.length}|${apiKey.slice(-4)}`;
  if (!client || clientFor !== wanted) {
    // No retries by the client itself: it waits as long as a busy service asks it to, which left
    // people watching "Designing…" for minutes. The list of models below is the retry instead
    client = new OpenAI({ apiKey, baseURL: baseURL || undefined, timeout: MODEL_TIMEOUT, maxRetries: 0 });
    clientFor = wanted;
  }
  return client;
}

/** Whether a picture can be made with the service in use */
export function canMakeAiImages(): boolean {
  return provider().imageModel !== "";
}

/** Says what went wrong in terms the person can act on, without passing on the provider's own text */
export function aiError(err: any, what: string): AppError {
  if (err instanceof AppError) return err;
  const status = Number(err?.status) || 0;
  console.error(`[ai] ${what} failed (status: ${status || "n/a"}, code: ${err?.code || err?.name || "unknown"})`);
  if (!status && /timed? ?out/i.test(`${err?.name} ${err?.message}`)) return new AppError("The AI service is taking too long to answer right now. Please try again in a moment.", 502, "AI_BUSY");
  if (!status && /connection|ECONN|ENOTFOUND|fetch failed/i.test(`${err?.name} ${err?.message} ${err?.code}`)) return new AppError("Falcon could not reach the AI service. Check the internet connection and try again.", 502, "AI_UNREACHABLE");
  if (status === 401 || status === 403) return new AppError("The AI service refused Falcon's key. Check the AI key in the backend's .env file.", 502, "AI_KEY_REJECTED");
  if (status === 503 || status === 529) return new AppError("The AI service is very busy right now. Please try again in a moment.", 502, "AI_BUSY");
  if (status === 404) return new AppError("The AI service does not know the model Falcon asked for. Check AI_TEXT_MODEL and AI_BASE_URL in the backend's .env file.", 502, "AI_MODEL_UNKNOWN");
  // Out of credit is not something waiting will fix, so it is told apart from a busy moment
  if (/credit_balance_exhausted|insufficient_quota|billing/i.test(`${err?.code} ${err?.type}`)) return new AppError("The AI account has run out of credit, so AI Studio cannot make designs. Add credit to the account whose key is in the backend's .env file, then try again.", 502, "AI_NO_CREDIT");
  if (status === 429) return new AppError("The AI service is at its usage limit right now. Check the account's credit, or try again in a little while.", 502, "AI_LIMIT");
  if (status === 400 && /moderation|safety|content_policy/i.test(String(err?.code || err?.type || ""))) return new AppError("The AI service would not make that. Try describing it differently.", 400, "AI_REFUSED");
  return new AppError(`Falcon could not ${what} just now. Please try again.`, 502, "AI_FAILED");
}

/** The model's reply as data, whether or not it wrapped the JSON in a code block or added words around it */
export function readJson(content: string): any {
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

export async function askForSpecs(system: string, prompt: string, count: number): Promise<unknown[]> {
  const schema = specJsonSchema(count);
  const ask = (model: string, timeout: number, format: any, extra = "") =>
    ai().chat.completions.create({
      model,
      messages: [
        { role: "system", content: system + extra },
        { role: "user", content: prompt },
      ],
      response_format: format,
    }, { timeout });

  const response = await withModels("design that", async (model, timeout) => {
    const started = Date.now();
    try {
      return await ask(model, timeout, { type: "json_schema", json_schema: { name: "falcon_designs", strict: true, schema } });
    } catch (err: any) {
      // Some services do not take a schema. They are given it in words and asked for plain JSON instead;
      // every design is checked against the same rules afterwards either way
      if (Number(err?.status) !== 400) throw err;
      return ask(model, Math.max(6000, timeout - (Date.now() - started)), { type: "json_object" }, `\n\nAnswer with one JSON object and nothing else. It must match this JSON Schema exactly:\n${JSON.stringify(schema)}`);
    }
  });
  const choice = response.choices[0]?.message;
  if (choice?.refusal) throw new AppError("The AI service would not make that. Try describing it differently.", 400, "AI_REFUSED");
  const parsed = readJson(choice?.content || "{}");
  return Array.isArray(parsed.designs) ? parsed.designs : [];
}

// ─── A presentation's slides ──────────────────────────────────────────────────

function slideInstructions(wording: unknown): string {
  return [
    "You are writing a presentation inside Falcon, a design tool. A person describes the presentation they need. Falcon makes the opening slide itself; you write every slide after it.",
    "Write 6 to 9 slides and then one closing slide, so the deck tells its subject from start to finish. If the person asks for a number of slides, write that many less one (the opening slide is already made), but never more than 11.",
    "Each slide has a kind, chosen to suit what it says:",
    "- \"points\": 2 to 4 ideas of equal weight, shown as cards. Each has a head and a body.",
    "- \"list\": 3 to 5 short points down the slide, beside a picture. Each has a head and may have a body.",
    "- \"steps\": 3 to 5 stages in order, as a timeline. Each has a head and a body.",
    "- \"focus\": one idea explained in the slide's body, beside a picture, with up to 3 points that have a head only.",
    "- \"compare\": exactly 2 things set side by side. Each has a head and a body.",
    "- \"statement\": one sentence worth a slide of its own, in the slide's body. No points.",
    "- \"section\": a divider that opens a new part of the deck. A title only. Use it only in decks of 9 slides or more.",
    "- \"closing\": the last slide. Its title is a short sign-off such as \"Thank You\", and its body is one closing sentence.",
    "Use several different kinds, and never the same kind on two slides in a row. The last slide is always \"closing\" and no other slide is.",
    "Keep the words short enough to be read from the back of a room: a slide title of at most 6 words, a head of at most 6 words, a point's body of at most 16 words, a slide's body of at most 36 words.",
    "Write in the language of the request. Use any names, dates, places, prices or wording the person gave, exactly.",
    "Never invent facts. Do not make up statistics, figures, percentages, dates, prices, quotations, people, companies or results. Explain the subject in general terms that are true of it; where a fact only the person can know is needed, write a short placeholder they will replace, such as \"Add your figure\" or \"Add date\".",
    wording ? `Wording the person gave, to be used exactly where it belongs: ${JSON.stringify(wording)}` : "",
    'Answer with one JSON object and nothing else, in this shape: { "slides": [ { "kind": string, "title": string, "body": string, "points": [ { "head": string, "body": string } ] } ] }',
  ].filter(Boolean).join("\n");
}

const cut = (value: unknown, max: number) => String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);

/** The model's slides, each made fit to draw: enough points for its kind, nothing too long, a closing slide last */
export function readSlides(raw: unknown): DesignSpec["slides"] {
  const slides: DesignSpec["slides"] = [];
  let closing: DesignSpec["slides"][number] | null = null;
  for (const item of Array.isArray(raw) ? raw : []) {
    const title = cut(item?.title, 80);
    if (!title) continue;
    const body = cut(item?.body, 360);
    const points = (Array.isArray(item?.points) ? item.points : [])
      .map((p: any) => ({ head: cut(typeof p === "string" ? p : p?.head, 70), body: cut(typeof p === "string" ? "" : p?.body, 180) }))
      .filter((p: { head: string }) => p.head)
      .slice(0, 5);
    let kind = (SLIDE_KINDS as readonly string[]).includes(item?.kind) ? (item.kind as (typeof SLIDE_KINDS)[number]) : "list";
    if (kind === "closing") {
      closing = { kind, title, body, points: [] };
      continue;
    }
    // A slide that has not the points its kind is drawn with is drawn as a kind it does have them for
    if (kind === "points" && points.length > 4) kind = "list";
    if (kind === "steps" && points.length < 3) kind = "points";
    if ((kind === "points" || kind === "compare" || kind === "list") && points.length < 2) kind = body || points.length ? "focus" : "statement";
    if (kind === "focus" && !body && !points.length) kind = "statement";
    if (kind === "section") slides.push({ kind, title, body: "", points: [] });
    else slides.push({ kind, title, body, points });
  }
  const kept = slides.slice(0, MAX_SLIDES - 1);
  if (!kept.length) return [];
  return [...kept, closing || { kind: "closing", title: "Thank You", body: "", points: [] }];
}

/** Writes the slides of a presentation on what the person asked for */
export async function askForSlides(prompt: string, wording: unknown = null): Promise<DesignSpec["slides"]> {
  const system = slideInstructions(wording);
  return withModels("write the slides", async (model, timeout) => {
    const response = await ai().chat.completions.create({
      model,
      messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }, { timeout });
    const slides = readSlides(readJson(response.choices[0]?.message?.content || "{}").slides);
    // Two slides or fewer is not a presentation; the next model is asked instead
    if (slides.length < 3) throw new Error("The model wrote too few slides");
    return slides;
  });
}

/** Makes one picture and keeps it, returning the id it is known by */
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
  return saveSource(Buffer.from(data, "base64"));
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
export async function buildDesign(spec: DesignSpec, sizeId: string, baseUrl: string): Promise<LibPage> {
  const size = SIZE_BY_ID[sizeId] || SIZE_BY_ID["portrait-4x5"];
  const { width: W, height: H } = size;
  const style = STYLE_BY_ID[spec.style];
  const layout = POSTER_LAYOUTS.find((l) => l.id === spec.layout) || POSTER_LAYOUTS[0];
  const palette = paletteOf(spec);
  // Seeded from the brief, so the same design is rebuilt identically when it is opened
  const h = hashString(`${spec.name}|${spec.title}|${spec.layout}|${spec.style}`);
  // A wide banner is read from further away than its short side suggests, so its type runs larger
  const u = (Math.min(W, H) / 100) * (W > H * 1.25 ? 1.3 : 1);
  const bg = makeBackground(pick(style.backgrounds, h >>> 6), palette, h >>> 9);
  const stock = CATEGORY_PHOTOS[spec.subject] || CATEGORY_PHOTOS.events || [];
  const own = spec.photos.filter(hasSource);

  const draw = (photo: PosterCtx["photo"]): LibPage => {
    const rng = rngFrom(h);
    const sheet = new Sheet(`ai${(h >>> 0).toString(36)}`);
    // Layouts that are built on a photo carry their own backdrop
    if (!["photo-full", "photo-tint", "photo-card"].includes(layout.id)) decorate(sheet, pick(style.decorations, h >>> 3), W, H, palette, rng);
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
      photo,
      variant: h % 97,
    };
    layout.draw(ctx);
    return { name: "Page 1", width: W, height: H, background: backgroundCss(bg), backgroundSpec: bg, elements: sheet.elements };
  };

  const stockPhoto: PosterCtx["photo"] = (w, hh, n = 0) => photoUrl(pick(stock, (h >>> 4) + n), Math.min(1600, w), Math.min(1600, w) * (hh / w));
  if (!own.length) return draw(stockPhoto);

  // The layout is run once to learn which boxes want a picture and how large they are;
  // each picture is then cut to its box, and the layout is run again with the results
  const wanted = new Map<string, { id: string; w: number; h: number; backdrop: boolean }>();
  const key = (w: number, hh: number, n: number) => `${Math.round(w)}x${Math.round(hh)}#${n}`;
  draw((w, hh, n = 0) => {
    // A picture that fills the page lies behind the text
    wanted.set(key(w, hh, n), { id: own[n % own.length], w, h: hh, backdrop: w * hh >= W * H * 0.85 });
    return "";
  });
  const cut = new Map<string, string>();
  await Promise.all([...wanted].map(async ([k, box]) => {
    const name = await cropSource(box.id, box.w, box.h, box.backdrop);
    if (name) cut.set(k, assetUrl(baseUrl, name));
  }));
  return draw((w, hh, n = 0) => cut.get(key(w, hh, n)) || stockPhoto(w, hh, n));
}

/**
 * Sets a presentation out as its slides: the opening slide from the design's
 * own title and tagline, then one page for each slide that was written. Every
 * slide shares the design's colours, type and motif, so the deck reads as one.
 */
async function buildDeck(spec: DesignSpec, size: { name: string; width: number; height: number }, baseUrl: string): Promise<LibPage[]> {
  const { width: W, height: H } = size;
  const u = H / 100;
  const style = STYLE_BY_ID[spec.style];
  const palette = paletteOf(spec);
  // The layout is not drawn in a deck, but versions of one design each have their own, so it sets them apart
  const h = hashString(`${spec.name}|${spec.title}|${spec.style}|${spec.layout}|deck`);
  const bg = makeBackground(pick(style.backgrounds, h >>> 6), palette, h >>> 9);
  const stock = CATEGORY_PHOTOS[spec.subject] || CATEGORY_PHOTOS.events || [];
  const own = spec.photos.filter(hasSource);
  const closing = spec.slides.find((slide) => slide.kind === "closing");
  const notes = spec.details.filter((d) => d.label && d.value).map((d) => `${d.label}: ${d.value}`).slice(0, 3);
  const theme: Omit<DeckTheme, "photo"> = {
    W, H, u, m: W * 0.06, pal: palette, fonts: FONT_BY_ID[spec.font] || FONT_BY_ID[style.fonts[0]], style,
    motif: pick(MOTIFS, h >>> 3), titleAlign: (h >>> 5) % 2 ? "center" : "left",
    deckTitle: spec.title, org: spec.brand,
    sub: { group: "ai", slug: "ai", name: spec.kicker || spec.brand || spec.name, industry: "", topic: spec.title, titles: [spec.title], subtitle: spec.tagline, points: [], stats: [], steps: [], photos: "" },
    variant: h % 97,
    byline: spec.brand.toUpperCase(),
    closing: { title: closing?.title || "Thank You", text: closing?.body || "", notes: notes.length ? notes : spec.brand ? [spec.brand] : [] },
  };

  const draw = (photo: DeckTheme["photo"]): LibPage[] => {
    const slides = spec.slides as OutlineSlide[];
    const total = slides.length + 1;
    let sections = 0;
    return [null, ...slides].map((slide, index) => {
      const sheet = new Sheet(`ai${(h >>> 0).toString(36)}s${index + 1}`);
      const ctx = { ...theme, photo, sheet, index, total, rng: rngFrom(h + index * 7919) };
      if (!slide) drawTitleSlide(ctx);
      else drawOutlineSlide(ctx, slide, slide.kind === "section" ? sections++ : 0);
      return { name: `${index + 1}. ${slide ? slide.title : spec.title}`.slice(0, 120), width: W, height: H, background: backgroundCss(bg), backgroundSpec: bg, elements: sheet.elements };
    });
  };

  const stockPhoto: DeckTheme["photo"] = (w, hh, n = 0) => photoUrl(pick(stock, (h >>> 4) + n), Math.min(1600, w), Math.min(1600, w) * (hh / w));
  if (!own.length) return draw(stockPhoto);

  // As for a single page: the slides are drawn once to learn which pictures are wanted and how
  // large, each is cut to its box, and the slides are drawn again with the results
  const wanted = new Map<string, { id: string; w: number; h: number; backdrop: boolean }>();
  const key = (w: number, hh: number, n: number) => `${Math.round(w)}x${Math.round(hh)}#${n}`;
  draw((w, hh, n = 0) => {
    wanted.set(key(w, hh, n), { id: own[n % own.length], w, h: hh, backdrop: w * hh >= W * H * 0.85 });
    return "";
  });
  const cutTo = new Map<string, string>();
  await Promise.all([...wanted].map(async ([k, box]) => {
    const name = await cropSource(box.id, box.w, box.h, box.backdrop);
    if (name) cutTo.set(k, assetUrl(baseUrl, name));
  }));
  return draw((w, hh, n = 0) => cutTo.get(key(w, hh, n)) || stockPhoto(w, hh, n));
}

/** Every page of a design: the slides of a presentation, or the one page of anything else */
export async function buildPages(spec: DesignSpec, sizeId: string, baseUrl: string): Promise<LibPage[]> {
  const size = SIZE_BY_ID[sizeId] || SIZE_BY_ID["portrait-4x5"];
  if (size.id === DECK_SIZE && spec.slides.length) return buildDeck(spec, size, baseUrl);
  return [await buildChecked(spec, sizeId, baseUrl)];
}

/** Whether a page shows at least one picture */
function hasPicture(page: LibPage): boolean {
  return page.elements.some((el: any) => (el.type === "image" && el.src) || (el.type === "frame" && el.imageSrc));
}

/**
 * Builds a design and makes sure it is fit to show: it must carry a picture.
 * One that does not is moved to a picture layout and built again.
 */
export async function buildChecked(spec: DesignSpec, sizeId: string, baseUrl: string): Promise<LibPage> {
  let page = await buildDesign(spec, sizeId, baseUrl);
  for (let attempt = 0; attempt < PHOTO_LAYOUT_IDS.length && !hasPicture(page); attempt++) {
    spec.layout = PHOTO_LAYOUT_IDS[(hashString(spec.title) + attempt) % PHOTO_LAYOUT_IDS.length];
    page = await buildDesign(spec, sizeId, baseUrl);
  }
  return page;
}

/** No two options share a layout, and none is left on a layout without a picture */
function spreadLayouts(specs: DesignSpec[]): void {
  const taken = new Set<string>();
  for (const spec of specs) {
    if (!PHOTO_LAYOUT_IDS.includes(spec.layout) || taken.has(spec.layout)) {
      const start = hashString(`${spec.name}|${spec.title}`);
      const free = PHOTO_LAYOUT_IDS.map((_, i) => PHOTO_LAYOUT_IDS[(start + i) % PHOTO_LAYOUT_IDS.length]).find((id) => !taken.has(id));
      spec.layout = free || PHOTO_LAYOUT_IDS[start % PHOTO_LAYOUT_IDS.length];
    }
    taken.add(spec.layout);
  }
}

/** Finds each option a photograph of its own on the subject, and keeps it on this server */
export async function choosePhotos(specs: DesignSpec[], prompt: string, each = 2): Promise<void> {
  const used = new Set<string>();
  await Promise.all(specs.map(async (spec, index) => {
    const found = await findPhotos(spec.imageQueries.length ? spec.imageQueries : [prompt.slice(0, 80)]);
    // Each option starts from a different result, so they do not all open on the same picture
    const order = found.map((_, i) => found[(i + index * 2) % found.length]);
    const ids: string[] = [];
    for (const photo of order) {
      if (ids.length >= each) break;
      if (used.has(photo.url)) continue;
      const id = await fetchSource(photo);
      if (id) {
        used.add(photo.url);
        ids.push(id);
      }
    }
    spec.photos = ids;
  }));
}

export function present(spec: DesignSpec, pages: LibPage[]): GeneratedDesign {
  const [page] = pages;
  return {
    spec, name: spec.name, direction: spec.direction, width: page.width, height: page.height, preview: renderPageSvg(page),
    // A presentation is shown slide by slide; the first is the preview above
    slides: pages.length > 1 ? pages.slice(1).map((slide) => ({ name: slide.name, preview: renderPageSvg(slide) })) : [],
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface GeneratedDesign {
  spec: DesignSpec;
  name: string;
  /** Which of the four directions this option answers */
  direction: string;
  width: number;
  height: number;
  /** A preview of the page as SVG markup */
  preview: string;
  /** The pages after the first, for a design of several: a presentation's slides */
  slides: { name: string; preview: string }[];
}

export function checkSpecs(raw: unknown[]): DesignSpec[] {
  const specs: DesignSpec[] = [];
  for (const item of raw) {
    const checked = designSpecSchema.safeParse(item);
    if (checked.success) specs.push(checked.data);
  }
  if (!specs.length) throw new AppError("Falcon could not design that just now. Please try again.", 502, "AI_FAILED");
  return specs;
}

export const aiDesignService = {
  /** Reads the request and returns design options, each ready to open in the editor */
  async generate(input: { prompt: string; sizeId: string; count: number; withImage: boolean; baseUrl: string }): Promise<{ designs: GeneratedDesign[]; imageMade: boolean }> {
    const size = SIZE_BY_ID[input.sizeId] || SIZE_BY_ID["portrait-4x5"];
    const deck = size.id === DECK_SIZE;
    let raw: unknown[];
    let slides: DesignSpec["slides"] = [];
    try {
      // The look and the slides are asked for together, so a presentation takes no longer than a poster
      [raw, slides] = await Promise.all([
        askForSpecs(instructions(input.count, size.name), input.prompt, input.count),
        deck ? askForSlides(input.prompt) : Promise.resolve([]),
      ]);
    } catch (err) {
      throw aiError(err, "design that");
    }

    const specs = checkSpecs(raw);
    // Every option is the same presentation, designed differently
    specs.forEach((spec, i) => { spec.direction = DIRECTIONS[i % DIRECTIONS.length]; spec.slides = slides; });
    spreadLayouts(specs);

    // A picture made for the request is shared by the options, which keeps a request quick and its cost low
    let imageMade = false;
    if (input.withImage && canMakeAiImages()) {
      try {
        const image = await makeImage(specs[0].imagePrompt || input.prompt, size.width, size.height);
        for (const spec of specs) spec.photos = [image];
        imageMade = true;
      } catch (err) {
        // The designs are still worth having; they use found photographs instead
        aiError(err, "make a picture");
      }
    }
    if (!imageMade) await choosePhotos(specs, input.prompt, deck ? 4 : 2);

    const designs = await Promise.all(specs.map(async (spec) => present(spec, await buildPages(spec, size.id, input.baseUrl))));
    return { designs, imageMade };
  },

  /** The same content in new looks. The words and the pictures stay; style, layout and colours change */
  async variations(input: { spec: DesignSpec; sizeId: string; count: number; baseUrl: string }): Promise<{ designs: GeneratedDesign[] }> {
    const size = SIZE_BY_ID[input.sizeId] || SIZE_BY_ID["portrait-4x5"];
    const original = input.spec;
    const { photos, slides, ...shown } = original;
    let raw: unknown[];
    try {
      raw = await askForSpecs(variationInstructions(input.count, size.name), JSON.stringify(shown), input.count);
    } catch (err) {
      throw aiError(err, "make variations");
    }
    const specs = checkSpecs(raw).filter((spec) => !(spec.layout === original.layout && spec.style === original.style));
    if (!specs.length) throw new AppError("Falcon could not make variations just now. Please try again.", 502, "AI_FAILED");
    for (const spec of specs) {
      // Whatever the model returned for these, the content is the original's
      Object.assign(spec, {
        direction: original.direction, kicker: original.kicker, title: original.title, tagline: original.tagline, cta: original.cta,
        details: original.details, brand: original.brand, subject: original.subject, imageQueries: original.imageQueries,
        imagePrompt: original.imagePrompt, photos: photos.filter(hasSource), slides,
      });
    }
    spreadLayouts(specs);
    const designs = await Promise.all(specs.map(async (spec) => present(spec, await buildPages(spec, size.id, input.baseUrl))));
    return { designs };
  },

  /** The same designs set out again for another format. Nothing is stretched: each layout is run afresh at the new size */
  async resize(input: { specs: DesignSpec[]; sizeId: string; baseUrl: string }): Promise<{ designs: GeneratedDesign[] }> {
    const size = SIZE_BY_ID[input.sizeId] || SIZE_BY_ID["portrait-4x5"];
    const designs = await Promise.all(input.specs.map(async (spec) => present(spec, await buildPages(spec, size.id, input.baseUrl))));
    return { designs };
  },

  /** Saves a chosen design as a project of the signed-in user */
  async use(userId: string, input: { spec: DesignSpec; sizeId: string; baseUrl: string }): Promise<{ projectId: string }> {
    const size = SIZE_BY_ID[input.sizeId] || SIZE_BY_ID["portrait-4x5"];
    const pages = await buildPages(input.spec, size.id, input.baseUrl);
    const project = await prisma.project.create({
      data: {
        title: (input.spec.title || input.spec.name).slice(0, 190),
        ownerId: userId,
        pages: {
          create: pages.map((page, order) => ({
            name: page.name,
            width: page.width,
            height: page.height,
            presetName: size.name,
            background: page.background,
            elements: JSON.stringify(page.elements),
            order,
          })),
        },
      },
      select: { id: true },
    });
    return { projectId: project.id };
  },
};
