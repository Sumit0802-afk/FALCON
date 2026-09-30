import React, { useState, useMemo, useRef } from "react";
import {
  Film,
  Search,
  X,
  Play,
  Pause,
  Scissors,
  Plus,
  Heart,
  ShieldCheck,
  Clock,
  Info,
  ExternalLink,
} from "lucide-react";
import { Asset } from "@/types/asset";
import { VIDEO_CATEGORIES, SEED_VIDEOS } from "@/data/seedVideos";
import { assetService } from "@/services/assetService";

interface VideosPanelProps {
  onAddVideoToCanvas: (src: string, name?: string) => void;
}

export function VideosPanel({ onAddVideoToCanvas }: VideosPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [videos, setVideos] = useState<Asset[]>(SEED_VIDEOS);
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);
  
  // Trimming modal state
  const [trimmingVideo, setTrimmingVideo] = useState<Asset | null>(null);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(10);
  const [isTrimPlaying, setIsTrimPlaying] = useState<boolean>(false);
  const trimVideoRef = useRef<HTMLVideoElement>(null);

  // Info modal state
  const [selectedVideoForInfo, setSelectedVideoForInfo] = useState<Asset | null>(null);

  const filteredVideos = useMemo(() => {
    let list = videos;

    if (activeCategory !== "all") {
      list = list.filter((v) => v.category.toLowerCase() === activeCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q)) ||
          (v.author && v.author.toLowerCase().includes(q))
      );
    }

    return list;
  }, [videos, activeCategory, searchQuery]);

  const handleAdd = (video: Asset) => {
    assetService.recordRecent(video.id);
    onAddVideoToCanvas(video.fileUrl, video.name);
  };

  const openTrimModal = (e: React.MouseEvent, video: Asset) => {
    e.stopPropagation();
    setTrimmingVideo(video);
    setTrimStart(0);
    setTrimEnd(Math.min(video.duration || 15, 10));
    setIsTrimPlaying(false);
  };

  const handleApplyTrim = () => {
    if (trimmingVideo) {
      assetService.recordRecent(trimmingVideo.id);
      // Pass video URL to canvas
      onAddVideoToCanvas(trimmingVideo.fileUrl, `${trimmingVideo.name} (Trimmed)`);
      setTrimmingVideo(null);
    }
  };

  const toggleTrimPlay = () => {
    if (trimVideoRef.current) {
      if (isTrimPlaying) {
        trimVideoRef.current.pause();
        setIsTrimPlaying(false);
      } else {
        trimVideoRef.current.currentTime = trimStart;
        trimVideoRef.current.play();
        setIsTrimPlaying(true);
      }
    }
  };

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-r border-white/[0.08] bg-[#0c0c0e] text-white select-none relative">
      {/* HEADER */}
      <div className="border-b border-white/[0.08] bg-[#111114] p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Film size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-semibold tracking-wide text-white">Videos</h2>
                <span className="flex items-center gap-0.5 rounded-full bg-cyan-500/15 px-2 py-0.5 text-[9px] font-medium text-cyan-300">
                  <ShieldCheck size={10} />
                  <span>Licensed CC0</span>
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">Cinematic loops & motion footage</p>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search footage and clips..."
            className="w-full rounded-lg border border-white/[0.08] bg-[#16171b] py-1.5 pl-9 pr-8 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-cyan-500/60 focus:bg-[#1a1b22]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* CATEGORY TABS SCROLLER */}
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
          {VIDEO_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                activeCategory === cat.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIDEO GRID */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-zinc-800">
        <div className="flex items-center justify-between mb-2 text-[11px] text-zinc-400">
          <span>{filteredVideos.length} Videos available</span>
          <span className="text-[10px] text-cyan-400 font-medium">Free for commercial use</span>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] p-8 text-center mt-6">
            <Film size={32} className="text-zinc-600 mb-2" />
            <p className="text-xs font-semibold text-zinc-300">No videos found</p>
            <p className="text-[10px] text-zinc-500 mt-1">Try another category or search term.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredVideos.map((video) => {
              const isHovered = hoveredVideoId === video.id;

              return (
                <div
                  key={video.id}
                  onMouseEnter={() => setHoveredVideoId(video.id)}
                  onMouseLeave={() => setHoveredVideoId(null)}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#14151a] transition hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-950/20"
                >
                  {/* Video Thumbnail / Preview Surface */}
                  <div
                    onClick={() => handleAdd(video)}
                    className="relative aspect-video w-full cursor-pointer overflow-hidden bg-black"
                  >
                    {isHovered ? (
                      <video
                        src={video.fileUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={video.thumbnailUrl || video.fileUrl}
                        alt={video.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                    {/* Duration badge */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/70 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-mono text-zinc-200">
                      <Clock size={10} className="text-cyan-400" />
                      <span>{video.duration || 15}s</span>
                    </div>

                    {/* Quick Add overlay button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100 pointer-events-none">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-slate-950 shadow-lg pointer-events-auto">
                        <Plus size={20} strokeWidth={2.5} />
                      </div>
                    </div>

                    {/* Top right actions (Trim & Info) */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
                      <button
                        type="button"
                        onClick={(e) => openTrimModal(e, video)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/80 hover:text-white backdrop-blur-md transition hover:bg-cyan-500/30"
                        title="Trim video clip"
                      >
                        <Scissors size={12} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVideoForInfo(video);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/80 hover:text-white backdrop-blur-md transition"
                        title="View licensing info"
                      >
                        <Info size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Title & Details */}
                  <div className="p-2.5 bg-[#111216] flex items-center justify-between">
                    <div className="truncate pr-2">
                      <h4 className="text-xs font-medium text-white truncate" title={video.name}>
                        {video.name}
                      </h4>
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {video.author || "Falcon Studio"} • {video.category}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAdd(video)}
                      className="shrink-0 rounded-md bg-white/[0.06] hover:bg-cyan-500 hover:text-slate-950 px-2 py-1 text-[11px] font-medium text-zinc-200 transition"
                    >
                      Use
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TRIM MODAL */}
      {trimmingVideo && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3">
          <div className="w-full rounded-xl border border-white/[0.1] bg-[#16171e] p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scissors size={15} className="text-cyan-400" />
                <h4 className="text-xs font-semibold text-white">Trim Video Clip</h4>
              </div>
              <button
                type="button"
                onClick={() => setTrimmingVideo(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            {/* Video preview */}
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black">
              <video
                ref={trimVideoRef}
                src={trimmingVideo.fileUrl}
                playsInline
                className="h-full w-full object-cover"
                onTimeUpdate={(e) => {
                  const curr = (e.target as HTMLVideoElement).currentTime;
                  if (curr >= trimEnd) {
                    (e.target as HTMLVideoElement).currentTime = trimStart;
                  }
                }}
              />
              <button
                type="button"
                onClick={toggleTrimPlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 text-white"
              >
                {isTrimPlaying ? <Pause size={28} /> : <Play size={28} fill="currentColor" />}
              </button>
            </div>

            {/* Trim sliders */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Start: {trimStart.toFixed(1)}s</span>
                <span>End: {trimEnd.toFixed(1)}s</span>
                <span className="text-cyan-400 font-semibold">
                  Duration: {(trimEnd - trimStart).toFixed(1)}s
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 w-8">Start</span>
                  <input
                    type="range"
                    min={0}
                    max={trimEnd - 0.5}
                    step={0.5}
                    value={trimStart}
                    onChange={(e) => setTrimStart(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 w-8">End</span>
                  <input
                    type="range"
                    min={trimStart + 0.5}
                    max={trimmingVideo.duration || 15}
                    step={0.5}
                    value={trimEnd}
                    onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setTrimmingVideo(null)}
                className="flex-1 rounded-lg border border-white/[0.1] bg-white/[0.04] py-1.5 text-xs text-zinc-300 hover:bg-white/[0.08]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyTrim}
                className="flex-1 rounded-lg bg-cyan-500 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
              >
                Apply & Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LICENSING INFO MODAL */}
      {selectedVideoForInfo && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full rounded-xl border border-white/[0.1] bg-[#16171e] p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-cyan-400" />
                <h4 className="text-xs font-semibold text-white">Video License</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVideoForInfo(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2 text-[11px] text-zinc-300">
              <div className="rounded-lg bg-black/40 p-2.5 border border-white/[0.06] space-y-1">
                <div className="text-white font-medium truncate">{selectedVideoForInfo.name}</div>
                <div className="flex items-center justify-between text-zinc-400 text-[10px]">
                  <span>Creator: {selectedVideoForInfo.author || "Unknown"}</span>
                  <span>Source: {selectedVideoForInfo.source}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase font-semibold text-zinc-400">License Terms:</div>
                <div className="rounded bg-cyan-950/30 border border-cyan-500/20 px-2 py-1.5 text-cyan-300 text-[10px]">
                  {selectedVideoForInfo.license}
                </div>
              </div>

              {selectedVideoForInfo.sourceUrl && (
                <a
                  href={selectedVideoForInfo.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[10px] text-cyan-400 hover:underline pt-1"
                >
                  <ExternalLink size={11} />
                  <span>View source on {selectedVideoForInfo.source}</span>
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setSelectedVideoForInfo(null)}
                className="flex-1 rounded-lg border border-white/[0.1] bg-white/[0.04] py-1.5 text-xs text-zinc-300 hover:bg-white/[0.08]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAdd(selectedVideoForInfo);
                  setSelectedVideoForInfo(null);
                }}
                className="flex-1 rounded-lg bg-cyan-500 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
              >
                Add to Canvas
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
