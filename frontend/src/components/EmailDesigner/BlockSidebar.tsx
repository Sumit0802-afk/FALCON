import React, { useState } from "react";
import { PaletteItem } from "@/types/email";

// ─── Palette Entries ──────────────────────────────────────────────────────────

interface PaletteEntry {
  id: string;
  item: PaletteItem;
  label: string;
  icon: string;
  description: string;
}

const block = (type: Extract<PaletteItem, { kind: "block" }>["type"], label: string, icon: string, description: string): PaletteEntry => ({
  id: `block-${type}`, item: { kind: "block", type }, label, icon, description,
});

const layout = (id: string, widths: number[], label: string, description: string): PaletteEntry => ({
  id: `layout-${id}`, item: { kind: "layout", widths }, label, icon: "", description,
});

const preset = (name: string, label: string, icon: string, description: string): PaletteEntry => ({
  id: `preset-${name}`, item: { kind: "preset", preset: name }, label, icon, description,
});

const CONTENT: PaletteEntry[] = [
  block("text", "Text", "T", "Paragraph text"),
  block("heading", "Heading", "H", "H1, H2, H3 heading"),
  block("image", "Image", "🖼", "Image with link"),
  block("button", "Button", "◉", "CTA button"),
  block("divider", "Divider", "—", "Horizontal rule"),
  block("spacer", "Spacer", "↕", "Vertical space"),
  block("social", "Social", "🔗", "Social profile links"),
  block("video", "Video", "▶", "Linked video poster"),
  block("logo", "Logo", "⬡", "Brand logo or wordmark"),
  block("icons", "Icons", "★", "Icon list with labels"),
  block("menu", "Menu", "≡", "Navigation links"),
  block("html", "HTML", "<>", "Custom HTML"),
];

const LAYOUTS: PaletteEntry[] = [
  layout("1", [100], "1 Column", "Full-width row"),
  layout("2", [50, 50], "2 Columns", "Two equal columns"),
  layout("3", [33.33, 33.33, 33.34], "3 Columns", "Three equal columns"),
  layout("4", [25, 25, 25, 25], "4 Columns", "Four equal columns"),
  layout("1-2", [33.33, 66.67], "1/3 + 2/3", "Narrow left, wide right"),
  layout("2-1", [66.67, 33.33], "2/3 + 1/3", "Wide left, narrow right"),
  layout("1-3", [25, 75], "1/4 + 3/4", "Sidebar left"),
  layout("3-1", [75, 25], "3/4 + 1/4", "Sidebar right"),
];

const BLOCKS: PaletteEntry[] = [
  preset("header", "Header", "▔", "Logo with navigation links"),
  block("hero", "Hero", "◈", "Full-width hero section"),
  preset("imageText", "Image + Text", "◧", "Picture beside copy"),
  block("feature", "Feature", "★", "Image + text feature"),
  block("product", "Product Card", "🛍", "Product with buy button"),
  preset("productRow", "Product Row", "▥", "Two products side by side"),
  block("cta", "CTA", "🎯", "Call to action block"),
  preset("footer", "Footer", "▁", "Social links and address"),
];

const GROUPS: { id: string; label: string; entries: PaletteEntry[] }[] = [
  { id: "content", label: "Content", entries: CONTENT },
  { id: "layout", label: "Layout", entries: LAYOUTS },
  { id: "blocks", label: "Blocks", entries: BLOCKS },
];

// ─── Draggable Items ──────────────────────────────────────────────────────────

interface ItemProps {
  entry: PaletteEntry;
  onDragStart: (item: PaletteItem) => void;
  onAdd: (item: PaletteItem) => void;
}

function startDrag(e: React.DragEvent, entry: PaletteEntry, onDragStart: (item: PaletteItem) => void) {
  e.dataTransfer.effectAllowed = "copy";
  e.dataTransfer.setData("text/plain", "falcon-email");
  onDragStart(entry.item);
}

/** Phones and tablets cannot drag from the palette, so there a single tap adds the item. */
function tapAdds(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 1023px), (pointer: coarse)").matches;
}

