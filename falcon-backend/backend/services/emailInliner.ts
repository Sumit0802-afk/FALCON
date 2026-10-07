/**
 * emailInliner.ts
 *
 * Gets a designed email ready for real inboxes.
 *
 * Gmail and several other clients throw away the <style> block of a message,
 * which leaves a design written with classes as plain unstyled text. Here the
 * stylesheet is copied onto each element as a style attribute, which those
 * clients do keep.
 *
 * Some effects cannot be shown by such clients at all (3D transforms,
 * positioned layers, animation, outlined or gradient-filled text). Those are
 * given a plain fallback, and the full effect is handed back to clients that
 * can show it through rules those limited clients ignore.
 */

import juice from "juice";
import * as cheerio from "cheerio";

/** Gmail cuts a message off after about 102 KB */
const CLIP_LIMIT = 100 * 1024;

type Styles = Map<string, string>;

/** Splits a style attribute into its declarations, leaving brackets and quotes whole */
function parseStyle(text: string): Styles {
  const out: Styles = new Map();
  let depth = 0;
  let quote = "";
  let start = 0;
  const push = (end: number) => {
    const part = text.slice(start, end);
    const colon = part.indexOf(":");
    if (colon > 0) {
      const name = part.slice(0, colon).trim().toLowerCase();
      const value = part.slice(colon + 1).trim();
      if (name && value) {
        // A later declaration wins, and takes the later position too
        out.delete(name);
        out.set(name, value);
      }
    }
    start = end + 1;
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === quote) quote = "";
    } else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (ch === ";" && depth === 0) push(i);
  }
  push(text.length);
  return out;
}

function writeStyle(styles: Styles): string {
  return [...styles].map(([name, value]) => `${name}:${value}`).join(";");
}

const COLOR = /#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/gi;

function isClear(color: string): boolean {
  return /^transparent$/i.test(color) || /^rgba\([^)]*,\s*0?\.?0+\s*\)$/i.test(color) || /^#[0-9a-f]{6}00$/i.test(color);
}

/** The first colour in a value that would actually be seen */
function firstColor(value: string | undefined): string | null {
  for (const match of (value || "").match(COLOR) || []) {
    if (!isClear(match)) return match;
  }
  return null;
}

