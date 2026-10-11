import type { NextApiRequest, NextApiResponse } from "next";
import { SEED_PHOTOS } from "@/data/seedPhotos";
import { SEED_VIDEOS } from "@/data/seedVideos";
import { SEED_AUDIO } from "@/data/seedAudio";
import publishedStickersRaw from "@/data/publishedStickers.json";
import { Asset, AssetType } from "@/types/asset";
import { Sticker } from "@/types/sticker";

const ALL_ASSETS: Asset[] = [
  ...SEED_PHOTOS,
  ...SEED_VIDEOS,
  ...SEED_AUDIO,
  ...(publishedStickersRaw as Sticker[]).slice(0, 100).map((stk) => ({
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
    visibility: "public" as const,
    createdAt: stk.createdAt || "2026-01-01T00:00:00Z",
    updatedAt: stk.updatedAt || "2026-01-01T00:00:00Z",
    status: "active" as const,
  })),
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { status, type, query } = req.query;
    let list = [...ALL_ASSETS];

    if (type && type !== "all") {
      list = list.filter((a) => a.type === type);
    }

    if (query) {
      const q = String(query).toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q) ||
          a.license.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    // Extract unique sources, licenses, categories, tags
    const sources = Array.from(new Set(ALL_ASSETS.map((a) => a.source)));
    const licenses = Array.from(new Set(ALL_ASSETS.map((a) => a.license)));
    const categories = Array.from(new Set(ALL_ASSETS.map((a) => a.category)));
    const tags = Array.from(new Set(ALL_ASSETS.flatMap((a) => a.tags)));

    return res.status(200).json({
      assets: list.slice(0, 50),
      total: list.length,
      stats: {
        totalAssets: ALL_ASSETS.length,
        sourcesCount: sources.length,
        licensesCount: licenses.length,
        categoriesCount: categories.length,
        tagsCount: tags.length,
      },
      sources,
      licenses,
      categories,
      tags,
    });
  }

  if (req.method === "PATCH") {
    const { assetId, status, license, category, tags } = req.body;
    if (!assetId) {
      return res.status(400).json({ error: "assetId required" });
    }
    return res.status(200).json({
      success: true,
      message: `Asset ${assetId} updated successfully.`,
      updatedFields: { status, license, category, tags },
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
