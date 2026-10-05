import {
  useRef,
  useState,
} from "react";

import {
  DesignPage,
  ToolId,
} from "@/types";

import CanvasElementView from "./CanvasElementView";

interface CanvasProps {
  page: DesignPage;

  zoom: number;

  pan: {
    x: number;
    y: number;
  };

  selectedIds: string[];

  activeTool: ToolId;

  onSelect: (
    id: string | null,
    additive?: boolean
  ) => void;

  onElementChange: (
    id: string,
    patch: Record<string, unknown>,
    opts?: {
      commit?: boolean;
    }
  ) => void;

  onCanvasClick: (
    x: number,
    y: number
  ) => void;

  onWheel: (
    e: React.WheelEvent
  ) => void;

  onToolChange?: (
    tool: ToolId
  ) => void;
}

interface SelectionBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function Canvas({
  page,
  zoom,
  pan,
  selectedIds,
  activeTool,
  onSelect,
  onElementChange,
  onCanvasClick,
  onWheel,
  onToolChange,
}: CanvasProps) {
  const surfaceRef =
    useRef<HTMLDivElement>(null);

  const [selectionBox, setSelectionBox] =
    useState<SelectionBox | null>(null);

  const isSelectingRef =
    useRef(false);

  const hasDraggedRef =
    useRef(false);

  const selectionStartRef =
    useRef({
      x: 0,
      y: 0,
    });

  /* =======================================================
     GET CANVAS COORDINATES
     ======================================================= */

  function getCanvasPoint(
    e: React.MouseEvent
  ) {
    const rect =
      surfaceRef.current?.getBoundingClientRect();

    if (!rect) {
      return null;
    }

    /*
     * The actual visible canvas is already
     * scaled by zoom.
     *
     * Convert mouse coordinates back into
     * design-space coordinates.
     */
    const x =
      (e.clientX - rect.left) /
      zoom;

    const y =
      (e.clientY - rect.top) /
      zoom;

    return {
      x,
      y,
    };
  }

  /* =======================================================
     ELEMENT RECTANGLE
     ======================================================= */

  function getElementRect(
    element: DesignPage["elements"][number]
  ) {
    return {
      left: element.x,
      top: element.y,
      right:
        element.x +
        element.width,
      bottom:
        element.y +
        element.height,
    };
  }

  /* =======================================================
     RECTANGLE INTERSECTION
     ======================================================= */

  function rectanglesIntersect(
    a: {
      left: number;
      top: number;
      right: number;
      bottom: number;
    },
    b: {
      left: number;
      top: number;
      right: number;
      bottom: number;
    }
  ) {
    return (
      a.left <= b.right &&
      a.right >= b.left &&
      a.top <= b.bottom &&
      a.bottom >= b.top
    );
  }

  /* =======================================================
     FINISH MARQUEE SELECTION
     ======================================================= */

  function finishSelection(
    e: React.MouseEvent<HTMLDivElement>
  ) {
    if (!isSelectingRef.current) {
      return;
    }

    isSelectingRef.current =
      false;

    const point =
      getCanvasPoint(e);

    if (!point) {
      setSelectionBox(null);
      return;
    }

    const start =
      selectionStartRef.current;

    const left = Math.min(
      start.x,
      point.x
    );

    const right = Math.max(
      start.x,
      point.x
    );

    const top = Math.min(
      start.y,
      point.y
    );

    const bottom = Math.max(
      start.y,
      point.y
    );

    const marqueeRect = {
      left,
      top,
      right,
      bottom,
    };

    /*
     * Very tiny drag is treated as a click.
     */
    const width =
      right - left;

    const height =
      bottom - top;

    const isTinySelection =
      width < 3 &&
      height < 3;

    if (isTinySelection) {
      setSelectionBox(null);
      return;
    }

    const matchingIds =
      page.elements
        .filter((element) => {
          if (
            element.hidden ||
            element.locked
          ) {
            return false;
          }

          const elementRect =
            getElementRect(
              element
            );

          return rectanglesIntersect(
            marqueeRect,
            elementRect
          );
        })
        .map(
          (element) =>
            element.id
        );

    /*
     * If Shift is pressed, preserve the
     * existing selection.
     */
    if (e.shiftKey) {
      const combinedIds =
        Array.from(
          new Set([
            ...selectedIds,
            ...matchingIds,
          ])
        );

      /*
       * The editor selection API accepts
       * one ID at a time, so first clear
       * the current selection and then
       * add each selected element.
       */
      onSelect(null);

      combinedIds.forEach(
        (id) => {
          onSelect(id, true);
        }
      );
    } else {
      /*
       * Replace current selection.
       */
      onSelect(null);

      matchingIds.forEach(
        (id) => {
          onSelect(id, true);
        }
      );
    }

    setSelectionBox(null);
  }

  /* =======================================================
     MOUSE DOWN
     ======================================================= */

  function handleCanvasMouseDown(
    e: React.MouseEvent<HTMLDivElement>
  ) {
    /*
     * Only start marquee selection with
     * the left mouse button.
     */
    if (e.button !== 0) {
      return;
    }

    /*
     * Only Select tool supports marquee
     * selection.
     */
    if (
      activeTool !== "select"
    ) {
      return;
    }

    const target =
      e.target as HTMLElement;

    /*
     * If the user started dragging on
     * an existing element, let the element
     * handle movement instead.
     */
    if (
      target.closest(
        "[data-canvas-element]"
      )
    ) {
      return;
    }

    const point =
      getCanvasPoint(e);

    if (!point) {
      return;
    }

    e.preventDefault();

    isSelectingRef.current =
      true;

    hasDraggedRef.current =
      false;

    selectionStartRef.current =
      {
        x: point.x,
        y: point.y,
      };

    setSelectionBox({
      startX: point.x,
      startY: point.y,
      currentX: point.x,
      currentY: point.y,
    });
  }

  /* =======================================================
     MOUSE MOVE
     ======================================================= */

  function handleCanvasMouseMove(
    e: React.MouseEvent<HTMLDivElement>
  ) {
    if (
      !isSelectingRef.current
    ) {
      return;
    }

    const point =
      getCanvasPoint(e);

    if (!point) {
      return;
    }

    const start =
      selectionStartRef.current;

    if (
      Math.abs(
        point.x - start.x
      ) > 3 ||
      Math.abs(
        point.y - start.y
      ) > 3
    ) {
      hasDraggedRef.current =
        true;
    }

    setSelectionBox({
      startX: start.x,
      startY: start.y,
      currentX: point.x,
      currentY: point.y,
    });
  }

  /* =======================================================
     MOUSE UP
     ======================================================= */

  function handleCanvasMouseUp(
    e: React.MouseEvent<HTMLDivElement>
  ) {
    if (
      !isSelectingRef.current
    ) {
      return;
    }

    finishSelection(e);
  }

  /* =======================================================
     MOUSE LEAVE
     ======================================================= */

  function handleCanvasMouseLeave() {
    /*
     * Don't immediately cancel selection.
     * The user may drag slightly outside
     * the canvas.
     */
  }

  /* =======================================================
     CANVAS CLICK
     ======================================================= */

  function handleCanvasClick(
    e: React.MouseEvent<HTMLDivElement>
  ) {
    /*
     * If a marquee drag just happened,
     * ignore the click generated after mouseup.
     */
    if (hasDraggedRef.current) {
      hasDraggedRef.current =
        false;

      return;
    }

    const target =
      e.target as HTMLElement;

    /*
     * Existing element was clicked.
     * CanvasElementView handles selection.
     */
    if (
      target.closest(
        "[data-canvas-element]"
      )
    ) {
      return;
    }

    /*
     * Select, hand and crop tools
     * don't create elements.
     */
    if (
      activeTool === "select" ||
      activeTool === "hand" ||
      activeTool === "crop"
    ) {
      if (activeTool === "crop") {
        onToolChange?.("select");
      }
      onSelect(null);
      return;
    }

    const rect =
      surfaceRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const x =
      (e.clientX - rect.left) /
      zoom;

    const y =
      (e.clientY - rect.top) /
      zoom;

    onCanvasClick(
      x,
      y
    );
  }

  /* =======================================================
     RENDER ELEMENTS BY Z-INDEX
     ======================================================= */

  const sortedElements =
    [...page.elements].sort(
      (a, b) =>
        a.zIndex - b.zIndex
    );

  /* =======================================================
     SELECTION BOX VALUES
     ======================================================= */

  const selectionLeft =
    selectionBox
      ? Math.min(
          selectionBox.startX,
          selectionBox.currentX
        )
      : 0;

  const selectionTop =
    selectionBox
      ? Math.min(
          selectionBox.startY,
          selectionBox.currentY
        )
      : 0;

  const selectionWidth =
    selectionBox
      ? Math.abs(
          selectionBox.currentX -
            selectionBox.startX
        )
      : 0;

  const selectionHeight =
    selectionBox
      ? Math.abs(
          selectionBox.currentY -
            selectionBox.startY
        )
      : 0;

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-auto bg-[#0a0a0a]"
      onWheel={onWheel}
    >


      {/* =================================================
          WORKSPACE GLOW
          ================================================= */}

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.015] blur-3xl" />

      {/* =================================================
          CANVAS LABEL
          ================================================= */}

      <div className="pointer-events-none absolute left-5 top-5 z-20 hidden items-center gap-2 font-mono text-[8px] tracking-[0.18em] text-zinc-600 md:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />

        FALCON / CANVAS
      </div>

      {/* =================================================
          ZOOM INDICATOR
          ================================================= */}

      <div className="pointer-events-none absolute bottom-5 right-5 z-20 hidden rounded-md border border-white/[0.08] bg-[#111]/80 px-3 py-2 font-mono text-[8px] tracking-widest text-zinc-600 backdrop-blur-md md:block">
        {Math.round(
          zoom * 100
        )}
        %
      </div>

      {/* =================================================
          CANVAS FRAME
          ================================================= */}

      <div
        className="relative"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
        }}
      >

        {/* Canvas glow */}

        <div
          className="pointer-events-none absolute rounded-sm bg-white/[0.03] blur-xl"
          style={{
            width:
              page.size.width *
                zoom +
              30,

            height:
              page.size.height *
                zoom +
              30,

            left: -15,
            top: -15,
          }}
        />

        {/* =================================================
            ACTUAL CANVAS
            ================================================= */}

        <div
          ref={surfaceRef}
          onClick={
            handleCanvasClick
          }
          onMouseDown={
            handleCanvasMouseDown
          }
          onMouseMove={
            handleCanvasMouseMove
          }
          onMouseUp={
            handleCanvasMouseUp
          }
          onMouseLeave={
            handleCanvasMouseLeave
          }
          className="relative overflow-hidden rounded-[2px] border border-black/30 shadow-[0_30px_80px_rgba(0,0,0,0.65)]"
          style={{
            width:
              page.size.width *
              zoom,

            height:
              page.size.height *
              zoom,

            background: page.background
              ? page.background.startsWith("http") || page.background.startsWith("data:")
                ? `url("${page.background}") center / cover no-repeat`
                : page.background
              : "#ffffff",

            cursor:
              activeTool ===
              "select"
                ? "default"
                : activeTool ===
                  "hand"
                ? "grab"
                : activeTool ===
                  "crop"
                ? "crosshair"
                : "crosshair",

            userSelect:
              isSelectingRef.current
                ? "none"
                : undefined,
          }}
        >

          {/* =================================================
              CANVAS EDGE
              ================================================= */}

          <div className="pointer-events-none absolute inset-0 z-40 border border-black/10" />

          {/* =================================================
              DESIGN CONTENT
              ================================================= */}

          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              width:
                page.size.width,

              height:
                page.size.height,

              transform: `scale(${zoom})`,
            }}
          >

            {sortedElements.map(
              (el) => (
                <div
                  key={el.id}
                  data-canvas-element
                  className="contents"
                >

                  <CanvasElementView
                    element={el}
                    zoom={zoom}
                    selected={selectedIds.includes(
                      el.id
                    )}
                    activeTool={
                      activeTool
                    }
                    onSelect={(
                      additive
                    ) =>
                      onSelect(
                        el.id,
                        additive
                      )
                    }
                    onChange={(
                      patch,
                      opts
                    ) =>
                      onElementChange(
                        el.id,
                        patch,
                        opts
                      )
                    }
                    onToolChange={
                      onToolChange
                    }
                  />

                </div>
              )
            )}

          </div>

          {/* =================================================
              MARQUEE SELECTION BOX
              ================================================= */}

          {selectionBox && (
            <div
              className="pointer-events-none absolute z-[60] border border-indigo-400 bg-indigo-500/10"
              style={{
                left:
                  selectionLeft *
                  zoom,

                top:
                  selectionTop *
                  zoom,

                width:
                  selectionWidth *
                  zoom,

                height:
                  selectionHeight *
                  zoom,

                boxShadow:
                  "0 0 0 1px rgba(99,102,241,0.12)",
              }}
            />
          )}

        </div>
      </div>

      {/* =================================================
          EMPTY STATE
          ================================================= */}

      {page.elements.length ===
        0 && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 text-center">

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#111] text-lg font-serif text-zinc-500">
            F
          </div>

          <p className="font-serif text-xl text-zinc-400">
            Start designing
          </p>

          <p className="mt-2 text-[10px] tracking-wide text-zinc-600">
            Choose a tool and click
            anywhere on the canvas
          </p>

        </div>
      )}

    </div>
  );
}

export default Canvas;