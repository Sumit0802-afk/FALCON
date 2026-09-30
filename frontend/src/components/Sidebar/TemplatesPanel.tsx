import React, { useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  ChevronRight,
  LayoutTemplate,
  Crown,
} from "lucide-react";
import { FALCON_TEMPLATES, FalconTemplate } from "@/data/templates";
import { DesignPage } from "@/types";

interface TemplatesPanelProps {
  onSelectTemplate: (template: FalconTemplate) => void;
  theme?: "dark" | "light";
}

const CATEGORY_TABS = [
  { id: "all", label: "All" },
  { id: "Social Media", label: "Social Media" },
  { id: "Business", label: "Business" },
  { id: "YouTube", label: "YouTube" },
  { id: "Print", label: "Print" },
];

export function TemplatesPanel({ onSelectTemplate, theme = "dark" }: TemplatesPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredTemplates = useMemo(() => {
    return FALCON_TEMPLATES.filter((tpl) => {
      const matchesTab =
        activeTab === "all" ||
        tpl.category.toLowerCase().includes(activeTab.toLowerCase());
      if (!matchesTab) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        tpl.name.toLowerCase().includes(q) ||
        tpl.category.toLowerCase().includes(q) ||
        tpl.description?.toLowerCase().includes(q)
      );
    });
  }, [activeTab, searchQuery]);

  // Group templates by categories matching the user reference screenshot
  const featuredTemplates = useMemo(
    () => filteredTemplates.slice(0, 6),
    [filteredTemplates]
  );
  const socialTemplates = useMemo(
    () =>
      filteredTemplates.filter((t) =>
        ["social", "instagram", "post"].some((k) =>
          (t.category + t.name).toLowerCase().includes(k)
        )
      ).slice(0, 6),
    [filteredTemplates]
  );
  const businessTemplates = useMemo(
    () =>
      filteredTemplates.filter((t) =>
        ["business", "corporate", "invoice", "letter"].some((k) =>
          (t.category + t.name).toLowerCase().includes(k)
        )
      ).slice(0, 6),
    [filteredTemplates]
  );
  const presentationTemplates = useMemo(
    () =>
      filteredTemplates.filter((t) =>
        ["presentation", "pitch", "slide"].some((k) =>
          (t.category + t.name).toLowerCase().includes(k)
        )
      ).slice(0, 4),
    [filteredTemplates]
  );
  const marketingTemplates = useMemo(
    () =>
      filteredTemplates.filter((t) =>
        ["sale", "marketing", "food", "promo"].some((k) =>
          (t.category + t.name).toLowerCase().includes(k)
        )
      ).slice(0, 6),
    [filteredTemplates]
  );
  const posterTemplates = useMemo(
    () =>
      filteredTemplates.filter((t) =>
        ["poster", "music", "art", "nature"].some((k) =>
          (t.category + t.name).toLowerCase().includes(k)
        )
      ).slice(0, 6),
    [filteredTemplates]
  );

  const isDark = theme === "dark";

  return (
    <aside
      className={`flex h-full w-[340px] shrink-0 flex-col border-r select-none transition-colors duration-200 ${
        isDark
          ? "border-white/[0.08] bg-[#0c1017] text-white"
          : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      {/* SEARCH AND FILTER BAR */}
      <div
        className={`border-b p-3.5 ${
          isDark ? "border-white/[0.07] bg-[#0f141f]" : "border-slate-200 bg-slate-50"
        }`}
      >
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={15}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? "text-zinc-500" : "text-slate-400"
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className={`w-full rounded-xl border py-2 pl-9 pr-8 text-xs outline-none transition ${
                isDark
                  ? "border-white/[0.08] bg-[#151b28] text-white placeholder-zinc-500 focus:border-cyan-500/70 focus:bg-[#192233]"
                  : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-cyan-600 focus:bg-white"
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <button
            type="button"
            title="Filter templates"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
              isDark
                ? "border-white/[0.08] bg-[#151b28] text-zinc-400 hover:border-cyan-500/50 hover:text-white"
                : "border-slate-200 bg-white text-slate-500 hover:border-cyan-600 hover:text-slate-900"
            }`}
          >
            <SlidersHorizontal size={14} />
          </button>
        </div>

        {/* CATEGORY FILTER PILLS */}
        <div className="no-scrollbar mt-3 flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition ${
                  isActive
                    ? "bg-cyan-500 text-black font-semibold shadow-sm shadow-cyan-500/30"
                    : isDark
                    ? "bg-white/[0.05] text-zinc-400 hover:bg-white/[0.1] hover:text-zinc-200"
                    : "bg-slate-200/70 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TEMPLATE SECTIONS (SCROLLABLE) */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-5">
        {/* SECTION HELPER */}
        <TemplateSection
          title="Featured"
          templates={featuredTemplates}
          onSelect={onSelectTemplate}
          isDark={isDark}
        />

        {socialTemplates.length > 0 && (
          <TemplateSection
            title="Social Media"
            templates={socialTemplates}
            onSelect={onSelectTemplate}
            isDark={isDark}
          />
        )}

        {businessTemplates.length > 0 && (
          <TemplateSection
            title="Business"
            templates={businessTemplates}
            onSelect={onSelectTemplate}
            isDark={isDark}
          />
        )}

        {presentationTemplates.length > 0 && (
          <TemplateSection
            title="Presentations"
            templates={presentationTemplates}
            onSelect={onSelectTemplate}
            isDark={isDark}
            gridCols={2}
          />
        )}

        {marketingTemplates.length > 0 && (
          <TemplateSection
            title="Marketing"
            templates={marketingTemplates}
            onSelect={onSelectTemplate}
            isDark={isDark}
          />
        )}

        {posterTemplates.length > 0 && (
          <TemplateSection
            title="Posters"
            templates={posterTemplates}
            onSelect={onSelectTemplate}
            isDark={isDark}
          />
        )}

        {filteredTemplates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <LayoutTemplate size={28} className="text-zinc-500" />
            <p className="mt-3 text-xs font-medium text-zinc-400">No templates found</p>
            <p className="mt-1 text-[11px] text-zinc-600">Try searching for other keywords</p>
          </div>
        )}
      </div>
    </aside>
  );
}

function TemplateSection({
  title,
  templates,
  onSelect,
  isDark,
  gridCols = 3,
}: {
  title: string;
  templates: FalconTemplate[];
  onSelect: (tpl: FalconTemplate) => void;
  isDark: boolean;
  gridCols?: number;
}) {
  if (templates.length === 0) return null;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3
          className={`text-xs font-semibold tracking-wide ${
            isDark ? "text-zinc-200" : "text-slate-800"
          }`}
        >
          {title}
        </h3>
        <button
          type="button"
          className="flex items-center gap-0.5 text-[10px] font-medium text-zinc-500 hover:text-cyan-400 transition"
        >
          <span>See all</span>
          <ChevronRight size={11} />
        </button>
      </div>

      <div
        className={`grid gap-2 ${
          gridCols === 2 ? "grid-cols-2" : "grid-cols-3"
        }`}
      >
        {templates.map((tpl) => {
          const bgStyle = tpl.previewImage
            ? {
                backgroundImage: `url(${tpl.previewImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {
                background: tpl.preview || "#1a2233",
              };

          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onSelect(tpl)}
              className={`group relative flex h-24 flex-col overflow-hidden rounded-xl border text-left transition-all duration-200 ${
                isDark
                  ? "border-white/[0.08] hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10"
                  : "border-slate-200 hover:border-cyan-500 hover:shadow-md"
              }`}
              title={`Load "${tpl.name}"`}
            >
              {/* PREVIEW SURFACE */}
              <div
                className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                style={bgStyle}
              />

              {/* OVERLAY GRADIENT */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-85" />

              {/* PRO BADGE IF ANY */}
              {tpl.badge && (
                <div className="absolute right-1.5 top-1.5 z-10 flex h-4 items-center gap-1 rounded bg-amber-500/90 px-1 text-[8px] font-bold uppercase tracking-wider text-black shadow">
                  <Crown size={9} />
                  <span>{tpl.badge}</span>
                </div>
              )}

              {/* TITLE */}
              <div className="relative z-10 mt-auto p-1.5">
                <span className="line-clamp-1 text-[10px] font-medium text-white drop-shadow">
                  {tpl.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
