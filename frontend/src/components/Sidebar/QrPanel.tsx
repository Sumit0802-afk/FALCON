import React, { useMemo, useRef, useState } from "react";
import { QrCode } from "lucide-react";
import { qrDataUrl, qrWarnings } from "@/utils/qrCode";
import { QR_CONTENT_TYPES, QR_DEFAULT, QR_TEMPLATES, QrConfig, applyTemplate, changeQr, configOf, contentType, encodeQr, readFields } from "@/utils/qrDesign";

/**
 * The QR Code tool. With nothing selected it designs a new code and adds it to
 * the page. With a QR code selected on the page it edits that one, live.
 *
 * A code on the page is an ordinary picture: it is moved, resized, layered,
 * duplicated and deleted like any other. Its settings travel with it, which is
 * what lets it be opened here again.
 */

interface QrPanelProps {
  /** The QR code selected on the page, with how wide it is drawn there */
  selected: { id: string; config: QrConfig; width: number } | null;
  onAdd: (config: QrConfig) => void;
  onUpdate: (id: string, config: QrConfig) => void;
}

const INPUT = "w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[12px] text-zinc-200 placeholder-zinc-600 outline-none focus:border-[#00dfb6]/50";
const LABEL = "mb-1 block text-[10.5px] font-medium uppercase tracking-wide text-zinc-500";
const SAMPLE = encodeQr("https://example.com", false);

function Title({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 mt-5 border-t border-white/[0.06] pt-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{children}</p>;
}

function Color({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value);
  const shown = useRef(value);
  if (shown.current !== value) { shown.current = value; if (text.toLowerCase() !== value.toLowerCase()) setText(value); }
  return (
    <label className="block">
      <span className={LABEL}>{label}</span>
      <span className="flex items-center gap-2">
        <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value)} className="h-8 w-9 shrink-0 cursor-pointer rounded border border-white/[0.1] bg-transparent p-0.5" aria-label={label} />
        <input
          type="text"
          value={text}
          onChange={(e) => { setText(e.target.value); if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(e.target.value.trim())) onChange(e.target.value.trim()); }}
          onBlur={() => setText(value)}
          className={`${INPUT} font-mono`}
          spellCheck={false}
        />
      </span>
    </label>
  );
}

function Choice<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1">
      {options.map((option) => (
        <button key={option.id} type="button" onClick={() => onChange(option.id)} aria-pressed={value === option.id} className={`rounded-lg border px-2.5 py-1.5 text-[11px] transition-colors ${value === option.id ? "border-[#00dfb6]/50 bg-[#00dfb6]/15 text-[#00dfb6]" : "border-white/[0.08] text-zinc-400 hover:text-zinc-200"}`}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** A picture from the user's computer, made small and embedded, since a QR picture cannot load one from the web */
function readLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const side = 240;
      const canvas = document.createElement("canvas");
      canvas.width = side;
      canvas.height = side;
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(url);
      if (!ctx) return reject(new Error("no canvas"));
      const scale = Math.min(side / image.naturalWidth, side / image.naturalHeight);
      const w = image.naturalWidth * scale;
      const h = image.naturalHeight * scale;
      ctx.drawImage(image, (side - w) / 2, (side - h) / 2, w, h);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("not a picture")); };
    image.src = url;
  });
}

