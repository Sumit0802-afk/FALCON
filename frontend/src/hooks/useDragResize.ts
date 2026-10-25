import { useCallback, useEffect, useRef } from "react";
import { CanvasElement } from "@/types";
import { clamp, snapToGrid } from "@/utils/geometry";

export type ResizeHandle =
  | "nw"
  | "ne"
  | "sw"
  | "se"
  | "n"
  | "s"
  | "e"
  | "w";

interface DragState {
  startX: number;
  startY: number;
  origin: Pick<
    CanvasElement,
    "x" | "y" | "width" | "height"
  >;
}

interface UseDragResizeArgs {
  element: CanvasElement;
  zoom: number;
  onChange: (
    patch: Partial<CanvasElement>,
    opts?: { commit?: boolean }
  ) => void;
  /** If provided, font size will be scaled proportionally when using corner handles */
  initialFontSize?: number;
  onFontSizeChange?: (size: number) => void;
}

/** Smallest an element can be made, in design pixels */
const MIN_SIZE = 16;

/** Position and size are kept to a hundredth of a pixel: smooth, and the opposite edge never creeps */
const precise = (value: number) => Math.round(value * 100) / 100;

// Elements that keep their proportions when pulled by a corner
const KEEPS_PROPORTIONS = new Set(["text", "image", "frame"]);

export function useDragResize({
  element,
  zoom,
  onChange,
  initialFontSize,
}: UseDragResizeArgs) {
  const rafIdRef = useRef<number | null>(null);

  // The latest values, read while a gesture is under way. A gesture outlives the render it
  // started in, so reading the values captured at its start would apply every step to a
  // page that has since changed.
  const onChangeRef = useRef(onChange);
  const zoomRef = useRef(zoom);
  useEffect(() => {
    onChangeRef.current = onChange;
    zoomRef.current = zoom;
  });

  // Stops a gesture still listening if the element goes away mid-drag
  const cleanupRef = useRef<(() => void) | null>(null);
  useEffect(() => () => cleanupRef.current?.(), []);

  /** Sends a step of the gesture, at most once per frame */
  const queue = useCallback((patch: Partial<CanvasElement>) => {
    if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      onChangeRef.current(patch, { commit: false });
    });
  }, []);

  /** Ends a gesture: drops the pending frame and records the final state as one undo step */
  const finish = useCallback((finalPatch: Partial<CanvasElement> | null) => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (finalPatch) onChangeRef.current(finalPatch, { commit: true });
  }, []);

  /* =======================================================
     DRAG (MOVE ELEMENT)
     ======================================================= */

  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      cleanupRef.current?.();

      const startX = e.clientX;
      const startY = e.clientY;
      const origin = { x: element.x, y: element.y };
      let lastPatch: Partial<CanvasElement> | null = null;

      function onMove(ev: PointerEvent) {
        const dx = (ev.clientX - startX) / zoomRef.current;
        const dy = (ev.clientY - startY) / zoomRef.current;

        lastPatch = {
          x: snapToGrid(origin.x + dx),
          y: snapToGrid(origin.y + dy),
        };
        queue(lastPatch);
      }

      function stop() {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        cleanupRef.current = null;
      }

      function onUp() {
        stop();
        // A plain click only selects; it is not a change to undo
        finish(lastPatch);
      }

      cleanupRef.current = stop;
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [element, queue, finish]
  );

  /* =======================================================
     RESIZE (CORNER & EDGE HANDLES)
     ======================================================= */

  const startResize = useCallback(
    (handle: ResizeHandle) =>
      (e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
        cleanupRef.current?.();

        // Keeps the pointer on the handle even when it runs ahead of the element
        const target = e.currentTarget as HTMLElement | null;
        try {
          target?.setPointerCapture?.(e.pointerId);
        } catch {
          // Pointer capture is not available everywhere
        }

        const startX = e.clientX;
        const startY = e.clientY;
        const origin = {
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
        };
        const fontSizeAtStart =
          initialFontSize ?? (element as { fontSize?: number }).fontSize;
        const keepsProportions = KEEPS_PROPORTIONS.has(element.type);

        const rad = ((element.rotation || 0) * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        // Which sides the handle moves: -1 left/top, +1 right/bottom, 0 not at all
        const sideX = handle.includes("e") ? 1 : handle.includes("w") ? -1 : 0;
        const sideY = handle.includes("s") ? 1 : handle.includes("n") ? -1 : 0;
        const isCorner = sideX !== 0 && sideY !== 0;

        // The point opposite the handle stays where it is on the page. In the element's own
        // (unrotated) frame, measured from its centre, it sits at the mirror of the handle.
        const centreX = origin.x + origin.width / 2;
        const centreY = origin.y + origin.height / 2;
        const anchorU = (-sideX * origin.width) / 2;
        const anchorV = (-sideY * origin.height) / 2;
        const anchorX = centreX + anchorU * cos - anchorV * sin;
        const anchorY = centreY + anchorU * sin + anchorV * cos;

        let lastPatch: Partial<CanvasElement> | null = null;

        function onMove(ev: PointerEvent) {
          // The pointer's travel in design pixels, turned into the element's own axes
          const dxPage = (ev.clientX - startX) / zoomRef.current;
          const dyPage = (ev.clientY - startY) / zoomRef.current;
          const dx = dxPage * cos + dyPage * sin;
          const dy = -dxPage * sin + dyPage * cos;

          let width = origin.width;
          let height = origin.height;

          if (isCorner && (keepsProportions || ev.shiftKey)) {
            // One scale for both sides, taken from whichever the pointer has pulled further, so
            // the corner follows the pointer smoothly instead of switching between the two
            const scaleX = (origin.width + sideX * dx) / origin.width;
            const scaleY = (origin.height + sideY * dy) / origin.height;
            const floor = Math.max(MIN_SIZE / origin.width, MIN_SIZE / origin.height);
            const scale = Math.max(floor, scaleX, scaleY);
            width = origin.width * scale;
            height = origin.height * scale;
          } else {
            if (sideX !== 0) width = clamp(origin.width + sideX * dx, MIN_SIZE, Infinity);
            if (sideY !== 0) height = clamp(origin.height + sideY * dy, MIN_SIZE, Infinity);
          }

          // The new centre that leaves the opposite point exactly where it was
          const u = (-sideX * width) / 2;
          const v = (-sideY * height) / 2;
          const newCentreX = anchorX - (u * cos - v * sin);
          const newCentreY = anchorY - (u * sin + v * cos);

          const patch: Partial<CanvasElement> = {
            x: precise(newCentreX - width / 2),
            y: precise(newCentreY - height / 2),
            width: precise(width),
            height: precise(height),
          };

          // Text grows with its box when pulled by a corner. It goes in the same step as the
          // size, as a separate step would be applied on top of a page without the new size
          if (isCorner && fontSizeAtStart !== undefined) {
            (patch as { fontSize?: number }).fontSize = Math.round(
              clamp(fontSizeAtStart * (width / origin.width), 8, 300)
            );
          }

          lastPatch = patch;
          queue(patch);
        }

        function stop() {
          try {
            target?.releasePointerCapture?.(e.pointerId);
          } catch {
            // Already released
          }
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
          window.removeEventListener("pointercancel", onUp);
          cleanupRef.current = null;
        }

        function onUp() {
          stop();
          finish(lastPatch);
        }

        cleanupRef.current = stop;
        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
      },
    [element, initialFontSize, queue, finish]
  );

  return {
    startDrag,
    startResize,
  };
}
