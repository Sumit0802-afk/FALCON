import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Eraser, ImageIcon, Loader2, Lock, Palette, RefreshCw, Search, Sparkle, Sun, Upload, Wand2, Wallpaper, X } from "lucide-react";
import { ApiError } from "@/services/api";
import { removeImageBackgroundAI } from "@/services/backgroundRemovalService";
import {
  TransformCatalogue, TransformStyle, blendTransform, getTransformCatalogue, getTransformPreviews, onBackground, readPicture, runTransform,
} from "@/services/transformService";

/** The picture on the canvas that is being worked on */
export interface TransformTarget {
  id: string;
  src: string;
}

interface TransformPanelProps {
  target: TransformTarget | null;
  /** Replaces the selected picture with the result */
  onApply: (id: string, src: string, width: number, height: number) => void;
  /** Places the result on the page as a new picture */
  onAddNew: (src: string) => void;
  onUpload: () => void;
}

interface Outcome {
  title: string;
  /** The untouched picture, at the size of the results */
  original: string;
  options: { src: string; width: number; height: number }[];
  /** Results kept on the server can be mixed with the original; ones made in the browser cannot */
  blendable: boolean;
  /** What to run again for "Try again" */
  again: () => void;
}

const BACKDROPS = ["#ffffff", "#0b0f14", "#f4efe6", "#22d3ee", "#2f81ff", "#f59e0b", "#ef4444", "#10b981"];

const TOOL_ICONS: Record<string, React.ReactNode> = {
  enhance: <Sparkle size={15} />,
  relight: <Sun size={15} />,
  recolor: <Palette size={15} />,
};

function failure(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return "Please sign in to transform pictures.";
    if (err.status === 429) return "That's a lot of transformations in a short time. Please wait a few minutes and try again.";
    if (err.message) return err.message.replace(/^[a-z.0-9]+: /i, "");
  }
  if (err instanceof Error && err.message === "unreadable") return "This picture can't be read from where it is hosted. Upload it to Falcon and try again.";
  return "That didn't work. Check your connection and try again.";
}

