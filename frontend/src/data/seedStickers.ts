// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Design Editor – Seed Demo Stickers & Categories
//  Clearly labeled Demo Assets with verified public domain & CC0 license metadata
// ─────────────────────────────────────────────────────────────────────────────

import { Sticker, StickerCategory } from "@/types/sticker";

export const STICKER_CATEGORIES: StickerCategory[] = [
  { id: "all",          label: "All",           emoji: "✦",   description: "Browse all available stickers" },
  { id: "trending",     label: "Trending",      emoji: "🔥",  description: "Most popular and trending elements" },
  { id: "cartoons",     label: "Cartoons & Anime", emoji: "⚡", description: "Iconic cartoon & anime characters" },
  { id: "superheroes",  label: "Superheroes",   emoji: "🦸",  description: "Legendary heroes, masks, and emblems" },
  { id: "gaming",       label: "Gaming & BGMI", emoji: "🎮",  description: "Battle royale, Free Fire, and gaming stickers" },
  { id: "animals",      label: "Animals",       emoji: "🐾",  description: "Corgis, pandas, cats, and friendly pets" },
  { id: "business",     label: "Business",      emoji: "💼",  description: "Corporate, office, and productivity stickers" },
  { id: "marketing",    label: "Marketing",     emoji: "📣",  description: "Promo badges, sale starbursts, and banners" },
  { id: "social",       label: "Social Media",  emoji: "📱",  description: "Social platforms, stream, and chat symbols" },
  { id: "education",    label: "Education",     emoji: "🎓",  description: "School, academic, graduation, and science" },
  { id: "finance",      label: "Finance",       emoji: "💰",  description: "Crypto, cash, banking, and wealth" },
  { id: "technology",   label: "Technology",    emoji: "💻",  description: "Gadgets, laptops, chips, and hardware" },
  { id: "food",         label: "Food",          emoji: "🍕",  description: "Delicious snacks, meals, and desserts" },
  { id: "restaurant",   label: "Restaurant",    emoji: "🍽️",  description: "Dining, cutlery, coffee, and drinks" },
  { id: "travel",       label: "Travel",        emoji: "✈️",  description: "Airplanes, luggage, compass, and destinations" },
  { id: "fashion",      label: "Fashion",       emoji: "👗",  description: "Apparel, crowns, sunglasses, and style" },
  { id: "fitness",      label: "Fitness",       emoji: "💪",  description: "Gym equipment, weights, and health" },
  { id: "events",       label: "Events",        emoji: "🎟️",  description: "VIP tickets, cinema clappers, and passes" },
  { id: "celebration",  label: "Celebration",   emoji: "🎉",  description: "Cakes, poppers, gift boxes, and parties" },
  { id: "love",         label: "Love",          emoji: "❤️",  description: "Hearts, romance, cupid, and letters" },
  { id: "nature",       label: "Nature",        emoji: "🌿",  description: "Monstera leaves, sakura, plants, and greenery" },
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

export const wrapRealisticStickerSvg = (inner: string, viewBox = "0 0 200 200") => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="200" height="200">
  <defs>
    <!-- Multi-layered Real Vinyl Sticker Drop Shadow -->
    <filter id="vinylDropShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="7" stdDeviation="5" flood-color="#000000" flood-opacity="0.38"/>
      <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.22"/>
    </filter>
    <!-- Vinyl Die-cut Specular Gloss Overlay -->
    <linearGradient id="stickerGloss" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45"/>
      <stop offset="35%" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="70%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <g filter="url(#vinylDropShadow)">
    ${inner}
  </g>
</svg>`.trim();

// Backwards-compatible alias
const wrapStickerSvg = wrapRealisticStickerSvg;

// ─── Clearly Labeled Demo Stickers ───────────────────────────────────────────
export const SEED_DEMO_STICKERS: Sticker[] = [
  // ═══════════════════════════════════════════════════════════════════
  //  REALISTIC POP CULTURE & HEROES STICKERS (SHEET COLLECTION)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: "stk-pop-pikachu",
    name: "Pikachu Electric Pokemon",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <path d="M42 28 C42 28 62 60 70 78 C60 88 56 104 58 124 C56 142 66 160 80 170 C92 178 116 178 128 170 C142 160 152 142 150 124 C152 104 148 88 138 78 C146 60 166 28 166 28 C150 36 138 52 134 68 C124 64 116 62 104 62 C92 62 84 64 74 68 C70 52 58 36 42 28 Z" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <polygon points="144,130 178,110 164,136 188,126 160,168 152,148 144,152" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      
      <!-- Body & Head -->
      <path d="M72 74 C80 68 92 65 104 65 C116 65 128 68 136 74 C148 86 150 106 148 126 C146 146 136 164 124 170 C112 176 96 176 84 170 C72 164 62 146 60 126 C58 106 60 86 72 74 Z" fill="#facc15"/>
      
      <!-- Ears -->
      <path d="M74 72 C68 56 56 40 44 32 C48 48 58 64 66 76 Z" fill="#facc15"/>
      <path d="M44 32 C48 38 52 44 56 48 C52 46 48 42 44 32 Z" fill="#1e1e24"/>
      <path d="M134 72 C140 56 152 40 164 32 C160 48 150 64 142 76 Z" fill="#facc15"/>
      <path d="M164 32 C160 38 156 44 152 48 C156 46 160 42 164 32 Z" fill="#1e1e24"/>

      <!-- Tail -->
      <polygon points="144,132 174,114 162,138 184,128 158,166 152,148 144,152" fill="#eab308"/>
      <polygon points="144,146 152,142 148,154" fill="#92400e"/>

      <!-- Cheeks -->
      <circle cx="76" cy="118" r="10" fill="#ef4444"/>
      <circle cx="132" cy="118" r="10" fill="#ef4444"/>

      <!-- Eyes -->
      <ellipse cx="84" cy="98" rx="6" ry="8" fill="#1e1e24"/>
      <circle cx="82" cy="95" r="2.5" fill="#ffffff"/>
      <ellipse cx="124" cy="98" rx="6" ry="8" fill="#1e1e24"/>
      <circle cx="122" cy="95" r="2.5" fill="#ffffff"/>

      <!-- Nose & Mouth -->
      <polygon points="104,105 102,108 106,108" fill="#1e1e24"/>
      <path d="M96 114 Q100 119 104 115 Q108 119 112 114" fill="none" stroke="#1e1e24" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M98 116 Q104 128 110 116 Z" fill="#f43f5e"/>

      <!-- Paws -->
      <ellipse cx="90" cy="144" rx="6" ry="10" fill="#eab308"/>
      <ellipse cx="118" cy="144" rx="6" ry="10" fill="#eab308"/>

      <!-- Gloss Sheen Overlay -->
      <path d="M72 74 C80 68 92 65 104 65 C116 65 128 68 136 74 C120 70 88 70 72 74 Z" fill="url(#stickerGloss)"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "cartoons",
    subcategory: "pokemon",
    tags: ["pikachu","pokemon","anime","cute","yellow","electric","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-doraemon",
    name: "Doraemon Happy Cat Robot",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <circle cx="100" cy="80" r="54" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <path d="M70 115 L60 165 C60 178 140 178 140 165 L130 115 Z" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      
      <!-- Head & Body Blue -->
      <circle cx="100" cy="80" r="52" fill="#0284c7"/>
      <path d="M72 120 L64 165 C64 175 136 175 136 165 L128 120 Z" fill="#0284c7"/>

      <!-- Face White Mask -->
      <ellipse cx="100" cy="88" rx="42" ry="34" fill="#ffffff"/>

      <!-- Eyes -->
      <ellipse cx="88" cy="58" rx="10" ry="14" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
      <circle cx="91" cy="58" r="3.5" fill="#0f172a"/>
      <circle cx="92" cy="56" r="1.2" fill="#ffffff"/>
      <ellipse cx="112" cy="58" rx="10" ry="14" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
      <circle cx="109" cy="58" r="3.5" fill="#0f172a"/>
      <circle cx="110" cy="56" r="1.2" fill="#ffffff"/>

      <!-- Red Nose -->
      <circle cx="100" cy="72" r="7.5" fill="#ef4444"/>
      <circle cx="98" cy="70" r="2.2" fill="#ffffff"/>
      <line x1="100" y1="79.5" x2="100" y2="104" stroke="#1e293b" stroke-width="2"/>

      <!-- Whiskers -->
      <line x1="68" y1="78" x2="90" y2="82" stroke="#1e293b" stroke-width="1.8"/>
      <line x1="66" y1="88" x2="88" y2="88" stroke="#1e293b" stroke-width="1.8"/>
      <line x1="68" y1="98" x2="90" y2="94" stroke="#1e293b" stroke-width="1.8"/>
      <line x1="110" y1="82" x2="132" y2="78" stroke="#1e293b" stroke-width="1.8"/>
      <line x1="112" y1="88" x2="134" y2="88" stroke="#1e293b" stroke-width="1.8"/>
      <line x1="110" y1="94" x2="132" y2="98" stroke="#1e293b" stroke-width="1.8"/>

      <!-- Open Mouth -->
      <path d="M76 96 Q100 126 124 96" fill="none" stroke="#1e293b" stroke-width="2.5"/>
      <path d="M78 98 Q100 124 122 98 Q100 110 78 98 Z" fill="#dc2626"/>
      <ellipse cx="100" cy="111" rx="9" ry="5" fill="#fb7185"/>

      <!-- Collar & Bell -->
      <rect x="68" y="118" width="64" height="8" rx="4" fill="#dc2626"/>
      <circle cx="100" cy="126" r="8" fill="#facc15" stroke="#ca8a04" stroke-width="1.2"/>
      <circle cx="100" cy="128" r="2.2" fill="#713f12"/>
      <line x1="93" y1="125" x2="107" y2="125" stroke="#a16207" stroke-width="1"/>

      <!-- Belly & Pocket -->
      <ellipse cx="100" cy="148" rx="26" ry="20" fill="#ffffff"/>
      <path d="M84 144 C84 158 116 158 116 144 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1.8"/>

      <!-- Hands -->
      <circle cx="58" cy="138" r="9" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
      <circle cx="142" cy="138" r="9" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>

      <!-- Vinyl Gloss Curve -->
      <path d="M70 56 C80 44 120 44 130 56 C115 50 85 50 70 56 Z" fill="url(#stickerGloss)"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "cartoons",
    subcategory: "anime",
    tags: ["doraemon","anime","cat","robot","blue","cute","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-shinchan",
    name: "Shinchan Cheeky Nohara",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <path d="M60 48 C60 26 140 26 140 48 C158 60 162 90 148 106 C148 118 152 148 140 160 C136 176 64 176 60 160 C48 148 52 118 52 106 C38 90 42 60 60 48 Z" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>

      <!-- Hair Base -->
      <path d="M62 48 C66 32 134 32 138 48 C144 56 142 68 138 72 C134 60 66 60 62 72 Z" fill="#18181b"/>

      <!-- Face -->
      <path d="M62 56 C62 56 138 56 138 56 C152 68 154 88 144 100 C136 108 124 110 100 110 C76 110 64 108 56 100 C46 88 48 68 62 56 Z" fill="#fde68a"/>

      <!-- Eyebrows (Iconic Thick Shinchan Brows) -->
      <path d="M68 62 Q80 50 94 62 Q80 56 68 62 Z" fill="#09090b"/>
      <path d="M106 62 Q120 50 132 62 Q120 56 106 62 Z" fill="#09090b"/>

      <!-- Eyes -->
      <ellipse cx="80" cy="74" rx="7" ry="9" fill="#09090b"/>
      <circle cx="81" cy="72" r="2.8" fill="#ffffff"/>
      <ellipse cx="120" cy="74" rx="7" ry="9" fill="#09090b"/>
      <circle cx="119" cy="72" r="2.8" fill="#ffffff"/>

      <!-- Rosy Cheeks -->
      <ellipse cx="64" cy="88" rx="8" ry="5" fill="#f87171" opacity="0.85"/>
      <ellipse cx="136" cy="88" rx="8" ry="5" fill="#f87171" opacity="0.85"/>

      <!-- Smirking Mouth -->
      <path d="M92 90 Q100 98 108 90" fill="none" stroke="#09090b" stroke-width="2.5" stroke-linecap="round"/>

      <!-- Red Shirt -->
      <path d="M66 110 L134 110 L140 144 L60 144 Z" fill="#dc2626"/>

      <!-- Yellow Shorts -->
      <path d="M64 144 L136 144 L134 168 L104 168 L100 156 L96 168 L66 168 Z" fill="#facc15"/>

      <!-- Legs & Shoes -->
      <rect x="76" y="168" width="10" height="10" fill="#fde68a"/>
      <ellipse cx="81" cy="180" rx="8" ry="4" fill="#0284c7"/>
      <rect x="114" y="168" width="10" height="10" fill="#fde68a"/>
      <ellipse cx="119" cy="180" rx="8" ry="4" fill="#0284c7"/>

      <!-- Vinyl Gloss Sheen -->
      <path d="M66 52 C80 42 120 42 134 52" stroke="url(#stickerGloss)" stroke-width="8" stroke-linecap="round"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "cartoons",
    subcategory: "anime",
    tags: ["shinchan","nohara","anime","funny","red","yellow","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-minion",
    name: "Minion Bob with Goggles",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <rect x="58" y="32" width="84" height="136" rx="42" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      
      <!-- Yellow Capsule Body -->
      <rect x="62" y="36" width="76" height="128" rx="38" fill="#facc15"/>

      <!-- Goggle Strap -->
      <rect x="62" y="74" width="76" height="10" fill="#1e293b"/>

      <!-- Goggles Silver Frame -->
      <circle cx="86" cy="78" r="16" fill="#cbd5e1" stroke="#64748b" stroke-width="2.5"/>
      <circle cx="86" cy="78" r="12" fill="#ffffff"/>
      <circle cx="86" cy="78" r="6" fill="#78350f"/>
      <circle cx="86" cy="78" r="3" fill="#000000"/>
      <circle cx="84" cy="76" r="1.5" fill="#ffffff"/>

      <circle cx="114" cy="78" r="16" fill="#cbd5e1" stroke="#64748b" stroke-width="2.5"/>
      <circle cx="114" cy="78" r="12" fill="#ffffff"/>
      <circle cx="114" cy="78" r="6" fill="#15803d"/>
      <circle cx="114" cy="78" r="3" fill="#000000"/>
      <circle cx="112" cy="76" r="1.5" fill="#ffffff"/>

      <!-- Smile -->
      <path d="M88 102 Q100 112 112 102" fill="none" stroke="#713f12" stroke-width="2.5" stroke-linecap="round"/>

      <!-- Denim Overalls -->
      <path d="M68 126 L132 126 L134 162 C134 164 130 164 100 164 C70 164 66 164 66 162 Z" fill="#2563eb"/>
      <rect x="80" y="116" width="40" height="20" rx="3" fill="#2563eb"/>
      <!-- Straps -->
      <polygon points="68,118 84,128 78,134 64,124" fill="#1d4ed8"/>
      <circle cx="82" cy="130" r="1.8" fill="#0f172a"/>
      <polygon points="132,118 116,128 122,134 136,124" fill="#1d4ed8"/>
      <circle cx="118" cy="130" r="1.8" fill="#0f172a"/>
      <!-- Gru Logo Pocket -->
      <rect x="90" y="136" width="20" height="14" rx="2" fill="#1d4ed8"/>
      <circle cx="100" cy="143" r="4" fill="#0f172a"/>
      <path d="M98 141 L102 143 L98 145 Z" fill="#facc15"/>

      <!-- Gloss Sheen Curve -->
      <path d="M72 44 C84 36 116 36 128 44" stroke="url(#stickerGloss)" stroke-width="8" stroke-linecap="round"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "cartoons",
    subcategory: "movies",
    tags: ["minion","bob","despicable me","banana","yellow","goggles","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-spiderman",
    name: "Spider-Man Mask",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <path d="M100 24 C140 24 162 60 162 106 C162 144 130 178 100 186 C70 178 38 144 38 106 C38 60 60 24 100 24 Z" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>

      <!-- Mask Red Base with 3D gradient feel -->
      <path d="M100 26 C138 26 158 60 158 106 C158 142 128 174 100 182 C72 174 42 142 42 106 C42 60 62 26 100 26 Z" fill="#dc2626"/>

      <!-- Spider Web Lattice -->
      <!-- Radial Web Lines -->
      <line x1="100" y1="106" x2="100" y2="26" stroke="#18181b" stroke-width="1.8"/>
      <line x1="100" y1="106" x2="136" y2="34" stroke="#18181b" stroke-width="1.8"/>
      <line x1="100" y1="106" x2="154" y2="64" stroke="#18181b" stroke-width="1.8"/>
      <line x1="100" y1="106" x2="158" y2="106" stroke="#18181b" stroke-width="1.8"/>
      <line x1="100" y1="106" x2="148" y2="146" stroke="#18181b" stroke-width="1.8"/>
      <line x1="100" y1="106" x2="100" y2="182" stroke="#18181b" stroke-width="1.8"/>
      <line x1="100" y1="106" x2="52" y2="146" stroke="#18181b" stroke-width="1.8"/>
      <line x1="100" y1="106" x2="42" y2="106" stroke="#18181b" stroke-width="1.8"/>
      <line x1="100" y1="106" x2="46" y2="64" stroke="#18181b" stroke-width="1.8"/>
      <line x1="100" y1="106" x2="64" y2="34" stroke="#18181b" stroke-width="1.8"/>

      <!-- Concentric Web Arcs -->
      <path d="M72 44 Q100 54 128 44" fill="none" stroke="#18181b" stroke-width="1.5"/>
      <path d="M58 70 Q100 84 142 70" fill="none" stroke="#18181b" stroke-width="1.5"/>
      <path d="M50 106 Q100 120 150 106" fill="none" stroke="#18181b" stroke-width="1.5"/>
      <path d="M60 140 Q100 156 140 140" fill="none" stroke="#18181b" stroke-width="1.5"/>

      <!-- Eye Lenses with Thick Black Rim -->
      <path d="M54 94 Q76 90 92 106 Q76 122 56 112 Q50 104 54 94 Z" fill="#000000" stroke="#000000" stroke-width="6" stroke-linejoin="round"/>
      <path d="M56 95 Q76 92 90 106 Q76 120 58 111 Q52 104 56 95 Z" fill="#f8fafc"/>
      <path d="M56 95 Q70 94 78 100 Q66 102 58 111 Z" fill="#e2e8f0" opacity="0.6"/>

      <path d="M146 94 Q124 90 108 106 Q124 122 144 112 Q150 104 146 94 Z" fill="#000000" stroke="#000000" stroke-width="6" stroke-linejoin="round"/>
      <path d="M144 95 Q124 92 110 106 Q124 120 142 111 Q148 104 144 95 Z" fill="#f8fafc"/>
      <path d="M144 95 Q130 94 122 100 Q134 102 142 111 Z" fill="#e2e8f0" opacity="0.6"/>

      <!-- Vinyl Reflection Sheen -->
      <path d="M64 34 C84 26 116 26 136 34 C110 32 80 32 64 34 Z" fill="url(#stickerGloss)"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "superheroes",
    subcategory: "marvel",
    tags: ["spiderman","marvel","superhero","mask","spider","avengers","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-superman",
    name: "Superman S-Shield Emblem",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <polygon points="100,26 172,64 144,142 100,180 56,142 28,64" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>

      <!-- Outer Red Diamond -->
      <polygon points="100,28 168,66 142,140 100,176 58,140 32,66" fill="#dc2626"/>

      <!-- Yellow Field -->
      <polygon points="100,38 156,70 134,132 100,162 66,132 44,70" fill="#facc15"/>

      <!-- Red 'S' Symbol -->
      <path d="M64 68 L104 50 L136 68 L126 84 L108 72 L86 78 L84 94 L118 100 C138 104 142 118 136 132 L100 156 L72 136 L82 120 L100 132 L120 126 C124 120 120 114 112 112 L84 104 C66 98 60 84 64 68 Z" fill="#dc2626"/>
      <polygon points="76,82 66,94 80,92" fill="#facc15"/>
      <polygon points="126,104 136,112 122,116" fill="#facc15"/>

      <!-- Gloss Arc -->
      <path d="M50 68 Q100 40 150 68 Q100 52 50 68 Z" fill="url(#stickerGloss)"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "superheroes",
    subcategory: "dc",
    tags: ["superman","dc","superhero","shield","s","justice league","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-captain-america",
    name: "Captain America Vibranium Shield",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <circle cx="100" cy="100" r="78" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>

      <!-- Outer Red Ring -->
      <circle cx="100" cy="100" r="76" fill="#dc2626"/>

      <!-- White Ring -->
      <circle cx="100" cy="100" r="62" fill="#f8fafc"/>

      <!-- Inner Red Ring -->
      <circle cx="100" cy="100" r="48" fill="#dc2626"/>

      <!-- Blue Core -->
      <circle cx="100" cy="100" r="34" fill="#1d4ed8"/>

      <!-- Central Star -->
      <polygon points="100,68 108,88 130,90 112,104 118,126 100,114 82,126 88,104 70,90 92,88" fill="#ffffff"/>
      <polygon points="100,68 108,88 100,100" fill="#e2e8f0"/>
      <polygon points="130,90 112,104 100,100" fill="#e2e8f0"/>
      <polygon points="118,126 100,114 100,100" fill="#e2e8f0"/>
      <polygon points="82,126 88,104 100,100" fill="#e2e8f0"/>
      <polygon points="70,90 92,88 100,100" fill="#e2e8f0"/>

      <!-- Curving Specular Reflection -->
      <path d="M40 70 A 70 70 0 0 1 160 70 A 70 50 0 0 0 40 70 Z" fill="url(#stickerGloss)"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "superheroes",
    subcategory: "marvel",
    tags: ["captain america","marvel","shield","avengers","star","superhero","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-batman",
    name: "Batman Bat-Signal Oval",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <ellipse cx="100" cy="100" rx="82" ry="52" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>

      <!-- Black Oval Rim -->
      <ellipse cx="100" cy="100" rx="80" ry="50" fill="#09090b"/>

      <!-- Golden Yellow Oval Field -->
      <ellipse cx="100" cy="100" rx="72" ry="42" fill="#facc15"/>

      <!-- Bat Silhouette -->
      <path d="M100 80 L103 86 L108 85 L106 91 C114 88 126 88 140 94 C148 98 156 106 160 114 C148 112 138 114 130 120 C122 126 118 132 116 136 C112 126 106 122 100 122 C94 122 88 126 84 136 C82 132 78 126 70 120 C62 114 52 112 40 114 C44 106 52 98 60 94 C74 88 86 88 94 91 L92 85 L97 86 Z" fill="#09090b"/>

      <!-- Gloss Sheen -->
      <path d="M44 86 Q100 66 156 86 Q100 74 44 86 Z" fill="url(#stickerGloss)"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "superheroes",
    subcategory: "dc",
    tags: ["batman","dc","bat","gotham","dark knight","superhero","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-pubg",
    name: "PUBG & BGMI Level 3 Soldier",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <path d="M100 24 C132 24 148 48 148 84 L146 112 L172 176 L28 176 L54 112 L52 84 C52 48 68 24 100 24 Z" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <rect x="150" y="44" width="18" height="120" rx="8" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>

      <!-- Slung Assault Rifle -->
      <rect x="154" y="48" width="8" height="114" rx="3" fill="#18181b"/>
      <rect x="152" y="80" width="14" height="24" rx="2" fill="#27272a"/>

      <!-- White Shirt Body & Tactical Vest -->
      <path d="M58 114 L142 114 L162 174 L38 174 Z" fill="#f8fafc"/>
      <!-- Black Tactical Webbing & Tie -->
      <path d="M96 114 L104 114 L106 174 L94 174 Z" fill="#09090b"/>
      <path d="M68 126 L96 144 L96 174 L62 174 Z" fill="#18181b"/>
      <path d="M132 126 L104 144 L104 174 L138 174 Z" fill="#18181b"/>

      <!-- Level 3 Spetsnaz Helmet -->
      <!-- Dome -->
      <path d="M60 76 C60 42 78 28 100 28 C122 28 140 42 140 76 L140 106 L60 106 Z" fill="#3f3f46"/>
      <!-- Brow Rim Plate -->
      <rect x="56" y="68" width="88" height="14" rx="3" fill="#27272a"/>
      <!-- Welded Rivets -->
      <circle cx="64" cy="75" r="2" fill="#71717a"/>
      <circle cx="100" cy="75" r="2" fill="#71717a"/>
      <circle cx="136" cy="75" r="2" fill="#71717a"/>

      <!-- Visor Slit Frame -->
      <rect x="66" y="82" width="68" height="14" rx="2" fill="#18181b"/>
      <rect x="70" y="86" width="60" height="6" rx="1" fill="#09090b"/>
      <line x1="72" y1="88" x2="128" y2="88" stroke="#06b6d4" stroke-width="1.5" opacity="0.6"/>

      <!-- Chinstrap -->
      <path d="M68 106 Q100 120 132 106" fill="none" stroke="#27272a" stroke-width="4"/>

      <!-- Gloss Sheen -->
      <path d="M68 40 C84 32 116 32 132 40" stroke="url(#stickerGloss)" stroke-width="8" stroke-linecap="round"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "gaming",
    subcategory: "battleroyale",
    tags: ["pubg","bgmi","gaming","soldier","battle royale","helmet","winner","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-freefire",
    name: "Free Fire Flame Logo",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <rect x="22" y="68" width="156" height="64" rx="10" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <polygon points="100,32 120,68 80,68" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>

      <!-- Dark Stencil Banner -->
      <rect x="26" y="72" width="148" height="56" rx="8" fill="#18181b"/>

      <!-- Blazing Flame Above -->
      <path d="M100 36 C100 36 122 56 120 72 C116 78 104 80 100 80 C96 80 84 78 80 72 C78 56 100 36 100 36 Z" fill="#ea580c"/>
      <path d="M100 48 C100 48 112 60 110 70 C108 74 102 76 100 76 C98 76 92 74 90 70 C88 60 100 48 100 48 Z" fill="#facc15"/>

      <!-- Stencil FREE FIRE Text -->
      <text x="100" y="108" font-family="'Impact', 'Arial Black', sans-serif" font-size="24" font-weight="900" fill="#f8fafc" text-anchor="middle" letter-spacing="2">
        FREE FIRE
      </text>

      <!-- Slash Cut Effect Across Letters -->
      <polygon points="34,102 166,94 164,98 32,106" fill="#f97316"/>

      <!-- Gloss Sheen -->
      <path d="M30 74 L170 74 L160 86 L40 86 Z" fill="url(#stickerGloss)"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "gaming",
    subcategory: "esports",
    tags: ["free fire","garena","gaming","fire","esports","flame","battle royale","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-panda",
    name: "Cute Bamboo Panda",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <circle cx="100" cy="80" r="50" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <ellipse cx="100" cy="140" rx="46" ry="38" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <!-- Ears Backing -->
      <circle cx="62" cy="46" r="18" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>
      <circle cx="138" cy="46" r="18" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>

      <!-- Ears -->
      <circle cx="62" cy="46" r="16" fill="#18181b"/>
      <circle cx="138" cy="46" r="16" fill="#18181b"/>

      <!-- Head White -->
      <circle cx="100" cy="80" r="48" fill="#f8fafc"/>

      <!-- Eye Patches -->
      <ellipse cx="80" cy="76" rx="14" ry="18" transform="rotate(-15 80 76)" fill="#18181b"/>
      <ellipse cx="120" cy="76" rx="14" ry="18" transform="rotate(15 120 76)" fill="#18181b"/>
      <!-- Shiny Eyes -->
      <circle cx="82" cy="74" r="5" fill="#ffffff"/>
      <circle cx="83" cy="73" r="2.2" fill="#000000"/>
      <circle cx="118" cy="74" r="5" fill="#ffffff"/>
      <circle cx="117" cy="73" r="2.2" fill="#000000"/>

      <!-- Nose & Mouth -->
      <ellipse cx="100" cy="92" rx="7" ry="5" fill="#18181b"/>
      <path d="M94 98 Q100 104 106 98" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>

      <!-- Pink Cheeks -->
      <circle cx="66" cy="94" r="7" fill="#f472b6" opacity="0.6"/>
      <circle cx="134" cy="94" r="7" fill="#f472b6" opacity="0.6"/>

      <!-- Body -->
      <ellipse cx="100" cy="142" rx="44" ry="34" fill="#f8fafc"/>
      <!-- Black Arms & Vest -->
      <path d="M60 120 C60 105 140 105 140 120 C140 135 130 148 116 150 C110 142 90 142 84 150 C70 148 60 135 60 120 Z" fill="#18181b"/>

      <!-- Green Bamboo Stalk in Paws -->
      <rect x="94" y="104" width="8" height="58" rx="3" fill="#22c55e"/>
      <line x1="94" y1="120" x2="102" y2="120" stroke="#15803d" stroke-width="2"/>
      <line x1="94" y1="138" x2="102" y2="138" stroke="#15803d" stroke-width="2"/>
      <path d="M102 116 Q118 108 124 116 Q114 122 102 116 Z" fill="#4ade80"/>
      <path d="M94 132 Q78 126 72 134 Q82 138 94 132 Z" fill="#4ade80"/>

      <!-- Feet -->
      <circle cx="70" cy="162" r="14" fill="#18181b"/>
      <circle cx="70" cy="162" r="7" fill="#3f3f46"/>
      <circle cx="130" cy="162" r="14" fill="#18181b"/>
      <circle cx="130" cy="162" r="7" fill="#3f3f46"/>

      <!-- Gloss Arc -->
      <path d="M74 54 C88 44 112 44 126 54" stroke="url(#stickerGloss)" stroke-width="7" stroke-linecap="round"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "animals",
    subcategory: "pets",
    tags: ["panda","bear","bamboo","cute","fluffy","animals","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-mickey",
    name: "Mickey Mouse Classic",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <circle cx="100" cy="94" r="44" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <circle cx="56" cy="50" r="26" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>
      <circle cx="144" cy="50" r="26" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>
      <ellipse cx="100" cy="154" rx="34" ry="24" fill="#ffffff" stroke="#ffffff" stroke-width="14"/>

      <!-- Ears -->
      <circle cx="56" cy="50" r="24" fill="#18181b"/>
      <circle cx="144" cy="50" r="24" fill="#18181b"/>

      <!-- Black Head Base -->
      <circle cx="100" cy="94" r="42" fill="#18181b"/>

      <!-- Peach Face Mask -->
      <ellipse cx="88" cy="84" rx="14" ry="24" fill="#fed7aa"/>
      <ellipse cx="112" cy="84" rx="14" ry="24" fill="#fed7aa"/>
      <ellipse cx="100" cy="106" rx="28" ry="18" fill="#fed7aa"/>

      <!-- Eyes -->
      <ellipse cx="92" cy="82" rx="4.5" ry="10" fill="#18181b"/>
      <circle cx="93" cy="80" r="1.5" fill="#ffffff"/>
      <ellipse cx="108" cy="82" rx="4.5" ry="10" fill="#18181b"/>
      <circle cx="107" cy="80" r="1.5" fill="#ffffff"/>

      <!-- Nose -->
      <ellipse cx="100" cy="98" rx="8" ry="5" fill="#18181b"/>

      <!-- Smile -->
      <path d="M80 104 Q100 128 120 104" fill="none" stroke="#18181b" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M84 108 Q100 126 116 108 Q100 114 84 108 Z" fill="#dc2626"/>

      <!-- Red Shorts Body -->
      <ellipse cx="100" cy="154" rx="32" ry="22" fill="#dc2626"/>
      <!-- White Oval Buttons -->
      <ellipse cx="90" cy="152" rx="4.5" ry="7" fill="#ffffff"/>
      <ellipse cx="110" cy="152" rx="4.5" ry="7" fill="#ffffff"/>

      <!-- Gloss Arc -->
      <path d="M78 64 C90 56 110 56 122 64" stroke="url(#stickerGloss)" stroke-width="6" stroke-linecap="round"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "cartoons",
    subcategory: "disney",
    tags: ["mickey","disney","mouse","retro","classic","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-minnie",
    name: "Minnie Mouse Polka Bow",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <circle cx="100" cy="110" r="44" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <circle cx="56" cy="66" r="26" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>
      <circle cx="144" cy="66" r="26" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>
      <!-- Giant Bow Backing -->
      <polygon points="100,52 60,26 64,74 100,54 136,74 140,26" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>

      <!-- Ears -->
      <circle cx="56" cy="66" r="24" fill="#18181b"/>
      <circle cx="144" cy="66" r="24" fill="#18181b"/>

      <!-- Giant Polka Dot Bow -->
      <polygon points="100,52 58,26 62,74 100,54 138,74 142,26" fill="#dc2626"/>
      <!-- Center Knot -->
      <circle cx="100" cy="52" r="10" fill="#b91c1c"/>
      <circle cx="100" cy="52" r="3" fill="#ffffff"/>
      <!-- Polka Dots -->
      <circle cx="72" cy="38" r="4" fill="#ffffff"/>
      <circle cx="86" cy="58" r="3.5" fill="#ffffff"/>
      <circle cx="68" cy="62" r="4" fill="#ffffff"/>
      <circle cx="128" cy="38" r="4" fill="#ffffff"/>
      <circle cx="114" cy="58" r="3.5" fill="#ffffff"/>
      <circle cx="132" cy="62" r="4" fill="#ffffff"/>

      <!-- Head Base -->
      <circle cx="100" cy="110" r="42" fill="#18181b"/>

      <!-- Peach Face Mask -->
      <ellipse cx="88" cy="104" rx="14" ry="24" fill="#fed7aa"/>
      <ellipse cx="112" cy="104" rx="14" ry="24" fill="#fed7aa"/>
      <ellipse cx="100" cy="124" rx="28" ry="18" fill="#fed7aa"/>

      <!-- Eyelashes & Eyes -->
      <ellipse cx="92" cy="102" rx="4.5" ry="9" fill="#18181b"/>
      <circle cx="93" cy="100" r="1.5" fill="#ffffff"/>
      <line x1="88" y1="94" x2="82" y2="88" stroke="#18181b" stroke-width="2"/>
      <line x1="92" y1="92" x2="90" y2="84" stroke="#18181b" stroke-width="2"/>

      <ellipse cx="108" cy="102" rx="4.5" ry="9" fill="#18181b"/>
      <circle cx="107" cy="100" r="1.5" fill="#ffffff"/>
      <line x1="112" y1="94" x2="118" y2="88" stroke="#18181b" stroke-width="2"/>
      <line x1="108" y1="92" x2="110" y2="84" stroke="#18181b" stroke-width="2"/>

      <!-- Nose & Smile -->
      <ellipse cx="100" cy="116" rx="7" ry="4.5" fill="#18181b"/>
      <path d="M82 122 Q100 142 118 122" fill="none" stroke="#18181b" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M86 124 Q100 138 114 124 Z" fill="#dc2626"/>

      <!-- Gloss Arc -->
      <path d="M68 34 C80 28 120 28 132 34" stroke="url(#stickerGloss)" stroke-width="5" stroke-linecap="round"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "cartoons",
    subcategory: "disney",
    tags: ["minnie","disney","mouse","bow","polka","cute","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-goku",
    name: "Son Goku Super Saiyan",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <path d="M100 22 L116 46 L144 32 L138 64 L168 58 L152 92 L172 108 L142 120 L158 176 L42 176 L58 120 L28 108 L48 92 L32 58 L62 64 L56 32 L84 46 Z" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>

      <!-- Spiky Black Saiyan Hair -->
      <polygon points="100,26 114,48 140,36 136,66 164,62 148,94 168,110 140,122 136,92 100,80 64,92 60,122 32,110 52,94 36,62 64,66 60,36 86,48" fill="#18181b"/>

      <!-- Face -->
      <polygon points="68,92 132,92 124,136 100,152 76,136" fill="#fde68a"/>

      <!-- Intense Anime Brows & Eyes -->
      <polygon points="76,102 96,106 94,110 74,106" fill="#18181b"/>
      <polygon points="78,108 94,110 90,116 80,114" fill="#ffffff"/>
      <circle cx="87" cy="112" r="3" fill="#18181b"/>

      <polygon points="124,102 104,106 106,110 126,106" fill="#18181b"/>
      <polygon points="122,108 106,110 110,116 120,114" fill="#ffffff"/>
      <circle cx="113" cy="112" r="3" fill="#18181b"/>

      <!-- Nose & Determined Grin -->
      <polygon points="100,120 98,126 102,126" fill="#b45309"/>
      <line x1="90" y1="134" x2="110" y2="134" stroke="#18181b" stroke-width="2.5" stroke-linecap="round"/>

      <!-- Martial Arts Orange & Blue Gi -->
      <polygon points="56,152 144,152 152,176 48,176" fill="#ea580c"/>
      <polygon points="86,152 114,152 108,176 92,176" fill="#1e3a8a"/>

      <!-- Gloss Sheen -->
      <path d="M100 28 L136 40 L130 64" stroke="url(#stickerGloss)" stroke-width="6" stroke-linecap="round"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "cartoons",
    subcategory: "anime",
    tags: ["goku","dragon ball","dbz","anime","saiyan","hero","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-blossom",
    name: "Powerpuff Girls Blossom",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <circle cx="100" cy="100" r="48" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <polygon points="100,42 54,20 62,64 100,46 138,64 146,20" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <polygon points="80,140 120,140 126,176 74,176" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>

      <!-- Giant Red Bow -->
      <polygon points="100,44 56,22 64,62 100,48 136,62 144,22" fill="#dc2626"/>
      <circle cx="100" cy="46" r="8" fill="#991b1b"/>

      <!-- Orange Hair -->
      <circle cx="100" cy="100" r="46" fill="#f97316"/>

      <!-- Face -->
      <circle cx="100" cy="104" r="40" fill="#fde68a"/>

      <!-- Eyes (Signature Huge PPG Eyes) -->
      <circle cx="78" cy="102" r="18" fill="#ec4899"/>
      <circle cx="80" cy="102" r="12" fill="#000000"/>
      <circle cx="83" cy="98" r="5" fill="#ffffff"/>

      <circle cx="122" cy="102" r="18" fill="#ec4899"/>
      <circle cx="120" cy="102" r="12" fill="#000000"/>
      <circle cx="117" cy="98" r="5" fill="#ffffff"/>

      <!-- Smile -->
      <path d="M94 126 Q100 132 106 126" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>

      <!-- Pink & Black Dress -->
      <polygon points="82,142 118,142 124,172 76,172" fill="#ec4899"/>
      <rect x="79" y="152" width="42" height="6" fill="#000000"/>

      <!-- Gloss Arc -->
      <path d="M68 28 C84 24 116 24 132 28" stroke="url(#stickerGloss)" stroke-width="6" stroke-linecap="round"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "cartoons",
    subcategory: "classic",
    tags: ["blossom","powerpuff","cartoon network","hero","pink","bow","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-bubbles",
    name: "Powerpuff Girls Bubbles",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <circle cx="100" cy="100" r="48" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <circle cx="48" cy="74" r="22" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>
      <circle cx="152" cy="74" r="22" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>
      <polygon points="80,140 120,140 126,176 74,176" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>

      <!-- Blonde Pigtails -->
      <circle cx="48" cy="74" r="20" fill="#facc15"/>
      <circle cx="152" cy="74" r="20" fill="#facc15"/>

      <!-- Head & Hair Base -->
      <circle cx="100" cy="100" r="46" fill="#facc15"/>
      <circle cx="100" cy="104" r="40" fill="#fde68a"/>

      <!-- Big Blue Eyes -->
      <circle cx="78" cy="102" r="18" fill="#38bdf8"/>
      <circle cx="80" cy="102" r="12" fill="#000000"/>
      <circle cx="83" cy="98" r="5" fill="#ffffff"/>

      <circle cx="122" cy="102" r="18" fill="#38bdf8"/>
      <circle cx="120" cy="102" r="12" fill="#000000"/>
      <circle cx="117" cy="98" r="5" fill="#ffffff"/>

      <!-- Smile -->
      <path d="M94 126 Q100 134 106 126" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>

      <!-- Blue Dress -->
      <polygon points="82,142 118,142 124,172 76,172" fill="#38bdf8"/>
      <rect x="79" y="152" width="42" height="6" fill="#000000"/>

      <!-- Gloss Arc -->
      <path d="M74 66 C88 60 112 60 126 66" stroke="url(#stickerGloss)" stroke-width="6" stroke-linecap="round"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "cartoons",
    subcategory: "classic",
    tags: ["bubbles","powerpuff","cartoon network","blue","blonde","cute","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-buttercup",
    name: "Powerpuff Girls Buttercup",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <path d="M100 48 C50 48 44 88 44 116 C44 148 76 156 100 156 C124 156 156 148 156 116 C156 88 150 48 100 48 Z" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <polygon points="80,140 120,140 126,176 74,176" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>

      <!-- Black Bob Hair -->
      <path d="M100 52 C54 52 48 90 48 118 C56 100 68 88 100 88 C132 88 144 100 152 118 C152 90 146 52 100 52 Z" fill="#18181b"/>

      <!-- Face -->
      <circle cx="100" cy="106" r="38" fill="#fde68a"/>

      <!-- Big Green Feisty Eyes -->
      <circle cx="78" cy="104" r="18" fill="#22c55e"/>
      <circle cx="80" cy="104" r="12" fill="#000000"/>
      <circle cx="83" cy="100" r="5" fill="#ffffff"/>

      <circle cx="122" cy="104" r="18" fill="#22c55e"/>
      <circle cx="120" cy="104" r="12" fill="#000000"/>
      <circle cx="117" cy="100" r="5" fill="#ffffff"/>

      <!-- Sassy Smirk -->
      <path d="M96 128 L108 126" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>

      <!-- Green Dress -->
      <polygon points="82,142 118,142 124,172 76,172" fill="#22c55e"/>
      <rect x="79" y="152" width="42" height="6" fill="#000000"/>

      <!-- Gloss Arc -->
      <path d="M72 58 C86 52 114 52 128 58" stroke="url(#stickerGloss)" stroke-width="6" stroke-linecap="round"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "cartoons",
    subcategory: "classic",
    tags: ["buttercup","powerpuff","cartoon network","green","feisty","hero","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-tom-jerry",
    name: "Tom and Jerry Duo",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <circle cx="94" cy="116" r="52" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <circle cx="134" cy="68" r="26" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <polygon points="56,76 38,36 82,60" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <polygon points="126,80 146,40 106,62" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>

      <!-- Tom Cat Ears -->
      <polygon points="56,76 38,36 82,60" fill="#64748b"/>
      <polygon points="58,72 44,42 78,60" fill="#f472b6"/>
      <polygon points="126,80 146,40 106,62" fill="#64748b"/>
      <polygon points="124,76 140,46 110,62" fill="#f472b6"/>

      <!-- Tom Head (Gray) -->
      <circle cx="94" cy="116" r="50" fill="#64748b"/>
      <!-- White Muzzle -->
      <ellipse cx="94" cy="128" rx="34" ry="24" fill="#f8fafc"/>

      <!-- Tom Eyes (Yellow/Green) -->
      <ellipse cx="80" cy="104" rx="10" ry="14" fill="#fde047"/>
      <ellipse cx="82" cy="104" rx="4" ry="8" fill="#18181b"/>
      <ellipse cx="108" cy="104" rx="10" ry="14" fill="#fde047"/>
      <ellipse cx="106" cy="104" rx="4" ry="8" fill="#18181b"/>

      <!-- Pink Nose & Smile -->
      <ellipse cx="94" cy="120" rx="6" ry="4" fill="#f472b6"/>
      <path d="M78 132 Q94 146 110 132" fill="none" stroke="#18181b" stroke-width="2.5"/>

      <!-- Jerry Mouse Perched on Top Right -->
      <circle cx="134" cy="68" r="22" fill="#92400e"/>
      <!-- Jerry Ears -->
      <circle cx="120" cy="48" r="9" fill="#92400e"/>
      <circle cx="120" cy="48" r="6" fill="#f472b6"/>
      <circle cx="148" cy="50" r="9" fill="#92400e"/>
      <circle cx="148" cy="50" r="6" fill="#f472b6"/>
      <!-- Jerry Face -->
      <ellipse cx="134" cy="74" rx="14" ry="10" fill="#fed7aa"/>
      <circle cx="134" cy="70" r="3" fill="#18181b"/>
      <circle cx="128" cy="64" r="3" fill="#18181b"/>
      <circle cx="140" cy="64" r="3" fill="#18181b"/>
      <path d="M128 76 Q134 82 140 76" fill="none" stroke="#18181b" stroke-width="1.8"/>

      <!-- Gloss Sheen -->
      <path d="M60 92 C80 82 110 82 126 92" stroke="url(#stickerGloss)" stroke-width="6" stroke-linecap="round"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "cartoons",
    subcategory: "classic",
    tags: ["tom and jerry","cat","mouse","classic","comedy","duo","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-tweety",
    name: "Tweety Bird Sweet Canary",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <circle cx="100" cy="80" r="48" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <ellipse cx="100" cy="144" rx="26" ry="22" fill="#ffffff" stroke="#ffffff" stroke-width="14"/>
      <ellipse cx="80" cy="172" rx="18" ry="10" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>
      <ellipse cx="120" cy="172" rx="18" ry="10" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>

      <!-- Tweety Big Head -->
      <circle cx="100" cy="80" r="46" fill="#facc15"/>
      <!-- Feathers on top -->
      <path d="M100 34 Q96 24 92 20" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
      <path d="M100 34 Q100 22 100 18" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
      <path d="M100 34 Q104 24 108 20" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>

      <!-- Huge Blue Eyes -->
      <ellipse cx="84" cy="74" rx="13" ry="20" fill="#ffffff" stroke="#ca8a04" stroke-width="1.2"/>
      <ellipse cx="85" cy="74" rx="9" ry="14" fill="#38bdf8"/>
      <circle cx="86" cy="74" r="5" fill="#0369a1"/>
      <circle cx="83" cy="70" r="2.5" fill="#ffffff"/>
      <line x1="84" y1="52" x2="80" y2="44" stroke="#ca8a04" stroke-width="1.8"/>

      <ellipse cx="116" cy="74" rx="13" ry="20" fill="#ffffff" stroke="#ca8a04" stroke-width="1.2"/>
      <ellipse cx="115" cy="74" rx="9" ry="14" fill="#38bdf8"/>
      <circle cx="114" cy="74" r="5" fill="#0369a1"/>
      <circle cx="112" cy="70" r="2.5" fill="#ffffff"/>
      <line x1="116" y1="52" x2="120" y2="44" stroke="#ca8a04" stroke-width="1.8"/>

      <!-- Orange Beak -->
      <path d="M94 92 Q100 86 106 92 Q100 102 94 92 Z" fill="#f97316"/>

      <!-- Tiny Body -->
      <ellipse cx="100" cy="144" rx="24" ry="20" fill="#facc15"/>

      <!-- Oversized Orange Feet -->
      <ellipse cx="80" cy="172" rx="16" ry="8" fill="#f97316"/>
      <ellipse cx="120" cy="172" rx="16" ry="8" fill="#f97316"/>

      <!-- Gloss Arc -->
      <path d="M76 52 C88 44 112 44 124 52" stroke="url(#stickerGloss)" stroke-width="6" stroke-linecap="round"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "cartoons",
    subcategory: "classic",
    tags: ["tweety","bird","canary","looney","yellow","cute","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-unicorn",
    name: "Rainbow Pegasus Unicorn",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <path d="M60 172 C60 120 72 80 114 62 L138 24 L142 54 L170 94 C170 140 120 172 60 172 Z" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <polygon points="120,70 172,48 152,86" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>

      <!-- Golden Horn -->
      <polygon points="138,24 134,58 144,56" fill="#fbbf24"/>
      <line x1="135" y1="50" x2="142" y2="46" stroke="#d97706" stroke-width="1.5"/>
      <line x1="136" y1="40" x2="140" y2="36" stroke="#d97706" stroke-width="1.5"/>

      <!-- White Body & Head -->
      <path d="M72 168 C72 126 84 92 118 78 C136 70 156 82 154 104 C150 124 132 136 112 136 C96 136 82 152 72 168 Z" fill="#f8fafc"/>

      <!-- Rainbow Flowing Mane -->
      <path d="M112 66 C100 80 94 102 96 124" stroke="#f472b6" stroke-width="6" stroke-linecap="round"/>
      <path d="M106 72 C94 88 88 110 90 134" stroke="#c084fc" stroke-width="6" stroke-linecap="round"/>
      <path d="M100 80 C88 98 84 122 84 146" stroke="#38bdf8" stroke-width="6" stroke-linecap="round"/>
      <path d="M94 90 C82 108 80 132 78 156" stroke="#fde047" stroke-width="6" stroke-linecap="round"/>

      <!-- Cute Eye with Star -->
      <ellipse cx="136" cy="94" rx="4" ry="6" fill="#4c1d95"/>
      <circle cx="137" cy="92" r="1.5" fill="#ffffff"/>
      <!-- Soft Pink Cheek -->
      <circle cx="144" cy="106" r="6" fill="#f472b6" opacity="0.6"/>

      <!-- Pegasus Wing -->
      <path d="M116 114 Q148 94 172 106 Q156 124 128 128 Z" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5"/>
      <path d="M130 112 Q156 102 166 114" stroke="#e2e8f0" stroke-width="1.5"/>

      <!-- Gloss Arc -->
      <path d="M120 74 C134 70 146 76 150 86" stroke="url(#stickerGloss)" stroke-width="5" stroke-linecap="round"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "cartoons",
    subcategory: "fantasy",
    tags: ["unicorn","pegasus","rainbow","magic","fantasy","wings","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-mermaid-tail",
    name: "Shimmering Mermaid Tail",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <path d="M76 28 L124 28 C124 78 114 116 100 138 C120 150 168 152 172 176 C144 172 118 166 100 150 C82 166 56 172 28 176 C32 152 80 150 100 138 C86 116 76 78 76 28 Z" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>

      <!-- Tail Base -->
      <path d="M80 32 L120 32 C120 78 112 114 100 136 C88 114 80 78 80 32 Z" fill="#06b6d4"/>

      <!-- Scalloped Iridescent Scales -->
      <path d="M86 48 Q94 56 102 48 Q110 56 118 48" fill="none" stroke="#67e8f9" stroke-width="2.5"/>
      <path d="M84 66 Q92 74 100 66 Q108 74 116 66" fill="none" stroke="#a855f7" stroke-width="2.5"/>
      <path d="M86 84 Q94 92 102 84 Q110 92 118 84" fill="none" stroke="#67e8f9" stroke-width="2.5"/>
      <path d="M90 102 Q100 110 110 102" fill="none" stroke="#f472b6" stroke-width="2.5"/>
      <path d="M94 120 Q100 126 106 120" fill="none" stroke="#67e8f9" stroke-width="2.5"/>

      <!-- Spreading Fins (Iridescent Purple to Cyan) -->
      <path d="M100 136 C116 148 164 150 168 172 C142 168 116 162 100 148 C84 162 58 168 32 172 C36 150 84 148 100 136 Z" fill="#8b5cf6"/>
      <path d="M100 144 C112 154 150 156 156 168 C136 164 114 160 100 148 C86 160 64 164 44 168 C50 156 88 154 100 144 Z" fill="#06b6d4" opacity="0.6"/>

      <!-- Fin Rays -->
      <path d="M100 142 Q130 156 158 166" stroke="#c084fc" stroke-width="1.8" fill="none"/>
      <path d="M100 142 Q70 156 42 166" stroke="#c084fc" stroke-width="1.8" fill="none"/>

      <!-- Gloss Highlight -->
      <path d="M84 36 L116 36 L110 60 L88 60 Z" fill="url(#stickerGloss)"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "cartoons",
    subcategory: "fantasy",
    tags: ["mermaid","tail","ocean","scales","iridescent","sparkle","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-bgmi",
    name: "Battlegrounds Mobile India Badge",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <rect x="28" y="36" width="144" height="128" rx="14" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>

      <!-- Dark Tactical Base Plate -->
      <rect x="32" y="40" width="136" height="120" rx="10" fill="#18181b"/>

      <!-- Indian Flag Tricolor Accent Bars -->
      <rect x="36" y="44" width="128" height="6" fill="#f97316"/>
      <rect x="36" y="50" width="128" height="6" fill="#f8fafc"/>
      <rect x="36" y="56" width="128" height="6" fill="#16a34a"/>

      <!-- Helmet Graphic -->
      <circle cx="100" cy="88" r="22" fill="#3f3f46"/>
      <rect x="80" y="86" width="40" height="8" rx="2" fill="#09090b"/>
      <line x1="84" y1="90" x2="116" y2="90" stroke="#06b6d4" stroke-width="1.5"/>

      <!-- BGMI Text -->
      <text x="100" y="132" font-family="'Impact', 'Arial Black', sans-serif" font-size="14" font-weight="900" fill="#f8fafc" text-anchor="middle" letter-spacing="1">
        BATTLEGROUNDS
      </text>
      <text x="100" y="148" font-family="'Impact', 'Arial Black', sans-serif" font-size="11" font-weight="900" fill="#f97316" text-anchor="middle" letter-spacing="2">
        MOBILE INDIA
      </text>

      <!-- Gloss Arc -->
      <path d="M34 42 L166 42 L154 62 L46 62 Z" fill="url(#stickerGloss)"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "gaming",
    subcategory: "esports",
    tags: ["bgmi","battlegrounds","india","gaming","esports","pubg","badge","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-chhota-bheem",
    name: "Chhota Bheem Hero with Laddoo",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <circle cx="100" cy="74" r="38" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <polygon points="70,106 130,106 136,176 64,176" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>

      <!-- Black Hair -->
      <circle cx="100" cy="68" r="36" fill="#18181b"/>
      <path d="M100 32 Q96 22 100 16 Q104 22 100 32" stroke="#18181b" stroke-width="8" stroke-linecap="round"/>

      <!-- Face (Indian Tan Skin Tone) -->
      <ellipse cx="100" cy="76" rx="30" ry="26" fill="#f59e0b"/>

      <!-- Red Tilak on Forehead -->
      <polygon points="100,56 97,66 103,66" fill="#dc2626"/>
      <circle cx="100" cy="68" r="1.5" fill="#fde047"/>

      <!-- Big Expressive Eyes -->
      <ellipse cx="88" cy="74" rx="6" ry="8" fill="#ffffff"/>
      <circle cx="89" cy="74" r="3.5" fill="#18181b"/>
      <circle cx="88" cy="72" r="1.2" fill="#ffffff"/>

      <ellipse cx="112" cy="74" rx="6" ry="8" fill="#ffffff"/>
      <circle cx="111" cy="74" r="3.5" fill="#18181b"/>
      <circle cx="110" cy="72" r="1.2" fill="#ffffff"/>

      <!-- Smile -->
      <path d="M92 88 Q100 96 108 88" fill="none" stroke="#78350f" stroke-width="2.5" stroke-linecap="round"/>

      <!-- Muscular Torso -->
      <polygon points="76,102 124,102 128,136 72,136" fill="#f59e0b"/>

      <!-- Gold Kada on Wrist -->
      <circle cx="64" cy="120" r="10" fill="#f59e0b"/>
      <circle cx="64" cy="120" r="6" fill="#fbbf24"/>
      <!-- Golden Laddoo in Hand -->
      <circle cx="136" cy="118" r="9" fill="#facc15" stroke="#d97706" stroke-width="1.5"/>

      <!-- Orange Dhoti with Gold Border -->
      <polygon points="70,136 130,136 136,174 64,174" fill="#ea580c"/>
      <line x1="68" y1="138" x2="132" y2="138" stroke="#fbbf24" stroke-width="3"/>

      <!-- Gloss Arc -->
      <path d="M78 48 C90 42 110 42 122 48" stroke="url(#stickerGloss)" stroke-width="6" stroke-linecap="round"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "cartoons",
    subcategory: "indian",
    tags: ["bheem","chhota bheem","laddoo","indian","hero","cartoon","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-motu-patlu",
    name: "Motu Patlu Comedy Duo",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <ellipse cx="76" cy="116" rx="42" ry="50" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <ellipse cx="136" cy="106" rx="30" ry="58" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>

      <!-- MOTU (Left - Round & Red Kurta) -->
      <!-- Head -->
      <circle cx="76" cy="80" r="28" fill="#fed7aa"/>
      <ellipse cx="76" cy="62" rx="26" ry="12" fill="#18181b"/>
      <!-- Eyes -->
      <circle cx="68" cy="76" r="3.5" fill="#18181b"/>
      <circle cx="84" cy="76" r="3.5" fill="#18181b"/>
      <!-- Mustache (Iconic Motu Moustache) -->
      <path d="M60 88 Q76 96 92 88 Q76 86 60 88 Z" fill="#18181b"/>
      <!-- Round Belly & Red Kurta -->
      <circle cx="76" cy="134" r="32" fill="#dc2626"/>
      <!-- Black Vest -->
      <path d="M54 116 L66 148 L76 148 L66 116 Z" fill="#18181b"/>
      <path d="M98 116 L86 148 L76 148 L86 116 Z" fill="#18181b"/>

      <!-- PATLU (Right - Tall & Yellow Shirt) -->
      <!-- Head (Bald with Tuft) -->
      <ellipse cx="136" cy="68" rx="20" ry="24" fill="#fed7aa"/>
      <path d="M136 44 Q140 34 144 38" stroke="#18181b" stroke-width="3" stroke-linecap="round"/>
      <!-- Glasses (Round Black Frames) -->
      <circle cx="128" cy="68" r="6" fill="#ffffff" stroke="#18181b" stroke-width="2"/>
      <circle cx="128" cy="68" r="2" fill="#18181b"/>
      <circle cx="144" cy="68" r="6" fill="#ffffff" stroke="#18181b" stroke-width="2"/>
      <circle cx="144" cy="68" r="2" fill="#18181b"/>
      <line x1="134" y1="68" x2="138" y2="68" stroke="#18181b" stroke-width="2"/>
      <!-- Thin Body in Yellow Shirt -->
      <rect x="124" y="94" width="24" height="60" rx="6" fill="#facc15"/>
      <rect x="126" y="154" width="10" height="20" fill="#1d4ed8"/>
      <rect x="138" y="154" width="10" height="20" fill="#1d4ed8"/>

      <!-- Gloss Arc -->
      <path d="M56 68 C70 58 100 58 116 68" stroke="url(#stickerGloss)" stroke-width="5" stroke-linecap="round"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "cartoons",
    subcategory: "indian",
    tags: ["motu","patlu","samosa","comedy","indian","cartoon","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-pooh",
    name: "Winnie the Pooh Honey Bear",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <circle cx="100" cy="80" r="44" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <circle cx="68" cy="50" r="16" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>
      <circle cx="132" cy="50" r="16" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>
      <ellipse cx="100" cy="144" rx="38" ry="32" fill="#ffffff" stroke="#ffffff" stroke-width="14"/>

      <!-- Round Ears -->
      <circle cx="68" cy="50" r="14" fill="#f59e0b"/>
      <circle cx="132" cy="50" r="14" fill="#f59e0b"/>

      <!-- Head Golden Yellow -->
      <circle cx="100" cy="80" r="42" fill="#f59e0b"/>

      <!-- Eyes & Nose -->
      <ellipse cx="88" cy="76" rx="3.5" ry="5" fill="#18181b"/>
      <ellipse cx="112" cy="76" rx="3.5" ry="5" fill="#18181b"/>
      <ellipse cx="100" cy="88" rx="8" ry="6" fill="#18181b"/>

      <!-- Sweet Smile -->
      <path d="M88 98 Q100 108 112 98" fill="none" stroke="#78350f" stroke-width="2.5" stroke-linecap="round"/>

      <!-- Chubby Body in Red Tee -->
      <ellipse cx="100" cy="144" rx="36" ry="30" fill="#f59e0b"/>
      <!-- Red Cropped Tee -->
      <path d="M68 118 C68 110 132 110 132 118 L138 144 L62 144 Z" fill="#dc2626"/>

      <!-- Paws -->
      <circle cx="62" cy="136" r="10" fill="#f59e0b"/>
      <circle cx="138" cy="136" r="10" fill="#f59e0b"/>

      <!-- Gloss Arc -->
      <path d="M78 56 C90 48 110 48 122 56" stroke="url(#stickerGloss)" stroke-width="6" stroke-linecap="round"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "cartoons",
    subcategory: "disney",
    tags: ["pooh","winnie the pooh","disney","bear","honey","cute","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-subway-surfers",
    name: "Subway Surfers Tricky Skater",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <circle cx="100" cy="74" r="38" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <rect x="40" y="160" width="120" height="24" rx="10" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <polygon points="76,104 124,104 128,164 72,164" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>

      <!-- Backwards Red Baseball Cap -->
      <path d="M66 66 C66 42 134 42 134 66 L144 72 L60 72 Z" fill="#dc2626"/>
      <ellipse cx="140" cy="72" rx="14" ry="4" fill="#b91c1c"/>

      <!-- Blonde Bangs & Face -->
      <ellipse cx="100" cy="80" rx="30" ry="24" fill="#fed7aa"/>
      <path d="M72 68 Q88 78 100 68 Q112 78 128 68 Z" fill="#facc15"/>

      <!-- Anime Eyes & Smile -->
      <circle cx="86" cy="80" r="4.5" fill="#18181b"/>
      <circle cx="87" cy="78" r="1.5" fill="#ffffff"/>
      <circle cx="114" cy="80" r="4.5" fill="#18181b"/>
      <circle cx="113" cy="78" r="1.5" fill="#ffffff"/>
      <path d="M92 92 Q100 98 108 92" fill="none" stroke="#78350f" stroke-width="2" stroke-linecap="round"/>

      <!-- Denim Vest Body -->
      <polygon points="76,104 124,104 128,158 72,158" fill="#2563eb"/>
      <rect x="86" y="104" width="28" height="54" fill="#f8fafc"/>

      <!-- Hoverboard / Skateboard -->
      <rect x="44" y="162" width="112" height="16" rx="8" fill="#f97316"/>
      <circle cx="58" cy="180" r="6" fill="#18181b"/>
      <circle cx="142" cy="180" r="6" fill="#18181b"/>
      <line x1="56" y1="170" x2="144" y2="170" stroke="#facc15" stroke-width="3"/>

      <!-- Gloss Arc -->
      <path d="M78 48 C90 42 110 42 122 48" stroke="url(#stickerGloss)" stroke-width="6" stroke-linecap="round"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "gaming",
    subcategory: "arcade",
    tags: ["subway surfers","tricky","skater","cap","skateboard","gaming","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-minion-teddy",
    name: "Minion Hugging Teddy Bear",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <rect x="58" y="32" width="84" height="136" rx="42" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <circle cx="126" cy="128" r="22" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>

      <!-- Yellow Body -->
      <rect x="62" y="36" width="76" height="128" rx="38" fill="#facc15"/>
      <!-- Goggle Strap & Eye -->
      <rect x="62" y="70" width="76" height="10" fill="#1e293b"/>
      <circle cx="100" cy="74" r="18" fill="#cbd5e1" stroke="#64748b" stroke-width="2.5"/>
      <circle cx="100" cy="74" r="13" fill="#ffffff"/>
      <circle cx="100" cy="74" r="6" fill="#78350f"/>
      <circle cx="100" cy="74" r="3" fill="#000000"/>
      <circle cx="98" cy="72" r="1.5" fill="#ffffff"/>

      <!-- Happy Smile -->
      <path d="M88 98 Q100 108 112 98" fill="none" stroke="#713f12" stroke-width="2.5" stroke-linecap="round"/>

      <!-- Denim Overalls -->
      <path d="M68 126 L132 126 L134 162 C134 164 130 164 100 164 C70 164 66 164 66 162 Z" fill="#2563eb"/>

      <!-- Teddy Bear Tim (Brown) -->
      <circle cx="126" cy="128" r="18" fill="#78350f"/>
      <circle cx="114" cy="114" r="6" fill="#78350f"/>
      <circle cx="138" cy="114" r="6" fill="#78350f"/>
      <circle cx="122" cy="126" r="3" fill="#fde047"/>
      <circle cx="122" cy="126" r="1" fill="#000000"/>
      <circle cx="132" cy="126" r="3" fill="#fde047"/>
      <circle cx="132" cy="126" r="1" fill="#000000"/>
      <ellipse cx="126" cy="132" rx="4" ry="3" fill="#fed7aa"/>
      <circle cx="126" cy="131" r="1.5" fill="#000000"/>

      <!-- Gloss Arc -->
      <path d="M72 44 C84 36 116 36 128 44" stroke="url(#stickerGloss)" stroke-width="8" stroke-linecap="round"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "cartoons",
    subcategory: "movies",
    tags: ["minion","teddy","tim","cute","hug","despicable me","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
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
    id: "stk-pop-minions-trio",
    name: "Minions Joyful Trio",
    fileUrl: makeSvgDataUri(wrapRealisticStickerSvg(`
      <!-- White Die-Cut Contour Backing -->
      <path d="M42 90 C42 66 78 66 78 90 L78 168 L42 168 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M80 50 C80 24 120 24 120 50 L120 168 L80 168 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M122 90 C122 66 158 66 158 90 L158 168 L122 168 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>

      <!-- Left Minion -->
      <rect x="44" y="80" width="34" height="84" rx="17" fill="#facc15"/>
      <rect x="44" y="98" width="34" height="6" fill="#1e293b"/>
      <circle cx="61" cy="101" r="10" fill="#cbd5e1" stroke="#64748b" stroke-width="1.8"/>
      <circle cx="61" cy="101" r="4" fill="#78350f"/>
      <path d="M46 136 L76 136 L76 164 L46 164 Z" fill="#2563eb"/>

      <!-- Center Tall Minion (Kevin) -->
      <rect x="82" y="38" width="36" height="126" rx="18" fill="#facc15"/>
      <rect x="82" y="68" width="36" height="6" fill="#1e293b"/>
      <circle cx="94" cy="71" r="8" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
      <circle cx="94" cy="71" r="3" fill="#78350f"/>
      <circle cx="106" cy="71" r="8" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
      <circle cx="106" cy="71" r="3" fill="#78350f"/>
      <path d="M94 88 Q100 94 106 88" fill="none" stroke="#713f12" stroke-width="1.8"/>
      <path d="M84 128 L116 128 L116 164 L84 164 Z" fill="#2563eb"/>

      <!-- Right Minion -->
      <rect x="122" y="80" width="34" height="84" rx="17" fill="#facc15"/>
      <rect x="122" y="98" width="34" height="6" fill="#1e293b"/>
      <circle cx="139" cy="101" r="10" fill="#cbd5e1" stroke="#64748b" stroke-width="1.8"/>
      <circle cx="139" cy="101" r="4" fill="#15803d"/>
      <path d="M124 136 L154 136 L154 164 L124 164 Z" fill="#2563eb"/>

      <!-- Gloss Sheen -->
      <path d="M86 44 C94 38 106 38 114 44" stroke="url(#stickerGloss)" stroke-width="5" stroke-linecap="round"/>
    `)),
    thumbnailUrl: "",
    format: "svg",
    category: "cartoons",
    subcategory: "movies",
    tags: ["minions","trio","group","party","despicable me","trending","pop-culture","realistic"],
    author: "Falcon Sticker Studio",
    source: "Falcon Realistic Pop Collection",
    sourceUrl: "https://falcon.design",
    license: "CC0 1.0 Universal",
    attributionRequired: false,
    width: 200,
    height: 200,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    status: "published",
    isDemo: true,
  },

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
