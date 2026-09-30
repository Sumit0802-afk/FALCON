import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  CanvasElement,
  isImage,
  isShape,
  isText,
  isFrame,
  ImageElement,
  FrameElement,
  ToolId,
} from "@/types";

import {
  useDragResize,
  ResizeHandle,
} from "@/hooks/useDragResize";

import { SelectionBox } from "./SelectionBox";
import { FrameElementView } from "./FrameElementView";
import { loadGoogleFont } from "@/services/fontService";

interface CanvasElementViewProps {
  element: CanvasElement;
  zoom: number;
  selected: boolean;
  activeTool: string;

  onSelect: (
    additive: boolean
  ) => void;

  onChange: (
    patch: Partial<CanvasElement>,
    opts?: {
      commit?: boolean;
    }
  ) => void;

  onToolChange?: (tool: ToolId) => void;
}

type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CropHandle =
  | "nw"
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w";

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function CanvasElementView({
  element,
  zoom,
  selected,
  activeTool,
  onSelect,
  onChange,
  onToolChange,
}: CanvasElementViewProps) {
  const {
    startDrag,
    startResize,
  } = useDragResize({
    element,
    zoom,
    onChange,
    // For text elements, pass the current font size so corner-handle resizes
    // scale the font proportionally (same behaviour as Canva).
    initialFontSize: isText(element) ? (element as any).fontSize : undefined,
    onFontSizeChange: isText(element)
      ? (newSize: number) => {
          onChange({ fontSize: newSize } as any, { commit: false });
        }
      : undefined,
  });

  const [editing, setEditing] =
    useState(false);

  const [cropRect, setCropRect] =
    useState<CropRect | null>(null);

  const [frameCropMode, setFrameCropMode] =
    useState(false);

  // Automatically load Google Font for text elements
  useEffect(() => {
    if (isText(element) && element.fontFamily) {
      loadGoogleFont(
        element.fontFamily,
        [element.fontWeight || 400],
        element.italic ?? false
      );
    }
  }, [
    isText(element) ? element.fontFamily : "",
    isText(element) ? element.fontWeight : 400,
    isText(element) ? element.italic : false,
  ]);

  // Reset frame crop mode on deselect
  useEffect(() => {
    if (!selected) {
      setFrameCropMode(false);
    }
  }, [selected]);

  /*
   * Textarea reference.
   * Used to focus the text editor without
   * destroying the user's mouse selection.
   */
  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );

  /*
   * Prevent crop rectangle from being
   * recreated on every element update.
   */
  const cropInitializedRef =
    useRef(false);

  const cropStartRef =
    useRef<{
      x: number;
      y: number;
      rect: CropRect;
    } | null>(null);

  /*
   * Rotation state
   */
  const rotateStartRef =
    useRef<{
      startAngle: number;
      originalRotation: number;
    } | null>(null);

  /*
   * Used to prevent finishEditing from
   * being committed multiple times.
   */
  const editingRef =
    useRef(false);

  /* =======================================================
     CROP INITIALIZATION
     ======================================================= */

  useEffect(() => {
    if (
      activeTool === "crop" &&
      selected &&
      isImage(element)
    ) {
      if (cropInitializedRef.current) {
        return;
      }

      setCropRect({
        x: 0,
        y: 0,
        width: element.width,
        height: element.height,
      });

      cropInitializedRef.current = true;
    } else {
      setCropRect(null);
      cropInitializedRef.current = false;
    }
  }, [
    activeTool,
    selected,
    element.id,
    element.width,
    element.height,
  ]);

  /*
   * If the element becomes unselected,
   * stop editing and reset crop tool.
   */
  useEffect(() => {
    if (!selected) {
      setEditing(false);
      editingRef.current = false;
      if (activeTool === "crop") {
        setCropRect(null);
        cropInitializedRef.current = false;
        onToolChange?.("select");
      }
    }
  }, [selected, activeTool, onToolChange]);

  /*
   * Focus textarea when editing starts.
   *
   * We DO NOT call select() or setSelectionRange()
   * here because that would automatically select
   * the entire text.
   */
  useEffect(() => {
    if (
      editing &&
      isText(element)
    ) {
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  }, [editing]);

  if (element.hidden) {
    return null;
  }

  /* =======================================================
     POINTER DOWN
     ======================================================= */

  function handlePointerDown(
    e: React.PointerEvent<HTMLDivElement>
  ) {
    /*
     * Crop mode is handled by CropOverlay.
     */
    if (
      activeTool === "crop" &&
      isImage(element) &&
      selected
    ) {
      return;
    }

    /*
     * VERY IMPORTANT:
     *
     * When editing text, the textarea must
     * receive all pointer events itself.
     *
     * Otherwise the parent canvas will start
     * dragging the element when we try to
     * select text with the mouse.
     */
    if (
      editing &&
      isText(element)
    ) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    onSelect(e.shiftKey);

    if (!element.locked) {
      startDrag(e);
    }
  }

  /* =======================================================
     ROTATE
     ======================================================= */

  function handleRotateStart(
    e: React.PointerEvent
  ) {
    e.preventDefault();
    e.stopPropagation();

    if (element.locked) {
      return;
    }

    const elementNode =
      e.currentTarget.closest(
        "[data-canvas-element]"
      ) as HTMLElement | null;

    if (!elementNode) {
      return;
    }

    const rect =
      elementNode.getBoundingClientRect();

    /*
     * Center of the element in screen coordinates.
     */
    const centerX =
      rect.left +
      rect.width / 2;

    const centerY =
      rect.top +
      rect.height / 2;

    /*
     * Angle from element center to
     * initial pointer position.
     */
    const startAngle =
      Math.atan2(
        e.clientY - centerY,
        e.clientX - centerX
      ) *
      (180 / Math.PI);

    rotateStartRef.current = {
      startAngle,
      originalRotation:
        element.rotation,
    };

    let lastRotation =
      element.rotation;

    function handlePointerMove(
      event: PointerEvent
    ) {
      if (
        !rotateStartRef.current
      ) {
        return;
      }

      const currentAngle =
        Math.atan2(
          event.clientY - centerY,
          event.clientX - centerX
        ) *
        (180 / Math.PI);

      let rotation =
        rotateStartRef.current
          .originalRotation +
        (currentAngle -
          rotateStartRef.current
            .startAngle);

      /*
       * Shift = snap to 15 degree increments.
       */
      if (event.shiftKey) {
        rotation =
          Math.round(
            rotation / 15
          ) * 15;
      }

      lastRotation = rotation;

      onChange(
        {
          rotation,
        },
        {
          commit: false,
        }
      );
    }

    function handlePointerUp() {
      rotateStartRef.current =
        null;

      /*
       * Commit the final rotation
       * so undo/redo works correctly.
       */
      onChange(
        {
          rotation: lastRotation,
        },
        {
          commit: true,
        }
      );

      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      window.removeEventListener(
        "pointerup",
        handlePointerUp
      );
    }

    window.addEventListener(
      "pointermove",
      handlePointerMove
    );

    window.addEventListener(
      "pointerup",
      handlePointerUp
    );
  }

  /* =======================================================
     TEXT DOUBLE CLICK — start inline editing
     ======================================================= */

  function handleTextDoubleClick(
    _e: React.MouseEvent
  ) {
    editingRef.current = true;
    setEditing(true);
  }

  /* =======================================================
     ELEMENT DOUBLE CLICK
     ======================================================= */

  function handleDoubleClick(
    e: React.MouseEvent
  ) {
    if (element.locked) return;

    if (isText(element)) {
      handleTextDoubleClick(e);
      return;
    }

    if (isFrame(element)) {
      e.preventDefault();
      e.stopPropagation();
      onSelect(false);
      setFrameCropMode(true);
      return;
    }

    if (isImage(element)) {
      e.preventDefault();
      e.stopPropagation();
      onToolChange?.("crop");
      return;
    }
  }

  /* =======================================================
     FINISH TEXT EDITING
     ======================================================= */

  function finishEditing() {
    /*
     * Prevent duplicate commits.
     */
    if (!editingRef.current) {
      return;
    }

    editingRef.current = false;

    /*
     * TypeScript needs to know this is a
     * TextElement before accessing .text.
     */
    if (!isText(element)) {
      setEditing(false);
      return;
    }

    setEditing(false);

    /*
     * Commit final text value so undo/redo
     * treats the edit as one action.
     */
    onChange(
      {
        text: element.text,
      },
      {
        commit: true,
      }
    );
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div
      data-canvas-element
      onPointerDown={
        handlePointerDown
      }
      onDoubleClick={
        handleDoubleClick
      }
      className="absolute select-none"
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,

        transform: `rotate(${element.rotation}deg)`,

        opacity: element.opacity,

        cursor:
          editing && isText(element)
            ? "text"
            : activeTool === "crop" &&
              isImage(element) &&
              selected
            ? "default"
            : element.locked
            ? "not-allowed"
            : "move",

        touchAction: "none",
      }}
    >
      {/* ===================================================
          TEXT EDITING
          =================================================== */}

      {editing && isText(element) ? (
        <textarea
          ref={textareaRef}
          autoFocus
          value={element.text}

          onChange={(e) => {
            onChange(
              {
                text: e.target.value,
              },
              {
                commit: false,
              }
            );
          }}

          /*
           * IMPORTANT:
           * Stop pointer events from reaching
           * the canvas.
           *
           * This allows normal browser text
           * selection with the mouse.
           */
          onPointerDown={(e) => {
            e.stopPropagation();
          }}

          onPointerMove={(e) => {
            e.stopPropagation();
          }}

          onPointerUp={(e) => {
            e.stopPropagation();
          }}

          onMouseDown={(e) => {
            e.stopPropagation();
          }}

          onMouseMove={(e) => {
            e.stopPropagation();
          }}

          onMouseUp={(e) => {
            e.stopPropagation();
          }}

          onClick={(e) => {
            e.stopPropagation();
          }}

          onDoubleClick={(e) => {
            e.stopPropagation();
          }}

          onKeyDown={(e) => {
            /*
             * Prevent editor/canvas shortcuts
             * from interfering with text editing.
             */
            e.stopPropagation();

            /*
             * Escape = finish editing.
             */
            if (e.key === "Escape") {
              e.preventDefault();
              finishEditing();
              return;
            }

            /*
             * Enter = finish editing.
             *
             * Shift + Enter = new line.
             */
            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {
              e.preventDefault();
              finishEditing();
              return;
            }

            /*
             * Ctrl + A / Cmd + A
             *
             * Let the browser textarea perform
             * the normal select-all operation.
             */
            if (
              (e.ctrlKey || e.metaKey) &&
              e.key.toLowerCase() === "a"
            ) {
              e.stopPropagation();
            }
          }}

          onBlur={() => {
            finishEditing();
          }}

          className="
            h-full
            w-full
            resize-none
            overflow-hidden
            border
            border-indigo-500
            bg-transparent
            outline-none
            select-text
          "

          style={{
            fontFamily:
              element.fontFamily,

            fontSize:
              element.fontSize,

            fontWeight:
              element.fontWeight,

            color:
              element.backgroundGradient ? "#ffffff" : element.color,

            textAlign:
              element.align,

            lineHeight:
              element.lineHeight,

            fontStyle:
              element.italic ? "italic" : undefined,

            letterSpacing:
              element.letterSpacing,

            textTransform:
              element.textTransform,

            textShadow:
              element.textShadow,

            whiteSpace:
              "pre-wrap",

            /*
             * Override parent's select-none.
             */
            userSelect: "text",

            WebkitUserSelect:
              "text",

            cursor: "text",

            pointerEvents: "auto",

            touchAction: "auto",

            padding: 0,
            margin: 0,

            /*
             * Remove browser textarea
             * appearance differences.
             */
            borderRadius: 0,

            boxSizing: "border-box",
          }}
        />
      ) : (
        <ElementBody
          element={element}
          selected={selected}
          cropMode={
            activeTool === "crop" &&
            selected &&
            cropRect !== null
          }
          frameCropMode={frameCropMode}
          setFrameCropMode={setFrameCropMode}
          onChange={onChange}
        />
      )}

      {/* ===================================================
          CROP UI
          =================================================== */}

      {activeTool === "crop" &&
        selected &&
        isImage(element) &&
        cropRect && (
          <CropOverlay
            element={element}
            cropRect={cropRect}
            setCropRect={setCropRect}
            cropStartRef={cropStartRef}
            zoom={zoom}
            hasCrop={Boolean(
              element.cropX ||
              element.cropY ||
              (element.cropWidth && element.cropWidth !== element.naturalWidth) ||
              (element.cropHeight && element.cropHeight !== element.naturalHeight)
            )}
            onApply={() => {
              applyCrop(
                element,
                cropRect,
                onChange,
                onToolChange
              );
              setCropRect(null);
              cropInitializedRef.current = false;
            }}
            onCancel={() => {
              setCropRect(null);
              cropInitializedRef.current = false;
              onToolChange?.("select");
            }}
            onReset={() => {
              resetCrop(
                element,
                onChange,
                onToolChange
              );
              setCropRect(null);
              cropInitializedRef.current = false;
            }}
          />
        )}

      {/* ===================================================
          NORMAL SELECTION
          =================================================== */}

      {selected &&
        !element.locked &&
        !editing &&
        !frameCropMode &&
        activeTool !== "crop" && (
          <SelectionBox
            onResizeStart={(
              handle: ResizeHandle
            ) =>
              startResize(handle)
            }
            onRotateStart={
              handleRotateStart
            }
          />
        )}
    </div>
  );
}

