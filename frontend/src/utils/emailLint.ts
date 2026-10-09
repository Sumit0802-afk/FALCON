/**
 * Reads an HTML email's code and lists what is wrong with it, with the line
 * each problem is on. Nothing here changes the code: every finding is reported
 * for the author to act on.
 *
 * These checks read the text only. Problems that depend on how the email is
 * laid out at a given screen width are found by rendering it (see emailProbe.ts).
 */

export type IssueLevel = "error" | "warning" | "info";

export interface EmailIssue {
  level: IssueLevel;
  /** A short name for the kind of problem, e.g. "Responsive issue" */
  title: string;
  /** 1-based line in the code, or 0 when the problem is not at one place */
  line: number;
  /** The piece of code concerned */
  excerpt: string;
  problem: string;
  fix: string;
  /** How many places share this problem, when one entry stands for several */
  count?: number;
}

// ─── Positions ────────────────────────────────────────────────────────────────

/** Turns offsets in the code into line numbers */
export function lineFinder(text: string): (offset: number) => number {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) starts.push(i + 1);
  return (offset: number) => {
    let low = 0;
    let high = starts.length - 1;
    while (low < high) {
      const mid = (low + high + 1) >> 1;
      if (starts[mid] <= offset) low = mid;
      else high = mid - 1;
    }
    return low + 1;
  };
}

/** The start and end offsets of a 1-based line */
export function lineRange(text: string, line: number): { start: number; end: number } {
  let start = 0;
  for (let n = 1; n < line; n++) {
    const next = text.indexOf("\n", start);
    if (next === -1) break;
    start = next + 1;
  }
  const end = text.indexOf("\n", start);
  return { start, end: end === -1 ? text.length : end };
}

function clip(text: string, max = 90): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

/** Same length, with comments and the insides of style and script blanked, so only real tags are left */
function maskNonMarkup(html: string): string {
  const blank = (match: string) => match.replace(/[^\n]/g, " ");
  return html
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style\s*>)/gi, (_m, open, body, close) => open + blank(body) + close)
    .replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script\s*>)/gi, (_m, open, body, close) => open + blank(body) + close);
}

// ─── HTML structure ───────────────────────────────────────────────────────────

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
/** Elements a browser closes by itself, so leaving their end tag out is not a mistake */
const SELF_CLOSING = new Set(["p", "li", "td", "th", "tr", "tbody", "thead", "tfoot", "option", "dt", "dd", "colgroup", "caption", "html", "head", "body"]);

function structureIssues(html: string, masked: string, lineOf: (o: number) => number): EmailIssue[] {
  const issues: EmailIssue[] = [];
  const stack: { name: string; offset: number }[] = [];
  const tag = /<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)((?:\s+[^<>]*?)?)(\/?)>/g;
  let match: RegExpExecArray | null;
  let lastEnd = 0;

  const unterminated = (from: number, to: number) => {
    // An opening "<tag" that runs into the next tag without its own ">"
    const piece = masked.slice(from, to);
    const found = /<[a-zA-Z][^<>]*$/.exec(piece);
    if (found && issues.length < 14) {
      const at = from + found.index;
      issues.push({ level: "error", title: "Invalid HTML", line: lineOf(at), excerpt: clip(html.slice(at, at + 80)), problem: "This tag is never finished with “>”.", fix: "Add the missing “>” at the end of the tag." });
    }
  };

  while ((match = tag.exec(masked))) {
    unterminated(lastEnd, match.index);
    lastEnd = match.index + match[0].length;
    const name = match[2].toLowerCase();
    if (match[1] !== "/") {
      if (VOID.has(name) || match[4] === "/" || name.includes(":")) continue;
      // A new <p>, <li>, <td> and so on ends the one before it
      const top = stack[stack.length - 1];
      if (top && top.name === name && ["p", "li", "option", "dt", "dd"].includes(name)) stack.pop();
      stack.push({ name, offset: match.index });
      continue;
    }
    if (VOID.has(name)) continue;
    let at = -1;
    for (let i = stack.length - 1; i >= 0; i--) if (stack[i].name === name) { at = i; break; }
    if (at === -1) {
      if (issues.length < 14 && !SELF_CLOSING.has(name)) {
        issues.push({ level: "error", title: "Invalid HTML", line: lineOf(match.index), excerpt: match[0], problem: `This closing tag has no matching <${name}> before it.`, fix: `Remove it, or add the <${name}> it was meant to close.` });
      }
      continue;
    }
    for (let i = stack.length - 1; i > at; i--) {
      const open = stack[i];
      if (!SELF_CLOSING.has(open.name) && issues.length < 14) {
        issues.push({ level: "error", title: "Unclosed tag", line: lineOf(open.offset), excerpt: clip(html.slice(open.offset, open.offset + 80)), problem: `<${open.name}> is opened here but not closed before </${name}> on line ${lineOf(match.index)}.`, fix: `Add </${open.name}> where this element should end.` });
      }
    }
    stack.length = at;
  }
  unterminated(lastEnd, masked.length);
  for (const open of stack) {
    if (SELF_CLOSING.has(open.name) || issues.length >= 14) continue;
    issues.push({ level: "error", title: "Unclosed tag", line: lineOf(open.offset), excerpt: clip(html.slice(open.offset, open.offset + 80)), problem: `<${open.name}> is opened here and never closed.`, fix: `Add </${open.name}> where this element should end.` });
  }
  return issues;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

