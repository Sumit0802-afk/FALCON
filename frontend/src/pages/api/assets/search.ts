import type { NextApiRequest, NextApiResponse } from "next";
import { SEED_PHOTOS } from "@/data/seedPhotos";
import { SEED_VIDEOS } from "@/data/seedVideos";
import { SEED_AUDIO } from "@/data/seedAudio";
import publishedStickersRaw from "@/data/publishedStickers.json";
import { BACKGROUNDS_DATA } from "@/data/backgrounds";
import { FALCON_TEMPLATES } from "@/data/templates";
import { Asset, AssetType } from "@/types/asset";
import { Sticker } from "@/types/sticker";

export interface UnifiedSearchResult {
  query: string;
  totalMatches: number;
  groups: {
    templates: { total: number; items: any[] };
    photos: { total: number; items: Asset[] };
    videos: { total: number; items: Asset[] };
    audio: { total: number; items: Asset[] };
    stickers: { total: number; items: Asset[] };
    backgrounds: { total: number; items: any[] };
  };
}

const STICKERS: Asset[] = (publishedStickersRaw as Sticker[]).map((stk) => ({
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

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<UnifiedSearchResult | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { q = "", groupLimit = "12" } = req.query;
  const query = String(q).trim().toLowerCase();
  const limit = Math.min(parseInt(String(groupLimit), 10) || 12, 50);

  if (!query) {
    return res.status(200).json({
      query: "",
      totalMatches: 0,
      groups: {
        templates: { total: FALCON_TEMPLATES.length, items: FALCON_TEMPLATES.slice(0, limit) },
        photos: { total: SEED_PHOTOS.length, items: SEED_PHOTOS.slice(0, limit) },
        videos: { total: SEED_VIDEOS.length, items: SEED_VIDEOS.slice(0, limit) },
        audio: { total: SEED_AUDIO.length, items: SEED_AUDIO.slice(0, limit) },
        stickers: { total: STICKERS.length, items: STICKERS.slice(0, limit) },
        backgrounds: { total: BACKGROUNDS_DATA.length, items: BACKGROUNDS_DATA.slice(0, limit) },
      },
    });
  }

  // 1. Templates match
  const matchedTemplates = FALCON_TEMPLATES.filter((tpl) => {
    return (
      tpl.name.toLowerCase().includes(query) ||
      tpl.category.toLowerCase().includes(query) ||
      tpl.description.toLowerCase().includes(query)
    );
  });

  // 2. Photos match
  const matchedPhotos = SEED_PHOTOS.filter((photo) => {
    return (
      photo.name.toLowerCase().includes(query) ||
      photo.category.toLowerCase().includes(query) ||
      photo.tags.some((t) => t.toLowerCase().includes(query)) ||
      (photo.author && photo.author.toLowerCase().includes(query))
    );
  });

  // 3. Videos match
  const matchedVideos = SEED_VIDEOS.filter((video) => {
    return (
      video.name.toLowerCase().includes(query) ||
      video.category.toLowerCase().includes(query) ||
      video.tags.some((t) => t.toLowerCase().includes(query)) ||
      (video.author && video.author.toLowerCase().includes(query))
    );
  });

  // 4. Audio match
  const matchedAudio = SEED_AUDIO.filter((audio) => {
    return (
      audio.name.toLowerCase().includes(query) ||
      audio.category.toLowerCase().includes(query) ||
      audio.tags.some((t) => t.toLowerCase().includes(query)) ||
      (audio.author && audio.author.toLowerCase().includes(query))
    );
  });

  // 5. Stickers match
  const matchedStickers = STICKERS.filter((sticker) => {
    return (
      sticker.name.toLowerCase().includes(query) ||
      sticker.category.toLowerCase().includes(query) ||
      sticker.tags.some((t) => t.toLowerCase().includes(query)) ||
      (sticker.author && sticker.author.toLowerCase().includes(query))
    );
  });

  // 6. Backgrounds match
  const matchedBackgrounds = BACKGROUNDS_DATA.filter((bg) => {
    return (
      bg.name.toLowerCase().includes(query) ||
      bg.category.toLowerCase().includes(query) ||
      bg.tags.some((t) => t.toLowerCase().includes(query))
    );
  });

  const totalMatches =
    matchedTemplates.length +
    matchedPhotos.length +
    matchedVideos.length +
    matchedAudio.length +
    matchedStickers.length +
    matchedBackgrounds.length;

  res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=120");

  return res.status(200).json({
    query,
    totalMatches,
    groups: {
      templates: { total: matchedTemplates.length, items: matchedTemplates.slice(0, limit) },
      photos: { total: matchedPhotos.length, items: matchedPhotos.slice(0, limit) },
      videos: { total: matchedVideos.length, items: matchedVideos.slice(0, limit) },
      audio: { total: matchedAudio.length, items: matchedAudio.slice(0, limit) },
      stickers: { total: matchedStickers.length, items: matchedStickers.slice(0, limit) },
      backgrounds: { total: matchedBackgrounds.length, items: matchedBackgrounds.slice(0, limit) },
    },
  });
}
