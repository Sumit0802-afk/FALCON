/**
 * Email-safe HTML export.
 *
 * Output is table-based with inline styles, so it survives clients that strip
 * <style> blocks (Gmail app, Outlook desktop). A small media query stacks
 * columns and scales images on narrow screens for clients that do honour it.
 */

import {
  EmailBlock, EmailColumn, EmailDocument, EmailSection, SocialPlatform, TextAlign, exactHtmlOf,
} from "./schema";

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Text content may carry simple inline markup; anything executable is removed. */
export function sanitizeInlineHtml(value: string): string {
  return String(value ?? "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*\/?\s*(script|style|iframe|object|embed|link|meta)[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1="#"')
    .replace(/\n/g, "<br>");
}

/**
 * Removes anything that could run code from a complete HTML document while
 * leaving its markup and stylesheet untouched.
 */
export function stripActiveHtml(value: string): string {
  return String(value ?? "")
    .replace(/<\s*(script|iframe|object|embed)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*\/?\s*(script|iframe|object|embed)[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1="#"');
}

function safeUrl(url: string): string {
  const trimmed = String(url ?? "").trim();
  if (!trimmed) return "#";
  if (/^\s*(javascript|data|vbscript):/i.test(trimmed)) return "#";
  return escapeHtml(trimmed);
}

function isTransparent(color: string): boolean {
  return !color || color === "transparent";
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Picks black or white, whichever reads better on the given background. */
export function contrastColor(background: string): string {
  const rgb = hexToRgb(background);
  if (!rgb) return "#ffffff";
  const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  return luminance > 0.6 ? "#111111" : "#ffffff";
}

function rgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex) || [0, 0, 0];
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${Math.max(0, Math.min(1, alpha))})`;
}

export const SOCIAL_LABELS: Record<SocialPlatform, { short: string; name: string }> = {
  twitter: { short: "X", name: "X" },
  instagram: { short: "IG", name: "Instagram" },
  facebook: { short: "f", name: "Facebook" },
  linkedin: { short: "in", name: "LinkedIn" },
  youtube: { short: "▶", name: "YouTube" },
  github: { short: "GH", name: "GitHub" },
  tiktok: { short: "TT", name: "TikTok" },
  pinterest: { short: "P", name: "Pinterest" },
  whatsapp: { short: "WA", name: "WhatsApp" },
  website: { short: "www", name: "Website" },
};

/** Poster image for well-known video hosts, used when the block has no thumbnail of its own. */
export function videoPoster(videoUrl: string): string {
  const yt = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/.exec(videoUrl || "");
  return yt ? `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg` : "";
}

// ─── Building blocks ──────────────────────────────────────────────────────────

const TABLE = `role="presentation" cellpadding="0" cellspacing="0" border="0"`;

function cellStyle(block: EmailBlock): string {
  let style = `padding:${block.paddingTop}px ${block.paddingRight}px ${block.paddingBottom}px ${block.paddingLeft}px;`;
  if (!isTransparent(block.backgroundColor)) style += `background-color:${block.backgroundColor};`;
  if (block.borderWidth > 0) style += `border:${block.borderWidth}px ${block.borderStyle} ${block.borderColor};`;
  if (block.cornerRadius > 0) style += `border-radius:${block.cornerRadius}px;`;
  return style;
}

function bgAttr(color: string): string {
  return isTransparent(color) ? "" : ` bgcolor="${escapeHtml(color)}"`;
}

function row(block: EmailBlock, align: TextAlign | "", inner: string, extraStyle = ""): string {
  const alignAttr = align ? ` align="${align}"` : "";
  return `<tr><td${alignAttr}${bgAttr(block.backgroundColor)} style="${cellStyle(block)}${extraStyle}">${inner}</td></tr>`;
}

interface ButtonOptions {
  text: string;
  url: string;
  bg: string;
  color: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  radius: number;
  paddingV: number;
  paddingH: number;
  align: TextAlign;
  full?: boolean;
  outline?: string;
}

/** A "bulletproof" button: the colour lives on a table cell so Outlook renders it too. */
function button(o: ButtonOptions): string {
  const border = o.outline ? `border:2px solid ${o.outline};` : "";
  const link = `<a href="${safeUrl(o.url)}" target="_blank" style="display:${o.full ? "block" : "inline-block"};padding:${o.paddingV}px ${o.paddingH}px;font-family:${o.fontFamily};font-size:${o.fontSize}px;font-weight:${o.fontWeight};line-height:1.2;color:${o.color};text-decoration:none;text-align:center;border-radius:${o.radius}px;${border}">${escapeHtml(o.text)}</a>`;
  return `<table ${TABLE} align="${o.align}"${o.full ? ` width="100%"` : ""} style="${o.align === "center" ? "margin:0 auto;" : ""}"><tr><td align="center" bgcolor="${escapeHtml(o.bg)}" style="background-color:${o.bg};border-radius:${o.radius}px;">${link}</td></tr></table>`;
}

function image(src: string, alt: string, widthPx: number, radius: number, align: TextAlign, fluid: boolean): string {
  const w = Math.max(1, Math.round(widthPx));
  if (!src) {
    return `<table ${TABLE} width="100%"><tr><td height="160" align="center" bgcolor="#e5e7eb" style="height:160px;background-color:#e5e7eb;border-radius:${radius}px;font-family:Arial,sans-serif;font-size:13px;color:#9ca3af;">${escapeHtml(alt || "Image")}</td></tr></table>`;
  }
  const margin = align === "center" ? "margin:0 auto;" : align === "right" ? "margin-left:auto;" : "";
  return `<img src="${safeUrl(src)}" alt="${escapeHtml(alt)}" width="${w}" class="${fluid ? "fc-img" : ""}" style="display:block;width:${fluid ? "100%" : w + "px"};max-width:${w}px;height:auto;border:0;outline:none;text-decoration:none;border-radius:${radius}px;${margin}">`;
}

function wrapLink(inner: string, url: string): string {
  if (!url || url === "#") return inner;
  return `<a href="${safeUrl(url)}" target="_blank" style="text-decoration:none;">${inner}</a>`;
}

// ─── Block renderers ──────────────────────────────────────────────────────────

/** `width` is the pixel width available to the block, used for image sizing. */
function renderBlock(block: EmailBlock, width: number): string {
  const inner = Math.max(40, width - block.paddingLeft - block.paddingRight);

  switch (block.type) {
    case "text":
      return row(block, block.textAlign, sanitizeInlineHtml(block.content),
        `font-family:${block.fontFamily};font-size:${block.fontSize}px;font-weight:${block.fontWeight};color:${block.color};line-height:${block.lineHeight};letter-spacing:${block.letterSpacing}px;text-align:${block.textAlign};`);

    case "heading": {
      const style = `margin:0;padding:0;font-family:${block.fontFamily};font-size:${block.fontSize}px;font-weight:${block.fontWeight};color:${block.color};line-height:${block.lineHeight};letter-spacing:${block.letterSpacing}px;text-align:${block.textAlign};${block.uppercase ? "text-transform:uppercase;" : ""}`;
      return row(block, block.textAlign, `<h${block.level} style="${style}">${sanitizeInlineHtml(block.content)}</h${block.level}>`);
    }

    case "image": {
      const px = block.width === "100%" ? inner : Math.min(block.width, inner);
      return row(block, block.alignment, wrapLink(image(block.src, block.alt, px, block.borderRadius, block.alignment, block.width === "100%"), block.linkUrl));
    }

    case "button":
      return row(block, block.alignment, button({
        text: block.text, url: block.linkUrl, bg: block.bgColor, color: block.textColor, fontFamily: block.fontFamily,
        fontSize: block.fontSize, fontWeight: block.fontWeight, radius: block.borderRadius, paddingV: block.paddingV,
        paddingH: block.paddingH, align: block.alignment, full: block.width === "full", outline: block.outlineColor,
      }));

    case "divider":
      return row(block, "center", `<table ${TABLE} width="${block.widthPercent}%" align="center" style="margin:0 auto;"><tr><td style="border-top:${block.thickness}px ${block.style} ${block.color};font-size:0;line-height:0;height:0;">&nbsp;</td></tr></table>`);

    case "spacer":
      return `<tr><td${bgAttr(block.backgroundColor)} height="${block.height}" style="height:${block.height}px;font-size:0;line-height:0;${isTransparent(block.backgroundColor) ? "" : `background-color:${block.backgroundColor};`}">&nbsp;</td></tr>`;

    case "social": {
      const size = block.iconSize;
      const cells = block.icons.map((icon) => {
        const label = SOCIAL_LABELS[icon.platform] || { short: "•", name: icon.platform };
        return `<td style="padding:0 ${block.gap / 2}px;"><a href="${safeUrl(icon.url)}" target="_blank" title="${escapeHtml(label.name)}" style="display:block;width:${size}px;height:${size}px;line-height:${size}px;border-radius:${size}px;background-color:${block.color};color:${contrastColor(block.color)};font-family:Arial,Helvetica,sans-serif;font-size:${Math.round(size * 0.38)}px;font-weight:bold;text-align:center;text-decoration:none;">${escapeHtml(label.short)}</a></td>`;
      }).join("");
      return row(block, block.alignment, `<table ${TABLE} align="${block.alignment}" style="${block.alignment === "center" ? "margin:0 auto;" : ""}"><tr>${cells}</tr></table>`);
    }

    case "logo": {
      const content = block.src
        ? image(block.src, block.alt, Math.min(block.width, inner), 0, block.alignment, false)
        : `<span style="font-family:${block.fontFamily};font-size:${block.fontSize}px;font-weight:bold;letter-spacing:${block.letterSpacing}px;color:${block.textColor};">${escapeHtml(block.text)}</span>`;
      return row(block, block.alignment, wrapLink(content, block.linkUrl), `text-align:${block.alignment};`);
    }

    case "html":
      return row(block, "", sanitizeInlineHtml(block.html).replace(/<br>/g, "\n"));

    case "video": {
      const poster = block.thumbnailSrc || videoPoster(block.videoUrl);
      const play = button({
        text: block.buttonText, url: block.videoUrl, bg: block.buttonBg, color: block.buttonColor,
        fontFamily: "Arial,Helvetica,sans-serif", fontSize: 14, fontWeight: "bold", radius: 999, paddingV: 10,
        paddingH: 22, align: "center",
      });
      return row(block, "center", `<a href="${safeUrl(block.videoUrl)}" target="_blank" style="text-decoration:none;">${image(poster, block.alt, inner, block.borderRadius, "center", true)}</a><div style="height:12px;line-height:12px;font-size:0;">&nbsp;</div>${play}`);
    }

    case "icons": {
      const size = block.iconSize;
      const badge = (glyph: string) =>
        `<table ${TABLE} align="center" style="margin:0 auto;"><tr><td align="center" width="${size}" height="${size}" bgcolor="${escapeHtml(block.iconBg)}" style="width:${size}px;height:${size}px;border-radius:${size}px;background-color:${block.iconBg};color:${block.iconColor};font-family:Arial,sans-serif;font-size:${Math.round(size * 0.45)}px;line-height:${size}px;">${escapeHtml(glyph)}</td></tr></table>`;
      const copy = (item: { label: string; text: string }, align: TextAlign) =>
        `<div style="font-family:${block.fontFamily};font-size:${block.fontSize + 1}px;font-weight:bold;color:${block.labelColor};text-align:${align};line-height:1.4;">${escapeHtml(item.label)}</div>` +
        (item.text ? `<div style="font-family:${block.fontFamily};font-size:${block.fontSize}px;color:${block.textColor};text-align:${align};line-height:1.5;">${escapeHtml(item.text)}</div>` : "");
      if (!block.items.length) return row(block, "", "");
      if (block.layout === "list") {
        const rows = block.items.map((item) =>
          `<tr><td width="${size + 14}" valign="top" style="padding:6px 14px 6px 0;">${badge(item.glyph)}</td><td valign="middle" style="padding:6px 0;">${wrapLink(copy(item, "left"), item.url)}</td></tr>`
        ).join("");
        return row(block, "", `<table ${TABLE} width="100%">${rows}</table>`);
      }
      const pct = Math.floor(100 / block.items.length);
      const cells = block.items.map((item) =>
        `<td class="fc-col" width="${pct}%" valign="top" align="center" style="padding:0 6px 8px;">${badge(item.glyph)}<div style="height:8px;line-height:8px;font-size:0;">&nbsp;</div>${wrapLink(copy(item, "center"), item.url)}</td>`
      ).join("");
      return row(block, "center", `<table ${TABLE} width="100%"><tr>${cells}</tr></table>`);
    }

    case "menu": {
      const linkStyle = `font-family:${block.fontFamily};font-size:${block.fontSize}px;font-weight:${block.fontWeight};color:${block.color};text-decoration:none;letter-spacing:${block.letterSpacing}px;${block.uppercase ? "text-transform:uppercase;" : ""}`;
      const sep = block.separator
        ? `<span style="color:${block.color};opacity:0.5;padding:0 10px;font-family:${block.fontFamily};font-size:${block.fontSize}px;">${escapeHtml(block.separator)}</span>`
        : `<span style="padding:0 10px;">&nbsp;</span>`;
      const links = block.links.map((l) => `<a href="${safeUrl(l.url)}" target="_blank" style="${linkStyle}">${escapeHtml(l.label)}</a>`).join(sep);
      return row(block, block.alignment, links, `text-align:${block.alignment};`);
    }

    case "hero": {
      const bgImage = block.imageSrc ? ` background="${safeUrl(block.imageSrc)}"` : "";
      const bgStyle = block.imageSrc
        ? `background-image:url('${safeUrl(block.imageSrc)}');background-size:cover;background-position:center;background-color:${block.fallbackColor};`
        : `background-color:${block.fallbackColor};`;
      const overlay = block.imageSrc ? `background-color:${rgba(block.overlayColor, block.overlayOpacity)};` : "";
      const pad = `padding:${block.paddingTop}px ${block.paddingRight}px ${block.paddingBottom}px ${block.paddingLeft}px;`;
      const cta = block.buttonText
        ? button({
            text: block.buttonText, url: block.buttonUrl, bg: block.buttonBg, color: block.buttonColor,
            fontFamily: block.fontFamily, fontSize: 15, fontWeight: "bold", radius: block.buttonRadius, paddingV: 13,
            paddingH: 30, align: block.textAlign,
          })
        : "";
      return `<tr><td${bgImage} bgcolor="${escapeHtml(block.fallbackColor)}" style="${bgStyle}"><table ${TABLE} width="100%"><tr><td align="${block.textAlign}" style="${overlay}${pad}text-align:${block.textAlign};">` +
        `<h1 class="fc-h1" style="margin:0 0 12px;font-family:${block.headingFont};font-size:${block.headingSize}px;line-height:1.2;font-weight:bold;color:${block.headingColor};">${sanitizeInlineHtml(block.heading)}</h1>` +
        `<p style="margin:0 0 ${cta ? 24 : 0}px;font-family:${block.fontFamily};font-size:16px;line-height:1.55;color:${block.subheadingColor};">${sanitizeInlineHtml(block.subheading)}</p>${cta}` +
        `</td></tr></table></td></tr>`;
    }

    case "feature": {
      const imgW = Math.round(inner * 0.4);
      const img = `<td class="fc-col" width="${imgW}" valign="top" style="padding-${block.imageAlign === "left" ? "right" : "left"}:16px;padding-bottom:12px;">${image(block.imageSrc, block.heading, imgW - 16, block.imageRadius, "left", true)}</td>`;
      const txt = `<td class="fc-col" valign="top" style="font-family:${block.fontFamily};color:${block.color};"><h2 style="margin:0 0 8px;font-family:${block.headingFont};font-size:20px;line-height:1.3;color:${block.color};">${sanitizeInlineHtml(block.heading)}</h2><p style="margin:0;font-size:14px;line-height:1.6;">${sanitizeInlineHtml(block.body)}</p></td>`;
      return row(block, "", `<table ${TABLE} width="100%"><tr>${block.imageAlign === "left" ? img + txt : txt + img}</tr></table>`);
    }

    case "product": {
      const badge = block.badge
        ? `<table ${TABLE} align="${block.textAlign}" style="${block.textAlign === "center" ? "margin:0 auto 10px;" : "margin:0 0 10px;"}"><tr><td bgcolor="${escapeHtml(block.badgeBg)}" style="background-color:${block.badgeBg};border-radius:999px;padding:4px 12px;font-family:${block.fontFamily};font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${block.badgeColor};">${escapeHtml(block.badge)}</td></tr></table>`
        : "";
      const cta = block.buttonText
        ? button({
            text: block.buttonText, url: block.buttonUrl, bg: block.buttonBg, color: block.buttonColor,
            fontFamily: block.fontFamily, fontSize: 14, fontWeight: "bold", radius: block.buttonRadius, paddingV: 11,
            paddingH: 24, align: block.textAlign,
          })
        : "";
      return row(block, block.textAlign,
        `${image(block.imageSrc, block.name, inner, block.imageRadius, "center", true)}<div style="height:16px;line-height:16px;font-size:0;">&nbsp;</div>${badge}` +
        `<h2 style="margin:0 0 4px;font-family:${block.headingFont};font-size:22px;line-height:1.3;color:${block.nameColor};">${sanitizeInlineHtml(block.name)}</h2>` +
        `<p style="margin:0 0 8px;font-family:${block.fontFamily};font-size:20px;font-weight:bold;color:${block.priceColor};">${escapeHtml(block.price)}</p>` +
        `<p style="margin:0 0 16px;font-family:${block.fontFamily};font-size:14px;line-height:1.6;color:${block.descriptionColor};">${sanitizeInlineHtml(block.description)}</p>${cta}`,
        `text-align:${block.textAlign};`);
    }

    case "cta": {
      const cta = block.buttonText
        ? button({
            text: block.buttonText, url: block.buttonUrl, bg: block.buttonBg, color: block.buttonColor,
            fontFamily: block.fontFamily, fontSize: 15, fontWeight: "bold", radius: block.buttonRadius, paddingV: 13,
            paddingH: 30, align: block.textAlign,
          })
        : "";
      return row(block, block.textAlign,
        `<h2 style="margin:0 0 8px;font-family:${block.headingFont};font-size:28px;line-height:1.25;color:${block.headingColor};">${sanitizeInlineHtml(block.heading)}</h2>` +
        `<p style="margin:0 0 ${cta ? 24 : 0}px;font-family:${block.fontFamily};font-size:15px;line-height:1.6;color:${block.subheadingColor};">${sanitizeInlineHtml(block.subheading)}</p>${cta}`,
        `text-align:${block.textAlign};`);
    }

    case "footer_block":
      return row(block, block.textAlign,
        `<p style="margin:0 0 6px;font-weight:bold;">${sanitizeInlineHtml(block.companyName)}</p>` +
        `<p style="margin:0 0 6px;">${sanitizeInlineHtml(block.address)}</p>` +
        `<p style="margin:0;"><a href="${safeUrl(block.unsubscribeUrl)}" target="_blank" style="color:${block.textColor};text-decoration:underline;">${escapeHtml(block.unsubscribeText)}</a></p>`,
        `font-family:${block.fontFamily};font-size:${block.fontSize}px;line-height:1.5;color:${block.textColor};text-align:${block.textAlign};`);

    default:
      return "";
  }
}

function renderColumn(column: EmailColumn, width: number): string {
  const inner = Math.max(40, width - column.padding * 2);
  const rows = column.blocks.map((b) => renderBlock(b, inner)).join("\n");
  return `<table ${TABLE} width="100%">${rows || `<tr><td style="font-size:0;line-height:0;">&nbsp;</td></tr>`}</table>`;
}

function renderSection(section: EmailSection, emailWidth: number): string {
  const s = section.settings;
  const innerWidth = Math.max(80, emailWidth - s.paddingLeft - s.paddingRight - s.borderWidth * 2);
  let style = `padding:${s.paddingTop}px ${s.paddingRight}px ${s.paddingBottom}px ${s.paddingLeft}px;`;
  if (!isTransparent(s.backgroundColor)) style += `background-color:${s.backgroundColor};`;
  if (s.borderWidth > 0) style += `border:${s.borderWidth}px ${s.borderStyle} ${s.borderColor};`;

  let body: string;
  if (section.columns.length === 1) {
    const column = section.columns[0];
    const columnStyle = `${column.padding ? `padding:${column.padding}px;` : ""}${isTransparent(column.backgroundColor) ? "" : `background-color:${column.backgroundColor};`}${column.borderRadius ? `border-radius:${column.borderRadius}px;` : ""}`;
    body = columnStyle
      ? `<table ${TABLE} width="100%"><tr><td${bgAttr(column.backgroundColor)} style="${columnStyle}">${renderColumn(column, innerWidth)}</td></tr></table>`
      : renderColumn(column, innerWidth);
  } else {
    const last = section.columns.length - 1;
    const cells = section.columns.map((column, i) => {
      const colWidth = Math.round((innerWidth * column.width) / 100);
      const padLeft = i === 0 ? 0 : s.gap / 2;
      const padRight = i === last ? 0 : s.gap / 2;
      const columnStyle = `padding:${column.padding}px ${column.padding + padRight}px ${column.padding}px ${column.padding + padLeft}px;${isTransparent(column.backgroundColor) ? "" : `background-color:${column.backgroundColor};`}${column.borderRadius ? `border-radius:${column.borderRadius}px;` : ""}`;
      return `<td class="${s.stackOnMobile ? "fc-col fc-stack" : ""}" width="${colWidth}" valign="${column.verticalAlign}"${bgAttr(column.backgroundColor)} style="width:${column.width}%;${columnStyle}">${renderColumn(column, colWidth - padLeft - padRight)}</td>`;
    }).join("");
    body = `<table ${TABLE} width="100%"><tr>${cells}</tr></table>`;
  }

  const label = s.name ? `<!-- ${escapeHtml(s.name)} -->\n` : "";
  return `${label}<tr><td${bgAttr(s.backgroundColor)} style="${style}">${body}</td></tr>`;
}

export interface RenderOptions {
  /** Used for <title> when the document has no subject. */
  title?: string;
}

export function renderEmailHtml(doc: EmailDocument, options: RenderOptions = {}): string {
  // An email imported as is goes out as the author wrote it, not rebuilt from blocks
  const exact = exactHtmlOf(doc);
  if (exact) return stripActiveHtml(exact);

  const settings = doc.document.settings;
  const width = settings.emailWidth;
  const sections = doc.blocks.map((s) => renderSection(s, width)).join("\n");
  const preheader = settings.preheader
    ? `<div style="display:none;font-size:1px;color:${settings.backgroundColor};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(settings.preheader)}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no">
<title>${escapeHtml(settings.subject || options.title || "Email")}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<style type="text/css">
body{margin:0;padding:0;width:100%!important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
table,td{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
img{border:0;height:auto;line-height:100%;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}
a{text-decoration:none;}
@media only screen and (max-width:${width + 20}px){
.fc-container{width:100%!important;max-width:100%!important;}
.fc-stack{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box;padding-left:0!important;padding-right:0!important;padding-bottom:12px!important;}
.fc-img{width:100%!important;max-width:100%!important;height:auto!important;}
.fc-h1{font-size:28px!important;}
}
</style>
</head>
<body style="margin:0;padding:0;background-color:${settings.backgroundColor};font-family:${settings.defaultFont};">
${preheader}
<table ${TABLE} width="100%" bgcolor="${escapeHtml(settings.backgroundColor)}" style="background-color:${settings.backgroundColor};">
<tr><td align="center" style="padding:24px 12px;">
<!--[if mso]><table ${TABLE} width="${width}" align="center"><tr><td><![endif]-->
<table class="fc-container" ${TABLE} width="100%" bgcolor="${escapeHtml(settings.contentBackground)}" style="width:100%;max-width:${width}px;background-color:${settings.contentBackground};">
${sections}
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
}
