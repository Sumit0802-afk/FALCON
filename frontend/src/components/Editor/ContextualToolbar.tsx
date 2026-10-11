import React, { useState } from "react";
import {
  CanvasElement,
  isText,
  isImage,
  isShape,
  ImageFilter,
} from "@/types";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Play,
  Layers,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronDown,
  Droplet,
  Blend,
  Disc,
  MoveVertical,
  Minus,
  Plus,
  Palette,
  Maximize2,
} from "lucide-react";
import { GOOGLE_FONTS_LIST } from "@/services/fontService";

interface ContextualToolbarProps {
  selectedElement?: CanvasElement;
  onElementChange: (patch: Partial<CanvasElement>) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onOpenEffects?: () => void;
  theme?: "dark" | "light";
}

export function ContextualToolbar({
  selectedElement,
  onElementChange,
  onDuplicate,
  onDelete,
  onOpenEffects,
  theme = "dark",
}: ContextualToolbarProps) {
  const [transparencyOpen, setTransparencyOpen] = useState(false);
  const [blendOpen, setBlendOpen] = useState(false);
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);

  const isDark = theme === "dark";

  if (!selectedElement) {
    return null;
  }

  const isTextEl = isText(selectedElement);
  const isImageEl = isImage(selectedElement);

  const opacityPercent = Math.round((selectedElement.opacity ?? 1) * 100);
  const blendMask = selectedElement.blendMask ?? "none";
  const blendMode = selectedElement.blendMode ?? "normal";

  return (
    <div
      className={`flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 shadow-2xl backdrop-blur-md select-none transition-colors duration-200 z-20 ${
        isDark
          ? "border-white/[0.1] bg-[#121722]/90 text-white shadow-black/60"
          : "border-slate-200 bg-white/95 text-slate-900 shadow-slate-200"
      }`}
    >
      {/* ========================================================================= */}
      {/* TEXT SPECIFIC CONTROLS (IF TEXT SELECTED)                                 */}
      {/* ========================================================================= */}
      {isTextEl && (
        <>
          {/* FONT FAMILY DROPDOWN */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-medium transition ${
                isDark
                  ? "border-white/10 bg-[#161c28] hover:border-cyan-400"
                  : "border-slate-200 bg-slate-50 hover:border-cyan-600"
              }`}
            >
              <span className="max-w-[100px] truncate">
                {selectedElement.fontFamily || "Inter"}
              </span>
              <ChevronDown size={12} className="text-zinc-400" />
            </button>

            {fontDropdownOpen && (
              <div
                className={`absolute left-0 top-full mt-1.5 w-48 max-h-56 overflow-y-auto rounded-xl border p-1 shadow-2xl z-50 ${
                  isDark
                    ? "border-white/10 bg-[#141b27] text-white"
                    : "border-slate-200 bg-white text-slate-800"
                }`}
              >
                {GOOGLE_FONTS_LIST.slice(0, 30).map((font) => (
                  <button
                    key={font}
                    type="button"
                    onClick={() => {
                      onElementChange({ fontFamily: font });
                      setFontDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1 text-xs rounded-lg transition hover:bg-cyan-500/15 hover:text-cyan-400 ${
                      selectedElement.fontFamily === font ? "text-cyan-400 font-bold" : ""
                    }`}
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* FONT SIZE (- SIZE +) */}
          <div
            className={`flex items-center rounded-xl border px-1 ${
              isDark ? "border-white/10 bg-[#161c28]" : "border-slate-200 bg-slate-50"
            }`}
          >
            <button
              type="button"
              onClick={() =>
                onElementChange({
                  fontSize: Math.max(8, (selectedElement.fontSize || 32) - 2),
                })
              }
              className="p-1 hover:text-cyan-400"
            >
              <Minus size={12} />
            </button>
            <span className="px-1.5 text-xs font-mono font-semibold">
              {selectedElement.fontSize || 32}
            </span>
            <button
              type="button"
              onClick={() =>
                onElementChange({
                  fontSize: Math.min(300, (selectedElement.fontSize || 32) + 2),
                })
              }
              className="p-1 hover:text-cyan-400"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* TEXT COLOR "A" */}
          <label
            title="Text Color"
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl px-2 py-0.5 hover:bg-white/10 transition"
          >
            <span className="text-xs font-bold font-serif leading-none">A</span>
            <span
              className="h-1 w-3.5 rounded-full mt-0.5"
              style={{ backgroundColor: selectedElement.color || "#ffffff" }}
            />
            <input
              type="color"
              value={selectedElement.color || "#ffffff"}
              onChange={(e) => onElementChange({ color: e.target.value })}
              className="sr-only"
            />
          </label>

          {/* BOLD, ITALIC, UNDERLINE */}
          <button
            type="button"
            onClick={() =>
              onElementChange({
                fontWeight: selectedElement.fontWeight >= 700 ? 400 : 700,
              })
            }
            className={`p-1.5 rounded-xl transition ${
              selectedElement.fontWeight >= 700
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Bold size={13} />
          </button>
          <button
            type="button"
            onClick={() =>
              onElementChange({
                italic: !selectedElement.italic,
              })
            }
            className={`p-1.5 rounded-xl transition ${
              selectedElement.italic
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Italic size={13} />
          </button>

          <div className="h-4 w-px bg-white/10 mx-0.5" />
        </>
      )}

      {/* ========================================================================= */}
      {/* COMMON ACTIONS: EFFECTS, ANIMATE, POSITION                                */}
      {/* ========================================================================= */}
      <button
        type="button"
        onClick={onOpenEffects}
        className={`px-2.5 py-1 rounded-xl text-xs font-medium transition ${
          selectedElement.effect && selectedElement.effect !== "none"
            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
            : isDark
            ? "hover:bg-white/10 text-zinc-300"
            : "hover:bg-slate-100 text-slate-700"
        }`}
      >
        Effects
      </button>

      <button
        type="button"
        className={`px-2.5 py-1 rounded-xl text-xs font-medium transition ${
          isDark ? "hover:bg-white/10 text-zinc-300" : "hover:bg-slate-100 text-slate-700"
        }`}
      >
        Animate
      </button>

      <button
        type="button"
        className={`px-2.5 py-1 rounded-xl text-xs font-medium transition ${
          isDark ? "hover:bg-white/10 text-zinc-300" : "hover:bg-slate-100 text-slate-700"
        }`}
      >
        Position
      </button>

      <div className="h-4 w-px bg-white/10 mx-0.5" />

      {/* ========================================================================= */}
      {/* 1. IMAGE BLEND BUTTON (CIRCULAR + LINEAR) - EXPLICIT USER REQUIREMENT    */}
      {/* ========================================================================= */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setBlendOpen(!blendOpen)}
          title="Image Blend Modes & Soft Masks"
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold transition ${
            blendMask !== "none"
              ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/30"
              : isDark
              ? "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
              : "border border-cyan-600/30 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
          }`}
        >
          <Blend size={13} />
          <span>Blend</span>
          <ChevronDown size={11} />
        </button>

        {blendOpen && (
          <div
            className={`absolute left-0 top-full mt-2 w-56 rounded-2xl border p-3 shadow-2xl z-50 ${
              isDark
                ? "border-white/10 bg-[#121824] text-white"
                : "border-slate-200 bg-white text-slate-800"
            }`}
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-2">
              Mask Gradient Blend
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-3">
              <button
                type="button"
                onClick={() => {
                  onElementChange({ blendMask: "none" });
                  setBlendOpen(false);
                }}
                className={`py-1.5 px-1 rounded-lg border text-center text-[10px] font-medium transition ${
                  blendMask === "none"
                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                    : isDark
                    ? "border-white/10 hover:text-white"
                    : "border-slate-200"
                }`}
              >
                Off
              </button>

              <button
                type="button"
                onClick={() => {
                  onElementChange({ blendMask: "circular" });
                  setBlendOpen(false);
                }}
                className={`py-1.5 px-1 rounded-lg border text-center text-[10px] font-medium transition flex flex-col items-center gap-0.5 ${
                  blendMask === "circular"
                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold"
                    : isDark
                    ? "border-white/10 hover:text-white"
                    : "border-slate-200"
                }`}
              >
                <Disc size={12} className="text-cyan-400" />
                <span>Circular</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onElementChange({ blendMask: "linear-bottom" });
                  setBlendOpen(false);
                }}
                className={`py-1.5 px-1 rounded-lg border text-center text-[10px] font-medium transition flex flex-col items-center gap-0.5 ${
                  blendMask === "linear" || blendMask === "linear-bottom"
                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold"
                    : isDark
                    ? "border-white/10 hover:text-white"
                    : "border-slate-200"
                }`}
              >
                <MoveVertical size={12} className="text-cyan-400" />
                <span>Linear</span>
              </button>
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Mix Blend Mode
            </div>
            <select
              value={blendMode}
              onChange={(e) => onElementChange({ blendMode: e.target.value })}
              className={`w-full rounded-lg border px-2 py-1 text-xs outline-none ${
                isDark ? "border-white/10 bg-[#1a2233] text-white" : "border-slate-200 bg-slate-50"
              }`}
            >
              <option value="normal">Normal</option>
              <option value="multiply">Multiply</option>
              <option value="screen">Screen</option>
              <option value="overlay">Overlay</option>
              <option value="soft-light">Soft Light</option>
              <option value="luminosity">Luminosity</option>
            </select>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. TRANSPARENCY BUTTON - EXPLICIT USER REQUIREMENT                         */}
      {/* ========================================================================= */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setTransparencyOpen(!transparencyOpen)}
          title="Adjust Transparency"
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium transition ${
            opacityPercent < 100
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              : isDark
              ? "hover:bg-white/10 text-zinc-300"
              : "hover:bg-slate-100 text-slate-700"
          }`}
        >
          <Droplet size={13} className={opacityPercent < 100 ? "text-cyan-400" : ""} />
          <span>{opacityPercent}%</span>
        </button>

        {transparencyOpen && (
          <div
            className={`absolute left-0 top-full mt-2 w-48 rounded-2xl border p-3 shadow-2xl z-50 ${
              isDark
                ? "border-white/10 bg-[#121824] text-white"
                : "border-slate-200 bg-white text-slate-800"
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-zinc-400">Opacity</span>
              <span className="font-mono font-bold text-cyan-400">{opacityPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={opacityPercent}
              onChange={(e) => onElementChange({ opacity: Number(e.target.value) / 100 })}
              className="w-full accent-cyan-400 h-1.5 rounded-lg bg-zinc-700 cursor-pointer"
            />
          </div>
        )}
      </div>

      <div className="h-4 w-px bg-white/10 mx-0.5" />

      {/* LOCK / UNLOCK */}
      <button
        type="button"
        onClick={() => onElementChange({ locked: !selectedElement.locked })}
        title={selectedElement.locked ? "Unlock element" : "Lock element"}
        className={`p-1.5 rounded-xl transition ${
          selectedElement.locked
            ? "bg-amber-500/20 text-amber-400"
            : "text-zinc-400 hover:text-white"
        }`}
      >
        {selectedElement.locked ? <Lock size={13} /> : <Unlock size={13} />}
      </button>

      {/* DUPLICATE */}
      <button
        type="button"
        onClick={onDuplicate}
        title="Duplicate (Ctrl+D)"
        className="p-1.5 rounded-xl text-zinc-400 hover:text-white transition"
      >
        <Copy size={13} />
      </button>

      {/* DELETE */}
      <button
        type="button"
        onClick={onDelete}
        title="Delete (Delete)"
        className="p-1.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
