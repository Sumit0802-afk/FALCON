/**
 * portrait.service.ts
 *
 * The editor's Portrait panel: remakes a photo the user has chosen in one of
 * the portrait styles listed in portraitStyles.ts.
 *
 * Two ways of making a result:
 *
 *  - Drawn here. A style that is a film stock, a coloured light, a drawing
 *    medium or a lens effect is real image processing done on this server.
 *    It is instant and needs no outside service.
 *
 *  - Generated. A style that changes what is in the photo (clothes, a place,
 *    a character, another era) needs a picture model. Those are offered only
 *    when one is configured (PORTRAIT_IMAGE_MODEL) and answering; otherwise
 *    the panel shows them as unavailable instead of pretending.
 *
 * Every result is saved under /ai-assets and the original is kept beside it,
 * so the two can be blended for the Strength slider.
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import sharp, { Sharp } from "sharp";
import { AppError } from "../utils/AppError";
import { AI_ASSET_DIR } from "./aiImages";
import { falPicture } from "./falPicture";
import { PORTRAIT_GROUPS } from "./portraitStyles";

/** The longest side a picture is worked on at: sharp enough for a design, quick enough to feel instant */
const WORK_SIZE = 1400;
const PREVIEW_SIZE = 220;

interface Img { data: Buffer; w: number; h: number }
type Rgb = [number, number, number];

// ─── Building blocks ──────────────────────────────────────────────────────────

