/**
 * Builds the bulk of the text style library.
 *
 * A style is one effect (neon, 3D, outline, badge, …) in one colour set and
 * one font. Every combination of the three is different, and the list is
 * walked in a stride so neighbouring styles differ in all three, which keeps
 * the panel varied wherever the user scrolls to.
 */
import type { TextDesignStyle } from "./textDesignStyles";

interface Colors {
  id: string;
  name: string;
  main: string;
  dark: string;
  darker: string;
  light: string;
  /** A contrasting second colour */
  alt: string;
}

type ColorRow = [string, string, string, string, string, string, string];

// id, name, main, dark, darker, light, alt
const COLOR_ROWS: ColorRow[] = [
  ["sunset", "Sunset", "#FF7A00", "#C2410C", "#7C2D12", "#FFE8CC", "#7C3AED"],
  ["ocean", "Ocean", "#00B4D8", "#0077B6", "#023E8A", "#CAF0F8", "#F72585"],
  ["lime", "Lime", "#A3E635", "#65A30D", "#365314", "#F7FEE7", "#06B6D4"],
  ["rose", "Rose", "#FB7185", "#E11D48", "#881337", "#FFE4E6", "#FDE047"],
  ["violet", "Violet", "#A78BFA", "#7C3AED", "#4C1D95", "#EDE9FE", "#34D399"],
  ["gold", "Gold", "#F5D76E", "#D4AF37", "#8A6614", "#FFF8DC", "#F59E0B"],
  ["crimson", "Crimson", "#EF4444", "#B91C1C", "#7F1D1D", "#FEE2E2", "#FACC15"],
  ["mint", "Mint", "#6EE7B7", "#10B981", "#065F46", "#ECFDF5", "#F472B6"],
  ["sky", "Sky", "#7DD3FC", "#0EA5E9", "#075985", "#F0F9FF", "#FB923C"],
  ["magenta", "Magenta", "#F0ABFC", "#D946EF", "#86198F", "#FDF4FF", "#22D3EE"],
  ["amber", "Amber", "#FCD34D", "#F59E0B", "#92400E", "#FFFBEB", "#EF4444"],
  ["teal", "Teal", "#5EEAD4", "#14B8A6", "#115E59", "#F0FDFA", "#F97316"],
  ["coral", "Coral", "#FDA4AF", "#F43F5E", "#9F1239", "#FFF1F2", "#38BDF8"],
  ["indigo", "Indigo", "#818CF8", "#4F46E5", "#312E81", "#EEF2FF", "#FBBF24"],
  ["ice", "Ice", "#E0F2FE", "#93C5FD", "#1D4ED8", "#FFFFFF", "#F472B6"],
  ["ember", "Ember", "#FDBA74", "#EA580C", "#7C2D12", "#FFF7ED", "#FDE047"],
  ["forest", "Forest", "#86EFAC", "#16A34A", "#14532D", "#F0FDF4", "#FDE68A"],
  ["mono", "Mono", "#FFFFFF", "#A1A1AA", "#3F3F46", "#FAFAFA", "#EF4444"],
  ["bubblegum", "Bubblegum", "#F9A8D4", "#EC4899", "#9D174D", "#FDF2F8", "#67E8F9"],
  ["cyber", "Cyber", "#22D3EE", "#0891B2", "#164E63", "#ECFEFF", "#FF2E97"],
];

const COLORS: Colors[] = COLOR_ROWS.map(([id, name, main, dark, darker, light, alt]) => ({ id, name, main, dark, darker, light, alt }));

/** Family and the weight to set it in */
type Face = [string, number];

interface Effect {
  id: string;
  name: string;
  category: TextDesignStyle["category"];
  faces: Face[];
  words: string[];
  size: number;
  build: (c: Colors) => Partial<TextDesignStyle>;
}

