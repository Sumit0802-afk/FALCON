import React from "react";
import { PreviewMode } from "@/types/email";

interface EditorToolbarProps {
  emailName: string;
  previewMode: PreviewMode;
  activeView: "visual" | "html";
  canUndo: boolean;
  canRedo: boolean;
  isSaved: boolean;
  onNameChange: (name: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onPreviewModeChange: (mode: PreviewMode) => void;
  onActiveViewChange: (view: "visual" | "html") => void;
  onDesignByHtml: () => void;
  onPreview: () => void;
  onSave: () => void;
  onExportHtml: () => void;
  onSendEmail: () => void;
  onBack: () => void;
}

export default function EditorToolbar({
  emailName,
  previewMode,
  activeView,
  canUndo,
  canRedo,
  isSaved,
  onNameChange,
  onUndo,
  onRedo,
  onPreviewModeChange,
  onActiveViewChange,
  onDesignByHtml,
  onPreview,
  onSave,
  onExportHtml,
  onSendEmail,
  onBack,
}: EditorToolbarProps) {
  return (
    <div
      className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] bg-[#070709] px-4"
      style={{ backdropFilter: "blur(16px)" }}
    >
      {/* ─── LEFT: Navigation, Title & Primary Workflow Switch ─── */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          className="flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M5 12l7-7M5 12l7 7" />
          </svg>
          Back
        </button>

        <div className="h-5 w-px shrink-0 bg-white/[0.08]" />

        {/* Email name */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={emailName}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-[140px] truncate rounded-lg border border-transparent bg-transparent px-2 py-1 text-[13px] font-semibold text-zinc-100 outline-none transition-colors hover:border-white/[0.08] focus:border-white/[0.2] focus:bg-white/[0.04]"
            placeholder="Untitled Email"
          />
          {isSaved && (
            <span className="shrink-0 text-[10px] font-medium text-[#00D084]">
              ✓ Saved
            </span>
          )}
        </div>

        <div className="hidden md:block h-5 w-px shrink-0 bg-white/[0.08]" />

        {/* ─── PRIMARY WORKFLOW CONTROLS: Visual vs HTML Toggle & Design by HTML Button ─── */}
        <div className="hidden lg:flex items-center gap-2">
          {/* VISUAL DESIGN | HTML CODE Toggle */}
          <div className="flex items-center rounded-lg border border-white/[0.1] bg-[#0f0f13] p-0.5">
            <button
              type="button"
              onClick={() => onActiveViewChange("visual")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-[11px] font-semibold transition-all ${
                activeView === "visual"
                  ? "bg-white/[0.12] text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
              Visual Design
            </button>
            <button
              type="button"
              onClick={() => onActiveViewChange("html")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-[11px] font-semibold transition-all ${
                activeView === "html"
                  ? "bg-[#FF4D4D]/20 text-[#FF4D4D] shadow-sm border border-[#FF4D4D]/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span className="font-mono text-[10px] font-bold text-[#FF4D4D]">&lt;/&gt;</span>
              HTML Code
            </button>
          </div>

          {/* Premium Highlighted RED "Design by HTML →" Button */}
          <button
            type="button"
            onClick={onDesignByHtml}
            className="group flex items-center gap-2 rounded-lg bg-[#0a0a0c] px-3.5 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-[#121216] active:scale-[0.98]"
            style={{
              border: "1px solid #FF4D4D",
              boxShadow: "0 0 14px rgba(255, 77, 77, 0.35)",
            }}
            title="Paste HTML code and instantly turn it into an editable email template."
          >
            <span className="flex h-4 w-4 items-center justify-center rounded bg-[#FF4D4D]/20 font-mono text-[10px] font-bold text-[#FF4D4D]">
              &lt;&gt;
            </span>
            <span>Design by HTML</span>
            <span className="text-[#FF4D4D] transition-transform group-hover:translate-x-0.5">→</span>
          </button>
        </div>
      </div>

      {/* ─── RIGHT: History, Viewport, Preview, Import, Save, Export & Send ─── */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Undo / Redo */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-200 disabled:opacity-25 disabled:pointer-events-none"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-200 disabled:opacity-25 disabled:pointer-events-none"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
            </svg>
          </button>
        </div>

        <div className="hidden sm:block h-5 w-px bg-white/[0.08]" />

        {/* Desktop / Mobile Switcher */}
        <div className="hidden sm:flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
          <button
            type="button"
            onClick={() => onPreviewModeChange("desktop")}
            title="Desktop canvas (600px)"
            className={`flex h-7 items-center gap-1 rounded-md px-2.5 text-[11px] font-medium transition-colors ${
              previewMode === "desktop"
                ? "bg-white/[0.12] text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
            </svg>
            Desktop
          </button>
          <button
            type="button"
            onClick={() => onPreviewModeChange("mobile")}
            title="Mobile canvas (375px)"
            className={`flex h-7 items-center gap-1 rounded-md px-2.5 text-[11px] font-medium transition-colors ${
              previewMode === "mobile"
                ? "bg-white/[0.12] text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <svg width="10" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" />
            </svg>
            Mobile
          </button>
        </div>

        <div className="h-5 w-px bg-white/[0.08]" />

        {/* Preview */}
        <button
          type="button"
          onClick={onPreview}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
          </svg>
          <span className="hidden sm:inline">Preview</span>
        </button>

        {/* Import HTML (Toolbar action matching section 9) */}
        <button
          type="button"
          onClick={onDesignByHtml}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-[#FF4D4D]/40 bg-[#FF4D4D]/10 px-3 text-[11px] font-medium text-zinc-200 transition-colors hover:bg-[#FF4D4D]/20 hover:text-white"
          title="Import HTML into visual editor"
        >
          <span className="font-mono text-[11px] font-bold text-[#FF4D4D]">&lt;/&gt;</span>
          <span className="hidden md:inline">Import HTML</span>
        </button>

        {/* Save */}
        <button
          type="button"
          onClick={onSave}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
          </svg>
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Export HTML */}
        <button
          type="button"
          onClick={onExportHtml}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 text-[11px] font-medium text-zinc-200 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span className="hidden md:inline">Export HTML</span>
        </button>

        {/* Send Email (Prominent Green-Cyan styling as per sections 10 & 20) */}
        <button
          type="button"
          onClick={onSendEmail}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-[#00D084] px-3.5 text-[11px] font-bold text-black shadow-lg transition-all hover:bg-[#00b872] active:scale-[0.98]"
          style={{
            boxShadow: "0 0 14px rgba(0, 208, 132, 0.35)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          <span>Send Email</span>
        </button>
      </div>
    </div>
  );
}
