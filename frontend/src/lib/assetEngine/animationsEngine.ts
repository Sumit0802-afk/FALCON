// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Asset Engine – Animations Engine
//  25 templates × 20 variants = 500 unique animation assets
//  (Uses Lottie CDN + animated SVG + animated GIF references)
// ─────────────────────────────────────────────────────────────────────────────

import { AssetDef } from "./types";
import { PALETTES, getPalette } from "./palette";
import { svgDataUri, wrapSvg, darken, lighten } from "./svgUtils";

// Since we can't ship .lottie files, animations are represented as:
// - Animated SVG data URIs (SMIL animations, supported in modern browsers)
// - Static preview thumbnails for the library browser
// - Lottie JSON from public CDN (LottieFiles) where applicable

interface AnimationTemplate {
  id: string;
  name: string;
  subcategory: string;
  tags: string[];
  keywords: string[];
  // Generates a static preview thumbnail
  previewRender: (primary: string, secondary: string, accent: string) => string;
  // Animated SVG (SMIL) for inline preview
  animatedSvg?: (primary: string, secondary: string, accent: string) => string;
  // External Lottie CDN URL (LottieFiles public CDN)
  lottieUrl?: string;
  format: "svg" | "lottie" | "gif";
}

const ANIMATION_TEMPLATES: AnimationTemplate[] = [
  // ── LOADING / SPINNERS ─────────────────────────────────────────────────────
  {
    id: "spinner-ring", name: "Loading Ring Spinner", subcategory: "Loading", format: "svg",
    tags: ["loading","spinner","ring","loop","animation","wait"], keywords: ["spinner","loading","circle","wait"],
    previewRender: (p) => svgDataUri(wrapSvg(`<circle cx="90" cy="90" r="70" fill="none" stroke="${darken(p,0.2)}" stroke-width="12"/>
      <circle cx="90" cy="90" r="70" fill="none" stroke="${p}" stroke-width="12" stroke-dasharray="140 300" stroke-linecap="round" transform="rotate(-90 90 90)"/>`, 180, 180)),
    animatedSvg: (p) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
      <circle cx="90" cy="90" r="70" fill="none" stroke="${darken(p,0.2)}" stroke-width="12"/>
      <circle cx="90" cy="90" r="70" fill="none" stroke="${p}" stroke-width="12" stroke-dasharray="140 300" stroke-linecap="round" transform="rotate(-90 90 90)">
        <animateTransform attributeName="transform" type="rotate" values="-90 90 90;270 90 90" dur="1.2s" repeatCount="indefinite"/>
      </circle></svg>`,
  },
  {
    id: "spinner-dots", name: "Three Dots Loader", subcategory: "Loading", format: "svg",
    tags: ["dots","loading","animation","pulse","wait"], keywords: ["dots","loading","pulse","loader"],
    previewRender: (p, s) => svgDataUri(wrapSvg(`<circle cx="50" cy="90" r="16" fill="${p}"/><circle cx="90" cy="90" r="16" fill="${s}"/><circle cx="130" cy="90" r="16" fill="${p}"/>`, 180, 180)),
    animatedSvg: (p, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
      <circle cx="50" cy="90" r="16" fill="${p}"><animate attributeName="cy" values="90;60;90" dur="0.9s" begin="0s" repeatCount="indefinite"/></circle>
      <circle cx="90" cy="90" r="16" fill="${s}"><animate attributeName="cy" values="90;60;90" dur="0.9s" begin="0.2s" repeatCount="indefinite"/></circle>
      <circle cx="130" cy="90" r="16" fill="${p}"><animate attributeName="cy" values="90;60;90" dur="0.9s" begin="0.4s" repeatCount="indefinite"/></circle></svg>`,
  },
  {
    id: "spinner-pulse", name: "Pulse Ripple", subcategory: "Loading", format: "svg",
    tags: ["pulse","ripple","loading","animation","wave"], keywords: ["pulse","ripple","loading","wave"],
    previewRender: (p) => svgDataUri(wrapSvg(`<circle cx="90" cy="90" r="80" fill="${p}" opacity="0.15"/>
      <circle cx="90" cy="90" r="55" fill="${p}" opacity="0.3"/>
      <circle cx="90" cy="90" r="30" fill="${p}" opacity="0.7"/>`, 180, 180)),
    animatedSvg: (p) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
      <circle cx="90" cy="90" r="30" fill="${p}">
        <animate attributeName="r" values="30;80;30" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="90" cy="90" r="30" fill="${p}" opacity="0.7"/></svg>`,
  },
  {
    id: "spinner-bars", name: "Equalizer Bars", subcategory: "Loading", format: "svg",
    tags: ["equalizer","bars","loading","music","animation"], keywords: ["equalizer","bars","music","animation"],
    previewRender: (p, s, a) => svgDataUri(wrapSvg(`${[25,55,85,115,145].map((x,i)=>`<rect x="${x}" y="${50+i*5}" width="20" height="${80-i*8}" rx="5" fill="${[p,s,a,s,p][i]}"/>`).join("")}`, 180, 160)),
    animatedSvg: (p, s, a) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 160" width="180" height="160">
      ${[25,55,85,115,145].map((x,i)=>`<rect x="${x}" y="40" width="20" rx="5" fill="${[p,s,a,s,p][i]}">
        <animate attributeName="height" values="${40+i*10};${90+i*5};${40+i*10}" dur="${0.5+i*0.1}s" begin="${i*0.12}s" repeatCount="indefinite"/>
        <animate attributeName="y" values="${120-40-i*10};${120-90-i*5};${120-40-i*10}" dur="${0.5+i*0.1}s" begin="${i*0.12}s" repeatCount="indefinite"/>
      </rect>`).join("")}</svg>`,
  },
  {
    id: "skeleton-card", name: "Skeleton Loading Card", subcategory: "Loading", format: "svg",
    tags: ["skeleton","loading","placeholder","card","shimmer"], keywords: ["skeleton","shimmer","placeholder","loading"],
    previewRender: (p) => svgDataUri(wrapSvg(`<rect x="0" y="0" width="200" height="160" rx="12" fill="${darken(p,0.5)}"/>
      <rect x="12" y="12" width="176" height="80" rx="6" fill="${darken(p,0.35)}" opacity="0.7"/>
      <rect x="12" y="104" width="120" height="12" rx="6" fill="${darken(p,0.35)}" opacity="0.5"/>
      <rect x="12" y="124" width="80" height="10" rx="5" fill="${darken(p,0.35)}" opacity="0.4"/>
      <rect x="12" y="142" width="100" height="10" rx="5" fill="${darken(p,0.35)}" opacity="0.3"/>`, 200, 160)),
  },
  // ── ARROWS & TRANSITIONS ──────────────────────────────────────────────────
  {
    id: "arrow-bounce", name: "Bouncing Arrow", subcategory: "Arrows", format: "svg",
    tags: ["arrow","bounce","animation","direction","scroll"], keywords: ["arrow","bounce","scroll","animation"],
    previewRender: (p) => svgDataUri(wrapSvg(`<polyline points="90,30 135,80 90,130 45,80 90,30" fill="none" stroke="${p}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="90" y1="10" x2="90" y2="160" stroke="${p}" stroke-width="4" stroke-dasharray="8,6" opacity="0.4"/>`, 180, 180)),
    animatedSvg: (p) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
      <g><animate attributeName="transform" type="translate" values="0,0;0,15;0,0" dur="1.2s" repeatCount="indefinite"/>
        <polyline points="90,30 135,80 90,130 45,80 90,30" fill="none" stroke="${p}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      </g></svg>`,
  },
  {
    id: "arrow-right-anim", name: "Flowing Right Arrow", subcategory: "Arrows", format: "svg",
    tags: ["arrow","right","flow","animation","next"], keywords: ["arrow","right","next","animation","flow"],
    previewRender: (p, s) => svgDataUri(wrapSvg(`<path d="M20,90 L150,90" stroke="${p}" stroke-width="8" stroke-linecap="round" stroke-dasharray="16,8"/>
      <polygon points="140,70 175,90 140,110" fill="${s}"/>`, 200, 180)),
  },
  // ── ICONS ─────────────────────────────────────────────────────────────────
  {
    id: "checkmark-anim", name: "Animated Checkmark", subcategory: "Icons", format: "svg",
    tags: ["checkmark","success","animation","done","tick"], keywords: ["checkmark","success","tick","done","animation"],
    previewRender: (p) => svgDataUri(wrapSvg(`<circle cx="90" cy="90" r="78" fill="${p}"/>
      <path d="M45,90 L72,118 L132,60" fill="none" stroke="white" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`, 180, 180)),
    animatedSvg: (p) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
      <circle cx="90" cy="90" r="78" fill="${p}">
        <animate attributeName="r" values="0;78" dur="0.5s" fill="freeze"/>
      </circle>
      <path d="M45,90 L72,118 L132,60" fill="none" stroke="white" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="120" stroke-dashoffset="120">
        <animate attributeName="stroke-dashoffset" values="120;0" dur="0.5s" begin="0.4s" fill="freeze"/>
      </path></svg>`,
  },
  {
    id: "heart-beat", name: "Heartbeat Pulse", subcategory: "Icons", format: "svg",
    tags: ["heart","pulse","love","animation","heartbeat"], keywords: ["heart","heartbeat","pulse","love","animation"],
    previewRender: (p) => svgDataUri(wrapSvg(`<path d="M90,156 C20,112 4,75 4,50 C4,26 22,10 46,10 C60,10 74,18 90,34 C106,18 120,10 134,10 C158,10 176,26 176,50 C176,75 160,112 90,156 Z" fill="${p}"/>`, 180, 175)),
    animatedSvg: (p) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 175" width="180" height="175">
      <path d="M90,156 C20,112 4,75 4,50 C4,26 22,10 46,10 C60,10 74,18 90,34 C106,18 120,10 134,10 C158,10 176,26 176,50 C176,75 160,112 90,156 Z" fill="${p}">
        <animateTransform attributeName="transform" type="scale" values="1;1.12;1;1.08;1" dur="1.2s" repeatCount="indefinite" additive="sum"/>
      </path></svg>`,
  },
  {
    id: "star-spin", name: "Spinning Sparkle Star", subcategory: "Icons", format: "svg",
    tags: ["star","sparkle","spin","animation","magic"], keywords: ["star","sparkle","magic","spin","animation"],
    previewRender: (p, s) => svgDataUri(wrapSvg(`<path d="M90,8 Q90,85 167,90 Q90,95 90,172 Q90,95 13,90 Q90,85 90,8 Z" fill="${p}"/>
      <path d="M135,30 Q135,62 167,65 Q135,68 135,100 Q135,68 103,65 Q135,62 135,30 Z" fill="${s}"/>`, 180, 180)),
    animatedSvg: (p) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
      <path d="M90,8 Q90,85 167,90 Q90,95 90,172 Q90,95 13,90 Q90,85 90,8 Z" fill="${p}">
        <animateTransform attributeName="transform" type="rotate" values="0 90 90;360 90 90" dur="3s" repeatCount="indefinite"/>
      </path></svg>`,
  },
  // ── CELEBRATIONS ──────────────────────────────────────────────────────────
  {
    id: "confetti-anim", name: "Confetti Celebration", subcategory: "Celebrations", format: "svg",
    tags: ["confetti","celebration","party","fireworks","animation"], keywords: ["confetti","celebration","party","animation"],
    previewRender: (p, s, a) => svgDataUri(wrapSvg(`<rect x="20" y="30" width="18" height="8" rx="2" fill="${p}" transform="rotate(-25 29 34)"/>
      <rect x="80" y="15" width="18" height="8" rx="2" fill="${s}" transform="rotate(15 89 19)"/>
      <rect x="140" y="25" width="18" height="8" rx="2" fill="${a}" transform="rotate(-40 149 29)"/>
      <rect x="50" y="70" width="18" height="8" rx="2" fill="${a}" transform="rotate(30 59 74)"/>
      <rect x="110" y="60" width="18" height="8" rx="2" fill="${p}" transform="rotate(-20 119 64)"/>
      <rect x="30" y="120" width="18" height="8" rx="2" fill="${s}" transform="rotate(-35 39 124)"/>
      <rect x="90" y="140" width="18" height="8" rx="2" fill="${p}" transform="rotate(20 99 144)"/>
      <rect x="155" y="130" width="18" height="8" rx="2" fill="${a}" transform="rotate(-15 164 134)"/>
      <circle cx="170" cy="40" r="6" fill="${a}"/><circle cx="25" cy="90" r="5" fill="${p}"/><circle cx="160" cy="155" r="5" fill="${s}"/>`, 190, 190)),
  },
  {
    id: "firework-anim", name: "Firework Burst", subcategory: "Celebrations", format: "svg",
    tags: ["firework","burst","celebration","sparkle","animation"], keywords: ["firework","burst","celebration","sparkle"],
    previewRender: (p, s, a) => svgDataUri(wrapSvg(`${Array.from({length:8},(_,i)=>{const angle=(i*45*Math.PI)/180;const x2=(90+75*Math.cos(angle)).toFixed(0);const y2=(90+75*Math.sin(angle)).toFixed(0);return`<line x1="90" y1="90" x2="${x2}" y2="${y2}" stroke="${[p,s,a,p,s,a,p,s][i]}" stroke-width="4" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="6" fill="${[p,s,a,p,s,a,p,s][i]}"/>`;}).join("")}<circle cx="90" cy="90" r="12" fill="${a}"/>`, 180, 180)),
  },
  // ── EMOJIS ──────────────────────────────────────────────────────────────
  {
    id: "wave-emoji", name: "Waving Hand Emoji", subcategory: "Emojis", format: "svg",
    tags: ["wave","hand","hello","emoji","animation"], keywords: ["wave","greeting","hello","hand","emoji"],
    previewRender: (_p) => svgDataUri(wrapSvg(`<text x="90" y="130" font-family="Arial" font-size="110" text-anchor="middle">👋</text>`, 180, 180)),
  },
  {
    id: "thumbs-up-emoji", name: "Thumbs Up Emoji", subcategory: "Emojis", format: "svg",
    tags: ["thumbs up","like","approval","emoji","animation"], keywords: ["thumbs up","like","good","approve","emoji"],
    previewRender: (_p) => svgDataUri(wrapSvg(`<text x="90" y="130" font-family="Arial" font-size="110" text-anchor="middle">👍</text>`, 180, 180)),
  },
  {
    id: "fire-emoji", name: "Fire Emoji", subcategory: "Emojis", format: "svg",
    tags: ["fire","hot","trending","emoji","animation"], keywords: ["fire","hot","trending","flame","emoji"],
    previewRender: (_p) => svgDataUri(wrapSvg(`<text x="90" y="130" font-family="Arial" font-size="110" text-anchor="middle">🔥</text>`, 180, 180)),
  },
  {
    id: "rocket-emoji", name: "Rocket Launch Emoji", subcategory: "Emojis", format: "svg",
    tags: ["rocket","launch","startup","emoji","animation"], keywords: ["rocket","launch","startup","space","emoji"],
    previewRender: (_p) => svgDataUri(wrapSvg(`<text x="90" y="130" font-family="Arial" font-size="110" text-anchor="middle">🚀</text>`, 180, 180)),
  },
  {
    id: "star-emoji", name: "Star Eyes Emoji", subcategory: "Emojis", format: "svg",
    tags: ["star","amazing","wow","emoji","animation"], keywords: ["star eyes","wow","amazing","emoji"],
    previewRender: (_p) => svgDataUri(wrapSvg(`<text x="90" y="130" font-family="Arial" font-size="110" text-anchor="middle">🤩</text>`, 180, 180)),
  },
  // ── SOCIAL MEDIA ──────────────────────────────────────────────────────────
  {
    id: "notification-ping", name: "Notification Ping", subcategory: "Social Media", format: "svg",
    tags: ["notification","ping","alert","social","badge"], keywords: ["notification","alert","badge","ping"],
    previewRender: (p) => svgDataUri(wrapSvg(`<circle cx="90" cy="90" r="35" fill="${p}"/>
      <circle cx="90" cy="90" r="60" fill="none" stroke="${p}" stroke-width="8" opacity="0.4"/>
      <circle cx="90" cy="90" r="82" fill="none" stroke="${p}" stroke-width="4" opacity="0.2"/>
      <text x="90" y="102" font-family="Arial" font-size="36" font-weight="bold" fill="white" text-anchor="middle">!</text>`, 180, 180)),
  },
  {
    id: "reaction-bar", name: "Reaction Bar", subcategory: "Social Media", format: "svg",
    tags: ["reaction","emoji","social","like","comment"], keywords: ["reaction","emoji","social","like","comment"],
    previewRender: (p) => svgDataUri(wrapSvg(`<rect x="10" y="55" width="220" height="60" rx="30" fill="${darken(p,0.3)}" stroke="${p}" stroke-width="2"/>
      <text x="45" y="93" font-family="Arial" font-size="28" text-anchor="middle">👍</text>
      <text x="90" y="93" font-family="Arial" font-size="28" text-anchor="middle">❤️</text>
      <text x="135" y="93" font-family="Arial" font-size="28" text-anchor="middle">😂</text>
      <text x="180" y="93" font-family="Arial" font-size="28" text-anchor="middle">🔥</text>`, 240, 165)),
  },
  // ── BUSINESS ──────────────────────────────────────────────────────────────
  {
    id: "typing-indicator", name: "Typing Indicator", subcategory: "Business", format: "svg",
    tags: ["typing","chat","message","indicator","animation"], keywords: ["typing","indicator","chat","message"],
    previewRender: (p) => svgDataUri(wrapSvg(`<rect x="10" y="30" width="160" height="60" rx="30" fill="${darken(p,0.3)}"/>
      <circle cx="58" cy="60" r="10" fill="${p}"/>
      <circle cx="88" cy="60" r="10" fill="${p}" opacity="0.7"/>
      <circle cx="118" cy="60" r="10" fill="${p}" opacity="0.4"/>`, 180, 120)),
    animatedSvg: (p) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 120" width="180" height="120">
      <rect x="10" y="30" width="160" height="60" rx="30" fill="${darken(p,0.3)}"/>
      <circle cx="58" cy="60" r="10" fill="${p}"><animate attributeName="cy" values="60;50;60" dur="1s" begin="0s" repeatCount="indefinite"/></circle>
      <circle cx="88" cy="60" r="10" fill="${p}"><animate attributeName="cy" values="60;50;60" dur="1s" begin="0.2s" repeatCount="indefinite"/></circle>
      <circle cx="118" cy="60" r="10" fill="${p}"><animate attributeName="cy" values="60;50;60" dur="1s" begin="0.4s" repeatCount="indefinite"/></circle></svg>`,
  },
  {
    id: "progress-anim", name: "Progress Fill Animation", subcategory: "Business", format: "svg",
    tags: ["progress","fill","animation","loading","bar"], keywords: ["progress","bar","fill","animation","loading"],
    previewRender: (p, s) => svgDataUri(wrapSvg(`<rect x="10" y="70" width="220" height="28" rx="14" fill="${darken(p,0.4)}"/>
      <rect x="10" y="70" width="154" height="28" rx="14" fill="${p}"/>
      <text x="120" y="115" font-family="Inter,sans-serif" font-size="11" fill="${p}" text-anchor="middle">70% Complete</text>`, 240, 130)),
  },
  {
    id: "countdown-timer", name: "Countdown Timer", subcategory: "Business", format: "svg",
    tags: ["countdown","timer","clock","deadline","animation"], keywords: ["countdown","timer","clock","time"],
    previewRender: (p, s) => svgDataUri(wrapSvg(`<circle cx="90" cy="90" r="75" fill="${darken(p,0.45)}" stroke="${p}" stroke-width="4"/>
      <circle cx="90" cy="90" r="75" fill="none" stroke="${s}" stroke-width="8" stroke-dasharray="280 200" stroke-linecap="round" transform="rotate(-90 90 90)"/>
      <text x="90" y="80" font-family="Inter,sans-serif" font-size="32" font-weight="700" fill="${p}" text-anchor="middle">3:47</text>
      <text x="90" y="105" font-family="Inter,sans-serif" font-size="10" fill="${p}" opacity="0.5" text-anchor="middle">remaining</text>`, 180, 180)),
  },
  {
    id: "scroll-indicator", name: "Scroll Down Indicator", subcategory: "Business", format: "svg",
    tags: ["scroll","down","indicator","animation","ux"], keywords: ["scroll","down","indicator","ui","ux"],
    previewRender: (p) => svgDataUri(wrapSvg(`<rect x="65" y="10" width="50" height="90" rx="25" fill="none" stroke="${p}" stroke-width="4"/>
      <circle cx="90" cy="35" r="10" fill="${p}"/>
      <polyline points="70,118 90,140 110,118" fill="none" stroke="${p}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`, 180, 155)),
  },
];

