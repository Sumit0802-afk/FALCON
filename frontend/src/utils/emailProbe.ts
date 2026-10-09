/**
 * Renders an HTML email off-screen at given screen widths and measures it.
 *
 * Two things are built on that: a check of the layout at each width (does
 * anything overflow, get cut off, vanish or stretch?), and a comparison of the
 * author's original against the version that is sent.
 *
 * Elements are told apart by where they are in the code: each opening tag is
 * stamped with its source offset before rendering (see htmlPick.ts).
 */

import { stripActiveHtml } from "@/lib/emailCore/renderHtml";
import { SOURCE_ATTR, annotateHtml } from "@/utils/htmlPick";
import { lineFinder } from "@/utils/emailLint";

/** The widths an email is checked at, widest first */
export const CHECK_WIDTHS = [1440, 1366, 1024, 768, 430, 414, 390, 375, 360];

export function deviceOf(width: number): "Desktop" | "Tablet" | "Mobile" {
  return width >= 1200 ? "Desktop" : width >= 600 ? "Tablet" : "Mobile";
}

export interface ProbeIssue {
  kind: "overflow" | "clipped" | "hidden" | "distorted" | "broken-image" | "wrapping" | "small-text";
  title: string;
  line: number;
  excerpt: string;
  problem: string;
  fix: string;
  count?: number;
}

export interface WidthResult {
  width: number;
  /** How far the page scrolls sideways, in pixels; 0 when it fits */
  overflow: number;
  height: number;
  issues: ProbeIssue[];
}

interface Box {
  tag: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
  hasContent: boolean;
}

// ─── Rendering ────────────────────────────────────────────────────────────────

interface Stage {
  frame: HTMLIFrameElement;
  doc: Document;
  view: Window;
  resize: (width: number) => Promise<void>;
  close: () => void;
}

const nextFrame = () => new Promise<void>((done) => requestAnimationFrame(() => done()));

/** Puts already-stamped HTML in a hidden frame and waits for its pictures and fonts */
function stage(stamped: string, width: number): Promise<Stage> {
  return new Promise((resolve, reject) => {
    const frame = document.createElement("iframe");
    frame.setAttribute("sandbox", "allow-same-origin");
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    frame.style.cssText = `position:fixed;left:-20000px;top:0;width:${width}px;height:900px;border:0;visibility:hidden;pointer-events:none;`;
    const close = () => frame.remove();
    const timer = window.setTimeout(() => { close(); reject(new Error("The email took too long to render")); }, 15000);

    frame.onload = async () => {
      const doc = frame.contentDocument;
      const view = frame.contentWindow;
      if (!doc?.body || !view) { window.clearTimeout(timer); close(); return reject(new Error("The email could not be rendered")); }
      // Pictures change the layout when they arrive; give them a moment, but never wait for a dead one
      const pending = Array.from(doc.images).filter((img) => !img.complete);
      await Promise.race([
        Promise.all(pending.map((img) => new Promise<void>((done) => { img.addEventListener("load", () => done(), { once: true }); img.addEventListener("error", () => done(), { once: true }); }))),
        new Promise<void>((done) => window.setTimeout(done, 3500)),
      ]);
      await Promise.race([doc.fonts?.ready ?? Promise.resolve(), new Promise((done) => window.setTimeout(done, 1500))]).catch(() => undefined);
      await nextFrame();
      window.clearTimeout(timer);
      resolve({
        frame,
        doc,
        view,
        close,
        resize: async (next: number) => {
          frame.style.width = `${next}px`;
          await nextFrame();
          await nextFrame();
        },
      });
    };
    frame.srcdoc = stripActiveHtml(stamped);
    document.body.appendChild(frame);
  });
}

function sourceOffset(el: Element): number {
  const value = el.getAttribute(SOURCE_ATTR);
  return value === null ? -1 : Number(value);
}

function describe(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const cls = (el.getAttribute("class") || "").trim().split(/\s+/).filter(Boolean).slice(0, 2).join(".");
  const text = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40);
  return `<${tag}${cls ? `.${cls}` : ""}>${text ? ` “${text}${(el.textContent || "").trim().length > 40 ? "…" : ""}”` : ""}`;
}

function ownText(el: Element): boolean {
  for (const node of Array.from(el.childNodes)) if (node.nodeType === 3 && (node.textContent || "").trim().length > 1) return true;
  return false;
}

