import React, { useRef } from "react";
import {
  BorderStyle, EmailBlock, EmailColumn, EmailSection, EmailSettings, FontWeight, SectionSettings, SocialPlatform,
  TextAlign,
} from "@/types/email";
import { FONT_STACKS, isFullHtmlDocument } from "@/lib/emailCore/schema";
import HtmlDocumentEditor from "./HtmlDocumentEditor";
import { SOCIAL_LABELS } from "@/lib/emailCore/renderHtml";
import { MAX_COLUMNS } from "@/utils/emailOps";
import { getBlockLink, hasRealLink, normalizeLink } from "@/utils/emailUtils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{children}</label>;
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="mb-3">{children}</div>;
}

const INPUT = "w-full rounded border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[12px] text-zinc-200 placeholder-zinc-600 outline-none focus:border-[#00D084]/40";

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={INPUT} />;
}

function TextArea({ value, onChange, rows = 4, mono }: { value: string; onChange: (v: string) => void; rows?: number; mono?: boolean }) {
  return <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} className={`${INPUT} resize-y ${mono ? "font-mono text-[11px]" : ""}`} />;
}

function NumberInput({ value, onChange, min, max, step = 1 }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <input
      type="number"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => {
        const parsed = parseFloat(e.target.value);
        if (!Number.isFinite(parsed)) return;
        onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, parsed)));
      }}
      min={min}
      max={max}
      step={step}
      className={INPUT}
    />
  );
}

