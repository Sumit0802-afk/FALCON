import React, { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { onHtmlPick, recentHtmlPick, tagRangeAt } from "@/utils/htmlPick";

interface HtmlDocumentEditorProps {
  blockId: string;
  value: string;
  onChange: (html: string) => void;
}

/** How long typing must pause before the email on the canvas is redrawn */
const COMMIT_DELAY = 500;

/**
 * Code editor for an email imported exactly as written. Clicking a part of the
 * email on the canvas scrolls here to that part's code and selects its tag.
 */
export default function HtmlDocumentEditor({ blockId, value, onChange }: HtmlDocumentEditorProps) {
  const area = useRef<HTMLTextAreaElement>(null);
  const [code, setCode] = useState(value);
  const [expanded, setExpanded] = useState(false);
  const committed = useRef(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Follow changes made elsewhere (undo, redo, a fresh import), but not our own edits coming back
  useEffect(() => {
    if (value !== committed.current) {
      committed.current = value;
      setCode(value);
    }
  }, [value]);

  const commit = useCallback((next: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (next === committed.current) return;
    committed.current = next;
    onChange(next);
  }, [onChange]);

  const handleInput = (next: string) => {
    setCode(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => commit(next), COMMIT_DELAY);
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  /** Scrolls to the tag at `offset` and selects it */
  const jumpTo = useCallback((offset: number) => {
    const node = area.current;
    if (!node) return;
    const full = node.value;
    const { start, end } = tagRangeAt(full, offset);
    // A wrapped textarea has no line numbers to scroll by, so measure how tall the text before the tag is
    node.value = full.slice(0, start);
    const top = node.scrollHeight;
    node.value = full;
    node.focus({ preventScroll: true });
    node.setSelectionRange(start, end);
    node.scrollTop = Math.max(0, top - node.clientHeight / 3);
  }, []);

  useEffect(() => {
    const recent = recentHtmlPick(blockId);
    if (recent) requestAnimationFrame(() => jumpTo(recent.offset));
    return onHtmlPick((pick) => {
      if (pick.blockId === blockId) requestAnimationFrame(() => jumpTo(pick.offset));
    });
  }, [blockId, jumpTo]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setExpanded(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  return (
    <>
      {expanded && <div className="fixed inset-0 z-[140] bg-black/70" onClick={() => setExpanded(false)} />}
      <div
        className={
          expanded
            ? "fixed inset-3 z-[150] flex flex-col rounded-2xl border border-white/[0.12] bg-[#09090b] p-4 shadow-2xl md:inset-8"
            : "mb-3 flex flex-col"
        }
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[10.5px] leading-relaxed text-zinc-500">Click any part of the email to jump to its code.</p>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-white/[0.1] px-2 py-1 text-[10.5px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            {expanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            {expanded ? "Close" : "Expand"}
          </button>
        </div>
        <textarea
          ref={area}
          value={code}
          spellCheck={false}
          aria-label="Email HTML code"
          onChange={(e) => handleInput(e.target.value)}
          onBlur={() => commit(code)}
          className={`w-full resize-y rounded-lg border border-white/[0.1] bg-[#050506] p-3 font-mono leading-relaxed text-zinc-200 outline-none selection:bg-[#00D084]/40 focus:border-[#00D084]/50 ${
            expanded ? "min-h-0 flex-1 resize-none text-[13px]" : "h-[58vh] min-h-[340px] text-[12px]"
          }`}
        />
      </div>
    </>
  );
}
