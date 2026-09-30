import { ToolDefinition } from "@/types";

export const ZOOM_MIN = 0.1;

export const ZOOM_MAX = 4;

export const ZOOM_STEP = 0.1;

export const DEFAULT_ZOOM = 1;

export const HISTORY_LIMIT = 100;

export const TOOLS: ToolDefinition[] = [
  { id: "select", label: "Select", shortcut: "V" },
  { id: "rectangle", label: "Rectangle", shortcut: "R" },
  { id: "ellipse", label: "Ellipse", shortcut: "O" },
  { id: "line", label: "Line", shortcut: "L" },
  { id: "text", label: "Text", shortcut: "T" },
  { id: "image", label: "Image", shortcut: "I" },
  { id: "crop", label: "Crop", shortcut: "C" },
  { id: "hand", label: "Pan", shortcut: "H" },
];

export const DEFAULT_SHAPE_FILL = "#6366F1";

export const DEFAULT_SHAPE_STROKE = "#312E81";

export const DEFAULT_TEXT_COLOR = "#1A1A1A";

export const DEFAULT_FONT_FAMILY = "Inter, sans-serif";