export function TransformPanel({ target, onApply, onAddNew, onUpload }: TransformPanelProps) {
  const [catalogue, setCatalogue] = useState<TransformCatalogue | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [picture, setPicture] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [description, setDescription] = useState("");

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [chosen, setChosen] = useState(0);
  const [strength, setStrength] = useState(100);
  const [compare, setCompare] = useState(50);
  const [finishing, setFinishing] = useState<"apply" | "new" | null>(null);
  const [pickingBackdrop, setPickingBackdrop] = useState(false);

  const targetId = target?.id ?? null;
  const targetSrc = target?.src ?? null;

  useEffect(() => {
    let live = true;
    getTransformCatalogue().then((c) => live && setCatalogue(c)).catch((err) => live && setError(failure(err)));
    return () => { live = false; };
  }, []);

  // A newly selected picture is read once, and a small preview of every style is made from it
  useEffect(() => {
    setOutcome(null);
    setPreviews({});
    setPicture(null);
    setError("");
    setPickingBackdrop(false);
    if (!targetSrc) return;
    const controller = new AbortController();
    let live = true;
    (async () => {
      try {
        const data = await readPicture(targetSrc);
        if (!live) return;
        setPicture(data);
        const small = await readPicture(data, 320);
        const made = await getTransformPreviews(small, controller.signal);
        if (live) setPreviews(made);
      } catch (err) {
        if (live && !controller.signal.aborted) setError(failure(err));
      }
    })();
    return () => { live = false; controller.abort(); };
  }, [targetId, targetSrc]);

  const show = useCallback((next: Outcome) => {
    setOutcome(next);
    setChosen(0);
    setStrength(100);
    setCompare(50);
  }, []);

  const run = useCallback(async (request: { style?: TransformStyle; description?: string }) => {
    if (!picture || busy) return;
    const label = request.style?.id || "described";
    try {
      setBusy(label);
      setError("");
      const result = await runTransform({ image: picture, style: request.style?.id, description: request.description });
      show({
        title: result.style.name,
        original: result.original,
        options: result.results.map((r) => ({ src: r.url, width: r.width, height: r.height })),
        blendable: true,
        again: () => void run(request),
      });
    } catch (err) {
      setError(failure(err));
    } finally {
      setBusy(null);
    }
  }, [picture, busy, show]);

  /** Cutting the subject out happens in the browser; with a colour given, it is then set on that colour */
  const cutOut = useCallback(async (backdrop?: string) => {
    if (!picture || busy) return;
    try {
      setBusy(backdrop ? "replace-background" : "remove-background");
      setError("");
      setPickingBackdrop(false);
      const cut = await removeImageBackgroundAI(picture);
      const src = backdrop ? await onBackground(cut, backdrop) : cut;
      const image = new Image();
      image.src = src;
      await image.decode();
      show({
        title: backdrop ? "Replace Background" : "Remove Background",
        original: picture,
        options: [{ src, width: image.naturalWidth, height: image.naturalHeight }],
        blendable: false,
        again: () => void cutOut(backdrop),
      });
    } catch {
      setError("The background couldn't be removed from this picture. Try one with a clearer subject.");
    } finally {
      setBusy(null);
    }
  }, [picture, busy, show]);

  const finish = async (how: "apply" | "new") => {
    if (!outcome || !target || finishing) return;
    const option = outcome.options[chosen];
    try {
      setFinishing(how);
      setError("");
      let final = option;
      // Anything short of full strength is mixed with the original on the server and saved as one picture
      if (outcome.blendable && strength < 100) {
        const mixed = strength <= 0 ? { url: outcome.original, width: option.width, height: option.height } : await blendTransform(outcome.original, option.src, strength);
        final = { src: mixed.url, width: mixed.width, height: mixed.height };
      }
      if (how === "apply") onApply(target.id, final.src, final.width, final.height);
      else onAddNew(final.src);
      if (how === "apply") setOutcome(null);
    } catch (err) {
      setError(failure(err));
    } finally {
      setFinishing(null);
    }
  };

  const groups = useMemo(() => {
    if (!catalogue) return [];
    const q = query.trim().toLowerCase();
    return catalogue.groups
      .map((group) => ({ ...group, styles: group.styles.filter((s) => !q || s.name.toLowerCase().includes(q) || group.name.toLowerCase().includes(q)) }))
      .filter((group) => group.styles.length);
  }, [catalogue, query]);

  const describe = () => {
    const text = description.trim();
    if (text.length >= 3) void run({ description: text });
  };

  const option = outcome?.options[chosen];

  return (
    <aside className="falcon-transform-panel flex h-full w-[340px] shrink-0 flex-col border-r border-white/[0.08] bg-[#0c0c0e] text-white select-none relative">

      {/* HEADER */}
      <div className="border-b border-white/[0.08] bg-[#111114] p-3.5 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Wand2 size={18} />
          </div>
          <div>
            <h2 className="text-xs font-semibold tracking-wide text-white">Transform</h2>
            <p className="text-[10px] text-zinc-500">Restyle a picture without leaving the editor</p>
          </div>
        </div>

        {target && !outcome && (
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search styles..."
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] py-2 pl-8 pr-8 text-[12px] text-white placeholder-zinc-600 outline-none focus:border-cyan-500/40"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                <X size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div role="alert" className="mx-3.5 mt-3 rounded-lg border border-red-500/25 bg-red-500/[0.08] px-3 py-2 text-[11px] leading-relaxed text-red-200">
          {error}
        </div>
      )}

      {/* NOTHING SELECTED */}
      {!target && (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-zinc-500">
            <ImageIcon size={24} />
          </div>
          <h3 className="mt-4 text-[13px] font-semibold text-white">Select an image to transform</h3>
          <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">
            Click a picture on the page, then choose a style here.
          </p>
          <button
            type="button"
            onClick={onUpload}
            className="mt-5 flex items-center gap-2 rounded-lg bg-[#00c4cc] px-4 py-2 text-[12px] font-semibold text-black transition hover:bg-[#00dbe4]"
          >
            <Upload size={13} />
            Upload Image
          </button>
        </div>
      )}

      {/* THE RESULT */}
      {target && outcome && option && (
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">

          <button type="button" onClick={() => setOutcome(null)} className="flex items-center gap-1.5 text-[11px] text-zinc-400 transition hover:text-white">
            <ArrowLeft size={12} />
            All styles
          </button>

          <div>
            <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              <span>Original</span>
              <span className="text-cyan-300">{outcome.title}</span>
            </div>

            {/* Before and after: the original shows to the left of the handle */}
            <div data-theme-keep="" className="relative overflow-hidden rounded-xl border border-white/[0.1] bg-[conic-gradient(#1a1b20_25%,#121318_0_50%,#1a1b20_0_75%,#121318_0)] bg-[length:16px_16px]">
              <img src={outcome.original} alt="Original" className="block w-full" draggable={false} />
              <img
                src={option.src}
                alt={outcome.title}
                draggable={false}
                className="absolute inset-0 h-full w-full"
                style={{ opacity: outcome.blendable ? strength / 100 : 1, clipPath: `inset(0 0 0 ${compare}%)` }}
              />
              <div className="pointer-events-none absolute inset-y-0 w-px bg-white shadow-[0_0_8px_rgba(0,0,0,0.6)]" style={{ left: `${compare}%` }}>
                <div className="absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-black/70 text-[10px] text-white">
                  ↔
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={compare}
                onChange={(e) => setCompare(Number(e.target.value))}
                aria-label="Drag to compare the original with the result"
                className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
              />
            </div>
          </div>

          {outcome.blendable && (
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-zinc-300">Strength</span>
                <span className="font-mono text-zinc-500">{strength}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={strength}
                onChange={(e) => setStrength(Number(e.target.value))}
                aria-label="Strength"
                className="w-full accent-[#00c4cc]"
              />
              <div className="flex justify-between text-[9px] text-zinc-600">
                <span>Original</span>
                <span>Full</span>
              </div>
            </div>
          )}

          {outcome.options.length > 1 && (
            <div>
              <div className="mb-2 text-[11px] font-semibold text-zinc-300">Variations</div>
              <div className="grid grid-cols-4 gap-2">
                {outcome.options.map((item, index) => (
                  <button
                    key={item.src}
                    type="button"
                    onClick={() => setChosen(index)}
                    aria-pressed={chosen === index}
                    aria-label={`Variation ${index + 1}`}
                    data-theme-keep=""
                    className={`relative aspect-square overflow-hidden rounded-lg border transition ${chosen === index ? "border-[#00c4cc] shadow-[0_0_12px_rgba(0,196,204,0.3)]" : "border-white/[0.1] hover:border-white/30"}`}
                  >
                    <img src={item.src} alt="" className="h-full w-full object-cover" draggable={false} />
                    {chosen === index && (
                      <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#00c4cc] text-black">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => void finish("apply")}
              disabled={finishing !== null}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#00c4cc] py-2.5 text-[12px] font-semibold text-black transition hover:bg-[#00dbe4] disabled:opacity-50"
            >
              {finishing === "apply" && <Loader2 size={13} className="animate-spin" />}
              Apply
            </button>
            <button
              type="button"
              onClick={() => void finish("new")}
              disabled={finishing !== null}
              className="flex items-center justify-center gap-2 rounded-lg border border-white/[0.14] bg-white/[0.04] py-2.5 text-[12px] font-semibold text-white transition hover:bg-white/[0.08] disabled:opacity-50"
            >
              {finishing === "new" && <Loader2 size={13} className="animate-spin" />}
              Add as New
            </button>
          </div>
          <button
            type="button"
            onClick={outcome.again}
            disabled={busy !== null || finishing !== null}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-[11px] text-zinc-400 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
          >
            {busy ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Try Again
          </button>
          <p className="text-center text-[10px] leading-relaxed text-zinc-600">
            Applying keeps your original: Undo brings it back.
          </p>
        </div>
      )}

      {/* THE STYLES */}
      {target && !outcome && (
        <>
          <div className="flex-1 overflow-y-auto p-3.5 space-y-5">

            {!catalogue && !error && (
              <div className="flex items-center justify-center gap-2 py-10 text-[11px] text-zinc-500">
                <Loader2 size={13} className="animate-spin" />
                Loading styles…
              </div>
            )}

            {groups.map((group) => (
              <section key={group.name}>
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{group.name}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {group.styles.map((style) => {
                    const preview = previews[style.id];
                    const working = busy === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => void run({ style })}
                        disabled={!style.available || busy !== null || !picture}
                        title={style.available ? `Transform into ${style.name}` : `${style.name} isn't available on this server yet`}
                        className={`group flex flex-col overflow-hidden rounded-lg border text-left transition ${style.available ? "border-white/[0.08] bg-[#14151a] hover:border-cyan-500/50" : "border-white/[0.05] bg-[#101116] opacity-60"} disabled:cursor-not-allowed`}
                      >
                        <span data-theme-keep="" className="relative block aspect-square w-full overflow-hidden bg-black/40">
                          {/* Until its preview is ready, and for styles that cannot be previewed, the picture itself is shown */}
                          {(preview || picture) && (
                            <img
                              src={preview || picture || ""}
                              alt=""
                              draggable={false}
                              className={`h-full w-full object-cover transition-transform duration-300 ${style.available ? "group-hover:scale-105" : "grayscale"} ${!preview && style.available ? "opacity-40" : ""}`}
                            />
                          )}
                          {!style.available && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-zinc-300">
                              <Lock size={14} />
                            </span>
                          )}
                          {working && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-cyan-300">
                              <Loader2 size={16} className="animate-spin" />
                            </span>
                          )}
                        </span>
                        <span className="truncate px-2 py-1.5 text-[10px] font-medium text-zinc-300">{style.name}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}

            {catalogue && !groups.length && (
              <p className="py-8 text-center text-[11px] text-zinc-500">No style matches “{query}”.</p>
            )}

            {/* QUICK TOOLS */}
            {catalogue && !query && (
              <section>
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Quick tools</h3>
                <div className="grid grid-cols-2 gap-2">
                  {catalogue.tools.filter((tool) => tool.id === "enhance").map((tool) => (
                    <ToolButton key={tool.id} icon={TOOL_ICONS[tool.id]} label={tool.name} working={busy === tool.id} disabled={busy !== null || !picture} onClick={() => void run({ style: tool })} />
                  ))}
                  <ToolButton icon={<Eraser size={15} />} label="Remove Background" working={busy === "remove-background"} disabled={busy !== null || !picture} onClick={() => void cutOut()} />
                  <ToolButton icon={<Wallpaper size={15} />} label="Replace Background" working={busy === "replace-background"} disabled={busy !== null || !picture} onClick={() => setPickingBackdrop((open) => !open)} />
                  {catalogue.tools.filter((tool) => tool.id !== "enhance").map((tool) => (
                    <ToolButton key={tool.id} icon={TOOL_ICONS[tool.id]} label={tool.name} working={busy === tool.id} disabled={busy !== null || !picture} onClick={() => void run({ style: tool })} />
                  ))}
                </div>

                {pickingBackdrop && (
                  <div className="mt-2 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
                    <p className="mb-2 text-[10px] text-zinc-400">Choose the new background colour</p>
                    <div className="flex flex-wrap gap-2">
                      {BACKDROPS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => void cutOut(color)}
                          aria-label={`Use ${color} as the background`}
                          data-theme-keep=""
                          className="h-7 w-7 rounded-full border border-white/20 transition hover:scale-110"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {(busy === "remove-background" || busy === "replace-background") && (
                  <p className="mt-2 text-[10px] leading-relaxed text-zinc-500">
                    Finding the subject. The first time takes a little longer.
                  </p>
                )}
              </section>
            )}
          </div>

          {/* A WRITTEN REQUEST */}
          <div className="border-t border-white/[0.08] bg-[#111114] p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    describe();
                  }
                }}
                rows={2}
                maxLength={300}
                placeholder="Describe the transformation..."
                className="min-h-[44px] flex-1 resize-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[12px] leading-snug text-white placeholder-zinc-600 outline-none focus:border-cyan-500/40"
              />
              <button
                type="button"
                onClick={describe}
                disabled={description.trim().length < 3 || busy !== null || !picture}
                aria-label="Transform from this description"
                className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-lg bg-[#00c4cc] text-black transition hover:bg-[#00dbe4] disabled:opacity-30"
              >
                {busy === "described" ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
              </button>
            </div>
            <p className="mt-1.5 text-[9px] leading-relaxed text-zinc-600">
              For example: “Create a comic-book version” or “Make this look like a pencil sketch”.
            </p>
          </div>
        </>
      )}
    </aside>
  );
}

function ToolButton({ icon, label, working, disabled, onClick }: { icon: React.ReactNode; label: string; working: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#14151a] px-3 py-2.5 text-left text-[11px] font-medium text-zinc-300 transition hover:border-cyan-500/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="text-cyan-400">{working ? <Loader2 size={15} className="animate-spin" /> : icon}</span>
      {label}
    </button>
  );
}
