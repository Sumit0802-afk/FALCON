// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Design Editor – Production Sticker Service & Repository
// ─────────────────────────────────────────────────────────────────────────────

import {
  Sticker,
  StickerQueryParams,
  PaginatedStickers,
  StickerImportInput,
  BulkImportResult,
  StickerStatus,
} from "@/types/sticker";
import { SEED_DEMO_STICKERS, STICKER_CATEGORIES } from "@/data/seedStickers";
import PUBLISHED_STICKERS_RAW from "@/data/publishedStickers.json";
import { sanitizeSvg, isValidSvg } from "@/utils/svgSanitizer";

const STORAGE_IMPORTED_KEY = "falcon:stickers:imported";
const STORAGE_FAVORITES_KEY = "falcon:stickers:favorites";
const STORAGE_RECENT_KEY = "falcon:stickers:recent";

const ALLOWED_FORMATS = ["svg", "png", "webp"] as const;
const REJECTED_LICENSES = [
  "all rights reserved",
  "copyright",
  "proprietary",
  "non-commercial",
  "noncommercial",
  "nc",
  "personal use only",
  "restricted",
];

export class StickerService {
  private inMemoryCache = new Map<string, { data: PaginatedStickers; timestamp: number }>();
  private cacheTtlMs = 60000; // 1 minute query cache

  // ─── Query / Search Stickers with Pagination ───────────────────────────────
  async getStickers(params: StickerQueryParams = {}): Promise<PaginatedStickers> {
    const {
      query = "",
      category = "all",
      subcategory,
      tag,
      format,
      status = "published",
      limit = 36,
      offset = 0,
      favoritesOnly = false,
      recentOnly = false,
    } = params;

    const cacheKey = JSON.stringify({ query, category, subcategory, tag, format, status, limit, offset, favoritesOnly, recentOnly });
    const cached = this.inMemoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTtlMs) {
      return cached.data;
    }

    // Combine seed demo stickers + locally imported stickers
    const allStickers = this.getAllStoredStickers();

    // Favorites / Recents lookup
    const favorites = await this.getFavorites();
    const recent = await this.getRecentlyUsed();
    const recentIds = new Set(recent.map((s) => s.id));
    const favSet = new Set(favorites);

    // Filter
    const q = query.trim().toLowerCase();

    let matched = allStickers.filter((sticker) => {
      // Status filter: only published stickers shown in editor unless admin specifies
      if (status && sticker.status !== status) {
        return false;
      }

      if (favoritesOnly && !favSet.has(sticker.id)) {
        return false;
      }

      if (recentOnly && !recentIds.has(sticker.id)) {
        return false;
      }

      if (category && category !== "all" && sticker.category.toLowerCase() !== category.toLowerCase()) {
        return false;
      }

      if (subcategory && sticker.subcategory?.toLowerCase() !== subcategory.toLowerCase()) {
        return false;
      }

      if (tag && !sticker.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
        return false;
      }

      if (format && sticker.format !== format) {
        return false;
      }

      if (q) {
        const matchesName = sticker.name.toLowerCase().includes(q);
        const matchesCategory = sticker.category.toLowerCase().includes(q);
        const matchesSubcategory = sticker.subcategory?.toLowerCase().includes(q) ?? false;
        const matchesTags = sticker.tags.some((t) => t.toLowerCase().includes(q));
        const matchesAuthor = sticker.author.toLowerCase().includes(q);

        if (!matchesName && !matchesCategory && !matchesSubcategory && !matchesTags && !matchesAuthor) {
          return false;
        }
      }

      return true;
    });

    const total = matched.length;
    const paginatedItems = matched.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    const result: PaginatedStickers = {
      items: paginatedItems,
      total,
      offset,
      limit,
      hasMore,
    };

    this.inMemoryCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  // ─── Single Sticker Retrieval ──────────────────────────────────────────────
  async getStickerById(id: string): Promise<Sticker | null> {
    const all = this.getAllStoredStickers();
    return all.find((s) => s.id === id) ?? null;
  }

