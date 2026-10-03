import React, { useState, useMemo } from "react";
import {
  Wallpaper,
  Search,
  X,
  Palette,
  Check,
  Sliders,
  Film,
  Sparkles,
  Maximize2,
  RefreshCw,
} from "lucide-react";
import {
  BACKGROUNDS_DATA,
  BACKGROUND_CATEGORIES,
  BackgroundItem,
} from "@/data/backgrounds";
import { SEED_VIDEOS } from "@/data/seedVideos";

interface BackgroundsPanelProps {
  currentBackground?: string;
  onSelectBackground: (bg: BackgroundItem) => void;
  onCustomColorChange?: (color: string) => void;
}

type BackgroundSubtype = "all" | "color" | "gradient" | "image" | "video";

export function BackgroundsPanel({
  currentBackground,
  onSelectBackground,
  onCustomColorChange,
}: BackgroundsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeSubtype, setActiveSubtype] = useState<BackgroundSubtype>("all");
  const [customColor, setCustomColor] = useState("#0c1017");

  // Gradient Editor State
  const [isGradientEditorOpen, setIsGradientEditorOpen] = useState(false);
  const [gradType, setGradType] = useState<"linear" | "radial">("linear");
  const [gradAngle, setGradAngle] = useState(135);
  const [gradStop1, setGradStop1] = useState("#06b6d4");
  const [gradStop2, setGradStop2] = useState("#0f172a");

  // Computed gradient string
  const currentGradientCss = useMemo(() => {
    if (gradType === "radial") {
      return `radial-gradient(circle at center, ${gradStop1} 0%, ${gradStop2} 100%)`;
    }
    return `linear-gradient(${gradAngle}deg, ${gradStop1} 0%, ${gradStop2} 100%)`;
  }, [gradType, gradAngle, gradStop1, gradStop2]);

  // Video backgrounds
  const videoBackgrounds: BackgroundItem[] = useMemo(() => {
    return SEED_VIDEOS.map((v) => ({
      id: `bg-${v.id}`,
      name: v.name,
      category: "video-motion",
      type: "gradient", // Or css background with poster
      value: `url(${v.thumbnailUrl})`,
      preview: v.thumbnailUrl || "",
      tags: ["video", "motion", ...v.tags],
    }));
  }, []);

  // Filtered backgrounds based on subtype, category, and search query
  const filteredBackgrounds = useMemo(() => {
    let list: BackgroundItem[] = [...BACKGROUNDS_DATA];

    if (activeSubtype === "video") {
      list = videoBackgrounds;
    } else if (activeSubtype !== "all") {
      list = list.filter((item) => item.type === activeSubtype);
    }

    return list.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const inName = item.name.toLowerCase().includes(q);
      const inTags = item.tags.some((t) => t.toLowerCase().includes(q));
      return inName || inTags;
    });
  }, [activeSubtype, activeCategory, searchQuery, videoBackgrounds]);

  const handleApplyCustomGradient = () => {
    const bgItem: BackgroundItem = {
      id: `custom-grad-${Date.now()}`,
      name: `Custom Gradient (${gradAngle}°)`,
      category: "custom",
      type: "gradient",
      value: currentGradientCss,
      preview: currentGradientCss,
      tags: ["custom", "gradient"],
    };
    onSelectBackground(bgItem);
    onCustomColorChange?.(currentGradientCss);
    setIsGradientEditorOpen(false);
  };

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-r border-white/[0.08] bg-[#0c0c0e] text-white select-none relative">
      {/* HEADER */}
      <div className="border-b border-white/[0.08] bg-[#111114] p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Wallpaper size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold tracking-wide text-white">
                  Backgrounds
                </h2>
                <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[9px] font-medium text-cyan-300">
                  Pro
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">
                Colors, gradients, images & loops
              </p>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search backgrounds (e.g. mesh, dark, neon)..."
            className="w-full rounded-lg border border-white/[0.08] bg-[#16171a] py-1.5 pl-9 pr-8 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-cyan-500/60 focus:bg-[#1a1b20]"
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

        {/* SUBTYPE QUICK TABS: All | Color | Gradient | Image | Video */}
        <div className="flex items-center gap-1 rounded-lg bg-[#18191f] p-1 border border-white/[0.04]">
          {(
            [
              { id: "all", label: "All" },
              { id: "color", label: "Colors" },
              { id: "gradient", label: "Gradients" },
              { id: "image", label: "Images" },
              { id: "video", label: "Motion" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubtype(tab.id)}
              className={`flex-1 rounded-md py-1 text-[11px] font-medium transition ${
                activeSubtype === tab.id
                  ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CATEGORY TABS - ALL DIRECTLY VISIBLE */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {BACKGROUND_CATEGORIES.map((cat) => (
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

      {/* TOOLS BAR: Solid Color Picker & Gradient Editor Trigger */}
      <div className="border-b border-white/[0.06] bg-[#0e0f12] px-3.5 py-2.5 flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-[#16171b] px-2.5 py-1 text-[11px] text-zinc-300 transition hover:border-cyan-400 hover:text-white">
          <Palette size={13} className="text-cyan-400" />
          <span>Color Picker</span>
          <input
            type="color"
            value={customColor}
            onChange={(e) => {
              const c = e.target.value;
              setCustomColor(c);
              onCustomColorChange?.(c);
              onSelectBackground({
                id: `custom-${c}`,
                name: `Custom Color (${c})`,
                category: "studio",
                type: "color",
                value: c,
                preview: c,
                tags: ["custom", "solid", "color"],
              });
            }}
            className="sr-only"
          />
        </label>

        <button
          type="button"
          onClick={() => setIsGradientEditorOpen(!isGradientEditorOpen)}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
            isGradientEditorOpen
              ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
              : "border-white/10 bg-[#16171b] text-zinc-300 hover:border-cyan-400 hover:text-white"
          }`}
        >
          <Sliders size={13} className="text-cyan-400" />
          <span>Gradient Editor</span>
        </button>
      </div>

      {/* GRADIENT EDITOR POPUP */}
      {isGradientEditorOpen && (
        <div className="border-b border-cyan-500/30 bg-[#14161f] p-3.5 space-y-3 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Sliders size={14} className="text-cyan-400" />
              <span>Gradient Generator</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsGradientEditorOpen(false)}
              className="text-zinc-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>

          {/* Live Preview */}
          <div
            className="h-16 w-full rounded-xl border border-white/15 shadow-inner"
            style={{ background: currentGradientCss }}
          />

          {/* Controls: Type, Angle, Stops */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-[11px]">Type:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setGradType("linear")}
                  className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                    gradType === "linear" ? "bg-cyan-500 text-slate-950 font-bold" : "bg-white/10 text-zinc-400"
                  }`}
                >
                  Linear
                </button>
                <button
                  type="button"
                  onClick={() => setGradType("radial")}
                  className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                    gradType === "radial" ? "bg-cyan-500 text-slate-950 font-bold" : "bg-white/10 text-zinc-400"
                  }`}
                >
                  Radial
                </button>
              </div>
            </div>

            {gradType === "linear" && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-400 text-[11px]">Angle ({gradAngle}°):</span>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={gradAngle}
                  onChange={(e) => setGradAngle(parseInt(e.target.value, 10))}
                  className="w-32 accent-cyan-400 h-1.5 bg-zinc-800 rounded"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-[11px]">Stops:</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 cursor-pointer">
                  <div
                    className="h-5 w-5 rounded border border-white/20"
                    style={{ backgroundColor: gradStop1 }}
                  />
                  <input
                    type="color"
                    value={gradStop1}
                    onChange={(e) => setGradStop1(e.target.value)}
                    className="sr-only"
                  />
                </label>
                <span className="text-zinc-600">→</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <div
                    className="h-5 w-5 rounded border border-white/20"
                    style={{ backgroundColor: gradStop2 }}
                  />
                  <input
                    type="color"
                    value={gradStop2}
                    onChange={(e) => setGradStop2(e.target.value)}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleApplyCustomGradient}
            className="w-full rounded-lg bg-cyan-500 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
          >
            Apply Gradient to Canvas
          </button>
        </div>
      )}

      {/* BACKGROUNDS GRID */}
      <div className="flex-1 overflow-y-auto p-3.5 scrollbar-thin scrollbar-thumb-zinc-800">
        <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Curated Backgrounds</span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="text-cyan-400 hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        {filteredBackgrounds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] text-zinc-500">
              <Wallpaper size={20} />
            </div>
            <p className="mt-3 text-xs font-medium text-zinc-400">
              No backgrounds found
            </p>
            <p className="mt-1 text-[11px] text-zinc-600">
              Try searching for &quot;mesh&quot;, &quot;dark&quot;, or &quot;gradient&quot;
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredBackgrounds.map((bg) => {
              const isSelected =
                currentBackground &&
                (currentBackground === bg.value ||
                  currentBackground.includes(bg.value));

              return (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => onSelectBackground(bg)}
                  className={`group relative flex h-28 flex-col overflow-hidden rounded-xl border text-left transition-all duration-200 ${
                    isSelected
                      ? "border-cyan-500 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/20"
                      : "border-white/[0.08] hover:border-cyan-400/50 hover:shadow-md hover:shadow-black/60"
                  }`}
                  title={`Apply "${bg.name}"`}
                >
                  {/* PREVIEW SURFACE */}
                  <div
                    className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                    style={{
                      ...(bg.type === "image"
                        ? {
                            backgroundImage: `url(${bg.preview})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : bg.type === "gradient"
                        ? {
                            background: bg.preview,
                            backgroundSize: "cover",
                          }
                        : {
                            backgroundColor: bg.preview,
                          }),
                    }}
                  />

                  {/* Gradient shadow for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-85" />

                  {/* SELECTED BADGE */}
                  {isSelected && (
                    <div className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-slate-950 shadow">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}

                  {/* BOTTOM TITLE & TYPE BADGE */}
                  <div className="relative z-10 mt-auto p-2">
                    <span className="line-clamp-1 text-[11px] font-semibold text-white drop-shadow">
                      {bg.name}
                    </span>
                    <div className="mt-0.5 flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-wider text-zinc-300 font-mono">
                        {bg.type}
                      </span>
                      <span className="rounded bg-black/50 px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wider text-cyan-300">
                        {bg.category}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