interface Declaration {
  prop: string;
  value: string;
  offset: number;
  /** The other declarations in the same rule or style attribute */
  siblings: string;
  /** The selector, or "" for a style attribute */
  selector: string;
}

/** Splits "a: b; c: d" into declarations, keeping brackets and quotes whole, with each one's offset */
function splitDeclarations(body: string, base: number, selector: string): Declaration[] {
  const out: Declaration[] = [];
  let depth = 0;
  let quote = "";
  let start = 0;
  const push = (end: number) => {
    const part = body.slice(start, end);
    const colon = part.indexOf(":");
    if (colon > 0) {
      const prop = part.slice(0, colon).trim().toLowerCase();
      const value = part.slice(colon + 1).trim();
      const lead = part.length - part.trimStart().length;
      if (prop && value && /^[-a-z_][-a-z0-9_]*$/.test(prop)) out.push({ prop, value, offset: base + start + lead, siblings: body, selector });
    }
    start = end + 1;
  };
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (quote) { if (ch === quote) quote = ""; continue; }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (ch === ";" && depth === 0) push(i);
  }
  push(body.length);
  return out;
}

interface StyleBlock { css: string; offset: number }

function styleBlocks(html: string): StyleBlock[] {
  const out: StyleBlock[] = [];
  const re = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) out.push({ css: match[1], offset: match.index + match[0].indexOf(">") + 1 });
  return out;
}

/** Every declaration in the email: those in style blocks and those in style attributes */
function allDeclarations(html: string, masked: string): Declaration[] {
  const out: Declaration[] = [];
  for (const block of styleBlocks(html)) {
    const css = block.css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
    const rule = /([^{}]*)\{([^{}]*)\}/g;
    let match: RegExpExecArray | null;
    while ((match = rule.exec(css))) {
      const selector = match[1].trim();
      // @font-face and friends hold descriptors, which are not properties
      if (/^@(font-face|page|property|counter-style)/i.test(selector)) continue;
      out.push(...splitDeclarations(match[2], block.offset + match.index + match[1].length + 1, selector));
    }
  }
  const attr = /\sstyle\s*=\s*("([^"]*)"|'([^']*)')/gi;
  let match: RegExpExecArray | null;
  while ((match = attr.exec(masked))) {
    const body = match[2] ?? match[3] ?? "";
    out.push(...splitDeclarations(html.substr(match.index + match[0].length - body.length - 1, body.length), match.index + match[0].length - body.length - 1, ""));
  }
  return out;
}

