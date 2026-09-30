import React, { useState, useMemo } from "react";
import {
  Search,
  Sparkles,
  Layers,
  X,
  Plus,
  Frame,
} from "lucide-react";
import {
  FRAME_DEFINITIONS,
  FrameCategory,
  FrameDefinition,
} from "@/data/frameDefinitions";

interface FramesPanelProps {
  onAddFrame: (frameDef: FrameDefinition) => void;
}

const CATEGORY_TABS: { id: FrameCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "basic", label: "Basic" },
  { id: "shapes", label: "Shapes" },
  { id: "blob", label: "Blobs" },
  { id: "geometric", label: "Geometric" },
  { id: "decorative", label: "Decorative" },
  { id: "photo", label: "Photo" },
];

export function FramesPanel({ onAddFrame }: FramesPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FrameCategory>("all");

  const filteredFrames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FRAME_DEFINITIONS.filter((frame) => {
      if (q && !frame.name.toLowerCase().includes(q) && !frame.id.includes(q)) {
        return false;
      }
      if (activeCategory === "all") return true;
      return frame.category === activeCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleDragStart = (e: React.DragEvent, frame: FrameDefinition) => {
    e.dataTransfer.setData("application/falcon-frame", JSON.stringify(frame));
    e.dataTransfer.setData("text/plain", frame.id);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <aside className="flex h-full w-[360px] shrink-0 flex-col border-r border-white/[0.08] bg-[#18191b] text-white select-none">
      {/* ── Header ── */}
      <div className="border-b border-white/[0.08] bg-[#131416] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/10 text-pink-400">
              <Frame size={16} />
            </div>
            <div>
              <h2 className="text-xs font-semibold tracking-wide text-white">
                Image Frames
              </h2>
              <p className="text-[10px] text-zinc-500">
                Drag or click to add frame
              </p>
            </div>
          </div>
          <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] font-mono text-zinc-400">
            {filteredFrames.length}
          </span>
        </div>

        {/* ── Search Input ── */}
        <div className="relative mt-3">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search frames (circle, heart, blob...)"
            className="h-8 w-full rounded-lg border border-white/[0.08] bg-[#17171a] pl-8 pr-8 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-pink-500/60 focus:bg-[#1b1b20]"
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

        {/* ── Category Filter Pills ── */}
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const active = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                  active
                    ? "bg-pink-500/20 text-pink-300 shadow-[0_0_10px_rgba(244,114,182,0.15)] border border-pink-500/30"
                    : "bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200 border border-transparent"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Frames Grid ── */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-zinc-800">
        {filteredFrames.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Frame size={28} className="text-zinc-700 mb-2" />
            <p className="text-xs font-medium text-zinc-400">No frames found</p>
            <p className="mt-1 text-[11px] text-zinc-600">
              Try searching with another shape name
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredFrames.map((frame) => (
              <div
                key={frame.id}
                draggable
                onDragStart={(e) => handleDragStart(e, frame)}
                onClick={() => onAddFrame(frame)}
                role="button"
                tabIndex={0}
                className="group relative flex flex-col items-center rounded-xl border border-white/[0.06] bg-[#141417]/80 p-3 text-center transition cursor-grab active:cursor-grabbing hover:border-pink-500/40 hover:bg-[#1a1a20] hover:shadow-[0_0_20px_rgba(244,114,182,0.1)]"
              >
                {/* Visual Thumbnail */}
                <div className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-lg bg-black/40 border border-white/[0.04] group-hover:border-white/[0.08] transition">
                  <svg
                    viewBox="0 0 100 100"
                    className="h-16 w-16 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-transform duration-200 group-hover:scale-105"
                  >
                    <defs>
                      <linearGradient
                        id={`grad-${frame.id}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#c084fc" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#f472b6" stopOpacity="0.8" />
                      </linearGradient>
                      <pattern
                        id={`grid-${frame.id}`}
                        width="10"
                        height="10"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 10 0 L 0 0 0 10"
                          fill="none"
                          stroke="rgba(255,255,255,0.12)"
                          strokeWidth="0.8"
                        />
                      </pattern>
                    </defs>

                    {/* Frame mask shape with modern design preview */}
                    <path
                      d={frame.svgPath100}
                      fill={`url(#grad-${frame.id})`}
                      opacity="0.35"
                    />
                    <path
                      d={frame.svgPath100}
                      fill={`url(#grid-${frame.id})`}
                    />
                    <path
                      d={frame.svgPath100}
                      fill="none"
                      stroke="#f472b6"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />

                    {/* Small inner mountain/cloud icon showing it's an image holder */}
                    <circle cx="65" cy="35" r="5" fill="#f472b6" opacity="0.7" />
                    <path
                      d="M 30,70 L 45,50 L 58,65 L 68,55 L 80,70 Z"
                      fill="#f472b6"
                      opacity="0.5"
                    />
                  </svg>

                  {/* Add icon hover overlay */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-500 text-white shadow-lg">
                      <Plus size={15} strokeWidth={2.5} />
                    </span>
                  </div>
                </div>

                {/* Frame Name */}
                <span className="mt-2 truncate text-[11px] font-medium text-zinc-300 group-hover:text-white">
                  {frame.name}
                </span>
                <span className="text-[9px] text-zinc-600 capitalize">
                  {frame.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
