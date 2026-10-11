/**
 * AI Background Removal Service
 * Uses @imgly/background-removal client-side neural network segmentation
 */

import type { Config } from "@imgly/background-removal";

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
          const pct = Math.round(20 + ratio * 70);
          onProgress(pct, `AI Processing: ${key.replace(/_/g, " ")} (${Math.round(ratio * 100)}%)...`);
        }
      },
      model: "isnet_fp16",
      output: {
        format: "image/png",
        quality: 0.95,
      },
    };

    const blob = await removeBackground(imageSource as any, config);

    if (onProgress) onProgress(95, "Finalizing studio transparency...");

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    if (onProgress) onProgress(100, "Background successfully removed!");
    return dataUrl;
  } catch (error: any) {
    console.error("AI Background Removal failed:", error);
    throw error;
  }
}