/** Shadows stepped out one pixel at a time, which reads as solid depth */
function stepped(steps: number, dx: number, dy: number, from: string, to: string): string {
  const parts: string[] = [];
  for (let i = 1; i <= steps; i++) parts.push(`${dx * i}px ${dy * i}px 0 ${i <= steps / 2 ? from : to}`);
  return parts.join(", ");
}

/** A solid outline made of shadows in eight directions */
function ring(width: number, color: string): string {
  const w = width;
  return [[-w, -w], [w, -w], [-w, w], [w, w], [0, -w], [0, w], [-w, 0], [w, 0]].map(([x, y]) => `${x}px ${y}px 0 ${color}`).join(", ");
}

const EFFECTS: Effect[] = [
  {
    id: "neon", name: "Neon", category: "neon", size: 46,
    faces: [["Monoton", 400], ["Tilt Neon", 400], ["Sacramento", 400], ["Pacifico", 400], ["Orbitron", 700], ["Righteous", 400], ["Audiowide", 400], ["Yellowtail", 400]],
    words: ["Open", "Neon", "Night", "Glow", "Live", "Vibes", "Disco", "Lounge"],
    build: (c) => ({ color: c.light, textShadow: `0 0 4px #ffffff, 0 0 10px ${c.main}, 0 0 22px ${c.main}, 0 0 42px ${c.dark}` }),
  },
  {
    id: "extrude", name: "3D", category: "3d", size: 50,
    faces: [["Bungee", 400], ["Alfa Slab One", 400], ["Titan One", 400], ["Luckiest Guy", 400], ["Anton", 400], ["Bowlby One", 400], ["Passion One", 700], ["Rubik", 900]],
    words: ["WOW", "BIG", "SALE", "PLAY", "BOLD", "MEGA", "HEY", "TOP"],
    build: (c) => ({ color: c.main, textTransform: "uppercase", letterSpacing: "1px", textShadow: stepped(6, 1, 1, c.dark, c.darker) }),
  },
  {
    id: "long-shadow", name: "Long Shadow", category: "shadow", size: 48,
    faces: [["Bebas Neue", 400], ["Oswald", 700], ["Archivo Black", 400], ["Montserrat", 900], ["Poppins", 800], ["Fjalla One", 400], ["Teko", 700], ["League Spartan", 800]],
    words: ["FOCUS", "MOVE", "RISE", "NOW", "DRIVE", "PEAK", "FLOW", "PUSH"],
    build: (c) => ({ color: c.light, textTransform: "uppercase", letterSpacing: "2px", textShadow: stepped(12, 1, 1, c.dark, c.dark) }),
  },
  {
    id: "outline", name: "Outline", category: "outline", size: 52,
    faces: [["Anton", 400], ["Bebas Neue", 400], ["Archivo Black", 400], ["Montserrat", 900], ["Oswald", 700], ["Unbounded", 800], ["Syne", 800], ["Big Shoulders", 800]],
    words: ["OUTLINE", "HOLLOW", "FRAME", "EDGE", "LINES", "TRACE", "FORM", "VOID"],
    build: (c) => ({ color: "transparent", stroke: c.main, strokeWidth: 2, textTransform: "uppercase", letterSpacing: "4px" }),
  },
  {
    id: "retro", name: "Retro", category: "retro", size: 46,
    faces: [["Lobster", 400], ["Pacifico", 400], ["Righteous", 400], ["Shrikhand", 400], ["Fredoka", 700], ["Kaushan Script", 400], ["Chewy", 400], ["Bungee Shade", 400]],
    words: ["Groovy", "Retro", "Diner", "Classic", "Summer", "Sunny", "Radio", "Vinyl"],
    build: (c) => ({ color: c.light, textShadow: `3px 3px 0 ${c.main}, 6px 6px 0 ${c.alt}` }),
  },
  {
    id: "gradient", name: "Gradient", category: "gradient", size: 48,
    faces: [["Poppins", 800], ["Montserrat", 900], ["Sora", 800], ["Outfit", 800], ["Syne", 800], ["Unbounded", 700], ["Urbanist", 900], ["Plus Jakarta Sans", 800]],
    words: ["Dream", "Create", "Launch", "Fresh", "Vision", "Spark", "Bloom", "Shine"],
    build: (c) => ({ color: c.main, backgroundGradient: `linear-gradient(135deg, ${c.main} 0%, ${c.alt} 100%)` }),
  },
  {
    id: "badge", name: "Badge", category: "social-media", size: 40,
    faces: [["Poppins", 700], ["Inter", 800], ["DM Sans", 700], ["Nunito", 800], ["Rubik", 700], ["Quicksand", 700], ["Space Grotesk", 700], ["Manrope", 800]],
    words: ["NEW", "SALE", "LIVE", "HOT", "FREE", "TODAY", "JOIN", "VIP"],
    build: (c) => ({ color: "#ffffff", textTransform: "uppercase", letterSpacing: "3px", badgeBg: c.dark, badgeRadius: "10px", badgePadding: "6px 18px", textShadow: `1px 2px 0 ${c.darker}` }),
  },
  {
    id: "luxe", name: "Luxe", category: "luxury", size: 36,
    faces: [["Cinzel", 700], ["Playfair Display", 700], ["Cormorant Garamond", 700], ["Marcellus", 400], ["Bodoni Moda", 700], ["Italiana", 400], ["Prata", 400], ["Cinzel Decorative", 700]],
    words: ["ELEGANCE", "LUXURY", "ATELIER", "MAISON", "ROYAL", "PRESTIGE", "COUTURE", "GALA"],
    build: (c) => ({ color: c.main, textTransform: "uppercase", letterSpacing: "5px", textShadow: `0 2px 8px ${c.main}66, 0 0 20px ${c.main}40` }),
  },
  {
    id: "glitch", name: "Glitch", category: "gaming", size: 46,
    faces: [["Orbitron", 800], ["Rajdhani", 700], ["Press Start 2P", 400], ["Audiowide", 400], ["Russo One", 400], ["Black Ops One", 400], ["Teko", 700], ["Chakra Petch", 700]],
    words: ["GLITCH", "PLAYER", "LEVEL UP", "GAME ON", "VERSUS", "RESPAWN", "COMBO", "BOSS"],
    build: (c) => ({ color: "#ffffff", textTransform: "uppercase", letterSpacing: "3px", textShadow: `-2px 0 ${c.main}, 2px 0 ${c.alt}, 0 0 8px ${c.main}` }),
  },
  {
    id: "sticker", name: "Sticker", category: "creative-title", size: 46,
    faces: [["Baloo 2", 800], ["Fredoka", 700], ["Chewy", 400], ["Luckiest Guy", 400], ["Lilita One", 400], ["Bangers", 400], ["Sniglet", 800], ["Paytone One", 400]],
    words: ["Yay!", "Hello", "Cute", "Fun!", "Party", "Smile", "Oops", "Woo!"],
    build: (c) => ({ color: c.dark, textShadow: `${ring(3, "#ffffff")}, 5px 7px 0 ${c.darker}` }),
  },
  {
    id: "script", name: "Script", category: "handwritten", size: 46,
    faces: [["Dancing Script", 700], ["Great Vibes", 400], ["Satisfy", 400], ["Kaushan Script", 400], ["Caveat", 700], ["Yellowtail", 400], ["Allura", 400], ["Parisienne", 400]],
    words: ["Thank you", "With love", "Welcome", "Cheers", "Congrats", "Best wishes", "Enjoy", "Hello"],
    build: (c) => ({ color: c.light, letterSpacing: "1px", textShadow: `2px 2px 0 ${c.dark}, 4px 4px 0 ${c.darker}` }),
  },
  {
    id: "comic", name: "Comic", category: "bold-poster", size: 52,
    faces: [["Bangers", 400], ["Luckiest Guy", 400], ["Bungee", 400], ["Titan One", 400], ["Anton", 400], ["Carter One", 400], ["Boogaloo", 400], ["Lilita One", 400]],
    words: ["BOOM!", "POW!", "ZAP!", "WHAM!", "BANG!", "KAPOW", "CRASH", "ZOOM!"],
    build: (c) => ({ color: c.main, stroke: "#111111", strokeWidth: 2, textTransform: "uppercase", letterSpacing: "2px", textShadow: `4px 4px 0 #111111` }),
  },
  {
    id: "future", name: "Future", category: "futuristic", size: 40,
    faces: [["Orbitron", 700], ["Michroma", 400], ["Syncopate", 700], ["Audiowide", 400], ["Exo 2", 800], ["Oxanium", 700], ["Quantico", 700], ["Tomorrow", 700]],
    words: ["FUTURE", "ORBIT", "NOVA", "PULSE", "VECTOR", "QUANTUM", "CYBER", "ZERO"],
    build: (c) => ({ color: c.main, textTransform: "uppercase", letterSpacing: "4px", backgroundGradient: `linear-gradient(180deg, #ffffff 0%, ${c.main} 100%)` }),
  },
  {
    id: "glow", name: "Glow", category: "neon", size: 50,
    faces: [["Creepster", 400], ["Metal Mania", 400], ["Rubik Wet Paint", 400], ["Butcherman", 400], ["Eater", 400], ["Pirata One", 400], ["Nosifer", 400], ["New Rocker", 400]],
    words: ["Spooky", "Haunted", "Midnight", "Beware", "Fright", "Mystic", "Shadow", "Eerie"],
    build: (c) => ({ color: c.main, letterSpacing: "2px", textShadow: `0 0 6px ${c.main}, 0 0 18px ${c.alt}, 0 4px 26px ${c.alt}` }),
  },
  {
    id: "duo", name: "Duo", category: "creative-title", size: 40,
    faces: [["Playfair Display", 800], ["Abril Fatface", 400], ["DM Serif Display", 400], ["Bebas Neue", 400], ["Oswald", 700], ["Cinzel", 700], ["Anton", 400], ["Montserrat", 800]],
    words: ["MAGIC", "STORY", "MOMENTS", "MEMORIES", "ADVENTURE", "WONDER", "JOURNEY", "DREAMS"],
    build: (c) => ({ color: c.light, textTransform: "uppercase", letterSpacing: "4px", textShadow: `0 0 12px ${c.main}, 0 0 28px ${c.dark}` }),
  },
  {
    id: "vintage", name: "Vintage", category: "retro", size: 42,
    faces: [["Rye", 400], ["Ultra", 400], ["Abril Fatface", 400], ["Alfa Slab One", 400], ["Bevan", 400], ["Holtwood One SC", 400], ["Sancreek", 400], ["Graduate", 400]],
    words: ["SALOON", "EST. 1987", "ORIGINAL", "HANDMADE", "VINTAGE", "WESTERN", "CRAFTED", "SUPPLY"],
    build: (c) => ({ color: c.light, textTransform: "uppercase", letterSpacing: "3px", textShadow: `1px 1px 0 ${c.dark}, 2px 2px 0 ${c.dark}, 3px 3px 0 ${c.darker}, 4px 4px 0 ${c.darker}` }),
  },
  {
    id: "soft", name: "Soft Shadow", category: "shadow", size: 44,
    faces: [["Poppins", 600], ["Quicksand", 700], ["Comfortaa", 700], ["Nunito", 800], ["Varela Round", 400], ["Josefin Sans", 700], ["Raleway", 800], ["Lexend", 700]],
    words: ["Breathe", "Calm", "Gentle", "Simple", "Relax", "Balance", "Pause", "Ease"],
    build: (c) => ({ color: "#ffffff", textShadow: `0 6px 18px ${c.main}, 0 2px 4px rgba(0,0,0,0.5)` }),
  },
  {
    id: "pop", name: "Pop", category: "outline", size: 48,
    faces: [["Rubik", 900], ["Archivo Black", 400], ["Bowlby One", 400], ["Dela Gothic One", 400], ["Changa One", 400], ["Bungee", 400], ["Kanit", 800], ["Passion One", 900]],
    words: ["POP!", "LOUD", "FRESH", "DROP", "HYPE", "FIRE", "COOL", "YES!"],
    build: (c) => ({ color: c.main, stroke: "#ffffff", strokeWidth: 2, textTransform: "uppercase", letterSpacing: "2px", textShadow: `4px 4px 0 ${c.alt}` }),
  },
  {
    id: "chrome", name: "Chrome", category: "luxury", size: 44,
    faces: [["Cinzel", 800], ["Playfair Display", 800], ["Bodoni Moda", 800], ["Abril Fatface", 400], ["Yeseva One", 400], ["Rozha One", 400], ["Limelight", 400], ["Cormorant", 700]],
    words: ["GRAND", "PREMIER", "AWARDS", "ELITE", "ICON", "LEGEND", "OPULENT", "REGAL"],
    build: (c) => ({ color: c.main, textTransform: "uppercase", letterSpacing: "3px", backgroundGradient: `linear-gradient(180deg, ${c.light} 0%, ${c.main} 45%, ${c.darker} 55%, ${c.main} 100%)` }),
  },
  {
    id: "tag", name: "Tag", category: "social-media", size: 34,
    faces: [["Inter", 700], ["Montserrat", 700], ["Space Grotesk", 700], ["DM Sans", 700], ["Barlow", 700], ["Work Sans", 700], ["Figtree", 700], ["Jost", 600]],
    words: ["FOLLOW", "SWIPE UP", "LINK IN BIO", "TRENDING", "SUBSCRIBE", "SAVE THIS", "SHARE", "NEW POST"],
    build: (c) => ({ color: c.main, textTransform: "uppercase", letterSpacing: "3px", badgeBorder: `2px solid ${c.main}`, badgeRadius: "999px", badgePadding: "6px 18px" }),
  },
];

