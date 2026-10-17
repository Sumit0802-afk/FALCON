import { Router } from "express";
import { z } from "zod";
import { generateDesignBlueprint } from "../services/ai.service";
import { AI_DESIGN_SIZES, aiDesignService, designSpecSchema } from "../services/aiDesign.service";
import { readImage, portraitService } from "../services/portrait.service";
import { aiStudioService, analysisSchema, contentSchema, dnaSchema, referenceSchema, settingsSchema } from "../services/aiStudio.service";
import { findPhotos } from "../services/aiImages";
import { validateBody } from "../middleware/validate.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import { aiLightRateLimit, aiRateLimit } from "../middleware/rateLimit.middleware";
import { AppError } from "../utils/AppError";

const router = Router();

// Every request here spends money with the AI provider, so all of it is for signed-in users only
router.use(requireAuth);

const SIZE_IDS = AI_DESIGN_SIZES.map((s) => s.id) as [string, ...string[]];

// A description can be as long as the user likes. The ceiling is only there so one request cannot run up
// an unbounded bill with the AI service; it is far beyond anything typed or pasted in practice.
const PROMPT_CEILING = 100_000;
const TOO_LONG = "That description is too long for Falcon to read in one go. Shorten it a little and try again.";

const generateSchema = z.object({
  prompt: z.string().min(3).max(PROMPT_CEILING, TOO_LONG),
});

const designsSchema = z.object({
  prompt: z.string().trim().min(3, "Describe the design you want").max(PROMPT_CEILING, TOO_LONG),
  size: z.enum(SIZE_IDS).default("portrait-4x5"),
  count: z.number().int().min(1).max(4).default(4),
  /** Make a picture for the design with the image model */
  image: z.boolean().default(false),
});

const useSchema = z.object({
  spec: designSpecSchema,
  size: z.enum(SIZE_IDS).default("portrait-4x5"),
});

const variationsSchema = z.object({
  spec: designSpecSchema,
  size: z.enum(SIZE_IDS).default("portrait-4x5"),
  count: z.number().int().min(1).max(4).default(4),
});

const resizeSchema = z.object({
  specs: z.array(designSpecSchema).min(1).max(8),
  size: z.enum(SIZE_IDS),
});

// A picture arrives as a data address: the browser reads it, so this server never fetches an address it is handed
const picture = z.string().min(100).max(16_000_000);

const portraitSchema = z.object({
  image: picture,
  style: z.string().max(80).optional(),
  description: z.string().trim().max(300).optional(),
  count: z.number().int().min(1).max(4).default(4),
}).refine((v) => !!v.style || !!v.description, { message: "Choose a style or describe the portrait" });

const previewsSchema = z.object({ image: picture });

const blendSchema = z.object({
  original: z.string().max(400),
  result: z.string().max(400),
  strength: z.number().min(0).max(100),
});

// ─── AI Studio: reference, request, artwork ──────────────────────────────────

const references = z.array(referenceSchema).max(4).default([]);
const artworkAddress = z.string().max(400);

const studioAnalyzeSchema = z.object({ references: z.array(referenceSchema).min(1, "Add a reference picture first").max(4) });

const studioCompileSchema = z.object({
  prompt: z.string().trim().min(3, "Describe the design you want").max(PROMPT_CEILING, TOO_LONG),
  size: z.enum(SIZE_IDS).default("portrait-4x5"),
  analysis: analysisSchema.nullable().default(null),
  dna: dnaSchema.nullable().default(null),
  settings: settingsSchema.default({}),
});

const studioArtworkSchema = z.object({
  compiled: z.string().trim().min(20, "The generation prompt is empty").max(40_000),
  size: z.enum(SIZE_IDS).default("portrait-4x5"),
  references,
  /** An earlier result to work from, with what to do to it */
  base: artworkAddress.optional(),
  instruction: z.string().trim().max(600).optional(),
});

const studioEvaluateSchema = z.object({ reference: referenceSchema.shape.image, result: artworkAddress, content: contentSchema.default({}) });

const studioLayoutSchema = z.object({
  prompt: z.string().trim().min(3).max(PROMPT_CEILING, TOO_LONG),
  size: z.enum(SIZE_IDS).default("portrait-4x5"),
  content: contentSchema.default({}),
  analysis: analysisSchema.nullable().default(null),
  settings: settingsSchema.default({}),
  count: z.number().int().min(1).max(4).default(1),
  /** A design to make versions of: its words, colours, type and pictures are kept */
  keep: designSpecSchema.optional(),
});

const studioOpenSchema = z.object({ url: artworkAddress, size: z.enum(SIZE_IDS).default("portrait-4x5"), title: z.string().trim().max(190).default("") });

/** The public address of this server, used for pictures saved here */
function baseUrl(req: { protocol: string; get(name: string): string | undefined }): string {
  return (process.env.PUBLIC_API_URL || `${req.protocol}://${req.get("host")}`).replace(/\/+$/, "");
}

function userId(req: any): string {
  if (!req.userId) throw AppError.unauthorized("Authentication required. Please sign in.");
  return req.userId;
}

router.get("/sizes", (_req, res) => {
  res.status(200).json({ sizes: AI_DESIGN_SIZES });
});

