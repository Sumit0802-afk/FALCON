// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Design Editor – Elements Catalog & Category Definitions
//  Matches Canva Elements system with 12 distinct visual categories
// ─────────────────────────────────────────────────────────────────────────────

import { FrameDefinition, FRAME_DEFINITIONS } from "./frameDefinitions";
import { SEED_PHOTOS } from "./seedPhotos";

export type ElementCategoryId =
  | "shapes"
  | "graphics"
  | "3d"
  | "animations"
  | "photos"
  | "stickers"
  | "frames"
  | "grids"
  | "forms"
  | "mockups"
  | "charts"
  | "sheets"
  | "tables";

export interface ElementCategoryMeta {
  id: ElementCategoryId;
  title: string;
  subtitle: string;
  badgeBg: string;
  badgeBackdrop: string;
}

export interface ElementItem {
  id: string;
  name: string;
  categoryId: ElementCategoryId;
  subcategoryId?: string;
  type: "shape" | "frame" | "image" | "sticker";
  shapeType?: "rectangle" | "ellipse" | "line";
  frameDef?: FrameDefinition;
  src?: string;
  previewSvg?: string;
  defaultWidth?: number;
  defaultHeight?: number;
}

// ─── CATEGORY METADATA (EXACT MATCH TO CANVA DESIGN SYSTEM) ───────────────────
export const ELEMENT_CATEGORIES: ElementCategoryMeta[] = [
  {
    id: "shapes",
    title: "Shapes",
    subtitle: "Lines, geometric & organic shapes",
    badgeBg: "linear-gradient(135deg, #14b8a6 0%, #06b6d4 50%, #0284c7 100%)",
    badgeBackdrop: "#0d9488",
  },
  {
    id: "graphics",
    title: "Graphics",
    subtitle: "Illustrations, icons & badges",
    badgeBg: "linear-gradient(135deg, #fbbf24 0%, #f97316 60%, #ea580c 100%)",
    badgeBackdrop: "#c2410c",
  },
  {
    id: "3d",
    title: "3D",
    subtitle: "3D shapes, cubes & isometric objects",
    badgeBg: "linear-gradient(135deg, #e879f9 0%, #a855f7 50%, #7c3aed 100%)",
    badgeBackdrop: "#6b21a8",
  },
  {
    id: "animations",
    title: "Animations",
    subtitle: "Animated stickers & dynamic elements",
    badgeBg: "linear-gradient(135deg, #4ade80 0%, #22c55e 60%, #16a34a 100%)",
    badgeBackdrop: "#15803d",
  },
  {
    id: "photos",
    title: "Photos",
    subtitle: "High-resolution curated stock photos",
    badgeBg: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)",
    badgeBackdrop: "#1e40af",
  },
  {
    id: "frames",
    title: "Frames",
    subtitle: "Masks & photo containers",
    badgeBg: "linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)",
    badgeBackdrop: "#047857",
  },
  {
    id: "grids",
    title: "Grids",
    subtitle: "Multi-photo collage layouts",
    badgeBg: "linear-gradient(135deg, #f472b6 0%, #e11d48 50%, #c026d3 100%)",
    badgeBackdrop: "#9d174d",
  },
  {
    id: "forms",
    title: "Forms",
    subtitle: "UI controls, toggles & inputs",
    badgeBg: "linear-gradient(135deg, #34d399 0%, #059669 60%, #064e3b 100%)",
    badgeBackdrop: "#064e3b",
  },
  {
    id: "mockups",
    title: "Mockups",
    subtitle: "Product & device presentations",
    badgeBg: "linear-gradient(135deg, #38bdf8 0%, #06b6d4 50%, #0e7490 100%)",
    badgeBackdrop: "#155e75",
  },
  {
    id: "charts",
    title: "Charts",
    subtitle: "Visual data & statistics graphs",
    badgeBg: "linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #a855f7 100%)",
    badgeBackdrop: "#4338ca",
  },
  {
    id: "sheets",
    title: "Sheets",
    subtitle: "Spreadsheets & tabular ledgers",
    badgeBg: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1e40af 100%)",
    badgeBackdrop: "#172554",
  },
  {
    id: "tables",
    title: "Tables",
    subtitle: "Structured matrix & comparison tables",
    badgeBg: "linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)",
    badgeBackdrop: "#9a3412",
  },
];

