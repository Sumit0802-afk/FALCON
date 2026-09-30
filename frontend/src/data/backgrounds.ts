export interface BackgroundItem {
  id: string;
  name: string;
  category: string;
  type: "gradient" | "image" | "color";
  value: string;
  preview: string;
  tags: string[];
}

export const BACKGROUND_CATEGORIES = [
  {
    "id": "all",
    "label": "All Backgrounds"
  },
  {
    "id": "abstract",
    "label": "01. Abstract (20)"
  },
  {
    "id": "gradient",
    "label": "02. Gradient (20)"
  },
  {
    "id": "minimal",
    "label": "03. Minimal (20)"
  },
  {
    "id": "geometric",
    "label": "04. Geometric (20)"
  },
  {
    "id": "liquid",
    "label": "05. Liquid (20)"
  },
  {
    "id": "mesh-gradient",
    "label": "06. Mesh Gradient (20)"
  },
  {
    "id": "3d",
    "label": "07. 3D (20)"
  },
  {
    "id": "glassmorphism",
    "label": "08. Glassmorphism (20)"
  },
  {
    "id": "neumorphism",
    "label": "09. Neumorphism (20)"
  },
  {
    "id": "futuristic",
    "label": "10. Futuristic (20)"
  },
  {
    "id": "technology",
    "label": "11. Technology (20)"
  },
  {
    "id": "ai",
    "label": "12. AI & Neural (20)"
  },
  {
    "id": "cyberpunk",
    "label": "13. Cyberpunk (20)"
  },
  {
    "id": "neon",
    "label": "14. Neon (20)"
  },
  {
    "id": "glitch",
    "label": "15. Glitch (20)"
  },
  {
    "id": "textures",
    "label": "Textures & Patterns"
  },
  {
    "id": "nature",
    "label": "Nature & Sky"
  },
  {
    "id": "studio",
    "label": "Studio & Solids"
  }
] as const;