export function QrPanel({ selected, onAdd, onUpdate }: QrPanelProps) {
  // The code being designed while nothing on the page is selected
  const [draft, setDraft] = useState<QrConfig>(() => configOf(QR_DEFAULT));
  const [logoError, setLogoError] = useState("");
  const file = useRef<HTMLInputElement>(null);

  const value = selected ? selected.config : draft;
  const apply = (next: QrConfig) => (selected ? onUpdate(selected.id, next) : setDraft(next));
  const set = (patch: Partial<QrConfig>) => apply(changeQr(value, patch));

  const type = contentType(value.contentType);
  const fields = readFields(value.fields);
  const warnings = useMemo(() => qrWarnings(value, selected?.width), [value, selected?.width]);
  const tooLong = Boolean(value.data) && !value.modules;
  const preview = useMemo(() => qrDataUrl(value, 480), [value]);

  // The library is drawn once; every design is shown on the same example code
  const gallery = useMemo(() => QR_TEMPLATES.map((template) => ({
    template,
    src: qrDataUrl({ ...QR_DEFAULT, ...template.look, modules: SAMPLE, logoUrl: "", caption: "", quietZone: 2 }, 160),
  })), []);

  const setField = (key: string, text: string) => set({ fields: JSON.stringify({ ...fields, [key]: text }) });

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-r border-white/[0.08] bg-[#0c0c0e] text-white">
      <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.07] p-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00dfb6]/15 text-[#00dfb6]"><QrCode size={18} /></span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">QR Code</h2>
          <p className="truncate text-[11px] text-zinc-500">{selected ? "Editing the code selected on the page" : "Design a code and add it to the page"}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {/* Preview and the main action */}
        <div className="flex items-center justify-center rounded-xl border border-white/[0.07] bg-[repeating-conic-gradient(#1a1b20_0_25%,#141519_0_50%)] bg-[length:16px_16px] p-4">
          {preview
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={preview} alt="QR code preview" className="max-h-[190px] w-auto max-w-full" />
            : <p className="py-10 text-center text-[12px] text-zinc-500">{tooLong ? "The content is too long for a QR code" : "Enter the content to make the code"}</p>}
        </div>
        {selected ? (
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => onAdd(value)} className="flex-1 rounded-xl border border-white/[0.1] px-3 py-2 text-[12px] font-medium text-zinc-200 transition hover:bg-white/[0.06]">Duplicate QR</button>
          </div>
        ) : (
          <button type="button" onClick={() => onAdd(draft)} disabled={!draft.modules} className="mt-3 w-full rounded-xl bg-[#00dfb6] px-3 py-2.5 text-[13px] font-semibold text-black transition hover:bg-[#19f0c8] disabled:cursor-not-allowed disabled:opacity-50">Add to design</button>
        )}
        <p className="mt-2 text-[10.5px] leading-relaxed text-zinc-500">
          {selected ? "Changes show on the page as you make them. A duplicate keeps this design and can hold different content." : "Once on the page it can be moved, resized and layered like any picture. Select it and open this tool to change it."}
        </p>

        {(warnings.length > 0 || tooLong) && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.07] p-3" role="status">
            <p className="text-[12px] font-semibold text-amber-200">⚠ QR code warning</p>
            <p className="mt-1 text-[11.5px] text-amber-100/90">This QR code may be difficult to scan.</p>
            <ul className="mt-2 space-y-2">
              {tooLong && <li className="text-[11.5px] leading-relaxed text-zinc-200"><span className="text-zinc-400">Reason: </span>The content is too long to fit in a QR code.<br /><span className="text-zinc-400">Recommendation: </span>Shorten it, or link to a page that holds the rest.</li>}
              {warnings.map((warning, i) => (
                <li key={i} className="text-[11.5px] leading-relaxed text-zinc-200">
                  <span className="text-zinc-400">Reason: </span>{warning.reason}<br />
                  <span className="text-zinc-400">Recommendation: </span>{warning.recommendation}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[10.5px] text-zinc-500">Nothing has been changed for you.</p>
          </div>
        )}

        <Title>Design</Title>
        <div className="grid grid-cols-3 gap-1.5">
          {gallery.map(({ template, src }) => (
            <button
              key={template.id}
              type="button"
              onClick={() => apply(applyTemplate(value, template))}
              aria-pressed={value.template === template.id}
              title={template.name}
              className={`flex flex-col items-center gap-1 rounded-xl border p-1.5 transition-colors ${value.template === template.id ? "border-[#00dfb6]/60 bg-[#00dfb6]/10" : "border-white/[0.08] hover:border-white/20"}`}
            >
              <span className="flex h-[72px] w-full items-center justify-center overflow-hidden rounded-lg bg-white/[0.05] p-1.5" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-auto" loading="lazy" />
              </span>
              <span className="w-full truncate text-center text-[10px] text-zinc-300">{template.name}</span>
            </button>
          ))}
        </div>

        <Title>Content</Title>
        <label className="block">
          <span className={LABEL}>This code opens</span>
          <select value={type.id} onChange={(e) => set({ contentType: e.target.value, fields: "{}" })} className={INPUT}>
            {QR_CONTENT_TYPES.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </label>
        {type.fields.map((field) => (
          <label key={field.key} className="mt-2 block">
            <span className={LABEL}>{field.label}</span>
            {field.kind === "long" ? (
              <textarea value={fields[field.key] || ""} onChange={(e) => setField(field.key, e.target.value)} rows={3} placeholder={field.placeholder} className={`${INPUT} resize-y`} />
            ) : field.kind === "select" ? (
              <select value={fields[field.key] || field.options?.[0].value} onChange={(e) => setField(field.key, e.target.value)} className={INPUT}>
                {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            ) : (
              <input type={field.kind === "datetime" ? "datetime-local" : "text"} value={fields[field.key] || ""} onChange={(e) => setField(field.key, e.target.value)} placeholder={field.placeholder} className={INPUT} />
            )}
          </label>
        ))}

        <Title>Pattern</Title>
        <Choice label="Pattern" value={value.pattern} onChange={(pattern) => set({ pattern })} options={[{ id: "square", label: "Square" }, { id: "rounded", label: "Rounded" }, { id: "dots", label: "Dots" }, { id: "circular", label: "Circular" }]} />

        <Title>Colours</Title>
        <div className="grid grid-cols-2 gap-2">
          <Color label="Code" value={value.foreground} onChange={(foreground) => set({ foreground })} />
          <Color label="Background" value={value.background} onChange={(background) => set({ background })} />
        </div>
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-[12px] text-zinc-300">
          <input type="checkbox" checked={Boolean(value.foreground2)} onChange={(e) => set({ foreground2: e.target.checked ? "#c026d3" : "" })} className="h-3.5 w-3.5 accent-[#00dfb6]" />
          Gradient across the code
        </label>
        {value.foreground2 && <div className="mt-2"><Color label="Gradient ends in" value={value.foreground2} onChange={(foreground2) => set({ foreground2 })} /></div>}

        <Title>Margin and border</Title>
        <label className="block">
          <span className={LABEL}>Clear margin: {value.quietZone} module{value.quietZone === 1 ? "" : "s"}</span>
          <input type="range" min={0} max={8} step={1} value={value.quietZone} onChange={(e) => set({ quietZone: Number(e.target.value) })} className="w-full accent-[#00dfb6]" />
        </label>
        <div className="mt-3">
          <span className={LABEL}>Border</span>
          <Choice label="Border" value={value.frame} onChange={(frame) => set({ frame })} options={[{ id: "none", label: "None" }, { id: "solid", label: "Solid" }, { id: "rounded", label: "Rounded" }, { id: "decorative", label: "Decorative" }]} />
        </div>
        {value.frame !== "none" && <div className="mt-2"><Color label="Border colour" value={value.frameColor} onChange={(frameColor) => set({ frameColor })} /></div>}

        <Title>Logo</Title>
        <input
          ref={file}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={async (e) => {
            const picked = e.target.files?.[0];
            e.target.value = "";
            if (!picked) return;
            try { setLogoError(""); set({ logoUrl: await readLogo(picked) }); } catch { setLogoError("That file could not be read as a picture."); }
          }}
        />
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => file.current?.click()} className="rounded-lg border border-white/[0.1] px-2.5 py-1.5 text-[11px] text-zinc-200 hover:bg-white/[0.06]">{value.logoUrl ? "Change logo" : "Upload a logo"}</button>
          {value.logoUrl && <button type="button" onClick={() => set({ logoUrl: "" })} className="rounded-lg border border-white/[0.1] px-2.5 py-1.5 text-[11px] text-zinc-400 hover:text-zinc-200">Remove logo</button>}
        </div>
        {logoError && <p className="mt-1.5 text-[11px] text-red-300">{logoError}</p>}
        {value.logoUrl && (
          <>
            <label className="mt-3 block">
              <span className={LABEL}>Logo size: {value.logoSize}% of the code</span>
              <input type="range" min={10} max={30} step={1} value={value.logoSize} onChange={(e) => set({ logoSize: Number(e.target.value) })} className="w-full accent-[#00dfb6]" />
            </label>
            <p className="mt-1 text-[10.5px] leading-relaxed text-zinc-500">With a logo the code is made with stronger error correction, so a scanner can rebuild the part the logo covers.</p>
          </>
        )}

        <Title>Text with the code</Title>
        <input type="text" value={value.caption} onChange={(e) => set({ caption: e.target.value })} placeholder="For example: Scan to register" maxLength={60} className={INPUT} aria-label="Text shown with the code" />
        {value.caption && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <span className={LABEL}>Position</span>
              <Choice label="Text position" value={value.captionPosition} onChange={(captionPosition) => set({ captionPosition })} options={[{ id: "above", label: "Above" }, { id: "below", label: "Below" }]} />
            </div>
            <Color label="Text colour" value={value.captionColor} onChange={(captionColor) => set({ captionColor })} />
          </div>
        )}
        <div className="h-6" />
      </div>
    </aside>
  );
}
