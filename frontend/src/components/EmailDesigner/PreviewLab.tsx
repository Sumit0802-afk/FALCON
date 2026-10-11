import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { stripActiveHtml } from "@/lib/emailCore/renderHtml";
import { SOURCE_ATTR, annotateHtml } from "@/utils/htmlPick";
import { EmailIssue, lineRange, lintEmail } from "@/utils/emailLint";
import { CHECK_WIDTHS, VersionComparison, WidthResult, checkScreenSizes, compareVersions, deviceOf } from "@/utils/emailProbe";
import { getCompatibilityVersion } from "@/services/emailTemplateService";
import { ApiError } from "@/services/api";

/**
 * Preview & check: the email's own code drawn at any screen width, with the
 * checks that say whether it holds up.
 *
 * One piece of code feeds everything here. The desktop and phone previews are
 * the same HTML in frames of different widths, never two documents. The
 * "sent version" is what Falcon's mail server makes of that code, fetched from
 * the server so that it is the very thing a send would deliver.
 */

interface PreviewLabProps {
  /** The email's code. For an email imported as written this is the author's own HTML */
  html: string;
  /** Present when the code can be edited here; called with the new code after typing pauses */
  onHtmlChange?: (html: string) => void;
  initialWidth?: number;
  onClose: () => void;
}

type Tab = "preview" | "checks" | "sizes" | "compare";
type Version = "original" | "sent";

const PRESETS: { label: string; width: number }[] = [
  { label: "Desktop", width: 1440 },
  { label: "Laptop", width: 1366 },
  { label: "Tablet", width: 768 },
  { label: "Mobile", width: 390 },
];

const MIN_WIDTH = 320;
const MAX_WIDTH = 1920;
const LINE_HEIGHT = 18;
const STAMP = new RegExp(`\\s${SOURCE_ATTR}="\\d+"`, "g");
const MARK = "data-fc-diff";

// ─── One screen ───────────────────────────────────────────────────────────────

interface ScreenProps {
  html: string;
  width: number;
  label?: string;
  /** Lets the width be changed by dragging the frame's edge */
  onWidthChange?: (width: number) => void;
  /** Source offsets of elements to outline */
  marked?: number[];
  /** A fixed magnification, or leave out to fit the room there is */
  zoom?: number;
}

