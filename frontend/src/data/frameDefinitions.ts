export type FrameCategory =
  | "all"
  | "basic"
  | "shapes"
  | "blob"
  | "geometric"
  | "decorative"
  | "photo";

export interface FrameDefinition {
  id: string;
  name: string;
  category: FrameCategory;
  svgPath100: string; // 100x100 normalized path
  aspectRatio?: number; // width / height default ratio, default 1
  hasBorderSupport?: boolean;
  defaultWidth?: number;
  defaultHeight?: number;
  isPolaroid?: boolean;
}

export const FRAME_DEFINITIONS: FrameDefinition[] = [
  // ── BASIC SHAPES ───────────────────────────────────────────────────────────
  {
    id: "circle",
    name: "Circle",
    category: "basic",
    svgPath100: "M 50, 0 A 50, 50 0 1, 1 50, 100 A 50, 50 0 1, 1 50, 0 Z",
    aspectRatio: 1,
  },
  {
    id: "square",
    name: "Square",
    category: "basic",
    svgPath100: "M 0,0 L 100,0 L 100,100 L 0,100 Z",
    aspectRatio: 1,
  },
  {
    id: "rectangle",
    name: "Rectangle",
    category: "basic",
    svgPath100: "M 0,0 L 100,0 L 100,100 L 0,100 Z",
    aspectRatio: 1.5,
    defaultWidth: 300,
    defaultHeight: 200,
  },
  {
    id: "rounded-rect",
    name: "Rounded Rectangle",
    category: "basic",
    svgPath100:
      "M 16,0 L 84,0 A 16,16 0 0 1 100,16 L 100,84 A 16,16 0 0 1 84,100 L 16,100 A 16,16 0 0 1 0,84 L 0,16 A 16,16 0 0 1 16,0 Z",
    aspectRatio: 1,
  },

  // ── SPECIAL SHAPES ─────────────────────────────────────────────────────────
  {
    id: "heart",
    name: "Heart",
    category: "shapes",
    svgPath100:
      "M 50,88 C 20,68 0,50 0,30 C 0,12 14,0 32,0 C 42,0 50,8 50,16 C 50,8 58,0 68,0 C 86,0 100,12 100,30 C 100,50 80,68 50,88 Z",
    aspectRatio: 1,
  },
  {
    id: "star",
    name: "Star",
    category: "shapes",
    svgPath100:
      "M 50,0 L 65,30 L 98,35 L 74,58 L 80,91 L 50,75 L 20,91 L 26,58 L 2,35 L 35,30 Z",
    aspectRatio: 1,
  },
  {
    id: "diamond",
    name: "Diamond",
    category: "shapes",
    svgPath100: "M 50,0 L 100,50 L 50,100 L 0,50 Z",
    aspectRatio: 1,
  },
  {
    id: "triangle",
    name: "Triangle",
    category: "shapes",
    svgPath100: "M 50,0 L 100,100 L 0,100 Z",
    aspectRatio: 1,
  },
  {
    id: "hexagon",
    name: "Hexagon",
    category: "shapes",
    svgPath100: "M 50,0 L 93,25 L 93,75 L 50,100 L 7,75 L 7,25 Z",
    aspectRatio: 1,
  },
  {
    id: "octagon",
    name: "Octagon",
    category: "shapes",
    svgPath100:
      "M 30,0 L 70,0 L 100,30 L 100,70 L 70,100 L 30,100 L 0,70 L 0,30 Z",
    aspectRatio: 1,
  },

  // ── ORGANIC / BLOBS ────────────────────────────────────────────────────────
  {
    id: "blob-1",
    name: "Organic Blob 1",
    category: "blob",
    svgPath100:
      "M 50,5 C 75,2 98,22 96,48 C 94,76 74,96 48,97 C 20,98 2,78 3,50 C 4,22 24,8 50,5 Z",
    aspectRatio: 1,
  },
  {
    id: "blob-2",
    name: "Wavy Blob 2",
    category: "blob",
    svgPath100:
      "M 45,3 C 70,-4 92,10 97,35 C 102,62 85,92 60,98 C 32,104 5,88 1,60 C -3,32 18,10 45,3 Z",
    aspectRatio: 1,
  },
  {
    id: "blob-3",
    name: "Droplet Blob 3",
    category: "blob",
    svgPath100:
      "M 50,2 C 80,2 100,28 98,60 C 95,85 75,99 50,99 C 22,99 2,82 2,55 C 2,25 24,2 50,2 Z",
    aspectRatio: 1,
  },

  // ── GEOMETRIC ──────────────────────────────────────────────────────────────
  {
    id: "arch",
    name: "Arch / Portal",
    category: "geometric",
    svgPath100: "M 0,50 A 50,50 0 0 1 100,50 L 100,100 L 0,100 Z",
    aspectRatio: 0.75,
    defaultWidth: 200,
    defaultHeight: 260,
  },
  {
    id: "pill",
    name: "Pill Capsule",
    category: "geometric",
    svgPath100:
      "M 25,0 L 75,0 C 89,0 100,11 100,25 L 100,75 C 100,89 89,100 75,100 L 25,100 C 11,100 0,89 0,75 L 0,25 C 0,11 11,0 25,0 Z",
    aspectRatio: 1.6,
    defaultWidth: 260,
    defaultHeight: 160,
  },
  {
    id: "parallelogram",
    name: "Parallelogram",
    category: "geometric",
    svgPath100: "M 20,0 L 100,0 L 80,100 L 0,100 Z",
    aspectRatio: 1.3,
    defaultWidth: 240,
    defaultHeight: 180,
  },
  {
    id: "trapezoid",
    name: "Trapezoid",
    category: "geometric",
    svgPath100: "M 18,0 L 82,0 L 100,100 L 0,100 Z",
    aspectRatio: 1.2,
  },

  // ── DECORATIVE ─────────────────────────────────────────────────────────────
  {
    id: "flower",
    name: "Flower / Daisy",
    category: "decorative",
    svgPath100:
      "M 50,15 C 55,0 70,5 70,20 C 85,15 95,28 85,40 C 100,45 95,65 82,68 C 90,82 75,95 62,85 C 55,98 40,95 40,82 C 25,90 12,75 22,62 C 5,55 8,40 22,40 C 12,25 28,12 40,22 C 45,8 60,12 50,15 Z",
    aspectRatio: 1,
  },
  {
    id: "cloud",
    name: "Cloud",
    category: "decorative",
    svgPath100:
      "M 25,75 A 20,20 0 0 1 20,38 A 28,28 0 0 1 68,26 A 24,24 0 0 1 92,54 A 18,18 0 0 1 80,75 Z",
    aspectRatio: 1.3,
    defaultWidth: 260,
    defaultHeight: 200,
  },
  {
    id: "stamp",
    name: "Stamp / Scallop",
    category: "decorative",
    svgPath100:
      "M 8,4 A 6,6 0 0 1 20,4 A 6,6 0 0 1 32,4 A 6,6 0 0 1 44,4 A 6,6 0 0 1 56,4 A 6,6 0 0 1 68,4 A 6,6 0 0 1 80,4 A 6,6 0 0 1 92,4 L 96,8 A 6,6 0 0 1 96,20 A 6,6 0 0 1 96,32 A 6,6 0 0 1 96,44 A 6,6 0 0 1 96,56 A 6,6 0 0 1 96,68 A 6,6 0 0 1 96,80 A 6,6 0 0 1 96,92 L 92,96 A 6,6 0 0 1 80,96 A 6,6 0 0 1 68,96 A 6,6 0 0 1 56,96 A 6,6 0 0 1 44,96 A 6,6 0 0 1 32,96 A 6,6 0 0 1 20,96 A 6,6 0 0 1 8,96 L 4,92 A 6,6 0 0 1 4,80 A 6,6 0 0 1 4,68 A 6,6 0 0 1 4,56 A 6,6 0 0 1 4,44 A 6,6 0 0 1 4,32 A 6,6 0 0 1 4,20 A 6,6 0 0 1 4,8 Z",
    aspectRatio: 1,
  },
  {
    id: "shield",
    name: "Badge / Shield",
    category: "decorative",
    svgPath100: "M 50,0 L 95,15 L 95,55 C 95,78 72,95 50,100 C 28,95 5,78 5,55 L 5,15 Z",
    aspectRatio: 0.9,
    defaultWidth: 200,
    defaultHeight: 220,
  },

  // ── PHOTO FRAMES ───────────────────────────────────────────────────────────
  {
    id: "polaroid",
    name: "Polaroid Photo",
    category: "photo",
    svgPath100: "M 0,0 L 100,0 L 100,100 L 0,100 Z",
    aspectRatio: 0.82,
    defaultWidth: 220,
    defaultHeight: 270,
    isPolaroid: true,
  },
  {
    id: "filmstrip",
    name: "Filmstrip",
    category: "photo",
    svgPath100: "M 0,0 L 100,0 L 100,100 L 0,100 Z",
    aspectRatio: 1.4,
    defaultWidth: 280,
    defaultHeight: 200,
  },
];

export function getFrameById(id: string): FrameDefinition {
  return (
    FRAME_DEFINITIONS.find((f) => f.id === id) ||
    FRAME_DEFINITIONS[0] // fallback to circle
  );
}
