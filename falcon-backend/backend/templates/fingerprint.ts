import { createHash } from "crypto";

function round(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 10) / 10;
}

export function fingerprintDesign(input: {
  width: number;
  height: number;
  background?: string;
  elements?: Array<Record<string, unknown>>;
  categorySlug?: string;
  subcategorySlug?: string;
}): string {
  const canonical = {
    w: input.width,
    h: input.height,
    bg: String(input.background || "").toLowerCase(),
    cat: input.categorySlug || "",
    sub: input.subcategorySlug || "",
    els: (input.elements || []).map((el) => ({
      t: el.type,
      x: round(el.x),
      y: round(el.y),
      w: round(el.width),
      h: round(el.height),
      r: round(el.rotation || 0),
      fill: el.fill || "",
      text: el.text || "",
      src: el.src || el.imageSrc || "",
      color: el.color || "",
    })),
  };

  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}
