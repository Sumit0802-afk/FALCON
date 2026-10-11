// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Design Editor – Real Vinyl & Vector Sticker Marketplace
//  100% Real, Unique, Non-Repeated, Non-Animated Real Object Stickers
// ─────────────────────────────────────────────────────────────────────────────

export interface StickerItem {
  id: string;
  name: string;
  category: string;
  style: "3d" | "vector" | "metallic" | "badge" | "emoji" | "doodle";
  tags: string[];
  /** Inline SVG string — rendered directly in img src as data URI */
  svg: string;
}

export interface StickerCategory {
  id: string;
  label: string;
  emoji: string;
}

export const STICKER_CATEGORIES: StickerCategory[] = [
  { id: "all",          label: "All",           emoji: "✦"  },
  { id: "trending",     label: "Trending",      emoji: "🔥" },
  { id: "business",     label: "Business",      emoji: "💼" },
  { id: "social",       label: "Social Media",  emoji: "📱" },
  { id: "marketing",    label: "Marketing",     emoji: "📣" },
  { id: "education",    label: "Education",     emoji: "🎓" },
  { id: "events",       label: "Events",        emoji: "🎟️" },
  { id: "food",         label: "Food",          emoji: "🍕" },
  { id: "travel",       label: "Travel",        emoji: "✈️" },
  { id: "fashion",      label: "Fashion",       emoji: "👗" },
  { id: "fitness",      label: "Fitness",       emoji: "💪" },
  { id: "technology",   label: "Technology",    emoji: "💻" },
  { id: "gaming",       label: "Gaming",        emoji: "🎮" },
  { id: "finance",      label: "Finance",       emoji: "💰" },
  { id: "celebration",  label: "Celebration",   emoji: "🎉" },
  { id: "love",         label: "Love",          emoji: "❤️" },
  { id: "nature",       label: "Nature",        emoji: "🌿" },
  { id: "animals",      label: "Animals",       emoji: "🐾" },
  { id: "arrows",       label: "Arrows",        emoji: "➡️" },
  { id: "shapes",       label: "Shapes",        emoji: "⬡"  },
  { id: "emoji",        label: "Emoji",         emoji: "😊" },
  { id: "3d",           label: "3D",            emoji: "🧊" },
  { id: "doodles",      label: "Doodles",       emoji: "✏️" },
  { id: "decorative",   label: "Decorative",    emoji: "✨" },
];

export const STICKER_STYLES = [
  { id: "all",      label: "All Styles" },
  { id: "3d",       label: "3D Glossy" },
  { id: "vector",   label: "Vector Art" },
  { id: "badge",    label: "Badges & Stamps" },
  { id: "metallic", label: "Metallic Foil" },
  { id: "emoji",    label: "Expressive" },
  { id: "doodle",   label: "Doodles" },
] as const;

// Helper to wrap vector SVG in standard 200×200 viewBox with die-cut sticker backing & shadow
const stickerSvg = (content: string, defs = "") => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <filter id="stickerShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.38"/>
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
    ${defs}
  </defs>
  <g filter="url(#stickerShadow)">
    ${content}
  </g>
