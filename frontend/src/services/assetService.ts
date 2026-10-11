import {
  Asset,
  AssetFolder,
  AssetFilterParams,
  PaginatedAssets,
  AssetType,
  AssetVisibility,
} from "@/types/asset";
import { storageService } from "./storageService";
import { SEED_PHOTOS } from "@/data/seedPhotos";
import { SEED_VIDEOS } from "@/data/seedVideos";
import { SEED_AUDIO } from "@/data/seedAudio";
import publishedStickersRaw from "@/data/publishedStickers.json";
import { Sticker } from "@/types/sticker";

const UPLOADS_KEY = "user_uploads";
const FOLDERS_KEY = "user_folders";
const RECENTS_KEY = "recent_assets";
const FAVORITES_KEY = "favorite_assets";
const DISABLED_ASSETS_KEY = "disabled_assets";
const REPORTED_ASSETS_KEY = "reported_assets";

// Convert published stickers to Asset shape
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
  visibility: "public" as AssetVisibility,
  createdAt: stk.createdAt || "2026-01-01T00:00:00Z",
  updatedAt: stk.updatedAt || "2026-01-01T00:00:00Z",
  width: stk.width,
  height: stk.height,
  status: "active",
}));

// Base system catalog
const SYSTEM_CATALOG: Asset[] = [
  ...SEED_PHOTOS,
  ...SEED_VIDEOS,
  ...SEED_AUDIO,
  ...STICKER_ASSETS,
];

