export type AssetType =
  | "image"
  | "video"
  | "audio"
  | "svg"
  | "gif"
  | "pdf"
  | "template"
  | "background";

export type AssetVisibility = "private" | "team" | "public";

export type AssetStatus = "active" | "disabled" | "reported";

export interface Asset {
  id: string;
  type: AssetType;
  name: string;
  fileUrl: string;
  thumbnailUrl: string;
  source: string;
  sourceUrl?: string;
  author?: string;
  license: string;
  attributionRequired: boolean;
  tags: string[];
  category: string;
  ownerId: string;
  visibility: AssetVisibility;
  createdAt: string;
  updatedAt: string;
  
  // Specific asset attributes
  width?: number;
  height?: number;
  duration?: number; // In seconds (for audio/video)
  fileSize?: number; // In bytes
  mimeType?: string;
  folderId?: string | null;
  isFavorite?: boolean;
  status?: AssetStatus;
  
  // Video / Audio trimming support
  trimStart?: number;
  trimEnd?: number;
  
  // Audio waveform data
  waveform?: number[];
}

export interface AssetFolder {
  id: string;
  name: string;
  ownerId: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrandColor {
  id: string;
  label: string;
  value: string;
  type: "primary" | "secondary" | "accent" | "custom";
}

export interface BrandFont {
  id: string;
  label: string;
  fontFamily: string;
  type: "heading" | "body";
  fontWeight?: number;
}

export interface BrandLogo {
  id: string;
  label: string;
  type: "primary" | "secondary" | "icon";
  fileUrl: string;
  width?: number;
  height?: number;
}

export interface BrandKit {
  id: string;
  name: string;
  colors: BrandColor[];
  fonts: BrandFont[];
  logos: BrandLogo[];
  updatedAt: string;
}

export interface ProjectAudioTrack {
  id: string;
  assetId: string;
  name: string;
  fileUrl: string;
  duration: number;
  volume: number; // 0 to 1
  isPlaying: boolean;
  currentTime: number;
  author?: string;
  license?: string;
}

export interface PaginatedAssets<T = Asset> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface AssetFilterParams {
  type?: AssetType | "all";
  query?: string;
  category?: string;
  folderId?: string | null;
  visibility?: AssetVisibility | "all";
  favoritesOnly?: boolean;
  recentsOnly?: boolean;
  status?: AssetStatus | "all";
  ownerId?: string;
  limit?: number;
  offset?: number;
  sortBy?: "createdAt" | "name" | "fileSize";
  sortOrder?: "asc" | "desc";
}
