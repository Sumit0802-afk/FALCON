import {
  BlockType, EmailBlock, EmailDesign, EmailDocument, EmailSection, EmailSettings, LegacyEmailBlock,
} from "@/types/email";
import {
  DEFAULT_EMAIL_SETTINGS as CORE_DEFAULT_SETTINGS, EMAIL_SCHEMA_VERSION, createBlock as coreCreateBlock,
  createSection, normalizeDocument,
} from "@/lib/emailCore/schema";
import { renderEmailHtml } from "@/lib/emailCore/renderHtml";
import { generateId } from "@/utils/id";

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = CORE_DEFAULT_SETTINGS;

// ─── Factories ────────────────────────────────────────────────────────────────

export function createBlock(type: BlockType): EmailBlock {
  return coreCreateBlock(type);
}

/** A full-width row holding the given blocks. */
export function wrapInSection(blocks: EmailBlock[]): EmailSection {
  return createSection([100], [blocks]);
}

/** Ready-made rows offered in the sidebar. Each is ordinary, fully editable content. */
export const SECTION_PRESETS: Record<string, { label: string; description: string; build: () => EmailSection[] }> = {
  header: {
    label: "Header",
    description: "Logo with navigation links",
    build: () => [
      createSection(
        [40, 60],
        [
          [coreCreateBlock("logo", { alignment: "left", paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 })],
          [coreCreateBlock("menu", { alignment: "right", paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 })],
        ],
        { name: "Header", paddingTop: 24, paddingBottom: 24, paddingLeft: 32, paddingRight: 32, stackOnMobile: false }
      ),
    ],
  },
  footer: {
    label: "Footer",
    description: "Social links, address and unsubscribe",
    build: () => [
      createSection(
        [100],
        [[coreCreateBlock("social", { paddingBottom: 8 }), coreCreateBlock("footer_block", { paddingTop: 8 })]],
        { name: "Footer", backgroundColor: "#f6f6f6", paddingTop: 16, paddingBottom: 16 }
      ),
    ],
  },
  imageText: {
    label: "Image + Text",
    description: "Picture beside a heading, copy and button",
    build: () => [
      createSection(
        [50, 50],
        [
          [coreCreateBlock("image", { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, borderRadius: 6 })],
          [
            coreCreateBlock("heading", { fontSize: 22, paddingTop: 0, paddingBottom: 8, paddingLeft: 0, paddingRight: 0 }),
            coreCreateBlock("text", { fontSize: 14, paddingTop: 0, paddingBottom: 12, paddingLeft: 0, paddingRight: 0 }),
            coreCreateBlock("button", { alignment: "left", paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }),
          ],
        ],
        { name: "Image + Text", paddingTop: 24, paddingBottom: 24, paddingLeft: 24, paddingRight: 24, gap: 24 }
      ),
    ],
  },
  productRow: {
    label: "Product Row",
    description: "Two products side by side",
    build: () => [
      createSection(
        [50, 50],
        [[coreCreateBlock("product", { paddingLeft: 0, paddingRight: 0 })], [coreCreateBlock("product", { paddingLeft: 0, paddingRight: 0 })]],
        { name: "Products", paddingTop: 16, paddingBottom: 16, paddingLeft: 24, paddingRight: 24, gap: 24 }
      ),
    ],
  },
};

// ─── Design ⇄ document ────────────────────────────────────────────────────────

export function newEmailDesign(): EmailDesign {
  const now = new Date().toISOString();
  return {
    id: generateId("email"),
    name: "Untitled Email",
    sections: [wrapInSection([createBlock("heading"), createBlock("text"), createBlock("button")])],
    settings: { ...DEFAULT_EMAIL_SETTINGS },
    createdAt: now,
    updatedAt: now,
  };
}

export function designToDocument(design: Pick<EmailDesign, "sections" | "settings">): EmailDocument {
  return {
    version: EMAIL_SCHEMA_VERSION,
    document: { type: "email", settings: design.settings },
    blocks: design.sections,
  };
}

/**
 * Reads anything the editor may be handed (a saved design, a stored document,
 * or the old flat-block format) and returns validated sections and settings.
 */
export function readDesignData(raw: unknown): { sections: EmailSection[]; settings: EmailSettings } {
  const source = raw as { sections?: unknown; blocks?: unknown; settings?: unknown; document?: unknown } | null;
  const input =
    source && source.sections !== undefined && source.document === undefined
      ? { version: EMAIL_SCHEMA_VERSION, document: { type: "email", settings: source.settings }, blocks: source.sections }
      : raw;
  const doc = normalizeDocument(input);
  return { sections: doc.blocks, settings: doc.document.settings };
}

/** Converts the flat block list produced by the HTML importer into sections. */
export function legacyBlocksToSections(blocks: LegacyEmailBlock[]): EmailSection[] {
  return normalizeDocument({ blocks }).blocks;
}

// ─── Links ────────────────────────────────────────────────────────────────────

/** The field that holds each block type's destination URL, with the wording used for it in the editor. */
export const BLOCK_LINKS: Partial<Record<BlockType, { field: string; label: string }>> = {
  button: { field: "linkUrl", label: "Button link" },
  image: { field: "linkUrl", label: "Image link" },
  logo: { field: "linkUrl", label: "Logo link" },
  video: { field: "videoUrl", label: "Video link" },
  hero: { field: "buttonUrl", label: "Button link" },
  cta: { field: "buttonUrl", label: "Button link" },
  product: { field: "buttonUrl", label: "Button link" },
};

export function getBlockLink(block: EmailBlock): { field: string; label: string; value: string } | null {
  const link = BLOCK_LINKS[block.type];
  if (!link) return null;
  const value = (block as unknown as Record<string, unknown>)[link.field];
  return { ...link, value: typeof value === "string" ? value : "" };
}

/** True when a block links somewhere real ("#" and empty are placeholders). */
export function hasRealLink(url: string): boolean {
  const value = url.trim();
  return value !== "" && value !== "#";
}

/** Adds the missing "https://" to something like "example.com/sale"; leaves complete links alone. */
export function normalizeLink(input: string): string {
  const value = input.trim();
  if (!value) return "";
  if (/^(https?:|mailto:|tel:|sms:|#|\/|\{\{)/i.test(value)) return value;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`;
  return `https://${value}`;
}

// ─── HTML Export ──────────────────────────────────────────────────────────────

export function exportEmailHtml(design: EmailDesign): string {
  return renderEmailHtml(designToDocument(design), { title: design.name });
}
