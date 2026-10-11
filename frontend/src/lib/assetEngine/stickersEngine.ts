// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Asset Engine – Stickers
//
//  Two kinds of sticker share this category:
//
//  1. Falcon's own die-cut stickers, drawn here as SVG: code jokes, slogans,
//     doodles, faces, racing badges and sports objects, each in several
//     layouts and colours.
//  2. Emoji art from open emoji sets (Twemoji, Noto Emoji flat and 3D,
//     OpenMoji), listed in public/data/sticker-emoji.json and fetched when
//     the category is first opened.
//  3. The multicolour icon sets gathered by Iconify (more emoji styles,
//     illustrations, flags, weather), listed in public/data/sticker-iconify.json.
// ─────────────────────────────────────────────────────────────────────────────

import { AssetDef } from "./types";
import { svgDataUri } from "./svgUtils";
import { EMOJI_STICKER_COUNT } from "@/data/stickerEmojiMeta";
import { ICONIFY_STICKER_COUNT } from "@/data/stickerIconifyMeta";

// ── Drawing helpers ──────────────────────────────────────────────────────────

const INK = "#111111";

/** The white border and soft shadow that make artwork read as a cut-out sticker */
const DIE_CUT = `<filter id="dc" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
<feMorphology in="SourceAlpha" operator="dilate" radius="7" result="o"/>
<feFlood flood-color="#ffffff"/><feComposite in2="o" operator="in" result="w"/>
<feGaussianBlur in="o" stdDeviation="2.5"/><feOffset dy="3" result="s"/>
<feComponentTransfer in="s" result="sh"><feFuncA type="linear" slope="0.32"/></feComponentTransfer>
<feMerge><feMergeNode in="sh"/><feMergeNode in="w"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

function dieCut(body: string): string {
  return svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="480" height="480"><defs>${DIE_CUT}</defs><g filter="url(#dc)">${body}</g></svg>`);
}

function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const FONT = {
  bold: "Impact, 'Arial Black', 'Helvetica Neue', sans-serif",
  mono: "'Courier New', Consolas, monospace",
  round: "'Arial Rounded MT Bold', 'Trebuchet MS', Verdana, sans-serif",
  hand: "'Comic Sans MS', 'Segoe Print', 'Marker Felt', cursive",
};
/** Average glyph width as a share of the font size, for fitting text to a width */
const WIDTH = { bold: 0.5, mono: 0.62, round: 0.6, hand: 0.58 };

type FontKey = keyof typeof FONT;

/** Centred lines of text sized to fit a box. `fills` gives each line its colour in turn. */
function block(lines: string[], cx: number, cy: number, w: number, h: number, font: FontKey, fills: string[], extra = ""): string {
  const longest = Math.max(...lines.map((l) => l.length));
  const size = Math.min(w / (longest * WIDTH[font]), h / (lines.length * 1.08), 78);
  const top = cy - (lines.length * size * 1.08) / 2 + size * 0.86;
  return lines.map((line, i) =>
    `<text x="${cx}" y="${(top + i * size * 1.08).toFixed(1)}" font-family="${FONT[font]}" font-size="${size.toFixed(1)}" font-weight="900" text-anchor="middle" fill="${fills[i % fills.length]}" ${extra}>${esc(line)}</text>`
  ).join("");
}

function star4(cx: number, cy: number, r: number, fill: string): string {
  const k = r * 0.28;
  return `<path d="M${cx},${cy - r} L${cx + k},${cy - k} L${cx + r},${cy} L${cx + k},${cy + k} L${cx},${cy + r} L${cx - k},${cy + k} L${cx - r},${cy} L${cx - k},${cy - k} Z" fill="${fill}"/>`;
}

/** Is this colour light enough to need dark text on it? */
function isLight(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 > 150;
}

const on = (hex: string) => (isLight(hex) ? INK : "#ffffff");

// ── Colours ──────────────────────────────────────────────────────────────────

interface Tone { id: string; name: string; a: string; b: string }

const TONES: Tone[] = [
  ["pink", "Pink", "#FF4D9D", "#22D3C5"], ["yellow", "Yellow", "#FFD23F", "#FF4D9D"], ["teal", "Teal", "#22D3C5", "#FF4D9D"],
  ["purple", "Purple", "#9B5DE5", "#FEE440"], ["orange", "Orange", "#FF7A00", "#00BBF9"], ["red", "Red", "#EF233C", "#FFD23F"],
  ["blue", "Blue", "#2D7DFF", "#FF8FAB"], ["green", "Green", "#4ADE80", "#F97316"], ["lime", "Lime", "#C6F432", "#7C3AED"],
  ["mono", "Mono", "#F4F4F5", "#FFD23F"], ["sky", "Sky", "#7DD3FC", "#F472B6"], ["coral", "Coral", "#FB7185", "#34D399"],
].map(([id, name, a, b]) => ({ id, name, a, b }));

// ── 1. Code stickers ─────────────────────────────────────────────────────────

const CODE_LINES: string[][] = [
  ["EAT.", "SLEEP.", "CODE.", "REPEAT."], ["IT WORKS", "ON MY", "MACHINE"], ["HELLO,", "WORLD!"], ["GIVE ME", "A <br/>"],
  ["BUG FREE", "ZONE"], ["CODE", "IS ART"], ["console", ".log()"], ["sudo make", "coffee"], ["404", "SLEEP", "NOT FOUND"],
  ["git commit", "-m \"fix\""], ["I HAVE NO CLUE", "WHY MY CODE", "IS WORKING"], ["THERE'S NO", "PLACE LIKE", "127.0.0.1"],
  ["SEMICOLON", "SURVIVOR;"], ["CTRL + S", "SAVES LIVES"], ["while(alive)", "{ code(); }"], ["DEBUG", "MODE: ON"],
  ["STACK", "OVERFLOW", "SURVIVOR"], ["</>", "CODER"], ["FULL STACK", "DEVELOPER"], ["FRONT END", "WIZARD"], ["BACK END", "NINJA"],
  ["DARK MODE", "ONLY"], ["TABS >", "SPACES"], ["SPACES >", "TABS"], ["COFFEE IN", "CODE OUT"], ["NULL", "POINTER"],
  ["npm install", "patience"], ["PUSH TO", "PROD ON", "FRIDAY"], ["MERGE", "CONFLICT", "SURVIVOR"], ["0101", "1010", "0110"],
  ["TRUST ME", "I'M AN", "ENGINEER"], ["OPEN", "SOURCE", "LOVER"], ["KEEP CALM", "AND", "REFACTOR"], ["99 LITTLE", "BUGS IN", "THE CODE"],
  ["rm -rf", "doubts"], ["SHIP IT", "TODAY"],
];
const CODE_SHAPES = ["Dark Tile", "Colour Tile", "Hexagon", "Terminal"];

