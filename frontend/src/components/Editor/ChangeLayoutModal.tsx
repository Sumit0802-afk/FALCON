import React, { useState } from "react";
import {
  X,
  Maximize2,
  Check,
  Layout,
  Smartphone,
  Monitor,
  FileText,
  Sliders,
  Scale,
  Sparkles,
} from "lucide-react";
import { PageSize, PAGE_PRESETS } from "@/types";

interface ChangeLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSize: PageSize;
  onApplyResize: (newSize: PageSize, scaleContent: boolean) => void;
}

export function ChangeLayoutModal({
  isOpen,
  onClose,
  currentSize,
  onApplyResize,
}: ChangeLayoutModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<PageSize | null>(null);
  const [scaleContent, setScaleContent] = useState(true);
  const [customWidth, setCustomWidth] = useState(currentSize.width);
  const [customHeight, setCustomHeight] = useState(currentSize.height);
  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");

  if (!isOpen) return null;

  const handleApply = () => {
    if (activeTab === "presets" && selectedPreset) {
      onApplyResize(selectedPreset, scaleContent);
    } else {
      const w = Math.max(100, Math.min(8000, Number(customWidth) || 1080));
      const h = Math.max(100, Math.min(8000, Number(customHeight) || 1440));
      onApplyResize(
        {
          name: `Custom (${w}×${h})`,
          width: w,
          height: h,
        },
        scaleContent
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#121216] shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
              <Scale size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">Change Canvas Layout</h2>
                <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 font-mono text-[10px] text-zinc-300">
                  Current: {currentSize.width}×{currentSize.height}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Resize the template to fit any social media, poster, or print format
              </p>
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
        <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#0d0d11] px-6 py-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "presets"
                ? "bg-white/[0.1] text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles size={13} className="text-indigo-400" />
            <span>Standard Presets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "custom"
                ? "bg-white/[0.1] text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sliders size={13} className="text-purple-400" />
            <span>Custom Dimensions</span>
          </button>
        </div>

        {/* BODY */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {activeTab === "presets" ? (
            <div className="space-y-2">
              {PAGE_PRESETS.map((preset) => {
                const isSelected = selectedPreset?.name === preset.name;
                const isCurrent =
                  preset.width === currentSize.width &&
                  preset.height === currentSize.height;

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setSelectedPreset(preset)}
                    className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500/[0.12] text-white shadow"
                        : "border-white/[0.08] bg-white/[0.02] text-zinc-300 hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                          isSelected
                            ? "border-indigo-400 bg-indigo-500/20 text-indigo-300"
                            : "border-white/10 bg-white/[0.03] text-zinc-400"
                        }`}
                      >
                        <Layout size={16} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{preset.name}</span>
                          {isCurrent && (
                            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-medium text-zinc-400">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-zinc-500">
                          {preset.width} × {preset.height} px
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white">
                        <Check size={14} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300">
                    New Width (px)
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
                    New Height (px)
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
            </div>
          )}

          {/* SMART CONTENT SCALING TOGGLE */}
          <div className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Scale size={14} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white">
                    Auto-Scale Design Elements
                  </span>
                  <p className="mt-0.5 text-[11px] text-zinc-400 leading-relaxed">
                    Proportionally scales text, images, and shapes to fit the new layout dimensions.
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={scaleContent}
                onChange={(e) => setScaleContent(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 accent-indigo-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex h-16 items-center justify-between border-t border-white/[0.08] bg-[#0d0d11] px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/[0.08] px-4 py-2 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={activeTab === "presets" && !selectedPreset}
            onClick={handleApply}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-[1.01] hover:opacity-95 disabled:opacity-50"
          >
            <Check size={14} />
            <span>Apply New Layout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
