import { useCallback, useRef } from "react";
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

export function useDragResize({
  element,
  zoom,
  onChange,
  initialFontSize,
  onFontSizeChange,
}: UseDragResizeArgs) {
  const dragRef = useRef<DragState | null>(null);

  const resizeRef = useRef<
    ({ handle: ResizeHandle } & DragState) | null
  >(null);

  // Keep the latest position/size so pointerup
  // commits the actual final state instead of {}.
  const lastPatchRef = useRef<Partial<CanvasElement> | null>(null);

  const rafIdRef = useRef<number | null>(null);

  /* =======================================================
     DRAG (MOVE ELEMENT)
     ======================================================= */

  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();

      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origin: {
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
        },
      };

      lastPatchRef.current = {
        x: element.x,
        y: element.y,
      };

      function onMove(ev: PointerEvent) {
        if (!dragRef.current) return;

        const dx = (ev.clientX - dragRef.current.startX) / zoom;
        const dy = (ev.clientY - dragRef.current.startY) / zoom;

        const patch: Partial<CanvasElement> = {
          x: snapToGrid(dragRef.current.origin.x + dx),
          y: snapToGrid(dragRef.current.origin.y + dy),
        };

        lastPatchRef.current = patch;

        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
        }
        rafIdRef.current = requestAnimationFrame(() => {
          onChange(patch, { commit: false });
          rafIdRef.current = null;
        });
      }

      function onUp() {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }

        const finalPatch = lastPatchRef.current;
        dragRef.current = null;
        lastPatchRef.current = null;

        if (finalPatch) {
          onChange(finalPatch, { commit: true });
        }

        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      }

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [element, zoom, onChange]
  );

  /* =======================================================
     RESIZE (CORNER & EDGE / SPLITTER HANDLES)
     ======================================================= */

  const startResize = useCallback(
    (handle: ResizeHandle) =>
      (e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();

        // Lock pointer capture on the active handle element if available
        const target = e.currentTarget as HTMLElement | null;
        if (target && target.setPointerCapture) {
          try {
            target.setPointerCapture(e.pointerId);
          } catch {
            // Ignore in environments where pointer capture might fail
          }
        }

        // Snapshot font size at resize start so we can scale proportionally
        const fontSizeAtStart =
          initialFontSize ?? (element as any).fontSize ?? undefined;

        const startOrigin = {
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
        };

        const rotationDeg = element.rotation || 0;
        const rad = (rotationDeg * Math.PI) / 180;
        const cosTheta = Math.cos(rad);
        const sinTheta = Math.sin(rad);

        resizeRef.current = {
          handle,
          startX: e.clientX,
          startY: e.clientY,
          origin: startOrigin,
        };

        lastPatchRef.current = {
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
        };

        function onMove(ev: PointerEvent) {
          if (!resizeRef.current) return;

          const { origin, handle: activeHandle } = resizeRef.current;

          // 1. Unrotated delta in screen/canvas space
          const dxScreen = (ev.clientX - resizeRef.current.startX) / zoom;
          const dyScreen = (ev.clientY - resizeRef.current.startY) / zoom;

          // 2. Project delta into element's local coordinate space
          //    Local X axis is rotated by +rad, so inverse rotation is -rad
          const dxLocal = dxScreen * cosTheta + dyScreen * sinTheta;
          const dyLocal = -dxScreen * sinTheta + dyScreen * cosTheta;

          const MIN = 16;
          const isCorner =
            activeHandle === "nw" ||
            activeHandle === "ne" ||
            activeHandle === "sw" ||
            activeHandle === "se";
          const isTextElement = fontSizeAtStart !== undefined;

          let newWidth = origin.width;
          let newHeight = origin.height;

          if (isTextElement && isCorner) {
            // Proportional scaling for text when dragging corner handles
            let scale = 1;
            if (activeHandle === "se") {
              const scaleX = (origin.width + dxLocal) / origin.width;
              const scaleY = (origin.height + dyLocal) / origin.height;
              scale = Math.max(0.1, Math.abs(dxLocal) > Math.abs(dyLocal) ? scaleX : scaleY);
            } else if (activeHandle === "sw") {
              const scaleX = (origin.width - dxLocal) / origin.width;
              const scaleY = (origin.height + dyLocal) / origin.height;
              scale = Math.max(0.1, Math.abs(dxLocal) > Math.abs(dyLocal) ? scaleX : scaleY);
            } else if (activeHandle === "ne") {
              const scaleX = (origin.width + dxLocal) / origin.width;
              const scaleY = (origin.height - dyLocal) / origin.height;
              scale = Math.max(0.1, Math.abs(dxLocal) > Math.abs(dyLocal) ? scaleX : scaleY);
            } else if (activeHandle === "nw") {
              const scaleX = (origin.width - dxLocal) / origin.width;
              const scaleY = (origin.height - dyLocal) / origin.height;
              scale = Math.max(0.1, Math.abs(dxLocal) > Math.abs(dyLocal) ? scaleX : scaleY);
            }

            newWidth = Math.max(MIN, Math.round(origin.width * scale));
            newHeight = Math.max(MIN, Math.round(origin.height * scale));
          } else {
            // Regular element or text side-handle splitter resize
            if (activeHandle.includes("e")) {
              newWidth = clamp(origin.width + dxLocal, MIN, Infinity);
            } else if (activeHandle.includes("w")) {
              newWidth = clamp(origin.width - dxLocal, MIN, Infinity);
            }

            if (activeHandle.includes("s")) {
              newHeight = clamp(origin.height + dyLocal, MIN, Infinity);
            } else if (activeHandle.includes("n")) {
              newHeight = clamp(origin.height - dyLocal, MIN, Infinity);
            }
          }

          // 3. Anchor point pinning math:
          // Determine the local coordinates of the opposite (fixed) anchor before resize
          let fixedLocalX0 = 0;
          let fixedLocalY0 = 0;

          if (activeHandle === "se") {
            fixedLocalX0 = 0;
            fixedLocalY0 = 0;
          } else if (activeHandle === "sw") {
            fixedLocalX0 = origin.width;
            fixedLocalY0 = 0;
          } else if (activeHandle === "ne") {
            fixedLocalX0 = 0;
            fixedLocalY0 = origin.height;
          } else if (activeHandle === "nw") {
            fixedLocalX0 = origin.width;
            fixedLocalY0 = origin.height;
          } else if (activeHandle === "e") {
            fixedLocalX0 = 0;
            fixedLocalY0 = origin.height / 2;
          } else if (activeHandle === "w") {
            fixedLocalX0 = origin.width;
            fixedLocalY0 = origin.height / 2;
          } else if (activeHandle === "s") {
            fixedLocalX0 = origin.width / 2;
            fixedLocalY0 = 0;
          } else if (activeHandle === "n") {
            fixedLocalX0 = origin.width / 2;
            fixedLocalY0 = origin.height;
          }

          // Invariant world coordinate of the fixed anchor point before resize:
          // Center before resize:
          const cx0 = origin.x + origin.width / 2;
          const cy0 = origin.y + origin.height / 2;
          const du0 = fixedLocalX0 - origin.width / 2;
          const dv0 = fixedLocalY0 - origin.height / 2;

          const fixedWorldX = cx0 + (du0 * cosTheta - dv0 * sinTheta);
          const fixedWorldY = cy0 + (du0 * sinTheta + dv0 * cosTheta);

          // Now determine local coordinates of that same fixed feature in new dimensions:
          let fixedLocalX1 = 0;
          let fixedLocalY1 = 0;

          if (activeHandle === "se") {
            fixedLocalX1 = 0;
            fixedLocalY1 = 0;
          } else if (activeHandle === "sw") {
            fixedLocalX1 = newWidth;
            fixedLocalY1 = 0;
          } else if (activeHandle === "ne") {
            fixedLocalX1 = 0;
            fixedLocalY1 = newHeight;
          } else if (activeHandle === "nw") {
            fixedLocalX1 = newWidth;
            fixedLocalY1 = newHeight;
          } else if (activeHandle === "e") {
            fixedLocalX1 = 0;
            fixedLocalY1 = newHeight / 2;
          } else if (activeHandle === "w") {
            fixedLocalX1 = newWidth;
            fixedLocalY1 = newHeight / 2;
          } else if (activeHandle === "s") {
            fixedLocalX1 = newWidth / 2;
            fixedLocalY1 = 0;
          } else if (activeHandle === "n") {
            fixedLocalX1 = newWidth / 2;
            fixedLocalY1 = newHeight;
          }

          const du1 = fixedLocalX1 - newWidth / 2;
          const dv1 = fixedLocalY1 - newHeight / 2;

          // New center is calculated so fixedWorld remains exactly at fixedWorld:
          const cx1 = fixedWorldX - (du1 * cosTheta - dv1 * sinTheta);
          const cy1 = fixedWorldY - (du1 * sinTheta + dv1 * cosTheta);

          const newX = Math.round(cx1 - newWidth / 2);
          const newY = Math.round(cy1 - newHeight / 2);

          let newFontSize: number | undefined;
          if (isCorner && fontSizeAtStart !== undefined) {
            const scale = newWidth / (origin.width || 1);
            newFontSize = Math.round(
              Math.max(8, Math.min(300, fontSizeAtStart * scale))
            );
          }

          const patch: Partial<CanvasElement> = {
            x: newX,
            y: newY,
            width: Math.round(newWidth),
            height: Math.round(newHeight),
            ...(newFontSize !== undefined ? { fontSize: newFontSize } : {}),
          };

          lastPatchRef.current = patch;

          if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
          }
          rafIdRef.current = requestAnimationFrame(() => {
            onChange(patch, { commit: false });
            if (newFontSize !== undefined && onFontSizeChange) {
              onFontSizeChange(newFontSize);
            }
            rafIdRef.current = null;
          });
        }

        function onUp(ev: PointerEvent) {
          if (target && target.releasePointerCapture) {
            try {
              target.releasePointerCapture(ev.pointerId);
            } catch {
              // Ignore release errors
            }
          }

          if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
          }

          const finalPatch = lastPatchRef.current;
          resizeRef.current = null;
          lastPatchRef.current = null;

          if (finalPatch) {
            onChange(finalPatch, { commit: true });
          }

          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
          window.removeEventListener("pointercancel", onUp);
        }

        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
      },
    [element, zoom, onChange, initialFontSize, onFontSizeChange]
  );

  return {
    startDrag,
    startResize,
  };
}