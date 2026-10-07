import React, { useState, useRef, useCallback } from "react";
import {
  EmailBlock, ImageBlock, TextAlign,
} from "@/types/email";
import { SOCIAL_LABELS, contrastColor, videoPoster } from "@/lib/emailCore/renderHtml";
import { pickHtml } from "@/utils/htmlPick";
import { isFullHtmlDocument } from "@/lib/emailCore/schema";
import HtmlFrame from "./HtmlFrame";

// ─── Inline Editable Text ──────────────────────────────────────────────────────

interface EditableProps {
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
  className?: string;
  multiline?: boolean;
}

function Editable({ value, onChange, style, className, multiline = true }: EditableProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);

  const handleBlur = () => {
    setEditing(false);
    if (ref.current && ref.current.innerText !== value) onChange(ref.current.innerText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      ref.current?.blur();
    }
  };

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onFocus={() => setEditing(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={style}
      className={`outline-none ${editing ? "ring-2 ring-blue-400/40 ring-offset-1" : ""} ${className ?? ""}`}
      dangerouslySetInnerHTML={editing ? undefined : { __html: value.replace(/\n/g, "<br>") }}
    />
  );
}

/** Button label that can be edited in place. */
function EditableLabel({ value, onChange, style }: { value: string; onChange: (v: string) => void; style: React.CSSProperties }) {
  return (
    <span
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => { if (e.currentTarget.innerText !== value) onChange(e.currentTarget.innerText); }}
      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } }}
      style={{ cursor: "text", userSelect: "text", outline: "none", textDecoration: "none", lineHeight: 1.2, ...style }}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
}

function ImagePlaceholder({ height, radius, label, onPick }: { height: number; radius: number; label: string; onPick: (url: string) => void }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height, background: "#f0f0f0",
        border: "2px dashed #ccc", borderRadius: radius, color: "#999", fontSize: 13, fontFamily: "Arial, sans-serif",
        cursor: "pointer", boxSizing: "border-box",
      }}
      onClick={() => {
        const url = window.prompt("Enter image URL:");
        if (url) onPick(url);
      }}
    >
      {label}
    </div>
  );
}

// ─── Resizable Image ──────────────────────────────────────────────────────────

