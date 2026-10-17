import { safeFetch } from "../utils/netSafety";
/**
 * Pictures from fal.ai, as an alternative to a Gemini picture model.
 *
 * Chosen with IMAGE_PROVIDER=fal and a key in FAL_API_KEY. The Portrait panel
 * and AI Studio both ask here first when it is chosen, and fall back to what
 * they do without a picture model when it cannot answer.
 *
 * The model is FLUX Kontext, which remakes a picture it is given: one address
 * for a single picture, "/multi" for several and "/text-to-image" for none.
 */

const DEFAULT_MODEL = "fal-ai/flux-pro/kontext";

/** The shapes the model accepts */
const SHAPES: [string, number][] = [["21:9", 2.333], ["16:9", 1.778], ["3:2", 1.5], ["4:3", 1.333], ["1:1", 1], ["3:4", 0.75], ["2:3", 0.667], ["9:16", 0.5625], ["9:21", 0.4286]];

let downUntil = 0;

function key(): string {
  // FAL_KEY is the name fal.ai's own tools use
  return (process.env.FAL_API_KEY || process.env.FAL_KEY || "").trim();
}

function model(): string {
  return (process.env.FAL_IMAGE_MODEL || DEFAULT_MODEL).trim().replace(/^\/+|\/+$/g, "");
}

/** Why a request to fal.ai failed, in a form the callers can act on */
export class FalError extends Error {
  constructor(public reason: "no-balance" | "no-access" | "refused" | "empty" | "unreachable", public status = 0) {
    super(`fal.ai: ${reason}`);
  }
}

export const falPicture = {
  /** Whether this server is set to use fal.ai for pictures */
  chosen(): boolean {
    return (process.env.IMAGE_PROVIDER || "").trim().toLowerCase() === "fal";
  },

  /** Chosen, with a key, and not just found to be out of balance or access */
  ready(): boolean {
    return this.chosen() && key() !== "" && Date.now() > downUntil;
  },

  hasKey(): boolean {
    return key() !== "";
  },

  /**
   * Makes one picture from an instruction and any number of JPEG pictures.
   * `shape` is width over height, and is only used when no single picture
   * sets the shape.
   */
  async make(prompt: string, pictures: Buffer[], options: { shape?: number; timeoutMs?: number } = {}): Promise<Buffer> {
    const urls = pictures.map((p) => `data:image/jpeg;base64,${p.toString("base64")}`);
    const body: Record<string, unknown> = { prompt, num_images: 1, output_format: "jpeg" };
    let address = model();
    if (urls.length === 1) body.image_url = urls[0];
    else if (urls.length > 1) { address += "/multi"; body.image_urls = urls; }
    else address += "/text-to-image";
    if (options.shape && urls.length !== 1) {
      const ratio = options.shape;
      body.aspect_ratio = SHAPES.reduce((best, shape) => (Math.abs(shape[1] - ratio) < Math.abs(best[1] - ratio) ? shape : best))[0];
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs || 120_000);
    try {
      const res = await fetch(`https://fal.run/${address}`, {
        method: "POST",
        headers: { Authorization: `Key ${key()}`, "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        // A wrong key or an empty balance is not going to change in the next few minutes
        if ([401, 402, 403, 404].includes(res.status)) downUntil = Date.now() + 10 * 60_000;
        console.error(`[fal] picture model answered ${res.status}`);
        if (res.status === 402 || res.status === 403) throw new FalError("no-balance", res.status);
        if (res.status === 401 || res.status === 404) throw new FalError("no-access", res.status);
        throw new FalError("refused", res.status);
      }
      const answer: any = await res.json();
      const made: string = answer?.images?.[0]?.url || "";
      if (!made) throw new FalError("empty");
      if (made.startsWith("data:")) return Buffer.from(made.slice(made.indexOf(",") + 1), "base64");
      // The address comes back in the service's answer, so where it points is checked before fetching it
      const file = await safeFetch(made, { signal: controller.signal });
      if (!file.ok) throw new FalError("empty", file.status);
      return Buffer.from(await file.arrayBuffer());
    } catch (err) {
      if (err instanceof FalError) throw err;
      throw new FalError("unreachable");
    } finally {
      clearTimeout(timer);
    }
  },
};
