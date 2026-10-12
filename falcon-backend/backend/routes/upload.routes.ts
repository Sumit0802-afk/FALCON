/**
 * Pictures a user uploads in the editor.
 *
 * They are kept in the database, not on disk, so they survive on hosts that
 * give the server no lasting disk (Vercel's functions, for one). A picture is
 * therefore kept small: the editor shrinks a large one before sending it.
 *
 * Videos, audio and documents are not handled here; they are far too large for
 * a database row or for a function's request limit.
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../database/prismaClient";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

/** What may be uploaded, and the kind the editor files it under */
const KINDS: Record<string, "image" | "svg" | "gif"> = {
  "image/png": "image",
  "image/jpeg": "image",
  "image/jpg": "image",
  "image/webp": "image",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

/** One picture. A function's request may not pass 4.5 MB, and the picture travels as base64, a third larger */
const MAX_BYTES = 3 * 1024 * 1024;
/** Everything one account may keep */
const ACCOUNT_BYTES = 60 * 1024 * 1024;

const uploadSchema = z.object({
  fileName: z.string().trim().min(1).max(200),
  fileType: z.string().trim().toLowerCase().max(60),
  base64Data: z.string().min(8).max(Math.ceil(MAX_BYTES * 1.4) + 200),
  folderId: z.string().max(80).nullable().optional(),
});

function userId(req: Request): string {
  if (!req.userId) throw AppError.unauthorized();
  return req.userId;
}

const router = Router();

// Anyone with the address may load the picture: a design shows it to whoever the design is
// shared with, and the address is a random id that cannot be guessed
router.get(
  "/:id/file",
  asyncHandler(async (req: Request, res: Response) => {
    const found = await prisma.upload.findUnique({ where: { id: String(req.params.id) }, select: { mimeType: true, data: true } });
    if (!found) throw AppError.notFound("That picture is no longer here.");
    res.setHeader("Content-Type", found.mimeType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    // An SVG can carry script; opened on its own it must not run any
    res.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; img-src data:; sandbox");
    res.end(Buffer.from(found.data));
  })
);

router.post(
  "/",
  requireAuth,
  validateBody(uploadSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const owner = userId(req);
    const { fileName, fileType, base64Data, folderId } = req.body as z.infer<typeof uploadSchema>;
    const kind = KINDS[fileType];
    if (!kind) throw AppError.badRequest("Only pictures can be uploaded here: PNG, JPG, WebP, GIF or SVG.");

    const comma = base64Data.startsWith("data:") ? base64Data.indexOf(",") : -1;
    const data = Buffer.from(comma >= 0 ? base64Data.slice(comma + 1) : base64Data, "base64");
    if (data.length === 0) throw AppError.badRequest("That file is empty.");
    if (data.length > MAX_BYTES) throw AppError.badRequest("That picture is too large. Pictures up to 3 MB can be kept.");

    const kept = await prisma.upload.aggregate({ where: { ownerId: owner }, _sum: { size: true } });
    if ((kept._sum.size || 0) + data.length > ACCOUNT_BYTES) {
      throw AppError.badRequest("Your uploads are full. Delete some pictures you no longer use, then try again.");
    }

    const saved = await prisma.upload.create({
      data: { ownerId: owner, name: fileName, mimeType: fileType === "image/jpg" ? "image/jpeg" : fileType, size: data.length, data },
      select: { id: true, createdAt: true },
    });

    const fileUrl = `${req.protocol}://${req.get("host")}/api/uploads/${saved.id}/file`;
    res.status(201).json({
      asset: {
        id: `asset-${saved.id}`,
        type: kind,
        name: fileName,
        fileUrl,
        thumbnailUrl: fileUrl,
        source: "User Upload",
        author: "You",
        license: "Proprietary / User Content",
        attributionRequired: false,
        tags: [],
        category: kind,
        ownerId: owner,
        visibility: "private",
        folderId: folderId || null,
        fileSize: data.length,
        mimeType: fileType,
        status: "active",
        createdAt: saved.createdAt.toISOString(),
        updatedAt: saved.createdAt.toISOString(),
      },
    });
  })
);

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const removed = await prisma.upload.deleteMany({ where: { id: String(req.params.id), ownerId: userId(req) } });
    if (removed.count === 0) throw AppError.notFound("That picture is no longer here.");
    res.status(200).json({ success: true });
  })
);

export default router;
