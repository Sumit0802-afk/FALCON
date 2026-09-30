import React, { useState } from "react";
import {
  X,
  Layout,
  Smartphone,
  Monitor,
  FileText,
  Sliders,
  Sparkles,
  ArrowRight,
  Maximize2,
} from "lucide-react";
import { PageSize, PAGE_PRESETS } from "@/types";

interface SelectLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLayout: (size: PageSize) => void;
  title?: string;
  subtitle?: string;
}

interface PresetMeta {
  preset: PageSize;
  aspectDesc: string;
  icon: React.ReactNode;
  popularBadge?: string;
}

export function SelectLayoutModal({
  isOpen,
  onClose,
  onSelectLayout,
  title = "Select a Layout",
  subtitle = "Choose a canvas dimension for your new poster or design.",
}: SelectLayoutModalProps) {
  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1440);
  const [customName, setCustomName] = useState("Custom Poster");

  if (!isOpen) return null;

  const presetsWithMeta: PresetMeta[] = [
    {
      preset: PAGE_PRESETS[0], // Portrait Poster (1080 x 1440)
      aspectDesc: "3:4 Aspect Ratio • Event & Promo",
      icon: <Layout size={20} className="text-indigo-400" />,
      popularBadge: "Most Popular",
    },
    {
      preset: PAGE_PRESETS[1], // Instagram Post (Square 1080 x 1080)
      aspectDesc: "1:1 Square • Feed & Social",
      icon: <Maximize2 size={20} className="text-purple-400" />,
      popularBadge: "Social",
    },
    {
      preset: PAGE_PRESETS[2], // Story / Vertical Poster (1080 x 1920)
      aspectDesc: "9:16 Vertical • Reels, Stories & Mobile",
      icon: <Smartphone size={20} className="text-pink-400" />,
    },
    {
      preset: PAGE_PRESETS[3], // Marketing Flyer (1080 x 1350)
      aspectDesc: "4:5 Portrait • Commercial Flyer",
      icon: <FileText size={20} className="text-amber-400" />,
    },
    {
      preset: PAGE_PRESETS[4], // Presentation / Banner (1920 x 1080)
      aspectDesc: "16:9 Landscape • Screen & Banner",
      icon: <Monitor size={20} className="text-emerald-400" />,
    },
    {
      preset: PAGE_PRESETS[5], // A4 Document / Print (1240 x 1754)
      aspectDesc: "Standard Print • Printable Posters",
      icon: <FileText size={20} className="text-cyan-400" />,
    },
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = Math.max(100, Math.min(8000, Number(customWidth) || 1080));
    const h = Math.max(100, Math.min(8000, Number(customHeight) || 1440));
    onSelectLayout({
      name: customName.trim() || `Custom (${w}×${h})`,
      width: w,
      height: h,
    });
  };

  const swapOrientation = () => {
    setCustomWidth(customHeight);
    setCustomHeight(customWidth);
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101014] shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
              <Layout size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">{title}</h2>
              <p className="text-xs text-zinc-400">{subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#0c0c0f] px-6 py-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
              activeTab === "presets"
                ? "bg-white/[0.1] text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles size={13} className="text-indigo-400" />
            <span>Standard Formats</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
              activeTab === "custom"
                ? "bg-white/[0.1] text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sliders size={13} className="text-purple-400" />
            <span>Custom Dimensions</span>
          </button>
        </div>

        {/* CONTENT */}
        <div className="max-h-[65vh] overflow-y-auto p-6">
          {activeTab === "presets" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {presetsWithMeta.map((item) => {
                const isLandscape = item.preset.width > item.preset.height;
                const isSquare = item.preset.width === item.preset.height;

                return (
                  <button
                    key={item.preset.name}
                    type="button"
                    onClick={() => onSelectLayout(item.preset)}
                    className="group relative flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 text-left transition-all hover:border-indigo-500/40 hover:bg-indigo-500/[0.06] hover:shadow-lg"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Mini canvas silhouette preview */}
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/[0.1] bg-[#16161c]">
                        <div
                          className={`rounded border border-indigo-400/50 bg-indigo-500/20 shadow transition-transform group-hover:scale-110 ${
                            isLandscape
                              ? "h-5 w-8"
                              : isSquare
                              ? "h-7 w-7"
                              : "h-8 w-6"
                          }`}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-zinc-100 group-hover:text-white">
                            {item.preset.name}
                          </span>
                          {item.popularBadge && (
                            <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[9px] font-medium text-indigo-300">
                              {item.popularBadge}
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 text-[11px] text-zinc-400">
                          {item.aspectDesc}
                        </p>

                        <span className="mt-1.5 inline-block font-mono text-[10px] text-zinc-500 group-hover:text-indigo-300">
                          {item.preset.width} × {item.preset.height} px
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg p-2 text-zinc-600 transition group-hover:translate-x-1 group-hover:text-indigo-400">
                      <ArrowRight size={15} />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Custom dimensions */
            <form onSubmit={handleCustomSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-zinc-300">
                  Project Title
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Custom Poster"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={8000}
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={8000}
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                <div className="text-xs text-zinc-400">
                  Orientation:{" "}
                  <span className="font-semibold text-zinc-200">
                    {customWidth > customHeight
                      ? "Landscape"
                      : customWidth === customHeight
                      ? "Square"
                      : "Portrait"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={swapOrientation}
                  className="rounded-lg border border-white/10 px-3 py-1 text-xs text-indigo-300 transition hover:bg-white/[0.06] hover:text-white"
                >
                  Swap Width ⇄ Height
                </button>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-[1.01] hover:opacity-95"
              >
                <span>Start Poster with Custom Size</span>
                <ArrowRight size={14} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
