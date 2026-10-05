import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Brain,
  Check,
  Command,
  Crosshair,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";

import { DesignProject, PAGE_PRESETS } from "@/types";
import { projectService } from "@/services/projectService";
import { isAuthenticated } from "@/services/authService";
import { generateId } from "@/utils/id";
import type {
  CanvasElement,
  ShapeElement,
  TextElement,
} from "@/types/element";

const PROMPTS = [
  "Futuristic fintech hackathon poster",
  "Minimal luxury fashion campaign",
  "Modern cafe Instagram post",
  "Tech startup launch announcement",
];

export default function AIStudioPage() {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState(false);
  const [activePrompt, setActivePrompt] = useState("");
  const [creating, setCreating] = useState(false);

  /* =========================================================
     GENERATE
  ========================================================== */

  const handleGenerate = () => {
    const value = prompt.trim();

    if (!value) return;

    setActivePrompt(value);
    setGenerated(true);
  };

  /* =========================================================
     PROMPT CHIP
  ========================================================== */

  const handlePromptClick = (value: string) => {
    setPrompt(value);
    setActivePrompt("");
    setGenerated(false);
  };

  /* =========================================================
     HOME
  ========================================================== */

  const goHome = () => {
    router.push("/");
  };

  /* =========================================================
     CREATE EDITABLE DESIGN
  ========================================================== */

  const createDesign = async () => {
    const value = activePrompt.trim();

    if (!value || creating) return;

    if (!isAuthenticated()) {
      alert("Please log in first to generate and save designs in Falcon.");
      router.push(`/login?redirect=${encodeURIComponent("/ai-studio")}`);
      return;
    }

    try {
      setCreating(true);

      const project = await projectService.create(
        getDesignTitle(value),
        "local-user"
      );

      const preset = PAGE_PRESETS[0];

      const page = {
        id: project.pages[0]?.id || generateId("page"),
        name: "AI Generated Design",
        size: preset,
        background: "#050708",
        elements: createElementsFromPrompt(value, preset),
      };

      const updatedProject: DesignProject = {
        ...project,
        title: getDesignTitle(value),
        pages: [page],
      };

      await projectService.save(updatedProject);

      router.push(
        `/editor/${project.id}?from=ai-studio`
      );
    } catch (error) {
      console.error(
        "Failed to create AI design:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Falcon could not create the design. Please try again.";

      alert(message);

      setCreating(false);
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
              Describe an idea in natural language and let Falcon understand
              the intent, visual style, audience, and design direction.
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
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    setGenerated(false);
                  }}
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

                <div className="flex flex-col gap-5 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">

                  <span className="font-mono text-[9px] leading-5 tracking-[0.06em] text-zinc-700">
                    Example: Create a futuristic fintech hackathon poster
                  </span>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={!prompt.trim()}
                    className="group flex h-12 shrink-0 items-center justify-center gap-3 rounded-xl bg-white/[0.86] px-7 text-[11px] font-medium text-black transition-all duration-300 hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Generate

                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>

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

          {generated && activePrompt && (
            <div className="mx-auto mt-10 max-w-[880px] animate-[fadeIn_.45s_ease-out]">

              <div className="border border-cyan-300/[0.16] bg-cyan-300/[0.012] p-6 md:p-7">

                <div className="flex items-start gap-5">

                  {/* Check */}

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/[0.04]">

                    <Check
                      size={18}
                      className="text-cyan-300"
                    />

                  </div>

                  {/* Content */}

                  <div className="min-w-0">

                    <div className="font-mono text-[9px] tracking-[0.22em] text-cyan-300/70">
                      DIRECTION READY
                    </div>

                    <p className="mt-3 text-[14px] leading-6 text-zinc-400">
                      Falcon understood your intent and prepared an editable
                      visual direction for:
                    </p>

                    <p className="mt-3 text-[16px] font-medium text-white">
                      “{activePrompt}”
                    </p>

                  </div>

                  {/* Open Studio */}

                  <button
                    type="button"
                    onClick={createDesign}
                    disabled={creating}
                    className="ml-auto hidden shrink-0 items-center gap-2 text-[11px] text-zinc-400 transition-colors hover:text-white disabled:opacity-50 sm:flex"
                  >
                    {creating
                      ? "Creating..."
                      : "Open Studio"}

                    <ArrowUpRight size={14} />
                  </button>

                </div>

                {/* Mobile */}

                <button
                  type="button"
                  onClick={createDesign}
                  disabled={creating}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.025] py-3.5 text-[11px] text-zinc-400 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50 sm:hidden"
                >
                  {creating
                    ? "Creating your design..."
                    : "Open Studio"}

                  <ArrowUpRight size={13} />
                </button>

              </div>

            </div>
          )}

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
              description="Turn the direction into an editable Falcon design."
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
        `}</style>

      </main>
    </>
  );
}

/* =========================================================
   CREATE ELEMENTS
========================================================= */

function createElementsFromPrompt(
  prompt: string,
  preset: (typeof PAGE_PRESETS)[number]
): CanvasElement[] {
  const lower = prompt.toLowerCase();

  const width = preset.width;
  const height = preset.height;

  const elements: CanvasElement[] = [];

  let accent = "#22D3EE";
  let background = "#071116";

  if (
    lower.includes("fashion") ||
    lower.includes("luxury")
  ) {
    accent = "#D6C6A8";
    background = "#11100E";
  }

  if (
    lower.includes("cafe") ||
    lower.includes("coffee")
  ) {
    accent = "#C59A6C";
    background = "#17110D";
  }

  if (
    lower.includes("festival") ||
    lower.includes("culture")
  ) {
    accent = "#A78BFA";
    background = "#100D18";
  }

  /* Background */

  elements.push({
    id: generateId("el"),
    type: "rectangle",
    zIndex: 0,
    x: 0,
    y: 0,
    width,
    height,
    rotation: 0,
    opacity: 1,
    locked: false,
    hidden: false,
    fill: background,
    stroke: "transparent",
    strokeWidth: 0,
    cornerRadius: 0,
  });

  /* Accent line */

  elements.push({
    id: generateId("el"),
    type: "rectangle",
    zIndex: 1,
    x: width * 0.08,
    y: height * 0.08,
    width: width * 0.84,
    height: 4,
    rotation: 0,
    opacity: 0.9,
    locked: false,
    hidden: false,
    fill: accent,
    stroke: "transparent",
    strokeWidth: 0,
    cornerRadius: 2,
  });

  /* Falcon label */

  elements.push(
    createTextElement(
      "FALCON / INTELLIGENT DESIGN",
      width * 0.08,
      height * 0.12,
      width * 0.84,
      32,
      15,
      accent,
      600,
      "left",
      2
    )
  );

  /* Main title */

  elements.push(
    createTextElement(
      getGeneratedTitle(prompt),
      width * 0.08,
      height * 0.27,
      width * 0.84,
      height * 0.25,
      Math.min(width * 0.095, 92),
      "#F4F1EB",
      700,
      "left",
      3
    )
  );

  /* Description */

  elements.push(
    createTextElement(
      getGeneratedDescription(prompt),
      width * 0.08,
      height * 0.54,
      width * 0.68,
      height * 0.13,
      Math.min(width * 0.028, 28),
      "#9CA3AF",
      400,
      "left",
      4
    )
  );

  /* Visual block */

  elements.push({
    id: generateId("el"),
    type: "rectangle",
    zIndex: 1,
    x: width * 0.08,
    y: height * 0.70,
    width: width * 0.84,
    height: height * 0.15,
    rotation: 0,
    opacity: 0.16,
    locked: false,
    hidden: false,
    fill: accent,
    stroke: accent,
    strokeWidth: 1,
    cornerRadius: 18,
  });

  /* Footer */

  elements.push(
    createTextElement(
      getFooterText(prompt),
      width * 0.08,
      height * 0.90,
      width * 0.84,
      35,
      Math.min(width * 0.018, 18),
      "#CBD5E1",
      500,
      "left",
      5
    )
  );

  /* Accent dot */

  elements.push({
    id: generateId("el"),
    type: "ellipse",
    zIndex: 5,
    x: width * 0.86,
    y: height * 0.12,
    width: 20,
    height: 20,
    rotation: 0,
    opacity: 1,
    locked: false,
    hidden: false,
    fill: accent,
    stroke: "transparent",
    strokeWidth: 0,
  });

  return elements;
}

/* =========================================================
   TEXT FACTORY
========================================================= */

function createTextElement(
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fontSize: number,
  color: string,
  fontWeight: number,
  align: "left" | "center" | "right",
  zIndex: number
): TextElement {
  return {
    id: generateId("el"),
    type: "text",
    zIndex,
    x,
    y,
    width,
    height,
    rotation: 0,
    opacity: 1,
    locked: false,
    hidden: false,
    text,
    fontFamily: "Inter",
    fontSize,
    fontWeight,
    color,
    align,
    lineHeight: 1.08,
  };
}

/* =========================================================
   GENERATED TITLE
========================================================= */

function getGeneratedTitle(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (
    lower.includes("hackathon") &&
    lower.includes("fintech")
  ) {
    return "FINTECH\nINNOVATE";
  }

  if (lower.includes("hackathon")) {
    return "BUILD\nTHE FUTURE.";
  }

  if (
    lower.includes("fashion") ||
    lower.includes("luxury")
  ) {
    return "FORM\nMEETS\nDESIRE.";
  }

  if (
    lower.includes("cafe") ||
    lower.includes("coffee")
  ) {
    return "SLOW\nMORNINGS.";
  }

  if (lower.includes("startup")) {
    return "BUILD\nWHAT'S NEXT.";
  }

  if (lower.includes("festival")) {
    return "NIGHT\nIN MOTION.";
  }

  const words = prompt
    .replace(/[^\w\s-]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);

  if (!words.length) {
    return "IDEAS\nIN MOTION.";
  }

  return words
    .map((word) => word.toUpperCase())
    .join("\n");
}

/* =========================================================
   DESCRIPTION
========================================================= */

function getGeneratedDescription(
  prompt: string
): string {
  const lower = prompt.toLowerCase();

  if (lower.includes("hackathon")) {
    return "A bold visual direction built for innovation, technology and creative problem solving.";
  }

  if (
    lower.includes("fashion") ||
    lower.includes("luxury")
  ) {
    return "A refined visual system balancing elegance, contrast and modern editorial energy.";
  }

  if (
    lower.includes("cafe") ||
    lower.includes("coffee")
  ) {
    return "A warm and contemporary visual identity designed to create an inviting atmosphere.";
  }

  if (lower.includes("startup")) {
    return "A sharp technology-led composition designed to communicate momentum, ambition and clarity.";
  }

  return "A visual direction generated by Falcon from your creative intent, audience and context.";
}

/* =========================================================
   FOOTER
========================================================= */

function getFooterText(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes("hackathon")) {
    return "INNOVATE  •  BUILD  •  CREATE     |     FALCON AI";
  }

  if (lower.includes("fashion")) {
    return "COLLECTION / 2026     |     FALCON CREATIVE";
  }

  if (lower.includes("cafe")) {
    return "COFFEE / COMMUNITY / CULTURE     |     2026";
  }

  if (lower.includes("startup")) {
    return "LAUNCH / INNOVATE / SCALE     |     2026";
  }

  return "PURPOSE  →  DESIGN  →  INTELLIGENCE";
}

/* =========================================================
   PROJECT TITLE
========================================================= */

function getDesignTitle(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (
    lower.includes("fintech") &&
    lower.includes("hackathon")
  ) {
    return "FinTech Innovate";
  }

  if (lower.includes("hackathon")) {
    return "AI Generated Hackathon Poster";
  }

  if (
    lower.includes("fashion") ||
    lower.includes("luxury")
  ) {
    return "Luxury Fashion Campaign";
  }

  if (
    lower.includes("cafe") ||
    lower.includes("coffee")
  ) {
    return "Modern Cafe Campaign";
  }

  if (lower.includes("startup")) {
    return "Tech Startup Launch";
  }

  return "AI Generated Design";
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