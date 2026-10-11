import {
  LegacyEmailBlock as EmailBlock,
  EmailSettings,
  HeadingBlock,
  TextBlock,
  ImageBlock,
  ButtonBlock,
  DividerBlock,
  SpacerBlock,
  HtmlBlock,
  Columns2Block,
  Columns3Block,
  ColumnCell,
  TextAlign,
  FontWeight,
} from "@/types/email";
import { generateId } from "@/utils/id";
import { DEFAULT_EMAIL_SETTINGS } from "@/utils/emailUtils";

// ─── Style Extraction Helpers ──────────────────────────────────────────────────

function parsePx(value: string | null | undefined, fallback = 0): number {
  if (!value) return fallback;
  const match = value.match(/(-?[\d.]+)/);
  if (!match) return fallback;
  const num = parseFloat(match[1]);
  if (value.includes("pt")) return Math.round(num * 1.333);
  if (value.includes("rem") || value.includes("em")) return Math.round(num * 16);
  return Math.round(num);
}

function parsePadding(el: HTMLElement) {
  const style = el.style;
  const pTop = parsePx(style.paddingTop, parsePx(style.padding, 16));
  const pBottom = parsePx(style.paddingBottom, parsePx(style.padding, 16));
  const pLeft = parsePx(style.paddingLeft, parsePx(style.padding, 24));
  const pRight = parsePx(style.paddingRight, parsePx(style.padding, 24));
  return {
    paddingTop: Math.max(0, pTop),
    paddingBottom: Math.max(0, pBottom),
    paddingLeft: Math.max(0, pLeft),
    paddingRight: Math.max(0, pRight),
  };
}

function parseTextAlign(val: string | null | undefined): TextAlign {
  if (!val) return "left";
  const lower = val.toLowerCase().trim();
  if (lower === "center") return "center";
  if (lower === "right") return "right";
  return "left";
}

function parseFontWeight(val: string | null | undefined): FontWeight {
  if (!val) return "normal";
  const lower = val.toLowerCase().trim();
  if (lower === "bold" || lower === "700" || lower === "800" || lower === "900") return "bold";
  if (lower === "600") return "600";
  return "normal";
}

function parseColor(val: string | null | undefined, fallback: string): string {
  if (!val || val === "inherit" || val === "initial") return fallback;
  return val.trim();
}

// ─── Main HTML to Blocks Converter ───────────────────────────────────────────

export interface ParsedEmailResult {
  blocks: EmailBlock[];
  settings: Partial<EmailSettings>;
}

