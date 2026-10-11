/**
 * Original generated artwork for email templates.
 *
 * Email clients need real raster image URLs (SVG is stripped by Gmail and
 * Outlook), and the library should not depend on third-party stock photos. So
 * template imagery is drawn here, pixel by pixel, and encoded as PNG with
 * nothing but Node's zlib. Every parameter lives in the URL, which makes the
 * images cacheable forever and lets the thumbnail renderer redraw them.
 *
 *   /api/email-assets/art/{style}/{hex}-{hex}-{hex}/{seed}/{width}x{height}.png
 */
import zlib from "zlib";

export const ART_STYLES = ["gradient", "orbs", "stripes", "waves", "grid", "sun", "peaks", "dots"] as const;
export type ArtStyle = (typeof ART_STYLES)[number];

export interface ArtParams {
  style: ArtStyle;
  colors: string[];
  seed: number;
  width: number;
  height: number;
}

const MAX_SIDE = 1400;
const MAX_AREA = 1_200_000;

export function artPath(style: ArtStyle, colors: string[], seed: number, width: number, height: number): string {
  const hex = colors.slice(0, 3).map((c) => c.replace("#", "").toLowerCase()).join("-");
  return `/api/email-assets/art/${style}/${hex}/${seed}/${Math.round(width)}x${Math.round(height)}.png`;
}

export function parseArtParams(style: string, colors: string, seed: string, size: string): ArtParams | null {
  if (!(ART_STYLES as readonly string[]).includes(style)) return null;
  if (!/^[0-9a-f]{6}(-[0-9a-f]{6}){1,3}$/i.test(colors)) return null;
  const dims = /^(\d{1,4})x(\d{1,4})\.png$/.exec(size);
  if (!dims || !/^\d{1,9}$/.test(seed)) return null;
  const width = parseInt(dims[1], 10);
  const height = parseInt(dims[2], 10);
  if (width < 8 || height < 8 || width > MAX_SIDE || height > MAX_SIDE || width * height > MAX_AREA) return null;
  return { style: style as ArtStyle, colors: colors.split("-").map((c) => `#${c}`), seed: parseInt(seed, 10), width, height };
}

// ─── PNG encoding ─────────────────────────────────────────────────────────────

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, crc]);
}

