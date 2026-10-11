/**
 * Links a click on an imported HTML email to the place in its source code.
 *
 * `annotateHtml` stamps every opening tag with the position it has in the
 * source. When the rendered email is clicked, that stamp says where the
 * clicked element's code starts, and the code editor jumps there.
 */

export const SOURCE_ATTR = "data-fc-src";

/** Tags that never appear as something a reader can click on */
const SKIP = new Set(["html", "head", "meta", "title", "link", "style", "script", "base", "noscript"]);

/** Blanks out comments, styles and scripts so that markup-looking text inside them is not counted as tags. */
function maskNonMarkup(html: string): string {
  const blank = (match: string) => " ".repeat(match.length);
  return html
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/<style[\s\S]*?<\/style\s*>/gi, (m) => m.slice(0, 6) + " ".repeat(Math.max(0, m.length - 6)))
    .replace(/<script[\s\S]*?<\/script\s*>/gi, (m) => m.slice(0, 7) + " ".repeat(Math.max(0, m.length - 7)));
}

/** Returns the HTML with each opening tag carrying its own source offset. Rendering is unchanged. */
export function annotateHtml(html: string): string {
  const masked = maskNonMarkup(html);
  const tag = /<([a-zA-Z][a-zA-Z0-9:-]*)/g;
  let out = "";
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = tag.exec(masked))) {
    if (SKIP.has(match[1].toLowerCase())) continue;
    const end = match.index + match[0].length;
    out += html.slice(last, end) + ` ${SOURCE_ATTR}="${match.index}"`;
    last = end;
  }
  return out + html.slice(last);
}

/** The opening tag that starts at `offset`, as a range in the source. */
export function tagRangeAt(html: string, offset: number): { start: number; end: number } {
  const start = Math.min(Math.max(0, offset), html.length);
  const close = html.indexOf(">", start);
  return { start, end: close === -1 ? start : close + 1 };
}

// ─── Hand-off from the canvas to the code editor ─────────────────────────────

export interface HtmlPick {
  blockId: string;
  offset: number;
  at: number;
}

type Listener = (pick: HtmlPick) => void;

const listeners = new Set<Listener>();
let lastPick: HtmlPick | null = null;

/** Called by the canvas when part of an imported email is clicked. */
export function pickHtml(blockId: string, offset: number): void {
  lastPick = { blockId, offset, at: Date.now() };
  listeners.forEach((listener) => listener(lastPick as HtmlPick));
}

export function onHtmlPick(listener: Listener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/**
 * The click that selected a block also opens its editor, so the editor is not
 * listening yet when the click happens. It asks for that click when it appears.
 */
export function recentHtmlPick(blockId: string, withinMs = 2000): HtmlPick | null {
  return lastPick && lastPick.blockId === blockId && Date.now() - lastPick.at < withinMs ? lastPick : null;
}
