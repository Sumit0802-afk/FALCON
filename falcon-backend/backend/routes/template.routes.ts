import { Router } from "express";
import { templateController } from "../controllers/template.controller";
import { optionalAuth, requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", optionalAuth, templateController.list);
router.get("/search", optionalAuth, templateController.search);
router.get("/categories", optionalAuth, templateController.categories);
router.get("/featured", optionalAuth, templateController.featured);
router.get("/popular", optionalAuth, templateController.popular);
router.get("/:id/related", optionalAuth, templateController.related);
router.get("/:id", optionalAuth, templateController.get);
router.post("/:id/use", requireAuth, templateController.use);
router.post("/:id/favorite", requireAuth, templateController.favorite);
router.delete("/:id/favorite", requireAuth, templateController.unfavorite);

export default router;
