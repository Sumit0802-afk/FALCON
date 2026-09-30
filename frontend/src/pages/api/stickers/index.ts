import type { NextApiRequest, NextApiResponse } from "next";
import { SEED_DEMO_STICKERS, STICKER_CATEGORIES } from "@/data/seedStickers";
import { Sticker, PaginatedStickers } from "@/types/sticker";
import publishedStickersRaw from "@/data/publishedStickers.json";

// Merge published (real) stickers + demo stickers (deduped by id)
const PUBLISHED = publishedStickersRaw as Sticker[];
const PUBLISHED_IDS = new Set(PUBLISHED.map((s) => s.id));
const DEMO_ONLY = SEED_DEMO_STICKERS.filter((s) => !PUBLISHED_IDS.has(s.id));
const ALL_STICKERS: Sticker[] = [...PUBLISHED, ...DEMO_ONLY];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedStickers | { error: string } | { categories: any[] }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Category list endpoint
  if (req.query.categories === "true") {
    return res.status(200).json({ categories: STICKER_CATEGORIES } as any);
  }

  const {
    query = "",
    category = "all",
    limit = "36",
    offset = "0",
    status = "published",
    subcategory,
    tag,
    format,
    favoritesOnly,
  } = req.query;

  const q = String(query).trim().toLowerCase();
  const cat = String(category).trim().toLowerCase();
  const lim = Math.min(parseInt(String(limit), 10) || 36, 100);
  const off = Math.max(parseInt(String(offset), 10) || 0, 0);

  let items = ALL_STICKERS.filter((s) => {
    if (status && s.status !== status) return false;
    if (cat !== "all" && s.category.toLowerCase() !== cat) return false;
    if (subcategory && s.subcategory?.toLowerCase() !== String(subcategory).toLowerCase()) return false;
    if (tag && !s.tags.some((t) => t.toLowerCase() === String(tag).toLowerCase())) return false;
    if (format && s.format !== format) return false;
    if (q) {
      const matchesName = s.name.toLowerCase().includes(q);
      const matchesCategory = s.category.toLowerCase().includes(q);
      const matchesTags = s.tags.some((t) => t.toLowerCase().includes(q));
      const matchesAuthor = s.author.toLowerCase().includes(q);
      if (!matchesName && !matchesCategory && !matchesTags && !matchesAuthor) return false;
    }
    return true;
  });

  const total = items.length;
  const paginated = items.slice(off, off + lim);

  // Cache for 60 seconds (CDN-friendly)
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");

  return res.status(200).json({
    items: paginated,
    total,
    offset: off,
    limit: lim,
    hasMore: off + lim < total,
  });
}
