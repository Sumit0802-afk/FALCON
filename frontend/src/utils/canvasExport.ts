import {
  CanvasElement,
  DesignPage,
  ImageFilter,
  isImage,
  isShape,
  isText,
  isFrame,
} from "@/types";
import { getFrameById } from "@/data/frameDefinitions";
import { blendMaskOf, blendSoftnessOf, hasBlend } from "@/utils/blend";

/**
 * Rasterizes a design page to a PNG data URL by drawing every element
 * onto an offscreen <canvas>. Used for thumbnails and "Download as PNG".
 */
export async function renderPageToDataUrl(
  page: DesignPage
): Promise<string> {
  const canvas = document.createElement("canvas");

  canvas.width = page.size.width;
  canvas.height = page.size.height;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error(
      "Canvas 2D context is not available"
    );
  }

  /* Background */
  if (
    page.background &&
    (page.background.startsWith("http") || page.background.startsWith("data:"))
  ) {
    try {
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => {
        bgImg.onload = () => resolve();
        bgImg.onerror = () => resolve();
        bgImg.src = page.background;
      });
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } catch {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  } else if (page.background && page.background.includes("gradient")) {
    // Drawn with the canvas's own gradients. Rendering the CSS through an SVG
    // image would work visually but marks the canvas as unsafe to export.
    const gradient = cssGradient(ctx, page.background, canvas.width, canvas.height);
    ctx.fillStyle = gradient ?? firstCssColor(page.background);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    try {
      ctx.fillStyle = page.background || "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } catch {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  /* Draw elements according to z-index */

  const sorted = [
    ...page.elements,
  ].sort(
    (a, b) =>
      a.zIndex - b.zIndex
  );

  for (const el of sorted) {
    if (el.hidden) {
      continue;
    }

    await drawElement(ctx, el);
  }

  return canvas.toDataURL(
    "image/png"
  );
}

/** Splits on commas that are not inside brackets, so "rgba(0, 0, 0, 1)" stays whole */
function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of text) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function firstCssColor(background: string): string {
  return /#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)/.exec(background)?.[0] || "#ffffff";
}

/**
 * Builds a canvas gradient from a CSS linear-gradient() or radial-gradient().
 * Returns null for anything it does not understand, and the caller falls back
 * to a flat colour.
 */
function cssGradient(
  ctx: CanvasRenderingContext2D,
  css: string,
  width: number,
  height: number
): CanvasGradient | null {
  const match = /(linear|radial)-gradient\((.*)\)\s*$/s.exec(css.trim());
  if (!match) return null;
  const parts = splitTopLevel(match[2]);
  if (parts.length < 2) return null;

  let gradient: CanvasGradient;
  let stops = parts;

  if (match[1] === "linear") {
    let angle = 180;
    const first = parts[0];
    const degrees = /^(-?[\d.]+)deg$/.exec(first);
    const sides: Record<string, number> = {
      "to top": 0, "to right": 90, "to bottom": 180, "to left": 270,
      "to top right": 45, "to bottom right": 135, "to bottom left": 225, "to top left": 315,
    };
    if (degrees) {
      angle = parseFloat(degrees[1]);
      stops = parts.slice(1);
    } else if (first in sides) {
      angle = sides[first];
      stops = parts.slice(1);
    }
    // CSS angles turn clockwise from "up"; the line is long enough to reach both far corners
    const rad = (angle * Math.PI) / 180;
    const dx = Math.sin(rad);
    const dy = -Math.cos(rad);
    const half = (Math.abs(width * dx) + Math.abs(height * dy)) / 2;
    gradient = ctx.createLinearGradient(
      width / 2 - dx * half, height / 2 - dy * half,
      width / 2 + dx * half, height / 2 + dy * half
    );
  } else {
    let cx = width / 2;
    let cy = height / 2;
    const at = /at\s+([\d.]+)%\s+([\d.]+)%/.exec(parts[0]);
    if (at) {
      cx = (parseFloat(at[1]) / 100) * width;
      cy = (parseFloat(at[2]) / 100) * height;
    }
    if (at || /circle|ellipse|closest|farthest/.test(parts[0])) stops = parts.slice(1);
    // The default size reaches the farthest corner
    const radius = Math.hypot(Math.max(cx, width - cx), Math.max(cy, height - cy));
    gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  }

  if (stops.length < 2) return null;
  try {
    stops.forEach((stop, index) => {
      const position = /\s([\d.]+)%\s*$/.exec(stop);
      const color = position ? stop.slice(0, position.index).trim() : stop.trim();
      const offset = position ? parseFloat(position[1]) / 100 : index / (stops.length - 1);
      gradient.addColorStop(Math.min(1, Math.max(0, offset)), color);
    });
  } catch {
    return null;
  }
  return gradient;
}