/** Where every stamped element is and whether it can be seen */
function snapshot(stage: Stage): Map<number, Box> {
  const boxes = new Map<number, Box>();
  stage.doc.querySelectorAll(`[${SOURCE_ATTR}]`).forEach((el) => {
    const offset = sourceOffset(el);
    if (offset < 0) return;
    const rect = el.getBoundingClientRect();
    const style = stage.view.getComputedStyle(el);
    const visible = style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    boxes.set(offset, { tag: el.tagName.toLowerCase(), x: rect.left, y: rect.top + stage.view.scrollY, w: rect.width, h: rect.height, visible, hasContent: el.tagName === "IMG" || ownText(el) });
  });
  return boxes;
}

// ─── Layout check at one width ────────────────────────────────────────────────

function clipsContent(el: Element, view: Window): boolean {
  const style = view.getComputedStyle(el);
  return /hidden|clip|auto|scroll/.test(style.overflowX);
}

function measure(stage: Stage, width: number, lineOf: (o: number) => number, reference: Map<number, Box> | null): WidthResult {
  const { doc, view } = stage;
  const root = doc.documentElement;
  const viewport = root.clientWidth;
  const issues: ProbeIssue[] = [];
  const lineFor = (el: Element) => { const o = sourceOffset(el); return o < 0 ? 0 : lineOf(o); };
  const elements = Array.from(doc.querySelectorAll<HTMLElement>(`body [${SOURCE_ATTR}]`));

  // Sideways overflow: the outermost elements that reach past the screen edge
  const overflow = Math.max(0, Math.max(root.scrollWidth, doc.body.scrollWidth) - viewport);
  const offenders: HTMLElement[] = [];
  const clipped: HTMLElement[] = [];
  for (const el of elements) {
    const style = view.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || style.position === "fixed") continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    if (rect.right <= viewport + 1 && rect.left >= -1) continue;
    let clipper: Element | null = null;
    for (let p = el.parentElement; p && p !== doc.body; p = p.parentElement) if (clipsContent(p, view)) { clipper = p; break; }
    if (clipper) {
      // Cut off by a box that hides its overflow, so it does not scroll the page but cannot be seen whole
      if ((el.tagName === "IMG" || ownText(el)) && !clipped.some((c) => c.contains(el))) clipped.push(el);
      continue;
    }
    if (!offenders.some((o) => o.contains(el))) offenders.push(el);
  }
  if (overflow > 1) {
    for (const el of offenders.slice(0, 4)) {
      const rect = el.getBoundingClientRect();
      issues.push({ kind: "overflow", title: "Horizontal overflow", line: lineFor(el), excerpt: describe(el), problem: `This is ${Math.round(rect.width)}px wide and reaches ${Math.round(rect.right - viewport)}px past a ${width}px screen, so the email scrolls sideways.`, fix: "Give it max-width:100% (pictures also need height:auto), or let its columns stack at this width." });
    }
    if (!offenders.length) issues.push({ kind: "overflow", title: "Horizontal overflow", line: 0, excerpt: "the page", problem: `The email is ${overflow}px wider than a ${width}px screen and scrolls sideways.`, fix: "Look for a fixed width, a long unbroken word or a wide table." });
  }
  for (const el of clipped.slice(0, 3)) {
    issues.push({ kind: "clipped", title: "Content cut off", line: lineFor(el), excerpt: describe(el), problem: `Part of this lies outside its container at ${width}px and is hidden by the container's overflow setting.`, fix: "Let the content shrink or wrap at this width, or make the container wide enough for it." });
  }

  // Text that does not fit its own box
  let cut = 0;
  for (const el of elements) {
    if (!ownText(el) || el.scrollWidth <= el.clientWidth + 1) continue;
    const style = view.getComputedStyle(el);
    if (style.display === "none" || style.display === "inline" || !/hidden|clip/.test(style.overflowX) || style.textOverflow === "ellipsis") continue;
    if (++cut <= 3) issues.push({ kind: "clipped", title: "Text cut off", line: lineFor(el), excerpt: describe(el), problem: `This text is wider than its box at ${width}px and the rest is hidden.`, fix: "Allow it to wrap (remove white-space:nowrap), or reduce the font size at this width." });
  }

  // Pictures
  let broken = 0;
  for (const img of Array.from(doc.images)) {
    const style = view.getComputedStyle(img);
    if (style.display === "none") continue;
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) {
      if (++broken <= 4) issues.push({ kind: "broken-image", title: "Broken image URL", line: lineFor(img), excerpt: (img.getAttribute("src") || "").slice(0, 80), problem: "This picture did not load.", fix: "Check the address opens in a browser, and that it is a public https address." });
      continue;
    }
    if (!img.naturalWidth || !img.naturalHeight) continue;
    const rect = img.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8 || style.objectFit !== "fill") continue;
    const drawn = rect.width / rect.height;
    const real = img.naturalWidth / img.naturalHeight;
    if (Math.abs(drawn - real) / real > 0.04) {
      issues.push({ kind: "distorted", title: "Distorted image", line: lineFor(img), excerpt: describe(img), problem: `The picture is ${img.naturalWidth}×${img.naturalHeight} but is drawn ${Math.round(rect.width)}×${Math.round(rect.height)} at ${width}px, so it looks ${drawn > real ? "stretched wide" : "squeezed"}.`, fix: "Set height:auto alongside the width, or use object-fit:cover if the box must keep its shape." });
    }
  }

  // Compared with the widest screen: content that has gone, and buttons whose text now wraps
  if (reference) {
    const now = snapshot(stage);
    const gone: number[] = [];
    reference.forEach((before, offset) => {
      const after = now.get(offset);
      if (before.visible && before.hasContent && after && !after.visible) gone.push(offset);
    });
    if (gone.length) {
      const el = doc.querySelector(`[${SOURCE_ATTR}="${gone[0]}"]`);
      issues.push({ kind: "hidden", title: "Content hidden", line: lineOf(gone[0]), excerpt: el ? describe(el) : "", problem: `This is shown on a wide screen but hidden at ${width}px. The same content should be on every screen.`, fix: "Remove the rule that hides it at this width and let it resize or stack instead.", count: gone.length });
    }
    let wrapped = 0;
    for (const el of elements) {
      if (!/^(A|BUTTON)$/.test(el.tagName)) continue;
      const before = reference.get(sourceOffset(el));
      const style = view.getComputedStyle(el);
      if (!before || !before.visible || style.display === "inline" || before.h < 20 || before.h > 80) continue;
      const rect = el.getBoundingClientRect();
      if (rect.height > before.h * 1.7 && ++wrapped <= 2) {
        issues.push({ kind: "wrapping", title: "Unexpected wrapping", line: lineFor(el), excerpt: describe(el), problem: `This button is one line on a wide screen and wraps onto several at ${width}px.`, fix: "Shorten the label, reduce its padding or font size at this width, or let the button take the full width." });
      }
    }
  }

  // Text too small to read on a phone
  if (width <= 430) {
    const tiny = elements.filter((el) => ownText(el) && view.getComputedStyle(el).display !== "none" && parseFloat(view.getComputedStyle(el).fontSize) < 10);
    if (tiny.length) issues.push({ kind: "small-text", title: "Small text", line: lineFor(tiny[0]), excerpt: describe(tiny[0]), problem: `This text is ${parseFloat(view.getComputedStyle(tiny[0]).fontSize)}px, which is hard to read on a phone.`, fix: "Keep text at 11px or more on small screens.", count: tiny.length });
  }

  // The email's own height: the frame is taller than a short email, so the page height would not say
  const bodyStyle = view.getComputedStyle(doc.body);
  const height = Math.round(doc.body.getBoundingClientRect().height + (parseFloat(bodyStyle.marginTop) || 0) + (parseFloat(bodyStyle.marginBottom) || 0));
  return { width, overflow, height, issues };
}

