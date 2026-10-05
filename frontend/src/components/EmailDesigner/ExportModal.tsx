import React, { useState, useEffect } from "react";
import { EmailDesign } from "@/types/email";
import { exportEmailHtml } from "@/utils/emailUtils";
import HtmlCodeEditor from "./HtmlCodeEditor";

interface ExportModalProps {
  design: EmailDesign;
  onClose: () => void;
}

export default function ExportModal({ design, onClose }: ExportModalProps) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    setHtml(exportEmailHtml(design));
  }, [design]);

  const handleDownload = () => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${design.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4"
      style={{ backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex w-[820px] max-w-[95vw] flex-col rounded-xl border border-white/[0.08] bg-[#080808] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div>
            <h2 className="text-[14px] font-semibold text-white">Export HTML Email</h2>
            <p className="text-[11px] text-zinc-500">Production-ready, email-client compatible HTML with inline styles</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        {/* Code Editor Preview */}
        <div className="p-4 overflow-hidden">
          <HtmlCodeEditor
            value={html}
            readOnly={true}
            minHeight="340px"
            maxHeight="440px"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-2 text-[11px] text-zinc-600">
            <span className="rounded bg-[#00D084]/10 px-2 py-0.5 text-[10px] text-[#00D084]">
              {html.length.toLocaleString()} bytes
            </span>
            <span>Table-based · Inline CSS · Mobile Responsive</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/[0.08] px-3.5 py-1.5 text-[12px] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg bg-[#00D084] px-4 py-1.5 text-[12px] font-semibold text-black hover:bg-[#00b872]"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download .html
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