  // ─── Favorites Management ──────────────────────────────────────────────────
  async getFavorites(): Promise<string[]> {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_FAVORITES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async toggleFavorite(stickerId: string): Promise<boolean> {
    const current = await this.getFavorites();
    const isFav = current.includes(stickerId);
    const next = isFav ? current.filter((id) => id !== stickerId) : [stickerId, ...current];

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(next));
      } catch {}
    }

    this.invalidateCache();
    return !isFav;
  }

  // ─── Recently Used Management ──────────────────────────────────────────────
  async getRecentlyUsed(limit = 12): Promise<Sticker[]> {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_RECENT_KEY);
      const recentIds: string[] = raw ? JSON.parse(raw) : [];
      const all = this.getAllStoredStickers();

      const stickersMap = new Map(all.map((s) => [s.id, s]));
      const recentStickers: Sticker[] = [];

      for (const id of recentIds) {
        const item = stickersMap.get(id);
        if (item && item.status === "published") {
          recentStickers.push(item);
        }
      }

      return recentStickers.slice(0, limit);
    } catch {
      return [];
    }
  }

  async addRecentlyUsed(sticker: Sticker): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_RECENT_KEY);
      const current: string[] = raw ? JSON.parse(raw) : [];
      const updated = [sticker.id, ...current.filter((id) => id !== sticker.id)].slice(0, 20);
      localStorage.setItem(STORAGE_RECENT_KEY, JSON.stringify(updated));
    } catch {}
    this.invalidateCache();
  }

  // ─── Import Validation & Ingestion Pipeline ────────────────────────────────
  async importSticker(input: StickerImportInput): Promise<Sticker> {
    // 1. Validation
    if (!input.name || !input.name.trim()) {
      throw new Error("Sticker name is required.");
    }
    if (!input.category || !input.category.trim()) {
      throw new Error("Sticker category is required.");
    }
    if (!input.license || !input.license.trim()) {
      throw new Error("License information is required for legal redistribution.");
    }

    // 2. License rejection check
    const lic = input.license.toLowerCase();
    for (const forbidden of REJECTED_LICENSES) {
      if (lic.includes(forbidden)) {
        throw new Error(
          `Asset rejected: license '${input.license}' prohibits redistribution or commercial design use.`
        );
      }
    }

    // 3. Format detection and SVG sanitization
    let format = input.format ?? "svg";
    let fileUrl = input.fileUrl;
    let width = input.width ?? 200;
    let height = input.height ?? 200;

    if (input.svgContent) {
      const sanitized = sanitizeSvg(input.svgContent);
      if (!isValidSvg(sanitized)) {
        throw new Error("Invalid or unparseable SVG content.");
      }
      fileUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sanitized)}`;
      format = "svg";
    } else if (fileUrl.startsWith("data:image/svg+xml")) {
      const decoded = decodeURIComponent(fileUrl.split(",")[1] || "");
      const sanitized = sanitizeSvg(decoded);
      fileUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sanitized)}`;
      format = "svg";
    }

    if (!ALLOWED_FORMATS.includes(format as any)) {
      throw new Error(`Unsupported format '${format}'. Allowed formats: SVG, PNG, WebP.`);
    }

    // 4. Duplicate detection
    const existing = this.getAllStoredStickers();
    const isDup = existing.some(
      (s) => s.name.toLowerCase() === input.name.trim().toLowerCase() && s.category === input.category
    );
    if (isDup) {
      throw new Error(`A sticker named '${input.name.trim()}' already exists in category '${input.category}'.`);
    }

    // 5. Normalization
    const tagsArray = Array.isArray(input.tags)
      ? input.tags.map((t) => t.trim().toLowerCase()).filter(Boolean)
      : typeof input.tags === "string"
      ? input.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [];

    const now = new Date().toISOString();
    const newSticker: Sticker = {
      id: `stk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: input.name.trim(),
      fileUrl,
      thumbnailUrl: input.thumbnailUrl || fileUrl,
      format,
      category: input.category.trim().toLowerCase(),
      subcategory: input.subcategory?.trim(),
      tags: tagsArray,
      author: input.author?.trim() || "Independent Contributor",
      source: input.source?.trim() || "Direct Upload",
      sourceUrl: input.sourceUrl?.trim() || "",
      license: input.license.trim(),
      attributionRequired: Boolean(input.attributionRequired),
      width,
      height,
      createdAt: now,
      updatedAt: now,
      status: input.status || "published",
      isDemo: false,
    };

    // 6. Persistence
    this.saveImportedSticker(newSticker);
    this.invalidateCache();

    return newSticker;
  }

  // ─── Bulk Import (CSV / JSON) ──────────────────────────────────────────────
  async bulkImport(items: StickerImportInput[]): Promise<BulkImportResult> {
    const result: BulkImportResult = {
      total: items.length,
      successCount: 0,
      failedCount: 0,
      errors: [],
      imported: [],
    };

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const imported = await this.importSticker(item);
        result.successCount++;
        result.imported.push(imported);
      } catch (err: any) {
        result.failedCount++;
        result.errors.push({
          itemIndex: i,
          name: item.name,
          error: err.message || "Failed to import asset",
        });
      }
    }

    return result;
  }

  // ─── Admin Sticker Management (Update, Status, Delete) ─────────────────────
  async updateSticker(id: string, patch: Partial<Sticker>): Promise<Sticker> {
    const imported = this.getImportedStickers();
    const idx = imported.findIndex((s) => s.id === id);

    if (idx !== -1) {
      const current = imported[idx];
      const updated: Sticker = {
        ...current,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      imported[idx] = updated;
      this.persistImportedStickers(imported);
      this.invalidateCache();
      return updated;
    }

    // If it's a seed demo sticker, we allow overriding status in memory/local
    const demo = SEED_DEMO_STICKERS.find((s) => s.id === id);
    if (demo) {
      const overridden: Sticker = {
        ...demo,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      this.saveImportedSticker(overridden);
      this.invalidateCache();
      return overridden;
    }

    throw new Error(`Sticker with ID '${id}' not found.`);
  }

  async deleteSticker(id: string): Promise<boolean> {
    const imported = this.getImportedStickers();
    const next = imported.filter((s) => s.id !== id);

    if (next.length !== imported.length) {
      this.persistImportedStickers(next);
      this.invalidateCache();
      return true;
    }

    // If it's a demo sticker, mark disabled
    const demo = SEED_DEMO_STICKERS.find((s) => s.id === id);
    if (demo) {
      await this.updateSticker(id, { status: "disabled" });
      return true;
    }

    return false;
  }

  // ─── Internal Storage Helpers ──────────────────────────────────────────────

  // Cast the imported JSON to Sticker[] (resolved via resolveJsonModule in tsconfig)
  private readonly publishedStickers: Sticker[] = PUBLISHED_STICKERS_RAW as Sticker[];

  private getAllStoredStickers(): Sticker[] {
    const imported = this.getImportedStickers();
    const importedIds = new Set(imported.map((s) => s.id));

    // Published catalog from ingestion pipeline (1,098 real assets)
    const publishedIds = new Set(this.publishedStickers.map((s) => s.id));

    // Seed demo stickers not already covered by ingested catalog
    const filteredDemo = SEED_DEMO_STICKERS.filter(
      (s) => !publishedIds.has(s.id) && !importedIds.has(s.id)
    );

    // Published stickers not overridden by user-imported items
    const filteredPublished = this.publishedStickers.filter((s) => !importedIds.has(s.id));

    // Order: locally imported (freshest) → published catalog → demo fallbacks
    return [...imported, ...filteredPublished, ...filteredDemo];
  }

  private getImportedStickers(): Sticker[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_IMPORTED_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveImportedSticker(sticker: Sticker): void {
    const current = this.getImportedStickers();
    const filtered = current.filter((s) => s.id !== sticker.id);
    filtered.unshift(sticker);
    this.persistImportedStickers(filtered);
  }

  private persistImportedStickers(stickers: Sticker[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_IMPORTED_KEY, JSON.stringify(stickers));
    } catch {}
  }

  private invalidateCache(): void {
    this.inMemoryCache.clear();
  }
}

export const stickerService = new StickerService();
