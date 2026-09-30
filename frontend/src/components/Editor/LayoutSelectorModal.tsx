import { useState } from "react";
import {
  X,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import { PageSize } from "@/types";

/* ============================================================
   LAYOUT PRESET AUGMENTATION — icons + descriptions
   ============================================================ */

interface LayoutPreset extends PageSize {
  description: string;
  aspect: string;
  popular?: boolean;
}

const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    name: "Portrait Poster",
    width: 1080,
    height: 1440,
    description: "Ideal for event posters, party invitations & print",
    aspect: "3:4",
    popular: true,
  },
  {
    name: "Instagram Post (Square)",
    width: 1080,
    height: 1080,
    description: "Perfect for social media posts & ads",
    aspect: "1:1",
    popular: true,
  },
  {
    name: "Story / Vertical Poster",
    width: 1080,
    height: 1920,
    description: "Tall format for stories, Reels & vertical banners",
    aspect: "9:16",
  },
  {
    name: "Marketing Flyer (4:5)",
    width: 1080,
    height: 1350,
    description: "Great for promotional flyers & catalog pages",
    aspect: "4:5",
  },
  {
    name: "Presentation / Banner (16:9)",
    width: 1920,
    height: 1080,
    description: "Widescreen slides, banners & web covers",
    aspect: "16:9",
  },
  {
    name: "A4 Document / Print",
    width: 1240,
    height: 1754,
    description: "Standard document & printable format",
    aspect: "A4",
  },
  {
    name: "YouTube Thumbnail",
    width: 1280,
    height: 720,
    description: "Optimized for YouTube video thumbnails",
    aspect: "16:9",
  },
];

/* ============================================================
   PROPS
   ============================================================ */

interface LayoutSelectorModalProps {
  title: string;
  /** Optional current layout name (for editor change-layout mode) */
  currentLayoutName?: string;
  onSelect: (size: PageSize) => void;
  onClose: () => void;
}

/* helper: scale a layout rect to fit a box */
function previewDims(preset: LayoutPreset, maxW: number, maxH: number) {
  const scale = Math.min(maxW / preset.width, maxH / preset.height);
  return {
    w: Math.round(preset.width * scale),
    h: Math.round(preset.height * scale),
  };
}

/* ============================================================
   COMPONENT
   ============================================================ */

export function LayoutSelectorModal({
  title,
  currentLayoutName,
  onSelect,
  onClose,
}: LayoutSelectorModalProps) {
  const [selected, setSelected] = useState<string>(
    currentLayoutName || LAYOUT_PRESETS[0].name
  );

  const selectedPreset =
    LAYOUT_PRESETS.find((p) => p.name === selected) || LAYOUT_PRESETS[0];

  function handleConfirm() {
    onSelect({
      name: selectedPreset.name,
      width: selectedPreset.width,
      height: selectedPreset.height,
    });
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <style>{`
        @keyframes layoutModalIn {
          from { opacity: 0; transform: scale(0.93) translateY(18px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .layout-modal-anim { animation: layoutModalIn 0.28s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <div
        className="layout-modal-anim relative flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0c0d10] shadow-[0_32px_96px_rgba(0,0,0,0.8)]"
        style={{ maxHeight: "90vh" }}
      >
        {/* ── Header ── */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-6 py-5">
          <div>
            <p className="font-mono text-[9px] tracking-[0.25em] uppercase text-zinc-600">
              Choose Layout
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#f4f1eb]">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.04] text-zinc-500 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Layout list */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {LAYOUT_PRESETS.map((preset) => {
                const isActive = selected === preset.name;
                const isCurrent = currentLayoutName === preset.name;
                const dims = previewDims(preset, 44, 44);

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setSelected(preset.name)}
                    className={`group relative flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 ${
                      isActive
                        ? "border-indigo-500/50 bg-indigo-500/[0.09] shadow-[0_0_0_1px_rgba(99,102,241,0.25)]"
                        : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04]"
                    }`}
                  >
                    {/* Mini canvas shape preview */}
                    <div
                      className="flex shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#1a1b1f]"
                      style={{ width: 56, height: 56 }}
                    >
                      <div
                        className={`rounded border transition-all ${
                          isActive
                            ? "border-indigo-400/50 bg-indigo-500/25"
                            : "border-white/10 bg-white/5"
                        }`}
                        style={{ width: dims.w, height: dims.h, minWidth: 10, minHeight: 10 }}
                      />
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`text-sm font-semibold leading-tight ${isActive ? "text-white" : "text-zinc-200"}`}
                        >
                          {preset.name}
                        </span>
                        {preset.popular && (
                          <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.5 font-mono text-[8px] font-medium text-indigo-300">
                            POPULAR
                          </span>
                        )}
                        {isCurrent && (
                          <span className="rounded-full bg-teal-500/20 px-1.5 py-0.5 font-mono text-[8px] font-medium text-teal-300">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-zinc-600">
                        {preset.description}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-zinc-700">
                        {preset.width} × {preset.height} px · {preset.aspect}
                      </p>
                    </div>

                    {/* Check indicator */}
                    {isActive && (
                      <CheckCircle2 size={18} className="shrink-0 text-indigo-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Right preview panel (desktop only) ── */}
          <div className="hidden w-60 shrink-0 flex-col items-center justify-center gap-6 border-l border-white/[0.07] bg-[#08090b] p-6 md:flex">
            {/* Canvas shape visualization */}
            <div
              className="flex items-center justify-center rounded-xl border border-indigo-500/[0.18] bg-indigo-500/[0.04]"
              style={{ width: 148, height: 148 }}
            >
              {(() => {
                const dims = previewDims(selectedPreset, 126, 126);
                return (
                  <div
                    className="rounded-lg border border-indigo-400/30 bg-gradient-to-br from-indigo-500/20 to-purple-500/10"
                    style={{ width: dims.w, height: dims.h }}
                  >
                    {/* grid texture */}
                    <div
                      className="h-full w-full rounded-lg opacity-20"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                        backgroundSize: "16px 16px",
                      }}
                    />
                  </div>
                );
              })()}
            </div>

            <div className="w-full space-y-3 text-center">
              <div>
                <p className="font-semibold text-zinc-200 text-sm">{selectedPreset.name}</p>
                <p className="mt-1 font-mono text-xs text-zinc-600">
                  {selectedPreset.width} × {selectedPreset.height}
                </p>
                <p className="font-mono text-[10px] text-zinc-700">
                  {selectedPreset.aspect} ratio
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <p className="text-xs leading-relaxed text-zinc-600">
                  {selectedPreset.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex shrink-0 items-center justify-between border-t border-white/[0.07] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm text-zinc-500 transition hover:border-white/20 hover:text-zinc-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="group flex items-center gap-2 rounded-xl bg-[#f4f1eb] px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-white active:scale-[0.98]"
          >
            {currentLayoutName ? "Apply Layout" : "Start Designing"}
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
