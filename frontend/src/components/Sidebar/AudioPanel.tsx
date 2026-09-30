import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Music,
  Search,
  X,
  Play,
  Pause,
  Plus,
  Volume2,
  VolumeX,
  Trash2,
  Clock,
  ShieldCheck,
  Info,
  ExternalLink,
  Activity,
  Check,
} from "lucide-react";
import { Asset, ProjectAudioTrack } from "@/types/asset";
import { AUDIO_CATEGORIES, SEED_AUDIO } from "@/data/seedAudio";
import { audioProjectService } from "@/services/audioProjectService";
import { assetService } from "@/services/assetService";

export function AudioPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [audioTracks, setAudioTracks] = useState<Asset[]>(SEED_AUDIO);
  const [projectTrack, setProjectTrack] = useState<ProjectAudioTrack | null>(null);
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);
  const [selectedAudioForInfo, setSelectedAudioForInfo] = useState<Asset | null>(null);

  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Subscribe to project audio changes
  useEffect(() => {
    const unsubscribe = audioProjectService.subscribe((track) => {
      setProjectTrack(track);
    });
    return () => {
      unsubscribe();
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    let list = audioTracks;

    if (activeCategory !== "all") {
      list = list.filter((t) => t.category.toLowerCase() === activeCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          (t.author && t.author.toLowerCase().includes(q))
      );
    }

    return list;
  }, [audioTracks, activeCategory, searchQuery]);

  // Preview playback in panel
  const handleTogglePreview = (track: Asset) => {
    if (previewTrackId === track.id) {
      previewAudioRef.current?.pause();
      setPreviewTrackId(null);
    } else {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      const audio = new Audio(track.fileUrl);
      previewAudioRef.current = audio;
      audio.play().then(() => {
        setPreviewTrackId(track.id);
      }).catch(() => {
        setPreviewTrackId(null);
      });
      audio.onended = () => setPreviewTrackId(null);
    }
  };

  // Add audio to active design project
  const handleAddToProject = (track: Asset) => {
    assetService.recordRecent(track.id);
    if (previewTrackId) {
      previewAudioRef.current?.pause();
      setPreviewTrackId(null);
    }
    audioProjectService.setTrackFromAsset(track);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-r border-white/[0.08] bg-[#0c0c0e] text-white select-none relative">
      {/* HEADER */}
      <div className="border-b border-white/[0.08] bg-[#111114] p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Music size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-semibold tracking-wide text-white">Audio & Music</h2>
                <span className="flex items-center gap-0.5 rounded-full bg-cyan-500/15 px-2 py-0.5 text-[9px] font-medium text-cyan-300">
                  <ShieldCheck size={10} />
                  <span>Licensed CC0</span>
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">Background sound & musical beats</p>
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
            placeholder="Search beats, ambient, tracks..."
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
          {AUDIO_CATEGORIES.map((cat) => (
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

      {/* ACTIVE PROJECT AUDIO TRACK BAR */}
      {projectTrack && (
        <div className="border-b border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 to-[#121319] p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 truncate">
              <Activity size={13} className="text-cyan-400 animate-pulse" />
              <span className="font-semibold text-cyan-300 truncate">Project Track:</span>
              <span className="text-zinc-200 truncate">{projectTrack.name}</span>
            </div>
            <button
              type="button"
              onClick={() => audioProjectService.removeTrack()}
              className="text-zinc-400 hover:text-rose-400 transition"
              title="Remove audio from project"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {/* Controls: Play/Pause, timeline scrubber, volume */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => audioProjectService.togglePlay()}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition shadow"
            >
              {projectTrack.isPlaying ? (
                <Pause size={13} />
              ) : (
                <Play size={13} fill="currentColor" className="ml-0.5" />
              )}
            </button>

            {/* Time scrubber */}
            <div className="flex-1 flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
              <span>{formatDuration(projectTrack.currentTime)}</span>
              <input
                type="range"
                min={0}
                max={projectTrack.duration || 100}
                value={projectTrack.currentTime}
                onChange={(e) => audioProjectService.seek(parseFloat(e.target.value))}
                className="flex-1 h-1.5 accent-cyan-400 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <span>{formatDuration(projectTrack.duration)}</span>
            </div>

            {/* Volume slider */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  audioProjectService.setVolume(projectTrack.volume > 0 ? 0 : 0.8)
                }
                className="text-zinc-400 hover:text-white"
              >
                {projectTrack.volume === 0 ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={projectTrack.volume}
                onChange={(e) => audioProjectService.setVolume(parseFloat(e.target.value))}
                className="w-14 h-1 accent-cyan-400 bg-zinc-800 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* TRACKS LIST */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-zinc-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
          <span>{filteredTracks.length} Audio Tracks</span>
          <span className="text-[10px] text-cyan-400 font-medium">Free royalty-free audio</span>
        </div>

        {filteredTracks.map((track) => {
          const isPreviewing = previewTrackId === track.id;
          const isCurrentProjectTrack = projectTrack?.assetId === track.id;

          return (
            <div
              key={track.id}
              className={`group flex flex-col rounded-xl border p-2.5 transition ${
                isCurrentProjectTrack
                  ? "border-cyan-500/50 bg-cyan-950/20"
                  : "border-white/[0.06] bg-[#14151b] hover:border-cyan-500/40 hover:bg-[#181922]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleTogglePreview(track)}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                      isPreviewing
                        ? "bg-cyan-500 text-slate-950"
                        : "bg-white/[0.06] text-zinc-300 hover:bg-cyan-500 hover:text-slate-950"
                    }`}
                    title={isPreviewing ? "Pause preview" : "Preview track"}
                  >
                    {isPreviewing ? (
                      <Pause size={14} />
                    ) : (
                      <Play size={14} fill="currentColor" className="ml-0.5" />
                    )}
                  </button>

                  <div className="truncate">
                    <h4 className="text-xs font-medium text-white truncate" title={track.name}>
                      {track.name}
                    </h4>
                    <p className="text-[10px] text-zinc-400 truncate">
                      {track.author || "Falcon Records"} • {track.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedAudioForInfo(track)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                    title="License metadata"
                  >
                    <Info size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddToProject(track)}
                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                      isCurrentProjectTrack
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500 hover:text-slate-950"
                    }`}
                  >
                    {isCurrentProjectTrack ? (
                      <>
                        <Check size={11} strokeWidth={3} />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <Plus size={11} />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Waveform and duration display */}
              <div className="mt-2 flex items-center justify-between gap-2 pt-1 border-t border-white/[0.04]">
                {/* Waveform bars simulation */}
                <div className="flex items-end gap-0.5 h-4 flex-1">
                  {(track.waveform || [30, 50, 80, 40, 90, 60, 70, 50, 95, 75, 45, 30]).map(
                    (val, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          isPreviewing
                            ? "bg-cyan-400"
                            : isCurrentProjectTrack
                            ? "bg-emerald-400/80"
                            : "bg-zinc-700 group-hover:bg-zinc-600"
                        }`}
                        style={{ height: `${val}%` }}
                      />
                    )
                  )}
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 shrink-0">
                  <Clock size={10} />
                  <span>{formatDuration(track.duration || 120)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* LICENSING INFO MODAL */}
      {selectedAudioForInfo && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full rounded-xl border border-white/[0.1] bg-[#16171e] p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-cyan-400" />
                <h4 className="text-xs font-semibold text-white">Audio License</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAudioForInfo(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2 text-[11px] text-zinc-300">
              <div className="rounded-lg bg-black/40 p-2.5 border border-white/[0.06] space-y-1">
                <div className="text-white font-medium truncate">{selectedAudioForInfo.name}</div>
                <div className="flex items-center justify-between text-zinc-400 text-[10px]">
                  <span>Artist: {selectedAudioForInfo.author || "Unknown"}</span>
                  <span>Source: {selectedAudioForInfo.source}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase font-semibold text-zinc-400">License Terms:</div>
                <div className="rounded bg-cyan-950/30 border border-cyan-500/20 px-2 py-1.5 text-cyan-300 text-[10px]">
                  {selectedAudioForInfo.license}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                <span>Attribution required:</span>
                <span
                  className={
                    selectedAudioForInfo.attributionRequired
                      ? "text-amber-400 font-semibold"
                      : "text-emerald-400 font-semibold"
                  }
                >
                  {selectedAudioForInfo.attributionRequired ? "Yes" : "No (Free to use)"}
                </span>
              </div>

              {selectedAudioForInfo.sourceUrl && (
                <a
                  href={selectedAudioForInfo.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[10px] text-cyan-400 hover:underline pt-1"
                >
                  <ExternalLink size={11} />
                  <span>View source on {selectedAudioForInfo.source}</span>
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setSelectedAudioForInfo(null)}
                className="flex-1 rounded-lg border border-white/[0.1] bg-white/[0.04] py-1.5 text-xs text-zinc-300 hover:bg-white/[0.08]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAddToProject(selectedAudioForInfo);
                  setSelectedAudioForInfo(null);
                }}
                className="flex-1 rounded-lg bg-cyan-500 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
              >
                Add to Project
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
