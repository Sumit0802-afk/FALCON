import type { NextApiRequest, NextApiResponse } from "next";
import { SEED_PHOTOS } from "@/data/seedPhotos";
import { SEED_VIDEOS } from "@/data/seedVideos";
import { SEED_AUDIO } from "@/data/seedAudio";
import publishedStickersRaw from "@/data/publishedStickers.json";
import { Asset, PaginatedAssets, AssetType } from "@/types/asset";
import { Sticker } from "@/types/sticker";

const STICKER_ASSETS: Asset[] = (publishedStickersRaw as Sticker[]).slice(0, 300).map((stk) => ({
  id: stk.id,
  type: "svg" as AssetType,
  name: stk.name,
  fileUrl: stk.fileUrl,
  thumbnailUrl: stk.thumbnailUrl || stk.fileUrl,
  source: stk.source,
  sourceUrl: stk.sourceUrl,
  author: stk.author,
  license: stk.license,
  attributionRequired: stk.attributionRequired,
  tags: stk.tags || [],
  category: stk.category,
  ownerId: "system",
  visibility: "public",
  createdAt: stk.createdAt || "2026-01-01T00:00:00Z",
  updatedAt: stk.updatedAt || "2026-01-01T00:00:00Z",
  width: stk.width,
  height: stk.height,
  status: "active",
}));

const GLOBAL_ASSETS: Asset[] = [
  ...SEED_PHOTOS,
  ...SEED_VIDEOS,
  ...SEED_AUDIO,
  ...STICKER_ASSETS,
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedAssets<Asset> | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    type = "all",
    query = "",
    category = "all",
    visibility = "all",
    status = "active",
    limit = "30",
    offset = "0",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const q = String(query).trim().toLowerCase();
  const cat = String(category).trim().toLowerCase();
  const lim = Math.min(parseInt(String(limit), 10) || 30, 100);
  const off = Math.max(parseInt(String(offset), 10) || 0, 0);

  let items = GLOBAL_ASSETS.filter((a) => {
    if (status !== "all" && (a.status || "active") !== status) return false;
    if (type !== "all" && a.type !== type) return false;
    if (cat !== "all" && a.category.toLowerCase() !== cat) return false;
    if (visibility !== "all" && a.visibility !== visibility) return false;

    if (q) {
      const matchesName = a.name.toLowerCase().includes(q);
      const matchesCategory = a.category.toLowerCase().includes(q);
      const matchesTags = a.tags.some((t) => t.toLowerCase().includes(q));
      const matchesAuthor = a.author ? a.author.toLowerCase().includes(q) : false;
      const matchesSource = a.source ? a.source.toLowerCase().includes(q) : false;
      if (!matchesName && !matchesCategory && !matchesTags && !matchesAuthor && !matchesSource) {
        return false;
      }
    }
    return true;
  });

  items.sort((a, b) => {
    let diff = 0;
    if (sortBy === "name") {
      diff = a.name.localeCompare(b.name);
    } else {
      diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return sortOrder === "asc" ? -diff : diff;
  });

  const total = items.length;
  const paginated = items.slice(off, off + lim);

  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");

  return res.status(200).json({
    items: paginated,
    total,
    offset: off,
    limit: lim,
    hasMore: off + lim < total,
  });
}
