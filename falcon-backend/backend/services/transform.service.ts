/**
 * transform.service.ts
 *
 * The editor's Transform panel: restyles a picture the user has chosen.
 *
 * Two ways of making a result:
 *
 *  - Drawn here. Most styles are real image processing done on this server:
 *    smoothing, edge finding, posterising, tone mapping, halftone and so on.
 *    They are instant and need no outside service.
 *
 *  - Generated. Styles that invent new detail (a 3D character, an anime
 *    redraw, a clay figure) need a picture model. They are offered only when
 *    one is configured (TRANSFORM_IMAGE_MODEL) and answering; otherwise the
 *    panel shows them as unavailable instead of pretending.
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

// ─── The styles ───────────────────────────────────────────────────────────────

type Draw = (img: Img, variation: number) => Promise<Img>;

interface Style {
  id: string;
  name: string;
  group: string;
  /** Drawn on this server. Absent for styles only a picture model can make */
  draw?: Draw;
  /** What a picture model is asked for */
  ask: string;
  /** Words in a written request that mean this style */
  words: string[];
}

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

const STYLES: Style[] = [
  // ── Art ────────────────────────────────────────────────────────────────────
  {
    id: "watercolor", name: "Watercolor", group: "Art", words: ["watercolor", "watercolour", "painted", "painting"],
    ask: "a loose watercolor painting on textured paper, soft washes of colour bleeding into each other",
    draw: async (img, v) => {
      const soft = await blur(tone(await smooth(img, pick([9, 7, 11, 9], v)), { sat: pick([1.3, 1.1, 1.5, 0.9], v), bright: 1.06 }), 0.8);
      const edges = edgeMap(await blur(img, 1.4), 1.6);
      // Thinned towards paper white, with faint darker pooling along the edges, as wet paint dries
      return each(soft, (r, g, b, _x, _y, i) => {
        const paper = 0.14 + noise(i, 3) * 0.05, pool = 1 - Math.min(0.28, edges[i] * 0.45);
        return [(r + (250 - r) * paper) * pool, (g + (247 - g) * paper) * pool, (b + (240 - b) * paper) * pool];
      });
    },
  },
  {
    id: "oil-paint", name: "Oil Paint", group: "Art", words: ["oil paint", "oil painting", "oil"],
    ask: "a rich oil painting with thick visible brushstrokes and deep colour",
    draw: async (img, v) => from(raw(tone(await smooth(img, pick([11, 13, 9, 11], v)), { sat: pick([1.4, 1.25, 1.6, 1.15], v), contrast: 1.12 })).sharpen({ sigma: 1.2 })),
  },
  {
    id: "acrylic", name: "Acrylic", group: "Art", words: ["acrylic"],
    ask: "a bold acrylic painting with flat opaque colour and confident brushwork",
    draw: async (img, v) => posterize(tone(await smooth(img, pick([7, 9, 5, 7], v)), { sat: pick([1.6, 1.4, 1.8, 1.3], v), contrast: 1.15 }), pick([9, 7, 11, 8], v)),
  },
  { id: "digital-art", name: "Digital Art", group: "Art", words: ["digital art", "digital painting"], ask: "polished digital art with clean rendering, dramatic lighting and vivid colour" },
  { id: "illustration", name: "Illustration", group: "Art", words: ["illustration", "illustrated"], ask: "a modern editorial illustration with simplified shapes and a limited, harmonious palette" },
  {
    id: "ink", name: "Ink", group: "Art", words: ["ink", "inked"],
    ask: "a brush and ink drawing in solid black on white paper",
    draw: async (img, v) => {
      const local = luminance(await blur(img, 17));
      const l = luminance(await blur(img, 0.8));
      const bias = pick([0.94, 0.9, 0.98, 0.86], v);
      return each(img, (_r, _g, _b, _x, _y, i) => (l[i] < local[i] * bias || l[i] < 46 ? [22, 22, 26] : [250, 248, 242]));
    },
  },
  {
    id: "pencil", name: "Pencil", group: "Art", words: ["pencil", "sketch", "hand-drawn", "hand drawn", "drawing", "hand-drawn illustration", "hand drawn illustration"],
    ask: "a detailed graphite pencil sketch on white paper",
    draw: async (img, v) => {
      const lines = await sketch(img, 6 * pick([1, 1.6, 0.7, 2.2], v));
      const gamma = pick([1.6, 1.3, 2, 1.1], v);
      return each(img, (_r, _g, _b, _x, _y, i) => {
        const g = 255 * Math.pow(lines[i] / 255, gamma) + noise(i, 5) * 10;
        return [g, g, g * 0.99];
      });
    },
  },
  {
    id: "charcoal", name: "Charcoal", group: "Art", words: ["charcoal"],
    ask: "a smudged charcoal drawing with deep blacks on grey paper",
    draw: async (img, v) => {
      const lines = await sketch(img, 15 * pick([1, 1.4, 0.8, 1.8], v));
      const l = luminance(img);
      return each(img, (_r, _g, _b, _x, _y, i) => {
        const g = 255 * Math.pow(lines[i] / 255, 2.6) * 0.72 + l[i] * 0.28 + noise(i, 9) * 34 - 8;
        return [g * 0.98, g * 0.97, g * 0.95];
      });
    },
  },
  {
    id: "line-art", name: "Line Art", group: "Art", words: ["line art", "outline", "lines"],
    ask: "clean black line art on white, outlines only with no shading",
    draw: async (img, v) => {
      const edges = edgeMap(await blur(img, pick([1.3, 1.9, 0.9, 2.6], v)), pick([2.6, 3.2, 2.2, 3.8], v));
      return each(img, (_r, _g, _b, _x, _y, i) => {
        const a = Math.min(1, Math.max(0, (edges[i] - 0.2) * 5));
        const g = 252 - a * 232;
        return [g, g, g];
      });
    },
  },

  // ── Character ──────────────────────────────────────────────────────────────
  { id: "cartoon", name: "Cartoon", group: "Character", words: ["cartoon"], ask: "a clean cartoon with flat colour and bold outlines", draw: (img, v) => cartoon(img, v, 6) },
  { id: "3d", name: "3D", group: "Character", words: ["3d", "3-d", "render", "3d character", "3d render"], ask: "a stylised 3D rendered character with soft studio lighting, like a modern animated film" },
  { id: "chibi", name: "Chibi", group: "Character", words: ["chibi"], ask: "a cute chibi character with a large head, small body and big expressive eyes" },
  { id: "clay", name: "Clay", group: "Character", words: ["clay", "claymation"], ask: "a handmade clay figure with visible fingerprints and soft plasticine texture, as in stop-motion" },
  { id: "toy", name: "Toy", group: "Character", words: ["toy"], ask: "a glossy collectible vinyl toy figure on a plain background" },
  { id: "action-figure", name: "Action Figure", group: "Character", words: ["action figure"], ask: "a boxed action figure with accessories in clear plastic packaging" },
  { id: "game-character", name: "Game Character", group: "Character", words: ["game character", "video game"], ask: "a stylised video game character with a hero pose and dramatic rim lighting" },

  // ── Anime & comic ──────────────────────────────────────────────────────────
  { id: "anime", name: "Anime", group: "Anime & Comic", words: ["anime"], ask: "a detailed anime illustration with cel shading and luminous colour" },
  {
    id: "manga", name: "Manga", group: "Anime & Comic", words: ["manga"],
    ask: "a black and white manga panel with screentone shading and strong ink lines",
    draw: async (img, v) => {
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
  },
  { id: "comic", name: "Comic", group: "Anime & Comic", words: ["comic", "comic-book", "comic book"], ask: "a comic book panel with bold ink outlines, flat colour and halftone dots", draw: (img, v) => cartoon(img, v, 5, pick([8, 10, 7, 12], v)) },
  {
    id: "graphic-novel", name: "Graphic Novel", group: "Anime & Comic", words: ["graphic novel", "noir"],
    ask: "a moody graphic novel panel in heavy black ink with a single accent colour",
    draw: async (img, v) => {
      const flat = luminance(await smooth(img, 9));
      const edges = edgeMap(await blur(img, 1.2), 2.8);
      const accent = pick<Rgb>([[196, 30, 44], [28, 96, 168], [214, 150, 30], [40, 130, 110]], v);
      return each(img, (_r, _g, _b, _x, _y, i) => {
        if (edges[i] > 0.24) return [12, 12, 16];
        const l = flat[i] / 255;
        return l < 0.3 ? [12, 12, 16] : l < 0.58 ? accent : [246, 242, 232];
      });
    },
  },

  // ── Creative ───────────────────────────────────────────────────────────────
  { id: "sticker", name: "Sticker", group: "Creative", words: ["sticker"], ask: "a die-cut sticker of the main subject with a thick white border and a soft drop shadow" },
  {
    id: "pixel-art", name: "Pixel Art", group: "Creative", words: ["pixel", "8-bit", "8 bit", "retro game"],
    ask: "retro pixel art with a limited colour palette and crisp square pixels",
    draw: async (img, v) => {
      const across = pick([72, 48, 96, 36], v);
      const small = posterize(tone(await from(raw(img).resize(across, Math.max(1, Math.round((across * img.h) / img.w)), { kernel: "nearest" })), { sat: 1.3, contrast: 1.1 }), 5);
      return from(raw(small).resize(img.w, img.h, { kernel: "nearest" }));
    },
  },
  {
    id: "pop-art", name: "Pop Art", group: "Creative", words: ["pop art", "warhol"],
    ask: "a pop art print with flat, saturated blocks of colour and bold contrast",
    draw: async (img, v) => {
      const l = luminance(await smooth(img, 5));
      const palette = pick(POP, v);
      const edges = edgeMap(await blur(img, 1.2), 2.4);
      return each(img, (_r, _g, _b, _x, _y, i) => (edges[i] > 0.3 ? palette[0] : palette[Math.min(3, Math.floor((l[i] / 256) * 4))]));
    },
  },
  {
    id: "doodle", name: "Doodle", group: "Creative", words: ["doodle", "scribble"],
    ask: "a playful hand-drawn doodle in marker pen on notebook paper",
    draw: async (img, v) => {
      const edges = edgeMap(await blur(img, pick([2.2, 3, 1.6, 3.6], v)), 3.4);
      const wash = tone(await smooth(img, 11), { sat: 1.4, bright: 1.1 });
      const pen = pick<Rgb>([[28, 38, 92], [24, 24, 28], [150, 30, 40], [20, 90, 70]], v);
      return each(wash, (r, g, b, _x, _y, i) => {
        const paper: Rgb = [252, 249, 240];
        const base = mix(paper, [r, g, b], 0.22);
        const a = Math.min(1, Math.max(0, (edges[i] - 0.16) * 6));
        return mix(base, pen, a);
      });
    },
  },
  {
    id: "paper-cut", name: "Paper Cut", group: "Creative", words: ["paper cut", "papercut", "paper craft"],
    ask: "layered cut paper craft with flat coloured sheets and soft shadows between the layers",
    draw: async (img, v) => {
      const flat = posterize(tone(await blur(await smooth(img, 13), 2.2), { sat: pick([1.35, 1.1, 1.6, 0.9], v) }), pick([4, 5, 3, 6], v));
      // A thin shadow where one sheet lies over another
      const edges = edgeMap(flat, 3);
      return each(flat, (r, g, b, _x, _y, i) => {
        const k = 1 - Math.min(0.32, edges[i] * 0.6);
        return [r * k, g * k, b * k];
      });
    },
  },
  { id: "collage", name: "Collage", group: "Creative", words: ["collage"], ask: "a mixed-media collage of torn paper, photo cut-outs and painted marks" },

  // ── Futuristic ─────────────────────────────────────────────────────────────
  {
    id: "cyberpunk", name: "Cyberpunk", group: "Futuristic", words: ["cyberpunk", "cyber"],
    ask: "a cyberpunk scene lit by magenta and cyan neon, rain-slick and high-tech",
    draw: async (img, v) => {
      const stops = pick(DUOTONES, v);
      const l = luminance(tone(img, { contrast: 1.25 }));
      return each(img, (r, g, b, _x, _y, i) => mix([r, g, b], ramp(stops, l[i] / 255), 0.72));
    },
  },
  {
    id: "neon", name: "Neon", group: "Futuristic", words: ["neon", "glow"],
    ask: "glowing neon outlines on a dark background, like a neon sign",
    draw: async (img, v) => {
      const lines = edgeMap(await blur(img, 1.2), 3);
      const glowSource: Img = { data: Buffer.from(Array.from(lines, (e) => [e * 255, e * 255, e * 255]).flat()), w: img.w, h: img.h };
      const glow = luminance(await blur(glowSource, 7));
      const stops = pick<Rgb[]>([[[255, 40, 200], [60, 230, 255]], [[60, 255, 160], [255, 240, 80]], [[255, 90, 40], [255, 40, 160]], [[90, 120, 255], [200, 80, 255]]], v);
      return each(img, (r, g, b, x, _y, i) => {
        const color = ramp(stops, x / img.w);
        const line = Math.min(1, Math.max(0, (lines[i] - 0.14) * 4)), halo = Math.min(1, (glow[i] / 255) * 2.4);
        return [r * 0.1 + color[0] * (line + halo * 0.7) + 255 * line * 0.35, g * 0.1 + color[1] * (line + halo * 0.7) + 255 * line * 0.35, b * 0.14 + color[2] * (line + halo * 0.7) + 255 * line * 0.35];
      });
    },
  },
  {
    id: "sci-fi", name: "Sci-Fi", group: "Futuristic", words: ["sci-fi", "scifi", "science fiction", "futuristic"],
    ask: "a cinematic science fiction scene with cool teal light, lens glow and advanced technology",
    draw: async (img, v) => {
      const bloom = await blur(img, 12);
      const tint = pick<Rgb[]>([[[6, 40, 60], [255, 170, 90]], [[10, 20, 70], [120, 220, 255]], [[20, 50, 40], [200, 255, 170]], [[40, 10, 60], [255, 150, 220]]], v);
      return each(tone(img, { contrast: 1.2, sat: 0.9, bright: 0.9 }), (r, g, b, _x, y, i) => {
        const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const graded = mix([r, g, b], ramp([tint[0], [r, g, b] as Rgb, tint[1]], l), 0.42);
        const p = i * 3, lift = Math.max(0, (0.299 * bloom.data[p] + 0.587 * bloom.data[p + 1] + 0.114 * bloom.data[p + 2]) / 255 - 0.7) * 0.5;
        const scan = y % 4 === 0 ? 0.93 : 1;
        return [(graded[0] + bloom.data[p] * lift) * scan, (graded[1] + bloom.data[p + 1] * lift) * scan, (graded[2] + bloom.data[p + 2] * lift) * scan];
      });
    },
  },
  {
    id: "holographic", name: "Holographic", group: "Futuristic", words: ["holographic", "hologram", "iridescent"],
    ask: "an iridescent holographic foil effect shifting through pastel rainbow colours",
    draw: async (img, v) => {
      const foil: Rgb[] = [[255, 140, 220], [140, 200, 255], [150, 255, 220], [255, 245, 160], [255, 170, 200], [170, 150, 255]];
      const turn = pick([0, 0.33, 0.66, 0.15], v);
      return each(img, (r, g, b, x, y) => {
        const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const t = (l * 1.4 + (x + y) / (img.w + img.h) + turn) % 1;
        const c = ramp(foil, t);
        // The sheen takes its colour from the foil and its light and dark from the picture, so the shapes still read
        const shade = 0.35 + l * 0.75;
        return mix([r, g, b], [c[0] * shade, c[1] * shade, c[2] * shade], 0.62);
      });
    },
  },

  // ── Classic ────────────────────────────────────────────────────────────────
  {
    id: "vintage", name: "Vintage", group: "Classic", words: ["vintage", "old photo", "sepia", "antique"],
    ask: "a faded vintage photograph with warm sepia tones and soft worn edges",
    draw: async (img, v) => {
      const warmth = pick([1, 0.7, 1.25, 0.5], v);
      const faded = each(img, (r, g, b, _x, _y, i) => {
        const sepia: Rgb = [r * 0.393 + g * 0.769 + b * 0.189, r * 0.349 + g * 0.686 + b * 0.168, r * 0.272 + g * 0.534 + b * 0.131];
        const c = mix([r, g, b], sepia, Math.min(1, 0.7 * warmth));
        const grain = noise(i, 11) * 14;
        return [c[0] * 0.9 + 26 + grain, c[1] * 0.9 + 22 + grain, c[2] * 0.88 + 18 + grain];
      });
      return vignette(faded, 0.45);
    },
  },
  {
    id: "film", name: "Film", group: "Classic", words: ["film", "analog", "analogue", "cinematic"],
    ask: "an analogue film photograph with fine grain, gentle contrast and natural colour",
    draw: async (img, v) => {
      const look = pick<[Rgb, Rgb]>([[[14, 22, 34], [255, 236, 208]], [[26, 18, 30], [255, 226, 214]], [[10, 30, 28], [246, 244, 210]], [[20, 20, 24], [240, 240, 240]]], v);
      return vignette(each(tone(img, { sat: 0.88, contrast: 1.1 }), (r, g, b, _x, _y, i) => {
        const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const c = mix([r, g, b], l < 0.5 ? look[0] : look[1], 0.14);
        const grain = noise(i, 17) * 22;
        return [c[0] + grain, c[1] + grain, c[2] + grain];
      }), 0.3);
    },
  },
  {
    id: "black-and-white", name: "Black & White", group: "Classic", words: ["black and white", "black & white", "monochrome", "greyscale", "grayscale", "b&w"],
    ask: "a striking black and white photograph with rich tonal range",
    draw: async (img, v) => {
      const contrast = pick([1.2, 1.55, 0.95, 1.3], v);
      const tint = pick<Rgb>([[255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 244, 226]], v);
      return each(img, (r, g, b) => {
        const l = ((0.299 * r + 0.587 * g + 0.114 * b - 128) * contrast + 128) / 255;
        return [l * tint[0], l * tint[1], l * tint[2]];
      });
    },
  },
  {
    id: "retro", name: "Retro", group: "Classic", words: ["retro", "70s", "80s", "seventies", "eighties"],
    ask: "a retro print in warm faded colour with visible halftone, like a 1970s magazine",
    draw: async (img, v) => {
      const flat = posterize(tone(await smooth(img, 5), { sat: 1.15 }), 6);
      const wash = pick<Rgb>([[255, 196, 120], [255, 160, 150], [150, 210, 200], [240, 220, 140]], v);
      const cell = Math.max(4, Math.round((7 * img.w) / 900));
      return each(flat, (r, g, b, x, y) => {
        const c = mix([r, g, b], wash, 0.22);
        const dark = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const k = dark > 0.45 && !halftone(x, y, (dark - 0.45) * 0.8, cell) ? 0.78 : 1;
        return [c[0] * k * 0.94 + 14, c[1] * k * 0.94 + 12, c[2] * k * 0.92 + 10];
      });
    },
  },
];

/** Quick fixes, offered under the styles */
const TOOLS: Style[] = [
  {
    id: "enhance", name: "Enhance", group: "Tools", words: ["enhance", "improve", "sharpen", "clearer", "better quality"],
    ask: "the same photograph, sharper and cleaner with balanced light and colour",
    draw: async (img, v) => from(raw(tone(await from(raw(img).normalise()), { sat: pick([1.14, 1.05, 1.26, 1], v), contrast: pick([1.06, 1.02, 1.12, 1], v) })).sharpen({ sigma: pick([1.1, 0.8, 1.5, 0.7], v) })),
  },
  {
    id: "relight", name: "Relight", group: "Tools", words: ["relight", "lighting", "brighter", "light"],
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
  return process.env.TRANSFORM_IMAGE_MODEL?.trim() || "";
}

function canGenerate(): boolean {
  return imageModel() !== "" && Date.now() > modelDownUntil && !!(process.env.AI_API_KEY || "").trim();
}

/** Asks the picture model to redraw the image; throws when it cannot */
async function generate(input: Buffer, instruction: string): Promise<Buffer> {
  const key = (process.env.AI_API_KEY || "").trim();
  const jpeg = await sharp(input).rotate().resize(1024, 1024, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 88 }).toBuffer();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(imageModel())}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Redraw this picture as ${instruction}. Keep the same subject, pose and composition. Do not add any text.` }, { inlineData: { mimeType: "image/jpeg", data: jpeg.toString("base64") } }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
    });
    if (!res.ok) {
      // No allowance or no access is not going to change in the next few minutes
      if ([401, 403, 404, 429].includes(res.status)) modelDownUntil = Date.now() + 10 * 60_000;
      console.error(`[transform] picture model answered ${res.status}`);
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
  if (content.length < 200 || content.length > 12 * 1024 * 1024) throw AppError.badRequest("That picture is too large to transform.");
  return content;
}

function styleFor(description: string): Style | null {
  const text = ` ${description.toLowerCase()} `;
  let best: Style | null = null, length = 0;
  for (const style of [...STYLES, ...TOOLS]) {
    for (const word of style.words) {
      if (word.length > length && text.includes(word)) { best = style; length = word.length; }
    }
  }
  return best;
}

export interface TransformResult {
  url: string;
  width: number;
  height: number;
  variation: number;
}

export const transformService = {
  /** The styles and tools the panel shows, and which of them can be made right now */
  catalogue() {
    const generative = canGenerate();
    const view = (s: Style) => ({ id: s.id, name: s.name, available: !!s.draw || generative });
    const groups: { name: string; styles: ReturnType<typeof view>[] }[] = [];
    for (const style of STYLES) {
      let group = groups.find((g) => g.name === style.group);
      if (!group) groups.push((group = { name: style.group, styles: [] }));
      group.styles.push(view(style));
    }
    return { groups, tools: TOOLS.map(view), describe: generative ? "any" : "styles" };
  },

  /** A small picture of every style that is drawn here, made from the user's own image */
  async previews(input: Buffer): Promise<Record<string, string>> {
    const small = await load(input, PREVIEW_SIZE);
    const out: Record<string, string> = {};
    await Promise.all([...STYLES, ...TOOLS].filter((s) => s.draw).map(async (style) => {
      try {
        const done = await style.draw!(small, 0);
        out[style.id] = `data:image/jpeg;base64,${(await raw(done).jpeg({ quality: 78 }).toBuffer()).toString("base64")}`;
      } catch {
        // A style that fails on this picture simply has no preview
      }
    }));
    return out;
  },

  /**
   * Makes the picture in one style, in up to four variations. Also keeps a
   * copy of the original at the same size, for blending.
   */
  async run(input: Buffer, request: { style?: string; description?: string; count: number; baseUrl: string }): Promise<{ style: { id: string; name: string }; original: string; results: TransformResult[] }> {
    const described = request.description?.trim() || "";
    let style = request.style ? BY_ID.get(request.style) || null : null;
    if (!style && described) style = styleFor(described);
    const url = (name: string) => `${request.baseUrl.replace(/\/+$/, "")}/ai-assets/${name}`;

    const img = await load(input, WORK_SIZE);
    const original = await save(img);
    const results: TransformResult[] = [];

    // A written request, or a style that invents detail, goes to the picture model when there is one
    const instruction = described && (!style || !style.draw) ? described : style?.ask || "";
    if ((!style || !style.draw) && canGenerate() && instruction) {
      const made = await Promise.allSettled(Array.from({ length: request.count }, () => generate(input, style ? `${style.ask}${described ? `. ${described}` : ""}` : instruction)));
      for (const [variation, item] of made.entries()) {
        if (item.status !== "fulfilled") continue;
        // Brought to the size of the original, so the two line up when they are compared and blended
        const fitted = await from(sharp(item.value).resize(img.w, img.h, { fit: "cover" }));
        const saved = await save(fitted);
        results.push({ url: url(saved.name), width: saved.width, height: saved.height, variation });
      }
      if (results.length) return { style: { id: style?.id || "described", name: style?.name || "Your description" }, original: url(original.name), results };
    }

    if (!style) throw new AppError("Falcon can't make that from a description on this server yet. Pick one of the styles above instead.", 422, "TRANSFORM_UNAVAILABLE");
    if (!style.draw) throw new AppError(`${style.name} isn't available on this server yet. Try another style.`, 422, "TRANSFORM_UNAVAILABLE");

    for (let variation = 0; variation < request.count; variation++) {
      const saved = await save(await style.draw(img, variation));
      results.push({ url: url(saved.name), width: saved.width, height: saved.height, variation });
    }
    return { style: { id: style.id, name: style.name }, original: url(original.name), results };
  },

  /** The original and a result mixed together: 0 is the original, 100 the full result */
  async blend(request: { original: string; result: string; strength: number; baseUrl: string }): Promise<TransformResult> {
    const file = (address: string) => {
      const name = address.split("/").pop() || "";
      if (!NAME.test(name) || !fs.existsSync(path.join(AI_ASSET_DIR, name))) throw AppError.badRequest("That picture is no longer available. Transform the image again.");
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
