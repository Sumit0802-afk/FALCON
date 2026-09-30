// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Design Editor – Seed Demo Stickers & Categories
//  Clearly labeled Demo Assets with verified public domain & CC0 license metadata
// ─────────────────────────────────────────────────────────────────────────────

import { Sticker, StickerCategory } from "@/types/sticker";

export const STICKER_CATEGORIES: StickerCategory[] = [
  { id: "all",          label: "All",           emoji: "✦",   description: "Browse all available stickers" },
  { id: "trending",     label: "Trending",      emoji: "🔥",  description: "Most popular and trending elements" },
  { id: "business",     label: "Business",      emoji: "💼",  description: "Corporate, office, and productivity stickers" },
  { id: "marketing",    label: "Marketing",     emoji: "📣",  description: "Promo badges, sale starbursts, and banners" },
  { id: "social",       label: "Social Media",  emoji: "📱",  description: "Social platforms, stream, and chat symbols" },
  { id: "education",    label: "Education",     emoji: "🎓",  description: "School, academic, graduation, and science" },
  { id: "finance",      label: "Finance",       emoji: "💰",  description: "Crypto, cash, banking, and wealth" },
  { id: "technology",   label: "Technology",    emoji: "💻",  description: "Gadgets, laptops, chips, and hardware" },
  { id: "gaming",       label: "Gaming",        emoji: "🎮",  description: "Controllers, potions, retro gaming icons" },
  { id: "food",         label: "Food",          emoji: "🍕",  description: "Delicious snacks, meals, and desserts" },
  { id: "restaurant",   label: "Restaurant",    emoji: "🍽️",  description: "Dining, cutlery, coffee, and drinks" },
  { id: "travel",       label: "Travel",        emoji: "✈️",  description: "Airplanes, luggage, compass, and destinations" },
  { id: "fashion",      label: "Fashion",       emoji: "👗",  description: "Apparel, crowns, sunglasses, and style" },
  { id: "fitness",      label: "Fitness",       emoji: "💪",  description: "Gym equipment, weights, and health" },
  { id: "events",       label: "Events",        emoji: "🎟️",  description: "VIP tickets, cinema clappers, and passes" },
  { id: "celebration",  label: "Celebration",   emoji: "🎉",  description: "Cakes, poppers, gift boxes, and parties" },
  { id: "love",         label: "Love",          emoji: "❤️",  description: "Hearts, romance, cupid, and letters" },
  { id: "nature",       label: "Nature",        emoji: "🌿",  description: "Monstera leaves, sakura, plants, and greenery" },
  { id: "animals",      label: "Animals",       emoji: "🐾",  description: "Corgis, pandas, cats, and friendly pets" },
  { id: "emoji",        label: "Emoji",         emoji: "😊",  description: "Expressive smileys, heart eyes, and fun faces" },
  { id: "arrows",       label: "Arrows",        emoji: "➡️",  description: "Directional markers, swoops, and pointers" },
  { id: "shapes",       label: "Shapes",        emoji: "⬡",   description: "Geometric solids, prisms, and polygons" },
  { id: "badges",       label: "Badges",        emoji: "🏷️",  description: "Verified checks, stamps, and guarantee seals" },
  { id: "doodles",      label: "Doodles",       emoji: "✏️",  description: "Hand-drawn paperclips, washi tape, and sketches" },
  { id: "3d",           label: "3D",            emoji: "🧊",  description: "Dimensional orbs, cubes, and glossy items" },
  { id: "decorative",   label: "Decorative",    emoji: "✨",  description: "Wax seals, laurel wreaths, and sparkles" },
];

const makeSvgDataUri = (svgStr: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr.trim())}`;

const wrapStickerSvg = (inner: string) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <filter id="vinylShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.35"/>
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000000" flood-opacity="0.2"/>
    </filter>
  </defs>
  <g filter="url(#vinylShadow)">
    ${inner}
  </g>
</svg>`.trim();

