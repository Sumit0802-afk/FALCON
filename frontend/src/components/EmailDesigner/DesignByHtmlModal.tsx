import React, { useState, useEffect } from "react";
import { EmailBlock, EmailSettings } from "@/types/email";
import { parseHtmlToEmailBlocks } from "@/utils/htmlToBlocks";
import HtmlCodeEditor from "./HtmlCodeEditor";

interface DesignByHtmlModalProps {
  currentHtml?: string;
  onImport: (blocks: EmailBlock[], settings?: Partial<EmailSettings>) => void;
  onClose: () => void;
}

const SAMPLE_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Falcon Email</title>
</head>
<body style="background-color: #0b0b0f; margin: 0; padding: 20px; font-family: Arial, sans-serif;">
  <table width="600" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; background-color: #121218; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
    <tr>
      <td style="padding: 40px 32px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 16px; font-weight: bold;">Welcome to Falcon</h1>
        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 28px;">Paste HTML code and instantly turn it into an editable email template.</p>
        <a href="https://falcon.io" style="display: inline-block; padding: 12px 32px; background-color: #00D084; color: #000000; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 6px;">Get Started</a>
      </td>
    </tr>
  </table>
</body>
</html>`;

export default function DesignByHtmlModal({
  currentHtml = "",
  onImport,
  onClose,
}: DesignByHtmlModalProps) {
  const [htmlCode, setHtmlCode] = useState(currentHtml.trim() ? currentHtml : SAMPLE_HTML);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleImport = () => {
    if (!htmlCode.trim()) {
      setError("Please paste or write some HTML before importing.");
      return;
    }

    try {
      setImporting(true);
      setError(null);
      const { blocks, settings } = parseHtmlToEmailBlocks(htmlCode);

      if (!blocks || blocks.length === 0) {
        setError("Could not parse any visual elements from the provided HTML.");
        setImporting(false);
        return;
      }

      onImport(blocks, settings);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to parse HTML code.");
      setImporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4"
      style={{ backdropFilter: "blur(12px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex w-[860px] max-w-[96vw] max-h-[92vh] flex-col rounded-2xl bg-[#09090b] shadow-2xl overflow-hidden"
        style={{
          border: "1px solid #FF4D4D",
          boxShadow: "0 0 30px rgba(255, 77, 77, 0.25), 0 20px 50px rgba(0, 0, 0, 0.9)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0c0c0e] px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF4D4D]/15 font-mono text-[14px] font-bold text-[#FF4D4D]"
              style={{ boxShadow: "0 0 12px rgba(255, 77, 77, 0.3)" }}
            >
              &lt;/&gt;
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-bold tracking-tight text-white">
                  Design by HTML
                </h2>
                <span className="rounded-full border border-[#FF4D4D]/40 bg-[#FF4D4D]/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#FF4D4D]">
                  HTML to Visual Blocks
                </span>
              </div>
              <p className="text-[12px] text-zinc-400">
                Paste your email HTML and turn it into an editable visual design.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Informational Sub-banner */}
        <div className="flex items-center justify-between border-b border-white/[0.05] bg-[#070709] px-6 py-2.5 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D4D]" />
            Paste HTML code and instantly turn it into an editable email template.
          </span>
          <span className="text-zinc-500">
            Converts <code className="text-[#FF4D4D]">&lt;h1&gt;</code>, <code className="text-[#FF4D4D]">&lt;p&gt;</code>, <code className="text-[#FF4D4D]">&lt;img&gt;</code>, <code className="text-[#FF4D4D]">&lt;a&gt;</code>, <code className="text-[#FF4D4D]">&lt;table&gt;</code> &amp; preserves inline styles
          </span>
        </div>

        {/* Code Editor */}
        <div className="flex-1 overflow-y-auto p-6">
          <HtmlCodeEditor
            value={htmlCode}
            onChange={(val) => {
              setHtmlCode(val);
              if (error) setError(null);
            }}
            minHeight="320px"
            maxHeight="440px"
          />

          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-[12px] text-red-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.08] bg-[#0c0c0e] px-6 py-4">
          <div className="text-[11px] text-zinc-500">
            Flow: <span className="text-zinc-300">Paste HTML</span> → <span className="text-[#FF4D4D] font-medium">Import &amp; Design</span> → <span className="text-zinc-300">Visual Email Editor</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/[0.1] px-4 py-2 text-[12px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleImport}
              disabled={importing || !htmlCode.trim()}
              className="flex items-center gap-2 rounded-lg bg-[#FF4D4D] px-5 py-2 text-[12px] font-bold text-white shadow-lg transition-all hover:bg-[#e03e3e] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
              style={{
                boxShadow: "0 0 20px rgba(255, 77, 77, 0.4)",
              }}
            >
              {importing ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Converting to Blocks...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                  </svg>
                  Import &amp; Design
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
