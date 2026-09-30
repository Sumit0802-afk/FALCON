import React, { useState } from "react";
import {
  CanvasElement,
  DesignPage,
  PageSize,
  isImage,
  isShape,
  isText,
  ImageFilter,
} from "@/types";
import {
  UploadCloud,
  ChevronRight,
  SunMedium,
  Contrast,
  Droplet,
  Layers,
  Sparkles,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronDown,
  Check,
  Disc,
  AlignVerticalJustifyCenter,
  MoveVertical,
  Blend,
  CircleDot,
  Maximize2,
} from "lucide-react";
import { BACKGROUNDS_DATA, BackgroundItem } from "@/data/backgrounds";

interface DesignInspectorPanelProps {
  page: DesignPage;
  selectedElement?: CanvasElement;
  onPageChange: (newPage: DesignPage) => void;
  onElementChange: (patch: Partial<CanvasElement>) => void;
  onSelectElement?: (id: string) => void;
  onDeleteElement?: (id: string) => void;
  onDuplicateElement?: (id: string) => void;
  onUploadBackgroundClick?: () => void;
  onOpenLayoutModal?: () => void;
  theme?: "dark" | "light";
}

const PRESET_PAGE_SIZES: { label: string; width: number; height: number }[] = [
  { label: "Instagram Post (1080 × 1080 px)", width: 1080, height: 1080 },
  { label: "Instagram Story (1080 × 1920 px)", width: 1080, height: 1920 },
  { label: "YouTube Thumbnail (1280 × 720 px)", width: 1280, height: 720 },
  { label: "Facebook Post (1200 × 630 px)", width: 1200, height: 630 },
  { label: "Twitter Header (1500 × 500 px)", width: 1500, height: 500 },
  { label: "A4 Document (1240 × 1754 px)", width: 1240, height: 1754 },
];

const FILTERS_LIST: { id: ImageFilter; label: string; previewClass: string }[] = [
  { id: "none", label: "None", previewClass: "brightness-100" },
  { id: "warm", label: "Cinematic", previewClass: "sepia-[0.35] contrast-125" },
  { id: "cool", label: "Aqua", previewClass: "hue-rotate-180 saturate-150" },
  { id: "contrast", label: "Dark", previewClass: "contrast-150 brightness-90" },
  { id: "saturate", label: "Vivid", previewClass: "saturate-200 contrast-110" },
];

const EFFECTS_LIST: {
  id: "none" | "shadow" | "glow" | "blur" | "duotone" | "outline";
  label: string;
  icon: string;
}[] = [
  { id: "shadow", label: "Shadow", icon: "◩" },
  { id: "glow", label: "Glow", icon: "✦" },
  { id: "blur", label: "Blur", icon: "≋" },
  { id: "duotone", label: "Duotone", icon: "◑" },
  { id: "outline", label: "Outline", icon: "▢" },
];

const BLEND_MODES = [
  { label: "Normal", value: "normal" },
  { label: "Multiply", value: "multiply" },
  { label: "Screen", value: "screen" },
  { label: "Overlay", value: "overlay" },
  { label: "Soft Light", value: "soft-light" },
  { label: "Hard Light", value: "hard-light" },
  { label: "Color Dodge", value: "color-dodge" },
  { label: "Luminosity", value: "luminosity" },
];