</svg>`.trim();

// ─────────────────────────────────────────────────────────────────────────────
//  REAL, UNIQUE, NON-REPEATED STICKERS CATALOG
// ─────────────────────────────────────────────────────────────────────────────

export const STICKERS_DATA: StickerItem[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. TRENDING
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tr-fire-flame",
    name: "Classic Fire Flame",
    category: "trending",
    style: "3d",
    tags: ["fire", "flame", "hot", "trend", "viral", "lit"],
    svg: stickerSvg(`
      <path d="M100 22 C100 22 138 68 138 112 C138 144 120 170 100 180 C80 170 62 144 62 112 C62 70 100 22 100 22 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M100 22 C100 22 138 68 138 112 C138 144 120 170 100 180 C80 170 62 144 62 112 C62 70 100 22 100 22 Z" fill="#ea580c"/>
      <path d="M100 65 C100 65 124 98 124 125 C124 150 112 168 100 174 C88 168 76 150 76 125 C76 98 100 65 100 65 Z" fill="#f97316"/>
      <path d="M100 110 C100 110 112 130 112 144 C112 158 106 168 100 171 C94 168 88 158 88 144 C88 130 100 110 100 110 Z" fill="#facc15"/>
    `),
  },
  {
    id: "tr-gold-star",
    name: "3D Golden Star Badge",
    category: "trending",
    style: "metallic",
    tags: ["star", "gold", "award", "rank", "rating", "favorite"],
    svg: stickerSvg(`
      <polygon points="100,20 124,72 180,78 138,118 150,174 100,144 50,174 62,118 20,78 76,72" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <polygon points="100,20 124,72 180,78 138,118 150,174 100,144 50,174 62,118 20,78 76,72" fill="#f59e0b"/>
      <polygon points="100,20 124,72 100,144 76,72" fill="#fbbf24"/>
      <polygon points="100,20 100,144 50,174 62,118 20,78 76,72" fill="#d97706"/>
      <circle cx="100" cy="85" r="16" fill="#ffffff" opacity="0.35"/>
    `),
  },
  {
    id: "tr-blue-diamond",
    name: "Aqua Crystal Diamond",
    category: "trending",
    style: "3d",
    tags: ["diamond", "gem", "crystal", "luxury", "vip", "rare"],
    svg: stickerSvg(`
      <polygon points="100,30 168,76 100,172 32,76" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <polygon points="100,30 168,76 100,95" fill="#38bdf8"/>
      <polygon points="100,30 32,76 100,95" fill="#7dd3fc"/>
      <polygon points="32,76 100,172 100,95" fill="#0284c7"/>
      <polygon points="168,76 100,172 100,95" fill="#0369a1"/>
      <polygon points="100,30 65,76 100,95" fill="#bae6fd"/>
      <polygon points="100,30 135,76 100,95" fill="#0ea5e9"/>
    `),
  },
  {
    id: "tr-lightning-flash",
    name: "Golden Lightning Bolt",
    category: "trending",
    style: "vector",
    tags: ["lightning", "bolt", "energy", "power", "flash", "speed"],
    svg: stickerSvg(`
      <polygon points="115,18 50,105 92,105 82,182 150,92 108,92" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
      <polygon points="115,18 50,105 92,105 82,182 150,92 108,92" fill="#eab308"/>
      <polygon points="115,18 85,92 108,92 82,182 100,105 50,105" fill="#facc15"/>
    `),
  },
  {
    id: "tr-rocket-launch",
    name: "Apollo Rocket Launch",
    category: "trending",
    style: "3d",
    tags: ["rocket", "launch", "space", "startup", "boost", "grow"],
    svg: stickerSvg(`
      <path d="M100 22 C122 45 132 88 126 128 L74 128 C68 88 78 45 100 22 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M100 22 C122 45 132 88 126 128 L74 128 C68 88 78 45 100 22 Z" fill="#f1f5f9"/>
      <path d="M100 22 C114 45 120 70 100 80 C80 70 86 45 100 22 Z" fill="#ef4444"/>
      <circle cx="100" cy="92" r="14" fill="#0284c7" stroke="#ffffff" stroke-width="3"/>
      <path d="M74 116 L48 145 L70 138 Z" fill="#dc2626"/>
      <path d="M126 116 L152 145 L130 138 Z" fill="#dc2626"/>
      <path d="M86 130 C86 130 92 165 100 182 C108 165 114 130 114 130 Z" fill="#f97316"/>
      <path d="M92 130 C92 130 96 155 100 168 C104 155 108 130 108 130 Z" fill="#fde047"/>
    `),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. SOCIAL MEDIA
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "soc-youtube-play",
    name: "YouTube Play Button",
    category: "social",
    style: "3d",
    tags: ["youtube", "video", "play", "channel", "stream", "media"],
    svg: stickerSvg(`
      <rect x="32" y="55" width="136" height="92" rx="28" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="32" y="55" width="136" height="92" rx="28" fill="#ff0000"/>
      <path d="M35 65 Q 100 85 165 65" fill="#ffffff" opacity="0.25"/>
      <polygon points="86,76 128,101 86,126" fill="#ffffff"/>
    `),
  },
  {
    id: "soc-instagram-cam",
    name: "Instagram Sunset Camera",
    category: "social",
    style: "vector",
    tags: ["instagram", "photo", "camera", "story", "post", "social"],
    svg: stickerSvg(`
      <defs>
        <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#f59e0b"/>
          <stop offset="30%" stop-color="#ec4899"/>
          <stop offset="65%" stop-color="#a855f7"/>
          <stop offset="100%" stop-color="#6366f1"/>
        </linearGradient>
      </defs>
      <rect x="42" y="42" width="116" height="116" rx="32" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="42" y="42" width="116" height="116" rx="32" fill="url(#igGrad)"/>
      <circle cx="100" cy="100" r="30" fill="none" stroke="#ffffff" stroke-width="9"/>
      <circle cx="132" cy="68" r="6" fill="#ffffff"/>
    `),
  },
  {
    id: "soc-tiktok-note",
    name: "TikTok Music Beat",
    category: "social",
    style: "vector",
    tags: ["tiktok", "music", "video", "dance", "audio", "short"],
    svg: stickerSvg(`
      <rect x="42" y="42" width="116" height="116" rx="28" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="42" y="42" width="116" height="116" rx="28" fill="#010101"/>
      <path d="M118 60 C125 70 135 74 142 75 L142 90 C132 90 122 85 116 80 L116 118 C116 138 100 152 82 148 C68 144 58 130 62 115 C66 100 80 92 96 95 L96 112 C88 110 80 114 78 120 C76 128 82 134 90 134 C98 134 102 128 102 120 L102 52 L118 52 Z" fill="#25f4ee"/>
      <path d="M122 56 C129 66 139 70 146 71 L146 86 C136 86 126 81 120 76 L120 114 C120 134 104 148 86 144 C72 140 62 126 66 111 C70 96 84 88 100 91 L100 108 C92 106 84 110 82 116 C80 124 86 130 94 130 C102 130 106 124 106 116 L106 48 L122 48 Z" fill="#fe2c55"/>
      <path d="M120 58 C127 68 137 72 144 73 L144 88 C134 88 124 83 118 78 L118 116 C118 136 102 150 84 146 C70 142 60 128 64 113 C68 98 82 90 98 93 L98 110 C90 108 82 112 80 118 C78 126 84 132 92 132 C100 132 104 126 104 118 L104 50 L120 50 Z" fill="#ffffff"/>
    `),
  },
  {
    id: "soc-whatsapp-bubble",
    name: "WhatsApp Call Bubble",
    category: "social",
    style: "vector",
    tags: ["whatsapp", "chat", "message", "call", "app"],
    svg: stickerSvg(`
      <path d="M100 35 C64 35 35 64 35 100 C35 114 40 127 48 138 L40 168 L72 159 C80 164 90 166 100 166 C136 166 165 137 165 100 C165 64 136 35 100 35 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M100 35 C64 35 35 64 35 100 C35 114 40 127 48 138 L40 168 L72 159 C80 164 90 166 100 166 C136 166 165 137 165 100 C165 64 136 35 100 35 Z" fill="#25d366"/>
      <path d="M78 72 C75 66 72 66 68 66 C65 66 62 67 60 70 C56 74 48 83 48 98 C48 113 58 127 60 129 C62 131 80 160 110 168 C135 174 140 162 145 158 C150 154 156 142 152 136 C148 130 138 126 132 124 C126 122 122 122 118 128 C114 134 110 138 106 139 C102 140 98 138 92 134 C84 128 72 116 66 104 C62 98 66 94 70 88 C72 84 74 80 72 76 Z" transform="scale(0.85) translate(16,10)" fill="#ffffff"/>
    `),
  },
  {
    id: "soc-discord-bot",
    name: "Discord Gaming Badge",
    category: "social",
    style: "vector",
    tags: ["discord", "community", "gamer", "bot", "chat", "voice"],
    svg: stickerSvg(`
      <rect x="40" y="44" width="120" height="112" rx="30" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="40" y="44" width="120" height="112" rx="30" fill="#5865f2"/>
      <path d="M125 74 C116 70 108 68 100 68 C92 68 84 70 75 74 C62 92 58 110 60 128 C70 135 80 138 90 138 L94 130 C86 128 80 124 74 118 C76 119 78 120 80 121 C92 127 108 127 120 121 C122 120 124 119 126 118 C120 124 114 128 106 130 L110 138 C120 138 130 135 140 128 C142 108 137 92 125 74 Z M85 114 C79 114 74 108 74 102 C74 96 79 90 85 90 C91 90 96 96 96 102 C96 108 91 114 85 114 Z M115 114 C109 114 104 108 104 102 C104 96 109 90 115 90 C121 90 126 96 126 102 C126 108 121 114 115 114 Z" fill="#ffffff"/>
    `),
  },
  {
    id: "soc-spotify-music",
    name: "Spotify Sound Waves",
    category: "social",
    style: "vector",
    tags: ["spotify", "music", "song", "audio", "podcast", "green"],
    svg: stickerSvg(`
      <circle cx="100" cy="100" r="62" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <circle cx="100" cy="100" r="62" fill="#1db954"/>
      <path d="M60 84 C85 75 120 76 142 90" fill="none" stroke="#121212" stroke-width="12" stroke-linecap="round"/>
      <path d="M65 104 C88 96 118 97 136 108" fill="none" stroke="#121212" stroke-width="10" stroke-linecap="round"/>
      <path d="M72 122 C90 116 112 116 128 124" fill="none" stroke="#121212" stroke-width="8" stroke-linecap="round"/>
    `),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. BUSINESS & OFFICE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "biz-approved-stamp",
    name: "APPROVED Rubber Stamp",
    category: "business",
    style: "badge",
    tags: ["approved", "stamp", "pass", "verified", "ok", "legal"],
    svg: stickerSvg(`
      <g transform="rotate(-12 100 100)">
        <rect x="25" y="65" width="150" height="70" rx="8" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
        <rect x="25" y="65" width="150" height="70" rx="8" fill="none" stroke="#dc2626" stroke-width="6"/>
        <rect x="31" y="71" width="138" height="58" rx="4" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="6 3"/>
        <text x="100" y="112" font-family="Arial Black, Impact, sans-serif" font-size="24" font-weight="900" fill="#dc2626" text-anchor="middle" letter-spacing="2">APPROVED</text>
      </g>
    `),
  },
  {
    id: "biz-confidential-stamp",
    name: "CONFIDENTIAL Stamp",
    category: "business",
    style: "badge",
    tags: ["confidential", "secret", "stamp", "private", "nda"],
    svg: stickerSvg(`
      <g transform="rotate(8 100 100)">
        <rect x="18" y="70" width="164" height="60" rx="6" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
        <rect x="18" y="70" width="164" height="60" rx="6" fill="none" stroke="#b91c1c" stroke-width="5"/>
        <text x="100" y="110" font-family="Arial Black, sans-serif" font-size="19" font-weight="900" fill="#b91c1c" text-anchor="middle" letter-spacing="2">CONFIDENTIAL</text>
      </g>
    `),
  },
  {
    id: "biz-yellow-sticky",
    name: "Yellow Sticky Note",
    category: "business",
    style: "vector",
    tags: ["sticky", "postit", "note", "memo", "reminder", "paper"],
    svg: stickerSvg(`
      <polygon points="35,35 165,35 165,135 135,165 35,165" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <polygon points="35,35 165,35 165,135 135,165 35,165" fill="#fef08a"/>
      <polygon points="165,135 135,135 135,165" fill="#ca8a04"/>
      <line x1="50" y1="65" x2="145" y2="65" stroke="#eab308" stroke-width="4" stroke-linecap="round"/>
      <line x1="50" y1="90" x2="135" y2="90" stroke="#eab308" stroke-width="4" stroke-linecap="round"/>
      <line x1="50" y1="115" x2="115" y2="115" stroke="#eab308" stroke-width="4" stroke-linecap="round"/>
    `),
  },
  {
    id: "biz-red-pushpin",
    name: "Red Office Pushpin",
    category: "business",
    style: "3d",
    tags: ["pin", "pushpin", "tack", "board", "mark", "attach"],
    svg: stickerSvg(`
      <polygon points="100,105 100,175 104,175" fill="#cbd5e1" stroke="#ffffff" stroke-width="8"/>
      <ellipse cx="100" cy="55" rx="30" ry="16" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <ellipse cx="100" cy="55" rx="30" ry="16" fill="#dc2626"/>
      <path d="M78 55 C78 72 88 88 88 105 L112 105 C112 88 122 72 122 55 Z" fill="#b91c1c"/>
      <ellipse cx="100" cy="105" rx="14" ry="7" fill="#991b1b"/>
      <ellipse cx="94" cy="50" rx="12" ry="5" fill="#ffffff" opacity="0.6"/>
    `),
  },
  {
    id: "biz-gold-bullion",
    name: "999.9 Gold Bullion Bar",
    category: "business",
    style: "metallic",
    tags: ["gold", "bar", "bullion", "money", "wealth", "bank"],
    svg: stickerSvg(`
      <polygon points="40,135 160,135 178,92 22,92" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <polygon points="40,135 160,135 178,92 22,92" fill="#d97706"/>
      <polygon points="35,92 165,92 145,55 55,55" fill="#fbbf24"/>
      <polygon points="160,135 178,92 145,55 125,98" fill="#b45309"/>
      <text x="100" y="80" font-size="12" font-weight="900" fill="#78350f" text-anchor="middle" letter-spacing="1">999.9 FINE GOLD</text>
    `),
  },
  {
    id: "biz-leather-briefcase",
    name: "Executive Leather Briefcase",
    category: "business",
    style: "3d",
    tags: ["briefcase", "work", "job", "office", "leather", "boss"],
    svg: stickerSvg(`
      <rect x="36" y="70" width="128" height="90" rx="14" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="36" y="70" width="128" height="90" rx="14" fill="#78350f"/>
      <path d="M72 70 L72 48 C72 40 82 34 92 34 L108 34 C118 34 128 40 128 48 L128 70" fill="none" stroke="#522504" stroke-width="8"/>
      <path d="M36 105 L164 105" stroke="#92400e" stroke-width="4"/>
      <rect x="68" y="98" width="14" height="18" rx="2" fill="#fbbf24"/>
      <rect x="118" y="98" width="14" height="18" rx="2" fill="#fbbf24"/>
      <rect x="92" y="98" width="16" height="14" rx="2" fill="#d97706"/>
    `),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. MARKETING & BADGES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "mkt-sale-50",
    name: "50% OFF Starburst Badge",
    category: "marketing",
    style: "badge",
    tags: ["sale", "50", "off", "discount", "promo", "deal"],
    svg: stickerSvg(`
      <polygon points="100,18 116,42 142,34 146,62 174,68 160,94 178,118 152,128 154,156 126,150 116,176 94,160 76,176 66,150 38,156 40,128 14,118 32,94 18,68 46,62 50,34 76,42" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <polygon points="100,18 116,42 142,34 146,62 174,68 160,94 178,118 152,128 154,156 126,150 116,176 94,160 76,176 66,150 38,156 40,128 14,118 32,94 18,68 46,62 50,34 76,42" fill="#dc2626"/>
      <text x="100" y="94" font-family="Arial Black, Impact, sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">50%</text>
      <text x="100" y="124" font-family="Arial Black, sans-serif" font-size="20" font-weight="900" fill="#facc15" text-anchor="middle" letter-spacing="2">OFF</text>
    `),
  },
  {
    id: "mkt-best-seller",
    name: "Best Seller Gold Ribbon",
    category: "marketing",
    style: "badge",
    tags: ["bestseller", "ribbon", "top", "rank", "badge", "gold"],
    svg: stickerSvg(`
      <polygon points="68,125 50,175 80,165 92,175 82,125" fill="#1d4ed8"/>
      <polygon points="132,125 150,175 120,165 108,175 118,125" fill="#1e40af"/>
      <circle cx="100" cy="85" r="48" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <circle cx="100" cy="85" r="48" fill="#f59e0b"/>
      <circle cx="100" cy="85" r="40" fill="none" stroke="#fde68a" stroke-width="3" stroke-dasharray="5 3"/>
      <text x="100" y="78" font-size="12" font-weight="900" fill="#78350f" text-anchor="middle">BEST</text>
      <text x="100" y="98" font-size="12" font-weight="900" fill="#78350f" text-anchor="middle">SELLER</text>
    `),
  },
  {
    id: "mkt-limited-edition",
    name: "Limited Edition Tag",
    category: "marketing",
    style: "badge",
    tags: ["limited", "edition", "rare", "exclusive", "tag"],
    svg: stickerSvg(`
      <rect x="25" y="68" width="150" height="64" rx="14" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="25" y="68" width="150" height="64" rx="14" fill="#0f172a"/>
      <rect x="30" y="73" width="140" height="54" rx="10" fill="none" stroke="#f59e0b" stroke-width="2"/>
      <text x="100" y="94" font-size="12" font-weight="900" fill="#facc15" text-anchor="middle" letter-spacing="3">LIMITED</text>
      <text x="100" y="114" font-size="13" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">EDITION</text>
    `),
  },
  {
    id: "mkt-verified-check",
    name: "Verified Check Blue Badge",
    category: "marketing",
    style: "vector",
    tags: ["verified", "check", "badge", "trust", "authentic"],
    svg: stickerSvg(`
      <polygon points="100,26 116,38 136,34 144,52 164,60 162,80 176,96 164,112 170,132 150,140 144,160 124,158 110,174 94,164 74,172 66,154 46,154 44,134 28,126 36,108 26,90 42,78 40,58 60,56 68,36 86,42" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <polygon points="100,26 116,38 136,34 144,52 164,60 162,80 176,96 164,112 170,132 150,140 144,160 124,158 110,174 94,164 74,172 66,154 46,154 44,134 28,126 36,108 26,90 42,78 40,58 60,56 68,36 86,42" fill="#0284c7"/>
      <polyline points="72,102 92,122 134,76" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    `),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. FOOD & RESTAURANT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "food-pizza-slice",
    name: "Pepperoni Pizza Slice",
    category: "food",
    style: "3d",
    tags: ["pizza", "slice", "cheese", "pepperoni", "fastfood", "snack"],
    svg: stickerSvg(`
      <path d="M100 24 L168 148 C144 164 100 172 32 148 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M100 24 L168 148 C144 164 100 172 32 148 Z" fill="#f59e0b"/>
      <path d="M32 148 C100 172 144 164 168 148" fill="none" stroke="#b45309" stroke-width="14" stroke-linecap="round"/>
      <circle cx="85" cy="95" r="12" fill="#dc2626"/>
      <circle cx="125" cy="120" r="12" fill="#dc2626"/>
      <circle cx="104" cy="65" r="9" fill="#dc2626"/>
      <circle cx="68" cy="135" r="10" fill="#dc2626"/>
      <circle cx="95" cy="130" r="5" fill="#16a34a"/>
      <circle cx="118" cy="85" r="4" fill="#16a34a"/>
    `),
  },
  {
    id: "food-cheeseburger",
    name: "Juicy Cheeseburger",
    category: "food",
    style: "3d",
    tags: ["burger", "cheeseburger", "beef", "snack", "meal", "food"],
    svg: stickerSvg(`
      <g>
        <path d="M45 80 C45 45 155 45 155 80 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
        <path d="M45 80 C45 45 155 45 155 80 Z" fill="#f59e0b"/>
        <ellipse cx="80" cy="55" rx="3" ry="2" fill="#ffffff"/>
        <ellipse cx="110" cy="52" rx="3" ry="2" fill="#ffffff"/>
        <ellipse cx="125" cy="65" rx="3" ry="2" fill="#ffffff"/>
        <path d="M40 85 Q 70 95 100 85 Q 130 95 160 85" stroke="#16a34a" stroke-width="10" fill="none" stroke-linecap="round"/>
        <polygon points="45,95 155,95 140,112 60,112" fill="#facc15"/>
        <rect x="42" y="105" width="116" height="20" rx="6" fill="#78350f"/>
        <rect x="45" y="125" width="110" height="22" rx="10" fill="#f59e0b"/>
      </g>
    `),
  },
  {
    id: "food-donut-sprinkles",
    name: "Glazed Pink Donut",
    category: "food",
    style: "3d",
    tags: ["donut", "doughnut", "sweet", "pink", "sprinkles", "dessert"],
    svg: stickerSvg(`
      <circle cx="100" cy="100" r="62" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <circle cx="100" cy="100" r="62" fill="#f59e0b"/>
      <path d="M100 42 C132 42 158 68 158 100 C158 132 132 158 100 158 C68 158 42 132 42 100 C42 68 68 42 100 42 Z" fill="#ec4899"/>
      <circle cx="100" cy="100" r="22" fill="#ffffff"/>
      <rect x="70" y="60" width="8" height="4" rx="2" fill="#38bdf8"/>
      <rect x="120" y="65" width="8" height="4" rx="2" fill="#facc15"/>
      <rect x="135" y="100" width="8" height="4" rx="2" fill="#22c55e"/>
      <rect x="115" y="135" width="8" height="4" rx="2" fill="#ffffff"/>
      <rect x="65" y="125" width="8" height="4" rx="2" fill="#a855f7"/>
      <rect x="55" y="90" width="8" height="4" rx="2" fill="#f97316"/>
    `),
  },
  {
    id: "food-coffee-cup",
    name: "Cafe Coffee To-Go",
    category: "food",
    style: "vector",
    tags: ["coffee", "cup", "latte", "morning", "drink", "cafe"],
    svg: stickerSvg(`
      <path d="M55 70 L65 160 C65 168 74 174 84 174 L116 174 C126 174 135 168 135 160 L145 70 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M55 70 L65 160 C65 168 74 174 84 174 L116 174 C126 174 135 168 135 160 L145 70 Z" fill="#f8fafc"/>
      <rect x="50" y="55" width="100" height="18" rx="4" fill="#0f172a"/>
      <rect x="60" y="95" width="80" height="45" rx="3" fill="#b45309"/>
      <circle cx="100" cy="118" r="14" fill="#fde68a"/>
      <path d="M85 45 Q 92 32 85 22" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
      <path d="M100 45 Q 107 30 100 18" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
      <path d="M115 45 Q 122 32 115 22" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
    `),
  },
  {
    id: "food-taco-lime",
    name: "Crispy Mexican Taco",
    category: "food",
    style: "3d",
    tags: ["taco", "mexican", "lime", "crispy", "snack"],
    svg: stickerSvg(`
      <path d="M35 145 C35 70 165 70 165 145 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M35 145 C35 70 165 70 165 145 Z" fill="#facc15"/>
      <path d="M45 130 C45 80 155 80 155 130 Z" fill="#78350f"/>
      <circle cx="70" cy="105" r="8" fill="#dc2626"/>
      <circle cx="100" cy="95" r="8" fill="#dc2626"/>
      <circle cx="130" cy="105" r="8" fill="#dc2626"/>
      <path d="M55 110 Q 80 85 105 110 Q 130 85 145 110" fill="none" stroke="#22c55e" stroke-width="8" stroke-linecap="round"/>
    `),
  },
  {
    id: "food-boba-tea",
    name: "Boba Milk Tea with Tapioca",
    category: "food",
    style: "3d",
    tags: ["boba", "tea", "milktea", "tapioca", "drink", "sweet"],
    svg: stickerSvg(`
      <rect x="94" y="20" width="12" height="60" rx="3" fill="#a855f7" transform="rotate(-10 100 50)"/>
      <path d="M60 65 L68 165 C68 174 78 180 88 180 L112 180 C122 180 132 174 132 165 L140 65 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M60 65 L68 165 C68 174 78 180 88 180 L112 180 C122 180 132 174 132 165 L140 65 Z" fill="#fed7aa"/>
      <ellipse cx="100" cy="65" rx="40" ry="12" fill="#ffffff"/>
      <circle cx="82" cy="155" r="7" fill="#292524"/>
      <circle cx="100" cy="160" r="7" fill="#292524"/>
      <circle cx="118" cy="155" r="7" fill="#292524"/>
      <circle cx="92" cy="142" r="7" fill="#292524"/>
      <circle cx="110" cy="140" r="7" fill="#292524"/>
    `),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. TECH & GADGETS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tech-macbook",
    name: "MacBook Laptop Pro",
    category: "technology",
    style: "3d",
    tags: ["laptop", "macbook", "computer", "apple", "code", "work"],
    svg: stickerSvg(`
      <rect x="42" y="45" width="116" height="78" rx="8" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="42" y="45" width="116" height="78" rx="8" fill="#0f172a"/>
      <rect x="48" y="51" width="104" height="66" rx="4" fill="#0284c7"/>
      <path d="M22 125 L178 125 C178 135 170 145 158 145 L42 145 C30 145 22 135 22 125 Z" fill="#94a3b8" stroke="#ffffff" stroke-width="8"/>
      <rect x="85" y="125" width="30" height="4" rx="2" fill="#64748b"/>
    `),
  },
  {
    id: "tech-iphone",
    name: "iPhone Smartphone",
    category: "technology",
    style: "3d",
    tags: ["iphone", "phone", "mobile", "ios", "gadget", "cell"],
    svg: stickerSvg(`
      <rect x="58" y="25" width="84" height="150" rx="22" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="58" y="25" width="84" height="150" rx="22" fill="#18181b"/>
      <rect x="63" y="32" width="74" height="136" rx="16" fill="#06b6d4"/>
      <rect x="84" y="36" width="32" height="9" rx="4" fill="#000000"/>
    `),
  },
  {
    id: "tech-airpods",
    name: "AirPods Wireless Case",
    category: "technology",
    style: "3d",
    tags: ["airpods", "earbuds", "audio", "music", "apple", "sound"],
    svg: stickerSvg(`
      <rect x="52" y="65" width="96" height="85" rx="24" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="52" y="65" width="96" height="85" rx="24" fill="#f8fafc"/>
      <line x1="52" y1="92" x2="148" y2="92" stroke="#cbd5e1" stroke-width="2"/>
      <circle cx="100" cy="115" r="3" fill="#22c55e"/>
    `),
  },
  {
    id: "tech-gameboy-retro",
    name: "Retro Game Boy Handheld",
    category: "technology",
    style: "vector",
    tags: ["gameboy", "retro", "90s", "nintendo", "pixel", "arcade"],
    svg: stickerSvg(`
      <rect x="48" y="30" width="104" height="145" rx="16" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="48" y="30" width="104" height="145" rx="16" fill="#cbd5e1"/>
      <rect x="62" y="44" width="76" height="58" rx="8" fill="#64748b"/>
      <rect x="72" y="52" width="56" height="42" rx="4" fill="#84cc16"/>
      <polygon points="76,125 84,125 84,117 90,117 90,125 98,125 98,131 90,131 90,139 84,139 84,131 76,131" fill="#334155"/>
      <circle cx="132" cy="122" r="7" fill="#a855f7"/>
      <circle cx="118" cy="132" r="7" fill="#a855f7"/>
    `),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. GAMING
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "game-controller",
    name: "PlayStation Gamepad",
    category: "gaming",
    style: "3d",
    tags: ["gamepad", "playstation", "controller", "gamer", "ps5", "play"],
    svg: stickerSvg(`
      <path d="M45 135 C32 110 35 75 60 70 C80 65 92 78 100 80 C108 78 120 65 140 70 C165 75 168 110 155 135 C148 150 135 145 125 125 C115 115 108 118 100 118 C92 118 85 115 75 125 C65 145 52 150 45 135 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M45 135 C32 110 35 75 60 70 C80 65 92 78 100 80 C108 78 120 65 140 70 C165 75 168 110 155 135 C148 150 135 145 125 125 C115 115 108 118 100 118 C92 118 85 115 75 125 C65 145 52 150 45 135 Z" fill="#0f172a"/>
      <circle cx="70" cy="98" r="7" fill="#38bdf8"/>
      <circle cx="130" cy="92" r="6" fill="#f43f5e"/>
      <circle cx="142" cy="104" r="6" fill="#10b981"/>
      <circle cx="120" cy="104" r="6" fill="#f59e0b"/>
      <circle cx="132" cy="116" r="6" fill="#3b82f6"/>
    `),
  },
  {
    id: "game-health-potion",
    name: "Red Health Potion Flask",
    category: "gaming",
    style: "3d",
    tags: ["potion", "health", "flask", "rpg", "magic", "heal"],
    svg: stickerSvg(`
      <rect x="90" y="32" width="20" height="18" rx="2" fill="#78350f"/>
      <circle cx="100" cy="115" r="50" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <circle cx="100" cy="115" r="50" fill="#e0f2fe"/>
      <path d="M60 115 C60 145 80 160 100 160 C120 160 140 145 140 115 C140 95 120 105 100 105 C80 105 60 95 60 115 Z" fill="#ef4444"/>
      <circle cx="85" cy="130" r="5" fill="#ffffff" opacity="0.6"/>
    `),
  },
  {
    id: "game-pixel-heart",
    name: "8-Bit Retro Pixel Heart",
    category: "gaming",
    style: "vector",
    tags: ["heart", "pixel", "8bit", "retro", "arcade", "life"],
    svg: stickerSvg(`
      <path d="M50 60 H75 V45 H100 V60 H125 V45 H150 V60 H165 V95 H150 V115 H135 V135 H115 V155 H85 V135 H65 V115 H50 V95 H35 V60 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M50 60 H75 V45 H100 V60 H125 V45 H150 V60 H165 V95 H150 V115 H135 V135 H115 V155 H85 V135 H65 V115 H50 V95 H35 V60 Z" fill="#dc2626"/>
      <rect x="55" y="65" width="16" height="16" fill="#ffffff" opacity="0.7"/>
    `),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. CELEBRATION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "cel-birthday-cake",
    name: "Celebration Birthday Cake",
    category: "celebration",
    style: "3d",
    tags: ["cake", "birthday", "candles", "party", "sweet", "celebrate"],
    svg: stickerSvg(`
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
    `),
  },
  {
    id: "cel-party-popper",
    name: "Party Confetti Popper",
    category: "celebration",
    style: "3d",
    tags: ["party", "popper", "confetti", "cheer", "congrats", "fun"],
    svg: stickerSvg(`
      <polygon points="40,165 75,80 150,145" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <polygon points="40,165 75,80 150,145" fill="#f43f5e"/>
      <circle cx="120" cy="65" r="7" fill="#facc15"/>
      <circle cx="152" cy="85" r="8" fill="#06b6d4"/>
      <circle cx="145" cy="45" r="6" fill="#a855f7"/>
      <circle cx="95" cy="45" r="7" fill="#10b981"/>
      <path d="M125 55 Q 150 35 170 48" fill="none" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
    `),
  },
  {
    id: "cel-gift-box",
    name: "Red Satin Gift Box",
    category: "celebration",
    style: "3d",
    tags: ["gift", "present", "box", "ribbon", "surprise", "bow"],
    svg: stickerSvg(`
      <rect x="42" y="80" width="116" height="85" rx="8" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="42" y="80" width="116" height="85" rx="8" fill="#dc2626"/>
      <rect x="36" y="68" width="128" height="24" rx="6" fill="#ef4444"/>
      <rect x="92" y="68" width="16" height="97" fill="#fbbf24"/>
      <rect x="42" y="112" width="116" height="16" fill="#fbbf24"/>
      <ellipse cx="80" cy="55" rx="16" ry="10" transform="rotate(-30 80 55)" fill="#f59e0b"/>
      <ellipse cx="120" cy="55" rx="16" ry="10" transform="rotate(30 120 55)" fill="#f59e0b"/>
    `),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. LOVE & ROMANCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "love-ruby-heart",
    name: "Glossy Red Heart",
    category: "love",
    style: "3d",
    tags: ["heart", "love", "romance", "valentines", "like"],
    svg: stickerSvg(`
      <path d="M100 168 C60 138 32 110 32 80 C32 54 52 36 78 36 C90 36 98 42 100 48 C102 42 110 36 122 36 C148 36 168 54 168 80 C168 110 140 138 100 168 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M100 168 C60 138 32 110 32 80 C32 54 52 36 78 36 C90 36 98 42 100 48 C102 42 110 36 122 36 C148 36 168 54 168 80 C168 110 140 138 100 168 Z" fill="#e11d48"/>
      <ellipse cx="68" cy="62" rx="14" ry="8" transform="rotate(-35 68 62)" fill="#ffffff" opacity="0.6"/>
    `),
  },
  {
    id: "love-cupid-arrow",
    name: "Heart with Cupid's Arrow",
    category: "love",
    style: "3d",
    tags: ["cupid", "arrow", "heart", "love", "shot"],
    svg: stickerSvg(`
      <path d="M100 155 C70 130 45 105 45 78 C45 55 62 40 85 40 C95 40 100 45 100 50 C100 45 105 40 115 40 C138 40 155 55 155 78 C155 105 130 130 100 155 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M100 155 C70 130 45 105 45 78 C45 55 62 40 85 40 C95 40 100 45 100 50 C100 45 105 40 115 40 C138 40 155 55 155 78 C155 105 130 130 100 155 Z" fill="#e11d48"/>
      <line x1="25" y1="135" x2="175" y2="45" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
      <line x1="25" y1="135" x2="175" y2="45" stroke="#facc15" stroke-width="6" stroke-linecap="round"/>
      <polygon points="175,45 160,48 168,60" fill="#facc15"/>
    `),
  },
  {
    id: "love-letter-wax",
    name: "Love Letter Envelope",
    category: "love",
    style: "vector",
    tags: ["envelope", "letter", "wax", "seal", "mail", "romance"],
    svg: stickerSvg(`
      <rect x="36" y="55" width="128" height="90" rx="8" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="36" y="55" width="128" height="90" rx="8" fill="#f8fafc"/>
      <polygon points="36,55 100,105 164,55" fill="#f1f5f9"/>
      <circle cx="100" cy="100" r="14" fill="#dc2626"/>
      <path d="M100 105 C96 100 93 96 93 93 C93 90 95 88 98 88 C99 88 100 89 100 90 C100 89 101 88 102 88 C105 88 107 90 107 93 C107 96 104 100 100 105 Z" fill="#ffffff"/>
    `),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. TRAVEL & ADVENTURE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "trv-sky-airplane",
    name: "Jetliner Passenger Plane",
    category: "travel",
    style: "vector",
    tags: ["airplane", "plane", "travel", "flight", "trip", "fly"],
    svg: stickerSvg(`
      <path d="M100 25 L115 85 L175 110 L175 125 L115 115 L115 155 L132 170 L132 180 L100 172 L68 180 L68 170 L85 155 L85 115 L25 125 L25 110 L85 85 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M100 25 L115 85 L175 110 L175 125 L115 115 L115 155 L132 170 L132 180 L100 172 L68 180 L68 170 L85 155 L85 115 L25 125 L25 110 L85 85 Z" fill="#38bdf8"/>
      <circle cx="100" cy="55" r="5" fill="#ffffff"/>
    `),
  },
  {
    id: "trv-vintage-luggage",
    name: "Vintage Travel Suitcase",
    category: "travel",
    style: "3d",
    tags: ["suitcase", "luggage", "vacation", "trip", "bag"],
    svg: stickerSvg(`
      <rect x="42" y="70" width="116" height="85" rx="10" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="42" y="70" width="116" height="85" rx="10" fill="#d97706"/>
      <path d="M78 70 L78 52 C78 46 86 40 94 40 L106 40 C114 40 122 46 122 52 L122 70" fill="none" stroke="#78350f" stroke-width="8"/>
      <rect x="62" y="70" width="12" height="85" fill="#78350f"/>
      <rect x="126" y="70" width="12" height="85" fill="#78350f"/>
      <circle cx="95" cy="115" r="14" fill="#0284c7"/>
    `),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 11. ANIMALS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ani-corgi-dog",
    name: "Happy Corgi Dog",
    category: "animals",
    style: "vector",
    tags: ["dog", "corgi", "puppy", "pet", "animal", "cute"],
    svg: stickerSvg(`
      <polygon points="55,30 85,75 40,80" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>
      <polygon points="145,30 115,75 160,80" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>
      <polygon points="55,30 85,75 40,80" fill="#f59e0b"/>
      <polygon points="145,30 115,75 160,80" fill="#f59e0b"/>
      <ellipse cx="100" cy="110" rx="55" ry="48" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <ellipse cx="100" cy="110" rx="55" ry="48" fill="#f59e0b"/>
      <path d="M85 85 C85 85 92 120 100 120 C108 120 115 85 115 85 C135 105 135 140 100 150 C65 140 65 105 85 85 Z" fill="#ffffff"/>
      <circle cx="78" cy="100" r="6" fill="#000000"/>
      <circle cx="122" cy="100" r="6" fill="#000000"/>
      <ellipse cx="100" cy="120" rx="8" ry="6" fill="#000000"/>
      <path d="M100 126 C100 138 92 144 100 144 C108 144 100 138 100 126 Z" fill="#f43f5e"/>
    `),
  },
  {
    id: "ani-panda-bear",
    name: "Panda Bear Face",
    category: "animals",
    style: "vector",
    tags: ["panda", "bear", "cute", "animal", "bamboo"],
    svg: stickerSvg(`
      <circle cx="60" cy="65" r="20" fill="#ffffff" stroke="#ffffff" stroke-width="8"/>
      <circle cx="140" cy="65" r="20" fill="#ffffff" stroke="#ffffff" stroke-width="8"/>
      <circle cx="60" cy="65" r="20" fill="#0f172a"/>
      <circle cx="140" cy="65" r="20" fill="#0f172a"/>
      <circle cx="100" cy="112" r="54" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <circle cx="100" cy="112" r="54" fill="#f8fafc"/>
      <ellipse cx="78" cy="105" rx="14" ry="18" transform="rotate(-15 78 105)" fill="#0f172a"/>
      <ellipse cx="122" cy="105" rx="14" ry="18" transform="rotate(15 122 105)" fill="#0f172a"/>
      <circle cx="80" cy="102" r="4" fill="#ffffff"/>
      <circle cx="120" cy="102" r="4" fill="#ffffff"/>
      <ellipse cx="100" cy="128" rx="8" ry="5" fill="#0f172a"/>
    `),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 12. NATURE & PLANTS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "nat-monstera",
    name: "Tropical Monstera Leaf",
    category: "nature",
    style: "vector",
    tags: ["monstera", "leaf", "plant", "tropical", "nature", "botanical"],
    svg: stickerSvg(`
      <path d="M100 25 C155 45 168 120 100 175 C32 120 45 45 100 25 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M100 25 C155 45 168 120 100 175 C32 120 45 45 100 25 Z" fill="#15803d"/>
      <line x1="100" y1="35" x2="100" y2="182" stroke="#166534" stroke-width="6"/>
      <path d="M100 75 Q 138 65 148 80" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.6"/>
      <path d="M100 115 Q 140 110 145 128" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.6"/>
      <path d="M100 75 Q 62 65 52 80" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.6"/>
      <path d="M100 115 Q 60 110 55 128" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.6"/>
    `),
  },
  {
    id: "nat-sakura-bloom",
    name: "Pink Cherry Blossom",
    category: "nature",
    style: "3d",
    tags: ["flower", "sakura", "cherry", "blossom", "spring", "flora"],
    svg: stickerSvg(`
      <g>
        <circle cx="100" cy="100" r="16" fill="#facc15"/>
        <path d="M100 84 C85 45 115 45 100 84 Z M116 100 C155 85 155 115 116 100 Z M100 116 C115 155 85 155 100 116 Z M84 100 C45 115 45 85 84 100 Z" fill="#ffffff" stroke="#ffffff" stroke-width="14" stroke-linejoin="round"/>
        <circle cx="100" cy="55" r="22" fill="#fbcfe8"/>
        <circle cx="145" cy="100" r="22" fill="#fbcfe8"/>
        <circle cx="100" cy="145" r="22" fill="#fbcfe8"/>
        <circle cx="55" cy="100" r="22" fill="#fbcfe8"/>
        <circle cx="100" cy="100" r="16" fill="#f43f5e"/>
        <circle cx="100" cy="100" r="8" fill="#fef08a"/>
      </g>
    `),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 13. EMOJI
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "emj-heart-eyes",
    name: "Heart Eyes Smiley Emoji",
    category: "emoji",
    style: "emoji",
    tags: ["emoji", "heart", "eyes", "love", "smile", "happy"],
    svg: stickerSvg(`
      <circle cx="100" cy="100" r="64" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <circle cx="100" cy="100" r="64" fill="#facc15"/>
      <path d="M72 128 C80 148 120 148 128 128 Z" fill="#78350f"/>
      <path d="M68 65 C60 55 48 62 56 78 L68 90 L80 78 C88 62 76 55 68 65 Z" fill="#dc2626"/>
      <path d="M132 65 C124 55 112 62 120 78 L132 90 L144 78 C152 62 140 55 132 65 Z" fill="#dc2626"/>
    `),
  },
  {
    id: "emj-sunglasses-cool",
    name: "Cool Sunglasses Emoji",
    category: "emoji",
    style: "emoji",
    tags: ["cool", "sunglasses", "shades", "emoji", "smile"],
    svg: stickerSvg(`
      <circle cx="100" cy="100" r="64" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <circle cx="100" cy="100" r="64" fill="#facc15"/>
      <path d="M48 82 C52 70 76 70 82 82 L118 82 C124 70 148 70 152 82 L146 104 C140 114 126 114 120 104 L100 95 L80 104 C74 114 60 114 54 104 Z" fill="#0f172a"/>
      <path d="M78 128 C88 144 112 144 122 128" fill="none" stroke="#78350f" stroke-width="6" stroke-linecap="round"/>
    `),
  },
  {
    id: "emj-tears-of-joy",
    name: "Laughing Tears of Joy",
    category: "emoji",
    style: "emoji",
    tags: ["laugh", "tears", "joy", "lol", "crying", "funny"],
    svg: stickerSvg(`
      <circle cx="100" cy="100" r="64" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <circle cx="100" cy="100" r="64" fill="#facc15"/>
      <path d="M68 85 Q 82 72 96 85" fill="none" stroke="#78350f" stroke-width="6" stroke-linecap="round"/>
      <path d="M104 85 Q 118 72 132 85" fill="none" stroke="#78350f" stroke-width="6" stroke-linecap="round"/>
      <path d="M68 118 C78 152 122 152 132 118 Z" fill="#78350f"/>
      <ellipse cx="48" cy="98" rx="12" ry="8" fill="#38bdf8"/>
      <ellipse cx="152" cy="98" rx="12" ry="8" fill="#38bdf8"/>
    `),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 14. ARROWS & POINTERS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "arr-red-marker",
    name: "Red Marker Arrow",
    category: "arrows",
    style: "vector",
    tags: ["arrow", "red", "marker", "pointer", "direction", "right"],
    svg: stickerSvg(`
      <path d="M42 100 L126 100 M102 68 L148 100 L102 132" fill="none" stroke="#ffffff" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M42 100 L126 100 M102 68 L148 100 L102 132" fill="none" stroke="#dc2626" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
    `),
  },
  {
    id: "arr-curved-cyan",
    name: "Curved Neon Cyan Arrow",
    category: "arrows",
    style: "vector",
    tags: ["arrow", "cyan", "curved", "turn", "loop", "neon"],
    svg: stickerSvg(`
      <path d="M55 145 C55 85 95 65 145 65 M125 45 L155 65 L125 85" fill="none" stroke="#ffffff" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M55 145 C55 85 95 65 145 65 M125 45 L155 65 L125 85" fill="none" stroke="#06b6d4" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
    `),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 15. DOODLES & OFFICE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "dood-washi-tape",
    name: "Pastel Mint Washi Tape",
    category: "doodles",
    style: "doodle",
    tags: ["tape", "washi", "strip", "scrapbook", "craft"],
    svg: stickerSvg(`
      <polygon points="30,78 170,72 166,122 26,128" fill="#ffffff" stroke="#ffffff" stroke-width="8"/>
      <polygon points="30,78 170,72 166,122 26,128" fill="#6ee7b7" opacity="0.85"/>
      <line x1="30" y1="78" x2="35" y2="128" stroke="#059669" stroke-width="2" stroke-dasharray="3 3"/>
      <line x1="166" y1="72" x2="162" y2="122" stroke="#059669" stroke-width="2" stroke-dasharray="3 3"/>
    `),
  },
  {
    id: "dood-highlighter-swash",
    name: "Neon Yellow Highlighter",
    category: "doodles",
    style: "doodle",
    tags: ["highlighter", "marker", "swash", "yellow", "accent"],
    svg: stickerSvg(`
      <path d="M35 105 Q 100 95 165 102" fill="none" stroke="#fef08a" stroke-width="26" stroke-linecap="square"/>
      <path d="M38 103 Q 100 96 162 100" fill="none" stroke="#facc15" stroke-width="16" stroke-linecap="square"/>
    `),
  },
  {
    id: "dood-paperclip",
    name: "Metallic Wire Paperclip",
    category: "doodles",
    style: "vector",
    tags: ["paperclip", "clip", "office", "wire", "stationery"],
    svg: stickerSvg(`
      <g transform="rotate(35 100 100)">
        <path d="M85 145 L85 65 C85 52 95 42 108 42 C120 42 130 52 130 65 L130 145 C130 162 115 175 98 175 C80 175 66 162 66 145 L66 85 C66 75 74 68 84 68 C94 68 102 75 102 85 L102 135" fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round"/>
        <path d="M85 145 L85 65 C85 52 95 42 108 42 C120 42 130 52 130 65 L130 145 C130 162 115 175 98 175 C80 175 66 162 66 145 L66 85 C66 75 74 68 84 68 C94 68 102 75 102 85 L102 135" fill="none" stroke="#94a3b8" stroke-width="9" stroke-linecap="round"/>
      </g>
    `),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 16. DECORATIVE & FOILS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "dec-gold-wax-seal",
    name: "Fleur-De-Lis Wax Seal",
    category: "decorative",
    style: "metallic",
    tags: ["seal", "wax", "gold", "royal", "stamp", "vintage"],
    svg: stickerSvg(`
      <circle cx="100" cy="100" r="62" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <circle cx="100" cy="100" r="62" fill="#b45309"/>
      <circle cx="100" cy="100" r="50" fill="#f59e0b"/>
      <path d="M100 68 C95 80 82 85 82 92 C82 98 90 102 96 100 C92 108 85 116 100 132 C115 116 108 108 104 100 C110 102 118 98 118 92 C118 85 105 80 100 68 Z" fill="#78350f"/>
    `),
  },
  {
    id: "dec-laurel-wreath",
    name: "Golden Laurel Victory Wreath",
    category: "decorative",
    style: "metallic",
    tags: ["laurel", "wreath", "victory", "winner", "gold", "honor"],
    svg: stickerSvg(`
      <path d="M70 50 C55 70 50 110 75 145 C85 160 98 165 100 165 C102 165 115 160 125 145 C150 110 145 70 130 50" fill="none" stroke="#ffffff" stroke-width="16"/>
      <path d="M70 50 C55 70 50 110 75 145 C85 160 98 165 100 165 C102 165 115 160 125 145 C150 110 145 70 130 50" fill="none" stroke="#eab308" stroke-width="6"/>
      <ellipse cx="58" cy="72" rx="10" ry="6" transform="rotate(-30 58 72)" fill="#facc15"/>
      <ellipse cx="52" cy="100" rx="10" ry="6" transform="rotate(-15 52 100)" fill="#facc15"/>
      <ellipse cx="60" cy="128" rx="10" ry="6" transform="rotate(15 60 128)" fill="#facc15"/>
      <ellipse cx="142" cy="72" rx="10" ry="6" transform="rotate(30 142 72)" fill="#facc15"/>
      <ellipse cx="148" cy="100" rx="10" ry="6" transform="rotate(15 148 100)" fill="#facc15"/>
      <ellipse cx="140" cy="128" rx="10" ry="6" transform="rotate(-15 140 128)" fill="#facc15"/>
    `),
  },
  {
    id: "dec-barcode-label",
    name: "Authentic Product Barcode",
    category: "decorative",
    style: "vector",
    tags: ["barcode", "label", "serial", "scan", "code", "retail"],
    svg: stickerSvg(`
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
    `),
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // 17. EDUCATION & SCIENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "edu-grad-cap",
    name: "Graduation Cap & Tassel",
    category: "education",
    style: "3d",
    tags: ["graduation", "cap", "degree", "school", "university", "academic"],
    svg: stickerSvg(`
      <polygon points="100,42 174,78 100,114 26,78" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <polygon points="100,42 174,78 100,114 26,78" fill="#1e1b4b"/>
      <path d="M52 94 L52 135 C52 152 74 164 100 164 C126 164 148 152 148 135 L148 94" fill="#312e81" stroke="#ffffff" stroke-width="8"/>
      <line x1="150" y1="86" x2="164" y2="128" stroke="#facc15" stroke-width="6" stroke-linecap="round"/>
      <circle cx="164" cy="132" r="6" fill="#f59e0b"/>
      <circle cx="100" cy="78" r="5" fill="#facc15"/>
    `),
  },
  {
    id: "edu-books-stack",
    name: "Hardcover Books Stack",
    category: "education",
    style: "vector",
    tags: ["books", "study", "library", "reading", "learn", "stack"],
    svg: stickerSvg(`
      <rect x="40" y="125" width="120" height="28" rx="6" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>
      <rect x="40" y="125" width="120" height="28" rx="6" fill="#dc2626"/>
      <rect x="48" y="130" width="108" height="18" rx="3" fill="#fef2f2"/>
      <rect x="45" y="92" width="112" height="28" rx="6" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>
      <rect x="45" y="92" width="112" height="28" rx="6" fill="#0284c7"/>
      <rect x="52" y="97" width="100" height="18" rx="3" fill="#f0f9ff"/>
      <rect x="52" y="60" width="98" height="28" rx="6" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>
      <rect x="52" y="60" width="98" height="28" rx="6" fill="#16a34a"/>
      <rect x="58" y="65" width="88" height="18" rx="3" fill="#f0fdf4"/>
    `),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 18. EVENTS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "ev-vip-ticket",
    name: "Golden VIP Event Ticket",
    category: "events",
    style: "metallic",
    tags: ["ticket", "vip", "event", "concert", "pass", "cinema"],
    svg: stickerSvg(`
      <path d="M30 65 L170 65 L170 94 C158 94 150 102 150 112 C150 122 158 130 170 130 L170 160 L30 160 L30 130 C42 130 50 122 50 112 C50 102 42 94 30 94 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M30 65 L170 65 L170 94 C158 94 150 102 150 112 C150 122 158 130 170 130 L170 160 L30 160 L30 130 C42 130 50 122 50 112 C50 102 42 94 30 94 Z" fill="#7c3aed"/>
      <line x1="82" y1="70" x2="82" y2="155" stroke="#ffffff" stroke-width="3" stroke-dasharray="6 4"/>
      <text x="126" y="122" font-family="Arial Black, Impact, sans-serif" font-size="28" font-weight="900" fill="#facc15" text-anchor="middle">VIP</text>
      <circle cx="56" cy="112" r="12" fill="#facc15"/>
    `),
  },
  {
    id: "ev-clapperboard",
    name: "Director Clapperboard",
    category: "events",
    style: "vector",
    tags: ["clapperboard", "film", "cinema", "action", "movie", "hollywood"],
    svg: stickerSvg(`
      <g transform="rotate(-6 100 100)">
        <rect x="36" y="75" width="128" height="85" rx="8" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
        <rect x="36" y="75" width="128" height="85" rx="8" fill="#0f172a"/>
        <rect x="36" y="44" width="128" height="28" rx="6" fill="#0f172a"/>
        <polygon points="50,44 65,44 48,72 36,72" fill="#ffffff"/>
        <polygon points="85,44 100,44 82,72 68,72" fill="#ffffff"/>
        <polygon points="120,44 135,44 118,72 104,72" fill="#ffffff"/>
        <polygon points="155,44 164,44 154,72 140,72" fill="#ffffff"/>
        <text x="50" y="105" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff">SCENE 1</text>
        <text x="110" y="105" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff">TAKE 4</text>
        <text x="50" y="132" font-family="sans-serif" font-size="10" fill="#94a3b8">DIRECTOR: FALCON</text>
      </g>
    `),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 19. FASHION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "fsh-royal-crown",
    name: "Imperial Golden Crown",
    category: "fashion",
    style: "metallic",
    tags: ["crown", "royal", "gold", "king", "queen", "luxury", "jewel"],
    svg: stickerSvg(`
      <path d="M42 145 L32 75 L74 105 L100 55 L126 105 L168 75 L158 145 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <path d="M42 145 L32 75 L74 105 L100 55 L126 105 L168 75 L158 145 Z" fill="#f59e0b"/>
      <circle cx="32" cy="72" r="7" fill="#ef4444"/>
      <circle cx="100" cy="52" r="8" fill="#06b6d4"/>
      <circle cx="168" cy="72" r="7" fill="#ef4444"/>
      <rect x="42" y="135" width="116" height="15" rx="3" fill="#b45309"/>
      <circle cx="68" cy="142" r="4" fill="#ffffff"/>
      <circle cx="100" cy="142" r="4" fill="#ffffff"/>
      <circle cx="132" cy="142" r="4" fill="#ffffff"/>
    `),
  },
  {
    id: "fsh-sunglasses-aviator",
    name: "Aviator Gold Sunglasses",
    category: "fashion",
    style: "3d",
    tags: ["sunglasses", "glasses", "shades", "aviator", "style", "summer"],
    svg: stickerSvg(`
      <path d="M40 82 C40 70 85 70 88 85 C90 108 85 130 64 130 C45 130 40 108 40 82 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <path d="M160 82 C160 70 115 70 112 85 C110 108 115 130 136 130 C155 130 160 108 160 82 Z" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <path d="M40 82 C40 70 85 70 88 85 C90 108 85 130 64 130 C45 130 40 108 40 82 Z" fill="#0f172a" stroke="#d97706" stroke-width="6"/>
      <path d="M160 82 C160 70 115 70 112 85 C110 108 115 130 136 130 C155 130 160 108 160 82 Z" fill="#0f172a" stroke="#d97706" stroke-width="6"/>
      <line x1="88" y1="85" x2="112" y2="85" stroke="#d97706" stroke-width="6"/>
      <line x1="85" y1="78" x2="115" y2="78" stroke="#d97706" stroke-width="4"/>
    `),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 20. FITNESS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "fit-hex-dumbbell",
    name: "Cast Iron Hex Dumbbell",
    category: "fitness",
    style: "3d",
    tags: ["dumbbell", "weights", "gym", "workout", "muscle", "iron"],
    svg: stickerSvg(`
      <rect x="36" y="65" width="22" height="70" rx="8" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="142" y="65" width="22" height="70" rx="8" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="36" y="65" width="22" height="70" rx="8" fill="#1e293b"/>
      <rect x="52" y="74" width="16" height="52" rx="4" fill="#334155"/>
      <rect x="66" y="92" width="68" height="16" rx="4" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2"/>
      <rect x="132" y="74" width="16" height="52" rx="4" fill="#334155"/>
      <rect x="142" y="65" width="22" height="70" rx="8" fill="#1e293b"/>
    `),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 21. FINANCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "fin-bitcoin-coin",
    name: "Physical Bitcoin Coin",
    category: "finance",
    style: "metallic",
    tags: ["bitcoin", "crypto", "btc", "coin", "gold", "blockchain"],
    svg: stickerSvg(`
      <circle cx="100" cy="100" r="64" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <circle cx="100" cy="100" r="64" fill="#f59e0b"/>
      <circle cx="100" cy="100" r="52" fill="none" stroke="#fde68a" stroke-width="3" stroke-dasharray="6 4"/>
      <text x="100" y="122" font-family="Arial Black, Impact, sans-serif" font-size="58" font-weight="900" fill="#78350f" text-anchor="middle">₿</text>
    `),
  },
  {
    id: "fin-cash-stack",
    name: "Banknote Cash Stack",
    category: "finance",
    style: "vector",
    tags: ["cash", "money", "dollars", "bills", "bank", "wealth"],
    svg: stickerSvg(`
      <rect x="36" y="92" width="128" height="54" rx="8" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <rect x="36" y="92" width="128" height="54" rx="8" fill="#15803d"/>
      <rect x="36" y="74" width="128" height="54" rx="8" fill="#16a34a"/>
      <rect x="36" y="56" width="128" height="54" rx="8" fill="#22c55e"/>
      <circle cx="100" cy="83" r="16" fill="#15803d"/>
      <text x="100" y="91" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle">$</text>
      <rect x="86" y="56" width="28" height="54" fill="#facc15" opacity="0.8"/>
    `),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 22. SHAPES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "shp-3d-glossy-cube",
    name: "3D Glossy Cyan Cube",
    category: "shapes",
    style: "3d",
    tags: ["cube", "shape", "3d", "geometry", "isometric", "cyan"],
    svg: stickerSvg(`
      <polygon points="100,32 156,64 100,96 44,64" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>
      <polygon points="100,32 156,64 100,96 44,64" fill="#38bdf8"/>
      <polygon points="44,64 100,96 100,168 44,136" fill="#0284c7"/>
      <polygon points="156,64 100,96 100,168 156,136" fill="#0369a1"/>
    `),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 23. 3D
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "thd-floating-sphere",
    name: "3D Glossy Aqua Orb",
    category: "3d",
    style: "3d",
    tags: ["3d", "sphere", "orb", "globe", "glass", "ball"],
    svg: stickerSvg(`
      <circle cx="100" cy="100" r="62" fill="#ffffff" stroke="#ffffff" stroke-width="12"/>
      <circle cx="100" cy="100" r="62" fill="#0284c7"/>
      <circle cx="100" cy="100" r="62" fill="#06b6d4" opacity="0.6"/>
      <ellipse cx="80" cy="72" rx="30" ry="16" transform="rotate(-30 80 72)" fill="#ffffff" opacity="0.65"/>
      <ellipse cx="120" cy="130" rx="14" ry="7" fill="#ffffff" opacity="0.3"/>
    `),
  },
];
