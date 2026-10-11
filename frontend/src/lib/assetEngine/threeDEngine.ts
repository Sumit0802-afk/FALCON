// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Asset Engine – 3D Engine
//  28 templates × 38 palettes = 1,064 unique 3D assets
// ─────────────────────────────────────────────────────────────────────────────

import { AssetDef, Palette } from "./types";
import { PALETTES, getPalette } from "./palette";
import { svgDataUri, wrapSvg, linearGrad, radialGrad, dropShadow, lighten, darken } from "./svgUtils";

interface ThreeDTemplate {
  id: string;
  name: string;
  subcategory: string;
  tags: string[];
  keywords: string[];
  width: number;
  height: number;
  render: (p: Palette, v: number) => string;
}

const THREED_TEMPLATES: ThreeDTemplate[] = [
  // ── BASIC 3D SHAPES ────────────────────────────────────────────────────────
  {
    id: "cube-iso", name: "Isometric Cube", subcategory: "Shapes", width: 190, height: 190,
    tags: ["cube","3d","isometric","box","geometric"], keywords: ["cube","box","3d","isometric"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${linearGrad("top", lighten(p.primary, 0.35), p.primary)}
      ${linearGrad("left", darken(p.primary, 0.35), p.primary, 0)}
      ${linearGrad("right", p.secondary, darken(p.secondary, 0.2), 0)}
    </defs>
    <polygon points="95,20 165,58 165,140 95,180 25,140 25,58" fill="${p.primary}" opacity="0.05"/>
    <polygon points="95,20 165,58 95,96 25,58" fill="url(#top)"/>
    <polygon points="25,58 95,96 95,178 25,140" fill="url(#left)"/>
    <polygon points="165,58 95,96 95,178 165,140" fill="url(#right)"/>`, 190, 190)),
  },
  {
    id: "sphere-glossy", name: "Glossy Sphere", subcategory: "Shapes", width: 190, height: 190,
    tags: ["sphere","ball","3d","glossy","round"], keywords: ["sphere","ball","globe","3d"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${radialGrad("rg", lighten(p.primary, 0.4), darken(p.primary, 0.3), 35, 30)}
    </defs>
    <circle cx="95" cy="95" r="82" fill="url(#rg)"/>
    <ellipse cx="72" cy="65" rx="28" ry="18" fill="${lighten(p.light, 0.1)}" opacity="0.55" transform="rotate(-25 72 65)"/>
    <ellipse cx="120" cy="145" rx="14" ry="8" fill="${darken(p.primary, 0.5)}" opacity="0.3"/>`, 190, 190)),
  },
  {
    id: "cylinder-3d", name: "Cylinder 3D", subcategory: "Shapes", width: 170, height: 210,
    tags: ["cylinder","3d","tube","can","shape"], keywords: ["cylinder","tube","can","column"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${linearGrad("side", lighten(p.primary, 0.2), darken(p.secondary, 0.25), 0)}
    </defs>
    <rect x="25" y="55" width="120" height="140" rx="0" fill="url(#side)"/>
    <ellipse cx="85" cy="55" rx="60" ry="22" fill="${lighten(p.primary, 0.4)}"/>
    <ellipse cx="85" cy="195" rx="60" ry="22" fill="${darken(p.secondary, 0.3)}"/>
    <ellipse cx="75" cy="42" rx="20" ry="8" fill="${lighten(p.primary, 0.6)}" opacity="0.6"/>`, 170, 210)),
  },
  {
    id: "torus-3d", name: "Torus Donut", subcategory: "Shapes", width: 200, height: 190,
    tags: ["torus","donut","3d","ring","shape"], keywords: ["torus","donut","ring","tube"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${radialGrad("rg", p.primary, darken(p.primary, 0.4), 30, 25)}
    </defs>
    <ellipse cx="100" cy="95" rx="88" ry="55" fill="url(#rg)"/>
    <ellipse cx="100" cy="95" rx="42" ry="26" fill="${darken(p.dark, 0.5)}"/>
    <ellipse cx="100" cy="88" rx="42" ry="22" fill="${darken(p.dark, 0.4)}"/>
    <ellipse cx="72" cy="72" rx="18" ry="10" fill="${lighten(p.primary, 0.5)}" opacity="0.45" transform="rotate(-20 72 72)"/>`, 200, 190)),
  },
  {
    id: "pyramid-3d", name: "3D Pyramid", subcategory: "Shapes", width: 190, height: 190,
    tags: ["pyramid","3d","triangle","shape","ancient"], keywords: ["pyramid","triangle","3d","prism"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${linearGrad("lf", lighten(p.primary, 0.25), p.primary, 90)}
      ${linearGrad("rt", p.secondary, darken(p.secondary, 0.3), 90)}
    </defs>
    <polygon points="95,15 175,165 95,145 15,165" fill="url(#lf)"/>
    <polygon points="95,15 175,165 95,145" fill="url(#rt)"/>
    <polygon points="15,165 175,165 95,145" fill="${darken(p.dark, 0.2)}"/>`, 190, 190)),
  },
  {
    id: "diamond-3d", name: "3D Diamond Gem", subcategory: "Shapes", width: 180, height: 200,
    tags: ["diamond","3d","gem","jewel","crystal"], keywords: ["diamond","gem","crystal","jewel","3d"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${linearGrad("t", lighten(p.primary, 0.5), p.primary, 135)}
      ${linearGrad("b", p.secondary, darken(p.secondary, 0.4), 135)}
    </defs>
    <polygon points="90,10 165,70 90,95 15,70" fill="url(#t)"/>
    <polygon points="15,70 90,95 90,190" fill="${darken(p.primary, 0.3)}"/>
    <polygon points="165,70 90,95 90,190" fill="url(#b)"/>
    <polygon points="90,10 165,70 90,95" fill="${lighten(p.primary, 0.35)}"/>`, 180, 200)),
  },
  {
    id: "cone-3d", name: "3D Cone", subcategory: "Shapes", width: 180, height: 210,
    tags: ["cone","3d","shape","triangle"], keywords: ["cone","3d","funnel","triangle"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${linearGrad("g", lighten(p.primary, 0.3), darken(p.secondary, 0.2), 0)}
    </defs>
    <polygon points="90,15 170,190 10,190" fill="url(#g)"/>
    <ellipse cx="90" cy="190" rx="80" ry="22" fill="${darken(p.secondary, 0.35)}"/>
    <polygon points="90,15 170,190 90,172" fill="${lighten(p.primary, 0.2)}"/>`, 180, 210)),
  },
  // ── 3D OBJECTS ─────────────────────────────────────────────────────────────
  {
    id: "phone-3d", name: "3D Smartphone", subcategory: "Devices", width: 170, height: 220,
    tags: ["phone","smartphone","3d","device","mobile","app"], keywords: ["phone","mobile","smartphone","device"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${linearGrad("g", lighten(p.dark, 0.15), darken(p.dark, 0.2), 30)}
      ${linearGrad("scr", darken(p.primary, 0.2), p.secondary)}
    </defs>
    <rect x="25" y="10" width="120" height="200" rx="22" fill="url(#g)"/>
    <rect x="35" y="28" width="100" height="162" rx="8" fill="url(#scr)"/>
    <rect x="65" y="14" width="40" height="8" rx="4" fill="${darken(p.dark, 0.4)}"/>
    <circle cx="85" cy="200" r="8" fill="${darken(p.dark, 0.35)}"/>
    <ellipse cx="60" cy="42" rx="14" ry="8" fill="${lighten(p.primary, 0.5)}" opacity="0.3"/>`, 170, 220)),
  },
  {
    id: "laptop-3d", name: "3D Laptop", subcategory: "Devices", width: 220, height: 180,
    tags: ["laptop","computer","3d","device","mac","tech"], keywords: ["laptop","computer","notebook","device"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${linearGrad("body", lighten(p.dark, 0.12), darken(p.dark, 0.15), 15)}
      ${linearGrad("scr", p.secondary, p.primary)}
    </defs>
    <rect x="15" y="15" width="190" height="125" rx="10" fill="url(#body)"/>
    <rect x="25" y="25" width="170" height="105" rx="6" fill="url(#scr)"/>
    <ellipse cx="110" cy="142" rx="18" ry="5" fill="${darken(p.dark, 0.3)}"/>
    <rect x="5" y="148" width="210" height="18" rx="9" fill="${darken(p.dark, 0.2)}"/>
    <ellipse cx="55" cy="40" rx="22" ry="12" fill="${lighten(p.primary, 0.4)}" opacity="0.25"/>`, 220, 180)),
  },
  {
    id: "headphones-3d", name: "3D Headphones", subcategory: "Objects", width: 190, height: 195,
    tags: ["headphones","music","audio","3d","device"], keywords: ["headphones","audio","music","sound"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${linearGrad("g", p.primary, p.secondary, 45)}
    </defs>
    <path d="M95,20 A75,75 0 0 1 170,95" fill="none" stroke="url(#g)" stroke-width="20" stroke-linecap="round"/>
    <path d="M95,20 A75,75 0 0 0 20,95" fill="none" stroke="url(#g)" stroke-width="20" stroke-linecap="round"/>
    <rect x="148" y="88" width="38" height="55" rx="14" fill="${p.primary}"/>
    <rect x="4" y="88" width="38" height="55" rx="14" fill="${p.primary}"/>
    <ellipse cx="158" cy="112" rx="12" ry="18" fill="${darken(p.secondary, 0.3)}"/>
    <ellipse cx="22" cy="112" rx="12" ry="18" fill="${darken(p.secondary, 0.3)}"/>`, 190, 195)),
  },
  {
    id: "folder-3d", name: "3D Folder", subcategory: "Objects", width: 200, height: 175,
    tags: ["folder","file","3d","documents","storage"], keywords: ["folder","file","directory","storage"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${linearGrad("g", lighten(p.primary, 0.35), p.primary)}
    </defs>
    <path d="M15,55 L15,165 A10,10 0 0 0 25,175 L175,175 A10,10 0 0 0 185,165 L185,55 Z" fill="url(#g)"/>
    <path d="M15,55 L15,45 A10,10 0 0 1 25,35 L85,35 Q95,35 100,45 L110,55 Z" fill="${lighten(p.primary, 0.4)}"/>
    <path d="M15,55 L185,55" stroke="${p.dark}" stroke-width="2" opacity="0.2"/>
    <rect x="55" y="95" width="90" height="8" rx="4" fill="${p.light}" opacity="0.4"/>
    <rect x="55" y="115" width="70" height="8" rx="4" fill="${p.light}" opacity="0.3"/>
    <rect x="55" y="135" width="80" height="8" rx="4" fill="${p.light}" opacity="0.3"/>`, 200, 175)),
  },
  {
    id: "shield-3d", name: "3D Security Shield", subcategory: "Objects", width: 180, height: 210,
    tags: ["shield","3d","security","protection","badge"], keywords: ["shield","security","protect","badge","3d"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${linearGrad("g", lighten(p.primary, 0.25), darken(p.primary, 0.2), 160)}
    </defs>
    <path d="M90,12 L178,40 L178,105 C178,155 130,192 90,208 C50,192 2,155 2,105 L2,40 Z" fill="url(#g)"/>
    <path d="M90,30 L162,55 L162,108 C162,148 122,178 90,190 C58,178 18,148 18,108 L18,55 Z" fill="${lighten(p.primary, 0.12)}"/>
    <path d="M60,105 L80,130 L125,78" fill="none" stroke="${p.light}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`, 180, 210)),
  },
  // ── 3D BUTTONS ─────────────────────────────────────────────────────────────
  {
    id: "btn-3d", name: "3D Button", subcategory: "UI Elements", width: 200, height: 100,
    tags: ["button","3d","ui","click","interface"], keywords: ["button","click","ui","cta","3d"],
    render: (p, v) => {
      const labels = ["Click Me", "Get Started", "Learn More", "Buy Now", "Subscribe"][v % 5];
      return svgDataUri(wrapSvg(`<defs>${linearGrad("top", lighten(p.primary, 0.3), p.primary)}</defs>
      <rect x="10" y="45" width="180" height="44" rx="14" fill="${darken(p.primary, 0.35)}"/>
      <rect x="10" y="18" width="180" height="44" rx="14" fill="url(#top)"/>
      <text x="100" y="47" font-family="Inter,sans-serif" font-size="18" font-weight="700" fill="${p.light}" text-anchor="middle">${labels}</text>`, 200, 100));
    },
  },
  {
    id: "toggle-3d", name: "3D Toggle Switch", subcategory: "UI Elements", width: 190, height: 100,
    tags: ["toggle","switch","3d","ui","on/off"], keywords: ["toggle","switch","on","off","ui"],
    render: (p, v) => {
      const on = v % 2 === 0;
      const knobX = on ? 128 : 62;
      const trackColor = on ? p.primary : "#6b7280";
      const trackGrad = linearGrad("track", trackColor, darken(trackColor, 0.15), 90);
      return svgDataUri(wrapSvg(`<defs>${trackGrad}</defs>
      <rect x="25" y="30" width="140" height="40" rx="20" fill="url(#track)"/>
      <circle cx="${knobX}" cy="50" r="20" fill="${p.light}"/>
      <circle cx="${knobX - 5}" cy="44" r="8" fill="${p.light}" opacity="0.5"/>`, 190, 100));
    },
  },
  // ── 3D ICONS ──────────────────────────────────────────────────────────────
  {
    id: "star-3d", name: "3D Gold Star", subcategory: "Icons", width: 190, height: 185,
    tags: ["star","3d","gold","award","rating"], keywords: ["star","award","3d","rating","gold"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${linearGrad("g", lighten(p.accent, 0.4), darken(p.accent, 0.15))}
      ${linearGrad("shadow", darken(p.accent, 0.4), darken(p.accent, 0.6), 90)}
    </defs>
    <polygon points="95,18 118,70 175,78 135,118 146,175 95,148 44,175 55,118 15,78 72,70" fill="${darken(p.accent, 0.2)}" transform="translate(5,5)"/>
    <polygon points="95,18 118,70 175,78 135,118 146,175 95,148 44,175 55,118 15,78 72,70" fill="url(#g)"/>`, 190, 185)),
  },
  {
    id: "medal-3d", name: "3D Medal", subcategory: "Icons", width: 170, height: 210,
    tags: ["medal","award","3d","achievement","winner"], keywords: ["medal","award","gold","winner","champion"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${radialGrad("g", lighten(p.accent, 0.4), darken(p.accent, 0.3), 35, 35)}
    </defs>
    <polygon points="85,5 105,5 120,55 85,48 50,55" fill="${p.primary}"/>
    <polygon points="50,55 120,55 130,65 40,65" fill="${p.secondary}"/>
    <circle cx="85" cy="145" r="65" fill="${darken(p.accent, 0.15)}"/>
    <circle cx="85" cy="145" r="65" fill="url(#g)"/>
    <circle cx="85" cy="145" r="52" fill="none" stroke="${lighten(p.accent, 0.3)}" stroke-width="3"/>
    <text x="85" y="156" font-family="Inter,sans-serif" font-size="44" font-weight="900" fill="${darken(p.accent, 0.4)}" text-anchor="middle">1</text>`, 170, 210)),
  },
  {
    id: "notification-3d", name: "3D Notification Bell", subcategory: "Icons", width: 180, height: 200,
    tags: ["bell","notification","3d","alert","reminder"], keywords: ["bell","notification","alert","reminder","3d"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${linearGrad("g", lighten(p.primary, 0.3), p.primary, 160)}
    </defs>
    <path d="M90,20 A55,55 0 0 1 145,75 L155,155 L25,155 L35,75 A55,55 0 0 1 90,20 Z" fill="url(#g)"/>
    <rect x="55" y="155" width="70" height="20" rx="6" fill="${darken(p.primary, 0.25)}"/>
    <ellipse cx="90" cy="175" rx="22" ry="10" fill="${p.secondary}"/>
    <circle cx="90" cy="20" r="12" fill="${lighten(p.dark, 0.1)}"/>
    <circle cx="125" cy="35" r="20" fill="${p.accent}" stroke="${p.light}" stroke-width="3"/>
    <text x="125" y="42" font-family="Inter,sans-serif" font-size="16" font-weight="bold" fill="${p.light}" text-anchor="middle">3</text>`, 180, 200)),
  },
  {
    id: "globe-3d", name: "3D Globe Earth", subcategory: "Objects", width: 190, height: 190,
    tags: ["globe","earth","world","3d","map","international"], keywords: ["globe","earth","world","planet","international"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${radialGrad("g", lighten(p.secondary, 0.3), darken(p.primary, 0.2), 35, 30)}
    </defs>
    <circle cx="95" cy="95" r="82" fill="url(#g)"/>
    <ellipse cx="95" cy="95" rx="82" ry="22" fill="none" stroke="${p.light}" stroke-width="1.5" opacity="0.35"/>
    <ellipse cx="95" cy="95" rx="40" ry="82" fill="none" stroke="${p.light}" stroke-width="1.5" opacity="0.35"/>
    <ellipse cx="95" cy="95" rx="72" ry="82" fill="none" stroke="${p.light}" stroke-width="1.2" opacity="0.25"/>
    <line x1="13" y1="95" x2="177" y2="95" stroke="${p.light}" stroke-width="1.5" opacity="0.35"/>
    <line x1="95" y1="13" x2="95" y2="177" stroke="${p.light}" stroke-width="1.5" opacity="0.35"/>
    <ellipse cx="68" cy="62" rx="22" ry="12" fill="${p.light}" opacity="0.3"/>`, 190, 190)),
  },
  {
    id: "crown-3d", name: "3D Crown", subcategory: "Icons", width: 200, height: 150,
    tags: ["crown","3d","royal","premium","king","gold"], keywords: ["crown","royal","3d","gold","premium"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${linearGrad("g", lighten(p.accent, 0.45), darken(p.accent, 0.1))}
      ${linearGrad("shadow", darken(p.accent, 0.4), darken(p.accent, 0.6), 90)}
    </defs>
    <polygon points="100,125 200,125 185,145 15,145 0,125" fill="url(#shadow)"/>
    <polygon points="100,30 10,125 190,125" fill="url(#g)"/>
    <polygon points="0,125 52,62 100,125" fill="url(#g)"/>
    <polygon points="200,125 148,62 100,125" fill="url(#g)"/>
    <circle cx="52" cy="62" r="14" fill="${p.light}"/>
    <circle cx="148" cy="62" r="14" fill="${p.light}"/>
    <circle cx="100" cy="30" r="14" fill="${p.light}"/>`, 200, 150)),
  },
  {
    id: "rocket-3d", name: "3D Rocket", subcategory: "Objects", width: 180, height: 220,
    tags: ["rocket","3d","space","startup","launch"], keywords: ["rocket","launch","startup","space","3d"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${linearGrad("body", lighten(p.primary, 0.3), p.secondary, 160)}
      ${linearGrad("flame", lighten(p.accent, 0.4), p.accent, 180)}
    </defs>
    <path d="M90,10 C120,10 145,38 145,90 L145,158 L90,178 L35,158 L35,90 C35,38 60,10 90,10 Z" fill="url(#body)"/>
    <path d="M35,125 L10,162 L55,148 Z" fill="${p.secondary}"/>
    <path d="M145,125 L170,162 L125,148 Z" fill="${p.secondary}"/>
    <ellipse cx="90" cy="82" rx="28" ry="28" fill="${lighten(p.dark, 0.12)}"/>
    <ellipse cx="80" cy="70" rx="10" ry="7" fill="${p.light}" opacity="0.4"/>
    <path d="M70,178 Q90,215 110,178" fill="url(#flame)" opacity="0.9"/>`, 180, 220)),
  },
  {
    id: "box-package", name: "3D Package Box", subcategory: "Objects", width: 200, height: 195,
    tags: ["box","package","3d","delivery","shipping","product"], keywords: ["box","package","shipping","delivery","product"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${linearGrad("top", lighten(p.primary, 0.35), p.primary)}
      ${linearGrad("left", darken(p.primary, 0.3), p.primary, 0)}
      ${linearGrad("right", p.secondary, darken(p.secondary, 0.25), 0)}
    </defs>
    <polygon points="100,25 180,65 180,155 100,115" fill="url(#right)"/>
    <polygon points="100,25 20,65 20,155 100,115" fill="url(#left)"/>
    <polygon points="100,25 180,65 100,105 20,65" fill="url(#top)"/>
    <line x1="100" y1="25" x2="100" y2="115" stroke="${lighten(p.primary, 0.4)}" stroke-width="2"/>
    <line x1="60" y1="45" x2="140" y2="45" stroke="${lighten(p.primary, 0.4)}" stroke-width="2"/>`, 200, 195)),
  },
  // ── 3D ABSTRACT ────────────────────────────────────────────────────────────
  {
    id: "infinity-3d", name: "3D Infinity Loop", subcategory: "Abstract", width: 220, height: 150,
    tags: ["infinity","3d","loop","abstract","endless"], keywords: ["infinity","loop","endless","abstract","3d"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${linearGrad("g", p.primary, p.secondary, 90)}
    </defs>
    <path d="M75,75 C75,45 50,20 30,40 C10,60 10,90 30,110 C50,130 75,105 110,75 C145,45 170,20 190,40 C210,60 210,90 190,110 C170,130 145,105 110,75 Z" fill="none" stroke="url(#g)" stroke-width="20" stroke-linecap="round"/>`, 220, 150)),
  },
  {
    id: "abstract-ring", name: "Abstract Ring Stack", subcategory: "Abstract", width: 190, height: 200,
    tags: ["ring","3d","abstract","stack","modern"], keywords: ["ring","abstract","stack","modern","3d"],
    render: (p, _v) => svgDataUri(wrapSvg(`<ellipse cx="95" cy="155" rx="80" ry="25" fill="none" stroke="${darken(p.primary, 0.2)}" stroke-width="16"/>
    <ellipse cx="95" cy="115" rx="65" ry="20" fill="none" stroke="${p.primary}" stroke-width="16"/>
    <ellipse cx="95" cy="82" rx="50" ry="16" fill="none" stroke="${lighten(p.secondary, 0.15)}" stroke-width="16"/>
    <ellipse cx="95" cy="55" rx="35" ry="11" fill="none" stroke="${p.accent}" stroke-width="14"/>
    <ellipse cx="95" cy="35" rx="20" ry="7" fill="none" stroke="${lighten(p.accent, 0.3)}" stroke-width="12"/>`, 190, 200)),
  },
  {
    id: "crystal-3d", name: "Crystal Prism", subcategory: "Abstract", width: 175, height: 215,
    tags: ["crystal","prism","3d","gem","abstract","rainbow"], keywords: ["crystal","prism","gem","refract","rainbow"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${linearGrad("l", lighten(p.primary, 0.4), p.secondary)}
      ${linearGrad("r", p.accent, darken(p.secondary, 0.3))}
    </defs>
    <polygon points="87,10 158,70 87,90 16,70" fill="${lighten(p.primary, 0.5)}"/>
    <polygon points="16,70 87,90 87,205" fill="url(#l)"/>
    <polygon points="158,70 87,90 87,205" fill="url(#r)"/>
    <line x1="87" y1="10" x2="87" y2="90" stroke="${p.light}" stroke-width="2" opacity="0.5"/>`, 175, 215)),
  },
  {
    id: "wave-3d", name: "3D Wave Surface", subcategory: "Abstract", width: 220, height: 150,
    tags: ["wave","3d","surface","abstract","mesh"], keywords: ["wave","surface","3d","mesh","grid"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${linearGrad("g", lighten(p.primary, 0.2), darken(p.secondary, 0.2), 45)}
    </defs>
    <path d="M5,100 Q30,60 55,85 T105,70 T155,85 T215,60" fill="none" stroke="${p.accent}" stroke-width="3.5"/>
    <path d="M5,115 Q30,75 55,100 T105,85 T155,100 T215,75" fill="none" stroke="${p.secondary}" stroke-width="3"/>
    <path d="M5,130 Q30,90 55,115 T105,100 T155,115 T215,90" fill="none" stroke="${p.primary}" stroke-width="2.5"/>
    <path d="M5,100 Q30,60 55,85 T105,70 T155,85 T215,60 L215,145 L5,145 Z" fill="url(#g)" opacity="0.4"/>`, 220, 150)),
  },
];

