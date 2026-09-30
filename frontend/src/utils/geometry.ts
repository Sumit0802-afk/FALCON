import { CanvasElement } from "@/types";

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Axis-aligned bounding box that encloses a set of elements. */
export function getBoundingBox(elements: CanvasElement[]): Bounds {
  if (elements.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const el of elements) {
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + el.width);
    maxY = Math.max(maxY, el.y + el.height);
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** Snap a value to the nearest grid line if it's within `threshold` px. */
export function snapToGrid(value: number, gridSize = 8, threshold = 4): number {
  const nearest = Math.round(value / gridSize) * gridSize;
  return Math.abs(nearest - value) <= threshold ? nearest : value;
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Convert a pointer event's client coordinates into canvas-space coordinates,
 *  accounting for pan offset and zoom level. */
export function screenToCanvas(
  clientX: number,
  clientY: number,
  canvasRect: DOMRect,
  zoom: number,
  pan: { x: number; y: number }
): { x: number; y: number } {
  return {
    x: (clientX - canvasRect.left - pan.x) / zoom,
    y: (clientY - canvasRect.top - pan.y) / zoom,
  };
}

/** Rotate a point around a pivot by `degrees`. */
export function rotatePoint(
  point: { x: number; y: number },
  pivot: { x: number; y: number },
  degrees: number
): { x: number; y: number } {
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = point.x - pivot.x;
  const dy = point.y - pivot.y;
  return {
    x: pivot.x + dx * cos - dy * sin,
    y: pivot.y + dx * sin + dy * cos,
  };
}