// Helper to encode SVG into safe data URI
export function svgToDataUri(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

// ─── SHAPES ITEMS ─────────────────────────────────────────────────────────────
const SHAPES_ITEMS: ElementItem[] = [
  {
    id: "shape-rect",
    name: "Rectangle",
    categoryId: "shapes",
    subcategoryId: "Basic",
    type: "shape",
    shapeType: "rectangle",
    defaultWidth: 200,
    defaultHeight: 140,
  },
  {
    id: "shape-ellipse",
    name: "Circle / Ellipse",
    categoryId: "shapes",
    subcategoryId: "Basic",
    type: "shape",
    shapeType: "ellipse",
    defaultWidth: 160,
    defaultHeight: 160,
  },
  {
    id: "shape-line",
    name: "Line",
    categoryId: "shapes",
    subcategoryId: "Basic",
    type: "shape",
    shapeType: "line",
    defaultWidth: 240,
    defaultHeight: 6,
  },
  {
    id: "shape-triangle",
    name: "Triangle",
    categoryId: "shapes",
    subcategoryId: "Geometric",
    type: "image",
    defaultWidth: 180,
    defaultHeight: 160,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><polygon points="100,20 185,180 15,180" fill="#6366f1" stroke="#4f46e5" stroke-width="4" stroke-linejoin="round"/></svg>`),
  },
  {
    id: "shape-star-5",
    name: "5-Point Star",
    categoryId: "shapes",
    subcategoryId: "Stars & Badges",
    type: "image",
    defaultWidth: 180,
    defaultHeight: 180,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><polygon points="100,10 126,69 190,75 142,118 156,182 100,148 44,182 58,118 10,75 74,69" fill="#f59e0b" stroke="#d97706" stroke-width="4" stroke-linejoin="round"/></svg>`),
  },
  {
    id: "shape-star-8",
    name: "8-Point Star Badge",
    categoryId: "shapes",
    subcategoryId: "Stars & Badges",
    type: "image",
    defaultWidth: 180,
    defaultHeight: 180,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><polygon points="100,10 122,58 170,30 148,82 195,100 148,118 170,170 122,142 100,190 78,142 30,170 52,118 5,100 52,82 30,30 78,58" fill="#ec4899" stroke="#db2777" stroke-width="4" stroke-linejoin="round"/></svg>`),
  },
  {
    id: "shape-pentagon",
    name: "Pentagon",
    categoryId: "shapes",
    subcategoryId: "Polygons",
    type: "image",
    defaultWidth: 180,
    defaultHeight: 170,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><polygon points="100,18 185,80 152,180 48,180 15,80" fill="#06b6d4" stroke="#0891b2" stroke-width="4" stroke-linejoin="round"/></svg>`),
  },
  {
    id: "shape-hexagon",
    name: "Hexagon",
    categoryId: "shapes",
    subcategoryId: "Polygons",
    type: "image",
    defaultWidth: 180,
    defaultHeight: 180,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><polygon points="100,15 178,59 178,146 100,190 22,146 22,59" fill="#10b981" stroke="#059669" stroke-width="4" stroke-linejoin="round"/></svg>`),
  },
  {
    id: "shape-heart",
    name: "Heart",
    categoryId: "shapes",
    subcategoryId: "Symbols",
    type: "image",
    defaultWidth: 180,
    defaultHeight: 170,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path d="M100,175 C35,120 10,85 10,50 C10,22 32,5 60,5 C76,5 91,14 100,28 C109,14 124,5 140,5 C168,5 190,22 190,50 C190,85 165,120 100,175 Z" fill="#ef4444" stroke="#dc2626" stroke-width="4" stroke-linejoin="round"/></svg>`),
  },
  {
    id: "shape-diamond",
    name: "Diamond / Rhombus",
    categoryId: "shapes",
    subcategoryId: "Geometric",
    type: "image",
    defaultWidth: 170,
    defaultHeight: 190,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><polygon points="100,10 185,100 100,190 15,100" fill="#8b5cf6" stroke="#7c3aed" stroke-width="4" stroke-linejoin="round"/></svg>`),
  },
  {
    id: "shape-arrow-right",
    name: "Arrow Right",
    categoryId: "shapes",
    subcategoryId: "Arrows",
    type: "image",
    defaultWidth: 220,
    defaultHeight: 120,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 120"><path d="M10,40 L130,40 L130,15 L210,60 L130,105 L130,80 L10,80 Z" fill="#3b82f6" stroke="#2563eb" stroke-width="4" stroke-linejoin="round"/></svg>`),
  },
  {
    id: "shape-speech-bubble",
    name: "Speech Bubble",
    categoryId: "shapes",
    subcategoryId: "Symbols",
    type: "image",
    defaultWidth: 200,
    defaultHeight: 160,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160"><path d="M20,20 C20,10 30,5 45,5 L155,5 C170,5 180,10 180,20 L180,105 C180,115 170,120 155,120 L80,120 L40,155 L45,120 L45,120 C30,120 20,115 20,105 Z" fill="#64748b" stroke="#475569" stroke-width="4" stroke-linejoin="round"/></svg>`),
  },
];

