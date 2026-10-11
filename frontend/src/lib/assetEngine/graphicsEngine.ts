// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Asset Engine – Graphics Engine
//  55 base templates × 40 color variants = 2,200 unique graphic assets
// ─────────────────────────────────────────────────────────────────────────────

import { AssetDef, AssetStyle, Palette } from "./types";
import { PALETTES, getPalette } from "./palette";
import { svgDataUri, wrapSvg, linearGrad, radialGrad, starPoints, dropShadow, lighten, darken } from "./svgUtils";

const PALETTES_GFX = PALETTES; // all 45, cycle through

interface GfxTemplate {
  id: string;
  name: string;
  subcategory: string;
  tags: string[];
  keywords: string[];
  width: number;
  height: number;
  render: (p: Palette, v: number) => string;
}

const GFX_TEMPLATES: GfxTemplate[] = [
  // ── ICONS ─────────────────────────────────────────────────────────────────
  {
    id: "checkmark-icon", name: "Checkmark Badge", subcategory: "Icons", width: 160, height: 160,
    tags: ["check","success","done","verified","approve","icon"], keywords: ["tick","checkmark","done","success"],
    render: (p, _v) => svgDataUri(wrapSvg(`<circle cx="80" cy="80" r="75" fill="${p.primary}"/><path d="M38,80 L65,110 L122,52" fill="none" stroke="${p.light}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`, 160, 160)),
  },
  {
    id: "warning-icon", name: "Warning Triangle", subcategory: "Icons", width: 170, height: 155,
    tags: ["warning","alert","caution","danger","icon"], keywords: ["warning","alert","danger","exclamation"],
    render: (p, _v) => svgDataUri(wrapSvg(`<polygon points="85,8 165,148 5,148" fill="${p.primary}"/><text x="85" y="130" font-family="Inter,sans-serif" font-size="72" font-weight="900" fill="${p.light}" text-anchor="middle">!</text>`, 170, 155)),
  },
  {
    id: "info-icon", name: "Info Circle", subcategory: "Icons", width: 160, height: 160,
    tags: ["info","information","help","icon","question"], keywords: ["info","i","information","help"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.secondary)}</defs><circle cx="80" cy="80" r="75" fill="url(#g)"/><text x="80" y="95" font-family="Inter,sans-serif" font-size="68" font-weight="900" fill="${p.light}" text-anchor="middle">i</text>`, 160, 160)),
  },
  {
    id: "lock-icon", name: "Lock Security", subcategory: "Icons", width: 150, height: 175,
    tags: ["lock","security","password","private","icon"], keywords: ["lock","secure","password","private"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.dark)}</defs>
      <rect x="15" y="75" width="120" height="90" rx="14" fill="url(#g)"/>
      <path d="M35,75 L35,48 A45,45 0 0 1 115,48 L115,75" fill="none" stroke="${p.primary}" stroke-width="14" stroke-linecap="round"/>
      <circle cx="75" cy="112" r="14" fill="${p.light}" opacity="0.7"/>`, 150, 175)),
  },
  {
    id: "search-icon", name: "Search Magnifier", subcategory: "Icons", width: 170, height: 170,
    tags: ["search","find","magnifier","zoom","icon"], keywords: ["search","find","magnify","zoom","explore"],
    render: (p, _v) => svgDataUri(wrapSvg(`<circle cx="70" cy="70" r="55" fill="none" stroke="${p.primary}" stroke-width="14"/>
      <line x1="115" y1="115" x2="162" y2="162" stroke="${p.primary}" stroke-width="14" stroke-linecap="round"/>`, 170, 170)),
  },
  {
    id: "share-icon", name: "Share Network", subcategory: "Icons", width: 160, height: 160,
    tags: ["share","network","social","distribute","icon"], keywords: ["share","social","network","distribute"],
    render: (p, _v) => svgDataUri(wrapSvg(`<circle cx="120" cy="30" r="22" fill="${p.primary}"/>
      <circle cx="30" cy="80" r="22" fill="${p.secondary}"/>
      <circle cx="120" cy="130" r="22" fill="${p.accent}"/>
      <line x1="52" y1="70" x2="98" y2="40" stroke="${p.primary}" stroke-width="5"/>
      <line x1="52" y1="90" x2="98" y2="120" stroke="${p.primary}" stroke-width="5"/>`, 160, 160)),
  },
  {
    id: "email-icon", name: "Email Envelope", subcategory: "Icons", width: 180, height: 130,
    tags: ["email","mail","envelope","message","icon"], keywords: ["email","mail","letter","envelope"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.secondary)}</defs>
      <rect x="5" y="10" width="170" height="110" rx="12" fill="url(#g)"/>
      <polyline points="5,10 90,75 175,10" fill="none" stroke="${p.light}" stroke-width="5" stroke-linejoin="round"/>`, 180, 130)),
  },
  {
    id: "calendar-icon", name: "Calendar Date", subcategory: "Icons", width: 160, height: 170,
    tags: ["calendar","date","schedule","event","icon"], keywords: ["calendar","schedule","date","event"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="5" y="25" width="150" height="140" rx="12" fill="${p.primary}"/>
      <rect x="5" y="25" width="150" height="45" rx="12" fill="${p.dark}"/>
      <rect x="5" y="60" width="150" height="12" fill="${p.dark}"/>
      <circle cx="45" cy="15" r="10" fill="${p.secondary}"/><circle cx="115" cy="15" r="10" fill="${p.secondary}"/>
      <rect x="25" y="90" width="25" height="20" rx="4" fill="${p.light}" opacity="0.7"/>
      <rect x="67" y="90" width="25" height="20" rx="4" fill="${p.light}" opacity="0.7"/>
      <rect x="110" y="90" width="25" height="20" rx="4" fill="${p.light}" opacity="0.7"/>
      <rect x="25" y="125" width="25" height="20" rx="4" fill="${p.light}" opacity="0.5"/>
      <rect x="67" y="125" width="25" height="20" rx="4" fill="${p.accent}" opacity="0.8"/>`, 160, 170)),
  },
  {
    id: "heart-icon", name: "Heart Favorite", subcategory: "Icons", width: 160, height: 150,
    tags: ["heart","love","like","favorite","social","icon"], keywords: ["heart","love","like","favorite"],
    render: (p, v) => {
      const fill = v % 2 === 0 ? p.primary : `url(#g)`;
      const defs = v % 2 !== 0 ? `<defs>${linearGrad("g", p.primary, p.accent)}</defs>` : "";
      return svgDataUri(wrapSvg(`${defs}<path d="M80,140 C18,100 4,68 4,44 C4,20 22,5 44,5 C58,5 70,12 80,24 C90,12 102,5 116,5 C138,5 156,20 156,44 C156,68 142,100 80,140 Z" fill="${fill}"/>`, 160, 150));
    },
  },
  {
    id: "star-rating", name: "Star Rating", subcategory: "Icons", width: 200, height: 50,
    tags: ["star","rating","review","score","quality"], keywords: ["star","rating","review","quality"],
    render: (p, _v) => {
      const pts5 = starPoints(5, 25, 25, 22, 9);
      const star = `<polygon points="${pts5}" fill="${p.primary}"/>`;
      const g = [0, 45, 90, 135, 180].map((x) => `<g transform="translate(${x},0)">${star}</g>`).join("");
      return svgDataUri(wrapSvg(g, 225, 50));
    },
  },
  // ── ILLUSTRATIONS ─────────────────────────────────────────────────────────
  {
    id: "rocket-launch", name: "Rocket Launch", subcategory: "Illustrations", width: 170, height: 200,
    tags: ["rocket","launch","startup","space","technology","fast"], keywords: ["rocket","launch","startup","speed"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.secondary)}</defs>
      <path d="M85,10 C120,10 148,40 148,90 L148,145 L85,175 L22,145 L22,90 C22,40 50,10 85,10 Z" fill="url(#g)"/>
      <ellipse cx="85" cy="90" rx="28" ry="28" fill="${p.light}" opacity="0.35"/>
      <path d="M22,130 L5,165 L55,150 Z" fill="${p.secondary}"/>
      <path d="M148,130 L165,165 L115,150 Z" fill="${p.secondary}"/>
      <polygon points="65,165 85,195 105,165" fill="${p.accent}"/>`, 170, 200)),
  },
  {
    id: "idea-bulb", name: "Light Bulb Idea", subcategory: "Illustrations", width: 160, height: 200,
    tags: ["idea","bulb","lightbulb","creativity","inspiration"], keywords: ["idea","lightbulb","creative","inspiration"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.accent, p.primary)}</defs>
      <path d="M80,15 A55,55 0 0 1 135,70 C135,95 118,110 112,125 L48,125 C42,110 25,95 25,70 A55,55 0 0 1 80,15 Z" fill="url(#g)"/>
      <rect x="50" y="128" width="60" height="12" rx="4" fill="${p.primary}"/>
      <rect x="55" y="144" width="50" height="12" rx="4" fill="${p.primary}"/>
      <rect x="60" y="160" width="40" height="12" rx="6" fill="${p.secondary}"/>
      <path d="M80,5 L80,0 M45,20 L40,15 M115,20 L120,15 M25,55 L18,55 M135,55 L142,55" stroke="${p.accent}" stroke-width="4" stroke-linecap="round"/>`, 160, 200)),
  },
  {
    id: "trophy-award", name: "Trophy Award", subcategory: "Illustrations", width: 170, height: 200,
    tags: ["trophy","award","winner","prize","achievement"], keywords: ["trophy","award","winner","champion"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.accent, p.primary)}</defs>
      <path d="M40,10 L130,10 L125,90 C125,120 100,138 85,138 C70,138 45,120 45,90 Z" fill="url(#g)"/>
      <path d="M40,30 L10,30 A28,28 0 0 0 40,58 Z" fill="${p.secondary}"/>
      <path d="M130,30 L160,30 A28,28 0 0 1 130,58 Z" fill="${p.secondary}"/>
      <rect x="68" y="138" width="34" height="32" rx="4" fill="${p.primary}"/>
      <rect x="40" y="168" width="90" height="18" rx="6" fill="${p.dark}"/>`, 170, 200)),
  },
  {
    id: "chart-growth", name: "Growth Chart", subcategory: "Business", width: 190, height: 150,
    tags: ["chart","growth","business","analytics","trend","up"], keywords: ["chart","growth","trend","analytics"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.accent, 90)}</defs>
      <line x1="20" y1="10" x2="20" y2="140" stroke="${p.secondary}" stroke-width="2"/>
      <line x1="20" y1="140" x2="185" y2="140" stroke="${p.secondary}" stroke-width="2"/>
      <path d="M20,130 Q55,110 90,85 T160,40 L160,140 L20,140 Z" fill="url(#g)" opacity="0.7"/>
      <path d="M20,130 Q55,110 90,85 T160,40" fill="none" stroke="${p.primary}" stroke-width="4"/>
      <circle cx="160" cy="40" r="7" fill="${p.primary}"/>`, 190, 150)),
  },
  {
    id: "data-dashboard", name: "Data Dashboard", subcategory: "Business", width: 200, height: 160,
    tags: ["dashboard","data","analytics","metrics","kpi"], keywords: ["dashboard","analytics","metrics","data"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="0" y="0" width="200" height="160" rx="12" fill="${darken(p.dark, 0.3)}"/>
      <rect x="10" y="10" width="55" height="55" rx="8" fill="${p.primary}"/><text x="37" y="44" font-family="Inter,sans-serif" font-size="18" font-weight="bold" fill="${p.light}" text-anchor="middle">42%</text>
      <rect x="75" y="10" width="55" height="55" rx="8" fill="${p.secondary}"/><text x="102" y="44" font-family="Inter,sans-serif" font-size="18" font-weight="bold" fill="${p.light}" text-anchor="middle">↑18</text>
      <rect x="140" y="10" width="52" height="55" rx="8" fill="${p.accent}"/><text x="166" y="44" font-family="Inter,sans-serif" font-size="18" font-weight="bold" fill="${p.dark}" text-anchor="middle">99</text>
      <rect x="10" y="77" width="182" height="38" rx="6" fill="${p.primary}" opacity="0.25"/>
      <rect x="10" y="125" width="182" height="28" rx="6" fill="${p.secondary}" opacity="0.2"/>`, 200, 160)),
  },
  // ── DECORATIVE ─────────────────────────────────────────────────────────
  {
    id: "confetti", name: "Confetti Burst", subcategory: "Decorative", width: 190, height: 190,
    tags: ["confetti","party","celebration","colorful","fun"], keywords: ["confetti","celebration","party","scatter"],
    render: (p, v) => {
      const pieces = [
        { x: 20, y: 30, r: -25, fill: p.primary },
        { x: 80, y: 15, r: 15, fill: p.secondary },
        { x: 140, y: 25, r: -40, fill: p.accent },
        { x: 55, y: 70, r: 30, fill: p.accent },
        { x: 110, y: 60, r: -20, fill: p.primary },
        { x: 165, y: 80, r: 45, fill: p.secondary },
        { x: 30, y: 120, r: -35, fill: p.secondary },
        { x: 90, y: 140, r: 20, fill: p.primary },
        { x: 155, y: 130, r: -15, fill: p.accent },
        { x: 50, y: 160, r: 40, fill: p.accent },
        { x: 130, y: 170, r: -30, fill: p.primary },
      ];
      const rects = pieces.map((pc) =>
        `<rect x="${pc.x}" y="${pc.y}" width="18" height="8" rx="2" fill="${pc.fill}" transform="rotate(${pc.r} ${pc.x + 9} ${pc.y + 4})"/>`
      ).join("");
      const dots = `<circle cx="170" cy="40" r="6" fill="${p.accent}"/><circle cx="25" cy="90" r="5" fill="${p.primary}"/><circle cx="165" cy="155" r="5" fill="${p.secondary}"/>`;
      return svgDataUri(wrapSvg(rects + dots, 190, 190));
    },
  },
  {
    id: "sparkles-badge", name: "Sparkle Magic", subcategory: "Decorative", width: 180, height: 180,
    tags: ["sparkles","magic","stars","glow","effect"], keywords: ["sparkle","magic","star","glitter","shimmer"],
    render: (p, _v) => svgDataUri(wrapSvg(`<path d="M90,8 Q90,85 167,90 Q90,95 90,172 Q90,95 13,90 Q90,85 90,8 Z" fill="${p.accent}" filter="drop-shadow(0 0 8px ${p.primary})"/>
      <path d="M140,30 Q140,62 172,65 Q140,68 140,100 Q140,68 108,65 Q140,62 140,30 Z" fill="${p.secondary}"/>
      <circle cx="42" cy="42" r="9" fill="${p.primary}"/>
      <circle cx="50" cy="148" r="7" fill="${p.accent}"/>
      <circle cx="155" cy="150" r="8" fill="${p.secondary}"/>`, 180, 180)),
  },
  {
    id: "leaves-decor", name: "Botanical Leaves", subcategory: "Decorative", width: 180, height: 190,
    tags: ["leaves","botanical","nature","green","plant","organic"], keywords: ["leaf","botanical","plant","nature","organic"],
    render: (p, _v) => svgDataUri(wrapSvg(`<path d="M90,10 C150,30 180,90 170,155 C160,215 110,235 90,240 C70,235 20,215 10,155 C0,90 30,30 90,10 Z" fill="${p.primary}"/>
      <path d="M90,20 L90,240" stroke="${darken(p.primary, 0.3)}" stroke-width="5" stroke-linecap="round"/>
      <path d="M90,55 C120,45 155,38 165,20" stroke="${darken(p.primary, 0.3)}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M90,90 C130,80 165,82 172,68" stroke="${darken(p.primary, 0.3)}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M90,130 C130,120 162,135 168,125" stroke="${darken(p.primary, 0.3)}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M90,55 C60,45 25,38 15,20" stroke="${darken(p.primary, 0.3)}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M90,90 C50,80 15,82 8,68" stroke="${darken(p.primary, 0.3)}" stroke-width="4" fill="none" stroke-linecap="round"/>`, 180, 190)),
  },
  {
    id: "crown-royal", name: "Royal Crown", subcategory: "Decorative", width: 190, height: 140,
    tags: ["crown","royal","king","queen","gold","premium"], keywords: ["crown","royal","king","premium","leader"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.accent, p.primary)}</defs>
      <path d="M10,120 L10,55 L48,85 L95,10 L142,85 L180,55 L180,120 Z" fill="url(#g)"/>
      <rect x="10" y="120" width="170" height="18" rx="5" fill="${p.dark}"/>
      <circle cx="48" cy="85" r="10" fill="${p.light}" opacity="0.8"/>
      <circle cx="95" cy="10" r="10" fill="${p.light}" opacity="0.8"/>
      <circle cx="142" cy="85" r="10" fill="${p.light}" opacity="0.8"/>`, 190, 140)),
  },
  {
    id: "flower-mandala", name: "Flower Mandala", subcategory: "Decorative", width: 190, height: 190,
    tags: ["mandala","flower","zen","decorative","pattern","geometric"], keywords: ["mandala","flower","zen","pattern"],
    render: (p, v) => {
      const n = [6, 8, 10, 12][v % 4];
      const petals = Array.from({ length: n }, (_, i) => {
        const angle = (i * 360) / n;
        return `<ellipse cx="95" cy="95" rx="12" ry="40" fill="${i % 2 === 0 ? p.primary : p.secondary}" opacity="0.85" transform="rotate(${angle} 95 95)"/>`;
      }).join("");
      return svgDataUri(wrapSvg(`${petals}<circle cx="95" cy="95" r="20" fill="${p.accent}"/>`, 190, 190));
    },
  },
  // ── TECHNOLOGY ──────────────────────────────────────────────────────────
  {
    id: "circuit-board", name: "Circuit Board", subcategory: "Technology", width: 190, height: 160,
    tags: ["circuit","technology","tech","electronic","digital"], keywords: ["circuit","electronic","tech","board"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect width="190" height="160" rx="10" fill="${darken(p.dark, 0.4)}"/>
      <line x1="10" y1="40" x2="80" y2="40" stroke="${p.primary}" stroke-width="2"/><line x1="80" y1="40" x2="80" y2="80" stroke="${p.primary}" stroke-width="2"/>
      <line x1="80" y1="80" x2="150" y2="80" stroke="${p.primary}" stroke-width="2"/><line x1="150" y1="80" x2="150" y2="120" stroke="${p.primary}" stroke-width="2"/>
      <line x1="30" y1="100" x2="110" y2="100" stroke="${p.secondary}" stroke-width="2"/><line x1="110" y1="40" x2="180" y2="40" stroke="${p.secondary}" stroke-width="2"/>
      <circle cx="80" cy="40" r="5" fill="${p.accent}"/><circle cx="80" cy="80" r="5" fill="${p.accent}"/>
      <circle cx="150" cy="80" r="5" fill="${p.accent}"/><circle cx="150" cy="120" r="5" fill="${p.accent}"/>
      <rect x="45" y="25" width="24" height="14" rx="2" fill="${p.primary}"/>
      <rect x="115" y="65" width="24" height="14" rx="2" fill="${p.secondary}"/>`, 190, 160)),
  },
  {
    id: "fingerprint", name: "Fingerprint", subcategory: "Technology", width: 170, height: 190,
    tags: ["fingerprint","biometric","security","identity","scan"], keywords: ["fingerprint","biometric","scan","identity"],
    render: (p, _v) => svgDataUri(wrapSvg(`<path d="M85,10 C120,10 148,35 148,70 L148,150 C148,175 118,185 85,185 C52,185 22,175 22,150 L22,70 C22,35 50,10 85,10 Z" fill="none" stroke="${p.primary}" stroke-width="3.5"/>
      <path d="M55,70 C55,52 69,40 85,40 C101,40 115,52 115,70 L115,150" fill="none" stroke="${p.primary}" stroke-width="3"/>
      <path d="M70,85 C70,75 77,68 85,68 C93,68 100,75 100,85 L100,150" fill="none" stroke="${p.accent}" stroke-width="2.5"/>
      <path d="M40,110 C40,88 60,72 85,72" fill="none" stroke="${p.secondary}" stroke-width="2.5"/>`, 170, 190)),
  },
  {
    id: "code-bracket", name: "Code Brackets", subcategory: "Technology", width: 190, height: 140,
    tags: ["code","programming","developer","bracket","tech"], keywords: ["code","programming","developer","html"],
    render: (p, _v) => svgDataUri(wrapSvg(`<text x="95" y="100" font-family="monospace" font-size="88" font-weight="bold" fill="${p.primary}" text-anchor="middle" opacity="0.9">&lt;/&gt;</text>`, 190, 140)),
  },
  {
    id: "ai-brain-icon", name: "AI Brain Neural", subcategory: "Technology", width: 180, height: 170,
    tags: ["ai","brain","neural","intelligence","machine learning"], keywords: ["ai","brain","neural","machine"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.secondary)}</defs>
      <path d="M90,20 C60,20 35,40 30,65 C20,70 12,80 12,95 C12,112 22,125 40,130 C42,148 55,165 90,165 C125,165 138,148 140,130 C158,125 168,112 168,95 C168,80 160,70 150,65 C145,40 120,20 90,20 Z" fill="url(#g)" opacity="0.9"/>
      <circle cx="60" cy="85" r="6" fill="${p.light}"/><circle cx="90" cy="70" r="6" fill="${p.light}"/><circle cx="120" cy="85" r="6" fill="${p.light}"/>
      <circle cx="55" cy="110" r="6" fill="${p.light}"/><circle cx="90" cy="120" r="6" fill="${p.light}"/><circle cx="125" cy="110" r="6" fill="${p.light}"/>
      <line x1="60" y1="85" x2="90" y2="70" stroke="${p.light}" stroke-width="2"/><line x1="90" y1="70" x2="120" y2="85" stroke="${p.light}" stroke-width="2"/>
      <line x1="60" y1="85" x2="55" y2="110" stroke="${p.light}" stroke-width="2"/><line x1="120" y1="85" x2="125" y2="110" stroke="${p.light}" stroke-width="2"/>
      <line x1="55" y1="110" x2="90" y2="120" stroke="${p.light}" stroke-width="2"/><line x1="90" y1="120" x2="125" y2="110" stroke="${p.light}" stroke-width="2"/>`, 180, 170)),
  },
  // ── FOOD & LIFESTYLE ───────────────────────────────────────────────────
  {
    id: "coffee-cup", name: "Coffee Cup", subcategory: "Food", width: 160, height: 180,
    tags: ["coffee","cup","cafe","drink","morning","food"], keywords: ["coffee","cafe","cup","latte","espresso"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.secondary)}</defs>
      <path d="M30,55 L130,55 L115,165 L45,165 Z" fill="url(#g)"/>
      <path d="M130,75 C162,75 162,120 130,120" fill="none" stroke="${p.primary}" stroke-width="12" stroke-linecap="round"/>
      <ellipse cx="80" cy="55" rx="50" ry="12" fill="${p.dark}"/>
      <path d="M60,30 Q65,15 60,5" fill="none" stroke="${p.accent}" stroke-width="4" stroke-linecap="round"/>
      <path d="M80,30 Q85,10 80,0" fill="none" stroke="${p.accent}" stroke-width="4" stroke-linecap="round"/>`, 160, 180)),
  },
  {
    id: "pizza-slice", name: "Pizza Slice", subcategory: "Food", width: 180, height: 180,
    tags: ["pizza","food","slice","italian","eat"], keywords: ["pizza","food","slice","cheese"],
    render: (p, _v) => svgDataUri(wrapSvg(`<path d="M90,10 L175,170 L5,170 Z" fill="${p.primary}"/>
      <path d="M90,40 L160,160 L20,160 Z" fill="${p.secondary}"/>
      <circle cx="70" cy="130" r="10" fill="${p.accent}"/>
      <circle cx="110" cy="115" r="9" fill="${p.accent}"/>
      <circle cx="90" cy="85" r="7" fill="${p.accent}"/>`, 180, 180)),
  },
  // ── SOCIAL MEDIA ──────────────────────────────────────────────────────
  {
    id: "likes-social", name: "Social Likes", subcategory: "Social Media", width: 190, height: 130,
    tags: ["like","heart","social","media","engagement"], keywords: ["like","heart","thumbs up","social","engagement"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="0" y="0" width="190" height="130" rx="18" fill="${darken(p.dark, 0.3)}"/>
      <path d="M40,90 C15,70 8,50 8,38 C8,24 18,14 30,14 C37,14 44,18 50,25 C56,18 63,14 70,14 C82,14 92,24 92,38 C92,50 85,70 60,90 Z" fill="${p.primary}" transform="scale(0.65) translate(18,10)"/>
      <text x="100" y="72" font-family="Inter,sans-serif" font-size="24" font-weight="bold" fill="${p.light}">2.4k</text>`, 190, 130)),
  },
  {
    id: "hashtag", name: "Hashtag Icon", subcategory: "Social Media", width: 160, height: 170,
    tags: ["hashtag","social","media","trending","topic"], keywords: ["hashtag","pound","trend","social"],
    render: (p, _v) => svgDataUri(wrapSvg(`<text x="80" y="138" font-family="Inter,sans-serif" font-size="140" font-weight="900" fill="${p.primary}" text-anchor="middle" opacity="0.95">#</text>`, 160, 170)),
  },
  // ── BUSINESS ─────────────────────────────────────────────────────────
  {
    id: "handshake", name: "Partnership Handshake", subcategory: "Business", width: 200, height: 140,
    tags: ["handshake","partnership","deal","business","agreement"], keywords: ["handshake","deal","partnership","agreement"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.secondary)}</defs>
      <path d="M10,85 L70,55 L95,70 L120,55 L180,85" fill="none" stroke="url(#g)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10,55 L70,85 L95,70 L120,85 L180,55" fill="none" stroke="${p.accent}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>`, 200, 140)),
  },
  {
    id: "target-goal", name: "Target Goal", subcategory: "Business", width: 180, height: 180,
    tags: ["target","goal","aim","focus","bullseye","achievement"], keywords: ["target","goal","bullseye","aim","focus"],
    render: (p, _v) => svgDataUri(wrapSvg(`<circle cx="90" cy="90" r="82" fill="none" stroke="${p.primary}" stroke-width="5"/>
      <circle cx="90" cy="90" r="62" fill="none" stroke="${p.secondary}" stroke-width="5"/>
      <circle cx="90" cy="90" r="42" fill="none" stroke="${p.accent}" stroke-width="5"/>
      <circle cx="90" cy="90" r="20" fill="${p.primary}"/>`, 180, 180)),
  },
  {
    id: "bar-chart-simple", name: "Bar Chart Simple", subcategory: "Business", width: 190, height: 150,
    tags: ["bar","chart","graph","business","analytics","data"], keywords: ["bar chart","analytics","data","statistics"],
    render: (p, v) => {
      const heights = [[110, 70, 95, 50, 85], [80, 110, 60, 100, 75], [65, 90, 110, 45, 95], [100, 50, 80, 110, 60]][v % 4];
      const bars = heights.map((h, i) => `<rect x="${12 + i * 36}" y="${140 - h}" width="26" height="${h}" rx="4" fill="${i % 2 === 0 ? p.primary : p.secondary}"/>`).join("");
      return svgDataUri(wrapSvg(`<line x1="5" y1="140" x2="186" y2="140" stroke="${p.accent}" stroke-width="2"/>${bars}`, 190, 150));
    },
  },
  // ── FASHION ──────────────────────────────────────────────────────────
  {
    id: "diamond-gem", name: "Diamond Gem", subcategory: "Fashion", width: 180, height: 160,
    tags: ["diamond","gem","jewel","luxury","fashion","crystal"], keywords: ["diamond","gem","jewel","crystal","luxury"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.light, p.primary, 135)}</defs>
      <polygon points="90,10 165,55 90,80 15,55" fill="url(#g)"/>
      <polygon points="15,55 90,80 90,155" fill="${p.secondary}"/>
      <polygon points="165,55 90,80 90,155" fill="${p.dark}"/>
      <polygon points="90,10 90,80 165,55" fill="${lighten(p.primary, 0.3)}"/>`, 180, 160)),
  },
  // ── SPORTS ────────────────────────────────────────────────────────────
  {
    id: "lightning-bolt", name: "Lightning Bolt", subcategory: "Sports", width: 160, height: 200,
    tags: ["lightning","bolt","power","energy","electric","sports"], keywords: ["lightning","bolt","electric","power","energy"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.accent, p.primary, 180)}</defs>
      <path d="M100,5 L30,110 L80,110 L60,195 L140,75 L90,75 Z" fill="url(#g)"/>`, 160, 200)),
  },
  {
    id: "flame-fire", name: "Fire Flame", subcategory: "Sports", width: 150, height: 200,
    tags: ["fire","flame","hot","energy","sports","heat"], keywords: ["fire","flame","hot","burn","energy"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.accent, p.primary, 180)}</defs>
      <path d="M75,5 C95,50 150,75 148,140 C146,190 115,210 75,210 C35,210 4,190 2,140 C0,90 50,60 52,30 C56,55 86,58 75,5 Z" fill="url(#g)"/>
      <path d="M75,95 C90,115 115,128 114,160 C112,188 92,198 75,198 C58,198 38,188 36,160 C34,135 58,115 75,95 Z" fill="${lighten(p.accent, 0.5)}"/>`, 150, 200)),
  },
  // ── ABSTRACT ──────────────────────────────────────────────────────────
  {
    id: "hexagon-pattern", name: "Hexagonal Grid", subcategory: "Abstract", width: 190, height: 170,
    tags: ["hexagon","grid","pattern","geometric","abstract"], keywords: ["hexagon","honeycomb","grid","pattern"],
    render: (p, _v) => {
      const hex = (x: number, y: number, r: number, fill: string) => {
        const pts = Array.from({ length: 6 }, (_, i) => {
          const a = (i * Math.PI) / 3 - Math.PI / 6;
          return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`;
        }).join(" ");
        return `<polygon points="${pts}" fill="${fill}" stroke="${darken(fill, 0.2)}" stroke-width="1.5"/>`;
      };
      const grid = [
        hex(45, 45, 36, p.primary), hex(45, 45 + 72, 36, p.secondary),
        hex(45 + 62, 45 + 36, 36, p.accent), hex(45 + 62, 45 + 36 + 72, 36, p.primary),
        hex(45 + 124, 45, 36, p.secondary), hex(45 + 124, 45 + 72, 36, p.accent),
      ];
      return svgDataUri(wrapSvg(grid.join(""), 190, 170));
    },
  },
  {
    id: "wave-lines", name: "Abstract Wave Lines", subcategory: "Abstract", width: 200, height: 130,
    tags: ["wave","abstract","lines","flow","pattern"], keywords: ["wave","lines","flow","abstract","sinusoidal"],
    render: (p, v) => {
      const waves = [0, 1, 2, 3].map((i) => {
        const amp = 30 - i * 5;
        const offset = (v + i) * 20;
        return `<path d="M0,${65 + i * 10} Q${offset + 25},${65 + i * 10 - amp} ${offset + 50},${65 + i * 10} T${offset + 100},${65 + i * 10} T${offset + 150},${65 + i * 10} T200,${65 + i * 10}" fill="none" stroke="${[p.primary, p.secondary, p.accent, p.mid ?? p.accent][i]}" stroke-width="3" opacity="${1 - i * 0.15}"/>`;
      }).join("");
      return svgDataUri(wrapSvg(waves, 200, 130));
    },
  },
  {
    id: "gradient-mesh", name: "Gradient Mesh Background", subcategory: "Abstract", width: 190, height: 160,
    tags: ["gradient","mesh","background","blur","abstract"], keywords: ["gradient","mesh","background","blur","abstract"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${radialGrad("rg1", p.primary, "transparent", 25, 25)}
      ${radialGrad("rg2", p.secondary, "transparent", 75, 75)}
      ${radialGrad("rg3", p.accent, "transparent", 55, 30)}
    </defs>
    <rect width="190" height="160" fill="${darken(p.dark, 0.2)}"/>
    <rect width="190" height="160" fill="url(#rg1)" opacity="0.8"/>
    <rect width="190" height="160" fill="url(#rg2)" opacity="0.7"/>
    <rect width="190" height="160" fill="url(#rg3)" opacity="0.6"/>`, 190, 160)),
  },
  // ── FINANCE ────────────────────────────────────────────────────────────
  {
    id: "money-coin", name: "Gold Coin Money", subcategory: "Finance", width: 170, height: 170,
    tags: ["coin","money","gold","finance","wealth","dollar"], keywords: ["coin","money","dollar","currency","gold"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${radialGrad("rg", p.accent, p.primary, 35, 30)}</defs>
      <circle cx="85" cy="85" r="80" fill="url(#rg)"/>
      <circle cx="85" cy="85" r="65" fill="none" stroke="${p.light}" stroke-width="2" opacity="0.5"/>
      <text x="85" y="102" font-family="Inter,sans-serif" font-size="70" font-weight="900" fill="${lighten(p.accent, 0.3)}" text-anchor="middle" opacity="0.9">$</text>`, 170, 170)),
  },
  {
    id: "piggy-bank", name: "Piggy Bank Savings", subcategory: "Finance", width: 190, height: 170,
    tags: ["piggy bank","savings","finance","money","bank"], keywords: ["piggy bank","savings","money","finance"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.secondary, p.primary)}</defs>
      <ellipse cx="90" cy="95" rx="75" ry="65" fill="url(#g)"/>
      <circle cx="155" cy="75" rx="22" ry="22" fill="${p.secondary}" transform="translate(0,0)"/>
      <ellipse cx="50" cy="138" rx="12" ry="6" fill="${p.dark}"/>
      <ellipse cx="80" cy="148" rx="12" ry="6" fill="${p.dark}"/>
      <ellipse cx="110" cy="148" rx="12" ry="6" fill="${p.dark}"/>
      <ellipse cx="140" cy="138" rx="12" ry="6" fill="${p.dark}"/>
      <circle cx="65" cy="72" r="8" fill="${p.light}" opacity="0.7"/>
      <rect x="70" y="25" width="30" height="8" rx="4" fill="${p.dark}"/>`, 190, 170)),
  },
  // ── MARKETING ────────────────────────────────────────────────────────
  {
    id: "megaphone", name: "Megaphone Announcement", subcategory: "Marketing", width: 200, height: 170,
    tags: ["megaphone","announcement","marketing","loud","broadcast"], keywords: ["megaphone","announcement","broadcast","speaker"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.secondary)}</defs>
      <path d="M10,65 L10,105 L50,105 L140,145 L140,25 L50,65 Z" fill="url(#g)"/>
      <rect x="10" y="65" width="40" height="40" rx="4" fill="${p.dark}"/>
      <path d="M160,50 C180,55 180,115 160,120" fill="none" stroke="${p.accent}" stroke-width="10" stroke-linecap="round"/>
      <path d="M158,70 C172,73 172,97 158,100" fill="none" stroke="${p.light}" stroke-width="7" stroke-linecap="round" opacity="0.6"/>`, 200, 170)),
  },
  {
    id: "growth-arrow-up", name: "Upward Growth Arrow", subcategory: "Marketing", width: 190, height: 160,
    tags: ["growth","arrow","up","analytics","marketing","trend"], keywords: ["growth","arrow","up","trend","analytics"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.accent)}</defs>
      <rect x="10" y="90" width="170" height="65" rx="8" fill="${darken(p.dark, 0.2)}"/>
      <rect x="20" y="105" width="25" height="40" rx="3" fill="${p.secondary}"/>
      <rect x="55" y="90" width="25" height="55" rx="3" fill="${p.primary}"/>
      <rect x="90" y="70" width="25" height="75" rx="3" fill="${p.primary}"/>
      <rect x="125" y="55" width="25" height="90" rx="3" fill="${p.accent}"/>
      <path d="M10,140 Q55,100 100,80 T180,30" fill="none" stroke="${p.accent}" stroke-width="3" stroke-dasharray="none"/>
      <polygon points="170,15 192,35 175,40" fill="${p.accent}"/>`, 190, 160)),
  },
  // ── EDUCATION ────────────────────────────────────────────────────────
  {
    id: "graduation-cap", name: "Graduation Cap", subcategory: "Education", width: 190, height: 160,
    tags: ["graduation","cap","education","school","degree","academic"], keywords: ["graduation","academic","school","degree"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g", p.primary, p.dark)}</defs>
      <polygon points="95,20 180,65 95,110 10,65" fill="url(#g)"/>
      <polygon points="95,20 180,65 95,82 10,65" fill="${p.secondary}"/>
      <rect x="148" y="65" width="8" height="60" rx="4" fill="${p.primary}"/>
      <circle cx="152" cy="130" r="12" fill="${p.accent}"/>`, 190, 160)),
  },
  {
    id: "book-open", name: "Open Book", subcategory: "Education", width: 200, height: 155,
    tags: ["book","reading","education","knowledge","library"], keywords: ["book","reading","knowledge","education"],
    render: (p, _v) => svgDataUri(wrapSvg(`<path d="M100,35 L100,145 L10,155 L10,25 Z" fill="${p.primary}"/>
      <path d="M100,35 L100,145 L190,155 L190,25 Z" fill="${p.secondary}"/>
      <path d="M10,25 Q55,5 100,35 Q145,5 190,25" fill="none" stroke="${p.accent}" stroke-width="4"/>
      <line x1="25" y1="65" x2="90" y2="58" stroke="${p.light}" stroke-width="2" opacity="0.6"/>
      <line x1="25" y1="80" x2="90" y2="73" stroke="${p.light}" stroke-width="2" opacity="0.6"/>
      <line x1="25" y1="95" x2="90" y2="88" stroke="${p.light}" stroke-width="2" opacity="0.6"/>
      <line x1="110" y1="58" x2="175" y2="65" stroke="${p.light}" stroke-width="2" opacity="0.6"/>
      <line x1="110" y1="73" x2="175" y2="80" stroke="${p.light}" stroke-width="2" opacity="0.6"/>`, 200, 155)),
  },
  // ── NATURE ───────────────────────────────────────────────────────────
  {
    id: "sun-rays", name: "Sun with Rays", subcategory: "Nature", width: 190, height: 190,
    tags: ["sun","rays","bright","nature","summer","day"], keywords: ["sun","bright","sunny","rays","warm"],
    render: (p, v) => {
      const n = [8, 10, 12, 16][v % 4];
      const rays = Array.from({ length: n }, (_, i) => {
        const angle = (i * 360) / n;
        const x1 = 95 + 52 * Math.cos((angle * Math.PI) / 180);
        const y1 = 95 + 52 * Math.sin((angle * Math.PI) / 180);
        const x2 = 95 + 82 * Math.cos((angle * Math.PI) / 180);
        const y2 = 95 + 82 * Math.sin((angle * Math.PI) / 180);
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${p.primary}" stroke-width="6" stroke-linecap="round"/>`;
      }).join("");
      return svgDataUri(wrapSvg(`${rays}<circle cx="95" cy="95" r="45" fill="${p.accent}"/>`, 190, 190));
    },
  },
  {
    id: "snowflake", name: "Snowflake Crystal", subcategory: "Nature", width: 190, height: 190,
    tags: ["snowflake","winter","cold","ice","crystal","christmas"], keywords: ["snowflake","ice","winter","crystal"],
    render: (p, _v) => {
      const arms = Array.from({ length: 6 }, (_, i) => {
        const angle = i * 60;
        const r = (Math.PI * angle) / 180;
        const x2 = (95 + 80 * Math.cos(r)).toFixed(1);
        const y2 = (95 + 80 * Math.sin(r)).toFixed(1);
        const mx = (95 + 45 * Math.cos(r)).toFixed(1);
        const my = (95 + 45 * Math.sin(r)).toFixed(1);
        const bp1x = (parseFloat(mx) + 15 * Math.cos(r + Math.PI / 2)).toFixed(1);
        const bp1y = (parseFloat(my) + 15 * Math.sin(r + Math.PI / 2)).toFixed(1);
        const bp2x = (parseFloat(mx) + 15 * Math.cos(r - Math.PI / 2)).toFixed(1);
        const bp2y = (parseFloat(my) + 15 * Math.sin(r - Math.PI / 2)).toFixed(1);
        return `<line x1="95" y1="95" x2="${x2}" y2="${y2}" stroke="${p.primary}" stroke-width="5" stroke-linecap="round"/>
                <line x1="${mx}" y1="${my}" x2="${bp1x}" y2="${bp1y}" stroke="${p.secondary}" stroke-width="3.5" stroke-linecap="round"/>
                <line x1="${mx}" y1="${my}" x2="${bp2x}" y2="${bp2y}" stroke="${p.secondary}" stroke-width="3.5" stroke-linecap="round"/>`;
      }).join("");
      return svgDataUri(wrapSvg(`${arms}<circle cx="95" cy="95" r="10" fill="${p.accent}"/>`, 190, 190));
    },
  },
  // ── MINIMAL ───────────────────────────────────────────────────────────
  {
    id: "plus-minimal", name: "Plus Minimal", subcategory: "Minimal", width: 160, height: 160,
    tags: ["plus","add","minimal","clean","simple"], keywords: ["plus","add","clean","minimal"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="10" y="68" width="140" height="24" rx="12" fill="${p.primary}"/>
      <rect x="68" y="10" width="24" height="140" rx="12" fill="${p.primary}"/>`, 160, 160)),
  },
  {
    id: "minus-line", name: "Minus Line", subcategory: "Minimal", width: 160, height: 60,
    tags: ["minus","line","subtract","minimal","dash"], keywords: ["minus","dash","line","subtract"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="10" y="20" width="140" height="20" rx="10" fill="${p.primary}"/>`, 160, 60)),
  },
  {
    id: "x-close", name: "X Close Icon", subcategory: "Minimal", width: 160, height: 160,
    tags: ["x","close","delete","remove","minimal","icon"], keywords: ["x","close","delete","remove","cancel"],
    render: (p, _v) => svgDataUri(wrapSvg(`<line x1="15" y1="15" x2="145" y2="145" stroke="${p.primary}" stroke-width="18" stroke-linecap="round"/>
      <line x1="145" y1="15" x2="15" y2="145" stroke="${p.primary}" stroke-width="18" stroke-linecap="round"/>`, 160, 160)),
  },
];

