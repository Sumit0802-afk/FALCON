import React from "react";
import { ToolId } from "@/types";
import { RailBadgeIcon } from "./RailBadgeIcon";

export type SidebarTab =
  | "templates"
  | "elements"
  | "text"
  | "uploads"
  | "photos"
  | "portrait"
  | "qr"
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
      icon: <RailBadgeIcon id="templates" />,
    },
    {
      id: "elements",
      label: "Elements",
      icon: <RailBadgeIcon id="elements" />,
    },
    {
      id: "text",
      label: "Text",
      icon: <RailBadgeIcon id="text" />,
    },
    {
      id: "uploads",
      label: "Uploads",
      icon: <RailBadgeIcon id="uploads" />,
    },
    {
      id: "photos",
      label: "Photos",
      icon: <RailBadgeIcon id="photos" />,
    },
    {
      id: "portrait",
      label: "Portrait",
      icon: <RailBadgeIcon id="portrait" />,
    },
    {
      id: "qr",
      label: "QR Code",
      icon: <RailBadgeIcon id="qr" />,
    },
    {
      id: "backgrounds",
      label: "Background",
      icon: <RailBadgeIcon id="backgrounds" />,
    },
    {
      id: "brand-kit",
      label: "Brand Kit",
      icon: <RailBadgeIcon id="brand-kit" />,
    },
    {
      id: "layers",
      label: "Layers",
      icon: <RailBadgeIcon id="layers" />,
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
      className={`falcon-tool-rail flex w-[76px] shrink-0 flex-col items-center justify-between border-r select-none z-30 transition-colors duration-200 ${
        isDark
          ? "border-white/[0.06] bg-[#090b0e] text-white"
          : "border-slate-200 bg-slate-50 text-slate-900"
      }`}
    >
      {/* ── TOP SECTION: Main Navigation Items ── */}
      <div className="flex w-full flex-col items-center gap-1.5 py-3 px-2 overflow-y-auto no-scrollbar">
        {primaryNavItems.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item.id)}
              title={item.label}
              className={`group relative flex h-[66px] w-full shrink-0 flex-col items-center justify-center rounded-2xl transition-all duration-200 ${
                active
                  ? "bg-[#00c4cc]/10 text-[#00c4cc] border-[1.5px] border-[#00c4cc] shadow-[0_0_16px_rgba(0,196,204,0.22)]"
                  : isDark
                  ? "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                  : "text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm"
              }`}
            >
              <div className="mb-0.5 flex transition-transform duration-300 group-hover:scale-110">
                {item.icon}
              </div>
              <span className={`text-[10px] font-medium tracking-tight leading-tight text-center px-0.5 ${active ? "text-[#00c4cc] font-semibold" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── BOTTOM SECTION: AI Tools ── */}
      <div className={`w-full p-2 border-t ${isDark ? "border-white/[0.06]" : "border-slate-200"}`}>
        <button
          type="button"
          onClick={() => handleTabClick("ai")}
          title="AI Tools"
          className={`group flex h-[66px] w-full flex-col items-center justify-center rounded-2xl transition-all duration-200 ${
            activeTab === "ai"
              ? "bg-[#00c4cc]/15 text-[#00c4cc] border-[1.5px] border-[#00c4cc] shadow-[0_0_16px_rgba(0,196,204,0.25)]"
              : isDark
              ? "text-slate-400 hover:bg-white/[0.05] hover:text-[#00c4cc]"
              : "text-slate-600 hover:bg-white hover:text-cyan-600"
          }`}
        >
          <RailBadgeIcon id="ai" className="mb-0.5 transition-transform duration-300 group-hover:scale-110" />
          <span className="text-[10px] font-medium text-[#00c4cc]">
            AI Tools
          </span>
        </button>
      </div>
    </aside>
  );
}