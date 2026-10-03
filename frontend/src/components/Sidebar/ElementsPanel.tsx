// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Design Editor – Elements Panel
//  Theme & Layout styled to perfectly match the Reference Image
//  12 3D Category Badges + Quick Shapes + 10,000+ Deep Asset Catalog
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import React, {
  useState, useCallback, useEffect, useRef, memo, useMemo,
} from "react";
import {
  Search, X, ChevronLeft, SlidersHorizontal,
  Loader2, Play, Check, Sparkles,
} from "lucide-react";
import type { AssetCategoryId, AssetDef } from "@/lib/assetEngine/types";
import { useAssetLibrary, useAssetThumbnail, renderAssetSvg } from "@/hooks/useAssetLibrary";
import { getCategoryCount, getAllCategoryCounts } from "@/lib/assetEngine/registry";
import { FrameDefinition, FRAME_DEFINITIONS } from "@/data/frameDefinitions";
import { CategoryBadgeIcon } from "./CategoryBadgeIcon";

// ── Browse Categories list (matches 1st image 3-column layout) ─────────────────
const BROWSE_CATEGORIES: Array<{ id: AssetCategoryId; label: string }> = [
  { id: "shapes",     label: "Shapes"     },
  { id: "graphics",   label: "Graphics"   },
  { id: "3d",         label: "3D"         },
  { id: "animations", label: "Animations" },
  { id: "photos",     label: "Photos"     },
  { id: "frames",     label: "Frames"     },
  { id: "grids",      label: "Grids"      },
  { id: "forms",      label: "Forms"      },
  { id: "mockups",    label: "Mockups"    },
  { id: "charts",     label: "Charts"     },
  { id: "sheets",     label: "Sheets"     },
  { id: "tables",     label: "Tables"     },
];

// ── SVG Data for Quick Shapes (cards 4, 5, 6) ─────────────────────────────────
const TRIANGLE_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200"><polygon points="50,12 90,88 10,88" fill="#818cf8"/></svg>`
)}`;

const STAR_5_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200"><polygon points="50,5 63,35 95,35 68,55 78,88 50,68 22,88 32,55 5,35 37,35" fill="#f59e0b"/></svg>`
)}`;

const STAR_8_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200"><polygon points="50,5 60,30 85,15 70,40 95,50 70,60 85,85 60,70 50,95 40,70 15,85 30,60 5,50 30,40 15,15 40,30" fill="#ec4899"/></svg>`
)}`;

// ── Props ─────────────────────────────────────────────────────────────────────
interface ElementsPanelProps {
  onAddShape: (type: "rectangle" | "ellipse" | "line") => void;
  onAddFrame?: (frameDef: FrameDefinition) => void;
  onAddImage?: (src: string, name?: string) => void;
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="falcon-asset-skeleton">
      <div className="falcon-asset-skeleton-inner" />
    </div>
  );
});

// ── Asset Card (Inside Category View) ──────────────────────────────────────────
interface AssetCardProps {
  def: AssetDef;
  onInsert: (def: AssetDef) => void;
}

const AssetCard = memo(function AssetCard({ def, onInsert }: AssetCardProps) {
  const thumb = useAssetThumbnail(def);
  const [hovered, setHovered] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [inserted, setInserted] = useState(false);

  // For animations: show animated SVG on hover
  const animatedSrc = useMemo(() => {
    if (def.category === "animations" && def.params?.animatedSvg) {
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(def.params.animatedSvg as string)}`;
    }
    return null;
  }, [def]);

  const displaySrc = (hovered && animatedSrc) ? animatedSrc : thumb;

  const handleClick = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setInserted(false);
    onInsert(def);
    setTimeout(() => {
      setInserted(true);
      setTimeout(() => {
        setAnimating(false);
        setInserted(false);
      }, 700);
    }, 120);
  }, [def, onInsert, animating]);

  return (
    <button
      type="button"
      title={def.name}
      className="falcon-asset-card"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="falcon-asset-thumb-wrap">
        {displaySrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displaySrc}
            alt={def.name}
            loading="lazy"
            className="falcon-asset-thumb"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
            }}
          />
        ) : (
          <div className="falcon-asset-placeholder">
            <span className="text-[10px] text-zinc-500">{def.name.slice(0, 10)}</span>
          </div>
        )}

        {def.animated && (
          <span className="falcon-badge-animated" title="Animated SVG">
            <Play size={8} fill="currentColor" />
          </span>
        )}

        {inserted && (
          <div className="falcon-inserted-overlay">
            <Check size={14} className="text-emerald-400" />
          </div>
        )}
      </div>
      <p className="falcon-asset-name">{def.name.split("–")[0].trim()}</p>
    </button>
  );
});

