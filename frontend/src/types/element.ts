export type ElementType =
  | "rectangle"
  | "ellipse"
  | "text"
  | "image"
  | "line"
  | "group"
  | "frame";

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
  flipX?: boolean;
  flipY?: boolean;
  blendMode?: string;
  blendMask?: "none" | "circular" | "linear" | "linear-top" | "linear-bottom" | "linear-left" | "linear-right";
  /** How much of the element the fade covers, 5 to 100 */
  blendSoftness?: number;
  effect?: "none" | "shadow" | "glow" | "blur" | "duotone" | "outline";
}

export type ImageFilter =
  | "none"
  | "grayscale"
  | "sepia"
  | "blur"
  | "brightness"
  | "contrast"
  | "saturate"
  | "invert"
  | "warm"
  | "cool";

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
  italic?: boolean;

  /* Visual Text Design Preset Styles */
  textShadow?: string;
  stroke?: string;
  strokeWidth?: number;
  letterSpacing?: number | string;
  textTransform?: "uppercase" | "lowercase" | "capitalize" | "none";
  backgroundGradient?: string;
  badgeBg?: string;
  badgeBorder?: string;
  badgeRadius?: string | number;
  badgePadding?: string | number;
  textPresetId?: string;
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  naturalWidth: number;
  naturalHeight: number;

  /* Image filter */
  filter?: ImageFilter;

  /*
   * Filter intensity
   *
   * 0   = filter off
   * 100 = maximum filter strength
   */
  filterIntensity?: number;

  /* Fine-grained adjustment sliders */
  brightness?: number; // default 100
  contrast?: number;   // default 100
  saturate?: number;   // default 100
  blur?: number;       // default 0
  hueRotate?: number;  // default 0

  /* Non-destructive crop settings */
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;

  /* Original source before background removal */
  originalSrc?: string;
}

export interface FrameElement extends BaseElement {
  type: "frame";
  frameShape: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;

  /* Nested/clipped image */
  imageSrc?: string;
  imageNaturalWidth?: number;
  imageNaturalHeight?: number;
  imageOffsetX?: number; // pan offset X inside frame (pixels)
  imageOffsetY?: number; // pan offset Y inside frame (pixels)
  imageZoom?: number;    // zoom level >= 1

  /* Filter on image inside frame */
  filter?: ImageFilter;
  filterIntensity?: number;
}

export interface GroupElement extends BaseElement {
  type: "group";
  childIds: string[];
}

export type CanvasElement =
  | ShapeElement
  | TextElement
  | ImageElement
  | GroupElement
  | FrameElement;

export function isShape(
  el: CanvasElement
): el is ShapeElement {
  return (
    el.type === "rectangle" ||
    el.type === "ellipse" ||
    el.type === "line"
  );
}

export function isText(
  el: CanvasElement
): el is TextElement {
  return el.type === "text";
}

export function isImage(
  el: CanvasElement
): el is ImageElement {
  return el.type === "image";
}

export function isFrame(
  el: CanvasElement
): el is FrameElement {
  return el.type === "frame";
}

export function isGroup(
  el: CanvasElement
): el is GroupElement {
  return el.type === "group";
}