// ─── GRAPHICS ITEMS ───────────────────────────────────────────────────────────
const GRAPHICS_ITEMS: ElementItem[] = [
  {
    id: "gfx-sunflower",
    name: "Sunflower Badge",
    categoryId: "graphics",
    subcategoryId: "Nature",
    type: "image",
    defaultWidth: 180,
    defaultHeight: 180,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <defs>
        <radialGradient id="sunC" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#78350f"/>
          <stop offset="100%" stop-color="#451a03"/>
        </radialGradient>
      </defs>
      <g fill="#fde047" stroke="#eab308" stroke-width="2">
        <ellipse cx="100" cy="40" rx="14" ry="32"/>
        <ellipse cx="100" cy="160" rx="14" ry="32"/>
        <ellipse cx="40" cy="100" rx="32" ry="14"/>
        <ellipse cx="160" cy="100" rx="32" ry="14"/>
        <ellipse cx="58" cy="58" rx="14" ry="32" transform="rotate(-45 58 58)"/>
        <ellipse cx="142" cy="142" rx="14" ry="32" transform="rotate(-45 142 142)"/>
        <ellipse cx="142" cy="58" rx="14" ry="32" transform="rotate(45 142 58)"/>
        <ellipse cx="58" cy="142" rx="14" ry="32" transform="rotate(45 58 142)"/>
      </g>
      <circle cx="100" cy="100" r="38" fill="url(#sunC)" stroke="#fbbf24" stroke-width="3"/>
      <circle cx="100" cy="100" r="28" fill="none" stroke="#ca8a04" stroke-width="2" stroke-dasharray="4,4"/>
    </svg>`),
  },
  {
    id: "gfx-sparkles-burst",
    name: "Magic Sparkles",
    categoryId: "graphics",
    subcategoryId: "Effects",
    type: "image",
    defaultWidth: 170,
    defaultHeight: 170,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <path d="M100,10 Q100,90 180,100 Q100,110 100,190 Q100,110 20,100 Q100,90 100,10 Z" fill="#facc15" filter="drop-shadow(0 0 8px #fde047)"/>
      <path d="M150,30 Q150,60 180,65 Q150,70 150,100 Q150,70 120,65 Q150,60 150,30 Z" fill="#67e8f9"/>
      <circle cx="45" cy="45" r="7" fill="#f472b6"/>
      <circle cx="50" cy="155" r="5" fill="#a78bfa"/>
      <circle cx="165" cy="150" r="6" fill="#34d399"/>
    </svg>`),
  },
  {
    id: "gfx-fire-flame",
    name: "Hot Fire Flame",
    categoryId: "graphics",
    subcategoryId: "Badges",
    type: "image",
    defaultWidth: 150,
    defaultHeight: 180,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
      <defs>
        <linearGradient id="flameG" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#ea580c"/>
          <stop offset="50%" stop-color="#f97316"/>
          <stop offset="100%" stop-color="#facc15"/>
        </linearGradient>
      </defs>
      <path d="M100,10 C120,60 180,90 180,160 C180,210 145,235 100,235 C55,235 20,210 20,160 C20,110 70,75 75,45 C80,80 115,80 100,10 Z" fill="url(#flameG)"/>
      <path d="M100,110 C115,135 145,150 145,185 C145,210 125,225 100,225 C75,225 55,210 55,185 C55,160 85,140 100,110 Z" fill="#fef08a"/>
    </svg>`),
  },
  {
    id: "gfx-verified-shield",
    name: "Verified Badge",
    categoryId: "graphics",
    subcategoryId: "Badges",
    type: "image",
    defaultWidth: 160,
    defaultHeight: 160,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <polygon points="100,15 125,25 148,15 165,35 188,35 195,60 210,75 205,100 210,125 195,140 188,165 165,165 148,185 125,175 100,185 75,175 52,185 35,165 12,165 5,140 -10,125 -5,100 -10,75 5,60 12,35 35,35 52,15 75,25" transform="scale(0.85) translate(15,15)" fill="#0ea5e9"/>
      <path d="M65,100 L90,125 L140,75" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`),
  },
  {
    id: "gfx-ribbon-banner",
    name: "Golden Ribbon Banner",
    categoryId: "graphics",
    subcategoryId: "Banners",
    type: "image",
    defaultWidth: 260,
    defaultHeight: 90,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100">
      <defs>
        <linearGradient id="ribG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
      </defs>
      <polygon points="20,15 60,45 20,75 70,75 70,15" fill="#b45309"/>
      <polygon points="280,15 240,45 280,75 230,75 230,15" fill="#b45309"/>
      <rect x="50" y="10" width="200" height="65" rx="8" fill="url(#ribG)" stroke="#fef08a" stroke-width="2"/>
      <text x="150" y="52" font-family="Inter, sans-serif" font-size="22" font-weight="bold" fill="#78350f" text-anchor="middle">SPECIAL OFFER</text>
    </svg>`),
  },
  {
    id: "gfx-tropical-leaf",
    name: "Monstera Tropical Leaf",
    categoryId: "graphics",
    subcategoryId: "Nature",
    type: "image",
    defaultWidth: 170,
    defaultHeight: 190,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
      <path d="M100,10 C160,30 190,90 180,160 C170,220 120,240 100,240 C80,240 30,220 20,160 C10,90 40,30 100,10 Z" fill="#10b981"/>
      <path d="M100,20 L100,240" stroke="#047857" stroke-width="5" stroke-linecap="round"/>
      <path d="M100,60 C130,50 160,40 170,25" stroke="#047857" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M100,100 C140,90 175,90 185,75" stroke="#047857" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M100,140 C140,130 170,140 175,130" stroke="#047857" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M100,60 C70,50 40,40 30,25" stroke="#047857" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M100,100 C60,90 25,90 15,75" stroke="#047857" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M100,140 C60,130 30,140 25,130" stroke="#047857" stroke-width="4" stroke-linecap="round" fill="none"/>
    </svg>`),
  },
];

