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
  /** The pages after the first, for a design of several: a presentation's slides */
  slides?: { name: string; preview: string }[];
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

// ─── AI Studio: reference, request, artwork ───────────────────────────────────

export type StudioStrength = "creative" | "balanced" | "strong" | "exact";
export type StudioUsage = "full" | "composition" | "style" | "colors" | "typography";
export type StudioDensity = "low" | "medium" | "high" | "ultra";
export type StudioLevel = "low" | "medium" | "high";
export type StudioRole = "full" | "layout" | "color" | "typography" | "hero";

export interface StudioSettings {
  strength: StudioStrength;
  usage: StudioUsage;
  density: StudioDensity;
  creativity: StudioLevel;
  typographyFidelity: StudioLevel;
  layoutFidelity: StudioLevel;
  colorFidelity: StudioLevel;
  detail: StudioDensity;
  quality: "standard" | "high";
  variations: number;
}

export const STUDIO_DEFAULTS: StudioSettings = {
  strength: "strong", usage: "full", density: "medium", creativity: "medium",
  typographyFidelity: "high", layoutFidelity: "high", colorFidelity: "high", detail: "high", quality: "high", variations: 1,
};

/** What was seen in a reference picture */
export interface StudioAnalysis {
  summary: string;
  format: string;
  subject: string;
  artDirection: string;
  layout: Record<string, string>;
  typography: { headline: string; category: string; weight: string; width: string; letterCase: string; spacing: string; hierarchy: string; treatments: string[] };
  color: Record<"primary" | "secondary" | "accent" | "background" | "text" | "glow", string[]>;
  effects: string[];
  lighting: string;
  background: string;
  border: string;
  icons: string;
  texture: string;
  density: { level: StudioDensity; emptySpace: number; decoration: StudioLevel; text: StudioLevel; objects: StudioLevel; background: StudioLevel };
  wording: string[];
}

/** The look kept from one generation to the next */
export type StudioDna = Record<string, unknown> & { palette: string[]; density: StudioDensity };

/** What the person asked to appear, taken only from their own words */
export type StudioContent = Record<string, unknown> & { title: string };

export interface StudioReference {
  image: string;
  role: StudioRole;
}

export interface StudioArtwork {
  url: string;
  width: number;
  height: number;
}

export interface StudioFidelity {
  score: number;
  parts: Record<string, number>;
  checks: { label: string; passed: boolean }[];
  refine: string;
}

/** Whether a finished artwork can be made on this server right now */
export function getStudioStatus(): Promise<{ artwork: boolean; configured: boolean; reason?: string }> {
  return apiFetch("/ai/studio/status");
}

export function analyzeReferences(references: StudioReference[]): Promise<{ analysis: StudioAnalysis; dna: StudioDna; defaults: StudioSettings }> {
  return apiFetch("/ai/studio/analyze", { method: "POST", body: JSON.stringify({ references }) });
}

/** Reads the request for its content and puts the generation prompt together */
export function compileStudioPrompt(input: { prompt: string; size: string; analysis: StudioAnalysis | null; dna: StudioDna | null; settings: StudioSettings }): Promise<{ content: StudioContent; compiled: string; negatives: string[]; settings: StudioSettings; notes: string[] }> {
  return apiFetch("/ai/studio/compile", { method: "POST", body: JSON.stringify(input) });
}

/** Makes one finished artwork. With `base`, works from an earlier result so it stays the same design */
export function makeStudioArtwork(input: { compiled: string; size: string; references: StudioReference[]; base?: string; instruction?: string }): Promise<StudioArtwork> {
  return apiFetch("/ai/studio/artwork", { method: "POST", body: JSON.stringify(input) });
}

export function evaluateStudioArtwork(input: { reference: string; result: string; content: StudioContent }): Promise<StudioFidelity> {
  return apiFetch("/ai/studio/evaluate", { method: "POST", body: JSON.stringify(input) });
}

/** An editable design from Falcon's layout engine, for when no artwork can be made */
export function makeStudioLayout(input: { prompt: string; size: string; content: StudioContent; analysis: StudioAnalysis | null; settings: StudioSettings; count: number; keep?: AiDesignSpec }): Promise<{ designs: AiDesign[] }> {
  return apiFetch("/ai/studio/layout", { method: "POST", body: JSON.stringify(input) });
}

/** Saves a finished artwork as a project, so it opens in the editor */
export function openStudioArtwork(input: { url: string; size: string; title: string }): Promise<{ projectId: string }> {
  return apiFetch("/ai/studio/open", { method: "POST", body: JSON.stringify(input) });
}