// ── Elements Panel ────────────────────────────────────────────────────────────
export function ElementsPanel({ onAddShape, onAddFrame, onAddImage }: ElementsPanelProps) {
  const [activeCategory, setActiveCategory] = useState<AssetCategoryId | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const {
    assets, total, subcategories, suggestions,
    loading, loadingMore, hasMore,
    loadMore, search, setSubcategory, setStyle, reset,
    activeSubcategory, activeStyle,
  } = useAssetLibrary(activeCategory ?? undefined, "");

  // Sync search input → debounced search
  useEffect(() => {
    search(searchInput);
  }, [searchInput, search]);

  // Infinite scroll intersection observer
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore, loadingMore]);

  // Canvas insertion handler
  const handleInsert = useCallback((def: AssetDef) => {
    // If it's a frame asset and onAddFrame is provided
    if (def.category === "frames" && onAddFrame) {
      const frameDef = FRAME_DEFINITIONS.find((f) => def.id.includes(f.id));
      if (frameDef) {
        onAddFrame(frameDef);
        return;
      }
    }

    // Basic canvas shapes
    if (def.category === "shapes" && onAddShape) {
      if (def.templateId === "shape-rect" && !def.params?.variant) {
        onAddShape("rectangle");
        return;
      } else if (def.templateId === "shape-circle" && !def.params?.variant) {
        onAddShape("ellipse");
        return;
      } else if (def.templateId === "shape-line" && !def.params?.variant) {
        onAddShape("line");
        return;
      }
    }

    // Direct photo / CDN URL
    if (def.fileUrl || def.thumbnailUrl) {
      onAddImage?.(def.fileUrl ?? def.thumbnailUrl ?? "", def.name);
      return;
    }

    // Render full SVG data URI
    const svgData = renderAssetSvg(def);
    if (svgData) {
      onAddImage?.(svgData, def.name);
    }
  }, [onAddShape, onAddFrame, onAddImage]);

  const handleBack = () => {
    setActiveCategory(null);
    reset();
    setSearchInput("");
  };

  const activeCatMeta = BROWSE_CATEGORIES.find((c) => c.id === activeCategory);
  const activeCount = activeCategory ? getCategoryCount(activeCategory) : 0;

  return (
    <div className="falcon-elements-panel">
      <style>{PANEL_STYLES}</style>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 1. TOP-LEVEL BROWSE CATEGORIES VIEW (Matches 1st reference screenshot)    */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {!activeCategory ? (
        <div className="falcon-browse-container">
          {/* Header */}
          <h2 className="falcon-browse-title">Browse categories</h2>

          {/* 3-Column 3D Category Badges */}
          <div className="falcon-badge-grid">
            {BROWSE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className="falcon-badge-btn group"
                title={`${cat.label} (${getCategoryCount(cat.id).toLocaleString()}+ assets)`}
              >
                <div className="falcon-badge-icon-wrap">
                  <CategoryBadgeIcon categoryId={cat.id} size={66} />
                </div>
                <span className="falcon-badge-label">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* ── Shapes Section ── */}
          <div className="falcon-shapes-section">
            <div className="falcon-shapes-header">
              <h3 className="falcon-shapes-title">Shapes</h3>
              <button
                type="button"
                onClick={() => setActiveCategory("shapes")}
                className="falcon-see-all-btn"
              >
                See all &gt;
              </button>
            </div>

            {/* 3-Column Shapes Grid (6 items) */}
            <div className="falcon-quick-shapes-grid">
              {/* 1. Rectangle */}
              <button
                type="button"
                onClick={() => onAddShape("rectangle")}
                className="falcon-quick-shape-card group"
                title="Add Rectangle"
              >
                <div className="falcon-quick-shape-preview">
                  <svg viewBox="0 0 54 36" className="w-12 h-8">
                    <rect x="3" y="3" width="48" height="30" rx="7" fill="none" stroke="#00dfb6" strokeWidth="4.2" />
                  </svg>
                </div>
                <span className="falcon-quick-shape-name">Rectangle</span>
              </button>

              {/* 2. Circle / Ellipse */}
              <button
                type="button"
                onClick={() => onAddShape("ellipse")}
                className="falcon-quick-shape-card group"
                title="Add Circle / Ellipse"
              >
                <div className="falcon-quick-shape-preview">
                  <svg viewBox="0 0 40 40" className="w-9 h-9">
                    <circle cx="20" cy="20" r="15" fill="none" stroke="#00dfb6" strokeWidth="4.2" />
                  </svg>
                </div>
                <span className="falcon-quick-shape-name">Circle / Ellipse</span>
              </button>

              {/* 3. Line */}
              <button
                type="button"
                onClick={() => onAddShape("line")}
                className="falcon-quick-shape-card group"
                title="Add Line"
              >
                <div className="falcon-quick-shape-preview">
                  <svg viewBox="0 0 50 20" className="w-12 h-5">
                    <line x1="4" y1="10" x2="46" y2="10" stroke="#00dfb6" strokeWidth="5" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="falcon-quick-shape-name">Line</span>
              </button>

              {/* 4. Triangle */}
              <button
                type="button"
                onClick={() => onAddImage?.(TRIANGLE_SVG, "Triangle")}
                className="falcon-quick-shape-card group"
                title="Add Triangle"
              >
                <div className="falcon-quick-shape-preview">
                  <svg viewBox="0 0 40 40" className="w-9 h-9">
                    <polygon points="20,4 37,36 3,36" fill="#818cf8" />
                  </svg>
                </div>
                <span className="falcon-quick-shape-name">Triangle</span>
              </button>

              {/* 5. 5-Point Star */}
              <button
                type="button"
                onClick={() => onAddImage?.(STAR_5_SVG, "5-Point Star")}
                className="falcon-quick-shape-card group"
                title="Add 5-Point Star"
              >
                <div className="falcon-quick-shape-preview">
                  <svg viewBox="0 0 40 40" className="w-9 h-9">
                    <polygon
                      points="20,2 25,14 38,14 27,22 31,35 20,27 9,35 13,22 2,14 15,14"
                      fill="#fb923c"
                    />
                  </svg>
                </div>
                <span className="falcon-quick-shape-name">5-Point Star</span>
              </button>

              {/* 6. 8-Point Star Burst */}
              <button
                type="button"
                onClick={() => onAddImage?.(STAR_8_SVG, "8-Point Star Burst")}
                className="falcon-quick-shape-card group"
                title="Add 8-Point Star Burst"
              >
                <div className="falcon-quick-shape-preview">
                  <svg viewBox="0 0 40 40" className="w-9 h-9">
                    <polygon
                      points="20,2 24,12 34,6 28,16 38,20 28,24 34,34 24,28 20,38 16,28 6,34 12,24 2,20 12,16 6,6 16,12"
                      fill="#ec4899"
                    />
                  </svg>
                </div>
                <span className="falcon-quick-shape-name">8-Point Star B...</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="falcon-detail-container">
          {/* Header */}
          <div className="falcon-panel-header">
            <button type="button" className="falcon-back-btn" onClick={handleBack}>
              <ChevronLeft size={16} />
              <span>{activeCatMeta?.label ?? "Categories"}</span>
              <span className="falcon-cat-badge">
                {activeCount >= 1000 ? `${(activeCount / 1000).toFixed(1)}k+` : `${activeCount}+`}
              </span>
            </button>

            <button
              type="button"
              className={`falcon-filter-toggle ${showFilters ? "falcon-filter-toggle--active" : ""}`}
              onClick={() => setShowFilters((v) => !v)}
              title="Toggle Filters"
            >
              <SlidersHorizontal size={14} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="falcon-search-wrap">
            <div className="falcon-search-inner">
              <Search size={14} className="falcon-search-icon" />
              <input
                ref={searchRef}
                type="text"
                placeholder={`Search ${activeCatMeta?.label?.toLowerCase() ?? "elements"}…`}
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                className="falcon-search-input"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(""); reset(); }}
                  className="falcon-search-clear"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="falcon-suggestions-dropdown">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => {
                      setSearchInput(s);
                      setShowSuggestions(false);
                    }}
                    className="falcon-suggestion-item"
                  >
                    <Search size={11} className="text-zinc-500" />
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Bar */}
          {subcategories.length > 1 && (
            <div className="falcon-pill-bar">
              {subcategories.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSubcategory(sub)}
                  className={`falcon-pill ${activeSubcategory === sub ? "falcon-pill--active" : ""}`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* Optional Style Filter Row */}
          {showFilters && (
            <div className="falcon-style-filters">
              {(["all", "flat", "gradient", "3d", "outlined"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStyle(st === "all" ? undefined : st)}
                  className={`falcon-style-btn ${(st === "all" ? !activeStyle : activeStyle === st) ? "falcon-style-btn--active" : ""}`}
                >
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Asset Grid (Infinite Scroll) */}
          <div ref={scrollRef} className="falcon-asset-scroll-area">
            {assets.length === 0 && !loading ? (
              <div className="falcon-empty-state">
                <Search size={28} className="text-zinc-600 mb-2" />
                <p className="text-zinc-400 font-medium text-xs">No elements found</p>
                <p className="text-zinc-600 text-[11px] mt-1">Try another keyword</p>
              </div>
            ) : (
              <div className="falcon-asset-grid">
                {assets.map((asset) => (
                  <AssetCard key={asset.id} def={asset} onInsert={handleInsert} />
                ))}

                {/* Skeletons while loading */}
                {loading && (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                )}
              </div>
            )}

            {/* Infinite Scroll Trigger */}
            <div ref={loaderRef} className="falcon-load-more">
              {loadingMore && (
                <div className="falcon-loading-more">
                  <Loader2 size={13} className="falcon-spinner text-[#00dfb6]" />
                  <span>Loading more elements…</span>
                </div>
              )}
              {!hasMore && assets.length > 0 && (
                <p className="falcon-end-of-results">All {total.toLocaleString()} elements loaded</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Panel CSS Styles (matching 1st image dark obsidian / teal theme) ───────────
const PANEL_STYLES = `
.falcon-elements-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 360px;
  background: #0c0e12;
  border-right: 1px solid rgba(255, 255, 255, 0.07);
  color: #f1f5f9;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  overflow: hidden;
  user-select: none;
}

/* ── Browse View ── */
.falcon-browse-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 14px 28px;
}
.falcon-browse-container::-webkit-scrollbar {
  width: 5px;
}
.falcon-browse-container::-webkit-scrollbar-track {
  background: #0c0e12;
}
.falcon-browse-container::-webkit-scrollbar-thumb {
  background: #1e2430;
  border-radius: 4px;
}
.falcon-browse-container::-webkit-scrollbar-thumb:hover {
  background: #2b3345;
}

.falcon-browse-title {
  font-size: 16.5px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 16px 2px;
  letter-spacing: -0.02em;
}

/* 3-Column Badges Grid */
.falcon-badge-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 10px;
  row-gap: 16px;
  margin-bottom: 24px;
}

.falcon-badge-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: none;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.falcon-badge-btn:hover {
  transform: translateY(-2px);
}
.falcon-badge-btn:active {
  transform: translateY(0) scale(0.97);
}

.falcon-badge-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.falcon-badge-label {
  font-size: 12px;
  font-weight: 500;
  color: #e2e8f0;
  text-align: center;
  line-height: 1.25;
  transition: color 0.15s;
}
.falcon-badge-btn:hover .falcon-badge-label {
  color: #ffffff;
}

/* ── Shapes Section ── */
.falcon-shapes-section {
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.falcon-shapes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 2px;
}

.falcon-shapes-title {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.01em;
}

.falcon-see-all-btn {
  background: none;
  border: none;
  color: #00dfb6;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 2px 4px;
  transition: color 0.15s, opacity 0.15s;
}
.falcon-see-all-btn:hover {
  color: #2dd4bf;
  text-decoration: underline;
}

/* 3-Column Quick Shapes Grid */
.falcon-quick-shapes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.falcon-quick-shape-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 84px;
  background: #11141b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 13px;
  padding: 8px 4px 6px;
  cursor: pointer;
  outline: none;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}
.falcon-quick-shape-card:hover {
  background: #151924;
  border-color: rgba(0, 223, 182, 0.45);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  transform: translateY(-1.5px);
}
.falcon-quick-shape-card:active {
  transform: translateY(0);
}

.falcon-quick-shape-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.falcon-quick-shape-name {
  font-size: 10.5px;
  font-weight: 500;
  color: #8392a5;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
  margin-top: 2px;
  transition: color 0.15s;
}
.falcon-quick-shape-card:hover .falcon-quick-shape-name {
  color: #e2e8f0;
}

/* ── Category Detail View ── */
.falcon-detail-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.falcon-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 14px 8px;
  flex-shrink: 0;
}

.falcon-back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #f1f5f9;
  font-size: 14.5px;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 8px;
  transition: background 0.15s;
}
.falcon-back-btn:hover {
  background: rgba(255, 255, 255, 0.06);
}

.falcon-cat-badge {
  font-size: 10.5px;
  font-weight: 600;
  color: #00dfb6;
  background: rgba(0, 223, 182, 0.12);
  border: 1px solid rgba(0, 223, 182, 0.25);
  border-radius: 12px;
  padding: 1px 7px;
  margin-left: 4px;
}

.falcon-filter-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.15s;
}
.falcon-filter-toggle:hover,
.falcon-filter-toggle--active {
  background: rgba(0, 223, 182, 0.15);
  border-color: #00dfb6;
  color: #00dfb6;
}

/* Search Bar */
.falcon-search-wrap {
  position: relative;
  padding: 4px 14px 6px;
  flex-shrink: 0;
}
.falcon-search-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #12151d;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 8px 11px;
  transition: border-color 0.15s, background 0.15s;
}
.falcon-search-inner:focus-within {
  border-color: #00dfb6;
  background: rgba(0, 223, 182, 0.05);
}
.falcon-search-icon {
  color: #64748b;
  flex-shrink: 0;
}
.falcon-search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 13px;
  color: #f1f5f9;
}
.falcon-search-input::placeholder {
  color: #556275;
}
.falcon-search-clear {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 2px;
}
.falcon-search-clear:hover {
  color: #f1f5f9;
}

/* Autocomplete */
.falcon-suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 14px;
  right: 14px;
  background: #12151d;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  z-index: 50;
  max-height: 200px;
  overflow-y: auto;
  padding: 4px;
}
.falcon-suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 10px;
  background: none;
  border: none;
  border-radius: 6px;
  color: #cbd5e1;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
}
.falcon-suggestion-item:hover {
  background: rgba(0, 223, 182, 0.12);
  color: #00dfb6;
}

/* Subcategory Pills */
.falcon-pill-bar {
  display: flex;
  gap: 6px;
  padding: 4px 14px 8px;
  overflow-x: auto;
  flex-shrink: 0;
}
.falcon-pill-bar::-webkit-scrollbar {
  display: none;
}
.falcon-pill {
  padding: 4px 11px;
  border-radius: 16px;
  background: #141720;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #8e9db3;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s;
}
.falcon-pill:hover {
  background: #1a1f2c;
  color: #f1f5f9;
}
.falcon-pill--active {
  background: #00dfb6;
  border-color: #00dfb6;
  color: #090b0e;
  font-weight: 700;
}

/* Style Filter Row */
.falcon-style-filters {
  display: flex;
  gap: 5px;
  padding: 0 14px 8px;
  flex-shrink: 0;
}
.falcon-style-btn {
  flex: 1;
  padding: 4px;
  border-radius: 6px;
  background: #12151d;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #718096;
  font-size: 10.5px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
}
.falcon-style-btn:hover {
  color: #cbd5e1;
  border-color: rgba(255, 255, 255, 0.15);
}
.falcon-style-btn--active {
  background: rgba(0, 223, 182, 0.12);
  border-color: #00dfb6;
  color: #00dfb6;
}

/* Asset Scroll Area */
.falcon-asset-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 4px 14px 20px;
}
.falcon-asset-scroll-area::-webkit-scrollbar {
  width: 5px;
}
.falcon-asset-scroll-area::-webkit-scrollbar-track {
  background: #0c0e12;
}
.falcon-asset-scroll-area::-webkit-scrollbar-thumb {
  background: #1e2430;
  border-radius: 4px;
}
.falcon-asset-scroll-area::-webkit-scrollbar-thumb:hover {
  background: #2b3345;
}

.falcon-asset-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

/* Asset Card */
.falcon-asset-card {
  display: flex;
  flex-direction: column;
  background: #11141b;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 11px;
  padding: 4px;
  cursor: pointer;
  outline: none;
  transition: all 0.18s;
  overflow: hidden;
}
.falcon-asset-card:hover {
  border-color: rgba(0, 223, 182, 0.5);
  background: #151a24;
  transform: translateY(-1.5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
}

.falcon-asset-thumb-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.falcon-asset-thumb {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.2s;
}
.falcon-asset-card:hover .falcon-asset-thumb {
  transform: scale(1.06);
}

.falcon-asset-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.falcon-badge-animated {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: rgba(0, 223, 182, 0.9);
  color: #090b0e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.falcon-inserted-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 223, 182, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.15s ease-out;
}

.falcon-asset-name {
  font-size: 9.5px;
  font-weight: 500;
  color: #64748b;
  margin: 3px 2px 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  transition: color 0.15s;
}
.falcon-asset-card:hover .falcon-asset-name {
  color: #cbd5e1;
}

/* Skeleton Loading */
.falcon-asset-skeleton {
  aspect-ratio: 1;
  background: #11141b;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 11px;
  padding: 4px;
}
.falcon-asset-skeleton-inner {
  width: 100%;
  height: 100%;
  border-radius: 7px;
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Load More */
.falcon-load-more {
  padding: 14px 0 6px;
  display: flex;
  justify-content: center;
}
.falcon-loading-more {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: #64748b;
}
.falcon-spinner {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.falcon-end-of-results {
  font-size: 11px;
  color: #475569;
  text-align: center;
}

/* Empty State */
.falcon-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  text-align: center;
}
`;
