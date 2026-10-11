import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bookmark,
  Palette,
  Type,
  Image as ImageIcon,
  Plus,
  Trash2,
  Check,
  UploadCloud,
  Pencil,
  Copy,
  Search,
  RotateCcw,
  Wand2,
  X,
} from "lucide-react";
import { BrandKit, BrandColor, BrandFont } from "@/types/asset";
import { brandKitService, normalizeHex } from "@/services/brandKitService";
import { filterAndSearchFonts, getFontMeta, loadFontPreview, loadGoogleFont } from "@/services/fontService";
import { BadgeIcon } from "@/components/common/BadgeIcon";

interface BrandKitPanelProps {
  onApplyColor: (color: string) => void;
  onApplyFont: (fontFamily: string) => void;
  onAddLogoToCanvas: (src: string, name?: string) => void;
  onAddHeadingText?: (fontFamily: string, fontWeight?: number) => void;
  onAddBodyText?: (fontFamily: string, fontWeight?: number) => void;
  /** What a colour or font would be applied to just now */
  selection?: "text" | "shape" | "none";
  /** The solid colours already used on the page */
  pageColors?: string[];
  /** Sets the page's text in the brand fonts; answers whether there was any text */
  onApplyFontsToPage?: (headingFont: string, bodyFont: string) => boolean;
}

type Section = "colors" | "fonts" | "logos";
type Role = BrandColor["type"];
type LogoType = "primary" | "secondary" | "icon";

const ROLE_NAMES: Record<Role, string> = { primary: "Primary", secondary: "Secondary", accent: "Accent", custom: "Extra" };
const LOGO_NAMES: Record<LogoType, { name: string; hint: string }> = {
  primary: { name: "Primary logo", hint: "The full logo, for most designs" },
  secondary: { name: "Secondary logo", hint: "A one-colour or stacked version" },
  icon: { name: "Icon", hint: "The mark on its own, for small spaces" },
};
const BACKDROPS = [
  { id: "dark", name: "Dark", style: { backgroundColor: "#0b0b0e" } },
  { id: "light", name: "Light", style: { backgroundColor: "#f4f4f5" } },
  {
    id: "grid",
    name: "Clear",
    style: {
      backgroundColor: "#2a2b31",
      backgroundImage: "linear-gradient(45deg, #3a3b42 25%, transparent 25%, transparent 75%, #3a3b42 75%), linear-gradient(45deg, #3a3b42 25%, transparent 25%, transparent 75%, #3a3b42 75%)",
      backgroundSize: "14px 14px",
      backgroundPosition: "0 0, 7px 7px",
    },
  },
] as const;

/** Logos are kept in the browser, which has little room */
const LOGO_LIMIT = 1.5 * 1024 * 1024;

/** White or near-black, whichever reads on the colour */
function inkOn(hex: string): string {
  const h = normalizeHex(hex).slice(1);
  if (!h) return "#ffffff";
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#0b0b0e" : "#ffffff";
}

