// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Asset Engine – Frames Engine
//  22 frame templates × 26 style variants = 572 unique frames
// ─────────────────────────────────────────────────────────────────────────────

import { AssetDef, Palette } from "./types";
import { PALETTES, getPalette } from "./palette";
import { svgDataUri, wrapSvg, linearGrad, darken, lighten } from "./svgUtils";

const FRAME_STYLE_VARIANTS = [
  { id: "classic",      stroke: (p: Palette) => p.primary,              fill: (_: Palette) => "none",             sw: 6 },
  { id: "bold",         stroke: (p: Palette) => p.dark,                 fill: (_: Palette) => "none",             sw: 12 },
  { id: "double",       stroke: (p: Palette) => p.secondary,            fill: (_: Palette) => "none",             sw: 4 },
  { id: "filled-dark",  stroke: (_: Palette) => "none",                 fill: (p: Palette) => darken(p.dark, 0.4), sw: 0 },
  { id: "filled-color", stroke: (_: Palette) => "none",                 fill: (p: Palette) => p.primary,          sw: 0 },
  { id: "gradient",     stroke: (p: Palette) => "url(#gf)",             fill: (_: Palette) => "none",             sw: 6 },
  { id: "glass",        stroke: (p: Palette) => p.primary,              fill: (p: Palette) => p.primary + "22",   sw: 4 },
  { id: "neon",         stroke: (p: Palette) => p.accent,               fill: (_: Palette) => "none",             sw: 5 },
  { id: "white",        stroke: (_: Palette) => "#ffffff",              fill: (_: Palette) => "none",             sw: 6 },
  { id: "shadow-fill",  stroke: (_: Palette) => "none",                 fill: (p: Palette) => p.secondary + "88", sw: 0 },
  { id: "thin",         stroke: (p: Palette) => p.primary,              fill: (_: Palette) => "none",             sw: 2 },
  { id: "accent-fill",  stroke: (_: Palette) => "none",                 fill: (p: Palette) => p.accent + "cc",    sw: 0 },
  { id: "duo-color",    stroke: (p: Palette) => p.accent,               fill: (p: Palette) => p.primary + "33",   sw: 5 },
];

interface FrameTemplate {
  id: string;
  name: string;
  subcategory: string;
  tags: string[];
  keywords: string[];
  width: number;
  height: number;
  /** Renders the frame shape—fill/stroke applied by variant */
  renderPath: (p: Palette, v: typeof FRAME_STYLE_VARIANTS[0]) => string;
}

