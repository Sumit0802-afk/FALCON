import React, { useState } from "react";
import {
  Undo2,
  Redo2,
  Cloud,
  Check,
  Share2,
  Download,
  ChevronDown,
  Sun,
  Moon,
  FolderOpen,
  Maximize2,
  User,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

interface TopBarProps {
  title: string;
  onTitleChange: (title: string) => void;
  zoomPercent?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onFitToScreen?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExportPng: () => void;
  onExportJpeg?: () => void;
  onExportPdf?: () => void;
  onBack?: () => void;
  onOpenResize?: () => void;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
  onOpenAssetAdmin?: () => void;
}

export function TopBar({
  title,
  onTitleChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExportPng,
  onExportJpeg,
  onExportPdf,
  onBack,
  onOpenResize,
  theme = "dark",
  onToggleTheme,
  onOpenAssetAdmin,
}: TopBarProps) {
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);

  const isDark = theme === "dark";

  return (
    <header
      className={`relative z-30 flex h-14 shrink-0 items-center justify-between border-b px-4 transition-colors duration-200 select-none ${
        isDark
          ? "border-white/[0.08] bg-[#0c1017] text-white"
          : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      {/* ========================================================================= */}
      {/* LEFT: LOGO, FILE, RESIZE, UNDO/REDO, CLOUD STATUS                         */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-3">
        {/* Falcon Cyan Logo */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 group cursor-pointer"
          title="Falcon Home"
        >
          {/* Falcon Bird Logo in White + Previous Design/Font for FALCON name */}
          <div className="flex items-center gap-2.5 group-hover:scale-105 transition-transform">
            <img
              src="/falcon-logo-white.png"
              alt="Falcon Logo"
              className="h-7 w-7 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]"
            />
            <span className="text-sm font-black tracking-wider font-sans text-cyan-400">
              FALCON
            </span>
          </div>
        </button>

        <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

        {/* File Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setFileMenuOpen(!fileMenuOpen)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              isDark
                ? "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            File
          </button>
          {fileMenuOpen && (
            <div
              className={`absolute left-0 top-full mt-1.5 w-44 rounded-xl border p-1 shadow-2xl z-50 ${
                isDark
                  ? "border-white/10 bg-[#161c28] text-white"
                  : "border-slate-200 bg-white text-slate-800"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setFileMenuOpen(false);
                  onExportPng();
                }}
                className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-cyan-500/15 hover:text-cyan-400 transition"
              >
                Save & Export PNG
              </button>
              <button
                type="button"
                onClick={() => {
                  setFileMenuOpen(false);
                  onBack?.();
                }}
                className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-cyan-500/15 hover:text-cyan-400 transition"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Resize button */}
        <button
          type="button"
          onClick={onOpenResize}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
            isDark
              ? "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          Resize
        </button>

        {/* Undo & Redo */}
        <div className="flex items-center gap-0.5 ml-1">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`p-1.5 rounded-lg transition disabled:opacity-30 ${
              isDark
                ? "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Undo2 size={15} />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`p-1.5 rounded-lg transition disabled:opacity-30 ${
              isDark
                ? "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Redo2 size={15} />
          </button>
        </div>

        {/* Cloud All Changes Saved */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-zinc-400 pl-2">
          <Cloud size={13} className="text-cyan-400" />
          <span>All changes saved</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT: THEME TOGGLE, UPGRADE TO PRO, SHARE, DOWNLOAD, AVATAR              */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2.5">
        {/* Dark / Light Mode Toggle Button (Explicit User Requirement) */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          className={`flex h-8 w-8 items-center justify-center rounded-xl border transition ${
            isDark
              ? "border-white/10 bg-[#161c28] text-amber-300 hover:border-amber-400/50 hover:bg-[#1a2233]"
              : "border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-200"
          }`}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>


        {/* Asset Governance & Admin */}
        {onOpenAssetAdmin && (
          <button
            type="button"
            onClick={onOpenAssetAdmin}
            title="Open Asset Governance & Admin"
            className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition ${
              isDark
                ? "border-cyan-500/30 bg-cyan-950/20 text-cyan-300 hover:bg-cyan-500/20 shadow-sm shadow-cyan-500/10"
                : "border-cyan-300 bg-cyan-50 text-cyan-800 hover:bg-cyan-100"
            }`}
          >
            <ShieldAlert size={14} className="text-cyan-400" />
            <span>Admin</span>
          </button>
        )}

        {/* Share Button */}
        <button
          type="button"
          className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
            isDark
              ? "border-white/10 bg-[#161c28] text-zinc-200 hover:bg-white/[0.08]"
              : "border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200"
          }`}
        >
          Share
        </button>

        {/* Download Button with Dropdown (Cyan Gradient Button) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDownloadOpen(!downloadOpen)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 px-3.5 py-1.5 text-xs font-bold text-black shadow-lg shadow-cyan-500/25 transition hover:brightness-105 active:scale-95"
          >
            <span>Download</span>
            <ChevronDown size={13} strokeWidth={2.5} />
          </button>

          {downloadOpen && (
            <div
              className={`absolute right-0 top-full mt-2 w-48 rounded-2xl border p-1.5 shadow-2xl z-50 ${
                isDark
                  ? "border-white/10 bg-[#141b27] text-white"
                  : "border-slate-200 bg-white text-slate-800"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setDownloadOpen(false);
                  onExportPng();
                }}
                className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-cyan-500/15 hover:text-cyan-400 font-medium transition flex items-center justify-between"
              >
                <span>PNG (High Quality)</span>
                <span className="text-[10px] text-zinc-400">Default</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDownloadOpen(false);
                  onExportJpeg ? onExportJpeg() : onExportPng();
                }}
                className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-cyan-500/15 hover:text-cyan-400 font-medium transition flex items-center justify-between"
              >
                <span>JPEG (Small File)</span>
                <span className="text-[10px] text-zinc-400">Web</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDownloadOpen(false);
                  onExportPdf ? onExportPdf() : onExportPng();
                }}
                className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-cyan-500/15 hover:text-cyan-400 font-medium transition flex items-center justify-between"
              >
                <span>PDF (Standard)</span>
                <span className="text-[10px] text-zinc-400">Print</span>
              </button>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-semibold text-xs shadow">
          <User size={14} />
        </div>
      </div>
    </header>
  );
}