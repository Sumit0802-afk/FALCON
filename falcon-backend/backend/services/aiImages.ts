/**
 * aiImages.ts
 *
 * Finds a photograph that suits a design, and cuts it to the shape the layout
 * needs.
 *
 * Search: Pexels when PEXELS_API_KEY is set, which has the widest and best
 * choice. Without a key, Openverse is searched for public-domain photographs
 * (CC0 and public domain mark only, so none needs a credit line). The design
 * model supplies several search phrases, from exact to general, and they are
 * tried in turn until one finds something.
 *
 * Fitting: the chosen photograph is saved on this server and cropped to each
 * box that asks for it. The crop is centred on the busiest part of the
 * picture, which keeps faces and subjects in view instead of cutting through them.
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { isPublicUrl } from "./emailSnapshot";

/** Where found and generated pictures are kept; served from /ai-assets */
export const AI_ASSET_DIR = path.join(__dirname, "..", "storage", "ai-images");

const MAX_DOWNLOAD = 15 * 1024 * 1024;
const USER_AGENT = "FalconDesignStudio/1.0";

export interface FoundPhoto {
  url: string;
  width: number;
  height: number;
}

async function getJson(url: string, headers: Record<string, string> = {}): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, ...headers }, signal: controller.signal });
    if (!res.ok) throw new Error(`search answered ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function searchPexels(query: string, key: string): Promise<FoundPhoto[]> {
  const data = await getJson(`https://api.pexels.com/v1/search?per_page=12&query=${encodeURIComponent(query)}`, { Authorization: key });
  return (data.photos || []).map((p: any) => ({ url: String(p.src?.large2x || p.src?.large || ""), width: Number(p.width) || 0, height: Number(p.height) || 0 }));
}

async function searchOpenverse(query: string, stockOnly: boolean): Promise<FoundPhoto[]> {
  // StockSnap is tried first: its pictures are taken as stock photography, so they are clean and well lit
  const source = stockOnly ? "&source=stocksnap" : "&category=photograph&size=large,medium";
  const data = await getJson(`https://api.openverse.org/v1/images/?license=cc0,pdm&mature=false&page_size=12${source}&q=${encodeURIComponent(query)}`);
  return (data.results || []).map((r: any) => ({ url: String(r.url || ""), width: Number(r.width) || 0, height: Number(r.height) || 0 }));
}

/** Words that describe a look, not a thing a photograph could be tagged with */
const LOOK_WORDS = new Set(["abstract", "modern", "premium", "luxury", "luxurious", "futuristic", "creative", "bold", "minimal", "minimalist", "colorful", "colourful", "vibrant", "background", "style", "design", "poster", "with", "from", "that", "this"]);

const searched = new Map<string, FoundPhoto[]>();

/** Photographs for the first of the phrases that finds any; an empty list when none does */
export async function findPhotos(queries: string[]): Promise<FoundPhoto[]> {
  const pexels = process.env.PEXELS_API_KEY?.trim();
  const clean = queries.map((q) => q.trim().toLowerCase().replace(/[^\p{L}\p{N} ]+/gu, " ").replace(/\s+/g, " ").trim()).filter((q) => q.length >= 2);
  // When no whole phrase finds anything, its words are tried on their own, last words first:
  // in "programmer coding laptop" the thing pictured tends to come last
  const words = clean.flatMap((q) => q.split(" ").reverse()).filter((w) => w.length >= 4 && !LOOK_WORDS.has(w));
  const phrases = [...new Set([...clean, ...words])].slice(0, 14);
  const attempts: [string, () => Promise<FoundPhoto[]>][] = [];
  for (const phrase of phrases) {
    if (pexels) attempts.push([`pexels:${phrase}`, () => searchPexels(phrase, pexels)]);
    attempts.push([`stock:${phrase}`, () => searchOpenverse(phrase, true)]);
  }
  for (const phrase of phrases) attempts.push([`open:${phrase}`, () => searchOpenverse(phrase, false)]);

  for (const [key, run] of attempts) {
    let found = searched.get(key);
    if (!found) {
      try {
        found = (await run()).filter((p) => /^https:\/\//.test(p.url) && isPublicUrl(p.url) && Math.min(p.width, p.height) >= 500);
      } catch {
        found = [];
      }
      if (searched.size > 400) searched.clear();
      searched.set(key, found);
    }
    if (found.length) return found;
  }
  return [];
}

function sourcePath(id: string): string {
  return path.join(AI_ASSET_DIR, `${id}.src`);
}

export function hasSource(id: string): boolean {
  return /^[0-9a-f]{32}$/.test(id) && fs.existsSync(sourcePath(id));
}

/** Keeps a picture on this server and returns the id it is known by */
export function saveSource(content: Buffer, key?: string): string {
  fs.mkdirSync(AI_ASSET_DIR, { recursive: true });
  const id = key ? crypto.createHash("md5").update(key).digest("hex") : crypto.randomBytes(16).toString("hex");
  fs.writeFileSync(sourcePath(id), content);
  return id;
}

/** Downloads a found photograph, or returns null when it cannot be fetched or is not a picture */
export async function fetchSource(photo: FoundPhoto): Promise<string | null> {
  const id = crypto.createHash("md5").update(photo.url).digest("hex");
  if (hasSource(id)) return id;
  if (!isPublicUrl(photo.url)) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(photo.url, { headers: { "User-Agent": USER_AGENT }, signal: controller.signal });
    if (!res.ok || !/^image\//.test(res.headers.get("content-type") || "")) return null;
    const content = Buffer.from(await res.arrayBuffer());
    if (content.length < 2000 || content.length > MAX_DOWNLOAD) return null;
    // Anything sharp cannot read as a picture is turned away here
    const meta = await sharp(content).metadata();
    if (!meta.width || !meta.height) return null;
    return saveSource(content, photo.url);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The picture cut to the given shape, as a file name under /ai-assets.
 * Made once and reused; null when the picture is no longer on this server.
 */
export async function cropSource(id: string, width: number, height: number, backdrop = false): Promise<string | null> {
  if (!hasSource(id)) return null;
  // Large enough to stay sharp in the editor and in exports, without storing huge files
  const scale = Math.min(1, 1800 / Math.max(width, height));
  const w = Math.max(16, Math.round(width * scale));
  const h = Math.max(16, Math.round(height * scale));
  const name = `${id}-${w}x${h}${backdrop ? "-b" : ""}.jpg`;
  const file = path.join(AI_ASSET_DIR, name);
  if (fs.existsSync(file)) return name;
  try {
    let picture = sharp(sourcePath(id)).rotate().resize(w, h, { fit: "cover", position: sharp.strategy.attention });
    // A picture that text is set over is softened and dimmed a little, so its detail does not fight the words
    if (backdrop) picture = picture.blur(Math.max(1.2, Math.min(w, h) / 320)).modulate({ brightness: 0.82, saturation: 0.9 });
    await picture.jpeg({ quality: 84, mozjpeg: true }).toFile(file);
    return name;
  } catch {
    return null;
  }
}
