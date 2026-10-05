import React, { useRef } from "react";
import {
  EmailBlock, TextBlock, HeadingBlock, ImageBlock, ButtonBlock,
  DividerBlock, SpacerBlock, SocialBlock, LogoBlock, HtmlBlock,
  HeroBlock, FeatureBlock, ProductBlock, CtaBlock, FooterBlock,
  TextAlign, FontWeight,
} from "@/types/email";
import { EmailSettings } from "@/types/email";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{children}</label>;
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="mb-3">{children}</div>;
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[12px] text-zinc-200 placeholder-zinc-600 outline-none focus:border-[#00D084]/40"
    />
  );
}

function NumberInput({ value, onChange, min, max, step = 1 }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      min={min}
      max={max}
      step={step}
      className="w-full rounded border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[12px] text-zinc-200 outline-none focus:border-[#00D084]/40"
    />
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => ref.current?.click()}
        className="h-6 w-6 shrink-0 rounded border border-white/20"
        style={{ backgroundColor: value }}
      />
      <input
        ref={ref}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="hidden"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded border border-white/[0.08] bg-white/[0.03] px-2 py-1.5 font-mono text-[11px] text-zinc-300 outline-none focus:border-[#00D084]/40"
      />
    </div>
  );
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-white/[0.08] bg-[#0a0a0a] px-2.5 py-1.5 text-[12px] text-zinc-200 outline-none focus:border-[#00D084]/40"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function PaddingInputs({ block, onChange }: { block: EmailBlock; onChange: (p: Record<string, number>) => void }) {
  return (
    <Row>
      <Label>Padding (px)</Label>
      <div className="grid grid-cols-2 gap-1.5">
        {(["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"] as const).map((k) => (
          <div key={k}>
            <div className="mb-0.5 text-[9px] text-zinc-600 capitalize">{k.replace("padding", "")}</div>
            <NumberInput value={block[k]} onChange={(v) => onChange({ [k]: v })} min={0} />
          </div>
        ))}
      </div>
    </Row>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 mt-4 border-t border-white/[0.06] pt-3 font-mono text-[9px] font-semibold uppercase tracking-widest text-zinc-600">
      {children}
    </div>
  );
}

const FONT_OPTIONS = [
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
];

const ALIGN_OPTIONS = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
];

const WEIGHT_OPTIONS = [
  { label: "Normal", value: "normal" },
  { label: "Semibold", value: "600" },
  { label: "Bold", value: "bold" },
];

// ─── Block Properties Panels ──────────────────────────────────────────────────

function TextProperties({ block, onChange }: { block: TextBlock; onChange: (b: EmailBlock) => void }) {
  const u = (p: Partial<TextBlock>) => onChange({ ...block, ...p });
  return (
    <>
      <SectionTitle>Typography</SectionTitle>
      <Row><Label>Font Family</Label><SelectInput value={block.fontFamily} onChange={(v) => u({ fontFamily: v })} options={FONT_OPTIONS} /></Row>
      <Row><Label>Font Size</Label><NumberInput value={block.fontSize} onChange={(v) => u({ fontSize: v })} min={8} max={120} /></Row>
      <Row><Label>Font Weight</Label><SelectInput value={block.fontWeight} onChange={(v) => u({ fontWeight: v as FontWeight })} options={WEIGHT_OPTIONS} /></Row>
      <Row><Label>Color</Label><ColorInput value={block.color} onChange={(v) => u({ color: v })} /></Row>
      <Row><Label>Text Align</Label><SelectInput value={block.textAlign} onChange={(v) => u({ textAlign: v as TextAlign })} options={ALIGN_OPTIONS} /></Row>
      <Row><Label>Line Height</Label><NumberInput value={block.lineHeight} onChange={(v) => u({ lineHeight: v })} min={1} max={3} step={0.1} /></Row>
      <Row><Label>Letter Spacing</Label><NumberInput value={block.letterSpacing} onChange={(v) => u({ letterSpacing: v })} min={-2} max={10} step={0.5} /></Row>
      <SectionTitle>Background</SectionTitle>
      <Row><Label>Background Color</Label><ColorInput value={block.backgroundColor} onChange={(v) => u({ backgroundColor: v })} /></Row>
      <SectionTitle>Spacing</SectionTitle>
      <PaddingInputs block={block} onChange={(p) => u(p as Partial<TextBlock>)} />
    </>
  );
}

