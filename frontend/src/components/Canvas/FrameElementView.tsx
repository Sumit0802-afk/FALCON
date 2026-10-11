import React, { useState, useRef } from "react";
import {
  FrameElement,
} from "@/types";
import { getFrameById } from "@/data/frameDefinitions";
import {
  Image as ImageIcon,
  Check,
  RotateCcw,
  ZoomIn,
  Move,
} from "lucide-react";

interface FrameElementViewProps {
  element: FrameElement;
  selected: boolean;
  isRepositioning: boolean;
  onExitRepositioning: () => void;
  onChange: (
    patch: Partial<FrameElement>,
    opts?: { commit?: boolean }
  ) => void;
}

export function FrameElementView({
  element,
  selected,
  isRepositioning,
  onExitRepositioning,
  onChange,
}: FrameElementViewProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const frameDef = getFrameById(element.frameShape);
  const clipId = `clip-frame-${element.id}`;

  // Image dimension and position calculations
  const nw = element.imageNaturalWidth || element.width;
  const nh = element.imageNaturalHeight || element.height;
  const frameW = element.width;
  const frameH = element.height;

  // object-fit: cover sizing
  const scale = Math.max(frameW / nw, frameH / nh);
  const baseW = nw * scale;
  const baseH = nh * scale;

  const zoom = Math.max(1, element.imageZoom ?? 1);
  const currentW = baseW * zoom;
  const currentH = baseH * zoom;

  // Base centered offset + user pan
  const defaultLeft = (frameW - currentW) / 2;
  const defaultTop = (frameH - currentH) / 2;
  const left = defaultLeft + (element.imageOffsetX ?? 0);
  const top = defaultTop + (element.imageOffsetY ?? 0);

  // Dragging / panning the image in reposition mode
  const panStartRef = useRef<{ startX: number; startY: number; initOffX: number; initOffY: number } | null>(null);

  const handlePointerDownPan = (e: React.PointerEvent) => {
    if (!isRepositioning) return;
    e.stopPropagation();
    panStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initOffX: element.imageOffsetX ?? 0,
      initOffY: element.imageOffsetY ?? 0,
    };

    const handlePointerMove = (moveEvt: PointerEvent) => {
      if (!panStartRef.current) return;
      const dx = moveEvt.clientX - panStartRef.current.startX;
      const dy = moveEvt.clientY - panStartRef.current.startY;
      onChange(
        {
          imageOffsetX: Math.round(panStartRef.current.initOffX + dx),
          imageOffsetY: Math.round(panStartRef.current.initOffY + dy),
        },
        { commit: false }
      );
    };

    const handlePointerUp = () => {
      panStartRef.current = null;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      onChange({}, { commit: true });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Image drop handling
  const handleFileDrop = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return;
      const img = new Image();
      img.onload = () => {
        onChange({
          imageSrc: src,
          imageNaturalWidth: img.naturalWidth || 400,
          imageNaturalHeight: img.naturalHeight || 400,
          imageOffsetX: 0,
          imageOffsetY: 0,
          imageZoom: 1,
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // 1. Check if dropped from Uploads panel or another image
    const customSrc =
      e.dataTransfer.getData("application/falcon-image-src") ||
      e.dataTransfer.getData("text/uri-list");

    if (customSrc && (customSrc.startsWith("data:") || customSrc.startsWith("http") || customSrc.startsWith("blob:"))) {
      const img = new Image();
      img.onload = () => {
        onChange({
          imageSrc: customSrc,
          imageNaturalWidth: img.naturalWidth || 400,
          imageNaturalHeight: img.naturalHeight || 400,
          imageOffsetX: 0,
          imageOffsetY: 0,
          imageZoom: 1,
        });
      };
      img.src = customSrc;
      return;
    }

    // 2. Check if dropped file from OS
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileDrop(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`relative h-full w-full ${isRepositioning ? "cursor-move" : ""}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileDrop(file);
        }}
        className="hidden"
      />

      {/* ── SVG ClipPath Definition ── */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path
              d={frameDef.svgPath100}
              transform={`scale(${frameW / 100}, ${frameH / 100})`}
            />
          </clipPath>
        </defs>
      </svg>

      {/* ── Background Image Ghost (when in reposition mode) ── */}
      {isRepositioning && element.imageSrc && (
        <div
          className="pointer-events-none absolute inset-0 overflow-visible opacity-35"
          style={{ zIndex: 10 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={element.imageSrc}
            alt=""
            draggable={false}
            className="absolute max-w-none max-h-none select-none pointer-events-none"
            style={{
              left,
              top,
              width: currentW,
              height: currentH,
            }}
          />
        </div>
      )}

      {/* ── Masked Frame Area ── */}
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          clipPath: `url(#${clipId})`,
          zIndex: 20,
        }}
      >
        {element.imageSrc ? (
          // Clipped image
          <div
            onPointerDown={handlePointerDownPan}
            className="relative h-full w-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={element.imageSrc}
              alt=""
              draggable={false}
              className="absolute max-w-none max-h-none select-none pointer-events-none"
              style={{
                left,
                top,
                width: currentW,
                height: currentH,
              }}
            />

            {/* Rule of thirds grid when in reposition mode */}
            {isRepositioning && (
              <div className="pointer-events-none absolute inset-0 z-30">
                <div className="absolute left-1/3 top-0 h-full w-px bg-white/40" />
                <div className="absolute left-2/3 top-0 h-full w-px bg-white/40" />
                <div className="absolute left-0 top-1/3 h-px w-full bg-white/40" />
                <div className="absolute left-0 top-2/3 h-px w-full bg-white/40" />
              </div>
            )}
          </div>
        ) : (
          // Empty placeholder (Canva style)
          <div
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className={`group flex h-full w-full flex-col items-center justify-center cursor-pointer transition ${
              isDragOver
                ? "bg-pink-500/25 border-2 border-dashed border-pink-400"
                : "bg-gradient-to-b from-sky-400/20 via-sky-300/10 to-emerald-500/20 hover:from-sky-400/30 hover:to-emerald-500/30"
            }`}
          >
            {/* Subtle landscape silhouette */}
            <div className="pointer-events-none absolute inset-0 opacity-20">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                <circle cx="75" cy="28" r="10" fill="#60a5fa" />
                <path d="M 0,100 L 35,60 L 65,85 L 85,55 L 100,100 Z" fill="#34d399" />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col items-center p-3 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white shadow-md backdrop-blur-md transition group-hover:scale-110 group-hover:bg-white/20">
                <ImageIcon size={20} className="text-pink-300" />
              </div>
              <span className="mt-2 text-[10px] font-semibold text-white/90">
                {isDragOver ? "Drop image here" : "Add Image"}
              </span>
              <span className="text-[8px] text-white/60">
                Click or drag & drop
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Frame Border / Stroke Overlay ── */}
      <svg
        className="pointer-events-none absolute inset-0 z-30"
        width={frameW}
        height={frameH}
      >
        <path
          d={frameDef.svgPath100}
          transform={`scale(${frameW / 100}, ${frameH / 100})`}
          fill="none"
          stroke={
            isRepositioning
              ? "#ffffff"
              : element.stroke && element.strokeWidth
              ? element.stroke
              : isDragOver
              ? "#f472b6"
              : "rgba(255,255,255,0.12)"
          }
          strokeWidth={
            isRepositioning
              ? 2
              : element.strokeWidth || (selected ? 1.5 : 1)
          }
          strokeDasharray={isRepositioning || !element.imageSrc ? "4 4" : undefined}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      {/* ── In-Frame Repositioning Floating Toolbar ── */}
      {isRepositioning && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute left-1/2 top-full z-50 mt-3 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-white/[0.1] bg-[#111114]/95 px-3 py-2 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-1 text-zinc-400">
            <Move size={13} />
            <span className="text-[10px] font-medium text-zinc-300">Drag to move</span>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Zoom Slider */}
          <div className="flex items-center gap-2">
            <ZoomIn size={13} className="text-zinc-400" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => {
                onChange({ imageZoom: parseFloat(e.target.value) }, { commit: false });
              }}
              className="h-1.5 w-20 accent-pink-500 cursor-pointer"
            />
            <span className="font-mono text-[10px] text-zinc-400">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Reset position button */}
          <button
            type="button"
            onClick={() => {
              onChange({ imageOffsetX: 0, imageOffsetY: 0, imageZoom: 1 });
            }}
            title="Reset position"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>

          {/* Done button */}
          <button
            type="button"
            onClick={onExitRepositioning}
            className="flex items-center gap-1 rounded-lg bg-pink-600 px-3 py-1 text-xs font-semibold text-white shadow-md hover:bg-pink-500"
          >
            <Check size={13} strokeWidth={2.5} />
            <span>Done</span>
          </button>
        </div>
      )}
    </div>
  );
}
