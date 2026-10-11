// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Asset Engine – 45 Curated Color Palettes
//  Each palette produces a visually distinct variation of every asset template
// ─────────────────────────────────────────────────────────────────────────────

import { Palette } from "./types";

export const PALETTES: Palette[] = [
  // Blues
  { id: "ocean",         name: "Ocean Blue",       tags: ["blue","ocean","cool","professional"],   primary:"#0ea5e9", secondary:"#38bdf8", accent:"#67e8f9", dark:"#0c4a6e", light:"#e0f2fe", mid:"#7dd3fc" },
  { id: "navy",          name: "Deep Navy",         tags: ["navy","dark","corporate","trust"],      primary:"#1e40af", secondary:"#3b82f6", accent:"#60a5fa", dark:"#1e3a5f", light:"#dbeafe", mid:"#93c5fd" },
  { id: "sky",           name: "Sky Breeze",        tags: ["sky","light","fresh","airy"],           primary:"#0284c7", secondary:"#0ea5e9", accent:"#38bdf8", dark:"#075985", light:"#e0f2fe", mid:"#7dd3fc" },
  { id: "royal",         name: "Royal Blue",        tags: ["royal","blue","premium","elegant"],     primary:"#4338ca", secondary:"#6366f1", accent:"#818cf8", dark:"#312e81", light:"#e0e7ff", mid:"#a5b4fc" },
  // Purples
  { id: "violet",        name: "Violet Storm",      tags: ["purple","violet","creative","bold"],    primary:"#7c3aed", secondary:"#8b5cf6", accent:"#a78bfa", dark:"#4c1d95", light:"#ede9fe", mid:"#c4b5fd" },
  { id: "lavender",      name: "Lavender Mist",     tags: ["lavender","light","soft","feminine"],  primary:"#a855f7", secondary:"#c084fc", accent:"#d8b4fe", dark:"#6b21a8", light:"#faf5ff", mid:"#e9d5ff" },
  { id: "magenta",       name: "Magenta Pop",       tags: ["magenta","vivid","bold","pop"],        primary:"#c026d3", secondary:"#e879f9", accent:"#f0abfc", dark:"#701a75", light:"#fdf4ff", mid:"#f5d0fe" },
  { id: "plum",          name: "Deep Plum",         tags: ["plum","dark","rich","luxury"],         primary:"#6d28d9", secondary:"#7c3aed", accent:"#8b5cf6", dark:"#4c1d95", light:"#f5f3ff", mid:"#c4b5fd" },
  // Pinks & Reds
  { id: "rose",          name: "Rose Petal",        tags: ["pink","rose","romantic","soft"],       primary:"#e11d48", secondary:"#f43f5e", accent:"#fb7185", dark:"#881337", light:"#fff1f2", mid:"#fda4af" },
  { id: "coral",         name: "Coral Sunset",      tags: ["coral","orange","warm","vibrant"],     primary:"#f43f5e", secondary:"#fb923c", accent:"#fcd34d", dark:"#9f1239", light:"#fff7f0", mid:"#fda4af" },
  { id: "crimson",       name: "Crimson Power",     tags: ["red","crimson","bold","strong"],       primary:"#dc2626", secondary:"#ef4444", accent:"#f87171", dark:"#7f1d1d", light:"#fef2f2", mid:"#fca5a5" },
  { id: "hot-pink",      name: "Hot Neon Pink",     tags: ["hot-pink","neon","electric","party"],  primary:"#ec4899", secondary:"#f472b6", accent:"#f9a8d4", dark:"#831843", light:"#fdf2f8", mid:"#fbcfe8" },
  // Oranges & Yellows
  { id: "amber",         name: "Warm Amber",        tags: ["amber","warm","golden","energy"],      primary:"#d97706", secondary:"#f59e0b", accent:"#fcd34d", dark:"#78350f", light:"#fffbeb", mid:"#fde68a" },
  { id: "sunset",        name: "Golden Sunset",     tags: ["orange","sunset","warm","gradient"],   primary:"#f97316", secondary:"#fb923c", accent:"#fed7aa", dark:"#c2410c", light:"#fff7ed", mid:"#fdba74" },
  { id: "lemon",         name: "Lemon Zest",        tags: ["yellow","lemon","bright","cheerful"],  primary:"#ca8a04", secondary:"#eab308", accent:"#fde047", dark:"#713f12", light:"#fefce8", mid:"#fef08a" },
  { id: "gold",          name: "Luxury Gold",       tags: ["gold","luxury","premium","metallic"],  primary:"#b45309", secondary:"#d97706", accent:"#f59e0b", dark:"#78350f", light:"#fffbeb", mid:"#fde68a" },
  // Greens
  { id: "emerald",       name: "Emerald Green",     tags: ["green","emerald","nature","fresh"],    primary:"#059669", secondary:"#10b981", accent:"#34d399", dark:"#064e3b", light:"#ecfdf5", mid:"#6ee7b7" },
  { id: "forest",        name: "Forest Dark",       tags: ["green","forest","dark","nature"],      primary:"#15803d", secondary:"#16a34a", accent:"#22c55e", dark:"#14532d", light:"#f0fdf4", mid:"#86efac" },
  { id: "lime",          name: "Electric Lime",     tags: ["lime","bright","fresh","electric"],    primary:"#65a30d", secondary:"#84cc16", accent:"#bef264", dark:"#365314", light:"#f7fee7", mid:"#d9f99d" },
  { id: "teal",          name: "Deep Teal",         tags: ["teal","dark","professional","cool"],   primary:"#0d9488", secondary:"#14b8a6", accent:"#2dd4bf", dark:"#134e4a", light:"#f0fdfa", mid:"#5eead4" },
  { id: "mint",          name: "Mint Fresh",        tags: ["mint","light","clean","fresh"],        primary:"#0891b2", secondary:"#06b6d4", accent:"#22d3ee", dark:"#164e63", light:"#ecfeff", mid:"#67e8f9" },
  // Teals & Cyans
  { id: "cyan",          name: "Neon Cyan",         tags: ["cyan","neon","tech","electric"],       primary:"#0e7490", secondary:"#06b6d4", accent:"#22d3ee", dark:"#083344", light:"#ecfeff", mid:"#a5f3fc" },
  { id: "turquoise",     name: "Turquoise Sea",     tags: ["turquoise","ocean","calm","tropical"], primary:"#0d9488", secondary:"#0ea5e9", accent:"#38bdf8", dark:"#0f766e", light:"#f0fdfa", mid:"#5eead4" },
  // Neutrals & Grays
  { id: "slate",         name: "Cool Slate",        tags: ["slate","gray","neutral","minimal"],    primary:"#475569", secondary:"#64748b", accent:"#94a3b8", dark:"#0f172a", light:"#f8fafc", mid:"#cbd5e1" },
  { id: "zinc",          name: "Dark Zinc",         tags: ["zinc","dark","minimal","clean"],       primary:"#52525b", secondary:"#71717a", accent:"#a1a1aa", dark:"#18181b", light:"#fafafa", mid:"#d4d4d8" },
  { id: "charcoal",      name: "Charcoal Black",    tags: ["charcoal","dark","bold","premium"],    primary:"#27272a", secondary:"#3f3f46", accent:"#71717a", dark:"#09090b", light:"#f4f4f5", mid:"#a1a1aa" },
  { id: "stone",         name: "Warm Stone",        tags: ["stone","warm","neutral","natural"],    primary:"#78716c", secondary:"#a8a29e", accent:"#d6d3d1", dark:"#44403c", light:"#fafaf9", mid:"#e7e5e4" },
  // Gradients (special palettes for gradient assets)
  { id: "aurora",        name: "Aurora Borealis",   tags: ["gradient","aurora","rainbow","vivid"], primary:"#8b5cf6", secondary:"#06b6d4", accent:"#10b981", dark:"#1e1b4b", light:"#f0fdfa", mid:"#67e8f9" },
  { id: "sunset-grad",   name: "Sunset Gradient",   tags: ["gradient","sunset","warm","beautiful"],primary:"#f97316", secondary:"#ec4899", accent:"#a855f7", dark:"#c2410c", light:"#fdf4ff", mid:"#fb7185" },
  { id: "ocean-grad",    name: "Ocean Gradient",    tags: ["gradient","ocean","cool","deep"],      primary:"#0ea5e9", secondary:"#8b5cf6", accent:"#ec4899", dark:"#1e3a5f", light:"#fdf2f8", mid:"#c084fc" },
  { id: "neon",          name: "Neon Electric",     tags: ["neon","electric","tech","vivid"],      primary:"#06b6d4", secondary:"#84cc16", accent:"#fde047", dark:"#0c4a6e", light:"#f7fee7", mid:"#22d3ee" },
  { id: "candy",         name: "Candy Pop",         tags: ["candy","fun","playful","bright"],      primary:"#ec4899", secondary:"#f97316", accent:"#fde047", dark:"#831843", light:"#fffbeb", mid:"#fda4af" },
  { id: "midnight",      name: "Midnight Dark",     tags: ["dark","midnight","moody","premium"],   primary:"#1e1b4b", secondary:"#312e81", accent:"#4338ca", dark:"#09090b", light:"#ede9fe", mid:"#818cf8" },
  { id: "holographic",   name: "Holographic",       tags: ["holographic","iridescent","premium"],  primary:"#e879f9", secondary:"#38bdf8", accent:"#4ade80", dark:"#3b0764", light:"#f0fdf4", mid:"#a5f3fc" },
  // Industry-specific
  { id: "fintech",       name: "FinTech Green",     tags: ["finance","money","success","growth"],  primary:"#16a34a", secondary:"#15803d", accent:"#4ade80", dark:"#14532d", light:"#f0fdf4", mid:"#86efac" },
  { id: "health",        name: "Health Care Blue",  tags: ["health","medical","clean","trust"],    primary:"#0284c7", secondary:"#0ea5e9", accent:"#7dd3fc", dark:"#082f49", light:"#e0f2fe", mid:"#38bdf8" },
  { id: "food",          name: "Food & Appetite",   tags: ["food","appetite","warm","delicious"],  primary:"#dc2626", secondary:"#f97316", accent:"#fde047", dark:"#7f1d1d", light:"#fffbeb", mid:"#fb923c" },
  { id: "edu",           name: "Education Blue",    tags: ["education","learning","academic"],      primary:"#1d4ed8", secondary:"#3b82f6", accent:"#93c5fd", dark:"#1e3a8a", light:"#eff6ff", mid:"#60a5fa" },
  { id: "creative",      name: "Creative Rainbow",  tags: ["creative","colorful","design","art"],  primary:"#7c3aed", secondary:"#f97316", accent:"#eab308", dark:"#3b0764", light:"#fffbeb", mid:"#f472b6" },
  { id: "tech",          name: "Tech Dark",         tags: ["tech","dark","modern","digital"],      primary:"#06b6d4", secondary:"#3b82f6", accent:"#8b5cf6", dark:"#0c0a09", light:"#ecfeff", mid:"#22d3ee" },
  { id: "eco",           name: "Eco Nature",        tags: ["eco","nature","green","sustainable"],  primary:"#15803d", secondary:"#65a30d", accent:"#a3e635", dark:"#14532d", light:"#f7fee7", mid:"#bbf7d0" },
  { id: "luxury",        name: "Luxury Black Gold", tags: ["luxury","gold","premium","exclusive"], primary:"#b45309", secondary:"#d97706", accent:"#fef08a", dark:"#1c1917", light:"#fffbeb", mid:"#fde68a" },
  { id: "social",        name: "Social Media",      tags: ["social","vibrant","engaging","fun"],   primary:"#dc2626", secondary:"#7c3aed", accent:"#0ea5e9", dark:"#1c1917", light:"#fdf4ff", mid:"#f9a8d4" },
  { id: "fashion",       name: "Fashion Chic",      tags: ["fashion","style","chic","elegant"],    primary:"#be185d", secondary:"#9333ea", accent:"#f472b6", dark:"#500724", light:"#fdf4ff", mid:"#e879f9" },
  { id: "sports",        name: "Sports Energy",     tags: ["sports","energy","bold","action"],     primary:"#dc2626", secondary:"#f97316", accent:"#facc15", dark:"#7f1d1d", light:"#fffbeb", mid:"#fb923c" },
];

export const PALETTE_COUNT = PALETTES.length; // 45

// Quick lookup
const PALETTE_MAP = new Map(PALETTES.map((p) => [p.id, p]));
export function getPalette(id: string): Palette {
  return PALETTE_MAP.get(id) ?? PALETTES[0];
}

// Return a palette by index (for cycling through all palettes)
export function getPaletteByIndex(i: number): Palette {
  return PALETTES[i % PALETTES.length];
}
