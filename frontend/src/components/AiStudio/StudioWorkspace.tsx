import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight, Check, ChevronDown, Circle, Download, ImagePlus, Layers, Loader2, PenLine, RefreshCw, ScanSearch, Sparkles, Trash2, Wand2, Wrench, X,
} from "lucide-react";
import { ApiError } from "@/services/api";
import { isAuthenticated } from "@/services/authService";
import {
  AI_SIZES, AiDesign, STUDIO_DEFAULTS, StudioAnalysis, StudioArtwork, StudioContent, StudioDensity, StudioDna, StudioFidelity, StudioLevel,
  StudioReference, StudioRole, StudioSettings, StudioStrength, StudioUsage,
  analyzeReferences, compileStudioPrompt, evaluateStudioArtwork, makeStudioArtwork, makeStudioLayout, openAiDesign, openStudioArtwork,
} from "@/services/aiService";

/* ─── Choices ─────────────────────────────────────────────────────────────── */

const STRENGTHS: { id: StudioStrength; label: string; hint: string }[] = [
  { id: "creative", label: "Creative", hint: "The reference is inspiration; the design is composed freely" },
  { id: "balanced", label: "Balanced", hint: "Same design language, details reworked" },
  { id: "strong", label: "Strong", hint: "Same arrangement, palette, type and density" },
  { id: "exact", label: "Exact", hint: "As close to the reference as possible; only the content changes" },
];
const USAGES: { id: StudioUsage; label: string }[] = [
  { id: "full", label: "Full reference" },
  { id: "composition", label: "Composition" },
  { id: "style", label: "Style" },
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
];
const DENSITIES: { id: StudioDensity; label: string }[] = [
  { id: "low", label: "Low" }, { id: "medium", label: "Medium" }, { id: "high", label: "High" }, { id: "ultra", label: "Ultra" },
];
const LEVELS: { id: StudioLevel; label: string }[] = [{ id: "low", label: "Low" }, { id: "medium", label: "Medium" }, { id: "high", label: "High" }];
const ROLES: { id: StudioRole; label: string }[] = [
  { id: "full", label: "Everything" }, { id: "layout", label: "Layout" }, { id: "color", label: "Color" }, { id: "typography", label: "Typography" }, { id: "hero", label: "Hero object" },
];
const PROBLEMS = ["Wrong typography", "Wrong layout", "Wrong colors", "Missing element", "Too empty", "Too simple", "Wrong subject", "Reference mismatch", "Text issue", "Low detail"];

/** Variations keep the design and change one thing each */
const VARIATION_NOTES = [
  "Same composition, colours and type. Give the hero object a different treatment.",
  "Same layout and colours. Vary the title lettering slightly, keeping its character.",
  "Same design language and layout. Change the background effects only.",
  "Same structure and type. Change the intensity of the colours only.",
];

const PROMPTS = [
  "Futuristic fintech hackathon poster",
  "Minimal luxury fashion campaign",
  "Modern cafe Instagram post",
  "Tech startup launch announcement",
];

/** Below this the result is made once more with the reviewer's note */
const FIDELITY_FLOOR = 62;
const MAX_REFERENCES = 4;

type StepId = "analyze" | "compile" | "artwork" | "evaluate" | "refine" | "layout";
type StepState = "waiting" | "working" | "done" | "skipped";
const STEP_LABELS: Record<StepId, string> = {
  analyze: "Analyzing reference and extracting its visual style",
  compile: "Reading your request and building the composition",
  artwork: "Generating artwork",
  evaluate: "Checking reference fidelity",
  refine: "Refining to follow the reference more closely",
  layout: "Setting out an editable design",
};

interface Outcome {
  kind: "artwork" | "layout";
  artwork?: StudioArtwork;
  design?: AiDesign;
  fidelity?: StudioFidelity | null;
  /** Other versions of this same design */
  versions: { artwork?: StudioArtwork; design?: AiDesign; label: string }[];
  size: string;
  content: StudioContent;
  compiled: string;
}

function failureMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return "Please sign in to use AI Studio.";
    if (err.status === 429) return "You've asked for a lot of designs in a short time. Please wait a few minutes and try again.";
    if (err.message) return err.message.replace(/^[a-z.0-9]+: /i, "");
  }
  return "Falcon couldn't reach AI Studio. Check your connection and try again.";
}

/** A picture file as a JPEG data address, scaled down so it travels quickly */
async function readReference(file: Blob): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("unreadable");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.88);
}

/* ─── Small controls ──────────────────────────────────────────────────────── */

const LABEL = "mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500";
const FIELD = "w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[12.5px] text-white outline-none transition focus:border-cyan-400/40";

