import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Star,
  Clock,
  Sparkles,
  Type,
  X,
  SlidersHorizontal,
  Check,
  RefreshCw,
} from "lucide-react";
import {
  FontItem,
  FilterCategory,
  fetchAllGoogleFonts,
  filterAndSearchFonts,
  loadGoogleFont,
  loadFontPreview,
  getFavoriteFonts,
  toggleFavoriteFont,
  addRecentFont,
  getRecentFonts,
} from "@/services/fontService";

interface FontsPanelProps {
  currentFontFamily?: string;
  onSelectFont: (fontFamily: string) => void;
  onAddTextWithFont?: (fontFamily: string) => void;
  hasSelectedText?: boolean;
}

const CATEGORY_TABS: { id: FilterCategory; label: string; icon?: React.ReactNode }[] = [
  { id: "all", label: "All" },
  { id: "favorites", label: "Favorites", icon: <Star size={12} className="fill-amber-400 text-amber-400" /> },
  { id: "recent", label: "Recent", icon: <Clock size={12} /> },
  { id: "sans-serif", label: "Sans Serif" },
  { id: "serif", label: "Serif" },
  { id: "display", label: "Display" },
  { id: "handwriting", label: "Handwriting" },
  { id: "monospace", label: "Monospace" },
  { id: "variable", label: "Variable", icon: <Sparkles size={11} className="text-indigo-400" /> },
];