// ─── 3D ITEMS ─────────────────────────────────────────────────────────────────
const THREE_D_ITEMS: ElementItem[] = [
  {
    id: "3d-cube-grid",
    name: "Isometric 3D Cube",
    categoryId: "3d",
    subcategoryId: "Isometric",
    type: "image",
    defaultWidth: 190,
    defaultHeight: 190,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="cTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c084fc"/>
          <stop offset="100%" stop-color="#a855f7"/>
        </linearGradient>
        <linearGradient id="cLeft" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#9333ea"/>
          <stop offset="100%" stop-color="#6b21a8"/>
        </linearGradient>
        <linearGradient id="cRight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#7c3aed"/>
          <stop offset="100%" stop-color="#4c1d95"/>
        </linearGradient>
      </defs>
      <!-- Perspective Grid -->
      <g stroke="#e879f9" stroke-width="1.5" opacity="0.35">
        <line x1="20" y1="140" x2="100" y2="190"/>
        <line x1="100" y1="190" x2="180" y2="140"/>
        <line x1="50" y1="120" x2="100" y2="150"/>
        <line x1="100" y1="150" x2="150" y2="120"/>
        <line x1="100" y1="80" x2="100" y2="190"/>
      </g>
      <!-- 3D Cube -->
      <g transform="translate(0, -10)">
        <polygon points="100,45 155,75 100,105 45,75" fill="url(#cTop)"/>
        <polygon points="45,75 100,105 100,165 45,135" fill="url(#cLeft)"/>
        <polygon points="100,105 155,75 155,135 100,165" fill="url(#cRight)"/>
      </g>
    </svg>`),
  },
  {
    id: "3d-sphere-glass",
    name: "3D Glossy Sphere",
    categoryId: "3d",
    subcategoryId: "Geometric",
    type: "image",
    defaultWidth: 180,
    defaultHeight: 180,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <defs>
        <radialGradient id="sphG" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#38bdf8"/>
          <stop offset="70%" stop-color="#0284c7"/>
          <stop offset="100%" stop-color="#082f49"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="75" fill="url(#sphG)"/>
      <ellipse cx="75" cy="55" rx="35" ry="18" fill="#ffffff" opacity="0.5" transform="rotate(-25 75 55)"/>
    </svg>`),
  },
  {
    id: "3d-torus-donut",
    name: "3D Torus Donut",
    categoryId: "3d",
    subcategoryId: "Geometric",
    type: "image",
    defaultWidth: 190,
    defaultHeight: 170,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 180">
      <defs>
        <linearGradient id="torusG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f43f5e"/>
          <stop offset="40%" stop-color="#fb7185"/>
          <stop offset="80%" stop-color="#be123c"/>
          <stop offset="100%" stop-color="#881337"/>
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="90" rx="80" ry="50" fill="url(#torusG)"/>
      <ellipse cx="100" cy="90" rx="38" ry="22" fill="#0c0c0e"/>
      <ellipse cx="90" cy="65" rx="55" ry="12" fill="#ffffff" opacity="0.35"/>
    </svg>`),
  },
  {
    id: "3d-cylinder",
    name: "3D Cylinder Pillar",
    categoryId: "3d",
    subcategoryId: "Geometric",
    type: "image",
    defaultWidth: 160,
    defaultHeight: 190,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
      <defs>
        <linearGradient id="cylBody" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#059669"/>
          <stop offset="50%" stop-color="#34d399"/>
          <stop offset="100%" stop-color="#064e3b"/>
        </linearGradient>
      </defs>
      <path d="M40,70 L40,170 C40,195 160,195 160,170 L160,70 Z" fill="url(#cylBody)"/>
      <ellipse cx="100" cy="70" rx="60" ry="25" fill="#6ee7b7" stroke="#059669" stroke-width="2"/>
    </svg>`),
  },
  {
    id: "3d-star-badge",
    name: "3D Metallic Star",
    categoryId: "3d",
    subcategoryId: "Icons",
    type: "image",
    defaultWidth: 180,
    defaultHeight: 180,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <polygon points="100,10 126,69 190,75 142,118 156,182 100,148 44,182 58,118 10,75 74,69" fill="#f59e0b"/>
      <polygon points="100,10 100,148 156,182 142,118 190,75 126,69" fill="#d97706"/>
      <polygon points="100,10 100,148 44,182" fill="#b45309"/>
      <polygon points="100,10 100,80 126,69" fill="#fef08a"/>
    </svg>`),
  },
];

// ─── ANIMATIONS ITEMS ─────────────────────────────────────────────────────────
const ANIMATIONS_ITEMS: ElementItem[] = [
  {
    id: "anim-smiley-peel",
    name: "Animated Smiley Badge",
    categoryId: "animations",
    subcategoryId: "Stickers",
    type: "image",
    defaultWidth: 180,
    defaultHeight: 180,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="80" fill="#facc15" stroke="#eab308" stroke-width="4"/>
      <!-- Eyes & Smile -->
      <ellipse cx="72" cy="85" rx="8" ry="12" fill="#581c87"/>
      <ellipse cx="128" cy="85" rx="8" ry="12" fill="#581c87"/>
      <path d="M65,115 C75,145 125,145 135,115" fill="none" stroke="#581c87" stroke-width="8" stroke-linecap="round"/>
      <!-- Peel Corner -->
      <path d="M145,145 Q165,145 178,135 Q178,165 145,178 Z" fill="#ffffff" filter="drop-shadow(-3px -3px 4px rgba(0,0,0,0.3))"/>
    </svg>`),
  },
  {
    id: "anim-pulsing-heart",
    name: "Pulsing Love Heart",
    categoryId: "animations",
    subcategoryId: "Motion",
    type: "image",
    defaultWidth: 170,
    defaultHeight: 170,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <defs>
        <radialGradient id="heartPulse" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#fb7185"/>
          <stop offset="100%" stop-color="#e11d48"/>
        </radialGradient>
      </defs>
      <path d="M100,175 C35,120 10,85 10,50 C10,22 32,5 60,5 C76,5 91,14 100,28 C109,14 124,5 140,5 C168,5 190,22 190,50 C190,85 165,120 100,175 Z" fill="url(#heartPulse)" filter="drop-shadow(0 0 16px rgba(244,63,94,0.6))"/>
      <ellipse cx="65" cy="40" rx="20" ry="10" fill="#ffffff" opacity="0.4" transform="rotate(-30 65 40)"/>
    </svg>`),
  },
  {
    id: "anim-spinning-spark",
    name: "Spinning Sparkle Star",
    categoryId: "animations",
    subcategoryId: "Motion",
    type: "image",
    defaultWidth: 170,
    defaultHeight: 170,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <g filter="drop-shadow(0 0 10px #38bdf8)">
        <polygon points="100,10 115,85 190,100 115,115 100,190 85,115 10,100 85,85" fill="#38bdf8"/>
        <polygon points="100,35 110,90 165,100 110,110 100,165 90,110 35,100 90,90" fill="#ffffff"/>
      </g>
    </svg>`),
  },
  {
    id: "anim-confetti-blast",
    name: "Party Confetti Popper",
    categoryId: "animations",
    subcategoryId: "Celebration",
    type: "image",
    defaultWidth: 180,
    defaultHeight: 180,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <polygon points="25,175 60,120 80,140" fill="#ec4899"/>
      <circle cx="90" cy="80" r="8" fill="#facc15"/>
      <circle cx="130" cy="60" r="10" fill="#38bdf8"/>
      <circle cx="160" cy="110" r="7" fill="#4ade80"/>
      <rect x="110" y="110" width="16" height="8" rx="3" fill="#a855f7" transform="rotate(35 110 110)"/>
      <rect x="80" y="40" width="18" height="6" rx="3" fill="#f43f5e" transform="rotate(-25 80 40)"/>
      <rect x="140" y="140" width="14" height="6" rx="2" fill="#fb923c" transform="rotate(50 140 140)"/>
    </svg>`),
  },
];

// ─── PHOTOS ITEMS ─────────────────────────────────────────────────────────────
const PHOTOS_ITEMS: ElementItem[] = SEED_PHOTOS.slice(0, 12).map((p) => ({
  id: `elem-photo-${p.id}`,
  name: p.name,
  categoryId: "photos",
  subcategoryId: p.category,
  type: "image",
  src: p.fileUrl,
  defaultWidth: p.width || 400,
  defaultHeight: p.height || 300,
}));

// ─── FRAMES ITEMS ─────────────────────────────────────────────────────────────
const FRAMES_ITEMS: ElementItem[] = FRAME_DEFINITIONS.map((f) => ({
  id: `elem-frame-${f.id}`,
  name: f.name,
  categoryId: "frames",
  subcategoryId: f.category,
  type: "frame",
  frameDef: f,
  defaultWidth: f.defaultWidth || 220,
  defaultHeight: f.defaultHeight || 220,
}));

// ─── GRIDS ITEMS ──────────────────────────────────────────────────────────────
const GRIDS_ITEMS: ElementItem[] = [
  {
    id: "grid-2-vertical",
    name: "2-Panel Vertical Grid",
    categoryId: "grids",
    subcategoryId: "2 Grids",
    type: "image",
    defaultWidth: 320,
    defaultHeight: 200,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200">
      <defs>
        <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7dd3fc"/><stop offset="100%" stop-color="#bae6fd"/></linearGradient>
        <linearGradient id="gHill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4ade80"/><stop offset="100%" stop-color="#16a34a"/></linearGradient>
      </defs>
      <rect x="5" y="5" width="150" height="190" rx="8" fill="url(#gSky)"/>
      <path d="M5,150 Q50,110 100,160 Q130,130 155,170 L155,195 L5,195 Z" fill="url(#gHill)"/>
      <rect x="165" y="5" width="150" height="190" rx="8" fill="url(#gSky)"/>
      <path d="M165,150 Q200,120 250,155 Q280,125 315,165 L315,195 L165,195 Z" fill="url(#gHill)"/>
    </svg>`),
  },
  {
    id: "grid-2-horizontal",
    name: "2-Panel Horizontal Grid",
    categoryId: "grids",
    subcategoryId: "2 Grids",
    type: "image",
    defaultWidth: 320,
    defaultHeight: 220,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220">
      <defs>
        <linearGradient id="gH1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#818cf8"/><stop offset="100%" stop-color="#c084fc"/></linearGradient>
        <linearGradient id="gH2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f472b6"/><stop offset="100%" stop-color="#fb7185"/></linearGradient>
      </defs>
      <rect x="5" y="5" width="310" height="100" rx="8" fill="url(#gH1)"/>
      <rect x="5" y="115" width="310" height="100" rx="8" fill="url(#gH2)"/>
    </svg>`),
  },
  {
    id: "grid-4-quad",
    name: "4-Quadrant Grid (2x2)",
    categoryId: "grids",
    subcategoryId: "4 Grids",
    type: "image",
    defaultWidth: 260,
    defaultHeight: 260,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <defs>
        <linearGradient id="quad1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#818cf8"/></linearGradient>
      </defs>
      <rect x="5" y="5" width="110" height="110" rx="8" fill="url(#quad1)"/>
      <rect x="125" y="5" width="110" height="110" rx="8" fill="url(#quad1)"/>
      <rect x="5" y="125" width="110" height="110" rx="8" fill="url(#quad1)"/>
      <rect x="125" y="125" width="110" height="110" rx="8" fill="url(#quad1)"/>
    </svg>`),
  },
  {
    id: "grid-3-collage",
    name: "3-Panel Magazine Collage",
    categoryId: "grids",
    subcategoryId: "3 Grids",
    type: "image",
    defaultWidth: 320,
    defaultHeight: 220,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220">
      <rect x="5" y="5" width="150" height="210" rx="8" fill="#38bdf8"/>
      <rect x="165" y="5" width="150" height="100" rx="8" fill="#ec4899"/>
      <rect x="165" y="115" width="150" height="100" rx="8" fill="#10b981"/>
    </svg>`),
  },
];

// ─── FORMS ITEMS ──────────────────────────────────────────────────────────────
const FORMS_ITEMS: ElementItem[] = [
  {
    id: "form-toggle-switch",
    name: "Toggle Switch ON/OFF",
    categoryId: "forms",
    subcategoryId: "Controls",
    type: "image",
    defaultWidth: 220,
    defaultHeight: 110,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 110">
      <!-- Active Switch -->
      <rect x="10" y="10" width="90" height="45" rx="22.5" fill="#10b981"/>
      <circle cx="75" cy="32.5" r="17" fill="#ffffff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"/>
      <!-- Inactive Switch -->
      <rect x="120" y="10" width="90" height="45" rx="22.5" fill="#334155"/>
      <circle cx="145" cy="32.5" r="17" fill="#94a3b8"/>
      <!-- Label -->
      <text x="10" y="85" font-family="Inter, sans-serif" font-size="14" fill="#94a3b8">Active / Inactive Toggle</text>
    </svg>`),
  },
  {
    id: "form-checkboxes",
    name: "Checkbox Group",
    categoryId: "forms",
    subcategoryId: "Inputs",
    type: "image",
    defaultWidth: 240,
    defaultHeight: 130,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 130">
      <!-- Checked -->
      <rect x="10" y="15" width="28" height="28" rx="6" fill="#10b981"/>
      <path d="M17,29 L23,35 L31,21" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="48" y="34" font-family="Inter, sans-serif" font-size="15" font-weight="500" fill="#ffffff">Checked Option</text>
      <!-- Unchecked -->
      <rect x="10" y="65" width="28" height="28" rx="6" fill="none" stroke="#475569" stroke-width="2"/>
      <text x="48" y="84" font-family="Inter, sans-serif" font-size="15" font-weight="500" fill="#94a3b8">Unchecked Option</text>
    </svg>`),
  },
  {
    id: "form-rating-stars",
    name: "5-Star Rating Bar",
    categoryId: "forms",
    subcategoryId: "Ratings",
    type: "image",
    defaultWidth: 260,
    defaultHeight: 70,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 60">
      <defs>
        <g id="starGold">
          <polygon points="20,2 26,14 38,15 29,24 32,36 20,29 8,36 11,24 2,15 14,14" fill="#facc15"/>
        </g>
      </defs>
      <use href="#starGold" x="0"/>
      <use href="#starGold" x="45"/>
      <use href="#starGold" x="90"/>
      <use href="#starGold" x="135"/>
      <use href="#starGold" x="180"/>
    </svg>`),
  },
  {
    id: "form-input-field",
    name: "Modern Search Input Pill",
    categoryId: "forms",
    subcategoryId: "Inputs",
    type: "image",
    defaultWidth: 280,
    defaultHeight: 60,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 60">
      <rect x="5" y="8" width="270" height="44" rx="22" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
      <circle cx="32" cy="30" r="7" fill="none" stroke="#94a3b8" stroke-width="2"/>
      <line x1="37" y1="35" x2="43" y2="41" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
      <text x="55" y="35" font-family="Inter, sans-serif" font-size="14" fill="#94a3b8">Search anything...</text>
    </svg>`),
  },
];

// ─── MOCKUPS ITEMS ────────────────────────────────────────────────────────────
const MOCKUPS_ITEMS: ElementItem[] = [
  {
    id: "mockup-tshirt",
    name: "T-Shirt Apparel Mockup",
    categoryId: "mockups",
    subcategoryId: "Apparel",
    type: "image",
    defaultWidth: 220,
    defaultHeight: 240,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 240">
      <defs>
        <linearGradient id="tG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
      </defs>
      <!-- T-Shirt Body -->
      <path d="M70,25 C85,38 135,38 150,25 L195,55 L175,95 L155,80 L155,225 L65,225 L65,80 L45,95 L25,55 Z" fill="url(#tG)" stroke="#cbd5e1" stroke-width="2" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.15))"/>
      <!-- Collar -->
      <path d="M70,25 C85,45 135,45 150,25" fill="none" stroke="#94a3b8" stroke-width="3"/>
      <!-- Chest Graphic Frame -->
      <rect x="82" y="80" width="56" height="56" rx="4" fill="#38bdf8" opacity="0.85"/>
      <circle cx="100" cy="98" r="6" fill="#facc15"/>
      <path d="M82,125 Q95,105 110,120 Q125,110 138,130 L82,130 Z" fill="#10b981"/>
    </svg>`),
  },
  {
    id: "mockup-iphone",
    name: "Smartphone Mobile Mockup",
    categoryId: "mockups",
    subcategoryId: "Devices",
    type: "image",
    defaultWidth: 160,
    defaultHeight: 280,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 280">
      <!-- Phone Outer Frame -->
      <rect x="10" y="10" width="140" height="260" rx="28" fill="#0f172a" stroke="#334155" stroke-width="3" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.3))"/>
      <!-- Screen -->
      <rect x="16" y="16" width="128" height="248" rx="22" fill="#1e293b"/>
      <!-- Dynamic Island -->
      <rect x="58" y="24" width="44" height="12" rx="6" fill="#000000"/>
      <!-- Wallpaper gradient -->
      <rect x="16" y="42" width="128" height="222" fill="url(#gradPhone)"/>
      <defs>
        <linearGradient id="gradPhone" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#ec4899"/></linearGradient>
      </defs>
    </svg>`),
  },
  {
    id: "mockup-laptop",
    name: "MacBook Laptop Mockup",
    categoryId: "mockups",
    subcategoryId: "Devices",
    type: "image",
    defaultWidth: 280,
    defaultHeight: 180,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180">
      <!-- Screen Lid -->
      <rect x="35" y="15" width="210" height="130" rx="10" fill="#0f172a" stroke="#475569" stroke-width="2"/>
      <rect x="42" y="22" width="196" height="116" rx="4" fill="#0284c7"/>
      <!-- Base keyboard plate -->
      <polygon points="10,150 270,150 250,165 30,165" fill="#94a3b8"/>
      <rect x="110" y="150" width="60" height="4" rx="2" fill="#64748b"/>
    </svg>`),
  },
  {
    id: "mockup-coffee-mug",
    name: "Ceramic Coffee Mug Mockup",
    categoryId: "mockups",
    subcategoryId: "Product",
    type: "image",
    defaultWidth: 220,
    defaultHeight: 190,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 190">
      <!-- Handle -->
      <path d="M150,50 C195,50 195,130 150,130" fill="none" stroke="#e2e8f0" stroke-width="18" stroke-linecap="round"/>
      <!-- Mug Body -->
      <rect x="30" y="30" width="130" height="135" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.15))"/>
      <ellipse cx="95" cy="30" rx="65" ry="12" fill="#e2e8f0"/>
      <!-- Logo badge on mug -->
      <circle cx="95" cy="95" r="24" fill="#0ea5e9"/>
      <text x="95" y="101" font-family="Inter, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">★</text>
    </svg>`),
  },
];

// ─── CHARTS ITEMS ─────────────────────────────────────────────────────────────
const CHARTS_ITEMS: ElementItem[] = [
  {
    id: "chart-area-multiline",
    name: "Multi-Line Area Chart",
    categoryId: "charts",
    subcategoryId: "Line",
    type: "image",
    defaultWidth: 280,
    defaultHeight: 190,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 190">
      <rect width="280" height="190" rx="14" fill="#18181b" stroke="#27272a" stroke-width="1.5"/>
      <!-- Grid Lines -->
      <line x1="30" y1="40" x2="255" y2="40" stroke="#3f3f46" stroke-width="1" stroke-dasharray="3,3"/>
      <line x1="30" y1="85" x2="255" y2="85" stroke="#3f3f46" stroke-width="1" stroke-dasharray="3,3"/>
      <line x1="30" y1="130" x2="255" y2="130" stroke="#3f3f46" stroke-width="1" stroke-dasharray="3,3"/>
      <!-- Area Fill 1 -->
      <path d="M30,130 Q80,70 130,100 T230,50 L230,150 L30,150 Z" fill="#8b5cf6" opacity="0.3"/>
      <path d="M30,130 Q80,70 130,100 T230,50" fill="none" stroke="#a855f7" stroke-width="3"/>
      <!-- Area Fill 2 -->
      <path d="M30,110 Q80,120 130,60 T230,75 L230,150 L30,150 Z" fill="#06b6d4" opacity="0.3"/>
      <path d="M30,110 Q80,120 130,60 T230,75" fill="none" stroke="#22d3ee" stroke-width="3"/>
      <!-- Nodes -->
      <circle cx="130" cy="100" r="5" fill="#a855f7" stroke="#ffffff" stroke-width="2"/>
      <circle cx="130" cy="60" r="5" fill="#22d3ee" stroke="#ffffff" stroke-width="2"/>
    </svg>`),
  },
  {
    id: "chart-bar-vertical",
    name: "Bar Chart Comparison",
    categoryId: "charts",
    subcategoryId: "Bar",
    type: "image",
    defaultWidth: 260,
    defaultHeight: 180,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 180">
      <rect width="260" height="180" rx="14" fill="#18181b" stroke="#27272a" stroke-width="1.5"/>
      <!-- Bars -->
      <rect x="40" y="90" width="24" height="60" rx="4" fill="#3b82f6"/>
      <rect x="75" y="50" width="24" height="100" rx="4" fill="#60a5fa"/>
      <rect x="120" y="70" width="24" height="80" rx="4" fill="#10b981"/>
      <rect x="155" y="30" width="24" height="120" rx="4" fill="#34d399"/>
      <rect x="200" y="45" width="24" height="105" rx="4" fill="#f59e0b"/>
      <!-- Baseline -->
      <line x1="25" y1="150" x2="240" y2="150" stroke="#71717a" stroke-width="2"/>
    </svg>`),
  },
  {
    id: "chart-donut-pie",
    name: "Donut Metric Breakdown",
    categoryId: "charts",
    subcategoryId: "Donut",
    type: "image",
    defaultWidth: 220,
    defaultHeight: 220,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220">
      <rect width="220" height="220" rx="14" fill="#18181b" stroke="#27272a" stroke-width="1.5"/>
      <circle cx="110" cy="110" r="70" fill="none" stroke="#27272a" stroke-width="26"/>
      <!-- Slice 1 45% -->
      <circle cx="110" cy="110" r="70" fill="none" stroke="#3b82f6" stroke-width="26" stroke-dasharray="197 440" stroke-dashoffset="0"/>
      <!-- Slice 2 30% -->
      <circle cx="110" cy="110" r="70" fill="none" stroke="#ec4899" stroke-width="26" stroke-dasharray="132 440" stroke-dashoffset="-197"/>
      <!-- Slice 3 25% -->
      <circle cx="110" cy="110" r="70" fill="none" stroke="#10b981" stroke-width="26" stroke-dasharray="110 440" stroke-dashoffset="-329"/>
      <text x="110" y="116" font-family="Inter, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">85%</text>
    </svg>`),
  },
];

