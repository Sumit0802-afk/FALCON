// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Asset Engine – Shapes Engine
//  36 base shape templates × 30 palettes = 1,080 unique shape assets
// ─────────────────────────────────────────────────────────────────────────────

import { AssetDef, Palette } from "./types";
import { PALETTES, getPalette, getPaletteByIndex } from "./palette";
import { svgDataUri, wrapSvg, linearGrad, starPoints, polyPoints, dropShadow, lighten } from "./svgUtils";

// ── Shape Template Definitions ─────────────────────────────────────────────────
interface ShapeTemplate {
  id: string;
  name: string;
  subcategory: string;
  tags: string[];
  keywords: string[];
  width: number;
  height: number;
  render: (p: Palette, variant: number) => string;
}

const PALETTES_FOR_SHAPES = PALETTES.slice(0, 30); // 30 palettes

const SHAPE_TEMPLATES: ShapeTemplate[] = [
  // ── BASIC ─────────────────────────────────────────────────────────────────
  {
    id: "rect", name: "Rectangle", subcategory: "Basic", width: 200, height: 140,
    tags: ["rectangle","square","basic","shape","box"], keywords: ["rect","box","block","square"],
    render: (p, v) => {
      const fill = v % 3 === 0 ? `url(#g)` : v % 3 === 1 ? p.primary : "transparent";
      const stroke = v % 3 === 2 ? p.primary : "none";
      const sw = v % 3 === 2 ? "5" : "0";
      const defs = v % 3 === 0 ? `<defs>${linearGrad("g", p.primary, p.secondary)}</defs>` : "";
      return svgDataUri(wrapSvg(`${defs}<rect x="10" y="10" width="180" height="120" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`));
    },
  },
  {
    id: "rounded-rect", name: "Rounded Rectangle", subcategory: "Basic", width: 200, height: 140,
    tags: ["rounded","rectangle","pill","soft","shape"], keywords: ["rounded","smooth","soft"],
    render: (p, v) => {
      const rx = [16, 24, 32, 8, 40][v % 5];
      const defs = `<defs>${linearGrad("g", p.primary, p.secondary)}</defs>`;
      return svgDataUri(wrapSvg(`${defs}<rect x="10" y="10" width="180" height="120" rx="${rx}" fill="url(#g)"/>`));
    },
  },
  {
    id: "circle", name: "Circle", subcategory: "Basic", width: 180, height: 180,
    tags: ["circle","round","dot","basic","shape"], keywords: ["circle","round","dot"],
    render: (p, v) => {
      const fill = v % 2 === 0 ? `url(#g)` : p.primary;
      const defs = v % 2 === 0 ? `<defs>${linearGrad("g", p.primary, p.secondary, 45)}</defs>` : "";
      return svgDataUri(wrapSvg(`${defs}<circle cx="90" cy="90" r="80" fill="${fill}"/>`, 180, 180));
    },
  },
  {
    id: "ellipse", name: "Ellipse / Oval", subcategory: "Basic", width: 200, height: 140,
    tags: ["ellipse","oval","shape","basic"], keywords: ["ellipse","oval","egg"],
    render: (p, v) => {
      const rx = [90, 80, 70, 95, 75][v % 5];
      const ry = [60, 55, 65, 50, 70][v % 5];
      return svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.secondary)}</defs><ellipse cx="100" cy="70" rx="${rx}" ry="${ry}" fill="url(#g)"/>`));
    },
  },
  {
    id: "line", name: "Line", subcategory: "Basic", width: 200, height: 60,
    tags: ["line","divider","separator","basic"], keywords: ["line","stroke","dash"],
    render: (p, v) => {
      const dash = ["none", "8,4", "4,4", "12,4,4,4", "2,6"][v % 5];
      const sw = [4, 6, 3, 5, 8][v % 5];
      return svgDataUri(wrapSvg(`<line x1="10" y1="30" x2="190" y2="30" stroke="${p.primary}" stroke-width="${sw}" stroke-dasharray="${dash}" stroke-linecap="round"/>`, 200, 60));
    },
  },
  // ── TRIANGLES ────────────────────────────────────────────────────────────
  {
    id: "triangle-up", name: "Triangle Up", subcategory: "Geometric", width: 180, height: 160,
    tags: ["triangle","arrow","up","geometric","shape"], keywords: ["triangle","wedge","pyramid"],
    render: (p, v) => {
      const defs = `<defs>${linearGrad("g", p.primary, p.secondary, 90)}</defs>`;
      return svgDataUri(wrapSvg(`${defs}<polygon points="90,10 170,150 10,150" fill="url(#g)"/>`, 180, 160));
    },
  },
  {
    id: "triangle-right", name: "Triangle Right", subcategory: "Geometric", width: 160, height: 180,
    tags: ["triangle","right","geometric","shape","play"], keywords: ["triangle","play","right"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.secondary)}</defs><polygon points="10,10 150,90 10,170" fill="url(#g)"/>`, 160, 180)),
  },
  // ── STARS ──────────────────────────────────────────────────────────────
  {
    id: "star-5", name: "5-Point Star", subcategory: "Stars", width: 180, height: 180,
    tags: ["star","five","shape","badge","rating"], keywords: ["star","award","rating"],
    render: (p, v) => {
      const pts = starPoints(5, 90, 90, 85, 35);
      const fill = v % 2 === 0 ? p.primary : `url(#g)`;
      const defs = v % 2 !== 0 ? `<defs>${linearGrad("g", p.primary, p.accent)}</defs>` : "";
      return svgDataUri(wrapSvg(`${defs}<polygon points="${pts}" fill="${fill}"/>`, 180, 180));
    },
  },
  {
    id: "star-6", name: "6-Point Star", subcategory: "Stars", width: 180, height: 180,
    tags: ["star","six","hexagram","shape"], keywords: ["star","hexagram","david"],
    render: (p, _v) => {
      const pts = starPoints(6, 90, 90, 85, 45);
      return svgDataUri(wrapSvg(`<polygon points="${pts}" fill="${p.primary}" stroke="${p.accent}" stroke-width="2"/>`, 180, 180));
    },
  },
  {
    id: "star-8", name: "8-Point Star", subcategory: "Stars", width: 180, height: 180,
    tags: ["star","eight","octagram","shape","compass"], keywords: ["star","compass","eight"],
    render: (p, _v) => {
      const pts = starPoints(8, 90, 90, 85, 45);
      return svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.secondary, 45)}</defs><polygon points="${pts}" fill="url(#g)"/>`, 180, 180));
    },
  },
  {
    id: "star-12", name: "Sunburst 12-Ray", subcategory: "Stars", width: 190, height: 190,
    tags: ["star","sun","burst","12","ray","badge"], keywords: ["sunburst","starburst","badge"],
    render: (p, _v) => {
      const pts = starPoints(12, 95, 95, 90, 55);
      return svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.accent, p.primary)}</defs><polygon points="${pts}" fill="url(#g)"/>`, 190, 190));
    },
  },
  // ── POLYGONS ─────────────────────────────────────────────────────────────
  {
    id: "triangle-eq", name: "Equilateral Triangle", subcategory: "Polygons", width: 180, height: 160,
    tags: ["triangle","equal","polygon","geometric"], keywords: ["triangle","equilateral"],
    render: (p, _v) => {
      const pts = polyPoints(3, 90, 85, 80, -90);
      return svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.dark)}</defs><polygon points="${pts}" fill="url(#g)"/>`, 180, 160));
    },
  },
  {
    id: "pentagon", name: "Pentagon", subcategory: "Polygons", width: 180, height: 170,
    tags: ["pentagon","five","polygon","geometric"], keywords: ["pentagon","five-sided"],
    render: (p, _v) => {
      const pts = polyPoints(5, 90, 85, 80, -90);
      return svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.secondary, p.primary)}</defs><polygon points="${pts}" fill="url(#g)"/>`, 180, 170));
    },
  },
  {
    id: "hexagon", name: "Hexagon", subcategory: "Polygons", width: 180, height: 180,
    tags: ["hexagon","six","polygon","geometric","honeycomb"], keywords: ["hex","honeycomb","six"],
    render: (p, v) => {
      const fill = v % 3 === 0 ? `url(#g)` : v % 3 === 1 ? p.primary : "transparent";
      const stroke = v % 3 === 2 ? p.primary : "none";
      const pts = polyPoints(6, 90, 90, 82);
      const defs = v % 3 === 0 ? `<defs>${linearGrad("g", p.primary, p.secondary)}</defs>` : "";
      return svgDataUri(wrapSvg(`${defs}<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="5"/>`));
    },
  },
  {
    id: "heptagon", name: "Heptagon", subcategory: "Polygons", width: 180, height: 180,
    tags: ["heptagon","seven","polygon","geometric"], keywords: ["seven-sided","heptagon"],
    render: (p, _v) => {
      const pts = polyPoints(7, 90, 90, 82);
      return svgDataUri(wrapSvg(`<polygon points="${pts}" fill="${p.primary}" stroke="${lighten(p.primary, 0.3)}" stroke-width="3"/>`, 180, 180));
    },
  },
  {
    id: "octagon", name: "Octagon", subcategory: "Polygons", width: 180, height: 180,
    tags: ["octagon","eight","polygon","stop"], keywords: ["stop","octagon","eight"],
    render: (p, _v) => {
      const pts = polyPoints(8, 90, 90, 82);
      return svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.secondary, p.dark)}</defs><polygon points="${pts}" fill="url(#g)"/>`, 180, 180));
    },
  },
  // ── HEARTS & SYMBOLS ─────────────────────────────────────────────────────
  {
    id: "heart", name: "Heart", subcategory: "Symbols", width: 180, height: 170,
    tags: ["heart","love","romantic","symbol","like"], keywords: ["heart","love","like","favorite"],
    render: (p, v) => {
      const fill = v % 2 === 0 ? p.primary : `url(#g)`;
      const defs = v % 2 !== 0 ? `<defs>${linearGrad("g", p.primary, p.accent, 45)}</defs>` : "";
      return svgDataUri(wrapSvg(`${defs}<path d="M90,160 C25,105 5,70 5,42 C5,18 24,2 48,2 C62,2 76,10 90,26 C104,10 118,2 132,2 C156,2 175,18 175,42 C175,70 155,105 90,160 Z" fill="${fill}"/>`, 180, 170));
    },
  },
  {
    id: "diamond", name: "Diamond / Rhombus", subcategory: "Symbols", width: 170, height: 190,
    tags: ["diamond","rhombus","gem","shape"], keywords: ["diamond","jewel","gem","rhombus"],
    render: (p, _v) => {
      return svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.light, p.primary, 135)}</defs><polygon points="85,10 165,95 85,180 5,95" fill="url(#g)"/>`, 170, 190));
    },
  },
  {
    id: "cross", name: "Plus / Cross", subcategory: "Symbols", width: 170, height: 170,
    tags: ["cross","plus","add","medical","symbol"], keywords: ["cross","plus","add","medical"],
    render: (p, v) => {
      const r = [30, 28, 32, 25, 35][v % 5];
      return svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.secondary)}</defs>
        <rect x="${r}" y="5" width="${170 - 2 * r}" height="160" rx="8" fill="url(#g)"/>
        <rect x="5" y="${r}" width="160" height="${170 - 2 * r}" rx="8" fill="url(#g)"/>`, 170, 170));
    },
  },
  {
    id: "shield", name: "Shield / Badge", subcategory: "Badges", width: 180, height: 200,
    tags: ["shield","badge","security","protection","emblem"], keywords: ["shield","protect","badge","security"],
    render: (p, _v) => {
      return svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.dark)}</defs>
        <path d="M90,4 L175,30 L175,95 C175,145 130,180 90,198 C50,180 5,145 5,95 L5,30 Z" fill="url(#g)"/>
        <path d="M90,22 L158,44 L158,98 C158,138 120,166 90,180 C60,166 22,138 22,98 L22,44 Z" fill="none" stroke="${p.light}" stroke-width="2" opacity="0.4"/>`, 180, 200));
    },
  },
  // ── ARROWS ────────────────────────────────────────────────────────────────
  {
    id: "arrow-right", name: "Arrow Right", subcategory: "Arrows", width: 220, height: 110,
    tags: ["arrow","right","direction","chevron","next"], keywords: ["arrow","next","forward","right"],
    render: (p, v) => {
      const style = v % 3;
      if (style === 0) {
        return svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.secondary)}</defs><path d="M10,38 L140,38 L140,15 L210,55 L140,95 L140,72 L10,72 Z" fill="url(#g)"/>`, 220, 110));
      } else if (style === 1) {
        return svgDataUri(wrapSvg(`<path d="M10,55 L180,55" stroke="${p.primary}" stroke-width="8" stroke-linecap="round"/><polygon points="165,35 210,55 165,75" fill="${p.primary}"/>`, 220, 110));
      } else {
        return svgDataUri(wrapSvg(`<path d="M10,55 Q100,20 195,55 Q100,90 10,55" fill="${p.primary}" opacity="0.85"/>`, 220, 110));
      }
    },
  },
  {
    id: "arrow-left", name: "Arrow Left", subcategory: "Arrows", width: 220, height: 110,
    tags: ["arrow","left","back","direction","previous"], keywords: ["arrow","back","previous","left"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.secondary, p.primary)}</defs><path d="M210,38 L80,38 L80,15 L10,55 L80,95 L80,72 L210,72 Z" fill="url(#g)"/>`, 220, 110)),
  },
  {
    id: "arrow-double", name: "Double Arrow", subcategory: "Arrows", width: 220, height: 110,
    tags: ["arrow","double","both","direction","swap"], keywords: ["double arrow","bidirectional","swap"],
    render: (p, _v) => svgDataUri(wrapSvg(`<path d="M10,38 L50,38 L50,15 L10,55" fill="${p.primary}"/><line x1="50" y1="55" x2="170" y2="55" stroke="${p.primary}" stroke-width="8"/><path d="M210,38 L170,38 L170,15 L210,55" fill="${p.primary}"/>`, 220, 110)),
  },
  {
    id: "chevron", name: "Chevron", subcategory: "Arrows", width: 180, height: 120,
    tags: ["chevron","arrow","angle","right","direction"], keywords: ["chevron","v-shape","angle"],
    render: (p, _v) => svgDataUri(wrapSvg(`<polyline points="30,20 140,60 30,100" fill="none" stroke="${p.primary}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`, 180, 120)),
  },
  // ── SPEECH BUBBLES ───────────────────────────────────────────────────────
  {
    id: "bubble-round", name: "Round Speech Bubble", subcategory: "Speech Bubbles", width: 200, height: 170,
    tags: ["speech bubble","chat","message","talk","balloon"], keywords: ["speech","chat","message","bubble"],
    render: (p, _v) => {
      return svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.secondary)}</defs>
        <path d="M20,20 C20,10 30,5 45,5 L155,5 C170,5 180,10 180,20 L180,110 C180,120 170,125 155,125 L80,125 L45,158 L50,125 L45,125 C30,125 20,120 20,110 Z" fill="url(#g)"/>`, 200, 170));
    },
  },
  {
    id: "bubble-rectangular", name: "Rectangular Bubble", subcategory: "Speech Bubbles", width: 200, height: 150,
    tags: ["speech bubble","chat","rectangular","message"], keywords: ["bubble","speech","rectangular"],
    render: (p, _v) => {
      return svgDataUri(wrapSvg(`<rect x="8" y="5" width="184" height="110" rx="12" fill="${p.primary}"/>
        <polygon points="40,115 25,145 65,115" fill="${p.primary}"/>`, 200, 150));
    },
  },
  // ── CLOUDS & ORGANIC ─────────────────────────────────────────────────────
  {
    id: "cloud", name: "Cloud Shape", subcategory: "Organic", width: 200, height: 130,
    tags: ["cloud","sky","weather","fluffy","soft"], keywords: ["cloud","weather","fluffy","cumulus"],
    render: (p, _v) => {
      return svgDataUri(wrapSvg(`<path d="M35,100 A28,28 0 0 1 20,48 A36,36 0 0 1 78,32 A28,28 0 0 1 126,28 A32,32 0 0 1 170,50 A24,24 0 0 1 155,100 Z" fill="${p.primary}" opacity="0.9"/>`, 200, 130));
    },
  },
  {
    id: "blob-organic", name: "Organic Blob", subcategory: "Organic", width: 190, height: 190,
    tags: ["blob","organic","abstract","fluid","shape"], keywords: ["blob","organic","fluid","amorphous"],
    render: (p, v) => {
      const paths = [
        "M45,5 C70,-4 95,10 100,35 C105,62 88,92 62,98 C32,104 4,88 1,60 C-2,32 18,14 45,5 Z",
        "M50,3 C80,3 103,28 98,60 C92,85 72,99 47,99 C18,99 -2,82 2,55 C6,28 24,3 50,3 Z",
        "M48,8 C75,2 100,22 97,50 C95,78 74,97 47,98 C18,99 2,78 4,50 C6,22 24,14 48,8 Z",
      ];
      return svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.secondary)}</defs>
        <path d="${paths[v % 3]}" fill="url(#g)" transform="scale(1.8) translate(2,2)"/>`, 190, 190));
    },
  },
  // ── DECORATIVE ─────────────────────────────────────────────────────────
  {
    id: "wave", name: "Wave Band", subcategory: "Decorative", width: 220, height: 80,
    tags: ["wave","band","sea","water","curve"], keywords: ["wave","ocean","water","sinusoidal"],
    render: (p, v) => {
      const amp = [20, 15, 25, 18, 22][v % 5];
      return svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.secondary)}</defs>
        <path d="M0,40 Q30,${40 - amp} 55,40 T110,40 T165,40 T220,40 L220,80 L0,80 Z" fill="url(#g)"/>`, 220, 80));
    },
  },
  {
    id: "ribbon", name: "Ribbon Banner", subcategory: "Decorative", width: 260, height: 90,
    tags: ["ribbon","banner","award","decoration"], keywords: ["ribbon","banner","tag","label"],
    render: (p, _v) => {
      return svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.accent, p.primary)}</defs>
        <polygon points="22,15 58,45 22,75 70,75 70,15" fill="${p.dark}"/>
        <polygon points="238,15 202,45 238,75 190,75 190,15" fill="${p.dark}"/>
        <rect x="50" y="10" width="160" height="65" rx="8" fill="url(#g)"/>`, 260, 90));
    },
  },
  {
    id: "badge-circle", name: "Circle Badge", subcategory: "Badges", width: 180, height: 180,
    tags: ["badge","circle","label","tag","stamp"], keywords: ["badge","seal","stamp","award"],
    render: (p, _v) => {
      return svgDataUri(wrapSvg(`<circle cx="90" cy="90" r="82" fill="${p.primary}"/>
        <circle cx="90" cy="90" r="70" fill="none" stroke="${p.light}" stroke-width="2.5" stroke-dasharray="6,4"/>
        <circle cx="90" cy="90" r="60" fill="none" stroke="${p.light}" stroke-width="1" opacity="0.5"/>`, 180, 180));
    },
  },
  {
    id: "label-price", name: "Price Tag Label", subcategory: "Labels", width: 180, height: 200,
    tags: ["label","price","tag","sale","shopping"], keywords: ["price tag","label","sale","discount"],
    render: (p, _v) => {
      return svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.secondary)}</defs>
        <path d="M 20,8 L 155,8 A 12,12 0 0 1 167,20 L 167,150 L 90,192 L 13,150 L 13,20 A 12,12 0 0 1 20,8 Z" fill="url(#g)"/>
        <circle cx="138" cy="38" r="12" fill="${p.light}" opacity="0.6"/>`, 180, 200));
    },
  },
  {
    id: "parallelogram", name: "Parallelogram", subcategory: "Geometric", width: 220, height: 140,
    tags: ["parallelogram","slanted","geometric","shape"], keywords: ["parallelogram","rhomboid","slant"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.secondary, p.primary)}</defs><polygon points="35,10 210,10 175,130 0,130" fill="url(#g)"/>`, 220, 140)),
  },
  {
    id: "trapezoid", name: "Trapezoid", subcategory: "Geometric", width: 220, height: 140,
    tags: ["trapezoid","trapezium","geometric","shape"], keywords: ["trapezoid","trapezium"],
    render: (p, _v) => svgDataUri(wrapSvg(`<polygon points="30,10 190,10 220,130 0,130" fill="${p.primary}" stroke="${p.secondary}" stroke-width="3"/>`, 220, 140)),
  },
  {
    id: "crescent", name: "Crescent Moon", subcategory: "Symbols", width: 180, height: 180,
    tags: ["crescent","moon","night","symbol","islam"], keywords: ["crescent","moon","lunar","night"],
    render: (p, _v) => {
      return svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.accent, p.primary)}</defs>
        <path d="M 90,10 A 80,80 0 1 1 90,170 A 55,55 0 1 0 90,10 Z" fill="url(#g)"/>`, 180, 180));
    },
  },
];

// ── Generator ─────────────────────────────────────────────────────────────────
let _cachedShapes: AssetDef[] | null = null;

export function getShapeAssets(): AssetDef[] {
  if (_cachedShapes) return _cachedShapes;

  const assets: AssetDef[] = [];
  SHAPE_TEMPLATES.forEach((tmpl, tIdx) => {
    PALETTES_FOR_SHAPES.forEach((palette, pIdx) => {
      const variant = (tIdx + pIdx) % 5;
      assets.push({
        id: `shape-${tmpl.id}-${palette.id}`,
        name: `${tmpl.name} – ${palette.name}`,
        category: "shapes",
        subcategory: tmpl.subcategory,
        tags: [...tmpl.tags, ...palette.tags],
        keywords: [...tmpl.keywords, palette.name.toLowerCase()],
        templateId: `shape-${tmpl.id}`,
        params: { paletteId: palette.id, variant },
        format: "svg",
        width: tmpl.width,
        height: tmpl.height,
        editable: true,
        animated: false,
        style: pIdx % 3 === 0 ? "gradient" : pIdx % 3 === 1 ? "flat" : "outlined",
        colors: [palette.primary, palette.secondary, palette.accent],
        license: "Falcon Original – Free Commercial Use",
        source: "Falcon Design Engine",
      });
    });
  });

  _cachedShapes = assets;
  return assets;
}

// Render a specific shape asset thumbnail on-demand
export function renderShapeThumbnail(assetId: string): string | null {
  const prefix = "shape-";
  if (!assetId.startsWith(prefix)) return null;
  const rest = assetId.slice(prefix.length);
  const tmpl = SHAPE_TEMPLATES.find((t) => rest.startsWith(t.id + "-"));
  if (!tmpl) return null;
  const paletteId = rest.slice(tmpl.id.length + 1);
  const palette = getPalette(paletteId);
  if (!palette) return null;
  return tmpl.render(palette, 0);
}

// Render from full asset def
export function renderShapeFromDef(def: AssetDef): string {
  const tmplId = def.templateId.replace("shape-", "");
  const tmpl = SHAPE_TEMPLATES.find((t) => t.id === tmplId);
  const palette = getPalette(def.params.paletteId as string);
  if (!tmpl || !palette) return "";
  return tmpl.render(palette, (def.params.variant as number) ?? 0);
}

export const SHAPE_COUNT = SHAPE_TEMPLATES.length * PALETTES_FOR_SHAPES.length; // 36 × 30 = 1,080
