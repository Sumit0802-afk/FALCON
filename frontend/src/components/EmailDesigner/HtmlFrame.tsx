import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { stripActiveHtml } from "@/lib/emailCore/renderHtml";
import { SOURCE_ATTR, annotateHtml } from "@/utils/htmlPick";

interface HtmlFrameProps {
  /** A complete HTML document */
  html: string;
  title?: string;
  /** Called with the source offset of the element that was clicked */
  onPick?: (offset: number) => void;
}

const ACTIVE = "data-fc-active";
const HOVER = "data-fc-hover";

// Outlines for the part under the pointer and the part whose code is open
const MARKER_CSS = `[${HOVER}]{outline:1px dashed rgba(0,208,132,.9)!important;outline-offset:1px!important;cursor:pointer!important}[${ACTIVE}]{outline:2px solid #00D084!important;outline-offset:1px!important}`;

/**
 * Shows a complete HTML email exactly as written.
 *
 * The document gets a frame of its own so that its stylesheet cannot leak into
 * the editor and the editor's styles cannot change the email. The frame runs no
 * scripts, and grows to the email's full height so it never scrolls on its own.
 * Clicking a part of the email reports where that part's code is.
 */
export default function HtmlFrame({ html, title = "Email content", onPick }: HtmlFrameProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(480);
  const source = useMemo(() => stripActiveHtml(onPick ? annotateHtml(html) : html), [html, onPick]);

  const measure = useCallback(() => {
    const doc = frame.current?.contentDocument;
    if (!doc?.body) return;
    const next = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
    if (next > 0) setHeight((current) => (Math.abs(current - next) > 1 ? next : current));
  }, []);

  const onLoad = useCallback(() => {
    measure();
    const doc = frame.current?.contentDocument;
    if (!doc?.body) return;
    const style = doc.createElement("style");
    style.textContent = MARKER_CSS;
    (doc.head || doc.body).appendChild(style);
    // Images and web fonts arrive after the first layout and change the height
    doc.querySelectorAll("img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", measure, { once: true });
    });
    doc.fonts?.ready.then(measure).catch(() => undefined);
  }, [measure]);

  // The email reflows when the canvas narrows (mobile preview, small screens)
  useEffect(() => {
    const node = frame.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(node);
    const timers = [300, 1200, 3000].map((ms) => window.setTimeout(measure, ms));
    return () => {
      observer.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [measure, source]);

  /** The element of the email under a point of the overlay */
  const elementAt = (e: React.MouseEvent): Element | null => {
    const node = frame.current;
    const doc = node?.contentDocument;
    if (!node || !doc) return null;
    const rect = node.getBoundingClientRect();
    const hit = doc.elementFromPoint(e.clientX - rect.left, e.clientY - rect.top);
    return hit?.closest(`[${SOURCE_ATTR}]`) ?? null;
  };

  const mark = (attr: string, element: Element | null) => {
    const doc = frame.current?.contentDocument;
    if (!doc) return;
    doc.querySelectorAll(`[${attr}]`).forEach((el) => { if (el !== element) el.removeAttribute(attr); });
    if (element && !element.hasAttribute(attr)) element.setAttribute(attr, "");
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!onPick) return;
    const element = elementAt(e);
    if (!element) return;
    mark(ACTIVE, element);
    onPick(Number(element.getAttribute(SOURCE_ATTR)) || 0);
  };

  return (
    <div style={{ position: "relative", width: "100%", lineHeight: 0 }}>
      <iframe
        ref={frame}
        title={title}
        srcDoc={source}
        sandbox="allow-same-origin"
        scrolling="no"
        onLoad={onLoad}
        style={{ display: "block", width: "100%", height, border: "none", background: "transparent" }}
      />
      {/* Clicks land here, so the block can be selected and the page scrolls normally */}
      <div
        style={{ position: "absolute", inset: 0, cursor: onPick ? "pointer" : undefined }}
        title={onPick ? "Click a part of the email to edit its code" : undefined}
        onClick={handleClick}
        onMouseMove={onPick ? (e) => mark(HOVER, elementAt(e)) : undefined}
        onMouseLeave={onPick ? () => mark(HOVER, null) : undefined}
      />
    </div>
  );
}
