// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Design Editor – Production Sticker Library Panel
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  X,
  Smile,
  ChevronDown,
  Heart,
  MoreHorizontal,
  Clock,
  Plus,
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { Sticker, StickerCategory } from "@/types/sticker";
import { stickerService } from "@/services/stickerService";
import { STICKER_CATEGORIES } from "@/data/seedStickers";
import { StickerAdminModal } from "./StickerAdminModal";

interface StickersPanelProps {
  onAddSticker: (sticker: Sticker) => void;
}

const PAGE_SIZE = 36;

export function StickersPanel({ onAddSticker }: StickersPanelProps) {
  // Query & filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Data states
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Favorites & recents
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentStickers, setRecentStickers] = useState<Sticker[]>([]);

  // Card interaction states
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeInfoSticker, setActiveInfoSticker] = useState<Sticker | null>(null);
  const [activeMenuStickerId, setActiveMenuStickerId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Admin modal
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);

  // ─── Debounce Search (300ms) ───────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ─── Fetch Favorites & Recents on mount ────────────────────────────────────
  const refreshUserCollections = useCallback(async () => {
    const favs = await stickerService.getFavorites();
    const recs = await stickerService.getRecentlyUsed(12);
    setFavorites(favs);
    setRecentStickers(recs);
  }, []);

  useEffect(() => {
    refreshUserCollections();
  }, [refreshUserCollections]);

  // ─── Fetch Stickers (Initial or filter changed) ─────────────────────────────
  const fetchStickers = useCallback(
    async (resetOffset = true) => {
      const currentOffset = resetOffset ? 0 : offset;
      if (resetOffset) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const res = await stickerService.getStickers({
          query: debouncedQuery,
          category: activeCategory,
          favoritesOnly,
          limit: PAGE_SIZE,
          offset: currentOffset,
          status: "published",
        });

        if (resetOffset) {
          setStickers(res.items);
          setOffset(res.items.length);
          if (scrollRef.current) scrollRef.current.scrollTop = 0;
        } else {
          setStickers((prev) => [...prev, ...res.items]);
          setOffset((prev) => prev + res.items.length);
        }

        setTotal(res.total);
        setHasMore(res.hasMore);
      } catch (err: any) {
        setError(err.message || "Failed to load stickers. Please try again.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [debouncedQuery, activeCategory, favoritesOnly, offset]
  );

  // Trigger fetch when search or category changes
  useEffect(() => {
    fetchStickers(true);
  }, [debouncedQuery, activeCategory, favoritesOnly]);

  // ─── Infinite Scroll Handler ───────────────────────────────────────────────
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      !isLoading &&
      !isLoadingMore &&
      hasMore &&
      scrollTop + clientHeight >= scrollHeight - 350
    ) {
      fetchStickers(false);
    }
  };

  // ─── Add Sticker to Canvas ────────────────────────────────────────────────
  const handleSelectSticker = async (sticker: Sticker) => {
    onAddSticker(sticker);
    await stickerService.addRecentlyUsed(sticker);
    await refreshUserCollections();
  };

  // ─── Toggle Favorite ──────────────────────────────────────────────────────
  const handleToggleFavorite = async (stickerId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await stickerService.toggleFavorite(stickerId);
    await refreshUserCollections();
  };

  // ─── Copy Asset SVG/URL ───────────────────────────────────────────────────
  const handleCopyAsset = (sticker: Sticker, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sticker.fileUrl);
      setCopiedId(sticker.id);
      setTimeout(() => setCopiedId(null), 1800);
      setActiveMenuStickerId(null);
    }
  };

  // ─── Category Scroll Navigation ───────────────────────────────────────────
  const scrollCategoryPills = (dir: "left" | "right") => {
    if (pillsRef.current) {
      const delta = dir === "left" ? -180 : 180;
      pillsRef.current.scrollBy({ left: delta, behavior: "smooth" });
    }
  };

  const activeCategoryLabel =
    STICKER_CATEGORIES.find((c) => c.id === activeCategory)?.label ?? "All";

  return (
    <>
      <aside className="flex h-full w-[360px] shrink-0 flex-col border-r border-white/[0.08] bg-[#0c0c0e] text-white select-none overflow-hidden font-sans">
        {/* ═══════════════════════════════════════════════════════
            HEADER & SEARCH SECTION
        ═══════════════════════════════════════════════════════ */}
        <div className="border-b border-white/[0.08] bg-[#111115] px-4 pt-3.5 pb-2.5 shrink-0">
          {/* Top Title Row with Admin Trigger */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/25 shadow-[0_0_12px_rgba(6,182,212,0.18)]">
                <Smile size={17} className="text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xs font-semibold tracking-wide text-white leading-tight">
                  Sticker Library
                </h2>
                <p className="text-[10px] text-zinc-400">
                  Scalable vector & transparent stickers
                </p>
              </div>
            </div>

            {/* Admin Pipeline Action */}
            <button
              type="button"
              onClick={() => setIsAdminModalOpen(true)}
              className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-zinc-300 hover:border-cyan-500/40 hover:text-cyan-300 hover:bg-cyan-500/[0.08] transition shadow"
              title="Admin Ingestion & License Management"
            >
              <ShieldCheck size={12} className="text-cyan-400" />
              <span>Admin</span>
            </button>
          </div>

          {/* Search Bar (Real Debounced Search) */}
          <div className="relative mb-2.5">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stickers..."
              className="w-full rounded-xl border border-white/[0.08] bg-[#16171b] py-2 pl-8 pr-7 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-cyan-500/60 focus:bg-[#191b22] focus:shadow-[0_0_0_3px_rgba(6,182,212,0.08)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Category Dropdown & Quick Filters Row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Categories
              </span>
              {favoritesOnly && (
                <span className="rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 px-1.5 py-0.2 text-[9px] font-semibold">
                  Favorites Only
                </span>
              )}
            </div>

            {/* Category Dropdown Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCatMenu((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#16171b] px-2 py-0.5 text-[11px] text-zinc-300 hover:border-cyan-500/40 hover:text-white transition"
              >
                <span className="max-w-[90px] truncate">{activeCategoryLabel}</span>
                <ChevronDown size={11} className="text-zinc-400" />
              </button>

              {showCatMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowCatMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 z-50 w-52 max-h-64 overflow-y-auto rounded-xl border border-white/[0.1] bg-[#181920] py-1.5 shadow-2xl backdrop-blur-xl">
                    {STICKER_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setFavoritesOnly(false);
                          setShowCatMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs transition ${
                          activeCategory === cat.id && !favoritesOnly
                            ? "text-cyan-300 bg-cyan-500/10 font-semibold"
                            : "text-zinc-300 hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        <span className="text-sm">{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Category Pill Bar - ALL DIRECTLY VISIBLE */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {/* Favorites Pill */}
            <button
              type="button"
              onClick={() => {
                setFavoritesOnly((v) => !v);
                if (!favoritesOnly) setActiveCategory("all");
              }}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                favoritesOnly
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.25)]"
                  : "bg-white/[0.04] text-zinc-400 border border-transparent hover:bg-white/[0.08] hover:text-zinc-200"
              }`}
            >
              <Heart size={11} fill={favoritesOnly ? "#f43f5e" : "none"} />
              <span>Favorites</span>
            </button>

            {STICKER_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setFavoritesOnly(false);
                }}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                  activeCategory === cat.id && !favoritesOnly
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/35 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
                    : "bg-white/[0.04] text-zinc-400 border border-transparent hover:bg-white/[0.08] hover:text-zinc-200"
                }`}
              >
                <span className="text-[11px] leading-none">{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            STICKER GRID CONTENT & SCROLL AREA
        ═══════════════════════════════════════════════════════ */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-3 py-2.5"
        >
          {/* RECENTLY USED SECTION (Shown on All view when no search query) */}
          {activeCategory === "all" && !debouncedQuery && !favoritesOnly && recentStickers.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <Clock size={11} className="text-cyan-400" />
                  Recently Used
                </span>
                <span className="text-[9px] text-zinc-500">Quick Access</span>
              </div>
              <div
                className="flex gap-2 overflow-x-auto pb-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {recentStickers.map((sticker) => (
                  <div
                    key={`rec-${sticker.id}`}
                    onClick={() => handleSelectSticker(sticker)}
                    title={`Add "${sticker.name}" to canvas`}
                    className="group relative flex h-16 w-16 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#14151b] p-1.5 transition-all hover:border-cyan-500/50 hover:bg-[#1a1c24] hover:shadow-[0_0_12px_rgba(6,182,212,0.18)]"
                  >
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:6px_6px]">
                      <img
                        src={sticker.fileUrl}
                        alt={sticker.name}
                        className="h-9 w-9 object-contain transition-transform group-hover:scale-110"
                        draggable={false}
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={15} className="text-cyan-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter Status Bar */}
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[10px] font-medium text-zinc-400">
              {favoritesOnly ? "Favorite Stickers" : activeCategoryLabel}
              {debouncedQuery && ` matching "${debouncedQuery}"`}
            </span>
            {(debouncedQuery || activeCategory !== "all" || favoritesOnly) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                  setFavoritesOnly(false);
                }}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline transition"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* ERROR STATE */}
          {error && (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 mb-2">
                <RotateCcw size={18} />
              </div>
              <p className="text-xs font-semibold text-rose-300 mb-1">Failed to load stickers</p>
              <p className="text-[10px] text-zinc-500 max-w-[220px] mb-3">{error}</p>
              <button
                type="button"
                onClick={() => fetchStickers(true)}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-[#16171f] px-3 py-1.5 text-xs text-white hover:bg-white/[0.08] transition"
              >
                <RotateCcw size={12} />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* LOADING SKELETON */}
          {isLoading && !error && (
            <div className="grid grid-cols-3 gap-2 pb-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-28 flex-col items-center justify-center rounded-xl border border-white/[0.05] bg-[#13141a] p-2.5 animate-pulse"
                >
                  <div className="h-14 w-14 rounded-lg bg-white/[0.04] mb-2" />
                  <div className="h-2 w-16 rounded bg-white/[0.06]" />
                </div>
              ))}
            </div>
          )}

          {/* EMPTY STATE */}
          {!isLoading && !error && stickers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-3">
                <Smile size={22} className="text-zinc-600" />
              </div>
              <p className="text-xs font-semibold text-zinc-300 mb-1">
                {favoritesOnly ? "No favorite stickers yet" : "No matching stickers found"}
              </p>
              <p className="text-[10px] text-zinc-500 max-w-[210px] mb-3">
                {favoritesOnly
                  ? "Click the heart icon on any sticker to save it here for fast access."
                  : "Try searching with broader terms or choose another category."}
              </p>
              {(debouncedQuery || activeCategory !== "all" || favoritesOnly) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                    setFavoritesOnly(false);
                  }}
                  className="rounded-lg border border-white/[0.1] bg-[#16171f] px-3 py-1 text-xs text-cyan-400 hover:text-white transition"
                >
                  View All Stickers
                </button>
              )}
            </div>
          )}

          {/* RESPONSIVE STICKER GRID */}
          {!isLoading && !error && stickers.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-2 pb-4">
                {stickers.map((sticker) => {
                  const isHovered = hoveredId === sticker.id;
                  const isFav = favorites.includes(sticker.id);

                  return (
                    <div
                      key={sticker.id}
                      onMouseEnter={() => setHoveredId(sticker.id)}
                      onMouseLeave={() => {
                        setHoveredId(null);
                        if (activeMenuStickerId === sticker.id) {
                          setActiveMenuStickerId(null);
                        }
                      }}
                      onClick={() => handleSelectSticker(sticker)}
                      className={`group relative flex flex-col items-center justify-between rounded-xl border p-2 text-center transition-all duration-200 cursor-pointer ${
                        isHovered
                          ? "border-cyan-500/50 bg-[#161822] shadow-[0_0_16px_rgba(6,182,212,0.18)]"
                          : "border-white/[0.06] bg-[#14151b] hover:border-cyan-500/30"
                      }`}
                    >
                      {/* Top Action Icons: Favorite & More Options */}
                      <div
                        className={`absolute top-1.5 inset-x-1.5 flex items-center justify-between z-20 transition-opacity duration-150 ${
                          isHovered || isFav ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                      >
                        {/* More Menu / Info Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuStickerId((prev) =>
                              prev === sticker.id ? null : sticker.id
                            );
                          }}
                          className="flex h-5 w-5 items-center justify-center rounded-md bg-[#181a24]/90 text-zinc-400 hover:text-white hover:bg-black/60 border border-white/[0.08] transition shadow"
                          title="Sticker Info & Options"
                        >
                          <MoreHorizontal size={11} />
                        </button>

                        {/* Favorite Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleFavorite(sticker.id, e)}
                          className={`flex h-5 w-5 items-center justify-center rounded-md border transition shadow ${
                            isFav
                              ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                              : "bg-[#181a24]/90 text-zinc-400 hover:text-rose-400 hover:bg-black/60 border-white/[0.08]"
                          }`}
                          title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                        >
                          <Heart size={11} fill={isFav ? "#f43f5e" : "none"} />
                        </button>
                      </div>

                      {/* Popover Menu for License / Attribution / Copy */}
                      {activeMenuStickerId === sticker.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute left-1 top-8 z-30 w-44 rounded-xl border border-white/[0.12] bg-[#1a1b24] p-1.5 shadow-2xl backdrop-blur-xl text-left"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              handleSelectSticker(sticker);
                              setActiveMenuStickerId(null);
                            }}
                            className="w-full flex items-center gap-1.5 px-2 py-1 text-[10px] text-zinc-200 hover:bg-white/[0.08] hover:text-white rounded-md transition"
                          >
                            <Plus size={11} className="text-cyan-400" />
                            <span>Add to canvas</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveInfoSticker(sticker);
                              setActiveMenuStickerId(null);
                            }}
                            className="w-full flex items-center gap-1.5 px-2 py-1 text-[10px] text-zinc-200 hover:bg-white/[0.08] hover:text-white rounded-md transition"
                          >
                            <Info size={11} className="text-zinc-400" />
                            <span>License & Source Info</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleCopyAsset(sticker, e)}
                            className="w-full flex items-center gap-1.5 px-2 py-1 text-[10px] text-zinc-200 hover:bg-white/[0.08] hover:text-white rounded-md transition"
                          >
                            {copiedId === sticker.id ? (
                              <>
                                <Check size={11} className="text-emerald-400" />
                                <span className="text-emerald-400">Copied URL</span>
                              </>
                            ) : (
                              <>
                                <Copy size={11} className="text-zinc-400" />
                                <span>Copy Asset URL</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Large Thumbnail Preview with Contrasting Surface */}
                      <div className="relative flex h-16 w-16 items-center justify-center my-1 rounded-xl bg-[#09090c] border border-white/[0.04] bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:6px_6px]">
                        {isHovered && (
                          <div className="absolute inset-0 rounded-xl bg-cyan-500/10 blur-sm pointer-events-none" />
                        )}
                        <img
                          src={sticker.fileUrl}
                          alt={sticker.name}
                          className={`relative h-13 w-13 object-contain transition-transform duration-200 ${
                            isHovered ? "scale-110 drop-shadow-md" : "scale-100"
                          }`}
                          draggable={false}
                        />
                      </div>

                      {/* Title */}
                      <span
                        className={`line-clamp-1 text-[9px] font-medium tracking-tight transition-colors w-full px-1 ${
                          isHovered ? "text-cyan-300" : "text-zinc-400 group-hover:text-zinc-200"
                        }`}
                      >
                        {sticker.name}
                      </span>

                      {/* Hover '+ Add' Action */}
                      {isHovered && (
                        <div className="absolute inset-x-2 bottom-1.5 flex items-center justify-center z-10 pointer-events-none">
                          <span className="rounded-full bg-cyan-500 px-2 py-0.5 text-[8px] font-bold text-white shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                            + Add
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Infinite Scroll Indicator / Trigger */}
              {hasMore && (
                <div className="flex justify-center py-2.5">
                  <button
                    type="button"
                    disabled={isLoadingMore}
                    onClick={() => fetchStickers(false)}
                    className="flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-[#14151b] px-4 py-1.5 text-[11px] font-medium text-cyan-400 hover:border-cyan-500/50 hover:bg-[#1a1c26] transition shadow"
                  >
                    <Sparkles size={12} className={isLoadingMore ? "animate-spin" : ""} />
                    <span>{isLoadingMore ? "Loading more stickers..." : "Load more stickers"}</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      {/* License & Attribution Info Modal */}
      {activeInfoSticker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-white">
          <div className="w-full max-w-sm rounded-2xl border border-white/[0.1] bg-[#14151c] p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-cyan-400" />
                <h3 className="text-xs font-semibold text-white">Sticker Details & License</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveInfoSticker(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Name</span>
                <span className="text-zinc-200">{activeInfoSticker.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Category</span>
                  <span className="text-zinc-200 capitalize">{activeInfoSticker.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Format</span>
                  <span className="text-zinc-200 uppercase">{activeInfoSticker.format}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-semibold">License</span>
                <span className="text-emerald-400 font-medium">{activeInfoSticker.license}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Author / Contributor</span>
                <span className="text-zinc-200">{activeInfoSticker.author}</span>
              </div>
              {activeInfoSticker.source && (
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Source</span>
                  <span className="text-zinc-300">{activeInfoSticker.source}</span>
                </div>
              )}
              {activeInfoSticker.attributionRequired && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] text-amber-300">
                  Note: Creator attribution is required when distributing designs using this sticker.
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveInfoSticker(null)}
                className="rounded-xl bg-white/[0.08] px-4 py-1.5 text-xs text-white hover:bg-white/[0.12] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Sticker Pipeline Modal */}
      <StickerAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onStickersChanged={() => {
          fetchStickers(true);
          refreshUserCollections();
        }}
      />
    </>
  );
}
