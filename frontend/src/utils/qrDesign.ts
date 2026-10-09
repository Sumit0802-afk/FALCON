/**
 * Everything about a QR code that is decided in the poster editor: what it
 * holds, which design it starts from, and the pattern of modules that encodes
 * it. Drawing the code is done by qrCode.ts.
 */

import qrcode from "qrcode-generator";
import { QrSpec } from "@/utils/qrCode";

/** A QR code's whole configuration. It is kept on the picture it draws, so the code can be edited again */
export interface QrConfig extends QrSpec {
  template: string;
  contentType: string;
  /** JSON of what was typed for the content type */
  fields: string;
}

// ─── Encoding ─────────────────────────────────────────────────────────────────

/**
 * The module pattern for `data`, as rows of 0 and 1 joined by "/".
 * A code with a logo over its middle is made with stronger error correction,
 * which lets a scanner rebuild what the logo hides.
 * Returns "" when the data is empty or too long for a QR code.
 */
export function encodeQr(data: string, withLogo: boolean): string {
  if (!data) return "";
  try {
    qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];
    // Long content uses the lightest correction, which needs the fewest modules and so keeps them large
    const bytes = new TextEncoder().encode(data).length;
    const code = qrcode(0, withLogo ? "Q" : bytes > 80 ? "L" : "M");
    code.addData(data, "Byte");
    code.make();
    const n = code.getModuleCount();
    const rows: string[] = [];
    for (let r = 0; r < n; r++) {
      let row = "";
      for (let c = 0; c < n; c++) row += code.isDark(r, c) ? "1" : "0";
      rows.push(row);
    }
    return rows.join("/");
  } catch {
    return "";
  }
}

// ─── What a code can hold ─────────────────────────────────────────────────────

export interface QrField {
  key: string;
  label: string;
  placeholder?: string;
  kind?: "text" | "long" | "datetime" | "select";
  options?: { label: string; value: string }[];
}

export interface QrContentType {
  id: string;
  label: string;
  fields: QrField[];
  /** The text to encode for what was typed; "" when the essential field is empty */
  build: (f: Record<string, string>) => string;
}