async function load(input: Buffer, maxSide: number): Promise<Img> {
  const { data, info } = await sharp(input).rotate().flatten({ background: "#ffffff" }).resize(maxSide, maxSide, { fit: "inside", withoutEnlargement: true }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

function raw(img: Img) {
  return sharp(img.data, { raw: { width: img.w, height: img.h, channels: 3 } });
}

async function from(pipeline: Sharp): Promise<Img> {
  const { data, info } = await pipeline.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

/** Flattens fine detail while keeping edges, which is what gives a painted look */
/** Sizes below are written for a picture a thousand pixels across and scaled to the one in hand, so a small preview and the full result look alike */
const scaleOf = (img: Img) => Math.max(img.w, img.h) / 1000;
const smooth = (img: Img, size: number) => from(raw(img).median(Math.max(3, Math.round(size * scaleOf(img)) | 1)));
const blur = (img: Img, sigma: number) => from(raw(img).blur(Math.max(0.3, sigma * scaleOf(img))));

function luminance(img: Img): Float32Array {
  const out = new Float32Array(img.w * img.h);
  for (let i = 0, p = 0; i < out.length; i++, p += 3) out[i] = 0.299 * img.data[p] + 0.587 * img.data[p + 1] + 0.114 * img.data[p + 2];
  return out;
}

/** How strongly each pixel is an edge, from 0 to 1 */
function edgeMap(img: Img, gain = 1): Float32Array {
  const { w, h } = img;
  const l = luminance(img);
  const out = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx = -l[i - w - 1] - 2 * l[i - 1] - l[i + w - 1] + l[i - w + 1] + 2 * l[i + 1] + l[i + w + 1];
      const gy = -l[i - w - 1] - 2 * l[i - w] - l[i - w + 1] + l[i + w - 1] + 2 * l[i + w] + l[i + w + 1];
      out[i] = Math.min(1, (Math.sqrt(gx * gx + gy * gy) / 255) * gain);
    }
  }
  return out;
}

/** Changes every pixel with a function of its colour and place */
function each(img: Img, fn: (r: number, g: number, b: number, x: number, y: number, i: number) => Rgb): Img {
  const out = Buffer.allocUnsafe(img.data.length);
  const { w, h } = img;
  for (let y = 0, i = 0, p = 0; y < h; y++) {
    for (let x = 0; x < w; x++, i++, p += 3) {
      const c = fn(img.data[p], img.data[p + 1], img.data[p + 2], x, y, i);
      out[p] = clamp(c[0]); out[p + 1] = clamp(c[1]); out[p + 2] = clamp(c[2]);
    }
  }
  return { data: out, w, h };
}

const posterize = (img: Img, levels: number) => {
  const step = 255 / (levels - 1);
  return each(img, (r, g, b) => [Math.round(r / step) * step, Math.round(g / step) * step, Math.round(b / step) * step]);
};

/** Saturation, brightness and contrast in one pass */
function tone(img: Img, o: { sat?: number; bright?: number; contrast?: number }): Img {
  const sat = o.sat ?? 1, bright = o.bright ?? 1, contrast = o.contrast ?? 1;
  return each(img, (r, g, b) => {
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    const f = (v: number) => ((l + (v - l) * sat) * bright - 128) * contrast + 128;
    return [f(r), f(g), f(b)];
  });
}

/** Draws the edges over a picture as dark lines */
function inked(img: Img, edges: Float32Array, o: { threshold?: number; strength?: number; color?: Rgb } = {}): Img {
  const threshold = o.threshold ?? 0.22, strength = o.strength ?? 1, color = o.color ?? [18, 18, 22];
  return each(img, (r, g, b, _x, _y, i) => {
    const a = Math.min(1, Math.max(0, (edges[i] - threshold) * 4)) * strength;
    return [r + (color[0] - r) * a, g + (color[1] - g) * a, b + (color[2] - b) * a];
  });
}

/** A pencil drawing: the picture divided by a blurred copy of itself, which leaves only its lines */
async function sketch(img: Img, softness: number): Promise<Float32Array> {
  const soft = luminance(await blur(img, softness));
  const l = luminance(img);
  const out = new Float32Array(l.length);
  for (let i = 0; i < l.length; i++) out[i] = Math.min(255, (l[i] * 255) / Math.max(1, soft[i] + 1));
  return out;
}

/** Print dots: darker areas get larger dots. Returns 0 where there is ink and 1 where there is paper */
function halftone(x: number, y: number, darkness: number, cell: number): number {
  const cx = (x % cell) - cell / 2, cy = ((y + (Math.floor(x / cell) % 2) * (cell / 2)) % cell) - cell / 2;
  const radius = Math.sqrt(darkness) * cell * 0.62;
  return Math.sqrt(cx * cx + cy * cy) < radius ? 0 : 1;
}

/** Repeatable noise, so a result looks the same each time it is made */
function noise(i: number, seed: number): number {
  let t = (i + seed * 7919) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296 - 0.5;
}

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** A colour along a list of stops, for t from 0 to 1 */
function ramp(stops: Rgb[], t: number): Rgb {
  const pos = Math.min(0.9999, Math.max(0, t)) * (stops.length - 1);
  const k = Math.floor(pos);
  return mix(stops[k], stops[k + 1], pos - k);
}

function hueRotate(img: Img, degrees: number): Img {
  const a = (degrees * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  const m = [
    0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928,
    0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.14, 0.072 - c * 0.072 - s * 0.283,
    0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072,
  ];
  return each(img, (r, g, b) => [r * m[0] + g * m[1] + b * m[2], r * m[3] + g * m[4] + b * m[5], r * m[6] + g * m[7] + b * m[8]]);
}

/** Darkens towards the corners */
function vignette(img: Img, amount: number): Img {
  const cx = img.w / 2, cy = img.h / 2, far = Math.sqrt(cx * cx + cy * cy);
  return each(img, (r, g, b, x, y) => {
    const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / far;
    const k = 1 - amount * d * d;
    return [r * k, g * k, b * k];
  });
}

// ─── More building blocks, for the looks below ────────────────────────────────

/** Builds a picture by reading each pixel from another place in the original */
function remap(img: Img, from: (x: number, y: number) => [number, number]): Img {
  const { w, h } = img;
  const out = Buffer.allocUnsafe(img.data.length);
  for (let y = 0, p = 0; y < h; y++) {
    for (let x = 0; x < w; x++, p += 3) {
      const [fx, fy] = from(x, y);
      const sx = fx < 0 ? 0 : fx >= w ? w - 1 : fx | 0, sy = fy < 0 ? 0 : fy >= h ? h - 1 : fy | 0;
      const s = (sy * w + sx) * 3;
      out[p] = img.data[s]; out[p + 1] = img.data[s + 1]; out[p + 2] = img.data[s + 2];
    }
  }
  return { data: out, w, h };
}

/** Red, green and blue each read from their own place, which pulls the colours apart */
function channels(img: Img, shift: (x: number, y: number) => [number, number]): Img {
  const { w, h } = img;
  const out = Buffer.allocUnsafe(img.data.length);
  const at = (x: number, y: number) => ((y < 0 ? 0 : y >= h ? h - 1 : y | 0) * w + (x < 0 ? 0 : x >= w ? w - 1 : x | 0)) * 3;
  for (let y = 0, p = 0; y < h; y++) {
    for (let x = 0; x < w; x++, p += 3) {
      const [dx, dy] = shift(x, y);
      out[p] = img.data[at(x - dx, y - dy)];
      out[p + 1] = img.data[p + 1];
      out[p + 2] = img.data[at(x + dx, y + dy) + 2];
    }
  }
  return { data: out, w, h };
}

/** A colour grade: tone, tinted shadows and highlights, coloured light, faded blacks, grain and dark corners */
interface Grade {
  sat?: number; contrast?: number; bright?: number;
  /** Colours pushed into the dark and the light parts, and how hard */
  shadow?: Rgb; light?: Rgb; split?: number;
  /** A coloured light over the whole picture, and how much of it */
  wash?: Rgb; washed?: number;
  fade?: number; vignette?: number; grain?: number;
}

function grade(img: Img, g: Grade, seed = 1): Img {
  const split = g.split ?? 0, washed = g.washed ?? 0, fade = g.fade ?? 0, grain = g.grain ?? 0;
  const shadow = g.shadow ?? [128, 128, 128], light = g.light ?? [128, 128, 128], wash = g.wash ?? [255, 255, 255];
  const out = each(tone(img, g), (r, gr, b, _x, _y, i) => {
    const l = Math.min(1, Math.max(0, (0.299 * r + 0.587 * gr + 0.114 * b) / 255));
    let c: Rgb = [r, gr, b];
    if (split) c = [c[0] + ((shadow[0] - 128) * (1 - l) + (light[0] - 128) * l) * split, c[1] + ((shadow[1] - 128) * (1 - l) + (light[1] - 128) * l) * split, c[2] + ((shadow[2] - 128) * (1 - l) + (light[2] - 128) * l) * split];
    if (washed) { const k = 0.12 + l * 1.08; c = mix(c, [wash[0] * k, wash[1] * k, wash[2] * k], washed); }
    if (fade) c = [c[0] * (1 - fade) + 96 * fade, c[1] * (1 - fade) + 92 * fade, c[2] * (1 - fade) + 88 * fade];
    const n = grain ? noise(i, seed) * grain : 0;
    return [c[0] + n, c[1] + n, c[2] + n];
  });
  return g.vignette ? vignette(out, g.vignette) : out;
}

/** The four variations of a grade: as written, gentler, stronger, and grainier with darker corners */
function vary(g: Grade, v: number): Grade {
  const k = pick([1, 0.6, 1.28, 1], v);
  const towards = (value: number | undefined) => (value === undefined ? undefined : 1 + (value - 1) * k);
  return {
    ...g,
    sat: towards(g.sat), contrast: towards(g.contrast), bright: towards(g.bright),
    split: (g.split ?? 0) * k, washed: Math.min(0.9, (g.washed ?? 0) * k), fade: (g.fade ?? 0) * k,
    vignette: Math.min(0.95, (g.vignette ?? 0) * k + (v === 3 ? 0.2 : 0)), grain: (g.grain ?? 0) + (v === 3 ? 9 : 0),
  };
}

const graded = (g: Grade, seed = 1): Draw => async (img, v) => grade(img, vary(g, v), seed + v);

// ─── The looks drawn on this server ───────────────────────────────────────────

type Draw = (img: Img, variation: number) => Promise<Img>;

const pick = <T,>(list: T[], v: number): T => list[((v % list.length) + list.length) % list.length];

const POP: Rgb[][] = [
  [[20, 16, 60], [232, 36, 110], [255, 196, 0], [255, 250, 230]],
  [[12, 44, 84], [0, 168, 232], [255, 90, 60], [255, 240, 200]],
  [[40, 10, 50], [130, 60, 220], [60, 220, 190], [250, 250, 160]],
  [[30, 30, 30], [220, 40, 40], [250, 220, 60], [255, 255, 255]],
];

const DUOTONES: Rgb[][] = [
  [[14, 2, 46], [255, 43, 214], [42, 246, 255]],
  [[6, 10, 44], [120, 60, 255], [255, 110, 200]],
  [[2, 20, 30], [0, 200, 180], [255, 240, 120]],
  [[20, 4, 30], [255, 80, 60], [255, 220, 90]],
];

const cartoon = async (img: Img, v: number, levels: number, halftoneCell = 0): Promise<Img> => {
  const flat = posterize(tone(await smooth(img, pick([7, 9, 5, 7], v)), { sat: pick([1.35, 1.2, 1.5, 1.1], v), contrast: 1.08 }), levels + (v === 2 ? 2 : 0));
  const edges = edgeMap(await blur(img, 1.1), pick([2.2, 2.8, 1.8, 3.2], v));
  let out = inked(flat, edges, { threshold: 0.2, strength: 1 });
  if (halftoneCell) {
    const cell = Math.max(4, Math.round((halftoneCell * img.w) / 900));
    const l = luminance(flat);
    out = each(out, (r, g, b, x, y, i) => {
      const dark = 1 - l[i] / 255;
      if (dark < 0.35) return [r, g, b];
      const k = halftone(x, y, (dark - 0.35) * 0.9, cell) ? 1 : 0.62;
      return [r * k, g * k, b * k];
    });
  }
  return out;
};

const FADED: Grade = { sat: 0.76, contrast: 0.92, fade: 0.14, shadow: [96, 130, 138], light: [250, 232, 204], split: 0.3, grain: 10, vignette: 0.25 };

/**
 * Every look this server can draw by itself. A portrait style that is one of
 * these (a film stock, a coloured light, a drawing medium, a lens effect) is
 * made here at once; every other style needs the picture model.
 */
const LOOKS: Record<string, Draw> = {
  // ── Photographic ───────────────────────────────────────────────────────────
  bw: async (img, v) => {
    const contrast = pick([1.2, 1.55, 0.95, 1.3], v);
    const tint = pick<Rgb>([[255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 244, 226]], v);
    return each(img, (r, g, b) => {
      const l = ((0.299 * r + 0.587 * g + 0.114 * b - 128) * contrast + 128) / 255;
      return [l * tint[0], l * tint[1], l * tint[2]];
    });
  },
  noir: graded({ sat: 0, contrast: 1.55, bright: 0.9, vignette: 0.62, grain: 16 }, 21),
  film: async (img, v) => {
    const look = pick<[Rgb, Rgb]>([[[14, 22, 34], [255, 236, 208]], [[26, 18, 30], [255, 226, 214]], [[10, 30, 28], [246, 244, 210]], [[20, 20, 24], [240, 240, 240]]], v);
    return vignette(each(tone(img, { sat: 0.88, contrast: 1.1 }), (r, g, b, _x, _y, i) => {
      const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const c = mix([r, g, b], l < 0.5 ? look[0] : look[1], 0.14);
      const grain = noise(i, 17) * 22;
      return [c[0] + grain, c[1] + grain, c[2] + grain];
    }), 0.3);
  },
  kodak: graded({ sat: 1.2, contrast: 1.08, shadow: [112, 126, 150], light: [255, 212, 150], split: 0.34, grain: 12, vignette: 0.2 }, 23),
  faded: graded(FADED, 25),
  disposable: graded({ sat: 1.16, contrast: 1.2, bright: 1.08, shadow: [104, 140, 120], light: [255, 220, 170], split: 0.3, vignette: 0.52, grain: 18 }, 27),
  sepia: async (img, v) => {
    const warmth = pick([1, 0.7, 1.25, 0.5], v);
    const faded = each(img, (r, g, b, _x, _y, i) => {
      const sepia: Rgb = [r * 0.393 + g * 0.769 + b * 0.189, r * 0.349 + g * 0.686 + b * 0.168, r * 0.272 + g * 0.534 + b * 0.131];
      const c = mix([r, g, b], sepia, Math.min(1, 0.7 * warmth));
      const grain = noise(i, 11) * 14;
      return [c[0] * 0.9 + 26 + grain, c[1] * 0.9 + 22 + grain, c[2] * 0.88 + 18 + grain];
    });
    return vignette(faded, 0.45);
  },
  // The picture set in an instant-print frame: narrow white sides and a deep white foot
  polaroid: async (img, v) => {
    const side = Math.max(2, Math.round(Math.min(img.w, img.h) * pick([0.06, 0.05, 0.07, 0.06], v)));
    const foot = Math.max(side, Math.round(img.h * pick([0.18, 0.2, 0.16, 0.22], v)));
    const inner = await raw(grade(img, vary(FADED, v), 29)).resize(Math.max(1, img.w - side * 2), Math.max(1, img.h - side - foot), { fit: "cover" }).png().toBuffer();
    return from(sharp({ create: { width: img.w, height: img.h, channels: 3, background: pick(["#faf8f2", "#ffffff", "#f4efe4", "#f7f5ee"], v) } }).composite([{ input: inner, left: side, top: side }]));
  },
  infrared: async (img, v) => {
    const glow = luminance(await blur(img, 9));
    const contrast = pick([1.35, 1.6, 1.15, 1.45], v);
    return each(img, (r, g, b, _x, _y, i) => {
      // Infrared film: greens turn bright, blue skies turn dark, and the lights bloom
      const l = (((g * 1.5 + r * 0.35 - b * 0.85) - 128) * contrast + 128) + Math.max(0, glow[i] - 150) * 0.5 + noise(i, 31) * 12;
      return [l, l, l * 0.98];
    });
  },

  // ── Light and colour ───────────────────────────────────────────────────────
  cinematic: graded({ sat: 1.05, contrast: 1.15, shadow: [70, 122, 140], light: [255, 196, 132], split: 0.4, vignette: 0.35 }),
  "dark-cinematic": graded({ sat: 0.85, contrast: 1.3, bright: 0.72, shadow: [56, 92, 122], light: [232, 184, 134], split: 0.36, vignette: 0.7 }),
  moody: graded({ sat: 0.7, contrast: 1.15, bright: 0.8, shadow: [74, 102, 122], light: [204, 192, 172], split: 0.34, fade: 0.05, vignette: 0.55 }),
  "teal-orange": graded({ sat: 1.2, contrast: 1.15, shadow: [24, 150, 170], light: [255, 162, 62], split: 0.7, vignette: 0.25 }),
  "red-light": graded({ contrast: 1.2, wash: [255, 44, 40], washed: 0.72, vignette: 0.5 }),
  "blue-light": graded({ contrast: 1.2, wash: [54, 116, 255], washed: 0.72, vignette: 0.5 }),
  "purple-light": graded({ contrast: 1.2, wash: [190, 64, 255], washed: 0.7, vignette: 0.5 }),
  "green-light": graded({ contrast: 1.18, sat: 0.9, wash: [64, 226, 140], washed: 0.58, vignette: 0.55 }),
  "low-key": graded({ sat: 0.9, contrast: 1.5, bright: 0.6, vignette: 0.85 }),
  "high-contrast": graded({ sat: 1.1, contrast: 1.6 }),
  "golden-hour": graded({ sat: 1.15, bright: 1.06, shadow: [150, 112, 92], light: [255, 202, 112], split: 0.6, wash: [255, 190, 110], washed: 0.15, vignette: 0.2 }),
  "blue-hour": graded({ sat: 0.9, bright: 0.88, shadow: [52, 82, 170], light: [190, 202, 255], split: 0.6, vignette: 0.3 }),
  moonlight: graded({ sat: 0.5, contrast: 1.2, bright: 0.7, wash: [150, 182, 255], washed: 0.35, vignette: 0.6 }),
  pastel: graded({ sat: 0.7, contrast: 0.82, bright: 1.12, fade: 0.12, shadow: [200, 172, 220], light: [255, 222, 232], split: 0.3 }),
  duotone: async (img, v) => {
    const pair = pick<[Rgb, Rgb]>([[[22, 16, 84], [255, 110, 120]], [[8, 40, 60], [250, 220, 90]], [[50, 8, 60], [120, 240, 220]], [[16, 20, 30], [255, 150, 60]]], v);
    const l = luminance(tone(img, { contrast: 1.2 }));
    return each(img, (_r, _g, _b, _x, _y, i) => mix(pair[0], pair[1], Math.min(1, Math.max(0, l[i] / 255))));
  },
  // Two coloured lights, one from each side
  neon: async (img, v) => {
    const pair = pick<[Rgb, Rgb]>([[[255, 40, 190], [40, 220, 255]], [[150, 70, 255], [255, 80, 150]], [[40, 120, 255], [255, 60, 60]], [[60, 255, 170], [200, 70, 255]]], v);
    return vignette(each(tone(img, { contrast: 1.25, bright: 0.82 }), (r, g, b, x) => {
      const t = x / img.w, s = t * t * (3 - 2 * t);
      const lamp = mix(pair[0], pair[1], s);
      const k = 0.1 + ((0.299 * r + 0.587 * g + 0.114 * b) / 255) * 1.15;
      return mix([r, g, b], [lamp[0] * k, lamp[1] * k, lamp[2] * k], 0.68);
    }), 0.45);
  },
  cyberpunk: async (img, v) => {
    const stops = pick(DUOTONES, v);
    const l = luminance(tone(img, { contrast: 1.25 }));
    return each(img, (r, g, b, _x, _y, i) => mix([r, g, b], ramp(stops, l[i] / 255), 0.72));
  },
  holographic: async (img, v) => {
    const foil: Rgb[] = [[255, 140, 220], [140, 200, 255], [150, 255, 220], [255, 245, 160], [255, 170, 200], [170, 150, 255]];
    const turn = pick([0, 0.33, 0.66, 0.15], v);
    return each(img, (r, g, b, x, y) => {
      const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const c = ramp(foil, (l * 1.4 + (x + y) / (img.w + img.h) + turn) % 1);
      // The sheen takes its colour from the foil and its light and dark from the picture, so the face still reads
      const shade = 0.35 + l * 0.75;
      return mix([r, g, b], [c[0] * shade, c[1] * shade, c[2] * shade], 0.62);
    });
  },
  // A projected figure: one colour of light, scan lines and a faint flicker
  hologram: async (img, v) => {
    const beam = pick<Rgb>([[70, 220, 255], [90, 255, 190], [150, 150, 255], [255, 120, 230]], v);
    const glow = luminance(await blur(img, 8));
    const line = Math.max(2, Math.round(img.h / 180));
    return each(tone(img, { contrast: 1.3 }), (r, g, b, _x, y, i) => {
      const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255 + Math.max(0, glow[i] / 255 - 0.55) * 0.5;
      const k = (Math.floor(y / line) % 2 ? 0.7 : 1) * (1 + noise(Math.floor(y / line), 37) * 0.18);
      return [(8 + beam[0] * l) * k, (14 + beam[1] * l) * k, (26 + beam[2] * l) * k];
    });
  },

  // ── Drawing and painting ───────────────────────────────────────────────────
  watercolor: async (img, v) => {
    const soft = await blur(tone(await smooth(img, pick([9, 7, 11, 9], v)), { sat: pick([1.3, 1.1, 1.5, 0.9], v), bright: 1.06 }), 0.8);
    const edges = edgeMap(await blur(img, 1.4), 1.6);
    // Thinned towards paper white, with faint darker pooling along the edges, as wet paint dries
    return each(soft, (r, g, b, _x, _y, i) => {
      const paper = 0.14 + noise(i, 3) * 0.05, pool = 1 - Math.min(0.28, edges[i] * 0.45);
      return [(r + (250 - r) * paper) * pool, (g + (247 - g) * paper) * pool, (b + (240 - b) * paper) * pool];
    });
  },
  oil: async (img, v) => from(raw(tone(await smooth(img, pick([11, 13, 9, 11], v)), { sat: pick([1.4, 1.25, 1.6, 1.15], v), contrast: 1.12 })).sharpen({ sigma: 1.2 })),
  acrylic: async (img, v) => posterize(tone(await smooth(img, pick([7, 9, 5, 7], v)), { sat: pick([1.6, 1.4, 1.8, 1.3], v), contrast: 1.15 }), pick([9, 7, 11, 8], v)),
  "digital-paint": async (img, v) => from(raw(tone(await smooth(img, pick([7, 9, 5, 7], v)), { sat: pick([1.25, 1.1, 1.4, 1.2], v), contrast: 1.1 })).sharpen({ sigma: pick([1.6, 1.2, 2, 1.4], v) })),
  pencil: async (img, v) => {
    const lines = await sketch(img, 6 * pick([1, 1.6, 0.7, 2.2], v));
    const gamma = pick([1.6, 1.3, 2, 1.1], v);
    return each(img, (_r, _g, _b, _x, _y, i) => {
      const g = 255 * Math.pow(lines[i] / 255, gamma) + noise(i, 5) * 10;
      return [g, g, g * 0.99];
    });
  },
  charcoal: async (img, v) => {
    const lines = await sketch(img, 15 * pick([1, 1.4, 0.8, 1.8], v));
    const l = luminance(img);
    return each(img, (_r, _g, _b, _x, _y, i) => {
      const g = 255 * Math.pow(lines[i] / 255, 2.6) * 0.72 + l[i] * 0.28 + noise(i, 9) * 34 - 8;
      return [g * 0.98, g * 0.97, g * 0.95];
    });
  },
  "pastel-drawing": async (img, v) => {
    const lines = await sketch(img, 9 * pick([1, 1.4, 0.8, 1.7], v));
    const colour = tone(await smooth(img, 7), { sat: pick([1.25, 1.05, 1.45, 0.9], v), bright: 1.1 });
    // Soft chalk colour on toothed paper, with the drawing's lines showing through
    return each(colour, (r, g, b, _x, _y, i) => {
      const k = Math.pow(lines[i] / 255, 0.8), tooth = noise(i, 13) * 20;
      return [(r * 0.8 + 250 * 0.2) * k + tooth, (g * 0.8 + 246 * 0.2) * k + tooth, (b * 0.8 + 238 * 0.2) * k + tooth];
    });
  },
  "ink-wash": async (img, v) => {
    const wash = luminance(await blur(await smooth(img, 11), 2.4));
    const local = luminance(await blur(img, 17));
    const l = luminance(await blur(img, 0.8));
    const levels = pick([5, 4, 6, 5], v), bias = pick([0.9, 0.86, 0.94, 0.82], v);
    return each(img, (_r, _g, _b, _x, _y, i) => {
      // Diluted ink laid in a few tones, with full-strength brush lines over it
      const tone5 = Math.round((wash[i] / 255) * (levels - 1)) / (levels - 1);
      const g = l[i] < local[i] * bias ? 34 : 70 + tone5 * 178 + noise(i, 15) * 8;
      return [g, g * 0.99, g * 0.96];
    });
  },
  "line-art": async (img, v) => {
    const edges = edgeMap(await blur(img, pick([1.3, 1.9, 0.9, 2.6], v)), pick([2.6, 3.2, 2.2, 3.8], v));
    return each(img, (_r, _g, _b, _x, _y, i) => {
      const g = 252 - Math.min(1, Math.max(0, (edges[i] - 0.2) * 5)) * 232;
      return [g, g, g];
    });
  },
  "pop-art": async (img, v) => {
    const l = luminance(await smooth(img, 5));
    const palette = pick(POP, v);
    const edges = edgeMap(await blur(img, 1.2), 2.4);
    return each(img, (_r, _g, _b, _x, _y, i) => (edges[i] > 0.3 ? palette[0] : palette[Math.min(3, Math.floor((l[i] / 256) * 4))]));
  },
  comic: (img, v) => cartoon(img, v, 5, pick([8, 10, 7, 12], v)),
  manga: async (img, v) => {
    const flat = luminance(await smooth(img, 7));
    const edges = edgeMap(await blur(img, 1.1), pick([2.6, 3.2, 2, 3.6], v));
    const cell = Math.max(4, Math.round((pick([7, 9, 6, 11], v) * img.w) / 900));
    return each(img, (_r, _g, _b, x, y, i) => {
      if (edges[i] > 0.26) return [16, 16, 20];
      const l = flat[i] / 255;
      if (l < 0.2) return [16, 16, 20];
      if (l > 0.72) return [252, 252, 250];
      return halftone(x, y, (0.72 - l) * 1.3, cell) ? [252, 252, 250] : [16, 16, 20];
    });
  },
  "paper-cut": async (img, v) => {
    const flat = posterize(tone(await blur(await smooth(img, 13), 2.2), { sat: pick([1.35, 1.1, 1.6, 0.9], v) }), pick([4, 5, 3, 6], v));
    // A thin shadow where one sheet lies over another
    const edges = edgeMap(flat, 3);
    return each(flat, (r, g, b, _x, _y, i) => {
      const k = 1 - Math.min(0.32, edges[i] * 0.6);
      return [r * k, g * k, b * k];
    });
  },
  pixel: async (img, v) => {
    const across = pick([72, 48, 96, 36], v);
    const small = posterize(tone(await from(raw(img).resize(across, Math.max(1, Math.round((across * img.h) / img.w)), { kernel: "nearest" })), { sat: 1.3, contrast: 1.1 }), 5);
    return from(raw(small).resize(img.w, img.h, { kernel: "nearest" }));
  },

  // ── Lens and screen effects ────────────────────────────────────────────────
  "rgb-split": async (img, v) => {
    const d = Math.max(2, Math.round(img.w * pick([0.012, 0.02, 0.008, 0.016], v)));
    return channels(img, () => (v === 3 ? [d, Math.round(d / 2)] : [d, 0]));
  },
  // Colour fringes that grow towards the corners, as through a cheap lens
  chromatic: async (img, v) => {
    const reach = pick([0.022, 0.034, 0.014, 0.028], v), cx = img.w / 2, cy = img.h / 2;
    return channels(img, (x, y) => [Math.round((x - cx) * reach), Math.round((y - cy) * reach)]);
  },
  glitch: async (img, v) => {
    const band = Math.max(4, Math.round(img.h / pick([22, 14, 34, 18], v)));
    const reach = img.w * pick([0.07, 0.11, 0.045, 0.09], v);
    // Some bands of rows slip sideways, then the colours are pulled apart
    const slipped = remap(img, (x, y) => {
      const row = Math.floor(y / band), n = noise(row, 41 + v);
      return [Math.abs(n) > 0.3 ? x + Math.round(n * 2 * reach) : x, y];
    });
    const d = Math.max(2, Math.round(img.w * 0.012));
    return each(channels(slipped, () => [d, 0]), (r, g, b, _x, y) => {
      const k = y % 3 === 0 ? 0.86 : 1;
      return [r * k, g * k, b * k];
    });
  },
  "motion-blur": async (img, v) => {
    const reach = Math.max(2, Math.round(img.w * pick([0.03, 0.05, 0.018, 0.04], v)));
    const { w, h } = img, out = Buffer.allocUnsafe(img.data.length);
    // Each pixel becomes the average of the row around it, kept in a running sum
    for (let y = 0; y < h; y++) {
      const sum = [0, 0, 0];
      let count = 0;
      const add = (x: number, sign: number) => { const p = (y * w + x) * 3; sum[0] += img.data[p] * sign; sum[1] += img.data[p + 1] * sign; sum[2] += img.data[p + 2] * sign; count += sign; };
      for (let x = 0; x <= Math.min(reach, w - 1); x++) add(x, 1);
      for (let x = 0; x < w; x++) {
        const p = (y * w + x) * 3;
        out[p] = sum[0] / count; out[p + 1] = sum[1] / count; out[p + 2] = sum[2] / count;
        if (x + reach + 1 < w) add(x + reach + 1, 1);
        if (x - reach >= 0) add(x - reach, -1);
      }
    }
    const moved: Img = { data: out, w, h };
    // The middle stays readable; the blur takes over towards the sides
    const cx = w / 2;
    return each(img, (r, g, b, x, _y, i) => {
      const t = Math.min(1, Math.abs(x - cx) / (w * 0.36)), p = i * 3;
      const k = v === 3 ? 1 : 0.35 + t * 0.65;
      return [r + (moved.data[p] - r) * k, g + (moved.data[p + 1] - g) * k, b + (moved.data[p + 2] - b) * k];
    });
  },
  kaleidoscope: async (img, v) => {
    const wedges = pick([6, 8, 4, 10], v), slice = (Math.PI * 2) / wedges;
    const cx = img.w / 2, cy = img.h / 2;
    return remap(img, (x, y) => {
      const dx = x - cx, dy = y - cy, far = Math.sqrt(dx * dx + dy * dy);
      let a = ((Math.atan2(dy, dx) % slice) + slice) % slice;
      if (a > slice / 2) a = slice - a;
      a -= Math.PI / 2;
      return [cx + Math.cos(a) * far, cy + Math.sin(a) * far];
    });
  },
  mirror: async (img, v) => {
    const cx = img.w / 2, cy = img.h / 2;
    return remap(img, (x, y) => (v === 1 ? [x > cx ? x : img.w - 1 - x, y] : v === 2 ? [x, y < cy ? y : img.h - 1 - y] : v === 3 ? [x < cx ? x : img.w - 1 - x, y < cy ? y : img.h - 1 - y] : [x < cx ? x : img.w - 1 - x, y]));
  },
};

/** Which look each style on the list is, for the styles this server draws by itself */
const LOOK_OF: Record<string, string> = {
  "Black-and-White Portrait": "bw", "Monochrome Portrait": "bw", "Black-and-White Couple Portrait": "bw",
  "Film Noir Portrait": "noir",
  "Film Photography Portrait": "film", "Retro Film Portrait": "film",
  "Kodak Film Portrait": "kodak",
  "Faded Film Portrait": "faded", "Vintage Camera Portrait": "faded",
  "Disposable Camera Portrait": "disposable",
  "Sepia Portrait": "sepia", "Old Family Album Portrait": "sepia", "Family Vintage Album Portrait": "sepia", "Vintage Couple Portrait": "sepia",
  "Polaroid Portrait": "polaroid", "Couple Polaroid Portrait": "polaroid",
  "Infrared Photography Portrait": "infrared",
  "Cinematic Portrait": "cinematic", "Cinematic Couple Portrait": "cinematic",
  "Dark Cinematic Portrait": "dark-cinematic",
  "Moody Portrait": "moody",
  "Teal and Orange Portrait": "teal-orange",
  "Red Lighting Portrait": "red-light", "Red Gel Lighting Portrait": "red-light",
  "Blue Lighting Portrait": "blue-light",
  "Purple Neon Portrait": "purple-light",
  "Green Cinematic Lighting": "green-light",
  "Low-Key Portrait": "low-key",
  "High-Contrast Portrait": "high-contrast",
  "Golden Hour Portrait": "golden-hour",
  "Blue Hour Portrait": "blue-hour",
  "Moonlight Portrait": "moonlight",
  "Pastel Colour Portrait": "pastel",
  "Duotone Portrait": "duotone",
  "Neon Portrait": "neon", "Neon Glow Portrait": "neon", "RGB Gaming Portrait": "neon",
  "Cyberpunk Portrait": "cyberpunk",
  "Holographic Portrait": "holographic",
  "Hologram Avatar": "hologram",
  "Watercolor Illustration Portrait": "watercolor", "Watercolour Portrait": "watercolor",
  "Oil Painting Portrait": "oil", "Oil Canvas Portrait": "oil", "Royal Oil Painting": "oil",
  "Acrylic Painting Portrait": "acrylic",
  "Digital Painting Portrait": "digital-paint",
  "Pencil Sketch Portrait": "pencil", "Graphite Portrait": "pencil",
  "Charcoal Sketch Portrait": "charcoal", "Charcoal Fine-Art Portrait": "charcoal",
  "Pastel Drawing Portrait": "pastel-drawing",
  "Ink Wash Portrait": "ink-wash",
  "Line Art Portrait": "line-art",
  "Pop Art Portrait": "pop-art",
  "Comic Book Portrait": "comic",
  "Manga Portrait": "manga",
  "Paper Cut Portrait": "paper-cut",
  "Pixel Art Portrait": "pixel",
  "RGB Split Portrait": "rgb-split",
  "Chromatic Aberration Portrait": "chromatic",
  "Glitch Portrait": "glitch", "Glitch Art Portrait": "glitch",
  "Motion Blur Portrait": "motion-blur",
  "Kaleidoscope Portrait": "kaleidoscope",
  "Mirror Reflection Portrait": "mirror",
};

// ─── The styles ───────────────────────────────────────────────────────────────

interface Style {
  id: string;
  name: string;
  group: string;
  /** The look it is drawn with on this server. Absent for styles only a picture model can make */
  look?: string;
  draw?: Draw;
  /** What a picture model is asked for */
  ask: string;
  /** Words in a written request that mean this style */
  words: string[];
}

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// A name can appear in more than one group, so the group's place on the list is part of the id
const STYLES: Style[] = PORTRAIT_GROUPS.flatMap((group, index) => group.styles.map((name) => {
  const look = LOOK_OF[name];
  const plain = name.toLowerCase().replace(/\s+portrait$/, "");
  return {
    id: `${index + 1}-${slug(name)}`,
    name,
    group: group.name,
    look,
    draw: look ? LOOKS[look] : undefined,
    ask: `a ${name} (one of the ${group.name.replace(/ aur /g, " and ")})`,
    words: plain.length >= 4 ? [name.toLowerCase(), plain] : [name.toLowerCase()],
  };
}));

/** Quick fixes, offered under the styles */
const TOOLS: Style[] = [
  {
    id: "enhance", name: "Enhance", group: "Tools", words: ["enhance", "improve", "sharpen", "clearer", "better quality"],
    ask: "the same photograph, sharper and cleaner with balanced light and colour",
    draw: async (img, v) => from(raw(tone(await from(raw(img).normalise()), { sat: pick([1.14, 1.05, 1.26, 1], v), contrast: pick([1.06, 1.02, 1.12, 1], v) })).sharpen({ sigma: pick([1.1, 0.8, 1.5, 0.7], v) })),
  },
  {
    id: "relight", name: "Relight", group: "Tools", words: ["relight", "brighter"],
    ask: "the same photograph with new, flattering lighting",
    draw: async (img, v) => {
      // Light falling from one side: warm, cool, a low dramatic key, or a soft even fill
      const look = pick<{ from: [number, number]; color: Rgb; lift: number; fall: number }>([
        { from: [0.2, 0.15], color: [255, 226, 180], lift: 1.18, fall: 0.5 },
        { from: [0.8, 0.15], color: [196, 224, 255], lift: 1.14, fall: 0.5 },
        { from: [0.5, 0.3], color: [255, 240, 220], lift: 1.25, fall: 0.95 },
        { from: [0.5, 0.5], color: [255, 255, 255], lift: 1.16, fall: 0.15 },
      ], v);
      const far = Math.sqrt(img.w * img.w + img.h * img.h);
      return each(img, (r, g, b, x, y) => {
        const d = Math.sqrt((x - look.from[0] * img.w) ** 2 + (y - look.from[1] * img.h) ** 2) / far;
        const k = look.lift * (1 - look.fall * d);
        const lit = 0.25 * Math.max(0, 1 - d * 1.6);
        return [r * k + (look.color[0] - 128) * lit, g * k + (look.color[1] - 128) * lit, b * k + (look.color[2] - 128) * lit];
      });
    },
  },
  {
    id: "recolor", name: "Recolor", group: "Tools", words: ["recolor", "recolour", "change the colour", "change the color", "different colour", "different color"],
    ask: "the same photograph with its colours changed",
    draw: async (img, v) => hueRotate(img, pick([60, 150, 220, 300], v)),
  },
];

const BY_ID = new Map([...STYLES, ...TOOLS].map((s) => [s.id, s]));

// ─── A picture model, when there is one ───────────────────────────────────────

let modelDownUntil = 0;

function imageModel(): string {
  // The older name is still read, so a server set up before the panel was renamed keeps working
  return (process.env.PORTRAIT_IMAGE_MODEL || process.env.TRANSFORM_IMAGE_MODEL || "").trim();
}

function canGenerate(): boolean {
  if (falPicture.chosen()) return falPicture.ready();
  return imageModel() !== "" && Date.now() > modelDownUntil && !!(process.env.AI_API_KEY || "").trim();
}

/** Asks the picture model to remake the photo; throws when it cannot */
async function generate(input: Buffer, instruction: string): Promise<Buffer> {
  const key = (process.env.AI_API_KEY || "").trim();
  const jpeg = await sharp(input).rotate().resize(1024, 1024, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 88 }).toBuffer();
  const asked = `${instruction} Keep the face and likeness of every person in the photo clearly recognisable. Do not add any text.`;
  if (falPicture.chosen()) return falPicture.make(asked, [jpeg], { timeoutMs: 90_000 });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(imageModel())}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: asked }, { inlineData: { mimeType: "image/jpeg", data: jpeg.toString("base64") } }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
    });
    if (!res.ok) {
      // No allowance or no access is not going to change in the next few minutes
      if ([401, 403, 404, 429].includes(res.status)) modelDownUntil = Date.now() + 10 * 60_000;
      console.error(`[portrait] picture model answered ${res.status}`);
      throw new Error("picture model unavailable");
    }
    const body: any = await res.json();
    const part = (body.candidates?.[0]?.content?.parts || []).find((p: any) => p.inlineData?.data);
    if (!part) throw new Error("no picture returned");
    return Buffer.from(part.inlineData.data, "base64");
  } finally {
    clearTimeout(timer);
  }
}