export function parseHtmlToEmailBlocks(htmlString: string): ParsedEmailResult {
  if (typeof window === "undefined") {
    return {
      blocks: [],
      settings: {},
    };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const settings: Partial<EmailSettings> = {};

  // Extract title/subject
  const titleEl = doc.querySelector("title");
  if (titleEl && titleEl.textContent && titleEl.textContent.trim()) {
    settings.subject = titleEl.textContent.trim();
  }

  // Extract body styles
  const body = doc.body;
  if (body) {
    if (body.style.backgroundColor) {
      settings.backgroundColor = body.style.backgroundColor;
    }
    if (body.style.fontFamily) {
      settings.defaultFont = body.style.fontFamily;
    }
  }

  // Extract container table if present
  const mainTable = doc.querySelector("table.email-container, table[width]");
  if (mainTable instanceof HTMLElement) {
    const widthAttr = mainTable.getAttribute("width") || mainTable.style.width;
    if (widthAttr) {
      const parsedWidth = parsePx(widthAttr);
      if (parsedWidth >= 320 && parsedWidth <= 900) {
        settings.emailWidth = parsedWidth;
      }
    }
    if (mainTable.style.backgroundColor) {
      settings.contentBackground = mainTable.style.backgroundColor;
    }
  }

  const blocks: EmailBlock[] = [];

  function processNode(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text && text.length > 0) {
        blocks.push({
          id: generateId("blk_txt"),
          type: "text",
          content: text,
          fontSize: 16,
          fontFamily: settings.defaultFont || DEFAULT_EMAIL_SETTINGS.defaultFont,
          fontWeight: "normal",
          color: "#333333",
          textAlign: "left",
          lineHeight: 1.6,
          letterSpacing: 0,
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 24,
          paddingRight: 24,
          backgroundColor: "transparent",
        } as TextBlock);
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as HTMLElement;
    const tagName = el.tagName.toLowerCase();

    // Ignore script, style, head, meta, noscript
    if (["script", "style", "meta", "link", "title", "head", "noscript"].includes(tagName)) {
      return;
    }

    // Preheader special case
    if (el.getAttribute("style")?.includes("max-height:0") || el.getAttribute("style")?.includes("font-size:1px")) {
      const preheaderText = el.textContent?.trim();
      if (preheaderText) {
        settings.preheader = preheaderText;
        return;
      }
    }

    const { paddingTop, paddingBottom, paddingLeft, paddingRight } = parsePadding(el);
    const bg = el.style.backgroundColor && el.style.backgroundColor !== "transparent"
      ? el.style.backgroundColor
      : "transparent";

    // ── Headings ──
    if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tagName)) {
      const level = tagName === "h1" ? 1 : tagName === "h2" ? 2 : 3;
      const defaultFontSize = level === 1 ? 32 : level === 2 ? 24 : 20;
      const fontSize = parsePx(el.style.fontSize, defaultFontSize);
      const textAlign = parseTextAlign(el.style.textAlign || el.getAttribute("align"));
      const color = parseColor(el.style.color, "#111111");
      const fontFamily = el.style.fontFamily || settings.defaultFont || DEFAULT_EMAIL_SETTINGS.defaultFont;
      const fontWeight = parseFontWeight(el.style.fontWeight || "bold");
      const lineHeight = parseFloat(el.style.lineHeight) || 1.3;

      blocks.push({
        id: generateId("blk_hd"),
        type: "heading",
        content: el.innerText?.trim() || el.textContent?.trim() || "Heading",
        level: level as 1 | 2 | 3,
        fontSize,
        fontFamily,
        fontWeight,
        color,
        textAlign,
        lineHeight,
        paddingTop: Math.max(paddingTop, 16),
        paddingBottom: Math.max(paddingBottom, 12),
        paddingLeft,
        paddingRight,
        backgroundColor: bg,
      } as HeadingBlock);
      return;
    }

    // ── Paragraph / Text ──
    if (tagName === "p") {
      // Check if this paragraph only contains a button-style anchor
      const firstChild = el.firstElementChild;
      if (
        firstChild &&
        firstChild.tagName.toLowerCase() === "a" &&
        el.children.length === 1 &&
        (firstChild.getAttribute("style")?.includes("background") ||
          firstChild.getAttribute("style")?.includes("padding"))
      ) {
        processNode(firstChild);
        return;
      }

      const fontSize = parsePx(el.style.fontSize, 16);
      const textAlign = parseTextAlign(el.style.textAlign || el.getAttribute("align"));
      const color = parseColor(el.style.color, "#333333");
      const fontFamily = el.style.fontFamily || settings.defaultFont || DEFAULT_EMAIL_SETTINGS.defaultFont;
      const fontWeight = parseFontWeight(el.style.fontWeight);
      const lineHeight = parseFloat(el.style.lineHeight) || 1.6;
      const letterSpacing = parsePx(el.style.letterSpacing, 0);

      // Clean HTML preserving line breaks and basic formatting
      const content = el.innerHTML
        .replace(/<br\s*[\/]?>/gi, "\n")
        .replace(/&nbsp;/g, " ")
        .replace(/<[^>]+>/g, (tag) => {
          // Allow bold/strong/em/i/a in text content
          if (/^<\/?(b|strong|i|em|a|span)[\s>]/i.test(tag)) return tag;
          return "";
        })
        .trim();

      if (content) {
        blocks.push({
          id: generateId("blk_txt"),
          type: "text",
          content,
          fontSize,
          fontFamily,
          fontWeight,
          color,
          textAlign,
          lineHeight,
          letterSpacing,
          paddingTop: Math.max(paddingTop, 12),
          paddingBottom: Math.max(paddingBottom, 12),
          paddingLeft,
          paddingRight,
          backgroundColor: bg,
        } as TextBlock);
      }
      return;
    }

    // ── Image ──
    if (tagName === "img") {
      const src = el.getAttribute("src") || "";
      const alt = el.getAttribute("alt") || "Image";
      const widthVal = el.getAttribute("width") || el.style.width || "100%";
      const width = widthVal === "100%" ? "100%" : parsePx(widthVal, 500);
      const borderRadius = parsePx(el.style.borderRadius, 0);
      const parent = el.parentElement;
      const linkUrl = parent && parent.tagName.toLowerCase() === "a" ? (parent.getAttribute("href") || "") : "";
      const alignment = parseTextAlign(el.style.textAlign || el.getAttribute("align") || parent?.style.textAlign);

      blocks.push({
        id: generateId("blk_img"),
        type: "image",
        src,
        alt,
        width,
        borderRadius,
        alignment,
        linkUrl,
        paddingTop: Math.max(paddingTop, 16),
        paddingBottom: Math.max(paddingBottom, 16),
        paddingLeft,
        paddingRight,
        backgroundColor: bg,
      } as ImageBlock);
      return;
    }

    // ── Button / Link ──
    if (tagName === "a") {
      const href = el.getAttribute("href") || "#";
      const text = el.textContent?.trim() || "Click Here";
      const btnBg = parseColor(el.style.backgroundColor, "#000000");
      const textColor = parseColor(el.style.color, "#ffffff");
      const fontSize = parsePx(el.style.fontSize, 14);
      const borderRadius = parsePx(el.style.borderRadius, 6);
      const parent = el.parentElement;
      const alignment = parseTextAlign(el.style.textAlign || parent?.style.textAlign || "center");
      const fontWeight = parseFontWeight(el.style.fontWeight || "bold");

      blocks.push({
        id: generateId("blk_btn"),
        type: "button",
        text,
        linkUrl: href,
        bgColor: btnBg,
        textColor,
        fontSize,
        borderRadius,
        alignment,
        width: "auto",
        fontWeight,
        paddingTop: Math.max(paddingTop, 16),
        paddingBottom: Math.max(paddingBottom, 16),
        paddingLeft,
        paddingRight,
        backgroundColor: bg,
      } as ButtonBlock);
      return;
    }

    // ── Divider ──
    if (tagName === "hr") {
      const borderTop = el.style.borderTop || el.style.border || "";
      const styleMatch = borderTop.match(/(solid|dashed|dotted)/);
      const style = (styleMatch ? styleMatch[1] : "solid") as "solid" | "dashed" | "dotted";
      const thickness = parsePx(el.style.borderTopWidth || el.style.height, 1);
      const color = parseColor(el.style.borderColor || el.style.color, "#e0e0e0");

      blocks.push({
        id: generateId("blk_div"),
        type: "divider",
        color,
        thickness: Math.max(1, thickness),
        style,
        paddingTop: Math.max(paddingTop, 16),
        paddingBottom: Math.max(paddingBottom, 16),
        paddingLeft,
        paddingRight,
        backgroundColor: bg,
      } as DividerBlock);
      return;
    }

    // ── Spacer ──
    if (tagName === "br") {
      blocks.push({
        id: generateId("blk_spc"),
        type: "spacer",
        height: 24,
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        backgroundColor: "transparent",
      } as SpacerBlock);
      return;
    }

    // Check spacer divs / empty cells
    if (
      (tagName === "div" || tagName === "td") &&
      el.children.length === 0 &&
      (el.textContent?.trim() === "" || el.innerHTML.includes("&nbsp;")) &&
      (el.style.height || el.getAttribute("height"))
    ) {
      const h = parsePx(el.style.height || el.getAttribute("height"), 32);
      if (h > 0) {
        blocks.push({
          id: generateId("blk_spc"),
          type: "spacer",
          height: h,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
          backgroundColor: bg,
        } as SpacerBlock);
        return;
      }
    }

    // ── Columns (Table with multiple TD columns) ──
    if (tagName === "tr") {
      const tds = Array.from(el.children).filter((c) => c.tagName.toLowerCase() === "td") as HTMLElement[];
      if (tds.length === 2) {
        // Map to 2 columns
        const col1: ColumnCell = {
          id: generateId("cell"),
          content: tds[0].innerText?.trim() || tds[0].textContent?.trim() || "Column 1",
          fontSize: parsePx(tds[0].style.fontSize, 14),
          color: parseColor(tds[0].style.color, "#333333"),
          fontFamily: tds[0].style.fontFamily || settings.defaultFont || "Arial, sans-serif",
          textAlign: parseTextAlign(tds[0].style.textAlign),
          fontWeight: parseFontWeight(tds[0].style.fontWeight),
        };
        const col2: ColumnCell = {
          id: generateId("cell"),
          content: tds[1].innerText?.trim() || tds[1].textContent?.trim() || "Column 2",
          fontSize: parsePx(tds[1].style.fontSize, 14),
          color: parseColor(tds[1].style.color, "#333333"),
          fontFamily: tds[1].style.fontFamily || settings.defaultFont || "Arial, sans-serif",
          textAlign: parseTextAlign(tds[1].style.textAlign),
          fontWeight: parseFontWeight(tds[1].style.fontWeight),
        };

        blocks.push({
          id: generateId("blk_col2"),
          type: "columns2",
          columns: [col1, col2],
          gap: 16,
          paddingTop: Math.max(paddingTop, 16),
          paddingBottom: Math.max(paddingBottom, 16),
          paddingLeft,
          paddingRight,
          backgroundColor: bg,
        } as Columns2Block);
        return;
      }

      if (tds.length === 3) {
        // Map to 3 columns
        const makeCol = (td: HTMLElement, idx: number): ColumnCell => ({
          id: generateId("cell"),
          content: td.innerText?.trim() || td.textContent?.trim() || `Column ${idx + 1}`,
          fontSize: parsePx(td.style.fontSize, 14),
          color: parseColor(td.style.color, "#333333"),
          fontFamily: td.style.fontFamily || settings.defaultFont || "Arial, sans-serif",
          textAlign: parseTextAlign(td.style.textAlign),
          fontWeight: parseFontWeight(td.style.fontWeight),
        });

        blocks.push({
          id: generateId("blk_col3"),
          type: "columns3",
          columns: [makeCol(tds[0], 0), makeCol(tds[1], 1), makeCol(tds[2], 2)],
          gap: 16,
          paddingTop: Math.max(paddingTop, 16),
          paddingBottom: Math.max(paddingBottom, 16),
          paddingLeft,
          paddingRight,
          backgroundColor: bg,
        } as Columns3Block);
        return;
      }
    }

    // ── Container Elements: traverse children ──
    if (["html", "body", "table", "tbody", "thead", "tr", "td", "div", "section", "article", "main", "center"].includes(tagName)) {
      // If it's a wrapper, traverse children
      if (el.childNodes.length > 0) {
        Array.from(el.childNodes).forEach(processNode);
        return;
      }
    }

    // ── Unsupported HTML: preserve in Custom HTML block ──
    const outerHtml = el.outerHTML;
    if (outerHtml && outerHtml.trim()) {
      blocks.push({
        id: generateId("blk_html"),
        type: "html",
        html: outerHtml,
        paddingTop: Math.max(paddingTop, 16),
        paddingBottom: Math.max(paddingBottom, 16),
        paddingLeft,
        paddingRight,
        backgroundColor: bg,
      } as HtmlBlock);
    }
  }

  // Parse body child nodes
  if (doc.body && doc.body.childNodes.length > 0) {
    Array.from(doc.body.childNodes).forEach(processNode);
  } else {
    // If no body tags, parse doc root childNodes
    Array.from(doc.childNodes).forEach(processNode);
  }

  // If blocks are empty, fallback to text or html block
  if (blocks.length === 0 && htmlString.trim()) {
    blocks.push({
      id: generateId("blk_html"),
      type: "html",
      html: htmlString,
      paddingTop: 16,
      paddingBottom: 16,
      paddingLeft: 24,
      paddingRight: 24,
      backgroundColor: "transparent",
    } as HtmlBlock);
  }

  return { blocks, settings };
}