/** Colour field. `allowNone` adds a way back to "transparent" for backgrounds. */
function ColorInput({ value, onChange, allowNone }: { value: string; onChange: (v: string) => void; allowNone?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const none = !value || value === "transparent";
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="h-6 w-6 shrink-0 rounded border border-white/20"
        style={none ? { backgroundImage: "linear-gradient(45deg,#444 25%,transparent 25%,transparent 75%,#444 75%),linear-gradient(45deg,#444 25%,#222 25%,#222 75%,#444 75%)", backgroundSize: "8px 8px", backgroundPosition: "0 0,4px 4px" } : { backgroundColor: value }}
      />
      <input ref={ref} type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#ffffff"} onChange={(e) => onChange(e.target.value)} className="hidden" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 rounded border border-white/[0.08] bg-white/[0.03] px-2 py-1.5 font-mono text-[11px] text-zinc-300 outline-none focus:border-[#00D084]/40"
      />
      {allowNone && !none && (
        <button type="button" title="Remove colour" onClick={() => onChange("transparent")} className="shrink-0 rounded px-1 text-[11px] text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200">✕</button>
      )}
    </div>
  );
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  // Keep an unknown current value selectable instead of silently showing the first option
  const list = options.some((o) => o.value === value) ? options : [{ label: value.split(",")[0].replace(/['"]/g, "") || "Custom", value }, ...options];
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded border border-white/[0.08] bg-[#0a0a0a] px-2.5 py-1.5 text-[12px] text-zinc-200 outline-none focus:border-[#00D084]/40">
      {list.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[12px] text-zinc-300">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="accent-[#00D084]" />
      {label}
    </label>
  );
}

/** Left / centre / right as a compact segmented control. */
function AlignInput({ value, onChange }: { value: TextAlign; onChange: (v: TextAlign) => void }) {
  return (
    <div className="flex rounded border border-white/[0.08] bg-white/[0.03] p-0.5">
      {(["left", "center", "right"] as TextAlign[]).map((align) => (
        <button
          key={align}
          type="button"
          onClick={() => onChange(align)}
          className={`flex-1 rounded px-2 py-1 text-[11px] capitalize transition-colors ${value === align ? "bg-white/[0.12] text-white" : "text-zinc-500 hover:text-zinc-300"}`}
        >
          {align}
        </button>
      ))}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 mt-4 border-t border-white/[0.06] pt-3 font-mono text-[9px] font-semibold uppercase tracking-widest text-zinc-600">
      {children}
    </div>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-1.5">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-0.5 text-[9px] capitalize text-zinc-600">{label}</div>
      {children}
    </div>
  );
}

const FONT_OPTIONS = FONT_STACKS;

const WEIGHT_OPTIONS = [
  { label: "Normal", value: "normal" },
  { label: "Semibold", value: "600" },
  { label: "Bold", value: "bold" },
];

const BORDER_STYLE_OPTIONS = [
  { label: "Solid", value: "solid" },
  { label: "Dashed", value: "dashed" },
  { label: "Dotted", value: "dotted" },
];

type Patch<T> = (partial: Partial<T>) => void;

interface PaddingValues { paddingTop: number; paddingBottom: number; paddingLeft: number; paddingRight: number }

function PaddingInputs({ value, onChange }: { value: PaddingValues; onChange: (p: Partial<PaddingValues>) => void }) {
  return (
    <Row>
      <Label>Padding (px)</Label>
      <Grid2>
        {(["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"] as const).map((k) => (
          <Field key={k} label={k.replace("padding", "")}>
            <NumberInput value={value[k]} onChange={(v) => onChange({ [k]: v })} min={0} max={200} />
          </Field>
        ))}
      </Grid2>
    </Row>
  );
}

function FontRow({ label = "Font Family", value, onChange }: { label?: string; value: string; onChange: (v: string) => void }) {
  return <Row><Label>{label}</Label><SelectInput value={value} onChange={onChange} options={FONT_OPTIONS} /></Row>;
}

/** Background, border and spacing controls every block shares. */
function BoxProperties({ block, u }: { block: EmailBlock; u: Patch<EmailBlock> }) {
  return (
    <>
      <SectionTitle>Background</SectionTitle>
      <Row><Label>Background Color</Label><ColorInput value={block.backgroundColor} onChange={(v) => u({ backgroundColor: v })} allowNone /></Row>
      <SectionTitle>Border</SectionTitle>
      <Row>
        <Grid2>
          <Field label="Width"><NumberInput value={block.borderWidth} onChange={(v) => u({ borderWidth: v })} min={0} max={20} /></Field>
          <Field label="Radius"><NumberInput value={block.cornerRadius} onChange={(v) => u({ cornerRadius: v })} min={0} max={60} /></Field>
        </Grid2>
      </Row>
      {block.borderWidth > 0 && (
        <>
          <Row><Label>Border Color</Label><ColorInput value={block.borderColor} onChange={(v) => u({ borderColor: v })} /></Row>
          <Row><Label>Border Style</Label><SelectInput value={block.borderStyle} onChange={(v) => u({ borderStyle: v as BorderStyle })} options={BORDER_STYLE_OPTIONS} /></Row>
        </>
      )}
      <SectionTitle>Spacing</SectionTitle>
      <PaddingInputs value={block} onChange={(p) => u(p)} />
    </>
  );
}

/** Editor for repeating items such as menu links or social profiles. */
function ListEditor<T>({ items, onChange, create, max = 8, addLabel, render }: {
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  max?: number;
  addLabel: string;
  render: (item: T, set: (patch: Partial<T>) => void) => React.ReactNode;
}) {
  const move = (from: number, to: number) => {
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
          <div className="space-y-1.5">{render(item, (patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it))))}</div>
          <div className="mt-1.5 flex justify-end gap-1 text-[10px]">
            <button type="button" disabled={i === 0} onClick={() => move(i, i - 1)} className="rounded px-1.5 py-0.5 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200 disabled:opacity-30">↑</button>
            <button type="button" disabled={i === items.length - 1} onClick={() => move(i, i + 1)} className="rounded px-1.5 py-0.5 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200 disabled:opacity-30">↓</button>
            <button type="button" onClick={() => onChange(items.filter((_it, j) => j !== i))} className="rounded px-1.5 py-0.5 text-red-400 hover:bg-red-500/20">Remove</button>
          </div>
        </div>
      ))}
      {items.length < max && (
        <button type="button" onClick={() => onChange([...items, create()])} className="w-full rounded border border-dashed border-white/[0.12] py-1.5 text-[11px] text-zinc-400 hover:border-[#00D084]/40 hover:text-[#00D084]">
          + {addLabel}
        </button>
      )}
    </div>
  );
}

// ─── Link ─────────────────────────────────────────────────────────────────────

/** Where a button, image, logo or video goes when clicked. Shown first because it is what people look for. */
function LinkProperties({ block, onChange }: { block: EmailBlock; onChange: (b: EmailBlock) => void }) {
  const link = getBlockLink(block);
  const [draft, setDraft] = React.useState(link?.value ?? "");
  React.useEffect(() => { setDraft(link?.value ?? ""); }, [block.id, link?.value]);
  if (!link) return null;

  // Saved when the field loses focus, so typing a URL is one undo step and gets "https://" added if missing
  const commit = () => {
    const next = normalizeLink(draft);
    setDraft(next);
    if (next !== link.value) onChange({ ...block, [link.field]: next } as EmailBlock);
  };
  const live = hasRealLink(link.value);

  return (
    <div className="mb-1 rounded-lg border border-[#00D084]/30 bg-[#00D084]/[0.06] p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#00D084]">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          {link.label}
        </span>
        {live && /^https?:/i.test(link.value) && (
          <a href={link.value} target="_blank" rel="noopener noreferrer" className="text-[10px] text-zinc-400 underline-offset-2 hover:text-white hover:underline">
            Test link ↗
          </a>
        )}
      </div>
      <input
        type="url"
        value={draft === "#" ? "" : draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
        placeholder="https://example.com/page"
        className={INPUT}
      />
      <p className="mt-1.5 text-[10px] leading-relaxed text-zinc-500">
        {live ? "Readers go here when they click." : "No link yet. Paste a web address, or an email address to open a new message."}
      </p>
    </div>
  );
}

// ─── Block Properties ─────────────────────────────────────────────────────────

function BlockProperties({ block, onChange }: { block: EmailBlock; onChange: (b: EmailBlock) => void }) {
  // Each case narrows `block`, so `u` is typed loosely here and precisely where it is used
  const u = (partial: Partial<EmailBlock>) => onChange({ ...block, ...partial } as EmailBlock);

  switch (block.type) {
    case "text":
    case "heading": {
      const set = u as Patch<typeof block>;
      return (
        <>
          {block.type === "heading" && (
            <>
              <SectionTitle>Heading</SectionTitle>
              <Row><Label>Level</Label><SelectInput value={String(block.level)} onChange={(v) => u({ level: parseInt(v, 10) as 1 | 2 | 3 } as Partial<EmailBlock>)} options={[{ label: "H1", value: "1" }, { label: "H2", value: "2" }, { label: "H3", value: "3" }]} /></Row>
            </>
          )}
          <SectionTitle>Content</SectionTitle>
          <Row><TextArea value={block.content} onChange={(v) => set({ content: v })} rows={block.type === "heading" ? 2 : 5} /></Row>
          <SectionTitle>Typography</SectionTitle>
          <FontRow value={block.fontFamily} onChange={(v) => set({ fontFamily: v })} />
          <Row>
            <Grid2>
              <Field label="Size"><NumberInput value={block.fontSize} onChange={(v) => set({ fontSize: v })} min={8} max={120} /></Field>
              <Field label="Line height"><NumberInput value={block.lineHeight} onChange={(v) => set({ lineHeight: v })} min={1} max={3} step={0.05} /></Field>
            </Grid2>
          </Row>
          <Row><Label>Font Weight</Label><SelectInput value={block.fontWeight} onChange={(v) => set({ fontWeight: v as FontWeight })} options={WEIGHT_OPTIONS} /></Row>
          <Row><Label>Color</Label><ColorInput value={block.color} onChange={(v) => set({ color: v })} /></Row>
          <Row><Label>Alignment</Label><AlignInput value={block.textAlign} onChange={(v) => set({ textAlign: v })} /></Row>
          <Row><Label>Letter Spacing</Label><NumberInput value={block.letterSpacing} onChange={(v) => set({ letterSpacing: v })} min={-2} max={12} step={0.5} /></Row>
          {block.type === "heading" && <Row><Toggle value={block.uppercase} onChange={(v) => u({ uppercase: v } as Partial<EmailBlock>)} label="Uppercase" /></Row>}
        </>
      );
    }

    case "image": {
      const set = u as Patch<typeof block>;
      return (
        <>
          <SectionTitle>Image</SectionTitle>
          <Row><Label>Image URL</Label><TextInput value={block.src} onChange={(v) => set({ src: v })} placeholder="https://..." /></Row>
          <Row><Label>Alt Text</Label><TextInput value={block.alt} onChange={(v) => set({ alt: v })} /></Row>
          <SectionTitle>Size</SectionTitle>
          <Row>
            <Label>Width</Label>
            <SelectInput value={block.width === "100%" ? "full" : "custom"} onChange={(v) => set({ width: v === "full" ? "100%" : 300 })} options={[{ label: "Full Width", value: "full" }, { label: "Custom px", value: "custom" }]} />
            {block.width !== "100%" && <div className="mt-1"><NumberInput value={block.width} onChange={(v) => set({ width: v })} min={40} max={900} /></div>}
            <p className="mt-1 text-[10px] text-zinc-600">Tip: drag the green handle on the image to resize.</p>
          </Row>
          <Row><Label>Corner Radius</Label><NumberInput value={block.borderRadius} onChange={(v) => set({ borderRadius: v })} min={0} max={200} /></Row>
          <Row><Label>Alignment</Label><AlignInput value={block.alignment} onChange={(v) => set({ alignment: v })} /></Row>
        </>
      );
    }

    case "button": {
      const set = u as Patch<typeof block>;
      return (
        <>
          <SectionTitle>Button</SectionTitle>
          <Row><Label>Label</Label><TextInput value={block.text} onChange={(v) => set({ text: v })} /></Row>
          <SectionTitle>Style</SectionTitle>
          <Row><Label>Fill Color</Label><ColorInput value={block.bgColor} onChange={(v) => set({ bgColor: v })} allowNone /></Row>
          <Row><Label>Text Color</Label><ColorInput value={block.textColor} onChange={(v) => set({ textColor: v })} /></Row>
          <Row><Label>Outline Color</Label><ColorInput value={block.outlineColor || "transparent"} onChange={(v) => set({ outlineColor: v === "transparent" ? "" : v })} allowNone /></Row>
          <FontRow value={block.fontFamily} onChange={(v) => set({ fontFamily: v })} />
          <Row>
            <Grid2>
              <Field label="Font size"><NumberInput value={block.fontSize} onChange={(v) => set({ fontSize: v })} min={10} max={32} /></Field>
              <Field label="Radius"><NumberInput value={block.borderRadius} onChange={(v) => set({ borderRadius: v })} min={0} max={999} /></Field>
              <Field label="Padding ↕"><NumberInput value={block.paddingV} onChange={(v) => set({ paddingV: v })} min={0} max={40} /></Field>
              <Field label="Padding ↔"><NumberInput value={block.paddingH} onChange={(v) => set({ paddingH: v })} min={0} max={80} /></Field>
            </Grid2>
          </Row>
          <Row><Label>Font Weight</Label><SelectInput value={block.fontWeight} onChange={(v) => set({ fontWeight: v as FontWeight })} options={WEIGHT_OPTIONS} /></Row>
          <Row><Label>Width</Label><SelectInput value={block.width} onChange={(v) => set({ width: v as "auto" | "full" })} options={[{ label: "Fit to label", value: "auto" }, { label: "Full width", value: "full" }]} /></Row>
          <Row><Label>Alignment</Label><AlignInput value={block.alignment} onChange={(v) => set({ alignment: v })} /></Row>
        </>
      );
    }

    case "divider": {
      const set = u as Patch<typeof block>;
      return (
        <>
          <SectionTitle>Divider</SectionTitle>
          <Row><Label>Color</Label><ColorInput value={block.color} onChange={(v) => set({ color: v })} /></Row>
          <Row>
            <Grid2>
              <Field label="Thickness"><NumberInput value={block.thickness} onChange={(v) => set({ thickness: v })} min={1} max={20} /></Field>
              <Field label="Width %"><NumberInput value={block.widthPercent} onChange={(v) => set({ widthPercent: v })} min={5} max={100} /></Field>
            </Grid2>
          </Row>
          <Row><Label>Style</Label><SelectInput value={block.style} onChange={(v) => set({ style: v as BorderStyle })} options={BORDER_STYLE_OPTIONS} /></Row>
        </>
      );
    }

    case "spacer": {
      const set = u as Patch<typeof block>;
      return (
        <>
          <SectionTitle>Spacer</SectionTitle>
          <Row><Label>Height (px)</Label><NumberInput value={block.height} onChange={(v) => set({ height: v })} min={2} max={240} /></Row>
          <Row><Label>Background Color</Label><ColorInput value={block.backgroundColor} onChange={(v) => set({ backgroundColor: v })} allowNone /></Row>
        </>
      );
    }

    case "social": {
      const set = u as Patch<typeof block>;
      return (
        <>
          <SectionTitle>Profiles</SectionTitle>
          <ListEditor
            items={block.icons}
            onChange={(icons) => set({ icons })}
            create={() => ({ platform: "website" as SocialPlatform, url: "#" })}
            addLabel="Add profile"
            max={10}
            render={(icon, setItem) => (
              <>
                <SelectInput value={icon.platform} onChange={(v) => setItem({ platform: v as SocialPlatform })} options={(Object.keys(SOCIAL_LABELS) as SocialPlatform[]).map((p) => ({ label: SOCIAL_LABELS[p].name, value: p }))} />
                <TextInput value={icon.url} onChange={(v) => setItem({ url: v })} placeholder="https://..." />
              </>
            )}
          />
          <SectionTitle>Style</SectionTitle>
          <Row><Label>Icon Color</Label><ColorInput value={block.color} onChange={(v) => set({ color: v })} /></Row>
          <Row>
            <Grid2>
              <Field label="Size"><NumberInput value={block.iconSize} onChange={(v) => set({ iconSize: v })} min={16} max={64} /></Field>
              <Field label="Gap"><NumberInput value={block.gap} onChange={(v) => set({ gap: v })} min={0} max={40} /></Field>
            </Grid2>
          </Row>
          <Row><Label>Alignment</Label><AlignInput value={block.alignment} onChange={(v) => set({ alignment: v })} /></Row>
        </>
      );
    }

    case "logo": {
      const set = u as Patch<typeof block>;
      return (
        <>
          <SectionTitle>Logo Image</SectionTitle>
          <Row><Label>Image URL</Label><TextInput value={block.src} onChange={(v) => set({ src: v })} placeholder="https://... (leave empty for a text logo)" /></Row>
          <Row><Label>Alt Text</Label><TextInput value={block.alt} onChange={(v) => set({ alt: v })} /></Row>
          {block.src ? (
            <Row><Label>Width (px)</Label><NumberInput value={block.width} onChange={(v) => set({ width: v })} min={24} max={600} /></Row>
          ) : (
            <>
              <SectionTitle>Text Logo</SectionTitle>
              <Row><Label>Text</Label><TextInput value={block.text} onChange={(v) => set({ text: v })} /></Row>
              <FontRow value={block.fontFamily} onChange={(v) => set({ fontFamily: v })} />
              <Row>
                <Grid2>
                  <Field label="Size"><NumberInput value={block.fontSize} onChange={(v) => set({ fontSize: v })} min={10} max={60} /></Field>
                  <Field label="Spacing"><NumberInput value={block.letterSpacing} onChange={(v) => set({ letterSpacing: v })} min={0} max={12} step={0.5} /></Field>
                </Grid2>
              </Row>
              <Row><Label>Color</Label><ColorInput value={block.textColor} onChange={(v) => set({ textColor: v })} /></Row>
            </>
          )}
          <Row><Label>Alignment</Label><AlignInput value={block.alignment} onChange={(v) => set({ alignment: v })} /></Row>
        </>
      );
    }

    case "html": {
      const set = u as Patch<typeof block>;
      return (
        <>
          <SectionTitle>{isFullHtmlDocument(block.html) ? "Email HTML" : "Custom HTML"}</SectionTitle>
          {isFullHtmlDocument(block.html) ? (
            <HtmlDocumentEditor blockId={block.id} value={block.html} onChange={(v) => set({ html: v })} />
          ) : (
            <Row><TextArea value={block.html} onChange={(v) => set({ html: v })} rows={10} mono /></Row>
          )}
          <p className="mb-3 text-[10px] leading-relaxed text-zinc-600">Scripts and embedded frames are removed on export because email clients block them.</p>
        </>
      );
    }

    case "video": {
      const set = u as Patch<typeof block>;
      return (
        <>
          <SectionTitle>Video</SectionTitle>
          <Row><Label>Poster Image URL</Label><TextInput value={block.thumbnailSrc} onChange={(v) => set({ thumbnailSrc: v })} placeholder="Auto for YouTube links" /></Row>
          <Row><Label>Alt Text</Label><TextInput value={block.alt} onChange={(v) => set({ alt: v })} /></Row>
          <Row><Label>Corner Radius</Label><NumberInput value={block.borderRadius} onChange={(v) => set({ borderRadius: v })} min={0} max={60} /></Row>
          <SectionTitle>Play Button</SectionTitle>
          <Row><Label>Label</Label><TextInput value={block.buttonText} onChange={(v) => set({ buttonText: v })} /></Row>
          <Row><Label>Button Color</Label><ColorInput value={block.buttonBg} onChange={(v) => set({ buttonBg: v })} /></Row>
          <Row><Label>Text Color</Label><ColorInput value={block.buttonColor} onChange={(v) => set({ buttonColor: v })} /></Row>
          <p className="mb-3 text-[10px] leading-relaxed text-zinc-600">Email clients cannot play video inline, so this links a poster image to your video.</p>
        </>
      );
    }

    case "icons": {
      const set = u as Patch<typeof block>;
      return (
        <>
          <SectionTitle>Items</SectionTitle>
          <ListEditor
            items={block.items}
            onChange={(items) => set({ items })}
            create={() => ({ glyph: "★", label: "New item", text: "", url: "" })}
            addLabel="Add item"
            max={6}
            render={(item, setItem) => (
              <>
                <div className="grid grid-cols-[52px_1fr] gap-1.5">
                  <TextInput value={item.glyph} onChange={(v) => setItem({ glyph: v.slice(0, 3) })} placeholder="★" />
                  <TextInput value={item.label} onChange={(v) => setItem({ label: v })} placeholder="Label" />
                </div>
                <TextInput value={item.text} onChange={(v) => setItem({ text: v })} placeholder="Description" />
                <TextInput value={item.url} onChange={(v) => setItem({ url: v })} placeholder="Link URL (optional)" />
              </>
            )}
          />
          <SectionTitle>Style</SectionTitle>
          <Row><Label>Layout</Label><SelectInput value={block.layout} onChange={(v) => set({ layout: v as "row" | "list" })} options={[{ label: "Side by side", value: "row" }, { label: "Stacked list", value: "list" }]} /></Row>
          <Row><Label>Icon Background</Label><ColorInput value={block.iconBg} onChange={(v) => set({ iconBg: v })} /></Row>
          <Row><Label>Icon Color</Label><ColorInput value={block.iconColor} onChange={(v) => set({ iconColor: v })} /></Row>
          <Row>
            <Grid2>
              <Field label="Icon size"><NumberInput value={block.iconSize} onChange={(v) => set({ iconSize: v })} min={16} max={80} /></Field>
              <Field label="Font size"><NumberInput value={block.fontSize} onChange={(v) => set({ fontSize: v })} min={9} max={24} /></Field>
            </Grid2>
          </Row>
          <FontRow value={block.fontFamily} onChange={(v) => set({ fontFamily: v })} />
          <Row><Label>Label Color</Label><ColorInput value={block.labelColor} onChange={(v) => set({ labelColor: v })} /></Row>
          <Row><Label>Text Color</Label><ColorInput value={block.textColor} onChange={(v) => set({ textColor: v })} /></Row>
        </>
      );
    }

    case "menu": {
      const set = u as Patch<typeof block>;
      return (
        <>
          <SectionTitle>Links</SectionTitle>
          <ListEditor
            items={block.links}
            onChange={(links) => set({ links })}
            create={() => ({ label: "Link", url: "#" })}
            addLabel="Add link"
            render={(link, setItem) => (
              <>
                <TextInput value={link.label} onChange={(v) => setItem({ label: v })} placeholder="Label" />
                <TextInput value={link.url} onChange={(v) => setItem({ url: v })} placeholder="https://..." />
              </>
            )}
          />
          <SectionTitle>Typography</SectionTitle>
          <FontRow value={block.fontFamily} onChange={(v) => set({ fontFamily: v })} />
          <Row>
            <Grid2>
              <Field label="Size"><NumberInput value={block.fontSize} onChange={(v) => set({ fontSize: v })} min={9} max={28} /></Field>
              <Field label="Spacing"><NumberInput value={block.letterSpacing} onChange={(v) => set({ letterSpacing: v })} min={0} max={8} step={0.5} /></Field>
            </Grid2>
          </Row>
          <Row><Label>Font Weight</Label><SelectInput value={block.fontWeight} onChange={(v) => set({ fontWeight: v as FontWeight })} options={WEIGHT_OPTIONS} /></Row>
          <Row><Label>Color</Label><ColorInput value={block.color} onChange={(v) => set({ color: v })} /></Row>
          <Row><Label>Separator</Label><TextInput value={block.separator} onChange={(v) => set({ separator: v.slice(0, 3) })} placeholder="e.g. · or |" /></Row>
          <Row><Toggle value={block.uppercase} onChange={(v) => set({ uppercase: v })} label="Uppercase" /></Row>
          <Row><Label>Alignment</Label><AlignInput value={block.alignment} onChange={(v) => set({ alignment: v })} /></Row>
        </>
      );
    }

    case "hero": {
      const set = u as Patch<typeof block>;
      return (
        <>
          <SectionTitle>Content</SectionTitle>
          <Row><Label>Heading</Label><TextArea value={block.heading} onChange={(v) => set({ heading: v })} rows={2} /></Row>
          <Row><Label>Subheading</Label><TextArea value={block.subheading} onChange={(v) => set({ subheading: v })} rows={3} /></Row>
          <SectionTitle>Background</SectionTitle>
          <Row><Label>Image URL</Label><TextInput value={block.imageSrc} onChange={(v) => set({ imageSrc: v })} placeholder="https://..." /></Row>
          <Row><Label>Fallback Color</Label><ColorInput value={block.fallbackColor} onChange={(v) => set({ fallbackColor: v })} /></Row>
          <Row><Label>Overlay Color</Label><ColorInput value={block.overlayColor} onChange={(v) => set({ overlayColor: v })} /></Row>
          <Row><Label>Overlay Opacity</Label><NumberInput value={block.overlayOpacity} onChange={(v) => set({ overlayOpacity: v })} min={0} max={1} step={0.05} /></Row>
          <SectionTitle>Typography</SectionTitle>
          <FontRow label="Heading Font" value={block.headingFont} onChange={(v) => set({ headingFont: v })} />
          <FontRow label="Body Font" value={block.fontFamily} onChange={(v) => set({ fontFamily: v })} />
          <Row><Label>Heading Size</Label><NumberInput value={block.headingSize} onChange={(v) => set({ headingSize: v })} min={16} max={72} /></Row>
          <Row><Label>Heading Color</Label><ColorInput value={block.headingColor} onChange={(v) => set({ headingColor: v })} /></Row>
          <Row><Label>Subheading Color</Label><ColorInput value={block.subheadingColor} onChange={(v) => set({ subheadingColor: v })} /></Row>
          <Row><Label>Alignment</Label><AlignInput value={block.textAlign} onChange={(v) => set({ textAlign: v })} /></Row>
          <SectionTitle>Button</SectionTitle>
          <Row><Label>Label</Label><TextInput value={block.buttonText} onChange={(v) => set({ buttonText: v })} placeholder="Leave empty to hide" /></Row>
          <Row><Label>Button Color</Label><ColorInput value={block.buttonBg} onChange={(v) => set({ buttonBg: v })} /></Row>
          <Row><Label>Text Color</Label><ColorInput value={block.buttonColor} onChange={(v) => set({ buttonColor: v })} /></Row>
          <Row><Label>Corner Radius</Label><NumberInput value={block.buttonRadius} onChange={(v) => set({ buttonRadius: v })} min={0} max={999} /></Row>
        </>
      );
    }

    case "feature": {
      const set = u as Patch<typeof block>;
      return (
        <>
          <SectionTitle>Content</SectionTitle>
          <Row><Label>Heading</Label><TextInput value={block.heading} onChange={(v) => set({ heading: v })} /></Row>
          <Row><Label>Body</Label><TextArea value={block.body} onChange={(v) => set({ body: v })} rows={4} /></Row>
          <SectionTitle>Image</SectionTitle>
          <Row><Label>Image URL</Label><TextInput value={block.imageSrc} onChange={(v) => set({ imageSrc: v })} placeholder="https://..." /></Row>
          <Row><Label>Image Side</Label><SelectInput value={block.imageAlign} onChange={(v) => set({ imageAlign: v as "left" | "right" })} options={[{ label: "Left", value: "left" }, { label: "Right", value: "right" }]} /></Row>
          <Row><Label>Corner Radius</Label><NumberInput value={block.imageRadius} onChange={(v) => set({ imageRadius: v })} min={0} max={60} /></Row>
          <SectionTitle>Typography</SectionTitle>
          <FontRow label="Heading Font" value={block.headingFont} onChange={(v) => set({ headingFont: v })} />
          <FontRow label="Body Font" value={block.fontFamily} onChange={(v) => set({ fontFamily: v })} />
          <Row><Label>Text Color</Label><ColorInput value={block.color} onChange={(v) => set({ color: v })} /></Row>
        </>
      );
    }

    case "product": {
      const set = u as Patch<typeof block>;
      return (
        <>
          <SectionTitle>Product</SectionTitle>
          <Row><Label>Image URL</Label><TextInput value={block.imageSrc} onChange={(v) => set({ imageSrc: v })} placeholder="https://..." /></Row>
          <Row><Label>Name</Label><TextInput value={block.name} onChange={(v) => set({ name: v })} /></Row>
          <Row><Label>Price</Label><TextInput value={block.price} onChange={(v) => set({ price: v })} /></Row>
          <Row><Label>Description</Label><TextArea value={block.description} onChange={(v) => set({ description: v })} rows={3} /></Row>
          <SectionTitle>Promotional Badge</SectionTitle>
          <Row><Label>Badge Text</Label><TextInput value={block.badge} onChange={(v) => set({ badge: v })} placeholder="e.g. New, -20%" /></Row>
          {block.badge && (
            <>
              <Row><Label>Badge Color</Label><ColorInput value={block.badgeBg} onChange={(v) => set({ badgeBg: v })} /></Row>
              <Row><Label>Badge Text Color</Label><ColorInput value={block.badgeColor} onChange={(v) => set({ badgeColor: v })} /></Row>
            </>
          )}
          <SectionTitle>Button</SectionTitle>
          <Row><Label>Label</Label><TextInput value={block.buttonText} onChange={(v) => set({ buttonText: v })} placeholder="Leave empty to hide" /></Row>
          <Row><Label>Button Color</Label><ColorInput value={block.buttonBg} onChange={(v) => set({ buttonBg: v })} /></Row>
          <Row><Label>Text Color</Label><ColorInput value={block.buttonColor} onChange={(v) => set({ buttonColor: v })} /></Row>
          <SectionTitle>Style</SectionTitle>
          <FontRow label="Heading Font" value={block.headingFont} onChange={(v) => set({ headingFont: v })} />
          <FontRow label="Body Font" value={block.fontFamily} onChange={(v) => set({ fontFamily: v })} />
          <Row><Label>Name Color</Label><ColorInput value={block.nameColor} onChange={(v) => set({ nameColor: v })} /></Row>
          <Row><Label>Price Color</Label><ColorInput value={block.priceColor} onChange={(v) => set({ priceColor: v })} /></Row>
          <Row><Label>Description Color</Label><ColorInput value={block.descriptionColor} onChange={(v) => set({ descriptionColor: v })} /></Row>
          <Row>
            <Grid2>
              <Field label="Image radius"><NumberInput value={block.imageRadius} onChange={(v) => set({ imageRadius: v })} min={0} max={60} /></Field>
              <Field label="Button radius"><NumberInput value={block.buttonRadius} onChange={(v) => set({ buttonRadius: v })} min={0} max={999} /></Field>
            </Grid2>
          </Row>
          <Row><Label>Alignment</Label><AlignInput value={block.textAlign} onChange={(v) => set({ textAlign: v })} /></Row>
        </>
      );
    }

    case "cta": {
      const set = u as Patch<typeof block>;
      return (
        <>
          <SectionTitle>Content</SectionTitle>
          <Row><Label>Heading</Label><TextInput value={block.heading} onChange={(v) => set({ heading: v })} /></Row>
          <Row><Label>Subheading</Label><TextArea value={block.subheading} onChange={(v) => set({ subheading: v })} rows={3} /></Row>
          <Row><Label>Heading Color</Label><ColorInput value={block.headingColor} onChange={(v) => set({ headingColor: v })} /></Row>
          <Row><Label>Subheading Color</Label><ColorInput value={block.subheadingColor} onChange={(v) => set({ subheadingColor: v })} /></Row>
          <FontRow label="Heading Font" value={block.headingFont} onChange={(v) => set({ headingFont: v })} />
          <FontRow label="Body Font" value={block.fontFamily} onChange={(v) => set({ fontFamily: v })} />
          <Row><Label>Alignment</Label><AlignInput value={block.textAlign} onChange={(v) => set({ textAlign: v })} /></Row>
          <SectionTitle>Button</SectionTitle>
          <Row><Label>Label</Label><TextInput value={block.buttonText} onChange={(v) => set({ buttonText: v })} placeholder="Leave empty to hide" /></Row>
          <Row><Label>Button Color</Label><ColorInput value={block.buttonBg} onChange={(v) => set({ buttonBg: v })} /></Row>
          <Row><Label>Text Color</Label><ColorInput value={block.buttonColor} onChange={(v) => set({ buttonColor: v })} /></Row>
          <Row><Label>Corner Radius</Label><NumberInput value={block.buttonRadius} onChange={(v) => set({ buttonRadius: v })} min={0} max={999} /></Row>
        </>
      );
    }

    case "footer_block": {
      const set = u as Patch<typeof block>;
      return (
        <>
          <SectionTitle>Footer</SectionTitle>
          <Row><Label>Company Name</Label><TextInput value={block.companyName} onChange={(v) => set({ companyName: v })} /></Row>
          <Row><Label>Address</Label><TextArea value={block.address} onChange={(v) => set({ address: v })} rows={2} /></Row>
          <Row><Label>Unsubscribe Label</Label><TextInput value={block.unsubscribeText} onChange={(v) => set({ unsubscribeText: v })} /></Row>
          <Row><Label>Unsubscribe URL</Label><TextInput value={block.unsubscribeUrl} onChange={(v) => set({ unsubscribeUrl: v })} placeholder="https://..." /></Row>
          <SectionTitle>Typography</SectionTitle>
          <FontRow value={block.fontFamily} onChange={(v) => set({ fontFamily: v })} />
          <Row><Label>Font Size</Label><NumberInput value={block.fontSize} onChange={(v) => set({ fontSize: v })} min={8} max={18} /></Row>
          <Row><Label>Text Color</Label><ColorInput value={block.textColor} onChange={(v) => set({ textColor: v })} /></Row>
          <Row><Label>Alignment</Label><AlignInput value={block.textAlign} onChange={(v) => set({ textAlign: v })} /></Row>
        </>
      );
    }

    default:
      return null;
  }
}

// ─── Row (Section) Properties ─────────────────────────────────────────────────

const WIDTH_PRESETS: Record<number, { label: string; widths: number[] }[]> = {
  2: [{ label: "50 / 50", widths: [50, 50] }, { label: "33 / 67", widths: [33.33, 66.67] }, { label: "67 / 33", widths: [66.67, 33.33] }, { label: "25 / 75", widths: [25, 75] }, { label: "75 / 25", widths: [75, 25] }],
  3: [{ label: "Equal", widths: [33.33, 33.33, 33.34] }, { label: "50 / 25 / 25", widths: [50, 25, 25] }, { label: "25 / 50 / 25", widths: [25, 50, 25] }, { label: "25 / 25 / 50", widths: [25, 25, 50] }],
  4: [{ label: "Equal", widths: [25, 25, 25, 25] }, { label: "40 / 20 / 20 / 20", widths: [40, 20, 20, 20] }],
};

interface SectionHandlers {
  onSectionSettings: (patch: Partial<SectionSettings>) => void;
  onColumnChange: (columnId: string, patch: Partial<Omit<EmailColumn, "id" | "blocks">>) => void;
  onColumnWidths: (widths: number[]) => void;
  onAddColumn: () => void;
  onRemoveColumn: (columnId: string) => void;
}

function SectionProperties({ section, onSectionSettings, onColumnChange, onColumnWidths, onAddColumn, onRemoveColumn }: { section: EmailSection } & SectionHandlers) {
  const s = section.settings;
  const count = section.columns.length;
  const widths = section.columns.map((c) => c.width);

  return (
    <>
      <SectionTitle>Row</SectionTitle>
      <Row><Label>Name</Label><TextInput value={s.name} onChange={(v) => onSectionSettings({ name: v })} placeholder="e.g. Header" /></Row>

      <SectionTitle>Columns</SectionTitle>
      <Row>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-zinc-300">{count} column{count === 1 ? "" : "s"}</span>
          <button type="button" disabled={count >= MAX_COLUMNS} onClick={onAddColumn} className="rounded border border-white/[0.1] px-2 py-1 text-[11px] text-zinc-300 hover:border-[#00D084]/40 hover:text-[#00D084] disabled:opacity-30">
            + Add column
          </button>
        </div>
      </Row>
      {count > 1 && (
        <>
          <Row>
            <Label>Width Presets</Label>
            <div className="flex flex-wrap gap-1">
              {(WIDTH_PRESETS[count] || []).map((preset) => (
                <button key={preset.label} type="button" onClick={() => onColumnWidths(preset.widths)} className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[10px] text-zinc-400 hover:border-[#00D084]/40 hover:text-white">
                  {preset.label}
                </button>
              ))}
            </div>
          </Row>
          <Row>
            <Label>Gap Between Columns</Label>
            <NumberInput value={s.gap} onChange={(v) => onSectionSettings({ gap: v })} min={0} max={80} />
          </Row>
          <Row><Toggle value={s.stackOnMobile} onChange={(v) => onSectionSettings({ stackOnMobile: v })} label="Stack columns on mobile" /></Row>
        </>
      )}

      {section.columns.map((column, i) => (
        <div key={column.id} className="mb-2 rounded border border-white/[0.06] bg-white/[0.02] p-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-zinc-500">Column {i + 1}</span>
            {count > 1 && (
              <button type="button" onClick={() => onRemoveColumn(column.id)} title="Remove this column (its content moves to the next column)" className="rounded px-1.5 py-0.5 text-[10px] text-red-400 hover:bg-red-500/20">
                Remove
              </button>
            )}
          </div>
          <Grid2>
            {count > 1 && (
              <Field label="Width %">
                <NumberInput
                  value={Math.round(column.width * 100) / 100}
                  min={5}
                  max={95}
                  onChange={(v) => {
                    // Keep the total at 100 by taking the difference from the other columns
                    const others = widths.reduce((sum, w, j) => (j === i ? sum : sum + w), 0);
                    const scale = others > 0 ? (100 - v) / others : 1;
                    onColumnWidths(widths.map((w, j) => (j === i ? v : w * scale)));
                  }}
                />
              </Field>
            )}
            <Field label="Padding"><NumberInput value={column.padding} onChange={(v) => onColumnChange(column.id, { padding: v })} min={0} max={80} /></Field>
            <Field label="Radius"><NumberInput value={column.borderRadius} onChange={(v) => onColumnChange(column.id, { borderRadius: v })} min={0} max={60} /></Field>
            <Field label="Align">
              <SelectInput value={column.verticalAlign} onChange={(v) => onColumnChange(column.id, { verticalAlign: v as EmailColumn["verticalAlign"] })} options={[{ label: "Top", value: "top" }, { label: "Middle", value: "middle" }, { label: "Bottom", value: "bottom" }]} />
            </Field>
          </Grid2>
          <div className="mt-2">
            <div className="mb-0.5 text-[9px] text-zinc-600">Background</div>
            <ColorInput value={column.backgroundColor} onChange={(v) => onColumnChange(column.id, { backgroundColor: v })} allowNone />
          </div>
        </div>
      ))}

      <SectionTitle>Row Background</SectionTitle>
      <Row><Label>Background Color</Label><ColorInput value={s.backgroundColor} onChange={(v) => onSectionSettings({ backgroundColor: v })} allowNone /></Row>
      <SectionTitle>Row Border</SectionTitle>
      <Row><Label>Border Width</Label><NumberInput value={s.borderWidth} onChange={(v) => onSectionSettings({ borderWidth: v })} min={0} max={20} /></Row>
      {s.borderWidth > 0 && (
        <>
          <Row><Label>Border Color</Label><ColorInput value={s.borderColor} onChange={(v) => onSectionSettings({ borderColor: v })} /></Row>
          <Row><Label>Border Style</Label><SelectInput value={s.borderStyle} onChange={(v) => onSectionSettings({ borderStyle: v as BorderStyle })} options={BORDER_STYLE_OPTIONS} /></Row>
        </>
      )}
      <SectionTitle>Row Spacing</SectionTitle>
      <PaddingInputs value={s} onChange={(p) => onSectionSettings(p)} />
    </>
  );
}

// ─── Email Settings Panel ─────────────────────────────────────────────────────

function EmailSettingsForm({ settings, onChange }: { settings: EmailSettings; onChange: (s: EmailSettings) => void }) {
  const u = (p: Partial<EmailSettings>) => onChange({ ...settings, ...p });
  return (
    <>
      <SectionTitle>Email Info</SectionTitle>
      <Row><Label>Subject Line</Label><TextInput value={settings.subject} onChange={(v) => u({ subject: v })} /></Row>
      <Row><Label>Preheader Text</Label><TextInput value={settings.preheader} onChange={(v) => u({ preheader: v })} placeholder="Preview text…" /></Row>
      <Row><Label>Sender Name</Label><TextInput value={settings.senderName} onChange={(v) => u({ senderName: v })} /></Row>
      <Row><Label>Reply-To</Label><TextInput value={settings.replyTo} onChange={(v) => u({ replyTo: v })} placeholder="reply@example.com" /></Row>
      <SectionTitle>Layout</SectionTitle>
      <Row><Label>Email Width (px)</Label><NumberInput value={settings.emailWidth} onChange={(v) => u({ emailWidth: v })} min={400} max={800} /></Row>
      <SectionTitle>Colors</SectionTitle>
      <Row><Label>Outer Background</Label><ColorInput value={settings.backgroundColor} onChange={(v) => u({ backgroundColor: v })} /></Row>
      <Row><Label>Content Background</Label><ColorInput value={settings.contentBackground} onChange={(v) => u({ contentBackground: v })} /></Row>
      <SectionTitle>Typography</SectionTitle>
      <Row><Label>Default Font</Label><SelectInput value={settings.defaultFont} onChange={(v) => u({ defaultFont: v })} options={FONT_OPTIONS} /></Row>
    </>
  );
}

// ─── Main Properties Panel ────────────────────────────────────────────────────

interface PropertiesPanelProps extends Partial<SectionHandlers> {
  block: EmailBlock | null;
  /** The selected row, when a row (not a block) is selected */
  section?: EmailSection | null;
  emailSettings: EmailSettings;
  onBlockChange: (b: EmailBlock) => void;
  onSettingsChange: (s: EmailSettings) => void;
  /** Jump from a block to the row that contains it */
  onSelectRow?: () => void;
}

const noop = () => undefined;

export default function PropertiesPanel({
  block, section = null, emailSettings, onBlockChange, onSettingsChange, onSelectRow,
  onSectionSettings = noop, onColumnChange = noop, onColumnWidths = noop, onAddColumn = noop, onRemoveColumn = noop,
}: PropertiesPanelProps) {
  const title = block
    ? `${block.type.charAt(0).toUpperCase() + block.type.slice(1).replace("_block", "").replace("_", " ")} Properties`
    : section
      ? "Row Properties"
      : "Email Settings";
  const hint = block ? "Edit selected block" : section ? "Layout, columns and background" : "Select a block to edit its properties";

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-white/[0.06] px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-[12px] font-semibold text-zinc-300">{title}</h3>
          <p className="text-[10px] text-zinc-600">{hint}</p>
        </div>
        {block && onSelectRow && (
          <button type="button" onClick={onSelectRow} title="Edit the row that contains this block" className="shrink-0 rounded border border-white/[0.08] px-2 py-1 text-[10px] text-zinc-400 hover:border-[#2F81FF]/50 hover:text-white">
            Row ↑
          </button>
        )}
      </div>

      {/* Props */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {block ? (
          <>
            <LinkProperties block={block} onChange={onBlockChange} />
            <BlockProperties block={block} onChange={onBlockChange} />
            {block.type !== "spacer" && <BoxProperties block={block} u={(p) => onBlockChange({ ...block, ...p } as EmailBlock)} />}
          </>
        ) : section ? (
          <SectionProperties
            section={section}
            onSectionSettings={onSectionSettings}
            onColumnChange={onColumnChange}
            onColumnWidths={onColumnWidths}
            onAddColumn={onAddColumn}
            onRemoveColumn={onRemoveColumn}
          />
        ) : (
          <EmailSettingsForm settings={emailSettings} onChange={onSettingsChange} />
        )}
      </div>
    </div>
  );
}
