import { Router } from "express";
import { z } from "zod";
import { generateDesignBlueprint } from "../services/ai.service";
import { AI_DESIGN_SIZES, aiDesignService, designSpecSchema } from "../services/aiDesign.service";
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

router.post("/designs/use", validateBody(useSchema), async (req, res, next) => {
  try {
    const result = await aiDesignService.use(userId(req), { spec: req.body.spec, sizeId: req.body.size, baseUrl: baseUrl(req) });
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

export default router;
