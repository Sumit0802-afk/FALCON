import React, { useRef, useState, useCallback } from "react";
import { EmailBlock, BlockType, PreviewMode } from "@/types/email";
import { createBlock } from "@/utils/emailUtils";
import BlockRenderer from "./BlockRenderer";

// ─── Block Controls Overlay ────────────────────────────────────────────────────

interface BlockControlsProps {
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function BlockControls({ index, total, onMoveUp, onMoveDown, onDuplicate, onDelete }: BlockControlsProps) {
  return (
    <div className="pointer-events-auto absolute -top-8 right-0 z-30 flex items-center gap-1 rounded-t bg-black/90 px-1.5 py-1">
      <button
        onClick={onMoveUp}
        disabled={index === 0}
        title="Move up"
        className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
      >↑</button>
      <button
        onClick={onMoveDown}
        disabled={index === total - 1}
        title="Move down"
        className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
      >↓</button>
      <div className="mx-1 h-3 w-px bg-white/10" />
      <button
        onClick={onDuplicate}
        title="Duplicate"
        className="flex h-5 items-center rounded px-1.5 text-[10px] text-zinc-400 hover:bg-white/10 hover:text-white"
      >Dup</button>
      <button
        onClick={onDelete}
        title="Delete"
        className="flex h-5 items-center rounded px-1.5 text-[10px] text-red-400 hover:bg-red-500/20 hover:text-red-300"
      >Del</button>
    </div>
  );
}

// ─── Drop Indicator ───────────────────────────────────────────────────────────

function DropIndicator() {
  return (
    <div className="pointer-events-none flex items-center py-0.5">
      <div className="h-0.5 w-2 rounded-full bg-[#00D084]" />
      <div className="h-0.5 flex-1 bg-[#00D084]/70" />
      <div className="h-0.5 w-2 rounded-full bg-[#00D084]" />
    </div>
  );
}

// ─── Email Canvas ─────────────────────────────────────────────────────────────

interface EmailCanvasProps {
  blocks: EmailBlock[];
  selectedId: string | null;
  previewMode: PreviewMode;
  emailWidth: number;
  contentBackground: string;
  outerBackground: string;
  draggingBlockType: BlockType | null;
  onSelectBlock: (id: string | null) => void;
  onUpdateBlock: (block: EmailBlock) => void;
  onMoveBlock: (fromIndex: number, toIndex: number) => void;
  onDuplicateBlock: (index: number) => void;
  onDeleteBlock: (index: number) => void;
  onDropNewBlock: (type: BlockType, atIndex: number) => void;
}

export default function EmailCanvas({
  blocks,
  selectedId,
  previewMode,
  emailWidth,
  contentBackground,
  outerBackground,
  draggingBlockType,
  onSelectBlock,
  onUpdateBlock,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onDropNewBlock,
}: EmailCanvasProps) {
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);

  const canvasWidth = previewMode === "mobile" ? 375 : emailWidth;

