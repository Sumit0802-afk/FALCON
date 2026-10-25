/**
 * AI Background Removal Service
 * Uses @imgly/background-removal client-side neural network segmentation
 * (an ONNX build of IS-Net, the same family of model rembg/BiRefNet-class
 * tools use for foreground segmentation), run entirely in the browser so
 * no image is ever uploaded to a third-party server.
 */

import type { Config } from "@imgly/background-removal";

/** Result of one background-removal run, so callers can surface whether the real AI model ran */
export interface BackgroundRemovalResult {
  dataUrl: string;
  /** false when the neural model could not run and the crude colour-distance fallback was used instead */
  usedAI: boolean;
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode the cutout image"));
    img.src = src;
  });
}

/**
 * Tightens and cleans a cutout's edges after segmentation: pulls the background's
 * colour back out of translucent edge pixels (the usual cause of a coloured halo
 * around hair or fur) and tightens the thin band of leftover semi-opaque pixels,
 * without touching fully opaque or fully transparent pixels or blurring the inside
 * of the subject. Pure alpha-compositing math (Porter–Duff "un-mixing"), so it adds
 * no colour of its own and never erodes solid, confidently-foreground areas.
 */
export async function refineCutoutEdges(dataUrl: string): Promise<string> {
  try {
    const img = await loadImageElement(dataUrl);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) return dataUrl;
    // Very large cutouts: skip refinement rather than freeze the UI: the band this
    // touches scales with edge perimeter, but canvas access itself is not free
    if (w * h > 8_000_000) return dataUrl;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, w, h);

    let imgData: ImageData;
    try {
      imgData = ctx.getImageData(0, 0, w, h);
    } catch {
      // A cross-origin source without CORS headers taints the canvas; nothing more can be done here
      return dataUrl;
    }

    const src = imgData.data;
    const out = Uint8ClampedArray.from(src);
    const idx = (x: number, y: number) => (y * w + x) * 4;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = idx(x, y);
        const a = src[i + 3];
        if (a <= 6 || a >= 250) continue; // only the translucent edge band needs this

        let bgR = 0, bgG = 0, bgB = 0, bgN = 0;
        let fgN = 0;
        for (let dy = -2; dy <= 2; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= h) continue;
          for (let dx = -2; dx <= 2; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= w) continue;
            const ni = idx(nx, ny);
            const na = src[ni + 3];
            if (na <= 6) { bgR += src[ni]; bgG += src[ni + 1]; bgB += src[ni + 2]; bgN++; }
            else if (na >= 250) fgN++;
          }
        }

        const alpha = a / 255;
        if (bgN > 0) {
          // Un-mix: the observed colour is a blend of the subject's true colour and the
          // background showing through; subtracting the background's share removes its tint
          const bR = bgR / bgN, bG = bgG / bgN, bB = bgB / bgN;
          out[i] = Math.min(255, Math.max(0, (src[i] - (1 - alpha) * bR) / alpha));
          out[i + 1] = Math.min(255, Math.max(0, (src[i + 1] - (1 - alpha) * bG) / alpha));
          out[i + 2] = Math.min(255, Math.max(0, (src[i + 2] - (1 - alpha) * bB) / alpha));
        }

        // A faint, mostly-background pixel at the boundary is usually leftover fringe,
        // not real subject detail, so it is tightened rather than left semi-opaque
        if (bgN > fgN && a < 160) {
          out[i + 3] = Math.round(a * 0.82);
        }
      }
    }

    imgData.data.set(out);
    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    // Refinement is a quality pass on top of a result that already exists; never fail the whole operation over it
    return dataUrl;
  }
}

export async function removeImageBackgroundAI(
  imageSource: string | Blob | File | ImageData,
  onProgress?: (percent: number, statusText: string) => void
): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Background removal must run in browser environment.");
  }

  try {
    if (onProgress) onProgress(10, "Initializing AI model...");

    const { removeBackground } = await import("@imgly/background-removal");

    if (onProgress) onProgress(20, "Analyzing photo & isolating subject...");

    const config: Config = {
      progress: (key: string, current: number, total: number) => {
        if (total > 0 && onProgress) {
          const ratio = Math.min(1, Math.max(0, current / total));
          const pct = Math.round(20 + ratio * 65);
          onProgress(pct, `AI Processing: ${key.replace(/_/g, " ")} (${Math.round(ratio * 100)}%)...`);
        }
      },
      // The full fp32 IS-Net weights: slower and a larger one-time download than isnet_fp16 or
      // isnet_quint8, but the most accurate of the three, which is what "highest practical
      // accuracy" asks for. The browser caches the model after the first run.
      model: "isnet",
      output: {
        format: "image/png",
        quality: 1,
      },
    };

    const blob = await removeBackground(imageSource as any, config);

    if (onProgress) onProgress(90, "Refining edges & removing colour halos...");

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const refined = await refineCutoutEdges(dataUrl);

    if (onProgress) onProgress(100, "Background successfully removed!");
    return refined;
  } catch (error: any) {
    console.error("AI Background Removal failed:", error);
    throw error;
  }
}
