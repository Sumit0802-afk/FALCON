import { Router } from "express";
import { z } from "zod";
import { generateDesignBlueprint } from "../services/ai.service";
import { validateBody } from "../middleware/validate.middleware";

const router = Router();

const generateSchema = z.object({
  prompt: z.string().min(3).max(2000),
});

router.post(
  "/generate",
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

export default router;