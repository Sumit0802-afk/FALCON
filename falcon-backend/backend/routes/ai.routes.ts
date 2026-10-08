import { Router } from "express";
import { z } from "zod";
import { generateDesignBlueprint } from "../services/ai.service";
import { AI_DESIGN_SIZES, aiDesignService, designSpecSchema } from "../services/aiDesign.service";
import { readImage, transformService } from "../services/transform.service";
import { findPhotos } from "../services/aiImages";
import { validateBody } from "../middleware/validate.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import { aiRateLimit } from "../middleware/rateLimit.middleware";
import { AppError } from "../utils/AppError";

const router = Router();

// Every request here spends money with the AI provider, so all of it is for signed-in users only
router.use(requireAuth);

const SIZE_IDS = AI_DESIGN_SIZES.map((s) => s.id) as [string, ...string[]];

const generateSchema = z.object({
  prompt: z.string().min(3).max(2000),
});

const designsSchema = z.object({
  prompt: z.string().trim().min(3, "Describe the design you want").max(2000),
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

const transformSchema = z.object({
  image: picture,
  style: z.string().max(40).optional(),
  description: z.string().trim().max(300).optional(),
  count: z.number().int().min(1).max(4).default(4),
}).refine((v) => !!v.style || !!v.description, { message: "Choose a style or describe the transformation" });

const previewsSchema = z.object({ image: picture });

const blendSchema = z.object({
  original: z.string().max(400),
  result: z.string().max(400),
  strength: z.number().min(0).max(100),
});

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
router.post("/designs/resize", validateBody(resizeSchema), async (req, res, next) => {
  try {
    const { specs, size } = req.body;
    const result = await aiDesignService.resize({ specs, sizeId: size, baseUrl: baseUrl(req) });
    res.status(200).json({ success: true, size, ...result });
  } catch (error) {
    next(error);
  }
});

router.post("/designs/use", validateBody(useSchema), async (req, res, next) => {
  try {
    const result = await aiDesignService.use(userId(req), { spec: req.body.spec, sizeId: req.body.size, baseUrl: baseUrl(req) });
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// ─── Photographs for the editor's element search ─────────────────────────────

router.get("/photos", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim().slice(0, 80);
    if (q.length < 2) return res.status(200).json({ photos: [] });
    res.status(200).json({ photos: (await findPhotos([q])).slice(0, 12) });
  } catch (error) {
    next(error);
  }
});

// ─── Transform: restyling a picture in the editor ────────────────────────────

router.get("/transform/styles", (_req, res) => {
  res.status(200).json(transformService.catalogue());
});

router.post("/transform/previews", validateBody(previewsSchema), async (req, res, next) => {
  try {
    res.status(200).json({ previews: await transformService.previews(readImage(req.body.image)) });
  } catch (error) {
    next(error);
  }
});

router.post("/transform", aiRateLimit, validateBody(transformSchema), async (req, res, next) => {
  try {
    const { image, style, description, count } = req.body;
    res.status(200).json(await transformService.run(readImage(image), { style, description, count, baseUrl: baseUrl(req) }));
  } catch (error) {
    next(error);
  }
});

router.post("/transform/blend", validateBody(blendSchema), async (req, res, next) => {
  try {
    res.status(200).json(await transformService.blend({ ...req.body, baseUrl: baseUrl(req) }));
  } catch (error) {
    next(error);
  }
});

export default router;