// ─── SHEETS ITEMS ─────────────────────────────────────────────────────────────
const SHEETS_ITEMS: ElementItem[] = [
  {
    id: "sheet-financial-model",
    name: "Spreadsheet Ledger fx",
    categoryId: "sheets",
    subcategoryId: "Finance",
    type: "image",
    defaultWidth: 300,
    defaultHeight: 190,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 190">
      <rect width="300" height="190" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="2"/>
      <!-- Header Bar fx -->
      <rect x="0" y="0" width="300" height="34" rx="12" fill="#2563eb"/>
      <text x="15" y="23" font-family="Inter, sans-serif" font-size="13" font-weight="bold" fill="#ffffff">f(x)  =SUM(B2:B8)</text>
      <!-- Grid rows -->
      <line x1="0" y1="65" x2="300" y2="65" stroke="#334155" stroke-width="1"/>
      <line x1="0" y1="100" x2="300" y2="100" stroke="#334155" stroke-width="1"/>
      <line x1="0" y1="135" x2="300" y2="135" stroke="#334155" stroke-width="1"/>
      <line x1="0" y1="170" x2="300" y2="170" stroke="#334155" stroke-width="1"/>
      <line x1="75" y1="34" x2="75" y2="190" stroke="#334155" stroke-width="1"/>
      <line x1="185" y1="34" x2="185" y2="190" stroke="#334155" stroke-width="1"/>
      <!-- Cell sample text -->
      <text x="12" y="54" font-family="Inter, sans-serif" font-size="11" fill="#94a3b8">Q1 Growth</text>
      <text x="88" y="54" font-family="Inter, sans-serif" font-size="11" fill="#38bdf8">$42,500</text>
      <text x="198" y="54" font-family="Inter, sans-serif" font-size="11" fill="#4ade80">+28.4%</text>
      <text x="12" y="88" font-family="Inter, sans-serif" font-size="11" fill="#94a3b8">Q2 Growth</text>
      <text x="88" y="88" font-family="Inter, sans-serif" font-size="11" fill="#38bdf8">$58,200</text>
      <text x="198" y="88" font-family="Inter, sans-serif" font-size="11" fill="#4ade80">+36.9%</text>
    </svg>`),
  },
  {
    id: "sheet-inventory-tracker",
    name: "Inventory Checklist Sheet",
    categoryId: "sheets",
    subcategoryId: "Business",
    type: "image",
    defaultWidth: 290,
    defaultHeight: 180,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 290 180">
      <rect width="290" height="180" rx="10" fill="#1e1e24" stroke="#2e2e38" stroke-width="1.5"/>
      <rect x="0" y="0" width="290" height="32" rx="10" fill="#3b82f6"/>
      <text x="14" y="21" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="#ffffff">INVENTORY AUDIT SHEET</text>
      <line x1="0" y1="65" x2="290" y2="65" stroke="#333340" stroke-width="1"/>
      <line x1="0" y1="105" x2="290" y2="105" stroke="#333340" stroke-width="1"/>
      <line x1="0" y1="145" x2="290" y2="145" stroke="#333340" stroke-width="1"/>
      <circle cx="20" cy="50" r="6" fill="#10b981"/>
      <text x="35" y="54" font-family="Inter, sans-serif" font-size="12" fill="#e2e8f0">Pro Licenses (x150)</text>
      <circle cx="20" cy="90" r="6" fill="#10b981"/>
      <text x="35" y="94" font-family="Inter, sans-serif" font-size="12" fill="#e2e8f0">Cloud Storage Packs</text>
      <circle cx="20" cy="130" r="6" fill="#f59e0b"/>
      <text x="35" y="134" font-family="Inter, sans-serif" font-size="12" fill="#e2e8f0">Custom Font Licenses</text>
    </svg>`),
  },
];

