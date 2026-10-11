import { apiFetch } from "./api";

export interface PortraitStyle {
  id: string;
  name: string;
  /** Whether this server can make it right now */
  available: boolean;
  /** Which of the small previews shows this style, for styles that have one */
  preview?: string;
}

export interface PortraitCatalogue {
  groups: { name: string; styles: PortraitStyle[] }[];
  tools: PortraitStyle[];
  /** "any" when a written description can ask for anything, "styles" when it is matched to the styles on offer */
  describe: "any" | "styles";
}

export interface PortraitResult {
  url: string;
  width: number;
  height: number;
  variation: number;
}

export interface PortraitRun {
  style: { id: string; name: string };
  /** The untouched picture at the same size as the results, for comparing and blending */
  original: string;
  results: PortraitResult[];
}

export function getPortraitCatalogue(): Promise<PortraitCatalogue> {
  return apiFetch("/ai/portrait/styles");
}

/** A small picture of each look that can be previewed, made from the user's own image */
export async function getPortraitPreviews(image: string, signal?: AbortSignal): Promise<Record<string, string>> {
  return (await apiFetch<{ previews: Record<string, string> }>("/ai/portrait/previews", { method: "POST", body: JSON.stringify({ image }), signal })).previews;
}

export function runPortrait(input: { image: string; style?: string; description?: string; count?: number }): Promise<PortraitRun> {
  return apiFetch("/ai/portrait", { method: "POST", body: JSON.stringify({ count: 4, ...input }) });
}

/** The original and a result mixed together: 0 is the original, 100 the full result */
export function blendPortrait(original: string, result: string, strength: number): Promise<PortraitResult> {
  return apiFetch("/ai/portrait/blend", { method: "POST", body: JSON.stringify({ original, result, strength }) });
}

/**
 * Reads a picture on the canvas into a data address the server can work on,
 * scaled down if it is very large. Fails when the picture's host does not
 * allow other sites to read it.
 */
export async function readPicture(src: string, maxSide = 1400): Promise<string> {
  const response = await fetch(src, { mode: "cors" });
  if (!response.ok) throw new Error("unreadable");
  const bitmap = await createImageBitmap(await response.blob());
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("unreadable");
  // A white ground, so see-through areas do not turn black when saved as JPEG
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

/** Puts a cut-out picture on a plain colour */
export async function onBackground(cutout: string, color: string): Promise<string> {
  const image = new Image();
  image.src = cutout;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("unreadable");
  context.fillStyle = color;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.92);
}