export function FontsPanel({
  currentFontFamily = "Inter",
  onSelectFont,
  onAddTextWithFont,
  hasSelectedText = false,
}: FontsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [catalog, setCatalog] = useState<FontItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const [previewText, setPreviewText] = useState("");
  const [visibleCount, setVisibleCount] = useState(40);

  // Load catalog and initial storage
  useEffect(() => {
    let mounted = true;
    fetchAllGoogleFonts().then((fonts) => {
      if (mounted) {
        setCatalog(fonts);
        setIsLoading(false);
      }
    });
    setFavorites(getFavoriteFonts());
    setRecents(getRecentFonts());
    return () => {
      mounted = false;
    };
  }, []);

  const handleToggleStar = (e: React.MouseEvent, family: string) => {
    e.stopPropagation();
    toggleFavoriteFont(family);
    setFavorites(getFavoriteFonts());
  };

  // Filtered fonts
  const filteredFonts = useMemo(() => {
    return filterAndSearchFonts(searchQuery, activeCategory, catalog);
  }, [searchQuery, activeCategory, catalog, favorites, recents]);

  const displayedFonts = useMemo(() => {
    return filteredFonts.slice(0, visibleCount);
  }, [filteredFonts, visibleCount]);

  // Lazy load previews for visible fonts
  useEffect(() => {
    displayedFonts.forEach((font) => {
      loadFontPreview(font.family);
    });
  }, [displayedFonts]);

  const handleFontClick = (family: string) => {
    loadGoogleFont(family);
    addRecentFont(family);
    setRecents(getRecentFonts());

    if (hasSelectedText) {
      onSelectFont(family);
    } else if (onAddTextWithFont) {
      onAddTextWithFont(family);
    } else {
      onSelectFont(family);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 120) {
      if (visibleCount < filteredFonts.length) {
        setVisibleCount((prev) => Math.min(prev + 30, filteredFonts.length));
      }
    }
  };

  return (
    <aside
      className="flex h-full w-[360px] shrink-0 flex-col border-r border-white/[0.08] bg-[#18191b] text-white select-none"
    >
      {/* ── Header ── */}
      <div className="border-b border-white/[0.08] bg-[#131416] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Type size={16} />
            </div>
            <div>
              <h2 className="text-xs font-semibold tracking-wide text-white">
                Font Library
              </h2>
              <p className="text-[10px] text-zinc-500">
                {isLoading ? "Loading fonts..." : "Google Fonts and Fontshare"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Search Input ── */}
        <div className="relative mt-3">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(40);
            }}
            placeholder="Search fonts by name..."
            className="h-8 w-full rounded-lg border border-white/[0.08] bg-[#17171a] pl-8 pr-8 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-indigo-500/60 focus:bg-[#1b1b20]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* ── Category Filter Pills - ALL DIRECTLY VISIBLE ── */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pb-1">
          {CATEGORY_TABS.map((tab) => {
            const active = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveCategory(tab.id);
                  setVisibleCount(40);
                }}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                  active
                    ? "bg-indigo-500/20 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.15)] border border-indigo-500/30"
                    : "bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200 border border-transparent"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Preview Text Input (optional toggle) */}
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Type custom preview text..."
            className="h-6 w-full rounded border border-white/[0.05] bg-black/30 px-2 text-[10px] text-zinc-300 placeholder-zinc-600 outline-none focus:border-zinc-600"
          />
          {previewText && (
            <button
              type="button"
              onClick={() => setPreviewText("")}
              className="text-[10px] text-zinc-500 hover:text-zinc-300"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Fonts List ── */}
      <div
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-2.5 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800"
      >
        {filteredFonts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Type size={28} className="text-zinc-700 mb-2" />
            <p className="text-xs font-medium text-zinc-400">No fonts found</p>
            <p className="mt-1 text-[11px] text-zinc-600">
              Try searching with another name or category
            </p>
            {activeCategory !== "all" && (
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className="mt-3 rounded-lg border border-white/[0.08] px-3 py-1 text-[11px] text-indigo-400 hover:bg-white/[0.05]"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          displayedFonts.map((font) => {
            const isSelected = font.family.toLowerCase() === (currentFontFamily || "").toLowerCase();
            const isStarred = favorites.includes(font.family);

            return (
              <div
                key={font.family}
                onClick={() => handleFontClick(font.family)}
                role="button"
                tabIndex={0}
                className={`group relative flex flex-col rounded-xl border p-2.5 text-left transition cursor-pointer ${
                  isSelected
                    ? "border-indigo-500/50 bg-indigo-500/[0.12] shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                    : "border-white/[0.05] bg-[#141417]/70 hover:border-white/[0.12] hover:bg-[#19191d]"
                }`}
              >
                {/* Top Row: Name + Star + Category */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="truncate text-xs font-semibold text-zinc-200 group-hover:text-white">
                      {font.family}
                    </span>
                    {isSelected && (
                      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white">
                        <Check size={9} strokeWidth={3} />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {font.isVariable && (
                      <span className="rounded bg-indigo-500/10 px-1 py-0.2 text-[8px] font-mono text-indigo-300">
                        VAR
                      </span>
                    )}
                    <span className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[9px] text-zinc-500 capitalize">
                      {font.category}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleToggleStar(e, font.family)}
                      title={isStarred ? "Unstar font" : "Star font"}
                      className="p-1 text-zinc-600 transition hover:scale-110 hover:text-amber-400"
                    >
                      <Star
                        size={13}
                        className={isStarred ? "fill-amber-400 text-amber-400" : "hover:fill-zinc-400"}
                      />
                    </button>
                  </div>
                </div>

                {/* Bottom Row: True Font Preview */}
                <div className="mt-2 overflow-hidden">
                  <p
                    className="truncate text-lg text-zinc-300 transition-colors group-hover:text-white leading-tight"
                    style={{
                      fontFamily: `"${font.family}", sans-serif`,
                    }}
                  >
                    {previewText || font.family}
                  </p>
                </div>

                {/* Subtitle / Variants count */}
                <div className="mt-1 flex items-center justify-between text-[9px] text-zinc-600">
                  <span>
                    {font.variants.length} {font.variants.length === 1 ? "weight" : "weights"}
                    {font.hasItalic && " • Italic"}
                  </span>
                  <span className="opacity-0 transition group-hover:opacity-100 text-indigo-400 font-medium">
                    {hasSelectedText ? "Apply to selection →" : "Add text →"}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {displayedFonts.length < filteredFonts.length && (
          <div className="py-3 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 40)}
              className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs text-zinc-400 hover:bg-white/[0.08] hover:text-white transition"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
