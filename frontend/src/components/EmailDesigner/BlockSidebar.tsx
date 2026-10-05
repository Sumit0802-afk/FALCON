import React, { useState } from "react";
import { EmailBlock, BlockType } from "@/types/email";

// ─── Sidebar Category Types ───────────────────────────────────────────────────

interface BlockEntry {
  type: BlockType;
  label: string;
  icon: string;
  description: string;
}

const BASIC_BLOCKS: BlockEntry[] = [
  { type: "text",    label: "Text",        icon: "T",  description: "Paragraph text" },
  { type: "heading", label: "Heading",     icon: "H",  description: "H1, H2, H3 heading" },
  { type: "image",   label: "Image",       icon: "🖼", description: "Image with link" },
  { type: "button",  label: "Button",      icon: "◉",  description: "CTA button" },
  { type: "divider", label: "Divider",     icon: "—",  description: "Horizontal rule" },
  { type: "spacer",  label: "Spacer",      icon: "↕",  description: "Vertical space" },
  { type: "social",  label: "Social",      icon: "🔗", description: "Social icon links" },
  { type: "logo",    label: "Logo",        icon: "⬡",  description: "Brand logo" },
  { type: "html",    label: "HTML",        icon: "<>", description: "Custom HTML" },
];

const LAYOUT_BLOCKS: BlockEntry[] = [
  { type: "columns2", label: "2 Columns",  icon: "⫿", description: "Two equal columns" },
  { type: "columns3", label: "3 Columns",  icon: "⫿⫿", description: "Three equal columns" },
];

const MARKETING_BLOCKS: BlockEntry[] = [
  { type: "hero",         label: "Hero",         icon: "◈", description: "Full-width hero section" },
  { type: "feature",      label: "Feature",      icon: "★", description: "Image + text feature" },
  { type: "product",      label: "Product Card", icon: "🛍", description: "Product with buy button" },
  { type: "cta",          label: "CTA",          icon: "🎯", description: "Call to action block" },
  { type: "footer_block", label: "Footer",       icon: "⬚", description: "Email footer" },
];

// ─── Draggable Block Item ──────────────────────────────────────────────────────

interface BlockItemProps {
  entry: BlockEntry;
  onDragStart: (type: BlockType) => void;
}

function BlockItem({ entry, onDragStart }: BlockItemProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(entry.type)}
      className="group flex cursor-grab items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 transition-all hover:border-[#00D084]/30 hover:bg-[#00D084]/[0.05] active:cursor-grabbing"
      title={entry.description}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-white/[0.05] font-mono text-[11px] text-zinc-300 group-hover:bg-[#00D084]/20 group-hover:text-[#00D084]">
        {entry.icon}
      </span>
      <div>
        <div className="text-[12px] font-medium text-zinc-200 group-hover:text-white">{entry.label}</div>
        <div className="text-[10px] text-zinc-500 group-hover:text-zinc-400">{entry.description}</div>
      </div>
    </div>
  );
}

// ─── Main BlockSidebar ────────────────────────────────────────────────────────

interface BlockSidebarProps {
  onBlockAdd: (block: EmailBlock, insertIndex?: number) => void;
  onDragBlockType: (type: BlockType | null) => void;
  onDesignByHtml?: () => void;
}

export default function BlockSidebar({
  onBlockAdd,
  onDragBlockType,
  onDesignByHtml,
}: BlockSidebarProps) {
  const [search, setSearch] = useState("");

  const handleDragStart = (type: BlockType) => {
    onDragBlockType(type);
  };

  const handleDragEnd = () => {
    onDragBlockType(null);
  };

  const filterEntries = (entries: BlockEntry[]) =>
    search
      ? entries.filter(
          (e) =>
            e.label.toLowerCase().includes(search.toLowerCase()) ||
            e.description.toLowerCase().includes(search.toLowerCase())
        )
      : entries;

  const basicFiltered    = filterEntries(BASIC_BLOCKS);
  const layoutFiltered   = filterEntries(LAYOUT_BLOCKS);
  const marketingFiltered = filterEntries(MARKETING_BLOCKS);

  return (
    <div className="flex h-full flex-col overflow-hidden" onDragEnd={handleDragEnd}>
      {/* ─── FEATURED RED CARD: DESIGN BY HTML (Section 2 & 24) ─── */}
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
        {/* Basic */}
        {basicFiltered.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 px-1 font-mono text-[9px] font-semibold uppercase tracking-widest text-zinc-500">
              Basic
            </div>
            <div className="space-y-1.5">
              {basicFiltered.map((entry) => (
                <BlockItem
                  key={entry.type}
                  entry={entry}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>
          </div>
        )}

        {/* Layout */}
        {layoutFiltered.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 px-1 font-mono text-[9px] font-semibold uppercase tracking-widest text-zinc-500">
              Layout
            </div>
            <div className="space-y-1.5">
              {layoutFiltered.map((entry) => (
                <BlockItem
                  key={entry.type}
                  entry={entry}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>
          </div>
        )}

        {/* Marketing */}
        {marketingFiltered.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 px-1 font-mono text-[9px] font-semibold uppercase tracking-widest text-zinc-500">
              Marketing
            </div>
            <div className="space-y-1.5">
              {marketingFiltered.map((entry) => (
                <BlockItem
                  key={entry.type}
                  entry={entry}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>
          </div>
        )}

        {basicFiltered.length === 0 &&
          layoutFiltered.length === 0 &&
          marketingFiltered.length === 0 && (
            <div className="py-8 text-center text-[12px] text-zinc-600">
              No blocks match "{search}"
            </div>
          )}
      </div>
    </div>
  );
}
