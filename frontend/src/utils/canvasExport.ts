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
    try {
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;background:${page.background.replace(/"/g, "'")};"></div></foreignObject></svg>`;
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const blobUrl = URL.createObjectURL(svgBlob);
      const bgImg = new Image();
      await new Promise<void>((resolve) => {
        bgImg.onload = () => resolve();
        bgImg.onerror = () => resolve();
        bgImg.src = blobUrl;
      });
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(blobUrl);
    } catch {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
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

/**
 * Draw one element onto the canvas.
 */
async function drawElement(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement
): Promise<void> {
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

    const lines =
      el.text.split("\n");

    lines.forEach(
      (line, i) => {
        ctx.fillText(
          line,
          anchorX,
          el.y +
            i *
              el.fontSize *
              el.lineHeight
        );
      }
    );
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