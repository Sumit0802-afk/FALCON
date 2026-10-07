/**
 * Pure editing operations on an email's sections. Every function returns a new
 * array and leaves its input untouched, which is what makes undo/redo a matter
 * of keeping previous arrays around.
 */
import { EmailBlock, EmailColumn, EmailSection, SectionSettings } from "@/types/email";
import { balanceWidths, cloneBlock, cloneSection, createColumn } from "@/lib/emailCore/schema";

export interface BlockLocation {
  sectionIndex: number;
  columnIndex: number;
  blockIndex: number;
  section: EmailSection;
  column: EmailColumn;
  block: EmailBlock;
}

/** Where a block should land: a position inside a specific column. */
export interface BlockTarget {
  sectionId: string;
  columnId: string;
  index: number;
}

export const MAX_COLUMNS = 4;

export function findBlock(sections: EmailSection[], blockId: string): BlockLocation | null {
  for (let s = 0; s < sections.length; s++) {
    for (let c = 0; c < sections[s].columns.length; c++) {
      const b = sections[s].columns[c].blocks.findIndex((block) => block.id === blockId);
      if (b !== -1) {
        const column = sections[s].columns[c];
        return { sectionIndex: s, columnIndex: c, blockIndex: b, section: sections[s], column, block: column.blocks[b] };
      }
    }
  }
  return null;
}

function mapColumn(sections: EmailSection[], sectionId: string, columnId: string, fn: (column: EmailColumn) => EmailColumn): EmailSection[] {
  return sections.map((section) =>
    section.id !== sectionId
      ? section
      : { ...section, columns: section.columns.map((column) => (column.id === columnId ? fn(column) : column)) }
  );
}

// ─── Blocks ───────────────────────────────────────────────────────────────────

export function updateBlock(sections: EmailSection[], updated: EmailBlock): EmailSection[] {
  const at = findBlock(sections, updated.id);
  if (!at) return sections;
  return mapColumn(sections, at.section.id, at.column.id, (column) => ({
    ...column,
    blocks: column.blocks.map((block) => (block.id === updated.id ? updated : block)),
  }));
}

export function insertBlock(sections: EmailSection[], target: BlockTarget, block: EmailBlock): EmailSection[] {
  return mapColumn(sections, target.sectionId, target.columnId, (column) => {
    const blocks = [...column.blocks];
    blocks.splice(Math.max(0, Math.min(target.index, blocks.length)), 0, block);
    return { ...column, blocks };
  });
}

export function removeBlock(sections: EmailSection[], blockId: string): EmailSection[] {
  const at = findBlock(sections, blockId);
  if (!at) return sections;
  return mapColumn(sections, at.section.id, at.column.id, (column) => ({
    ...column,
    blocks: column.blocks.filter((block) => block.id !== blockId),
  }));
}

export function duplicateBlock(sections: EmailSection[], blockId: string): { sections: EmailSection[]; copy: EmailBlock | null } {
  const at = findBlock(sections, blockId);
  if (!at) return { sections, copy: null };
  const copy = cloneBlock(at.block);
  return {
    sections: insertBlock(sections, { sectionId: at.section.id, columnId: at.column.id, index: at.blockIndex + 1 }, copy),
    copy,
  };
}

/** Moves a block to any column. Accounts for the gap its own removal leaves behind. */
export function moveBlock(sections: EmailSection[], blockId: string, target: BlockTarget): EmailSection[] {
  const at = findBlock(sections, blockId);
  if (!at) return sections;
  const sameColumn = at.section.id === target.sectionId && at.column.id === target.columnId;
  if (sameColumn && (target.index === at.blockIndex || target.index === at.blockIndex + 1)) return sections;
  const index = sameColumn && target.index > at.blockIndex ? target.index - 1 : target.index;
  return insertBlock(removeBlock(sections, blockId), { ...target, index }, at.block);
}

/** Nudges a block up or down within its column. */
export function shiftBlock(sections: EmailSection[], blockId: string, delta: -1 | 1): EmailSection[] {
  const at = findBlock(sections, blockId);
  if (!at) return sections;
  const to = at.blockIndex + delta;
  if (to < 0 || to >= at.column.blocks.length) return sections;
  return mapColumn(sections, at.section.id, at.column.id, (column) => {
    const blocks = [...column.blocks];
    const [moved] = blocks.splice(at.blockIndex, 1);
    blocks.splice(to, 0, moved);
    return { ...column, blocks };
  });
}