function drawCode(lines: string[], shape: number, t: Tone): string {
  if (shape === 0) {
    return dieCut(`<rect x="24" y="24" width="192" height="192" rx="26" fill="#18181B"/>${block(lines, 120, 120, 160, 160, "bold", ["#ffffff", t.a])}`);
  }
  if (shape === 1) {
    return dieCut(`<rect x="24" y="44" width="192" height="152" rx="22" fill="${t.a}"/><rect x="24" y="44" width="192" height="152" rx="22" fill="none" stroke="${INK}" stroke-width="6"/>${block(lines, 120, 120, 164, 120, "bold", [on(t.a)])}`);
  }
  if (shape === 2) {
    return dieCut(`<polygon points="120,20 207,70 207,170 120,220 33,170 33,70" fill="${t.a}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>${block(lines, 120, 122, 138, 110, "bold", [on(t.a)])}`);
  }
  return dieCut(`<rect x="22" y="38" width="196" height="164" rx="16" fill="#0B0F14"/><rect x="22" y="38" width="196" height="30" rx="16" fill="#27272A"/><rect x="22" y="54" width="196" height="14" fill="#27272A"/>
<circle cx="42" cy="53" r="6" fill="#EF4444"/><circle cx="62" cy="53" r="6" fill="#FACC15"/><circle cx="82" cy="53" r="6" fill="#22C55E"/>${block(lines, 120, 136, 168, 112, "mono", [t.a === "#F4F4F5" ? "#4ADE80" : t.a, "#ffffff"])}`);
}

// ── 2. Slogan stickers ───────────────────────────────────────────────────────

const SLOGANS: string[][] = [
  ["GOOD", "VIBES"], ["STAY", "COOL"], ["NO BAD", "DAYS"], ["GOOD THINGS", "TAKE", "TIME"], ["BE", "KIND"], ["DREAM", "BIG"],
  ["YOU GOT", "THIS"], ["JUST", "BREATHE"], ["STAY", "WILD"], ["MAKE IT", "HAPPEN"], ["HELLO", "SUNSHINE"], ["OH", "YEAH!"],
  ["SO", "FRESH"], ["WEEKEND", "MODE"], ["NOT", "TODAY"], ["LET'S", "GO!"], ["KEEP", "GOING"], ["STAY", "WEIRD"], ["BIG", "MOOD"],
  ["TOO", "COOL"], ["LOVE", "WINS"], ["GOOD", "LUCK"], ["HAPPY", "DAYS"], ["CHILL", "OUT"], ["WOW", "WOW"], ["THANK", "YOU"],
  ["BEST", "DAY EVER"], ["STAY", "GOLDEN"], ["YOU ARE", "THE MAIN", "CHARACTER"], ["ENJOY", "THE LITTLE", "THINGS"],
  ["WORK HARD", "STAY", "HUMBLE"], ["MADE WITH", "LOVE"], ["NEW", "DROP"], ["LIMITED", "EDITION"], ["HANDLE", "WITH", "CARE"],
  ["FRESH", "START"], ["HUSTLE", "MODE"], ["ZERO", "DRAMA"], ["SWEET", "DREAMS"], ["CIAO", "BELLA"],
];
const SLOGAN_SHAPES = ["Stacked", "Speech Bubble", "Round Badge", "Offset"];

function drawSlogan(lines: string[], shape: number, t: Tone): string {
  const a = t.a === "#F4F4F5" ? "#FF4D9D" : t.a;
  if (shape === 0) {
    return dieCut(`${block(lines, 120, 122, 190, 170, "hand", [INK, a, t.b === a ? INK : t.b])}${star4(36, 52, 13, "#FFD23F")}${star4(206, 190, 11, "#FFD23F")}${star4(204, 46, 7, a)}`);
  }
  if (shape === 1) {
    return dieCut(`<path d="M120,34 C178,34 216,66 216,108 C216,150 178,182 120,182 C108,182 97,181 87,178 L52,206 L62,166 C38,153 24,132 24,108 C24,66 62,34 120,34 Z" fill="${INK}"/>${block(lines, 120, 108, 150, 104, "hand", ["#ffffff", a])}`);
  }
  if (shape === 2) {
    return dieCut(`<circle cx="120" cy="120" r="98" fill="${a}"/><circle cx="120" cy="120" r="84" fill="none" stroke="${on(a)}" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/>${block(lines, 120, 120, 136, 118, "bold", [on(a)])}`);
  }
  const text = (dx: number, dy: number, fill: string) => `<g transform="translate(${dx} ${dy})">${block(lines, 120, 120, 196, 160, "bold", [fill], 'font-style="italic"')}</g>`;
  return dieCut(`${text(-5, 0, t.b)}${text(5, 0, a)}${text(0, 0, INK)}`);
}

// ── 3. Racing stickers ───────────────────────────────────────────────────────

const RACING = ["TURBO", "DRIFT", "RACE DAY", "FULL THROTTLE", "PIT STOP", "SPEED", "NITRO", "GARAGE", "STREET KING", "NIGHT RUN",
  "BURNOUT", "GRID", "APEX", "LAP ONE", "V8", "BOOST", "TRACK DAY", "GEAR UP", "FAST LANE", "REDLINE"];
const RACING_SHAPES = ["Chequered", "Speed Bars", "Number Plate"];

