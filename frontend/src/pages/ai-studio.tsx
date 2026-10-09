import Head from "next/head";
import { useRouter } from "next/router";

import { ArrowLeft, ArrowRight, Brain, Crosshair, Sparkles, Wand2 } from "lucide-react";

import StudioWorkspace from "@/components/AiStudio/StudioWorkspace";

export default function AIStudioPage() {
  const router = useRouter();

  /* =========================================================
     HOME
  ========================================================== */

  const goHome = () => {
    router.push("/");
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
              WORKSPACE: reference, prompt and controls beside the preview
          ======================================================== */}

          <StudioWorkspace />

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

          :global(.falcon-studio-result svg) {
            display: block;
            width: auto;
            max-width: 100%;
            height: auto;
            max-height: 720px;
            margin: 0 auto;
            border-radius: 6px;
          }

          :global(.falcon-studio-thumb svg) {
            display: block;
            width: 100%;
            height: auto;
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