function cssIssues(html: string, declarations: Declaration[], lineOf: (o: number) => number): EmailIssue[] {
  const issues: EmailIssue[] = [];
  for (const block of styleBlocks(html)) {
    const css = block.css.replace(/\/\*[\s\S]*?\*\//g, "");
    const opened = (css.match(/\{/g) || []).length;
    const closed = (css.match(/\}/g) || []).length;
    if (opened !== closed) {
      issues.push({ level: "error", title: "Broken CSS", line: lineOf(block.offset), excerpt: "<style>", problem: `This style block has ${opened} “{” but ${closed} “}”. Rules after the unbalanced one are ignored.`, fix: opened > closed ? "Add the missing “}”." : "Remove the extra “}”." });
    }
  }
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return issues;
  let shown = 0;
  for (const d of declarations) {
    // Prefixed and Outlook-only properties are meant for one app and are fine to leave in
    if (d.prop.startsWith("-") || d.prop.startsWith("mso-") || /var\(|expression\(|progid:/i.test(d.value)) continue;
    const value = d.value.replace(/!\s*important\s*$/i, "").trim();
    if (!value || CSS.supports(d.prop, value)) continue;
    if (++shown > 12) break;
    const known = CSS.supports(d.prop, "inherit");
    issues.push({
      level: "warning",
      title: "Invalid CSS",
      line: lineOf(d.offset),
      excerpt: clip(`${d.prop}: ${d.value}`),
      problem: known ? `“${clip(d.value, 40)}” is not a valid value for ${d.prop}, so the declaration is ignored.` : `“${d.prop}” is not a CSS property, so the declaration is ignored.`,
      fix: known ? "Correct the value." : "Check the spelling of the property name.",
    });
  }
  return issues;
}

// ─── What mail apps cannot show ───────────────────────────────────────────────

interface SupportRule {
  test: (d: Declaration) => boolean;
  name: string;
  problem: string;
  fix: string;
}

const HANDLED = "The compatibility version gives it a plain fallback and keeps the full effect for apps that can show it.";

const SUPPORT_RULES: SupportRule[] = [
  { name: "position: absolute / fixed", test: (d) => d.prop === "position" && /absolute|fixed|sticky/.test(d.value), problem: "Gmail and Outlook ignore positioning, so layered parts drop back into the normal flow.", fix: `Lay the part out with tables or normal flow where you can. ${HANDLED}` },
  { name: "display: flex / grid", test: (d) => d.prop === "display" && /flex|grid/.test(d.value), problem: "Outlook on Windows ignores flex and grid, so columns stack one under another there.", fix: "For columns that must hold in Outlook, use a table." },
  { name: "animation", test: (d) => d.prop === "animation" || d.prop.startsWith("animation-") || d.prop === "transition", problem: "Most mail apps do not animate; they show the element as it is before the animation starts.", fix: `Make sure the starting state is the one you want seen. ${HANDLED}` },
  { name: "transform", test: (d) => d.prop === "transform", problem: "Gmail and Outlook ignore transforms, so rotated, scaled or shifted parts appear untransformed.", fix: HANDLED },
  { name: "filter / backdrop-filter", test: (d) => d.prop === "filter" || d.prop === "backdrop-filter", problem: "Blur and other filters are not shown by Gmail or Outlook.", fix: "Give the element a solid or semi-transparent background that works without the filter." },
  { name: "clip-path / mask", test: (d) => d.prop === "clip-path" || d.prop === "mask" || d.prop === "mask-image", problem: "Clipping and masking are ignored by most mail apps; the whole element is shown.", fix: "Use a picture already cut to shape where the shape matters." },
  { name: "gradient text", test: (d) => /background-clip$/.test(d.prop) && /text/.test(d.value), problem: "Text filled with a gradient shows as a block of gradient or as invisible text in Gmail and Outlook.", fix: HANDLED },
  { name: "CSS variables", test: (d) => /var\(--/.test(d.value), problem: "Gmail drops any declaration that uses var().", fix: "The compatibility version writes the real values in for you." },
];

function supportIssues(html: string, masked: string, declarations: Declaration[], lineOf: (o: number) => number): EmailIssue[] {
  const issues: EmailIssue[] = [];
  for (const rule of SUPPORT_RULES) {
    const hits = declarations.filter(rule.test);
    if (!hits.length) continue;
    issues.push({ level: "info", title: "Limited support in mail apps", line: lineOf(hits[0].offset), excerpt: clip(`${hits[0].prop}: ${hits[0].value}`), problem: rule.problem, fix: rule.fix, count: hits.length });
  }
  const tags: [RegExp, string, string, string, IssueLevel][] = [
    [/<script\b/gi, "<script>", "Mail apps never run scripts. Falcon removes them when the email is shown or sent.", "Remove the script; the email must work without it.", "warning"],
    [/\son[a-z]+\s*=\s*["']/gi, "an event handler (onclick and similar)", "Mail apps never run script handlers. Falcon removes them when the email is shown or sent.", "Remove the handler and use an ordinary link.", "warning"],
    [/<(?:iframe|object|embed)\b/gi, "an embedded frame or object", "Mail apps do not show embedded pages or objects. Falcon removes them when the email is shown or sent.", "Link to the page instead.", "warning"],
    [/<form\b/gi, "<form>", "Forms do not work in most mail apps: Gmail shows the fields but warns on submit, Outlook shows nothing usable.", "Link to a form on a web page instead.", "warning"],
    [/<video\b/gi, "<video>", "Video plays in Apple Mail only. Other apps show the poster picture, or nothing.", "Use a picture of the video that links to it.", "info"],
    [/<svg\b/gi, "inline <svg>", "Gmail and Outlook remove inline SVG drawings.", "Use a PNG picture at a public address for anything that must be seen.", "warning"],
    [/<link\b[^>]*rel\s*=\s*["']?stylesheet/gi, "a linked stylesheet", "Gmail and Outlook ignore linked stylesheets, including web fonts loaded this way.", "Keep styles in the email itself and give every font-family a fallback font.", "info"],
    [/@import\b/gi, "@import", "Gmail and Outlook ignore @import.", "Keep styles in the email itself and give every font-family a fallback font.", "info"],
    [/@font-face\b/gi, "@font-face", "Web fonts show in Apple Mail and a few others. Gmail and Outlook use the fallback font.", "Name a fallback font after the web font in every font-family.", "info"],
  ];
  const withStyles = html.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, " "));
  for (const [re, name, problem, fix, level] of tags) {
    // At-rules live inside style blocks, which the masked copy has blanked out
    const source = name.startsWith("@") ? withStyles : masked;
    const hits = [...source.matchAll(re)];
    if (!hits.length) continue;
    issues.push({ level, title: level === "warning" ? "Not supported in email" : "Limited support in mail apps", line: lineOf(hits[0].index ?? 0), excerpt: name, problem, fix, count: hits.length });
  }
  return issues;
}

// ─── Attributes, pictures, widths ─────────────────────────────────────────────

function attr(tag: string, name: string): string | null {
  const found = new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tag);
  return found ? (found[2] ?? found[3] ?? found[4] ?? "") : null;
}

function attributeIssues(html: string, masked: string, lineOf: (o: number) => number): EmailIssue[] {
  const issues: EmailIssue[] = [];
  const noAlt: number[] = [];
  const noHref: number[] = [];
  const tag = /<(img|a)\b[^<>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = tag.exec(masked))) {
    const text = html.substr(match.index, match[0].length);
    const line = lineOf(match.index);
    if (match[1].toLowerCase() === "a") {
      const href = attr(text, "href");
      if (href === null || !href.trim() || href.trim() === "#") noHref.push(match.index);
      continue;
    }
    const src = attr(text, "src");
    if (src === null || !src.trim()) {
      issues.push({ level: "error", title: "Missing attribute", line, excerpt: clip(text), problem: "This picture has no src, so nothing is shown.", fix: "Add src with the picture's public https address." });
      continue;
    }
    if (attr(text, "alt") === null) noAlt.push(match.index);
    const url = src.trim();
    if (/^data:/i.test(url)) {
      issues.push({ level: "warning", title: "Picture address", line, excerpt: clip(url, 60), problem: "This picture is embedded in the code. Gmail does not show embedded pictures, and they make the email large.", fix: "Host the picture and use its public https address. Falcon does this when sending if picture hosting is set up." });
    } else if (/^(blob:|file:)/i.test(url) || /^https?:\/\/(localhost|127\.|10\.|192\.168\.|\[::1\])/i.test(url)) {
      issues.push({ level: "error", title: "Broken image URL", line, excerpt: clip(url, 80), problem: "This address only works on this computer. People who receive the email will see a broken picture.", fix: "Use the picture's public https address." });
    } else if (!/^(https?:)?\/\//i.test(url) && !/^cid:/i.test(url)) {
      issues.push({ level: "error", title: "Broken image URL", line, excerpt: clip(url, 80), problem: "This is a relative address. An email has no site to be relative to, so the picture will not load.", fix: "Use the full address, starting with https://." });
    } else if (/^http:\/\//i.test(url)) {
      issues.push({ level: "warning", title: "Picture address", line, excerpt: clip(url, 80), problem: "This picture is served over http. Many mail apps block pictures that are not https.", fix: "Use the https address." });
    }
  }
  if (noAlt.length) issues.push({ level: "warning", title: "Missing attribute", line: lineOf(noAlt[0]), excerpt: "<img> without alt", problem: "Pictures are often blocked until the reader allows them. Without alt text, nothing says what the picture was.", fix: "Add alt=\"…\" describing the picture, or alt=\"\" for decoration.", count: noAlt.length });
  if (noHref.length) issues.push({ level: "warning", title: "Missing attribute", line: lineOf(noHref[0]), excerpt: "<a> without a real href", problem: "This link goes nowhere when clicked.", fix: "Give it the full address it should open.", count: noHref.length });
  return issues;
}

function widthIssues(html: string, masked: string, declarations: Declaration[], lineOf: (o: number) => number): EmailIssue[] {
  const issues: EmailIssue[] = [];
  const add = (offset: number, excerpt: string, px: number) => {
    if (issues.length >= 10) return;
    issues.push({ level: "warning", title: "Responsive issue", line: lineOf(offset), excerpt, problem: `A fixed width of ${px}px is wider than a phone screen, so this may overflow on mobile.`, fix: "Keep the width for desktop and add max-width:100%, or set the width inside a media query." });
  };
  for (const d of declarations) {
    if (d.prop !== "width" && d.prop !== "min-width") continue;
    const px = /^(\d+(?:\.\d+)?)px/.exec(d.value);
    if (!px || Number(px[1]) <= 480) continue;
    // Capped by a max-width beside it, or already inside a rule for wide screens only
    if (d.prop === "width" && /max-width\s*:\s*100%/.test(d.siblings)) continue;
    add(d.offset, clip(`${d.prop}: ${d.value}`), Number(px[1]));
  }
  const tag = /<(table|td|th|div|img)\b[^<>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = tag.exec(masked))) {
    const text = html.substr(match.index, match[0].length);
    const width = attr(text, "width");
    if (!width || !/^\d+$/.test(width.trim()) || Number(width) <= 480) continue;
    if (/max-width\s*:\s*100%/.test(attr(text, "style") || "")) continue;
    add(match.index, clip(text, 70), Number(width));
  }
  return issues;
}

function documentIssues(html: string, lineOf: (o: number) => number): EmailIssue[] {
  const issues: EmailIssue[] = [];
  if (!/<meta\b[^>]*name\s*=\s*["']?viewport/i.test(html)) {
    issues.push({ level: "warning", title: "Responsive issue", line: 0, excerpt: "no viewport <meta>", problem: "Without it, phones lay the email out as a wide desktop page and shrink it, so text becomes tiny and media queries do not apply.", fix: "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> inside <head>." });
  }
  if (!/@media\b/i.test(html) && /\bwidth\s*[:=]\s*["']?\d{3,}/i.test(html)) {
    issues.push({ level: "info", title: "Responsive issue", line: 0, excerpt: "no @media rules", problem: "The email sets fixed widths and has no rules for small screens.", fix: "Use fluid widths (width:100% with a max-width), or add an @media (max-width:600px) block for the parts that need to change." });
  }
  const bytes = new Blob([html]).size;
  if (bytes > 102 * 1024) {
    issues.push({ level: "warning", title: "Email size", line: 0, excerpt: `${Math.round(bytes / 1024)} KB`, problem: "Gmail cuts an email off after about 102 KB and shows “View entire message”.", fix: "Remove unused styles and embedded pictures to bring the code under 102 KB." });
  }
  const doctype = /<!doctype/i.exec(html);
  if (!doctype && /<html[\s>]/i.test(html)) {
    issues.push({ level: "info", title: "Invalid HTML", line: 1, excerpt: "no <!DOCTYPE html>", problem: "Without a doctype some mail apps use an old layout mode that sizes boxes differently.", fix: "Start the code with <!DOCTYPE html>." });
  }
  void lineOf;
  return issues;
}

// ─── All together ─────────────────────────────────────────────────────────────

const ORDER: Record<IssueLevel, number> = { error: 0, warning: 1, info: 2 };

/** Everything that can be found wrong by reading the code, most serious first */
export function lintEmail(html: string): EmailIssue[] {
  if (!html.trim()) return [];
  const lineOf = lineFinder(html);
  const masked = maskNonMarkup(html);
  const declarations = allDeclarations(html, masked);
  const issues = [
    ...structureIssues(html, masked, lineOf),
    ...cssIssues(html, declarations, lineOf),
    ...attributeIssues(html, masked, lineOf),
    ...widthIssues(html, masked, declarations, lineOf),
    ...documentIssues(html, lineOf),
    ...supportIssues(html, masked, declarations, lineOf),
  ];
  return issues.sort((a, b) => ORDER[a.level] - ORDER[b.level] || a.line - b.line);
}