export function BrandKitPanel({
  onApplyColor,
  onApplyFont,
  onAddLogoToCanvas,
  onAddHeadingText,
  onAddBodyText,
  selection = "none",
  pageColors = [],
  onApplyFontsToPage,
}: BrandKitPanelProps) {
  const [brandKit, setBrandKit] = useState<BrandKit>(brandKitService.getBrandKit());
  const [activeSection, setActiveSection] = useState<Section>("colors");
  const [flash, setFlash] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  // Kit name
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  // Colour form: "new" or the id of the colour being edited
  const [colorForm, setColorForm] = useState<string | null>(null);
  const [draftHex, setDraftHex] = useState("#06b6d4");
  const [draftLabel, setDraftLabel] = useState("");
  const [draftRole, setDraftRole] = useState<Role>("custom");

  // Fonts
  const [pickingFont, setPickingFont] = useState<"heading" | "body" | null>(null);
  const [fontQuery, setFontQuery] = useState("");

  // Logos
  const [backdrop, setBackdrop] = useState<(typeof BACKDROPS)[number]["id"]>("dark");

  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const refresh = () => setBrandKit(brandKitService.getBrandKit());
  const showFlash = (id: string) => {
    setFlash(id);
    timers.current.push(window.setTimeout(() => setFlash(null), 1400));
  };
  const say = (text: string) => {
    setNotice(text);
    timers.current.push(window.setTimeout(() => setNotice(""), 3200));
  };

  const heading = brandKit.fonts.find((f) => f.type === "heading");
  const body = brandKit.fonts.find((f) => f.type === "body");

  // The brand's own fonts are shown in themselves
  useEffect(() => {
    brandKit.fonts.forEach((f) => loadGoogleFont(f.fontFamily, [f.fontWeight || 400]));
  }, [brandKit.fonts]);

  /* ─── Kit ─── */

  const saveName = () => {
    if (nameDraft.trim()) brandKitService.rename(nameDraft);
    setRenaming(false);
    refresh();
  };

  const resetKit = () => {
    setBrandKit(brandKitService.reset());
    setConfirmReset(false);
    setColorForm(null);
    setPickingFont(null);
    say("Brand kit put back to how it started.");
  };

  /* ─── Colours ─── */

  const colorTarget =
    selection === "shape" ? "fills the selected shape" : selection === "text" ? "colours the selected text" : "sets the page background";

  const applyColor = (color: BrandColor) => {
    onApplyColor(color.value);
    showFlash(color.id);
  };

  const openColorForm = (color?: BrandColor) => {
    setColorForm(color ? color.id : "new");
    setDraftHex(color ? normalizeHex(color.value) || "#06b6d4" : "#06b6d4");
    setDraftLabel(color ? color.label : "");
    setDraftRole(color ? color.type : "custom");
  };

  const draftColor = normalizeHex(draftHex);

  const saveColor = () => {
    if (!draftColor) return;
    const label = draftLabel.trim().slice(0, 40) || draftColor.toUpperCase();
    if (colorForm === "new") brandKitService.addColor({ label, value: draftColor, type: draftRole });
    else if (colorForm) brandKitService.updateColor(colorForm, draftColor, label, draftRole);
    setColorForm(null);
    refresh();
  };

  const deleteColor = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    brandKitService.removeColor(id);
    if (colorForm === id) setColorForm(null);
    refresh();
  };

  const copyHex = async (e: React.MouseEvent, color: BrandColor) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(color.value.toUpperCase());
      showFlash(`copy-${color.id}`);
    } catch {
      say("Could not copy. Select the code and copy it by hand.");
    }
  };

  // Colours on the page that the kit does not have yet
  const fromPage = useMemo(() => {
    const have = new Set(brandKit.colors.map((c) => normalizeHex(c.value)));
    return [...new Set(pageColors.map(normalizeHex).filter(Boolean))].filter((c) => !have.has(c)).slice(0, 12);
  }, [pageColors, brandKit.colors]);

  const addFromPage = (hex: string) => {
    brandKitService.addColor({ label: hex.toUpperCase(), value: hex, type: "custom" });
    refresh();
  };

  /* ─── Fonts ─── */

  const fontChoices = useMemo(() => (pickingFont ? filterAndSearchFonts(fontQuery, "all").slice(0, 40) : []), [pickingFont, fontQuery]);
  useEffect(() => {
    fontChoices.forEach((f) => loadFontPreview(f.family));
  }, [fontChoices]);

  const weightsOf = (font: BrandFont): number[] => {
    const found = (getFontMeta(font.fontFamily)?.variants || []).map(Number).filter((n) => n >= 100 && n <= 900);
    const list = found.length ? found : [400, 700];
    return [...new Set(list)].sort((a, b) => a - b);
  };

  const chooseFont = (type: "heading" | "body", family: string) => {
    const wanted = type === "heading" ? 700 : 400;
    const offered = (getFontMeta(family)?.variants || []).map(Number).filter(Boolean);
    // The nearest weight the family really has
    const weight = offered.length ? offered.reduce((best, w) => (Math.abs(w - wanted) < Math.abs(best - wanted) ? w : best)) : wanted;
    brandKitService.updateFont(type, family, weight);
    setPickingFont(null);
    setFontQuery("");
    refresh();
  };

  const chooseWeight = (font: BrandFont, weight: number) => {
    brandKitService.updateFont(font.type, font.fontFamily, weight);
    refresh();
  };

  const applyFont = (font: BrandFont) => {
    onApplyFont(font.fontFamily);
    showFlash(`apply-${font.id}`);
  };

  const addText = (font: BrandFont) => {
    if (font.type === "heading") onAddHeadingText?.(font.fontFamily, font.fontWeight);
    else onAddBodyText?.(font.fontFamily, font.fontWeight);
    showFlash(`add-${font.id}`);
  };

  const applyFontsToPage = () => {
    if (!onApplyFontsToPage || !heading || !body) return;
    say(onApplyFontsToPage(heading.fontFamily, body.fontFamily) ? "Page text set in your brand fonts. Undo brings the old fonts back." : "There is no text on this page yet.");
  };

  /* ─── Logos ─── */

  const uploadLogo = (e: React.ChangeEvent<HTMLInputElement>, type: LogoType) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return say("Choose a picture file: PNG, SVG, JPG or WebP.");
    if (file.size > LOGO_LIMIT) return say("That file is too large to keep in the kit. Use a logo under 1.5 MB.");

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      if (!src) return;
      brandKitService.addLogo({ label: LOGO_NAMES[type].name, type, fileUrl: src });
      // Storage can be full, in which case the logo was not kept
      const kept = brandKitService.getBrandKit().logos.some((l) => l.type === type && l.fileUrl === src);
      refresh();
      if (!kept) say("The browser has no room left to keep that logo. Try a smaller file.");
    };
    reader.onerror = () => say("That file could not be read.");
    reader.readAsDataURL(file);
  };

  const removeLogo = (id: string) => {
    brandKitService.removeLogo(id);
    refresh();
  };

  const backdropStyle = BACKDROPS.find((b) => b.id === backdrop)!.style;

  const tabs: { id: Section; name: string; icon: React.ReactNode }[] = [
    { id: "colors", name: "Colors", icon: <Palette size={14} /> },
    { id: "fonts", name: "Fonts", icon: <Type size={14} /> },
    { id: "logos", name: "Logos", icon: <ImageIcon size={14} /> },
  ];

  const field = "w-full rounded-lg border border-white/10 bg-[#101116] px-2.5 py-1.5 text-xs text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-500/60";
  const quiet = "rounded-md p-1.5 text-zinc-400 transition hover:bg-white/[0.08] hover:text-white";

  return (
    <aside className="relative flex h-full w-[340px] shrink-0 select-none flex-col border-r border-white/[0.08] bg-[#0c0c0e] text-white">
      {/* HEADER */}
      <div className="space-y-3 border-b border-white/[0.08] bg-[#111114] p-3.5">
        <div className="flex items-center gap-2.5">
          <BadgeIcon icon={Bookmark} tone="pink" size={38} />
          <div className="min-w-0 flex-1">
            <h2 className="text-[13px] font-semibold tracking-wide text-white">Brand Kit</h2>
            {renaming ? (
              <input
                autoFocus
                value={nameDraft}
                maxLength={40}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") setRenaming(false);
                }}
                aria-label="Brand kit name"
                className="mt-0.5 w-full rounded border border-cyan-500/50 bg-[#101116] px-1.5 py-0.5 text-xs text-white outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setNameDraft(brandKit.name);
                  setRenaming(true);
                }}
                title="Rename this kit"
                className="group flex max-w-full items-center gap-1 text-left text-[11.5px] text-zinc-400 hover:text-white"
              >
                <span className="truncate">{brandKit.name}</span>
                <Pencil size={11} className="shrink-0 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100" />
              </button>
            )}
          </div>
          <button type="button" onClick={() => setConfirmReset((v) => !v)} title="Put the kit back to how it started" aria-label="Reset brand kit" className={quiet}>
            <RotateCcw size={14} />
          </button>
        </div>

        {confirmReset && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/[0.08] p-2.5">
            <p className="text-[11.5px] leading-snug text-zinc-200">Put the kit back to how it started? Your colours, fonts and logos here will be replaced.</p>
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmReset(false)} className="rounded-md px-2.5 py-1 text-xs text-zinc-300 hover:text-white">
                Keep mine
              </button>
              <button type="button" onClick={resetKit} className="rounded-md bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-400">
                Reset
              </button>
            </div>
          </div>
        )}

        {/* The palette at a glance */}
        {brandKit.colors.length > 0 && (
          <div className="flex h-7 overflow-hidden rounded-lg border border-white/[0.08]" aria-hidden="true">
            {brandKit.colors.map((c) => (
              <div key={c.id} className="h-full flex-1" style={{ backgroundColor: c.value }} title={c.label} />
            ))}
          </div>
        )}

        {/* SECTION NAV TABS */}
        <div className="flex items-center gap-1 rounded-lg border border-white/[0.04] bg-[#18191f] p-1" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeSection === tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition ${
                activeSection === tab.id ? "bg-cyan-500/20 text-cyan-300 shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="scrollbar-thin scrollbar-thumb-zinc-800 flex-1 space-y-5 overflow-y-auto p-3.5">
        {/* ─── COLOURS ─── */}
        {activeSection === "colors" && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[13px] font-semibold text-white">Brand colors</h3>
                <p className="mt-0.5 text-[11.5px] leading-snug text-zinc-400">Clicking a color {colorTarget}.</p>
              </div>
              <button type="button" onClick={() => openColorForm()} className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300">
                <Plus size={14} />
                <span>Add color</span>
              </button>
            </div>

            {colorForm && (
              <div className="space-y-2.5 rounded-xl border border-cyan-500/40 bg-[#16171d] p-3">
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span>{colorForm === "new" ? "Add a brand color" : "Edit color"}</span>
                  <button type="button" onClick={() => setColorForm(null)} aria-label="Close" className="text-zinc-400 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={draftColor || "#000000"}
                    onChange={(e) => setDraftHex(e.target.value)}
                    aria-label="Pick a color"
                    className="h-9 w-11 shrink-0 cursor-pointer rounded border border-white/20 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={draftHex}
                    onChange={(e) => setDraftHex(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveColor()}
                    spellCheck={false}
                    maxLength={7}
                    aria-label="Hex code"
                    placeholder="#06B6D4"
                    className={`${field} font-mono uppercase ${draftColor ? "" : "border-rose-500/60 focus:border-rose-500/60"}`}
                  />
                </div>
                <input
                  type="text"
                  value={draftLabel}
                  onChange={(e) => setDraftLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveColor()}
                  maxLength={40}
                  placeholder="Name, e.g. Neon Indigo"
                  aria-label="Color name"
                  className={field}
                />
                <div className="flex gap-1" role="radiogroup" aria-label="What this color is for">
                  {(Object.keys(ROLE_NAMES) as Role[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      role="radio"
                      aria-checked={draftRole === role}
                      onClick={() => setDraftRole(role)}
                      className={`flex-1 rounded-md border py-1 text-[11px] font-medium transition ${
                        draftRole === role ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-300" : "border-white/[0.08] text-zinc-400 hover:text-white"
                      }`}
                    >
                      {ROLE_NAMES[role]}
                    </button>
                  ))}
                </div>
                {!draftColor && <p className="text-[11px] text-rose-300">Enter a hex code such as #06B6D4.</p>}
                <div className="flex items-center justify-end gap-2 pt-0.5">
                  <button type="button" onClick={() => setColorForm(null)} className="rounded-md px-2.5 py-1 text-xs text-zinc-400 hover:text-white">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveColor}
                    disabled={!draftColor}
                    className="rounded-md bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {colorForm === "new" ? "Add color" : "Save"}
                  </button>
                </div>
              </div>
            )}

            {brandKit.colors.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.12] p-5 text-center">
                <p className="text-xs text-zinc-300">No colors in this kit yet.</p>
                <button type="button" onClick={() => openColorForm()} className="mt-2 text-xs font-medium text-cyan-400 hover:text-cyan-300">
                  Add your first color
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {brandKit.colors.map((color) => (
                  <div
                    key={color.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => applyColor(color)}
                    onKeyDown={(e) => {
                      if (e.target !== e.currentTarget) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        applyColor(color);
                      }
                    }}
                    aria-label={`${color.label}, ${color.value}. Apply`}
                    className={`group relative flex cursor-pointer items-center gap-3 rounded-xl border bg-[#14151b] p-2 text-left outline-none transition hover:border-cyan-500/50 focus-visible:border-cyan-500/70 ${
                      colorForm === color.id ? "border-cyan-500/50" : "border-white/[0.08]"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 shadow-inner" style={{ backgroundColor: color.value }}>
                      {flash === color.id && <Check size={16} strokeWidth={3} style={{ color: inkOn(color.value) }} />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-medium text-white" title={color.label}>
                        {color.label}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="font-mono text-[11px] uppercase text-zinc-400">{flash === `copy-${color.id}` ? "Copied" : color.value}</span>
                        {color.type !== "custom" && (
                          <span className="rounded bg-white/[0.07] px-1.5 py-px text-[10px] font-medium text-zinc-300">{ROLE_NAMES[color.type]}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center opacity-0 transition focus-within:opacity-100 group-hover:opacity-100">
                      <button type="button" onClick={(e) => copyHex(e, color)} title="Copy hex code" aria-label={`Copy ${color.value}`} className={quiet}>
                        <Copy size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openColorForm(color);
                        }}
                        title="Edit color"
                        aria-label={`Edit ${color.label}`}
                        className={quiet}
                      >
                        <Pencil size={13} />
                      </button>
                      <button type="button" onClick={(e) => deleteColor(e, color.id)} title="Remove color" aria-label={`Remove ${color.label}`} className={`${quiet} hover:text-rose-400`}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {fromPage.length > 0 && (
              <div className="rounded-xl border border-white/[0.08] bg-[#111217] p-3">
                <h4 className="text-xs font-semibold text-white">Used in this design</h4>
                <p className="mt-0.5 text-[11.5px] text-zinc-400">Click one to keep it in your kit.</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {fromPage.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => addFromPage(hex)}
                      title={`Add ${hex.toUpperCase()}`}
                      aria-label={`Add ${hex} to the kit`}
                      className="group/s relative h-8 w-8 rounded-lg border border-white/15 transition hover:scale-110 hover:border-cyan-400"
                      style={{ backgroundColor: hex }}
                    >
                      <Plus size={13} strokeWidth={3} className="absolute inset-0 m-auto opacity-0 transition group-hover/s:opacity-100" style={{ color: inkOn(hex) }} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── FONTS ─── */}
        {activeSection === "fonts" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-[13px] font-semibold text-white">Brand typography</h3>
              <p className="mt-0.5 text-[11.5px] leading-snug text-zinc-400">One font for headings and one for everything else.</p>
            </div>

            <div className="space-y-3">
              {brandKit.fonts.map((font) => {
                const picking = pickingFont === font.type;
                return (
                  <div key={font.id} className={`space-y-2.5 rounded-xl border bg-[#14151b] p-3 ${picking ? "border-cyan-500/50" : "border-white/[0.08]"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">{font.type === "heading" ? "Heading" : "Body"}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPickingFont(picking ? null : font.type);
                          setFontQuery("");
                        }}
                        className="rounded-md px-1.5 py-0.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
                      >
                        {picking ? "Close" : "Change"}
                      </button>
                    </div>

                    <div>
                      <div
                        className="truncate text-white"
                        style={{ fontFamily: `"${font.fontFamily}", sans-serif`, fontSize: font.type === "heading" ? 24 : 15, fontWeight: font.fontWeight || 400, lineHeight: 1.25 }}
                      >
                        {font.type === "heading" ? "Make it yours" : "The quick brown fox jumps over the lazy dog."}
                      </div>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-zinc-300">{font.fontFamily}</span>
                        <select
                          value={font.fontWeight || 400}
                          onChange={(e) => chooseWeight(font, Number(e.target.value))}
                          aria-label={`${font.type} font weight`}
                          className="shrink-0 rounded-md border border-white/10 bg-[#101116] px-1.5 py-1 text-[11.5px] text-zinc-200 outline-none focus:border-cyan-500/60"
                        >
                          {[...new Set([...weightsOf(font), font.fontWeight || 400])].sort((a, b) => a - b).map((w) => (
                            <option key={w} value={w}>
                              {w}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {picking && (
                      <div className="space-y-2 border-t border-white/[0.06] pt-2.5">
                        <div className="relative">
                          <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                          <input
                            autoFocus
                            type="text"
                            value={fontQuery}
                            onChange={(e) => setFontQuery(e.target.value)}
                            placeholder="Search fonts"
                            aria-label="Search fonts"
                            className={`${field} pl-8`}
                          />
                        </div>
                        <div className="scrollbar-thin scrollbar-thumb-zinc-800 max-h-56 overflow-y-auto rounded-lg border border-white/[0.06] bg-[#101116]">
                          {fontChoices.length === 0 ? (
                            <p className="p-3 text-center text-xs text-zinc-400">No font by that name.</p>
                          ) : (
                            fontChoices.map((choice) => (
                              <button
                                key={choice.family}
                                type="button"
                                onClick={() => chooseFont(font.type, choice.family)}
                                className={`flex w-full items-center justify-between gap-2 px-2.5 py-2 text-left transition hover:bg-white/[0.06] ${
                                  choice.family === font.fontFamily ? "bg-cyan-500/10 text-cyan-300" : "text-zinc-100"
                                }`}
                              >
                                <span className="truncate text-[15px]" style={{ fontFamily: `"${choice.family}", sans-serif` }}>
                                  {choice.family}
                                </span>
                                {choice.family === font.fontFamily && <Check size={13} className="shrink-0" />}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => applyFont(font)}
                        disabled={selection !== "text"}
                        title={selection === "text" ? "Set the selected text in this font" : "Select some text on the page first"}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.1] py-1.5 text-xs font-medium text-zinc-200 transition hover:border-cyan-500/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/[0.1]"
                      >
                        {flash === `apply-${font.id}` ? <Check size={13} /> : <Type size={13} />}
                        <span>Use on selection</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => addText(font)}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-cyan-500/15 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500 hover:text-slate-950"
                      >
                        {flash === `add-${font.id}` ? <Check size={13} /> : <Plus size={13} />}
                        <span>Add {font.type === "heading" ? "heading" : "body text"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {onApplyFontsToPage && heading && body && (
              <div className="rounded-xl border border-white/[0.08] bg-[#111217] p-3">
                <h4 className="text-xs font-semibold text-white">Use on this page</h4>
                <p className="mt-0.5 text-[11.5px] leading-snug text-zinc-400">Sets the largest text in your heading font and the rest in your body font.</p>
                <button
                  type="button"
                  onClick={applyFontsToPage}
                  className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-cyan-500/40 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500 hover:text-slate-950"
                >
                  <Wand2 size={13} />
                  <span>Apply brand fonts to this page</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── LOGOS ─── */}
        {activeSection === "logos" && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[13px] font-semibold text-white">Brand logos</h3>
                <p className="mt-0.5 text-[11.5px] leading-snug text-zinc-400">Click a logo to place it on the page.</p>
              </div>
              <div className="flex shrink-0 rounded-md border border-white/[0.08] p-0.5" role="radiogroup" aria-label="Preview background">
                {BACKDROPS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    role="radio"
                    aria-checked={backdrop === b.id}
                    onClick={() => setBackdrop(b.id)}
                    className={`rounded px-1.5 py-0.5 text-[11px] font-medium transition ${backdrop === b.id ? "bg-white/[0.12] text-white" : "text-zinc-400 hover:text-white"}`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {(Object.keys(LOGO_NAMES) as LogoType[]).map((logoType) => {
                const logo = brandKit.logos.find((l) => l.type === logoType);
                const input = <input type="file" accept="image/*" onChange={(e) => uploadLogo(e, logoType)} className="hidden" />;

                return (
                  <div key={logoType} className="space-y-2 rounded-xl border border-white/[0.08] bg-[#14151b] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white">{LOGO_NAMES[logoType].name}</div>
                        <div className="text-[11.5px] text-zinc-400">{LOGO_NAMES[logoType].hint}</div>
                      </div>
                      {logo && (
                        <div className="flex shrink-0 items-center gap-0.5">
                          <label className="cursor-pointer rounded-md px-1.5 py-1 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300">
                            Replace
                            {input}
                          </label>
                          <button type="button" onClick={() => removeLogo(logo.id)} title="Remove logo" aria-label={`Remove ${LOGO_NAMES[logoType].name}`} className={`${quiet} hover:text-rose-400`}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>

                    {logo ? (
                      <button
                        type="button"
                        onClick={() => {
                          onAddLogoToCanvas(logo.fileUrl, logo.label);
                          showFlash(logo.id);
                        }}
                        aria-label={`Add ${LOGO_NAMES[logoType].name} to the page`}
                        className="group relative flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border border-white/[0.08] p-3 outline-none transition hover:border-cyan-500/50 focus-visible:border-cyan-500/70"
                        style={backdropStyle}
                      >
                        <img src={logo.fileUrl} alt="" className="h-full w-full object-contain" />
                        <span
                          className={`absolute inset-0 flex items-center justify-center gap-1 bg-black/60 text-xs font-semibold text-cyan-300 transition ${
                            flash === logo.id ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                          }`}
                        >
                          {flash === logo.id ? <Check size={14} /> : <Plus size={14} />}
                          {flash === logo.id ? "Added" : "Add to page"}
                        </span>
                      </button>
                    ) : (
                      <label className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.14] bg-black/20 transition hover:border-cyan-500/50">
                        <UploadCloud size={20} className="mb-1 text-zinc-400" />
                        <span className="text-xs text-zinc-300">Upload a logo</span>
                        <span className="text-[11px] text-zinc-500">PNG or SVG, under 1.5 MB</span>
                        {input}
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* What just happened */}
      {notice && (
        <div role="status" className="absolute inset-x-3 bottom-3 rounded-lg border border-white/[0.1] bg-[#1b1c23] px-3 py-2 text-xs leading-snug text-zinc-100 shadow-xl">
          {notice}
        </div>
      )}
    </aside>
  );
}