function HeadingProperties({ block, onChange }: { block: HeadingBlock; onChange: (b: EmailBlock) => void }) {
  const u = (p: Partial<HeadingBlock>) => onChange({ ...block, ...p });
  return (
    <>
      <SectionTitle>Heading</SectionTitle>
      <Row><Label>Level</Label><SelectInput value={String(block.level)} onChange={(v) => u({ level: parseInt(v) as 1 | 2 | 3 })} options={[{ label: "H1", value: "1" }, { label: "H2", value: "2" }, { label: "H3", value: "3" }]} /></Row>
      <SectionTitle>Typography</SectionTitle>
      <Row><Label>Font Family</Label><SelectInput value={block.fontFamily} onChange={(v) => u({ fontFamily: v })} options={FONT_OPTIONS} /></Row>
      <Row><Label>Font Size</Label><NumberInput value={block.fontSize} onChange={(v) => u({ fontSize: v })} min={12} max={80} /></Row>
      <Row><Label>Font Weight</Label><SelectInput value={block.fontWeight} onChange={(v) => u({ fontWeight: v as FontWeight })} options={WEIGHT_OPTIONS} /></Row>
      <Row><Label>Color</Label><ColorInput value={block.color} onChange={(v) => u({ color: v })} /></Row>
      <Row><Label>Text Align</Label><SelectInput value={block.textAlign} onChange={(v) => u({ textAlign: v as TextAlign })} options={ALIGN_OPTIONS} /></Row>
      <SectionTitle>Spacing</SectionTitle>
      <PaddingInputs block={block} onChange={(p) => u(p as Partial<HeadingBlock>)} />
    </>
  );
}

function ImageProperties({ block, onChange }: { block: ImageBlock; onChange: (b: EmailBlock) => void }) {
  const u = (p: Partial<ImageBlock>) => onChange({ ...block, ...p });
  return (
    <>
      <SectionTitle>Image</SectionTitle>
      <Row><Label>Image URL</Label><TextInput value={block.src} onChange={(v) => u({ src: v })} placeholder="https://..." /></Row>
      <Row><Label>Alt Text</Label><TextInput value={block.alt} onChange={(v) => u({ alt: v })} /></Row>
      <Row><Label>Link URL</Label><TextInput value={block.linkUrl} onChange={(v) => u({ linkUrl: v })} placeholder="https://..." /></Row>
      <SectionTitle>Dimensions</SectionTitle>
      <Row><Label>Width</Label>
        <SelectInput value={block.width === "100%" ? "full" : "custom"} onChange={(v) => u({ width: v === "full" ? "100%" : 300 })} options={[{ label: "Full Width", value: "full" }, { label: "Custom px", value: "custom" }]} />
        {block.width !== "100%" && <div className="mt-1"><NumberInput value={block.width as number} onChange={(v) => u({ width: v })} min={50} max={800} /></div>}
      </Row>
      <Row><Label>Border Radius</Label><NumberInput value={block.borderRadius} onChange={(v) => u({ borderRadius: v })} min={0} max={50} /></Row>
      <Row><Label>Alignment</Label><SelectInput value={block.alignment} onChange={(v) => u({ alignment: v as TextAlign })} options={ALIGN_OPTIONS} /></Row>
      <SectionTitle>Spacing</SectionTitle>
      <PaddingInputs block={block} onChange={(p) => u(p as Partial<ImageBlock>)} />
    </>
  );
}

function ButtonProperties({ block, onChange }: { block: ButtonBlock; onChange: (b: EmailBlock) => void }) {
  const u = (p: Partial<ButtonBlock>) => onChange({ ...block, ...p });
  return (
    <>
      <SectionTitle>Button</SectionTitle>
      <Row><Label>Link URL</Label><TextInput value={block.linkUrl} onChange={(v) => u({ linkUrl: v })} placeholder="https://..." /></Row>
      <SectionTitle>Style</SectionTitle>
      <Row><Label>Background Color</Label><ColorInput value={block.bgColor} onChange={(v) => u({ bgColor: v })} /></Row>
      <Row><Label>Text Color</Label><ColorInput value={block.textColor} onChange={(v) => u({ textColor: v })} /></Row>
      <Row><Label>Font Size</Label><NumberInput value={block.fontSize} onChange={(v) => u({ fontSize: v })} min={10} max={32} /></Row>
      <Row><Label>Font Weight</Label><SelectInput value={block.fontWeight} onChange={(v) => u({ fontWeight: v as FontWeight })} options={WEIGHT_OPTIONS} /></Row>
      <Row><Label>Border Radius</Label><NumberInput value={block.borderRadius} onChange={(v) => u({ borderRadius: v })} min={0} max={50} /></Row>
      <Row><Label>Alignment</Label><SelectInput value={block.alignment} onChange={(v) => u({ alignment: v as TextAlign })} options={ALIGN_OPTIONS} /></Row>
      <SectionTitle>Spacing</SectionTitle>
      <PaddingInputs block={block} onChange={(p) => u(p as Partial<ButtonBlock>)} />
    </>
  );
}