// ─── Saving and reading ───────────────────────────────────────────────────────

const NAME = /^t-[0-9a-f]{24}\.jpg$/;

async function save(img: Img | Buffer): Promise<{ name: string; width: number; height: number }> {
  fs.mkdirSync(AI_ASSET_DIR, { recursive: true });
  const name = `t-${crypto.randomBytes(12).toString("hex")}.jpg`;
  const pipeline = Buffer.isBuffer(img) ? sharp(img).rotate() : raw(img);
  const info = await pipeline.jpeg({ quality: 90, mozjpeg: true }).toFile(path.join(AI_ASSET_DIR, name));
  return { name, width: info.width, height: info.height };
}

/** A picture sent by the browser as a data address */
export function readImage(dataUrl: string): Buffer {
  const match = /^data:image\/(png|jpe?g|webp|gif|avif);base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl);
  if (!match) throw AppError.badRequest("That is not a picture Falcon can read.");
  const content = Buffer.from(match[2].replace(/\s+/g, ""), "base64");
  if (content.length < 200 || content.length > 12 * 1024 * 1024) throw AppError.badRequest("That picture is too large to use.");
  return content;
}

/** The style a written request names: the longest name found in it, and one drawn here when two are as long */
function styleFor(description: string): Style | null {
  const text = ` ${description.toLowerCase()} `;
  let best: Style | null = null, length = 0;
  for (const style of [...STYLES, ...TOOLS]) {
    for (const word of style.words) {
      if (!text.includes(word)) continue;
      if (word.length > length || (word.length === length && !best?.draw && style.draw)) { best = style; length = word.length; }
    }
  }
  return best;
}