  // ── Existing Block Drag ────────────────────────────────────────────────────
  const handleBlockDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `existing:${index}`);
    setDragFromIndex(index);
  };

  const handleBlockDragEnd = () => {
    setDragFromIndex(null);
    setDropIndex(null);
  };

  // ── Drop Zone Calculation ──────────────────────────────────────────────────
  const computeDropIndex = (e: React.DragEvent, containerRect: DOMRect, blockRects: DOMRect[]): number => {
    const y = e.clientY;
    for (let i = 0; i < blockRects.length; i++) {
      const mid = blockRects[i].top + blockRects[i].height / 2;
      if (y < mid) return i;
    }
    return blockRects.length;
  };

  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleContainerDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const rects = blockRefs.current.map((r) => r?.getBoundingClientRect() ?? new DOMRect());
      const idx = computeDropIndex(e, containerRect, rects);
      setDropIndex(idx);
    },
    []
  );

  const handleContainerDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const data = e.dataTransfer.getData("text/plain");

      if (dropIndex === null) return;

      if (data.startsWith("existing:")) {
        const fromIdx = parseInt(data.replace("existing:", ""), 10);
        if (fromIdx !== dropIndex && fromIdx !== dropIndex - 1) {
          const to = fromIdx < dropIndex ? dropIndex - 1 : dropIndex;
          onMoveBlock(fromIdx, to);
        }
      } else if (draggingBlockType) {
        onDropNewBlock(draggingBlockType, dropIndex);
      }

      setDropIndex(null);
      setDragFromIndex(null);
    },
    [dropIndex, draggingBlockType, onMoveBlock, onDropNewBlock]
  );

  const handleContainerDragLeave = (e: React.DragEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setDropIndex(null);
    }
  };

  return (
    <div
      className="flex h-full w-full flex-1 items-start justify-center overflow-auto"
      style={{ backgroundColor: outerBackground, padding: "32px 16px" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onSelectBlock(null);
      }}
    >
      {/* Email paper */}
      <div
        ref={containerRef}
        className="relative transition-all duration-300"
        style={{
          width: canvasWidth,
          minHeight: 400,
          backgroundColor: contentBackground,
          boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
        }}
        onDragOver={handleContainerDragOver}
        onDrop={handleContainerDrop}
        onDragLeave={handleContainerDragLeave}
        onClick={(e) => {
          if (e.target === e.currentTarget) onSelectBlock(null);
        }}
      >
        {/* Drop indicator at top */}
        {dropIndex === 0 && (blocks.length === 0 || dragFromIndex !== 0) && <DropIndicator />}

        {blocks.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <div className="mb-3 text-4xl opacity-30">✉️</div>
            <div className="text-sm font-medium text-gray-400">Drag blocks here to start building</div>
            <div className="mt-1 text-xs text-gray-300">or pick a template from the sidebar</div>
          </div>
        )}

        {blocks.map((block, index) => {
          const isSelected = selectedId === block.id;
          const isBeingDragged = dragFromIndex === index;

          return (
            <React.Fragment key={block.id}>
              {/* Block wrapper */}
              <div
                ref={(el) => { blockRefs.current[index] = el; }}
                draggable
                onDragStart={(e) => handleBlockDragStart(e, index)}
                onDragEnd={handleBlockDragEnd}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBlock(block.id);
                }}
                className="group relative cursor-default transition-all"
                style={{
                  outline: isSelected ? "2px solid #00D084" : "2px solid transparent",
                  outlineOffset: -1,
                  opacity: isBeingDragged ? 0.35 : 1,
                }}
              >
                {/* Hover outline */}
                {!isSelected && (
                  <div className="pointer-events-none absolute inset-0 z-10 opacity-0 ring-1 ring-inset ring-[#00D084]/40 group-hover:opacity-100" />
                )}

                {/* Block controls */}
                {isSelected && (
                  <BlockControls
                    index={index}
                    total={blocks.length}
                    onMoveUp={() => onMoveBlock(index, index - 1)}
                    onMoveDown={() => onMoveBlock(index, index + 1)}
                    onDuplicate={() => onDuplicateBlock(index)}
                    onDelete={() => onDeleteBlock(index)}
                  />
                )}

                {/* Block content */}
                <BlockRenderer
                  block={block}
                  onChange={(updated) => onUpdateBlock(updated)}
                />
              </div>

              {/* Drop indicator after this block */}
              {dropIndex === index + 1 && (dragFromIndex === null || (dragFromIndex !== index && dragFromIndex !== index + 1)) && (
                <DropIndicator />
              )}
            </React.Fragment>
          );
        })}

        {/* Drop indicator at bottom (empty canvas) */}
        {blocks.length > 0 && dropIndex === blocks.length && dragFromIndex !== blocks.length - 1 && (
          <DropIndicator />
        )}
      </div>
    </div>
  );
}
