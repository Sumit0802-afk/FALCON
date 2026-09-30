import React from "react";
import { RotateCw } from "lucide-react";
import { ResizeHandle } from "@/hooks/useDragResize";

interface SelectionBoxProps {
  onResizeStart: (
    handle: ResizeHandle
  ) => (e: React.PointerEvent) => void;

  onRotateStart: (
    e: React.PointerEvent
  ) => void;
}

interface HandleConfig {
  id: ResizeHandle;
  cursor: string;
  positionClass: string;
  isSideHandle: boolean;
  orientation?: "horizontal" | "vertical";
}

const HANDLES: HandleConfig[] = [
  // Corners
  {
    id: "nw",
    cursor: "nwse-resize",
    positionClass: "left-0 top-0",
    isSideHandle: false,
  },
  {
    id: "ne",
    cursor: "nesw-resize",
    positionClass: "left-full top-0",
    isSideHandle: false,
  },
  {
    id: "se",
    cursor: "nwse-resize",
    positionClass: "left-full top-full",
    isSideHandle: false,
  },
  {
    id: "sw",
    cursor: "nesw-resize",
    positionClass: "left-0 top-full",
    isSideHandle: false,
  },
  // Side Splitters / Edge handles
  {
    id: "n",
    cursor: "ns-resize",
    positionClass: "left-1/2 top-0",
    isSideHandle: true,
    orientation: "horizontal",
  },
  {
    id: "s",
    cursor: "ns-resize",
    positionClass: "left-1/2 top-full",
    isSideHandle: true,
    orientation: "horizontal",
  },
  {
    id: "w",
    cursor: "ew-resize",
    positionClass: "left-0 top-1/2",
    isSideHandle: true,
    orientation: "vertical",
  },
  {
    id: "e",
    cursor: "ew-resize",
    positionClass: "left-full top-1/2",
    isSideHandle: true,
    orientation: "vertical",
  },
];

export function SelectionBox({
  onResizeStart,
  onRotateStart,
}: SelectionBoxProps) {
  return (
    <div className="pointer-events-none absolute inset-0 rounded-[1px] outline outline-2 outline-indigo-500">
      {/* ================================================= */}
      {/* ROTATE HANDLE (Positioned cleanly above top edge) */}
      {/* ================================================= */}
      <div className="pointer-events-none absolute left-1/2 -top-12 -translate-x-1/2 flex flex-col items-center">
        {/* Rotate button */}
        <button
          type="button"
          aria-label="Rotate element"
          onPointerDown={onRotateStart}
          className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full border border-indigo-400/80 bg-[#121316] text-indigo-300 shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-all hover:scale-110 hover:border-indigo-400 hover:bg-indigo-600 hover:text-white active:scale-95"
          style={{
            cursor: "grab",
            touchAction: "none",
          }}
          title="Drag to rotate"
        >
          <RotateCw size={13} />
        </button>

        {/* Subtle connector stem linking rotate button to top edge */}
        <div className="h-3 w-[1.5px] bg-indigo-500/80" />
      </div>

      {/* ================================================= */}
      {/* RESIZE HANDLES & SPLITTERS                        */}
      {/* ================================================= */}
      {HANDLES.map((h) => (
        <div
          key={h.id}
          onPointerDown={onResizeStart(h.id)}
          className={`pointer-events-auto absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center ${h.positionClass}`}
          style={{
            cursor: h.cursor,
            touchAction: "none",
          }}
          title={h.isSideHandle ? "Drag to resize edge" : "Drag to resize"}
        >
          {h.isSideHandle ? (
            // Modern Splitter / Edge Pill Handle
            <div
              className={`rounded-full border-[1.5px] border-indigo-600 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.35)] transition-all duration-150 group-hover:bg-indigo-50 hover:scale-125 hover:border-indigo-500 hover:shadow-indigo-500/30 ${
                h.orientation === "horizontal"
                  ? "h-[6px] w-[18px]"
                  : "h-[18px] w-[6px]"
              }`}
            />
          ) : (
            // Corner Square Handle
            <div className="h-3 w-3 rounded-[3px] border-[1.5px] border-indigo-600 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.35)] transition-all duration-150 hover:scale-125 hover:border-indigo-500 hover:shadow-indigo-500/30" />
          )}
        </div>
      ))}
    </div>
  );
}