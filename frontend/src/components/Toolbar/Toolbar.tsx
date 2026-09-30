import React from "react";
import { ToolId } from "@/types";
import {
  LayoutTemplate,
  Shapes,
  Type,
  UploadCloud,
  Palette,
  Square,
  Smile,
  BarChart2,
  LayoutGrid,
  Folder,
  Sparkles,
  Wallpaper,
  Image as ImageIcon,
  Bookmark,
  Layers,
} from "lucide-react";

export type SidebarTab =
  | "templates"
  | "elements"
  | "stickers"
  | "text"
  | "uploads"
  | "photos"
  | "backgrounds"
  | "brand-kit"
  | "graphics"
  | "shapes"
  | "charts"
  | "apps"
  | "projects"
  | "ai"
  | "fonts"
  | "frames"
  | "filters"
  | "layers"
  | null;

interface ToolbarProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  activeTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
  onOpenBgRemover?: () => void;
  onOpenTemplates?: () => void;
  theme?: "dark" | "light";
}

export function Toolbar({
  activeTab,
  onSelectTab,
  theme = "dark",
}: ToolbarProps) {
  const isDark = theme === "dark";

  const primaryNavItems: {
    id: SidebarTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "templates",
      label: "Templates",
      icon: <LayoutTemplate size={22} />,
    },
    {
      id: "elements",
      label: "Elements",
      icon: <Shapes size={22} />,
    },
    {
      id: "stickers",
      label: "Stickers",
      icon: <Smile size={22} />,
    },
    {
      id: "text",
      label: "Text",
      icon: <Type size={22} />,
    },
    {
      id: "uploads",
      label: "Uploads",
      icon: <UploadCloud size={22} />,
    },
    {
      id: "photos",
      label: "Photos",
      icon: <ImageIcon size={22} />,
    },
    {
      id: "backgrounds",
      label: "Background",
      icon: <Wallpaper size={22} />,
    },
    {
      id: "brand-kit",
      label: "Brand Kit",
      icon: <Bookmark size={22} />,
    },
    {
      id: "layers",
      label: "Layers",
      icon: <Layers size={22} />,
    },
  ];

  const handleTabClick = (id: SidebarTab) => {
    if (activeTab === id) {
      onSelectTab(null);
    } else {
      onSelectTab(id);
    }
  };

  return (
    <aside
      className={`flex w-[82px] shrink-0 flex-col items-center justify-between border-r select-none z-30 transition-colors duration-200 ${
        isDark
          ? "border-white/[0.08] bg-[#0c1017] text-white"
          : "border-slate-200 bg-slate-50 text-slate-900"
      }`}
    >
      {/* ── TOP SECTION: Main Navigation Items ── */}
      <div className="flex w-full flex-col items-center gap-0.5 py-2 px-1.5 overflow-y-auto no-scrollbar">
        {primaryNavItems.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item.id)}
              title={item.label}
              className={`group relative flex h-[58px] w-full flex-col items-center justify-center rounded-xl transition-all duration-200 ${
                active
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  : isDark
                  ? "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                  : "text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm"
              }`}
            >
              <div className="mb-1 transition-transform group-hover:scale-110">
                {item.icon}
              </div>
              <span className="text-[9px] font-medium tracking-tight leading-tight text-center px-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── BOTTOM SECTION: AI Tools ── */}
      <div className={`w-full p-1.5 border-t ${isDark ? "border-white/[0.06]" : "border-slate-200"}`}>
        <button
          type="button"
          onClick={() => handleTabClick("ai")}
          title="AI Tools"
          className={`group flex h-[58px] w-full flex-col items-center justify-center rounded-xl transition-all duration-200 ${
            activeTab === "ai"
              ? "bg-gradient-to-b from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-400/40 shadow-lg shadow-cyan-500/15"
              : isDark
              ? "text-zinc-400 hover:bg-white/[0.05] hover:text-cyan-400"
              : "text-slate-600 hover:bg-white hover:text-cyan-600"
          }`}
        >
          <Sparkles size={22} className="text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-medium text-cyan-400">
            AI Tools
          </span>
        </button>
      </div>
    </aside>
  );
}