export const assetService = {
  // ── USER UPLOADS & LOCAL ASSETS ──

  getUploads(): Asset[] {
    return storageService.get<Asset[]>(UPLOADS_KEY) || [];
  },

  saveUploads(uploads: Asset[]): void {
    storageService.set(UPLOADS_KEY, uploads);
  },

  addUpload(asset: Omit<Asset, "id" | "createdAt" | "updatedAt">): Asset {
    const uploads = this.getUploads();
    const newAsset: Asset = {
      ...asset,
      id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active",
    };
    uploads.unshift(newAsset);
    this.saveUploads(uploads);
    this.recordRecent(newAsset.id);
    return newAsset;
  },

  updateAsset(id: string, patch: Partial<Asset>): Asset | null {
    const uploads = this.getUploads();
    const index = uploads.findIndex((a) => a.id === id);
    if (index === -1) return null;
    uploads[index] = {
      ...uploads[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.saveUploads(uploads);
    return uploads[index];
  },

  deleteAsset(id: string): boolean {
    const uploads = this.getUploads();
    const filtered = uploads.filter((a) => a.id !== id);
    if (filtered.length !== uploads.length) {
      this.saveUploads(filtered);
      return true;
    }
    return false;
  },

  duplicateAsset(id: string): Asset | null {
    const uploads = this.getUploads();
    const asset = uploads.find((a) => a.id === id);
    if (!asset) return null;
    const duplicated: Asset = {
      ...asset,
      id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: `${asset.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    uploads.unshift(duplicated);
    this.saveUploads(uploads);
    return duplicated;
  },

  // ── FOLDERS ──

  getFolders(): AssetFolder[] {
    const folders = storageService.get<AssetFolder[]>(FOLDERS_KEY);
    if (folders && folders.length > 0) return folders;
    const defaultFolders: AssetFolder[] = [
      {
        id: "folder-marketing",
        name: "Marketing Campaigns",
        ownerId: "current-user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "folder-social",
        name: "Social Media Posts",
        ownerId: "current-user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "folder-brand",
        name: "Brand Assets",
        ownerId: "current-user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    this.saveFolders(defaultFolders);
    return defaultFolders;
  },

  saveFolders(folders: AssetFolder[]): void {
    storageService.set(FOLDERS_KEY, folders);
  },

  createFolder(name: string, parentId?: string | null): AssetFolder {
    const folders = this.getFolders();
    const newFolder: AssetFolder = {
      id: `fld-${Date.now()}`,
      name: name.trim() || "Untitled Folder",
      ownerId: "current-user",
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    folders.push(newFolder);
    this.saveFolders(folders);
    return newFolder;
  },

  renameFolder(id: string, name: string): boolean {
    const folders = this.getFolders();
    const folder = folders.find((f) => f.id === id);
    if (!folder) return false;
    folder.name = name.trim();
    folder.updatedAt = new Date().toISOString();
    this.saveFolders(folders);
    return true;
  },

  deleteFolder(id: string): boolean {
    const folders = this.getFolders();
    const filtered = folders.filter((f) => f.id !== id);
    if (filtered.length !== folders.length) {
      this.saveFolders(filtered);
      // Move all assets in this folder to root
      const uploads = this.getUploads();
      uploads.forEach((a) => {
        if (a.folderId === id) a.folderId = null;
      });
      this.saveUploads(uploads);
      return true;
    }
    return false;
  },

  moveToFolder(assetId: string, folderId: string | null): boolean {
    return !!this.updateAsset(assetId, { folderId });
  },

  // ── FAVORITES & RECENTS ──

  getFavoriteIds(): string[] {
    return storageService.get<string[]>(FAVORITES_KEY) || [];
  },

  toggleFavorite(assetId: string): boolean {
    const favs = new Set(this.getFavoriteIds());
    let isFav = false;
    if (favs.has(assetId)) {
      favs.delete(assetId);
    } else {
      favs.add(assetId);
      isFav = true;
    }
    storageService.set(FAVORITES_KEY, Array.from(favs));
    return isFav;
  },

  getRecentIds(): string[] {
    return storageService.get<string[]>(RECENTS_KEY) || [];
  },

  recordRecent(assetId: string): void {
    const recents = (this.getRecentIds() || []).filter((id) => id !== assetId);
    recents.unshift(assetId);
    storageService.set(RECENTS_KEY, recents.slice(0, 60));
  },

  // ── ADMIN ACTIONS ──

  getDisabledAssetIds(): string[] {
    return storageService.get<string[]>(DISABLED_ASSETS_KEY) || [];
  },

  getReportedAssetIds(): string[] {
    return storageService.get<string[]>(REPORTED_ASSETS_KEY) || [];
  },

  toggleDisableAsset(id: string): boolean {
    const disabled = new Set(this.getDisabledAssetIds());
    let isDisabled = false;
    if (disabled.has(id)) {
      disabled.delete(id);
    } else {
      disabled.add(id);
      isDisabled = true;
    }
    storageService.set(DISABLED_ASSETS_KEY, Array.from(disabled));
    return isDisabled;
  },

  reportAsset(id: string): void {
    const reported = new Set(this.getReportedAssetIds());
    reported.add(id);
    storageService.set(REPORTED_ASSETS_KEY, Array.from(reported));
  },

  // ── UNIFIED QUERY & FILTERING ──

  queryAssets(params: AssetFilterParams = {}): PaginatedAssets<Asset> {
    const {
      type = "all",
      query = "",
      category = "all",
      folderId,
      visibility = "all",
      favoritesOnly = false,
      recentsOnly = false,
      status = "active",
      ownerId,
      limit = 30,
      offset = 0,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const userUploads = this.getUploads();
    const favIds = new Set(this.getFavoriteIds());
    const recentIds = this.getRecentIds();
    const disabledIds = new Set(this.getDisabledAssetIds());
    const reportedIds = new Set(this.getReportedAssetIds());

    // Combine all assets
    const allCombined: Asset[] = [...userUploads, ...SYSTEM_CATALOG].map((a) => {
      const isFav = favIds.has(a.id);
      const isDis = disabledIds.has(a.id);
      const isRep = reportedIds.has(a.id);
      return {
        ...a,
        isFavorite: isFav,
        status: isDis ? "disabled" : isRep ? "reported" : (a.status || "active"),
      };
    });

    const q = query.trim().toLowerCase();
    const cat = category.toLowerCase();

    let filtered = allCombined.filter((a) => {
      // Admin disabled filter: non-admins only see active
      if (status !== "all" && a.status !== status) return false;

      // Type filter
      if (type !== "all" && a.type !== type) return false;

      // Category filter
      if (cat !== "all" && a.category.toLowerCase() !== cat) return false;

      // Visibility & ownership permissions
      if (visibility !== "all" && a.visibility !== visibility) return false;
      if (ownerId && a.ownerId !== ownerId && a.visibility === "private") return false;

      // Folder filter (only relevant for user uploads)
      if (folderId !== undefined) {
        if (folderId === null) {
          if (a.folderId) return false;
        } else if (a.folderId !== folderId) {
          return false;
        }
      }

      // Favorites filter
      if (favoritesOnly && !favIds.has(a.id)) return false;

      // Search query match (tags, name, author, category, source)
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

    // Handle recents ordering
    if (recentsOnly) {
      const recentOrderMap = new Map(recentIds.map((id, index) => [id, index]));
      filtered = filtered
        .filter((a) => recentOrderMap.has(a.id))
        .sort((a, b) => (recentOrderMap.get(a.id)! - recentOrderMap.get(b.id)!));
    } else {
      // Regular sorting
      filtered.sort((a, b) => {
        let diff = 0;
        if (sortBy === "name") {
          diff = a.name.localeCompare(b.name);
        } else if (sortBy === "fileSize") {
          diff = (a.fileSize || 0) - (b.fileSize || 0);
        } else {
          diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return sortOrder === "asc" ? -diff : diff;
      });
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      items: paginated,
      total,
      offset,
      limit,
      hasMore: offset + limit < total,
    };
  },
};