function Segmented<T extends string>({ value, options, onChange, disabled, label }: { value: T; options: { id: T; label: string; hint?: string }[]; onChange: (v: T) => void; disabled?: boolean; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className={`grid gap-1 rounded-lg border border-white/[0.08] bg-white/[0.02] p-1 ${disabled ? "opacity-45" : ""}`} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={value === option.id}
          title={option.hint}
          disabled={disabled}
          onClick={() => onChange(option.id)}
          className={`rounded-md px-1 py-1.5 text-[11px] transition ${value === option.id ? "bg-cyan-400/15 font-semibold text-cyan-200" : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"} disabled:cursor-not-allowed`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10.5px] text-zinc-500">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className={`${FIELD} py-1.5 [&>option]:bg-[#0b0f14]`}>
        {options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
      </select>
    </label>
  );
}

function Fold({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.015]">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[11.5px] font-medium text-zinc-300 transition hover:text-white">
        {title}
        <ChevronDown size={14} className={`text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-white/[0.07] p-3.5">{children}</div>}
    </div>
  );
}

/* ─── The workspace ───────────────────────────────────────────────────────── */

export default function StudioWorkspace() {
  const router = useRouter();

  const [references, setReferences] = useState<StudioReference[]>([]);
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState(AI_SIZES[0].id);
  const [settings, setSettings] = useState<StudioSettings>(STUDIO_DEFAULTS);
  /** Settings the person has set by hand are not replaced by the ones chosen from the reference */
  const touched = useRef(new Set<keyof StudioSettings>());

  const [analysis, setAnalysis] = useState<StudioAnalysis | null>(null);
  const [dna, setDna] = useState<StudioDna | null>(null);
  /** The references the analysis on screen was made from */
  const analysedFor = useRef("");
  const [analysing, setAnalysing] = useState(false);

  const [compiled, setCompiled] = useState("");
  /** What the compiled prompt on screen was made from; a hand-edited prompt is used as it is while this still matches */
  const compiledFor = useRef("");
  const [content, setContent] = useState<StudioContent | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [enhancing, setEnhancing] = useState(false);

  const [steps, setSteps] = useState<{ id: StepId; state: StepState }[]>([]);
  const [working, setWorking] = useState(false);
  const [busy, setBusy] = useState<"" | "regenerate" | "variations" | "fix" | "open" | "download">("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [fixing, setFixing] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const preview = useRef<HTMLDivElement>(null);

  const set = <K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) => {
    touched.current.add(key);
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const signedIn = () => {
    if (isAuthenticated()) return true;
    router.push(`/login?redirect=${encodeURIComponent("/ai-studio")}`);
    return false;
  };

  /* ── References ─────────────────────────────────────────────────────────── */

  const addFiles = useCallback(async (files: (File | Blob)[]) => {
    const pictures = files.filter((file) => file.type.startsWith("image/"));
    if (!pictures.length) return;
    try {
      setError("");
      const read = await Promise.all(pictures.slice(0, MAX_REFERENCES).map(readReference));
      setReferences((current) => [...current, ...read.map((image, index): StudioReference => ({ image, role: current.length + index === 0 ? "full" : (["layout", "color", "typography", "hero"] as StudioRole[])[(current.length + index - 1) % 4] }))].slice(0, MAX_REFERENCES));
    } catch {
      setError("That picture could not be read. Use a PNG, JPEG or WebP.");
    }
  }, []);

  // A picture on the clipboard is taken as a reference wherever it is pasted on the page
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const files = [...(event.clipboardData?.files || [])].filter((file) => file.type.startsWith("image/"));
      if (!files.length) return;
      event.preventDefault();
      void addFiles(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addFiles]);

  const referenceKey = (list: StudioReference[]) => list.map((r) => `${r.role}:${r.image.length}:${r.image.slice(-24)}`).join("|");

  /** Looks at the references, and takes the settings they suggest unless the person has set their own */
  const analyse = useCallback(async (list: StudioReference[]): Promise<{ analysis: StudioAnalysis; dna: StudioDna; settings: StudioSettings } | null> => {
    const result = await analyzeReferences(list);
    const next = { ...result.defaults };
    for (const key of touched.current) (next as Record<string, unknown>)[key] = (settings as unknown as Record<string, unknown>)[key];
    setAnalysis(result.analysis);
    setDna(result.dna);
    setSettings(next);
    analysedFor.current = referenceKey(list);
    return { analysis: result.analysis, dna: result.dna, settings: next };
  }, [settings]);

  // A reference is looked at as soon as it is added, so its settings are on screen before generating
  useEffect(() => {
    if (!references.length) {
      setAnalysis(null);
      setDna(null);
      analysedFor.current = "";
      return;
    }
    if (referenceKey(references) === analysedFor.current || !isAuthenticated()) return;
    let live = true;
    const timer = setTimeout(async () => {
      try {
        setAnalysing(true);
        await analyse(references);
      } catch (err) {
        if (live) setError(failureMessage(err));
      } finally {
        setAnalysing(false);
      }
    }, 500);
    return () => { live = false; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [references]);

  /* ── The pipeline ───────────────────────────────────────────────────────── */

  const mark = (id: StepId, state: StepState) => setSteps((current) => current.map((step) => (step.id === id ? { ...step, state } : step)));

  const inputKey = () => `${prompt.trim()}|${size}|${referenceKey(references)}|${JSON.stringify(settings)}`;

  /** The analysis and the compiled prompt for what is on screen now, made if they are not there yet */
  const prepare = async (track: boolean) => {
    let seen = analysis, look = dna, chosen = settings;
    if (references.length && referenceKey(references) !== analysedFor.current) {
      if (track) mark("analyze", "working");
      const result = await analyse(references);
      if (result) { seen = result.analysis; look = result.dna; chosen = result.settings; }
    }
    if (track) mark("analyze", references.length ? "done" : "skipped");

    if (track) mark("compile", "working");
    // A prompt the person edited by hand is used as it stands, as long as nothing it was made from has changed
    if (compiled.trim() && content && compiledFor.current === inputKey()) {
      if (track) mark("compile", "done");
      return { analysis: seen, dna: look, settings: chosen, compiled, content };
    }
    const result = await compileStudioPrompt({ prompt: prompt.trim(), size, analysis: seen, dna: look, settings: chosen });
    setCompiled(result.compiled);
    setContent(result.content);
    setNotes(result.notes);
    setSettings(result.settings);
    compiledFor.current = `${prompt.trim()}|${size}|${referenceKey(references)}|${JSON.stringify(result.settings)}`;
    if (track) mark("compile", "done");
    return { analysis: seen, dna: look, settings: result.settings, compiled: result.compiled, content: result.content };
  };

  const enhance = async () => {
    if (prompt.trim().length < 3 || enhancing || working || !signedIn()) return;
    try {
      setEnhancing(true);
      setError("");
      compiledFor.current = "";
      await prepare(false);
      setShowPrompt(true);
    } catch (err) {
      setError(failureMessage(err));
    } finally {
      setEnhancing(false);
    }
  };

  const generate = async () => {
    if (prompt.trim().length < 3 || working || !signedIn()) return;
    setWorking(true);
    setError("");
    setNotice("");
    setOutcome(null);
    setFixing(false);
    setSteps([{ id: "analyze", state: "waiting" }, { id: "compile", state: "waiting" }, { id: "artwork", state: "waiting" }, { id: "evaluate", state: "waiting" }]);
    setTimeout(() => preview.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 60);

    try {
      const ready = await prepare(true);
      try {
        mark("artwork", "working");
        let artwork = await makeStudioArtwork({ compiled: ready.compiled, size, references });
        mark("artwork", "done");

        let fidelity: StudioFidelity | null = null;
        if (references.length) {
          mark("evaluate", "working");
          fidelity = await evaluateStudioArtwork({ reference: references[0].image, result: artwork.url, content: ready.content }).catch(() => null);
          mark("evaluate", "done");
          // A poor match is made once more with the reviewer's note, and the better of the two is kept
          if (fidelity && fidelity.score < FIDELITY_FLOOR && fidelity.refine) {
            setSteps((current) => [...current, { id: "refine", state: "working" }]);
            try {
              const second = await makeStudioArtwork({ compiled: ready.compiled, size, references, base: artwork.url, instruction: fidelity.refine });
              const again = await evaluateStudioArtwork({ reference: references[0].image, result: second.url, content: ready.content }).catch(() => null);
              if (again && again.score > fidelity.score) { artwork = second; fidelity = again; }
            } catch {
              // The first result stands
            }
            mark("refine", "done");
          }
        } else {
          mark("evaluate", "skipped");
        }
        setOutcome({ kind: "artwork", artwork, fidelity, versions: [], size, content: ready.content, compiled: ready.compiled });
      } catch (err) {
        // No picture model on this server: an editable layout is the honest alternative, and it is said so
        if (!(err instanceof ApiError) || err.code !== "ARTWORK_UNAVAILABLE") throw err;
        setSteps((current) => [...current.filter((step) => step.id !== "artwork" && step.id !== "evaluate"), { id: "layout", state: "working" }]);
        const result = await makeStudioLayout({ prompt: prompt.trim(), size, content: ready.content, analysis: ready.analysis, settings: ready.settings, count: 1 });
        mark("layout", "done");
        setNotice(`${failureMessage(err)} Until then AI Studio sets your content out as an editable design with Falcon's layout engine${references.length ? ", using the reference's colours, type and density. It is a set layout, not a recreation of the reference" : ""}.`);
        setOutcome({ kind: "layout", design: result.designs[0], fidelity: null, versions: [], size, content: ready.content, compiled: ready.compiled });
      }
    } catch (err) {
      setError(failureMessage(err));
    } finally {
      setWorking(false);
    }
  };

  /* ── Working on a result ────────────────────────────────────────────────── */

  /** The same design made again, kept as the same design */
  const regenerate = async (instruction = "Make this same design again with a better finish: sharper type, cleaner edges, more consistent lighting. Keep the composition, colours and type.") => {
    if (!outcome || busy || working) return;
    try {
      setBusy(instruction.startsWith("Fix only") ? "fix" : "regenerate");
      setError("");
      if (outcome.kind === "artwork" && outcome.artwork) {
        const artwork = await makeStudioArtwork({ compiled: outcome.compiled, size: outcome.size, references, base: outcome.artwork.url, instruction });
        const fidelity = references.length ? await evaluateStudioArtwork({ reference: references[0].image, result: artwork.url, content: outcome.content }).catch(() => null) : null;
        setOutcome({ ...outcome, artwork, fidelity, versions: [{ artwork: outcome.artwork, label: "Before" }, ...outcome.versions.slice(0, 5)] });
      } else if (outcome.design) {
        const result = await makeStudioLayout({ prompt: prompt.trim() || outcome.design.name, size: outcome.size, content: outcome.content, analysis, settings, count: 1, keep: outcome.design.spec });
        setOutcome({ ...outcome, design: result.designs[0], versions: [{ design: outcome.design, label: "Before" }, ...outcome.versions.slice(0, 5)] });
      }
      setFixing(false);
      setProblems([]);
    } catch (err) {
      setError(failureMessage(err));
    } finally {
      setBusy("");
    }
  };

  const variations = async () => {
    if (!outcome || busy || working) return;
    const count = Math.max(2, settings.variations > 1 ? settings.variations : 4);
    try {
      setBusy("variations");
      setError("");
      if (outcome.kind === "artwork" && outcome.artwork) {
        const base = outcome.artwork.url;
        const made = await Promise.allSettled(VARIATION_NOTES.slice(0, count).map((note) => makeStudioArtwork({ compiled: outcome.compiled, size: outcome.size, references, base, instruction: `Make a variation of this design. ${note} Do not redesign it.` })));
        const versions = made.flatMap((item, index) => (item.status === "fulfilled" ? [{ artwork: item.value, label: `Variation ${index + 1}` }] : []));
        if (!versions.length) throw made[0].status === "rejected" ? made[0].reason : new Error("none");
        setOutcome({ ...outcome, versions });
      } else if (outcome.design) {
        const result = await makeStudioLayout({ prompt: prompt.trim() || outcome.design.name, size: outcome.size, content: outcome.content, analysis, settings, count, keep: outcome.design.spec });
        setOutcome({ ...outcome, versions: result.designs.map((design, index) => ({ design, label: `Variation ${index + 1}` })) });
      }
    } catch (err) {
      setError(failureMessage(err));
    } finally {
      setBusy("");
    }
  };

  /** Puts another version in the main view; the one that was there takes its place in the row */
  const choose = (index: number) => {
    if (!outcome) return;
    const picked = outcome.versions[index];
    const versions = [...outcome.versions];
    versions[index] = { artwork: outcome.artwork, design: outcome.design, label: picked.label };
    setOutcome({ ...outcome, artwork: picked.artwork, design: picked.design, fidelity: null, versions });
  };

  const openInEditor = async () => {
    if (!outcome || busy) return;
    try {
      setBusy("open");
      setError("");
      const { projectId } = outcome.kind === "artwork" && outcome.artwork
        ? await openStudioArtwork({ url: outcome.artwork.url, size: outcome.size, title: String(outcome.content.title || prompt.trim().slice(0, 80)) })
        : await openAiDesign(outcome.design!.spec, outcome.size);
      router.push(`/editor/${projectId}?from=ai-studio`);
    } catch (err) {
      setError(failureMessage(err));
      setBusy("");
    }
  };

  const fetchArtwork = async () => (await fetch(outcome!.artwork!.url, { mode: "cors" })).blob();

  const download = async () => {
    if (!outcome?.artwork || busy) return;
    try {
      setBusy("download");
      const address = URL.createObjectURL(await fetchArtwork());
      const link = document.createElement("a");
      link.href = address;
      link.download = `${String(outcome.content.title || "falcon-design").replace(/[^\w -]+/g, "").trim().replace(/\s+/g, "-").toLowerCase() || "falcon-design"}.jpg`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(address), 4000);
    } catch {
      setError("The design could not be downloaded. Check your connection and try again.");
    } finally {
      setBusy("");
    }
  };

  const useAsReference = async () => {
    if (!outcome?.artwork || busy) return;
    try {
      await addFiles([await fetchArtwork()]);
    } catch {
      setError("The design could not be added as a reference.");
    }
  };

  const hasReference = references.length > 0;
  const canGenerate = prompt.trim().length >= 3 && !working;
  const palette = dna?.palette || [];

  return (
    <div className="mx-auto mt-12 grid max-w-[1380px] gap-5 lg:grid-cols-[400px_minmax(0,1fr)]">

      {/* ═══ CONTROLS ═══════════════════════════════════════════════════════ */}
      <div className="space-y-4 rounded-[22px] border border-white/[0.08] bg-[#070a0b]/90 p-5">

        {/* Reference */}
        <div>
          <span className={LABEL}>Reference</span>
          {hasReference && (
            <div className="mb-2 grid grid-cols-2 gap-2">
              {references.map((reference, index) => (
                <div key={`${index}-${reference.image.length}`} className="overflow-hidden rounded-lg border border-white/[0.1] bg-black/40">
                  <div data-theme-keep="" className="relative">
                    <img src={reference.image} alt={`Reference ${index + 1}`} className="block aspect-[4/5] w-full object-cover" />
                    <button type="button" onClick={() => setReferences((current) => current.filter((_, i) => i !== index))} aria-label={`Remove reference ${index + 1}`} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-500">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  {references.length > 1 && (
                    <select value={reference.role} onChange={(e) => setReferences((current) => current.map((item, i) => (i === index ? { ...item, role: e.target.value as StudioRole } : item)))} aria-label={`What reference ${index + 1} controls`} className="w-full border-t border-white/[0.08] bg-transparent px-2 py-1.5 text-[10.5px] text-zinc-300 outline-none [&>option]:bg-[#0b0f14]">
                      {ROLES.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </div>
          )}
          {references.length < MAX_REFERENCES && (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); void addFiles([...e.dataTransfer.files]); }}
              className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-4 text-center transition ${hasReference ? "py-3" : "py-7"} ${dragging ? "border-cyan-300/70 bg-cyan-400/[0.07]" : "border-white/[0.14] bg-white/[0.02] hover:border-cyan-300/40 hover:bg-white/[0.04]"}`}
            >
              <ImagePlus size={hasReference ? 15 : 20} className="text-cyan-300" />
              <span className="text-[12px] font-medium text-zinc-200">{hasReference ? "Add another reference" : "Upload a reference"}</span>
              {!hasReference && <span className="text-[10.5px] leading-relaxed text-zinc-500">Drop a picture here, click to choose, or paste one.<br />It becomes the visual blueprint for your design.</span>}
            </button>
          )}
          <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={(e) => { void addFiles([...(e.target.files || [])]); e.target.value = ""; }} />

          {hasReference && (
            <div className="mt-2 rounded-lg border border-cyan-400/15 bg-cyan-400/[0.04] px-3 py-2 text-[10.5px] leading-relaxed text-zinc-300">
              {analysing ? (
                <span className="flex items-center gap-2 text-cyan-200"><Loader2 size={12} className="animate-spin" /> Analyzing the reference…</span>
              ) : analysis ? (
                <>
                  <span className="flex items-center gap-1.5 font-medium text-cyan-200"><ScanSearch size={12} /> This image is used as the visual reference</span>
                  <span className="mt-1 block text-zinc-400">{analysis.summary}</span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {palette.slice(0, 6).map((colour) => <span key={colour} data-theme-keep="" title={colour} className="h-3.5 w-3.5 rounded-full border border-white/25" style={{ backgroundColor: colour }} />)}
                    {analysis.typography.category && <span className="rounded-full border border-white/[0.1] px-1.5 py-0.5 text-[9.5px] text-zinc-300">{analysis.typography.category}</span>}
                    <span className="rounded-full border border-white/[0.1] px-1.5 py-0.5 text-[9.5px] text-zinc-300">{analysis.density.level} density</span>
                  </span>
                </>
              ) : (
                <span className="text-zinc-400">This image will be used as the visual reference.</span>
              )}
            </div>
          )}
        </div>

        {/* Prompt */}
        <div>
          <span className={LABEL}>Prompt</span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            placeholder={hasReference ? "What should this design say and show? Give the title, date, venue and anything to change…" : "Describe the design you want…"}
            className={`${FIELD} resize-y leading-relaxed placeholder-zinc-600`}
          />
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <button type="button" onClick={() => void enhance()} disabled={prompt.trim().length < 3 || enhancing || working} className="flex items-center gap-1.5 rounded-full border border-cyan-300/30 bg-cyan-400/[0.07] px-3 py-1.5 text-[11px] font-medium text-cyan-200 transition hover:bg-cyan-400/[0.14] disabled:opacity-40">
              {enhancing ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
              Enhance prompt
            </button>
            {!prompt && PROMPTS.slice(0, 2).map((example) => (
              <button key={example} type="button" onClick={() => setPrompt(example)} className="rounded-full border border-white/[0.08] px-2.5 py-1.5 text-[10.5px] text-zinc-500 transition hover:border-white/20 hover:text-zinc-200">{example}</button>
            ))}
          </div>
        </div>

        {/* Format */}
        <label className="block">
          <span className={LABEL}>Format</span>
          <select value={size} onChange={(e) => setSize(e.target.value)} className={`${FIELD} [&>option]:bg-[#0b0f14]`}>
            {AI_SIZES.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </label>

        {/* Reference controls */}
        <div>
          <span className={LABEL}>Reference strength</span>
          <Segmented label="Reference strength" value={settings.strength} options={STRENGTHS} onChange={(v) => set("strength", v)} disabled={!hasReference} />
          <p className="mt-1.5 text-[10px] leading-relaxed text-zinc-600">{hasReference ? STRENGTHS.find((s) => s.id === settings.strength)?.hint : "Add a reference to use these controls."}</p>
        </div>
        <div className={hasReference ? "" : "opacity-45"}>
          <span className={LABEL}>Reference controls</span>
          <select value={settings.usage} onChange={(e) => set("usage", e.target.value as StudioUsage)} disabled={!hasReference} aria-label="What the reference controls" className={`${FIELD} [&>option]:bg-[#0b0f14] disabled:cursor-not-allowed`}>
            {USAGES.map((usage) => <option key={usage.id} value={usage.id}>{usage.label}</option>)}
          </select>
        </div>
        <div>
          <span className={LABEL}>Visual density</span>
          <Segmented label="Visual density" value={settings.density} options={DENSITIES} onChange={(v) => set("density", v)} />
        </div>

        <Fold title="Advanced controls" open={showAdvanced} onToggle={() => setShowAdvanced((v) => !v)}>
          <div className="grid grid-cols-2 gap-3">
            <Choice label="Creativity" value={settings.creativity} options={LEVELS} onChange={(v) => set("creativity", v)} />
            <Choice label="Detail level" value={settings.detail} options={DENSITIES} onChange={(v) => set("detail", v)} />
            <Choice label="Typography fidelity" value={settings.typographyFidelity} options={LEVELS} onChange={(v) => set("typographyFidelity", v)} />
            <Choice label="Layout fidelity" value={settings.layoutFidelity} options={LEVELS} onChange={(v) => set("layoutFidelity", v)} />
            <Choice label="Color fidelity" value={settings.colorFidelity} options={LEVELS} onChange={(v) => set("colorFidelity", v)} />
            <Choice label="Output quality" value={settings.quality} options={[{ id: "standard", label: "Standard" }, { id: "high", label: "High" }]} onChange={(v) => set("quality", v)} />
            <Choice label="Variations when asked" value={String(settings.variations)} options={[{ id: "1", label: "4 (default)" }, { id: "2", label: "2" }, { id: "3", label: "3" }, { id: "4", label: "4" }]} onChange={(v) => set("variations", Number(v))} />
          </div>
          {analysis && <p className="mt-3 text-[10px] leading-relaxed text-zinc-600">These were chosen from your reference. Anything you change stays as you set it.</p>}
        </Fold>

        <Fold title="Prompt preview" open={showPrompt} onToggle={() => setShowPrompt((v) => !v)}>
          {compiled ? (
            <div className="space-y-3">
              <div>
                <span className="mb-1 block text-[10.5px] text-zinc-500">Original prompt</span>
                <p className="rounded-lg border border-white/[0.06] bg-black/30 px-2.5 py-2 text-[11px] leading-relaxed text-zinc-300">{prompt.trim() || "—"}</p>
              </div>
              {analysis && (
                <div>
                  <span className="mb-1 block text-[10.5px] text-zinc-500">Reference analysis</span>
                  <p className="rounded-lg border border-white/[0.06] bg-black/30 px-2.5 py-2 text-[11px] leading-relaxed text-zinc-300">
                    {[analysis.artDirection, analysis.layout.title && `Title: ${analysis.layout.title}`, analysis.layout.hero && `Hero: ${analysis.layout.hero}`, analysis.typography.headline && `Type: ${analysis.typography.headline}`, analysis.effects.length > 0 && `Effects: ${analysis.effects.join(", ")}`, `Density: ${analysis.density.level}, ${analysis.density.emptySpace}% empty`].filter(Boolean).join(" · ")}
                  </p>
                </div>
              )}
              <div>
                <span className="mb-1 flex items-center gap-1.5 text-[10.5px] text-zinc-500"><PenLine size={11} /> Compiled prompt (you can edit it)</span>
                <textarea value={compiled} onChange={(e) => setCompiled(e.target.value)} rows={12} spellCheck={false} className={`${FIELD} resize-y font-mono text-[10.5px] leading-relaxed`} />
              </div>
            </div>
          ) : (
            <p className="text-[11px] leading-relaxed text-zinc-500">Press “Enhance prompt” to see the full prompt AI Studio builds from your words and the reference. You can edit it before generating.</p>
          )}
        </Fold>

        {notes.length > 0 && (
          <ul className="space-y-1 rounded-lg border border-amber-300/20 bg-amber-300/[0.05] px-3 py-2 text-[10.5px] leading-relaxed text-amber-100/90">
            {notes.map((note) => <li key={note}>{note}</li>)}
          </ul>
        )}

        <button type="button" onClick={() => void generate()} disabled={!canGenerate} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f4f1eb] py-3 text-[13px] font-semibold text-black transition hover:bg-white disabled:opacity-35">
          {working ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {working ? "Generating…" : "Generate"}
        </button>
      </div>

      {/* ═══ PREVIEW ════════════════════════════════════════════════════════ */}
      <div ref={preview} className="min-h-[560px] scroll-mt-24 rounded-[22px] border border-white/[0.08] bg-[#070a0b]/90 p-5">

        {error && (
          <div role="alert" className="mb-4 rounded-xl border border-red-400/25 bg-red-500/[0.07] px-4 py-3 text-[12.5px] leading-relaxed text-red-100">{error}</div>
        )}
        {notice && (
          <div className="mb-4 rounded-xl border border-amber-300/25 bg-amber-300/[0.06] px-4 py-3 text-[12px] leading-relaxed text-amber-100">{notice}</div>
        )}

        {/* Progress: each line is a step the server is really doing */}
        {working && (
          <div className="flex min-h-[460px] flex-col items-center justify-center">
            <ul className="w-full max-w-[420px] space-y-2.5">
              {steps.map((step) => (
                <li key={step.id} className={`flex items-center gap-3 text-[12.5px] ${step.state === "working" ? "text-white" : step.state === "done" ? "text-zinc-400" : "text-zinc-600"}`}>
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {step.state === "working" ? <Loader2 size={14} className="animate-spin text-cyan-300" /> : step.state === "done" ? <Check size={14} className="text-emerald-400" /> : <Circle size={7} className="text-zinc-700" />}
                  </span>
                  <span className={step.state === "skipped" ? "line-through" : ""}>{STEP_LABELS[step.id]}{step.state === "skipped" ? "" : step.state === "working" ? "…" : ""}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Nothing made yet */}
        {!working && !outcome && (
          <div className="flex min-h-[460px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-zinc-500"><Layers size={24} /></div>
            <h3 className="mt-4 text-[15px] font-semibold text-white">Your design appears here</h3>
            <p className="mt-2 max-w-[380px] text-[12px] leading-relaxed text-zinc-500">
              Add a reference to set the look, write what the design should say, and generate. You get one finished design; variations are made only when you ask.
            </p>
          </div>
        )}

        {/* The result */}
        {!working && outcome && (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_250px]">
            <div>
              <div data-theme-keep="" className="falcon-studio-result flex items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-black/50 p-3">
                {outcome.artwork
                  ? <img src={outcome.artwork.url} alt={String(outcome.content.title || "Generated design")} className="max-h-[720px] w-auto max-w-full rounded-md" />
                  : <div className="w-full" dangerouslySetInnerHTML={{ __html: outcome.design?.preview || "" }} />}
              </div>

              {outcome.versions.length > 0 && (
                <div className="mt-3">
                  <span className={LABEL}>{outcome.versions[0].label === "Before" ? "Earlier versions" : "Variations of this design"}</span>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {outcome.versions.map((version, index) => (
                      <button key={index} type="button" onClick={() => choose(index)} title={`Show ${version.label.toLowerCase()}`} data-theme-keep="" className="falcon-studio-thumb overflow-hidden rounded-lg border border-white/[0.1] bg-black/40 transition hover:border-cyan-300/60">
                        {version.artwork ? <img src={version.artwork.url} alt={version.label} className="block w-full" /> : <span className="block" dangerouslySetInnerHTML={{ __html: version.design?.preview || "" }} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
                {outcome.artwork && (
                  <button type="button" onClick={() => void download()} disabled={!!busy} className="flex items-center justify-center gap-2 rounded-lg bg-[#f4f1eb] py-2.5 text-[12px] font-semibold text-black transition hover:bg-white disabled:opacity-40">
                    {busy === "download" ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} Download
                  </button>
                )}
                <button type="button" onClick={() => void openInEditor()} disabled={!!busy} className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-[12px] font-semibold transition disabled:opacity-40 ${outcome.artwork ? "border border-white/[0.14] bg-white/[0.04] text-white hover:bg-white/[0.08]" : "bg-[#f4f1eb] text-black hover:bg-white"}`}>
                  {busy === "open" ? <Loader2 size={13} className="animate-spin" /> : <ArrowUpRight size={13} />} Open in editor
                </button>
                <button type="button" onClick={() => void regenerate()} disabled={!!busy} className="flex items-center justify-center gap-2 rounded-lg border border-white/[0.14] bg-white/[0.04] py-2.5 text-[12px] font-medium text-white transition hover:bg-white/[0.08] disabled:opacity-40">
                  {busy === "regenerate" ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Regenerate
                </button>
                <button type="button" onClick={() => void variations()} disabled={!!busy} className="flex items-center justify-center gap-2 rounded-lg border border-white/[0.14] bg-white/[0.04] py-2.5 text-[12px] font-medium text-white transition hover:bg-white/[0.08] disabled:opacity-40">
                  {busy === "variations" ? <Loader2 size={13} className="animate-spin" /> : <Layers size={13} />} Variations
                </button>
                {outcome.artwork && (
                  <>
                    <button type="button" onClick={() => void useAsReference()} disabled={!!busy || references.length >= MAX_REFERENCES} className="flex items-center justify-center gap-2 rounded-lg border border-white/[0.14] bg-white/[0.04] py-2.5 text-[12px] font-medium text-white transition hover:bg-white/[0.08] disabled:opacity-40">
                      <ImagePlus size={13} /> Use as reference
                    </button>
                    <button type="button" onClick={() => setFixing((v) => !v)} disabled={!!busy} aria-expanded={fixing} className="flex items-center justify-center gap-2 rounded-lg border border-white/[0.14] bg-white/[0.04] py-2.5 text-[12px] font-medium text-white transition hover:bg-white/[0.08] disabled:opacity-40">
                      <Wrench size={13} /> Fix design
                    </button>
                  </>
                )}
              </div>

              {fixing && outcome.artwork && (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                  <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-zinc-300">
                    What is wrong?
                    <button type="button" onClick={() => setFixing(false)} aria-label="Close" className="text-zinc-500 hover:text-white"><X size={13} /></button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PROBLEMS.map((problem) => {
                      const on = problems.includes(problem);
                      return (
                        <button key={problem} type="button" aria-pressed={on} onClick={() => setProblems((current) => (on ? current.filter((p) => p !== problem) : [...current, problem]))} className={`rounded-full border px-2.5 py-1 text-[10.5px] transition ${on ? "border-cyan-300/60 bg-cyan-400/15 text-cyan-100" : "border-white/[0.1] text-zinc-400 hover:text-white"}`}>
                          {problem}
                        </button>
                      );
                    })}
                  </div>
                  <button type="button" onClick={() => void regenerate(`Fix only these problems and leave everything else exactly as it is: ${problems.join("; ")}.`)} disabled={!problems.length || !!busy} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400/90 py-2 text-[11.5px] font-semibold text-black transition hover:bg-cyan-300 disabled:opacity-40">
                    {busy === "fix" ? <Loader2 size={12} className="animate-spin" /> : <Wrench size={12} />} Fix only this
                  </button>
                </div>
              )}

              {outcome.fidelity && (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">Reference fidelity</span>
                    <span className={`text-[20px] font-semibold ${outcome.fidelity.score >= 75 ? "text-emerald-300" : outcome.fidelity.score >= FIDELITY_FLOOR ? "text-amber-200" : "text-red-300"}`}>{outcome.fidelity.score}<span className="text-[11px] text-zinc-500"> / 100</span></span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {outcome.fidelity.checks.map((check) => (
                      <li key={check.label} className="flex items-center gap-2 text-[11px] text-zinc-300">
                        {check.passed ? <Check size={12} className="shrink-0 text-emerald-400" /> : <X size={12} className="shrink-0 text-red-400" />}
                        <span>{check.label}<span className="sr-only">{check.passed ? ": passed" : ": not passed"}</span></span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {outcome.kind === "layout" && (
                <p className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-[10.5px] leading-relaxed text-zinc-500">
                  This is an editable design: every piece of text, colour and picture can be changed in the editor. Download, Fix design and the fidelity check need a finished artwork, which this server cannot make yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