function BlockItem({ entry, onDragStart, onAdd }: ItemProps) {
  return (
    <div
      draggable
      onDragStart={(e) => startDrag(e, entry, onDragStart)}
      onClick={() => { if (tapAdds()) onAdd(entry.item); }}
      onDoubleClick={() => { if (!tapAdds()) onAdd(entry.item); }}
      className="group flex cursor-grab items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 transition-all hover:border-[#00D084]/30 hover:bg-[#00D084]/[0.05] active:cursor-grabbing"
      title={`${entry.description}. Drag onto the email, or double-click to add at the end.`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-white/[0.05] font-mono text-[11px] text-zinc-300 group-hover:bg-[#00D084]/20 group-hover:text-[#00D084]">
        {entry.icon}
      </span>
      <div className="min-w-0">
        <div className="text-[12px] font-medium text-zinc-200 group-hover:text-white">{entry.label}</div>
        <div className="truncate text-[10px] text-zinc-500 group-hover:text-zinc-400">{entry.description}</div>
      </div>
    </div>
  );
}

/** Layout rows preview their column proportions instead of using an icon. */
function LayoutItem({ entry, onDragStart, onAdd }: ItemProps) {
  const widths = entry.item.kind === "layout" ? entry.item.widths : [100];
  return (
    <div
      draggable
      onDragStart={(e) => startDrag(e, entry, onDragStart)}
      onClick={() => { if (tapAdds()) onAdd(entry.item); }}
      onDoubleClick={() => { if (!tapAdds()) onAdd(entry.item); }}
      className="group cursor-grab rounded-lg border border-white/[0.06] bg-white/[0.03] p-2 transition-all hover:border-[#00D084]/30 hover:bg-[#00D084]/[0.05] active:cursor-grabbing"
      title={`${entry.description}. Drag onto the email, or double-click to add at the end.`}
    >
      <div className="mb-1.5 flex h-7 gap-1">
        {widths.map((w, i) => (
          <div key={i} className="rounded-sm border border-dashed border-zinc-600 bg-white/[0.04] group-hover:border-[#00D084]/60" style={{ flex: w }} />
        ))}
      </div>
      <div className="text-center text-[10px] font-medium text-zinc-400 group-hover:text-white">{entry.label}</div>
    </div>
  );
}

// ─── Main BlockSidebar ────────────────────────────────────────────────────────

interface BlockSidebarProps {
  /** Adds the item at the end of the email (double-click) */
  onAdd: (item: PaletteItem) => void;
  /** Reports the palette item being dragged, or null when the drag ends */
  onDragItem: (item: PaletteItem | null) => void;
  onDesignByHtml?: () => void;
}

export default function BlockSidebar({ onAdd, onDragItem, onDesignByHtml }: BlockSidebarProps) {
  const [search, setSearch] = useState("");

  const term = search.trim().toLowerCase();
  const groups = GROUPS.map((group) => ({
    ...group,
    entries: term
      ? group.entries.filter((e) => e.label.toLowerCase().includes(term) || e.description.toLowerCase().includes(term))
      : group.entries,
  })).filter((group) => group.entries.length > 0);

  return (
    <div className="flex h-full flex-col overflow-hidden" onDragEnd={() => onDragItem(null)}>
      {/* ─── FEATURED RED CARD: DESIGN BY HTML ─── */}
      <div className="p-3 pb-2 shrink-0">
        <div
          onClick={onDesignByHtml}
          className="group relative cursor-pointer rounded-xl bg-[#0a0a0d] p-3.5 transition-all hover:bg-[#101014] active:scale-[0.99]"
          style={{
            border: "1px solid #FF4D4D",
            boxShadow: "0 0 16px rgba(255, 77, 77, 0.22)",
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-[#FF4D4D]/20 font-mono text-[10px] font-bold text-[#FF4D4D]">
              &lt;/&gt;
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white">
              DESIGN BY HTML
            </span>
          </div>

          <p className="text-[10px] leading-relaxed text-zinc-400 mb-3">
            Paste HTML code and turn it into an editable visual email template.
          </p>

          <div className="flex items-center justify-between text-[11px] font-bold text-[#FF4D4D] group-hover:text-[#ff6b6b]">
            <span>Design by HTML</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-2 shrink-0">
        <input
          type="text"
          placeholder="Search blocks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] text-zinc-300 placeholder-zinc-600 outline-none focus:border-[#00D084]/40 focus:bg-white/[0.06]"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.id} className="mb-4">
            <div className="mb-2 px-1 font-mono text-[9px] font-semibold uppercase tracking-widest text-zinc-500">
              {group.label}
            </div>
            {group.id === "layout" ? (
              <div className="grid grid-cols-2 gap-1.5">
                {group.entries.map((entry) => (
                  <LayoutItem key={entry.id} entry={entry} onDragStart={onDragItem} onAdd={onAdd} />
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {group.entries.map((entry) => (
                  <BlockItem key={entry.id} entry={entry} onDragStart={onDragItem} onAdd={onAdd} />
                ))}
              </div>
            )}
          </div>
        ))}

        {groups.length === 0 && (
          <div className="py-8 text-center text-[12px] text-zinc-600">
            No blocks match "{search}"
          </div>
        )}
      </div>
    </div>
  );
}
