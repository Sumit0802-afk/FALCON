import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  Sparkles,
  Crown,
  Type,
  Wand2,
  X,
  Plus,
  Zap,
  ChevronRight,
} from "lucide-react";
import { CanvasElement, isText, TextElement } from "@/types";
import {
  TEXT_DESIGN_STYLES,
  TextDesignStyle,
} from "@/data/textDesignStyles";
import { loadGoogleFont, loadFontSubset } from "@/services/fontService";

interface TextPanelProps {
  selectedElement?: CanvasElement;
  onAddHeading: () => void;
  onAddSubheading: () => void;
  onAddBodyText: () => void;
  onAddStyledText?: (style: TextDesignStyle) => void;
  onUpdateElement: (patch: Partial<TextElement>) => void;
  onOpenFontLibrary?: () => void;
  onMagicWrite?: () => void;
}

type StyleCategoryTab =
  | "all"
  | "reference"
  | "bold-poster"
  | "3d"
  | "neon"
  | "gradient"
  | "outline"
  | "shadow"
  | "retro"
  | "luxury"
  | "handwritten"
  | "creative-title"
  | "social-media"
  | "gaming"
  | "futuristic";

const CATEGORY_TABS: { id: StyleCategoryTab; label: string; emoji: string }[] = [
  { id: "all", label: "All", emoji: "✦" },
  { id: "reference", label: "Featured", emoji: "★" },
  { id: "bold-poster", label: "Bold", emoji: "B" },
  { id: "3d", label: "3D", emoji: "◈" },
  { id: "neon", label: "Neon", emoji: "◉" },
  { id: "gradient", label: "Gradient", emoji: "◐" },
  { id: "outline", label: "Outline", emoji: "□" },
  { id: "shadow", label: "Shadow", emoji: "◧" },
  { id: "retro", label: "Retro", emoji: "◆" },
  { id: "luxury", label: "Luxury", emoji: "◈" },
  { id: "handwritten", label: "Script", emoji: "∫" },
  { id: "creative-title", label: "Creative", emoji: "✿" },
  { id: "social-media", label: "Social", emoji: "◎" },
  { id: "gaming", label: "Gaming", emoji: "⬡" },
  { id: "futuristic", label: "Future", emoji: "⟁" },
];

/** How many style cards are added each time the list grows */
const STYLE_BATCH = 40;

/** The letters a preview needs, in both cases because styles may change the case */
function previewLetters(text: string): string {
  return Array.from(new Set((text + text.toUpperCase() + text.toLowerCase()).split(""))).join("");
}

