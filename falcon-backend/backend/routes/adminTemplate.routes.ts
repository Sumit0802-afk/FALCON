import { Router } from "express";
import { z } from "zod";
import { adminTemplateController } from "../controllers/adminTemplate.controller";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";

const router = Router();
router.use(requireAuth, requireAdmin);

const createSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().max(120).optional(),
  description: z.string().max(4000).optional(),
  categorySlug: z.string().min(1),
  subcategorySlug: z.string().min(1),
  tags: z.array(z.string()).optional(),
  style: z.string().optional(),
  industry: z.string().optional(),
  audience: z.string().optional(),
  platform: z.string().optional(),
  orientation: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  colorFamily: z.string().optional(),
  theme: z.string().optional(),
  language: z.string().optional(),
  thumbnailUrl: z.string().max(2000).optional(),
  previewUrl: z.string().max(2000).optional(),
  featured: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  designData: z.record(z.any()),
});

const bulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  action: z.enum([
    "publish",
    "unpublish",
    "delete",
    "categorize",
    "tag",
    "feature",
    "unfeature",
  ]),
  categorySlug: z.string().optional(),
  subcategorySlug: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

router.get("/", adminTemplateController.list);
router.get("/jobs", adminTemplateController.jobs);
router.post("/", validateBody(createSchema), adminTemplateController.create);
router.post("/import", adminTemplateController.importJson);
router.post("/bulk-import", adminTemplateController.bulkImport);
router.post("/bulk", validateBody(bulkSchema), adminTemplateController.bulk);
router.get("/:id", adminTemplateController.get);
router.put("/:id", adminTemplateController.update);
router.patch("/:id", adminTemplateController.update);
router.delete("/:id", adminTemplateController.remove);

export default router;