const FACES_PER_EFFECT = 8;
const COMBINATIONS = EFFECTS.length * COLORS.length * FACES_PER_EFFECT;
/** Shares no factor with the number of combinations, so stepping by it visits each one once */
const STRIDE = 1237;

/** How many styles the generator can make without repeating itself */
export const GENERATED_STYLE_LIMIT = COMBINATIONS;

export function generateTextStyles(count: number): TextDesignStyle[] {
  const styles: TextDesignStyle[] = [];
  const total = Math.min(count, COMBINATIONS);
  for (let i = 0; i < total; i++) {
    const k = (i * STRIDE) % COMBINATIONS;
    const effect = EFFECTS[k % EFFECTS.length];
    const colors = COLORS[Math.floor(k / EFFECTS.length) % COLORS.length];
    const faceIndex = Math.floor(k / (EFFECTS.length * COLORS.length)) % FACES_PER_EFFECT;
    const [fontFamily, fontWeight] = effect.faces[faceIndex];
    const word = effect.words[(faceIndex + Math.floor(k / EFFECTS.length)) % effect.words.length];
    const style: TextDesignStyle = {
      id: `gen-${effect.id}-${colors.id}-${faceIndex}`,
      name: `${colors.name} ${effect.name} · ${fontFamily}`,
      category: effect.category,
      sampleText: word,
      fontFamily,
      fontSize: effect.size,
      fontWeight,
      color: colors.main,
      ...effect.build(colors),
    };
    if (effect.id === "duo") {
      style.secondaryText = "creating";
      style.secondaryStyle = { fontFamily: "Dancing Script", fontSize: 26, fontWeight: 700, color: colors.alt, letterSpacing: "2px" };
    }
    styles.push(style);
  }
  return styles;
}
