import React, { useEffect, useRef, useState } from "react";
import { EmailDesign, PreviewMode } from "@/types/email";
import { exportEmailHtml } from "@/utils/emailUtils";

interface PreviewModalProps {
  design: EmailDesign;
  initialMode?: PreviewMode;
  onClose: () => void;
}

export default function PreviewModal({ design, initialMode = "desktop", onClose }: PreviewModalProps) {
  const [mode, setMode] = useState<PreviewMode>(initialMode);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const html = exportEmailHtml(design);
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [design, mode]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95"
      style={{ backdropFilter: "blur(8px)" }}
    >
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center gap-4 border-b border-white/[0.06] bg-black px-4">
        <span className="text-[13px] font-medium text-zinc-300">Email Preview</span>
        <div className="flex items-center rounded border border-white/[0.08] bg-white/[0.03]">
          <button
            onClick={() => setMode("desktop")}
            className={`flex h-7 items-center gap-1.5 rounded-l px-3 text-[11px] transition-colors ${
              mode === "desktop" ? "bg-[#00D084]/20 text-[#00D084]" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Desktop
          </button>
          <button
            onClick={() => setMode("mobile")}
            className={`flex h-7 items-center gap-1.5 rounded-r px-3 text-[11px] transition-colors ${
              mode === "mobile" ? "bg-[#00D084]/20 text-[#00D084]" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Mobile
          </button>
        </div>
        <div className="flex-1" />
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200"
        >
          ✕
        </button>
      </div>

      {/* Preview area */}
      <div className="flex flex-1 items-start justify-center overflow-auto bg-zinc-900/50 p-8">
        <div
          className="overflow-hidden rounded-lg bg-white shadow-2xl transition-all duration-300"
          style={{ width: mode === "mobile" ? 375 : design.settings.emailWidth + 40, minHeight: 400 }}
        >
          <iframe
            ref={iframeRef}
            title="Email Preview"
            style={{ width: "100%", minHeight: 600, border: "none", display: "block" }}
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
