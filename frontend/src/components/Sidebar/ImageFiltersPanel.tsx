import React from "react";
import { ImageElement, ImageFilter } from "@/types";
import {
  Sliders,
  Sparkles,
  RotateCcw,
  Sun,
  Contrast as ContrastIcon,
  Droplet,
  Eye,
  Layers,
  Palette,
  X,
} from "lucide-react";

interface ImageFiltersPanelProps {
  element: ImageElement;
  onChange: (patch: Partial<ImageElement>) => void;
  onClose?: () => void;
}

interface FilterOption {
  id: ImageFilter;
  label: string;
  previewFilter: string;
}

const FILTER_PRESETS: FilterOption[] = [
  { id: "none", label: "None", previewFilter: "none" },
  { id: "warm", label: "Warm", previewFilter: "sepia(25%) saturate(1.5) brightness(1.05)" },
  { id: "cool", label: "Cool", previewFilter: "saturate(0.8) hue-rotate(20deg) brightness(1.05)" },
  { id: "grayscale", label: "B&W", previewFilter: "grayscale(100%)" },
  { id: "sepia", label: "Sepia", previewFilter: "sepia(100%)" },
  { id: "contrast", label: "Drama", previewFilter: "contrast(1.4) saturate(1.2)" },
  { id: "brightness", label: "Vivid", previewFilter: "brightness(1.15) saturate(1.3)" },
  { id: "saturate", label: "Pop", previewFilter: "saturate(2.0)" },
  { id: "blur", label: "Dreamy", previewFilter: "blur(2px)" },
  { id: "invert", label: "Invert", previewFilter: "invert(100%)" },
];

export function ImageFiltersPanel({
  element,
  onChange,
  onClose,
}: ImageFiltersPanelProps) {
  const currentFilter = element.filter || "none";
  const filterIntensity = element.filterIntensity ?? 100;

  // Adjustment values (defaults: brightness=100, contrast=100, saturate=100, blur=0, hueRotate=0)
  const brightness = element.brightness ?? 100;
  const contrast = element.contrast ?? 100;
  const saturate = element.saturate ?? 100;
  const blur = element.blur ?? 0;
  const hueRotate = element.hueRotate ?? 0;

  const hasAnyAdjustments =
    currentFilter !== "none" ||
    brightness !== 100 ||
    contrast !== 100 ||
    saturate !== 100 ||
    blur !== 0 ||
    hueRotate !== 0;

  const handleResetAll = () => {
    onChange({
      filter: "none",
      filterIntensity: 100,
      brightness: 100,
      contrast: 100,
      saturate: 100,
      blur: 0,
      hueRotate: 0,
    });
  };

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-r border-white/[0.08] bg-[#18191b] text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3.5 bg-[#131416]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
            <Sliders size={17} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Image Filters & Adjust</h2>
            <p className="text-[11px] text-zinc-400">Color grades and enhancement</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {hasAnyAdjustments && (
            <button
              type="button"
              onClick={handleResetAll}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
              title="Reset all adjustments"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
              title="Close filter panel"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-700">
        {/* Visual Filters Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Filter Presets
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">
              {currentFilter !== "none" ? currentFilter : "Original"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {FILTER_PRESETS.map((preset) => {
              const active = currentFilter === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onChange({
                      filter: preset.id,
                      filterIntensity: preset.id === "none" ? 0 : 100,
                    });
                  }}
                  className={`group relative flex flex-col items-center rounded-xl p-2 transition-all ${
                    active
                      ? "bg-indigo-600/20 ring-2 ring-indigo-500"
                      : "bg-[#25262b] hover:bg-[#2e2f36] border border-white/[0.06]"
                  }`}
                >
                  {/* Thumbnail with filter preview */}
                  <div className="relative h-16 w-full overflow-hidden rounded-lg bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={element.src}
                      alt={preset.label}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      style={{ filter: preset.previewFilter }}
                    />
                    {active && (
                      <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-indigo-400 ring-2 ring-[#18191b]" />
                    )}
                  </div>
                  <span
                    className={`mt-1.5 text-[11px] font-medium truncate w-full text-center ${
                      active ? "text-indigo-300 font-semibold" : "text-zinc-300"
                    }`}
                  >
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filter Intensity (when a filter is active) */}
          {currentFilter !== "none" && (
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#202125] p-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-zinc-400 font-medium">Filter Intensity</span>
                <span className="font-mono text-zinc-200 text-[11px] bg-black/40 px-2 py-0.5 rounded">
                  {Math.round(filterIntensity)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={filterIntensity}
                onChange={(e) =>
                  onChange({ filterIntensity: Number(e.target.value) })
                }
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Fine Adjustments Sliders */}
        <div className="border-t border-white/[0.08] pt-5">
          <div className="flex items-center gap-2 mb-4">
            <Sliders size={14} className="text-indigo-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Adjustment Sliders
            </h3>
          </div>

          <div className="space-y-4">
            {/* Brightness */}
            <div className="rounded-xl border border-white/[0.06] bg-[#202125] p-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Sun size={13} className="text-amber-400" />
                  <span>Brightness</span>
                </div>
                <span className="font-mono text-zinc-300 text-[11px] bg-black/40 px-2 py-0.5 rounded">
                  {brightness}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                value={brightness}
                onChange={(e) => onChange({ brightness: Number(e.target.value) })}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-amber-400"
              />
            </div>

            {/* Contrast */}
            <div className="rounded-xl border border-white/[0.06] bg-[#202125] p-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <ContrastIcon size={13} className="text-blue-400" />
                  <span>Contrast</span>
                </div>
                <span className="font-mono text-zinc-300 text-[11px] bg-black/40 px-2 py-0.5 rounded">
                  {contrast}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                value={contrast}
                onChange={(e) => onChange({ contrast: Number(e.target.value) })}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-blue-400"
              />
            </div>

            {/* Saturation */}
            <div className="rounded-xl border border-white/[0.06] bg-[#202125] p-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Droplet size={13} className="text-rose-400" />
                  <span>Saturation</span>
                </div>
                <span className="font-mono text-zinc-300 text-[11px] bg-black/40 px-2 py-0.5 rounded">
                  {saturate}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                value={saturate}
                onChange={(e) => onChange({ saturate: Number(e.target.value) })}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-rose-400"
              />
            </div>

            {/* Blur */}
            <div className="rounded-xl border border-white/[0.06] bg-[#202125] p-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Eye size={13} className="text-purple-400" />
                  <span>Blur</span>
                </div>
                <span className="font-mono text-zinc-300 text-[11px] bg-black/40 px-2 py-0.5 rounded">
                  {blur}px
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                step={0.5}
                value={blur}
                onChange={(e) => onChange({ blur: Number(e.target.value) })}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-purple-400"
              />
            </div>

            {/* Hue Rotate */}
            <div className="rounded-xl border border-white/[0.06] bg-[#202125] p-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Palette size={13} className="text-emerald-400" />
                  <span>Hue Rotate</span>
                </div>
                <span className="font-mono text-zinc-300 text-[11px] bg-black/40 px-2 py-0.5 rounded">
                  {hueRotate}°
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={hueRotate}
                onChange={(e) => onChange({ hueRotate: Number(e.target.value) })}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-emerald-400"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
