import Head from "next/head";
import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/router";
import { isAuthenticated, getToken } from "@/services/authService";

import {
  ArrowRight,
  ArrowUpRight,
  Brain,
  CheckCircle2,
  Cpu,
  Crosshair,
  Eye,
  Layers3,
  Menu,
  Palette,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Wand2,
  X,
  Zap,
} from "lucide-react";

import {
  FALCON_TEMPLATES,
  FalconTemplate,
} from "@/data/templates";

import { projectService } from "@/services/projectService";
import { generateId } from "@/utils/id";
import { LayoutSelectorModal } from "@/components/Editor/LayoutSelectorModal";
import FinalCtaSection from "@/components/FinalCtaSection";
import { PageSize } from "@/types";

export default function Home() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  /* =========================================================
     OPEN TEMPLATES
     ========================================================= */

  const openTemplatesPage = () => {
    setMenuOpen(false);

    if (typeof window !== "undefined") {
      window.location.assign("/templates");
    }
  };

  /* =========================================================
     OPEN AI STUDIO
     ========================================================= */

  const openAIStudio = () => {
    setMenuOpen(false);
    router.push("/ai-studio");
  };

  /* =========================================================
     LAYOUT SELECTION BEFORE STARTING POSTER
     ========================================================= */

  const [layoutModalOpen, setLayoutModalOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<FalconTemplate | null>(null);

  const createDesign = () => {
    setPendingTemplate(null);
    setLayoutModalOpen(true);
  };

  const createFromTemplate = (template: FalconTemplate) => {
    setPendingTemplate(template);
    setLayoutModalOpen(true);
  };

  const handleLayoutConfirm = async (size: PageSize) => {
    setLayoutModalOpen(false);
    const templateToUse = pendingTemplate;
    setPendingTemplate(null);

    try {
      // ownerId falls back to guest; the backend will validate the session via cookie
      const ownerId = "guest-user";

      if (templateToUse) {
        const project = await projectService.create(
          templateToUse.name,
          ownerId,
          size
        );

        const scaleX = size.width / templateToUse.width;
        const scaleY = size.height / templateToUse.height;

        const page = {
          ...templateToUse.page,
          id: project.pages[0]?.id ?? templateToUse.page.id,
          size,
          elements: templateToUse.page.elements.map((element) => {
            const scaled: any = {
              ...element,
              id: generateId("el"),
              x: Math.round(element.x * scaleX),
              y: Math.round(element.y * scaleY),
              width: Math.round(element.width * scaleX),
              height: Math.round(element.height * scaleY),
            };
            if ("fontSize" in element && typeof (element as any).fontSize === "number") {
              scaled.fontSize = Math.max(12, Math.round((element as any).fontSize * Math.min(scaleX, scaleY)));
            }
            return scaled;
          }),
        };

        const updatedProject = await projectService.save({
          ...project,
          title: templateToUse.name,
          pages: [page],
        });

        router.push(
          `/editor/${updatedProject.id}?from=templates`
        );
        return;
      }

      const project = await projectService.create(
        "Untitled Design",
        ownerId,
        size
      );

      router.push(`/editor/${project.id}`);
    } catch (error) {
      console.error("Failed to create design:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to create design."
      );
    }
  };
  /* =========================================================
     FIND TEMPLATE
     ========================================================= */

const openTemplateByName = (name: string) => {
  const template = FALCON_TEMPLATES.find(
    (item) => item.name === name
  );

  if (!template) {
    console.error(`Template not found: ${name}`);

    alert(
      `Template "${name}" could not be found.`
    );

    return;
  }

  createFromTemplate(template);
};
  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <Head>
        <title>
          Falcon — Intelligent Design System
        </title>

        <meta
          name="description"
          content="Falcon turns ideas into intelligent visual systems."
        />

        <meta
          name="theme-color"
          content="#080808"
        />

        {/* =====================================================
            FALCON BLUE LASER SYSTEM
            Only boxes are changed.
            Overall page theme + fonts remain untouched.
            ===================================================== */}

        <style jsx global>{`
          /* ===================================================
             LASER BASE
             =================================================== */

          .falcon-laser {
            position: relative;
            isolation: isolate;
            overflow: hidden;
          }

          /*
            IMPORTANT:
            Do NOT force position on every direct child.
            Some existing content uses absolute positioning.
          */

          /* ===================================================
             BLUE BOX BORDER
             =================================================== */

          .falcon-laser-border {
            position: absolute !important;
            inset: 0;
            z-index: 50 !important;
            pointer-events: none;
            border: 1px solid rgba(47, 129, 255, 0.22);
            border-radius: inherit;
            overflow: visible;
          }

          /* ===================================================
             STATIC INNER BLUE GLOW
             =================================================== */

          .falcon-laser-border::after {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            border-radius: inherit;

            box-shadow:
              inset 0 0 22px
                rgba(47, 129, 255, 0.025),
              inset 0 0 60px
                rgba(34, 211, 238, 0.012);
          }

          /* ===================================================
             LASER BEAM COMMON
             =================================================== */

          .falcon-laser-beam {
            position: absolute !important;
            display: block;
            z-index: 100 !important;
            pointer-events: none;
            border-radius: 9999px;
            opacity: 1;
          }

          /* ===================================================
             TOP LASER
             =================================================== */

          .falcon-laser-top {
            top: -2px;
            left: -150px;

            width: 150px;
            height: 2px;

            background:
              linear-gradient(
                90deg,
                transparent 0%,
                rgba(47, 129, 255, 0.04) 8%,
                rgba(47, 129, 255, 0.18) 28%,
                rgba(77, 163, 255, 0.55) 55%,
                rgba(34, 211, 238, 0.9) 76%,
                #ffffff 91%,
                rgba(77, 163, 255, 0.8) 96%,
                transparent 100%
              );

            box-shadow:
              0 0 4px
                rgba(34, 211, 238, 1),
              0 0 10px
                rgba(77, 163, 255, 0.95),
              0 0 22px
                rgba(47, 129, 255, 0.8),
              0 0 42px
                rgba(47, 129, 255, 0.35);

            animation:
              falconLaserTop
              5.2s
              linear
              infinite;
          }

          @keyframes falconLaserTop {
            0% {
              left: -150px;
            }

            20% {
              left: calc(100% + 20px);
            }

            100% {
              left: calc(100% + 20px);
            }
          }

          /* ===================================================
             RIGHT LASER
             =================================================== */

          .falcon-laser-right {
            top: -150px;
            right: -2px;

            width: 2px;
            height: 150px;

            background:
              linear-gradient(
                180deg,
                transparent 0%,
                rgba(47, 129, 255, 0.04) 8%,
                rgba(47, 129, 255, 0.18) 28%,
                rgba(77, 163, 255, 0.55) 55%,
                rgba(34, 211, 238, 0.9) 76%,
                #ffffff 91%,
                rgba(77, 163, 255, 0.8) 96%,
                transparent 100%
              );

            box-shadow:
              0 0 4px
                rgba(34, 211, 238, 1),
              0 0 10px
                rgba(77, 163, 255, 0.95),
              0 0 22px
                rgba(47, 129, 255, 0.8),
              0 0 42px
                rgba(47, 129, 255, 0.35);

            animation:
              falconLaserRight
              5.2s
              linear
              infinite;

            animation-delay: 1.3s;
          }

          @keyframes falconLaserRight {
            0% {
              top: -150px;
            }

            20% {
              top: calc(100% + 20px);
            }

            100% {
              top: calc(100% + 20px);
            }
          }

          /* ===================================================
             BOTTOM LASER
             =================================================== */

          .falcon-laser-bottom {
            right: -150px;
            bottom: -2px;

            width: 150px;
            height: 2px;

            background:
              linear-gradient(
                270deg,
                transparent 0%,
                rgba(47, 129, 255, 0.04) 8%,
                rgba(47, 129, 255, 0.18) 28%,
                rgba(77, 163, 255, 0.55) 55%,
                rgba(34, 211, 238, 0.9) 76%,
                #ffffff 91%,
                rgba(77, 163, 255, 0.8) 96%,
                transparent 100%
              );

            box-shadow:
              0 0 4px
                rgba(34, 211, 238, 1),
              0 0 10px
                rgba(77, 163, 255, 0.95),
              0 0 22px
                rgba(47, 129, 255, 0.8),
              0 0 42px
                rgba(47, 129, 255, 0.35);

            animation:
              falconLaserBottom
              5.2s
              linear
              infinite;

            animation-delay: 2.6s;
          }

          @keyframes falconLaserBottom {
            0% {
              right: -150px;
            }

            20% {
              right: calc(100% + 20px);
            }

            100% {
              right: calc(100% + 20px);
            }
          }

          /* ===================================================
             LEFT LASER
             =================================================== */

          .falcon-laser-left {
            left: -2px;
            bottom: -150px;

            width: 2px;
            height: 150px;

            background:
              linear-gradient(
                0deg,
                transparent 0%,
                rgba(47, 129, 255, 0.04) 8%,
                rgba(47, 129, 255, 0.18) 28%,
                rgba(77, 163, 255, 0.55) 55%,
                rgba(34, 211, 238, 0.9) 76%,
                #ffffff 91%,
                rgba(77, 163, 255, 0.8) 96%,
                transparent 100%
              );

            box-shadow:
              0 0 4px
                rgba(34, 211, 238, 1),
              0 0 10px
                rgba(77, 163, 255, 0.95),
              0 0 22px
                rgba(47, 129, 255, 0.8),
              0 0 42px
                rgba(47, 129, 255, 0.35);

            animation:
              falconLaserLeft
              5.2s
              linear
              infinite;

            animation-delay: 3.9s;
          }

          @keyframes falconLaserLeft {
            0% {
              bottom: -150px;
            }

            20% {
              bottom: calc(100% + 20px);
            }

            100% {
              bottom: calc(100% + 20px);
            }
          }

          /* ===================================================
             BOX HOVER
             =================================================== */

          .falcon-laser:hover {
            border-color: rgba(47, 129, 255, 0.32);
          }

          .falcon-laser:hover .falcon-laser-border {
            border-color: rgba(77, 163, 255, 0.42);

            box-shadow:
              inset 0 0 28px
                rgba(47, 129, 255, 0.045),
              0 0 20px
                rgba(47, 129, 255, 0.08);
          }

          .falcon-laser:hover .falcon-laser-beam {
            filter: brightness(1.3);
          }

          /* ===================================================
             SCORE LINE
             =================================================== */

          .falcon-score-line {
            position: relative;
            overflow: hidden;
          }

          .falcon-score-line::after {
            content: "";
            position: absolute;

            left: -80px;
            top: 50%;

            width: 70px;
            height: 2px;

            transform: translateY(-50%);
            border-radius: 9999px;

            background:
              linear-gradient(
                90deg,
                transparent,
                rgba(47, 129, 255, 0.25),
                rgba(34, 211, 238, 0.85),
                #ffffff,
                rgba(77, 163, 255, 0.65),
                transparent
              );

            box-shadow:
              0 0 5px
                rgba(34, 211, 238, 0.9),
              0 0 14px
                rgba(47, 129, 255, 0.65),
              0 0 26px
                rgba(47, 129, 255, 0.35);

            animation:
              falconScoreLaser
              2.4s
              linear
              infinite;
          }

          @keyframes falconScoreLaser {
            from {
              transform:
                translate(-80px, -50%);
            }

            to {
              transform:
                translate(900px, -50%);
            }
          }


          /* ===================================================
             REDUCED MOTION
             =================================================== */

          @media (prefers-reduced-motion: reduce) {
            .falcon-laser-top,
            .falcon-laser-right,
            .falcon-laser-bottom,
            .falcon-laser-left,
            .falcon-score-line::after,
            .falcon-orbit-one::after,
            .falcon-orbit-two::after,
            .animate-ping,
            .animate-pulse {
              animation: none !important;
            }
          }

          /* ===================================================
             NAVBAR RESPONSIVE SAFETY
             =================================================== */

          @media (max-width: 1279px) {
            .falcon-navbar-inner {
              padding-left: 20px;
              padding-right: 20px;
            }

            .falcon-navbar-nav {
              gap: 24px;
            }

            .falcon-navbar-actions {
              gap: 8px;
            }
          }
        `}</style>
      </Head>

      {/* =========================================================
          PAGE
          ========================================================= */}

      <main className="min-h-screen bg-transparent text-[#f4f1eb] selection:bg-white selection:text-black">

        {/* =====================================================
            NAVBAR
            ===================================================== */}

        <header
          className="
            fixed
            left-3
            right-3
            top-3
            z-[100]
            rounded-2xl
            border
            border-white/[0.06]
            bg-[#05070A]/90
            backdrop-blur-xl
            md:left-4
            md:right-4
            lg:left-6
            lg:right-6
            xl:left-[4%]
            xl:right-[4%]
          "
        >
          <div
            className="
              falcon-navbar-inner
              mx-auto
              grid
              h-[53px]
              w-full
              max-w-[1400px]
              grid-cols-[1fr_auto_1fr]
              items-center
              px-4
              lg:px-5
            "
          >

            {/* =================================================
                LOGO
                ================================================= */}

            <button
              type="button"
              onClick={() => router.push("/")}
              className="group flex shrink-0 items-center gap-2 justify-self-start cursor-pointer"
            >
              <img
                src="/falcon-logo-white.png"
                alt="Falcon Logo"
                className="h-[23px] w-[23px] object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]"
              />
              <span className="text-[11px] font-semibold tracking-[0.2em]">
                FALCON
              </span>
            </button>

            {/* =================================================
                DESKTOP CENTER NAVIGATION
                ================================================= */}

            <nav
              className="
                falcon-navbar-nav
                hidden
                items-center
                justify-self-center
                gap-6
                lg:flex
              "
            >

              <button
                type="button"
                onClick={openAIStudio}
                className="
                  whitespace-nowrap
                  text-[11px]
                  text-zinc-500
                  transition-colors
                  hover:text-white
                "
              >
                AI Studio
              </button>

              <button
                type="button"
                onClick={openTemplatesPage}
                className="
                  whitespace-nowrap
                  text-[11px]
                  text-zinc-500
                  transition-colors
                  hover:text-white
                "
              >
                Templates
              </button>

              <button
                type="button"
                onClick={() => router.push("/email-designer")}
                className="
                  whitespace-nowrap
                  text-[11px]
                  text-zinc-500
                  transition-colors
                  hover:text-white
                "
              >
                Email Designer
              </button>

              <a
                href="#how"
                className="
                  whitespace-nowrap
                  text-[11px]
                  text-zinc-500
                  transition-colors
                  hover:text-white
                "
              >
                Resources
              </a>
            </nav>

            {/* =================================================
                DESKTOP RIGHT ACTIONS
                ================================================= */}

            <div
              className="
                falcon-navbar-actions
                hidden
                shrink-0
                items-center
                justify-self-end
                gap-3
                lg:flex
              "
            >
              {/* LOGIN */}

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="
                  whitespace-nowrap
                  px-3
                  py-1.5
                  text-[11px]
                  text-zinc-500
                  transition-colors
                  hover:text-white
                "
              >
                Log in
              </button>

              {/* WATCH DEMO */}

              <button
                type="button"
                className="
                  flex
                  h-[34px]
                  shrink-0
                  items-center
                  gap-1.5
                  whitespace-nowrap
                  rounded-full
                  border
                  border-white/[0.10]
                  bg-white/[0.03]
                  px-4
                  text-[11px]
                  font-medium
                  text-zinc-400
                  transition-all
                  hover:border-[#2F81FF]/40
                  hover:text-[#22D3EE]
                "
              >
                <Play size={10} />
                Watch demo
              </button>

              {/* GET STARTED */}

              <button
                type="button"
                onClick={createDesign}
                className="
                  flex
                  h-[34px]
                  shrink-0
                  items-center
                  gap-2
                  whitespace-nowrap
                  rounded-full
                  border
                  border-[#2F81FF]/60
                  bg-[#2F81FF]/[0.08]
                  px-4
                  text-[11px]
                  font-medium
                  text-[#4DA3FF]
                  transition-all
                  hover:border-[#2F81FF]
                  hover:bg-[#2F81FF]/[0.14]
                  hover:shadow-[0_0_20px_rgba(47,129,255,0.18)]
                "
              >
                Get started
                <ArrowRight size={12} />
              </button>
            </div>

            {/* =================================================
                MOBILE MENU BUTTON
                ================================================= */}

            <button
              type="button"
              onClick={() =>
                setMenuOpen((v) => !v)
              }
              className="
                ml-auto
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-white/10
                lg:hidden
              "
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X size={18} />
              ) : (
                <Menu size={18} />
              )}
            </button>
          </div>

          {/* =================================================
              MOBILE MENU
              ================================================= */}

          {menuOpen && (
            <div
              className="
                border-t
                border-white/[0.07]
                bg-[#0b0b0b]
                px-6
                py-6
                lg:hidden
              "
            >
              <div className="flex flex-col gap-5">


                <button
                  type="button"
                  onClick={openAIStudio}
                  className="
                    text-left
                    text-sm
                    text-zinc-400
                    hover:text-white
                  "
                >
                  AI Studio
                </button>

                <button
                  type="button"
                  onClick={openTemplatesPage}
                  className="
                    text-left
                    text-sm
                    text-zinc-400
                    hover:text-white
                  "
                >
                  Templates
                </button>

                <button
                  type="button"
                  onClick={() => { closeMenu(); router.push("/email-designer"); }}
                  className="
                    text-left
                    text-sm
                    text-zinc-400
                    hover:text-white
                  "
                >
                  Email Designer
                </button>

                <a
                  href="#how"
                  onClick={closeMenu}
                  className="
                    text-sm
                    text-zinc-400
                    hover:text-white
                  "
                >
                  Resources
                </a>

                {/* LOGIN MOBILE */}

                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    router.push("/login");
                  }}
                  className="
                    text-left
                    text-sm
                    text-zinc-400
                    hover:text-white
                  "
                >
                  Log in
                </button>

                {/* WATCH DEMO MOBILE */}

                <button
                  type="button"
                  className="
                    flex
                    h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    border
                    border-white/[0.12]
                    bg-white/[0.04]
                    text-sm
                    text-white
                  "
                >
                  <Play size={14} />
                  Watch demo
                </button>

                {/* CREATE MOBILE */}

                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    createDesign();
                  }}
                  className="
                    mt-2
                    flex
                    h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-white
                    text-sm
                    text-black
                  "
                >
                  Start creating
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}
        </header>

{/* =====================================================
            HERO
            ===================================================== */}

        <section
          id="product"
          className="
            relative
            flex
            min-h-[100dvh]
            items-center
            overflow-hidden
            border-b
            border-white/[0.07]
            pt-[62px]
          "
        >

          {/* Center mega-glow */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-[2] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2F81FF]/[0.06] blur-[140px]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-[2] h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22D3EE]/[0.04] blur-[80px]" />

          {/* Right glow */}
          <div className="pointer-events-none absolute -right-[100px] top-[25%] z-[2] h-[350px] w-[350px] rounded-full bg-[#2F81FF]/[0.05] blur-[120px]" />
          {/* Left glow */}
          <div className="pointer-events-none absolute -left-[100px] top-[40%] z-[2] h-[280px] w-[280px] rounded-full bg-[#22D3EE]/[0.03] blur-[100px]" />

          {/* Horizontal scan line */}
          <div className="pointer-events-none absolute left-0 right-0 top-[48%] z-[3] h-px bg-gradient-to-r from-transparent via-[#2F81FF]/20 to-transparent" />

          {/* Corner accents */}
          <div className="pointer-events-none absolute left-8 top-[80px] z-[4] hidden lg:block">
            <div className="h-12 w-px bg-gradient-to-b from-[#2F81FF]/40 to-transparent" />
            <div className="h-px w-12 bg-gradient-to-r from-[#2F81FF]/40 to-transparent" />
          </div>
          <div className="pointer-events-none absolute right-8 top-[80px] z-[4] hidden lg:block">
            <div className="ml-auto h-12 w-px bg-gradient-to-b from-[#2F81FF]/40 to-transparent" />
            <div className="h-px w-12 bg-gradient-to-l from-[#2F81FF]/40 to-transparent" />
          </div>
          <div className="pointer-events-none absolute bottom-[60px] left-8 z-[4] hidden lg:block">
            <div className="h-px w-12 bg-gradient-to-r from-[#2F81FF]/40 to-transparent" />
            <div className="h-12 w-px bg-gradient-to-t from-[#2F81FF]/40 to-transparent" />
          </div>
          <div className="pointer-events-none absolute bottom-[60px] right-8 z-[4] hidden lg:block">
            <div className="ml-auto h-px w-12 bg-gradient-to-l from-[#2F81FF]/40 to-transparent" />
            <div className="ml-auto h-12 w-px bg-gradient-to-t from-[#2F81FF]/40 to-transparent" />
          </div>

          <div className="pointer-events-none absolute left-[5%] xl:left-[7%] top-[26%] z-[5] hidden lg:block text-left">
            <div className="font-mono text-[11px] font-medium uppercase leading-[1.85] tracking-[0.3em] text-white/50">
              <div>INTELLIGENT</div>
              <div>DESIGN</div>
              <div>SYSTEM</div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="h-px w-7 bg-white/20" />
              <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-600">
                001
              </span>
            </div>
          </div>

          <div className="pointer-events-none absolute left-[5%] xl:left-[7%] top-[56%] z-[5] hidden items-center gap-2.5 font-mono text-[9px] tracking-[0.22em] text-zinc-500 lg:flex">
            <span className="text-[10px] text-zinc-500">◇</span>
            <span>VISUAL INTELLIGENCE</span>
          </div>

          <div className="pointer-events-none absolute right-[5%] xl:right-[7%] top-[26%] z-[5] hidden text-right lg:block">
            <div className="font-mono text-[11px] font-medium uppercase leading-[1.85] tracking-[0.3em] text-white/50">
              <div>IDEAS</div>
              <div>DESIGN</div>
              <div>INTELLIGENCE</div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-600">
                FALCON
              </span>
              <span className="h-px w-7 bg-white/20" />
            </div>
          </div>

          <div className="pointer-events-none absolute right-[5%] xl:right-[7%] top-[56%] z-[5] hidden items-center justify-end gap-2.5 font-mono text-[9px] tracking-[0.22em] text-zinc-500 lg:flex">
            <span>CREATIVE SYSTEM</span>
            <span className="text-[10px] text-zinc-500">◇</span>
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col items-center justify-center px-6 py-20 text-center lg:px-12">
            {/* Glowing badge matching Image 1 */}
            <div className="mb-9 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/60 px-4 py-1.5 shadow-[0_0_20px_rgba(34,211,238,0.1)] backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE] shadow-[0_0_8px_#22D3EE]" />
              <span className="font-mono text-[10px] font-medium tracking-[0.2em] text-cyan-200/90">
                INTELLIGENT DESIGN SYSTEM
              </span>
            </div>

            {/* Headline matching Image 1 */}
            <h1 className="max-w-[1150px] text-[clamp(4.2rem,8.5vw,8.5rem)] font-bold leading-[0.92] tracking-[-0.04em]">
              <span className="block text-white">Ideas become</span>
              <span className="block text-[#a8cdfc] drop-shadow-[0_0_40px_rgba(77,163,255,0.25)]">
                intelligent
              </span>
              <span className="block text-white">designs.</span>
            </h1>

            {/* Subtext matching Image 1 */}
            <p className="mt-10 max-w-[660px] font-sans text-[17px] leading-[1.8] text-zinc-400 md:text-[18px]">
              Falcon helps you turn an idea into a visual system — create it, improve it, remix it
              <span className="block">and carry it across an entire campaign.</span>
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={createDesign}
                className="group relative flex h-14 items-center gap-3 overflow-hidden rounded-full border border-[#2F81FF]/60 bg-[#2F81FF]/[0.1] px-8 text-[13px] font-semibold text-[#4DA3FF] shadow-[0_0_0_1px_rgba(47,129,255,0.1),inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-300 hover:gap-4 hover:border-[#2F81FF]/80 hover:bg-[#2F81FF]/[0.18] hover:shadow-[0_0_40px_rgba(47,129,255,0.25)]"
              >
                <span className="relative z-10">Start creating</span>
                <ArrowRight size={15} className="relative z-10 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                className="flex h-14 items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.02] px-8 text-[13px] text-zinc-400 backdrop-blur-md transition-all hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white"
              >
                <Play size={12} className="text-[#22D3EE]" />
                Watch demo
              </button>
            </div>



            <div className="absolute bottom-8 left-6 right-6 flex items-center justify-between font-mono text-[8px] tracking-[0.15em] text-zinc-700 lg:left-12 lg:right-12">
              <span>
                FALCON / 001
              </span>

              <div className="hidden items-center gap-3 sm:flex">
                <span>01</span>

                <span className="h-px w-20 bg-zinc-800" />

                <span>
                  PURPOSE → DESIGN → INTELLIGENCE
                </span>
              </div>

              <span>
                BUILDING THE FUTURE OF CREATION
              </span>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-[13%] left-[7%] z-[5] hidden lg:block">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-700">
              VISUAL LANGUAGE
            </div>

            <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
              PURPOSE / FORM / IMPACT
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-[13%] right-[7%] z-[5] hidden text-right lg:block">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-700">
              SYSTEM STATUS
            </div>

            <div className="mt-2 flex items-center justify-end gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500/70 shadow-[0_0_8px_rgba(34,197,94,.5)]" />

              ACTIVE / 2026
            </div>
          </div>
        </section>

        {/* =====================================================
            EMAIL DESIGNER SECTION
            ===================================================== */}

        <section
          id="email-design"
          className="relative overflow-hidden border-b border-white/[0.08] bg-transparent py-20 lg:py-28"
        >
          <div className="relative mx-auto max-w-[1440px] px-4 lg:px-8">

            <div className="mb-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.07] px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                    Email Designer
                  </span>
                </div>
                <h2 className="text-[28px] font-bold tracking-tight text-white lg:text-[36px]">
                  Design emails visually. Export production HTML.
                </h2>
              </div>
              <div className="flex shrink-0 gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/email-designer")}
                  className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-5 py-2.5 text-[13px] font-semibold text-accent transition-all hover:bg-accent hover:text-black"
                >
                  Open Email Designer
                  <ArrowRight size={13} />
                </button>
                <button
                  type="button"
                  onClick={openTemplatesPage}
                  className="rounded-xl border border-white/[0.08] px-5 py-2.5 text-[13px] font-medium text-zinc-400 transition-all hover:border-white/20 hover:text-white"
                >
                  Explore Templates
                </button>
              </div>
            </div>

            {/* ─── THREE-PANEL EDITOR PREVIEW ─────────────────────── */}
            <div className="relative mb-10 overflow-hidden rounded-2xl border border-white/[0.10] bg-[#0B0D12] shadow-[0_32px_80px_rgba(0,0,0,0.55)]">

              {/* Editor top bar */}
              <div className="flex items-center gap-3 border-b border-white/[0.08] bg-[#0B0D12] px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                </div>
                <div className="flex-1 text-center text-[12px] text-zinc-500">Untitled Email — Falcon Email Designer</div>
                <div className="hidden items-center gap-2 text-[10px] sm:flex">
                  <span className="rounded border border-white/[0.10] px-2 py-0.5 text-zinc-500">Desktop</span>
                  <span className="rounded border border-white/[0.10] px-2 py-0.5 text-zinc-500">Mobile</span>
                  <span className="rounded bg-accent/15 px-2 py-0.5 text-accent">Export HTML</span>
                </div>
              </div>

              {/* Three panels */}
              <div className="grid grid-cols-1 lg:grid-cols-[228px_1fr_340px]" style={{ minHeight: 620 }}>

                {/* LEFT: BLOCKS PANEL */}
                <div className="border-b border-white/[0.08] bg-[#0B0D12] lg:border-b-0 lg:border-r">
                  <div className="border-b border-white/[0.08] px-4 py-2.5">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Content Blocks</span>
                  </div>
                  <div className="space-y-0.5 overflow-y-auto p-3">
                    <div className="mb-3 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      <span className="text-[10px] text-zinc-700">Search blocks…</span>
                    </div>
                    <div className="mb-1 px-1 font-mono text-[8px] font-semibold uppercase tracking-widest text-zinc-700">Basic</div>
                    {["Text","Heading","Image","Button","Divider","Spacer","Social"].map((b, i) => (
                      <div key={b} className="flex cursor-grab items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-white/[0.04]" style={{ opacity: i === 3 ? 1 : 0.65 }}>
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-[9px] ${i === 3 ? "bg-accent/20 text-accent" : "bg-white/[0.05] text-zinc-500"}`}>
                          {["T","H","🖼","◉","—","↕","🔗"][i]}
                        </div>
                        <span className={`text-[11px] ${i === 3 ? "font-medium text-white" : "text-zinc-500"}`}>{b}</span>
                        {i === 3 && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
                      </div>
                    ))}
                    <div className="mb-1 mt-3 px-1 font-mono text-[8px] font-semibold uppercase tracking-widest text-zinc-700">Layout</div>
                    {["1 Column","2 Columns","3 Columns"].map((b) => (
                      <div key={b} className="flex cursor-grab items-center gap-2.5 rounded-lg px-2.5 py-2 opacity-50 transition-colors hover:bg-white/[0.04]">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white/[0.05] text-[9px] text-zinc-500">⫿</div>
                        <span className="text-[11px] text-zinc-500">{b}</span>
                      </div>
                    ))}
                    <div className="mb-1 mt-3 px-1 font-mono text-[8px] font-semibold uppercase tracking-widest text-zinc-700">Marketing</div>
                    {["Hero","Feature","CTA","Footer"].map((b) => (
                      <div key={b} className="flex cursor-grab items-center gap-2.5 rounded-lg px-2.5 py-2 opacity-50 transition-colors hover:bg-white/[0.04]">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white/[0.05] text-[9px] text-zinc-500">◈</div>
                        <span className="text-[11px] text-zinc-500">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CENTER: EMAIL CANVAS - LAPTOP FRAME */}
                <div className="flex items-center justify-center overflow-auto border-r border-white/[0.08] bg-[#12141A] p-6 sm:p-8">
                  <div className="w-full max-w-[440px] overflow-hidden rounded-xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
                    <div style={{ backgroundColor: "#0B1220", padding: "14px 22px", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#2F81FF,#22D3EE)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>F</div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.12em" }}>FALCON</span>
                    </div>
                    <div style={{ background: "linear-gradient(180deg,#0B1B33 0%,#102A4A 100%)", padding: "36px 28px 32px", textAlign: "center" }}>
                      <div style={{ fontSize: 9, fontFamily: "monospace", color: "#7EB6FF", letterSpacing: "0.22em", marginBottom: 12, textTransform: "uppercase" }}>Intelligent Design System</div>
                      <h1 style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 800, color: "#ffffff", lineHeight: 1.15, letterSpacing: "-0.03em" }}>Turn ideas into<br /><span style={{ color: "#22D3EE" }}>intelligent designs.</span></h1>
                      <p style={{ margin: "0 0 20px", fontSize: 12, color: "#9BB0C7", lineHeight: 1.55 }}>Create beautiful campaigns with a visual email builder.</p>
                      <a href="#" onClick={(e) => e.preventDefault()} style={{ display: "inline-block", padding: "10px 22px", background: "#2F81FF", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Start Creating →</a>
                    </div>
                    <div style={{ backgroundColor: "#ffffff", padding: "22px 18px 18px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
                        {[["⚡","AI Powered"],["🎨","Brand DNA"],["📤","Multi-Format"]].map(([icon, title]) => (
                          <div key={title} style={{ textAlign: "center", padding: "14px 6px", border: "1px solid #ECEFF3", borderRadius: 10, background: "#fff" }}>
                            <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#111" }}>{title}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ background: "#0A0A0A", borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Ready to get started?</div>
                        <div style={{ fontSize: 10, color: "#8A8A8A", marginBottom: 14 }}>Join thousands of teams already using Falcon.</div>
                        <a href="#" onClick={(e) => e.preventDefault()} style={{ display: "inline-block", padding: "8px 18px", background: "#2F81FF", color: "#fff", borderRadius: 7, fontSize: 11, fontWeight: 700, textDecoration: "none" }}>Start for free →</a>
                      </div>
                      <div style={{ marginTop: 16, textAlign: "center" }}>
                        <div style={{ fontSize: 9, color: "#B0B4BA" }}>Falcon Inc. · San Francisco, CA</div>
                        <div style={{ fontSize: 9, color: "#B0B4BA", marginTop: 3 }}><a href="#" onClick={(e) => e.preventDefault()} style={{ color: "#B0B4BA" }}>Unsubscribe</a></div>
                      </div>
                    </div>
                  </div>
                </div>


                {/* RIGHT: HTML CODE PANEL */}
                <div className="flex flex-col">
                  <div className="flex shrink-0 items-center justify-between border-b border-white/[0.05] px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D4D]" />
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500">HTML Email Code</span>
                      <span className="rounded bg-[#FF4D4D]/10 px-1.5 py-0.5 font-mono text-[8px] font-semibold text-[#FF4D4D]">HTML</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button className="rounded border border-white/[0.08] px-2 py-1 font-mono text-[9px] text-zinc-500 hover:text-zinc-300">Copy</button>
                      <button className="rounded bg-accent/10 px-2 py-1 font-mono text-[9px] text-accent hover:bg-accent hover:text-black">Export</button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto p-3" style={{ fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 10, lineHeight: 1.75 }}>
                    {[
                      { n:1,  i:0, t:[{s:"<!DOCTYPE html>",c:"#FF4D4D"}] },
                      { n:2,  i:0, t:[{s:"<html",c:"#FF4D4D"},{s:" lang=",c:"#79B8FF"},{s:'"en"',c:"#9ECBFF"},{s:">",c:"#FF4D4D"}] },
                      { n:3,  i:0, t:[{s:"<head>",c:"#FF4D4D"}] },
                      { n:4,  i:1, t:[{s:"<meta",c:"#FF4D4D"},{s:" charset=",c:"#79B8FF"},{s:'"UTF-8"',c:"#9ECBFF"},{s:">",c:"#FF4D4D"}] },
                      { n:5,  i:1, t:[{s:"<title>",c:"#FF4D4D"},{s:"Falcon Email",c:"#e2e8f0"},{s:"</title>",c:"#FF4D4D"}] },
                      { n:6,  i:0, t:[{s:"</head>",c:"#FF4D4D"}] },
                      { n:7,  i:0, t:[{s:"<body",c:"#FF4D4D"},{s:" style=",c:"#79B8FF"},{s:'"background:#f4f4f4"',c:"#9ECBFF"},{s:">",c:"#FF4D4D"}] },
                      { n:8,  i:1, t:[{s:"<table",c:"#FF4D4D"},{s:" width=",c:"#79B8FF"},{s:'"600"',c:"#9ECBFF"},{s:">",c:"#FF4D4D"}] },
                      { n:9,  i:2, t:[{s:"<tr>",c:"#FF4D4D"}] },
                      { n:10, i:3, t:[{s:"<td",c:"#FF4D4D"},{s:" align=",c:"#79B8FF"},{s:'"center"',c:"#9ECBFF"},{s:">",c:"#FF4D4D"}] },
                      { n:11, i:4, t:[{s:"<h1",c:"#FF4D4D"},{s:" style=",c:"#79B8FF"},{s:'"color:#fff"',c:"#9ECBFF"},{s:">",c:"#FF4D4D"}] },
                      { n:12, i:5, t:[{s:"Turn ideas into intelligent",c:"#e2e8f0"}] },
                      { n:13, i:4, t:[{s:"</h1>",c:"#FF4D4D"}] },
                      { n:14, i:4, t:[{s:"<p",c:"#FF4D4D"},{s:" style=",c:"#79B8FF"},{s:'"color:#8899aa"',c:"#9ECBFF"},{s:">",c:"#FF4D4D"}] },
                      { n:15, i:5, t:[{s:"Create beautiful campaigns.",c:"#e2e8f0"}] },
                      { n:16, i:4, t:[{s:"</p>",c:"#FF4D4D"}] },
                      { n:17, i:4, t:[{s:"<a",c:"#FF4D4D"},{s:" href=",c:"#79B8FF"},{s:'"#"',c:"#9ECBFF"},{s:" style=",c:"#79B8FF"},{s:'"background:#2F81FF"',c:"#9ECBFF"},{s:">",c:"#FF4D4D"}] },
                      { n:18, i:5, t:[{s:"Start Creating →",c:"#e2e8f0"}] },
                      { n:19, i:4, t:[{s:"</a>",c:"#FF4D4D"}] },
                      { n:20, i:3, t:[{s:"</td>",c:"#FF4D4D"}] },
                      { n:21, i:2, t:[{s:"</tr>",c:"#FF4D4D"}] },
                      { n:22, i:1, t:[{s:"</table>",c:"#FF4D4D"}] },
                      { n:23, i:0, t:[{s:"</body>",c:"#FF4D4D"}] },
                      { n:24, i:0, t:[{s:"</html>",c:"#FF4D4D"}] },
                    ].map(({ n, i, t }) => (
                      <div key={n} className="flex">
                        <span className="mr-3 w-5 shrink-0 select-none text-right text-[9px] text-zinc-700">{n}</span>
                        <span>{"  ".repeat(i)}{t.map((tok, idx) => <span key={idx} style={{ color: tok.c }}>{tok.s}</span>)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex shrink-0 items-center justify-between border-t border-white/[0.05] px-4 py-1.5">
                    <span className="font-mono text-[9px] text-zinc-700">24 lines · email-safe HTML</span>
                    <span className="font-mono text-[9px] text-[#FF4D4D]">⬤ Live</span>
                  </div>
                </div>

              </div>
            </div>

            {/* ─── FLOW LABEL ─────────────────────────────────────── */}
            <div className="mb-12 hidden items-center justify-center gap-3 text-[11px] text-zinc-700 lg:flex">
              <span>Design visually</span>
              <span className="max-w-[60px] flex-1 border-t border-dashed border-zinc-800" />
              <span className="text-accent">→</span>
              <span className="max-w-[60px] flex-1 border-t border-dashed border-zinc-800" />
              <span>Live canvas preview</span>
              <span className="max-w-[60px] flex-1 border-t border-dashed border-zinc-800" />
              <span className="text-accent">→</span>
              <span className="max-w-[60px] flex-1 border-t border-dashed border-zinc-800" />
              <span>Generate production HTML</span>
            </div>

            {/* ─── FEATURE CARDS ──────────────────────────────────── */}
            <div className="mb-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { icon: "⊞", title: "Drag & Drop", desc: "Build emails visually without code." },
                { icon: "◱", title: "Responsive by Default", desc: "Design once. Optimize for every screen." },
                { icon: "◉", title: "Live Preview", desc: "See exactly how your email will look." },
                { icon: "</>", title: "Export HTML", desc: "Generate production-ready email HTML." },
              ].map((f) => (
                <div key={f.title} className="group rounded-xl border border-white/[0.05] bg-white/[0.02] p-5 transition-all hover:border-accent/20 hover:bg-accent/[0.03]">
                  <div className="mb-3 font-mono text-[20px] text-zinc-600 group-hover:text-accent">{f.icon}</div>
                  <div className="mb-1.5 text-[13px] font-semibold text-white">{f.title}</div>
                  <div className="text-[12px] leading-relaxed text-zinc-600">{f.desc}</div>
                </div>
              ))}
            </div>

            {/* ─── TEMPLATE STRIP ─────────────────────────────────── */}
            <div>
              <div className="mb-4 flex items-center gap-4">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Email Templates</span>
                <div className="h-px flex-1 bg-white/[0.04]" />
                <button type="button" onClick={() => router.push("/email-designer")} className="text-[11px] text-accent hover:text-white">Browse all →</button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {["Welcome","Newsletter","Product Launch","Event","Promotional","Announcement","SaaS Update"].map((t, i) => (
                  <button key={t} type="button" onClick={() => router.push("/email-designer")} className="group shrink-0 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2 transition-all hover:border-accent/30 hover:bg-accent/[0.05]">
                    <div className="mb-1.5 h-1 w-full rounded-full opacity-60" style={{ backgroundColor: ["#2F81FF","#22D3EE","#FF6B6B","#FFD93D","#C77DFF","#FF8C42","#00D084"][i] }} />
                    <div className="text-[11px] text-zinc-500 group-hover:text-white">{t}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>



        {/* =====================================================
            WHY FALCON
            ===================================================== */}

        <section
          id="why"
          className="relative overflow-hidden border-b border-white/[0.10] bg-[#050505] py-20 lg:py-28"
        >
          <div className="pointer-events-none absolute inset-0 falcon-noise" />
          <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)] lg:items-end lg:gap-10 lg:px-12 xl:grid-cols-[minmax(420px,0.85fr)_minmax(560px,1.15fr)] xl:gap-16">
            <div className="min-w-0">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-[#2F81FF]">
                WHY FALCON
              </span>

              <h2 className="mt-6 max-w-[16ch] text-[clamp(2.4rem,5.4vw,5.4rem)] font-bold leading-[0.96] tracking-[-0.04em] text-white">
                Not another
                <span className="block">canvas.</span>
                <span className="mt-1 block text-[#A1A1AA]">An intelligent</span>
                <span className="block text-[#A1A1AA]">system.</span>
              </h2>

              <p className="mt-7 max-w-[480px] text-[15px] leading-[1.75] text-[#8B8F98]">
                Traditional tools start with pixels. Falcon starts with intent — then gives you real-time intelligence to make sharper, faster visual decisions.
              </p>

              <div className="mt-10 grid max-w-[520px] grid-cols-2 gap-3">
                {[
                  { k: "10×", c: "text-white", d: "Faster multi-format output" },
                  { k: "AAA", c: "text-[#22D3EE]", d: "Auto WCAG contrast checks" },
                  { k: "∞", c: "text-white", d: "Vector-lossless scaling" },
                  { k: "Live", c: "text-[#22D3EE]", d: "Real-time design scoring" },
                ].map((m) => (
                  <div
                    key={m.d}
                    className="flex min-h-[108px] flex-col justify-between rounded-[6px] border border-white/[0.10] bg-[#0A0D12] p-4 transition-all duration-500 hover:border-[#22D3EE]/30 hover:shadow-[0_0_24px_rgba(47,129,255,0.08)]"
                  >
                    <div className={`text-[22px] font-bold tracking-tight ${m.c}`}>{m.k}</div>
                    <div className="text-[12px] leading-snug text-[#8B8F98]">{m.d}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="falcon-laser relative mx-auto w-full min-h-[480px] max-w-[836px] overflow-hidden rounded-[8px] border border-white/[0.10] bg-[#0A0D12] shadow-[0_20px_60px_-15px_rgba(47,129,255,0.10)] lg:min-h-[540px] lg:self-end">
              <LaserBorder />

              {/* Ambient Blue Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(47,129,255,0.06),rgba(34,211,238,0.02)_40%,transparent_75%)]" />

              {/* TOP TELEMETRY BAR */}
              <div className="relative z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#05070A]/95 backdrop-blur-md px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-[#2F81FF]/[0.08] border border-[#2F81FF]/20 text-[#2F81FF]">
                    <Cpu size={12} />
                  </div>
                  <span className="font-mono text-[9px] tracking-[0.22em] text-zinc-300 font-medium uppercase">
                    COMPUTATIONAL DESIGN ARCHITECTURE
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 rounded-full bg-[#2F81FF]/[0.07] border border-[#2F81FF]/20 px-3 py-1 font-mono text-[8px] text-[#4DA3FF] font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE] animate-pulse" />
                    <span>ENGINE SYNCHRONIZED</span>
                  </div>
                </div>
              </div>

              {/* CENTER RADAR & NEURAL ORBIT ENGINE */}
              <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden p-6 sm:min-h-[400px] lg:min-h-[420px]">
                <div className="absolute h-[min(72vw,340px)] w-[min(72vw,340px)] rounded-full border border-dashed border-[#2F81FF]/18 animate-[spin_60s_linear_infinite]" />
                <div className="absolute h-[min(56vw,260px)] w-[min(56vw,260px)] rounded-full border border-dotted border-[#22D3EE]/20 animate-[spin_35s_linear_infinite_reverse]" />
                <div className="absolute h-[min(38vw,180px)] w-[min(38vw,180px)] rounded-full border border-[#2F81FF]/25 bg-[#2F81FF]/[0.015]" />
                <div className="pointer-events-none absolute h-[min(24vw,120px)] w-[min(24vw,120px)] rounded-full border border-[#22D3EE]/25 animate-ping opacity-20" />
                <div className="pointer-events-none absolute h-px w-[70%] bg-gradient-to-r from-transparent via-[#2F81FF]/20 to-transparent" />
                <div className="pointer-events-none absolute h-[70%] w-px bg-gradient-to-b from-transparent via-[#22D3EE]/15 to-transparent" />

                {/* CENTER CORE: FALCON INTELLIGENCE */}
                <div className="relative z-20 flex h-[100px] w-[100px] flex-col items-center justify-center rounded-full border border-[#2F81FF]/35 bg-[#050505] shadow-[0_0_50px_rgba(47,129,255,0.12)] transition-transform duration-500 hover:scale-105 sm:h-[130px] sm:w-[130px]">
                  <div className="absolute inset-1 rounded-full bg-gradient-to-b from-[#2F81FF]/08 via-transparent to-[#22D3EE]/06" />

                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#2F81FF]/15 border border-[#2F81FF]/35 text-[#22D3EE] mb-1.5 shadow-sm">
                    <Brain size={18} />
                  </div>

                  <span className="font-serif text-lg font-medium text-white tracking-wide">
                    Falcon
                  </span>

                  <span className="font-mono text-[7px] tracking-[0.25em] text-[#4DA3FF] font-medium">
                    INTELLIGENCE
                  </span>
                </div>

                {/* ORBITAL NODE 1: TOP-RIGHT (INTENT) */}
                <div className="absolute top-8 right-3 z-20 flex max-w-[46%] items-center gap-2 rounded-[6px] border border-white/[0.10] bg-[#050505]/95 px-3 py-2 shadow-lg backdrop-blur-md transition-all duration-500 hover:border-[#2F81FF]/50 sm:right-8">
                  <span className="h-2 w-2 rounded-full bg-[#22D3EE] shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  <div>
                    <div className="font-mono text-[8px] font-bold text-white tracking-wider">
                      ✦ CREATIVE INTENT
                    </div>
                    <div className="font-mono text-[7px] text-zinc-500">
                      Natural language prompt
                    </div>
                  </div>
                </div>

                {/* ORBITAL NODE 2: BOTTOM-RIGHT (DESIGN DNA) */}
                <div className="absolute bottom-6 right-4 z-20 flex max-w-[46%] items-center gap-2 rounded-[6px] border border-white/[0.10] bg-[#050505]/95 px-3 py-2 shadow-lg backdrop-blur-md transition-all duration-500 hover:border-[#2F81FF]/50 sm:right-10">
                  <span className="h-2 w-2 rounded-full bg-[#4DA3FF] shadow-[0_0_8px_rgba(77,163,255,0.7)]" />
                  <div>
                    <div className="font-mono text-[8px] font-bold text-white tracking-wider">
                      ⚡ DESIGN DNA
                    </div>
                    <div className="font-mono text-[7px] text-zinc-500">
                      Brand kit & typography
                    </div>
                  </div>
                </div>

                {/* ORBITAL NODE 3: BOTTOM-LEFT (COMPOSITION) */}
                <div className="absolute bottom-6 left-4 z-20 flex max-w-[46%] items-center gap-2 rounded-[6px] border border-white/[0.10] bg-[#050505]/95 px-3 py-2 shadow-lg backdrop-blur-md transition-all duration-500 hover:border-[#2F81FF]/50 sm:left-10">
                  <span className="h-2 w-2 rounded-full bg-[#22D3EE] shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
                  <div>
                    <div className="font-mono text-[8px] font-bold text-white tracking-wider">
                      ◈ COMPOSITION
                    </div>
                    <div className="font-mono text-[7px] text-zinc-500">
                      Golden ratio & balance
                    </div>
                  </div>
                </div>

                {/* ORBITAL NODE 4: TOP-LEFT (SYSTEM) */}
                <div className="absolute top-8 left-3 z-20 flex max-w-[46%] items-center gap-2 rounded-[6px] border border-white/[0.10] bg-[#050505]/95 px-3 py-2 shadow-lg backdrop-blur-md transition-all duration-500 hover:border-[#2F81FF]/50 sm:left-8">
                  <span className="h-2 w-2 rounded-full bg-[#2F81FF] shadow-[0_0_8px_rgba(47,129,255,0.7)]" />
                  <div>
                    <div className="font-mono text-[8px] font-bold text-white tracking-wider">
                      ⬡ ADAPTIVE CANVAS
                    </div>
                    <div className="font-mono text-[7px] text-zinc-500">
                      Vector layout engine
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM TELEMETRY PIPELINE */}
              <div className="relative z-10 overflow-x-auto border-t border-white/[0.10] bg-[#050505]/95 px-4 py-4 backdrop-blur-md sm:px-6">
                <div className="flex min-w-[520px] items-center justify-between text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#22D3EE]/15 text-[#22D3EE] font-mono text-[9px] font-bold">
                      1
                    </span>
                    <span className="font-mono text-[9px] text-zinc-300 font-medium">
                      PURPOSE & PROMPT
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[#2F81FF]">
                    <span className="h-px w-6 sm:w-12 bg-gradient-to-r from-[#22D3EE] to-[#2F81FF]" />
                    <ArrowRight size={13} className="text-[#4DA3FF]" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2F81FF]/15 text-[#2F81FF] font-mono text-[9px] font-bold">
                      2
                    </span>
                    <span className="font-mono text-[9px] text-[#4DA3FF] font-medium">
                      NEURAL VISUAL SYSTEM
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[#2F81FF]">
                    <span className="h-px w-6 sm:w-12 bg-gradient-to-r from-[#2F81FF] to-[#22D3EE]" />
                    <ArrowRight size={13} className="text-[#22D3EE]" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#22D3EE]/15 text-[#22D3EE] font-mono text-[9px] font-bold">
                      3
                    </span>
                    <span className="font-mono text-[9px] text-[#22D3EE] font-medium">
                      MULTI-FORMAT OUTPUT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SYSTEM
            ===================================================== */}

        <section
          id="how"
          className="relative flex min-h-[100dvh] items-center border-b border-white/[0.08] bg-transparent"
        >
          <div className="mx-auto w-full max-w-[1600px] px-6 py-24 lg:px-12">
            <div className="mb-14">
              <span className="font-mono text-[10px] tracking-[0.25em] text-blue-400 uppercase font-semibold">
                THE SYSTEM
              </span>

              <h2 className="mt-5 max-w-[900px] text-[clamp(3rem,5.5vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-white">
                From first thought<span className="block text-gradient">to finished campaign.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 border border-white/[0.08] bg-[#000000] md:grid-cols-2 xl:grid-cols-4">
              <SystemCard
                number="01"
                icon={<Target size={22} />}
                title="Start with what you mean."
                description="Tell Falcon what you want to achieve. It turns your purpose, audience and message into a visual direction."
              />

              <SystemCard
                number="02"
                icon={<Crosshair size={22} />}
                title="Design with a second pair of eyes."
                description="Falcon spots weak hierarchy, contrast, spacing and alignment while you work."
              />

              <SystemCard
                number="03"
                icon={<Layers3 size={22} />}
                title="Keep every design unmistakably yours."
                description="Design DNA captures the visual language of your project and keeps it consistent."
              />

              <SystemCard
                number="04"
                icon={<RefreshCw size={22} />}
                title="One idea. Every format."
                description="Turn one strong composition into an entire campaign without starting over."
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            HOW IT WORKS
            ===================================================== */}

        <section className="relative flex min-h-[100dvh] items-center border-b border-white/[0.08] bg-transparent">
          <div className="mx-auto w-full max-w-[1600px] px-6 py-24 lg:px-12">
            <div className="mb-14">
              <span className="font-mono text-[10px] tracking-[0.25em] text-blue-400 uppercase font-semibold">
                HOW IT WORKS
              </span>

              <h2 className="mt-5 max-w-[900px] text-[clamp(3rem,5.5vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-white">
                You bring the intent.<span className="block text-gradient">Falcon finds the form.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <ProcessCard
                number="01"
                icon={<Target size={22} />}
                title="Define"
                description="Choose your goal, audience, tone and format."
                step="define"
              />

              <ProcessCard
                number="02"
                icon={<Wand2 size={22} />}
                title="Generate"
                description="Explore multiple creative directions before committing."
                step="generate"
              />

              <ProcessCard
                number="03"
                icon={<Zap size={22} />}
                title="Improve"
                description="Use Design Coach to sharpen your composition and visual hierarchy."
                step="improve"
              />

              <ProcessCard
                number="04"
                icon={<RefreshCw size={22} />}
                title="Remix"
                description="Extend your visual language across formats and campaigns."
                step="remix"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            DESIGN INTELLIGENCE
            ===================================================== */}

        <section
          id="intelligence"
          className="relative flex min-h-[100dvh] items-center border-b border-white/[0.07]"
        >
          <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center lg:px-12">
            <div>
              <span className="font-mono text-[9px] tracking-[0.25em] text-[#00D084] font-medium uppercase">
                DESIGN INTELLIGENCE
              </span>

              <h2 className="mt-6 max-w-[800px] text-[clamp(3.5rem,6.2vw,6.2rem)] font-bold leading-[0.92] tracking-[-0.035em] text-white">
                Make better decisions,
                <span className="block font-normal text-zinc-400">
                  not just prettier pixels.
                </span>
              </h2>

              <p className="mt-8 max-w-[500px] text-[15px] leading-relaxed text-zinc-400 font-light">
                Automated visual hierarchy, optical balance and contrast analysis in real time.
              </p>

              <button
                type="button"
                onClick={createDesign}
                className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-[#00D084]/40 bg-[#00D084]/10 px-6 py-3 font-mono text-[11px] font-medium text-white transition-all hover:bg-[#00D084]/20 hover:border-[#00D084] hover:text-[#00D084] hover:gap-3.5 shadow-lg"
              >
                <span>Try the system</span>
                <ArrowUpRight size={14} className="text-[#00D084]" />
              </button>
            </div>

            <div className="relative rounded-2xl border border-white/[0.10] bg-[#080808] p-7 sm:p-9 backdrop-blur-xl shadow-[0_24px_70px_-15px_rgba(0,0,0,0.85)]">
              {/* TOP HEADER */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#00D084] shadow-[0_0_8px_#00D084]" />
                  <span className="font-mono text-[9px] tracking-[0.22em] text-zinc-400 uppercase font-medium">
                    LIVE DESIGN ANALYSIS
                  </span>
                </div>

                <span className="rounded-full bg-[#00D084]/15 border border-[#00D084]/30 px-2.5 py-0.5 font-mono text-[8px] font-bold text-[#00D084] tracking-wider">
                  ACTIVE
                </span>
              </div>

              {/* CIRCULAR GAUGE & MASTER SCORE */}
              <div className="flex items-center gap-7 py-8">
                {/* SVG Circular Dial */}
                <div className="relative flex h-[120px] w-[120px] shrink-0 items-center justify-center">
                  <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="5"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="#00D084"
                      strokeWidth="5"
                      strokeDasharray="264"
                      strokeDashoffset="21"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
                      92
                    </span>
                    <span className="font-mono text-[8px] tracking-widest text-zinc-500 font-medium">
                      /100
                    </span>
                  </div>
                </div>

                <div>
                  <span className="inline-block rounded bg-[#00D084]/10 border border-[#00D084]/30 px-2 py-0.5 font-mono text-[8px] tracking-[0.16em] text-[#00D084] font-semibold uppercase">
                    DESIGN SCORE
                  </span>
                  <h3 className="mt-1.5 text-2xl sm:text-3xl text-white font-semibold tracking-[-0.02em]">
                    Strong visual hierarchy
                  </h3>
                  <p className="mt-1 font-mono text-[10px] text-zinc-400">
                    Optimal eye path & zero focal friction
                  </p>
                </div>
              </div>

              {/* 4 SCORE METRICS */}
              <div className="space-y-3.5 border-t border-white/[0.06] pt-6">
                <ScoreRow
                  label="Typography"
                  score={96}
                  detail="Ratio 1.25 · Harmonious"
                />

                <ScoreRow
                  label="Contrast Ratio"
                  score={89}
                  detail="14.2:1 · AAA Verified"
                />

                <ScoreRow
                  label="Optical Grid"
                  score={94}
                  detail="8pt Strict Baseline"
                />

                <ScoreRow
                  label="Hierarchy"
                  score={91}
                  detail="Golden Ratio Focal"
                />
              </div>

              {/* COACH ADVISORY */}
              <div className="mt-7 flex items-center justify-between rounded-xl border border-[#00D084]/25 bg-[#00D084]/[0.05] p-3.5 sm:p-4 backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <Sparkles size={16} className="mt-0.5 text-[#00D084] shrink-0" />
                  <div>
                    <span className="font-mono text-[8px] tracking-[0.16em] uppercase font-bold text-[#00D084]">
                      COACH ADVISORY
                    </span>
                    <p className="mt-0.5 text-[11px] leading-snug text-zinc-300 font-light">
                      Boost primary CTA contrast (+15%) for peak retention.
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-md bg-[#00D084]/15 border border-[#00D084]/30 px-2.5 py-1 font-mono text-[8px] font-semibold text-[#00D084]">
                  QUICK TUNE
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            DESIGN DNA (NEXT.JS STYLE TOKEN ENGINE)
            ===================================================== */}

        <section id="dna" className="relative flex min-h-[100dvh] items-center border-b border-white/[0.08] bg-transparent">
          <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-14 px-6 py-24 lg:grid-cols-2 lg:items-center lg:px-12">
            {/* LEFT: NEXT.JS TOKEN MATRIX BENTO */}
            <div className="next-card relative overflow-hidden p-8 sm:p-9 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)]">
              {/* TOP HEADER */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  <span className="font-mono text-[10px] tracking-wider text-zinc-300 uppercase font-medium">
                    falcon.config.ts · Active Tokens
                  </span>
                </div>
                <span className="rounded-md border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 font-mono text-[9px] text-zinc-400">
                  v2.6 STRICT
                </span>
              </div>

              {/* COLOR PRIMITIVES */}
              <div className="mt-7">
                <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">
                  01 · COLOR PRIMITIVES (WCAG AAA)
                </span>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border border-white/[0.08] bg-black p-3.5">
                    <div className="h-6 w-full rounded bg-black border border-white/20 mb-2" />
                    <div className="text-[12px] font-semibold text-white">#000000</div>
                    <div className="font-mono text-[9px] text-zinc-500">Pure Canvas</div>
                  </div>
                  <div className="rounded-lg border border-white/[0.08] bg-black p-3.5">
                    <div className="h-6 w-full rounded bg-white mb-2" />
                    <div className="text-[12px] font-semibold text-white">#EDEDED</div>
                    <div className="font-mono text-[9px] text-zinc-500">High Contrast</div>
                  </div>
                  <div className="rounded-lg border border-white/[0.08] bg-black p-3.5">
                    <div className="h-6 w-full rounded bg-[#0070f3] mb-2 shadow-[0_0_12px_rgba(0,112,243,0.4)]" />
                    <div className="text-[12px] font-semibold text-white">#0070F3</div>
                    <div className="font-mono text-[9px] text-zinc-500">Electric Blue</div>
                  </div>
                  <div className="rounded-lg border border-white/[0.08] bg-black p-3.5">
                    <div className="h-6 w-full rounded bg-[#00dfd8] mb-2 shadow-[0_0_12px_rgba(0,223,216,0.4)]" />
                    <div className="text-[12px] font-semibold text-white">#00DFD8</div>
                    <div className="font-mono text-[9px] text-zinc-500">Cyan Apex</div>
                  </div>
                </div>
              </div>

              {/* TYPOGRAPHIC RHYTHM SCALE */}
              <div className="mt-7 border-t border-white/[0.06] pt-6">
                <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">
                  02 · MODULAR TYPOGRAPHIC SCALE (RATIO 1.25)
                </span>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between rounded-md border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-xs">
                    <span className="text-white font-semibold">Display Title</span>
                    <span className="font-mono text-[10px] text-zinc-400">clamp(3.5rem, 6vw, 6rem) · -0.035em</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-xs">
                    <span className="text-zinc-200 font-medium">Section Heading</span>
                    <span className="font-mono text-[10px] text-zinc-400">32px / 2rem · -0.02em</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-xs">
                    <span className="text-zinc-300 font-normal">Body Text</span>
                    <span className="font-mono text-[10px] text-zinc-400">15px / 1.6 leading · Neutral 400</span>
                  </div>
                </div>
              </div>

              {/* SPATIAL & GRID SPEC */}
              <div className="mt-7 flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/[0.05] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 font-mono text-xs font-bold">
                    8px
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-white">Strict Spatial Baseline</div>
                    <div className="font-mono text-[10px] text-zinc-400">Zero subpixel drift across exports</div>
                  </div>
                </div>
                <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-mono text-[9px] font-semibold text-emerald-400">
                  99.8% SYNC
                </span>
              </div>
            </div>

            {/* RIGHT: EDITORIAL HEADLINE & CAPABILITIES */}
            <div>
              <span className="font-mono text-[10px] tracking-[0.25em] text-blue-400 uppercase font-semibold">
                DESIGN DNA // TOKEN ENGINE
              </span>

              <h2 className="mt-6 max-w-[700px] text-[clamp(3.5rem,6.2vw,6.2rem)] font-bold leading-[0.92] tracking-[-0.035em] text-white">
                Your visual language,
                <span className="block text-gradient">
                  remembered.
                </span>
              </h2>

              <p className="mt-6 max-w-[560px] text-[15px] leading-relaxed text-zinc-400 font-normal">
                Falcon codifies your team's visual identity into an executable system. Typography scales, color contrast, and optical balance stay consistent across every project.
              </p>

              <div className="mt-10 divide-y divide-white/[0.06] border-t border-b border-white/[0.06]">
                <div className="py-4 flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-zinc-500">01</span>
                    <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">Adaptive Color Primitives</span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase">Auto-Derives Palettes</span>
                </div>

                <div className="py-4 flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-zinc-500">02</span>
                    <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">Typographic Modular Scale</span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase">Golden Ratio 1.25</span>
                </div>

                <div className="py-4 flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-zinc-500">03</span>
                    <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">Strict 8pt Spatial Baseline</span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase">Pixel-Perfect Layouts</span>
                </div>

                <div className="py-4 flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-zinc-500">04</span>
                    <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">Component Hierarchy & Weight</span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase">Focal Path Optimized</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            TEMPLATES
            ===================================================== */}

        <section
          id="templates"
          className="relative flex min-h-[100dvh] items-center border-b border-white/[0.07]"
        >
          <div className="mx-auto w-full max-w-[1600px] px-6 py-24 lg:px-12">
            <div className="mb-16">
              <span className="font-mono text-[9px] tracking-[0.25em] text-zinc-600">
                CREATIVE STARTING POINTS
              </span>

              <h2 className="mt-8 max-w-[1000px] font-serif text-[clamp(4rem,7vw,7rem)] leading-[0.86] tracking-[-0.05em]">
                Start somewhere.

                <span className="block text-zinc-500">
                  Then make it yours.
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <TemplateCard
                category="EVENT / 01"
                title="Hackathon Launch"
                variant="warm"
                imageUrl="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&auto=format&fit=crop&q=80"
                onClick={() =>
                  openTemplateByName(
                    "Hackathon Launch"
                  )
                }
              />

              <TemplateCard
                category="SOCIAL / 02"
                title="Product Drop"
                variant="cool"
                imageUrl="https://images.unsplash.com/photo-1552346154-21d32810aba3?w=900&auto=format&fit=crop&q=80"
                onClick={() =>
                  openTemplateByName(
                    "Product Drop"
                  )
                }
              />

              <TemplateCard
                category="BRAND / 03"
                title="Studio Identity"
                variant="neutral"
                imageUrl="https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=900&auto=format&fit=crop&q=80"
                onClick={() =>
                  openTemplateByName(
                    "Studio Identity"
                  )
                }
              />

              <TemplateCard
                category="CULTURE / 04"
                title="Festival Night"
                variant="warm"
                imageUrl="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&auto=format&fit=crop&q=80"
                onClick={() =>
                  openTemplateByName(
                    "Festival Night"
                  )
                }
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            ONE → MANY (NEXT.JS MULTI-CHANNEL ENGINE)
            ===================================================== */}

        <section id="remix" className="relative flex min-h-[100dvh] items-center overflow-hidden border-b border-white/[0.08] bg-transparent">
          <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-14 px-6 py-24 lg:grid-cols-2 lg:items-center lg:px-12">
            {/* LEFT CONTENT */}
            <div>
              <span className="font-mono text-[10px] tracking-[0.25em] text-blue-400 uppercase font-semibold">
                ONE → MANY // CAMPAIGN ENGINE
              </span>

              <h2 className="mt-6 max-w-[650px] text-[clamp(3.5rem,6.2vw,6.2rem)] font-bold leading-[0.92] tracking-[-0.035em] text-white">
                One strong idea.
                <span className="block text-gradient">
                  Everywhere it matters.
                </span>
              </h2>

              <p className="mt-6 max-w-[560px] text-[15px] leading-relaxed text-zinc-400 font-normal">
                Build the master design once. Falcon intelligently adapts layouts, typography, and optical balance across all formats in parallel.
              </p>

              <button
                type="button"
                onClick={createDesign}
                className="mt-9 flex h-12 w-fit items-center gap-3 rounded-full bg-white px-7 text-[13px] font-semibold text-black transition-all hover:bg-zinc-200 shadow-[0_0_24px_rgba(255,255,255,0.2)]"
              >
                <span>Build a campaign</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* RIGHT: NEXT.JS MULTI-CHANNEL BENTO DECK */}
            <div className="next-card relative overflow-hidden p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)]">
              {/* TOP HEADER */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                  <span className="font-mono text-[10px] tracking-wider text-zinc-300 uppercase font-medium">
                    Auto-Reflow Engine · Active
                  </span>
                </div>
                <span className="rounded-md border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 font-mono text-[9px] text-zinc-400">
                  PARALLEL SYNC
                </span>
              </div>

              {/* THREE LIVE FORMAT PREVIEW CARDS */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* 1:1 SQUARE */}
                <div className="group rounded-xl border border-white/[0.08] bg-black/60 p-4 transition-all hover:border-[#2F81FF]/40 hover:bg-[#2F81FF]/[0.02]">
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-white/[0.1] bg-black">
                    <img
                      src="/campaign/campaign-post.jpg"
                      alt="1:1 Campaign Post"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 p-3.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-black/60 px-2 py-0.5 text-[9px] font-mono text-zinc-300 backdrop-blur-md border border-white/10">1:1 POST</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE] shadow-[0_0_6px_#22D3EE]" />
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-sm tracking-tight text-white drop-shadow-md">FALCON // CORE</div>
                        <div className="text-[9px] font-mono text-cyan-300/90 tracking-widest uppercase">Autonomous Reflow</div>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-400">1080 × 1080</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-200">Instagram</span>
                    <span className="font-mono text-[9px] font-medium text-emerald-400">Ready</span>
                  </div>
                </div>

                {/* 9:16 VERTICAL */}
                <div className="group rounded-xl border border-white/[0.08] bg-black/60 p-4 transition-all hover:border-[#22D3EE]/40 hover:bg-[#22D3EE]/[0.02]">
                  <div className="relative aspect-[9/14] w-full overflow-hidden rounded-lg border border-white/[0.1] bg-black">
                    <img
                      src="/campaign/campaign-story.jpg"
                      alt="9:16 Campaign Story"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/60 p-3.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-black/60 px-2 py-0.5 text-[9px] font-mono text-zinc-300 backdrop-blur-md border border-white/10">9:16 STORY</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE] shadow-[0_0_6px_#22D3EE]" />
                      </div>
                      <div className="text-center my-auto py-4">
                        <div className="font-bold text-sm tracking-tight text-white drop-shadow-md">FALCON // CORE</div>
                        <div className="text-[9px] font-mono text-cyan-300/90 tracking-widest uppercase">Vertical Story</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-mono text-zinc-400">1080 × 1920</span>
                        <span className="text-[8px] font-mono text-zinc-300 bg-white/10 rounded px-1.5 py-0.5">TAP TO VIEW</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-200">Reels & Story</span>
                    <span className="font-mono text-[9px] font-medium text-emerald-400">Ready</span>
                  </div>
                </div>

                {/* 16:9 WIDESCREEN */}
                <div className="group rounded-xl border border-white/[0.08] bg-black/60 p-4 transition-all hover:border-[#2F81FF]/40 hover:bg-[#2F81FF]/[0.02]">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-white/[0.1] bg-black">
                    <img
                      src="/campaign/campaign-banner.jpg"
                      alt="16:9 Campaign Banner"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 p-3.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-black/60 px-2 py-0.5 text-[9px] font-mono text-zinc-300 backdrop-blur-md border border-white/10">16:9 BANNER</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE] shadow-[0_0_6px_#22D3EE]" />
                      </div>
                      <div>
                        <div className="font-bold text-sm tracking-tight text-white drop-shadow-md">FALCON // CORE</div>
                        <div className="text-[9px] font-mono text-cyan-300/90 tracking-widest uppercase">Display Billboard</div>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-400">1920 × 1080</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-200">Landscape</span>
                    <span className="font-mono text-[9px] font-medium text-emerald-400">Ready</span>
                  </div>
                </div>
              </div>

              {/* COMMAND PILL */}
              <div className="mt-6 flex items-center justify-between rounded-lg border border-white/[0.08] bg-black px-4 py-2.5 font-mono text-[11px] text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">$</span>
                  <span>falcon remix --master=brand.canvas --all-channels</span>
                </div>
                <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[9px] text-zinc-300">
                  OPTIMIZED
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FINAL CTA (LAST PAGE - EXACTLY LIKE IMAGE 2)
            ===================================================== */}

        <FinalCtaSection onEnter={createDesign} />

        {/* =====================================================
            FOOTER (CLEAN GEOMETRIC SANS ARCHITECTURE)
            ===================================================== */}

        <footer className="border-t border-white/[0.08] bg-[#050608] pt-20 pb-16 text-zinc-400">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
            <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.1fr_2.9fr]">
              {/* LEFT COLUMN: BRAND & SLOGAN */}
              <div className="flex flex-col justify-between pr-4">
                <div>
                  <div className="flex items-center gap-3">
                    <img
                      src="/falcon-logo-white.png"
                      alt="Falcon"
                      className="h-8 w-8 object-contain"
                    />
                    <span className="text-xl font-bold tracking-tight text-white">
                      FALCON
                    </span>
                  </div>

                  <h3 className="mt-10 text-[32px] sm:text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
                    A design makes it real
                  </h3>

                  <p className="mt-4 max-w-[340px] text-[14px] leading-relaxed text-zinc-400">
                    The intelligent design system that turns visual concepts into multi-channel campaigns.
                  </p>
                </div>

                <div className="mt-12 flex flex-col gap-2 font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
                  <span>SYSTEM // FALCON OS 2.6</span>
                  <span>BUILDING THE FUTURE OF CREATIVE SYSTEMS</span>
                </div>
              </div>

              {/* RIGHT COLUMNS: STRUCTURED SANS-SERIF NAVIGATION */}
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5 text-[13px]">
                {/* PRODUCTS */}
                <div>
                  <h4 className="font-semibold text-white tracking-tight mb-4">Products</h4>
                  <ul className="space-y-3 font-normal text-zinc-400">
                    <li><button type="button" onClick={createDesign} className="hover:text-white transition-colors">Design Studio</button></li>
                    <li><button type="button" onClick={openTemplatesPage} className="hover:text-white transition-colors">Templates</button></li>
                    <li><button type="button" onClick={() => router.push("/email-designer")} className="hover:text-white transition-colors text-[#00D084]">Email Designer</button></li>
                    <li><button type="button" onClick={openAIStudio} className="hover:text-white transition-colors">AI Studio</button></li>
                    <li><a href="#intelligence" className="hover:text-white transition-colors">Design Intelligence</a></li>
                    <li><a href="#dna" className="hover:text-white transition-colors">Brand DNA</a></li>
                    <li><a href="#remix" className="hover:text-white transition-colors">Format Remix</a></li>
                    <li><a href="#product" className="hover:text-white transition-colors">Vector Engine</a></li>
                  </ul>
                </div>

                {/* SOLUTIONS */}
                <div>
                  <h4 className="font-semibold text-white tracking-tight mb-4">Solutions</h4>
                  <ul className="space-y-3 font-normal text-zinc-400">
                    <li><a href="#why" className="hover:text-white transition-colors">Creative Directors</a></li>
                    <li><a href="#how" className="hover:text-white transition-colors">Marketing Teams</a></li>
                    <li><a href="#why" className="hover:text-white transition-colors">Agencies & Studios</a></li>
                    <li><a href="#product" className="hover:text-white transition-colors">Social & Content</a></li>
                    <li><a href="#dna" className="hover:text-white transition-colors">Brand Consistency</a></li>
                    <li><a href="#intelligence" className="hover:text-white transition-colors">Quality Assurance</a></li>
                  </ul>
                </div>

                {/* RESOURCES */}
                <div>
                  <h4 className="font-semibold text-white tracking-tight mb-4">Resources</h4>
                  <ul className="space-y-3 font-normal text-zinc-400">
                    <li><a href="#how" className="hover:text-white transition-colors">Workflow Guide</a></li>
                    <li><button type="button" onClick={openTemplatesPage} className="hover:text-white transition-colors">Template Gallery</button></li>
                    <li><a href="#intelligence" className="hover:text-white transition-colors">Design Metrics</a></li>
                    <li><a href="#why" className="hover:text-white transition-colors">Case Studies</a></li>
                    <li><a href="#product" className="hover:text-white transition-colors">Documentation</a></li>
                    <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                  </ul>
                </div>

                {/* COMPANY */}
                <div>
                  <h4 className="font-semibold text-white tracking-tight mb-4">Company</h4>
                  <ul className="space-y-3 font-normal text-zinc-400">
                    <li><a href="#why" className="hover:text-white transition-colors">About Falcon</a></li>
                    <li><a href="#product" className="hover:text-white transition-colors">Philosophy</a></li>
                    <li><a href="#intelligence" className="hover:text-white transition-colors">Intelligence Core</a></li>
                    <li><a href="#product" className="hover:text-white transition-colors">Press & Media</a></li>
                    <li><a href="#how" className="hover:text-white transition-colors">Changelog</a></li>
                  </ul>
                </div>

                {/* ACCESS & LEGAL */}
                <div>
                  <h4 className="font-semibold text-white tracking-tight mb-4">Connect</h4>
                  <ul className="space-y-3 font-normal text-zinc-400">
                    <li><button type="button" onClick={() => router.push("/login")} className="hover:text-white transition-colors">Log In</button></li>
                    <li><button type="button" onClick={createDesign} className="hover:text-white transition-colors">Get Started</button></li>
                    <li><a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">X (Twitter)</a></li>
                    <li><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a></li>
                    <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* BOTTOM BAR */}
            <div className="mt-16 flex flex-col items-center justify-between border-t border-white/[0.08] pt-8 text-[12px] text-zinc-500 sm:flex-row">
              <div className="flex items-center gap-6">
                <span>© {new Date().getFullYear()} Falcon Studio Inc. All rights reserved.</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">Privacy Policy</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">Terms of Service</span>
              </div>
              <div className="mt-4 sm:mt-0 font-mono text-[10px] tracking-widest text-zinc-500">
                PURPOSE → DESIGN → INTELLIGENCE
              </div>
            </div>
          </div>
        </footer>

        <div className="fixed bottom-5 left-5 z-[90] flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.12] bg-black/80 font-serif text-sm text-zinc-400">
          N
        </div>
      </main>

      {/* =========================================================
          LAYOUT SELECTOR MODAL
          ========================================================= */}
      {layoutModalOpen && (
        <LayoutSelectorModal
          title={
            pendingTemplate
              ? `Select layout for "${pendingTemplate.name}"`
              : "Choose your poster layout"
          }
          currentLayoutName={
            pendingTemplate
              ? pendingTemplate.width === 1080 && pendingTemplate.height === 1080
                ? "Instagram Post (Square)"
                : pendingTemplate.width === 1080 && pendingTemplate.height === 1920
                ? "Story / Vertical Poster"
                : pendingTemplate.width === 1920 && pendingTemplate.height === 1080
                ? "Presentation / Banner (16:9)"
                : "Portrait Poster"
              : undefined
          }
          onSelect={handleLayoutConfirm}
          onClose={() => {
            setLayoutModalOpen(false);
            setPendingTemplate(null);
          }}
        />
      )}
    </>
  );
}

/* =========================================================
   BLUE LASER ELEMENT
   ========================================================= */

function LaserBorder() {
  return (
    <div
      className="falcon-laser-border"
      aria-hidden="true"
    >
      <span className="falcon-laser-beam falcon-laser-top" />

      <span className="falcon-laser-beam falcon-laser-right" />

      <span className="falcon-laser-beam falcon-laser-bottom" />

      <span className="falcon-laser-beam falcon-laser-left" />
    </div>
  );
}

/* =========================================================
   SYSTEM CARD
   ========================================================= */

function SystemCard({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative flex min-h-[500px] flex-col border-b border-white/[0.08] bg-[#000000] p-7 transition-all duration-300 hover:bg-[#0a0a0a] md:border-r md:last:border-r-0 xl:border-b-0">
      {/* TOP HEADER */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] tracking-[0.22em] text-zinc-500 uppercase font-medium">
          {number} // ARCHITECTURE
        </span>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition-all duration-200 group-hover:border-white/[0.18] group-hover:bg-white/[0.06] group-hover:text-white">
          {icon}
        </div>
      </div>

      {/* TITLE & DESCRIPTION */}
      <div className="mt-7">
        <h3 className="text-[22px] font-semibold leading-[1.18] text-white tracking-[-0.02em]">
          {title}
        </h3>

        <p className="mt-3 text-[13px] leading-relaxed text-zinc-400">
          {description}
        </p>
      </div>

      {/* DATA SPECIMEN */}
      <div className="my-7 flex-1">
        {number === "01" && (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 font-mono text-[9px] text-zinc-500">
              <span>MANIFEST // BRIEF</span>
              <span className="text-blue-400 font-semibold">PR-01</span>
            </div>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">OBJECTIVE</span>
                <span className="text-zinc-200 font-medium">Exhibition Launch</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">AUDIENCE</span>
                <span className="text-zinc-300">Design Directors</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">AESTHETIC</span>
                <span className="text-blue-300">Avant-Garde Luxury</span>
              </div>
            </div>
            <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between font-mono text-[9px]">
              <span className="text-zinc-500">TOKEN WEIGHT</span>
              <span className="text-emerald-400 font-medium">100% Calibrated</span>
            </div>
          </div>
        )}

        {number === "02" && (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 font-mono text-[9px] text-zinc-500">
              <span>OPTICAL HIERARCHY SCAN</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                OPTIMAL
              </span>
            </div>
            <div className="space-y-2 font-mono text-[10px]">
              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Primary Eyeline Balance</span>
                  <span className="text-white font-semibold">0.98 ratio</span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-[96%]" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                <span className="text-zinc-500">BASELINE RHYTHM</span>
                <span className="text-zinc-300">8pt Strict Grid</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">WCAG CONTRAST</span>
                <span className="text-cyan-300 font-semibold">14.2:1 (AAA)</span>
              </div>
            </div>
          </div>
        )}

        {number === "03" && (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 font-mono text-[9px] text-zinc-500">
              <span>BRAND DNA // HARMONY</span>
              <span className="text-blue-400 font-semibold">CURATED</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 py-1">
              <div className="text-center">
                <div className="h-7 rounded border border-white/[0.1] bg-[#000000]" />
                <span className="mt-1 block font-mono text-[7px] text-zinc-500">#000000</span>
              </div>
              <div className="text-center">
                <div className="h-7 rounded border border-white/[0.1] bg-[#111111]" />
                <span className="mt-1 block font-mono text-[7px] text-zinc-500">#111111</span>
              </div>
              <div className="text-center">
                <div className="h-7 rounded border border-white/[0.1] bg-[#0070f3]" />
                <span className="mt-1 block font-mono text-[7px] text-zinc-500">#0070F3</span>
              </div>
              <div className="text-center">
                <div className="h-7 rounded border border-white/[0.1] bg-[#ededed]" />
                <span className="mt-1 block font-mono text-[7px] text-zinc-500">#EDEDED</span>
              </div>
            </div>
            <div className="pt-1.5 border-t border-white/[0.04] flex items-center justify-between font-mono text-[9px]">
              <span className="text-zinc-500">TYPE PAIRING</span>
              <span className="text-zinc-200">Plus Jakarta + Mono</span>
            </div>
          </div>
        )}

        {number === "04" && (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 font-mono text-[9px] text-zinc-500">
              <span>ADAPTIVE SYSTEM // OUTPUTS</span>
              <span className="text-white font-semibold">VECTOR</span>
            </div>
            <div className="flex items-end justify-center gap-3 py-1 h-14">
              <div className="flex flex-col items-center gap-1">
                <div className="w-5 h-10 rounded-sm border border-white/[0.15] bg-white/[0.04] flex items-center justify-center font-mono text-[7px] text-zinc-300 font-bold">
                  9:16
                </div>
                <span className="font-mono text-[7px] text-zinc-500">Vertical</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-sm border border-white/[0.15] bg-white/[0.04] flex items-center justify-center font-mono text-[7px] text-zinc-300 font-bold">
                  1:1
                </div>
                <span className="font-mono text-[7px] text-zinc-500">Feed</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-7 rounded-sm border border-blue-400/30 bg-blue-500/10 flex items-center justify-center font-mono text-[7px] text-blue-300 font-bold">
                  16:9
                </div>
                <span className="font-mono text-[7px] text-zinc-500">Display</span>
              </div>
            </div>
            <div className="pt-1.5 border-t border-white/[0.04] flex items-center justify-between font-mono text-[9px] text-zinc-500">
              <span>VECTOR SCALING</span>
              <span className="text-emerald-400 font-medium">Lossless · Infinite DPI</span>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] pt-4">
        <span className="h-px w-8 bg-white/20 transition-all duration-300 group-hover:w-14 group-hover:bg-white/50" />

        <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 transition-colors group-hover:text-white">
          <span>Explore architecture</span>
          <ArrowUpRight
            size={12}
            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PROCESS CARD
   ========================================================= */

function ProcessCard({
  number,
  icon,
  title,
  description,
  step,
}: {
  number: string;
  icon: ReactNode;
  title: string;
  description: string;
  step: "define" | "generate" | "improve" | "remix";
}) {
  return (
    <div className="group relative flex min-h-[440px] flex-col rounded-xl border border-white/[0.08] bg-[#000000] p-6 transition-all duration-300 hover:border-white/[0.18] hover:bg-[#0a0a0a]">
      {/* TOP HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition-all duration-200 group-hover:border-white/[0.2] group-hover:text-white">
          {icon}
        </div>

        <span className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 font-mono text-[9px] font-semibold tracking-widest text-zinc-400 uppercase">
          {number}
        </span>
      </div>

      {/* TITLE & DESCRIPTION */}
      <div className="mt-6 space-y-2">
        <h3 className="text-[22px] font-semibold leading-[1.16] text-white tracking-[-0.02em]">
          {title}
        </h3>
        <p className="text-[13px] leading-relaxed text-zinc-400">
          {description}
        </p>
      </div>

      {/* MICRO-MOCKUP */}
      <div className="my-6 flex-1">
        {step === "define" && (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2.5">
            <div className="flex items-center justify-between font-mono text-[9px]">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                Creative Brief
              </span>
              <span className="text-zinc-500">Structured</span>
            </div>
            <div className="rounded-lg border border-white/[0.07] bg-black/60 px-3 py-2 font-mono text-[10px] text-zinc-200">
              <span className="text-zinc-500">PROMPT: </span>&quot;Exhibition Poster · Avant-Garde&quot;
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["12-Col Grid", "1080×1350", "Serif Luxury"].map(tag => (
                <span key={tag} className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[8px] text-zinc-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {step === "generate" && (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between font-mono text-[9px]">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Sparkles size={10} className="text-white" />
                Multi-Direction Concepts
              </span>
              <span className="text-emerald-400 font-semibold">3 Variants</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="rounded border border-white/[0.2] bg-white/[0.06] p-1.5 text-center">
                <div className="h-9 rounded bg-white/[0.08] mb-1 flex items-center justify-center font-mono text-[8px] text-white font-bold">A</div>
                <span className="font-mono text-[8px] text-white font-semibold">Minimal</span>
              </div>
              <div className="rounded border border-white/[0.07] bg-white/[0.02] p-1.5 text-center opacity-50">
                <div className="h-9 rounded bg-white/[0.04] mb-1 flex items-center justify-center font-mono text-[8px] text-zinc-400">B</div>
                <span className="font-mono text-[8px] text-zinc-400">Editorial</span>
              </div>
              <div className="rounded border border-white/[0.07] bg-white/[0.02] p-1.5 text-center opacity-50">
                <div className="h-9 rounded bg-white/[0.04] mb-1 flex items-center justify-center font-mono text-[8px] text-zinc-400">C</div>
                <span className="font-mono text-[8px] text-zinc-400">Brutalist</span>
              </div>
            </div>
          </div>
        )}

        {step === "improve" && (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
            <div className="flex items-center justify-between font-mono text-[9px]">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Zap size={10} />
                Design Coach
              </span>
              <span className="rounded border border-emerald-400/30 bg-emerald-400/10 px-1.5 py-0.5 font-bold text-emerald-400 text-[9px]">98/100</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between font-mono text-[9px] text-zinc-400 mb-1">
                  <span>Visual Hierarchy</span>
                  <span className="text-white font-semibold">Optimal</span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-white to-zinc-400 w-[96%]" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] font-mono text-[9px]">
                <span className="flex items-center gap-1 text-zinc-400">
                  <ShieldCheck size={10} className="text-emerald-400" />
                  Contrast Ratio
                </span>
                <span className="text-emerald-400 font-semibold">AAA (7.8:1)</span>
              </div>
            </div>
          </div>
        )}

        {step === "remix" && (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2.5">
            <div className="flex items-center justify-between font-mono text-[9px]">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <RefreshCw size={10} />
                Responsive Adaptation
              </span>
              <span className="text-white font-semibold">1-Click</span>
            </div>
            <div className="flex items-end justify-center gap-3 py-2">
              <div className="flex flex-col items-center gap-1">
                <div className="w-6 h-10 rounded border border-white/[0.12] bg-white/[0.04] flex items-center justify-center font-mono text-[7px] text-zinc-300">9:16</div>
                <span className="font-mono text-[8px] text-zinc-500">Story</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded border border-white/[0.18] bg-white/[0.06] flex items-center justify-center font-mono text-[7px] text-white font-bold">1:1</div>
                <span className="font-mono text-[8px] text-zinc-400">Post</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-7 rounded border border-white/[0.12] bg-white/[0.04] flex items-center justify-center font-mono text-[7px] text-zinc-300">16:9</div>
                <span className="font-mono text-[8px] text-zinc-500">Banner</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] pt-4">
        <span className="h-px w-8 bg-white/20 transition-all duration-300 group-hover:w-14 group-hover:bg-white/60" />
        <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-500 transition-colors group-hover:text-white">
          <span>Explore step</span>
          <ArrowUpRight size={12} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   SCORE ROW
   ========================================================= */

function ScoreRow({
  label,
  score,
  detail,
}: {
  label: string;
  score: number;
  detail?: string;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-medium text-zinc-200">
            {label}
          </span>
          {detail && (
            <span className="font-mono text-[8px] tracking-wider text-zinc-500 uppercase hidden sm:inline">
              · {detail}
            </span>
          )}
        </div>

        <span className="font-mono text-[10px] font-bold text-[#2F81FF]">
          {score}%
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#2F81FF] shadow-[0_0_8px_rgba(47,129,255,0.4)] transition-all duration-700"
          style={{
            width: `${score}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   DNA ROW
   ========================================================= */

function DnaRow({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-blue-400/[0.08] py-5">
      <span className="text-[13px] text-zinc-500">
        {title}
      </span>

      <span className="font-mono text-[8px] tracking-[0.15em] text-zinc-700">
        {number}
      </span>
    </div>
  );
}

/* =========================================================
   TEMPLATE CARD
   ========================================================= */

function TemplateCard({
  category,
  title,
  variant,
  imageUrl,
  onClick,
}: {
  category: string;
  title: string;
  variant: "warm" | "cool" | "neutral";
  imageUrl: string;
  onClick: () => void;
}) {
  const gradientOverlay =
    variant === "warm"
      ? "from-[#07080c]/95 via-[#080b14]/80 to-[#12223c]/40"
      : variant === "cool"
      ? "from-[#07080c]/95 via-[#080d16]/80 to-[#0e2c4a]/40"
      : "from-[#07080c]/95 via-[#090b10]/80 to-[#182332]/40";

  return (
    <button
      type="button"
      onClick={onClick}
      className="falcon-laser group relative flex min-h-[460px] cursor-pointer flex-col overflow-hidden border border-blue-400/[0.13] bg-[#07080c] text-left transition-all duration-500 hover:-translate-y-1.5 hover:border-blue-400/40 hover:shadow-[0_16px_40px_-12px_rgba(25,115,255,0.22)] focus:outline-none focus:ring-2 focus:ring-blue-400/30"
    >
      {/* REAL IMAGE BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.dataset.fallback) {
              target.dataset.fallback = "true";
              target.src = `https://picsum.photos/seed/${title.toLowerCase().replace(/\s+/g, "-")}/900/1200`;
            }
          }}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 opacity-45 group-hover:opacity-65 filter saturate-[1.1]"
        />
        {/* Soft Vignette and Tint Overlays for Contrast & Luxury Look */}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${gradientOverlay} transition-opacity duration-500`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_20%,rgba(6,8,12,0.85)_100%)]" />
      </div>

      <LaserBorder />

      {/* TOP HEADER */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <span className="font-mono text-[8px] tracking-[0.2em] text-blue-300/80 font-medium uppercase drop-shadow-sm">
          {category}
        </span>

        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 border border-blue-400/20 backdrop-blur-md transition-all duration-300 group-hover:bg-blue-500/25 group-hover:border-blue-400/40">
          <ArrowUpRight
            size={14}
            className="text-blue-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
          />
        </div>
      </div>

      {/* TITLE */}
      <div className="relative z-10 flex flex-1 items-center px-7">
        <h3 className="max-w-[300px] font-serif text-[34px] leading-[1.02] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:translate-x-1">
          {title}
        </h3>
      </div>

      {/* FOOTER */}
      <div className="relative z-10 border-t border-blue-400/[0.12] bg-[#07080c]/60 backdrop-blur-md px-6 py-4.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[8px] tracking-[0.16em] text-zinc-400">
            FALCON / CREATIVE
          </span>

          <span className="flex items-center gap-1.5 text-[11px] font-medium text-blue-300 transition-colors group-hover:text-white">
            Open
            <ArrowUpRight size={12} />
          </span>
        </div>
      </div>
    </button>
  );
}

/* =========================================================
   FORMAT TAG
   ========================================================= */

function FormatTag({
  text,
  className,
}: {
  text: string;
  className: string;
}) {
  return (
    <span
      className={`absolute rounded-sm border border-blue-400/[0.13] bg-[#111] px-4 py-2 font-mono text-[7px] tracking-[0.16em] text-zinc-600 ${className}`}
    >
      {text}
    </span>
  );
}