function DividerProperties({ block, onChange }: { block: DividerBlock; onChange: (b: EmailBlock) => void }) {
  const u = (p: Partial<DividerBlock>) => onChange({ ...block, ...p });
  return (
    <>
      <SectionTitle>Divider</SectionTitle>
      <Row><Label>Color</Label><ColorInput value={block.color} onChange={(v) => u({ color: v })} /></Row>
      <Row><Label>Thickness (px)</Label><NumberInput value={block.thickness} onChange={(v) => u({ thickness: v })} min={1} max={20} /></Row>
      <Row><Label>Style</Label><SelectInput value={block.style} onChange={(v) => u({ style: v as "solid" | "dashed" | "dotted" })} options={[{ label: "Solid", value: "solid" }, { label: "Dashed", value: "dashed" }, { label: "Dotted", value: "dotted" }]} /></Row>
      <SectionTitle>Spacing</SectionTitle>
      <PaddingInputs block={block} onChange={(p) => u(p as Partial<DividerBlock>)} />
    </>
  );
}

function SpacerProperties({ block, onChange }: { block: SpacerBlock; onChange: (b: EmailBlock) => void }) {
  const u = (p: Partial<SpacerBlock>) => onChange({ ...block, ...p });
  return (
    <>
      <SectionTitle>Spacer</SectionTitle>
      <Row><Label>Height (px)</Label><NumberInput value={block.height} onChange={(v) => u({ height: v })} min={8} max={200} /></Row>
    </>
  );
}

function HeroProperties({ block, onChange }: { block: HeroBlock; onChange: (b: EmailBlock) => void }) {
  const u = (p: Partial<HeroBlock>) => onChange({ ...block, ...p });
  return (
    <>
      <SectionTitle>Background</SectionTitle>
      <Row><Label>Image URL</Label><TextInput value={block.imageSrc} onChange={(v) => u({ imageSrc: v })} placeholder="https://..." /></Row>
      <Row><Label>Overlay Color</Label><ColorInput value={block.overlayColor} onChange={(v) => u({ overlayColor: v })} /></Row>
      <Row><Label>Overlay Opacity</Label><NumberInput value={block.overlayOpacity} onChange={(v) => u({ overlayOpacity: v })} min={0} max={1} step={0.05} /></Row>
      <SectionTitle>Text</SectionTitle>
      <Row><Label>Heading Color</Label><ColorInput value={block.headingColor} onChange={(v) => u({ headingColor: v })} /></Row>
      <Row><Label>Subheading Color</Label><ColorInput value={block.subheadingColor} onChange={(v) => u({ subheadingColor: v })} /></Row>
      <Row><Label>Alignment</Label><SelectInput value={block.textAlign} onChange={(v) => u({ textAlign: v as TextAlign })} options={ALIGN_OPTIONS} /></Row>
      <SectionTitle>Button</SectionTitle>
      <Row><Label>Button URL</Label><TextInput value={block.buttonUrl} onChange={(v) => u({ buttonUrl: v })} placeholder="https://..." /></Row>
      <Row><Label>Button Background</Label><ColorInput value={block.buttonBg} onChange={(v) => u({ buttonBg: v })} /></Row>
      <Row><Label>Button Text Color</Label><ColorInput value={block.buttonColor} onChange={(v) => u({ buttonColor: v })} /></Row>
      <SectionTitle>Spacing</SectionTitle>
      <PaddingInputs block={block} onChange={(p) => u(p as Partial<HeroBlock>)} />
    </>
  );
}

function CtaProperties({ block, onChange }: { block: CtaBlock; onChange: (b: EmailBlock) => void }) {
  const u = (p: Partial<CtaBlock>) => onChange({ ...block, ...p });
  return (
    <>
      <SectionTitle>CTA Block</SectionTitle>
      <Row><Label>Background</Label><ColorInput value={block.backgroundColor} onChange={(v) => u({ backgroundColor: v })} /></Row>
      <Row><Label>Heading Color</Label><ColorInput value={block.headingColor} onChange={(v) => u({ headingColor: v })} /></Row>
      <Row><Label>Subheading Color</Label><ColorInput value={block.subheadingColor} onChange={(v) => u({ subheadingColor: v })} /></Row>
      <Row><Label>Alignment</Label><SelectInput value={block.textAlign} onChange={(v) => u({ textAlign: v as TextAlign })} options={ALIGN_OPTIONS} /></Row>
      <SectionTitle>Button</SectionTitle>
      <Row><Label>Button URL</Label><TextInput value={block.buttonUrl} onChange={(v) => u({ buttonUrl: v })} placeholder="https://..." /></Row>
      <Row><Label>Button Background</Label><ColorInput value={block.buttonBg} onChange={(v) => u({ buttonBg: v })} /></Row>
      <Row><Label>Button Text Color</Label><ColorInput value={block.buttonColor} onChange={(v) => u({ buttonColor: v })} /></Row>
      <SectionTitle>Spacing</SectionTitle>
      <PaddingInputs block={block} onChange={(p) => u(p as Partial<CtaBlock>)} />
    </>
  );
}