const clean = (value: string | undefined) => (value || "").trim();
/** Escapes the characters that separate fields in Wi-Fi and contact codes */
const esc = (value: string | undefined) => clean(value).replace(/([\\;,:"])/g, "\\$1");
const digits = (value: string | undefined) => clean(value).replace(/[^\d+]/g, "");
/** "2026-10-09T18:30" in the compact form calendar apps read */
const stamp = (value: string | undefined) => clean(value).replace(/[-:]/g, "").replace(/(T\d{4})$/, "$100");

export const QR_CONTENT_TYPES: QrContentType[] = [
  {
    id: "url", label: "Website link",
    fields: [{ key: "url", label: "Link", placeholder: "https://example.com" }],
    build: (f) => { const url = clean(f.url); return !url ? "" : /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`; },
  },
  { id: "text", label: "Text", fields: [{ key: "text", label: "Text", kind: "long", placeholder: "Any text" }], build: (f) => clean(f.text) },
  {
    id: "email", label: "Email",
    fields: [{ key: "to", label: "Send to", placeholder: "name@example.com" }, { key: "subject", label: "Subject" }, { key: "body", label: "Message", kind: "long" }],
    build: (f) => {
      if (!clean(f.to)) return "";
      const query = [clean(f.subject) && `subject=${encodeURIComponent(clean(f.subject))}`, clean(f.body) && `body=${encodeURIComponent(clean(f.body))}`].filter(Boolean).join("&");
      return `mailto:${clean(f.to)}${query ? `?${query}` : ""}`;
    },
  },
  { id: "phone", label: "Phone call", fields: [{ key: "number", label: "Phone number", placeholder: "+91 98765 43210" }], build: (f) => (digits(f.number) ? `tel:${digits(f.number)}` : "") },
  {
    id: "whatsapp", label: "WhatsApp",
    fields: [{ key: "number", label: "Number with country code", placeholder: "+91 98765 43210" }, { key: "message", label: "Message to start with", kind: "long" }],
    build: (f) => { const n = digits(f.number).replace(/\+/g, ""); return n ? `https://wa.me/${n}${clean(f.message) ? `?text=${encodeURIComponent(clean(f.message))}` : ""}` : ""; },
  },
  {
    id: "wifi", label: "Wi-Fi",
    fields: [
      { key: "ssid", label: "Network name" },
      { key: "password", label: "Password" },
      { key: "security", label: "Security", kind: "select", options: [{ label: "WPA / WPA2", value: "WPA" }, { label: "WEP", value: "WEP" }, { label: "None", value: "nopass" }] },
    ],
    build: (f) => (clean(f.ssid) ? `WIFI:T:${f.security || "WPA"};S:${esc(f.ssid)};${(f.security || "WPA") === "nopass" ? "" : `P:${esc(f.password)};`};` : ""),
  },
  {
    id: "vcard", label: "Contact card",
    fields: [{ key: "name", label: "Full name" }, { key: "org", label: "Company" }, { key: "title", label: "Job title" }, { key: "phone", label: "Phone" }, { key: "email", label: "Email" }, { key: "url", label: "Website" }],
    build: (f) => {
      if (!clean(f.name)) return "";
      const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${esc(f.name)}`, clean(f.org) && `ORG:${esc(f.org)}`, clean(f.title) && `TITLE:${esc(f.title)}`, digits(f.phone) && `TEL:${digits(f.phone)}`, clean(f.email) && `EMAIL:${clean(f.email)}`, clean(f.url) && `URL:${clean(f.url)}`, "END:VCARD"];
      return lines.filter(Boolean).join("\n");
    },
  },
  {
    id: "event", label: "Event",
    fields: [{ key: "title", label: "Event name" }, { key: "start", label: "Starts", kind: "datetime" }, { key: "end", label: "Ends", kind: "datetime" }, { key: "location", label: "Place" }, { key: "details", label: "Details", kind: "long" }],
    build: (f) => {
      if (!clean(f.title)) return "";
      const lines = ["BEGIN:VEVENT", `SUMMARY:${esc(f.title)}`, clean(f.start) && `DTSTART:${stamp(f.start)}`, clean(f.end) && `DTEND:${stamp(f.end)}`, clean(f.location) && `LOCATION:${esc(f.location)}`, clean(f.details) && `DESCRIPTION:${esc(f.details)}`, "END:VEVENT"];
      return lines.filter(Boolean).join("\n");
    },
  },
  { id: "custom", label: "Custom data", fields: [{ key: "data", label: "Exactly what to encode", kind: "long" }], build: (f) => f.data || "" },
];

export function contentType(id: string): QrContentType {
  return QR_CONTENT_TYPES.find((type) => type.id === id) || QR_CONTENT_TYPES[0];
}

export function readFields(json: string): Record<string, string> {
  try {
    const parsed = JSON.parse(json || "{}");
    const out: Record<string, string> = {};
    if (parsed && typeof parsed === "object") for (const key of Object.keys(parsed)) if (typeof parsed[key] === "string") out[key] = parsed[key];
    return out;
  } catch {
    return {};
  }
}

// ─── The design library ───────────────────────────────────────────────────────

export interface QrTemplate {
  id: string;
  name: string;
  look: Partial<QrSpec>;
}

const PLAIN: Partial<QrSpec> = { pattern: "square", foreground: "#111111", foreground2: "", background: "#ffffff", frame: "none", frameColor: "#111111", quietZone: 4, caption: "", captionPosition: "below", captionColor: "#111111" };

export const QR_TEMPLATES: QrTemplate[] = [
  { id: "classic", name: "Classic", look: { ...PLAIN } },
  { id: "minimal", name: "Minimal", look: { ...PLAIN, foreground: "#3f3f46", quietZone: 2 } },
  { id: "modern", name: "Modern", look: { ...PLAIN, pattern: "rounded", foreground: "#0f172a", frame: "rounded", frameColor: "#cbd5e1" } },
  { id: "rounded", name: "Rounded", look: { ...PLAIN, pattern: "rounded", foreground: "#1e293b" } },
  { id: "dots", name: "Dots", look: { ...PLAIN, pattern: "dots", foreground: "#111827" } },
  { id: "circular", name: "Circular", look: { ...PLAIN, pattern: "circular", foreground: "#111827", background: "#f1f5f9" } },
  { id: "gradient", name: "Gradient", look: { ...PLAIN, pattern: "rounded", foreground: "#4f46e5", foreground2: "#c026d3" } },
  { id: "dark", name: "Dark", look: { ...PLAIN, foreground: "#f8fafc", background: "#0b0d14", frame: "rounded", frameColor: "#334155", captionColor: "#f8fafc" } },
  { id: "light", name: "Light", look: { ...PLAIN, foreground: "#334155", background: "#f8fafc", frame: "solid", frameColor: "#cbd5e1" } },
  { id: "brand", name: "Brand", look: { ...PLAIN, pattern: "rounded", foreground: "#1d4ed8", frame: "rounded", frameColor: "#2f81ff", captionColor: "#1d4ed8" } },
  { id: "logo", name: "With logo", look: { ...PLAIN, pattern: "rounded", foreground: "#111827", logoSize: 20 } },
  { id: "cta", name: "With call to action", look: { ...PLAIN, pattern: "rounded", frame: "rounded", frameColor: "#111111", caption: "Scan me" } },
  { id: "decorative", name: "Decorative", look: { ...PLAIN, pattern: "dots", foreground: "#7c2d12", foreground2: "#b45309", background: "#fffbeb", frame: "decorative", frameColor: "#b45309", captionColor: "#7c2d12" } },
  { id: "event", name: "Event", look: { ...PLAIN, pattern: "rounded", foreground: "#6d28d9", frame: "rounded", frameColor: "#6d28d9", caption: "Scan for event details", captionColor: "#6d28d9" } },
  { id: "registration", name: "Registration", look: { ...PLAIN, foreground: "#065f46", frame: "solid", frameColor: "#065f46", caption: "Scan to register", captionColor: "#065f46" } },
  { id: "website", name: "Website", look: { ...PLAIN, pattern: "rounded", foreground: "#0c4a6e", caption: "Visit our website", captionColor: "#0c4a6e" } },
  { id: "social", name: "Social media", look: { ...PLAIN, pattern: "dots", foreground: "#c026d3", foreground2: "#ea580c", caption: "Follow us", captionColor: "#c026d3" } },
  { id: "contact", name: "Contact", look: { ...PLAIN, pattern: "rounded", foreground: "#1f2937", frame: "rounded", frameColor: "#9ca3af", caption: "Save our contact" } },
  { id: "payment", name: "Payment", look: { ...PLAIN, foreground: "#111111", frame: "solid", frameColor: "#16a34a", caption: "Scan to pay", captionColor: "#15803d" } },
];

export const QR_DEFAULT: QrConfig = {
  template: "classic", contentType: "url", fields: '{"url":"https://example.com"}', data: "https://example.com", modules: "",
  pattern: "square", foreground: "#111111", foreground2: "", background: "#ffffff", quietZone: 4, frame: "none", frameColor: "#111111",
  logoUrl: "", logoSize: 20, caption: "", captionPosition: "below", captionColor: "#111111",
};

// ─── Changing a code ──────────────────────────────────────────────────────────

const CONFIG_KEYS = Object.keys(QR_DEFAULT) as (keyof QrConfig)[];

/** A complete configuration from one that may be partial, such as one read back from a saved design */
export function configOf(source: Partial<QrConfig> | null | undefined): QrConfig {
  const out = { ...QR_DEFAULT } as Record<string, unknown>;
  if (source) for (const key of CONFIG_KEYS) if (source[key] !== undefined && typeof source[key] === typeof QR_DEFAULT[key]) out[key] = source[key];
  const config = out as unknown as QrConfig;
  if (!config.modules) config.modules = encodeQr(config.data, Boolean(config.logoUrl));
  return config;
}

/**
 * The configuration after `patch` is applied. Whenever what the code holds
 * changes, or a logo is added or removed, the module pattern is worked out again.
 */
export function changeQr(current: QrConfig, patch: Partial<QrConfig>): QrConfig {
  const next = { ...current, ...patch };
  if (patch.contentType !== undefined || patch.fields !== undefined) next.data = contentType(next.contentType).build(readFields(next.fields));
  const logoChanged = patch.logoUrl !== undefined && Boolean(patch.logoUrl) !== Boolean(current.logoUrl);
  if (next.data !== current.data || logoChanged || !current.modules) next.modules = encodeQr(next.data, Boolean(next.logoUrl));
  return next;
}

/** Applies a design from the library. The look changes; what the code holds stays */
export function applyTemplate(current: QrConfig, template: QrTemplate): QrConfig {
  const patch: Partial<QrConfig> = { ...template.look, template: template.id };
  // A caption the author wrote is theirs to keep
  const starting = QR_TEMPLATES.some((t) => (t.look.caption || "") === current.caption);
  if (!starting) delete patch.caption;
  return changeQr(current, patch);
}

/** What is kept with the picture on the page: everything but the module pattern, which is worked out again from the data */
export function storedConfig(config: QrConfig): Omit<QrConfig, "modules"> {
  const { modules: _modules, ...rest } = config;
  void _modules;
  return rest;
}
