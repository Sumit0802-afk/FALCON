import React, { useEffect, useMemo, useState } from "react";
import { Check, Plus, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  COLOR_FAMILIES, LibraryPairing, LibraryPalette, PAIRING_STYLES, PALETTE_MOODS, PALETTE_SCHEMES,
  libraryPairings, libraryPalettes,
} from "@/data/brandLibrary";
import { loadFontSubset } from "@/services/fontService";

/**
 * The library sections of the Brand Kit panel: palettes, font pairings and
 * logo marks to start a brand from. Each shows a screenful at a time and more
 * on request; none of them says how many there are.
 */

const FIELD = "w-full rounded-lg border border-white/10 bg-[#101116] px-2.5 py-1.5 text-xs text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-500/60";
const CHIP = (on: boolean) => `rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${on ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-300" : "border-white/[0.08] text-zinc-400 hover:text-white"}`;
const MORE = "mt-2.5 w-full rounded-lg border border-white/[0.1] py-1.5 text-xs font-medium text-zinc-200 transition hover:border-cyan-500/50 hover:text-white";

function Heading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="border-t border-white/[0.07] pt-4">
      <h3 className="text-[13px] font-semibold text-white">{title}</h3>
      <p className="mt-0.5 text-[11.5px] leading-snug text-zinc-400">{hint}</p>
    </div>
  );
}

function SearchBox({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="relative">
      <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} aria-label={label} className={`${FIELD} pl-8`} />
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-white/[0.12] p-4 text-center text-xs text-zinc-400">{children}</p>;
}

// ─── Palettes ─────────────────────────────────────────────────────────────────

