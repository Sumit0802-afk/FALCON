import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Image as ImageIcon,
  Search,
  X,
  Info,
  ExternalLink,
  Plus,
  Heart,
  Check,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { Asset } from "@/types/asset";
import { PHOTO_CATEGORIES, SEED_PHOTOS } from "@/data/seedPhotos";
import { assetService } from "@/services/assetService";

interface PhotosPanelProps {
  onAddImageToCanvas: (src: string, name?: string) => void;
}

const PAGE_SIZE = 40;

export function PhotosPanel({ onAddImageToCanvas }: PhotosPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedPhotoForInfo, setSelectedPhotoForInfo] = useState<Asset | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset pagination when filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, activeCategory]);

  // Sync favorites
  useEffect(() => {
    setFavorites(assetService.getFavoriteIds());
  }, []);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    assetService.toggleFavorite(id);
    setFavorites(assetService.getFavoriteIds());
  };

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    let list = SEED_PHOTOS;

    if (activeCategory !== "all") {
      list = list.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          (p.author && p.author.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeCategory, searchQuery]);

  // Visible slice
  const visiblePhotos = useMemo(
    () => filteredPhotos.slice(0, visibleCount),
    [filteredPhotos, visibleCount]
  );

  const hasMore = visibleCount < filteredPhotos.length;

  const handleAdd = useCallback(
    (photo: Asset) => {
      assetService.recordRecent(photo.id);
      onAddImageToCanvas(photo.fileUrl, photo.name);
    },
    [onAddImageToCanvas]
  );

  const copyAttribution = (photo: Asset) => {
    const text = `Photo by ${photo.author || "Unknown"} on ${photo.source} (${photo.sourceUrl || ""})`;
    navigator.clipboard.writeText(text);
    setCopiedId(photo.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-r border-white/[0.08] bg-[#0c0c0e] text-white select-none relative">
      {/* HEADER */}
      <div className="border-b border-white/[0.08] bg-[#111114] p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ImageIcon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-semibold tracking-wide text-white">Photos</h2>
                <span className="flex items-center gap-0.5 rounded-full bg-cyan-500/15 px-2 py-0.5 text-[9px] font-medium text-cyan-300">
                  <ShieldCheck size={10} />
                  <span>Free Commercial Use</span>
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">
                High-res royalty-free photos
              </p>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search photos..."
            className="w-full rounded-lg border border-white/[0.08] bg-[#16171b] py-1.5 pl-9 pr-8 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-cyan-500/60 focus:bg-[#1a1b22]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* CATEGORY TABS - ALL DIRECTLY VISIBLE */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {PHOTO_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                activeCategory === cat.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* PHOTO GRID */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-zinc-800">
        <div className="flex items-center justify-between mb-2 text-[11px] text-zinc-400">
          <span>Curated Photos</span>
          <span className="text-[10px] text-cyan-400 font-medium">Commercial License</span>
        </div>

        {filteredPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] p-8 text-center mt-6">
            <ImageIcon size={32} className="text-zinc-600 mb-2" />
            <p className="text-xs font-semibold text-zinc-300">No photos found</p>
            <p className="text-[10px] text-zinc-500 mt-1">Try another category or search term.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              {visiblePhotos.map((photo) => {
                const isFav = favorites.includes(photo.id);

                return (
                  <div
                    key={photo.id}
                    className="group relative flex flex-col overflow-hidden rounded-lg border border-white/[0.08] bg-[#14151a] transition hover:border-cyan-500/50 hover:shadow-lg"
                  >
                    {/* Photo Thumbnail */}
                    <div
                      onClick={() => handleAdd(photo)}
                      className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-black/40"
                    >
                      <img
                        src={photo.thumbnailUrl || photo.fileUrl}
                        alt={photo.name}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.fallback) {
                            target.dataset.fallback = "true";
                            target.src = `https://picsum.photos/seed/${photo.id}/400/300`;
                          }
                        }}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      {/* Quick Add overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-slate-950 shadow-md">
                          <Plus size={16} strokeWidth={2.5} />
                        </div>
                      </div>

                      {/* Top right buttons */}
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-20">
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(e, photo.id)}
                          className={`flex h-6 w-6 items-center justify-center rounded-full backdrop-blur-md transition ${
                            isFav
                              ? "bg-rose-500 text-white"
                              : "bg-black/60 text-white/70 opacity-0 group-hover:opacity-100 hover:text-white"
                          }`}
                          title="Favorite"
                        >
                          <Heart size={11} fill={isFav ? "currentColor" : "none"} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPhotoForInfo(photo);
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/70 opacity-0 group-hover:opacity-100 hover:text-white backdrop-blur-md transition"
                          title="View licensing & attribution"
                        >
                          <Info size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Photo title & author bar */}
                    <div className="p-1.5 bg-[#111216] flex items-center justify-between text-[10px]">
                      <span className="truncate text-zinc-300 font-medium" title={photo.name}>
                        {photo.author || photo.name}
                      </span>
                      <span className="text-[9px] text-cyan-400 font-mono shrink-0">
                        {photo.source}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* LOAD MORE */}
            {hasMore && (
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 text-xs text-zinc-400 hover:bg-white/[0.06] hover:text-white transition"
              >
                <ChevronDown size={14} />
                Load more photos
              </button>
            )}

            {!hasMore && filteredPhotos.length > PAGE_SIZE && (
              <p className="mt-4 text-center text-[10px] text-zinc-600">
                All photos loaded
              </p>
            )}
          </>
        )}
      </div>

      {/* LICENSING & ATTRIBUTION MODAL */}
      {selectedPhotoForInfo && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full rounded-xl border border-white/[0.1] bg-[#16171e] p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-cyan-400" />
                <h4 className="text-xs font-semibold text-white">License & Attribution</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhotoForInfo(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2 text-[11px] text-zinc-300">
              <div className="rounded-lg bg-black/40 p-2.5 border border-white/[0.06] space-y-1">
                <div className="text-white font-medium truncate">{selectedPhotoForInfo.name}</div>
                <div className="flex items-center justify-between text-zinc-400 text-[10px]">
                  <span>Author: {selectedPhotoForInfo.author || "Unknown"}</span>
                  <span>Source: {selectedPhotoForInfo.source}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase font-semibold text-zinc-400">License Terms:</div>
                <div className="rounded bg-cyan-950/30 border border-cyan-500/20 px-2 py-1.5 text-cyan-300 text-[10px]">
                  {selectedPhotoForInfo.license}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                <span>Attribution required:</span>
                <span
                  className={
                    selectedPhotoForInfo.attributionRequired
                      ? "text-amber-400"
                      : "text-emerald-400 font-semibold"
                  }
                >
                  {selectedPhotoForInfo.attributionRequired ? "Yes" : "No (Free to use)"}
                </span>
              </div>

              {selectedPhotoForInfo.sourceUrl && (
                <a
                  href={selectedPhotoForInfo.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[10px] text-cyan-400 hover:underline pt-1"
                >
                  <ExternalLink size={11} />
                  <span>View original source on {selectedPhotoForInfo.source}</span>
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => copyAttribution(selectedPhotoForInfo)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] py-1.5 text-xs text-zinc-300 hover:bg-white/[0.08]"
              >
                {copiedId === selectedPhotoForInfo.id ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <span>Copy Attribution</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAdd(selectedPhotoForInfo);
                  setSelectedPhotoForInfo(null);
                }}
                className="flex-1 rounded-lg bg-cyan-500 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
              >
                Add to Canvas
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
