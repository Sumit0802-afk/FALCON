import React, { useEffect, useRef, useState } from "react";
import { LayoutGrid, Pause, Play, RotateCcw, StickyNote, Timer, X } from "lucide-react";
import type { DesignPage } from "@/types";

const BUTTON = "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition hover:bg-white/[0.06] hover:text-zinc-200";
const POPOVER = "absolute bottom-full left-0 z-50 mb-2 rounded-2xl border border-white/10 bg-[#161a24] p-3 shadow-2xl";

/** Closes a popover when the user clicks outside it or presses Escape */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

/** Free-form notes for a design, kept in this browser */
export function NotesButton({ projectId }: { projectId: string }) {
  const key = `falcon_notes_${projectId}`;
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const ref = useDismiss(open, () => setOpen(false));

  useEffect(() => {
    try {
      setText(localStorage.getItem(key) || "");
    } catch {
      // Storage may be blocked; notes then last only while the editor is open
    }
  }, [key]);

  const change = (value: string) => {
    setText(value);
    try {
      if (value) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
    } catch {
      // Not saved
    }
  };

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} title="Design notes" className={`${BUTTON} ${open || text ? "text-amber-300" : "text-zinc-400"}`}>
        <StickyNote size={13} />
        <span>Notes</span>
      </button>
      {open && (
        <div className={`${POPOVER} w-72`}>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Notes for this design</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close notes" className="text-zinc-500 hover:text-white"><X size={13} /></button>
          </div>
          <textarea
            autoFocus
            value={text}
            onChange={(e) => change(e.target.value)}
            placeholder="Ideas, to-dos, feedback to remember…"
            rows={7}
            maxLength={5000}
            className="w-full resize-none rounded-xl border border-white/10 bg-[#0f1219] p-2.5 text-xs leading-relaxed text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-400/50"
          />
          <p className="mt-1.5 text-[10px] text-zinc-500">Saved in this browser. Notes are not part of the exported design.</p>
        </div>
      )}
    </div>
  );
}

function clock(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** A stopwatch for timing a design session */
export function TimerButton() {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  // Counting from a start time keeps the clock right even when the tab is in the background
  const startedAt = useRef(0);
  const ref = useDismiss(open, () => setOpen(false));

  useEffect(() => {
    if (!running) return;
    startedAt.current = Date.now() - elapsed * 1000;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} title="Timer" className={`${BUTTON} ${running ? "text-emerald-300" : elapsed ? "text-zinc-200" : "text-zinc-400"}`}>
        <Timer size={13} />
        <span className={running || elapsed ? "font-mono" : ""}>{running || elapsed ? clock(elapsed) : "Timer"}</span>
      </button>
      {open && (
        <div className={`${POPOVER} w-56 text-center`}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Session timer</p>
          <p className="my-3 font-mono text-3xl text-white" aria-live="off">{clock(elapsed)}</p>
          <div className="flex items-center justify-center gap-2">
            <button type="button" onClick={() => setRunning((v) => !v)} className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 text-xs font-semibold text-black transition hover:bg-emerald-400">
              {running ? <><Pause size={13} /> Pause</> : <><Play size={13} /> {elapsed ? "Resume" : "Start"}</>}
            </button>
            <button type="button" onClick={() => { setRunning(false); setElapsed(0); }} disabled={!elapsed && !running} aria-label="Reset timer" className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-zinc-300 transition hover:text-white disabled:opacity-40">
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Every page of the design at a glance; choosing one opens it */
export function PagesViewButton({ pages, pageIndex, onSelect }: { pages: DesignPage[]; pageIndex: number; onSelect?: (index: number) => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} title="Pages view" className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-zinc-400 transition hover:bg-white/[0.06] hover:text-white">
        <LayoutGrid size={13} />
        <span>{pageIndex + 1} / {pages.length}</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="flex max-h-[86vh] w-full max-w-4xl flex-col rounded-2xl border border-white/10 bg-[#111318] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5">
              <h2 className="text-sm font-semibold text-white">Pages</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close pages view" className="text-zinc-400 hover:text-white"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 overflow-y-auto p-5 sm:grid-cols-3 md:grid-cols-4">
              {pages.map((p, i) => {
                const bg = p.background === "transparent" ? "#ffffff" : p.background || "#ffffff";
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setOpen(false); if (i !== pageIndex) onSelect?.(i); }}
                    aria-current={i === pageIndex}
                    className={`group flex flex-col gap-2 rounded-xl border p-2 text-left transition ${i === pageIndex ? "border-[#8b3dff] bg-[#8b3dff]/10" : "border-white/10 hover:border-white/30"}`}
                  >
                    <span
                      className="block w-full overflow-hidden rounded-lg border border-black/30"
                      style={{ aspectRatio: `${p.size.width} / ${p.size.height}`, maxHeight: 180, background: bg.startsWith("http") || bg.startsWith("data:") ? `url("${bg}") center / cover` : bg }}
                    />
                    <span className="flex items-center justify-between gap-2 px-0.5 text-[11px]">
                      <span className="truncate text-zinc-300">{p.name || `Page ${i + 1}`}</span>
                      <span className="shrink-0 font-mono text-zinc-500">{i + 1}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