const FRAME_TEMPLATES: FrameTemplate[] = [
  // ── BASIC ─────────────────────────────────────────────────────────────────
  {
    id: "rect-frame", name: "Rectangle Frame", subcategory: "Basic", width: 200, height: 150,
    tags: ["rectangle","frame","basic","border","photo"], keywords: ["rectangle","photo frame","border"],
    renderPath: (p, v) => {
      const defs = v.id === "gradient" ? `<defs>${linearGrad("gf", p.primary, p.secondary, 90)}</defs>` : "";
      return svgDataUri(wrapSvg(`${defs}<rect x="8" y="8" width="184" height="134" rx="4" fill="${v.fill(p)}" stroke="${v.stroke(p)}" stroke-width="${v.sw}"/>`));
    },
  },
  {
    id: "rounded-frame", name: "Rounded Frame", subcategory: "Basic", width: 200, height: 150,
    tags: ["rounded","frame","border","photo","soft"], keywords: ["rounded frame","soft","modern"],
    renderPath: (p, v) => {
      const defs = v.id === "gradient" ? `<defs>${linearGrad("gf", p.primary, p.secondary)}</defs>` : "";
      return svgDataUri(wrapSvg(`${defs}<rect x="8" y="8" width="184" height="134" rx="24" fill="${v.fill(p)}" stroke="${v.stroke(p)}" stroke-width="${v.sw}"/>`));
    },
  },
  {
    id: "circle-frame", name: "Circle Frame", subcategory: "Basic", width: 180, height: 180,
    tags: ["circle","round","frame","border","portrait"], keywords: ["circle frame","round","portrait","avatar"],
    renderPath: (p, v) => {
      const defs = v.id === "gradient" ? `<defs>${linearGrad("gf", p.primary, p.secondary, 135)}</defs>` : "";
      return svgDataUri(wrapSvg(`${defs}<circle cx="90" cy="90" r="82" fill="${v.fill(p)}" stroke="${v.stroke(p)}" stroke-width="${v.sw}"/>`, 180, 180));
    },
  },
  {
    id: "double-border", name: "Double Border Frame", subcategory: "Basic", width: 200, height: 160,
    tags: ["double","border","frame","elegant","photo"], keywords: ["double border","elegant","vintage"],
    renderPath: (p, v) => svgDataUri(wrapSvg(`<rect x="6" y="6" width="188" height="148" rx="4" fill="none" stroke="${p.primary}" stroke-width="3"/>
      <rect x="14" y="14" width="172" height="132" rx="4" fill="${v.fill(p)}" stroke="${v.stroke(p)}" stroke-width="${Math.max(1, v.sw - 2)}/>`)),
  },
  {
    id: "polaroid-frame", name: "Polaroid Frame", subcategory: "Photo", width: 190, height: 220,
    tags: ["polaroid","photo","vintage","instant","frame"], keywords: ["polaroid","instant photo","vintage","film"],
    renderPath: (p, _v) => svgDataUri(wrapSvg(`<rect x="8" y="8" width="174" height="204" rx="6" fill="${lighten(p.dark, 0.85)}" stroke="${p.primary}" stroke-width="3"/>
      <rect x="20" y="20" width="150" height="140" rx="4" fill="${darken(p.primary, 0.4)}" opacity="0.5"/>
      <rect x="8" y="168" width="174" height="44" rx="0" fill="${lighten(p.dark, 0.9)}"/>`, 190, 220)),
  },
  {
    id: "filmstrip-frame", name: "Film Strip Frame", subcategory: "Photo", width: 220, height: 165,
    tags: ["film","strip","cinema","movie","vintage","frame"], keywords: ["film","cinema","movie","strip","vintage"],
    renderPath: (p, _v) => {
      const holes = Array.from({ length: 8 }, (_, i) => `<rect x="${10 + i * 25}" y="6" width="15" height="12" rx="2" fill="${darken(p.dark, 0.5)}"/>
        <rect x="${10 + i * 25}" y="147" width="15" height="12" rx="2" fill="${darken(p.dark, 0.5)}"/>`).join("");
      return svgDataUri(wrapSvg(`<rect width="220" height="165" rx="4" fill="${darken(p.dark, 0.35)}"/>
        <rect x="0" y="22" width="220" height="121" fill="${darken(p.dark, 0.2)}"/>
        ${holes}`, 220, 165));
    },
  },
  // ── DEVICE FRAMES ─────────────────────────────────────────────────────────
  {
    id: "phone-frame", name: "Smartphone Frame", subcategory: "Device", width: 160, height: 240,
    tags: ["phone","smartphone","device","frame","mockup","mobile"], keywords: ["phone","mobile","device","frame"],
    renderPath: (p, _v) => svgDataUri(wrapSvg(`<rect x="4" y="4" width="152" height="232" rx="28" fill="${darken(p.dark, 0.3)}" stroke="${p.primary}" stroke-width="4"/>
      <rect x="14" y="28" width="132" height="188" rx="10" fill="${darken(p.dark, 0.5)}"/>
      <rect x="55" y="10" width="50" height="10" rx="5" fill="${darken(p.dark, 0.5)}"/>
      <circle cx="80" cy="222" r="10" fill="${darken(p.dark, 0.5)}" stroke="${p.primary}" stroke-width="2"/>`, 160, 240)),
  },
  {
    id: "laptop-frame", name: "Laptop Frame", subcategory: "Device", width: 240, height: 185,
    tags: ["laptop","computer","device","frame","mockup","screen"], keywords: ["laptop","mac","screen","device","frame"],
    renderPath: (p, _v) => svgDataUri(wrapSvg(`<rect x="8" y="8" width="224" height="148" rx="12" fill="${darken(p.dark, 0.3)}" stroke="${p.primary}" stroke-width="4"/>
      <rect x="18" y="18" width="204" height="128" rx="6" fill="${darken(p.dark, 0.55)}"/>
      <rect x="0" y="156" width="240" height="22" rx="8" fill="${darken(p.dark, 0.2)}"/>
      <rect x="80" y="156" width="80" height="10" rx="4" fill="${darken(p.dark, 0.4)}"/>`, 240, 185)),
  },
  {
    id: "tablet-frame", name: "Tablet / iPad Frame", subcategory: "Device", width: 200, height: 240,
    tags: ["tablet","ipad","device","frame","mockup"], keywords: ["tablet","ipad","device","frame"],
    renderPath: (p, _v) => svgDataUri(wrapSvg(`<rect x="4" y="4" width="192" height="232" rx="18" fill="${darken(p.dark, 0.3)}" stroke="${p.primary}" stroke-width="4"/>
      <rect x="18" y="24" width="164" height="192" rx="6" fill="${darken(p.dark, 0.55)}"/>
      <circle cx="100" cy="225" r="8" fill="${darken(p.dark, 0.5)}" stroke="${p.primary}" stroke-width="2"/>`, 200, 240)),
  },
  {
    id: "browser-frame", name: "Browser Window Frame", subcategory: "Device", width: 240, height: 190,
    tags: ["browser","window","web","frame","mockup","chrome"], keywords: ["browser","web","window","chrome","safari"],
    renderPath: (p, _v) => svgDataUri(wrapSvg(`<rect x="4" y="4" width="232" height="182" rx="12" fill="${darken(p.dark, 0.3)}" stroke="${p.primary}" stroke-width="4"/>
      <rect x="4" y="4" width="232" height="34" rx="12" fill="${darken(p.dark, 0.15)}"/>
      <rect x="4" y="28" width="232" height="12" fill="${darken(p.dark, 0.15)}"/>
      <circle cx="22" cy="21" r="6" fill="#ef4444"/><circle cx="40" cy="21" r="6" fill="#f59e0b"/><circle cx="58" cy="21" r="6" fill="#22c55e"/>
      <rect x="72" y="12" width="144" height="18" rx="9" fill="${darken(p.dark, 0.4)}"/>
      <rect x="12" y="42" width="216" height="140" rx="4" fill="${darken(p.dark, 0.55)}"/>`, 240, 190)),
  },
  {
    id: "desktop-monitor", name: "Desktop Monitor Frame", subcategory: "Device", width: 240, height: 210,
    tags: ["desktop","monitor","computer","frame","mockup"], keywords: ["desktop","monitor","computer","screen","imac"],
    renderPath: (p, _v) => svgDataUri(wrapSvg(`<rect x="4" y="4" width="232" height="160" rx="12" fill="${darken(p.dark, 0.3)}" stroke="${p.primary}" stroke-width="4"/>
      <rect x="14" y="14" width="212" height="140" rx="6" fill="${darken(p.dark, 0.55)}"/>
      <rect x="95" y="164" width="50" height="30" rx="4" fill="${darken(p.dark, 0.25)}"/>
      <rect x="60" y="192" width="120" height="14" rx="7" fill="${darken(p.dark, 0.2)}"/>`, 240, 210)),
  },
  // ── SHAPES / ORGANIC ─────────────────────────────────────────────────────
  {
    id: "heart-frame", name: "Heart Shape Frame", subcategory: "Shapes", width: 200, height: 190,
    tags: ["heart","love","frame","romantic","shape"], keywords: ["heart frame","love","romantic","photo"],
    renderPath: (p, v) => {
      const defs = v.id === "gradient" ? `<defs>${linearGrad("gf", p.primary, p.accent)}</defs>` : "";
      return svgDataUri(wrapSvg(`${defs}<path d="M100,175 C30,130 5,90 5,60 C5,30 22,10 48,10 C64,10 80,18 100,36 C120,18 136,10 152,10 C178,10 195,30 195,60 C195,90 170,130 100,175 Z" fill="${v.fill(p)}" stroke="${v.stroke(p)}" stroke-width="${v.sw}"/>`));
    },
  },
  {
    id: "star-frame", name: "Star Shape Frame", subcategory: "Shapes", width: 195, height: 195,
    tags: ["star","frame","shape","burst","badge"], keywords: ["star","frame","burst","badge","shape"],
    renderPath: (p, v) => {
      const pts = "97,8 115,65 175,65 128,100 146,157 97,120 48,157 66,100 19,65 79,65";
      const defs = v.id === "gradient" ? `<defs>${linearGrad("gf", p.primary, p.accent)}</defs>` : "";
      return svgDataUri(wrapSvg(`${defs}<polygon points="${pts}" fill="${v.fill(p)}" stroke="${v.stroke(p)}" stroke-width="${v.sw}"/>`, 195, 195));
    },
  },
  {
    id: "hexagon-frame", name: "Hexagon Frame", subcategory: "Shapes", width: 195, height: 195,
    tags: ["hexagon","frame","geometric","shape","grid"], keywords: ["hexagon","frame","geometric","honeycomb"],
    renderPath: (p, v) => {
      const pts = "97,8 180,52 180,142 97,187 14,142 14,52";
      const defs = v.id === "gradient" ? `<defs>${linearGrad("gf", p.primary, p.secondary)}</defs>` : "";
      return svgDataUri(wrapSvg(`${defs}<polygon points="${pts}" fill="${v.fill(p)}" stroke="${v.stroke(p)}" stroke-width="${v.sw}"/>`, 195, 195));
    },
  },
  {
    id: "blob-frame", name: "Organic Blob Frame", subcategory: "Organic", width: 190, height: 190,
    tags: ["blob","organic","frame","abstract","fluid"], keywords: ["blob","organic","fluid","frame"],
    renderPath: (p, v) => {
      const path = "M48,8 C78,-4 108,10 108,38 C108,70 92,88 65,98 C35,108 4,92 2,62 C-2,28 18,20 48,8 Z";
      const defs = v.id === "gradient" ? `<defs>${linearGrad("gf", p.primary, p.secondary)}</defs>` : "";
      return svgDataUri(wrapSvg(`${defs}<path d="${path}" fill="${v.fill(p)}" stroke="${v.stroke(p)}" stroke-width="${v.sw}" transform="scale(1.75) translate(4,4)"/>`, 190, 190));
    },
  },
  {
    id: "arch-frame", name: "Arch Portal Frame", subcategory: "Shapes", width: 185, height: 230,
    tags: ["arch","portal","frame","elegant","door"], keywords: ["arch","portal","door","arch frame"],
    renderPath: (p, v) => {
      const defs = v.id === "gradient" ? `<defs>${linearGrad("gf", p.primary, p.secondary)}</defs>` : "";
      return svgDataUri(wrapSvg(`${defs}<path d="M8,220 L8,92 A84,84 0 0 1 177,92 L177,220 Z" fill="${v.fill(p)}" stroke="${v.stroke(p)}" stroke-width="${v.sw}"/>`, 185, 230));
    },
  },
  // ── DECORATIVE ────────────────────────────────────────────────────────────
  {
    id: "shadow-frame", name: "Drop Shadow Frame", subcategory: "Decorative", width: 210, height: 170,
    tags: ["shadow","frame","depth","photo","elegant"], keywords: ["shadow frame","drop shadow","depth","photo"],
    renderPath: (p, _v) => svgDataUri(wrapSvg(`<filter id="ds"><feDropShadow dx="5" dy="5" stdDeviation="8" flood-color="${p.primary}" flood-opacity="0.4"/></filter>
      <rect x="12" y="12" width="186" height="146" rx="8" fill="${darken(p.dark, 0.4)}" filter="url(#ds)"/>
      <rect x="12" y="12" width="186" height="146" rx="8" fill="none" stroke="${p.primary}" stroke-width="3"/>`, 210, 170)),
  },
  {
    id: "scallop-frame", name: "Scallop / Stamp Frame", subcategory: "Decorative", width: 200, height: 200,
    tags: ["scallop","stamp","frame","decorative","vintage"], keywords: ["scallop","stamp","postage","decorative"],
    renderPath: (p, v) => {
      const r = 6;
      const pts = [];
      for (let i = 0; i < 12; i++) {
        const angle = (i * 30 * Math.PI) / 180;
        pts.push(`${(100 + 85 * Math.cos(angle)).toFixed(1)},${(100 + 85 * Math.sin(angle)).toFixed(1)}`);
      }
      const defs = v.id === "gradient" ? `<defs>${linearGrad("gf", p.primary, p.secondary)}</defs>` : "";
      return svgDataUri(wrapSvg(`${defs}
        <polygon points="${pts.join(" ")}" fill="${v.fill(p)}" stroke="${v.stroke(p)}" stroke-width="${v.sw}"/>`, 200, 200));
    },
  },
  {
    id: "corner-bracket", name: "Corner Bracket Frame", subcategory: "Decorative", width: 200, height: 160,
    tags: ["corner","bracket","frame","minimal","elegant"], keywords: ["corner","bracket","frame","minimal"],
    renderPath: (p, _v) => {
      const size = 30;
      const corners = [
        `<path d="M8,${8 + size} L8,8 L${8 + size},8" fill="none" stroke="${p.primary}" stroke-width="5" stroke-linecap="round"/>`,
        `<path d="M${192 - size},8 L192,8 L192,${8 + size}" fill="none" stroke="${p.primary}" stroke-width="5" stroke-linecap="round"/>`,
        `<path d="M8,${152 - size} L8,152 L${8 + size},152" fill="none" stroke="${p.primary}" stroke-width="5" stroke-linecap="round"/>`,
        `<path d="M${192 - size},152 L192,152 L192,${152 - size}" fill="none" stroke="${p.primary}" stroke-width="5" stroke-linecap="round"/>`,
      ];
      return svgDataUri(wrapSvg(corners.join("")));
    },
  },
  {
    id: "tape-frame", name: "Tape / Sticky Frame", subcategory: "Decorative", width: 210, height: 175,
    tags: ["tape","sticky","frame","collage","scrapbook"], keywords: ["tape","sticky","scrapbook","collage","photo"],
    renderPath: (p, _v) => svgDataUri(wrapSvg(`<rect x="20" y="20" width="170" height="135" rx="4" fill="none" stroke="${p.primary}" stroke-width="2" stroke-dasharray="6,4"/>
      <rect x="65" y="8" width="80" height="22" rx="4" fill="${p.accent}" opacity="0.6" transform="rotate(-2 105 19)"/>
      <rect x="65" y="153" width="80" height="22" rx="4" fill="${p.secondary}" opacity="0.6" transform="rotate(1 105 164)"/>`, 210, 175)),
  },
];