export function PaletteLibrary({ onUse, onAdd, onApplyColor }: {
  /** Makes the palette the kit's colours */
  onUse: (palette: LibraryPalette) => void;
  /** Adds the palette's colours to the ones the kit has */
  onAdd: (palette: LibraryPalette) => void;
  onApplyColor: (color: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [mood, setMood] = useState("");
  const [family, setFamily] = useState("");
  const [scheme, setScheme] = useState("");
  const [shown, setShown] = useState(8);

  const found = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return libraryPalettes().filter((p) =>
      (!mood || p.mood === mood) && (!family || p.family === family) && (!scheme || p.scheme === scheme) &&
      words.every((word) => `${p.name} ${p.family} ${p.scheme}`.toLowerCase().includes(word)));
  }, [query, mood, family, scheme]);
  useEffect(() => setShown(8), [query, mood, family, scheme]);

  return (
    <div className="space-y-3">
      <Heading title="Palette library" hint="Ready-made palettes: a main color, a second, an accent, a light and a dark." />
      <SearchBox value={query} onChange={setQuery} label="Search palettes, e.g. teal or pastel" />

      <div role="group" aria-label="Mood" className="flex flex-wrap gap-1">
        {PALETTE_MOODS.map((name) => (
          <button key={name} type="button" onClick={() => setMood(mood === name ? "" : name)} aria-pressed={mood === name} className={CHIP(mood === name)}>{name}</button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div role="group" aria-label="Color" className="flex flex-1 flex-wrap gap-1.5">
          {COLOR_FAMILIES.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setFamily(family === item.name ? "" : item.name)}
              aria-pressed={family === item.name}
              aria-label={item.name}
              title={item.name}
              className={`h-5 w-5 rounded-full border transition hover:scale-110 ${family === item.name ? "border-white ring-2 ring-cyan-400/70" : "border-white/20"}`}
              style={{ backgroundColor: item.swatch }}
            />
          ))}
        </div>
      </div>
      <select value={scheme} onChange={(e) => setScheme(e.target.value)} aria-label="Color scheme" className={`${FIELD} [&>option]:bg-[#101116]`}>
        <option value="">Any color scheme</option>
        {PALETTE_SCHEMES.map((name) => <option key={name} value={name}>{name}</option>)}
      </select>

      {found.length === 0 ? <Empty>No palette matches. Try fewer filters.</Empty> : (
        <div className="space-y-2">
          {found.slice(0, shown).map((palette) => (
            <div key={palette.id} className="rounded-xl border border-white/[0.08] bg-[#14151b] p-2">
              <div className="flex h-9 overflow-hidden rounded-lg border border-white/[0.08]">
                {palette.colors.map((color) => (
                  <button
                    key={color.value + color.label}
                    type="button"
                    onClick={() => onApplyColor(color.value)}
                    title={`${color.value.toUpperCase()} — click to apply`}
                    aria-label={`Apply ${color.value}`}
                    className="h-full flex-1 transition hover:flex-[1.6]"
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium text-white">{palette.name}</div>
                  <div className="truncate text-[11px] text-zinc-400">{palette.scheme}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" onClick={() => onAdd(palette)} title="Add these colors to my kit" aria-label={`Add ${palette.name} to my colors`} className="flex items-center gap-1 rounded-md border border-white/[0.1] px-2 py-1 text-[11px] font-medium text-zinc-200 hover:border-cyan-500/50 hover:text-white">
                    <Plus size={12} /> Add
                  </button>
                  <button type="button" onClick={() => onUse(palette)} title="Make this my brand palette" aria-label={`Use ${palette.name} as my brand palette`} className="rounded-md bg-cyan-500/15 px-2 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500 hover:text-slate-950">
                    Use
                  </button>
                </div>
              </div>
            </div>
          ))}
          {found.length > shown && <button type="button" onClick={() => setShown(shown + 12)} className={MORE}>Show more palettes</button>}
        </div>
      )}
    </div>
  );
}

// ─── Font pairings ────────────────────────────────────────────────────────────

export function PairingLibrary({ heading, body, onUse }: { heading?: string; body?: string; onUse: (pairing: LibraryPairing) => void }) {
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState("");
  const [shown, setShown] = useState(6);

  const found = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return libraryPairings().filter((p) => (!style || p.style === style) && words.every((word) => `${p.heading} ${p.body}`.toLowerCase().includes(word)));
  }, [query, style]);
  useEffect(() => setShown(6), [query, style]);

  const visible = found.slice(0, shown);
  // Only the letters of each sample are fetched, so a screenful of fonts is light to load
  useEffect(() => {
    visible.forEach((p) => {
      loadFontSubset(p.heading, `${p.heading} Make it yours`, p.headingWeight);
      loadFontSubset(p.body, `${p.body} with for everything else.`, p.bodyWeight);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible.map((p) => p.id).join("|")]);

  return (
    <div className="space-y-3">
      <Heading title="Pairing library" hint="A heading font and a body font that sit well together." />
      <SearchBox value={query} onChange={setQuery} label="Search by font name" />
      <div role="group" aria-label="Heading style" className="flex flex-wrap gap-1">
        {PAIRING_STYLES.map((name) => (
          <button key={name} type="button" onClick={() => setStyle(style === name ? "" : name)} aria-pressed={style === name} className={CHIP(style === name)}>{name}</button>
        ))}
      </div>

      {found.length === 0 ? <Empty>No pairing uses a font by that name.</Empty> : (
        <div className="space-y-2">
          {visible.map((pairing) => {
            const current = pairing.heading === heading && pairing.body === body;
            return (
              <button
                key={pairing.id}
                type="button"
                onClick={() => onUse(pairing)}
                aria-label={`Use ${pairing.heading} with ${pairing.body}`}
                className={`block w-full rounded-xl border bg-[#14151b] p-3 text-left transition hover:border-cyan-500/50 ${current ? "border-cyan-500/60" : "border-white/[0.08]"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-white" style={{ fontFamily: `"${pairing.heading}", sans-serif`, fontWeight: pairing.headingWeight, fontSize: 21, lineHeight: 1.2 }}>{pairing.heading}</div>
                    <div className="mt-1 truncate text-zinc-300" style={{ fontFamily: `"${pairing.body}", sans-serif`, fontWeight: pairing.bodyWeight, fontSize: 13 }}>with {pairing.body} for everything else.</div>
                  </div>
                  {current ? <Check size={14} className="mt-1 shrink-0 text-cyan-300" /> : <span className="mt-0.5 shrink-0 rounded bg-white/[0.07] px-1.5 py-px text-[10px] font-medium text-zinc-300">{pairing.style}</span>}
                </div>
              </button>
            );
          })}
          {found.length > shown && <button type="button" onClick={() => setShown(shown + 8)} className={MORE}>Show more pairings</button>}
        </div>
      )}
    </div>
  );
}

// ─── Logo marks ───────────────────────────────────────────────────────────────

export type MarkUse = "page" | "primary" | "secondary" | "icon";
const MARK_USES: { id: MarkUse; name: string }[] = [{ id: "page", name: "Add to page" }, { id: "primary", name: "Primary" }, { id: "secondary", name: "Secondary" }, { id: "icon", name: "Icon" }];

/** "ArrowDownCircle" as "arrow down circle" */
const words = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Za-z])(\d)/g, "$1 $2").toLowerCase();

export function MarkLibrary({ color, onPick }: {
  /** The colour a mark is drawn in */
  color: string;
  /** A mark was chosen: its picture, its name and what to do with it */
  onPick: (src: string, name: string, use: MarkUse) => void;
}) {
  const [marks, setMarks] = useState<{ name: string; label: string; Icon: LucideIcon }[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [use, setUse] = useState<MarkUse>("page");
  const [shown, setShown] = useState(40);
  const [picked, setPicked] = useState("");

  // The whole icon set is large, so it is fetched only when this section is on screen
  useEffect(() => {
    let alive = true;
    import("lucide-react")
      .then((lucide) => {
        if (!alive) return;
        const all = Object.entries(lucide.icons as Record<string, LucideIcon>).map(([name, Icon]) => ({ name, label: words(name), Icon }));
        setMarks(all);
      })
      .catch(() => alive && setFailed(true));
    return () => { alive = false; };
  }, []);

  const found = useMemo(() => {
    const wanted = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return (marks || []).filter((mark) => wanted.every((word) => mark.label.includes(word)));
  }, [marks, query]);
  useEffect(() => setShown(40), [query]);

  const dark = (() => {
    const h = /^#([0-9a-f]{6})$/i.exec(color)?.[1];
    return h ? parseInt(h.slice(0, 2), 16) * 0.299 + parseInt(h.slice(2, 4), 16) * 0.587 + parseInt(h.slice(4, 6), 16) * 0.114 < 70 : false;
  })();

  const pick = async (mark: { name: string; label: string; Icon: LucideIcon }) => {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const svg = renderToStaticMarkup(<mark.Icon size={240} color={color} strokeWidth={1.75} />);
    onPick(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, mark.label, use);
    setPicked(mark.name);
    window.setTimeout(() => setPicked(""), 1200);
  };

  return (
    <div className="space-y-3">
      <Heading title="Mark library" hint="Simple marks to start a logo from, drawn in your primary color." />
      <SearchBox value={query} onChange={setQuery} label="Search marks, e.g. leaf, rocket, heart" />
      <div>
        <span className="mb-1 block text-[11px] font-medium text-zinc-400">Clicking a mark</span>
        <div role="radiogroup" aria-label="What clicking a mark does" className="flex rounded-lg border border-white/[0.08] p-0.5">
          {MARK_USES.map((option) => (
            <button key={option.id} type="button" role="radio" aria-checked={use === option.id} onClick={() => setUse(option.id)} className={`flex-1 rounded-md py-1 text-[11px] font-medium transition ${use === option.id ? "bg-white/[0.12] text-white" : "text-zinc-400 hover:text-white"}`}>
              {option.name}
            </button>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-zinc-500">{use === "page" ? "Places it on the page." : `Saves it as your ${use === "icon" ? "icon" : `${use} logo`}.`}</p>
      </div>

      {failed ? <Empty>The marks could not be loaded. Check the connection and open this tab again.</Empty>
        : !marks ? <Empty>Loading marks…</Empty>
        : found.length === 0 ? <Empty>No mark by that name.</Empty> : (
          <>
            <div className="grid grid-cols-5 gap-1.5">
              {found.slice(0, shown).map((mark) => (
                <button
                  key={mark.name}
                  type="button"
                  onClick={() => void pick(mark)}
                  title={mark.label}
                  aria-label={mark.label}
                  className={`flex aspect-square items-center justify-center rounded-lg border transition hover:border-cyan-500/50 ${dark ? "bg-zinc-200" : "bg-[#14151b]"} ${picked === mark.name ? "border-cyan-500/70" : "border-white/[0.08]"}`}
                >
                  {picked === mark.name ? <Check size={18} className="text-cyan-300" /> : <mark.Icon size={22} color={color} strokeWidth={1.75} />}
                </button>
              ))}
            </div>
            {found.length > shown && <button type="button" onClick={() => setShown(shown + 60)} className={MORE}>Show more marks</button>}
          </>
        )}
    </div>
  );
}