// ─── Clearly Labeled Demo Stickers ───────────────────────────────────────────
export const SEED_DEMO_STICKERS: Sticker[] = [
  // ── TRENDING ─────────────────────────────────────────────────────────────
  {
    id: "demo-tr-fire",
    name: "Classic Fire Flame (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <path d="M100 22 C100 22 138 68 138 112 C138 144 120 170 100 180 C80 170 62 144 62 112 C62 70 100 22 100 22 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M100 22 C100 22 138 68 138 112 C138 144 120 170 100 180 C80 170 62 144 62 112 C62 70 100 22 100 22 Z" fill="#ea580c"/>
      <path d="M100 65 C100 65 124 98 124 125 C124 150 112 168 100 174 C88 168 76 150 76 125 C76 98 100 65 100 65 Z" fill="#f97316"/>
      <path d="M100 110 C100 110 112 130 112 144 C112 158 106 168 100 171 C94 168 88 158 88 144 C88 130 100 110 100 110 Z" fill="#facc15"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "trending",
    subcategory: "flames",
    tags: ["fire", "flame", "hot", "trending", "viral", "lit"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },
  {
    id: "demo-tr-star",
    name: "Golden Star (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <polygon points="100,20 124,72 180,78 138,118 150,174 100,144 50,174 62,118 20,78 76,72" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <polygon points="100,20 124,72 180,78 138,118 150,174 100,144 50,174 62,118 20,78 76,72" fill="#f59e0b"/>
      <polygon points="100,20 124,72 100,144 76,72" fill="#fbbf24"/>
      <circle cx="100" cy="85" r="16" fill="#ffffff" opacity="0.35"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "trending",
    subcategory: "stars",
    tags: ["star", "gold", "award", "rank", "favorite", "trending"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },
  {
    id: "demo-tr-rocket",
    name: "Apollo Rocket Launch (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <path d="M100 22 C122 45 132 88 126 128 L74 128 C68 88 78 45 100 22 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M100 22 C122 45 132 88 126 128 L74 128 C68 88 78 45 100 22 Z" fill="#f1f5f9"/>
      <path d="M100 22 C114 45 120 70 100 80 C80 70 86 45 100 22 Z" fill="#ef4444"/>
      <circle cx="100" cy="92" r="14" fill="#0284c7" stroke="#ffffff" stroke-width="3"/>
      <path d="M74 116 L48 145 L70 138 Z" fill="#dc2626"/>
      <path d="M126 116 L152 145 L130 138 Z" fill="#dc2626"/>
      <path d="M86 130 C86 130 92 165 100 182 C108 165 114 130 114 130 Z" fill="#f97316"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "trending",
    tags: ["rocket", "launch", "space", "startup", "boost"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },

  // ── BUSINESS ─────────────────────────────────────────────────────────────
  {
    id: "demo-biz-approved",
    name: "APPROVED Stamp (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <g transform="rotate(-12 100 100)">
        <rect x="25" y="65" width="150" height="70" rx="8" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
        <rect x="25" y="65" width="150" height="70" rx="8" fill="none" stroke="#dc2626" stroke-width="6"/>
        <text x="100" y="112" font-family="Arial Black, Impact, sans-serif" font-size="24" font-weight="900" fill="#dc2626" text-anchor="middle" letter-spacing="2">APPROVED</text>
      </g>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "business",
    subcategory: "stamps",
    tags: ["approved", "stamp", "pass", "verified", "business", "legal"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },
  {
    id: "demo-biz-briefcase",
    name: "Leather Briefcase (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <rect x="36" y="70" width="128" height="90" rx="14" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="36" y="70" width="128" height="90" rx="14" fill="#78350f"/>
      <path d="M72 70 L72 48 C72 40 82 34 92 34 L108 34 C118 34 128 40 128 48 L128 70" fill="none" stroke="#522504" stroke-width="8"/>
      <path d="M36 105 L164 105" stroke="#92400e" stroke-width="4"/>
      <rect x="68" y="98" width="14" height="18" rx="2" fill="#fbbf24"/>
      <rect x="118" y="98" width="14" height="18" rx="2" fill="#fbbf24"/>
      <rect x="92" y="98" width="16" height="14" rx="2" fill="#d97706"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "business",
    tags: ["briefcase", "office", "work", "career", "professional"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },

  // ── MARKETING & BADGES ───────────────────────────────────────────────────
  {
    id: "demo-mkt-sale50",
    name: "50% OFF Starburst (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <polygon points="100,18 116,42 142,34 146,62 174,68 160,94 178,118 152,128 154,156 126,150 116,176 94,160 76,176 66,150 38,156 40,128 14,118 32,94 18,68 46,62 50,34 76,42" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <polygon points="100,18 116,42 142,34 146,62 174,68 160,94 178,118 152,128 154,156 126,150 116,176 94,160 76,176 66,150 38,156 40,128 14,118 32,94 18,68 46,62 50,34 76,42" fill="#dc2626"/>
      <text x="100" y="94" font-family="Arial Black, Impact, sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">50%</text>
      <text x="100" y="124" font-family="Arial Black, sans-serif" font-size="20" font-weight="900" fill="#facc15" text-anchor="middle" letter-spacing="2">OFF</text>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "marketing",
    subcategory: "discounts",
    tags: ["sale", "discount", "50", "off", "deal", "marketing", "promo"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },
  {
    id: "demo-badge-verified",
    name: "Verified Check Seal (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <polygon points="100,26 116,38 136,34 144,52 164,60 162,80 176,96 164,112 170,132 150,140 144,160 124,158 110,174 94,164 74,172 66,154 46,154 44,134 28,126 36,108 26,90 42,78 40,58 60,56 68,36 86,42" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <polygon points="100,26 116,38 136,34 144,52 164,60 162,80 176,96 164,112 170,132 150,140 144,160 124,158 110,174 94,164 74,172 66,154 46,154 44,134 28,126 36,108 26,90 42,78 40,58 60,56 68,36 86,42" fill="#0284c7"/>
      <polyline points="72,102 92,122 134,76" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "badges",
    tags: ["verified", "badge", "check", "trust", "seal", "official"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },

  // ── SOCIAL MEDIA ─────────────────────────────────────────────────────────
  {
    id: "demo-soc-youtube",
    name: "YouTube Play Button (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <rect x="32" y="55" width="136" height="92" rx="28" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="32" y="55" width="136" height="92" rx="28" fill="#ff0000"/>
      <path d="M35 65 Q 100 85 165 65" fill="#ffffff" opacity="0.25"/>
      <polygon points="86,76 128,101 86,126" fill="#ffffff"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "social",
    tags: ["youtube", "video", "play", "social", "stream", "media"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },

  // ── FOOD & RESTAURANT ────────────────────────────────────────────────────
  {
    id: "demo-food-pizza",
    name: "Pepperoni Pizza Slice (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <path d="M100 24 L168 148 C144 164 100 172 32 148 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M100 24 L168 148 C144 164 100 172 32 148 Z" fill="#f59e0b"/>
      <path d="M32 148 C100 172 144 164 168 148" fill="none" stroke="#b45309" stroke-width="14" stroke-linecap="round"/>
      <circle cx="85" cy="95" r="12" fill="#dc2626"/>
      <circle cx="125" cy="120" r="12" fill="#dc2626"/>
      <circle cx="104" cy="65" r="9" fill="#dc2626"/>
      <circle cx="68" cy="135" r="10" fill="#dc2626"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "food",
    tags: ["pizza", "food", "cheese", "snack", "slice", "restaurant"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },
  {
    id: "demo-food-coffee",
    name: "Cafe Coffee Cup (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <path d="M55 70 L65 160 C65 168 74 174 84 174 L116 174 C126 174 135 168 135 160 L145 70 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M55 70 L65 160 C65 168 74 174 84 174 L116 174 C126 174 135 168 135 160 L145 70 Z" fill="#f8fafc"/>
      <rect x="50" y="55" width="100" height="18" rx="4" fill="#0f172a"/>
      <rect x="60" y="95" width="80" height="45" rx="3" fill="#b45309"/>
      <circle cx="100" cy="118" r="14" fill="#fde68a"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "restaurant",
    tags: ["coffee", "cup", "latte", "cafe", "restaurant", "drink"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },

  // ── TECHNOLOGY ───────────────────────────────────────────────────────────
  {
    id: "demo-tech-macbook",
    name: "MacBook Laptop Pro (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <rect x="42" y="45" width="116" height="78" rx="8" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="42" y="45" width="116" height="78" rx="8" fill="#0f172a"/>
      <rect x="48" y="51" width="104" height="66" rx="4" fill="#0284c7"/>
      <path d="M22 125 L178 125 C178 135 170 145 158 145 L42 145 C30 145 22 135 22 125 Z" fill="#94a3b8" stroke="#ffffff" stroke-width="8"/>
      <rect x="85" y="125" width="30" height="4" rx="2" fill="#64748b"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "technology",
    tags: ["macbook", "laptop", "computer", "technology", "tech", "gadget"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },

  // ── GAMING ───────────────────────────────────────────────────────────────
  {
    id: "demo-game-controller",
    name: "PlayStation Gamepad (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <path d="M45 135 C32 110 35 75 60 70 C80 65 92 78 100 80 C108 78 120 65 140 70 C165 75 168 110 155 135 C148 150 135 145 125 125 C115 115 108 118 100 118 C92 118 85 115 75 125 C65 145 52 150 45 135 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M45 135 C32 110 35 75 60 70 C80 65 92 78 100 80 C108 78 120 65 140 70 C165 75 168 110 155 135 C148 150 135 145 125 125 C115 115 108 118 100 118 C92 118 85 115 75 125 C65 145 52 150 45 135 Z" fill="#0f172a"/>
      <circle cx="70" cy="98" r="7" fill="#38bdf8"/>
      <circle cx="130" cy="92" r="6" fill="#f43f5e"/>
      <circle cx="142" cy="104" r="6" fill="#10b981"/>
      <circle cx="120" cy="104" r="6" fill="#f59e0b"/>
      <circle cx="132" cy="116" r="6" fill="#3b82f6"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "gaming",
    tags: ["gaming", "gamepad", "playstation", "controller", "video games"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },

  // ── FINANCE ──────────────────────────────────────────────────────────────
  {
    id: "demo-fin-bitcoin",
    name: "Physical Bitcoin Coin (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <circle cx="100" cy="100" r="64" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <circle cx="100" cy="100" r="64" fill="#f59e0b"/>
      <circle cx="100" cy="100" r="52" fill="none" stroke="#fde68a" stroke-width="3" stroke-dasharray="6 4"/>
      <text x="100" y="122" font-family="Arial Black, Impact, sans-serif" font-size="58" font-weight="900" fill="#78350f" text-anchor="middle">₿</text>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "finance",
    tags: ["bitcoin", "crypto", "finance", "money", "btc", "gold"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },

  // ── CELEBRATION ──────────────────────────────────────────────────────────
  {
    id: "demo-cel-cake",
    name: "Birthday Party Cake (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <rect x="42" y="105" width="116" height="60" rx="8" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="42" y="105" width="116" height="60" rx="8" fill="#f43f5e"/>
      <rect x="58" y="70" width="84" height="40" rx="6" fill="#fb7185"/>
      <path d="M58 80 Q 72 90 86 80 Q 100 90 114 80 Q 128 90 142 80" fill="none" stroke="#ffffff" stroke-width="6"/>
      <rect x="78" y="48" width="6" height="22" fill="#38bdf8"/>
      <rect x="97" y="48" width="6" height="22" fill="#facc15"/>
      <rect x="116" y="48" width="6" height="22" fill="#a855f7"/>
      <ellipse cx="81" cy="42" rx="4" ry="6" fill="#f97316"/>
      <ellipse cx="100" cy="42" rx="4" ry="6" fill="#f97316"/>
      <ellipse cx="119" cy="42" rx="4" ry="6" fill="#f97316"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "celebration",
    tags: ["cake", "birthday", "party", "candles", "celebration"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },

  // ── LOVE ─────────────────────────────────────────────────────────────────
  {
    id: "demo-love-heart",
    name: "Glossy Red Heart (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <path d="M100 168 C60 138 32 110 32 80 C32 54 52 36 78 36 C90 36 98 42 100 48 C102 42 110 36 122 36 C148 36 168 54 168 80 C168 110 140 138 100 168 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M100 168 C60 138 32 110 32 80 C32 54 52 36 78 36 C90 36 98 42 100 48 C102 42 110 36 122 36 C148 36 168 54 168 80 C168 110 140 138 100 168 Z" fill="#e11d48"/>
      <ellipse cx="68" cy="62" rx="14" ry="8" transform="rotate(-35 68 62)" fill="#ffffff" opacity="0.6"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "love",
    tags: ["heart", "love", "romance", "valentines", "like"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },

  // ── TRAVEL ───────────────────────────────────────────────────────────────
  {
    id: "demo-trv-airplane",
    name: "Sky Jetliner Airplane (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <path d="M100 25 L115 85 L175 110 L175 125 L115 115 L115 155 L132 170 L132 180 L100 172 L68 180 L68 170 L85 155 L85 115 L25 125 L25 110 L85 85 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M100 25 L115 85 L175 110 L175 125 L115 115 L115 155 L132 170 L132 180 L100 172 L68 180 L68 170 L85 155 L85 115 L25 125 L25 110 L85 85 Z" fill="#38bdf8"/>
      <circle cx="100" cy="55" r="5" fill="#ffffff"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "travel",
    tags: ["travel", "airplane", "plane", "trip", "vacation", "flight"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },

  // ── EDUCATION ────────────────────────────────────────────────────────────
  {
    id: "demo-edu-grad",
    name: "Graduation Mortarboard Cap (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <polygon points="100,42 174,78 100,114 26,78" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <polygon points="100,42 174,78 100,114 26,78" fill="#1e1b4b"/>
      <path d="M52 94 L52 135 C52 152 74 164 100 164 C126 164 148 152 148 135 L148 94" fill="#312e81" stroke="#ffffff" stroke-width="8"/>
      <line x1="150" y1="86" x2="164" y2="128" stroke="#facc15" stroke-width="6" stroke-linecap="round"/>
      <circle cx="164" cy="132" r="6" fill="#f59e0b"/>
      <circle cx="100" cy="78" r="5" fill="#facc15"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "education",
    tags: ["education", "graduation", "cap", "school", "degree", "university"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },

  // ── NATURE ───────────────────────────────────────────────────────────────
  {
    id: "demo-nat-monstera",
    name: "Tropical Monstera Leaf (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <path d="M100 25 C155 45 168 120 100 175 C32 120 45 45 100 25 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M100 25 C155 45 168 120 100 175 C32 120 45 45 100 25 Z" fill="#15803d"/>
      <line x1="100" y1="35" x2="100" y2="182" stroke="#166534" stroke-width="6"/>
      <path d="M100 75 Q 138 65 148 80" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.6"/>
      <path d="M100 115 Q 140 110 145 128" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.6"/>
      <path d="M100 75 Q 62 65 52 80" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.6"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "nature",
    tags: ["leaf", "nature", "monstera", "plant", "green", "botanical"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },

  // ── ANIMALS ──────────────────────────────────────────────────────────────
  {
    id: "demo-ani-corgi",
    name: "Happy Corgi Dog (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <polygon points="55,30 85,75 40,80" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>
      <polygon points="145,30 115,75 160,80" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>
      <polygon points="55,30 85,75 40,80" fill="#f59e0b"/>
      <polygon points="145,30 115,75 160,80" fill="#f59e0b"/>
      <ellipse cx="100" cy="110" rx="55" ry="48" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <ellipse cx="100" cy="110" rx="55" ry="48" fill="#f59e0b"/>
      <circle cx="78" cy="100" r="6" fill="#000000"/>
      <circle cx="122" cy="100" r="6" fill="#000000"/>
      <ellipse cx="100" cy="120" rx="8" ry="6" fill="#000000"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "animals",
    tags: ["dog", "corgi", "animal", "pet", "cute", "puppy"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },

  // ── EMOJI ────────────────────────────────────────────────────────────────
  {
    id: "demo-emj-heart-eyes",
    name: "Heart Eyes Smiley Emoji (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <circle cx="100" cy="100" r="64" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <circle cx="100" cy="100" r="64" fill="#facc15"/>
      <path d="M72 128 C80 148 120 148 128 128 Z" fill="#78350f"/>
      <path d="M68 65 C60 55 48 62 56 78 L68 90 L80 78 C88 62 76 55 68 65 Z" fill="#dc2626"/>
      <path d="M132 65 C124 55 112 62 120 78 L132 90 L144 78 C152 62 140 55 132 65 Z" fill="#dc2626"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "emoji",
    tags: ["emoji", "heart", "eyes", "smile", "love", "expressive"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },

  // ── ARROWS ───────────────────────────────────────────────────────────────
  {
    id: "demo-arr-marker",
    name: "Red Marker Direction Arrow (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <path d="M42 100 L126 100 M102 68 L148 100 L102 132" fill="none" stroke="#ffffff" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M42 100 L126 100 M102 68 L148 100 L102 132" fill="none" stroke="#dc2626" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "arrows",
    tags: ["arrow", "red", "pointer", "direction", "right", "marker"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },

  // ── SHAPES ───────────────────────────────────────────────────────────────
  {
    id: "demo-shp-cube",
    name: "3D Cyan Isometric Cube (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <polygon points="100,32 156,64 100,96 44,64" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <polygon points="100,32 156,64 100,96 44,64" fill="#38bdf8"/>
      <polygon points="44,64 100,96 100,168 44,136" fill="#0284c7"/>
      <polygon points="156,64 100,96 100,168 156,136" fill="#0369a1"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "shapes",
    tags: ["cube", "shape", "3d", "geometry", "isometric", "cyan"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },

  // ── DOODLES ──────────────────────────────────────────────────────────────
  {
    id: "demo-dood-paperclip",
    name: "Metallic Wire Paperclip (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <g transform="rotate(35 100 100)">
        <path d="M85 145 L85 65 C85 52 95 42 108 42 C120 42 130 52 130 65 L130 145 C130 162 115 175 98 175 C80 175 66 162 66 145 L66 85 C66 75 74 68 84 68 C94 68 102 75 102 85 L102 135" fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round"/>
        <path d="M85 145 L85 65 C85 52 95 42 108 42 C120 42 130 52 130 65 L130 145 C130 162 115 175 98 175 C80 175 66 162 66 145 L66 85 C66 75 74 68 84 68 C94 68 102 75 102 85 L102 135" fill="none" stroke="#94a3b8" stroke-width="9" stroke-linecap="round"/>
      </g>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "doodles",
    tags: ["paperclip", "clip", "office", "doodle", "stationery"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },

  // ── 3D ───────────────────────────────────────────────────────────────────
  {
    id: "demo-3d-orb",
    name: "3D Glossy Aqua Orb (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <circle cx="100" cy="100" r="62" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <circle cx="100" cy="100" r="62" fill="#0284c7"/>
      <circle cx="100" cy="100" r="62" fill="#06b6d4" opacity="0.6"/>
      <ellipse cx="80" cy="72" rx="30" ry="16" transform="rotate(-30 80 72)" fill="#ffffff" opacity="0.65"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "3d",
    tags: ["3d", "sphere", "orb", "globe", "glass", "ball"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },

  // ── DECORATIVE ───────────────────────────────────────────────────────────
  {
    id: "demo-dec-wax-seal",
    name: "Royal Wax Seal (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <circle cx="100" cy="100" r="62" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <circle cx="100" cy="100" r="62" fill="#b45309"/>
      <circle cx="100" cy="100" r="50" fill="#f59e0b"/>
      <path d="M100 68 C95 80 82 85 82 92 C82 98 90 102 96 100 C92 108 85 116 100 132 C115 116 108 108 104 100 C110 102 118 98 118 92 C118 85 105 80 100 68 Z" fill="#78350f"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "decorative",
    tags: ["seal", "wax", "royal", "gold", "stamp", "vintage", "decorative"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },
  {
    id: "demo-dec-barcode",
    name: "Authentic Product Barcode (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <rect x="30" y="60" width="140" height="80" rx="8" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>
      <rect x="30" y="60" width="140" height="80" rx="8" fill="#ffffff"/>
      <line x1="45" y1="72" x2="45" y2="120" stroke="#000" stroke-width="5"/>
      <line x1="55" y1="72" x2="55" y2="120" stroke="#000" stroke-width="3"/>
      <line x1="63" y1="72" x2="63" y2="120" stroke="#000" stroke-width="7"/>
      <line x1="75" y1="72" x2="75" y2="120" stroke="#000" stroke-width="2"/>
      <line x1="83" y1="72" x2="83" y2="120" stroke="#000" stroke-width="6"/>
      <line x1="95" y1="72" x2="95" y2="120" stroke="#000" stroke-width="4"/>
      <line x1="105" y1="72" x2="105" y2="120" stroke="#000" stroke-width="8"/>
      <line x1="120" y1="72" x2="120" y2="120" stroke="#000" stroke-width="3"/>
      <line x1="128" y1="72" x2="128" y2="120" stroke="#000" stroke-width="6"/>
      <line x1="140" y1="72" x2="140" y2="120" stroke="#000" stroke-width="4"/>
      <line x1="150" y1="72" x2="150" y2="120" stroke="#000" stroke-width="5"/>
      <text x="100" y="132" font-family="monospace" font-size="9" font-weight="bold" fill="#000" text-anchor="middle">FALCON-78902</text>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "decorative",
    tags: ["barcode", "label", "serial", "scan", "code", "retail"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },
  // ── EVENTS ───────────────────────────────────────────────────────────────
  {
    id: "demo-ev-ticket",
    name: "Golden VIP Event Ticket (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <path d="M30 65 L170 65 L170 94 C158 94 150 102 150 112 C150 122 158 130 170 130 L170 160 L30 160 L30 130 C42 130 50 122 50 112 C50 102 42 94 30 94 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M30 65 L170 65 L170 94 C158 94 150 102 150 112 C150 122 158 130 170 130 L170 160 L30 160 L30 130 C42 130 50 122 50 112 C50 102 42 94 30 94 Z" fill="#7c3aed"/>
      <line x1="82" y1="70" x2="82" y2="155" stroke="#ffffff" stroke-width="3" stroke-dasharray="6 4"/>
      <text x="126" y="122" font-family="Arial Black, Impact, sans-serif" font-size="28" font-weight="900" fill="#facc15" text-anchor="middle">VIP</text>
      <circle cx="56" cy="112" r="12" fill="#facc15"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "events",
    tags: ["ticket", "vip", "event", "concert", "pass", "cinema"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },
  // ── FASHION ──────────────────────────────────────────────────────────────
  {
    id: "demo-fsh-crown",
    name: "Imperial Golden Crown (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <path d="M42 145 L32 75 L74 105 L100 55 L126 105 L168 75 L158 145 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M42 145 L32 75 L74 105 L100 55 L126 105 L168 75 L158 145 Z" fill="#f59e0b"/>
      <circle cx="32" cy="72" r="7" fill="#ef4444"/>
      <circle cx="100" cy="52" r="8" fill="#06b6d4"/>
      <circle cx="168" cy="72" r="7" fill="#ef4444"/>
      <rect x="42" y="135" width="116" height="15" rx="3" fill="#b45309"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "fashion",
    tags: ["crown", "royal", "gold", "king", "queen", "fashion", "luxury"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },
  // ── FITNESS ──────────────────────────────────────────────────────────────
  {
    id: "demo-fit-dumbbell",
    name: "Cast Iron Hex Dumbbell (Demo)",
    fileUrl: makeSvgDataUri(wrapStickerSvg(`
      <rect x="36" y="65" width="22" height="70" rx="8" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="142" y="65" width="22" height="70" rx="8" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="36" y="65" width="22" height="70" rx="8" fill="#1e293b"/>
      <rect x="52" y="74" width="16" height="52" rx="4" fill="#334155"/>
      <rect x="66" y="92" width="68" height="16" rx="4" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2"/>
      <rect x="132" y="74" width="16" height="52" rx="4" fill="#334155"/>
      <rect x="142" y="65" width="22" height="70" rx="8" fill="#1e293b"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "fitness",
    tags: ["dumbbell", "gym", "workout", "fitness", "exercise", "muscle"],
    author: "Falcon Open Asset Lab",
    source: "Falcon Demo Starter Pack",
    sourceUrl: "https://falcon.design/license/demo",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },
];
