import React from "react";
import { DesignPage } from "@/types";
import {
  Play,
  Plus,
  Undo2,
  Redo2,
  Maximize2,
  Minus,
  Minimize2,
  Expand,
  LayoutTemplate,
} from "lucide-react";

interface BottomPageFilmstripProps {
  pages: DesignPage[];
  currentPageIndex: number;
  onSelectPage: (index: number) => void;
  onAddPage: () => void;
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomSliderChange: (value: number) => void;
  onFitToScreen: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onToggleFullscreen?: () => void;
  theme?: "dark" | "light";
}

export function BottomPageFilmstrip({
  pages,
  currentPageIndex,
  onSelectPage,
  onAddPage,
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onZoomSliderChange,
  onFitToScreen,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onToggleFullscreen,
  theme = "dark",
}: BottomPageFilmstripProps) {
  const isDark = theme === "dark";

  return (
    <div
      className={`relative z-20 flex h-20 shrink-0 items-center justify-between border-t px-4 select-none transition-colors duration-200 ${
        isDark
          ? "border-white/[0.08] bg-[#0c1017] text-white"
          : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      {/* ── LEFT: PLAY BUTTON ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          title="Play presentation preview"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 text-black shadow-lg shadow-cyan-500/30 transition hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Play size={16} fill="black" className="ml-0.5" />
        </button>

        <span className="text-xs font-semibold text-zinc-400 hidden sm:inline">
          Page {currentPageIndex + 1} / {pages.length}
        </span>
      </div>

      {/* ── CENTER: PAGE THUMBNAILS FILMSTRIP ── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[50vw] py-1 px-2">
        {pages.map((p, idx) => {
          const isActive = idx === currentPageIndex;
          return (
            <button
              key={p.id || idx}
              type="button"
              onClick={() => onSelectPage(idx)}
              className={`group relative flex h-14 w-20 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border transition-all duration-200 cursor-pointer ${
                isActive
                  ? "border-cyan-400 ring-2 ring-cyan-500/40 shadow-md shadow-cyan-500/20 scale-105"
                  : isDark
                  ? "border-white/10 hover:border-white/30 bg-[#161c28]"
                  : "border-slate-300 hover:border-slate-400 bg-slate-100"
              }`}
            >
              {/* Background preview */}
              <div
                className="absolute inset-0 transition-transform group-hover:scale-105"
                style={{
                  ...(p.background
                    ? p.background.startsWith("http") || p.background.startsWith("data:")
                      ? { backgroundImage: `url(${p.background})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : { background: p.background }
                    : { backgroundColor: "#ffffff" }),
                }}
              />
              <div className="absolute inset-0 bg-black/40" />

              <span className="relative z-10 text-[10px] font-bold text-white drop-shadow">
                {idx + 1}
              </span>
            </button>
          );
        })}

        {/* Add Page Button */}
        <button
          type="button"
          onClick={onAddPage}
          title="Add New Page"
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed transition hover:scale-105 ${
            isDark
              ? "border-white/20 bg-white/[0.02] text-zinc-400 hover:border-cyan-400 hover:text-white"
              : "border-slate-300 bg-slate-50 text-slate-500 hover:border-cyan-600 hover:text-slate-900"
          }`}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* ── RIGHT: UNDO/REDO, ZOOM SLIDER, FIT & FULLSCREEN ── */}
      <div className="flex items-center gap-3">
        {/* Undo / Redo */}
        <div className="hidden md:flex items-center gap-1">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
            className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 transition"
          >
            <Undo2 size={14} />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
            className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 transition"
          >
            <Redo2 size={14} />
          </button>
        </div>

        {/* Zoom Slider */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="20"
            max="300"
            value={zoomPercent}
            onChange={(e) => onZoomSliderChange(Number(e.target.value))}
            className="w-20 sm:w-28 accent-cyan-400 h-1.5 rounded-lg bg-zinc-700 cursor-pointer"
          />
          <span className="min-w-[36px] text-xs font-mono font-semibold text-zinc-300">
            {zoomPercent}%
          </span>
        </div>

        {/* Fit to screen */}
        <button
          type="button"
          onClick={onFitToScreen}
          title="Fit to Screen"
          className={`p-1.5 rounded-lg border transition ${
            isDark
              ? "border-white/10 text-zinc-400 hover:border-cyan-400/50 hover:text-cyan-300"
              : "border-slate-200 text-slate-600 hover:border-cyan-600 hover:text-slate-900"
          }`}
        >
          <Maximize2 size={14} />
        </button>

        {/* Fullscreen */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          title="Fullscreen View"
          className={`p-1.5 rounded-lg border transition hidden sm:flex ${
            isDark
              ? "border-white/10 text-zinc-400 hover:border-cyan-400/50 hover:text-cyan-300"
              : "border-slate-200 text-slate-600 hover:border-cyan-600 hover:text-slate-900"
          }`}
        >
          <Expand size={14} />
        </button>
      </div>
    </div>
  );
}
