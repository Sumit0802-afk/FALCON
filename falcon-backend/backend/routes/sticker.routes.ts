import { Router, Request, Response } from "express";

const router = Router();

// License verification list
const FORBIDDEN_LICENSES = [
  "all rights reserved",
  "copyright",
  "proprietary",
  "non-commercial",
  "personal use only",
];

// In-memory / database store for backend
let backendStickers: any[] = [];

// GET /api/stickers
router.get("/", (req: Request, res: Response) => {
  const { query, category, limit = "36", offset = "0", status = "published" } = req.query;

  const q = String(query || "").trim().toLowerCase();
  const cat = String(category || "all").trim().toLowerCase();
  const lim = parseInt(String(limit), 10) || 36;
  const off = parseInt(String(offset), 10) || 0;

  let filtered = backendStickers.filter((s) => {
    if (status && s.status !== status) return false;
    if (cat !== "all" && s.category.toLowerCase() !== cat) return false;
    if (q) {
      const matchName = s.name.toLowerCase().includes(q);
      const matchCat = s.category.toLowerCase().includes(q);
      const matchTag = s.tags.some((t: string) => t.toLowerCase().includes(q));
      if (!matchName && !matchCat && !matchTag) return false;
    }
    return true;
  });

  const total = filtered.length;
  const items = filtered.slice(off, off + lim);

  res.status(200).json({
    items,
    total,
    offset: off,
    limit: lim,
    hasMore: off + lim < total,
  });
});

// POST /api/stickers (Ingest sticker)
router.post("/", (req: Request, res: Response) => {
  const { name, category, license, fileUrl, tags = [], author, source, sourceUrl, attributionRequired } = req.body;

  if (!name || !category || !license || !fileUrl) {
    return res.status(400).json({ error: "Missing required fields: name, category, license, fileUrl" });
  }

  const licLower = String(license).toLowerCase();
  if (FORBIDDEN_LICENSES.some((f) => licLower.includes(f))) {
    return res.status(403).json({ error: `License '${license}' prohibits redistribution or commercial use.` });
  }

  const newSticker = {
    id: `stk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name,
    fileUrl,
    thumbnailUrl: fileUrl,
    format: fileUrl.includes(".png") ? "png" : "svg",
    category: String(category).toLowerCase(),
    tags: Array.isArray(tags) ? tags : [tags],
    author: author || "Contributor",
    source: source || "Direct Upload",
    sourceUrl: sourceUrl || "",
    license,
    attributionRequired: Boolean(attributionRequired),
    width: 200,
    height: 200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "published",
  };

  backendStickers.unshift(newSticker);
  res.status(201).json(newSticker);
});

// POST /api/stickers/bulk
router.post("/bulk", (req: Request, res: Response) => {
  const items = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "Input must be an array of stickers" });
  }

  let successCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  items.forEach((item, idx) => {
    if (!item.name || !item.category || !item.license || !item.fileUrl) {
      failedCount++;
      errors.push(`Row ${idx + 1}: Missing required fields`);
      return;
    }
    const lic = String(item.license).toLowerCase();
    if (FORBIDDEN_LICENSES.some((f) => lic.includes(f))) {
      failedCount++;
      errors.push(`Row ${idx + 1}: Prohibited license '${item.license}'`);
      return;
    }

    backendStickers.unshift({
      id: `stk-${Date.now()}-${idx}`,
      name: item.name,
      fileUrl: item.fileUrl,
      thumbnailUrl: item.fileUrl,
      format: item.fileUrl.includes(".png") ? "png" : "svg",
      category: String(item.category).toLowerCase(),
      tags: Array.isArray(item.tags) ? item.tags : [],
      author: item.author || "Contributor",
      source: item.source || "Bulk Import",
      sourceUrl: item.sourceUrl || "",
      license: item.license,
      attributionRequired: Boolean(item.attributionRequired),
      width: 200,
      height: 200,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "published",
    });
    successCount++;
  });

  res.status(200).json({
    total: items.length,
    successCount,
    failedCount,
    errors,
  });
});

export default router;
