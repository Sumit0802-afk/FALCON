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
import { uploadRateLimit } from "../middleware/rateLimit.middleware";
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

/** Whether the bytes are really a picture of the kind named, by their opening bytes */
function looksLike(kind: string, data: Buffer): boolean {
  const head = data.subarray(0, 16);
  switch (kind) {
    case "image/png": return head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case "image/jpeg":
    case "image/jpg": return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
    case "image/gif": return head.subarray(0, 6).toString("latin1") === "GIF87a" || head.subarray(0, 6).toString("latin1") === "GIF89a";
    case "image/webp": return head.subarray(0, 4).toString("latin1") === "RIFF" && head.subarray(8, 12).toString("latin1") === "WEBP";
    case "image/svg+xml": return /^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE[^>]*>\s*)?<svg[\s>]/i.test(data.subarray(0, 4096).toString("utf8").replace(/^\uFEFF/, ""));
    default: return false;
  }
}

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

/** An upload as the editor's Uploads panel shows it */
function describe(req: Request, row: { id: string; ownerId: string; name: string; mimeType: string; size: number; createdAt: Date }, folderId: string | null = null) {
  const kind = KINDS[row.mimeType] || "image";
  const fileUrl = `${req.protocol}://${req.get("host")}/api/uploads/${row.id}/file`;
  return {
    id: `asset-${row.id}`,
    type: kind,
    name: row.name,
    fileUrl,
    thumbnailUrl: fileUrl,
    source: "User Upload",
    author: "You",
    license: "Proprietary / User Content",
    attributionRequired: false,
    tags: [],
    category: kind,
    ownerId: row.ownerId,
    visibility: "private",
    folderId,
    fileSize: row.size,
    mimeType: row.mimeType,
    status: "active",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.createdAt.toISOString(),
  };
}

const router = Router();

// Everything this account has uploaded, newest first. This is what makes an upload stay in the
// panel on any device until its owner deletes it. The pictures themselves are not sent here
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const rows = await prisma.upload.findMany({
      where: { ownerId: userId(req) },
      orderBy: { createdAt: "desc" },
      select: { id: true, ownerId: true, name: true, mimeType: true, size: true, createdAt: true },
    });
    res.status(200).json({ assets: rows.map((row) => describe(req, row)) });
  })
);

// Anyone with the address may load the picture: a design shows it to whoever the design is
// shared with, and the address is a random id that cannot be guessed
router.get(
  "/:id/file",
  asyncHandler(async (req: Request, res: Response) => {
    const found = await prisma.upload.findUnique({ where: { id: String(req.params.id) }, select: { mimeType: true, data: true } });
    if (!found) throw AppError.notFound("That picture is no longer here.");
    res.setHeader("Content-Type", found.mimeType);
    // Kept for a day, not for ever, so a picture its owner deletes stops being served soon after
    res.setHeader("Cache-Control", "public, max-age=86400");
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
  uploadRateLimit,
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
    if (!looksLike(fileType, data)) throw AppError.badRequest("That file is not the kind of picture its name says. Upload a PNG, JPG, WebP, GIF or SVG.");

    const kept = await prisma.upload.aggregate({ where: { ownerId: owner }, _sum: { size: true } });
    if ((kept._sum.size || 0) + data.length > ACCOUNT_BYTES) {
      throw AppError.badRequest("Your uploads are full. Delete some pictures you no longer use, then try again.");
    }

    const saved = await prisma.upload.create({
      data: { ownerId: owner, name: fileName, mimeType: fileType === "image/jpg" ? "image/jpeg" : fileType, size: data.length, data },
      select: { id: true, ownerId: true, name: true, mimeType: true, size: true, createdAt: true },
    });

    res.status(201).json({ asset: describe(req, saved, folderId || null) });
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
