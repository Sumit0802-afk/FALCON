import React, { useState, useEffect } from "react";
import {
  Bookmark,
  Palette,
  Type,
  Image as ImageIcon,
  Plus,
  Trash2,
  Check,
  UploadCloud,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { BrandKit, BrandColor, BrandFont, BrandLogo } from "@/types/asset";
import { brandKitService } from "@/services/brandKitService";

interface BrandKitPanelProps {
  onApplyColor: (color: string) => void;
  onApplyFont: (fontFamily: string) => void;
  onAddLogoToCanvas: (src: string, name?: string) => void;
  onAddHeadingText?: (fontFamily: string) => void;
  onAddBodyText?: (fontFamily: string) => void;
}

export function BrandKitPanel({
  onApplyColor,
  onApplyFont,
  onAddLogoToCanvas,
  onAddHeadingText,
  onAddBodyText,
}: BrandKitPanelProps) {
  const [brandKit, setBrandKit] = useState<BrandKit>(brandKitService.getBrandKit());
  const [activeSection, setActiveSection] = useState<"colors" | "fonts" | "logos">("colors");
  const [newColorHex, setNewColorHex] = useState("#06b6d4");
  const [newColorLabel, setNewColorLabel] = useState("");
  const [isAddingColor, setIsAddingColor] = useState(false);
  const [appliedItem, setAppliedItem] = useState<string | null>(null);

  useEffect(() => {
    setBrandKit(brandKitService.getBrandKit());
  }, []);

  const showAppliedFeedback = (id: string) => {
    setAppliedItem(id);
    setTimeout(() => setAppliedItem(null), 1500);
  };

  // Color actions
  const handleApplyColor = (color: BrandColor) => {
    onApplyColor(color.value);
    showAppliedFeedback(color.id);
  };

  const handleCreateColor = () => {
    if (!newColorHex) return;
    brandKitService.addColor({
      label: newColorLabel.trim() || `Custom (${newColorHex})`,
      value: newColorHex,
      type: "custom",
    });
    setBrandKit(brandKitService.getBrandKit());
    setNewColorLabel("");
    setIsAddingColor(false);
  };

  const handleDeleteColor = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    brandKitService.removeColor(id);
    setBrandKit(brandKitService.getBrandKit());
  };

  // Font actions
  const handleApplyHeadingFont = (font: BrandFont) => {
    onApplyFont(font.fontFamily);
    if (onAddHeadingText) {
      onAddHeadingText(font.fontFamily);
    }
    showAppliedFeedback(font.id);
  };

  const handleApplyBodyFont = (font: BrandFont) => {
    onApplyFont(font.fontFamily);
    if (onAddBodyText) {
      onAddBodyText(font.fontFamily);
    }
    showAppliedFeedback(font.id);
  };

  // Logo upload simulation / action
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "primary" | "secondary" | "icon") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      if (src) {
        brandKitService.addLogo({
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Logo`,
          type,
          fileUrl: src,
        });
        setBrandKit(brandKitService.getBrandKit());
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-r border-white/[0.08] bg-[#0c0c0e] text-white select-none relative">
      {/* HEADER */}
      <div className="border-b border-white/[0.08] bg-[#111114] p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Bookmark size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-semibold tracking-wide text-white">Brand Kit</h2>
                <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[9px] font-medium text-cyan-300">
                  Active
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">Consistent colors, fonts & logos</p>
            </div>
          </div>
        </div>

        {/* SECTION NAV TABS */}
        <div className="flex items-center gap-1 rounded-lg bg-[#18191f] p-1 border border-white/[0.04]">
          <button
            type="button"
            onClick={() => setActiveSection("colors")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium transition ${
              activeSection === "colors"
                ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Palette size={13} />
            <span>Colors</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("fonts")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium transition ${
              activeSection === "fonts"
                ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Type size={13} />
            <span>Fonts</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("logos")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium transition ${
              activeSection === "logos"
                ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <ImageIcon size={13} />
            <span>Logos</span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-5 scrollbar-thin scrollbar-thumb-zinc-800">
        {/* ========================================================
            1. BRAND COLORS SECTION
            ======================================================== */}
        {activeSection === "colors" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-white">Brand Colors</h3>
                <p className="text-[10px] text-zinc-400">Click swatch to apply to selection/canvas</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingColor(true)}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
              >
                <Plus size={13} />
                <span>Add Color</span>
              </button>
            </div>

            {/* Add Custom Color popover */}
            {isAddingColor && (
              <div className="rounded-xl border border-cyan-500/40 bg-[#16171d] p-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span>Add Brand Color</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingColor(false)}
                    className="text-zinc-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="h-8 w-10 cursor-pointer rounded border border-white/20 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={newColorLabel}
                    onChange={(e) => setNewColorLabel(e.target.value)}
                    placeholder="Color label (e.g. Neon Indigo)"
                    className="flex-1 rounded-md border border-white/10 bg-[#121318] px-2 py-1 text-xs text-white outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingColor(false)}
                    className="rounded px-2.5 py-1 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateColor}
                    className="rounded bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
                  >
                    Save Color
                  </button>
                </div>
              </div>
            )}

            {/* Colors Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {brandKit.colors.map((color) => {
                const isJustApplied = appliedItem === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => handleApplyColor(color)}
                    className="group relative flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#14151b] p-2 text-left transition hover:border-cyan-500/50 hover:shadow-md"
                  >
                    {/* Swatch */}
                    <div
                      className="relative h-8 w-8 shrink-0 rounded-lg shadow-inner border border-white/10 flex items-center justify-center"
                      style={{ backgroundColor: color.value }}
                    >
                      {isJustApplied && (
                        <Check size={14} className="text-white drop-shadow-md stroke-[3]" />
                      )}
                    </div>

                    <div className="truncate flex-1">
                      <div className="truncate text-xs font-medium text-white">{color.label}</div>
                      <div className="text-[10px] text-zinc-400 font-mono uppercase">
                        {color.value}
                      </div>
                    </div>

                    {color.type === "custom" && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteColor(e, color.id)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 transition"
                        title="Delete color"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            2. BRAND FONTS SECTION
            ======================================================== */}
        {activeSection === "fonts" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-white">Brand Typography</h3>
              <p className="text-[10px] text-zinc-400">Heading & body font styles</p>
            </div>

            <div className="space-y-3">
              {brandKit.fonts.map((font) => (
                <div
                  key={font.id}
                  className="rounded-xl border border-white/[0.08] bg-[#14151b] p-3 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-cyan-300 uppercase tracking-wider text-[10px]">
                      {font.type} Font
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">{font.fontFamily}</span>
                  </div>

                  <div
                    className="truncate py-1 text-white"
                    style={{
                      fontFamily: font.fontFamily,
                      fontSize: font.type === "heading" ? "20px" : "14px",
                      fontWeight: font.fontWeight || 600,
                    }}
                  >
                    {font.type === "heading" ? "Bold Heading Sample" : "Standard readable body text sample"}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      font.type === "heading"
                        ? handleApplyHeadingFont(font)
                        : handleApplyBodyFont(font)
                    }
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-cyan-500/15 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition"
                  >
                    <Plus size={13} />
                    <span>Add {font.type === "heading" ? "Heading" : "Body"} Text</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            3. BRAND LOGOS SECTION
            ======================================================== */}
        {activeSection === "logos" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-white">Brand Logos</h3>
              <p className="text-[10px] text-zinc-400">Click to place brand logo onto canvas</p>
            </div>

            <div className="space-y-3">
              {(["primary", "secondary", "icon"] as const).map((logoType) => {
                const logo = brandKit.logos.find((l) => l.type === logoType);

                return (
                  <div
                    key={logoType}
                    className="rounded-xl border border-white/[0.08] bg-[#14151b] p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white capitalize">
                        {logoType} Logo
                      </span>
                      <label className="cursor-pointer text-[10px] text-cyan-400 hover:underline">
                        Replace
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, logoType)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {logo ? (
                      <div
                        onClick={() => onAddLogoToCanvas(logo.fileUrl, logo.label)}
                        className="group relative flex h-20 w-full cursor-pointer items-center justify-center rounded-lg border border-white/[0.06] bg-black/40 p-2 hover:border-cyan-500/50"
                      >
                        <img
                          src={logo.fileUrl}
                          alt={logo.label}
                          className="max-h-full max-w-full object-contain"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg">
                          <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1">
                            <Plus size={13} />
                            Add to canvas
                          </span>
                        </div>
                      </div>
                    ) : (
                      <label className="flex h-20 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.1] bg-black/20 hover:border-cyan-500/40">
                        <UploadCloud size={20} className="text-zinc-500 mb-1" />
                        <span className="text-[10px] text-zinc-400">Upload {logoType} logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, logoType)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
