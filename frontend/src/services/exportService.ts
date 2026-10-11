import { CanvasElement, DesignPage, isFrame, isImage, isShape, isText } from "@/types";
import { renderPageToDataUrl } from "@/utils/canvasExport";

function download(href: string, filename: string): void {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
}

function safeName(name: string): string {
  return (name || "design").replace(/[\\/:*?"<>|]+/g, " ").trim().slice(0, 80) || "design";
}

/** Draws a PNG data URL onto a white canvas and returns it as a JPEG (JPEG has no transparency) */
async function pngToJpeg(dataUrl: string, quality = 0.92): Promise<string> {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("The page could not be rendered"));
    image.src = dataUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * PowerPoint takes pictures as base64 PNG or JPEG. Shapes, stickers and other
 * artwork in Falcon are often SVG data, so those are drawn to a PNG first.
 */
async function pictureForPptx(src: string, width: number, height: number): Promise<{ data: string } | { path: string }> {
  if (!src.startsWith("data:")) return { path: src };
  if (/^data:image\/(png|jpe?g|gif);base64,/.test(src)) return { data: src };
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("The picture could not be read"));
    image.src = src;
  });
  // Twice the placed size keeps artwork crisp when the slide is shown large
  const scale = Math.min(2, 2400 / Math.max(width, height, 1));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return { data: canvas.toDataURL("image/png") };
}

// ─── Colour helpers for PowerPoint, which only takes plain hex colours ────────

let probe: CanvasRenderingContext2D | null = null;

/** Any CSS colour as { hex: "RRGGBB", alpha: 0..1 }; null for "no colour" */
function parseColor(value: string | undefined): { hex: string; alpha: number } | null {
  if (!value || value === "transparent" || value === "none") return null;
  if (!probe) probe = document.createElement("canvas").getContext("2d");
  if (!probe) return null;
  probe.fillStyle = "#000000";
  probe.fillStyle = value;
  const out = String(probe.fillStyle);
  if (out.startsWith("#")) return { hex: out.slice(1).toUpperCase(), alpha: 1 };
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(out);
  if (!m) return null;
  const hex = [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, "0")).join("").toUpperCase();
  const alpha = m[4] === undefined ? 1 : Number(m[4]);
  return alpha === 0 ? null : { hex, alpha };
}

/** The first colour of a CSS background, for a slide whose gradient PowerPoint cannot take as-is */
function firstColor(background: string): string {
  return /#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)/.exec(background)?.[0] || "#ffffff";
}

/** A gradient page background painted to an image, so the slide keeps its look */
async function backgroundImage(page: DesignPage): Promise<string> {
  return renderPageToDataUrl({ ...page, elements: [] });
}