/* =========================================================
   ELEMENT BODY
   ========================================================= */

function ElementBody({
  element,
  selected,
  cropMode,
  frameCropMode,
  setFrameCropMode,
  onChange,
}: {
  element: CanvasElement;
  selected: boolean;
  cropMode: boolean;
  frameCropMode: boolean;
  setFrameCropMode: (v: boolean) => void;
  onChange: (patch: Partial<CanvasElement>, opts?: { commit?: boolean }) => void;
}) {
  /* =======================================================
     FRAMES
     ======================================================= */

  if (isFrame(element)) {
    return (
      <FrameElementView
        element={element}
        selected={selected}
        isRepositioning={frameCropMode}
        onExitRepositioning={() => setFrameCropMode(false)}
        onChange={onChange as any}
      />
    );
  }

  /* =======================================================
     SHAPES
     ======================================================= */

  if (isShape(element)) {
    const commonStyle: React.CSSProperties =
      {
        width: "100%",
        height: "100%",

        backgroundColor:
          element.fill,

        border:
          element.strokeWidth > 0
            ? `${element.strokeWidth}px solid ${element.stroke}`
            : undefined,

        pointerEvents: "none",
      };

    if (
      element.type ===
      "rectangle"
    ) {
      return (
        <div
          style={{
            ...commonStyle,

            borderRadius:
              element.cornerRadius,
          }}
        />
      );
    }

    if (
      element.type ===
      "ellipse"
    ) {
      return (
        <div
          style={{
            ...commonStyle,

            borderRadius:
              "9999px",
          }}
        />
      );
    }

    return (
      <div className="flex h-full w-full items-center">
        <div
          style={{
            width: "100%",

            height:
              element.strokeWidth ||
              2,

            backgroundColor:
              element.stroke,
          }}
        />
      </div>
    );
  }

  /* =======================================================
     TEXT
     ======================================================= */

  if (isText(element)) {
    const hasGradient = Boolean(element.backgroundGradient);
    const hasBadge = Boolean(element.badgeBg || element.badgeBorder);

    const textStyles: React.CSSProperties = {
      width: "100%",
      height: "100%",
      fontFamily: element.fontFamily,
      fontSize: element.fontSize,
      fontWeight: element.fontWeight,
      color: hasGradient ? "transparent" : element.color,
      textAlign: element.align,
      lineHeight: element.lineHeight,
      fontStyle: element.italic ? "italic" : undefined,
      letterSpacing: element.letterSpacing,
      textTransform: element.textTransform,
      textShadow: element.textShadow,
      WebkitTextStroke:
        element.stroke && element.strokeWidth
          ? `${element.strokeWidth}px ${element.stroke}`
          : undefined,
      backgroundImage: element.backgroundGradient,
      WebkitBackgroundClip: hasGradient ? "text" : undefined,
      backgroundClip: hasGradient ? "text" : undefined,
      WebkitTextFillColor: hasGradient ? "transparent" : undefined,
      whiteSpace: "pre-wrap",
      pointerEvents: "none",
      userSelect: "none",
      display: "flex",
      alignItems: "center",
      justifyContent:
        element.align === "center"
          ? "center"
          : element.align === "right"
          ? "flex-end"
          : "flex-start",
    };

    if (hasBadge) {
      return (
        <div style={textStyles}>
          <span
            style={{
              backgroundColor: element.badgeBg,
              border: element.badgeBorder,
              borderRadius: element.badgeRadius ?? 6,
              padding: element.badgePadding ?? "4px 12px",
              display: "inline-block",
            }}
          >
            {element.text}
          </span>
        </div>
      );
    }

    return (
      <div style={textStyles}>
        {element.text}
      </div>
    );
  }

  /* =======================================================
     IMAGE
     ======================================================= */

  if (isImage(element)) {
    if (!element.src) {
      return (
        <div className="flex h-full w-full items-center justify-center border border-dashed border-zinc-400 bg-zinc-100 text-xs text-zinc-400">
          No image
        </div>
      );
    }

    const cropX =
      element.cropX ?? 0;

    const cropY =
      element.cropY ?? 0;

    const cropWidth =
      element.cropWidth ??
      element.naturalWidth;

    const cropHeight =
      element.cropHeight ??
      element.naturalHeight;

    const scaleX =
      element.width /
      (cropWidth || 1);

    const scaleY =
      element.height /
      (cropHeight || 1);

    let maskStyle: React.CSSProperties = {};
    if (element.blendMask === "circular") {
      maskStyle = {
        WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 95%)",
        maskImage: "radial-gradient(circle at center, black 40%, transparent 95%)",
      };
    } else if (element.blendMask === "linear" || element.blendMask === "linear-bottom") {
      maskStyle = {
        WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
        maskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
      };
    } else if (element.blendMask === "linear-top") {
      maskStyle = {
        WebkitMaskImage: "linear-gradient(to top, black 30%, transparent 100%)",
        maskImage: "linear-gradient(to top, black 30%, transparent 100%)",
      };
    }

    let effectFilter = "";
    if (element.effect === "glow") {
      effectFilter = " drop-shadow(0 0 18px rgba(6, 182, 212, 0.85))";
    } else if (element.effect === "shadow") {
      effectFilter = " drop-shadow(0 16px 24px rgba(0, 0, 0, 0.65))";
    } else if (element.effect === "blur") {
      effectFilter = " blur(6px)";
    } else if (element.effect === "duotone") {
      effectFilter = " sepia(1) saturate(5) hue-rotate(150deg)";
    } else if (element.effect === "outline") {
      effectFilter = " drop-shadow(2px 0 0 #06b6d4) drop-shadow(-2px 0 0 #06b6d4) drop-shadow(0 2px 0 #06b6d4) drop-shadow(0 -2px 0 #06b6d4)";
    }

    const baseFilter = getImageFilter(
      element.filter,
      element.filterIntensity ?? 100,
      {
        brightness: element.brightness,
        contrast: element.contrast,
        saturate: element.saturate,
        blur: element.blur,
        hueRotate: element.hueRotate,
      }
    );

    const isVideoSrc =
      typeof element.src === "string" &&
      (element.src.endsWith(".mp4") ||
        element.src.endsWith(".webm") ||
        element.src.endsWith(".mov") ||
        element.src.includes(".mp4?") ||
        element.src.includes("gtv-videos-bucket") ||
        (element.src.includes("/uploads/") &&
          (element.src.includes(".mp4") || element.src.includes(".mov"))));

    return (
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          pointerEvents: "none",
          mixBlendMode: (element.blendMode as any) || undefined,
          transform: `scale(${element.flipX ? -1 : 1}, ${element.flipY ? -1 : 1})`,
          ...maskStyle,
        }}
      >
        {isVideoSrc ? (
          <video
            src={element.src}
            autoPlay
            loop
            muted
            playsInline
            className="absolute h-full w-full object-cover"
            style={{
              filter: (baseFilter || "") + effectFilter,
            }}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={element.src}
            alt=""
            draggable={false}
            className="absolute max-w-none"
            style={{
              width:
                element.naturalWidth *
                scaleX,

              height:
                element.naturalHeight *
                scaleY,

              left:
                -cropX * scaleX,

              top:
                -cropY * scaleY,

              filter: (baseFilter || "") + effectFilter,
            }}
          />
        )}
      </div>
    );
  }

  return null;
}