function drawRacing(word: string, shape: number, t: Tone, n: number): string {
  const a = t.a === "#F4F4F5" ? "#EF233C" : t.a;
  const lines = word.includes(" ") ? word.split(" ") : [word];
  if (shape === 0) {
    let flag = "";
    for (let r = 0; r < 2; r++) for (let c = 0; c < 12; c++) flag += `<rect x="${24 + c * 16}" y="${152 + r * 16}" width="16" height="16" fill="${(r + c) % 2 ? "#ffffff" : INK}"/>`;
    return dieCut(`<rect x="24" y="56" width="192" height="128" rx="14" fill="${a}"/>${flag}<rect x="24" y="56" width="192" height="128" rx="14" fill="none" stroke="${INK}" stroke-width="6"/>${block(lines, 120, 104, 170, 84, "bold", [on(a)], 'font-style="italic"')}`);
  }
  if (shape === 1) {
    return dieCut(`<g transform="skewX(-14) translate(30 0)"><rect x="18" y="62" width="186" height="116" rx="10" fill="${INK}"/><rect x="18" y="150" width="186" height="10" fill="${a}"/><rect x="18" y="164" width="186" height="5" fill="${t.b}"/></g>${block(lines, 120, 108, 164, 76, "bold", ["#ffffff", a], 'font-style="italic"')}`);
  }
  return dieCut(`<circle cx="120" cy="120" r="96" fill="${INK}"/><circle cx="120" cy="120" r="84" fill="${a}"/><text x="120" y="126" font-family="${FONT.bold}" font-size="92" font-weight="900" text-anchor="middle" fill="${on(a)}" font-style="italic">${(n % 89) + 7}</text>${block([word], 120, 172, 120, 26, "bold", [on(a)])}`);
}

// ── 4. Doodles ───────────────────────────────────────────────────────────────

const S = `stroke="${INK}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"`;
const drips = (y: number, fill: string) => `<path d="M62,${y} v34 a11,11 0 0 0 22,0 v-34 M106,${y} v52 a12,12 0 0 0 24,0 v-52 M152,${y} v26 a10,10 0 0 0 20,0 v-26" fill="${fill}" ${S}/>`;
const smile = (cx: number, cy: number) => `<circle cx="${cx - 26}" cy="${cy - 14}" r="9" fill="${INK}"/><circle cx="${cx + 26}" cy="${cy - 14}" r="9" fill="${INK}"/><path d="M${cx - 38},${cy + 14} Q${cx},${cy + 52} ${cx + 38},${cy + 14}" fill="none" ${S}/>`;

