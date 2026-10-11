// The email format itself (blocks, sections, columns, settings) is defined once
// in lib/emailCore and shared with the backend. This file re-exports it and
// adds the types that only the editor UI needs.

import type {
  BaseBlock, BlockType, EmailBlock, EmailSection, EmailSettings, FontWeight, TextAlign,
} from "@/lib/emailCore/schema";

export type {
  BaseBlock, BlockType, BorderStyle, ButtonBlock, CtaBlock, DividerBlock, EmailBlock, EmailColumn, EmailDocument,
  EmailSection, EmailSettings, FeatureBlock, FontWeight, FooterBlock, HeadingBlock, HeroBlock, HtmlBlock, IconItem,
  IconsBlock, ImageBlock, LogoBlock, MenuBlock, MenuLink, ProductBlock, SectionSettings, SocialBlock, SocialIcon,
  SocialPlatform, SpacerBlock, TextAlign, TextBlock, VideoBlock,
} from "@/lib/emailCore/schema";

// ─── Email Design (editor state) ──────────────────────────────────────────────

export interface EmailDesign {
  id: string;
  name: string;
  sections: EmailSection[];
  settings: EmailSettings;
  createdAt: string;
  updatedAt: string;
}

// ─── Legacy flat blocks ───────────────────────────────────────────────────────
// Before sections existed, columns were special blocks holding plain text
// cells. The HTML importer still emits them; normalizeDocument converts them.

export interface ColumnCell {
  id: string;
  content: string;
  fontSize: number;
  color: string;
  fontFamily: string;
  textAlign: TextAlign;
  fontWeight: FontWeight;
}

type LegacyBase = Omit<BaseBlock, "type" | "borderWidth" | "borderColor" | "borderStyle" | "cornerRadius">;

export interface Columns2Block extends LegacyBase {
  type: "columns2";
  columns: [ColumnCell, ColumnCell];
  gap: number;
}

export interface Columns3Block extends LegacyBase {
  type: "columns3";
  columns: [ColumnCell, ColumnCell, ColumnCell];
  gap: number;
}

export type LegacyEmailBlock = EmailBlock | Columns2Block | Columns3Block;

// ─── Editor UI ────────────────────────────────────────────────────────────────

export type PreviewMode = "desktop" | "tablet" | "mobile";

export type SidebarTab = "blocks" | "templates" | "settings";

/** What is selected on the canvas. A block selection also identifies its section. */
export type Selection =
  | { kind: "section"; sectionId: string }
  | { kind: "block"; sectionId: string; blockId: string }
  | null;

/** Things that can be dragged from the sidebar onto the canvas. */
export type PaletteItem =
  | { kind: "block"; type: BlockType }
  | { kind: "layout"; widths: number[] }
  | { kind: "preset"; preset: string };

export type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";