function FooterProperties({ block, onChange }: { block: FooterBlock; onChange: (b: EmailBlock) => void }) {
  const u = (p: Partial<FooterBlock>) => onChange({ ...block, ...p });
  return (
    <>
      <SectionTitle>Footer</SectionTitle>
      <Row><Label>Unsubscribe URL</Label><TextInput value={block.unsubscribeUrl} onChange={(v) => u({ unsubscribeUrl: v })} placeholder="https://..." /></Row>
      <Row><Label>Font Size</Label><NumberInput value={block.fontSize} onChange={(v) => u({ fontSize: v })} min={8} max={16} /></Row>
      <Row><Label>Text Color</Label><ColorInput value={block.textColor} onChange={(v) => u({ textColor: v })} /></Row>
      <Row><Label>Background</Label><ColorInput value={block.backgroundColor} onChange={(v) => u({ backgroundColor: v })} /></Row>
      <Row><Label>Alignment</Label><SelectInput value={block.textAlign} onChange={(v) => u({ textAlign: v as TextAlign })} options={ALIGN_OPTIONS} /></Row>
      <SectionTitle>Spacing</SectionTitle>
      <PaddingInputs block={block} onChange={(p) => u(p as Partial<FooterBlock>)} />
    </>
  );
}

function GenericPaddingProperties({ block, onChange }: { block: EmailBlock; onChange: (b: EmailBlock) => void }) {
  return (
    <>
      <SectionTitle>Background</SectionTitle>
      <Row><Label>Background Color</Label><ColorInput value={block.backgroundColor} onChange={(v) => onChange({ ...block, backgroundColor: v })} /></Row>
      <SectionTitle>Spacing</SectionTitle>
      <PaddingInputs block={block} onChange={(p) => onChange({ ...block, ...p })} />
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

interface PropertiesPanelProps {
  block: EmailBlock | null;
  emailSettings: EmailSettings;
  onBlockChange: (b: EmailBlock) => void;
  onSettingsChange: (s: EmailSettings) => void;
}

export default function PropertiesPanel({
  block,
  emailSettings,
  onBlockChange,
  onSettingsChange,
}: PropertiesPanelProps) {
  const renderBlockProps = () => {
    if (!block) {
      return <EmailSettingsForm settings={emailSettings} onChange={onSettingsChange} />;
    }

    switch (block.type) {
      case "text":    return <TextProperties block={block as TextBlock} onChange={onBlockChange} />;
      case "heading": return <HeadingProperties block={block as HeadingBlock} onChange={onBlockChange} />;
      case "image":   return <ImageProperties block={block as ImageBlock} onChange={onBlockChange} />;
      case "button":  return <ButtonProperties block={block as ButtonBlock} onChange={onBlockChange} />;
      case "divider": return <DividerProperties block={block as DividerBlock} onChange={onBlockChange} />;
      case "spacer":  return <SpacerProperties block={block as SpacerBlock} onChange={onBlockChange} />;
      case "hero":    return <HeroProperties block={block as HeroBlock} onChange={onBlockChange} />;
      case "cta":     return <CtaProperties block={block as CtaBlock} onChange={onBlockChange} />;
      case "footer_block": return <FooterProperties block={block as FooterBlock} onChange={onBlockChange} />;
      default:        return <GenericPaddingProperties block={block} onChange={onBlockChange} />;
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-4 py-3">
        <h3 className="text-[12px] font-semibold text-zinc-300">
          {block
            ? `${block.type.charAt(0).toUpperCase() + block.type.slice(1).replace("_", " ")} Properties`
            : "Email Settings"}
        </h3>
        <p className="text-[10px] text-zinc-600">
          {block ? "Edit selected block" : "Select a block to edit its properties"}
        </p>
      </div>

      {/* Props */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {renderBlockProps()}
      </div>
    </div>
  );
}
