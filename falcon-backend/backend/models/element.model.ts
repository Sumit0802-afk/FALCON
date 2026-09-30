/**
 * Mirrors frontend/src/types/element.ts. The backend never inspects
 * individual element fields (elements are stored as an opaque Prisma
 * `Json` blob), but keeping the shape here gives controllers/services
 * type safety when they read or validate `Page.elements`.
 */

export type ElementType = "rectangle" | "ellipse" | "text" | "image" | "line" | "group";

export interface BaseElement {
  id: string;
  type: ElementType;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  hidden: boolean;
  groupId?: string;
}

export interface ShapeElement extends BaseElement {
  type: "rectangle" | "ellipse" | "line";
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: number;
}

export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: "left" | "center" | "right";
  lineHeight: number;
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  filter?: "none" | "grayscale" | "sepia" | "blur";
}

export interface GroupElement extends BaseElement {
  type: "group";
  childIds: string[];
}

export type CanvasElement = ShapeElement | TextElement | ImageElement | GroupElement;
