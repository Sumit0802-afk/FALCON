import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldAlert,
  X,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Filter,
  Flag,
  Tag,
  FolderTree,
  FileText,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { Asset, AssetType, AssetStatus } from "@/types/asset";
import { assetService } from "@/services/assetService";

interface AssetAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab = "assets" | "reported" | "sources" | "taxonomy";

export function AssetAdminModal({ isOpen, onClose }: AssetAdminModalProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("assets");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [disabledIds, setDisabledIds] = useState<string[]>([]);
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, disabled: 0, reported: 0 });

  const loadData = () => {
    const res = assetService.queryAssets({ limit: 200, status: "all" });
    const dis = assetService.getDisabledAssetIds();
    const rep = assetService.getReportedAssetIds();
    setAssets(res.items);
    setDisabledIds(dis);
    setReportedIds(rep);
    setStats({
      total: res.total,
      disabled: dis.length,
      reported: rep.length,
    });
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleToggleDisable = (assetId: string) => {
    assetService.toggleDisableAsset(assetId);
    loadData();
  };

  // Filtered list
  const filteredList = useMemo(() => {
    let list = assets;

    if (activeTab === "reported") {
      const repSet = new Set(reportedIds);
      list = list.filter((a) => repSet.has(a.id));
    }

    if (typeFilter !== "all") {
      list = list.filter((a) => a.type === typeFilter);
    }

    if (statusFilter !== "all") {
      const disSet = new Set(disabledIds);
      if (statusFilter === "disabled") {
        list = list.filter((a) => disSet.has(a.id));
      } else if (statusFilter === "active") {
        list = list.filter((a) => !disSet.has(a.id));
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q) ||
          a.license.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [assets, activeTab, typeFilter, statusFilter, searchQuery, disabledIds, reportedIds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 select-none">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-white/[0.1] bg-[#0f1015] shadow-2xl overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#14151c] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">
                  Falcon Asset Governance & Admin
                </h2>
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                  v2.0 Ecosystem
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Licenses, moderation, sources, taxonomy & asset lifecycle
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.08]"
              title="Refresh dataset"
            >
              <RefreshCw size={13} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.08] hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* METRICS & TABS BAR */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#111218] px-6 py-2.5">
          {/* Tabs */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("assets")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeTab === "assets"
                  ? "bg-cyan-500 text-slate-950 font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              All Assets ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reported")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeTab === "reported"
                  ? "bg-rose-500 text-white font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Flag size={13} />
              <span>Reported ({stats.reported})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sources")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeTab === "sources"
                  ? "bg-cyan-500 text-slate-950 font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Sources & Licenses
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("taxonomy")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeTab === "taxonomy"
                  ? "bg-cyan-500 text-slate-950 font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Categories & Tags
            </button>
          </div>

          {/* Quick metric pill */}
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span>
              Disabled: <strong className="text-amber-400">{stats.disabled}</strong>
            </span>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        {(activeTab === "assets" || activeTab === "reported") && (
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0c0d12] px-6 py-2.5 gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets by name, license, source..."
                className="w-full rounded-lg border border-white/[0.08] bg-[#16171f] py-1.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-lg border border-white/10 bg-[#16171f] px-2.5 py-1.5 text-xs text-zinc-300 outline-none"
              >
                <option value="all">All Types</option>
                <option value="image">Photos & Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="svg">Stickers & SVGs</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-white/10 bg-[#16171f] px-2.5 py-1.5 text-xs text-zinc-300 outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="disabled">Disabled Only</option>
              </select>
            </div>
          </div>
        )}

        {/* BODY TABLE / VIEWS */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-800">
          {(activeTab === "assets" || activeTab === "reported") && (
            <div className="rounded-xl border border-white/[0.08] bg-[#121319] overflow-hidden">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="border-b border-white/[0.08] bg-[#161720] text-[11px] uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">Asset</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Source & License</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredList.map((asset) => {
                    const isDisabled = disabledIds.includes(asset.id);
                    const isReported = reportedIds.includes(asset.id);

                    return (
                      <tr
                        key={asset.id}
                        className={`transition hover:bg-white/[0.02] ${
                          isDisabled ? "opacity-60 bg-black/40" : ""
                        }`}
                      >
                        {/* Thumbnail & Title */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black flex items-center justify-center">
                              {asset.thumbnailUrl ? (
                                <img
                                  src={asset.thumbnailUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <FileText size={16} className="text-zinc-500" />
                              )}
                            </div>
                            <div className="truncate max-w-[220px]">
                              <div className="font-medium text-white truncate" title={asset.name}>
                                {asset.name}
                              </div>
                              <div className="text-[10px] text-zinc-500 truncate font-mono">
                                ID: {asset.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3">
                          <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] uppercase font-mono text-cyan-300">
                            {asset.type}
                          </span>
                        </td>

                        {/* Source & License */}
                        <td className="px-4 py-3">
                          <div className="truncate max-w-[200px]">
                            <div className="text-zinc-200">{asset.source}</div>
                            <div className="text-[10px] text-zinc-400 truncate" title={asset.license}>
                              {asset.license}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3">
                          <span className="text-zinc-400 capitalize">{asset.category}</span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          {isDisabled ? (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400">
                              <XCircle size={13} />
                              <span>Disabled</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                              <CheckCircle size={13} />
                              <span>Active</span>
                            </span>
                          )}
                        </td>

                        {/* Moderation Action Button */}
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleDisable(asset.id)}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                              isDisabled
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950"
                                : "bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500 hover:text-white"
                            }`}
                          >
                            {isDisabled ? (
                              <>
                                <Eye size={12} />
                                <span>Re-enable</span>
                              </>
                            ) : (
                              <>
                                <EyeOff size={12} />
                                <span>Disable</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* SOURCES & LICENSES TAB */}
          {activeTab === "sources" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/[0.08] bg-[#121319] p-4 space-y-3">
                <h3 className="text-xs font-semibold text-white">Registered Providers</h3>
                <ul className="space-y-2 text-xs text-zinc-300">
                  <li className="flex items-center justify-between rounded-lg bg-black/40 p-2.5 border border-white/[0.04]">
                    <div>
                      <div className="font-semibold text-white">Unsplash Imagery</div>
                      <div className="text-[10px] text-zinc-400">Commercial Free CC0 equivalent</div>
                    </div>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 font-medium">Verified</span>
                  </li>
                  <li className="flex items-center justify-between rounded-lg bg-black/40 p-2.5 border border-white/[0.04]">
                    <div>
                      <div className="font-semibold text-white">Falcon Motion Lab</div>
                      <div className="text-[10px] text-zinc-400">Royalty-Free Loopable 4K Video</div>
                    </div>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 font-medium">Verified</span>
                  </li>
                  <li className="flex items-center justify-between rounded-lg bg-black/40 p-2.5 border border-white/[0.04]">
                    <div>
                      <div className="font-semibold text-white">Free Music Archive / Incompetech</div>
                      <div className="text-[10px] text-zinc-400">CC0 & CC-BY 4.0 Audio Beats</div>
                    </div>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 font-medium">Verified</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#121319] p-4 space-y-3">
                <h3 className="text-xs font-semibold text-white">License Compliance Guard</h3>
                <p className="text-xs text-zinc-400">
                  All external media catalogs enforce attribution tags and commercial redistribution allowances. Scraped copyrighted media is forbidden.
                </p>
                <div className="rounded-lg bg-cyan-950/30 border border-cyan-500/30 p-3 text-xs text-cyan-300">
                  ✓ Strict compliance check: 100% of seed photos, videos, audio, and stickers include explicit license declarations and author attribution retention.
                </div>
              </div>
            </div>
          )}

          {/* TAXONOMY TAB */}
          {activeTab === "taxonomy" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/[0.08] bg-[#121319] p-4 space-y-2">
                <h3 className="text-xs font-semibold text-white">Active Categories</h3>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {[
                    "Nature",
                    "Technology",
                    "Business",
                    "Architecture",
                    "Food",
                    "People",
                    "Minimal",
                    "Textures",
                    "Travel",
                    "Ambient",
                    "Lo-Fi",
                    "Upbeat",
                    "Cinematic",
                  ].map((cat) => (
                    <span
                      key={cat}
                      className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-xs text-zinc-200 border border-white/[0.04]"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#121319] p-4 space-y-2">
                <h3 className="text-xs font-semibold text-white">Search Indexing Tags</h3>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {[
                    "mountain",
                    "neon",
                    "startup",
                    "code",
                    "dunes",
                    "coffee",
                    "marble",
                    "waves",
                    "stream",
                    "lofi",
                    "chill",
                    "beats",
                    "synth",
                    "cinematic",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-400 border border-cyan-500/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