router.post(
  "/generate",
  aiRateLimit,
  validateBody(generateSchema),
  async (req, res, next) => {
    try {
      const { prompt } = req.body;

      const blueprint = await generateDesignBlueprint(prompt);

      res.status(200).json({
        success: true,
        blueprint,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/designs", aiRateLimit, validateBody(designsSchema), async (req, res, next) => {
  try {
    const { prompt, size, count, image } = req.body;
    const result = await aiDesignService.generate({ prompt, sizeId: size, count, withImage: image, baseUrl: baseUrl(req) });
    res.status(200).json({ success: true, size, ...result });
  } catch (error) {
    next(error);
  }
});

router.post("/designs/variations", aiRateLimit, validateBody(variationsSchema), async (req, res, next) => {
  try {
    const { spec, size, count } = req.body;
    const result = await aiDesignService.variations({ spec, sizeId: size, count, baseUrl: baseUrl(req) });
    res.status(200).json({ success: true, size, ...result });
  } catch (error) {
    next(error);
  }
});

// Setting the same designs out for another format asks nothing of the AI service
router.post("/designs/resize", aiLightRateLimit, validateBody(resizeSchema), async (req, res, next) => {
  try {
    const { specs, size } = req.body;
    const result = await aiDesignService.resize({ specs, sizeId: size, baseUrl: baseUrl(req) });
    res.status(200).json({ success: true, size, ...result });
  } catch (error) {
    next(error);
  }
});

router.post("/designs/use", aiLightRateLimit, validateBody(useSchema), async (req, res, next) => {
  try {
    const result = await aiDesignService.use(userId(req), { spec: req.body.spec, sizeId: req.body.size, baseUrl: baseUrl(req) });
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// ─── AI Studio: the steps the browser calls one after another ────────────────

router.get("/studio/status", (_req, res) => {
  res.status(200).json(aiStudioService.status());
});

router.post("/studio/analyze", aiRateLimit, validateBody(studioAnalyzeSchema), async (req, res, next) => {
  try {
    res.status(200).json(await aiStudioService.analyze({ references: req.body.references }));
  } catch (error) {
    next(error);
  }
});

router.post("/studio/compile", aiRateLimit, validateBody(studioCompileSchema), async (req, res, next) => {
  try {
    const { prompt, size, analysis, dna, settings } = req.body;
    res.status(200).json(await aiStudioService.compile({ prompt, sizeId: size, analysis, dna, settings }));
  } catch (error) {
    next(error);
  }
});

router.post("/studio/artwork", aiRateLimit, validateBody(studioArtworkSchema), async (req, res, next) => {
  try {
    const { compiled, size, references: refs, base, instruction } = req.body;
    res.status(200).json(await aiStudioService.artwork({ compiled, sizeId: size, references: refs, base, instruction, baseUrl: baseUrl(req) }));
  } catch (error) {
    next(error);
  }
});

router.post("/studio/evaluate", aiRateLimit, validateBody(studioEvaluateSchema), async (req, res, next) => {
  try {
    res.status(200).json(await aiStudioService.evaluate(req.body));
  } catch (error) {
    next(error);
  }
});

router.post("/studio/layout", aiRateLimit, validateBody(studioLayoutSchema), async (req, res, next) => {
  try {
    const { prompt, size, content, analysis, settings, count, keep } = req.body;
    res.status(200).json({ size, ...(await aiStudioService.layout({ prompt, sizeId: size, content, analysis, settings, count, keep, baseUrl: baseUrl(req) })) });
  } catch (error) {
    next(error);
  }
});

router.post("/studio/open", aiLightRateLimit, validateBody(studioOpenSchema), async (req, res, next) => {
  try {
    res.status(201).json(await aiStudioService.open(userId(req), { url: req.body.url, sizeId: req.body.size, title: req.body.title }));
  } catch (error) {
    next(error);
  }
});

// ─── Photographs for the editor's element search ─────────────────────────────

router.get("/photos", aiLightRateLimit, async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim().slice(0, 80);
    if (q.length < 2) return res.status(200).json({ photos: [] });
    res.status(200).json({ photos: (await findPhotos([q])).slice(0, 12) });
  } catch (error) {
    next(error);
  }
});

// ─── Portrait: remaking a photo in the editor ────────────────────────────────

router.get("/portrait/styles", (_req, res) => {
  res.status(200).json(portraitService.catalogue());
});

router.post("/portrait/previews", aiLightRateLimit, validateBody(previewsSchema), async (req, res, next) => {
  try {
    res.status(200).json({ previews: await portraitService.previews(readImage(req.body.image)) });
  } catch (error) {
    next(error);
  }
});

router.post("/portrait", aiRateLimit, validateBody(portraitSchema), async (req, res, next) => {
  try {
    const { image, style, description, count } = req.body;
    res.status(200).json(await portraitService.run(readImage(image), { style, description, count, baseUrl: baseUrl(req) }));
  } catch (error) {
    next(error);
  }
});

router.post("/portrait/blend", aiLightRateLimit, validateBody(blendSchema), async (req, res, next) => {
  try {
    res.status(200).json(await portraitService.blend({ ...req.body, baseUrl: baseUrl(req) }));
  } catch (error) {
    next(error);
  }
});

export default router;