/* =========================================================
   CROP OVERLAY
   ========================================================= */

function CropOverlay({
  element,
  cropRect,
  setCropRect,
  cropStartRef,
  zoom,
  hasCrop,
  onApply,
  onCancel,
  onReset,
}: {
  element: ImageElement;
  cropRect: CropRect;
  setCropRect: React.Dispatch<
    React.SetStateAction<
      CropRect | null
    >
  >;
  cropStartRef: React.MutableRefObject<{
    x: number;
    y: number;
    rect: CropRect;
  } | null>;
  zoom: number;
  hasCrop: boolean;
  onApply: () => void;
  onCancel: () => void;
  onReset: () => void;
}) {
  // Keyboard navigation for crop (Enter to apply, Escape to cancel)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      } else if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        onApply();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, onApply]);

  /* =======================================================
     MOVE CROP AREA
     ======================================================= */

  function startCropMove(
    e: React.PointerEvent
  ) {
    e.preventDefault();
    e.stopPropagation();

    cropStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rect: {
        ...cropRect,
      },
    };

    const move = (
      event: PointerEvent
    ) => {
      if (!cropStartRef.current) {
        return;
      }

      const start = cropStartRef.current;
      const dx = (event.clientX - start.x) / zoom;
      const dy = (event.clientY - start.y) / zoom;

      const maxX = element.width - start.rect.width;
      const maxY = element.height - start.rect.height;

      setCropRect({
        ...start.rect,
        x: clamp(
          start.rect.x + dx,
          0,
          Math.max(0, maxX)
        ),
        y: clamp(
          start.rect.y + dy,
          0,
          Math.max(0, maxY)
        ),
      });
    };

    const up = () => {
      cropStartRef.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  /* =======================================================
     RESIZE CROP AREA
     ======================================================= */

  function startResizeCrop(
    handle: CropHandle
  ) {
    return (
      e: React.PointerEvent
    ) => {
      e.preventDefault();
      e.stopPropagation();

      cropStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        rect: {
          ...cropRect,
        },
      };

      const move = (
        event: PointerEvent
      ) => {
        const start = cropStartRef.current;
        if (!start) return;

        const dx = (event.clientX - start.x) / zoom;
        const dy = (event.clientY - start.y) / zoom;

        let left = start.rect.x;
        let top = start.rect.y;
        let right = start.rect.x + start.rect.width;
        let bottom = start.rect.y + start.rect.height;

        const MIN_SIZE = 24;

        if (handle.includes("w")) {
          left = clamp(
            start.rect.x + dx,
            0,
            right - MIN_SIZE
          );
        }

        if (handle.includes("e")) {
          right = clamp(
            start.rect.x + start.rect.width + dx,
            left + MIN_SIZE,
            element.width
          );
        }

        if (handle.includes("n")) {
          top = clamp(
            start.rect.y + dy,
            0,
            bottom - MIN_SIZE
          );
        }

        if (handle.includes("s")) {
          bottom = clamp(
            start.rect.y + start.rect.height + dy,
            top + MIN_SIZE,
            element.height
          );
        }

        setCropRect({
          x: left,
          y: top,
          width: right - left,
          height: bottom - top,
        });
      };

      const up = () => {
        cropStartRef.current = null;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    };
  }

  const handles: CropHandle[] = [
    "nw",
    "n",
    "ne",
    "e",
    "se",
    "s",
    "sw",
    "w",
  ];

  return (
    <>
      {/* Dark outside crop area */}
      <div
        className="pointer-events-none absolute inset-0 bg-black/55 transition-opacity"
        style={{
          clipPath: `
            polygon(
              0 0,
              100% 0,
              100% 100%,
              0 100%,
              0 0,
              ${cropRect.x}px ${cropRect.y}px,
              ${cropRect.x}px ${
                cropRect.y +
                cropRect.height
              }px,
              ${
                cropRect.x +
                cropRect.width
              }px ${
                cropRect.y +
                cropRect.height
              }px,
              ${
                cropRect.x +
                cropRect.width
              }px ${cropRect.y}px,
              ${cropRect.x}px ${cropRect.y}px
            )
          `,
          zIndex: 50,
        }}
      />

      {/* Crop frame */}
      <div
        className="absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
        style={{
          left: cropRect.x,
          top: cropRect.y,
          width: cropRect.width,
          height: cropRect.height,
          zIndex: 51,
          touchAction: "none",
          cursor: "move",
        }}
        onPointerDown={startCropMove}
      >
        {/* Rule of thirds */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/3 top-0 h-full w-px bg-white/40 shadow-sm" />
          <div className="absolute left-2/3 top-0 h-full w-px bg-white/40 shadow-sm" />
          <div className="absolute left-0 top-1/3 h-px w-full bg-white/40 shadow-sm" />
          <div className="absolute left-0 top-2/3 h-px w-full bg-white/40 shadow-sm" />
        </div>

        {/* Crop handles */}
        {handles.map((handle) => (
          <CropHandleButton
            key={handle}
            handle={handle}
            onPointerDown={startResizeCrop(handle)}
          />
        ))}
      </div>

      {/* Crop action pill buttons */}
      <div
        className="absolute left-1/2 top-full z-[60] mt-3 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-zinc-700/80 bg-[#141517]/95 px-2.5 py-1.5 shadow-2xl backdrop-blur-md"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
          title="Cancel crop (Esc)"
        >
          Cancel
        </button>

        {hasCrop && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/25 hover:text-amber-200"
            title="Reset to full image"
          >
            Reset
          </button>
        )}

        <button
          type="button"
          onClick={onApply}
          className="flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
          title="Apply crop (Enter)"
        >
          Apply Crop
        </button>
      </div>
    </>
  );
}

/* =========================================================
   CROP HANDLE
   ========================================================= */

function CropHandleButton({
  handle,
  onPointerDown,
}: {
  handle: CropHandle;
  onPointerDown: (
    e: React.PointerEvent
  ) => void;
}) {
  const isCorner = ["nw", "ne", "se", "sw"].includes(handle);

  const position: Record<
    CropHandle,
    string
  > = {
    nw: "-left-2 -top-2",
    n: "left-1/2 -top-1.5 -translate-x-1/2",
    ne: "-right-2 -top-2",
    e: "-right-1.5 top-1/2 -translate-y-1/2",
    se: "-right-2 -bottom-2",
    s: "left-1/2 -bottom-1.5 -translate-x-1/2",
    sw: "-left-2 -bottom-2",
    w: "-left-1.5 top-1/2 -translate-y-1/2",
  };

  const cursor: Record<
    CropHandle,
    string
  > = {
    nw: "nwse-resize",
    n: "ns-resize",
    ne: "nesw-resize",
    e: "ew-resize",
    se: "nwse-resize",
    s: "ns-resize",
    sw: "nesw-resize",
    w: "ew-resize",
  };

  return (
    <div
      onPointerDown={onPointerDown}
      className={`absolute ${position[handle]} ${
        isCorner
          ? "h-4 w-4 rounded-sm border-2 border-white bg-indigo-600 shadow-md transition-transform hover:scale-125"
          : "h-2.5 w-4 rounded-full border border-white bg-indigo-500 shadow-sm transition-transform hover:scale-125"
      }`}
      style={{
        cursor: cursor[handle],
        touchAction: "none",
      }}
    />
  );
}

/* =========================================================
   APPLY CROP
   ========================================================= */

function applyCrop(
  element: ImageElement,
  cropRect: CropRect,
  onChange: (
    patch: Partial<CanvasElement>,
    opts?: {
      commit?: boolean;
    }
  ) => void,
  onToolChange?: (tool: ToolId) => void
) {
  const currentCropWidth = element.cropWidth ?? element.naturalWidth;
  const currentCropHeight = element.cropHeight ?? element.naturalHeight;
  const currentCropX = element.cropX ?? 0;
  const currentCropY = element.cropY ?? 0;

  const scaleX = currentCropWidth / (element.width || 1);
  const scaleY = currentCropHeight / (element.height || 1);

  const newCropX = Math.round(currentCropX + cropRect.x * scaleX);
  const newCropY = Math.round(currentCropY + cropRect.y * scaleY);
  const newCropWidth = Math.max(1, Math.round(cropRect.width * scaleX));
  const newCropHeight = Math.max(1, Math.round(cropRect.height * scaleY));

  const newX = Math.round(element.x + cropRect.x);
  const newY = Math.round(element.y + cropRect.y);
  const newWidth = Math.max(16, Math.round(cropRect.width));
  const newHeight = Math.max(16, Math.round(cropRect.height));

  onChange(
    {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      cropX: newCropX,
      cropY: newCropY,
      cropWidth: newCropWidth,
      cropHeight: newCropHeight,
    },
    {
      commit: true,
    }
  );

  // Switch back to select tool so the image is immediately selectable and movable
  onToolChange?.("select");
}

/* =========================================================
   RESET CROP
   ========================================================= */

function resetCrop(
  element: ImageElement,
  onChange: (
    patch: Partial<CanvasElement>,
    opts?: {
      commit?: boolean;
    }
  ) => void,
  onToolChange?: (tool: ToolId) => void
) {
  const currentCropWidth = element.cropWidth ?? element.naturalWidth;
  const currentCropHeight = element.cropHeight ?? element.naturalHeight;

  const scale = element.width / (currentCropWidth || 1);
  const fullWidth = Math.round(element.naturalWidth * scale);
  const fullHeight = Math.round(element.naturalHeight * scale);
  const offsetX = Math.round((element.cropX ?? 0) * scale);
  const offsetY = Math.round((element.cropY ?? 0) * scale);

  onChange(
    {
      x: Math.round(element.x - offsetX),
      y: Math.round(element.y - offsetY),
      width: fullWidth,
      height: fullHeight,
      cropX: 0,
      cropY: 0,
      cropWidth: element.naturalWidth,
      cropHeight: element.naturalHeight,
    },
    {
      commit: true,
    }
  );

  onToolChange?.("select");
}

/* =========================================================
   CLAMP
   ========================================================= */

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(
    Math.max(value, min),
    max
  );
}

