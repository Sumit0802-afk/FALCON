import React, { useState, useRef, useCallback } from "react";
import {
  EmailBlock, TextBlock, HeadingBlock, ImageBlock, ButtonBlock,
  DividerBlock, SpacerBlock, SocialBlock, LogoBlock, HtmlBlock,
  Columns2Block, Columns3Block, HeroBlock, FeatureBlock,
  ProductBlock, CtaBlock, FooterBlock, SocialIcon,
} from "@/types/email";

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
    if (ref.current) onChange(ref.current.innerText);
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

// ─── Social Icon SVG ───────────────────────────────────────────────────────────

function SocialIconSvg({ platform, color, size }: { platform: string; color: string; size: number }) {
  const paths: Record<string, React.ReactNode> = {
    twitter:   <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.731-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill={color}/>,
    instagram: <><rect x="2" y="2" width="20" height="20" rx="5" stroke={color} strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="5" stroke={color} strokeWidth="2" fill="none"/><circle cx="17.5" cy="6.5" r="1" fill={color}/></>,
    facebook:  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill={color}/>,
    linkedin:  <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" fill={color}/><rect x="2" y="9" width="4" height="12" fill={color}/><circle cx="4" cy="4" r="2" fill={color}/></>,
    youtube:   <><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.95 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.4z" fill={color}/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white"/></>,
    github:    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      {paths[platform] ?? null}
    </svg>
  );
}

// ─── Block Renderer ────────────────────────────────────────────────────────────

interface BlockRendererProps {
  block: EmailBlock;
  onChange: (updated: EmailBlock) => void;
}

