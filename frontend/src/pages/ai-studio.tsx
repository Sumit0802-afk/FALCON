import Head from "next/head";
import { useRouter } from "next/router";
import { useRef, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Brain,
  Command,
  Crosshair,
  ImagePlus,
  Layers,
  Loader2,
  RefreshCw,
  Sparkles,
  Wand2,
} from "lucide-react";

import { ApiError } from "@/services/api";
import { isAuthenticated } from "@/services/authService";
import { AI_SIZES, AiDesign, generateAiDesigns, openAiDesign, resizeAiDesigns, varyAiDesign } from "@/services/aiService";

const PROMPTS = [
  "Futuristic fintech hackathon poster",
  "Minimal luxury fashion campaign",
  "Modern cafe Instagram post",
  "Tech startup launch announcement",
];

/** Says what went wrong in words the person can act on */
function failureMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return "Please sign in to use AI Studio.";
    if (err.status === 429) return "You've asked for a lot of designs in a short time. Please wait a few minutes and try again.";
    if (err.message) return err.message.replace(/^[a-z.0-9]+: /i, "");
  }
  return "Falcon couldn't reach AI Studio. Check your connection and try again.";
}

export default function AIStudioPage() {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState(AI_SIZES[0].id);
  const [withImage, setWithImage] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [designs, setDesigns] = useState<AiDesign[]>([]);
  /** What the shown designs were made for, kept so "more options" asks for the same thing */
  const [made, setMade] = useState<{ prompt: string; size: string; image: boolean } | null>(null);
  const [notice, setNotice] = useState("");
  const [opening, setOpening] = useState<number | null>(null);
  /** The four directions, kept while variations of one of them are on screen so the person can go back */
  const [directions, setDirections] = useState<AiDesign[] | null>(null);
  /** Which card variations are being made for, or "size" while the designs are set out for another format */
  const [busy, setBusy] = useState<number | "size" | null>(null);

  const results = useRef<HTMLDivElement>(null);
  const generated = designs.length > 0;

  /* =========================================================
     GENERATE
  ========================================================== */

  const runGenerate = async (request: { prompt: string; size: string; image: boolean }) => {
    if (loading) return;

    if (!isAuthenticated()) {
      router.push(`/login?redirect=${encodeURIComponent("/ai-studio")}`);
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");
    setTimeout(() => results.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 60);

    try {
      const result = await generateAiDesigns(request);
      setDesigns(result.designs);
      setDirections(null);
      setMade(request);
      // Said plainly when a picture was asked for and could not be made
      if (request.image && !result.imageMade) setNotice("The picture could not be made this time, so these use stock photographs instead.");
    } catch (err) {
      setError(failureMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    const value = prompt.trim();
    if (value.length < 3) return;
    void runGenerate({ prompt: value, size, image: withImage });
  };

  /* =========================================================
     ANOTHER FORMAT
  ========================================================== */

  /** Picking a format while designs are on screen sets those same designs out again for it */
  const chooseSize = async (next: string) => {
    if (next === size || busy !== null || loading) return;
    setSize(next);
    if (!designs.length || !made) return;

    try {
      setBusy("size");
      setError("");
      const result = await resizeAiDesigns(designs.map((design) => design.spec), next);
      setDesigns(result.designs);
      setMade({ ...made, size: next });
      // The directions behind a set of variations are set out afresh when the person goes back to them
      if (directions) {
        const back = await resizeAiDesigns(directions.map((design) => design.spec), next);
        setDirections(back.designs);
      }
    } catch (err) {
      setError(failureMessage(err));
      setSize(made.size);
    } finally {
      setBusy(null);
    }
  };

  /* =========================================================
     VARIATIONS OF ONE DESIGN
  ========================================================== */

  const makeVariations = async (index: number) => {
    const design = designs[index];
    if (!design || !made || busy !== null || opening !== null) return;

    try {
      setBusy(index);
      setError("");
      const result = await varyAiDesign(design.spec, made.size);
      if (!directions) setDirections(designs);
      setDesigns(result.designs);
    } catch (err) {
      setError(failureMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const backToDirections = () => {
    if (!directions) return;
    setDesigns(directions);
    setDirections(null);
  };

  /* =========================================================
     PROMPT CHIP
  ========================================================== */

  const handlePromptClick = (value: string) => {
    setPrompt(value);
  };

  /* =========================================================
     HOME
  ========================================================== */

  const goHome = () => {
    router.push("/");
  };

  /* =========================================================
     OPEN A DESIGN IN THE EDITOR
  ========================================================== */

  const openDesign = async (index: number) => {
    const design = designs[index];
    if (!design || !made || opening !== null || busy !== null) return;

    try {
      setOpening(index);
      setError("");
      const { projectId } = await openAiDesign(design.spec, made.size);
      router.push(`/editor/${projectId}?from=ai-studio`);
    } catch (err) {
      setError(failureMessage(err));
      setOpening(null);
    }
  };

  return (
    <>
      <Head>
        <title>AI Studio — Falcon</title>

        <meta
          name="description"
          content="Falcon AI Studio — turn your intent into an editable visual design."
        />

        <meta
          name="theme-color"
          content="#050708"
        />
      </Head>

      <main className="relative min-h-screen overflow-hidden bg-[#050708] text-[#f4f1eb]">

        {/* =========================================================
            BACKGROUND
        ========================================================== */}

        <div className="pointer-events-none absolute inset-0">

          {/* Main atmosphere */}
          <div className="absolute left-1/2 top-[30%] h-[800px] w-[1200px] -translate-x-1/2 rounded-full bg-cyan-500/[0.025] blur-[200px]" />

          {/* Right atmosphere */}
          <div className="absolute right-[-12%] top-[18%] h-[650px] w-[650px] rounded-full bg-blue-500/[0.018] blur-[200px]" />

          {/* Bottom atmosphere */}
          <div className="absolute bottom-[-20%] left-[8%] h-[550px] w-[800px] rounded-full bg-cyan-500/[0.012] blur-[200px]" />


          {/* Center light */}
          <div className="absolute left-1/2 top-[46%] h-[550px] w-[1000px] -translate-x-1/2 rounded-full bg-cyan-400/[0.012] blur-[180px]" />

          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_18%,rgba(0,0,0,0.18)_55%,rgba(0,0,0,0.82)_100%)]" />

          {/* Top / bottom fade */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.48),transparent_18%,transparent_78%,rgba(0,0,0,0.62))]" />

        </div>

        {/* =========================================================
            NAVBAR
        ========================================================== */}

        <header className="relative z-50 border-b border-white/[0.07] bg-black/65 backdrop-blur-2xl">

          <div className="mx-auto flex h-[76px] max-w-[1600px] items-center px-6 lg:px-10">

            {/* Logo */}

            <button
              type="button"
              onClick={goHome}
              className="group flex items-center gap-2.5 cursor-pointer"
            >
              <img
                src="/falcon-logo-white.png"
                alt="Falcon Logo"
                className="h-8 w-8 object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]"
              />
              <span className="text-[13px] font-semibold tracking-[0.25em] text-white">
                FALCON
              </span>
            </button>

            {/* Navigation */}

            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-11 md:flex">

              <button
                type="button"
                onClick={goHome}
                className="text-[12px] text-zinc-600 transition-colors hover:text-white"
              >
                Home
              </button>

              <span className="relative text-[12px] font-medium text-cyan-300">

                AI Studio

                <span className="absolute -bottom-[27px] left-1/2 h-px w-10 -translate-x-1/2 bg-cyan-400" />

              </span>

              <button
                type="button"
                onClick={() => router.push("/templates")}
                className="text-[12px] text-zinc-600 transition-colors hover:text-white"
              >
                Templates
              </button>

            </nav>

            {/* Back */}

            <button
              type="button"
              onClick={goHome}
              className="ml-auto flex items-center gap-2 text-[12px] text-zinc-500 transition-colors hover:text-white"
            >
              <ArrowLeft size={13} />
              Back
            </button>

          </div>

        </header>

        {/* =========================================================
            MAIN
        ========================================================== */}

        <section className="relative z-10 mx-auto min-h-[calc(100vh-76px)] max-w-[1600px] px-6 py-20 lg:px-12 lg:py-24">

          {/* LEFT SIDE LABEL */}

          <div className="pointer-events-none absolute left-10 top-[20%] hidden xl:block">

            <div className="font-mono text-[9px] tracking-[0.3em] text-zinc-600">
              FALCON
            </div>

            <div className="mt-4 h-20 w-px bg-gradient-to-b from-cyan-400/50 to-transparent" />

            <div className="mt-4 [writing-mode:vertical-rl] font-mono text-[8px] tracking-[0.35em] text-zinc-800">
              INTENT / DIRECTION / FORM
            </div>

          </div>

          {/* RIGHT SIDE LABEL */}

          <div className="pointer-events-none absolute right-10 top-[20%] hidden text-right xl:block">

            <div className="font-mono text-[9px] tracking-[0.3em] text-zinc-600">
              AI / 001
            </div>

            <div className="mt-4 ml-auto h-20 w-px bg-gradient-to-b from-cyan-400/40 to-transparent" />

            <div className="mt-4 [writing-mode:vertical-rl] font-mono text-[8px] tracking-[0.35em] text-zinc-800">
              CREATIVE INTELLIGENCE
            </div>

          </div>

          {/* =======================================================
              HERO
          ======================================================== */}

          <div className="mx-auto max-w-[1050px] text-center">

            {/* Badge */}

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/[0.18] bg-cyan-400/[0.025] px-5 py-2.5 backdrop-blur-xl">

              <Sparkles
                size={12}
                className="text-cyan-300"
              />

              <span className="font-mono text-[9px] font-medium tracking-[0.24em] text-cyan-200/75">
                FALCON INTELLIGENCE
              </span>

            </div>

            {/* Heading */}

            <h1 className="mx-auto mt-9 max-w-[1000px] font-serif text-[clamp(4.2rem,7vw,7.8rem)] leading-[0.84] tracking-[-0.055em]">

              Tell Falcon
              <br />

              what you want.

              <span className="block text-zinc-500">

                It designs the{" "}

                <span className="italic text-cyan-200/80">
                  direction.
                </span>

              </span>

            </h1>

            {/* Description */}

            <p className="mx-auto mt-9 max-w-[680px] text-[15px] leading-7 text-zinc-500 md:text-[16px]">
              Describe what you need in your own words. Falcon writes the copy,
              chooses the style and colours, and gives you finished designs to edit.
            </p>

          </div>

          {/* =======================================================
              PROMPT
          ======================================================== */}

          <div className="mx-auto mt-14 max-w-[880px]">

            <div
              className={`relative rounded-[26px] border p-[9px] transition-all duration-500 ${
                generated
                  ? "border-cyan-300/25 bg-cyan-400/[0.018] shadow-[0_0_100px_rgba(34,211,238,0.045)]"
                  : "border-white/[0.13] bg-white/[0.015]"
              }`}
            >

              <div className="rounded-[19px] border border-white/[0.07] bg-[#070a0b]/95 p-6 shadow-2xl md:p-8">

                {/* Prompt heading */}

                <div className="flex items-center gap-2.5">

                  <Command
                    size={13}
                    className="text-zinc-500"
                  />

                  <span className="font-mono text-[9px] tracking-[0.22em] text-zinc-600">
                    DESIGN INTENT
                  </span>

                </div>

                {/* Textarea */}

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      (e.ctrlKey || e.metaKey) &&
                      e.key === "Enter"
                    ) {
                      handleGenerate();
                    }
                  }}
                  placeholder="Describe the design you want..."
                  className="mt-6 min-h-[170px] w-full resize-none bg-transparent text-[17px] leading-8 text-zinc-200 outline-none placeholder:text-zinc-700 md:text-[18px]"
                />

                {/* Bottom */}

                <div className="flex flex-col gap-5 border-t border-white/[0.07] pt-5">

                  {/* Format */}

                  <div className="flex flex-wrap items-center gap-2">

                    <span className="mr-1 font-mono text-[9px] tracking-[0.22em] text-zinc-600">
                      FORMAT
                    </span>

                    {AI_SIZES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => void chooseSize(item.id)}
                        aria-pressed={size === item.id}
                        className={`rounded-full border px-3.5 py-1.5 text-[10px] transition-all duration-300 ${
                          size === item.id
                            ? "border-cyan-300/40 bg-cyan-300/[0.07] text-cyan-100"
                            : "border-white/[0.09] bg-white/[0.015] text-zinc-500 hover:border-white/20 hover:text-zinc-300"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}

                  </div>

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    {/* Picture */}

                    <button
                      type="button"
                      onClick={() => setWithImage((value) => !value)}
                      aria-pressed={withImage}
                      title="Falcon makes a new picture for your design. This takes a little longer."
                      className={`flex items-center gap-2.5 text-left text-[10px] leading-4 transition-colors ${
                        withImage ? "text-cyan-200" : "text-zinc-600 hover:text-zinc-400"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                          withImage ? "border-cyan-300/40 bg-cyan-300/[0.08]" : "border-white/[0.1]"
                        }`}
                      >
                        <ImagePlus size={13} />
                      </span>
                      {withImage ? "A new picture will be made for this design" : "Make a new picture for this design"}
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={prompt.trim().length < 3 || loading}
                      className="group flex h-12 shrink-0 items-center justify-center gap-3 rounded-xl bg-white/[0.86] px-7 text-[11px] font-medium text-black transition-all duration-300 hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      {loading ? "Designing…" : "Generate"}

                      {loading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <ArrowRight
                          size={14}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      )}
                    </button>

                  </div>

                </div>

              </div>

            </div>

            {/* =====================================================
                CHIPS
            ====================================================== */}

            <div className="mt-5 flex flex-wrap justify-center gap-2.5">

              {PROMPTS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    handlePromptClick(item)
                  }
                  className="rounded-full border border-white/[0.09] bg-white/[0.015] px-5 py-2.5 text-[10px] text-zinc-600 transition-all duration-300 hover:border-cyan-300/25 hover:bg-cyan-300/[0.025] hover:text-zinc-300"
                >
                  {item}
                </button>
              ))}

            </div>

          </div>

          {/* =======================================================
              GENERATED RESULT
          ======================================================== */}

          <div ref={results} className="mx-auto mt-10 max-w-[1150px] scroll-mt-24">

            {/* Something went wrong */}

            {error && (
              <div role="alert" className="mx-auto max-w-[880px] animate-[fadeIn_.45s_ease-out] rounded-2xl border border-red-400/20 bg-red-400/[0.04] px-6 py-5 text-[13px] leading-6 text-red-200/90">
                {error}
              </div>
            )}

            {/* Working */}

            {loading && (
              <div className="animate-[fadeIn_.45s_ease-out]">

                <div className="flex items-center justify-center gap-3">
                  <Loader2 size={13} className="animate-spin text-cyan-300" />
                  <span className="font-mono text-[9px] tracking-[0.22em] text-cyan-300/70">
                    {withImage ? "DESIGNING AND MAKING A PICTURE" : "DESIGNING AND CHOOSING PICTURES"}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {[0, 1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="aspect-[4/5] animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.02]"
                      style={{ animationDelay: `${item * 120}ms` }}
                    />
                  ))}
                </div>

              </div>
            )}

            {/* Design options */}

            {!loading && generated && made && (
              <div className="animate-[fadeIn_.45s_ease-out]">

                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">

                  <div className="min-w-0">

                    <div className="font-mono text-[9px] tracking-[0.22em] text-cyan-300/70">
                      {busy === "size"
                        ? "SETTING OUT FOR THE NEW FORMAT"
                        : directions
                          ? `${designs.length} VARIATIONS`
                          : `${designs.length} DIRECTIONS READY`}
                    </div>

                    <p className="mt-2 truncate text-[15px] font-medium text-white">
                      “{made.prompt}”
                    </p>

                    <p className="mt-1 text-[12px] text-zinc-500">
                      Open one in the editor, where everything in it can be changed. Pick another format above to see these set out for it.
                    </p>

                  </div>

                  <div className="flex shrink-0 items-center gap-2">

                    {directions && (
                      <button
                        type="button"
                        onClick={backToDirections}
                        className="flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.025] px-4 py-2.5 text-[11px] text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
                      >
                        <ArrowLeft size={12} />
                        Back to directions
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => void runGenerate(made)}
                      className="flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.025] px-4 py-2.5 text-[11px] text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      <RefreshCw size={12} />
                      New directions
                    </button>

                  </div>

                </div>

                {notice && (
                  <p className="mt-4 text-[12px] text-amber-200/70">{notice}</p>
                )}

                <div className={`mt-6 grid grid-cols-2 gap-4 transition-opacity duration-300 lg:grid-cols-4 ${busy === "size" ? "opacity-40" : ""}`}>

                  {designs.map((design, index) => (
                    <div
                      key={`${design.name}-${index}`}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.10] bg-white/[0.012] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30"
                    >

                      {/* The preview is drawn by Falcon's own server from the design's elements */}
                      <button
                        type="button"
                        onClick={() => void openDesign(index)}
                        disabled={opening !== null || busy !== null}
                        aria-label={`Open ${design.name} in the editor`}
                        data-theme-keep=""
                        className="falcon-ai-preview flex w-full flex-1 items-center justify-center bg-black/40 p-3 disabled:cursor-wait"
                        dangerouslySetInnerHTML={{ __html: design.preview }}
                      />

                      <div className="border-t border-white/[0.07] px-4 py-3">

                        {!directions && design.direction && (
                          <div className="font-mono text-[8px] uppercase tracking-[0.22em] text-cyan-300/60">
                            {design.direction}
                          </div>
                        )}

                        <div className="mt-0.5 truncate text-[12px] font-medium text-zinc-200">
                          {design.name}
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2">

                          <button
                            type="button"
                            onClick={() => void makeVariations(index)}
                            disabled={opening !== null || busy !== null}
                            title="Keep these words and pictures, and see them in other looks"
                            className="flex items-center gap-1.5 text-[10px] text-zinc-500 transition-colors hover:text-cyan-200 disabled:opacity-40"
                          >
                            {busy === index ? <Loader2 size={11} className="animate-spin" /> : <Layers size={11} />}
                            {busy === index ? "Making…" : "Variations"}
                          </button>

                          <button
                            type="button"
                            onClick={() => void openDesign(index)}
                            disabled={opening !== null || busy !== null}
                            className="flex items-center gap-1.5 text-[10px] text-zinc-400 transition-colors hover:text-cyan-200 disabled:opacity-40"
                          >
                            {opening === index ? "Opening…" : "Edit"}
                            {opening === index ? <Loader2 size={11} className="animate-spin" /> : <ArrowUpRight size={12} />}
                          </button>

                        </div>

                      </div>

                    </div>
                  ))}

                </div>

              </div>
            )}

          </div>

          {/* =======================================================
              THREE INTELLIGENCE CARDS
          ======================================================== */}

          <div className="mx-auto mt-14 grid max-w-[880px] grid-cols-1 gap-4 md:grid-cols-3">

            <IntelligenceCard
              icon={<Brain size={19} />}
              number="01"
              title="Understand"
              description="Falcon interprets your intent instead of only reading keywords."
            />

            <IntelligenceCard
              icon={<Crosshair size={19} />}
              number="02"
              title="Direct"
              description="It creates a visual direction based on audience and context."
            />

            <IntelligenceCard
              icon={<Wand2 size={19} />}
              number="03"
              title="Create"
              description="Each direction opens in the editor as a real, editable design."
            />

          </div>

          {/* =======================================================
              FOOT SYSTEM
          ======================================================== */}

          <div className="mx-auto mt-20 flex max-w-[1150px] items-center justify-between border-t border-white/[0.06] pt-6">

            <div className="hidden items-center gap-3 sm:flex">

              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/70 shadow-[0_0_12px_rgba(34,211,238,0.45)]" />

              <span className="font-mono text-[8px] tracking-[0.22em] text-zinc-700">
                INTELLIGENCE ENGINE ACTIVE
              </span>

            </div>

            <div className="hidden items-center gap-4 md:flex">

              <span className="font-mono text-[8px] tracking-[0.2em] text-zinc-800">
                PURPOSE
              </span>

              <ArrowRight
                size={10}
                className="text-zinc-800"
              />

              <span className="font-mono text-[8px] tracking-[0.2em] text-zinc-800">
                DIRECTION
              </span>

              <ArrowRight
                size={10}
                className="text-zinc-800"
              />

              <span className="font-mono text-[8px] tracking-[0.2em] text-zinc-800">
                DESIGN
              </span>

            </div>

            <span className="ml-auto font-mono text-[8px] tracking-[0.2em] text-zinc-800">
              FALCON / AI STUDIO / 001
            </span>

          </div>

        </section>

        {/* =========================================================
            FLOATING MARK
        ========================================================== */}

        <div className="fixed bottom-5 left-5 z-[90] flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] bg-black/75 font-serif text-[15px] text-zinc-500 backdrop-blur-xl">
          N
        </div>

        {/* =========================================================
            ANIMATION
        ========================================================== */}

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          :global(.falcon-ai-preview svg) {
            display: block;
            width: 100%;
            height: auto;
            max-height: 420px;
            border-radius: 6px;
          }
        `}</style>

      </main>
    </>
  );
}

/* =========================================================
   INTELLIGENCE CARD
========================================================= */

function IntelligenceCard({
  icon,
  number,
  title,
  description,
}: {
  icon: React.ReactNode;
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative min-h-[175px] overflow-hidden rounded-2xl border border-white/[0.10] bg-white/[0.012] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/[0.18] hover:bg-cyan-300/[0.015]">

      {/* Glow */}

      <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-cyan-400/[0.025] blur-2xl transition-all duration-300 group-hover:bg-cyan-400/[0.07]" />

      <div className="relative flex items-start justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/[0.15] bg-cyan-300/[0.025] text-cyan-300/75 transition-colors group-hover:text-cyan-200">
          {icon}
        </div>

        <span className="font-mono text-[8px] tracking-[0.16em] text-zinc-800">
          {number}
        </span>

      </div>

      <div className="relative mt-7">

        <h3 className="font-serif text-[23px] tracking-[-0.02em] text-white">
          {title}
        </h3>

        <p className="mt-3 text-[11px] leading-5 text-zinc-600">
          {description}
        </p>

      </div>

    </div>
  );
}