/**
 * Draw one element onto the canvas.
 */
async function drawElement(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement
): Promise<void> {
  // A fading or blended element is drawn on its own sheet first, faded there,
  // and then laid over the page with its blend mode
  if (hasBlend(el)) {
    const sheet = document.createElement("canvas");
    sheet.width = ctx.canvas.width;
    sheet.height = ctx.canvas.height;
    const sctx = sheet.getContext("2d");
    if (sctx) {
      sctx.setTransform(ctx.getTransform());
      await drawElement(sctx, { ...el, blendMask: "none", blendMode: "normal", opacity: 1 } as CanvasElement);
      const mask = blendMaskOf(el);
      if (mask !== "none") {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        const solid = 1 - blendSoftnessOf(el) / 100;
        sctx.save();
        sctx.translate(cx, cy);
        sctx.rotate((el.rotation * Math.PI) / 180);
        // Stretching a unit square over the element lets one gradient serve any proportions
        sctx.scale(el.width / 2, el.height / 2);
        const ends: Record<string, [number, number, number, number]> = {
          "linear-bottom": [0, -1, 0, 1], "linear-top": [0, 1, 0, -1], "linear-left": [1, 0, -1, 0], "linear-right": [-1, 0, 1, 0],
        };
        const fade = mask === "circular"
          ? sctx.createRadialGradient(0, 0, 0, 0, 0, 1)
          : sctx.createLinearGradient(...ends[mask]);
        fade.addColorStop(0, "rgba(0,0,0,1)");
        fade.addColorStop(Math.min(0.999, solid), "rgba(0,0,0,1)");
        fade.addColorStop(1, "rgba(0,0,0,0)");
        sctx.globalCompositeOperation = "destination-in";
        sctx.fillStyle = fade;
        sctx.fillRect(-1, -1, 2, 2);
        sctx.restore();
      }
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = el.opacity;
      if (el.blendMode && el.blendMode !== "normal") ctx.globalCompositeOperation = el.blendMode as GlobalCompositeOperation;
      ctx.drawImage(sheet, 0, 0);
      ctx.restore();
      return;
    }
  }

  ctx.save();

  ctx.globalAlpha = el.opacity;

  /* Rotation */

  const cx =
    el.x + el.width / 2;

  const cy =
    el.y + el.height / 2;

  ctx.translate(cx, cy);

  ctx.rotate(
    (el.rotation * Math.PI) / 180
  );

  ctx.translate(-cx, -cy);

  /* =====================================================
     SHAPES
     ===================================================== */

  if (isShape(el)) {
    ctx.fillStyle = el.fill;
    ctx.strokeStyle = el.stroke;
    ctx.lineWidth =
      el.strokeWidth;

    /* Rectangle */

    if (
      el.type ===
      "rectangle"
    ) {
      const r =
        el.cornerRadius ?? 0;

      ctx.beginPath();

      ctx.roundRect(
        el.x,
        el.y,
        el.width,
        el.height,
        r
      );

      ctx.fill();

      if (
        el.strokeWidth > 0
      ) {
        ctx.stroke();
      }
    }

    /* Ellipse */

    else if (
      el.type ===
      "ellipse"
    ) {
      ctx.beginPath();

      ctx.ellipse(
        cx,
        cy,
        el.width / 2,
        el.height / 2,
        0,
        0,
        Math.PI * 2
      );

      ctx.fill();

      if (
        el.strokeWidth > 0
      ) {
        ctx.stroke();
      }
    }

    /* Line */

    else if (
      el.type ===
      "line"
    ) {
      ctx.beginPath();

      ctx.moveTo(
        el.x,
        el.y +
          el.height / 2
      );

      ctx.lineTo(
        el.x +
          el.width,
        el.y +
          el.height / 2
      );

      ctx.stroke();
    }
  }

  /* =====================================================
     TEXT
     ===================================================== */

  else if (isText(el)) {
    ctx.fillStyle =
      el.color;

    ctx.font = `${el.italic ? "italic " : ""}${el.fontWeight} ${el.fontSize}px "${el.fontFamily}", sans-serif`;

    // Tracked-out labels need their spacing or they come out narrower than designed
    const spacing = typeof el.letterSpacing === "number" ? el.letterSpacing : parseFloat(String(el.letterSpacing || 0)) || 0;
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${spacing}px`;

    ctx.textAlign =
      el.align;

    ctx.textBaseline =
      "top";

    const anchorX =
      el.align === "center"
        ? cx
        : el.align === "right"
        ? el.x + el.width
        : el.x;

    const cased = (text: string) =>
      el.textTransform === "uppercase" ? text.toUpperCase()
        : el.textTransform === "lowercase" ? text.toLowerCase()
        : el.textTransform === "capitalize" ? text.replace(/\b\p{L}/gu, (ch) => ch.toUpperCase())
        : text;
    const lines = el.text.split("\n").map(cased);
    const lineHeight = el.fontSize * el.lineHeight;
    const blockWidth = Math.max(1, ...lines.map((line) => ctx.measureText(line).width));
    const blockHeight = lines.length * lineHeight;
    const blockLeft = el.align === "center" ? anchorX - blockWidth / 2 : el.align === "right" ? anchorX - blockWidth : anchorX;
    const eachLine = (draw: (line: string, x: number, y: number) => void, dx = 0, dy = 0) =>
      lines.forEach((line, i) => draw(line, anchorX + dx, el.y + i * lineHeight + dy));

    // Badge: a filled or outlined box behind the text
    if (el.badgeBg || el.badgeBorder) {
      const pad = String(el.badgePadding ?? "0").split(/\s+/).map((v) => parseFloat(v) || 0);
      const padY = pad[0] ?? 0;
      const padX = pad[1] ?? padY;
      const radius = Math.min(parseFloat(String(el.badgeRadius ?? 0)) || 0, (blockHeight + padY * 2) / 2);
      ctx.beginPath();
      ctx.roundRect(blockLeft - padX, el.y - padY, blockWidth + padX * 2, blockHeight + padY * 2, radius);
      if (el.badgeBg) {
        ctx.fillStyle = el.badgeBg;
        ctx.fill();
      }
      const border = /^([\d.]+)px\s+\w+\s+(.+)$/.exec(String(el.badgeBorder || "").trim());
      if (border) {
        ctx.lineWidth = parseFloat(border[1]);
        ctx.strokeStyle = border[2];
        ctx.stroke();
      }
    }

    // Shadows: the first one listed sits on top, so they are drawn last to first
    const shadows = el.textShadow ? splitTopLevel(el.textShadow) : [];
    for (const shadow of [...shadows].reverse()) {
      const lengths = shadow.match(/-?[\d.]+px|(?<![\w#.(,])-?0(?![\w.])/g) || [];
      const color = shadow.replace(/-?[\d.]+px/g, "").replace(/(^|\s)-?0(?=\s|$)/g, " ").trim() || el.color;
      const [ox = 0, oy = 0, blur = 0] = lengths.map((v) => parseFloat(v));
      ctx.fillStyle = color;
      // A blurred shadow is the text itself, blurred; browsers without canvas filters draw it sharp
      ctx.filter = blur > 0 ? `blur(${blur / 2}px)` : "none";
      eachLine((line, x, y) => ctx.fillText(line, x, y), ox, oy);
    }
    ctx.filter = "none";

    if (el.stroke && el.strokeWidth && el.strokeWidth > 0) {
      ctx.strokeStyle = el.stroke;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineJoin = "round";
      eachLine((line, x, y) => ctx.strokeText(line, x, y));
    }

    const gradient = el.backgroundGradient ? cssGradient(ctx, el.backgroundGradient, blockWidth, blockHeight) : null;
    if (gradient) {
      // The gradient is built for a box at the origin, so the text is drawn from there
      ctx.save();
      ctx.translate(blockLeft, el.y);
      ctx.fillStyle = gradient;
      lines.forEach((line, i) => ctx.fillText(line, anchorX - blockLeft, i * lineHeight));
      ctx.restore();
    } else if (el.color && el.color !== "transparent") {
      ctx.fillStyle = el.color;
      eachLine((line, x, y) => ctx.fillText(line, x, y));
    }
  }

  /* =====================================================
     IMAGE
     ===================================================== */

  else if (isImage(el)) {
    if (!el.src) {
      ctx.restore();
      return;
    }

    const img =
      await loadImage(el.src);

    /*
     * Apply image filter.
     */

    if (
      el.filter &&
      el.filter !== "none"
    ) {
      ctx.filter =
        cssFilterFor(
          el.filter
        );
    }

    /*
     * Crop values are stored in
     * the original image coordinate system.
     */

    const cropX =
      el.cropX ?? 0;

    const cropY =
      el.cropY ?? 0;

    const cropWidth =
      el.cropWidth ??
      el.naturalWidth;

    const cropHeight =
      el.cropHeight ??
      el.naturalHeight;

    /*
     * Draw the image normally
     * when no crop is applied.
     */

    const hasCrop =
      cropX !== 0 ||
      cropY !== 0 ||
      cropWidth !==
        el.naturalWidth ||
      cropHeight !==
        el.naturalHeight;

    if (!hasCrop) {
      ctx.drawImage(
        img,
        el.x,
        el.y,
        el.width,
        el.height
      );
    } else {
      /*
       * Non-destructive crop:
       *
       * Source rectangle:
       * cropX, cropY, cropWidth, cropHeight
       *
       * Destination rectangle:
       * element.x, element.y,
       * element.width, element.height
       */

      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        el.x,
        el.y,
        el.width,
        el.height
      );
    }

    ctx.filter = "none";
  }

  /* =====================================================
     FRAME
     ===================================================== */

  else if (isFrame(el)) {
    const frameDef = getFrameById(el.frameShape);
    const path = new Path2D(frameDef.svgPath100);

    ctx.save();
    ctx.translate(el.x, el.y);
    ctx.scale(el.width / 100, el.height / 100);
    ctx.clip(path);
    ctx.scale(100 / el.width, 100 / el.height);

    if (el.imageSrc) {
      const img = await loadImage(el.imageSrc);

      if (el.filter && el.filter !== "none") {
        ctx.filter = cssFilterFor(el.filter);
      }

      const nw = el.imageNaturalWidth || img.naturalWidth || el.width;
      const nh = el.imageNaturalHeight || img.naturalHeight || el.height;
      const scale = Math.max(el.width / nw, el.height / nh);
      const baseW = nw * scale;
      const baseH = nh * scale;
      const zoom = Math.max(1, el.imageZoom ?? 1);
      const currentW = baseW * zoom;
      const currentH = baseH * zoom;
      const defaultLeft = (el.width - currentW) / 2;
      const defaultTop = (el.height - currentH) / 2;
      const left = defaultLeft + (el.imageOffsetX ?? 0);
      const top = defaultTop + (el.imageOffsetY ?? 0);

      ctx.drawImage(img, left, top, currentW, currentH);
      ctx.filter = "none";
    } else {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, el.width, el.height);
    }

    ctx.restore();

    if (el.stroke && el.strokeWidth && el.strokeWidth > 0) {
      ctx.save();
      ctx.translate(el.x, el.y);
      ctx.scale(el.width / 100, el.height / 100);
      ctx.strokeStyle = el.stroke;
      ctx.lineWidth = (el.strokeWidth * 100) / Math.max(el.width, el.height);
      ctx.stroke(path);
      ctx.restore();
    }
  }

  ctx.restore();
}

/**
 * Convert Falcon ImageFilter values
 * into CSS Canvas filter values.
 */
function cssFilterFor(
  filter: ImageFilter
): string {
  switch (filter) {
    case "grayscale":
      return "grayscale(100%)";

    case "sepia":
      return "sepia(100%)";

    case "blur":
      return "blur(4px)";

    case "brightness":
      return "brightness(1.3)";

    case "contrast":
      return "contrast(1.4)";

    case "saturate":
      return "saturate(2)";

    case "invert":
      return "invert(100%)";

    case "warm":
      return "sepia(25%) saturate(1.5) brightness(1.05)";

    case "cool":
      return "saturate(0.8) hue-rotate(20deg) brightness(1.05)";

    case "none":
    default:
      return "none";
  }
}

/**
 * Load an image before drawing it.
 */
function loadImage(
  src: string
): Promise<HTMLImageElement> {
  return new Promise(
    (resolve, reject) => {
      const img =
        new Image();

      img.crossOrigin =
        "anonymous";

      img.onload = () =>
        resolve(img);

      img.onerror = reject;

      img.src = src;
    }
  );
}