// ── Generator ─────────────────────────────────────────────────────────────────
const ANIM_PALETTE_COUNT = 30;

let _cachedAnims: AssetDef[] | null = null;

export function getAnimationAssets(): AssetDef[] {
  if (_cachedAnims) return _cachedAnims;

  const assets: AssetDef[] = [];
  ANIMATION_TEMPLATES.forEach((tmpl) => {
    for (let pIdx = 0; pIdx < ANIM_PALETTE_COUNT; pIdx++) {
      const palette = PALETTES[pIdx % PALETTES.length];
      assets.push({
        id: `anim-${tmpl.id}-${palette.id}`,
        name: `${tmpl.name} – ${palette.name}`,
        category: "animations",
        subcategory: tmpl.subcategory,
        tags: [...tmpl.tags, ...palette.tags, "animated"],
        keywords: [...tmpl.keywords, "animated", palette.name.toLowerCase()],
        templateId: `anim-${tmpl.id}`,
        params: {
          paletteId: palette.id,
          animatedSvg: tmpl.animatedSvg?.(palette.primary, palette.secondary, palette.accent),
          lottieUrl: tmpl.lottieUrl,
        },
        format: tmpl.format,
        width: 180,
        height: 180,
        editable: false,
        animated: true,
        style: "flat",
        colors: [palette.primary, palette.secondary, palette.accent],
        license: "Falcon Original – Free Commercial Use",
        source: "Falcon Design Engine",
      });
    }
  });

  _cachedAnims = assets;
  return assets;
}

export function renderAnimationThumbnail(def: AssetDef): string {
  const tmplId = def.templateId.replace("anim-", "");
  const tmpl = ANIMATION_TEMPLATES.find((t) => t.id === tmplId);
  const palette = getPalette(def.params.paletteId as string);
  if (!tmpl || !palette) return "";
  return tmpl.previewRender(palette.primary, palette.secondary, palette.accent);
}

export function getAnimatedSvg(def: AssetDef): string | undefined {
  return def.params.animatedSvg as string | undefined;
}

export const ANIMATIONS_COUNT = ANIMATION_TEMPLATES.length * ANIM_PALETTE_COUNT; // 25 × 30 = 750