const DOODLES: { name: string; tags: string[]; draw: (a: string, b: string) => string }[] = [
  { name: "Smiley", tags: ["smile", "happy", "face"], draw: (a) => `<circle cx="120" cy="120" r="88" fill="${a}" ${S}/>${smile(120, 120)}` },
  { name: "Drippy Smiley", tags: ["smile", "drip", "melt", "graffiti"], draw: (a) => `${drips(150, a)}<circle cx="120" cy="104" r="80" fill="${a}" ${S}/>${smile(120, 104)}` },
  { name: "Heart", tags: ["love", "heart"], draw: (a) => `<path d="M120,206 C40,150 24,104 44,70 C62,40 104,42 120,74 C136,42 178,40 196,70 C216,104 200,150 120,206 Z" fill="${a}" ${S}/><path d="M66,82 q8,-18 26,-18" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>` },
  { name: "Drippy Heart", tags: ["love", "heart", "drip", "graffiti"], draw: (a) => `${drips(140, a)}<path d="M120,186 C48,136 30,96 48,64 C64,38 104,40 120,70 C136,40 176,38 192,64 C210,96 192,136 120,186 Z" fill="${a}" ${S}/>` },
  { name: "Star", tags: ["star", "favourite"], draw: (a) => `<polygon points="120,22 148,88 220,94 165,141 182,212 120,174 58,212 75,141 20,94 92,88" fill="${a}" ${S}/>${smile(120, 128)}` },
  { name: "Lightning Bolt", tags: ["bolt", "energy", "power", "flash"], draw: (a, b) => `<polygon points="140,18 52,132 108,132 88,222 190,100 132,100" fill="${b}" transform="translate(8 8)" ${S}/><polygon points="140,18 52,132 108,132 88,222 190,100 132,100" fill="${a}" ${S}/>` },
  { name: "Flame", tags: ["fire", "hot", "lit"], draw: (a, b) => `<path d="M120,20 C132,62 190,86 190,146 C190,188 158,218 120,218 C82,218 50,188 50,146 C50,116 66,100 80,84 C84,104 94,112 104,112 C96,78 104,46 120,20 Z" fill="${a}" ${S}/><path d="M120,112 C128,134 152,146 152,172 C152,192 138,204 120,204 C102,204 88,192 88,172 C88,152 106,140 120,112 Z" fill="${b}" ${S}/>` },
  { name: "Mushroom", tags: ["mushroom", "nature", "trippy"], draw: (a) => `<path d="M92,132 h56 l12,64 a18,18 0 0 1 -18,20 h-44 a18,18 0 0 1 -18,-20 Z" fill="#FFF7E6" ${S}/><path d="M24,132 C24,70 68,28 120,28 C172,28 216,70 216,132 Z" fill="${a}" ${S}/><circle cx="78" cy="88" r="15" fill="#ffffff"/><circle cx="130" cy="66" r="12" fill="#ffffff"/><circle cx="168" cy="100" r="14" fill="#ffffff"/>` },
  { name: "Bomb", tags: ["bomb", "boom", "explode"], draw: (a, b) => `<path d="M150,62 q18,-34 46,-30" fill="none" ${S}/><polygon points="196,14 204,28 220,26 210,38 218,52 202,48 192,60 190,44 176,38 190,30" fill="${a}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><rect x="118" y="50" width="40" height="26" rx="6" fill="${b}" transform="rotate(24 138 63)" ${S}/><circle cx="108" cy="140" r="82" fill="#18181B" ${S}/><path d="M60,116 q10,-30 40,-38" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>` },
  { name: "Daisy", tags: ["flower", "daisy", "spring"], draw: (a) => `${[0, 60, 120, 180, 240, 300].map((r) => `<ellipse cx="120" cy="58" rx="34" ry="46" fill="#ffffff" transform="rotate(${r} 120 120)" ${S}/>`).join("")}<circle cx="120" cy="120" r="44" fill="${a}" ${S}/>${`<circle cx="106" cy="112" r="6" fill="${INK}"/><circle cx="134" cy="112" r="6" fill="${INK}"/><path d="M102,128 Q120,146 138,128" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`}` },
  { name: "Skull", tags: ["skull", "spooky", "rock"], draw: (a) => `<path d="M120,24 C66,24 30,62 30,112 C30,142 44,162 62,174 L62,200 a14,14 0 0 0 14,14 h88 a14,14 0 0 0 14,-14 L178,174 C196,162 210,142 210,112 C210,62 174,24 120,24 Z" fill="${a}" ${S}/><ellipse cx="86" cy="116" rx="22" ry="26" fill="${INK}"/><ellipse cx="154" cy="116" rx="22" ry="26" fill="${INK}"/><path d="M120,146 l-12,22 h24 Z" fill="${INK}"/><path d="M96,188 v24 M120,188 v24 M144,188 v24" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>` },
  { name: "Chequered Flag", tags: ["flag", "race", "finish"], draw: (a) => { let cells = ""; for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) cells += `<rect x="${58 + c * 30}" y="${40 + r * 30}" width="30" height="30" fill="${(r + c) % 2 ? "#ffffff" : INK}"/>`; return `<rect x="38" y="28" width="14" height="190" rx="7" fill="${a}" ${S}/>${cells}<rect x="58" y="40" width="150" height="120" fill="none" ${S}/>`; } },
  { name: "Crown", tags: ["crown", "king", "queen", "royal"], draw: (a, b) => `<path d="M30,180 L22,74 L78,122 L120,48 L162,122 L218,74 L210,180 Z" fill="${a}" ${S}/><rect x="30" y="180" width="180" height="26" rx="8" fill="${b}" ${S}/><circle cx="120" cy="150" r="12" fill="${b}" stroke="${INK}" stroke-width="5"/><circle cx="22" cy="70" r="11" fill="${b}" stroke="${INK}" stroke-width="5"/><circle cx="218" cy="70" r="11" fill="${b}" stroke="${INK}" stroke-width="5"/><circle cx="120" cy="44" r="11" fill="${b}" stroke="${INK}" stroke-width="5"/>` },
  { name: "Cherries", tags: ["cherry", "fruit", "sweet"], draw: (a) => `<path d="M82,150 C86,96 120,54 172,32 C150,74 148,110 156,146" fill="none" ${S}/><path d="M172,32 C200,26 220,40 222,62 C196,68 178,56 172,32 Z" fill="#4ADE80" ${S}/><circle cx="80" cy="170" r="42" fill="${a}" ${S}/><circle cx="160" cy="174" r="42" fill="${a}" ${S}/><path d="M60,152 q6,-12 18,-14" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/><path d="M140,156 q6,-12 18,-14" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>` },
  { name: "Ice Cream", tags: ["ice cream", "dessert", "summer"], draw: (a, b) => `<polygon points="72,118 168,118 120,224" fill="#F5C77E" ${S}/><path d="M86,150 l56,-22 M98,178 l40,-16" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="120" cy="82" r="58" fill="${a}" ${S}/><path d="M66,104 q12,22 30,6 q14,24 34,4 q14,20 32,-6" fill="${b}" ${S}/><circle cx="120" cy="24" r="12" fill="#EF233C" stroke="${INK}" stroke-width="5"/>` },
  { name: "Rainbow", tags: ["rainbow", "colour", "pride", "weather"], draw: (a, b) => `<path d="M24,176 a96,96 0 0 1 192,0" fill="none" stroke="${INK}" stroke-width="62"/><path d="M24,176 a96,96 0 0 1 192,0" fill="none" stroke="${a}" stroke-width="48"/><path d="M24,176 a96,96 0 0 1 192,0" fill="none" stroke="${b}" stroke-width="30"/><path d="M24,176 a96,96 0 0 1 192,0" fill="none" stroke="#FFD23F" stroke-width="12"/><ellipse cx="40" cy="182" rx="34" ry="22" fill="#ffffff" ${S}/><ellipse cx="200" cy="182" rx="34" ry="22" fill="#ffffff" ${S}/>` },
  { name: "Cloud", tags: ["cloud", "sky", "weather"], draw: (a) => `<path d="M64,186 a44,44 0 0 1 -6,-88 a56,56 0 0 1 106,-22 a46,46 0 0 1 20,110 Z" fill="${a}" ${S}/><circle cx="100" cy="140" r="6" fill="${INK}"/><circle cx="144" cy="140" r="6" fill="${INK}"/><path d="M106,156 Q122,170 138,156" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>` },
  { name: "Moon", tags: ["moon", "night", "sleep"], draw: (a) => `<path d="M150,24 A98,98 0 1 0 216,150 A76,76 0 0 1 150,24 Z" fill="${a}" ${S}/>${star4(186, 60, 16, "#FFD23F")}${star4(204, 108, 9, "#FFD23F")}` },
  { name: "Sun", tags: ["sun", "summer", "sunny"], draw: (a) => `${[0, 45, 90, 135, 180, 225, 270, 315].map((r) => `<rect x="112" y="10" width="16" height="38" rx="8" fill="${a}" transform="rotate(${r} 120 120)" ${S}/>`).join("")}<circle cx="120" cy="120" r="62" fill="${a}" ${S}/>${smile(120, 122)}` },
  { name: "Planet", tags: ["planet", "space", "saturn"], draw: (a, b) => `<ellipse cx="120" cy="124" rx="108" ry="30" fill="none" stroke="${INK}" stroke-width="20" transform="rotate(-18 120 124)"/><ellipse cx="120" cy="124" rx="108" ry="30" fill="none" stroke="${b}" stroke-width="10" transform="rotate(-18 120 124)"/><circle cx="120" cy="120" r="66" fill="${a}" ${S}/><path d="M24,158 A108,30 -18 0 0 216,90" fill="none" stroke="${INK}" stroke-width="20"/><path d="M24,158 A108,30 -18 0 0 216,90" fill="none" stroke="${b}" stroke-width="10"/>` },
  { name: "Diamond", tags: ["diamond", "gem", "shine"], draw: (a, b) => `<polygon points="60,40 180,40 222,96 120,216 18,96" fill="${a}" ${S}/><polygon points="60,40 96,96 18,96" fill="${b}" ${S}/><polygon points="180,40 222,96 144,96" fill="${b}" ${S}/><path d="M96,96 L120,216 L144,96 Z M96,96 h48 M60,40 L96,96 M180,40 L144,96 M120,40 L96,96 M120,40 L144,96" fill="none" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>` },
  { name: "Eye", tags: ["eye", "look", "see"], draw: (a) => `<path d="M16,120 C52,60 188,60 224,120 C188,180 52,180 16,120 Z" fill="#ffffff" ${S}/><circle cx="120" cy="120" r="42" fill="${a}" ${S}/><circle cx="120" cy="120" r="18" fill="${INK}"/><circle cx="134" cy="106" r="8" fill="#ffffff"/><path d="M52,62 l-12,-22 M120,46 v-26 M188,62 l12,-22" ${S}/>` },
];