export const BACKGROUNDS_DATA: BackgroundItem[] = [
  {
    "id": "abstract-001-fluid-orbit",
    "name": "Fluid Orbit Ribbon",
    "category": "abstract",
    "type": "gradient",
    "value": "radial-gradient(circle at 65% 35%, rgba(99,102,241,0.9) 0%, rgba(236,72,153,0.7) 35%, rgba(15,23,42,0.98) 70%), linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)",
    "preview": "radial-gradient(circle at 65% 35%, rgba(99,102,241,0.9) 0%, rgba(236,72,153,0.7) 35%, rgba(15,23,42,0.98) 70%), linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)",
    "tags": [
      "abstract",
      "orbit",
      "fluid",
      "indigo",
      "magenta",
      "dark",
      "glow"
    ]
  },
  {
    "id": "abstract-002-dark-wave",
    "name": "Dark Wave Sculpt",
    "category": "abstract",
    "type": "gradient",
    "value": "linear-gradient(160deg, #090a0f 0%, #181926 40%, #1e2030 60%, #0c0d14 100%)",
    "preview": "linear-gradient(160deg, #090a0f 0%, #181926 40%, #1e2030 60%, #0c0d14 100%)",
    "tags": [
      "abstract",
      "dark",
      "wave",
      "charcoal",
      "minimal",
      "sleek"
    ]
  },
  {
    "id": "abstract-003-kinetic-planes",
    "name": "Kinetic Terracotta Planes",
    "category": "abstract",
    "type": "gradient",
    "value": "linear-gradient(45deg, #9a3412 0%, #ea580c 35%, #fed7aa 70%, #fff7ed 100%)",
    "preview": "linear-gradient(45deg, #9a3412 0%, #ea580c 35%, #fed7aa 70%, #fff7ed 100%)",
    "tags": [
      "abstract",
      "terracotta",
      "geometric",
      "planes",
      "warm",
      "editorial"
    ]
  },
  {
    "id": "abstract-004-macro-pigment-flow",
    "name": "Macro Pigment Swirl",
    "category": "abstract",
    "type": "image",
    "value": "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1400&q=80",
    "preview": "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80",
    "tags": [
      "abstract",
      "pigment",
      "fluid",
      "artistic",
      "cobalt",
      "swirl"
    ]
  },
  {
    "id": "abstract-005-topographic-contour",
    "name": "Golden Topo Elevation",
    "category": "abstract",
    "type": "gradient",
    "value": "radial-gradient(ellipse at 80% 20%, #451a03 0%, #1c1917 50%, #0c0a09 100%)",
    "preview": "radial-gradient(ellipse at 80% 20%, #451a03 0%, #1c1917 50%, #0c0a09 100%)",
    "tags": [
      "abstract",
      "topography",
      "contour",
      "gold",
      "dark",
      "lines"
    ]
  },
  {
    "id": "abstract-006-prismatic-refraction",
    "name": "Prismatic Light Beam",
    "category": "abstract",
    "type": "gradient",
    "value": "radial-gradient(circle at 25% 30%, rgba(236,72,153,0.7) 0%, rgba(99,102,241,0.5) 30%, transparent 60%), radial-gradient(circle at 75% 70%, rgba(34,197,94,0.4) 0%, rgba(6,182,212,0.5) 35%, transparent 65%), #09090b",
    "preview": "radial-gradient(circle at 25% 30%, rgba(236,72,153,0.7) 0%, rgba(99,102,241,0.5) 30%, transparent 60%), radial-gradient(circle at 75% 70%, rgba(34,197,94,0.4) 0%, rgba(6,182,212,0.5) 35%, transparent 65%), #09090b",
    "tags": [
      "abstract",
      "prismatic",
      "refraction",
      "spectrum",
      "rainbow",
      "optics"
    ]
  },
  {
    "id": "abstract-007-monochrome-origami",
    "name": "Monochrome Faceted Origami",
    "category": "abstract",
    "type": "gradient",
    "value": "linear-gradient(135deg, #18181b 0%, #27272a 35%, #71717a 65%, #f4f4f5 100%)",
    "preview": "linear-gradient(135deg, #18181b 0%, #27272a 35%, #71717a 65%, #f4f4f5 100%)",
    "tags": [
      "abstract",
      "origami",
      "facets",
      "monochrome",
      "geometric",
      "angles"
    ]
  },
  {
    "id": "abstract-008-solar-flare-corona",
    "name": "Solar Corona Flare",
    "category": "abstract",
    "type": "gradient",
    "value": "radial-gradient(circle at 90% 10%, #fbbf24 0%, #ea580c 25%, #7c2d12 55%, #180902 100%)",
    "preview": "radial-gradient(circle at 90% 10%, #fbbf24 0%, #ea580c 25%, #7c2d12 55%, #180902 100%)",
    "tags": [
      "abstract",
      "solar",
      "corona",
      "warm",
      "amber",
      "fire"
    ]
  },
  {
    "id": "abstract-009-brutalist-block-cluster",
    "name": "Brutalist Stone Blocks",
    "category": "abstract",
    "type": "image",
    "value": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80",
    "preview": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80",
    "tags": [
      "abstract",
      "brutalist",
      "stone",
      "shadows",
      "architectural"
    ]
  },
  {
    "id": "abstract-010-liquid-silk-drape",
    "name": "Liquid Copper Silk",
    "category": "abstract",
    "type": "gradient",
    "value": "linear-gradient(135deg, #78350f 0%, #b45309 30%, #fde68a 60%, #92400e 100%)",
    "preview": "linear-gradient(135deg, #78350f 0%, #b45309 30%, #fde68a 60%, #92400e 100%)",
    "tags": [
      "abstract",
      "silk",
      "copper",
      "drape",
      "luxury",
      "metallic"
    ]
  },
  {
    "id": "abstract-011-cellular-voronoi",
    "name": "Bioluminescent Voronoi",
    "category": "abstract",
    "type": "gradient",
    "value": "radial-gradient(circle at 30% 40%, rgba(6,182,212,0.7) 0%, rgba(59,130,246,0.3) 40%, transparent 70%), linear-gradient(180deg, #020617 0%, #0f172a 100%)",
    "preview": "radial-gradient(circle at 30% 40%, rgba(6,182,212,0.7) 0%, rgba(59,130,246,0.3) 40%, transparent 70%), linear-gradient(180deg, #020617 0%, #0f172a 100%)",
    "tags": [
      "abstract",
      "voronoi",
      "cellular",
      "cyan",
      "bioluminescent",
      "navy"
    ]
  },
  {
    "id": "abstract-012-gaussian-chroma-bleed",
    "name": "Gaussian Chroma Bleed",
    "category": "abstract",
    "type": "gradient",
    "value": "radial-gradient(at 20% 30%, #ddd6fe 0px, transparent 50%), radial-gradient(at 80% 20%, #fed7aa 0px, transparent 50%), radial-gradient(at 50% 80%, #bbf7d0 0px, transparent 50%), #fafafa",
    "preview": "radial-gradient(at 20% 30%, #ddd6fe 0px, transparent 50%), radial-gradient(at 80% 20%, #fed7aa 0px, transparent 50%), radial-gradient(at 50% 80%, #bbf7d0 0px, transparent 50%), #fafafa",
    "tags": [
      "abstract",
      "pastel",
      "chroma",
      "soft",
      "light",
      "minimal"
    ]
  },
  {
    "id": "abstract-013-wireframe-terrain-horizon",
    "name": "Wireframe Grid Horizon",
    "category": "abstract",
    "type": "gradient",
    "value": "linear-gradient(180deg, #020617 0%, #064e3b 70%, #10b981 100%)",
    "preview": "linear-gradient(180deg, #020617 0%, #064e3b 70%, #10b981 100%)",
    "tags": [
      "abstract",
      "wireframe",
      "grid",
      "emerald",
      "matrix",
      "horizon"
    ]
  },
  {
    "id": "abstract-014-suspended-mercury-droplets",
    "name": "Liquid Mercury Drops",
    "category": "abstract",
    "type": "gradient",
    "value": "radial-gradient(circle at 50% 50%, #f1f5f9 0%, #cbd5e1 35%, #64748b 70%, #1e293b 100%)",
    "preview": "radial-gradient(circle at 50% 50%, #f1f5f9 0%, #cbd5e1 35%, #64748b 70%, #1e293b 100%)",
    "tags": [
      "abstract",
      "mercury",
      "chrome",
      "metallic",
      "liquid",
      "drops"
    ]
  },
  {
    "id": "abstract-015-retro-risograph-grain",
    "name": "Risograph Halftone Pop",
    "category": "abstract",
    "type": "gradient",
    "value": "linear-gradient(135deg, #fde047 0%, #fb7185 50%, #38bdf8 100%)",
    "preview": "linear-gradient(135deg, #fde047 0%, #fb7185 50%, #38bdf8 100%)",
    "tags": [
      "abstract",
      "risograph",
      "retro",
      "pop",
      "vibrant",
      "yellow"
    ]
  },
  {
    "id": "abstract-016-subterranean-chasm",
    "name": "Subterranean Magma Rift",
    "category": "abstract",
    "type": "gradient",
    "value": "linear-gradient(120deg, #09090b 0%, #18181b 40%, #dc2626 80%, #450a0a 100%)",
    "preview": "linear-gradient(120deg, #09090b 0%, #18181b 40%, #dc2626 80%, #450a0a 100%)",
    "tags": [
      "abstract",
      "magma",
      "chasm",
      "red",
      "dark",
      "volcanic"
    ]
  },
  {
    "id": "abstract-017-magnetic-dust-field",
    "name": "Magnetic Ferro Field",
    "category": "abstract",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #1e293b 0%, #0f172a 60%, #020617 100%)",
    "preview": "radial-gradient(circle at center, #1e293b 0%, #0f172a 60%, #020617 100%)",
    "tags": [
      "abstract",
      "magnetic",
      "field",
      "particles",
      "dark",
      "deep"
    ]
  },
  {
    "id": "abstract-018-curved-glass-reeds",
    "name": "Fluted Glass Horizon",
    "category": "abstract",
    "type": "gradient",
    "value": "linear-gradient(90deg, #fce7f3 0%, #e0e7ff 25%, #e0f2fe 50%, #ede9fe 75%, #fce7f3 100%)",
    "preview": "linear-gradient(90deg, #fce7f3 0%, #e0e7ff 25%, #e0f2fe 50%, #ede9fe 75%, #fce7f3 100%)",
    "tags": [
      "abstract",
      "glass",
      "reeds",
      "fluted",
      "pastel",
      "light"
    ]
  },
  {
    "id": "abstract-019-strata-sediment-layers",
    "name": "Desert Mineral Strata",
    "category": "abstract",
    "type": "gradient",
    "value": "linear-gradient(180deg, #fef3c7 0%, #fde68a 25%, #d97706 50%, #92400e 75%, #451a03 100%)",
    "preview": "linear-gradient(180deg, #fef3c7 0%, #fde68a 25%, #d97706 50%, #92400e 75%, #451a03 100%)",
    "tags": [
      "abstract",
      "strata",
      "sediment",
      "mineral",
      "earthy",
      "desert"
    ]
  },
  {
    "id": "abstract-020-zero-gravity-shatter",
    "name": "Zero Gravity Cyan Shards",
    "category": "abstract",
    "type": "gradient",
    "value": "radial-gradient(circle at 15% 85%, #38bdf8 0%, #0284c7 35%, #0f172a 75%, #020617 100%)",
    "preview": "radial-gradient(circle at 15% 85%, #38bdf8 0%, #0284c7 35%, #0f172a 75%, #020617 100%)",
    "tags": [
      "abstract",
      "cyan",
      "shatter",
      "ice",
      "deep",
      "space"
    ]
  },
  {
    "id": "gradient-001-sunset-mesh",
    "name": "Sunset Mirage Mesh",
    "category": "gradient",
    "type": "gradient",
    "value": "radial-gradient(at 10% 20%, #f97316 0px, transparent 50%), radial-gradient(at 90% 80%, #ec4899 0px, transparent 55%), radial-gradient(at 50% 50%, #8b5cf6 0px, transparent 60%), #1e1b4b",
    "preview": "radial-gradient(at 10% 20%, #f97316 0px, transparent 50%), radial-gradient(at 90% 80%, #ec4899 0px, transparent 55%), radial-gradient(at 50% 50%, #8b5cf6 0px, transparent 60%), #1e1b4b",
    "tags": [
      "gradient",
      "sunset",
      "mesh",
      "orange",
      "magenta",
      "purple"
    ]
  },
  {
    "id": "gradient-002-blue-glow",
    "name": "Midnight Azure Aura",
    "category": "gradient",
    "type": "gradient",
    "value": "linear-gradient(135deg, #020617 0%, #0f172a 35%, #0284c7 80%, #38bdf8 100%)",
    "preview": "linear-gradient(135deg, #020617 0%, #0f172a 35%, #0284c7 80%, #38bdf8 100%)",
    "tags": [
      "gradient",
      "blue",
      "azure",
      "navy",
      "glow",
      "tech"
    ]
  },
  {
    "id": "gradient-003-nordic-frost",
    "name": "Nordic Frost Dawn",
    "category": "gradient",
    "type": "gradient",
    "value": "linear-gradient(135deg, #e0f2fe 0%, #f0fdfa 50%, #f8fafc 100%)",
    "preview": "linear-gradient(135deg, #e0f2fe 0%, #f0fdfa 50%, #f8fafc 100%)",
    "tags": [
      "gradient",
      "nordic",
      "frost",
      "clean",
      "light",
      "minimal"
    ]
  },
  {
    "id": "gradient-004-cyber-infrared",
    "name": "Thermal Infrared Bloom",
    "category": "gradient",
    "type": "gradient",
    "value": "linear-gradient(135deg, #09090b 0%, #701a75 40%, #db2777 75%, #facc15 100%)",
    "preview": "linear-gradient(135deg, #09090b 0%, #701a75 40%, #db2777 75%, #facc15 100%)",
    "tags": [
      "gradient",
      "thermal",
      "infrared",
      "magenta",
      "yellow",
      "dark"
    ]
  },
  {
    "id": "gradient-005-golden-hour-haze",
    "name": "Golden Hour Atmosphere",
    "category": "gradient",
    "type": "gradient",
    "value": "linear-gradient(180deg, #fef08a 0%, #f59e0b 45%, #b45309 80%, #78350f 100%)",
    "preview": "linear-gradient(180deg, #fef08a 0%, #f59e0b 45%, #b45309 80%, #78350f 100%)",
    "tags": [
      "gradient",
      "golden",
      "amber",
      "sunset",
      "warm",
      "horizon"
    ]
  },
  {
    "id": "gradient-006-deep-space-twilight",
    "name": "Deep Space Twilight",
    "category": "gradient",
    "type": "gradient",
    "value": "radial-gradient(circle at 80% 20%, #4338ca 0%, #312e81 40%, #0f172a 75%, #020617 100%)",
    "preview": "radial-gradient(circle at 80% 20%, #4338ca 0%, #312e81 40%, #0f172a 75%, #020617 100%)",
    "tags": [
      "gradient",
      "space",
      "twilight",
      "indigo",
      "navy",
      "cosmic"
    ]
  },
  {
    "id": "gradient-007-pastel-sorbet",
    "name": "Pastel Sorbet Confection",
    "category": "gradient",
    "type": "gradient",
    "value": "linear-gradient(135deg, #fef9c3 0%, #fce7f3 50%, #cffafe 100%)",
    "preview": "linear-gradient(135deg, #fef9c3 0%, #fce7f3 50%, #cffafe 100%)",
    "tags": [
      "gradient",
      "pastel",
      "sorbet",
      "soft",
      "sweet",
      "bright"
    ]
  },
  {
    "id": "gradient-008-monochrome-vignette",
    "name": "Monochrome Studio Vignette",
    "category": "gradient",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #71717a 0%, #27272a 50%, #09090b 100%)",
    "preview": "radial-gradient(circle at center, #71717a 0%, #27272a 50%, #09090b 100%)",
    "tags": [
      "gradient",
      "monochrome",
      "vignette",
      "luxury",
      "grayscale",
      "studio"
    ]
  },
  {
    "id": "gradient-009-emerald-abyss",
    "name": "Emerald Forest Deep",
    "category": "gradient",
    "type": "gradient",
    "value": "linear-gradient(135deg, #022c22 0%, #065f46 45%, #10b981 85%, #6ee7b7 100%)",
    "preview": "linear-gradient(135deg, #022c22 0%, #065f46 45%, #10b981 85%, #6ee7b7 100%)",
    "tags": [
      "gradient",
      "emerald",
      "green",
      "jewel",
      "luxury",
      "fresh"
    ]
  },
  {
    "id": "gradient-010-crimson-velvet",
    "name": "Crimson Velvet Drama",
    "category": "gradient",
    "type": "gradient",
    "value": "linear-gradient(135deg, #450a0a 0%, #991b1b 50%, #ef4444 85%, #fca5a5 100%)",
    "preview": "linear-gradient(135deg, #450a0a 0%, #991b1b 50%, #ef4444 85%, #fca5a5 100%)",
    "tags": [
      "gradient",
      "crimson",
      "red",
      "velvet",
      "bold",
      "dramatic"
    ]
  },
  {
    "id": "gradient-011-champagne-silk",
    "name": "Champagne Pearl Silk",
    "category": "gradient",
    "type": "gradient",
    "value": "linear-gradient(135deg, #fef3c7 0%, #fef9c3 35%, #f5f5f4 70%, #e7e5e4 100%)",
    "preview": "linear-gradient(135deg, #fef3c7 0%, #fef9c3 35%, #f5f5f4 70%, #e7e5e4 100%)",
    "tags": [
      "gradient",
      "champagne",
      "silk",
      "pearl",
      "editorial",
      "luxury"
    ]
  },
  {
    "id": "gradient-012-aurora-borealis",
    "name": "Northern Aurora Wave",
    "category": "gradient",
    "type": "gradient",
    "value": "linear-gradient(135deg, #052e16 0%, #047857 35%, #06b6d4 70%, #3b82f6 100%)",
    "preview": "linear-gradient(135deg, #052e16 0%, #047857 35%, #06b6d4 70%, #3b82f6 100%)",
    "tags": [
      "gradient",
      "aurora",
      "green",
      "cyan",
      "blue",
      "night"
    ]
  },
  {
    "id": "gradient-013-electric-violet",
    "name": "Hyper Violet SaaS",
    "category": "gradient",
    "type": "gradient",
    "value": "linear-gradient(135deg, #7c3aed 0%, #a855f7 40%, #ec4899 80%, #f43f5e 100%)",
    "preview": "linear-gradient(135deg, #7c3aed 0%, #a855f7 40%, #ec4899 80%, #f43f5e 100%)",
    "tags": [
      "gradient",
      "violet",
      "purple",
      "saas",
      "fuchsia",
      "vibrant"
    ]
  },
  {
    "id": "gradient-014-sage-eucalyptus",
    "name": "Sage Eucalyptus Calm",
    "category": "gradient",
    "type": "gradient",
    "value": "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 40%, #bbf7d0 75%, #86efac 100%)",
    "preview": "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 40%, #bbf7d0 75%, #86efac 100%)",
    "tags": [
      "gradient",
      "sage",
      "eucalyptus",
      "green",
      "wellness",
      "natural"
    ]
  },
  {
    "id": "gradient-015-hyper-tropic-heat",
    "name": "Tropical Neon Heat",
    "category": "gradient",
    "type": "gradient",
    "value": "linear-gradient(135deg, #f43f5e 0%, #fb923c 50%, #facc15 100%)",
    "preview": "linear-gradient(135deg, #f43f5e 0%, #fb923c 50%, #facc15 100%)",
    "tags": [
      "gradient",
      "tropical",
      "heat",
      "summer",
      "orange",
      "yellow"
    ]
  },
  {
    "id": "gradient-016-dusk-horizon-linear",
    "name": "Stratified Dusk Horizon",
    "category": "gradient",
    "type": "gradient",
    "value": "linear-gradient(180deg, #1e1b4b 0%, #581c87 35%, #be185d 70%, #f97316 100%)",
    "preview": "linear-gradient(180deg, #1e1b4b 0%, #581c87 35%, #be185d 70%, #f97316 100%)",
    "tags": [
      "gradient",
      "dusk",
      "horizon",
      "purple",
      "orange",
      "sky"
    ]
  },
  {
    "id": "gradient-017-titanium-alloy",
    "name": "Titanium Metal Alloy",
    "category": "gradient",
    "type": "gradient",
    "value": "linear-gradient(135deg, #1e293b 0%, #475569 40%, #94a3b8 70%, #e2e8f0 100%)",
    "preview": "linear-gradient(135deg, #1e293b 0%, #475569 40%, #94a3b8 70%, #e2e8f0 100%)",
    "tags": [
      "gradient",
      "titanium",
      "alloy",
      "steel",
      "metallic",
      "cool"
    ]
  },
  {
    "id": "gradient-018-neon-matrix-glow",
    "name": "Obsidian Matrix Glow",
    "category": "gradient",
    "type": "gradient",
    "value": "radial-gradient(circle at bottom center, #10b981 0%, #064e3b 35%, #022c22 65%, #020617 100%)",
    "preview": "radial-gradient(circle at bottom center, #10b981 0%, #064e3b 35%, #022c22 65%, #020617 100%)",
    "tags": [
      "gradient",
      "matrix",
      "emerald",
      "glow",
      "obsidian",
      "dark"
    ]
  },
  {
    "id": "gradient-019-desert-dusk",
    "name": "Mojave Desert Dusk",
    "category": "gradient",
    "type": "gradient",
    "value": "linear-gradient(135deg, #7c2d12 0%, #a21caf 50%, #1e1b4b 100%)",
    "preview": "linear-gradient(135deg, #7c2d12 0%, #a21caf 50%, #1e1b4b 100%)",
    "tags": [
      "gradient",
      "desert",
      "dusk",
      "terracotta",
      "plum",
      "indigo"
    ]
  },
  {
    "id": "gradient-020-clean-paper-smoke",
    "name": "Clean Paper Mist",
    "category": "gradient",
    "type": "gradient",
    "value": "radial-gradient(circle at 50% 30%, #ffffff 0%, #f4f4f5 60%, #e4e4e7 100%)",
    "preview": "radial-gradient(circle at 50% 30%, #ffffff 0%, #f4f4f5 60%, #e4e4e7 100%)",
    "tags": [
      "gradient",
      "white",
      "paper",
      "clean",
      "light",
      "minimal"
    ]
  },
  {
    "id": "minimal-001-soft-beige",
    "name": "Limestone Soft Beige",
    "category": "minimal",
    "type": "color",
    "value": "#f5f0eb",
    "preview": "#f5f0eb",
    "tags": [
      "minimal",
      "beige",
      "limestone",
      "warm",
      "clean",
      "editorial"
    ]
  },
  {
    "id": "minimal-002-clean-slate",
    "name": "Matte Charcoal Slate",
    "category": "minimal",
    "type": "color",
    "value": "#18181b",
    "preview": "#18181b",
    "tags": [
      "minimal",
      "charcoal",
      "slate",
      "dark",
      "sleek"
    ]
  },
  {
    "id": "minimal-003-solitary-arch-shadow",
    "name": "Stucco Roman Arch Shadow",
    "category": "minimal",
    "type": "gradient",
    "value": "linear-gradient(125deg, #faf7f5 0%, #f3ece6 60%, #e7ddd4 100%)",
    "preview": "linear-gradient(125deg, #faf7f5 0%, #f3ece6 60%, #e7ddd4 100%)",
    "tags": [
      "minimal",
      "arch",
      "shadow",
      "stucco",
      "warm",
      "scandi"
    ]
  },
  {
    "id": "minimal-004-monochrome-horizon",
    "name": "Monochrome Horizon Line",
    "category": "minimal",
    "type": "gradient",
    "value": "linear-gradient(180deg, #ffffff 0%, #ffffff 75%, #09090b 75%, #09090b 100%)",
    "preview": "linear-gradient(180deg, #ffffff 0%, #ffffff 75%, #09090b 75%, #09090b 100%)",
    "tags": [
      "minimal",
      "horizon",
      "stark",
      "black",
      "white",
      "editorial"
    ]
  },
  {
    "id": "minimal-005-floating-pedestal-light",
    "name": "Floating Studio Pedestal",
    "category": "minimal",
    "type": "gradient",
    "value": "radial-gradient(circle at 50% 90%, #e4e4e7 0%, #fafafa 60%, #ffffff 100%)",
    "preview": "radial-gradient(circle at 50% 90%, #e4e4e7 0%, #fafafa 60%, #ffffff 100%)",
    "tags": [
      "minimal",
      "pedestal",
      "podium",
      "studio",
      "clean",
      "mockup"
    ]
  },
  {
    "id": "minimal-006-zen-sand-ridge",
    "name": "Zen Raked Sand Dune",
    "category": "minimal",
    "type": "gradient",
    "value": "linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #f59e0b 100%)",
    "preview": "linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #f59e0b 100%)",
    "tags": [
      "minimal",
      "zen",
      "sand",
      "dune",
      "warm",
      "natural"
    ]
  },
  {
    "id": "minimal-007-paper-crease-diagonal",
    "name": "Embossed Paper Crease",
    "category": "minimal",
    "type": "gradient",
    "value": "linear-gradient(135deg, #ffffff 0%, #f4f4f5 48%, #e4e4e7 50%, #fafafa 52%, #ffffff 100%)",
    "preview": "linear-gradient(135deg, #ffffff 0%, #f4f4f5 48%, #e4e4e7 50%, #fafafa 52%, #ffffff 100%)",
    "tags": [
      "minimal",
      "paper",
      "crease",
      "fold",
      "texture",
      "white"
    ]
  },
  {
    "id": "minimal-008-pale-terracotta-sun",
    "name": "Pale Adobe Terracotta",
    "category": "minimal",
    "type": "color",
    "value": "#e7d5c9",
    "preview": "#e7d5c9",
    "tags": [
      "minimal",
      "terracotta",
      "adobe",
      "earthy",
      "soft"
    ]
  },
  {
    "id": "minimal-009-fog-whiteout",
    "name": "Ethereal Mist Whiteout",
    "category": "minimal",
    "type": "gradient",
    "value": "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
    "preview": "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
    "tags": [
      "minimal",
      "mist",
      "whiteout",
      "clean",
      "light",
      "airy"
    ]
  },
  {
    "id": "minimal-010-brutalist-concrete-edge",
    "name": "Smooth Polished Cement",
    "category": "minimal",
    "type": "color",
    "value": "#d4d4d8",
    "preview": "#d4d4d8",
    "tags": [
      "minimal",
      "concrete",
      "cement",
      "industrial",
      "grey"
    ]
  },
  {
    "id": "minimal-011-olive-linen-weave",
    "name": "Muted Olive Linen",
    "category": "minimal",
    "type": "color",
    "value": "#3f4639",
    "preview": "#3f4639",
    "tags": [
      "minimal",
      "olive",
      "linen",
      "natural",
      "botanical"
    ]
  },
  {
    "id": "minimal-012-single-dewdrop-focus",
    "name": "Crisp Silver Dewdrop",
    "category": "minimal",
    "type": "gradient",
    "value": "radial-gradient(circle at 10% 10%, #ffffff 0%, #e2e8f0 40%, #cbd5e1 100%)",
    "preview": "radial-gradient(circle at 10% 10%, #ffffff 0%, #e2e8f0 40%, #cbd5e1 100%)",
    "tags": [
      "minimal",
      "dewdrop",
      "silver",
      "macro",
      "clarity"
    ]
  },
  {
    "id": "minimal-013-soft-focus-orb",
    "name": "Ivory Ambient Volume",
    "category": "minimal",
    "type": "gradient",
    "value": "radial-gradient(circle at 50% 40%, #ffffff 0%, #f4f4f5 50%, #e4e4e7 100%)",
    "preview": "radial-gradient(circle at 50% 40%, #ffffff 0%, #f4f4f5 50%, #e4e4e7 100%)",
    "tags": [
      "minimal",
      "orb",
      "ivory",
      "soft",
      "zen"
    ]
  },
  {
    "id": "minimal-014-muted-navy-monolith",
    "name": "Oxford Navy Monolith",
    "category": "minimal",
    "type": "color",
    "value": "#0a1128",
    "preview": "#0a1128",
    "tags": [
      "minimal",
      "navy",
      "oxford",
      "monolith",
      "corporate"
    ]
  },
  {
    "id": "minimal-015-curved-plaster-corner",
    "name": "Curved Cove Plaster",
    "category": "minimal",
    "type": "gradient",
    "value": "linear-gradient(90deg, #fafafa 0%, #f4f4f5 70%, #d4d4d8 100%)",
    "preview": "linear-gradient(90deg, #fafafa 0%, #f4f4f5 70%, #d4d4d8 100%)",
    "tags": [
      "minimal",
      "plaster",
      "corner",
      "architectural",
      "soft"
    ]
  },
  {
    "id": "minimal-016-driftwood-grey-matte",
    "name": "Driftwood Grey Satin",
    "category": "minimal",
    "type": "color",
    "value": "#78716c",
    "preview": "#78716c",
    "tags": [
      "minimal",
      "driftwood",
      "stone",
      "warm-grey",
      "neutral"
    ]
  },
  {
    "id": "minimal-017-split-tonal-contrast",
    "name": "Vertical Split Block",
    "category": "minimal",
    "type": "gradient",
    "value": "linear-gradient(90deg, #f5f0eb 0%, #f5f0eb 50%, #e2e8f0 50%, #e2e8f0 100%)",
    "preview": "linear-gradient(90deg, #f5f0eb 0%, #f5f0eb 50%, #e2e8f0 50%, #e2e8f0 100%)",
    "tags": [
      "minimal",
      "split",
      "block",
      "dual-tone",
      "graphic"
    ]
  },
  {
    "id": "minimal-018-recessed-shelf-recess",
    "name": "Architectural Niche Shadow",
    "category": "minimal",
    "type": "gradient",
    "value": "linear-gradient(180deg, #e4e4e7 0%, #f4f4f5 25%, #ffffff 100%)",
    "preview": "linear-gradient(180deg, #e4e4e7 0%, #f4f4f5 25%, #ffffff 100%)",
    "tags": [
      "minimal",
      "niche",
      "shadow",
      "clean",
      "wall"
    ]
  },
  {
    "id": "minimal-019-chalkboard-patina",
    "name": "Matte Felt Erasure",
    "category": "minimal",
    "type": "color",
    "value": "#262626",
    "preview": "#262626",
    "tags": [
      "minimal",
      "chalkboard",
      "felt",
      "dark",
      "textured"
    ]
  },
  {
    "id": "minimal-020-porcelain-reflection",
    "name": "Porcelain Gallery Floor",
    "category": "minimal",
    "type": "gradient",
    "value": "linear-gradient(180deg, #ffffff 0%, #fafafa 60%, #f4f4f5 100%)",
    "preview": "linear-gradient(180deg, #ffffff 0%, #fafafa 60%, #f4f4f5 100%)",
    "tags": [
      "minimal",
      "porcelain",
      "gallery",
      "pristine",
      "reflection"
    ]
  },
  {
    "id": "geometric-001-bauhaus-angles",
    "name": "Bauhaus Primary Triangles",
    "category": "geometric",
    "type": "gradient",
    "value": "linear-gradient(45deg, #1d4ed8 0%, #dc2626 50%, #facc15 100%)",
    "preview": "linear-gradient(45deg, #1d4ed8 0%, #dc2626 50%, #facc15 100%)",
    "tags": [
      "geometric",
      "bauhaus",
      "primary",
      "angles",
      "art"
    ]
  },
  {
    "id": "geometric-002-isometric-cubes-dark",
    "name": "Isometric Cube Matrix",
    "category": "geometric",
    "type": "gradient",
    "value": "linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)",
    "preview": "linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)",
    "tags": [
      "geometric",
      "isometric",
      "cubes",
      "matrix",
      "dark"
    ]
  },
  {
    "id": "geometric-003-concentric-circles-gold",
    "name": "Concentric Gold Rings",
    "category": "geometric",
    "type": "gradient",
    "value": "radial-gradient(circle, transparent 40%, rgba(217,119,6,0.2) 41%, transparent 42%), radial-gradient(circle, transparent 70%, rgba(217,119,6,0.3) 71%, transparent 72%), #022c22",
    "preview": "radial-gradient(circle, transparent 40%, rgba(217,119,6,0.2) 41%, transparent 42%), radial-gradient(circle, transparent 70%, rgba(217,119,6,0.3) 71%, transparent 72%), #022c22",
    "tags": [
      "geometric",
      "concentric",
      "gold",
      "rings",
      "emerald",
      "luxury"
    ]
  },
  {
    "id": "geometric-004-memphis-scatter-pastel",
    "name": "Memphis Pastel Shapes",
    "category": "geometric",
    "type": "gradient",
    "value": "linear-gradient(135deg, #fbcfe8 0%, #fed7aa 50%, #bbf7d0 100%)",
    "preview": "linear-gradient(135deg, #fbcfe8 0%, #fed7aa 50%, #bbf7d0 100%)",
    "tags": [
      "geometric",
      "memphis",
      "pastel",
      "retro",
      "playful"
    ]
  },
  {
    "id": "geometric-005-overlapping-translucent-polygons",
    "name": "Translucent Prismatic Polygons",
    "category": "geometric",
    "type": "gradient",
    "value": "linear-gradient(60deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)",
    "preview": "linear-gradient(60deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)",
    "tags": [
      "geometric",
      "polygons",
      "translucent",
      "prismatic",
      "vibrant"
    ]
  },
  {
    "id": "geometric-006-chevron-stripes-modern",
    "name": "Modern Directional Chevron",
    "category": "geometric",
    "type": "gradient",
    "value": "repeating-linear-gradient(45deg, #18181b, #18181b 15px, #27272a 15px, #27272a 30px)",
    "preview": "repeating-linear-gradient(45deg, #18181b, #18181b 15px, #27272a 15px, #27272a 30px)",
    "tags": [
      "geometric",
      "chevron",
      "stripes",
      "carbon",
      "dark"
    ]
  },
  {
    "id": "geometric-007-hexagonal-honeycomb-mesh",
    "name": "Hexagonal Honeycomb Grid",
    "category": "geometric",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #0e7490 0%, #155e75 40%, #083344 80%, #020617 100%)",
    "preview": "radial-gradient(circle at center, #0e7490 0%, #155e75 40%, #083344 80%, #020617 100%)",
    "tags": [
      "geometric",
      "hexagon",
      "honeycomb",
      "cyan",
      "cyber"
    ]
  },
  {
    "id": "geometric-008-penrose-triangle-void",
    "name": "Penrose Isometric Void",
    "category": "geometric",
    "type": "gradient",
    "value": "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    "preview": "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    "tags": [
      "geometric",
      "penrose",
      "impossible",
      "void",
      "slate"
    ]
  },
  {
    "id": "geometric-009-sacred-mandala-wire",
    "name": "Sacred Merkaba Geometry",
    "category": "geometric",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #312e81 0%, #1e1b4b 60%, #09090b 100%)",
    "preview": "radial-gradient(circle at center, #312e81 0%, #1e1b4b 60%, #09090b 100%)",
    "tags": [
      "geometric",
      "sacred",
      "mandala",
      "indigo",
      "spiritual"
    ]
  },
  {
    "id": "geometric-010-terrazzo-stone-chips",
    "name": "Venetian Terrazzo Stone",
    "category": "geometric",
    "type": "image",
    "value": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1400&q=80",
    "preview": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80",
    "tags": [
      "geometric",
      "terrazzo",
      "mosaic",
      "stone",
      "italian"
    ]
  },
  {
    "id": "geometric-011-rhombus-optical-weave",
    "name": "Optical Rhombus Wave",
    "category": "geometric",
    "type": "gradient",
    "value": "repeating-linear-gradient(135deg, #334155 0px, #334155 10px, #1e293b 10px, #1e293b 20px)",
    "preview": "repeating-linear-gradient(135deg, #334155 0px, #334155 10px, #1e293b 10px, #1e293b 20px)",
    "tags": [
      "geometric",
      "rhombus",
      "optical",
      "wave",
      "slate"
    ]
  },
  {
    "id": "geometric-012-intersecting-torus-rings",
    "name": "Metallic Torus Interlock",
    "category": "geometric",
    "type": "gradient",
    "value": "radial-gradient(circle at 60% 40%, #fbbf24 0%, #b45309 40%, #451a03 80%, #0c0a09 100%)",
    "preview": "radial-gradient(circle at 60% 40%, #fbbf24 0%, #b45309 40%, #451a03 80%, #0c0a09 100%)",
    "tags": [
      "geometric",
      "torus",
      "rings",
      "metallic",
      "bronze"
    ]
  },
  {
    "id": "geometric-013-radial-sunburst-minimal",
    "name": "Radial Ray Sunburst",
    "category": "geometric",
    "type": "gradient",
    "value": "conic-gradient(from 0deg, #18181b, #27272a, #18181b, #27272a, #18181b)",
    "preview": "conic-gradient(from 0deg, #18181b, #27272a, #18181b, #27272a, #18181b)",
    "tags": [
      "geometric",
      "sunburst",
      "conic",
      "radial",
      "dark"
    ]
  },
  {
    "id": "geometric-014-polygonal-mesh-terrain",
    "name": "Polygonal Mesh Relief",
    "category": "geometric",
    "type": "gradient",
    "value": "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #059669 85%, #10b981 100%)",
    "preview": "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #059669 85%, #10b981 100%)",
    "tags": [
      "geometric",
      "polygon",
      "terrain",
      "relief",
      "emerald"
    ]
  },
  {
    "id": "geometric-015-curved-ribbon-parabola",
    "name": "Parabolic Ribbon Curve",
    "category": "geometric",
    "type": "gradient",
    "value": "linear-gradient(135deg, #4c0519 0%, #be123c 45%, #fb7185 80%, #ffe4e6 100%)",
    "preview": "linear-gradient(135deg, #4c0519 0%, #be123c 45%, #fb7185 80%, #ffe4e6 100%)",
    "tags": [
      "geometric",
      "parabola",
      "ribbon",
      "curve",
      "rose"
    ]
  },
  {
    "id": "geometric-016-halftone-dot-matrix-scale",
    "name": "Halftone Dot Matrix Scale",
    "category": "geometric",
    "type": "gradient",
    "value": "radial-gradient(#6366f1 1px, transparent 1px), radial-gradient(#a855f7 1px, #0f172a 1px)",
    "preview": "radial-gradient(#6366f1 1px, transparent 1px), radial-gradient(#a855f7 1px, #0f172a 1px)",
    "tags": [
      "geometric",
      "halftone",
      "dots",
      "matrix",
      "tech"
    ]
  },
  {
    "id": "geometric-017-prism-pyramid-shadows",
    "name": "Sharp Pyramid Shadows",
    "category": "geometric",
    "type": "gradient",
    "value": "linear-gradient(120deg, #f4f4f5 0%, #e4e4e7 40%, #71717a 80%, #27272a 100%)",
    "preview": "linear-gradient(120deg, #f4f4f5 0%, #e4e4e7 40%, #71717a 80%, #27272a 100%)",
    "tags": [
      "geometric",
      "pyramid",
      "shadows",
      "architectural",
      "clean"
    ]
  },
  {
    "id": "geometric-018-tessellated-cube-pattern",
    "name": "Tessellated Cube Illusion",
    "category": "geometric",
    "type": "gradient",
    "value": "linear-gradient(60deg, #374151 0%, #1f2937 50%, #111827 100%)",
    "preview": "linear-gradient(60deg, #374151 0%, #1f2937 50%, #111827 100%)",
    "tags": [
      "geometric",
      "tessellation",
      "cubes",
      "escher",
      "dark"
    ]
  },
  {
    "id": "geometric-019-golden-ratio-spiral-curve",
    "name": "Golden Ratio Fibonacci Arc",
    "category": "geometric",
    "type": "gradient",
    "value": "radial-gradient(circle at 100% 100%, #3b82f6 0%, #1d4ed8 40%, #0f172a 80%, #020617 100%)",
    "preview": "radial-gradient(circle at 100% 100%, #3b82f6 0%, #1d4ed8 40%, #0f172a 80%, #020617 100%)",
    "tags": [
      "geometric",
      "fibonacci",
      "golden-ratio",
      "spiral",
      "math"
    ]
  },
  {
    "id": "geometric-020-segmented-circle-pie",
    "name": "Segmented Annular Discs",
    "category": "geometric",
    "type": "gradient",
    "value": "conic-gradient(from 180deg at 50% 50%, #ea580c 0deg, #f59e0b 90deg, #3b82f6 180deg, #8b5cf6 270deg, #ea580c 360deg)",
    "preview": "conic-gradient(from 180deg at 50% 50%, #ea580c 0deg, #f59e0b 90deg, #3b82f6 180deg, #8b5cf6 270deg, #ea580c 360deg)",
    "tags": [
      "geometric",
      "segmented",
      "annular",
      "conic",
      "colorful"
    ]
  },
  {
    "id": "liquid-001-molten-gold-waves",
    "name": "Molten 24k Liquid Gold",
    "category": "liquid",
    "type": "image",
    "value": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1400&q=80",
    "preview": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80",
    "tags": [
      "liquid",
      "gold",
      "molten",
      "luxury",
      "metallic",
      "waves"
    ]
  },
  {
    "id": "liquid-002-crystal-clear-splash",
    "name": "Crystal Water Splash",
    "category": "liquid",
    "type": "image",
    "value": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
    "preview": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
    "tags": [
      "liquid",
      "water",
      "splash",
      "crystal",
      "pure",
      "droplets"
    ]
  },
  {
    "id": "liquid-003-black-ink-cloud-water",
    "name": "Black Ink Diffusion",
    "category": "liquid",
    "type": "gradient",
    "value": "radial-gradient(circle at 40% 60%, rgba(24,24,27,0.95) 0%, rgba(39,39,42,0.8) 40%, rgba(244,244,245,0.9) 80%, #ffffff 100%)",
    "preview": "radial-gradient(circle at 40% 60%, rgba(24,24,27,0.95) 0%, rgba(39,39,42,0.8) 40%, rgba(244,244,245,0.9) 80%, #ffffff 100%)",
    "tags": [
      "liquid",
      "ink",
      "cloud",
      "dispersion",
      "calligraphy",
      "white"
    ]
  },
  {
    "id": "liquid-004-iridescent-soap-swirl",
    "name": "Iridescent Soap Film",
    "category": "liquid",
    "type": "gradient",
    "value": "radial-gradient(circle at 30% 30%, #ec4899 0%, #8b5cf6 30%, #06b6d4 60%, #10b981 85%, #facc15 100%)",
    "preview": "radial-gradient(circle at 30% 30%, #ec4899 0%, #8b5cf6 30%, #06b6d4 60%, #10b981 85%, #facc15 100%)",
    "tags": [
      "liquid",
      "soap",
      "bubble",
      "iridescent",
      "rainbow",
      "psychedelic"
    ]
  },
  {
    "id": "liquid-005-chrome-metaball-cluster",
    "name": "Liquid Chrome Metaballs",
    "category": "liquid",
    "type": "gradient",
    "value": "radial-gradient(circle at 60% 40%, #ffffff 0%, #cbd5e1 35%, #475569 70%, #0f172a 100%)",
    "preview": "radial-gradient(circle at 60% 40%, #ffffff 0%, #cbd5e1 35%, #475569 70%, #0f172a 100%)",
    "tags": [
      "liquid",
      "chrome",
      "metaball",
      "mirror",
      "metallic"
    ]
  },
  {
    "id": "liquid-006-neon-acrylic-pour",
    "name": "Neon Acrylic Fluid Pour",
    "category": "liquid",
    "type": "image",
    "value": "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1400&q=80",
    "preview": "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80",
    "tags": [
      "liquid",
      "acrylic",
      "pour",
      "neon",
      "colors",
      "vivid"
    ]
  },
  {
    "id": "liquid-007-milk-crown-splash",
    "name": "Porcelain Milk Crown",
    "category": "liquid",
    "type": "gradient",
    "value": "radial-gradient(circle at 50% 60%, #ffffff 0%, #f4f4f5 55%, #e4e4e7 100%)",
    "preview": "radial-gradient(circle at 50% 60%, #ffffff 0%, #f4f4f5 55%, #e4e4e7 100%)",
    "tags": [
      "liquid",
      "milk",
      "crown",
      "splash",
      "pure",
      "white"
    ]
  },
  {
    "id": "liquid-008-crimson-oil-water-cells",
    "name": "Crimson Oil Droplet Cells",
    "category": "liquid",
    "type": "gradient",
    "value": "radial-gradient(circle at 20% 30%, #ef4444 0%, #991b1b 45%, #450a0a 80%, #09090b 100%)",
    "preview": "radial-gradient(circle at 20% 30%, #ef4444 0%, #991b1b 45%, #450a0a 80%, #09090b 100%)",
    "tags": [
      "liquid",
      "oil",
      "cells",
      "crimson",
      "droplets",
      "macro"
    ]
  },
  {
    "id": "liquid-009-deep-ocean-undertow",
    "name": "Deep Ocean Undertow",
    "category": "liquid",
    "type": "gradient",
    "value": "linear-gradient(180deg, #0369a1 0%, #075985 30%, #0c4a6e 60%, #020617 100%)",
    "preview": "linear-gradient(180deg, #0369a1 0%, #075985 30%, #0c4a6e 60%, #020617 100%)",
    "tags": [
      "liquid",
      "ocean",
      "undertow",
      "deep",
      "teal",
      "water"
    ]
  },
  {
    "id": "liquid-010-liquid-mercury-ripple",
    "name": "Mercury Concentric Ripple",
    "category": "liquid",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #94a3b8 0%, #64748b 30%, #334155 60%, #0f172a 100%)",
    "preview": "radial-gradient(circle at center, #94a3b8 0%, #64748b 30%, #334155 60%, #0f172a 100%)",
    "tags": [
      "liquid",
      "mercury",
      "ripple",
      "waves",
      "metal"
    ]
  },
  {
    "id": "liquid-011-warm-honey-drizzle",
    "name": "Golden Honey Drizzle",
    "category": "liquid",
    "type": "gradient",
    "value": "linear-gradient(135deg, #f59e0b 0%, #d97706 45%, #b45309 80%, #78350f 100%)",
    "preview": "linear-gradient(135deg, #f59e0b 0%, #d97706 45%, #b45309 80%, #78350f 100%)",
    "tags": [
      "liquid",
      "honey",
      "amber",
      "warm",
      "golden",
      "viscous"
    ]
  },
  {
    "id": "liquid-012-ferrofluid-spike-sculpture",
    "name": "Magnetic Ferro Spikes",
    "category": "liquid",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #27272a 0%, #18181b 45%, #09090b 85%, #000000 100%)",
    "preview": "radial-gradient(circle at center, #27272a 0%, #18181b 45%, #09090b 85%, #000000 100%)",
    "tags": [
      "liquid",
      "ferrofluid",
      "magnetic",
      "spikes",
      "black"
    ]
  },
  {
    "id": "liquid-013-pastel-paint-avalanche",
    "name": "Pastel Paint Avalanche",
    "category": "liquid",
    "type": "gradient",
    "value": "linear-gradient(180deg, #fbcfe8 0%, #e0e7ff 40%, #bbf7d0 80%, #fef08a 100%)",
    "preview": "linear-gradient(180deg, #fbcfe8 0%, #e0e7ff 40%, #bbf7d0 80%, #fef08a 100%)",
    "tags": [
      "liquid",
      "paint",
      "avalanche",
      "pastel",
      "milkshake"
    ]
  },
  {
    "id": "liquid-014-underwater-effervescence",
    "name": "Golden Effervescence Bubbles",
    "category": "liquid",
    "type": "gradient",
    "value": "linear-gradient(180deg, #fef08a 0%, #fde047 35%, #ca8a04 80%, #854d0e 100%)",
    "preview": "linear-gradient(180deg, #fef08a 0%, #fde047 35%, #ca8a04 80%, #854d0e 100%)",
    "tags": [
      "liquid",
      "bubbles",
      "champagne",
      "effervescence",
      "gold"
    ]
  },
  {
    "id": "liquid-015-liquid-neon-plasma",
    "name": "Fluorescent Plasma Vortex",
    "category": "liquid",
    "type": "gradient",
    "value": "conic-gradient(from 90deg, #a855f7, #ec4899, #06b6d4, #10b981, #a855f7)",
    "preview": "conic-gradient(from 90deg, #a855f7, #ec4899, #06b6d4, #10b981, #a855f7)",
    "tags": [
      "liquid",
      "plasma",
      "plasma-vortex",
      "neon",
      "cyan",
      "magenta"
    ]
  },
  {
    "id": "liquid-016-glycerin-rain-pane",
    "name": "Glycerin Rain Droplets",
    "category": "liquid",
    "type": "image",
    "value": "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1400&q=80",
    "preview": "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=400&q=80",
    "tags": [
      "liquid",
      "rain",
      "droplets",
      "glass",
      "water",
      "moody"
    ]
  },
  {
    "id": "liquid-017-copper-resins-flow",
    "name": "Copper Resin River",
    "category": "liquid",
    "type": "gradient",
    "value": "linear-gradient(135deg, #18181b 0%, #7c2d12 40%, #ea580c 70%, #fdba74 100%)",
    "preview": "linear-gradient(135deg, #18181b 0%, #7c2d12 40%, #ea580c 70%, #fdba74 100%)",
    "tags": [
      "liquid",
      "copper",
      "resin",
      "metallic",
      "artisan"
    ]
  },
  {
    "id": "liquid-018-frozen-wave-crest",
    "name": "Crystalline Glacier Crest",
    "category": "liquid",
    "type": "gradient",
    "value": "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 35%, #0284c7 75%, #0369a1 100%)",
    "preview": "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 35%, #0284c7 75%, #0369a1 100%)",
    "tags": [
      "liquid",
      "frozen",
      "wave",
      "glacier",
      "ice",
      "blue"
    ]
  },
  {
    "id": "liquid-019-fluorescent-dye-jet",
    "name": "Fluorescent Dye Collision",
    "category": "liquid",
    "type": "gradient",
    "value": "radial-gradient(circle at 30% 70%, #84cc16 0%, #15803d 40%, #022c22 80%, #020617 100%)",
    "preview": "radial-gradient(circle at 30% 70%, #84cc16 0%, #15803d 40%, #022c22 80%, #020617 100%)",
    "tags": [
      "liquid",
      "dye",
      "fluorescent",
      "lime",
      "collision"
    ]
  },
  {
    "id": "liquid-020-smooth-chocolate-swirl",
    "name": "Velvety Cocoa Swirl",
    "category": "liquid",
    "type": "gradient",
    "value": "linear-gradient(135deg, #271406 0%, #451a03 40%, #78350f 75%, #92400e 100%)",
    "preview": "linear-gradient(135deg, #271406 0%, #451a03 40%, #78350f 75%, #92400e 100%)",
    "tags": [
      "liquid",
      "chocolate",
      "cocoa",
      "velvet",
      "warm",
      "brown"
    ]
  },
  {
    "id": "mesh-gradient-001-aurora-borealis-mesh",
    "name": "Aurora 9-Point Radial Mesh",
    "category": "mesh-gradient",
    "type": "gradient",
    "value": "radial-gradient(at 0% 0%, #10b981 0px, transparent 50%), radial-gradient(at 100% 0%, #06b6d4 0px, transparent 50%), radial-gradient(at 50% 100%, #6366f1 0px, transparent 50%), #020617",
    "preview": "radial-gradient(at 0% 0%, #10b981 0px, transparent 50%), radial-gradient(at 100% 0%, #06b6d4 0px, transparent 50%), radial-gradient(at 50% 100%, #6366f1 0px, transparent 50%), #020617",
    "tags": [
      "mesh",
      "aurora",
      "emerald",
      "cyan",
      "indigo",
      "glow"
    ]
  },
  {
    "id": "mesh-gradient-002-peach-fuzz-bloom",
    "name": "Peach Fuzz Velvet Mesh",
    "category": "mesh-gradient",
    "type": "gradient",
    "value": "radial-gradient(at 20% 20%, #fdba74 0px, transparent 50%), radial-gradient(at 80% 20%, #fca5a5 0px, transparent 50%), radial-gradient(at 50% 80%, #fed7aa 0px, transparent 50%), #fff7ed",
    "preview": "radial-gradient(at 20% 20%, #fdba74 0px, transparent 50%), radial-gradient(at 80% 20%, #fca5a5 0px, transparent 50%), radial-gradient(at 50% 80%, #fed7aa 0px, transparent 50%), #fff7ed",
    "tags": [
      "mesh",
      "peach",
      "fuzz",
      "warm",
      "soft",
      "pantone"
    ]
  },
  {
    "id": "mesh-gradient-003-cyber-noir-glow",
    "name": "Cyber Noir Fluorescent Mesh",
    "category": "mesh-gradient",
    "type": "gradient",
    "value": "radial-gradient(at 15% 15%, #ec4899 0px, transparent 40%), radial-gradient(at 85% 85%, #06b6d4 0px, transparent 40%), #09090b",
    "preview": "radial-gradient(at 15% 15%, #ec4899 0px, transparent 40%), radial-gradient(at 85% 85%, #06b6d4 0px, transparent 40%), #09090b",
    "tags": [
      "mesh",
      "cyber",
      "noir",
      "magenta",
      "cyan",
      "dark"
    ]
  },
  {
    "id": "mesh-gradient-004-hyper-infrared-heat",
    "name": "Hyper Heatmap Mesh",
    "category": "mesh-gradient",
    "type": "gradient",
    "value": "radial-gradient(at 30% 30%, #f43f5e 0px, transparent 50%), radial-gradient(at 70% 30%, #facc15 0px, transparent 50%), radial-gradient(at 50% 80%, #4f46e5 0px, transparent 60%), #18181b",
    "preview": "radial-gradient(at 30% 30%, #f43f5e 0px, transparent 50%), radial-gradient(at 70% 30%, #facc15 0px, transparent 50%), radial-gradient(at 50% 80%, #4f46e5 0px, transparent 60%), #18181b",
    "tags": [
      "mesh",
      "heatmap",
      "infrared",
      "crimson",
      "yellow",
      "indigo"
    ]
  },
  {
    "id": "mesh-gradient-005-cotton-candy-haze",
    "name": "Cotton Candy Dream Mesh",
    "category": "mesh-gradient",
    "type": "gradient",
    "value": "radial-gradient(at 10% 20%, #fbcfe8 0px, transparent 50%), radial-gradient(at 90% 20%, #bae6fd 0px, transparent 50%), radial-gradient(at 50% 80%, #fef08a 0px, transparent 50%), #ffffff",
    "preview": "radial-gradient(at 10% 20%, #fbcfe8 0px, transparent 50%), radial-gradient(at 90% 20%, #bae6fd 0px, transparent 50%), radial-gradient(at 50% 80%, #fef08a 0px, transparent 50%), #ffffff",
    "tags": [
      "mesh",
      "cotton-candy",
      "pink",
      "sky",
      "pastel",
      "light"
    ]
  },
  {
    "id": "mesh-gradient-006-deep-ocean-trench",
    "name": "Abyssal Mariana Mesh",
    "category": "mesh-gradient",
    "type": "gradient",
    "value": "radial-gradient(at 20% 80%, #0284c7 0px, transparent 40%), radial-gradient(at 80% 20%, #10b981 0px, transparent 35%), #020617",
    "preview": "radial-gradient(at 20% 80%, #0284c7 0px, transparent 40%), radial-gradient(at 80% 20%, #10b981 0px, transparent 35%), #020617",
    "tags": [
      "mesh",
      "abyss",
      "trench",
      "deep",
      "teal",
      "bioluminescent"
    ]
  },
  {
    "id": "mesh-gradient-007-solar-flare-blaze",
    "name": "Solar Flare Blaze Mesh",
    "category": "mesh-gradient",
    "type": "gradient",
    "value": "radial-gradient(at 10% 10%, #ef4444 0px, transparent 50%), radial-gradient(at 90% 10%, #f59e0b 0px, transparent 50%), radial-gradient(at 50% 90%, #b91c1c 0px, transparent 50%), #450a0a",
    "preview": "radial-gradient(at 10% 10%, #ef4444 0px, transparent 50%), radial-gradient(at 90% 10%, #f59e0b 0px, transparent 50%), radial-gradient(at 50% 90%, #b91c1c 0px, transparent 50%), #450a0a",
    "tags": [
      "mesh",
      "solar",
      "flare",
      "blaze",
      "fire",
      "crimson"
    ]
  },
  {
    "id": "mesh-gradient-008-ethereal-lavender-mist",
    "name": "Ethereal Wisteria Mesh",
    "category": "mesh-gradient",
    "type": "gradient",
    "value": "radial-gradient(at 20% 30%, #e9d5ff 0px, transparent 50%), radial-gradient(at 80% 30%, #f5d0fe 0px, transparent 50%), radial-gradient(at 50% 80%, #fed7aa 0px, transparent 50%), #faf5ff",
    "preview": "radial-gradient(at 20% 30%, #e9d5ff 0px, transparent 50%), radial-gradient(at 80% 30%, #f5d0fe 0px, transparent 50%), radial-gradient(at 50% 80%, #fed7aa 0px, transparent 50%), #faf5ff",
    "tags": [
      "mesh",
      "lavender",
      "wisteria",
      "violet",
      "soft",
      "serene"
    ]
  },
  {
    "id": "mesh-gradient-009-emerald-forest-canopy",
    "name": "Emerald Canopy Sunlight Mesh",
    "category": "mesh-gradient",
    "type": "gradient",
    "value": "radial-gradient(at 30% 20%, #34d399 0px, transparent 50%), radial-gradient(at 70% 30%, #facc15 0px, transparent 40%), radial-gradient(at 50% 90%, #065f46 0px, transparent 60%), #022c22",
    "preview": "radial-gradient(at 30% 20%, #34d399 0px, transparent 50%), radial-gradient(at 70% 30%, #facc15 0px, transparent 40%), radial-gradient(at 50% 90%, #065f46 0px, transparent 60%), #022c22",
    "tags": [
      "mesh",
      "canopy",
      "emerald",
      "forest",
      "sunlight",
      "green"
    ]
  },
  {
    "id": "mesh-gradient-010-neon-synthwave-mesh",
    "name": "Synthwave Dusk Multi-Mesh",
    "category": "mesh-gradient",
    "type": "gradient",
    "value": "radial-gradient(at 20% 20%, #ec4899 0px, transparent 50%), radial-gradient(at 80% 30%, #8b5cf6 0px, transparent 50%), radial-gradient(at 50% 80%, #38bdf8 0px, transparent 50%), #18181b",
    "preview": "radial-gradient(at 20% 20%, #ec4899 0px, transparent 50%), radial-gradient(at 80% 30%, #8b5cf6 0px, transparent 50%), radial-gradient(at 50% 80%, #38bdf8 0px, transparent 50%), #18181b",
    "tags": [
      "mesh",
      "synthwave",
      "retro",
      "neon",
      "purple",
      "pink"
    ]
  },
  {
    "id": "mesh-gradient-011-desert-rose-sand",
    "name": "Desert Rose Adobe Mesh",
    "category": "mesh-gradient",
    "type": "gradient",
    "value": "radial-gradient(at 20% 30%, #f472b6 0px, transparent 50%), radial-gradient(at 80% 30%, #fb923c 0px, transparent 50%), radial-gradient(at 50% 80%, #fde047 0px, transparent 50%), #fff1f2",
    "preview": "radial-gradient(at 20% 30%, #f472b6 0px, transparent 50%), radial-gradient(at 80% 30%, #fb923c 0px, transparent 50%), radial-gradient(at 50% 80%, #fde047 0px, transparent 50%), #fff1f2",
    "tags": [
      "mesh",
      "desert-rose",
      "terracotta",
      "warm",
      "aesthetic"
    ]
  },
  {
    "id": "mesh-gradient-012-acid-techno-clash",
    "name": "Acid Techno Clash Mesh",
    "category": "mesh-gradient",
    "type": "gradient",
    "value": "radial-gradient(at 20% 20%, #a3e635 0px, transparent 40%), radial-gradient(at 80% 80%, #7e22ce 0px, transparent 50%), #09090b",
    "preview": "radial-gradient(at 20% 20%, #a3e635 0px, transparent 40%), radial-gradient(at 80% 80%, #7e22ce 0px, transparent 50%), #09090b",
    "tags": [
      "mesh",
      "acid",
      "techno",
      "lime",
      "purple",
      "edgy"
    ]
  },
  {
    "id": "mesh-gradient-013-champagne-luxe-glow",
    "name": "Champagne Golden Glow Mesh",
    "category": "mesh-gradient",
    "type": "gradient",
    "value": "radial-gradient(at 30% 30%, #fef08a 0px, transparent 50%), radial-gradient(at 70% 40%, #fed7aa 0px, transparent 50%), radial-gradient(at 50% 80%, #f5f5f4 0px, transparent 60%), #fafaf9",
    "preview": "radial-gradient(at 30% 30%, #fef08a 0px, transparent 50%), radial-gradient(at 70% 40%, #fed7aa 0px, transparent 50%), radial-gradient(at 50% 80%, #f5f5f4 0px, transparent 60%), #fafaf9",
    "tags": [
      "mesh",
      "champagne",
      "luxury",
      "glow",
      "gold",
      "light"
    ]
  },
  {
    "id": "mesh-gradient-014-glacier-ice-flow",
    "name": "Glacier Arctic Flow Mesh",
    "category": "mesh-gradient",
    "type": "gradient",
    "value": "radial-gradient(at 10% 10%, #38bdf8 0px, transparent 50%), radial-gradient(at 90% 20%, #a5f3fc 0px, transparent 50%), radial-gradient(at 50% 80%, #1e40af 0px, transparent 60%), #0c4a6e",
    "preview": "radial-gradient(at 10% 10%, #38bdf8 0px, transparent 50%), radial-gradient(at 90% 20%, #a5f3fc 0px, transparent 50%), radial-gradient(at 50% 80%, #1e40af 0px, transparent 60%), #0c4a6e",
    "tags": [
      "mesh",
      "glacier",
      "arctic",
      "ice",
      "cool",
      "azure"
    ]
  },
  {
    "id": "mesh-gradient-015-velvet-plum-dusk",
    "name": "Velvet Plum Copper Mesh",
    "category": "mesh-gradient",
    "type": "gradient",
    "value": "radial-gradient(at 20% 20%, #581c87 0px, transparent 50%), radial-gradient(at 80% 30%, #b45309 0px, transparent 40%), radial-gradient(at 50% 80%, #831843 0px, transparent 50%), #18181b",
    "preview": "radial-gradient(at 20% 20%, #581c87 0px, transparent 50%), radial-gradient(at 80% 30%, #b45309 0px, transparent 40%), radial-gradient(at 50% 80%, #831843 0px, transparent 50%), #18181b",
    "tags": [
      "mesh",
      "plum",
      "velvet",
      "copper",
      "dusk",
      "rich"
    ]
  },
  {
    "id": "mesh-gradient-016-modern-saas-indigo",
    "name": "Modern SaaS Indigo Mesh",
    "category": "mesh-gradient",
    "type": "gradient",
    "value": "radial-gradient(at 0% 0%, #4338ca 0px, transparent 50%), radial-gradient(at 100% 0%, #38bdf8 0px, transparent 50%), #0f172a",
    "preview": "radial-gradient(at 0% 0%, #4338ca 0px, transparent 50%), radial-gradient(at 100% 0%, #38bdf8 0px, transparent 50%), #0f172a",
    "tags": [
      "mesh",
      "saas",
      "indigo",
      "software",
      "clean",
      "tech"
    ]
  },
  {
    "id": "mesh-gradient-017-warm-terracotta-clay",
    "name": "Terracotta Sienna Clay Mesh",
    "category": "mesh-gradient",
    "type": "gradient",
    "value": "radial-gradient(at 20% 20%, #ea580c 0px, transparent 50%), radial-gradient(at 80% 30%, #7c2d12 0px, transparent 50%), radial-gradient(at 50% 80%, #fde047 0px, transparent 50%), #78350f",
    "preview": "radial-gradient(at 20% 20%, #ea580c 0px, transparent 50%), radial-gradient(at 80% 30%, #7c2d12 0px, transparent 50%), radial-gradient(at 50% 80%, #fde047 0px, transparent 50%), #78350f",
    "tags": [
      "mesh",
      "terracotta",
      "clay",
      "sienna",
      "warm",
      "earthy"
    ]
  },
  {
    "id": "mesh-gradient-018-radioactive-lime-fade",
    "name": "Radioactive Lime Bottom Glow",
    "category": "mesh-gradient",
    "type": "gradient",
    "value": "radial-gradient(at 50% 100%, #84cc16 0px, transparent 60%), #09090b",
    "preview": "radial-gradient(at 50% 100%, #84cc16 0px, transparent 60%), #09090b",
    "tags": [
      "mesh",
      "lime",
      "glow",
      "radioactive",
      "black",
      "dark"
    ]
  },
  {
    "id": "mesh-gradient-019-cosmic-supernova-mesh",
    "name": "Cosmic Supernova Starburst",
    "category": "mesh-gradient",
    "type": "gradient",
    "value": "radial-gradient(at 50% 50%, #ffffff 0px, #a855f7 25%, #3b82f6 50%, #020617 80%)",
    "preview": "radial-gradient(at 50% 50%, #ffffff 0px, #a855f7 25%, #3b82f6 50%, #020617 80%)",
    "tags": [
      "mesh",
      "supernova",
      "cosmic",
      "space",
      "burst",
      "violet"
    ]
  },
  {
    "id": "mesh-gradient-020-monochrome-silk-mesh",
    "name": "Monochrome Silk Studio Mesh",
    "category": "mesh-gradient",
    "type": "gradient",
    "value": "radial-gradient(at 30% 30%, #ffffff 0px, transparent 50%), radial-gradient(at 70% 70%, #71717a 0px, transparent 50%), #27272a",
    "preview": "radial-gradient(at 30% 30%, #ffffff 0px, transparent 50%), radial-gradient(at 70% 70%, #71717a 0px, transparent 50%), #27272a",
    "tags": [
      "mesh",
      "monochrome",
      "silk",
      "silver",
      "studio",
      "grayscale"
    ]
  },
  {
    "id": "3d-001-floating-geometric-primitives",
    "name": "Floating 3D Matte Primitives",
    "category": "3d",
    "type": "image",
    "value": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80",
    "preview": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    "tags": [
      "3d",
      "primitives",
      "geometry",
      "sphere",
      "minimal",
      "render"
    ]
  },
  {
    "id": "3d-002-twisted-torus-chrome",
    "name": "Chrome Twisted Torus Knot",
    "category": "3d",
    "type": "gradient",
    "value": "radial-gradient(circle at 60% 40%, #ffffff 0%, #cbd5e1 35%, #475569 65%, #0f172a 100%)",
    "preview": "radial-gradient(circle at 60% 40%, #ffffff 0%, #cbd5e1 35%, #475569 65%, #0f172a 100%)",
    "tags": [
      "3d",
      "torus",
      "knot",
      "chrome",
      "metallic",
      "specular"
    ]
  },
  {
    "id": "3d-003-sculpted-plaster-ribbons",
    "name": "Sculpted Plaster Flow",
    "category": "3d",
    "type": "image",
    "value": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1400&q=80",
    "preview": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=80",
    "tags": [
      "3d",
      "plaster",
      "sculpture",
      "ribbons",
      "relief",
      "light"
    ]
  },
  {
    "id": "3d-004-isometric-room-void",
    "name": "Isometric Architectural Room",
    "category": "3d",
    "type": "gradient",
    "value": "linear-gradient(135deg, #18181b 0%, #27272a 50%, #3f3f46 100%)",
    "preview": "linear-gradient(135deg, #18181b 0%, #27272a 50%, #3f3f46 100%)",
    "tags": [
      "3d",
      "isometric",
      "room",
      "architectural",
      "clean",
      "dark"
    ]
  },
  {
    "id": "3d-005-procedural-terrain-peaks",
    "name": "Black Ceramic Mountain Peaks",
    "category": "3d",
    "type": "gradient",
    "value": "linear-gradient(180deg, #020617 0%, #0f172a 60%, #06b6d4 100%)",
    "preview": "linear-gradient(180deg, #020617 0%, #0f172a 60%, #06b6d4 100%)",
    "tags": [
      "3d",
      "terrain",
      "peaks",
      "ceramic",
      "cyan",
      "rim-light"
    ]
  },
  {
    "id": "3d-006-iridescent-inflated-pillows",
    "name": "Puffy Foil Chrome Balloons",
    "category": "3d",
    "type": "gradient",
    "value": "radial-gradient(circle at 40% 40%, #f472b6 0%, #c084fc 35%, #38bdf8 70%, #1e1b4b 100%)",
    "preview": "radial-gradient(circle at 40% 40%, #f472b6 0%, #c084fc 35%, #38bdf8 70%, #1e1b4b 100%)",
    "tags": [
      "3d",
      "balloons",
      "inflated",
      "puffy",
      "foil",
      "trendy"
    ]
  },
  {
    "id": "3d-007-cylinder-podium-showcase",
    "name": "Fluted Marble Showcase Stage",
    "category": "3d",
    "type": "gradient",
    "value": "linear-gradient(180deg, #ffffff 0%, #f4f4f5 65%, #d4d4d8 100%)",
    "preview": "linear-gradient(180deg, #ffffff 0%, #f4f4f5 65%, #d4d4d8 100%)",
    "tags": [
      "3d",
      "podium",
      "stage",
      "marble",
      "showcase",
      "mockup"
    ]
  },
  {
    "id": "3d-008-cellular-metaball-organism",
    "name": "Subsurface Scattering Coral",
    "category": "3d",
    "type": "gradient",
    "value": "radial-gradient(circle at 60% 30%, #fb7185 0%, #e11d48 40%, #881337 75%, #0f172a 100%)",
    "preview": "radial-gradient(circle at 60% 30%, #fb7185 0%, #e11d48 40%, #881337 75%, #0f172a 100%)",
    "tags": [
      "3d",
      "metaball",
      "coral",
      "subsurface",
      "glossy",
      "organic"
    ]
  },
  {
    "id": "3d-009-perforated-metal-panels",
    "name": "Backlit Perforated Aluminum",
    "category": "3d",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #06b6d4 0%, #0f172a 50%, #020617 100%)",
    "preview": "radial-gradient(circle at center, #06b6d4 0%, #0f172a 50%, #020617 100%)",
    "tags": [
      "3d",
      "aluminum",
      "perforated",
      "led",
      "industrial"
    ]
  },
  {
    "id": "3d-010-kinetic-pendulum-spheres",
    "name": "Polished Brass Newton Spheres",
    "category": "3d",
    "type": "gradient",
    "value": "radial-gradient(circle at 50% 50%, #fbbf24 0%, #d97706 35%, #78350f 70%, #1c1917 100%)",
    "preview": "radial-gradient(circle at 50% 50%, #fbbf24 0%, #d97706 35%, #78350f 70%, #1c1917 100%)",
    "tags": [
      "3d",
      "brass",
      "pendulum",
      "spheres",
      "motion",
      "gold"
    ]
  },
  {
    "id": "3d-011-origami-tessellation-relief",
    "name": "Faceted Paper Architectural Relief",
    "category": "3d",
    "type": "gradient",
    "value": "linear-gradient(135deg, #ffffff 0%, #e4e4e7 45%, #a1a1aa 80%, #52525b 100%)",
    "preview": "linear-gradient(135deg, #ffffff 0%, #e4e4e7 45%, #a1a1aa 80%, #52525b 100%)",
    "tags": [
      "3d",
      "origami",
      "relief",
      "paper",
      "facets",
      "white"
    ]
  },
  {
    "id": "3d-012-holographic-helix-spiral",
    "name": "Prismatic Glass Helix",
    "category": "3d",
    "type": "gradient",
    "value": "linear-gradient(135deg, #818cf8 0%, #c084fc 40%, #f472b6 80%, #0f172a 100%)",
    "preview": "linear-gradient(135deg, #818cf8 0%, #c084fc 40%, #f472b6 80%, #0f172a 100%)",
    "tags": [
      "3d",
      "helix",
      "dna",
      "spiral",
      "holographic",
      "glass"
    ]
  },
  {
    "id": "3d-013-concrete-brutalist-stairs",
    "name": "Brutalist Concrete Staircase",
    "category": "3d",
    "type": "image",
    "value": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80",
    "preview": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80",
    "tags": [
      "3d",
      "stairs",
      "concrete",
      "brutalist",
      "shadow",
      "architecture"
    ]
  },
  {
    "id": "3d-014-velvet-draped-spheres",
    "name": "Velvet Draped Geometry",
    "category": "3d",
    "type": "gradient",
    "value": "radial-gradient(circle at 40% 40%, #991b1b 0%, #450a0a 50%, #18181b 100%)",
    "preview": "radial-gradient(circle at 40% 40%, #991b1b 0%, #450a0a 50%, #18181b 100%)",
    "tags": [
      "3d",
      "velvet",
      "drape",
      "crimson",
      "luxury",
      "fabric"
    ]
  },
  {
    "id": "3d-015-liquid-metallic-blob-splash",
    "name": "Rose Gold Liquid Sculpture",
    "category": "3d",
    "type": "gradient",
    "value": "radial-gradient(circle at 50% 50%, #fbcfe8 0%, #f43f5e 40%, #9f1239 75%, #4c0519 100%)",
    "preview": "radial-gradient(circle at 50% 50%, #fbcfe8 0%, #f43f5e 40%, #9f1239 75%, #4c0519 100%)",
    "tags": [
      "3d",
      "rose-gold",
      "liquid",
      "splash",
      "metallic",
      "gloss"
    ]
  },
  {
    "id": "3d-016-glass-cube-refraction",
    "name": "Optical Glass Prism Cube",
    "category": "3d",
    "type": "image",
    "value": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80",
    "preview": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80",
    "tags": [
      "3d",
      "cube",
      "glass",
      "refraction",
      "optics",
      "caustic"
    ]
  },
  {
    "id": "3d-017-organic-wooden-topography",
    "name": "Layered Woodgrain Contour 3D",
    "category": "3d",
    "type": "image",
    "value": "https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=1400&q=80",
    "preview": "https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=400&q=80",
    "tags": [
      "3d",
      "wood",
      "topography",
      "warm",
      "organic",
      "grain"
    ]
  },
  {
    "id": "3d-018-sci-fi-corridor-perspective",
    "name": "Minimal White Hangar Corridor",
    "category": "3d",
    "type": "gradient",
    "value": "radial-gradient(circle at 50% 50%, #ffffff 0%, #e2e8f0 45%, #64748b 85%, #0f172a 100%)",
    "preview": "radial-gradient(circle at 50% 50%, #ffffff 0%, #e2e8f0 45%, #64748b 85%, #0f172a 100%)",
    "tags": [
      "3d",
      "corridor",
      "sci-fi",
      "perspective",
      "clean",
      "white"
    ]
  },
  {
    "id": "3d-019-floating-gold-rings-minimal",
    "name": "Levitating 24k Gold Hoops",
    "category": "3d",
    "type": "gradient",
    "value": "radial-gradient(circle at 70% 30%, #fef08a 0%, #eab308 35%, #854d0e 70%, #1c1917 100%)",
    "preview": "radial-gradient(circle at 70% 30%, #fef08a 0%, #eab308 35%, #854d0e 70%, #1c1917 100%)",
    "tags": [
      "3d",
      "rings",
      "gold",
      "hoops",
      "minimal",
      "luxury"
    ]
  },
  {
    "id": "3d-020-fractal-polyhedron-core",
    "name": "Stellated Dodecahedron Core",
    "category": "3d",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #8b5cf6 0%, #4c1d95 40%, #1e1b4b 75%, #020617 100%)",
    "preview": "radial-gradient(circle at center, #8b5cf6 0%, #4c1d95 40%, #1e1b4b 75%, #020617 100%)",
    "tags": [
      "3d",
      "polyhedron",
      "dodecahedron",
      "geometry",
      "violet"
    ]
  },
  {
    "id": "glassmorphism-001-frosted-glass-cards",
    "name": "Translucent Frosted Card Layers",
    "category": "glassmorphism",
    "type": "gradient",
    "value": "radial-gradient(at 20% 20%, rgba(99,102,241,0.5) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(236,72,153,0.5) 0px, transparent 50%), #0f172a",
    "preview": "radial-gradient(at 20% 20%, rgba(99,102,241,0.5) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(236,72,153,0.5) 0px, transparent 50%), #0f172a",
    "tags": [
      "glassmorphism",
      "frosted",
      "acrylic",
      "blur",
      "indigo",
      "modern"
    ]
  },
  {
    "id": "glassmorphism-002-prismatic-glass-discs",
    "name": "Prismatic Refracting Discs",
    "category": "glassmorphism",
    "type": "gradient",
    "value": "linear-gradient(135deg, rgba(56,189,248,0.4) 0%, rgba(168,85,247,0.4) 50%, rgba(244,63,94,0.4) 100%), #09090b",
    "preview": "linear-gradient(135deg, rgba(56,189,248,0.4) 0%, rgba(168,85,247,0.4) 50%, rgba(244,63,94,0.4) 100%), #09090b",
    "tags": [
      "glassmorphism",
      "prismatic",
      "discs",
      "refraction",
      "colors"
    ]
  },
  {
    "id": "glassmorphism-003-ribbed-fluted-glass",
    "name": "Vertical Fluted Reeded Glass",
    "category": "glassmorphism",
    "type": "gradient",
    "value": "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 12px, transparent 12px, transparent 24px), linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)",
    "preview": "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 12px, transparent 12px, transparent 24px), linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)",
    "tags": [
      "glassmorphism",
      "fluted",
      "reeded",
      "glass",
      "architectural",
      "stripes"
    ]
  },
  {
    "id": "glassmorphism-004-dark-mode-frosted-panel",
    "name": "Smoked Glass UI Plate",
    "category": "glassmorphism",
    "type": "gradient",
    "value": "radial-gradient(circle at 80% 20%, rgba(168,85,247,0.3) 0%, transparent 60%), linear-gradient(135deg, #18181b 0%, #09090b 100%)",
    "preview": "radial-gradient(circle at 80% 20%, rgba(168,85,247,0.3) 0%, transparent 60%), linear-gradient(135deg, #18181b 0%, #09090b 100%)",
    "tags": [
      "glassmorphism",
      "smoked",
      "dark",
      "ui",
      "violet",
      "blur"
    ]
  },
  {
    "id": "glassmorphism-005-curved-acrylic-wave",
    "name": "Curved Frosted Acrylic Ribbon",
    "category": "glassmorphism",
    "type": "gradient",
    "value": "linear-gradient(120deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%), #1e293b",
    "preview": "linear-gradient(120deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%), #1e293b",
    "tags": [
      "glassmorphism",
      "acrylic",
      "wave",
      "ribbon",
      "soft",
      "slate"
    ]
  },
  {
    "id": "glassmorphism-006-water-drop-glass-condense",
    "name": "Condensation Beads On Glass",
    "category": "glassmorphism",
    "type": "image",
    "value": "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1400&q=80",
    "preview": "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=400&q=80",
    "tags": [
      "glassmorphism",
      "condensation",
      "dew",
      "steam",
      "rain"
    ]
  },
  {
    "id": "glassmorphism-007-geometric-glass-tiles",
    "name": "Beveled Glass Mosaic Tiles",
    "category": "glassmorphism",
    "type": "gradient",
    "value": "linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%), #0f172a",
    "preview": "linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%), #0f172a",
    "tags": [
      "glassmorphism",
      "tiles",
      "beveled",
      "geometric",
      "navy"
    ]
  },
  {
    "id": "glassmorphism-008-neon-glow-behind-glass",
    "name": "Diffused Neon Behind Frosted Pane",
    "category": "glassmorphism",
    "type": "gradient",
    "value": "radial-gradient(circle at 30% 50%, rgba(236,72,153,0.7) 0%, transparent 45%), radial-gradient(circle at 70% 50%, rgba(6,182,212,0.7) 0%, transparent 45%), #020617",
    "preview": "radial-gradient(circle at 30% 50%, rgba(236,72,153,0.7) 0%, transparent 45%), radial-gradient(circle at 70% 50%, rgba(6,182,212,0.7) 0%, transparent 45%), #020617",
    "tags": [
      "glassmorphism",
      "neon",
      "diffused",
      "magenta",
      "cyan",
      "glow"
    ]
  },
  {
    "id": "glassmorphism-009-minimal-glass-podium",
    "name": "Solid Optical Crystal Podium",
    "category": "glassmorphism",
    "type": "gradient",
    "value": "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 60%, #cbd5e1 100%)",
    "preview": "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 60%, #cbd5e1 100%)",
    "tags": [
      "glassmorphism",
      "podium",
      "optical",
      "crystal",
      "clean",
      "light"
    ]
  },
  {
    "id": "glassmorphism-010-holographic-foil-under-glass",
    "name": "Holo Foil Encased In Glass",
    "category": "glassmorphism",
    "type": "gradient",
    "value": "linear-gradient(135deg, rgba(244,114,182,0.6) 0%, rgba(129,140,248,0.6) 50%, rgba(52,211,153,0.6) 100%), #1e1b4b",
    "preview": "linear-gradient(135deg, rgba(244,114,182,0.6) 0%, rgba(129,140,248,0.6) 50%, rgba(52,211,153,0.6) 100%), #1e1b4b",
    "tags": [
      "glassmorphism",
      "foil",
      "hologram",
      "rainbow",
      "shimmer"
    ]
  },
  {
    "id": "glassmorphism-011-stacked-glass-panes",
    "name": "Stacked Architectural Float Glass",
    "category": "glassmorphism",
    "type": "gradient",
    "value": "linear-gradient(180deg, rgba(6,95,70,0.4) 0%, rgba(4,120,87,0.2) 50%, rgba(2,44,34,0.8) 100%), #022c22",
    "preview": "linear-gradient(180deg, rgba(6,95,70,0.4) 0%, rgba(4,120,87,0.2) 50%, rgba(2,44,34,0.8) 100%), #022c22",
    "tags": [
      "glassmorphism",
      "float-glass",
      "stacked",
      "emerald",
      "green"
    ]
  },
  {
    "id": "glassmorphism-012-frosted-sphere-void",
    "name": "Frosted Glass Orb Twilight",
    "category": "glassmorphism",
    "type": "gradient",
    "value": "radial-gradient(circle at center, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 50%, transparent 70%), linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
    "preview": "radial-gradient(circle at center, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 50%, transparent 70%), linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
    "tags": [
      "glassmorphism",
      "orb",
      "sphere",
      "twilight",
      "violet"
    ]
  },
  {
    "id": "glassmorphism-013-textured-hammered-glass",
    "name": "Hammered Cathedral Cathedral Glass",
    "category": "glassmorphism",
    "type": "gradient",
    "value": "radial-gradient(circle at 20% 20%, #fed7aa 0%, #fdba74 40%, #c2410c 100%)",
    "preview": "radial-gradient(circle at 20% 20%, #fed7aa 0%, #fdba74 40%, #c2410c 100%)",
    "tags": [
      "glassmorphism",
      "hammered",
      "cathedral",
      "amber",
      "textured"
    ]
  },
  {
    "id": "glassmorphism-014-liquid-glass-droplets",
    "name": "Magnifying Liquid Droplet Lenses",
    "category": "glassmorphism",
    "type": "gradient",
    "value": "radial-gradient(circle at 80% 20%, rgba(56,189,248,0.5) 0%, transparent 45%), linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    "preview": "radial-gradient(circle at 80% 20%, rgba(56,189,248,0.5) 0%, transparent 45%), linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    "tags": [
      "glassmorphism",
      "droplets",
      "lens",
      "magnify",
      "light",
      "clean"
    ]
  },
  {
    "id": "glassmorphism-015-champagne-glass-sheen",
    "name": "Champagne Gilded Glass Surface",
    "category": "glassmorphism",
    "type": "gradient",
    "value": "linear-gradient(135deg, rgba(254,240,138,0.3) 0%, rgba(217,119,6,0.15) 50%, rgba(255,255,255,0.4) 100%), #1c1917",
    "preview": "linear-gradient(135deg, rgba(254,240,138,0.3) 0%, rgba(217,119,6,0.15) 50%, rgba(255,255,255,0.4) 100%), #1c1917",
    "tags": [
      "glassmorphism",
      "champagne",
      "gold",
      "gilded",
      "luxury"
    ]
  },
  {
    "id": "glassmorphism-016-cyber-hex-glass",
    "name": "Cyber Honeycomb Etched Glass",
    "category": "glassmorphism",
    "type": "gradient",
    "value": "linear-gradient(135deg, #042f2e 0%, #115e59 45%, #0d9488 85%, #5eead4 100%)",
    "preview": "linear-gradient(135deg, #042f2e 0%, #115e59 45%, #0d9488 85%, #5eead4 100%)",
    "tags": [
      "glassmorphism",
      "cyber",
      "etched",
      "teal",
      "hex"
    ]
  },
  {
    "id": "glassmorphism-017-frosted-pill-shapes",
    "name": "Layered Frosted Pill Capsules",
    "category": "glassmorphism",
    "type": "gradient",
    "value": "radial-gradient(circle at 25% 75%, rgba(192,132,252,0.4) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(96,165,250,0.4) 0%, transparent 50%), #0f172a",
    "preview": "radial-gradient(circle at 25% 75%, rgba(192,132,252,0.4) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(96,165,250,0.4) 0%, transparent 50%), #0f172a",
    "tags": [
      "glassmorphism",
      "capsules",
      "pills",
      "frosted",
      "soft-ui"
    ]
  },
  {
    "id": "glassmorphism-018-solarized-glass-filter",
    "name": "Dichroic Cyan-Orange Glass Cast",
    "category": "glassmorphism",
    "type": "gradient",
    "value": "linear-gradient(135deg, #f97316 0%, #06b6d4 100%)",
    "preview": "linear-gradient(135deg, #f97316 0%, #06b6d4 100%)",
    "tags": [
      "glassmorphism",
      "dichroic",
      "orange",
      "cyan",
      "solarized"
    ]
  },
  {
    "id": "glassmorphism-019-ice-frosted-window",
    "name": "Winter Ice Crystal Windowpane",
    "category": "glassmorphism",
    "type": "gradient",
    "value": "linear-gradient(180deg, #f0fdfa 0%, #ccfbf1 40%, #99f6e4 80%, #5eead4 100%)",
    "preview": "linear-gradient(180deg, #f0fdfa 0%, #ccfbf1 40%, #99f6e4 80%, #5eead4 100%)",
    "tags": [
      "glassmorphism",
      "ice",
      "window",
      "winter",
      "frost",
      "mint"
    ]
  },
  {
    "id": "glassmorphism-020-clean-ui-glass-backdrop",
    "name": "Pure SaaS Frosted Overlay",
    "category": "glassmorphism",
    "type": "gradient",
    "value": "radial-gradient(at 0% 0%, rgba(99,102,241,0.2) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(244,63,94,0.2) 0px, transparent 50%), #0a0a0c",
    "preview": "radial-gradient(at 0% 0%, rgba(99,102,241,0.2) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(244,63,94,0.2) 0px, transparent 50%), #0a0a0c",
    "tags": [
      "glassmorphism",
      "saas",
      "ui",
      "clean",
      "dark",
      "blur"
    ]
  },
  {
    "id": "neumorphism-001-soft-grey-buttons",
    "name": "Classic Soft Grey Neumorphic",
    "category": "neumorphism",
    "type": "color",
    "value": "#e0e5ec",
    "preview": "#e0e5ec",
    "tags": [
      "neumorphism",
      "soft-ui",
      "grey",
      "classic",
      "minimal"
    ]
  },
  {
    "id": "neumorphism-002-dark-slate-extrusion",
    "name": "Dark Charcoal Soft Extrusion",
    "category": "neumorphism",
    "type": "color",
    "value": "#212529",
    "preview": "#212529",
    "tags": [
      "neumorphism",
      "dark",
      "slate",
      "charcoal",
      "sleek"
    ]
  },
  {
    "id": "neumorphism-003-warm-clay-pillows",
    "name": "Warm Terracotta Clay Pillow",
    "category": "neumorphism",
    "type": "color",
    "value": "#deb887",
    "preview": "#deb887",
    "tags": [
      "neumorphism",
      "clay",
      "warm",
      "terracotta",
      "pillowy"
    ]
  },
  {
    "id": "neumorphism-004-minimal-white-emboss",
    "name": "Pristine White Embossed Plate",
    "category": "neumorphism",
    "type": "color",
    "value": "#f8f9fa",
    "preview": "#f8f9fa",
    "tags": [
      "neumorphism",
      "white",
      "embossed",
      "clean",
      "light"
    ]
  },
  {
    "id": "neumorphism-005-concave-radial-dial",
    "name": "Sunken Ivory Radial Concave",
    "category": "neumorphism",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #e9ecef 0%, #dee2e6 70%, #ced4da 100%)",
    "preview": "radial-gradient(circle at center, #e9ecef 0%, #dee2e6 70%, #ced4da 100%)",
    "tags": [
      "neumorphism",
      "concave",
      "dial",
      "ivory",
      "recessed"
    ]
  },
  {
    "id": "neumorphism-006-cyber-dark-accent",
    "name": "Gunmetal Soft Neon Inset",
    "category": "neumorphism",
    "type": "color",
    "value": "#1a1d20",
    "preview": "#1a1d20",
    "tags": [
      "neumorphism",
      "gunmetal",
      "cyber",
      "dark",
      "inset"
    ]
  },
  {
    "id": "neumorphism-007-pastel-lavender-plates",
    "name": "Pastel Lavender Extruded Tile",
    "category": "neumorphism",
    "type": "color",
    "value": "#e6e6fa",
    "preview": "#e6e6fa",
    "tags": [
      "neumorphism",
      "lavender",
      "pastel",
      "soft",
      "purple"
    ]
  },
  {
    "id": "neumorphism-008-debossed-track-curve",
    "name": "Debossed Curve Track Off-White",
    "category": "neumorphism",
    "type": "color",
    "value": "#f0f2f5",
    "preview": "#f0f2f5",
    "tags": [
      "neumorphism",
      "debossed",
      "track",
      "curve",
      "ui"
    ]
  },
  {
    "id": "neumorphism-009-powder-blue-switches",
    "name": "Powder Blue Tactile Plane",
    "category": "neumorphism",
    "type": "color",
    "value": "#d4e0ee",
    "preview": "#d4e0ee",
    "tags": [
      "neumorphism",
      "powder-blue",
      "switches",
      "calm",
      "tactile"
    ]
  },
  {
    "id": "neumorphism-010-monolithic-stone-extrude",
    "name": "Sandstone Beveled Slab",
    "category": "neumorphism",
    "type": "color",
    "value": "#dcd6cd",
    "preview": "#dcd6cd",
    "tags": [
      "neumorphism",
      "sandstone",
      "slab",
      "stone",
      "earthy"
    ]
  },
  {
    "id": "neumorphism-011-mint-fresh-toggle",
    "name": "Refreshing Mint Tactile Surface",
    "category": "neumorphism",
    "type": "color",
    "value": "#d1fae5",
    "preview": "#d1fae5",
    "tags": [
      "neumorphism",
      "mint",
      "green",
      "fresh",
      "toggle"
    ]
  },
  {
    "id": "neumorphism-012-leatherette-soft-crease",
    "name": "Neumorphic Leatherette Charcoal",
    "category": "neumorphism",
    "type": "color",
    "value": "#2d3436",
    "preview": "#2d3436",
    "tags": [
      "neumorphism",
      "leatherette",
      "charcoal",
      "cushion"
    ]
  },
  {
    "id": "neumorphism-013-stealth-black-matte",
    "name": "Stealth Black Matte Contour",
    "category": "neumorphism",
    "type": "color",
    "value": "#121214",
    "preview": "#121214",
    "tags": [
      "neumorphism",
      "stealth",
      "black",
      "matte",
      "minimal"
    ]
  },
  {
    "id": "neumorphism-014-rose-gold-blush-plate",
    "name": "Rose Quartz Blush Plate",
    "category": "neumorphism",
    "type": "color",
    "value": "#fce7f3",
    "preview": "#fce7f3",
    "tags": [
      "neumorphism",
      "rose-gold",
      "blush",
      "pink",
      "soft"
    ]
  },
  {
    "id": "neumorphism-015-concentric-ripple-plates",
    "name": "Concentric Terraced Plateaus",
    "category": "neumorphism",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #edf2f7 0%, #e2e8f0 50%, #cbd5e1 100%)",
    "preview": "radial-gradient(circle at center, #edf2f7 0%, #e2e8f0 50%, #cbd5e1 100%)",
    "tags": [
      "neumorphism",
      "ripple",
      "terraces",
      "soft-shadow",
      "steps"
    ]
  },
  {
    "id": "neumorphism-016-recessed-hexagon-grid",
    "name": "Polymer Grey Inset Hexagons",
    "category": "neumorphism",
    "type": "color",
    "value": "#cfd8dc",
    "preview": "#cfd8dc",
    "tags": [
      "neumorphism",
      "hexagons",
      "recessed",
      "polymer",
      "grey"
    ]
  },
  {
    "id": "neumorphism-017-dual-tone-emboss-split",
    "name": "Sage & Beige Embossed Split",
    "category": "neumorphism",
    "type": "gradient",
    "value": "linear-gradient(90deg, #e2e8f0 0%, #e2e8f0 50%, #dcfce7 50%, #dcfce7 100%)",
    "preview": "linear-gradient(90deg, #e2e8f0 0%, #e2e8f0 50%, #dcfce7 50%, #dcfce7 100%)",
    "tags": [
      "neumorphism",
      "dual-tone",
      "sage",
      "beige",
      "split"
    ]
  },
  {
    "id": "neumorphism-018-soft-pill-capsule-island",
    "name": "Extruded Capsule Island Surface",
    "category": "neumorphism",
    "type": "color",
    "value": "#e2e8f0",
    "preview": "#e2e8f0",
    "tags": [
      "neumorphism",
      "capsule",
      "island",
      "clean",
      "slate"
    ]
  },
  {
    "id": "neumorphism-019-ceramic-sculpted-grooves",
    "name": "Sculpted Ceramic Fluting",
    "category": "neumorphism",
    "type": "gradient",
    "value": "linear-gradient(90deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
    "preview": "linear-gradient(90deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
    "tags": [
      "neumorphism",
      "ceramic",
      "fluting",
      "grooves",
      "white"
    ]
  },
  {
    "id": "neumorphism-020-subtle-touchpad-surface",
    "name": "Subtle Satin Touchpad Plane",
    "category": "neumorphism",
    "type": "color",
    "value": "#e5e7eb",
    "preview": "#e5e7eb",
    "tags": [
      "neumorphism",
      "touchpad",
      "satin",
      "neutral",
      "clean"
    ]
  },
  {
    "id": "futuristic-001-deep-hyperspace-tunnel",
    "name": "Hyperspace Warp Singularity",
    "category": "futuristic",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #38bdf8 0%, #0369a1 25%, #0f172a 65%, #020617 100%)",
    "preview": "radial-gradient(circle at center, #38bdf8 0%, #0369a1 25%, #0f172a 65%, #020617 100%)",
    "tags": [
      "futuristic",
      "hyperspace",
      "warp",
      "tunnel",
      "cyan",
      "speed"
    ]
  },
  {
    "id": "futuristic-002-quantum-core-containment",
    "name": "Quantum Containment Plasma",
    "category": "futuristic",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #10b981 0%, #064e3b 40%, #022c22 75%, #020617 100%)",
    "preview": "radial-gradient(circle at center, #10b981 0%, #064e3b 40%, #022c22 75%, #020617 100%)",
    "tags": [
      "futuristic",
      "quantum",
      "core",
      "plasma",
      "emerald"
    ]
  },
  {
    "id": "futuristic-003-orbital-station-deck",
    "name": "Orbital Space Station Vista",
    "category": "futuristic",
    "type": "gradient",
    "value": "linear-gradient(180deg, #020617 0%, #0f172a 50%, #1e293b 85%, #f8fafc 100%)",
    "preview": "linear-gradient(180deg, #020617 0%, #0f172a 50%, #1e293b 85%, #f8fafc 100%)",
    "tags": [
      "futuristic",
      "orbital",
      "station",
      "earth",
      "horizon",
      "deck"
    ]
  },
  {
    "id": "futuristic-004-nanotech-hex-shield",
    "name": "Nanotech Forcefield Grid",
    "category": "futuristic",
    "type": "gradient",
    "value": "radial-gradient(circle at 50% 50%, #06b6d4 0%, #0e7490 35%, #083344 70%, #020617 100%)",
    "preview": "radial-gradient(circle at 50% 50%, #06b6d4 0%, #0e7490 35%, #083344 70%, #020617 100%)",
    "tags": [
      "futuristic",
      "nanotech",
      "shield",
      "forcefield",
      "cyan"
    ]
  },
  {
    "id": "futuristic-005-cyber-city-skyline-dusk",
    "name": "Neo Megacity Night Skyline",
    "category": "futuristic",
    "type": "gradient",
    "value": "linear-gradient(180deg, #09090b 0%, #1e1b4b 45%, #701a75 80%, #f43f5e 100%)",
    "preview": "linear-gradient(180deg, #09090b 0%, #1e1b4b 45%, #701a75 80%, #f43f5e 100%)",
    "tags": [
      "futuristic",
      "skyline",
      "megacity",
      "purple",
      "neon",
      "dusk"
    ]
  },
  {
    "id": "futuristic-006-fiber-optic-data-loom",
    "name": "Photonic Data Stream Conduit",
    "category": "futuristic",
    "type": "gradient",
    "value": "linear-gradient(135deg, #020617 0%, #1e1b4b 40%, #06b6d4 85%, #38bdf8 100%)",
    "preview": "linear-gradient(135deg, #020617 0%, #1e1b4b 40%, #06b6d4 85%, #38bdf8 100%)",
    "tags": [
      "futuristic",
      "fiber-optic",
      "data",
      "stream",
      "photonic"
    ]
  },
  {
    "id": "futuristic-007-synthetic-dna-matrix",
    "name": "Synthetic Helix Algorithm",
    "category": "futuristic",
    "type": "gradient",
    "value": "linear-gradient(135deg, #022c22 0%, #065f46 40%, #06b6d4 80%, #67e8f9 100%)",
    "preview": "linear-gradient(135deg, #022c22 0%, #065f46 40%, #06b6d4 80%, #67e8f9 100%)",
    "tags": [
      "futuristic",
      "dna",
      "helix",
      "synthetic",
      "bio-tech"
    ]
  },
  {
    "id": "futuristic-008-fusion-reactor-exhaust",
    "name": "Tokamak Fusion Torus",
    "category": "futuristic",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #a855f7 0%, #6366f1 35%, #1e1b4b 75%, #020617 100%)",
    "preview": "radial-gradient(circle at center, #a855f7 0%, #6366f1 35%, #1e1b4b 75%, #020617 100%)",
    "tags": [
      "futuristic",
      "fusion",
      "reactor",
      "plasma",
      "violet"
    ]
  },
  {
    "id": "futuristic-009-clean-white-laboratory",
    "name": "Pristine Research Cleanroom",
    "category": "futuristic",
    "type": "gradient",
    "value": "radial-gradient(circle at 50% 30%, #ffffff 0%, #f1f5f9 60%, #cbd5e1 100%)",
    "preview": "radial-gradient(circle at 50% 30%, #ffffff 0%, #f1f5f9 60%, #cbd5e1 100%)",
    "tags": [
      "futuristic",
      "cleanroom",
      "laboratory",
      "white",
      "sterile"
    ]
  },
  {
    "id": "futuristic-010-gravitational-singularity",
    "name": "Black Hole Accretion Horizon",
    "category": "futuristic",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #000000 0%, #09090b 25%, #f59e0b 45%, #78350f 70%, #020617 100%)",
    "preview": "radial-gradient(circle at center, #000000 0%, #09090b 25%, #f59e0b 45%, #78350f 70%, #020617 100%)",
    "tags": [
      "futuristic",
      "singularity",
      "black-hole",
      "accretion",
      "gold"
    ]
  },
  {
    "id": "futuristic-011-tachyon-particle-stream",
    "name": "Tachyon Particle Collision",
    "category": "futuristic",
    "type": "gradient",
    "value": "radial-gradient(circle at 30% 70%, #f43f5e 0%, #881337 45%, #18181b 80%, #09090b 100%)",
    "preview": "radial-gradient(circle at 30% 70%, #f43f5e 0%, #881337 45%, #18181b 80%, #09090b 100%)",
    "tags": [
      "futuristic",
      "tachyon",
      "particle",
      "accelerator",
      "crimson"
    ]
  },
  {
    "id": "futuristic-012-exo-planetary-colony",
    "name": "Martian Bio-Dome Twilight",
    "category": "futuristic",
    "type": "gradient",
    "value": "linear-gradient(180deg, #09090b 0%, #451a03 50%, #9a3412 85%, #f97316 100%)",
    "preview": "linear-gradient(180deg, #09090b 0%, #451a03 50%, #9a3412 85%, #f97316 100%)",
    "tags": [
      "futuristic",
      "mars",
      "colony",
      "rust",
      "orange",
      "dome"
    ]
  },
  {
    "id": "futuristic-013-neural-network-hologram",
    "name": "Cortex Synaptic Hologram",
    "category": "futuristic",
    "type": "gradient",
    "value": "radial-gradient(circle at 50% 50%, #38bdf8 0%, #6366f1 40%, #1e1b4b 75%, #020617 100%)",
    "preview": "radial-gradient(circle at 50% 50%, #38bdf8 0%, #6366f1 40%, #1e1b4b 75%, #020617 100%)",
    "tags": [
      "futuristic",
      "cortex",
      "synaptic",
      "hologram",
      "neural"
    ]
  },
  {
    "id": "futuristic-014-stealth-fighter-hull",
    "name": "Stealth Carbon Facet Hull",
    "category": "futuristic",
    "type": "gradient",
    "value": "linear-gradient(145deg, #18181b 0%, #27272a 45%, #09090b 100%)",
    "preview": "linear-gradient(145deg, #18181b 0%, #27272a 45%, #09090b 100%)",
    "tags": [
      "futuristic",
      "stealth",
      "carbon",
      "military",
      "aerospace"
    ]
  },
  {
    "id": "futuristic-015-cybernetic-circuit-traces",
    "name": "Gold Silicon Micro-Conduits",
    "category": "futuristic",
    "type": "gradient",
    "value": "linear-gradient(135deg, #1c1917 0%, #451a03 40%, #d97706 85%, #fbbf24 100%)",
    "preview": "linear-gradient(135deg, #1c1917 0%, #451a03 40%, #d97706 85%, #fbbf24 100%)",
    "tags": [
      "futuristic",
      "circuit",
      "gold",
      "silicon",
      "traces"
    ]
  },
  {
    "id": "futuristic-016-dyson-sphere-megastructure",
    "name": "Dyson Swarm Stellar Core",
    "category": "futuristic",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #fef08a 0%, #f59e0b 25%, #78350f 55%, #09090b 100%)",
    "preview": "radial-gradient(circle at center, #fef08a 0%, #f59e0b 25%, #78350f 55%, #09090b 100%)",
    "tags": [
      "futuristic",
      "dyson-sphere",
      "megastructure",
      "stellar",
      "sun"
    ]
  },
  {
    "id": "futuristic-017-time-dilation-portal",
    "name": "Chrono Dilation Ripple",
    "category": "futuristic",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #ffffff 0%, #38bdf8 30%, #4f46e5 65%, #0f172a 100%)",
    "preview": "radial-gradient(circle at center, #ffffff 0%, #38bdf8 30%, #4f46e5 65%, #0f172a 100%)",
    "tags": [
      "futuristic",
      "chrono",
      "portal",
      "dilation",
      "time",
      "cyan"
    ]
  },
  {
    "id": "futuristic-018-smart-city-grid-aerial",
    "name": "Autonomous Logistics Grid",
    "category": "futuristic",
    "type": "gradient",
    "value": "linear-gradient(180deg, #020617 0%, #0f172a 50%, #064e3b 85%, #10b981 100%)",
    "preview": "linear-gradient(180deg, #020617 0%, #0f172a 50%, #064e3b 85%, #10b981 100%)",
    "tags": [
      "futuristic",
      "smart-city",
      "grid",
      "aerial",
      "logistics"
    ]
  },
  {
    "id": "futuristic-019-holographic-hud-wireframe",
    "name": "Tactical HUD Targeting Grid",
    "category": "futuristic",
    "type": "gradient",
    "value": "radial-gradient(circle at center, rgba(6,182,212,0.3) 0%, transparent 60%), #020617",
    "preview": "radial-gradient(circle at center, rgba(6,182,212,0.3) 0%, transparent 60%), #020617",
    "tags": [
      "futuristic",
      "hud",
      "tactical",
      "wireframe",
      "cyan"
    ]
  },
  {
    "id": "futuristic-020-zero-point-energy-cube",
    "name": "Zero Point Tesseract Cube",
    "category": "futuristic",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #ec4899 0%, #8b5cf6 35%, #1e1b4b 75%, #020617 100%)",
    "preview": "radial-gradient(circle at center, #ec4899 0%, #8b5cf6 35%, #1e1b4b 75%, #020617 100%)",
    "tags": [
      "futuristic",
      "tesseract",
      "energy",
      "cube",
      "violet",
      "power"
    ]
  },
  {
    "id": "technology-001-microchip-die-macro",
    "name": "Silicon Microchip Die Macro",
    "category": "technology",
    "type": "image",
    "value": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
    "preview": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
    "tags": [
      "technology",
      "microchip",
      "silicon",
      "hardware",
      "cpu"
    ]
  },
  {
    "id": "technology-002-server-rack-datacenter",
    "name": "Enterprise Datacenter Alley",
    "category": "technology",
    "type": "image",
    "value": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80",
    "preview": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80",
    "tags": [
      "technology",
      "datacenter",
      "servers",
      "cloud",
      "networking"
    ]
  },
  {
    "id": "technology-003-printed-circuit-board-dark",
    "name": "Matte Black PCB Motherboard",
    "category": "technology",
    "type": "image",
    "value": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
    "preview": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
    "tags": [
      "technology",
      "pcb",
      "circuit",
      "motherboard",
      "solder"
    ]
  },
  {
    "id": "technology-004-fiber-optic-cable-bundle",
    "name": "Glowing Fiber Optic Strands",
    "category": "technology",
    "type": "image",
    "value": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=80",
    "preview": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80",
    "tags": [
      "technology",
      "fiber-optic",
      "broadband",
      "light",
      "cables"
    ]
  },
  {
    "id": "technology-005-binary-code-matrix-stream",
    "name": "Binary Stream Green Matrix",
    "category": "technology",
    "type": "gradient",
    "value": "linear-gradient(180deg, #020617 0%, #052e16 40%, #10b981 85%, #6ee7b7 100%)",
    "preview": "linear-gradient(180deg, #020617 0%, #052e16 40%, #10b981 85%, #6ee7b7 100%)",
    "tags": [
      "technology",
      "binary",
      "code",
      "matrix",
      "green",
      "terminal"
    ]
  },
  {
    "id": "technology-006-cloud-computing-network",
    "name": "Global Cloud Node Network",
    "category": "technology",
    "type": "gradient",
    "value": "radial-gradient(circle at 50% 50%, #38bdf8 0%, #1e40af 40%, #0f172a 75%, #020617 100%)",
    "preview": "radial-gradient(circle at 50% 50%, #38bdf8 0%, #1e40af 40%, #0f172a 75%, #020617 100%)",
    "tags": [
      "technology",
      "cloud",
      "network",
      "nodes",
      "saas",
      "azure"
    ]
  },
  {
    "id": "technology-007-isometric-server-infrastructure",
    "name": "Isometric Blade Infrastructure",
    "category": "technology",
    "type": "gradient",
    "value": "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    "preview": "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    "tags": [
      "technology",
      "isometric",
      "server",
      "infrastructure",
      "devops"
    ]
  },
  {
    "id": "technology-008-5g-telecom-tower-dusk",
    "name": "5G High Frequency Array",
    "category": "technology",
    "type": "gradient",
    "value": "linear-gradient(180deg, #0f172a 0%, #1e1b4b 45%, #6366f1 80%, #a5b4fc 100%)",
    "preview": "linear-gradient(180deg, #0f172a 0%, #1e1b4b 45%, #6366f1 80%, #a5b4fc 100%)",
    "tags": [
      "technology",
      "telecom",
      "5g",
      "radio",
      "signals",
      "antenna"
    ]
  },
  {
    "id": "technology-009-cyber-security-padlock-mesh",
    "name": "Encrypted Shield Cyber Mesh",
    "category": "technology",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #06b6d4 0%, #0e7490 35%, #0f172a 75%, #020617 100%)",
    "preview": "radial-gradient(circle at center, #06b6d4 0%, #0e7490 35%, #0f172a 75%, #020617 100%)",
    "tags": [
      "technology",
      "security",
      "encryption",
      "cyber",
      "padlock"
    ]
  },
  {
    "id": "technology-010-silicon-wafer-rainbow",
    "name": "Silicon Ingot Wafer Diffraction",
    "category": "technology",
    "type": "gradient",
    "value": "conic-gradient(from 45deg, #f43f5e, #fb923c, #facc15, #4ade80, #38bdf8, #818cf8, #f43f5e)",
    "preview": "conic-gradient(from 45deg, #f43f5e, #fb923c, #facc15, #4ade80, #38bdf8, #818cf8, #f43f5e)",
    "tags": [
      "technology",
      "silicon",
      "wafer",
      "diffraction",
      "rainbow"
    ]
  },
  {
    "id": "technology-011-cleanroom-semiconductor-fab",
    "name": "Lithography Semiconductor Fab",
    "category": "technology",
    "type": "gradient",
    "value": "linear-gradient(135deg, #ca8a04 0%, #eab308 45%, #fde047 80%, #ffffff 100%)",
    "preview": "linear-gradient(135deg, #ca8a04 0%, #eab308 45%, #fde047 80%, #ffffff 100%)",
    "tags": [
      "technology",
      "lithography",
      "semiconductor",
      "cleanroom",
      "yellow"
    ]
  },
  {
    "id": "technology-012-quantum-computer-chandelier",
    "name": "Quantum Chandelier Dilution Core",
    "category": "technology",
    "type": "gradient",
    "value": "radial-gradient(circle at 50% 30%, #fbbf24 0%, #d97706 40%, #78350f 75%, #0f172a 100%)",
    "preview": "radial-gradient(circle at 50% 30%, #fbbf24 0%, #d97706 40%, #78350f 75%, #0f172a 100%)",
    "tags": [
      "technology",
      "quantum",
      "chandelier",
      "gold",
      "supercomputer"
    ]
  },
  {
    "id": "technology-013-optical-lens-array",
    "name": "Laser Splitter Optical Beam",
    "category": "technology",
    "type": "gradient",
    "value": "radial-gradient(circle at 20% 50%, #ef4444 0%, transparent 40%), linear-gradient(90deg, #09090b 0%, #18181b 100%)",
    "preview": "radial-gradient(circle at 20% 50%, #ef4444 0%, transparent 40%), linear-gradient(90deg, #09090b 0%, #18181b 100%)",
    "tags": [
      "technology",
      "laser",
      "optics",
      "lenses",
      "red-beam"
    ]
  },
  {
    "id": "technology-014-supercomputer-cooling-pipes",
    "name": "Liquid Cooled High-End Rig",
    "category": "technology",
    "type": "gradient",
    "value": "linear-gradient(135deg, #020617 0%, #064e3b 40%, #06b6d4 80%, #67e8f9 100%)",
    "preview": "linear-gradient(135deg, #020617 0%, #064e3b 40%, #06b6d4 80%, #67e8f9 100%)",
    "tags": [
      "technology",
      "cooling",
      "supercomputer",
      "cyan",
      "liquid"
    ]
  },
  {
    "id": "technology-015-iot-connected-nodes",
    "name": "IoT Global Constellation",
    "category": "technology",
    "type": "gradient",
    "value": "radial-gradient(circle at 80% 20%, #6366f1 0%, #4338ca 35%, #1e1b4b 70%, #020617 100%)",
    "preview": "radial-gradient(circle at 80% 20%, #6366f1 0%, #4338ca 35%, #1e1b4b 70%, #020617 100%)",
    "tags": [
      "technology",
      "iot",
      "nodes",
      "constellation",
      "connected"
    ]
  },
  {
    "id": "technology-016-soundwave-frequency-spectrum",
    "name": "Audio Frequency Spectrum Bars",
    "category": "technology",
    "type": "gradient",
    "value": "linear-gradient(180deg, #09090b 0%, #0f172a 50%, #8b5cf6 85%, #ec4899 100%)",
    "preview": "linear-gradient(180deg, #09090b 0%, #0f172a 50%, #8b5cf6 85%, #ec4899 100%)",
    "tags": [
      "technology",
      "soundwave",
      "audio",
      "frequency",
      "equalizer"
    ]
  },
  {
    "id": "technology-017-ethernet-cable-patch-panel",
    "name": "High Density Patch Panel",
    "category": "technology",
    "type": "gradient",
    "value": "linear-gradient(90deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)",
    "preview": "linear-gradient(90deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)",
    "tags": [
      "technology",
      "ethernet",
      "cat6",
      "patch-panel",
      "networking"
    ]
  },
  {
    "id": "technology-018-robotic-assembly-arm",
    "name": "Automated Robotic Precision",
    "category": "technology",
    "type": "gradient",
    "value": "linear-gradient(135deg, #18181b 0%, #27272a 40%, #eab308 85%, #facc15 100%)",
    "preview": "linear-gradient(135deg, #18181b 0%, #27272a 40%, #eab308 85%, #facc15 100%)",
    "tags": [
      "technology",
      "robotic",
      "assembly",
      "automation",
      "industry"
    ]
  },
  {
    "id": "technology-019-holographic-hard-drive-platter",
    "name": "Mirror Spinning HDD Platter",
    "category": "technology",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #ffffff 0%, #94a3b8 35%, #334155 70%, #0f172a 100%)",
    "preview": "radial-gradient(circle at center, #ffffff 0%, #94a3b8 35%, #334155 70%, #0f172a 100%)",
    "tags": [
      "technology",
      "platter",
      "storage",
      "mirror",
      "hardware"
    ]
  },
  {
    "id": "technology-020-code-syntax-blur",
    "name": "Syntax Highlighting Dark Bokeh",
    "category": "technology",
    "type": "gradient",
    "value": "radial-gradient(at 15% 25%, #3b82f6 0px, transparent 40%), radial-gradient(at 85% 75%, #10b981 0px, transparent 40%), #0f172a",
    "preview": "radial-gradient(at 15% 25%, #3b82f6 0px, transparent 40%), radial-gradient(at 85% 75%, #10b981 0px, transparent 40%), #0f172a",
    "tags": [
      "technology",
      "code",
      "syntax",
      "editor",
      "developer",
      "ide"
    ]
  },
  {
    "id": "ai-001-neural-synapse-mesh",
    "name": "Neural Synapse Axon Network",
    "category": "ai",
    "type": "gradient",
    "value": "radial-gradient(circle at 70% 30%, #a855f7 0%, #6366f1 35%, #1e1b4b 75%, #020617 100%)",
    "preview": "radial-gradient(circle at 70% 30%, #a855f7 0%, #6366f1 35%, #1e1b4b 75%, #020617 100%)",
    "tags": [
      "ai",
      "neural",
      "synapse",
      "axon",
      "network",
      "violet"
    ]
  },
  {
    "id": "ai-002-generative-latent-space",
    "name": "High-Dimensional Latent Manifold",
    "category": "ai",
    "type": "gradient",
    "value": "radial-gradient(at 20% 30%, #f472b6 0px, transparent 50%), radial-gradient(at 80% 30%, #818cf8 0px, transparent 50%), radial-gradient(at 50% 80%, #34d399 0px, transparent 50%), #0f172a",
    "preview": "radial-gradient(at 20% 30%, #f472b6 0px, transparent 50%), radial-gradient(at 80% 30%, #818cf8 0px, transparent 50%), radial-gradient(at 50% 80%, #34d399 0px, transparent 50%), #0f172a",
    "tags": [
      "ai",
      "latent-space",
      "manifold",
      "generative",
      "dimensions"
    ]
  },
  {
    "id": "ai-003-digital-synthetic-cortex",
    "name": "Synthetic Algorithmic Cortex",
    "category": "ai",
    "type": "gradient",
    "value": "linear-gradient(135deg, #09090b 0%, #1e1b4b 40%, #06b6d4 85%, #a855f7 100%)",
    "preview": "linear-gradient(135deg, #09090b 0%, #1e1b4b 40%, #06b6d4 85%, #a855f7 100%)",
    "tags": [
      "ai",
      "cortex",
      "brain",
      "algorithmic",
      "cyan",
      "purple"
    ]
  },
  {
    "id": "ai-004-transformer-attention-matrix",
    "name": "Self-Attention Weights Heatmap",
    "category": "ai",
    "type": "gradient",
    "value": "radial-gradient(circle at 40% 40%, #f59e0b 0%, #dc2626 40%, #312e81 80%, #020617 100%)",
    "preview": "radial-gradient(circle at 40% 40%, #f59e0b 0%, #dc2626 40%, #312e81 80%, #020617 100%)",
    "tags": [
      "ai",
      "transformer",
      "attention",
      "llm",
      "matrix",
      "tokens"
    ]
  },
  {
    "id": "ai-005-autonomous-agent-swarm",
    "name": "Autonomous Agent Flow Field",
    "category": "ai",
    "type": "gradient",
    "value": "radial-gradient(circle at 80% 80%, #10b981 0%, #047857 40%, #0f172a 80%, #020617 100%)",
    "preview": "radial-gradient(circle at 80% 80%, #10b981 0%, #047857 40%, #0f172a 80%, #020617 100%)",
    "tags": [
      "ai",
      "agents",
      "swarm",
      "flow-field",
      "emerald"
    ]
  },
  {
    "id": "ai-006-deep-learning-loss-landscape",
    "name": "Non-Convex Loss Surface",
    "category": "ai",
    "type": "gradient",
    "value": "linear-gradient(135deg, #451a03 0%, #b45309 40%, #fbbf24 75%, #fef3c7 100%)",
    "preview": "linear-gradient(135deg, #451a03 0%, #b45309 40%, #fbbf24 75%, #fef3c7 100%)",
    "tags": [
      "ai",
      "loss-surface",
      "gradient-descent",
      "copper",
      "topography"
    ]
  },
  {
    "id": "ai-007-facial-recognition-wireframe",
    "name": "Biometric Landmark Mesh",
    "category": "ai",
    "type": "gradient",
    "value": "radial-gradient(circle at center, rgba(6,182,212,0.4) 0%, transparent 65%), #09090b",
    "preview": "radial-gradient(circle at center, rgba(6,182,212,0.4) 0%, transparent 65%), #09090b",
    "tags": [
      "ai",
      "biometric",
      "facial",
      "landmarks",
      "mesh",
      "vision"
    ]
  },
  {
    "id": "ai-008-natural-language-vector-embeddings",
    "name": "High-D Word Embedding Clusters",
    "category": "ai",
    "type": "gradient",
    "value": "radial-gradient(at 25% 25%, #818cf8 0px, transparent 40%), radial-gradient(at 75% 75%, #f472b6 0px, transparent 40%), #020617",
    "preview": "radial-gradient(at 25% 25%, #818cf8 0px, transparent 40%), radial-gradient(at 75% 75%, #f472b6 0px, transparent 40%), #020617",
    "tags": [
      "ai",
      "embeddings",
      "nlp",
      "vectors",
      "semantic",
      "rag"
    ]
  },
  {
    "id": "ai-009-diffusion-denoising-steps",
    "name": "Latent Diffusion Noise Removal",
    "category": "ai",
    "type": "gradient",
    "value": "linear-gradient(90deg, #3f3f46 0%, #71717a 50%, #ffffff 100%)",
    "preview": "linear-gradient(90deg, #3f3f46 0%, #71717a 50%, #ffffff 100%)",
    "tags": [
      "ai",
      "diffusion",
      "denoising",
      "stable-diffusion",
      "dithering"
    ]
  },
  {
    "id": "ai-010-ai-chip-neural-engine",
    "name": "NPU Core Tensor Array",
    "category": "ai",
    "type": "gradient",
    "value": "linear-gradient(135deg, #09090b 0%, #1e1b4b 40%, #4338ca 75%, #818cf8 100%)",
    "preview": "linear-gradient(135deg, #09090b 0%, #1e1b4b 40%, #4338ca 75%, #818cf8 100%)",
    "tags": [
      "ai",
      "npu",
      "chip",
      "tensor",
      "silicon",
      "hardware"
    ]
  },
  {
    "id": "ai-011-cybernetic-retina-scan",
    "name": "Computer Vision Optical Iris",
    "category": "ai",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #06b6d4 0%, #0284c7 30%, #0f172a 70%, #020617 100%)",
    "preview": "radial-gradient(circle at center, #06b6d4 0%, #0284c7 30%, #0f172a 70%, #020617 100%)",
    "tags": [
      "ai",
      "vision",
      "retina",
      "iris",
      "optical",
      "cyan"
    ]
  },
  {
    "id": "ai-012-algorithmic-tree-branching",
    "name": "MCTS Decision Tree Forest",
    "category": "ai",
    "type": "gradient",
    "value": "radial-gradient(circle at 50% 10%, #10b981 0%, #047857 35%, #064e3b 70%, #020617 100%)",
    "preview": "radial-gradient(circle at 50% 10%, #10b981 0%, #047857 35%, #064e3b 70%, #020617 100%)",
    "tags": [
      "ai",
      "decision-tree",
      "mcts",
      "branching",
      "deepseek",
      "green"
    ]
  },
  {
    "id": "ai-013-robotic-humanoid-silhouette",
    "name": "Rim-Lit Humanoid Profile",
    "category": "ai",
    "type": "gradient",
    "value": "radial-gradient(circle at 80% 50%, #ffffff 0%, #94a3b8 25%, #0f172a 65%, #020617 100%)",
    "preview": "radial-gradient(circle at 80% 50%, #ffffff 0%, #94a3b8 25%, #0f172a 65%, #020617 100%)",
    "tags": [
      "ai",
      "humanoid",
      "robot",
      "silhouette",
      "minimal",
      "futuristic"
    ]
  },
  {
    "id": "ai-014-tensor-field-flow",
    "name": "Multivariate Tensor Stream",
    "category": "ai",
    "type": "gradient",
    "value": "linear-gradient(135deg, #1e1b4b 0%, #4338ca 40%, #06b6d4 80%, #a7f3d0 100%)",
    "preview": "linear-gradient(135deg, #1e1b4b 0%, #4338ca 40%, #06b6d4 80%, #a7f3d0 100%)",
    "tags": [
      "ai",
      "tensor",
      "flow",
      "vectors",
      "streamlines"
    ]
  },
  {
    "id": "ai-015-quantum-neural-interface",
    "name": "Qubit Entangled Neural Gate",
    "category": "ai",
    "type": "gradient",
    "value": "radial-gradient(circle at 30% 70%, #ec4899 0%, #8b5cf6 40%, #1e1b4b 75%, #020617 100%)",
    "preview": "radial-gradient(circle at 30% 70%, #ec4899 0%, #8b5cf6 40%, #1e1b4b 75%, #020617 100%)",
    "tags": [
      "ai",
      "qubit",
      "quantum",
      "entanglement",
      "neural",
      "violet"
    ]
  },
  {
    "id": "ai-016-synthetic-voice-waveform",
    "name": "Neural Voice Acoustic Ripples",
    "category": "ai",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #f43f5e 0%, #be123c 35%, #4c0519 70%, #09090b 100%)",
    "preview": "radial-gradient(circle at center, #f43f5e 0%, #be123c 35%, #4c0519 70%, #09090b 100%)",
    "tags": [
      "ai",
      "voice",
      "acoustic",
      "waveform",
      "speech",
      "crimson"
    ]
  },
  {
    "id": "ai-017-reinforcement-learning-maze",
    "name": "RL Agent Policy Gradient",
    "category": "ai",
    "type": "gradient",
    "value": "linear-gradient(135deg, #022c22 0%, #065f46 45%, #10b981 80%, #a7f3d0 100%)",
    "preview": "linear-gradient(135deg, #022c22 0%, #065f46 45%, #10b981 80%, #a7f3d0 100%)",
    "tags": [
      "ai",
      "rl",
      "reward",
      "policy",
      "maze",
      "green"
    ]
  },
  {
    "id": "ai-018-knowledge-graph-galaxy",
    "name": "Trillion-Node Knowledge Graph",
    "category": "ai",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #6366f1 0%, #312e81 35%, #0f172a 75%, #020617 100%)",
    "preview": "radial-gradient(circle at center, #6366f1 0%, #312e81 35%, #0f172a 75%, #020617 100%)",
    "tags": [
      "ai",
      "knowledge-graph",
      "galaxy",
      "ontology",
      "indigo"
    ]
  },
  {
    "id": "ai-019-generative-crystal-growth",
    "name": "Autoregressive Voxel Assembly",
    "category": "ai",
    "type": "gradient",
    "value": "linear-gradient(135deg, #312e81 0%, #4c1d95 35%, #701a75 70%, #f472b6 100%)",
    "preview": "linear-gradient(135deg, #312e81 0%, #4c1d95 35%, #701a75 70%, #f472b6 100%)",
    "tags": [
      "ai",
      "voxels",
      "autoregressive",
      "crystal",
      "growth"
    ]
  },
  {
    "id": "ai-020-binary-neural-weights",
    "name": "FP16 Matrix Floating Weights",
    "category": "ai",
    "type": "gradient",
    "value": "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #f59e0b 85%, #fde047 100%)",
    "preview": "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #f59e0b 85%, #fde047 100%)",
    "tags": [
      "ai",
      "fp16",
      "matrix",
      "weights",
      "gold",
      "quantization"
    ]
  },
  {
    "id": "cyberpunk-001-neon-city-rain",
    "name": "Rain-Slicked Tokyo Asphalt",
    "category": "cyberpunk",
    "type": "image",
    "value": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80",
    "preview": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80",
    "tags": [
      "cyberpunk",
      "rain",
      "neon",
      "city",
      "street",
      "night"
    ]
  },
  {
    "id": "cyberpunk-002-alleyway-steam-pipes",
    "name": "Steaming Magenta Back-Alley",
    "category": "cyberpunk",
    "type": "image",
    "value": "https://images.unsplash.com/photo-1550684847-75bdda21cc95?auto=format&fit=crop&w=1400&q=80",
    "preview": "https://images.unsplash.com/photo-1550684847-75bdda21cc95?auto=format&fit=crop&w=400&q=80",
    "tags": [
      "cyberpunk",
      "alley",
      "steam",
      "pipes",
      "magenta",
      "grunge"
    ]
  },
  {
    "id": "cyberpunk-003-holographic-geisha-sign",
    "name": "Translucent Billboard Halo",
    "category": "cyberpunk",
    "type": "gradient",
    "value": "radial-gradient(circle at 70% 30%, #ec4899 0%, #7e22ce 40%, #0f172a 80%, #020617 100%)",
    "preview": "radial-gradient(circle at 70% 30%, #ec4899 0%, #7e22ce 40%, #0f172a 80%, #020617 100%)",
    "tags": [
      "cyberpunk",
      "billboard",
      "holographic",
      "pink",
      "purple"
    ]
  },
  {
    "id": "cyberpunk-004-rain-streaked-glass-neon",
    "name": "Rain Streaked Car Window Neon",
    "category": "cyberpunk",
    "type": "image",
    "value": "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1400&q=80",
    "preview": "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=400&q=80",
    "tags": [
      "cyberpunk",
      "rain",
      "window",
      "blur",
      "bokeh",
      "traffic"
    ]
  },
  {
    "id": "cyberpunk-005-cyber-deck-terminal",
    "name": "Netrunner Deck Console",
    "category": "cyberpunk",
    "type": "gradient",
    "value": "linear-gradient(135deg, #09090b 0%, #1c1917 50%, #facc15 85%, #f59e0b 100%)",
    "preview": "linear-gradient(135deg, #09090b 0%, #1c1917 50%, #facc15 85%, #f59e0b 100%)",
    "tags": [
      "cyberpunk",
      "deck",
      "netrunner",
      "terminal",
      "yellow"
    ]
  },
  {
    "id": "cyberpunk-006-neon-motorcycle-streaks",
    "name": "Underground Highway Light Trails",
    "category": "cyberpunk",
    "type": "gradient",
    "value": "linear-gradient(90deg, #f43f5e 0%, #06b6d4 50%, #020617 100%)",
    "preview": "linear-gradient(90deg, #f43f5e 0%, #06b6d4 50%, #020617 100%)",
    "tags": [
      "cyberpunk",
      "light-trails",
      "motorcycle",
      "highway",
      "speed"
    ]
  },
  {
    "id": "cyberpunk-007-industrial-scaffolding-fog",
    "name": "Sulfur Smog Industrial Towers",
    "category": "cyberpunk",
    "type": "gradient",
    "value": "linear-gradient(180deg, #451a03 0%, #78350f 45%, #b45309 75%, #09090b 100%)",
    "preview": "linear-gradient(180deg, #451a03 0%, #78350f 45%, #b45309 75%, #09090b 100%)",
    "tags": [
      "cyberpunk",
      "smog",
      "industrial",
      "sulfur",
      "towers",
      "amber"
    ]
  },
  {
    "id": "cyberpunk-008-broken-vending-machine",
    "name": "Flickering Cyan Drink Dispenser",
    "category": "cyberpunk",
    "type": "gradient",
    "value": "radial-gradient(circle at 30% 70%, #06b6d4 0%, #083344 35%, #020617 80%)",
    "preview": "radial-gradient(circle at 30% 70%, #06b6d4 0%, #083344 35%, #020617 80%)",
    "tags": [
      "cyberpunk",
      "vending",
      "flicker",
      "cyan",
      "retro-future"
    ]
  },
  {
    "id": "cyberpunk-009-cybernetic-arm-schematic",
    "name": "Combat Prosthetic Wireframe",
    "category": "cyberpunk",
    "type": "gradient",
    "value": "linear-gradient(135deg, #18181b 0%, #27272a 50%, #ca8a04 85%, #facc15 100%)",
    "preview": "linear-gradient(135deg, #18181b 0%, #27272a 50%, #ca8a04 85%, #facc15 100%)",
    "tags": [
      "cyberpunk",
      "prosthetic",
      "schematic",
      "blueprint",
      "yellow"
    ]
  },
  {
    "id": "cyberpunk-010-neon-wire-spaghetti",
    "name": "Exposed Conduit Wire Cluster",
    "category": "cyberpunk",
    "type": "gradient",
    "value": "linear-gradient(135deg, #09090b 0%, #7f1d1d 30%, #0284c7 70%, #064e3b 100%)",
    "preview": "linear-gradient(135deg, #09090b 0%, #7f1d1d 30%, #0284c7 70%, #064e3b 100%)",
    "tags": [
      "cyberpunk",
      "wires",
      "conduits",
      "spaghetti",
      "tangle"
    ]
  },
  {
    "id": "cyberpunk-011-wet-rooftop-helipad",
    "name": "Puddle Glare Penthouse Helipad",
    "category": "cyberpunk",
    "type": "gradient",
    "value": "linear-gradient(180deg, #09090b 0%, #1e1b4b 45%, #0284c7 85%, #38bdf8 100%)",
    "preview": "linear-gradient(180deg, #09090b 0%, #1e1b4b 45%, #0284c7 85%, #38bdf8 100%)",
    "tags": [
      "cyberpunk",
      "rooftop",
      "helipad",
      "puddle",
      "glare"
    ]
  },
  {
    "id": "cyberpunk-012-subway-car-interior-dark",
    "name": "Nocturnal Transit Car Interior",
    "category": "cyberpunk",
    "type": "gradient",
    "value": "linear-gradient(90deg, #09090b 0%, #831843 50%, #09090b 100%)",
    "preview": "linear-gradient(90deg, #09090b 0%, #831843 50%, #09090b 100%)",
    "tags": [
      "cyberpunk",
      "subway",
      "transit",
      "pink",
      "flicker"
    ]
  },
  {
    "id": "cyberpunk-013-black-market-clinic",
    "name": "Stainless Steel Ripperdoc Clinic",
    "category": "cyberpunk",
    "type": "gradient",
    "value": "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #0d9488 85%, #2dd4bf 100%)",
    "preview": "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #0d9488 85%, #2dd4bf 100%)",
    "tags": [
      "cyberpunk",
      "clinic",
      "ripperdoc",
      "teal",
      "cold",
      "steel"
    ]
  },
  {
    "id": "cyberpunk-014-neon-katana-reflection",
    "name": "Monofilament Edge Glare",
    "category": "cyberpunk",
    "type": "gradient",
    "value": "linear-gradient(135deg, #09090b 0%, #18181b 40%, #e11d48 80%, #f43f5e 100%)",
    "preview": "linear-gradient(135deg, #09090b 0%, #18181b 40%, #e11d48 80%, #f43f5e 100%)",
    "tags": [
      "cyberpunk",
      "blade",
      "katana",
      "monofilament",
      "crimson"
    ]
  },
  {
    "id": "cyberpunk-015-surveillance-camera-cluster",
    "name": "Red Eye Infrared Surveillance",
    "category": "cyberpunk",
    "type": "gradient",
    "value": "radial-gradient(circle at 75% 25%, #ef4444 0%, #7f1d1d 30%, #09090b 70%)",
    "preview": "radial-gradient(circle at 75% 25%, #ef4444 0%, #7f1d1d 30%, #09090b 70%)",
    "tags": [
      "cyberpunk",
      "surveillance",
      "camera",
      "red-eye",
      "infrared"
    ]
  },
  {
    "id": "cyberpunk-016-toxic-acid-canal",
    "name": "Fluorescent Slum Runoff Canal",
    "category": "cyberpunk",
    "type": "gradient",
    "value": "linear-gradient(180deg, #09090b 0%, #052e16 45%, #84cc16 85%, #bef264 100%)",
    "preview": "linear-gradient(180deg, #09090b 0%, #052e16 45%, #84cc16 85%, #bef264 100%)",
    "tags": [
      "cyberpunk",
      "acid",
      "canal",
      "lime",
      "toxic",
      "runoff"
    ]
  },
  {
    "id": "cyberpunk-017-ramshackle-shanty-towers",
    "name": "Stacked Container Megaslum",
    "category": "cyberpunk",
    "type": "gradient",
    "value": "linear-gradient(135deg, #1c1917 0%, #451a03 35%, #701a75 70%, #ec4899 100%)",
    "preview": "linear-gradient(135deg, #1c1917 0%, #451a03 35%, #701a75 70%, #ec4899 100%)",
    "tags": [
      "cyberpunk",
      "shanty",
      "containers",
      "slum",
      "neon-signs"
    ]
  },
  {
    "id": "cyberpunk-018-neon-cross-pharmacy",
    "name": "Pulsing Emerald Pharmacy Beacon",
    "category": "cyberpunk",
    "type": "gradient",
    "value": "radial-gradient(circle at 30% 30%, #10b981 0%, #064e3b 40%, #020617 80%)",
    "preview": "radial-gradient(circle at 30% 30%, #10b981 0%, #064e3b 40%, #020617 80%)",
    "tags": [
      "cyberpunk",
      "pharmacy",
      "cross",
      "emerald",
      "beacon"
    ]
  },
  {
    "id": "cyberpunk-019-fiber-optic-dreadlocks",
    "name": "Hacker Fiber Optic Conduits",
    "category": "cyberpunk",
    "type": "gradient",
    "value": "linear-gradient(135deg, #020617 0%, #312e81 40%, #06b6d4 80%, #67e8f9 100%)",
    "preview": "linear-gradient(135deg, #020617 0%, #312e81 40%, #06b6d4 80%, #67e8f9 100%)",
    "tags": [
      "cyberpunk",
      "fiber",
      "conduits",
      "hacker",
      "azure"
    ]
  },
  {
    "id": "cyberpunk-020-monorail-track-perspective",
    "name": "Elevated Sky-Train Megagrid",
    "category": "cyberpunk",
    "type": "gradient",
    "value": "linear-gradient(180deg, #09090b 0%, #1e1b4b 45%, #ec4899 85%, #f43f5e 100%)",
    "preview": "linear-gradient(180deg, #09090b 0%, #1e1b4b 45%, #ec4899 85%, #f43f5e 100%)",
    "tags": [
      "cyberpunk",
      "monorail",
      "sky-train",
      "transit",
      "pink"
    ]
  },
  {
    "id": "neon-001-electric-cyan-frame",
    "name": "Electric Cyan Neon Portal",
    "category": "neon",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #000000 65%, #06b6d4 70%, #000000 80%), #000000",
    "preview": "radial-gradient(circle at center, #000000 65%, #06b6d4 70%, #000000 80%), #000000",
    "tags": [
      "neon",
      "cyan",
      "portal",
      "frame",
      "electric",
      "dark"
    ]
  },
  {
    "id": "neon-002-hot-pink-heart-glow",
    "name": "Hot Fuchsia Neon Wall Wash",
    "category": "neon",
    "type": "gradient",
    "value": "radial-gradient(circle at 50% 50%, #f43f5e 0%, #be123c 35%, #881337 60%, #09090b 100%)",
    "preview": "radial-gradient(circle at 50% 50%, #f43f5e 0%, #be123c 35%, #881337 60%, #09090b 100%)",
    "tags": [
      "neon",
      "pink",
      "fuchsia",
      "wall-wash",
      "vibrant",
      "glow"
    ]
  },
  {
    "id": "neon-003-geometric-neon-triangle",
    "name": "Inverted Lemon Neon Triangle",
    "category": "neon",
    "type": "gradient",
    "value": "radial-gradient(circle at 50% 40%, #facc15 0%, #ca8a04 35%, #713f12 65%, #09090b 100%)",
    "preview": "radial-gradient(circle at 50% 40%, #facc15 0%, #ca8a04 35%, #713f12 65%, #09090b 100%)",
    "tags": [
      "neon",
      "triangle",
      "yellow",
      "lemon",
      "geometric",
      "halo"
    ]
  },
  {
    "id": "neon-004-neon-abstract-squiggles",
    "name": "Abstract Bent Tube Squiggles",
    "category": "neon",
    "type": "gradient",
    "value": "linear-gradient(135deg, #09090b 0%, #ec4899 35%, #06b6d4 70%, #a855f7 100%)",
    "preview": "linear-gradient(135deg, #09090b 0%, #ec4899 35%, #06b6d4 70%, #a855f7 100%)",
    "tags": [
      "neon",
      "squiggles",
      "tubes",
      "coral",
      "cyan",
      "fun"
    ]
  },
  {
    "id": "neon-005-vertical-neon-light-bars",
    "name": "Rhythmic Vertical Light Battens",
    "category": "neon",
    "type": "gradient",
    "value": "repeating-linear-gradient(90deg, #09090b 0px, #09090b 30px, #3b82f6 30px, #3b82f6 34px, #09090b 34px, #09090b 60px, #8b5cf6 60px, #8b5cf6 64px)",
    "preview": "repeating-linear-gradient(90deg, #09090b 0px, #09090b 30px, #3b82f6 30px, #3b82f6 34px, #09090b 34px, #09090b 60px, #8b5cf6 60px, #8b5cf6 64px)",
    "tags": [
      "neon",
      "light-bars",
      "battens",
      "vertical",
      "stage"
    ]
  },
  {
    "id": "neon-006-neon-sunburst-circle",
    "name": "Retro Neon Sunset Circle",
    "category": "neon",
    "type": "gradient",
    "value": "radial-gradient(circle at 50% 60%, #f97316 0%, #db2777 40%, #1e1b4b 75%, #020617 100%)",
    "preview": "radial-gradient(circle at 50% 60%, #f97316 0%, #db2777 40%, #1e1b4b 75%, #020617 100%)",
    "tags": [
      "neon",
      "sunburst",
      "sunset",
      "retro",
      "80s",
      "synthwave"
    ]
  },
  {
    "id": "neon-007-ultra-violet-glow-tubes",
    "name": "Actinic Blacklight UV Glow",
    "category": "neon",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #7c3aed 0%, #4c1d95 40%, #1e1b4b 75%, #09090b 100%)",
    "preview": "radial-gradient(circle at center, #7c3aed 0%, #4c1d95 40%, #1e1b4b 75%, #09090b 100%)",
    "tags": [
      "neon",
      "ultraviolet",
      "uv",
      "blacklight",
      "actinic",
      "violet"
    ]
  },
  {
    "id": "neon-008-neon-infinity-mirror",
    "name": "Infinity Mirror Corridor",
    "category": "neon",
    "type": "gradient",
    "value": "radial-gradient(circle at center, #10b981 0%, #064e3b 35%, #022c22 65%, #000000 100%)",
    "preview": "radial-gradient(circle at center, #10b981 0%, #064e3b 35%, #022c22 65%, #000000 100%)",
    "tags": [
      "neon",
      "infinity-mirror",
      "tunnel",
      "green",
      "led"
    ]
  },
  {
    "id": "neon-009-tangerine-neon-arch",
    "name": "Tangerine Architecture Archway",
    "category": "neon",
    "type": "gradient",
    "value": "radial-gradient(circle at 50% 30%, #ea580c 0%, #9a3412 40%, #1c1917 80%, #09090b 100%)",
    "preview": "radial-gradient(circle at 50% 30%, #ea580c 0%, #9a3412 40%, #1c1917 80%, #09090b 100%)",
    "tags": [
      "neon",
      "tangerine",
      "archway",
      "orange",
      "architectural"
    ]
  },
  {
    "id": "neon-010-neon-flicker-faulty",
    "name": "Authentic Amber Electrode Flicker",
    "category": "neon",
    "type": "gradient",
    "value": "radial-gradient(circle at 35% 45%, #f59e0b 0%, #b45309 30%, #451a03 60%, #09090b 100%)",
    "preview": "radial-gradient(circle at 35% 45%, #f59e0b 0%, #b45309 30%, #451a03 60%, #09090b 100%)",
    "tags": [
      "neon",
      "flicker",
      "amber",
      "electrode",
      "vintage"
    ]
  },
  {
    "id": "neon-011-overlapping-neon-rings",
    "name": "Cyan & Magenta Intersecting Rings",
    "category": "neon",
    "type": "gradient",
    "value": "radial-gradient(circle at 35% 50%, rgba(6,182,212,0.8) 0%, transparent 50%), radial-gradient(circle at 65% 50%, rgba(236,72,153,0.8) 0%, transparent 50%), #09090b",
    "preview": "radial-gradient(circle at 35% 50%, rgba(6,182,212,0.8) 0%, transparent 50%), radial-gradient(circle at 65% 50%, rgba(236,72,153,0.8) 0%, transparent 50%), #09090b",
    "tags": [
      "neon",
      "rings",
      "cyan",
      "magenta",
      "intersection"
    ]
  },
  {
    "id": "neon-012-neon-sign-backside-wires",
    "name": "Industrial Sign GTO Transformers",
    "category": "neon",
    "type": "gradient",
    "value": "linear-gradient(135deg, #18181b 0%, #27272a 50%, #451a03 85%, #b45309 100%)",
    "preview": "linear-gradient(135deg, #18181b 0%, #27272a 50%, #451a03 85%, #b45309 100%)",
    "tags": [
      "neon",
      "industrial",
      "wires",
      "transformer",
      "dark"
    ]
  },
  {
    "id": "neon-013-laser-red-linear-blade",
    "name": "Horizontal Laser Blade Split",
    "category": "neon",
    "type": "gradient",
    "value": "linear-gradient(180deg, #09090b 0%, #09090b 49%, #ef4444 50%, #09090b 51%, #09090b 100%)",
    "preview": "linear-gradient(180deg, #09090b 0%, #09090b 49%, #ef4444 50%, #09090b 51%, #09090b 100%)",
    "tags": [
      "neon",
      "laser",
      "red",
      "blade",
      "linear",
      "minimal"
    ]
  },
  {
    "id": "neon-014-neon-smoke-swirl",
    "name": "Volumetric Smoke Cloud Neon",
    "category": "neon",
    "type": "image",
    "value": "https://images.unsplash.com/photo-1550684847-75bdda21cc95?auto=format&fit=crop&w=1400&q=80",
    "preview": "https://images.unsplash.com/photo-1550684847-75bdda21cc95?auto=format&fit=crop&w=400&q=80",
    "tags": [
      "neon",
      "smoke",
      "swirl",
      "colorful",
      "dark",
      "volumetric"
    ]
  },
  {
    "id": "neon-015-neon-grid-horizon",
    "name": "Synthwave Perspective Floor Grid",
    "category": "neon",
    "type": "gradient",
    "value": "linear-gradient(180deg, #020617 0%, #1e1b4b 60%, #ec4899 90%, #06b6d4 100%)",
    "preview": "linear-gradient(180deg, #020617 0%, #1e1b4b 60%, #ec4899 90%, #06b6d4 100%)",
    "tags": [
      "neon",
      "grid",
      "synthwave",
      "horizon",
      "80s"
    ]
  },
  {
    "id": "neon-016-mint-green-neon-oval",
    "name": "Mint Minimal Neon Oval",
    "category": "neon",
    "type": "gradient",
    "value": "radial-gradient(ellipse at center, #10b981 0%, #064e3b 40%, #022c22 75%, #020617 100%)",
    "preview": "radial-gradient(ellipse at center, #10b981 0%, #064e3b 40%, #022c22 75%, #020617 100%)",
    "tags": [
      "neon",
      "mint",
      "green",
      "oval",
      "glow"
    ]
  },
  {
    "id": "neon-017-neon-angel-wings-silhouette",
    "name": "Feathered Neon Arc Silhouette",
    "category": "neon",
    "type": "gradient",
    "value": "radial-gradient(circle at 50% 40%, #a855f7 0%, #7e22ce 35%, #09090b 75%)",
    "preview": "radial-gradient(circle at 50% 40%, #a855f7 0%, #7e22ce 35%, #09090b 75%)",
    "tags": [
      "neon",
      "angel",
      "wings",
      "violet",
      "silhouette"
    ]
  },
  {
    "id": "neon-018-prismatic-neon-cluster",
    "name": "Rainbow Indicator Cluster",
    "category": "neon",
    "type": "gradient",
    "value": "linear-gradient(135deg, #ef4444 0%, #f59e0b 25%, #10b981 50%, #3b82f6 75%, #8b5cf6 100%)",
    "preview": "linear-gradient(135deg, #ef4444 0%, #f59e0b 25%, #10b981 50%, #3b82f6 75%, #8b5cf6 100%)",
    "tags": [
      "neon",
      "rainbow",
      "prismatic",
      "spectrum",
      "indicator"
    ]
  },
  {
    "id": "neon-019-golden-yellow-neon-bracket",
    "name": "Industrial Amber Corner Brackets",
    "category": "neon",
    "type": "gradient",
    "value": "radial-gradient(circle at 10% 10%, #fbbf24 0%, #b45309 30%, #09090b 70%)",
    "preview": "radial-gradient(circle at 10% 10%, #fbbf24 0%, #b45309 30%, #09090b 70%)",
    "tags": [
      "neon",
      "amber",
      "safety",
      "brackets",
      "industrial"
    ]
  },
  {
    "id": "neon-020-diffused-neon-underglow",
    "name": "Concealed Studio Underglow",
    "category": "neon",
    "type": "gradient",
    "value": "radial-gradient(circle at 50% 100%, #6366f1 0%, #312e81 35%, #0f172a 70%, #020617 100%)",
    "preview": "radial-gradient(circle at 50% 100%, #6366f1 0%, #312e81 35%, #0f172a 70%, #020617 100%)",
    "tags": [
      "neon",
      "underglow",
      "diffused",
      "indigo",
      "wall-wash"
    ]
  },
  {
    "id": "glitch-001-chromatic-rgb-split",
    "name": "RGB Channel Split Displacement",
    "category": "glitch",
    "type": "gradient",
    "value": "linear-gradient(90deg, #ef4444 0%, #09090b 25%, #06b6d4 50%, #09090b 75%, #10b981 100%)",
    "preview": "linear-gradient(90deg, #ef4444 0%, #09090b 25%, #06b6d4 50%, #09090b 75%, #10b981 100%)",
    "tags": [
      "glitch",
      "rgb",
      "chromatic",
      "split",
      "displacement"
    ]
  },
  {
    "id": "glitch-002-vhs-tracking-distortion",
    "name": "1980s VHS Tracking Noise",
    "category": "glitch",
    "type": "gradient",
    "value": "linear-gradient(180deg, #09090b 0%, #18181b 75%, #71717a 85%, #ffffff 88%, #09090b 92%)",
    "preview": "linear-gradient(180deg, #09090b 0%, #18181b 75%, #71717a 85%, #ffffff 88%, #09090b 92%)",
    "tags": [
      "glitch",
      "vhs",
      "tracking",
      "analog",
      "static",
      "retro"
    ]
  },
  {
    "id": "glitch-003-digital-databend-blocks",
    "name": "Hex Databend Pixel Blocks",
    "category": "glitch",
    "type": "gradient",
    "value": "linear-gradient(135deg, #0f172a 0%, #ec4899 40%, #06b6d4 70%, #020617 100%)",
    "preview": "linear-gradient(135deg, #0f172a 0%, #ec4899 40%, #06b6d4 70%, #020617 100%)",
    "tags": [
      "glitch",
      "databend",
      "blocks",
      "mosaic",
      "digital"
    ]
  },
  {
    "id": "glitch-004-crt-scanline-phosphor",
    "name": "Aperture Grille CRT Scanlines",
    "category": "glitch",
    "type": "gradient",
    "value": "repeating-linear-gradient(180deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.6) 2px, rgba(0,0,0,0.6) 4px), linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
    "preview": "repeating-linear-gradient(180deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.6) 2px, rgba(0,0,0,0.6) 4px), linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
    "tags": [
      "glitch",
      "crt",
      "scanline",
      "phosphor",
      "monitor",
      "green"
    ]
  },
  {
    "id": "glitch-005-pixel-sorting-cascade",
    "name": "Vertical Pixel Sorting Flow",
    "category": "glitch",
    "type": "gradient",
    "value": "linear-gradient(180deg, #0f172a 0%, #4338ca 35%, #ec4899 70%, #fbbf24 100%)",
    "preview": "linear-gradient(180deg, #0f172a 0%, #4338ca 35%, #ec4899 70%, #fbbf24 100%)",
    "tags": [
      "glitch",
      "pixel-sorting",
      "waterfall",
      "streaks",
      "generative"
    ]
  },
  {
    "id": "glitch-006-broken-lcd-liquid-bleed",
    "name": "Fractured LCD Crystal Bleed",
    "category": "glitch",
    "type": "gradient",
    "value": "radial-gradient(circle at 25% 35%, #000000 0%, #1e1b4b 30%, #ec4899 60%, #06b6d4 100%)",
    "preview": "radial-gradient(circle at 25% 35%, #000000 0%, #1e1b4b 30%, #ec4899 60%, #06b6d4 100%)",
    "tags": [
      "glitch",
      "lcd",
      "bleed",
      "fracture",
      "spiderweb"
    ]
  },
  {
    "id": "glitch-007-analog-signal-static",
    "name": "Broadcast Static White Noise",
    "category": "glitch",
    "type": "gradient",
    "value": "linear-gradient(135deg, #18181b 0%, #3f3f46 50%, #71717a 100%)",
    "preview": "linear-gradient(135deg, #18181b 0%, #3f3f46 50%, #71717a 100%)",
    "tags": [
      "glitch",
      "static",
      "broadcast",
      "noise",
      "analog",
      "tv"
    ]
  },
  {
    "id": "glitch-008-corrupted-jpeg-artifacts",
    "name": "8x8 DCT Compression Artifacts",
    "category": "glitch",
    "type": "gradient",
    "value": "linear-gradient(45deg, #09090b 0%, #1e1b4b 45%, #f43f5e 80%, #06b6d4 100%)",
    "preview": "linear-gradient(45deg, #09090b 0%, #1e1b4b 45%, #f43f5e 80%, #06b6d4 100%)",
    "tags": [
      "glitch",
      "jpeg",
      "artifacts",
      "compression",
      "macroblocks"
    ]
  },
  {
    "id": "glitch-009-cyber-glitch-displacement",
    "name": "Cyan Vector Scan Displace",
    "category": "glitch",
    "type": "gradient",
    "value": "linear-gradient(90deg, #020617 0%, #06b6d4 40%, #020617 60%, #ec4899 100%)",
    "preview": "linear-gradient(90deg, #020617 0%, #06b6d4 40%, #020617 60%, #ec4899 100%)",
    "tags": [
      "glitch",
      "displacement",
      "cyber",
      "cyan",
      "vector"
    ]
  },
  {
    "id": "glitch-010-interlaced-video-comb",
    "name": "60i Comb Motion Artifacts",
    "category": "glitch",
    "type": "gradient",
    "value": "repeating-linear-gradient(180deg, #000000 0px, #000000 3px, #27272a 3px, #27272a 6px)",
    "preview": "repeating-linear-gradient(180deg, #000000 0px, #000000 3px, #27272a 3px, #27272a 6px)",
    "tags": [
      "glitch",
      "interlace",
      "comb",
      "video",
      "motion"
    ]
  },
  {
    "id": "glitch-011-hologram-interference-flicker",
    "name": "Fading Hologram Interference",
    "category": "glitch",
    "type": "gradient",
    "value": "linear-gradient(180deg, rgba(6,182,212,0.1) 0%, rgba(99,102,241,0.4) 50%, rgba(6,182,212,0.1) 100%), #020617",
    "preview": "linear-gradient(180deg, rgba(6,182,212,0.1) 0%, rgba(99,102,241,0.4) 50%, rgba(6,182,212,0.1) 100%), #020617",
    "tags": [
      "glitch",
      "hologram",
      "interference",
      "flicker",
      "cyan"
    ]
  },
  {
    "id": "glitch-012-rgb-subpixel-blowup",
    "name": "Subpixel OLED Diodes Array",
    "category": "glitch",
    "type": "gradient",
    "value": "repeating-linear-gradient(90deg, #ef4444 0px, #ef4444 4px, #10b981 4px, #10b981 8px, #3b82f6 8px, #3b82f6 12px)",
    "preview": "repeating-linear-gradient(90deg, #ef4444 0px, #ef4444 4px, #10b981 4px, #10b981 8px, #3b82f6 8px, #3b82f6 12px)",
    "tags": [
      "glitch",
      "oled",
      "subpixels",
      "diodes",
      "macro",
      "rgb"
    ]
  },
  {
    "id": "glitch-013-tape-mangling-analog",
    "name": "Mangled Cassette Ribbon Static",
    "category": "glitch",
    "type": "gradient",
    "value": "linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)",
    "preview": "linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)",
    "tags": [
      "glitch",
      "tape",
      "cassette",
      "analog",
      "static"
    ]
  },
  {
    "id": "glitch-014-gpu-memory-artifact-pattern",
    "name": "Overheated VRAM Checkers",
    "category": "glitch",
    "type": "gradient",
    "value": "repeating-conic-gradient(#ec4899 0% 25%, #10b981 0% 50%) 50% / 20px 20px",
    "preview": "repeating-conic-gradient(#ec4899 0% 25%, #10b981 0% 50%) 50% / 20px 20px",
    "tags": [
      "glitch",
      "vram",
      "gpu",
      "checkers",
      "magenta",
      "green"
    ]
  },
  {
    "id": "glitch-015-bitshift-parity-error",
    "name": "Bitshift Memory Corruption",
    "category": "glitch",
    "type": "gradient",
    "value": "linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #38bdf8 100%)",
    "preview": "linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #38bdf8 100%)",
    "tags": [
      "glitch",
      "bitshift",
      "memory",
      "corruption",
      "blue"
    ]
  },
  {
    "id": "glitch-016-psychedelic-color-inversion",
    "name": "Solarized Video Inversion",
    "category": "glitch",
    "type": "gradient",
    "value": "linear-gradient(135deg, #ec4899 0%, #facc15 50%, #3b82f6 100%)",
    "preview": "linear-gradient(135deg, #ec4899 0%, #facc15 50%, #3b82f6 100%)",
    "tags": [
      "glitch",
      "solarized",
      "inversion",
      "psychedelic",
      "vivid"
    ]
  },
  {
    "id": "glitch-017-dithering-matrix-error",
    "name": "Bayer Matrix Dither Fade",
    "category": "glitch",
    "type": "gradient",
    "value": "linear-gradient(135deg, #27272a 0%, #52525b 50%, #a1a1aa 100%)",
    "preview": "linear-gradient(135deg, #27272a 0%, #52525b 50%, #a1a1aa 100%)",
    "tags": [
      "glitch",
      "dither",
      "bayer",
      "matrix",
      "grayscale"
    ]
  },
  {
    "id": "glitch-018-horizontal-sync-tear",
    "name": "Horizontal Sync Tear Fringe",
    "category": "glitch",
    "type": "gradient",
    "value": "linear-gradient(180deg, #020617 0%, #020617 60%, #ef4444 60.5%, #06b6d4 61%, #020617 61.5%, #020617 100%)",
    "preview": "linear-gradient(180deg, #020617 0%, #020617 60%, #ef4444 60.5%, #06b6d4 61%, #020617 61.5%, #020617 100%)",
    "tags": [
      "glitch",
      "sync-tear",
      "tear",
      "h-sync",
      "fringe"
    ]
  },
  {
    "id": "glitch-019-glitched-barcode-lines",
    "name": "Warped Barcode Frequencies",
    "category": "glitch",
    "type": "gradient",
    "value": "repeating-linear-gradient(90deg, #000000 0px, #000000 5px, #ffffff 5px, #ffffff 8px, #000000 8px, #000000 14px, #ffffff 14px, #ffffff 20px)",
    "preview": "repeating-linear-gradient(90deg, #000000 0px, #000000 5px, #ffffff 5px, #ffffff 8px, #000000 8px, #000000 14px, #ffffff 14px, #ffffff 20px)",
    "tags": [
      "glitch",
      "barcode",
      "lines",
      "black-white",
      "stark"
    ]
  },
  {
    "id": "glitch-020-surveillance-feed-drop",
    "name": "CCTV Packet Loss Glitch",
    "category": "glitch",
    "type": "gradient",
    "value": "linear-gradient(135deg, #09090b 0%, #14532d 40%, #15803d 75%, #86efac 100%)",
    "preview": "linear-gradient(135deg, #09090b 0%, #14532d 40%, #15803d 75%, #86efac 100%)",
    "tags": [
      "glitch",
      "cctv",
      "surveillance",
      "packet-loss",
      "green",
      "night-vision"
    ]
  },

  // =========================================================================
  // ADDITIONAL CURATED CLASSICS (TEXTURES, NATURE & STUDIO)
  // =========================================================================
  {
    id: "tex-geometric-tiles",
    name: "Moroccan Geometric Mosaic",
    category: "textures",
    type: "image",
    value: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1400&q=80",
    preview: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80",
    tags: ["tiles", "mosaic", "pattern", "geometry", "moroccan"]
  },
  {
    id: "tex-wood-grain",
    name: "Warm Scandinavian Oak",
    category: "textures",
    type: "image",
    value: "https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=1400&q=80",
    preview: "https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=400&q=80",
    tags: ["wood", "oak", "timber", "natural", "warm"]
  },
  {
    id: "tex-black-leather",
    name: "Perforated Luxury Leather",
    category: "textures",
    type: "image",
    value: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=1400&q=80",
    preview: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=400&q=80",
    tags: ["leather", "black", "luxury", "upholstery"]
  },
  {
    id: "tex-white-brick",
    name: "Painted White Brick Loft",
    category: "textures",
    type: "image",
    value: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80",
    preview: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80",
    tags: ["brick", "loft", "white", "industrial", "urban"]
  },
  {
    id: "nat-misty-mountains",
    name: "Dramatic Misty Alpine Peaks",
    category: "nature",
    type: "image",
    value: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80",
    preview: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80",
    tags: ["mountains", "alps", "fog", "dramatic", "nature", "outdoor"]
  },
  {
    id: "nat-dark-forest-pine",
    name: "Evergreen Pine Forest Canopy",
    category: "nature",
    type: "image",
    value: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=80",
    preview: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80",
    tags: ["forest", "trees", "pine", "green", "moody", "canopy"]
  },
  {
    id: "nat-coastal-sunset-waves",
    name: "Golden Coastal Horizon Swell",
    category: "nature",
    type: "image",
    value: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
    preview: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
    tags: ["ocean", "sunset", "beach", "waves", "water", "gold"]
  },
  {
    id: "nat-desert-dune-shadow",
    name: "Sahara Sinuous Sand Dune",
    category: "nature",
    type: "image",
    value: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1400&q=80",
    preview: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80",
    tags: ["desert", "sahara", "dune", "sand", "warm", "minimal"]
  },
  {
    id: "stu-solid-chalk-white",
    name: "Pure Chalk Studio White",
    category: "studio",
    type: "color",
    value: "#ffffff",
    preview: "#ffffff",
    tags: ["solid", "white", "clean", "light", "studio"]
  },
  {
    id: "stu-solid-obsidian-black",
    name: "Deep Obsidian Black",
    category: "studio",
    type: "color",
    value: "#000000",
    preview: "#000000",
    tags: ["solid", "black", "dark", "pure", "contrast"]
  },
  {
    id: "stu-solid-racing-green",
    name: "British Racing Green",
    category: "studio",
    type: "color",
    value: "#064e3b",
    preview: "#064e3b",
    tags: ["solid", "green", "racing", "luxury", "classic"]
  },
  {
    id: "stu-solid-bordeaux-wine",
    name: "Royal Bordeaux Wine",
    category: "studio",
    type: "color",
    value: "#4c0519",
    preview: "#4c0519",
    tags: ["solid", "wine", "burgundy", "royal", "rich"]
  }
];
