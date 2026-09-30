import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes";
import projectRoutes from "./project.routes";
import aiRoutes from "./ai.routes";
import stickerRoutes from "./sticker.routes";

const router = Router();

router.get(
  "/health",
  (_req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
    });
  }
);

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/ai", aiRoutes);
router.use("/stickers", stickerRoutes);

export default router;