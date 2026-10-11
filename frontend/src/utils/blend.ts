import type { CanvasElement } from "@/types";

/** How an element fades out towards an edge, or all round */
export type BlendMask = NonNullable<CanvasElement["blendMask"]>;

export const BLEND_MASKS: { id: BlendMask; label: string }[] = [
  { id: "none", label: "None" },
  { id: "circular", label: "Round" },
  { id: "linear-bottom", label: "Fade down" },
  { id: "linear-top", label: "Fade up" },
  { id: "linear-left", label: "Fade left" },
  { id: "linear-right", label: "Fade right" },
];

/** How an element's colours combine with what is underneath it */
export const BLEND_MODES: { id: string; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "multiply", label: "Multiply" },
  { id: "screen", label: "Screen" },
  { id: "overlay", label: "Overlay" },
  { id: "soft-light", label: "Soft light" },
  { id: "hard-light", label: "Hard light" },
  { id: "darken", label: "Darken" },
  { id: "lighten", label: "Lighten" },
  { id: "color-dodge", label: "Dodge" },
  { id: "color-burn", label: "Burn" },
  { id: "difference", label: "Difference" },
  { id: "luminosity", label: "Luminosity" },
];

export const DEFAULT_BLEND_SOFTNESS = 65;

/** "linear" is the older name for a fade towards the bottom */
export function blendMaskOf(el: Pick<CanvasElement, "blendMask">): BlendMask {
  const mask = el.blendMask ?? "none";
  return mask === "linear" ? "linear-bottom" : mask;
}

/** How much of the element the fade covers, from 5 (a thin soft edge) to 100 (fading from the very start) */
export function blendSoftnessOf(el: Pick<CanvasElement, "blendSoftness">): number {
  const value = typeof el.blendSoftness === "number" ? el.blendSoftness : DEFAULT_BLEND_SOFTNESS;
  return Math.min(100, Math.max(5, value));
}

const DIRECTION: Partial<Record<BlendMask, string>> = {
  "linear-bottom": "to bottom",
  "linear-top": "to top",
  "linear-left": "to left",
  "linear-right": "to right",
};

/** The CSS mask for an element's fade, or nothing when it has none */
export function blendMaskCss(el: Pick<CanvasElement, "blendMask" | "blendSoftness">): string | undefined {
  const mask = blendMaskOf(el);
  if (mask === "none") return undefined;
  const solid = 100 - blendSoftnessOf(el);
  if (mask === "circular") return `radial-gradient(ellipse closest-side, #000 ${solid}%, transparent 100%)`;
  return `linear-gradient(${DIRECTION[mask]}, #000 ${solid}%, transparent 100%)`;
}

/** Does this element blend or fade at all? */
export function hasBlend(el: Pick<CanvasElement, "blendMask" | "blendMode">): boolean {
  return blendMaskOf(el) !== "none" || (!!el.blendMode && el.blendMode !== "normal");
}