function ResizableImage({ block, selected, onResize }: { block: ImageBlock; selected: boolean; onResize: (width: number | "100%") => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<number | null>(null);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wrap = wrapRef.current;
    if (!wrap || !wrap.parentElement) return;
    const max = wrap.parentElement.clientWidth;
    const startX = e.clientX;
    const startWidth = wrap.getBoundingClientRect().width;
    // A centred image grows on both sides, so the pointer covers half the change
    const factor = block.alignment === "center" ? 2 : block.alignment === "right" ? -1 : 1;
    let latest = startWidth;

    const move = (ev: MouseEvent) => {
      latest = Math.round(Math.min(max, Math.max(40, startWidth + (ev.clientX - startX) * factor)));
      setDraft(latest);
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      setDraft(null);
      // One history entry for the whole drag, snapping back to fluid at full width
      onResize(latest >= max - 4 ? "100%" : latest);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const width = draft ?? (block.width === "100%" ? "100%" : block.width);
  return (
    <div ref={wrapRef} style={{ display: "inline-block", position: "relative", width, maxWidth: "100%", verticalAlign: "top" }}>
      <img src={block.src} alt={block.alt} draggable={false} style={{ display: "block", width: "100%", borderRadius: block.borderRadius }} />
      {selected && (
        <>
          <div
            onMouseDown={startResize}
            title="Drag to resize"
            style={{
              position: "absolute", right: -6, bottom: -6, width: 14, height: 14, borderRadius: 3, background: "#00D084",
              border: "2px solid #fff", cursor: "nwse-resize", zIndex: 20,
            }}
          />
          {draft !== null && (
            <div style={{ position: "absolute", right: 6, bottom: 6, padding: "2px 6px", borderRadius: 4, background: "rgba(0,0,0,0.75)", color: "#fff", fontSize: 10, fontFamily: "monospace" }}>
              {draft}px
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Block Renderer ────────────────────────────────────────────────────────────

interface BlockRendererProps {
  block: EmailBlock;
  selected?: boolean;
  onChange: (updated: EmailBlock) => void;
}

function justify(align: TextAlign): string {
  return align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
}

export default function BlockRenderer({ block, selected = false, onChange }: BlockRendererProps) {
  const pad: React.CSSProperties = {
    paddingTop: block.paddingTop,
    paddingBottom: block.paddingBottom,
    paddingLeft: block.paddingLeft,
    paddingRight: block.paddingRight,
    backgroundColor: block.backgroundColor === "transparent" ? undefined : block.backgroundColor,
    border: block.borderWidth > 0 ? `${block.borderWidth}px ${block.borderStyle} ${block.borderColor}` : undefined,
    borderRadius: block.cornerRadius || undefined,
    boxSizing: "border-box",
  };

  const update = useCallback(
    (partial: Partial<EmailBlock>) => onChange({ ...block, ...partial } as EmailBlock),
    [block, onChange]
  );

  switch (block.type) {
    case "text":
      return (
        <div style={pad}>
          <Editable
            value={block.content}
            onChange={(v) => update({ content: v })}
            style={{
              fontFamily: block.fontFamily, fontSize: block.fontSize, fontWeight: block.fontWeight, color: block.color,
              textAlign: block.textAlign, lineHeight: block.lineHeight, letterSpacing: block.letterSpacing,
            }}
          />
        </div>
      );

    case "heading":
      return (
        <div style={pad}>
          <Editable
            value={block.content}
            onChange={(v) => update({ content: v })}
            multiline={false}
            style={{
              fontFamily: block.fontFamily, fontSize: block.fontSize, fontWeight: block.fontWeight, color: block.color,
              textAlign: block.textAlign, lineHeight: block.lineHeight, letterSpacing: block.letterSpacing,
              textTransform: block.uppercase ? "uppercase" : undefined, margin: 0,
            }}
          />
        </div>
      );

    case "image":
      return (
        <div style={{ ...pad, textAlign: block.alignment }}>
          {block.src ? (
            <ResizableImage block={block} selected={selected} onResize={(width) => update({ width })} />
          ) : (
            <ImagePlaceholder height={180} radius={block.borderRadius} label="📷 Click to set image URL" onPick={(src) => update({ src })} />
          )}
        </div>
      );

    case "button": {
      const outline = block.outlineColor ? `2px solid ${block.outlineColor}` : undefined;
      return (
        <div style={{ ...pad, display: "flex", justifyContent: justify(block.alignment) }}>
          <EditableLabel
            value={block.text}
            onChange={(text) => update({ text })}
            style={{
              display: "inline-block", width: block.width === "full" ? "100%" : undefined, boxSizing: "border-box",
              textAlign: "center", padding: `${block.paddingV}px ${block.paddingH}px`, backgroundColor: block.bgColor,
              color: block.textColor, fontFamily: block.fontFamily, fontSize: block.fontSize, fontWeight: block.fontWeight,
              borderRadius: block.borderRadius, border: outline,
            }}
          />
        </div>
      );
    }

    case "divider":
      return (
        <div style={pad}>
          <hr style={{ border: "none", borderTop: `${block.thickness}px ${block.style} ${block.color}`, margin: "0 auto", width: `${block.widthPercent}%` }} />
        </div>
      );

    case "spacer":
      return (
        <div
          style={{ height: block.height, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: pad.backgroundColor }}
          className="group/spacer"
        >
          <div className="hidden w-full border-t border-dashed border-gray-300 text-center text-[10px] text-gray-400 group-hover/spacer:block">
            spacer {block.height}px
          </div>
        </div>
      );

    case "social":
      return (
        <div style={{ ...pad, display: "flex", justifyContent: justify(block.alignment) }}>
          <div style={{ display: "inline-flex", gap: block.gap }}>
            {block.icons.map((icon, i) => (
              <span
                key={`${icon.platform}-${i}`}
                title={SOCIAL_LABELS[icon.platform]?.name}
                style={{
                  display: "inline-block", width: block.iconSize, height: block.iconSize, lineHeight: `${block.iconSize}px`,
                  borderRadius: block.iconSize, backgroundColor: block.color, color: contrastColor(block.color),
                  fontFamily: "Arial, Helvetica, sans-serif", fontSize: Math.round(block.iconSize * 0.38), fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {SOCIAL_LABELS[icon.platform]?.short}
              </span>
            ))}
          </div>
        </div>
      );

    case "logo":
      return (
        <div style={{ ...pad, textAlign: block.alignment }}>
          {block.src ? (
            <img src={block.src} alt={block.alt} draggable={false} style={{ display: "inline-block", width: block.width, maxWidth: "100%" }} />
          ) : (
            <Editable
              value={block.text}
              onChange={(text) => update({ text })}
              multiline={false}
              style={{
                fontFamily: block.fontFamily, fontSize: block.fontSize, fontWeight: "bold", letterSpacing: block.letterSpacing,
                color: block.textColor,
              }}
            />
          )}
        </div>
      );

    case "html":
      // A whole document brings its own stylesheet, so it is shown in a frame of its own
      if (isFullHtmlDocument(block.html)) {
        return (
          <div style={pad}>
            <HtmlFrame html={block.html} onPick={(offset) => pickHtml(block.id, offset)} />
          </div>
        );
      }
      return (
        <div style={pad}>
          <div dangerouslySetInnerHTML={{ __html: block.html }} />
        </div>
      );

    case "video": {
      const poster = block.thumbnailSrc || videoPoster(block.videoUrl);
      return (
        <div style={{ ...pad, textAlign: "center" }}>
          {poster ? (
            <div style={{ position: "relative" }}>
              <img src={poster} alt={block.alt} draggable={false} style={{ display: "block", width: "100%", borderRadius: block.borderRadius }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <div style={{ width: 56, height: 56, borderRadius: 56, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 22, lineHeight: "56px" }}>▶</div>
              </div>
            </div>
          ) : (
            <ImagePlaceholder height={200} radius={block.borderRadius} label="▶ Click to set a poster image URL" onPick={(thumbnailSrc) => update({ thumbnailSrc })} />
          )}
          <div style={{ height: 12 }} />
          <EditableLabel
            value={block.buttonText}
            onChange={(buttonText) => update({ buttonText })}
            style={{
              display: "inline-block", padding: "10px 22px", backgroundColor: block.buttonBg, color: block.buttonColor,
              fontFamily: "Arial, Helvetica, sans-serif", fontSize: 14, fontWeight: "bold", borderRadius: 999,
            }}
          />
        </div>
      );
    }

    case "icons": {
      const badge = (glyph: string) => (
        <div
          style={{
            width: block.iconSize, height: block.iconSize, lineHeight: `${block.iconSize}px`, borderRadius: block.iconSize,
            backgroundColor: block.iconBg, color: block.iconColor, fontFamily: "Arial, sans-serif",
            fontSize: Math.round(block.iconSize * 0.45), textAlign: "center", flexShrink: 0, margin: block.layout === "row" ? "0 auto" : undefined,
          }}
        >
          {glyph}
        </div>
      );
      const setItem = (index: number, patch: Partial<(typeof block.items)[number]>) =>
        update({ items: block.items.map((item, i) => (i === index ? { ...item, ...patch } : item)) });
      const align = block.layout === "row" ? "center" : "left";
      return (
        <div style={pad}>
          <div style={{ display: "flex", flexDirection: block.layout === "row" ? "row" : "column", gap: 12 }}>
            {block.items.map((item, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: block.layout === "row" ? "column" : "row", gap: block.layout === "row" ? 8 : 14, alignItems: block.layout === "row" ? "stretch" : "center" }}>
                {badge(item.glyph)}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Editable
                    value={item.label}
                    onChange={(label) => setItem(i, { label })}
                    multiline={false}
                    style={{ fontFamily: block.fontFamily, fontSize: block.fontSize + 1, fontWeight: "bold", color: block.labelColor, textAlign: align, lineHeight: 1.4 }}
                  />
                  {(item.text || selected) && (
                    <Editable
                      value={item.text}
                      onChange={(text) => setItem(i, { text })}
                      style={{ fontFamily: block.fontFamily, fontSize: block.fontSize, color: block.textColor, textAlign: align, lineHeight: 1.5, minHeight: 4 }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "menu":
      return (
        <div style={{ ...pad, textAlign: block.alignment }}>
          {block.links.map((link, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <span style={{ color: block.color, opacity: 0.5, padding: "0 10px", fontFamily: block.fontFamily, fontSize: block.fontSize }}>
                  {block.separator || " "}
                </span>
              )}
              <span
                style={{
                  fontFamily: block.fontFamily, fontSize: block.fontSize, fontWeight: block.fontWeight, color: block.color,
                  letterSpacing: block.letterSpacing, textTransform: block.uppercase ? "uppercase" : undefined,
                }}
              >
                {link.label}
              </span>
            </React.Fragment>
          ))}
        </div>
      );

    case "hero":
      return (
        <div
          style={{
            backgroundImage: block.imageSrc ? `url(${block.imageSrc})` : undefined, backgroundColor: block.fallbackColor,
            backgroundSize: "cover", backgroundPosition: "center", position: "relative",
            border: pad.border, borderRadius: pad.borderRadius, overflow: "hidden",
          }}
        >
          {block.imageSrc && (
            <div style={{ position: "absolute", inset: 0, backgroundColor: block.overlayColor, opacity: block.overlayOpacity }} />
          )}
          <div
            style={{
              position: "relative", zIndex: 1, textAlign: block.textAlign, paddingTop: block.paddingTop,
              paddingBottom: block.paddingBottom, paddingLeft: block.paddingLeft, paddingRight: block.paddingRight,
            }}
          >
            <Editable
              value={block.heading}
              onChange={(heading) => update({ heading })}
              multiline={false}
              style={{ fontFamily: block.headingFont, fontSize: block.headingSize, lineHeight: 1.2, fontWeight: "bold", color: block.headingColor, marginBottom: 12 }}
            />
            <Editable
              value={block.subheading}
              onChange={(subheading) => update({ subheading })}
              style={{ fontFamily: block.fontFamily, fontSize: 16, lineHeight: 1.55, color: block.subheadingColor, marginBottom: block.buttonText ? 24 : 0 }}
            />
            {block.buttonText && (
              <EditableLabel
                value={block.buttonText}
                onChange={(buttonText) => update({ buttonText })}
                style={{
                  display: "inline-block", padding: "13px 30px", backgroundColor: block.buttonBg, color: block.buttonColor,
                  fontFamily: block.fontFamily, fontSize: 15, fontWeight: "bold", borderRadius: block.buttonRadius,
                }}
              />
            )}
          </div>
        </div>
      );

    case "feature": {
      const imgCell = (
        <td style={{ width: "40%", verticalAlign: "top", paddingRight: block.imageAlign === "left" ? 16 : 0, paddingLeft: block.imageAlign === "right" ? 16 : 0 }}>
          {block.imageSrc
            ? <img src={block.imageSrc} alt="" draggable={false} style={{ display: "block", width: "100%", borderRadius: block.imageRadius }} />
            : <ImagePlaceholder height={140} radius={block.imageRadius} label="📷 Set image" onPick={(imageSrc) => update({ imageSrc })} />}
        </td>
      );
      const txtCell = (
        <td style={{ verticalAlign: "top", color: block.color }}>
          <Editable value={block.heading} onChange={(heading) => update({ heading })} multiline={false} style={{ fontFamily: block.headingFont, fontSize: 20, lineHeight: 1.3, fontWeight: "bold", marginBottom: 8 }} />
          <Editable value={block.body} onChange={(body) => update({ body })} style={{ fontFamily: block.fontFamily, fontSize: 14, lineHeight: 1.6 }} />
        </td>
      );
      return (
        <div style={pad}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>{block.imageAlign === "left" ? <>{imgCell}{txtCell}</> : <>{txtCell}{imgCell}</>}</tr>
            </tbody>
          </table>
        </div>
      );
    }

    case "product":
      return (
        <div style={{ ...pad, textAlign: block.textAlign }}>
          {block.imageSrc
            ? <img src={block.imageSrc} alt={block.name} draggable={false} style={{ display: "block", width: "100%", borderRadius: block.imageRadius }} />
            : <ImagePlaceholder height={180} radius={block.imageRadius} label="📷 Set image" onPick={(imageSrc) => update({ imageSrc })} />}
          <div style={{ height: 16 }} />
          {block.badge && (
            <div style={{ marginBottom: 10 }}>
              <EditableLabel
                value={block.badge}
                onChange={(badge) => update({ badge })}
                style={{
                  display: "inline-block", padding: "4px 12px", borderRadius: 999, backgroundColor: block.badgeBg, color: block.badgeColor,
                  fontFamily: block.fontFamily, fontSize: 11, fontWeight: "bold", letterSpacing: 1, textTransform: "uppercase",
                }}
              />
            </div>
          )}
          <Editable value={block.name} onChange={(name) => update({ name })} multiline={false} style={{ fontFamily: block.headingFont, fontSize: 22, lineHeight: 1.3, fontWeight: "bold", color: block.nameColor, marginBottom: 4 }} />
          <Editable value={block.price} onChange={(price) => update({ price })} multiline={false} style={{ fontFamily: block.fontFamily, fontSize: 20, fontWeight: "bold", color: block.priceColor, marginBottom: 8 }} />
          <Editable value={block.description} onChange={(description) => update({ description })} style={{ fontFamily: block.fontFamily, fontSize: 14, lineHeight: 1.6, color: block.descriptionColor, marginBottom: 16 }} />
          {block.buttonText && (
            <EditableLabel
              value={block.buttonText}
              onChange={(buttonText) => update({ buttonText })}
              style={{ display: "inline-block", padding: "11px 24px", backgroundColor: block.buttonBg, color: block.buttonColor, borderRadius: block.buttonRadius, fontFamily: block.fontFamily, fontSize: 14, fontWeight: "bold" }}
            />
          )}
        </div>
      );

    case "cta":
      return (
        <div style={{ ...pad, textAlign: block.textAlign }}>
          <Editable value={block.heading} onChange={(heading) => update({ heading })} multiline={false} style={{ fontFamily: block.headingFont, fontSize: 28, lineHeight: 1.25, fontWeight: "bold", color: block.headingColor, marginBottom: 8 }} />
          <Editable value={block.subheading} onChange={(subheading) => update({ subheading })} style={{ fontFamily: block.fontFamily, fontSize: 15, lineHeight: 1.6, color: block.subheadingColor, marginBottom: block.buttonText ? 24 : 0 }} />
          {block.buttonText && (
            <EditableLabel
              value={block.buttonText}
              onChange={(buttonText) => update({ buttonText })}
              style={{ display: "inline-block", padding: "13px 30px", backgroundColor: block.buttonBg, color: block.buttonColor, borderRadius: block.buttonRadius, fontFamily: block.fontFamily, fontSize: 15, fontWeight: "bold" }}
            />
          )}
        </div>
      );

    case "footer_block":
      return (
        <div style={{ ...pad, textAlign: block.textAlign, fontFamily: block.fontFamily, fontSize: block.fontSize, lineHeight: 1.5, color: block.textColor }}>
          <Editable value={block.companyName} onChange={(companyName) => update({ companyName })} multiline={false} style={{ marginBottom: 6, fontWeight: "bold" }} />
          <Editable value={block.address} onChange={(address) => update({ address })} style={{ marginBottom: 6 }} />
          <Editable value={block.unsubscribeText} onChange={(unsubscribeText) => update({ unsubscribeText })} multiline={false} style={{ textDecoration: "underline" }} />
        </div>
      );

    default:
      return <div style={pad}><em style={{ color: "#aaa", fontSize: 12 }}>Unknown block: {(block as { type: string }).type}</em></div>;
  }
}