/* =========================================================
   IMAGE FILTERS
   ========================================================= */

function getImageFilter(
  filter: string | undefined,
  intensity = 100,
  adjustments?: {
    brightness?: number;
    contrast?: number;
    saturate?: number;
    blur?: number;
    hueRotate?: number;
  }
): string | undefined {
  const parts: string[] = [];
  const amount = clamp(intensity, 0, 100) / 100;

  if (filter && filter !== "none" && amount > 0) {
    switch (filter) {
      case "grayscale":
        parts.push(`grayscale(${amount * 100}%)`);
        break;
      case "sepia":
        parts.push(`sepia(${amount * 100}%)`);
        break;
      case "blur":
        parts.push(`blur(${amount * 4}px)`);
        break;
      case "brightness":
        parts.push(`brightness(${1 + 0.3 * amount})`);
        break;
      case "contrast":
        parts.push(`contrast(${1 + 0.4 * amount})`);
        break;
      case "saturate":
        parts.push(`saturate(${1 + amount})`);
        break;
      case "invert":
        parts.push(`invert(${amount * 100}%)`);
        break;
      case "warm":
        parts.push(
          `sepia(${25 * amount}%) saturate(${1 + 0.5 * amount}) brightness(${1 + 0.05 * amount})`
        );
        break;
      case "cool":
        parts.push(
          `saturate(${1 - 0.2 * amount}) hue-rotate(${20 * amount}deg) brightness(${1 + 0.05 * amount})`
        );
        break;
    }
  }

  if (adjustments) {
    if (adjustments.brightness !== undefined && adjustments.brightness !== 100) {
      parts.push(`brightness(${adjustments.brightness / 100})`);
    }
    if (adjustments.contrast !== undefined && adjustments.contrast !== 100) {
      parts.push(`contrast(${adjustments.contrast / 100})`);
    }
    if (adjustments.saturate !== undefined && adjustments.saturate !== 100) {
      parts.push(`saturate(${adjustments.saturate / 100})`);
    }
    if (adjustments.blur !== undefined && adjustments.blur > 0) {
      parts.push(`blur(${adjustments.blur}px)`);
    }
    if (adjustments.hueRotate !== undefined && adjustments.hueRotate !== 0) {
      parts.push(`hue-rotate(${adjustments.hueRotate}deg)`);
    }
  }

  return parts.length > 0 ? parts.join(" ") : undefined;
}