export function TextPanel({
  selectedElement,
  onAddHeading,
  onAddSubheading,
  onAddBodyText,
  onAddStyledText,
  onUpdateElement,
  onOpenFontLibrary,
  onMagicWrite,
}: TextPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<StyleCategoryTab>("all");

  const isSelectedText = selectedElement && isText(selectedElement);
  const textEl = isSelectedText ? (selectedElement as TextElement) : null;

  // Filter styles
  const filteredStyles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return TEXT_DESIGN_STYLES.filter((style) => {
      if (q) {
        const matchName = style.name.toLowerCase().includes(q);
        const matchCat = style.category.toLowerCase().includes(q);
        const matchText = style.sampleText.toLowerCase().includes(q);
        const matchFont = style.fontFamily.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchText && !matchFont) {
          return false;
        }
      }
      if (activeTab === "all") return true;
      return style.category === activeTab;
    });
  }, [searchQuery, activeTab]);

  // Only a screenful of style cards is drawn at a time; more are added on scrolling
  const [visibleCount, setVisibleCount] = useState(STYLE_BATCH);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(STYLE_BATCH);
  }, [searchQuery, activeTab]);

  const visibleStyles = useMemo(() => filteredStyles.slice(0, visibleCount), [filteredStyles, visibleCount]);

  useEffect(() => {
    const node = moreRef.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisibleCount((n) => Math.min(filteredStyles.length, n + STYLE_BATCH));
    }, { rootMargin: "500px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [filteredStyles.length, visibleCount]);

  // Each card loads only the letters it shows, so a long list stays light
  useEffect(() => {
    visibleStyles.forEach((s) => {
      loadFontSubset(s.fontFamily, previewLetters(s.sampleText), s.fontWeight || 400, s.fontStyle === "italic");
      if (s.secondaryStyle?.fontFamily && s.secondaryText) {
        loadFontSubset(s.secondaryStyle.fontFamily, previewLetters(s.secondaryText), s.secondaryStyle.fontWeight || 400, s.secondaryStyle.fontStyle === "italic");
      }
    });
  }, [visibleStyles]);

  // Click handler for style cards
  const handleApplyStyle = (style: TextDesignStyle) => {
    loadGoogleFont(style.fontFamily, [style.fontWeight || 400], style.fontStyle === "italic");

    if (textEl) {
      onUpdateElement({
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        color: style.color,
        italic: style.fontStyle === "italic",
        textShadow: style.textShadow,
        stroke: style.stroke,
        strokeWidth: style.strokeWidth,
        letterSpacing: style.letterSpacing,
        textTransform: style.textTransform,
        backgroundGradient: style.backgroundGradient,
        badgeBg: style.badgeBg,
        badgeBorder: style.badgeBorder,
        badgeRadius: style.badgeRadius,
        badgePadding: style.badgePadding,
        textPresetId: style.id,
      });
    } else if (onAddStyledText) {
      onAddStyledText(style);
    } else {
      onAddHeading();
    }
  };

  return (
    <aside className="flex h-full w-[360px] shrink-0 flex-col border-r border-white/[0.07] bg-[#111214] text-white select-none">

      {/* ══════════════════════════════════════
          HEADER — Falcon branded
          ══════════════════════════════════════ */}
      <div className="shrink-0 border-b border-white/[0.06] bg-[#0d0e10]">

        {/* Title row */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/15">
              <Type size={13} className="text-amber-400" />
            </div>
            <span className="text-[13px] font-semibold text-white tracking-wide">Text</span>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search styles, fonts..."
              className="h-9 w-full rounded-lg border border-white/[0.07] bg-white/[0.04] pl-8 pr-8 text-[12px] text-zinc-300 placeholder-zinc-600 outline-none transition focus:border-amber-500/40 focus:bg-white/[0.06]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 px-3 pb-3">
          {/* Add text box */}
          <button
            type="button"
            onClick={onAddBodyText}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/[0.1] px-3 py-2 text-[12px] font-semibold text-amber-300 transition hover:bg-amber-500/20 hover:border-amber-400/50 hover:text-amber-200"
          >
            <Type size={13} strokeWidth={2.5} />
            Add text box
          </button>

          {/* Magic Write */}
          <button
            type="button"
            onClick={onMagicWrite || onAddHeading}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-[12px] font-medium text-zinc-400 transition hover:bg-white/[0.08] hover:text-zinc-200"
          >
            <Wand2 size={13} className="text-zinc-500" />
            AI Write
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════
          MAIN SCROLLABLE AREA
          ══════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">

        {/* Default text styles */}
        <div className="px-3 pt-4 pb-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Quick add
          </p>

          <div className="grid grid-cols-1 gap-1.5">
            {/* Heading */}
            <button
              type="button"
              onClick={onAddHeading}
              className="group flex w-full items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.025] px-4 py-3 text-left transition hover:border-white/[0.1] hover:bg-white/[0.05]"
            >
              <span className="text-[22px] font-black tracking-tight text-white leading-none">
                Heading
              </span>
              <Plus
                size={14}
                className="text-zinc-600 opacity-0 transition group-hover:opacity-100"
              />
            </button>

            {/* Subheading */}
            <button
              type="button"
              onClick={onAddSubheading}
              className="group flex w-full items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.025] px-4 py-2.5 text-left transition hover:border-white/[0.1] hover:bg-white/[0.05]"
            >
              <span className="text-[15px] font-semibold text-zinc-300 leading-none">
                Subheading
              </span>
              <Plus
                size={14}
                className="text-zinc-600 opacity-0 transition group-hover:opacity-100"
              />
            </button>

            {/* Body */}
            <button
              type="button"
              onClick={onAddBodyText}
              className="group flex w-full items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.025] px-4 py-2 text-left transition hover:border-white/[0.1] hover:bg-white/[0.05]"
            >
              <span className="text-[12px] font-normal text-zinc-500 leading-none">
                Body text
              </span>
              <Plus
                size={14}
                className="text-zinc-600 opacity-0 transition group-hover:opacity-100"
              />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-3 border-t border-white/[0.05]" />

        {/* Font library shortcut */}
        <button
          type="button"
          onClick={onOpenFontLibrary}
          className="mx-3 mt-3 flex w-[calc(100%-24px)] items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.025] px-3.5 py-2.5 text-left transition hover:border-white/[0.1] hover:bg-white/[0.04]"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.06] font-serif text-[14px] font-bold text-zinc-300">
              Ag
            </span>
            <div>
              <p className="text-[11px] font-semibold text-zinc-300">Font Library</p>
              <p className="text-[10px] text-zinc-600">Browse every font</p>
            </div>
          </div>
          <ChevronRight size={13} className="text-zinc-600" />
        </button>

        {/* Design Styles Section */}
        <div className="px-3 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              Style presets
            </p>
          </div>

          {/* Category pills */}
          <div className="mb-3 flex gap-1 overflow-x-auto pb-1 scrollbar-none flex-wrap">
            {CATEGORY_TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center rounded-md px-2 py-1 text-[10px] font-semibold transition ${
                    active
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-white/[0.04] text-zinc-500 border border-white/[0.05] hover:border-white/[0.1] hover:text-zinc-300"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Style card grid */}
          {filteredStyles.length === 0 ? (
            <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-8 text-center">
              <Type size={20} className="mx-auto mb-2 text-zinc-700" />
              <p className="text-[11px] text-zinc-600">No matching styles</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pb-6">
              {visibleStyles.map((style) => {
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => handleApplyStyle(style)}
                    title={`Apply ${style.name}`}
                    className="group relative flex h-[128px] flex-col items-center justify-center overflow-hidden rounded-xl border border-white/[0.05] bg-[#161719] p-2 transition hover:border-amber-500/25 hover:bg-[#1c1d20] active:scale-[0.97]"
                  >
                    {/* Preview */}
                    <div className="flex flex-col items-center justify-center text-center select-none pointer-events-none w-full px-1">
                      {style.secondaryText && style.secondaryStyle && (
                        <span
                          style={{
                            fontFamily: style.secondaryStyle.fontFamily,
                            fontSize: Math.min(16, style.secondaryStyle.fontSize * 0.5),
                            fontWeight: style.secondaryStyle.fontWeight,
                            color: style.secondaryStyle.color,
                            letterSpacing: style.secondaryStyle.letterSpacing,
                            textTransform: style.secondaryStyle.textTransform,
                            fontStyle: style.secondaryStyle.fontStyle,
                            textShadow: style.secondaryStyle.textShadow,
                            lineHeight: 1.1,
                          }}
                        >
                          {style.secondaryText}
                        </span>
                      )}

                      <span
                        style={{
                          fontFamily: style.fontFamily,
                          fontSize: Math.min(24, style.fontSize * 0.5),
                          fontWeight: style.fontWeight,
                          color: style.backgroundGradient ? "transparent" : style.color,
                          letterSpacing: style.letterSpacing,
                          textTransform: style.textTransform,
                          fontStyle: style.fontStyle,
                          textShadow: style.textShadow,
                          WebkitTextStroke:
                            style.stroke && style.strokeWidth
                              ? `${Math.max(1, style.strokeWidth * 0.55)}px ${style.stroke}`
                              : undefined,
                          backgroundImage: style.backgroundGradient,
                          WebkitBackgroundClip: style.backgroundGradient ? "text" : undefined,
                          backgroundClip: style.backgroundGradient ? "text" : undefined,
                          WebkitTextFillColor: style.backgroundGradient
                            ? "transparent"
                            : undefined,
                          backgroundColor: style.badgeBg,
                          border: style.badgeBorder,
                          borderRadius: style.badgeRadius ?? undefined,
                          padding: style.badgePadding ? "2px 6px" : undefined,
                          lineHeight: 1.1,
                        }}
                      >
                        {style.sampleText}
                      </span>
                    </div>

                    {/* Pro badge */}
                    {style.isPro && (
                      <div className="absolute bottom-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-black/60">
                        <Crown size={9} className="text-amber-400" />
                      </div>
                    )}

                    {/* Hover overlay — style name + apply icon */}
                    <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/90 via-black/60 to-transparent px-2 py-1.5 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 flex items-center justify-between">
                      <span className="truncate text-[9px] font-medium text-zinc-400">
                        {style.name}
                      </span>
                      <Zap size={10} className="text-amber-400 shrink-0" />
                    </div>
                  </button>
                );
              })}
              {visibleCount < filteredStyles.length && <div ref={moreRef} className="col-span-2 h-8" />}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