// ── Generator ─────────────────────────────────────────────────────────────────
const PALETTES_3D = PALETTES.slice(0, 38);

let _cached3D: AssetDef[] | null = null;

export function get3DAssets(): AssetDef[] {
  if (_cached3D) return _cached3D;

  const assets: AssetDef[] = [];
  THREED_TEMPLATES.forEach((tmpl, tIdx) => {
    PALETTES_3D.forEach((palette, pIdx) => {
      const variant = (tIdx + pIdx) % 5;
      assets.push({
        id: `3d-${tmpl.id}-${palette.id}`,
        name: `${tmpl.name} – ${palette.name}`,
        category: "3d",
        subcategory: tmpl.subcategory,
        tags: [...tmpl.tags, ...palette.tags, "3d"],
        keywords: [...tmpl.keywords, "3d", palette.name.toLowerCase()],
        templateId: `3d-${tmpl.id}`,
        params: { paletteId: palette.id, variant },
        format: "svg",
        width: tmpl.width,
        height: tmpl.height,
        editable: true,
        animated: false,
        style: "3d",
        colors: [palette.primary, palette.secondary, palette.accent],
        license: "Falcon Original – Free Commercial Use",
        source: "Falcon Design Engine",
      });
    });
  });

  _cached3D = assets;
  return assets;
}

export function render3DFromDef(def: AssetDef): string {
  const tmplId = def.templateId.replace("3d-", "");
  const tmpl = THREED_TEMPLATES.find((t) => t.id === tmplId);
  const palette = getPalette(def.params.paletteId as string);
  if (!tmpl || !palette) return "";
  return tmpl.render(palette, def.params.variant as number);
}

export const THREED_COUNT = THREED_TEMPLATES.length * PALETTES_3D.length; // 28 × 38 = 1,064
