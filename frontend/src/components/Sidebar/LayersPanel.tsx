import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Square,
  Circle,
  Type,
  Image as ImageIcon,
  Minus,
  Layers,
  ScanLine,
} from "lucide-react";

import {
  CanvasElement,
  isImage,
  isShape,
  isText,
  isFrame,
} from "@/types";
import { Frame } from "lucide-react";

interface LayersPanelProps {
  elements: CanvasElement[];
  selectedIds: string[];
  onSelect: (id: string, additive?: boolean) => void;
  onToggleHidden: (id: string) => void;
  onToggleLocked: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
}

/* =========================================================
   KIND META
   ========================================================= */

type ElementKind = "text" | "image" | "rectangle" | "ellipse" | "line" | "frame" | "other";

function getKind(el: CanvasElement): ElementKind {
  if (isText(el)) return "text";
  if (isFrame(el)) return "frame";
  if (isImage(el)) return "image";
  if (isShape(el)) {
    if (el.type === "ellipse") return "ellipse";
    if (el.type === "line") return "line";
    return "rectangle";
  }
  return "other";
}

const KIND_META: Record<
  ElementKind,
  { label: string; icon: React.ReactNode; color: string; bg: string; border: string; dimColor: string }
> = {
  text: {
    label: "Text",
    icon: <Type size={14} />,
    color: "#c4b5fd",
    dimColor: "#7c3aed",
    bg: "rgba(167,139,250,0.15)",
    border: "rgba(167,139,250,0.3)",
  },
  frame: {
    label: "Frame",
    icon: <Frame size={14} />,
    color: "#f472b6",
    dimColor: "#db2777",
    bg: "rgba(244,114,182,0.15)",
    border: "rgba(244,114,182,0.3)",
  },
  image: {
    label: "Image",
    icon: <ImageIcon size={14} />,
    color: "#6ee7b7",
    dimColor: "#059669",
    bg: "rgba(52,211,153,0.15)",
    border: "rgba(52,211,153,0.3)",
  },
  rectangle: {
    label: "Shape",
    icon: <Square size={14} />,
    color: "#93c5fd",
    dimColor: "#2563eb",
    bg: "rgba(96,165,250,0.15)",
    border: "rgba(96,165,250,0.3)",
  },
  ellipse: {
    label: "Shape",
    icon: <Circle size={14} />,
    color: "#93c5fd",
    dimColor: "#2563eb",
    bg: "rgba(96,165,250,0.15)",
    border: "rgba(96,165,250,0.3)",
  },
  line: {
    label: "Line",
    icon: <Minus size={14} />,
    color: "#93c5fd",
    dimColor: "#2563eb",
    bg: "rgba(96,165,250,0.15)",
    border: "rgba(96,165,250,0.3)",
  },
  other: {
    label: "Layer",
    icon: <Layers size={14} />,
    color: "#d4d4d8",
    dimColor: "#52525b",
    bg: "rgba(255,255,255,0.08)",
    border: "rgba(255,255,255,0.12)",
  },
};

/* =========================================================
   ELEMENT NAME
   ========================================================= */

