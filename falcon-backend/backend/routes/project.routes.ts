import { Router } from "express";
import { z } from "zod";
import { projectController } from "../controllers/project.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";

const router = Router();
router.use(requireAuth);

const createProjectSchema = z.object({
  title: z.string().min(1).max(200).default("Untitled design"),
  presetName: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
});

const elementSchema = z.record(z.any()); // shape lives in models/element.model.ts

const updatePageSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  background: z.string().optional(),
  elements: z.array(elementSchema).optional(),
});

router.get("/", projectController.list);
router.post("/", validateBody(createProjectSchema), projectController.create);
router.get("/:projectId", projectController.get);
router.patch("/:projectId", validateBody(updateProjectSchema), projectController.update);
router.delete("/:projectId", projectController.remove);
router.post("/:projectId/duplicate", projectController.duplicate);

router.post("/:projectId/pages", projectController.addPage);
router.patch("/:projectId/pages/:pageId", validateBody(updatePageSchema), projectController.updatePage);
router.delete("/:projectId/pages/:pageId", projectController.removePage);

export default router;
