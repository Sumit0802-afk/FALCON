import { apiFetch } from "./api";

/** One design as AI Studio describes it. Sent back unchanged to open that design. */
export type AiDesignSpec = Record<string, unknown> & { name: string; title: string };

export interface AiDesign {
  spec: AiDesignSpec;
  name: string;
  /** Which direction this option answers: modern, premium, bold or creative */
  direction?: string;
  width: number;
  height: number;
  /** A preview of the page as SVG markup, made by Falcon's own server */
  preview: string;
}

export interface AiDesignSize {
  id: string;
  name: string;
  width: number;
  height: number;
}

/** The formats AI Studio can design for. Mirrors the server's list, so the page can show them at once. */
export const AI_SIZES: { id: string; label: string }[] = [
  { id: "portrait-4x5", label: "Instagram post" },
  { id: "square", label: "Square" },
  { id: "story", label: "Story" },
  { id: "a4", label: "A4 poster" },
  { id: "a3", label: "A3 poster" },
  { id: "landscape", label: "LinkedIn / banner" },
  { id: "youtube", label: "YouTube thumbnail" },
  { id: "presentation", label: "Presentation 16:9" },
];

/** Asks for design options for a written request */
export function generateAiDesigns(input: { prompt: string; size: string; image: boolean; count?: number }): Promise<{ designs: AiDesign[]; imageMade: boolean; size: string }> {
  return apiFetch("/ai/designs", { method: "POST", body: JSON.stringify({ count: 4, ...input }) });
}

/** The same content in new looks: the words and pictures stay, the style, layout and colours change */
export function varyAiDesign(spec: AiDesignSpec, size: string): Promise<{ designs: AiDesign[] }> {
  return apiFetch("/ai/designs/variations", { method: "POST", body: JSON.stringify({ spec, size, count: 4 }) });
}

/** The same designs set out again for another format */
export function resizeAiDesigns(specs: AiDesignSpec[], size: string): Promise<{ designs: AiDesign[] }> {
  return apiFetch("/ai/designs/resize", { method: "POST", body: JSON.stringify({ specs, size }) });
}

/** Saves the chosen design as a project of the signed-in user */
export function openAiDesign(spec: AiDesignSpec, size: string): Promise<{ projectId: string }> {
  return apiFetch("/ai/designs/use", { method: "POST", body: JSON.stringify({ spec, size }) });
}