function getElementName(element: CanvasElement): string {
  if (isText(element)) {
    const text = element.text.replace(/\n/g, " ").trim();
    if (!text) return "Empty Text";
    return text.length > 18 ? `${text.slice(0, 18)}…` : text;
  }
  if (isFrame(element)) {
    const s = element.frameShape || "Shape";
    return `${s.charAt(0).toUpperCase() + s.slice(1)} Frame`;
  }
  if (isImage(element)) return "Image";
  if (isShape(element)) {
    if (element.type === "ellipse") return "Ellipse";
    if (element.type === "line") return "Line";
    return "Rectangle";
  }
  return "Layer";
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export function LayersPanel({
  elements,
  selectedIds,
  onSelect,
  onToggleHidden,
  onToggleLocked,
  onBringForward,
  onSendBackward,
  onReorder,
}: LayersPanelProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  function handleDragStart(e: React.DragEvent<HTMLDivElement>, id: string) {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }
  function handleDragOver(e: React.DragEvent<HTMLDivElement>, id: string) {
    e.preventDefault();
    if (!draggedId || draggedId === id) return;
    e.dataTransfer.dropEffect = "move";
    setDragOverId(id);
  }
  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    const relatedTarget = e.relatedTarget as Node | null;
    if (relatedTarget && e.currentTarget.contains(relatedTarget)) return;
    setDragOverId(null);
  }
  function handleDrop(e: React.DragEvent<HTMLDivElement>, targetId: string) {
    e.preventDefault();
    const sourceId = draggedId || e.dataTransfer.getData("text/plain");
    if (sourceId && sourceId !== targetId) onReorder(sourceId, targetId);
    setDraggedId(null);
    setDragOverId(null);
  }
  function handleDragEnd() {
    setDraggedId(null);
    setDragOverId(null);
  }

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        background: "#0d0d0d",
        color: "#fff",
      }}
    >
      {/* ── Header ──────────────────────────────────────── */}
      <div
        style={{
          padding: "12px 12px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "#111",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ScanLine size={14} style={{ color: "#818cf8" }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#f4f4f5" }}>
              Layers
            </p>
            <p style={{ margin: 0, fontSize: 10, color: "#71717a", marginTop: 1 }}>
              {elements.length} {elements.length === 1 ? "element" : "elements"}
            </p>
          </div>

          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#6366f1",
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.22)",
              borderRadius: 6,
              padding: "1px 8px",
              flexShrink: 0,
            }}
          >
            {elements.length}
          </span>
        </div>

        {selectedIds.length > 0 && (
          <div
            style={{
              marginTop: 8,
              padding: "4px 9px",
              borderRadius: 6,
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.25)",
              fontSize: 10,
              color: "#a5b4fc",
              fontWeight: 600,
            }}
          >
            ✦ {selectedIds.length === 1 ? "1 layer" : `${selectedIds.length} layers`} selected
          </div>
        )}
      </div>

      {/* ── Layer List ──────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
        {sortedElements.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 10,
              padding: "0 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "#141414",
                border: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Layers size={18} style={{ color: "#3f3f46" }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#52525b" }}>
                No layers yet
              </p>
              <p style={{ margin: "5px 0 0", fontSize: 11, color: "#3f3f46", lineHeight: 1.5 }}>
                Add an element on the canvas
              </p>
            </div>
          </div>
        ) : (
          sortedElements.map((element, index) => {
            const kind      = getKind(element);
            const meta      = KIND_META[kind];
            const selected  = selectedIds.includes(element.id);
            const hovered   = hoveredId === element.id;
            const isDragging = draggedId === element.id;
            const isDragOver = dragOverId === element.id;
            const isTop     = index === 0;
            const isBottom  = index === sortedElements.length - 1;
            const showActions = hovered || selected;

            return (
              <div
                key={element.id}
                draggable={!element.locked}
                onDragStart={(e) => handleDragStart(e, element.id)}
                onDragOver={(e) => handleDragOver(e, element.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, element.id)}
                onDragEnd={handleDragEnd}
                onMouseEnter={() => setHoveredId(element.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  position: "relative",
                  padding: "3px 8px",
                  opacity: isDragging ? 0.3 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {/* Drop indicator */}
                {isDragOver && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 8,
                      right: 8,
                      height: 2,
                      borderRadius: 1,
                      background: "#6366f1",
                      boxShadow: "0 0 10px rgba(99,102,241,0.8)",
                      zIndex: 20,
                      pointerEvents: "none",
                    }}
                  />
                )}

                {/* Layer row */}
                <div
                  onClick={(e) => onSelect(element.id, e.shiftKey)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 8px",
                    borderRadius: 10,
                    cursor: "pointer",
                    border: selected
                      ? `1px solid ${meta.border}`
                      : hovered
                      ? "1px solid rgba(255,255,255,0.09)"
                      : "1px solid transparent",
                    background: selected
                      ? meta.bg
                      : hovered
                      ? "rgba(255,255,255,0.04)"
                      : "transparent",
                    transition: "all 0.12s",
                    position: "relative",
                  }}
                >
                  {/* Drag handle */}
                  <div
                    style={{
                      color: element.locked ? "#27272a" : hovered ? "#71717a" : "#3f3f46",
                      cursor: element.locked ? "not-allowed" : "grab",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      transition: "color 0.12s",
                    }}
                  >
                    <GripVertical size={14} />
                  </div>

                  {/* Kind icon box */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      flexShrink: 0,
                      borderRadius: 9,
                      background: selected ? meta.bg : "rgba(255,255,255,0.05)",
                      border: `1.5px solid ${selected ? meta.border : "rgba(255,255,255,0.09)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: selected ? meta.color : hovered ? meta.color : meta.dimColor,
                      transition: "all 0.15s",
                      flexDirection: "column",
                    }}
                  >
                    {meta.icon}
                  </div>

                  {/* Name + badge */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        fontWeight: 600,
                        color: selected
                          ? "#f4f4f5"
                          : hovered
                          ? "#d4d4d8"
                          : "#a1a1aa",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        lineHeight: 1.3,
                        transition: "color 0.12s",
                      }}
                    >
                      {getElementName(element)}
                    </p>
                    {/* Type badge */}
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        marginTop: 3,
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: selected ? meta.color : "#52525b",
                        background: selected ? "rgba(255,255,255,0.07)" : "transparent",
                        border: selected
                          ? `1px solid ${meta.border}`
                          : "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 4,
                        padding: "1px 5px",
                        transition: "all 0.12s",
                      }}
                    >
                      {meta.label}
                    </span>
                  </div>

                  {/* Action buttons – visible on hover or when selected */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flexShrink: 0,
                      opacity: showActions ? 1 : 0,
                      transition: "opacity 0.15s",
                    }}
                  >
                    <SmallBtn
                      title={isTop ? "Already at front" : "Bring forward"}
                      disabled={element.locked || isTop}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!element.locked && !isTop) onBringForward(element.id);
                      }}
                    >
                      <ChevronUp size={11} />
                    </SmallBtn>

                    <SmallBtn
                      title={isBottom ? "Already at back" : "Send backward"}
                      disabled={element.locked || isBottom}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!element.locked && !isBottom) onSendBackward(element.id);
                      }}
                    >
                      <ChevronDown size={11} />
                    </SmallBtn>

                    <SmallBtn
                      title={element.hidden ? "Show layer" : "Hide layer"}
                      active={element.hidden}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleHidden(element.id);
                      }}
                    >
                      {element.hidden ? <EyeOff size={11} /> : <Eye size={11} />}
                    </SmallBtn>

                    <SmallBtn
                      title={element.locked ? "Unlock layer" : "Lock layer"}
                      active={element.locked}
                      activeColor="#818cf8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLocked(element.id);
                      }}
                    >
                      {element.locked ? <Lock size={11} /> : <Unlock size={11} />}
                    </SmallBtn>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 9,
            color: "#27272a",
            letterSpacing: "0.14em",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          Falcon
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: selectedIds.length > 0 ? "#818cf8" : "#3f3f46",
          }}
        >
          {selectedIds.length > 0
            ? `${selectedIds.length} selected`
            : "No selection"}
        </span>
      </div>
    </aside>
  );
}

/* =========================================================
   SMALL ACTION BUTTON
   ========================================================= */

interface SmallBtnProps {
  title: string;
  disabled?: boolean;
  active?: boolean;
  activeColor?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

function SmallBtn({
  title,
  disabled,
  active,
  activeColor = "#a1a1aa",
  onClick,
  children,
}: SmallBtnProps) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 22,
        height: 22,
        borderRadius: 5,
        border: "none",
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.12s",
        flexShrink: 0,
        background: active
          ? "rgba(255,255,255,0.08)"
          : hov
          ? "rgba(255,255,255,0.07)"
          : "transparent",
        color: disabled
          ? "#27272a"
          : active
          ? activeColor
          : hov
          ? "#e4e4e7"
          : "#71717a",
      }}
    >
      {children}
    </button>
  );
}