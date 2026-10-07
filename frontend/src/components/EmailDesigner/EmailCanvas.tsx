import React, { useRef, useState, useCallback, useEffect } from "react";
import { EmailBlock, EmailSection, EmailSettings, PaletteItem, PreviewMode, Selection } from "@/types/email";
import { BlockTarget } from "@/utils/emailOps";
import { getBlockLink, hasRealLink, normalizeLink } from "@/utils/emailUtils";
import BlockRenderer from "./BlockRenderer";

// ─── Drag model ───────────────────────────────────────────────────────────────
// Something being dragged is either new (from the sidebar palette) or existing
// (a block or a whole row already on the canvas). A drop lands either between
// rows or at a position inside a column.

type CanvasDrag = { kind: "block"; blockId: string } | { kind: "section"; index: number };

type DropTarget = { kind: "gap"; index: number } | ({ kind: "column" } & BlockTarget);

// ─── Small pieces ─────────────────────────────────────────────────────────────

function ToolButton({ title, onClick, disabled, danger, children }: { title: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`flex h-5 min-w-[20px] items-center justify-center rounded px-1 text-[10px] disabled:opacity-30 ${
        danger ? "text-red-400 hover:bg-red-500/20 hover:text-red-300" : "text-zinc-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function DragHandle({ title, onDragStart, onDragEnd }: { title: string; onDragStart: (e: React.DragEvent) => void; onDragEnd: () => void }) {
  return (
    <span
      draggable
      title={title}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={(e) => e.stopPropagation()}
      className="flex h-5 w-5 cursor-grab items-center justify-center rounded text-[11px] leading-none text-zinc-300 hover:bg-white/10 hover:text-white active:cursor-grabbing"
    >
      ⠿
    </span>
  );
}

/** Small editor for a block's link, opened from its toolbar. */
function LinkPopover({ label, value, onSave, onClose }: { label: string; value: string; onSave: (url: string) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(value === "#" ? "" : value);
  const save = () => { onSave(normalizeLink(draft)); onClose(); };
  return (
    <div
      className="absolute right-0 z-40 w-72 rounded-lg border border-white/[0.12] bg-[#0b0b0f] p-3 shadow-2xl"
      style={{ top: 4 }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#00D084]">{label}</div>
      <input
        autoFocus
        type="url"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") save();
          if (e.key === "Escape") onClose();
        }}
        placeholder="https://example.com/page"
        className="w-full rounded border border-white/[0.1] bg-white/[0.04] px-2.5 py-1.5 text-[12px] text-zinc-100 placeholder-zinc-600 outline-none focus:border-[#00D084]/50"
      />
      <div className="mt-2 flex justify-end gap-1.5">
        {hasRealLink(value) && (
          <button type="button" onClick={() => { onSave(""); onClose(); }} className="rounded px-2 py-1 text-[11px] text-red-400 hover:bg-red-500/15">Remove</button>
        )}
        <button type="button" onClick={onClose} className="rounded px-2 py-1 text-[11px] text-zinc-400 hover:bg-white/[0.06] hover:text-white">Cancel</button>
        <button type="button" onClick={save} className="rounded bg-[#00D084] px-2.5 py-1 text-[11px] font-semibold text-black hover:bg-[#00b872]">Save link</button>
      </div>
    </div>
  );
}

function DropLine() {
  return (
    <div className="pointer-events-none relative z-20" style={{ height: 0 }}>
      <div className="absolute left-0 right-0 flex items-center" style={{ top: -2 }}>
        <div className="h-1.5 w-1.5 rounded-full bg-[#00D084]" />
        <div className="h-[3px] flex-1 bg-[#00D084]" />
        <div className="h-1.5 w-1.5 rounded-full bg-[#00D084]" />
      </div>
    </div>
  );
}

// ─── Email Canvas ─────────────────────────────────────────────────────────────

interface EmailCanvasProps {
  sections: EmailSection[];
  selection: Selection;
  previewMode: PreviewMode;
  settings: EmailSettings;
  /** The sidebar item currently being dragged, if any */
  paletteDrag: PaletteItem | null;
  onSelect: (selection: Selection) => void;
  onUpdateBlock: (block: EmailBlock) => void;
  onDropPaletteAtGap: (item: PaletteItem, index: number) => void;
  onDropPaletteInColumn: (item: PaletteItem, target: BlockTarget) => void;
  onMoveBlock: (blockId: string, target: BlockTarget) => void;
  onMoveBlockToGap: (blockId: string, index: number) => void;
  onMoveSection: (from: number, to: number) => void;
  onShiftBlock: (blockId: string, delta: -1 | 1) => void;
  onDuplicateBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
}

const EDGE = 7;

export default function EmailCanvas({
  sections, selection, previewMode, settings, paletteDrag, onSelect, onUpdateBlock, onDropPaletteAtGap,
  onDropPaletteInColumn, onMoveBlock, onMoveBlockToGap, onMoveSection, onShiftBlock, onDuplicateBlock, onDeleteBlock,
  onDuplicateSection, onDeleteSection,
}: EmailCanvasProps) {
  const [drag, setDrag] = useState<CanvasDrag | null>(null);
  const [target, setTarget] = useState<DropTarget | null>(null);
  const [linkEditor, setLinkEditor] = useState<string | null>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  const isMobile = previewMode === "mobile";
  const paperWidth = isMobile ? 375 : settings.emailWidth;
  // Only content can go inside a column; rows and presets always land between rows
  const draggingContent = drag?.kind === "block" || paletteDrag?.kind === "block";
  const dragging = drag !== null || paletteDrag !== null;

  useEffect(() => {
    if (!dragging) setTarget(null);
  }, [dragging]);

  const endDrag = useCallback(() => {
    setDrag(null);
    setTarget(null);
  }, []);

  const beginDrag = (e: React.DragEvent, next: CanvasDrag) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "falcon-email");
    setDrag(next);
  };

  // ── Where would this drop land? ────────────────────────────────────────────

  const gapIndexAt = (clientY: number): number => {
    const rows = paperRef.current?.querySelectorAll<HTMLElement>(":scope > [data-section]") || [];
    for (let i = 0; i < rows.length; i++) {
      const rect = rows[i].getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) return i;
    }
    return rows.length;
  };

  const handlePaperDragOver = (e: React.DragEvent) => {
    if (!dragging) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = paletteDrag ? "copy" : "move";
    const index = gapIndexAt(e.clientY);
    setTarget((prev) => (prev?.kind === "gap" && prev.index === index ? prev : { kind: "gap", index }));
  };

  const handleColumnDragOver = (e: React.DragEvent, section: EmailSection, columnId: string) => {
    if (!draggingContent) return;
    const rowRect = (e.currentTarget.closest("[data-section]") as HTMLElement).getBoundingClientRect();
    // Hovering a row's very edge means "between rows", so let the paper handle it
    if (e.clientY - rowRect.top < EDGE || rowRect.bottom - e.clientY < EDGE) return;

    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = paletteDrag ? "copy" : "move";
    const blocks = e.currentTarget.querySelectorAll<HTMLElement>(":scope > [data-block]");
    let index = blocks.length;
    for (let i = 0; i < blocks.length; i++) {
      const rect = blocks[i].getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) { index = i; break; }
    }
    setTarget((prev) =>
      prev?.kind === "column" && prev.columnId === columnId && prev.index === index
        ? prev
        : { kind: "column", sectionId: section.id, columnId, index }
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const at = target;
    const moving = drag;
    endDrag();
    if (!at) return;

    if (at.kind === "gap") {
      if (moving?.kind === "section") onMoveSection(moving.index, at.index);
      else if (moving?.kind === "block") onMoveBlockToGap(moving.blockId, at.index);
      else if (paletteDrag) onDropPaletteAtGap(paletteDrag, at.index);
      return;
    }
    const blockTarget: BlockTarget = { sectionId: at.sectionId, columnId: at.columnId, index: at.index };
    if (moving?.kind === "block") onMoveBlock(moving.blockId, blockTarget);
    else if (paletteDrag?.kind === "block") onDropPaletteInColumn(paletteDrag, blockTarget);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!paperRef.current?.contains(e.relatedTarget as Node)) setTarget(null);
  };

  const selectedSectionId = selection?.sectionId ?? null;
  const selectedBlockId = selection?.kind === "block" ? selection.blockId : null;

  return (
    <div
      className="flex h-full w-full flex-1 items-start justify-center overflow-auto"
      style={{ backgroundColor: settings.backgroundColor, padding: "44px 16px 80px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onSelect(null); }}
    >
      {/* Device frame: the tablet view shows the full-width email inside a 768px screen */}
      <div
        className="min-w-0 max-w-full transition-all duration-300"
        style={previewMode === "tablet" ? { width: 768, maxWidth: "100%", padding: "0 0 24px", display: "flex", justifyContent: "center", outline: "1px dashed rgba(120,120,120,0.45)", outlineOffset: 12 } : undefined}
        onClick={(e) => { if (e.target === e.currentTarget) onSelect(null); }}
      >
        {/* Email paper */}
        <div
          ref={paperRef}
          className="relative transition-all duration-300"
          style={{
            width: paperWidth, maxWidth: "100%", minHeight: 400, backgroundColor: settings.contentBackground,
            fontFamily: settings.defaultFont, boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
          }}
          onDragOver={handlePaperDragOver}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
          onClick={(e) => { if (e.target === e.currentTarget) onSelect(null); }}
        >
          {sections.length === 0 && (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <div className="mb-3 text-4xl opacity-30">✉️</div>
              <div className="text-sm font-medium text-gray-400">Drag blocks here to start building</div>
              <div className="mt-1 text-xs text-gray-300">or pick a template from the sidebar</div>
            </div>
          )}

          {target?.kind === "gap" && target.index === 0 && <DropLine />}

          {sections.map((section, sectionIndex) => {
            const s = section.settings;
            const sectionSelected = selection?.kind === "section" && selection.sectionId === section.id;
            const sectionActive = selectedSectionId === section.id;
            const stacked = isMobile && s.stackOnMobile && section.columns.length > 1;
            const beingDragged = drag?.kind === "section" && drag.index === sectionIndex;

            return (
              <React.Fragment key={section.id}>
                <div
                  data-section={section.id}
                  className="group/section relative"
                  style={{
                    paddingTop: s.paddingTop, paddingBottom: s.paddingBottom, paddingLeft: s.paddingLeft, paddingRight: s.paddingRight,
                    backgroundColor: s.backgroundColor === "transparent" ? undefined : s.backgroundColor,
                    border: s.borderWidth > 0 ? `${s.borderWidth}px ${s.borderStyle} ${s.borderColor}` : undefined,
                    outline: sectionSelected ? "2px solid #2F81FF" : sectionActive ? "1px solid rgba(47,129,255,0.45)" : undefined,
                    outlineOffset: -1, opacity: beingDragged ? 0.35 : 1, boxSizing: "border-box",
                  }}
                  onClick={(e) => { e.stopPropagation(); onSelect({ kind: "section", sectionId: section.id }); }}
                >
                  {/* Row tab: select, drag or manage the whole row */}
                  <div
                    className={`absolute left-0 z-30 flex items-center gap-0.5 rounded-t bg-[#2F81FF] px-1 py-0.5 ${
                      sectionSelected ? "flex" : "hidden group-hover/section:flex"
                    }`}
                    style={{ top: -22 }}
                  >
                    <DragHandle title="Drag to move this row" onDragStart={(e) => beginDrag(e, { kind: "section", index: sectionIndex })} onDragEnd={endDrag} />
                    <button
                      type="button"
                      className="px-1 text-[10px] font-semibold text-white"
                      onClick={(e) => { e.stopPropagation(); onSelect({ kind: "section", sectionId: section.id }); }}
                    >
                      {s.name || (section.columns.length > 1 ? `${section.columns.length} columns` : "Row")}
                    </button>
                    {sectionSelected && (
                      <>
                        <ToolButton title="Move row up" disabled={sectionIndex === 0} onClick={() => onMoveSection(sectionIndex, sectionIndex - 1)}>↑</ToolButton>
                        <ToolButton title="Move row down" disabled={sectionIndex === sections.length - 1} onClick={() => onMoveSection(sectionIndex, sectionIndex + 2)}>↓</ToolButton>
                        <ToolButton title="Duplicate row" onClick={() => onDuplicateSection(section.id)}>Dup</ToolButton>
                        <ToolButton title="Delete row" onClick={() => onDeleteSection(section.id)}>Del</ToolButton>
                      </>
                    )}
                  </div>

                  <div
                    style={{
                      display: "grid", gap: s.gap, alignItems: "stretch",
                      gridTemplateColumns: stacked ? "minmax(0, 1fr)" : section.columns.map((c) => `minmax(0, ${c.width}fr)`).join(" "),
                    }}
                  >
                    {section.columns.map((column) => {
                      const columnTarget = target?.kind === "column" && target.columnId === column.id ? target : null;
                      return (
                        <div
                          key={column.id}
                          data-column={column.id}
                          onDragOver={(e) => handleColumnDragOver(e, section, column.id)}
                          style={{
                            backgroundColor: column.backgroundColor === "transparent" ? undefined : column.backgroundColor,
                            padding: column.padding || undefined, borderRadius: column.borderRadius || undefined,
                            display: "flex", flexDirection: "column", minWidth: 0,
                            justifyContent: column.verticalAlign === "middle" ? "center" : column.verticalAlign === "bottom" ? "flex-end" : "flex-start",
                            outline: section.columns.length > 1 && (sectionActive || dragging) ? "1px dashed rgba(47,129,255,0.4)" : undefined,
                            outlineOffset: -1,
                          }}
                        >
                          {column.blocks.length === 0 && (
                            <div
                              className="flex items-center justify-center text-center text-[11px]"
                              style={{
                                minHeight: 64, margin: 4, border: `1px dashed ${columnTarget ? "#00D084" : "#c5c9d0"}`, borderRadius: 6,
                                color: columnTarget ? "#00a868" : "#9aa1ac", background: columnTarget ? "rgba(0,208,132,0.08)" : "rgba(0,0,0,0.02)",
                                fontFamily: "Arial, sans-serif",
                              }}
                            >
                              Drop content here
                            </div>
                          )}

                          {column.blocks.map((block, blockIndex) => {
                            const isSelected = selectedBlockId === block.id;
                            const link = getBlockLink(block);
                            const isDragged = drag?.kind === "block" && drag.blockId === block.id;
                            return (
                              <React.Fragment key={block.id}>
                                {columnTarget?.index === blockIndex && <DropLine />}
                                <div
                                  data-block={block.id}
                                  className="group/block relative"
                                  style={{ outline: isSelected ? "2px solid #00D084" : undefined, outlineOffset: -1, opacity: isDragged ? 0.35 : 1 }}
                                  onClick={(e) => { e.stopPropagation(); onSelect({ kind: "block", sectionId: section.id, blockId: block.id }); }}
                                >
                                  {!isSelected && (
                                    <div className="pointer-events-none absolute inset-0 z-10 opacity-0 ring-1 ring-inset ring-[#00D084]/50 group-hover/block:opacity-100" />
                                  )}

                                  {isSelected && (
                                    <div className="absolute right-0 z-30 flex items-center gap-0.5 rounded-t bg-black/90 px-1 py-0.5" style={{ top: -22 }}>
                                      <DragHandle title="Drag to move this block" onDragStart={(e) => beginDrag(e, { kind: "block", blockId: block.id })} onDragEnd={endDrag} />
                                      <ToolButton title="Move up" disabled={blockIndex === 0} onClick={() => onShiftBlock(block.id, -1)}>↑</ToolButton>
                                      <ToolButton title="Move down" disabled={blockIndex === column.blocks.length - 1} onClick={() => onShiftBlock(block.id, 1)}>↓</ToolButton>
                                      {link && (
                                        <>
                                          <div className="mx-0.5 h-3 w-px bg-white/10" />
                                          <button
                                            type="button"
                                            title={hasRealLink(link.value) ? `${link.label}: ${link.value}` : `Add a link (${link.label.toLowerCase()})`}
                                            onClick={(e) => { e.stopPropagation(); setLinkEditor(linkEditor === block.id ? null : block.id); }}
                                            className={`flex h-5 items-center gap-1 rounded px-1.5 text-[10px] font-medium ${
                                              hasRealLink(link.value) ? "text-[#00D084] hover:bg-[#00D084]/15" : "text-amber-300 hover:bg-amber-400/15"
                                            }`}
                                          >
                                            🔗 {hasRealLink(link.value) ? "Link" : "Add link"}
                                          </button>
                                        </>
                                      )}
                                      <div className="mx-0.5 h-3 w-px bg-white/10" />
                                      <ToolButton title="Duplicate" onClick={() => onDuplicateBlock(block.id)}>Dup</ToolButton>
                                      <ToolButton title="Delete" danger onClick={() => onDeleteBlock(block.id)}>Del</ToolButton>
                                    </div>
                                  )}

                                  {isSelected && link && linkEditor === block.id && (
                                    <LinkPopover
                                      label={link.label}
                                      value={link.value}
                                      onSave={(url) => { if (url !== link.value) onUpdateBlock({ ...block, [link.field]: url } as EmailBlock); }}
                                      onClose={() => setLinkEditor(null)}
                                    />
                                  )}

                                  <BlockRenderer block={block} selected={isSelected} onChange={onUpdateBlock} />
                                </div>
                              </React.Fragment>
                            );
                          })}
                          {columnTarget && column.blocks.length > 0 && columnTarget.index === column.blocks.length && <DropLine />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {target?.kind === "gap" && target.index === sectionIndex + 1 && <DropLine />}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