export default function BlockRenderer({ block, onChange }: BlockRendererProps) {
  const pad: React.CSSProperties = {
    paddingTop: block.paddingTop,
    paddingBottom: block.paddingBottom,
    paddingLeft: block.paddingLeft,
    paddingRight: block.paddingRight,
    backgroundColor: block.backgroundColor === "transparent" ? undefined : block.backgroundColor,
  };

  const update = useCallback(
    (partial: Partial<EmailBlock>) => onChange({ ...block, ...partial } as EmailBlock),
    [block, onChange]
  );

  // ── Text ──────────────────────────────────────────────────────────────────────
  if (block.type === "text") {
    const b = block as TextBlock;
    return (
      <div style={pad}>
        <Editable
          value={b.content}
          onChange={(v) => update({ content: v })}
          style={{
            fontFamily: b.fontFamily,
            fontSize: b.fontSize,
            fontWeight: b.fontWeight,
            color: b.color,
            textAlign: b.textAlign,
            lineHeight: b.lineHeight,
            letterSpacing: b.letterSpacing,
          }}
        />
      </div>
    );
  }

  // ── Heading ───────────────────────────────────────────────────────────────────
  if (block.type === "heading") {
    const b = block as HeadingBlock;
    const Tag = `h${b.level}` as "h1" | "h2" | "h3";
    return (
      <div style={pad}>
        <Editable
          value={b.content}
          onChange={(v) => update({ content: v })}
          multiline={false}
          style={{
            fontFamily: b.fontFamily,
            fontSize: b.fontSize,
            fontWeight: b.fontWeight,
            color: b.color,
            textAlign: b.textAlign,
            lineHeight: b.lineHeight,
            margin: 0,
          }}
        />
      </div>
    );
  }

  // ── Image ─────────────────────────────────────────────────────────────────────
  if (block.type === "image") {
    const b = block as ImageBlock;
    return (
      <div style={{ ...pad, textAlign: b.alignment }}>
        {b.src ? (
          <img
            src={b.src}
            alt={b.alt}
            style={{
              display: "inline-block",
              maxWidth: "100%",
              width: b.width === "100%" ? "100%" : b.width,
              borderRadius: b.borderRadius,
            }}
          />
        ) : (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: 180,
              background: "#f0f0f0",
              border: "2px dashed #ccc",
              borderRadius: b.borderRadius,
              color: "#999",
              fontSize: 13,
              fontFamily: "Arial, sans-serif",
              cursor: "pointer",
            }}
            onClick={() => {
              const url = window.prompt("Enter image URL:");
              if (url) update({ src: url });
            }}
          >
            📷 Click to set image URL
          </div>
        )}
      </div>
    );
  }

  // ── Button ────────────────────────────────────────────────────────────────────
  if (block.type === "button") {
    const b = block as ButtonBlock;
    return (
      <div style={{ ...pad, textAlign: b.alignment }}>
        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => update({ text: e.currentTarget.innerText })}
          style={{
            display: "inline-block",
            padding: "12px 28px",
            backgroundColor: b.bgColor,
            color: b.textColor,
            fontFamily: "Arial, sans-serif",
            fontSize: b.fontSize,
            fontWeight: b.fontWeight,
            borderRadius: b.borderRadius,
            cursor: "text",
            userSelect: "text",
            outline: "none",
            textDecoration: "none",
          }}
          dangerouslySetInnerHTML={{ __html: b.text }}
        />
      </div>
    );
  }

  // ── Divider ───────────────────────────────────────────────────────────────────
  if (block.type === "divider") {
    const b = block as DividerBlock;
    return (
      <div style={pad}>
        <hr style={{ border: "none", borderTop: `${b.thickness}px ${b.style} ${b.color}`, margin: 0 }} />
      </div>
    );
  }

  // ── Spacer ────────────────────────────────────────────────────────────────────
  if (block.type === "spacer") {
    const b = block as SpacerBlock;
    return (
      <div
        style={{ height: b.height, display: "flex", alignItems: "center", justifyContent: "center" }}
        className="group"
      >
        <div className="hidden w-full border-t border-dashed border-gray-200 text-center text-[10px] text-gray-400 group-hover:block">
          spacer {b.height}px
        </div>
      </div>
    );
  }

  // ── Social ────────────────────────────────────────────────────────────────────
  if (block.type === "social") {
    const b = block as SocialBlock;
    return (
      <div style={{ ...pad, textAlign: b.alignment }}>
        <div style={{ display: "inline-flex", gap: 12 }}>
          {b.icons.map((icon) => (
            <a key={icon.platform} href={icon.url} style={{ textDecoration: "none", display: "inline-block" }}>
              <SocialIconSvg platform={icon.platform} color={b.color} size={b.iconSize} />
            </a>
          ))}
        </div>
      </div>
    );
  }

  // ── Logo ──────────────────────────────────────────────────────────────────────
  if (block.type === "logo") {
    const b = block as LogoBlock;
    return (
      <div style={{ ...pad, textAlign: b.alignment }}>
        {b.src ? (
          <img src={b.src} alt={b.alt} style={{ display: "inline-block", width: b.width, maxWidth: "100%" }} />
        ) : (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: b.width,
              height: 48,
              background: "#f0f0f0",
              border: "2px dashed #ccc",
              borderRadius: 6,
              color: "#999",
              fontSize: 12,
              cursor: "pointer",
            }}
            onClick={() => {
              const url = window.prompt("Enter logo URL:");
              if (url) update({ src: url });
            }}
          >
            Set Logo
          </div>
        )}
      </div>
    );
  }

  // ── HTML ──────────────────────────────────────────────────────────────────────
  if (block.type === "html") {
    const b = block as HtmlBlock;
    return (
      <div style={pad}>
        <div dangerouslySetInnerHTML={{ __html: b.html }} />
      </div>
    );
  }

  // ── Columns 2 ─────────────────────────────────────────────────────────────────
  if (block.type === "columns2") {
    const b = block as Columns2Block;
    return (
      <div style={pad}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              {b.columns.map((col, i) => (
                <td
                  key={col.id}
                  style={{
                    width: "50%",
                    verticalAlign: "top",
                    padding: `0 ${b.gap / 2}px`,
                  }}
                >
                  <Editable
                    value={col.content}
                    onChange={(v) => {
                      const cols = [...b.columns] as typeof b.columns;
                      cols[i] = { ...cols[i], content: v };
                      update({ columns: cols });
                    }}
                    style={{
                      fontFamily: col.fontFamily,
                      fontSize: col.fontSize,
                      color: col.color,
                      textAlign: col.textAlign,
                      fontWeight: col.fontWeight,
                    }}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // ── Columns 3 ─────────────────────────────────────────────────────────────────
  if (block.type === "columns3") {
    const b = block as Columns3Block;
    return (
      <div style={pad}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              {b.columns.map((col, i) => (
                <td
                  key={col.id}
                  style={{
                    width: "33.33%",
                    verticalAlign: "top",
                    padding: `0 ${b.gap / 2}px`,
                  }}
                >
                  <Editable
                    value={col.content}
                    onChange={(v) => {
                      const cols = [...b.columns] as typeof b.columns;
                      cols[i] = { ...cols[i], content: v };
                      update({ columns: cols });
                    }}
                    style={{
                      fontFamily: col.fontFamily,
                      fontSize: col.fontSize,
                      color: col.color,
                      textAlign: col.textAlign,
                      fontWeight: col.fontWeight,
                    }}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // ── Hero ──────────────────────────────────────────────────────────────────────
  if (block.type === "hero") {
    const b = block as HeroBlock;
    return (
      <div
        style={{
          ...pad,
          backgroundImage: b.imageSrc ? `url(${b.imageSrc})` : undefined,
          backgroundColor: b.imageSrc ? undefined : "#222222",
          backgroundSize: "cover",
          backgroundPosition: "center",
          textAlign: b.textAlign,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: b.overlayColor,
            opacity: b.overlayOpacity,
          }}
        />
        <div style={{ position: "relative", zIndex: 1, padding: "32px 24px" }}>
          <Editable
            value={b.heading}
            onChange={(v) => update({ heading: v })}
            multiline={false}
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: 36,
              fontWeight: "bold",
              color: b.headingColor,
              marginBottom: 12,
              display: "block",
            }}
          />
          <Editable
            value={b.subheading}
            onChange={(v) => update({ subheading: v })}
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: 16,
              color: b.subheadingColor,
              marginBottom: 24,
              display: "block",
            }}
          />
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => update({ buttonText: e.currentTarget.innerText })}
            style={{
              display: "inline-block",
              padding: "12px 28px",
              backgroundColor: b.buttonBg,
              color: b.buttonColor,
              fontFamily: "Arial, sans-serif",
              fontSize: 14,
              fontWeight: "bold",
              borderRadius: 6,
              cursor: "text",
              outline: "none",
            }}
            dangerouslySetInnerHTML={{ __html: b.buttonText }}
          />
        </div>
      </div>
    );
  }

  // ── Feature ───────────────────────────────────────────────────────────────────
  if (block.type === "feature") {
    const b = block as FeatureBlock;
    const imgCell = (
      <td style={{ width: "40%", verticalAlign: "top", paddingRight: b.imageAlign === "left" ? 16 : 0, paddingLeft: b.imageAlign === "right" ? 16 : 0 }}>
        {b.imageSrc
          ? <img src={b.imageSrc} alt="" style={{ maxWidth: "100%", borderRadius: 6 }} />
          : <div style={{ height: 140, background: "#f0f0f0", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#bbb", fontSize: 12, cursor: "pointer" }} onClick={() => { const u = window.prompt("Image URL:"); if (u) update({ imageSrc: u }); }}>📷 Set image</div>
        }
      </td>
    );
    const txtCell = (
      <td style={{ verticalAlign: "top", color: b.color, fontFamily: "Arial, sans-serif" }}>
        <Editable value={b.heading} onChange={(v) => update({ heading: v })} multiline={false} style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8, display: "block" }} />
        <Editable value={b.body} onChange={(v) => update({ body: v })} style={{ fontSize: 14, lineHeight: 1.6 }} />
      </td>
    );
    return (
      <div style={pad}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              {b.imageAlign === "left" ? <>{imgCell}{txtCell}</> : <>{txtCell}{imgCell}</>}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // ── Product ───────────────────────────────────────────────────────────────────
  if (block.type === "product") {
    const b = block as ProductBlock;
    return (
      <div style={{ ...pad, textAlign: "center", fontFamily: "Arial, sans-serif" }}>
        {b.imageSrc
          ? <img src={b.imageSrc} alt={b.name} style={{ maxWidth: "100%", marginBottom: 16 }} />
          : <div style={{ height: 180, background: "#f0f0f0", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#bbb", cursor: "pointer" }} onClick={() => { const u = window.prompt("Image URL:"); if (u) update({ imageSrc: u }); }}>📷 Set image</div>
        }
        <Editable value={b.name} onChange={(v) => update({ name: v })} multiline={false} style={{ fontSize: 22, fontWeight: "bold", display: "block", marginBottom: 4 }} />
        <Editable value={b.price} onChange={(v) => update({ price: v })} multiline={false} style={{ fontSize: 20, fontWeight: "bold", color: "#111", display: "block", marginBottom: 8 }} />
        <Editable value={b.description} onChange={(v) => update({ description: v })} style={{ fontSize: 14, color: "#666", display: "block", marginBottom: 16 }} />
        <span
          contentEditable suppressContentEditableWarning
          onBlur={(e) => update({ buttonText: e.currentTarget.innerText })}
          style={{ display: "inline-block", padding: "10px 24px", backgroundColor: b.buttonBg, color: b.buttonColor, borderRadius: 6, fontWeight: "bold", cursor: "text", outline: "none" }}
          dangerouslySetInnerHTML={{ __html: b.buttonText }}
        />
      </div>
    );
  }

  // ── CTA ───────────────────────────────────────────────────────────────────────
  if (block.type === "cta") {
    const b = block as CtaBlock;
    return (
      <div style={{ ...pad, textAlign: b.textAlign, fontFamily: "Arial, sans-serif" }}>
        <Editable value={b.heading} onChange={(v) => update({ heading: v })} multiline={false} style={{ fontSize: 28, fontWeight: "bold", color: b.headingColor, display: "block", marginBottom: 8 }} />
        <Editable value={b.subheading} onChange={(v) => update({ subheading: v })} style={{ fontSize: 15, color: b.subheadingColor, display: "block", marginBottom: 24 }} />
        <span
          contentEditable suppressContentEditableWarning
          onBlur={(e) => update({ buttonText: e.currentTarget.innerText })}
          style={{ display: "inline-block", padding: "13px 30px", backgroundColor: b.buttonBg, color: b.buttonColor, borderRadius: 6, fontSize: 15, fontWeight: "bold", cursor: "text", outline: "none" }}
          dangerouslySetInnerHTML={{ __html: b.buttonText }}
        />
      </div>
    );
  }

  // ── Footer ────────────────────────────────────────────────────────────────────
  if (block.type === "footer_block") {
    const b = block as FooterBlock;
    return (
      <div style={{ ...pad, textAlign: b.textAlign, fontFamily: "Arial, sans-serif", fontSize: b.fontSize, color: b.textColor }}>
        <Editable value={b.companyName} onChange={(v) => update({ companyName: v })} multiline={false} style={{ display: "block", marginBottom: 4, fontWeight: "bold" }} />
        <Editable value={b.address} onChange={(v) => update({ address: v })} style={{ display: "block", marginBottom: 6 }} />
        <div>
          <a href={b.unsubscribeUrl} style={{ color: b.textColor }}>Unsubscribe</a>
        </div>
      </div>
    );
  }

  return <div style={pad}><em style={{ color: "#aaa", fontSize: 12 }}>Unknown block: {(block as any).type}</em></div>;
}