// ─── Sections ─────────────────────────────────────────────────────────────────

export function insertSections(sections: EmailSection[], index: number, added: EmailSection[]): EmailSection[] {
  const next = [...sections];
  next.splice(Math.max(0, Math.min(index, next.length)), 0, ...added);
  return next;
}

/** `to` is a gap position (0 = before the first section), as produced by a drop. */
export function moveSection(sections: EmailSection[], from: number, to: number): EmailSection[] {
  if (from < 0 || from >= sections.length || to === from || to === from + 1) return sections;
  const next = [...sections];
  const [moved] = next.splice(from, 1);
  next.splice(to > from ? to - 1 : to, 0, moved);
  return next;
}

export function removeSection(sections: EmailSection[], sectionId: string): EmailSection[] {
  return sections.filter((section) => section.id !== sectionId);
}

export function duplicateSection(sections: EmailSection[], sectionId: string): { sections: EmailSection[]; copy: EmailSection | null } {
  const index = sections.findIndex((section) => section.id === sectionId);
  if (index === -1) return { sections, copy: null };
  const copy = cloneSection(sections[index]);
  return { sections: insertSections(sections, index + 1, [copy]), copy };
}

export function updateSectionSettings(sections: EmailSection[], sectionId: string, patch: Partial<SectionSettings>): EmailSection[] {
  return sections.map((section) => (section.id === sectionId ? { ...section, settings: { ...section.settings, ...patch } } : section));
}

export function updateColumn(sections: EmailSection[], sectionId: string, columnId: string, patch: Partial<Omit<EmailColumn, "id" | "blocks">>): EmailSection[] {
  return mapColumn(sections, sectionId, columnId, (column) => ({ ...column, ...patch }));
}

// ─── Columns ──────────────────────────────────────────────────────────────────

/** Sets explicit column widths (percentages), normalised to total 100. */
export function setColumnWidths(sections: EmailSection[], sectionId: string, widths: number[]): EmailSection[] {
  return sections.map((section) => {
    if (section.id !== sectionId || widths.length !== section.columns.length) return section;
    const balanced = balanceWidths(widths.map((w) => Math.max(5, w)));
    return { ...section, columns: section.columns.map((column, i) => ({ ...column, width: balanced[i] })) };
  });
}

/** Appends an empty column, shrinking the others proportionally to make room. */
export function addColumn(sections: EmailSection[], sectionId: string): EmailSection[] {
  return sections.map((section) => {
    if (section.id !== sectionId || section.columns.length >= MAX_COLUMNS) return section;
    const share = 100 / (section.columns.length + 1);
    const widths = balanceWidths([...section.columns.map((c) => c.width * (1 - share / 100)), share]);
    const columns = [...section.columns, createColumn(share)];
    return { ...section, columns: columns.map((column, i) => ({ ...column, width: widths[i] })) };
  });
}

/** Removes a column. Its blocks move into the neighbouring column so nothing is lost. */
export function removeColumn(sections: EmailSection[], sectionId: string, columnId: string): EmailSection[] {
  return sections.map((section) => {
    if (section.id !== sectionId || section.columns.length <= 1) return section;
    const index = section.columns.findIndex((column) => column.id === columnId);
    if (index === -1) return section;
    const removed = section.columns[index];
    const heir = index === 0 ? 1 : index - 1;
    const columns = section.columns
      .map((column, i) => (i === heir ? { ...column, blocks: index === 0 ? [...removed.blocks, ...column.blocks] : [...column.blocks, ...removed.blocks] } : column))
      .filter((_column, i) => i !== index);
    const widths = balanceWidths(columns.map((c) => c.width));
    return { ...section, columns: columns.map((column, i) => ({ ...column, width: widths[i] })) };
  });
}

/** Drops sections that no longer hold any content (e.g. after their last block was dragged away). */
export function pruneEmptySections(sections: EmailSection[]): EmailSection[] {
  return sections.filter((section) => section.columns.some((column) => column.blocks.length > 0));
}

export function countAllBlocks(sections: EmailSection[]): number {
  return sections.reduce((sum, section) => sum + section.columns.reduce((n, column) => n + column.blocks.length, 0), 0);
}