/** The email in a frame exactly `width` pixels wide, scaled down when the window has less room */
function Screen({ html, width, label, onWidthChange, marked, zoom }: ScreenProps) {
  const holder = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [room, setRoom] = useState(width);
  const [height, setHeight] = useState(520);
  const source = useMemo(() => stripActiveHtml(html), [html]);
  const scale = zoom ?? Math.min(1, room / width);

  useEffect(() => {
    const node = holder.current;
    if (!node) return;
    const read = () => setRoom(Math.max(120, node.clientWidth));
    read();
    const observer = new ResizeObserver(read);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const measure = useCallback(() => {
    const doc = frame.current?.contentDocument;
    if (!doc?.body) return;
    const next = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight, 200);
    setHeight((current) => (Math.abs(current - next) > 1 ? next : current));
  }, []);

  const mark = useCallback(() => {
    const doc = frame.current?.contentDocument;
    if (!doc?.body) return;
    doc.querySelectorAll(`[${MARK}]`).forEach((el) => el.removeAttribute(MARK));
    if (!marked?.length) return;
    if (!doc.getElementById("fc-diff-style")) {
      const style = doc.createElement("style");
      style.id = "fc-diff-style";
      style.textContent = `[${MARK}]{outline:2px solid #f59e0b!important;outline-offset:1px!important}`;
      (doc.head || doc.body).appendChild(style);
    }
    for (const offset of marked) doc.querySelector(`[${SOURCE_ATTR}="${offset}"]`)?.setAttribute(MARK, "");
  }, [marked]);

  const onLoad = useCallback(() => {
    measure();
    mark();
    const doc = frame.current?.contentDocument;
    doc?.querySelectorAll("img").forEach((img) => { if (!img.complete) img.addEventListener("load", measure, { once: true }); });
    doc?.fonts?.ready.then(measure).catch(() => undefined);
  }, [measure, mark]);

  // The email reflows when the width changes, which changes how tall it is
  useEffect(() => {
    const timers = [60, 350, 1200].map((ms) => window.setTimeout(measure, ms));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [width, source, measure]);

  useEffect(() => { mark(); }, [mark]);

  const startDrag = (e: React.PointerEvent) => {
    if (!onWidthChange) return;
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;
    const move = (ev: PointerEvent) => {
      // The frame is centred, so its edge moves half as far as its width grows
      const next = Math.round(startWidth + ((ev.clientX - startX) * 2) / scale);
      onWidthChange(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, next)));
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      document.body.style.userSelect = "";
    };
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  };

  return (
    <div ref={holder} className="min-w-0 flex-1">
      <div className="mb-2 flex items-center justify-center gap-2 font-mono text-[10.5px] text-zinc-500">
        {label && <span className="font-sans font-medium text-zinc-300">{label}</span>}
        <span>{width}px{scale !== 1 ? ` · shown at ${Math.round(scale * 100)}%` : ""}</span>
      </div>
      <div className="relative mx-auto" style={{ width: width * scale, height: height * scale }}>
        <div className="overflow-hidden rounded-md bg-white shadow-[0_12px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10" style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <iframe ref={frame} title={label ? `${label} preview` : "Email preview"} srcDoc={source} sandbox="allow-same-origin" scrolling="no" onLoad={onLoad} style={{ display: "block", width, height, border: "none" }} />
        </div>
        {onWidthChange && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Drag to change the preview width"
            title="Drag to change the width"
            onPointerDown={startDrag}
            className="absolute -right-3 top-0 flex h-full w-3 cursor-ew-resize items-center justify-center"
          >
            <span className="h-12 w-1 rounded-full bg-zinc-600 transition-colors hover:bg-[#00D084]" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Code with line numbers ───────────────────────────────────────────────────

interface CodePaneProps {
  value: string;
  onChange?: (value: string) => void;
  /** A line to bring into view and select; `at` makes a repeat jump to the same line work */
  jump: { line: number; at: number } | null;
}

function CodePane({ value, onChange, jump }: CodePaneProps) {
  const area = useRef<HTMLTextAreaElement>(null);
  const gutter = useRef<HTMLDivElement>(null);
  const numbers = useMemo(() => {
    const count = value.split("\n").length;
    let out = "";
    for (let n = 1; n <= count; n++) out += `${n}\n`;
    return out;
  }, [value]);

  useEffect(() => {
    const node = area.current;
    if (!jump || !node || jump.line < 1) return;
    const { start, end } = lineRange(node.value, jump.line);
    node.focus({ preventScroll: true });
    node.setSelectionRange(start, end);
    node.scrollTop = Math.max(0, (jump.line - 6) * LINE_HEIGHT);
  }, [jump]);

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden rounded-lg border border-white/[0.1] bg-[#050506] font-mono text-[12px]" style={{ lineHeight: `${LINE_HEIGHT}px` }}>
      <div ref={gutter} aria-hidden="true" className="w-12 shrink-0 select-none overflow-hidden whitespace-pre border-r border-white/[0.06] bg-black/40 py-3 pr-2 text-right text-zinc-600">
        {numbers}
      </div>
      <textarea
        ref={area}
        value={value}
        readOnly={!onChange}
        wrap="off"
        spellCheck={false}
        aria-label={onChange ? "Email HTML code" : "Email HTML code (read only)"}
        onChange={(e) => onChange?.(e.target.value)}
        onScroll={(e) => { if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop; }}
        className="min-h-0 flex-1 resize-none whitespace-pre bg-transparent p-3 text-zinc-200 outline-none selection:bg-[#00D084]/40"
        style={{ lineHeight: `${LINE_HEIGHT}px`, tabSize: 2 }}
      />
    </div>
  );
}

// ─── Findings ─────────────────────────────────────────────────────────────────

const LEVEL_STYLE = {
  error: { mark: "✕", tone: "text-red-300", edge: "border-red-500/40" },
  warning: { mark: "⚠", tone: "text-amber-300", edge: "border-amber-500/40" },
  info: { mark: "i", tone: "text-sky-300", edge: "border-sky-500/30" },
} as const;

interface FindingProps {
  level: keyof typeof LEVEL_STYLE;
  title: string;
  line: number;
  excerpt: string;
  problem: string;
  fix: string;
  count?: number;
  onShow?: (line: number) => void;
}

function Finding({ level, title, line, excerpt, problem, fix, count, onShow }: FindingProps) {
  const look = LEVEL_STYLE[level];
  return (
    <li className={`rounded-lg border-l-2 bg-white/[0.03] p-3 ${look.edge}`}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className={`text-[12px] font-semibold ${look.tone}`}>{look.mark} {title}</span>
        {count && count > 1 && <span className="rounded bg-white/[0.07] px-1.5 py-0.5 text-[10px] text-zinc-400">{count} places</span>}
        {line > 0 && onShow && (
          <button type="button" onClick={() => onShow(line)} className="ml-auto text-[11px] text-[#00D084] hover:underline">Show line {line}</button>
        )}
      </div>
      {(line > 0 || excerpt) && (
        <p className="mt-1.5 break-all font-mono text-[11px] text-zinc-300">
          {line > 0 && <span className="text-zinc-500">Line {line}{count && count > 1 ? " (first)" : ""}: </span>}{excerpt}
        </p>
      )}
      <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-300"><span className="text-zinc-500">Problem: </span>{problem}</p>
      <p className="mt-1 text-[12px] leading-relaxed text-zinc-300"><span className="text-zinc-500">Suggested solution: </span>{fix}</p>
    </li>
  );
}

// ─── The window ───────────────────────────────────────────────────────────────

type CompatState =
  | { status: "idle" | "loading" }
  | { status: "ready"; html: string; stamped: string; unreachable: number; bytes: number }
  | { status: "error"; message: string };

export default function PreviewLab({ html, onHtmlChange, initialWidth = 1440, onClose }: PreviewLabProps) {
  const [tab, setTab] = useState<Tab>("preview");
  const [version, setVersion] = useState<Version>("original");
  const [pair, setPair] = useState(false);
  const [width, setWidth] = useState(initialWidth);
  const [showCode, setShowCode] = useState(false);
  const [jump, setJump] = useState<{ line: number; at: number } | null>(null);
  const [zoom, setZoom] = useState<number | null>(null);

  // What is being typed, and the same a moment later: previews and checks follow the settled copy
  const [draft, setDraft] = useState(html);
  const [code, setCode] = useState(html);
  const sent = useRef(html);

  useEffect(() => {
    // The email changed outside this window (undo, another edit), not by typing here
    if (html !== sent.current) {
      sent.current = html;
      setDraft(html);
      setCode(html);
    }
  }, [html]);

  useEffect(() => {
    if (draft === code) return;
    const timer = window.setTimeout(() => {
      setCode(draft);
      sent.current = draft;
      onHtmlChange?.(draft);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [draft, code, onHtmlChange]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // ── Checks that read the code ──
  const issues = useMemo<EmailIssue[]>(() => lintEmail(code), [code]);

  // ── The version that is sent ──
  const stampedOriginal = useMemo(() => annotateHtml(code), [code]);
  const [compat, setCompat] = useState<CompatState>({ status: "idle" });
  const needsCompat = version === "sent" || tab === "compare";

  // The last answer is kept with the code it was made from, so looking again costs nothing
  const fetched = useRef<{ from: string; state: CompatState } | null>(null);

  useEffect(() => {
    if (!needsCompat) return;
    if (fetched.current?.from === stampedOriginal) {
      setCompat(fetched.current.state);
      return;
    }
    let live = true;
    setCompat({ status: "loading" });
    const timer = window.setTimeout(() => {
      getCompatibilityVersion(stampedOriginal)
        .then((result) => {
          if (!live) return;
          const clean = result.html.replace(STAMP, "");
          const state: CompatState = { status: "ready", html: clean, stamped: result.html, unreachable: result.unreachableImages, bytes: new Blob([clean]).size };
          fetched.current = { from: stampedOriginal, state };
          setCompat(state);
        })
        .catch((err) => {
          if (!live) return;
          const message = err instanceof ApiError && err.status === 401
            ? "Sign in to see the version that is sent."
            : err instanceof ApiError && err.status !== 0 && err.message ? err.message : "The sent version could not be fetched. Check that Falcon's server is running.";
          setCompat({ status: "error", message });
        });
    }, 200);
    return () => { live = false; window.clearTimeout(timer); };
  }, [needsCompat, stampedOriginal]);

  // ── Layout at every screen size ──
  const [sizes, setSizes] = useState<WidthResult[] | null>(null);
  const [sizesError, setSizesError] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let live = true;
    setSizes(null);
    setSizesError("");
    setProgress(0);
    const timer = window.setTimeout(() => {
      checkScreenSizes(code, (done, total) => { if (live) setProgress(done / total); })
        .then((results) => { if (live) setSizes(results); })
        .catch((err) => { if (live) setSizesError(err instanceof Error ? err.message : "The check could not be run."); });
    }, 600);
    return () => { live = false; window.clearTimeout(timer); };
  }, [code]);

  // ── Original against sent ──
  const [compareWidth, setCompareWidth] = useState(1440);
  const [comparison, setComparison] = useState<VersionComparison | null>(null);
  const [compareError, setCompareError] = useState("");
  // Some mail apps keep the email's stylesheet and some throw it away. With it gone, only the
  // styles written on each element are left, which is the harder case for a design to survive
  const [strict, setStrict] = useState(false);
  const stampedSent = useMemo(() => {
    if (compat.status !== "ready") return "";
    return strict ? compat.stamped.replace(/<style\b[\s\S]*?<\/style\s*>/gi, "").replace(/<link\b[^>]*rel\s*=\s*["']?stylesheet[^>]*>/gi, "") : compat.stamped;
  }, [compat, strict]);

  useEffect(() => {
    if (tab !== "compare" || !stampedSent) return;
    let live = true;
    setComparison(null);
    setCompareError("");
    compareVersions(code, stampedOriginal, stampedSent, compareWidth)
      .then((result) => { if (live) setComparison(result); })
      .catch((err) => { if (live) setCompareError(err instanceof Error ? err.message : "The comparison could not be run."); });
    return () => { live = false; };
  }, [tab, code, stampedOriginal, stampedSent, compareWidth]);

  const showLine = useCallback((line: number) => {
    setTab("preview");
    setVersion("original");
    setShowCode(true);
    setJump({ line, at: Date.now() });
  }, []);

  const openAt = (next: number) => {
    setPair(false);
    setWidth(next);
    setTab("preview");
  };

  const shownHtml = version === "sent" && compat.status === "ready" ? compat.html : code;

  // A problem found at every size (a picture that does not load, say) is listed once, not nine times
  const sizeReport = useMemo(() => {
    if (!sizes) return null;
    const keyOf = (issue: { kind: string; line: number; excerpt: string }) => `${issue.kind}|${issue.line}|${issue.excerpt}`;
    const seen = new Map<string, number>();
    for (const result of sizes) for (const key of new Set(result.issues.map(keyOf))) seen.set(key, (seen.get(key) || 0) + 1);
    const everywhere = new Set([...seen].filter(([, n]) => n === sizes.length).map(([key]) => key));
    const common = sizes[0].issues.filter((issue) => everywhere.has(keyOf(issue))).map((issue) => ({ ...issue, problem: issue.problem.replace(/ at \d+px/, "") }));
    const rows = sizes.map((result) => ({ ...result, issues: result.issues.filter((issue) => !everywhere.has(keyOf(issue))) }));
    return { common, rows, total: seen.size };
  }, [sizes]);
  const layoutIssues = sizeReport ? sizeReport.total : 0;
  const errors = issues.filter((i) => i.level === "error").length;
  const warnings = issues.filter((i) => i.level === "warning").length;
  const markedOffsets = useMemo(() => (comparison ? [...new Set(comparison.differences.map((d) => d.offset))] : []), [comparison]);

  const tabButton = (id: Tab, label: string, badge?: number, bad?: boolean) => (
    <button
      key={id}
      type="button"
      onClick={() => setTab(id)}
      aria-pressed={tab === id}
      className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-[12px] transition-colors ${tab === id ? "bg-white/[0.1] text-white" : "text-zinc-400 hover:text-zinc-200"}`}
    >
      {label}
      {badge !== undefined && badge > 0 && <span className={`rounded-full px-1.5 text-[10px] font-semibold ${bad ? "bg-red-500/25 text-red-200" : "bg-amber-500/20 text-amber-200"}`}>{badge}</span>}
    </button>
  );

  const versionSwitch = (
    <div className="flex items-center rounded-md border border-white/[0.08] bg-white/[0.03] p-0.5" title="Original: your code as written. Sent version: what Falcon's mail server delivers.">
      {(["original", "sent"] as Version[]).map((v) => (
        <button key={v} type="button" onClick={() => setVersion(v)} aria-pressed={version === v} className={`h-7 rounded px-2.5 text-[11px] transition-colors ${version === v ? "bg-[#00D084]/20 text-[#00D084]" : "text-zinc-500 hover:text-zinc-300"}`}>
          {v === "original" ? "Original HTML" : "Sent version"}
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#09090b]" role="dialog" aria-modal="true" aria-label="Preview and check">
      {/* Header */}
      <div className="flex min-h-12 shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-white/[0.06] bg-black px-3 py-1.5">
        <span className="text-[13px] font-medium text-zinc-200">Preview &amp; check</span>
        <div className="flex items-center gap-0.5">
          {tabButton("preview", "Preview")}
          {tabButton("checks", "Checks", errors + warnings, errors > 0)}
          {tabButton("sizes", "Screen sizes", layoutIssues)}
          {tabButton("compare", "Compare")}
        </div>
        <div className="flex-1" />
        {tab === "preview" && versionSwitch}
        <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100">✕</button>
      </div>

      {/* ── Preview ── */}
      {tab === "preview" && (
        <>
          <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/[0.06] bg-[#0c0c0f] px-3 py-2">
            <div className="flex items-center rounded-md border border-white/[0.08] bg-white/[0.03] p-0.5">
              {PRESETS.map((preset) => (
                <button key={preset.label} type="button" onClick={() => { setPair(false); setWidth(preset.width); }} aria-pressed={!pair && width === preset.width} className={`h-7 rounded px-2.5 text-[11px] transition-colors ${!pair && width === preset.width ? "bg-[#00D084]/20 text-[#00D084]" : "text-zinc-500 hover:text-zinc-300"}`}>
                  {preset.label} <span className="font-mono text-[10px] opacity-70">{preset.width}</span>
                </button>
              ))}
              <button type="button" onClick={() => setPair(true)} aria-pressed={pair} className={`h-7 rounded px-2.5 text-[11px] transition-colors ${pair ? "bg-[#00D084]/20 text-[#00D084]" : "text-zinc-500 hover:text-zinc-300"}`}>
                Desktop + Mobile
              </button>
            </div>
            {!pair && (
              <label className="flex items-center gap-2 text-[11px] text-zinc-500">
                Width
                <input type="range" min={MIN_WIDTH} max={MAX_WIDTH} step={1} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-32 accent-[#00D084] sm:w-44" aria-label="Preview width" />
                <input
                  type="number"
                  min={MIN_WIDTH}
                  max={MAX_WIDTH}
                  value={width}
                  onChange={(e) => { const n = Number(e.target.value); if (Number.isFinite(n) && n > 0) setWidth(Math.min(MAX_WIDTH, Math.max(1, Math.round(n)))); }}
                  onBlur={() => setWidth((w) => Math.max(MIN_WIDTH, w))}
                  className="h-7 w-[68px] rounded border border-white/[0.1] bg-black/40 px-2 font-mono text-[11px] text-zinc-200 outline-none focus:border-[#00D084]/50"
                  aria-label="Preview width in pixels"
                />
                px
              </label>
            )}
            <label className="flex items-center gap-2 text-[11px] text-zinc-500">
              Zoom
              <select value={zoom === null ? "fit" : String(zoom)} onChange={(e) => setZoom(e.target.value === "fit" ? null : Number(e.target.value))} className="h-7 rounded border border-white/[0.1] bg-black/40 px-1.5 text-[11px] text-zinc-200 outline-none focus:border-[#00D084]/50" aria-label="Preview zoom">
                <option value="fit">Fit</option>
                <option value="0.5">50%</option>
                <option value="0.75">75%</option>
                <option value="1">100%</option>
                <option value="1.5">150%</option>
              </select>
            </label>
            <div className="flex-1" />
            <button type="button" onClick={() => setShowCode((v) => !v)} aria-pressed={showCode} className={`h-7 rounded-md border px-2.5 text-[11px] transition-colors ${showCode ? "border-[#00D084]/40 bg-[#00D084]/10 text-[#00D084]" : "border-white/[0.1] text-zinc-300 hover:bg-white/[0.06]"}`}>
              {showCode ? "Hide code" : "Show code"}
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            {showCode && (
              <div className="flex min-h-0 shrink-0 flex-col gap-2 border-b border-white/[0.06] p-3 md:w-[42%] md:border-b-0 md:border-r" style={{ maxHeight: "100%" }}>
                <p className="text-[11px] leading-relaxed text-zinc-500">
                  {version === "sent"
                    ? "The sent version, as Falcon's mail server delivers it. It is made from your code each time and cannot be edited; your original is untouched."
                    : onHtmlChange
                      ? "Your code, exactly as written. Every preview redraws from it as you type."
                      : "This email is built from blocks, so its code is generated. Change it on the canvas."}
                </p>
                <div className="flex min-h-[220px] flex-1 flex-col">
                  {version === "sent" && compat.status !== "ready"
                    ? <p className="rounded-lg border border-white/[0.08] p-4 text-[12px] text-zinc-400">{compat.status === "error" ? compat.message : "Fetching the sent version…"}</p>
                    : <CodePane value={version === "sent" && compat.status === "ready" ? compat.html : draft} onChange={version === "original" && onHtmlChange ? setDraft : undefined} jump={version === "original" ? jump : null} />}
                </div>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-auto bg-zinc-900/60 p-4 sm:p-6">
              {version === "sent" && compat.status !== "ready" ? (
                <p className="mx-auto mt-16 max-w-md text-center text-[13px] text-zinc-400">{compat.status === "error" ? compat.message : "Fetching the sent version…"}</p>
              ) : pair ? (
                <div className="flex flex-col items-start gap-8 lg:flex-row">
                  <div className="w-full min-w-0 lg:flex-[3]"><Screen html={shownHtml} width={1440} label="Desktop" zoom={zoom ?? undefined} /></div>
                  <div className="w-full min-w-0 lg:w-[390px] lg:flex-none"><Screen html={shownHtml} width={390} label="Mobile" zoom={zoom ?? undefined} /></div>
                </div>
              ) : (
                <div className="px-3"><Screen html={shownHtml} width={Math.max(MIN_WIDTH, width)} label={PRESETS.find((p) => p.width === width)?.label} onWidthChange={setWidth} zoom={zoom ?? undefined} /></div>
              )}
              {version === "sent" && compat.status === "ready" && (
                <p className="mx-auto mt-5 max-w-xl text-center text-[11px] leading-relaxed text-zinc-500">
                  Sending uses this same version: {Math.round(compat.bytes / 1024)} KB{compat.unreachable ? `, with ${compat.unreachable} picture${compat.unreachable === 1 ? "" : "s"} at an address mail apps cannot reach` : ""}. Mail apps then apply their own limits, which the Checks tab lists.
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Checks ── */}
      {tab === "checks" && (
        <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-[15px] font-semibold text-white">What the code check found</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">
              {issues.length === 0 ? "Nothing wrong was found by reading the code." : `${errors} error${errors === 1 ? "" : "s"}, ${warnings} warning${warnings === 1 ? "" : "s"}, ${issues.length - errors - warnings} note${issues.length - errors - warnings === 1 ? "" : "s"}.`} Nothing is changed for you: each finding says where it is and what would fix it.
            </p>
            <ul className="mt-4 space-y-2">
              {issues.map((issue, i) => <Finding key={i} {...issue} onShow={showLine} />)}
            </ul>

            <h2 className="mt-8 text-[15px] font-semibold text-white">Layout problems on real screen sizes</h2>
            {sizesError ? <p className="mt-2 text-[12px] text-red-300">{sizesError}</p> : !sizes ? (
              <p className="mt-2 text-[12px] text-zinc-500">Laying the email out at {CHECK_WIDTHS.length} screen sizes… {Math.round(progress * 100)}%</p>
            ) : layoutIssues === 0 ? (
              <p className="mt-2 text-[12px] text-emerald-300">✓ No overflow, cut-off content, hidden content or distorted pictures at any of the {CHECK_WIDTHS.length} sizes.</p>
            ) : (
              <p className="mt-2 text-[12px] text-zinc-400">
                {layoutIssues} problem{layoutIssues === 1 ? "" : "s"} found when the email is laid out.{" "}
                <button type="button" onClick={() => setTab("sizes")} className="text-[#00D084] hover:underline">See them by screen size</button>
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Screen sizes ── */}
      {tab === "sizes" && (
        <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-[15px] font-semibold text-white">The same email at {CHECK_WIDTHS.length} screen sizes</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">
              Your code is laid out at each width and measured for sideways scrolling, content that is cut off or hidden, stretched pictures, pictures that do not load, and buttons whose text wraps.
            </p>
            {sizesError && <p className="mt-4 text-[12px] text-red-300">{sizesError}</p>}
            {!sizes && !sizesError && (
              <div className="mt-5">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full bg-[#00D084] transition-all" style={{ width: `${Math.round(progress * 100)}%` }} /></div>
                <p className="mt-2 text-[12px] text-zinc-500">Checking…</p>
              </div>
            )}
            {sizeReport && sizeReport.common.length > 0 && (
              <div className="mt-4 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
                <p className="text-[12px] font-medium text-zinc-200">At every screen size</p>
                <ul className="mt-3 space-y-2">
                  {sizeReport.common.map((issue, i) => <Finding key={i} level="warning" {...issue} onShow={showLine} />)}
                </ul>
              </div>
            )}
            {sizeReport && (
              <ul className="mt-4 space-y-2">
                {sizeReport.rows.map((result) => (
                  <li key={result.width} className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="w-16 text-[11px] text-zinc-500">{deviceOf(result.width)}</span>
                      <span className="font-mono text-[13px] text-zinc-100">{result.width}px</span>
                      {result.issues.length === 0
                        ? <span className="text-[12px] text-emerald-300">✓ Fits</span>
                        : <span className="text-[12px] text-amber-300">⚠ {result.issues.length} problem{result.issues.length === 1 ? "" : "s"} at this size{result.overflow > 1 ? ` · scrolls ${result.overflow}px sideways` : ""}</span>}
                      <span className="text-[11px] text-zinc-600">{result.height}px tall</span>
                      <button type="button" onClick={() => openAt(result.width)} className="ml-auto text-[11px] text-[#00D084] hover:underline">Preview at {result.width}px</button>
                    </div>
                    {result.issues.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {result.issues.map((issue, i) => <Finding key={i} level={issue.kind === "small-text" ? "info" : "warning"} {...issue} onShow={showLine} />)}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ── Compare ── */}
      {tab === "compare" && (
        <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[15px] font-semibold text-white">Your original against the version that is sent</h2>
              <div className="flex items-center rounded-md border border-white/[0.08] bg-white/[0.03] p-0.5">
                {[1440, 768, 390].map((w) => (
                  <button key={w} type="button" onClick={() => setCompareWidth(w)} aria-pressed={compareWidth === w} className={`h-7 rounded px-2.5 text-[11px] transition-colors ${compareWidth === w ? "bg-[#00D084]/20 text-[#00D084]" : "text-zinc-500 hover:text-zinc-300"}`}>
                    {deviceOf(w)} <span className="font-mono text-[10px] opacity-70">{w}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center rounded-md border border-white/[0.08] bg-white/[0.03] p-0.5">
                <button type="button" onClick={() => setStrict(false)} aria-pressed={!strict} title="Apps that keep the email's stylesheet, such as Apple Mail" className={`h-7 rounded px-2.5 text-[11px] transition-colors ${!strict ? "bg-[#00D084]/20 text-[#00D084]" : "text-zinc-500 hover:text-zinc-300"}`}>Stylesheet kept</button>
                <button type="button" onClick={() => setStrict(true)} aria-pressed={strict} title="Apps that throw the stylesheet away, leaving only the styles on each element" className={`h-7 rounded px-2.5 text-[11px] transition-colors ${strict ? "bg-[#00D084]/20 text-[#00D084]" : "text-zinc-500 hover:text-zinc-300"}`}>Stylesheet dropped</button>
              </div>
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">
              Some mail apps throw an email's stylesheet away, so the sent version also carries each style on its own element. Both versions are laid out here and every element is compared for position, size, spacing, font, colour, border, shadow and alignment. “Stylesheet dropped” shows the harder case, where rules for small screens and hover effects are lost with it.
            </p>

            {compat.status === "error" && <p className="mt-6 text-[13px] text-amber-300">{compat.message}</p>}
            {compareError && <p className="mt-6 text-[13px] text-red-300">{compareError}</p>}
            {compat.status !== "error" && !compareError && !comparison && <p className="mt-6 text-[12px] text-zinc-500">Comparing…</p>}

            {comparison && compat.status === "ready" && (
              <>
                <p className={`mt-4 rounded-lg border p-3 text-[12.5px] leading-relaxed ${comparison.differences.length === 0 && comparison.missing === 0 ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-200" : "border-amber-500/30 bg-amber-500/[0.06] text-amber-100"}`}>
                  {comparison.differences.length === 0 && comparison.missing === 0
                    ? `✓ No differences at ${comparison.width}px. All ${comparison.compared} elements have the same position, size and style in both versions.`
                    : `${comparison.differences.length}${comparison.differences.length >= 80 ? "+" : ""} difference${comparison.differences.length === 1 ? "" : "s"} on ${markedOffsets.length} of ${comparison.compared} elements at ${comparison.width}px${comparison.missing ? `, and ${comparison.missing} element${comparison.missing === 1 ? "" : "s"} present in only one version` : ""}. They are outlined in both previews below.`}
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">This shows how this browser draws the two versions. A mail app can still differ from both; the Checks tab lists what each kind of app cannot show.</p>

                {comparison.differences.length > 0 && (
                  <div className="mt-4 overflow-x-auto rounded-lg border border-white/[0.07]">
                    <table className="w-full min-w-[560px] text-left text-[11.5px]">
                      <thead className="bg-white/[0.04] text-zinc-400">
                        <tr><th className="px-3 py-2 font-medium">Line</th><th className="px-3 py-2 font-medium">Element</th><th className="px-3 py-2 font-medium">What differs</th><th className="px-3 py-2 font-medium">Original</th><th className="px-3 py-2 font-medium">Sent</th></tr>
                      </thead>
                      <tbody>
                        {comparison.differences.map((d, i) => (
                          <tr key={i} className="border-t border-white/[0.05] align-top text-zinc-300">
                            <td className="px-3 py-1.5"><button type="button" onClick={() => showLine(d.line)} className="font-mono text-[#00D084] hover:underline">{d.line}</button></td>
                            <td className="max-w-[220px] truncate px-3 py-1.5 font-mono text-zinc-400" title={d.element}>{d.element}</td>
                            <td className="px-3 py-1.5">{d.property}</td>
                            <td className="max-w-[180px] break-all px-3 py-1.5 font-mono">{d.original}</td>
                            <td className="max-w-[180px] break-all px-3 py-1.5 font-mono">{d.sent}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-8 lg:flex-row">
                  <div className="w-full min-w-0 lg:flex-1"><Screen html={stampedOriginal} width={compareWidth} label="Original HTML" marked={markedOffsets} /></div>
                  <div className="w-full min-w-0 lg:flex-1"><Screen html={stampedSent} width={compareWidth} label={strict ? "Sent version, stylesheet dropped" : "Sent version"} marked={markedOffsets} /></div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