// ── Generator ─────────────────────────────────────────────────────────────────
let _cachedFrames: AssetDef[] | null = null;

export function getFrameAssets(): AssetDef[] {
  if (_cachedFrames) return _cachedFrames;

  const assets: AssetDef[] = [];
  const palettes = PALETTES.slice(0, 26);

  FRAME_TEMPLATES.forEach((tmpl) => {
    palettes.forEach((palette, pIdx) => {
      const styleVariant = FRAME_STYLE_VARIANTS[pIdx % FRAME_STYLE_VARIANTS.length];
      assets.push({
        id: `frame-${tmpl.id}-${palette.id}`,
        name: `${tmpl.name} – ${palette.name}`,
        category: "frames",
        subcategory: tmpl.subcategory,
        tags: [...tmpl.tags, ...palette.tags],
        keywords: [...tmpl.keywords, palette.name.toLowerCase()],
        templateId: `frame-${tmpl.id}`,
        params: { paletteId: palette.id, variantId: styleVariant.id },
        format: "svg",
        width: tmpl.width,
        height: tmpl.height,
        editable: true,
        animated: false,
        style: "minimal",
        colors: [palette.primary, palette.secondary],
        license: "Falcon Original – Free Commercial Use",
        source: "Falcon Design Engine",
      });
    });
  });

  _cachedFrames = assets;
  return assets;
}

export function renderFrameFromDef(def: AssetDef): string {
  const tmplId = def.templateId.replace("frame-", "");
  const tmpl = FRAME_TEMPLATES.find((t) => t.id === tmplId);
  const palette = getPalette(def.params.paletteId as string);
  const variant = FRAME_STYLE_VARIANTS.find((v) => v.id === def.params.variantId) ?? FRAME_STYLE_VARIANTS[0];
  if (!tmpl || !palette) return "";
  return tmpl.renderPath(palette, variant);
}

export const FRAMES_COUNT = FRAME_TEMPLATES.length * 26; // 22 × 26 = 572