const SPARKLE = `${star4(30, 44, 14, "#FFD23F")}${star4(212, 200, 12, "#FFD23F")}${star4(210, 36, 8, "#ffffff")}`;

// ── 5. Faces ─────────────────────────────────────────────────────────────────

const FACE_EYES: [string, string][] = [
  ["Bright Eyes", `<circle cx="92" cy="112" r="10" fill="${INK}"/><circle cx="148" cy="112" r="10" fill="${INK}"/>`],
  ["Sleepy Lashes", `<path d="M74,114 q18,16 36,0 M130,114 q18,16 36,0" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M74,116 l-8,8 M84,122 l-4,10 M166,116 l8,8 M156,122 l4,10" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`],
  ["Wide Eyes", `<circle cx="90" cy="108" r="22" fill="#ffffff" stroke="${INK}" stroke-width="5"/><circle cx="150" cy="108" r="22" fill="#ffffff" stroke="${INK}" stroke-width="5"/><circle cx="94" cy="110" r="10" fill="${INK}"/><circle cx="154" cy="110" r="10" fill="${INK}"/>`],
  ["Heart Eyes", `<path d="M92,128 C68,112 70,92 82,92 C88,92 92,98 92,102 C92,98 96,92 102,92 C114,92 116,112 92,128 Z M148,128 C124,112 126,92 138,92 C144,92 148,98 148,102 C148,98 152,92 158,92 C170,92 172,112 148,128 Z" fill="#EF233C" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`],
  ["Star Eyes", `<polygon points="92,90 98,104 113,105 101,115 105,130 92,122 79,130 83,115 71,105 86,104" fill="#FFD23F" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><polygon points="148,90 154,104 169,105 157,115 161,130 148,122 135,130 139,115 127,105 142,104" fill="#FFD23F" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`],
  ["Wink", `<circle cx="92" cy="112" r="10" fill="${INK}"/><path d="M132,114 q16,-14 32,0" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`],
  ["Sunglasses", `<path d="M58,96 h124 v10 a26,26 0 0 1 -52,0 h-20 a26,26 0 0 1 -52,0 Z" fill="${INK}"/><path d="M70,102 l14,14 M144,102 l14,14" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.7"/>`],
  ["Eye Roll", `<circle cx="90" cy="108" r="22" fill="#ffffff" stroke="${INK}" stroke-width="5"/><circle cx="150" cy="108" r="22" fill="#ffffff" stroke="${INK}" stroke-width="5"/><circle cx="96" cy="96" r="9" fill="${INK}"/><circle cx="156" cy="96" r="9" fill="${INK}"/><path d="M68,80 q22,-12 44,0 M128,80 q22,-12 44,0" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`],
];

const FACE_MOUTHS: [string, string][] = [
  ["Smile", `<path d="M86,150 Q120,184 154,150" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`],
  ["Grin", `<path d="M78,146 h84 a42,34 0 0 1 -84,0 Z" fill="#ffffff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M100,146 v26 M120,146 v32 M140,146 v26" stroke="${INK}" stroke-width="3"/>`],
  ["Surprised", `<ellipse cx="120" cy="164" rx="16" ry="20" fill="#7F1D1D" stroke="${INK}" stroke-width="6"/>`],
  ["Tongue Out", `<path d="M84,148 h72 a36,30 0 0 1 -72,0 Z" fill="#7F1D1D" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M104,160 h32 v20 a16,16 0 0 1 -32,0 Z" fill="#FB7185" stroke="${INK}" stroke-width="5"/>`],
  ["Kiss", `<path d="M100,160 C100,146 116,146 120,156 C124,146 140,146 140,160 C140,174 124,180 120,184 C116,180 100,174 100,160 Z" fill="#E11D48" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`],
  ["Flat", `<path d="M92,162 h56" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`],
  ["Frown", `<path d="M88,172 Q120,144 152,172" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`],
  ["Smirk", `<path d="M96,164 Q128,172 152,148" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`],
];

const FACE_EXTRAS: [string, string][] = [
  ["", ""],
  ["with Bow", `<path d="M150,44 L112,26 L116,66 Z M150,44 L188,26 L184,66 Z" fill="#FF8FC7" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><circle cx="150" cy="46" r="11" fill="#FF4D9D" stroke="${INK}" stroke-width="5"/>`],
  ["with Flower", `${[0, 72, 144, 216, 288].map((r) => `<circle cx="172" cy="38" r="12" fill="#FF8FC7" stroke="${INK}" stroke-width="4" transform="rotate(${r} 172 56)"/>`).join("")}<circle cx="172" cy="56" r="9" fill="#FFD23F" stroke="${INK}" stroke-width="4"/>`],
  ["with Cowboy Hat", `<path d="M26,66 C60,84 180,84 214,66 C200,52 176,56 168,58 C168,22 148,16 120,26 C92,16 72,22 72,58 C64,56 40,52 26,66 Z" fill="#F9A8D4" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M72,56 C100,66 140,66 168,56" fill="none" stroke="${INK}" stroke-width="5"/>`],
  ["with Crown", `<path d="M74,62 L68,18 L98,40 L120,10 L142,40 L172,18 L166,62 Z" fill="#FFD23F" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`],
  ["Blushing", `<ellipse cx="68" cy="146" rx="16" ry="10" fill="#FB7185" opacity="0.75"/><ellipse cx="172" cy="146" rx="16" ry="10" fill="#FB7185" opacity="0.75"/>`],
  ["Crying", `<path d="M84,128 C72,150 74,176 86,200 a10,10 0 0 0 16,-4 C96,172 98,150 100,130 Z" fill="#38BDF8" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`],
  ["Sparkling", `${star4(40, 56, 16, "#ffffff")}${star4(204, 190, 13, "#ffffff")}${star4(206, 60, 9, "#FFD23F")}`],
];