export function DesignInspectorPanel({
  page,
  selectedElement,
  onPageChange,
  onElementChange,
  onSelectElement,
  onDeleteElement,
  onDuplicateElement,
  onUploadBackgroundClick,
  onOpenLayoutModal,
  theme = "dark",
}: DesignInspectorPanelProps) {
  const [activeTab, setActiveTab] = useState<"design" | "elements" | "layers">("design");
  const [bgMode, setBgMode] = useState<"color" | "gradient" | "image">("image");

  const isDark = theme === "dark";

  // Current values
  const currentOpacity = Math.round(((selectedElement?.opacity ?? 1)) * 100);
  const currentRotation = selectedElement?.rotation ?? 0;
  const currentBrightness = (selectedElement as any)?.brightness ?? 100;
  const currentContrast = (selectedElement as any)?.contrast ?? 100;
  const currentSaturation = (selectedElement as any)?.saturate ?? 100;
  const currentFilter = (selectedElement as any)?.filter ?? "none";
  const currentEffect = selectedElement?.effect ?? "none";
  const currentBlendMask = selectedElement?.blendMask ?? "none";
  const currentBlendMode = selectedElement?.blendMode ?? "normal";

  // Filtered background thumbnails for quick picker
  const quickBgs = BACKGROUNDS_DATA.slice(0, 8);

  const handlePageSizeSelect = (width: number, height: number, label: string) => {
    onPageChange({
      ...page,
      size: { name: label, width, height },
    });
  };

  return (
    <aside
      className={`flex h-full w-[340px] shrink-0 flex-col border-l select-none transition-colors duration-200 ${
        isDark
          ? "border-white/[0.08] bg-[#0c1017] text-white"
          : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      {/* TOP TABS: DESIGN | ELEMENTS | LAYERS */}
      <div
        className={`flex h-12 shrink-0 border-b items-center px-3 gap-1 ${
          isDark ? "border-white/[0.08] bg-[#0f141f]" : "border-slate-200 bg-slate-50"
        }`}
      >
        <button
          type="button"
          onClick={() => setActiveTab("design")}
          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold tracking-wide transition ${
            activeTab === "design"
              ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
              : isDark
              ? "text-zinc-400 hover:text-white"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Design
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("elements")}
          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold tracking-wide transition ${
            activeTab === "elements"
              ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
              : isDark
              ? "text-zinc-400 hover:text-white"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Elements
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("layers")}
          className={`flex-1 rounded-lg py-1.5 text-xs font-semibold tracking-wide transition ${
            activeTab === "layers"
              ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
              : isDark
              ? "text-zinc-400 hover:text-white"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Layers ({page.elements.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DESIGN (MATCHING REFERENCE SCREENSHOT)                            */}
      {/* ========================================================================= */}
      {activeTab === "design" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* 1. PAGE SIZE */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                Page Size
              </label>
              <button
                type="button"
                onClick={onOpenLayoutModal}
                className="text-[10px] text-cyan-400 hover:underline"
              >
                Custom size
              </button>
            </div>
            <div className="relative">
              <select
                value={`${page.size.width}x${page.size.height}`}
                onChange={(e) => {
                  const [w, h] = e.target.value.split("x").map(Number);
                  const matched = PRESET_PAGE_SIZES.find(
                    (p) => p.width === w && p.height === h
                  );
                  handlePageSizeSelect(w, h, matched?.label ?? `${w} × ${h} px`);
                }}
                className={`w-full appearance-none rounded-xl border py-2 pl-3 pr-8 text-xs font-medium outline-none transition ${
                  isDark
                    ? "border-white/[0.08] bg-[#141a26] text-white hover:border-cyan-500/50 focus:border-cyan-500"
                    : "border-slate-200 bg-white text-slate-900 hover:border-cyan-600 focus:border-cyan-600"
                }`}
              >
                {PRESET_PAGE_SIZES.map((size) => (
                  <option
                    key={size.label}
                    value={`${size.width}x${size.height}`}
                    className={isDark ? "bg-[#141a26] text-white" : "bg-white text-slate-900"}
                  >
                    {size.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
            </div>
          </div>

          {/* 2. BACKGROUND SECTION */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block mb-2">
              Background
            </label>
            {/* Color / Gradient / Image Mode Pills */}
            <div
              className={`flex items-center rounded-xl p-1 mb-3 ${
                isDark ? "bg-[#141a26]" : "bg-slate-100"
              }`}
            >
              {(["color", "gradient", "image"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setBgMode(mode)}
                  className={`flex-1 rounded-lg py-1 text-xs font-medium capitalize transition ${
                    bgMode === mode
                      ? "bg-cyan-500 text-black font-semibold shadow-sm shadow-cyan-500/30"
                      : isDark
                      ? "text-zinc-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Background Thumbnails Row */}
            <div className="grid grid-cols-5 gap-1.5 mb-3">
              {quickBgs.slice(0, 5).map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => onPageChange({ ...page, background: bg.value })}
                  title={bg.name}
                  className={`relative h-12 rounded-lg border overflow-hidden transition ${
                    page.background === bg.value
                      ? "border-cyan-400 ring-2 ring-cyan-500/40"
                      : "border-white/10 hover:border-cyan-400/50"
                  }`}
                  style={{
                    ...(bg.type === "image"
                      ? { backgroundImage: `url(${bg.preview})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : { background: bg.preview }),
                  }}
                />
              ))}
            </div>

            {/* Upload Background Button */}
            <button
              type="button"
              onClick={onUploadBackgroundClick}
              className={`w-full flex items-center justify-center gap-2 rounded-xl border border-dashed py-2 text-xs font-medium transition ${
                isDark
                  ? "border-white/15 bg-white/[0.02] text-zinc-300 hover:border-cyan-400 hover:text-white hover:bg-cyan-500/5"
                  : "border-slate-300 bg-slate-50 text-slate-700 hover:border-cyan-600 hover:bg-cyan-50/50"
              }`}
            >
              <UploadCloud size={14} className="text-cyan-400" />
              <span>Upload Background</span>
            </button>
          </div>

          {/* 3. ADJUSTMENTS */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block mb-3">
              Adjustments
            </label>
            <div className="space-y-3">
              {/* Brightness */}
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Brightness</span>
                  <span className="font-mono text-zinc-200">{currentBrightness - 100}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={currentBrightness}
                  onChange={(e) => onElementChange({ brightness: Number(e.target.value) } as any)}
                  className="w-full accent-cyan-400 h-1.5 rounded-lg bg-zinc-700 cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Contrast</span>
                  <span className="font-mono text-zinc-200">{currentContrast - 100}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={currentContrast}
                  onChange={(e) => onElementChange({ contrast: Number(e.target.value) } as any)}
                  className="w-full accent-cyan-400 h-1.5 rounded-lg bg-zinc-700 cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Saturation</span>
                  <span className="font-mono text-zinc-200">{currentSaturation - 100}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={currentSaturation}
                  onChange={(e) => onElementChange({ saturate: Number(e.target.value) } as any)}
                  className="w-full accent-cyan-400 h-1.5 rounded-lg bg-zinc-700 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 4. FILTERS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                Filters
              </label>
              <button type="button" className="text-[10px] text-cyan-400 hover:underline">
                See all &gt;
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {FILTERS_LIST.map((f) => {
                const isSelected = currentFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() =>
                      onElementChange({
                        filter: f.id,
                        filterIntensity: 100,
                      } as any)
                    }
                    className={`group flex flex-col items-center gap-1 rounded-xl p-1 border text-center transition ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-500/10 ring-2 ring-cyan-500/40"
                        : "border-white/[0.08] hover:border-cyan-400/50"
                    }`}
                  >
                    <div
                      className={`h-11 w-full rounded-lg bg-cover bg-center ${f.previewClass}`}
                      style={{
                        backgroundImage: `url(${
                          selectedElement && isImage(selectedElement)
                            ? selectedElement.src
                            : "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80"
                        })`,
                      }}
                    />
                    <span className="text-[10px] font-medium text-zinc-300 line-clamp-1">
                      {f.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. EFFECTS */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block mb-2">
              Effects
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {EFFECTS_LIST.map((eff) => {
                const isActive = currentEffect === eff.id;
                return (
                  <button
                    key={eff.id}
                    type="button"
                    onClick={() =>
                      onElementChange({
                        effect: isActive ? "none" : eff.id,
                      })
                    }
                    className={`flex flex-col items-center justify-center h-16 rounded-xl border p-1 text-center transition ${
                      isActive
                        ? "border-cyan-400 bg-cyan-500/15 text-cyan-300 ring-2 ring-cyan-500/30 shadow-md shadow-cyan-500/20"
                        : isDark
                        ? "border-white/[0.08] bg-[#141a26] text-zinc-400 hover:border-cyan-400/50 hover:text-white"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-cyan-600"
                    }`}
                  >
                    <span className="text-base mb-0.5">{eff.icon}</span>
                    <span className="text-[10px] font-medium capitalize">
                      {eff.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. IMAGE BLEND (CIRCULAR + LINEAR) - REQUIRED BY USER */}
          <div
            className={`rounded-2xl border p-3.5 transition ${
              isDark ? "border-cyan-500/30 bg-[#0d1726]/80" : "border-cyan-200 bg-cyan-50/40"
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Blend size={14} className="text-cyan-400" />
                <label className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                  Image Blend
                </label>
              </div>
              <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-cyan-300">
                PRO
              </span>
            </div>

            {/* Circular + Linear Blend Buttons */}
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              <button
                type="button"
                onClick={() => onElementChange({ blendMask: "none" })}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition ${
                  currentBlendMask === "none"
                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold"
                    : isDark
                    ? "border-white/[0.08] bg-[#141a26] text-zinc-400 hover:text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:text-slate-900"
                }`}
              >
                <Maximize2 size={13} className="mb-1" />
                <span className="text-[10px]">Normal</span>
              </button>

              <button
                type="button"
                onClick={() => onElementChange({ blendMask: "circular" })}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition ${
                  currentBlendMask === "circular"
                    ? "border-cyan-400 bg-cyan-500/25 text-cyan-300 font-bold ring-2 ring-cyan-500/30 shadow"
                    : isDark
                    ? "border-white/[0.08] bg-[#141a26] text-zinc-400 hover:text-white hover:border-cyan-400/50"
                    : "border-slate-200 bg-white text-slate-600 hover:text-slate-900"
                }`}
              >
                <Disc size={13} className="mb-1 text-cyan-400" />
                <span className="text-[10px]">Circular</span>
              </button>

              <button
                type="button"
                onClick={() => onElementChange({ blendMask: "linear-bottom" })}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition ${
                  currentBlendMask === "linear" || currentBlendMask === "linear-bottom"
                    ? "border-cyan-400 bg-cyan-500/25 text-cyan-300 font-bold ring-2 ring-cyan-500/30 shadow"
                    : isDark
                    ? "border-white/[0.08] bg-[#141a26] text-zinc-400 hover:text-white hover:border-cyan-400/50"
                    : "border-slate-200 bg-white text-slate-600 hover:text-slate-900"
                }`}
              >
                <MoveVertical size={13} className="mb-1 text-cyan-400" />
                <span className="text-[10px]">Linear</span>
              </button>
            </div>

            {/* Blend Mode Dropdown */}
            <div className="flex items-center justify-between text-xs gap-2">
              <span className="text-zinc-400 text-[11px]">Blend Mode</span>
              <select
                value={currentBlendMode}
                onChange={(e) => onElementChange({ blendMode: e.target.value })}
                className={`rounded-lg border px-2 py-1 text-xs outline-none transition ${
                  isDark
                    ? "border-white/10 bg-[#161f2e] text-white hover:border-cyan-400"
                    : "border-slate-200 bg-white text-slate-900 hover:border-cyan-600"
                }`}
              >
                {BLEND_MODES.map((b) => (
                  <option key={b.value} value={b.value} className={isDark ? "bg-[#141a26]" : "bg-white"}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 7. FLIP & ROTATE */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block mb-2">
              Flip & Rotate
            </label>
            <div className="flex items-center gap-2">
              {/* Rotation input */}
              <div
                className={`flex flex-1 items-center justify-center rounded-xl border py-1.5 px-3 ${
                  isDark ? "border-white/[0.08] bg-[#141a26]" : "border-slate-200 bg-slate-50"
                }`}
              >
                <span className="text-xs font-mono text-zinc-200">{currentRotation}°</span>
              </div>

              {/* Flip Horizontal */}
              <button
                type="button"
                onClick={() =>
                  onElementChange({
                    flipX: !selectedElement?.flipX,
                  })
                }
                title="Flip Horizontal"
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                  selectedElement?.flipX
                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                    : isDark
                    ? "border-white/[0.08] bg-[#141a26] text-zinc-400 hover:text-white"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900"
                }`}
              >
                <FlipHorizontal size={14} />
              </button>

              {/* Flip Vertical */}
              <button
                type="button"
                onClick={() =>
                  onElementChange({
                    flipY: !selectedElement?.flipY,
                  })
                }
                title="Flip Vertical"
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                  selectedElement?.flipY
                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                    : isDark
                    ? "border-white/[0.08] bg-[#141a26] text-zinc-400 hover:text-white"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900"
                }`}
              >
                <FlipVertical size={14} />
              </button>

              {/* Rotate 90 deg */}
              <button
                type="button"
                onClick={() =>
                  onElementChange({
                    rotation: (currentRotation + 90) % 360,
                  })
                }
                title="Rotate 90 degrees"
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                  isDark
                    ? "border-white/[0.08] bg-[#141a26] text-zinc-400 hover:text-white hover:border-cyan-400/50"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:border-cyan-600"
                }`}
              >
                <RotateCw size={14} />
              </button>
            </div>
          </div>

          {/* 8. TRANSPARENCY - REQUIRED BY USER */}
          <div
            className={`rounded-2xl border p-3.5 transition ${
              isDark ? "border-white/[0.08] bg-[#101622]" : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Droplet size={14} className="text-cyan-400" />
                <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                  Transparency
                </label>
              </div>
              <span className="font-mono text-xs font-semibold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                {currentOpacity}%
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="0"
              max="100"
              value={currentOpacity}
              onChange={(e) =>
                onElementChange({
                  opacity: Number(e.target.value) / 100,
                })
              }
              className="w-full accent-cyan-400 h-1.5 rounded-lg bg-zinc-700 cursor-pointer mb-2.5"
            />

            {/* Quick Preset Buttons */}
            <div className="flex items-center justify-between gap-1.5">
              {[100, 75, 50, 25].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => onElementChange({ opacity: pct / 100 })}
                  className={`flex-1 rounded-lg py-1 text-[10px] font-medium transition ${
                    currentOpacity === pct
                      ? "bg-cyan-500 text-black font-bold shadow-sm shadow-cyan-500/30"
                      : isDark
                      ? "bg-white/[0.04] text-zinc-400 hover:text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ELEMENTS (SHAPES, FRAMES, TEXT SHORTCUTS)                         */}
      {/* ========================================================================= */}
      {activeTab === "elements" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-xs text-zinc-400">
            Click any element below to add directly to the canvas:
          </p>

          <div>
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Shapes
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  const newEl = {
                    id: `rect-${Date.now()}`,
                    type: "rectangle",
                    zIndex: page.elements.length,
                    x: page.size.width / 2 - 100,
                    y: page.size.height / 2 - 100,
                    width: 200,
                    height: 200,
                    fill: "#3b82f6",
                    stroke: "#1d4ed8",
                    strokeWidth: 0,
                    cornerRadius: 16,
                    rotation: 0,
                    opacity: 1,
                    locked: false,
                    hidden: false,
                  } as CanvasElement;
                  onPageChange({ ...page, elements: [...page.elements, newEl] });
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition ${
                  isDark
                    ? "border-white/10 bg-[#141a26] text-zinc-300 hover:border-cyan-400 hover:text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-cyan-600"
                }`}
              >
                <div className="h-8 w-8 rounded-lg bg-blue-500 mb-1" />
                <span className="text-[10px]">Rounded Rect</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const newEl = {
                    id: `ellipse-${Date.now()}`,
                    type: "ellipse",
                    zIndex: page.elements.length,
                    x: page.size.width / 2 - 90,
                    y: page.size.height / 2 - 90,
                    width: 180,
                    height: 180,
                    fill: "#ec4899",
                    stroke: "#db2777",
                    strokeWidth: 0,
                    rotation: 0,
                    opacity: 1,
                    locked: false,
                    hidden: false,
                  } as CanvasElement;
                  onPageChange({ ...page, elements: [...page.elements, newEl] });
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition ${
                  isDark
                    ? "border-white/10 bg-[#141a26] text-zinc-300 hover:border-cyan-400 hover:text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-cyan-600"
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-pink-500 mb-1" />
                <span className="text-[10px]">Circle</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const newEl = {
                    id: `line-${Date.now()}`,
                    type: "line",
                    zIndex: page.elements.length,
                    x: page.size.width / 2 - 120,
                    y: page.size.height / 2,
                    width: 240,
                    height: 4,
                    fill: "#06b6d4",
                    stroke: "#06b6d4",
                    strokeWidth: 4,
                    rotation: 0,
                    opacity: 1,
                    locked: false,
                    hidden: false,
                  } as CanvasElement;
                  onPageChange({ ...page, elements: [...page.elements, newEl] });
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition ${
                  isDark
                    ? "border-white/10 bg-[#141a26] text-zinc-300 hover:border-cyan-400 hover:text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-cyan-600"
                }`}
              >
                <div className="h-1.5 w-10 bg-cyan-400 rounded-full my-3.5" />
                <span className="text-[10px]">Line</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LAYERS                                                             */}
      {/* ========================================================================= */}
      {activeTab === "layers" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {page.elements.length === 0 ? (
            <div className="text-center py-10 text-xs text-zinc-500">
              No elements on canvas
            </div>
          ) : (
            [...page.elements]
              .sort((a, b) => b.zIndex - a.zIndex)
              .map((el) => {
                const isSelected = selectedElement?.id === el.id;
                return (
                  <div
                    key={el.id}
                    onClick={() => onSelectElement?.(el.id)}
                    className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-500/15 text-white shadow-sm shadow-cyan-500/20"
                        : isDark
                        ? "border-white/[0.08] bg-[#141a26] text-zinc-300 hover:border-cyan-400/50"
                        : "border-slate-200 bg-slate-50 text-slate-800 hover:border-cyan-600"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="rounded bg-black/40 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-cyan-300">
                        {el.type}
                      </span>
                      <span className="truncate text-xs font-medium">
                        {isText(el) ? el.text || "Text" : isImage(el) ? "Image Layer" : "Shape Layer"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onElementChange({ hidden: !el.hidden });
                        }}
                        className="p-1 hover:text-cyan-400 transition"
                      >
                        {el.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onElementChange({ locked: !el.locked });
                        }}
                        className="p-1 hover:text-cyan-400 transition"
                      >
                        {el.locked ? <Lock size={13} /> : <Unlock size={13} />}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteElement?.(el.id);
                        }}
                        className="p-1 text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}
    </aside>
  );
}
