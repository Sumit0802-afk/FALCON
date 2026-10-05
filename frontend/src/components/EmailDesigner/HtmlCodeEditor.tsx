import React, { useState, useRef, useEffect, useCallback } from "react";

// ─── Format HTML Utility ───────────────────────────────────────────────────────

export function formatHtml(html: string): string {
  let tab = "  ";
  let result = "";
  let indent = 0;

  // Clean extra spaces between tags
  const clean = html.replace(/>\s*</g, "><").trim();
  const tokens = clean.split(/(<[^>]+>)/g).filter(Boolean);

  for (const token of tokens) {
    if (token.startsWith("<!--")) {
      result += (result ? "\n" : "") + tab.repeat(indent) + token;
    } else if (token.startsWith("</")) {
      indent = Math.max(0, indent - 1);
      result += (result ? "\n" : "") + tab.repeat(indent) + token;
    } else if (token.startsWith("<") && (token.endsWith("/>") || /^<(img|br|hr|meta|link|input)[^>]*>/i.test(token))) {
      result += (result ? "\n" : "") + tab.repeat(indent) + token;
    } else if (token.startsWith("<") && !token.startsWith("<!")) {
      result += (result ? "\n" : "") + tab.repeat(indent) + token;
      indent++;
    } else {
      const text = token.trim();
      if (text) {
        result += (result ? "\n" : "") + tab.repeat(indent) + text;
      }
    }
  }
  return result.trim();
}

// ─── Syntax Highlighting Tokenizer ─────────────────────────────────────────────

export function highlightHtmlSyntax(code: string): string {
  // Escape HTML entities in raw content first
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Regex to match comments, tags, doctype, or text
  const tokenRegex = /(<!--[\s\S]*?-->)|(<!DOCTYPE[\s\S]*?>)|(<\/?)([a-zA-Z0-9\-]+)([\s\S]*?)(\/?>)|([^<]+)/g;

  return code.replace(
    tokenRegex,
    (match, comment, doctype, tagOpen, tagName, tagAttrs, tagClose, textContent) => {
      // 1. Comments
      if (comment) {
        return `<span style="color:#71717a;font-style:italic;">${escape(comment)}</span>`;
      }

      // 2. DOCTYPE
      if (doctype) {
        return `<span style="color:#FF4D4D;font-weight:600;">${escape(doctype)}</span>`;
      }

      // 3. HTML Tags
      if (tagOpen && tagName && tagClose) {
        // Tag brackets and tag name in RED (#FF4D4D)
        const openSpan = `<span style="color:#FF4D4D;font-weight:600;">${escape(tagOpen)}</span>`;
        const nameSpan = `<span style="color:#FF4D4D;font-weight:bold;">${escape(tagName)}</span>`;
        const closeSpan = `<span style="color:#FF4D4D;font-weight:600;">${escape(tagClose)}</span>`;

        // Highlight attributes and attribute values inside tag
        let highlightedAttrs = "";
        if (tagAttrs) {
          const attrRegex = /([a-zA-Z0-9\-:]+)(?:(=)(".*?"|'.*?'|[^\s>]+))?/g;
          highlightedAttrs = tagAttrs.replace(attrRegex, (attrMatch: string, attrName: string, equals: string, attrVal: string) => {
            let res = `<span style="color:#38bdf8;">${escape(attrName)}</span>`;
            if (equals) {
              res += `<span style="color:#71717a;">=</span>`;
            }
            if (attrVal) {
              res += `<span style="color:#fde047;">${escape(attrVal)}</span>`;
            }
            return res;
          });
        }

        return `${openSpan}${nameSpan}${highlightedAttrs}${closeSpan}`;
      }

      // 4. Text Content
      if (textContent) {
        return `<span style="color:#e4e4e7;">${escape(textContent)}</span>`;
      }

      return escape(match);
    }
  );
}

// ─── Component Props ──────────────────────────────────────────────────────────

interface HtmlCodeEditorProps {
  value: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
  minHeight?: string;
  maxHeight?: string;
  className?: string;
}

export default function HtmlCodeEditor({
  value,
  onChange,
  readOnly = false,
  minHeight = "360px",
  maxHeight = "520px",
  className = "",
}: HtmlCodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = value.split("\n");
  const lineCount = Math.max(1, lines.length);

  // Sync scrolling between textarea, highlighted pre, and line numbers
  const handleScroll = useCallback(() => {
    if (textareaRef.current) {
      const { scrollTop, scrollLeft } = textareaRef.current;
      if (preRef.current) {
        preRef.current.scrollTop = scrollTop;
        preRef.current.scrollLeft = scrollLeft;
      }
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = scrollTop;
      }
    }
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    if (onChange && !readOnly) {
      onChange("");
    }
  };

  const handleFormat = () => {
    if (onChange && !readOnly && value.trim()) {
      const formatted = formatHtml(value);
      onChange(formatted);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab" && !readOnly && onChange) {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const nextVal = value.substring(0, start) + "  " + value.substring(end);
      onChange(nextVal);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className={`flex flex-col rounded-xl border border-white/[0.08] bg-[#070707] shadow-2xl overflow-hidden ${className}`}>
      {/* Editor Header / Action Bar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0c0c0c] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-[#FF4D4D]/10 font-mono text-[10px] font-bold text-[#FF4D4D]">
            &lt;/&gt;
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
            HTML Editor
          </span>
          <span className="rounded bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] text-zinc-500">
            {lineCount} {lineCount === 1 ? "line" : "lines"} · {value.length.toLocaleString()} bytes
          </span>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleFormat}
            disabled={readOnly || !value.trim()}
            title="Format and indent HTML code"
            className="flex items-center gap-1 rounded border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:border-[#FF4D4D]/40 hover:bg-[#FF4D4D]/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/>
            </svg>
            Format
          </button>

          {!readOnly && (
            <button
              type="button"
              onClick={handleClear}
              disabled={!value.trim()}
              title="Clear all code"
              className="flex items-center gap-1 rounded border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30 disabled:pointer-events-none"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            title="Copy HTML to clipboard"
            className={`flex items-center gap-1 rounded border px-2.5 py-1 text-[11px] font-medium transition-colors ${
              copied
                ? "border-[#00D084]/40 bg-[#00D084]/15 text-[#00D084]"
                : "border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:border-white/[0.2] hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div
        className="relative flex overflow-hidden bg-[#070707]"
        style={{ minHeight, maxHeight }}
      >
        {/* Line Numbers Column */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className="select-none overflow-hidden border-r border-white/[0.05] bg-[#0a0a0a] py-3 text-right font-mono text-[12px] leading-[20px] text-zinc-600"
          style={{ width: lineCount > 999 ? "54px" : "42px", paddingRight: "10px" }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="hover:text-zinc-400">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Container */}
        <div className="relative flex-1 overflow-hidden">
          {/* Syntax Highlighted Pre (rendered underneath) */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre p-3 font-mono text-[12px] leading-[20px]"
            style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace" }}
            dangerouslySetInnerHTML={{
              __html: highlightHtmlSyntax(value) + (value.endsWith("\n") ? " " : ""),
            }}
          />

          {/* Interactive Textarea (overlay on top) */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            placeholder="Paste or write HTML code here..."
            className="relative z-10 m-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent p-3 font-mono text-[12px] leading-[20px] outline-none"
            style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
              color: "transparent",
              caretColor: "#FF4D4D",
            }}
          />
        </div>
      </div>
    </div>
  );
}