/**
 * Lays the email out at every width in CHECK_WIDTHS and reports what goes wrong
 * at each. `code` is the email's own code, which line numbers refer to.
 */
export async function checkScreenSizes(code: string, onProgress?: (done: number, total: number) => void): Promise<WidthResult[]> {
  const lineOf = lineFinder(code);
  const s = await stage(annotateHtml(code), CHECK_WIDTHS[0]);
  try {
    const results: WidthResult[] = [];
    let reference: Map<number, Box> | null = null;
    for (let i = 0; i < CHECK_WIDTHS.length; i++) {
      await s.resize(CHECK_WIDTHS[i]);
      results.push(measure(s, CHECK_WIDTHS[i], lineOf, reference));
      if (!reference) reference = snapshot(s);
      onProgress?.(i + 1, CHECK_WIDTHS.length);
    }
    return results;
  } finally {
    s.close();
  }
}

// ─── Original against the version that is sent ────────────────────────────────

export interface VersionDifference {
  offset: number;
  line: number;
  element: string;
  /** What differs, e.g. "width" or "font size" */
  property: string;
  original: string;
  sent: string;
}

export interface VersionComparison {
  width: number;
  compared: number;
  differences: VersionDifference[];
  /** Elements that are in one version and not the other */
  missing: number;
}

