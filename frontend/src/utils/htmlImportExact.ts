import { EmailSettings } from "@/types/email";
import { EmailSection, createBlock, createSection } from "@/lib/emailCore/schema";
import { stripActiveHtml } from "@/lib/emailCore/renderHtml";

/** Falcon's own block export carries this class; such HTML converts back to blocks without loss. */
export function isFalconExport(html: string): boolean {
  return /class="fc-container"/.test(html);
}

/**
 * Whether pasted HTML should be kept exactly as written. A hand-built email
 * relies on its own stylesheet and layout, which block conversion cannot carry
 * over, so anything that is a whole document and not Falcon's own export is kept.
 */
export function shouldImportExact(html: string): boolean {
  return !isFalconExport(html) && /<!doctype\s+html|<html[\s>]|<body[\s>]|<style[\s>]/i.test(html);
}

function isVisibleColor(color: string): boolean {
  return !!color && color !== "transparent" && !/rgba\([^)]*,\s*0\s*\)$/.test(color);
}

/** Renders the document off-screen to read the width it was designed for and its page colour. */
function measureDocument(html: string): Promise<{ width: number; background: string }> {
  const fallback = { width: 600, background: "" };
  return new Promise((resolve) => {
    const frame = document.createElement("iframe");
    frame.setAttribute("sandbox", "allow-same-origin");
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText = "position:fixed;left:-10000px;top:0;width:1200px;height:900px;border:0;visibility:hidden;";
    let done = false;
    const finish = (result: { width: number; background: string }) => {
      if (done) return;
      done = true;
      frame.remove();
      resolve(result);
    };
    const timer = window.setTimeout(() => finish(fallback), 4000);

    frame.onload = () => {
      window.clearTimeout(timer);
      try {
        const doc = frame.contentDocument;
        const view = frame.contentWindow;
        if (!doc?.body || !view) return finish(fallback);

        const bodyStyle = view.getComputedStyle(doc.body);
        const rootStyle = view.getComputedStyle(doc.documentElement);
        const background = isVisibleColor(bodyStyle.backgroundColor)
          ? bodyStyle.backgroundColor
          : isVisibleColor(rootStyle.backgroundColor) ? rootStyle.backgroundColor : "";

        // Walk down through full-width wrappers to the first element narrower than the page:
        // that is the email's own container. Padding on the wrappers above it is added back
        // so the container gets its full intended width inside the canvas.
        const pageWidth = doc.documentElement.clientWidth;
        let padding = (parseFloat(bodyStyle.paddingLeft) + parseFloat(bodyStyle.paddingRight)) || 0;
        let node: Element = doc.body;
        let width = 0;
        for (let depth = 0; depth < 12; depth++) {
          const children = Array.from(node.children).filter((child) => {
            if (/^(script|style|link|meta|title)$/i.test(child.tagName)) return false;
            const style = view.getComputedStyle(child);
            const rect = child.getBoundingClientRect();
            return style.display !== "none" && style.position !== "absolute" && style.position !== "fixed" && rect.width >= 200 && rect.height > 0;
          });
          if (!children.length) break;
          const narrow = children.find((child) => child.getBoundingClientRect().width < pageWidth - padding - 8);
          if (narrow) {
            width = narrow.getBoundingClientRect().width;
            break;
          }
          const next = children.reduce((a, b) => (b.getBoundingClientRect().height > a.getBoundingClientRect().height ? b : a));
          const style = view.getComputedStyle(next);
          padding += (parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)) || 0;
          node = next;
        }
        if (!width) return finish({ width: 600, background });
        finish({ width: Math.round(Math.min(900, Math.max(320, width + padding))), background });
      } catch {
        finish(fallback);
      }
    };

    frame.srcdoc = html;
    document.body.appendChild(frame);
  });
}

export interface ExactImportResult {
  sections: EmailSection[];
  settings: Partial<EmailSettings>;
}

/**
 * Imports an HTML email without rebuilding it: the whole document becomes one
 * HTML block, shown and sent exactly as written.
 */
export async function importHtmlExact(htmlString: string): Promise<ExactImportResult> {
  const html = stripActiveHtml(htmlString).trim();
  if (!html) throw new Error("Please paste some HTML first.");
  if (html.length > 400000) {
    throw new Error("This HTML is too large to import (the limit is about 400 KB). Host images as files rather than embedding them in the code.");
  }

  const full = /<html[\s>]|<body[\s>]/i.test(html)
    ? html
    : `<!DOCTYPE html>\n<html>\n<head><meta charset="UTF-8"></head>\n<body>\n${html}\n</body>\n</html>`;
  const { width, background } = await measureDocument(full);

  const settings: Partial<EmailSettings> = { emailWidth: width };
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(full)?.[1]?.replace(/\s+/g, " ").trim();
  if (title) settings.subject = title.slice(0, 300);
  if (background) {
    settings.backgroundColor = background;
    settings.contentBackground = background;
  }

  const block = createBlock("html", { html: full, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 });
  return { sections: [createSection([100], [[block]])], settings };
}