const FACE_SKINS: [string, string][] = [["Yellow", "#FFD23F"], ["Peach", "#FFB86B"], ["Pink", "#FF9EC4"]];

function drawFace(eyes: number, mouth: number, extra: number, skin: number): string {
  const fill = FACE_SKINS[skin][1];
  return dieCut(`<circle cx="120" cy="128" r="88" fill="${fill}" stroke="${INK}" stroke-width="7"/><path d="M52,104 a70,70 0 0 1 44,-52" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity="0.55"/>${FACE_EYES[eyes][1]}${FACE_MOUTHS[mouth][1]}${FACE_EXTRAS[extra][1]}`);
}

// ── 6. Sports and objects ────────────────────────────────────────────────────

const OBJECTS: { name: string; tags: string[]; draw: (a: string, b: string) => string }[] = [
  { name: "Basketball", tags: ["basketball", "sport", "ball", "hoops"], draw: () => `<circle cx="120" cy="120" r="92" fill="#F97316" ${S}/><path d="M28,120 h184 M120,28 v184 M56,54 C96,92 96,148 56,186 M184,54 C144,92 144,148 184,186" fill="none" stroke="${INK}" stroke-width="6"/>` },
  { name: "Football", tags: ["football", "soccer", "sport", "ball"], draw: () => `<circle cx="120" cy="120" r="92" fill="#ffffff" ${S}/><polygon points="120,84 154,108 141,148 99,148 86,108" fill="${INK}"/><path d="M120,84 V30 M154,108 L204,90 M141,148 L172,194 M99,148 L68,194 M86,108 L36,90" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>` },
  { name: "Eight Ball", tags: ["pool", "billiards", "eight ball", "luck"], draw: () => `<circle cx="120" cy="120" r="92" fill="#18181B" ${S}/><circle cx="120" cy="96" r="40" fill="#ffffff"/><text x="120" y="114" font-family="${FONT.bold}" font-size="54" font-weight="900" text-anchor="middle" fill="${INK}">8</text><path d="M50,96 q8,-30 34,-42" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity="0.6"/>` },
  { name: "Tennis Ball", tags: ["tennis", "sport", "ball"], draw: () => `<circle cx="120" cy="120" r="92" fill="#D9F99D" ${S}/><path d="M44,66 C92,96 92,144 44,174 M196,66 C148,96 148,144 196,174" fill="none" stroke="#ffffff" stroke-width="9" stroke-linecap="round"/>` },
  { name: "Admit One Ticket", tags: ["ticket", "cinema", "movie", "event"], draw: (a) => `<path d="M22,70 h196 v32 a18,18 0 0 0 0,36 v32 h-196 v-32 a18,18 0 0 0 0,-36 Z" fill="${a}" ${S}/><path d="M72,76 v88" stroke="${INK}" stroke-width="4" stroke-dasharray="6 8"/>${block(["ADMIT", "ONE"], 146, 120, 110, 76, "bold", [on(a)])}` },
  { name: "Trophy", tags: ["trophy", "winner", "champion", "award"], draw: (a) => `<path d="M70,44 H40 a30,36 0 0 0 40,58 M170,44 h30 a30,36 0 0 1 -40,58" fill="none" ${S}/><path d="M68,30 h104 v52 a52,52 0 0 1 -104,0 Z" fill="${a}" ${S}/><rect x="108" y="132" width="24" height="38" fill="${a}" ${S}/><rect x="72" y="170" width="96" height="36" rx="8" fill="${INK}"/>${star4(120, 78, 22, "#ffffff")}` },
  { name: "Medal", tags: ["medal", "first", "winner", "gold"], draw: (a, b) => `<polygon points="74,16 116,16 132,96 96,104" fill="${b}" ${S}/><polygon points="166,16 124,16 108,96 144,104" fill="${a}" ${S}/><circle cx="120" cy="150" r="66" fill="#FFD23F" ${S}/><circle cx="120" cy="150" r="48" fill="none" stroke="${INK}" stroke-width="4"/><text x="120" y="172" font-family="${FONT.bold}" font-size="62" font-weight="900" text-anchor="middle" fill="${INK}">1</text>` },
  { name: "Headphones", tags: ["headphones", "music", "audio", "dj"], draw: (a) => `<path d="M40,150 v-26 a80,80 0 0 1 160,0 v26" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/><path d="M40,150 v-26 a80,80 0 0 1 160,0 v26" fill="none" stroke="${a}" stroke-width="8" stroke-linecap="round"/><rect x="24" y="132" width="42" height="76" rx="16" fill="${a}" ${S}/><rect x="174" y="132" width="42" height="76" rx="16" fill="${a}" ${S}/>` },
  { name: "Cassette", tags: ["cassette", "tape", "retro", "music", "mixtape"], draw: (a) => `<rect x="20" y="52" width="200" height="136" rx="14" fill="${a}" ${S}/><rect x="42" y="72" width="156" height="66" rx="8" fill="#ffffff" stroke="${INK}" stroke-width="5"/><circle cx="88" cy="106" r="18" fill="${INK}"/><circle cx="152" cy="106" r="18" fill="${INK}"/><circle cx="88" cy="106" r="6" fill="#ffffff"/><circle cx="152" cy="106" r="6" fill="#ffffff"/><path d="M62,188 l14,-30 h88 l14,30" fill="none" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>` },
  { name: "Game Controller", tags: ["game", "controller", "gamer", "console"], draw: (a, b) => `<path d="M70,70 h100 a52,52 0 0 1 50,64 l-8,40 a26,26 0 0 1 -46,10 l-16,-22 h-60 l-16,22 a26,26 0 0 1 -46,-10 l-8,-40 a52,52 0 0 1 50,-64 Z" fill="${a}" ${S}/><path d="M78,96 v36 M60,114 h36" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><circle cx="162" cy="100" r="10" fill="${b}" stroke="${INK}" stroke-width="4"/><circle cx="182" cy="122" r="10" fill="#ffffff" stroke="${INK}" stroke-width="4"/>` },
];

// ── Catalogue ────────────────────────────────────────────────────────────────