export const exportService = {
  /** Triggers a browser download of the page as a PNG file. */
  async downloadAsPng(page: DesignPage, filename = "design.png"): Promise<void> {
    download(await renderPageToDataUrl(page), filename);
  },

  async downloadAsJpg(page: DesignPage, filename = "design.jpg"): Promise<void> {
    download(await pngToJpeg(await renderPageToDataUrl(page)), filename);
  },

  /** One PDF with a page per design page, each at the design's own proportions */
  async downloadAsPdf(pages: DesignPage[], title = "design"): Promise<void> {
    if (!pages.length) return;
    const { jsPDF } = await import("jspdf");
    let doc: InstanceType<typeof jsPDF> | null = null;
    for (const page of pages) {
      const { width, height } = page.size;
      const orientation = width >= height ? "landscape" : "portrait";
      if (!doc) doc = new jsPDF({ orientation, unit: "px", format: [width, height], hotfixes: ["px_scaling"], compress: true });
      else doc.addPage([width, height], orientation);
      const image = await pngToJpeg(await renderPageToDataUrl(page), 0.9);
      doc.addImage(image, "JPEG", 0, 0, width, height, undefined, "FAST");
    }
    doc?.save(`${safeName(title)}.pdf`);
  },

  /**
   * A PowerPoint file in which shapes, text and pictures are real, editable
   * PowerPoint objects rather than flat images of each slide.
   */
  async downloadAsPptx(pages: DesignPage[], title = "presentation"): Promise<void> {
    if (!pages.length) return;
    const PptxGen = (await import("pptxgenjs")).default;
    const pptx = new PptxGen();
    const { width: W, height: H } = pages[0].size;
    // 144 design pixels to the inch puts a 1920 x 1080 slide at PowerPoint's standard 13.33 x 7.5 in
    const PX = 144;
    pptx.defineLayout({ name: "FALCON", width: W / PX, height: H / PX });
    pptx.layout = "FALCON";
    pptx.title = title;

    for (const page of pages) {
      const slide = pptx.addSlide();
      if (page.background && page.background.includes("gradient")) {
        try {
          slide.background = { data: await backgroundImage(page) };
        } catch {
          slide.background = { color: parseColor(firstColor(page.background))?.hex || "FFFFFF" };
        }
      } else if (page.background && /^(https?:|data:)/.test(page.background)) {
        slide.background = { path: page.background };
      } else {
        slide.background = { color: parseColor(page.background)?.hex || "FFFFFF" };
      }

      const ordered = [...page.elements].filter((el) => !el.hidden).sort((a, b) => a.zIndex - b.zIndex);
      for (const el of ordered as CanvasElement[]) {
        const box = { x: el.x / PX, y: el.y / PX, w: el.width / PX, h: el.height / PX, rotate: el.rotation || 0 };
        const fade = Math.round((1 - (el.opacity ?? 1)) * 100);

        if (isShape(el)) {
          const fill = parseColor(el.fill);
          const stroke = el.strokeWidth > 0 ? parseColor(el.stroke) : null;
          const shape = el.type === "ellipse" ? pptx.ShapeType.ellipse : el.cornerRadius ? pptx.ShapeType.roundRect : pptx.ShapeType.rect;
          slide.addShape(shape, {
            ...box,
            fill: fill ? { color: fill.hex, transparency: Math.min(100, fade + Math.round((1 - fill.alpha) * 100)) } : { type: "none" } as never,
            line: stroke ? { color: stroke.hex, width: Math.max(0.25, (el.strokeWidth / PX) * 72), transparency: fade } : { type: "none" } as never,
            ...(el.type === "rectangle" && el.cornerRadius ? { rectRadius: Math.min(0.5, el.cornerRadius / Math.min(el.width, el.height)) } : {}),
          });
        } else if (isText(el)) {
          const color = parseColor(el.color);
          const spacing = typeof el.letterSpacing === "number" ? el.letterSpacing : parseFloat(String(el.letterSpacing || 0)) || 0;
          slide.addText(el.text, {
            ...box,
            fontFace: el.fontFamily,
            fontSize: Math.max(1, Math.round((el.fontSize / PX) * 72 * 10) / 10),
            bold: el.fontWeight >= 600,
            italic: !!el.italic,
            color: color?.hex || "000000",
            transparency: fade,
            align: el.align,
            valign: "top",
            margin: 0,
            charSpacing: Math.round((spacing / PX) * 72 * 10) / 10,
            lineSpacingMultiple: el.lineHeight || 1.2,
            fit: "none",
            wrap: true,
          });
        } else if (isFrame(el) && el.imageSrc) {
          // PowerPoint has no free-form picture mask here; a round frame stays round and the rest become rectangles
          const picture = await pictureForPptx(el.imageSrc, el.width, el.height).catch(() => null);
          if (!picture) continue;
          slide.addImage({
            ...box, ...picture,
            sizing: { type: "cover", w: box.w, h: box.h }, rounding: el.frameShape === "circle", transparency: fade,
          });
        } else if (isImage(el) && el.src) {
          const picture = await pictureForPptx(el.src, el.width, el.height).catch(() => null);
          if (picture) slide.addImage({ ...box, ...picture, transparency: fade });
        }
      }
    }
    await pptx.writeFile({ fileName: `${safeName(title)}.pptx` });
  },

  /** Serializes the page to a JSON file the user can re-import later. */
  downloadAsJson(page: DesignPage, filename = "design.json"): void {
    const blob = new Blob([JSON.stringify(page, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    download(url, filename);
    URL.revokeObjectURL(url);
  },

  /** Produces a lightweight thumbnail data URL for the project gallery. */
  async generateThumbnail(page: DesignPage): Promise<string> {
    return renderPageToDataUrl(page);
  },
};