function encodePng(width: number, height: number, rgb: Uint8Array): Buffer {
  const stride = width * 3 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0; // filter: none
    raw.set(rgb.subarray(y * width * 3, (y + 1) * width * 3), y * stride + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 6 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ─── Drawing ──────────────────────────────────────────────────────────────────

function rgbOf(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rng(seed: number) {
  let a = (seed >>> 0) || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function renderArt(params: ArtParams): Buffer {
  const { width: w, height: h, style } = params;
  const [c1, c2, c3] = [rgbOf(params.colors[0]), rgbOf(params.colors[1]), rgbOf(params.colors[2] || params.colors[0])];
  const white: [number, number, number] = [255, 255, 255];
  const rand = rng(params.seed * 7919 + style.length);
  const px = new Uint8Array(w * h * 3);

  // Base: diagonal two-colour gradient whose angle depends on the seed
  const angle = rand() * 0.8 + 0.1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const t = Math.min(1, Math.max(0, (x / w) * angle + (y / h) * (1 - angle)));
      const i = (y * w + x) * 3;
      px[i] = c1[0] + (c2[0] - c1[0]) * t;
      px[i + 1] = c1[1] + (c2[1] - c1[1]) * t;
      px[i + 2] = c1[2] + (c2[2] - c1[2]) * t;
    }
  }

  const blend = (x: number, y: number, color: [number, number, number], alpha: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h || alpha <= 0) return;
    const i = (y * w + x) * 3;
    px[i] += (color[0] - px[i]) * alpha;
    px[i + 1] += (color[1] - px[i + 1]) * alpha;
    px[i + 2] += (color[2] - px[i + 2]) * alpha;
  };

  const disc = (cx: number, cy: number, r: number, color: [number, number, number], alpha: number, soft: number) => {
    const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(w - 1, Math.ceil(cx + r));
    const y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(h - 1, Math.ceil(cy + r));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d = Math.hypot(x - cx, y - cy) / r;
        if (d < 1) blend(x, y, color, alpha * (soft ? Math.min(1, (1 - d) / soft) : 1));
      }
    }
  };

  const unit = Math.min(w, h);
  if (style === "orbs") {
    for (let i = 0; i < 4; i++) {
      disc(rand() * w, rand() * h, unit * (0.25 + rand() * 0.35), i % 2 ? white : c3, 0.18 + rand() * 0.3, 0.6);
    }
  } else if (style === "stripes") {
    const period = unit * (0.12 + rand() * 0.14);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const band = Math.floor((x + y) / period);
        if (band % 2 === 0) blend(x, y, band % 4 === 0 ? c3 : white, 0.16);
      }
    }
  } else if (style === "waves") {
    const bands = 3 + Math.floor(rand() * 3);
    const phase = rand() * 6;
    for (let b = 0; b < bands; b++) {
      const base = (h / (bands + 1)) * (b + 1);
      const amp = unit * (0.05 + rand() * 0.08);
      const freq = (2 + rand() * 3) / w;
      for (let x = 0; x < w; x++) {
        const top = Math.round(base + Math.sin(x * freq * Math.PI + phase + b) * amp);
        for (let y = Math.max(0, top); y < h; y++) blend(x, y, b % 2 ? white : c3, 0.14);
      }
    }
  } else if (style === "grid") {
    const cell = Math.max(12, Math.round(unit * (0.16 + rand() * 0.12)));
    const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
    const alphas = Array.from({ length: cols * rows }, () => (rand() < 0.55 ? rand() * 0.32 : 0));
    const tint = Array.from({ length: cols * rows }, () => rand() < 0.5);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const gx = Math.floor(x / cell), gy = Math.floor(y / cell);
        if (x % cell < 2 || y % cell < 2) continue;
        const k = gy * cols + gx;
        if (alphas[k]) blend(x, y, tint[k] ? c3 : white, alphas[k]);
      }
    }
  } else if (style === "sun") {
    const cx = w * (0.25 + rand() * 0.5), cy = h * (0.35 + rand() * 0.2), r = unit * (0.22 + rand() * 0.14);
    disc(cx, cy, r * 1.7, white, 0.12, 0.9);
    disc(cx, cy, r, c3, 0.9, 0.04);
    const horizon = Math.round(h * (0.68 + rand() * 0.1));
    for (let y = horizon; y < h; y++) {
      const fade = 0.35 + ((y - horizon) / Math.max(1, h - horizon)) * 0.35;
      for (let x = 0; x < w; x++) blend(x, y, c1, fade);
    }
  } else if (style === "peaks") {
    for (let layer = 0; layer < 3; layer++) {
      const base = h * (0.45 + layer * 0.17);
      const amp = h * (0.22 - layer * 0.04);
      const f1 = (1.5 + rand() * 2) / w, f2 = (4 + rand() * 4) / w, p = rand() * 6;
      for (let x = 0; x < w; x++) {
        const top = Math.round(base - Math.abs(Math.sin(x * f1 * Math.PI + p)) * amp - Math.sin(x * f2 * Math.PI + p) * amp * 0.2);
        for (let y = Math.max(0, top); y < h; y++) blend(x, y, layer === 1 ? white : c3, 0.2 + layer * 0.1);
      }
    }
  } else if (style === "dots") {
    const step = Math.max(14, Math.round(unit * (0.1 + rand() * 0.06)));
    for (let gy = step / 2; gy < h; gy += step) {
      for (let gx = step / 2; gx < w; gx += step) {
        const size = step * (0.12 + ((gx / w + gy / h) / 2) * 0.3);
        disc(gx, gy, size, (Math.round(gx / step) + Math.round(gy / step)) % 3 ? white : c3, 0.3, 0.2);
      }
    }
  } else {
    disc(w * (0.6 + rand() * 0.3), h * (0.2 + rand() * 0.3), unit * 0.7, white, 0.12, 0.9);
  }

  return encodePng(w, h, px);
}

// ─── Small LRU so repeat requests skip the pixel loop ─────────────────────────

const cache = new Map<string, Buffer>();
const CACHE_LIMIT = 300;

export function renderArtCached(params: ArtParams): Buffer {
  const key = artPath(params.style, params.colors, params.seed, params.width, params.height);
  const hit = cache.get(key);
  if (hit) {
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }
  const png = renderArt(params);
  cache.set(key, png);
  if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value as string);
  return png;
}