export interface PortraitResult {
  url: string;
  width: number;
  height: number;
  variation: number;
}

export const portraitService = {
  /** The styles and tools the panel shows, and which of them can be made right now */
  catalogue() {
    const generative = canGenerate();
    const view = (s: Style) => ({ id: s.id, name: s.name, available: !!s.draw || generative, ...(s.draw ? { preview: s.look || s.id } : {}) });
    const groups: { name: string; styles: ReturnType<typeof view>[] }[] = [];
    for (const style of STYLES) {
      let group = groups.find((g) => g.name === style.group);
      if (!group) groups.push((group = { name: style.group, styles: [] }));
      group.styles.push(view(style));
    }
    return { groups, tools: TOOLS.map(view), describe: generative ? "any" : "styles" };
  },

  /** A small picture of every look that is drawn here, made from the user's own image. Styles name theirs in the catalogue */
  async previews(input: Buffer): Promise<Record<string, string>> {
    const small = await load(input, PREVIEW_SIZE);
    const out: Record<string, string> = {};
    const jobs: [string, Draw][] = [...Object.entries(LOOKS), ...TOOLS.map((t): [string, Draw] => [t.id, t.draw!])];
    await Promise.all(jobs.map(async ([key, draw]) => {
      try {
        out[key] = `data:image/jpeg;base64,${(await raw(await draw(small, 0)).jpeg({ quality: 78 }).toBuffer()).toString("base64")}`;
      } catch {
        // A look that fails on this picture simply has no preview
      }
    }));
    return out;
  },

  /**
   * Makes the picture in one style, in up to four variations. Also keeps a
   * copy of the original at the same size, for blending.
   */
  async run(input: Buffer, request: { style?: string; description?: string; count: number; baseUrl: string }): Promise<{ style: { id: string; name: string }; original: string; results: PortraitResult[] }> {
    const described = request.description?.trim() || "";
    let style = request.style ? BY_ID.get(request.style) || null : null;
    if (!style && described) style = styleFor(described);
    const url = (name: string) => `${request.baseUrl.replace(/\/+$/, "")}/ai-assets/${name}`;

    const img = await load(input, WORK_SIZE);
    const original = await save(img);
    const results: PortraitResult[] = [];

    // A written request, or a style that invents detail, goes to the picture model when there is one
    if ((!style || !style.draw) && canGenerate() && (style || described)) {
      const instruction = style ? `Turn this photo into ${style.ask}.${described ? ` ${described}.` : ""}` : `Remake this photo as follows: ${described}.`;
      const made = await Promise.allSettled(Array.from({ length: request.count }, () => generate(input, instruction)));
      for (const [variation, item] of made.entries()) {
        if (item.status !== "fulfilled") continue;
        // Brought to the size of the original, so the two line up when they are compared and blended
        const fitted = await from(sharp(item.value).resize(img.w, img.h, { fit: "cover" }));
        const saved = await save(fitted);
        results.push({ url: url(saved.name), width: saved.width, height: saved.height, variation });
      }
      if (results.length) return { style: { id: style?.id || "described", name: style?.name || "Your description" }, original: url(original.name), results };
    }

    if (!style) throw new AppError("Falcon can't make that from a description on this server yet. Pick one of the styles above instead.", 422, "PORTRAIT_UNAVAILABLE");
    if (!style.draw) throw new AppError(`${style.name} isn't available on this server yet. Try another style.`, 422, "PORTRAIT_UNAVAILABLE");

    for (let variation = 0; variation < request.count; variation++) {
      const saved = await save(await style.draw(img, variation));
      results.push({ url: url(saved.name), width: saved.width, height: saved.height, variation });
    }
    return { style: { id: style.id, name: style.name }, original: url(original.name), results };
  },

  /** The original and a result mixed together: 0 is the original, 100 the full result */
  async blend(request: { original: string; result: string; strength: number; baseUrl: string }): Promise<PortraitResult> {
    const file = (address: string) => {
      const name = address.split("/").pop() || "";
      if (!NAME.test(name) || !fs.existsSync(path.join(AI_ASSET_DIR, name))) throw AppError.badRequest("That picture is no longer available. Make the portrait again.");
      return path.join(AI_ASSET_DIR, name);
    };
    const a = await from(sharp(file(request.original)));
    const b = await from(sharp(file(request.result)).resize(a.w, a.h, { fit: "fill" }));
    const t = Math.min(1, Math.max(0, request.strength / 100));
    const mixed = each(a, (r, g, bl, _x, _y, i) => [r + (b.data[i * 3] - r) * t, g + (b.data[i * 3 + 1] - g) * t, bl + (b.data[i * 3 + 2] - bl) * t]);
    const saved = await save(mixed);
    return { url: `${request.baseUrl.replace(/\/+$/, "")}/ai-assets/${saved.name}`, width: saved.width, height: saved.height, variation: 0 };
  },
};