/** The plain colour underneath a layered background, if it ends with one */
function baseColor(background: string): string | null {
  let depth = 0;
  let last = 0;
  for (let i = 0; i < background.length; i++) {
    if (background[i] === "(") depth++;
    else if (background[i] === ")") depth--;
    else if (background[i] === "," && depth === 0) last = i + 1;
  }
  const layer = background.slice(last).trim();
  if (/gradient\(|url\(/i.test(layer)) return null;
  const color = (layer.match(COLOR) || [])[0];
  return color && !isClear(color) ? color : null;
}

/**
 * Copies a document's stylesheet onto its elements and adds fallbacks for
 * effects that mail clients drop. Returns the input untouched if anything
 * goes wrong, so a send never fails because of this step.
 */
export function inlineEmailStyles(html: string): string {
  if (!/<style[\s>]/i.test(html)) return html;
  try {
    const first = build(html, false);
    // Too big to arrive whole: drop the stylesheet copy, which the style attributes now repeat
    return Buffer.byteLength(first) > CLIP_LIMIT ? build(html, true) : first;
  } catch {
    return html;
  }
}

function build(html: string, dropStylesheet: boolean): string {
  const inlined = juice(html, {
    removeStyleTags: dropStylesheet,
    preserveMediaQueries: true,
    preserveFontFaces: true,
    preserveKeyFrames: true,
    preservePseudos: true,
    preserveImportant: true,
    resolveCSSVariables: true,
    applyWidthAttributes: true,
    applyHeightAttributes: true,
    inlinePseudoElements: false,
  });

  const $ = cheerio.load(inlined);
  /** Rules for clients that read stylesheets and attribute selectors; Gmail ignores them */
  const restore: string[] = [];
  let counter = 0;
  const giveBack = (el: any, declarations: string) => {
    const name = `fx${++counter}`;
    $(el).addClass(name);
    restore.push(`*[class~="${name}"]{${declarations}}`);
  };

  $("[style]").each((_, el) => {
    const node = $(el);
    const styles = parseStyle(node.attr("style") || "");
    if (!styles.size) return;
    const animated = styles.has("animation") || styles.has("animation-name");

    // Something that only appears through its animation would stay hidden without it
    if (animated && /^0(\.0+)?$/.test(styles.get("opacity") || "")) styles.delete("opacity");
    if (animated && styles.get("visibility") === "hidden") styles.delete("visibility");

    // Layers placed over the design, and 3D objects, fall into the text flow as
    // stray boxes once positioning and transforms are removed, so they are left out there
    const position = styles.get("position") || "";
    const hasContent = node.text().trim().length > 0 || node.find("img,svg,table,a").length > 0;
    const floatingLayer = /^(absolute|fixed)$/.test(position) && !hasContent;
    const solid = styles.get("transform-style") === "preserve-3d";
    if ((floatingLayer || solid) && styles.get("display") !== "none") {
      giveBack(el, `display:${styles.get("display") || "block"}!important`);
      styles.set("display", "none");
    }

    // Text drawn as an outline or filled with a gradient has no colour of its own
    const clip = styles.get("-webkit-background-clip") || styles.get("background-clip") || "";
    const clear = isClear(styles.get("color") || "") || isClear(styles.get("-webkit-text-fill-color") || "");
    if (clear) {
      const fallback =
        firstColor(styles.get("-webkit-text-stroke-color")) ||
        firstColor(styles.get("-webkit-text-stroke")) ||
        firstColor(styles.get("background-image")) ||
        firstColor(styles.get("background")) ||
        firstColor(styles.get("text-shadow")) ||
        "inherit";
      if (clip === "text") {
        // Without clipping the gradient would cover the text as a block
        const back = ["background", "background-image", "background-size", "background-position", "background-repeat", "-webkit-background-clip", "background-clip"]
          .filter((name) => styles.has(name))
          .map((name) => `${name}:${styles.get(name)}!important`);
        giveBack(el, [...back, "-webkit-text-fill-color:transparent!important"].join(";"));
        for (const name of ["background", "background-image", "background-size", "background-position", "background-repeat", "-webkit-background-clip", "background-clip"]) styles.delete(name);
        styles.delete("-webkit-text-fill-color");
        styles.set("color", fallback);
      } else {
        // The colour is used where the fill property is unknown; elsewhere the outline still shows
        styles.set("color", fallback);
        styles.delete("-webkit-text-fill-color");
        styles.set("-webkit-text-fill-color", "transparent");
      }
    }

    // A plain colour first, in case a layered background is rejected whole
    const background = styles.get("background");
    if (background && /gradient\(|url\(/i.test(background) && !styles.has("background-color")) {
      const under = baseColor(background);
      if (under) {
        const rest = [...styles];
        styles.clear();
        styles.set("background-color", under);
        for (const [name, value] of rest) styles.set(name, value);
        if (/^(td|th|table|body)$/i.test((el as any).tagName || "") && /^#[0-9a-f]{3,6}$/i.test(under)) node.attr("bgcolor", under);
      }
    }

    node.attr("style", writeStyle(styles));
  });

  if (restore.length && !dropStylesheet) {
    const sheet = `<style type="text/css">${restore.join("")}</style>`;
    if ($("head").length) $("head").append(sheet);
    else $.root().prepend(sheet);
  } else if (restore.length) {
    // No stylesheet is being sent, so the fallbacks are all any client will get
    $("[class]").each((_, el) => {
      const kept = ($(el).attr("class") || "").split(/\s+/).filter((name) => !/^fx\d+$/.test(name));
      if (kept.length) $(el).attr("class", kept.join(" "));
      else $(el).removeAttr("class");
    });
  }

  return $.html();
}