const OWN = { license: "Falcon", source: "Falcon", author: "Falcon" };
const TILE_TONES = TONES.slice(0, 10);

function own(id: string, name: string, subcategory: string, tags: string[], params: Record<string, unknown>, colors: string[]): AssetDef {
  return {
    id: `sticker-${id}`, name, category: "stickers", subcategory, tags: ["sticker", ...tags], keywords: [subcategory.toLowerCase(), ...tags],
    templateId: "sticker", params, format: "svg", width: 480, height: 480, editable: false, animated: false, style: "playful", colors, ...OWN,
  };
}

let ownStickers: AssetDef[] | null = null;

function getOwnStickers(): AssetDef[] {
  if (ownStickers) return ownStickers;
  const list: AssetDef[] = [];
  const words = (lines: string[]) => lines.join(" ").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter(Boolean);

  CODE_LINES.forEach((lines, q) => CODE_SHAPES.forEach((shape, s) => TILE_TONES.forEach((t, c) => {
    list.push(own(`code-${q}-${s}-${t.id}`, `${lines.join(" ")} – ${shape}, ${t.name}`, "Coding", ["code", "developer", "programming", t.id, ...words(lines)], { kind: "code", q, s, c }, [t.a]));
  })));
  SLOGANS.forEach((lines, q) => SLOGAN_SHAPES.forEach((shape, s) => TILE_TONES.forEach((t, c) => {
    list.push(own(`slogan-${q}-${s}-${t.id}`, `${lines.join(" ")} – ${shape}, ${t.name}`, "Quotes", ["quote", "text", "slogan", t.id, ...words(lines)], { kind: "slogan", q, s, c }, [t.a]));
  })));
  RACING.forEach((word, q) => RACING_SHAPES.forEach((shape, s) => TILE_TONES.forEach((t, c) => {
    list.push(own(`racing-${q}-${s}-${t.id}`, `${word} – ${shape}, ${t.name}`, "Racing", ["racing", "car", "speed", "motorsport", t.id, ...words([word])], { kind: "racing", q, s, c }, [t.a]));
  })));
  DOODLES.forEach((doodle, q) => TONES.forEach((t, c) => [false, true].forEach((sparkle) => {
    list.push(own(`doodle-${q}-${t.id}-${sparkle ? "s" : "p"}`, `${doodle.name} – ${t.name}${sparkle ? ", Sparkles" : ""}`, "Doodles", ["doodle", "graffiti", "cartoon", t.id, ...doodle.tags], { kind: "doodle", q, c, sparkle }, [t.a]));
  })));
  FACE_EYES.forEach((eyes, e) => FACE_MOUTHS.forEach((mouth, m) => FACE_EXTRAS.forEach((extra, x) => FACE_SKINS.forEach((skin, k) => {
    const name = `${eyes[0]}, ${mouth[0]}${extra[0] ? ` ${extra[0]}` : ""} – ${skin[0]}`;
    list.push(own(`face-${e}-${m}-${x}-${k}`, name, "Faces", ["face", "emoji", "emotion", "smiley", ...words([eyes[0], mouth[0], extra[0]])], { kind: "face", e, m, x, k }, [skin[1]]));
  }))));
  OBJECTS.forEach((object, q) => TILE_TONES.forEach((t, c) => {
    list.push(own(`object-${q}-${t.id}`, `${object.name} – ${t.name}`, "Sports & Objects", [t.id, ...object.tags], { kind: "object", q, c }, [t.a]));
  }));
  ownStickers = list;
  return list;
}

export function renderStickerFromDef(def: AssetDef): string {
  const p = def.params as { kind: string; q: number; s: number; c: number; sparkle?: boolean; e: number; m: number; x: number; k: number };
  if (p.kind === "code") return drawCode(CODE_LINES[p.q], p.s, TILE_TONES[p.c]);
  if (p.kind === "slogan") return drawSlogan(SLOGANS[p.q], p.s, TILE_TONES[p.c]);
  if (p.kind === "racing") return drawRacing(RACING[p.q], p.s, TILE_TONES[p.c], p.q * 7 + p.c * 13);
  if (p.kind === "doodle") return dieCut(`${DOODLES[p.q].draw(TONES[p.c].a, TONES[p.c].b)}${p.sparkle ? SPARKLE : ""}`);
  if (p.kind === "face") return drawFace(p.e, p.m, p.x, p.k);
  if (p.kind === "object") return dieCut(OBJECTS[p.q].draw(TILE_TONES[p.c].a, TILE_TONES[p.c].b));
  return "";
}

// ── Emoji sets ───────────────────────────────────────────────────────────────

interface EmojiSet { name: string; license: string; base: string; ext: string }
interface EmojiCatalogue {
  sets: { twemoji: EmojiSet; notoFlat: EmojiSet; noto3d: EmojiSet; openmoji: EmojiSet };
  groups: string[];
  items: [string, number, string | 0, string | 0, number, string | 0][];
}

let emojiStickers: Promise<AssetDef[]> | null = null;

function loadEmojiStickers(): Promise<AssetDef[]> {
  if (emojiStickers) return emojiStickers;
  emojiStickers = fetch("/data/sticker-emoji.json")
    .then((res) => (res.ok ? (res.json() as Promise<EmojiCatalogue>) : Promise.reject(new Error("no emoji catalogue"))))
    .then((data) => {
      const list: AssetDef[] = [];
      const add = (set: EmojiSet, key: string, file: string, name: string, group: string, thumb: string, full: string, vector: boolean) => {
        const title = name.charAt(0).toUpperCase() + name.slice(1);
        list.push({
          id: `sticker-${key}-${file}`, name: `${title} – ${set.name}`, category: "stickers", subcategory: group,
          tags: ["sticker", "emoji", ...name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)], keywords: [group.toLowerCase(), set.name.toLowerCase()],
          thumbnailUrl: thumb, fileUrl: full, templateId: "sticker-emoji", params: { vector }, format: vector ? "svg" : "png",
          width: 480, height: 480, editable: false, animated: false, style: vector ? "flat" : "3d", colors: [],
          license: set.license, source: set.name, author: set.name,
        });
      };
      for (const [name, g, tw, noto, art, om] of data.items) {
        const group = data.groups[g];
        if (tw) add(data.sets.twemoji, "tw", tw, name, group, data.sets.twemoji.base + tw + ".svg", data.sets.twemoji.base + tw + ".svg", true);
        if (noto && art & 2) add(data.sets.noto3d, "n3", noto, name, group, `${data.sets.noto3d.base}128/${noto}.png`, `${data.sets.noto3d.base}512/${noto}.png`, false);
        if (om) add(data.sets.openmoji, "om", om, name, group, data.sets.openmoji.base + om + ".svg", data.sets.openmoji.base + om + ".svg", true);
        if (noto && art & 1) add(data.sets.notoFlat, "n2", noto, name, group, data.sets.notoFlat.base + noto + ".svg", data.sets.notoFlat.base + noto + ".svg", true);
      }
      return list;
    })
    .catch(() => {
      // Without the catalogue the category still shows Falcon's own stickers
      emojiStickers = null;
      return [];
    });
  return emojiStickers;
}

