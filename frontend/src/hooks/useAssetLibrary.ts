// ─────────────────────────────────────────────────────────────────────────────
//  useAssetLibrary – React Hook for Falcon Asset Engine
//  Provides paginated, searchable, filterable access to 10,000+ assets
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { AssetDef, AssetCategoryId, SearchOptions } from "@/lib/assetEngine/types";
import {
  getAssetPage,
  searchAssets,
  getCategorySubcategories,
  getAutocompleteSuggestions,
  getCategoryCount,
} from "@/lib/assetEngine/registry";

const PAGE_SIZE = 48;

export interface UseAssetLibraryReturn {
  // Data
  assets: AssetDef[];
  total: number;
  subcategories: string[];
  suggestions: string[];
  // State
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  page: number;
  // Actions
  loadMore: () => void;
  search: (query: string) => void;
  setSubcategory: (sub: string) => void;
  setStyle: (style: string | undefined) => void;
  setAnimatedFilter: (v: boolean | undefined) => void;
  reset: () => void;
  // Current filters
  query: string;
  activeSubcategory: string;
  activeStyle: string | undefined;
  animatedFilter: boolean | undefined;
}

export function useAssetLibrary(
  category: AssetCategoryId | undefined,
  initialQuery = "",
): UseAssetLibraryReturn {
  const [assets, setAssets] = useState<AssetDef[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const [query, setQuery] = useState(initialQuery);
  const [activeSubcategory, setActiveSubcategory] = useState("All");
  const [activeStyle, setActiveStyle] = useState<string | undefined>(undefined);
  const [animatedFilter, setAnimatedFilter] = useState<boolean | undefined>(undefined);

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autocompleteDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load subcategories when category changes
  useEffect(() => {
    if (!category) return;
    getCategorySubcategories(category).then((subs) => {
      setSubcategories(["All", ...subs]);
    });
  }, [category]);

  // Main data load
  const loadPage = useCallback(
    async (pg: number, reset: boolean, opts: { query: string; sub: string; style?: string; animated?: boolean }) => {
      if (!category) return;
      if (pg === 0) setLoading(true);
      else setLoadingMore(true);

      try {
        let result;
        if (opts.query.trim()) {
          result = await searchAssets({
            query: opts.query,
            category,
            subcategory: opts.sub !== "All" ? opts.sub : undefined,
            style: opts.style as SearchOptions["style"],
            animated: opts.animated,
            page: pg,
            pageSize: PAGE_SIZE,
          });
        } else {
          result = await getAssetPage(
            category,
            pg,
            PAGE_SIZE,
            opts.sub !== "All" ? opts.sub : undefined,
          );
        }

        if (reset || pg === 0) {
          setAssets(result.items);
        } else {
          setAssets((prev) => [...prev, ...result.items]);
        }
        setTotal(result.total);
        setHasMore(result.hasMore);
        setPage(pg);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [category],
  );

  // Trigger on category/filter changes
  useEffect(() => {
    setPage(0);
    setAssets([]);
    loadPage(0, true, { query, sub: activeSubcategory, style: activeStyle, animated: animatedFilter });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, activeSubcategory, activeStyle, animatedFilter]);

  // Debounced search
  const search = useCallback(
    (q: string) => {
      setQuery(q);
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
      searchDebounce.current = setTimeout(() => {
        setPage(0);
        setAssets([]);
        loadPage(0, true, { query: q, sub: activeSubcategory, style: activeStyle, animated: animatedFilter });
      }, 280);

      // Autocomplete
      if (autocompleteDebounce.current) clearTimeout(autocompleteDebounce.current);
      if (q.length >= 2) {
        autocompleteDebounce.current = setTimeout(async () => {
          const sug = await getAutocompleteSuggestions(q, 6);
          setSuggestions(sug);
        }, 150);
      } else {
        setSuggestions([]);
      }
    },
    [loadPage, activeSubcategory, activeStyle, animatedFilter],
  );

  const handleSetSubcategory = useCallback(
    (sub: string) => {
      setActiveSubcategory(sub);
      setPage(0);
      setAssets([]);
    },
    [],
  );

  const handleSetStyle = useCallback((style: string | undefined) => {
    setActiveStyle(style);
    setPage(0);
    setAssets([]);
  }, []);

  const handleSetAnimated = useCallback((v: boolean | undefined) => {
    setAnimatedFilter(v);
    setPage(0);
    setAssets([]);
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    loadPage(page + 1, false, { query, sub: activeSubcategory, style: activeStyle, animated: animatedFilter });
  }, [page, hasMore, loadingMore, query, activeSubcategory, activeStyle, animatedFilter, loadPage]);

  const reset = useCallback(() => {
    setQuery("");
    setActiveSubcategory("All");
    setActiveStyle(undefined);
    setAnimatedFilter(undefined);
    setPage(0);
    setAssets([]);
    setSuggestions([]);
  }, []);

  return {
    assets,
    total,
    subcategories,
    suggestions,
    loading,
    loadingMore,
    hasMore,
    page,
    loadMore,
    search,
    setSubcategory: handleSetSubcategory,
    setStyle: handleSetStyle,
    setAnimatedFilter: handleSetAnimated,
    reset,
    query,
    activeSubcategory,
    activeStyle,
    animatedFilter,
  };
}

// ── Render hook: generates SVG thumbnail on-demand ─────────────────────────
import { useMemo } from "react";
import { renderShapeFromDef } from "@/lib/assetEngine/shapesEngine";
import { renderGraphicFromDef } from "@/lib/assetEngine/graphicsEngine";
import { render3DFromDef } from "@/lib/assetEngine/threeDEngine";
import { renderAnimationThumbnail, getAnimatedSvg } from "@/lib/assetEngine/animationsEngine";
import { renderFrameFromDef } from "@/lib/assetEngine/framesEngine";
import { renderCategoryAsset } from "@/lib/assetEngine/remainingEngines";
import { getPalette } from "@/lib/assetEngine/palette";
import { svgDataUri, wrapSvg, linearGrad } from "@/lib/assetEngine/svgUtils";

export function renderAssetSvg(def: AssetDef): string {
  if (def.thumbnailUrl) return def.thumbnailUrl;

  const cat = def.category;
  try {
    if (cat === "shapes") return renderShapeFromDef(def);
    if (cat === "graphics") return renderGraphicFromDef(def);
    if (cat === "3d") return render3DFromDef(def);
    if (cat === "animations") return renderAnimationThumbnail(def);
    if (cat === "frames") return renderFrameFromDef(def);
    if (cat === "grids" || cat === "forms" || cat === "mockups" ||
        cat === "charts" || cat === "sheets" || cat === "tables") {
      return renderCategoryAsset(def);
    }
  } catch {
    // Fallback
  }

  // Generic placeholder
  const palette = getPalette(def.params?.paletteId as string ?? "ocean");
  return svgDataUri(wrapSvg(`<defs>${linearGrad("g", palette.primary, palette.secondary)}</defs>
    <rect width="200" height="150" rx="10" fill="url(#g)" opacity="0.5"/>
    <text x="100" y="85" font-family="Inter,sans-serif" font-size="13" fill="${palette.light}" text-anchor="middle">${def.name.split("–")[0].trim()}</text>`));
}

export function useAssetThumbnail(def: AssetDef): string {
  return useMemo(() => renderAssetSvg(def), [def]);
}

export function useAnimatedSvg(def: AssetDef): string | undefined {
  return useMemo(() => {
    if (def.category !== "animations") return undefined;
    return getAnimatedSvg(def);
  }, [def]);
}