// ─── TABLES ITEMS ─────────────────────────────────────────────────────────────
const TABLES_ITEMS: ElementItem[] = [
  {
    id: "table-pricing-comparison",
    name: "Comparison Matrix Table",
    categoryId: "tables",
    subcategoryId: "Pricing",
    type: "image",
    defaultWidth: 300,
    defaultHeight: 180,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180">
      <rect width="300" height="180" rx="10" fill="#18181b" stroke="#f97316" stroke-width="2"/>
      <!-- Header row in orange -->
      <rect x="0" y="0" width="300" height="38" rx="10" fill="#ea580c"/>
      <line x1="100" y1="0" x2="100" y2="180" stroke="#f97316" stroke-width="1.5"/>
      <line x1="200" y1="0" x2="200" y2="180" stroke="#f97316" stroke-width="1.5"/>
      <line x1="0" y1="85" x2="300" y2="85" stroke="#3f3f46" stroke-width="1"/>
      <line x1="0" y1="130" x2="300" y2="130" stroke="#3f3f46" stroke-width="1"/>
      <!-- Headers -->
      <text x="50" y="24" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">Feature</text>
      <text x="150" y="24" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">Starter</text>
      <text x="250" y="24" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">Pro</text>
      <!-- Data -->
      <text x="50" y="65" font-family="Inter, sans-serif" font-size="11" fill="#e4e4e7" text-anchor="middle">Exports</text>
      <text x="150" y="65" font-family="Inter, sans-serif" font-size="11" fill="#a1a1aa" text-anchor="middle">1080p</text>
      <text x="250" y="65" font-family="Inter, sans-serif" font-size="11" fill="#fb923c" text-anchor="middle">4K Ultra</text>
      <text x="50" y="110" font-family="Inter, sans-serif" font-size="11" fill="#e4e4e7" text-anchor="middle">Storage</text>
      <text x="150" y="110" font-family="Inter, sans-serif" font-size="11" fill="#a1a1aa" text-anchor="middle">5 GB</text>
      <text x="250" y="110" font-family="Inter, sans-serif" font-size="11" fill="#fb923c" text-anchor="middle">Unlimited</text>
    </svg>`),
  },
  {
    id: "table-clean-grid",
    name: "Clean Data Table 3x3",
    categoryId: "tables",
    subcategoryId: "Grid",
    type: "image",
    defaultWidth: 280,
    defaultHeight: 170,
    src: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 170">
      <rect width="280" height="170" rx="8" fill="#18181b" stroke="#f97316" stroke-width="2"/>
      <rect x="0" y="0" width="280" height="34" rx="8" fill="#f97316"/>
      <line x1="93" y1="0" x2="93" y2="170" stroke="#f97316" stroke-width="1.5"/>
      <line x1="186" y1="0" x2="186" y2="170" stroke="#f97316" stroke-width="1.5"/>
      <line x1="0" y1="78" x2="280" y2="78" stroke="#f97316" stroke-width="1"/>
      <line x1="0" y1="124" x2="280" y2="124" stroke="#f97316" stroke-width="1"/>
    </svg>`),
  },
];

// ─── COMBINED MASTER CATALOG ──────────────────────────────────────────────────
export const ALL_ELEMENT_ITEMS: ElementItem[] = [
  ...SHAPES_ITEMS,
  ...GRAPHICS_ITEMS,
  ...THREE_D_ITEMS,
  ...ANIMATIONS_ITEMS,
  ...PHOTOS_ITEMS,
  ...FRAMES_ITEMS,
  ...GRIDS_ITEMS,
  ...FORMS_ITEMS,
  ...MOCKUPS_ITEMS,
  ...CHARTS_ITEMS,
  ...SHEETS_ITEMS,
  ...TABLES_ITEMS,
];

// Helper to get items by category
export function getElementsByCategory(categoryId: ElementCategoryId): ElementItem[] {
  return ALL_ELEMENT_ITEMS.filter((item) => item.categoryId === categoryId);
}
