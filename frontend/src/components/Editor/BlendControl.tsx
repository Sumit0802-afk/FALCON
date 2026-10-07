import React from "react";
import { ChevronDown, Layers, RotateCcw } from "lucide-react";
import type { CanvasElement } from "@/types";
import { BLEND_MASKS, BLEND_MODES, BlendMask, blendMaskOf, blendSoftnessOf, hasBlend } from "@/utils/blend";

interface BlendControlProps {
  element: CanvasElement;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onChange: (patch: Partial<CanvasElement>) => void;
}

/** A small picture of what each fade does: solid where the image stays, clear where it fades out */
function maskSwatch(mask: BlendMask): React.CSSProperties {
  const ink = "rgba(129,140,248,0.95)";
  if (mask === "none") return { background: ink };
  if (mask === "circular") return { background: `radial-gradient(ellipse closest-side, ${ink} 35%, transparent 100%)` };
  const to = { "linear-bottom": "to bottom", "linear-top": "to top", "linear-left": "to left", "linear-right": "to right" }[mask as string] || "to bottom";
  return { background: `linear-gradient(${to}, ${ink} 30%, transparent 100%)` };
}

/**
 * The Blend button of the image toolbar and its panel: a fade towards an edge
 * (or all round) with adjustable softness, and a blend mode that mixes the
 * image with whatever lies under it.
 */
export function BlendControl({ element, open, onToggle, onClose, onChange }: BlendControlProps) {
  const mask = blendMaskOf(element);
  const softness = blendSoftnessOf(element);
  const mode = element.blendMode || "normal";
  const active = hasBlend(element);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        title="Fade the image or blend it with what is underneath"
        className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${
          active ? "border border-indigo-500/50 bg-indigo-600/30 text-indigo-200" : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
        }`}
      >
        <Layers size={13} className="text-indigo-400" />
        <span>Blend</span>
        <ChevronDown size={11} className="text-zinc-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <div className="absolute left-0 top-full z-50 mt-2 w-[296px] rounded-2xl border border-white/10 bg-[#161a24] p-3 shadow-2xl backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Fade</p>
              <button
                type="button"
                onClick={() => onChange({ blendMask: "none", blendMode: "normal", blendSoftness: undefined })}
                disabled={!active}
                className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-zinc-400 transition hover:text-white disabled:opacity-40"
              >
                <RotateCcw size={10} /> Reset
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {BLEND_MASKS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={mask === option.id}
                  onClick={() => onChange({ blendMask: option.id })}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 text-[11px] transition ${
                    mask === option.id ? "border-indigo-500 bg-indigo-500/15 text-indigo-200" : "border-white/10 text-zinc-400 hover:border-indigo-400/50 hover:text-white"
                  }`}
                >
                  <span className="block h-9 w-full overflow-hidden rounded-lg bg-zinc-800">
                    <span className="block h-full w-full" style={maskSwatch(option.id)} />
                  </span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>

            <label className={`mt-3 block ${mask === "none" ? "opacity-40" : ""}`}>
              <span className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Softness</span>
                <span className="font-mono text-zinc-300">{softness}%</span>
              </span>
              <input
                type="range"
                min={5}
                max={100}
                step={1}
                value={softness}
                disabled={mask === "none"}
                onChange={(e) => onChange({ blendSoftness: Number(e.target.value) })}
                aria-label="Fade softness"
                className="mt-1.5 w-full accent-indigo-500"
              />
            </label>

            <p className="mb-2 mt-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Blend mode</p>
            <div className="grid grid-cols-3 gap-1.5">
              {BLEND_MODES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={mode === option.id}
                  onClick={() => onChange({ blendMode: option.id })}
                  className={`rounded-lg border px-1.5 py-1.5 text-[11px] transition ${
                    mode === option.id ? "border-indigo-500 bg-indigo-500/15 text-indigo-200" : "border-white/10 text-zinc-400 hover:border-indigo-400/50 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-[10px] leading-relaxed text-zinc-500">
              A blend mode mixes the image with the layers and background beneath it. Place it over a colour or photo to see the effect.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
