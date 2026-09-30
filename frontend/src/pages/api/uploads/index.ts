import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { Asset, AssetType } from "@/types/asset";

// Allowed mime types & maximum sizes
const ALLOWED_MIME_TYPES: Record<string, { type: AssetType; maxSize: number }> = {
  // Images (Max 50MB)
  "image/png": { type: "image", maxSize: 50 * 1024 * 1024 },
  "image/jpeg": { type: "image", maxSize: 50 * 1024 * 1024 },
  "image/jpg": { type: "image", maxSize: 50 * 1024 * 1024 },
  "image/webp": { type: "image", maxSize: 50 * 1024 * 1024 },
  "image/svg+xml": { type: "svg", maxSize: 20 * 1024 * 1024 },
  "image/gif": { type: "gif", maxSize: 50 * 1024 * 1024 },
  // Videos (Max 250MB)
  "video/mp4": { type: "video", maxSize: 250 * 1024 * 1024 },
  "video/quicktime": { type: "video", maxSize: 250 * 1024 * 1024 }, // MOV
  "video/webm": { type: "video", maxSize: 250 * 1024 * 1024 },
  // Audio (Max 50MB)
  "audio/mpeg": { type: "audio", maxSize: 50 * 1024 * 1024 }, // MP3
  "audio/mp3": { type: "audio", maxSize: 50 * 1024 * 1024 },
  "audio/wav": { type: "audio", maxSize: 50 * 1024 * 1024 },
  "audio/x-wav": { type: "audio", maxSize: 50 * 1024 * 1024 },
  "audio/ogg": { type: "audio", maxSize: 50 * 1024 * 1024 },
  // PDF (Max 50MB)
  "application/pdf": { type: "pdf", maxSize: 50 * 1024 * 1024 },
};

// Configure API body parser limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "60mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const {
        fileName,
        fileType,
        fileSize,
        base64Data,
        folderId,
        visibility = "private",
        tags = [],
      } = req.body;

      if (!fileName || !fileType || !base64Data) {
        return res.status(400).json({ error: "Missing required upload fields (fileName, fileType, base64Data)" });
      }

      // 1. Validation
      const mimeConfig = ALLOWED_MIME_TYPES[fileType.toLowerCase()];
      if (!mimeConfig) {
        return res.status(400).json({
          error: `Unsupported file type: ${fileType}. Allowed types: PNG, JPG, WEBP, SVG, GIF, MP4, MOV, MP3, WAV, PDF`,
        });
      }

      if (fileSize && fileSize > mimeConfig.maxSize) {
        const mb = Math.round(mimeConfig.maxSize / (1024 * 1024));
        return res.status(400).json({
          error: `File size exceeds the limit of ${mb}MB for this file type.`,
        });
      }

      // 2. Storage directory
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Clean base64 string
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      const rawBase64 = matches ? matches[2] : base64Data;
      const buffer = Buffer.from(rawBase64, "base64");

      // Generate unique safe file name
      const ext = path.extname(fileName) || `.${fileType.split("/")[1] || "bin"}`;
      const baseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
      const uniqueFileName = `${Date.now()}_${baseName}${ext}`;
      const filePath = path.join(uploadsDir, uniqueFileName);

      fs.writeFileSync(filePath, buffer);

      const fileUrl = `/uploads/${uniqueFileName}`;
      const isImageOrSvg = mimeConfig.type === "image" || mimeConfig.type === "svg" || mimeConfig.type === "gif";
      const thumbnailUrl = isImageOrSvg ? fileUrl : "";

      const newAsset: Asset = {
        id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: mimeConfig.type,
        name: fileName,
        fileUrl,
        thumbnailUrl: thumbnailUrl || fileUrl,
        source: "User Upload",
        author: "You",
        license: "Proprietary / User Content",
        attributionRequired: false,
        tags: Array.isArray(tags) ? tags : [],
        category: mimeConfig.type,
        ownerId: "current-user",
        visibility: visibility || "private",
        folderId: folderId || null,
        fileSize: buffer.length,
        mimeType: fileType,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return res.status(201).json({ asset: newAsset });
    } catch (err: any) {
      console.error("Upload error:", err);
      return res.status(500).json({ error: "Failed to process upload: " + (err.message || String(err)) });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { fileUrl } = req.body;
      if (!fileUrl || !fileUrl.startsWith("/uploads/")) {
        return res.status(400).json({ error: "Invalid file URL" });
      }
      const safeName = path.basename(fileUrl);
      const filePath = path.join(process.cwd(), "public", "uploads", safeName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: "Delete failed: " + err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