// ── Generator ─────────────────────────────────────────────────────────────────
const PALETTES_PER_GRAPHIC = 40; // 55 templates × 40 = 2,200

let _cachedGraphics: AssetDef[] | null = null;

export function getGraphicsAssets(): AssetDef[] {
  if (_cachedGraphics) return _cachedGraphics;

  const assets: AssetDef[] = [];
  GFX_TEMPLATES.forEach((tmpl, tIdx) => {
    for (let pIdx = 0; pIdx < PALETTES_PER_GRAPHIC; pIdx++) {
      const palette = PALETTES_GFX[pIdx % PALETTES_GFX.length];
      const variant = (tIdx + pIdx) % 5;
      const styles: AssetStyle[] = ["flat", "gradient", "outlined", "minimal", "bold"];
      assets.push({
        id: `gfx-${tmpl.id}-${palette.id}`,
        name: `${tmpl.name} – ${palette.name}`,
        category: "graphics",
        subcategory: tmpl.subcategory,
        tags: [...tmpl.tags, ...palette.tags],
        keywords: [...tmpl.keywords, palette.name.toLowerCase(), tmpl.subcategory.toLowerCase()],
        templateId: `gfx-${tmpl.id}`,
        params: { paletteId: palette.id, variant },
        format: "svg",
        width: tmpl.width,
        height: tmpl.height,
        editable: true,
        animated: false,
        style: styles[pIdx % styles.length],
        colors: [palette.primary, palette.secondary, palette.accent],
        license: "Falcon Original – Free Commercial Use",
        source: "Falcon Design Engine",
      });
    }
  });

  _cachedGraphics = assets;
  return assets;
}

export function renderGraphicFromDef(def: AssetDef): string {
  const tmplId = def.templateId.replace("gfx-", "");
  const tmpl = GFX_TEMPLATES.find((t) => t.id === tmplId);
  const palette = getPalette(def.params.paletteId as string);
  if (!tmpl || !palette) return "";
  return tmpl.render(palette, def.params.variant as number);
}

export const GRAPHICS_COUNT = GFX_TEMPLATES.length * PALETTES_PER_GRAPHIC; // 55 × 40 = 2,200
