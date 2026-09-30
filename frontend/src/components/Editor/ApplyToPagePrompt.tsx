import React, { useEffect, useState } from "react";
import { Maximize2, X, Sparkles, Check } from "lucide-react";

export type PromptItemType = "image" | "element" | "background";

interface ApplyToPagePromptProps {
  itemType: PromptItemType;
  itemName?: string;
  onApply: () => void;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export function ApplyToPagePrompt({
  itemType,
  itemName,
  onApply,
  onDismiss,
  autoDismissMs = 8000,
}: ApplyToPagePromptProps) {
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (applied) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [onDismiss, autoDismissMs, applied]);

  const handleApply = () => {
    setApplied(true);
    onApply();
    setTimeout(() => {
      onDismiss();
    }, 1200);
  };

  const itemLabel =
    itemType === "image"
      ? "Image"
      : itemType === "background"
      ? "Background"
      : "Element";

  return (
    <div className="pointer-events-auto absolute bottom-7 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-3 rounded-2xl border border-indigo-500/30 bg-[#121318]/95 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md">
        {/* ICON */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm shadow-indigo-500/40">
          {applied ? <Check size={16} strokeWidth={2.5} /> : <Sparkles size={16} />}
        </div>

        {/* MESSAGE */}
        <div className="flex flex-col pr-1">
          <span className="text-xs font-semibold text-white">
            {applied ? (
              <span className="text-emerald-400">
                Applied to complete page!
              </span>
            ) : (
              `Apply to the complete page?`
            )}
          </span>
          <span className="text-[10px] text-zinc-400">
            {applied
              ? `${itemLabel} now covers the entire canvas`
              : itemName
              ? `${itemName} can fill the entire page background`
              : `Fill canvas background with this ${itemLabel.toLowerCase()}`}
          </span>
        </div>

        {/* ACTIONS */}
        {!applied ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-500 active:scale-95"
            >
              <Maximize2 size={13} />
              <span>Apply to complete page</span>
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
              title="Keep as is"
            >
              <X size={14} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
