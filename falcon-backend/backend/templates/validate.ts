import { AppError } from "../utils/AppError";
import { TemplatePageData } from "./clone";

const ALLOWED_TYPES = new Set([
  "rectangle",
  "ellipse",
  "text",
  "image",
  "line",
  "group",
  "frame",
]);

export function parseDesignData(raw: unknown): TemplatePageData {
  let data = raw;
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw);
    } catch {
      throw AppError.badRequest("designData must be valid JSON");
    }
  }

  if (!data || typeof data !== "object") {
    throw AppError.badRequest("designData is required");
  }

  const page = data as Record<string, unknown>;
  const size = (page.size as Record<string, unknown>) || {};
  const width = Number(page.width ?? size.width);
  const height = Number(page.height ?? size.height);
  const elements = page.elements;

  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
    throw AppError.badRequest("designData must include positive width and height");
  }
  if (!Array.isArray(elements) || elements.length === 0) {
    throw AppError.badRequest("designData.elements must be a non-empty array");
  }

  for (const el of elements) {
    if (!el || typeof el !== "object") {
      throw AppError.badRequest("Each element must be an object");
    }
    const item = el as Record<string, unknown>;
    if (!item.id || typeof item.id !== "string") {
      throw AppError.badRequest("Each element requires an id");
    }
    if (!ALLOWED_TYPES.has(String(item.type))) {
      throw AppError.badRequest(`Unsupported element type: ${String(item.type)}`);
    }
  }

  const background = String(page.background || "#FFFFFF");
  const name = String(page.name || "Page 1");
  const presetName = String(size.name || page.presetName || "Custom");

  return {
    id: String(page.id || "template-page"),
    name,
    size: { name: presetName, width, height },
    background,
    elements: elements as TemplatePageData["elements"],
  };
}
