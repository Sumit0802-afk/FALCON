import React, { useState, useEffect } from "react";
import { LegacyEmailBlock as EmailBlock, EmailSettings } from "@/types/email";
import { parseHtmlToEmailBlocks } from "@/utils/htmlToBlocks";
import { importHtmlExact, shouldImportExact } from "@/utils/htmlImportExact";
import { EmailSection } from "@/lib/emailCore/schema";
import HtmlCodeEditor from "./HtmlCodeEditor";

interface HtmlCodePanelProps {
  initialHtml: string;
  onApplyHtmlToCanvas: (blocks: EmailBlock[], settings?: Partial<EmailSettings>) => void;
  /** Applies HTML that is kept exactly as written */
  onApplyExact: (sections: EmailSection[], settings?: Partial<EmailSettings>) => void;
  onExportHtml: () => void;
  onSwitchToVisual: () => void;
}

export default function HtmlCodePanel({
  initialHtml,
  onApplyHtmlToCanvas,
  onApplyExact,
  onExportHtml,
  onSwitchToVisual,
}: HtmlCodePanelProps) {
  const [code, setCode] = useState(initialHtml);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCode(initialHtml);
  }, [initialHtml]);

  /** Puts the edited code on the canvas. Returns false when nothing usable was found. */
  const applyCode = async (): Promise<boolean> => {
    if (shouldImportExact(code)) {
      const { sections, settings } = await importHtmlExact(code);
      onApplyExact(sections, settings);
      return true;
    }
    const { blocks, settings } = parseHtmlToEmailBlocks(code);
    if (!blocks || blocks.length === 0) return false;
    onApplyHtmlToCanvas(blocks, settings);
    return true;
  };

  const handleApply = async () => {
    // Unedited code already matches the canvas; re-importing it would only lose detail
    if (code === initialHtml) {
      setApplied(true);
      setTimeout(() => setApplied(false), 2500);
      return;
    }
    try {
      setError(null);
      if (!(await applyCode())) {
        setError("Could not parse valid visual blocks from HTML.");
        return;
      }
      setApplied(true);
      setTimeout(() => setApplied(false), 2500);
    } catch (err: any) {
      setError(err?.message || "Failed to parse HTML code.");
    }
  };

  const handleApplyAndSwitch = async () => {
    if (code === initialHtml) {
      onSwitchToVisual();
      return;
    }
    try {
      setError(null);
      await applyCode();
      onSwitchToVisual();
    } catch (err: any) {
      setError(err?.message || "Failed to parse HTML code.");
    }
  };

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-[#050505]">
      {/* Top Banner inside HTML View */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#09090b] px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-[#FF4D4D]/15 font-mono text-[11px] font-bold text-[#FF4D4D]">
            &lt;/&gt;
          </span>
          <span className="font-mono text-[12px] font-bold uppercase tracking-wider text-white">
            HTML EMAIL CODE
          </span>
          <span className="text-[11px] text-zinc-500">
            Edit HTML directly · Red tags indicate HTML elements
          </span>
        </div>

        <div className="flex items-center gap-2">
          {applied && (
            <span className="flex items-center gap-1 text-[11px] text-[#00D084]">
              ✓ Synced to canvas
            </span>
          )}

          <button
            type="button"
            onClick={handleApply}
            className="flex h-7 items-center gap-1.5 rounded border border-[#FF4D4D]/50 bg-[#FF4D4D]/10 px-3 text-[11px] font-semibold text-[#FF4D4D] transition-colors hover:bg-[#FF4D4D]/20"
          >
            Apply to Canvas
          </button>

          <button
            type="button"
            onClick={onExportHtml}
            className="flex h-7 items-center gap-1.5 rounded border border-white/[0.1] bg-white/[0.04] px-3 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export HTML
          </button>

          <button
            type="button"
            onClick={handleApplyAndSwitch}
            className="flex h-7 items-center gap-1.5 rounded bg-[#00D084] px-3 text-[11px] font-semibold text-black transition-colors hover:bg-[#00b872]"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            Switch to Visual
          </button>
        </div>
      </div>

      {error && (
        <div className="shrink-0 border-b border-red-500/20 bg-red-500/10 px-6 py-2 text-[12px] text-red-300">
          Error: {error}
        </div>
      )}

      {/* Editor Main Canvas Area */}
      <div className="flex-1 overflow-hidden p-6">
        <HtmlCodeEditor
          value={code}
          onChange={(newVal) => {
            setCode(newVal);
            if (error) setError(null);
          }}
          minHeight="100%"
          maxHeight="100%"
          className="h-full"
        />
      </div>
    </div>
  );
}