// ── Iconify sets ─────────────────────────────────────────────────────────────

interface IconifyCatalogue {
  base: string;
  sets: { prefix: string; name: string; author: string; license: string; group: string; icons: string[] }[];
}

let iconifyStickers: Promise<AssetDef[]> | null = null;

function loadIconifyStickers(): Promise<AssetDef[]> {
  if (iconifyStickers) return iconifyStickers;
  iconifyStickers = fetch("/data/sticker-iconify.json")
    .then((res) => (res.ok ? (res.json() as Promise<IconifyCatalogue>) : Promise.reject(new Error("no Iconify catalogue"))))
    .then((data) => {
      const list: AssetDef[] = [];
      for (const set of data.sets) {
        for (const icon of set.icons) {
          const words = icon.split("-").filter(Boolean);
          const title = words.join(" ").replace(/^\w/, (ch) => ch.toUpperCase());
          const url = `${data.base}${set.prefix}/${icon}.svg`;
          list.push({
            id: `sticker-if-${set.prefix}-${icon}`, name: `${title} – ${set.name}`, category: "stickers", subcategory: set.group,
            tags: ["sticker", ...words], keywords: [set.group.toLowerCase(), set.name.toLowerCase(), set.prefix],
            thumbnailUrl: url, fileUrl: url, templateId: "sticker-iconify", params: { vector: true }, format: "svg",
            width: 480, height: 480, editable: false, animated: false, style: "flat", colors: [],
            license: set.license, source: `${set.name} (Iconify)`, author: set.author,
          });
        }
      }
      return list;
    })
    .catch(() => {
      iconifyStickers = null;
      return [];
    });
  return iconifyStickers;
}

/** Visits every position once in a scattered order, so neighbours differ */
function scatter<T>(list: T[], stride: number): T[] {
  const n = list.length;
  if (n < 3) return list;
  let step = stride % n || 1;
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  while (gcd(step, n) !== 1) step++;
  return list.map((_, i) => list[(i * step) % n]);
}

let allStickers: Promise<AssetDef[]> | null = null;

export function getStickerAssets(): Promise<AssetDef[]> {
  if (allStickers) return allStickers;
  allStickers = Promise.all([loadEmojiStickers(), loadIconifyStickers()]).then(([emojiSets, iconify]) => {
    const emoji = [...emojiSets, ...iconify];
    const mine = scatter(getOwnStickers(), 2311);
    // People come in many skin tones, which would crowd out everything else if mixed in evenly
    const theirs = [...scatter(emoji.filter((s) => s.subcategory !== "People"), 7919), ...scatter(emoji.filter((s) => s.subcategory === "People"), 7919)];
    // Falcon's own designs are spread through the emoji so the first screens show a bit of everything
    const out: AssetDef[] = [];
    const per = Math.max(1, Math.round(theirs.length / Math.max(1, mine.length)));
    let e = 0;
    for (const sticker of mine) {
      out.push(sticker);
      for (let i = 0; i < per && e < theirs.length; i++) out.push(theirs[e++]);
    }
    while (e < theirs.length) out.push(theirs[e++]);
    // A catalogue that failed to load is tried again the next time the category opens
    if (!emojiSets.length || !iconify.length) allStickers = null;
    return out;
  });
  return allStickers;
}

export const OWN_STICKER_COUNT =
  CODE_LINES.length * CODE_SHAPES.length * TILE_TONES.length +
  SLOGANS.length * SLOGAN_SHAPES.length * TILE_TONES.length +
  RACING.length * RACING_SHAPES.length * TILE_TONES.length +
  DOODLES.length * TONES.length * 2 +
  FACE_EYES.length * FACE_MOUTHS.length * FACE_EXTRAS.length * FACE_SKINS.length +
  OBJECTS.length * TILE_TONES.length;

export const STICKERS_COUNT = OWN_STICKER_COUNT + EMOJI_STICKER_COUNT + ICONIFY_STICKER_COUNT;

// ── Putting a sticker on the canvas ──────────────────────────────────────────

/**
 * The picture to place on the canvas. Vector emoji are fetched and given the
 * same cut-out border as Falcon's own stickers; the 3D ones are photos of
 * models and are used as they are.
 */
export async function getStickerInsertSrc(def: AssetDef): Promise<string> {
  if (!def.fileUrl) return renderStickerFromDef(def);
  if (!def.params?.vector) return def.fileUrl;
  try {
    const res = await fetch(def.fileUrl);
    if (!res.ok) return def.fileUrl;
    const text = (await res.text()).replace(/<\?xml[^>]*\?>/g, "").replace(/<!DOCTYPE[^>]*>/gi, "").trim();
    const open = /<svg\b([^>]*)>/i.exec(text);
    if (!open) return def.fileUrl;
    let attrs = open[1];
    const w = /\swidth="([\d.]+)/.exec(attrs)?.[1];
    const h = /\sheight="([\d.]+)/.exec(attrs)?.[1];
    if (!/viewBox=/.test(attrs) && w && h) attrs += ` viewBox="0 0 ${w} ${h}"`;
    attrs = attrs.replace(/\s(width|height|x|y)="[^"]*"/g, "");
    const inner = text.replace(open[0], `<svg${attrs} x="30" y="30" width="180" height="180">`);
    return dieCut(inner);
  } catch {
    return def.fileUrl;
  }
}