const STYLE_CHECKS: [string, string][] = [
  ["font-size", "font size"],
  ["font-weight", "font weight"],
  ["font-family", "font"],
  ["color", "text colour"],
  ["background-color", "background colour"],
  ["text-align", "alignment"],
  ["border-top-width", "border"],
  ["border-top-color", "border colour"],
  ["border-top-left-radius", "corner radius"],
  ["box-shadow", "shadow"],
  ["opacity", "opacity"],
  ["display", "display"],
];

const px = (n: number) => `${Math.round(n * 10) / 10}px`;

/**
 * Compares two versions of the same email, element by element, at one width.
 * Both must carry the same source stamps, so `sent` has to be made from the
 * stamped original.
 */
export async function compareVersions(code: string, stampedOriginal: string, stampedSent: string, width: number): Promise<VersionComparison> {
  const lineOf = lineFinder(code);
  const [a, b] = await Promise.all([stage(stampedOriginal, width), stage(stampedSent, width)]);
  try {
    const differences: VersionDifference[] = [];
    let compared = 0;
    let missing = 0;
    const others = new Map<number, Element>();
    b.doc.querySelectorAll(`body [${SOURCE_ATTR}]`).forEach((el) => others.set(sourceOffset(el), el));

    a.doc.querySelectorAll(`body [${SOURCE_ATTR}]`).forEach((el) => {
      const offset = sourceOffset(el);
      const other = others.get(offset);
      if (!other) { missing++; return; }
      others.delete(offset);
      const sa = a.view.getComputedStyle(el);
      const sb = b.view.getComputedStyle(other);
      const ra = el.getBoundingClientRect();
      const rb = other.getBoundingClientRect();
      const shownA = sa.display !== "none" && ra.width > 0 && ra.height > 0;
      const shownB = sb.display !== "none" && rb.width > 0 && rb.height > 0;
      if (!shownA && !shownB) return;
      compared++;
      const add = (property: string, original: string, sent: string) => {
        if (differences.length < 80) differences.push({ offset, line: lineOf(offset), element: describe(el), property, original, sent });
      };
      if (shownA !== shownB) return add("visibility", shownA ? "shown" : "hidden", shownB ? "shown" : "hidden");
      if (Math.abs(ra.width - rb.width) > 1) add(el.tagName === "IMG" ? "image width" : "width", px(ra.width), px(rb.width));
      if (Math.abs(ra.height - rb.height) > 1) add(el.tagName === "IMG" ? "image height" : "height", px(ra.height), px(rb.height));
      // Measured from the parent, so one taller element is not reported again on everything below it
      const pa = el.parentElement?.getBoundingClientRect();
      const pb = other.parentElement?.getBoundingClientRect();
      if (pa && pb) {
        if (Math.abs((ra.left - pa.left) - (rb.left - pb.left)) > 1) add("position (left)", px(ra.left - pa.left), px(rb.left - pb.left));
        if (Math.abs((ra.top - pa.top) - (rb.top - pb.top)) > 1) add("position (top)", px(ra.top - pa.top), px(rb.top - pb.top));
      }
      for (const side of ["top", "right", "bottom", "left"]) {
        for (const kind of ["margin", "padding"]) {
          const name = `${kind}-${side}`;
          if (Math.abs(parseFloat(sa.getPropertyValue(name)) - parseFloat(sb.getPropertyValue(name))) > 0.5) add(`spacing (${name})`, sa.getPropertyValue(name), sb.getPropertyValue(name));
        }
      }
      for (const [name, label] of STYLE_CHECKS) {
        const va = sa.getPropertyValue(name);
        const vb = sb.getPropertyValue(name);
        if (va !== vb) add(label, va, vb);
      }
    });
    missing += others.size;
    return { width, compared, differences, missing };
  } finally {
    a.close();
    b.close();
  }
}
