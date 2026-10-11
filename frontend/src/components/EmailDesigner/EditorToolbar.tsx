import React, { useEffect, useRef, useState } from "react";
import { PreviewMode, SaveStatus } from "@/types/email";

interface EditorToolbarProps {
  emailName: string;
  previewMode: PreviewMode;
  activeView: "visual" | "html";
  canUndo: boolean;
  canRedo: boolean;
  saveStatus: SaveStatus;
  /** True when changes are stored in this browser only (not signed in) */
  localOnly?: boolean;
  onNameChange: (name: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onPreviewModeChange: (mode: PreviewMode) => void;
  onActiveViewChange: (view: "visual" | "html") => void;
  onDesignByHtml: () => void;
  onPreview: () => void;
  onSave: () => void;
  onSaveAsTemplate: () => void;
  onOpenTemplates: () => void;
  onExportHtml: () => void;
  onSendTest: () => void;
  onSendEmail: () => void;
  onBack: () => void;
}

const SAVE_LABELS: Record<SaveStatus, { text: string; className: string }> = {
  idle: { text: "", className: "" },
  unsaved: { text: "Unsaved changes", className: "text-amber-400" },
  saving: { text: "Saving…", className: "text-zinc-400" },
  saved: { text: "✓ Saved", className: "text-[#00D084]" },
  error: { text: "Save failed", className: "text-[#FF4D4D]" },
};

const ICON = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const DEVICES: { mode: PreviewMode; label: string; icon: React.ReactNode }[] = [
  { mode: "desktop", label: "Desktop", icon: <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></> },
  { mode: "tablet", label: "Tablet (768px)", icon: <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M12 18h.01" /></> },
  { mode: "mobile", label: "Mobile (375px)", icon: <><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M12 18h.01" /></> },
];

const GHOST = "flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white";

export default function EditorToolbar({
  emailName, previewMode, activeView, canUndo, canRedo, saveStatus, localOnly = false, onNameChange, onUndo, onRedo,
  onPreviewModeChange, onActiveViewChange, onDesignByHtml, onPreview, onSave, onSaveAsTemplate, onOpenTemplates,
  onExportHtml, onSendTest, onSendEmail, onBack,
}: EditorToolbarProps) {
  const status = SAVE_LABELS[saveStatus];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the "More" menu on an outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey); };
  }, [menuOpen]);

  // Less frequent actions live in one menu so the bar stays readable at any width
  const menuItems: { label: string; hint: string; onClick: () => void }[] = [
    { label: "Browse templates", hint: "Open the template library", onClick: onOpenTemplates },
    { label: "Save as template", hint: "Keep a copy in My Templates", onClick: onSaveAsTemplate },
    { label: "Import HTML", hint: "Turn pasted HTML into blocks", onClick: onDesignByHtml },
    { label: "Export HTML", hint: "Copy or download the email code", onClick: onExportHtml },
    { label: "Send test to me", hint: "Email this design to your address", onClick: onSendTest },
  ];

  return (
    <div
      className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] bg-[#070709] px-4"
      style={{ backdropFilter: "blur(16px)" }}
    >
      {/* ─── LEFT: Back, name, save status ─── */}
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <button
          type="button"
          onClick={onBack}
          className="flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <svg {...ICON}><path d="M19 12H5M5 12l7-7M5 12l7 7" /></svg>
          Back
        </button>

        <div className="h-5 w-px shrink-0 bg-white/[0.08]" />

        <input
          type="text"
          value={emailName}
          onChange={(e) => onNameChange(e.target.value)}
          className="min-w-0 max-w-[220px] flex-1 truncate rounded-lg border border-transparent bg-transparent px-2 py-1 text-[13px] font-semibold text-zinc-100 outline-none transition-colors hover:border-white/[0.08] focus:border-white/[0.2] focus:bg-white/[0.04]"
          placeholder="Untitled Email"
        />
        {status.text && (
          <span
            className={`hidden shrink-0 whitespace-nowrap text-[10px] font-medium sm:inline ${status.className}`}
            title={localOnly ? "Saved in this browser. Sign in to keep your designs in My Templates." : undefined}
          >
            {status.text}
            {localOnly && saveStatus === "saved" ? " locally" : ""}
          </span>
        )}
      </div>

      {/* ─── CENTER: Visual / HTML switch and device preview ─── */}
      <div className="hidden shrink-0 items-center gap-2 md:flex">
        <div className="flex items-center rounded-lg border border-white/[0.1] bg-[#0f0f13] p-0.5">
          <button
            type="button"
            onClick={() => onActiveViewChange("visual")}
            className={`rounded-md px-3 py-1 text-[11px] font-semibold transition-all ${
              activeView === "visual" ? "bg-white/[0.12] text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Design
          </button>
          <button
            type="button"
            onClick={() => onActiveViewChange("html")}
            className={`flex items-center gap-1 rounded-md px-3 py-1 text-[11px] font-semibold transition-all ${
              activeView === "html" ? "bg-[#FF4D4D]/20 text-[#FF4D4D] shadow-sm" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="font-mono text-[10px] font-bold text-[#FF4D4D]">&lt;/&gt;</span>
            HTML
          </button>
        </div>

        <div className="flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
          {DEVICES.map((device) => (
            <button
              key={device.mode}
              type="button"
              onClick={() => onPreviewModeChange(device.mode)}
              title={device.label}
              aria-label={device.label}
              className={`flex h-7 w-8 items-center justify-center rounded-md transition-colors ${
                previewMode === device.mode ? "bg-white/[0.12] text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <svg {...ICON} width={13} height={13}>{device.icon}</svg>
            </button>
          ))}
        </div>
      </div>

      {/* ─── RIGHT: History, preview, save, more, send ─── */}
      <div className="flex flex-1 shrink-0 items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-200 disabled:pointer-events-none disabled:opacity-25"
        >
          <svg {...ICON}><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-200 disabled:pointer-events-none disabled:opacity-25"
        >
          <svg {...ICON}><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" /></svg>
        </button>

        <div className="mx-1 hidden h-5 w-px bg-white/[0.08] sm:block" />

        <button type="button" onClick={onPreview} className={GHOST}>
          <svg {...ICON} width={12} height={12}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          <span className="hidden lg:inline">Preview</span>
        </button>

        <button type="button" onClick={onSave} title="Save (Ctrl+S)" className={GHOST}>
          <svg {...ICON} width={12} height={12}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
          <span className="hidden lg:inline">Save</span>
        </button>

        {/* More actions */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className={`${GHOST} ${menuOpen ? "bg-white/[0.08] text-white" : ""}`}
          >
            More
            <svg {...ICON} width={11} height={11}><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {menuOpen && (
            <div role="menu" className="absolute right-0 top-10 z-[120] w-60 overflow-hidden rounded-xl border border-white/[0.1] bg-[#0b0b0f] py-1 shadow-2xl">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  onClick={() => { setMenuOpen(false); item.onClick(); }}
                  className="block w-full px-3.5 py-2 text-left transition-colors hover:bg-white/[0.06]"
                >
                  <div className="text-[12px] font-medium text-zinc-200">{item.label}</div>
                  <div className="text-[10px] text-zinc-500">{item.hint}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onSendEmail}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-[#00D084] px-3.5 text-[11px] font-bold text-black shadow-lg transition-all hover:bg-[#00b872] active:scale-[0.98]"
          style={{ boxShadow: "0 0 14px rgba(0, 208, 132, 0.35)" }}
        >
          <svg {...ICON} width={12} height={12} strokeWidth={2.2}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          <span className="hidden whitespace-nowrap lg:inline">Send Email</span>
        </button>
      </div>
    </div>
  );
}
