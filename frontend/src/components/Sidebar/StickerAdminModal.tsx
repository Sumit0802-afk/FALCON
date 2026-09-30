// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Design Editor – Admin Sticker Management & Ingestion Modal
//  Tabs: Add/Edit · Bulk Import · Assets Catalog · Sources Registry
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  Upload,
  FileText,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  Filter,
  Database,
  Globe,
  Lock,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Sticker, StickerImportInput, StickerStatus } from "@/types/sticker";
import { stickerService } from "@/services/stickerService";
import { STICKER_CATEGORIES } from "@/data/seedStickers";
import { STICKER_SOURCES } from "@/data/stickerSources";

interface StickerAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStickersChanged: () => void;
}

type AdminTab = "upload" | "bulk" | "manage" | "sources";

const MANAGE_PAGE_SIZE = 50;

export function StickerAdminModal({
  isOpen,
  onClose,
  onStickersChanged,
}: StickerAdminModalProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("upload");

  // ── Single Upload State ────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [category, setCategory] = useState("trending");
  const [subcategory, setSubcategory] = useState("");
  const [tags, setTags] = useState("");
  const [author, setAuthor] = useState("");
  const [source, setSource] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [license, setLicense] = useState("CC0 1.0 Universal");
  const [attributionRequired, setAttributionRequired] = useState(false);
  const [status, setStatus] = useState<StickerStatus>("published");
  const [svgContent, setSvgContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [editingSticker, setEditingSticker] = useState<Sticker | null>(null);

  // ── Bulk Import State ──────────────────────────────────────────────────────
  const [bulkInput, setBulkInput] = useState("");
  const [bulkFormat, setBulkFormat] = useState<"json" | "csv">("json");
  const [bulkResults, setBulkResults] = useState<{
    total: number; success: number; failed: number; errors: string[];
  } | null>(null);

  // ── Manage Catalog State ───────────────────────────────────────────────────
  const [allStickers, setAllStickers] = useState<Sticker[]>([]);
  const [manageFilter, setManageFilter] = useState<"all" | "published" | "draft" | "disabled">("published");
  const [manageSearch, setManageSearch] = useState("");
  const [manageCategoryFilter, setManageCategoryFilter] = useState("all");
  const [manageSourceFilter, setManageSourceFilter] = useState("all");
  const [managePage, setManagePage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkActioning, setIsBulkActioning] = useState(false);

  const loadStickers = useCallback(async () => {
    const res = await stickerService.getStickers({ limit: 2000, status: undefined });
    setAllStickers(res.items);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadStickers();
      setFeedback(null);
      setSelectedIds(new Set());
    }
  }, [isOpen, loadStickers]);

  if (!isOpen) return null;

  // ── Derived manage list ────────────────────────────────────────────────────
  const filteredManageStickers = useMemo(() => {
    const q = manageSearch.toLowerCase().trim();
    return allStickers.filter((s) => {
      if (manageFilter !== "all" && s.status !== manageFilter) return false;
      if (manageCategoryFilter !== "all" && s.category !== manageCategoryFilter) return false;
      if (manageSourceFilter !== "all" && s.source !== manageSourceFilter) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.tags.some((t) => t.includes(q))) return false;
      return true;
    });
  }, [allStickers, manageFilter, manageCategoryFilter, manageSourceFilter, manageSearch]);

  const totalManagePages = Math.ceil(filteredManageStickers.length / MANAGE_PAGE_SIZE);
  const pagedStickers = filteredManageStickers.slice(
    managePage * MANAGE_PAGE_SIZE,
    (managePage + 1) * MANAGE_PAGE_SIZE
  );

  const uniqueSources = useMemo(() => {
    const sources = new Set(allStickers.map((s) => s.source));
    return Array.from(sources).sort();
  }, [allStickers]);

  // ── Single Submit ──────────────────────────────────────────────────────────
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      if (editingSticker) {
        await stickerService.updateSticker(editingSticker.id, {
          name, category, subcategory,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          author, source, sourceUrl, license, attributionRequired, status,
        });
        setFeedback({ type: "success", message: `Updated '${name}' successfully.` });
        setEditingSticker(null);
      } else {
        await stickerService.importSticker({
          name, category, subcategory,
          tags,
          author, source, sourceUrl, license, attributionRequired, status,
          svgContent: svgContent || undefined,
          fileUrl: fileUrl || (svgContent ? "" : "https://via.placeholder.com/200"),
        });
        setFeedback({ type: "success", message: `Sticker '${name}' imported successfully.` });
        setName(""); setTags(""); setSvgContent(""); setFileUrl("");
      }
      await loadStickers();
      onStickersChanged();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to process sticker." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Bulk Import ────────────────────────────────────────────────────────────
  const handleBulkImport = async () => {
    setIsSubmitting(true);
    setBulkResults(null);
    setFeedback(null);
    try {
      let items: StickerImportInput[] = [];
      if (bulkFormat === "json") {
        const parsed = JSON.parse(bulkInput);
        if (!Array.isArray(parsed)) throw new Error("JSON input must be an array of sticker objects.");
        items = parsed;
      } else {
        const lines = bulkInput.trim().split("\n");
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
          if (cols.length < 3) continue;
          const row: any = {};
          headers.forEach((h, idx) => { row[h] = cols[idx] || ""; });
          items.push({
            name: row.name || `Sticker ${i}`,
            fileUrl: row.fileurl || row.url || "",
            category: row.category || "trending",
            tags: row.tags ? row.tags.split(";") : [],
            author: row.author || "Contributor",
            source: row.source || "Bulk Import",
            sourceUrl: row.sourceurl || "",
            license: row.license || "CC0",
            attributionRequired: row.attributionrequired === "true",
            status: "published",
          });
        }
      }
      const res = await stickerService.bulkImport(items);
      setBulkResults({
        total: res.total, success: res.successCount, failed: res.failedCount,
        errors: res.errors.map((e) => `[Row ${e.itemIndex + 1} - ${e.name || "Item"}]: ${e.error}`),
      });
      await loadStickers();
      onStickersChanged();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Bulk import failed." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Edit Sticker ───────────────────────────────────────────────────────────
  const handleEditClick = (sticker: Sticker) => {
    setEditingSticker(sticker);
    setName(sticker.name);
    setCategory(sticker.category);
    setSubcategory(sticker.subcategory || "");
    setTags(sticker.tags.join(", "));
    setAuthor(sticker.author);
    setSource(sticker.source);
    setSourceUrl(sticker.sourceUrl);
    setLicense(sticker.license);
    setAttributionRequired(sticker.attributionRequired);
    setStatus(sticker.status);
    setFileUrl(sticker.fileUrl);
    setActiveTab("upload");
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("Delete or disable this sticker?")) {
      await stickerService.deleteSticker(id);
      await loadStickers();
      onStickersChanged();
    }
  };

  // ── Bulk Actions ───────────────────────────────────────────────────────────
  const handleSelectAll = () => {
    if (selectedIds.size === pagedStickers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pagedStickers.map((s) => s.id)));
    }
  };

  const handleBulkStatusChange = async (newStatus: StickerStatus) => {
    if (selectedIds.size === 0) return;
    setIsBulkActioning(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => stickerService.updateSticker(id, { status: newStatus }))
      );
      await loadStickers();
      onStickersChanged();
      setSelectedIds(new Set());
      setFeedback({ type: "success", message: `${selectedIds.size} stickers set to ${newStatus}.` });
    } catch {
      setFeedback({ type: "error", message: "Bulk action failed." });
    } finally {
      setIsBulkActioning(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete/disable ${selectedIds.size} stickers?`)) return;
    setIsBulkActioning(true);
    try {
      await Promise.all(Array.from(selectedIds).map((id) => stickerService.deleteSticker(id)));
      await loadStickers();
      onStickersChanged();
      setSelectedIds(new Set());
    } finally {
      setIsBulkActioning(false);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: allStickers.length,
    published: allStickers.filter((s) => s.status === "published").length,
    draft: allStickers.filter((s) => s.status === "draft").length,
    disabled: allStickers.filter((s) => s.status === "disabled").length,
    withAttribution: allStickers.filter((s) => s.attributionRequired).length,
  }), [allStickers]);

  const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "upload", label: editingSticker ? "Edit Sticker" : "Add Sticker", icon: <Upload size={13} /> },
    { id: "bulk", label: "Bulk Import", icon: <FileText size={13} /> },
    { id: "manage", label: `Assets (${stats.total})`, icon: <Database size={13} /> },
    { id: "sources", label: "Sources", icon: <Globe size={13} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 text-white font-sans animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl h-[88vh] rounded-2xl border border-white/[0.1] bg-[#111115] shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#15161c] px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide">Sticker Library — Admin Panel</h2>
              <p className="text-[11px] text-zinc-400">
                {stats.published.toLocaleString()} published · {stats.withAttribution} require attribution
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition">
            <X size={18} />
          </button>
        </div>

        {/* ── Stat pills ── */}
        <div className="flex gap-3 px-6 py-3 border-b border-white/[0.06] bg-[#13141a] shrink-0">
          {[
            { label: "Total", value: stats.total, color: "text-zinc-300" },
            { label: "Published", value: stats.published, color: "text-emerald-400" },
            { label: "Draft", value: stats.draft, color: "text-amber-400" },
            { label: "Disabled", value: stats.disabled, color: "text-rose-400" },
            { label: "Attribution req.", value: stats.withAttribution, color: "text-cyan-400" },
          ].map((pill) => (
            <div key={pill.label} className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1">
              <span className={`text-sm font-bold ${pill.color}`}>{pill.value.toLocaleString()}</span>
              <span className="text-[10px] text-zinc-500">{pill.label}</span>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-white/[0.08] bg-[#13141a] px-6 shrink-0">
          {TABS.map((tab) => (
            <button key={tab.id} type="button"
              onClick={() => { setActiveTab(tab.id); if (tab.id !== "upload") setEditingSticker(null); }}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-medium transition ${
                activeTab === tab.id
                  ? "border-cyan-400 text-cyan-300 bg-white/[0.02]"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}>
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">

          {/* Feedback banner */}
          {feedback && (
            <div className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs ${
              feedback.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-rose-500/40 bg-rose-500/10 text-rose-300"
            }`}>
              {feedback.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{feedback.message}</span>
              <button className="ml-auto text-zinc-400 hover:text-white" onClick={() => setFeedback(null)}>
                <X size={13} />
              </button>
            </div>
          )}

          {/* ═══ TAB 1: SINGLE ADD / EDIT ═══ */}
          {activeTab === "upload" && (
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">Sticker Name *</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Neon Cyber Shield"
                    className="w-full rounded-xl border border-white/[0.1] bg-[#16171f] px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-500/60" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">Category *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.1] bg-[#16171f] px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/60">
                    {STICKER_CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-[#181920]">{cat.emoji} {cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">Subcategory (optional)</label>
                  <input type="text" value={subcategory} onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="e.g. badges, icons, arrows"
                    className="w-full rounded-xl border border-white/[0.1] bg-[#16171f] px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-500/60" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">Tags (comma separated)</label>
                  <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. neon, blue, badge, shield"
                    className="w-full rounded-xl border border-white/[0.1] bg-[#16171f] px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-500/60" />
                </div>
              </div>

              {/* License Section */}
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                  <ShieldCheck size={16} />
                  <span>License & Governance</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-300 mb-1">License Type *</label>
                    <select value={license} onChange={(e) => setLicense(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.1] bg-[#16171f] px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/60">
                      <option value="CC0 1.0 Universal">CC0 1.0 Universal (Public Domain)</option>
                      <option value="ISC License">ISC License</option>
                      <option value="MIT License">MIT License</option>
                      <option value="Apache 2.0">Apache 2.0</option>
                      <option value="CC-BY 4.0 International">Creative Commons Attribution 4.0</option>
                      <option value="Falcon Partner Licensed">Falcon Partner Licensed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-300 mb-1">Author / Creator</label>
                    <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Lucide Contributors"
                      className="w-full rounded-xl border border-white/[0.1] bg-[#16171f] px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-500/60" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-300 mb-1">Source Repository</label>
                    <input type="text" value={source} onChange={(e) => setSource(e.target.value)}
                      placeholder="e.g. Lucide Vector Project"
                      className="w-full rounded-xl border border-white/[0.1] bg-[#16171f] px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-500/60" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-300 mb-1">Source URL</label>
                    <input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-white/[0.1] bg-[#16171f] px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-500/60" />
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input type="checkbox" checked={attributionRequired}
                      onChange={(e) => setAttributionRequired(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-800 text-cyan-500 focus:ring-cyan-500" />
                    <span>Requires creator attribution</span>
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-400">Publish Status:</span>
                    <select value={status} onChange={(e) => setStatus(e.target.value as StickerStatus)}
                      className="rounded-lg border border-white/[0.1] bg-[#16171f] px-2 py-1 text-xs text-white">
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">SVG Markup (sanitized on submission)</label>
                <textarea rows={4} value={svgContent} onChange={(e) => setSvgContent(e.target.value)}
                  placeholder="<svg viewBox='0 0 200 200'>...</svg>"
                  className="w-full rounded-xl border border-white/[0.1] bg-[#16171f] p-3 text-xs text-cyan-100 font-mono placeholder-zinc-600 outline-none focus:border-cyan-500/60" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setEditingSticker(null); onClose(); }}
                  className="rounded-xl border border-white/[0.1] px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.05] transition">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2 text-xs font-semibold text-white shadow-[0_0_12px_rgba(6,182,212,0.3)] hover:bg-cyan-400 transition disabled:opacity-50">
                  <Plus size={14} />
                  <span>{isSubmitting ? "Processing..." : editingSticker ? "Save Changes" : "Ingest & Publish"}</span>
                </button>
              </div>
            </form>
          )}

          {/* ═══ TAB 2: BULK IMPORT ═══ */}
          {activeTab === "bulk" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-zinc-400">
                  Import multiple verified sticker records in JSON or CSV format.
                </div>
                <div className="flex rounded-lg border border-white/[0.1] bg-[#16171f] p-0.5">
                  {(["json", "csv"] as const).map((fmt) => (
                    <button key={fmt} type="button" onClick={() => setBulkFormat(fmt)}
                      className={`rounded-md px-3 py-1 text-xs font-medium uppercase transition ${
                        bulkFormat === fmt ? "bg-cyan-500/20 text-cyan-300" : "text-zinc-400"
                      }`}>{fmt}</button>
                  ))}
                </div>
              </div>
              <textarea rows={10} value={bulkInput} onChange={(e) => setBulkInput(e.target.value)}
                placeholder={bulkFormat === "json"
                  ? `[\n  {\n    "name": "Business Arrow",\n    "fileUrl": "https://...",\n    "category": "business",\n    "tags": ["business", "arrow"],\n    "author": "Contributor",\n    "source": "Open Asset",\n    "sourceUrl": "https://...",\n    "license": "CC0",\n    "attributionRequired": false\n  }\n]`
                  : `name,fileUrl,category,tags,author,source,sourceUrl,license,attributionRequired\n"Business Arrow","https://...","business","arrow;growth","Jane Doe","SVG Repo","https://...","CC0","false"`
                }
                className="w-full rounded-xl border border-white/[0.1] bg-[#16171f] p-3 text-xs text-cyan-100 font-mono placeholder-zinc-600 outline-none focus:border-cyan-500/60" />

              {bulkResults && (
                <div className="rounded-xl border border-white/[0.1] bg-[#161720] p-4 text-xs space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-400">Total: {bulkResults.total}</span>
                    <span className="text-emerald-400 font-semibold">Success: {bulkResults.success}</span>
                    {bulkResults.failed > 0 && (
                      <span className="text-rose-400 font-semibold">Failed: {bulkResults.failed}</span>
                    )}
                  </div>
                  {bulkResults.errors.length > 0 && (
                    <div className="max-h-28 overflow-y-auto text-rose-300 space-y-1 pt-1 font-mono text-[11px]">
                      {bulkResults.errors.map((err, i) => <div key={i}>{err}</div>)}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <button type="button" disabled={isSubmitting || !bulkInput.trim()} onClick={handleBulkImport}
                  className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-cyan-400 transition disabled:opacity-50">
                  <RefreshCw size={14} className={isSubmitting ? "animate-spin" : ""} />
                  <span>{isSubmitting ? "Importing..." : "Execute Bulk Import"}</span>
                </button>
              </div>
            </div>
          )}

          {/* ═══ TAB 3: ASSET CATALOG ═══ */}
          {activeTab === "manage" && (
            <div className="space-y-3">
              {/* Filters bar */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input type="text" value={manageSearch} onChange={(e) => { setManageSearch(e.target.value); setManagePage(0); }}
                    placeholder="Search assets..."
                    className="pl-7 pr-3 py-1.5 rounded-lg border border-white/[0.1] bg-[#16171f] text-xs text-white placeholder-zinc-600 outline-none focus:border-cyan-500/40 w-44" />
                </div>

                <select value={manageFilter} onChange={(e) => { setManageFilter(e.target.value as any); setManagePage(0); }}
                  className="rounded-lg border border-white/[0.1] bg-[#16171f] px-2 py-1.5 text-xs text-white outline-none">
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="disabled">Disabled</option>
                </select>

                <select value={manageCategoryFilter} onChange={(e) => { setManageCategoryFilter(e.target.value); setManagePage(0); }}
                  className="rounded-lg border border-white/[0.1] bg-[#16171f] px-2 py-1.5 text-xs text-white outline-none">
                  <option value="all">All Categories</option>
                  {STICKER_CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>

                <select value={manageSourceFilter} onChange={(e) => { setManageSourceFilter(e.target.value); setManagePage(0); }}
                  className="rounded-lg border border-white/[0.1] bg-[#16171f] px-2 py-1.5 text-xs text-white outline-none max-w-[160px]">
                  <option value="all">All Sources</option>
                  {uniqueSources.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>

                <span className="ml-auto text-[11px] text-zinc-500">
                  {filteredManageStickers.length.toLocaleString()} asset{filteredManageStickers.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Bulk action bar */}
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2">
                  <span className="text-xs text-cyan-300 font-medium">{selectedIds.size} selected</span>
                  <div className="flex gap-1.5 ml-auto">
                    {(["published", "draft", "disabled"] as StickerStatus[]).map((st) => (
                      <button key={st} type="button" disabled={isBulkActioning} onClick={() => handleBulkStatusChange(st)}
                        className="rounded-lg border border-white/[0.1] px-2.5 py-1 text-[11px] font-medium capitalize text-zinc-300 hover:text-white hover:bg-white/[0.08] transition disabled:opacity-50">
                        Set {st}
                      </button>
                    ))}
                    <button type="button" disabled={isBulkActioning} onClick={handleBulkDelete}
                      className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-400 hover:bg-rose-500/20 transition disabled:opacity-50">
                      Delete
                    </button>
                    <button type="button" onClick={() => setSelectedIds(new Set())}
                      className="rounded-lg p-1 text-zinc-500 hover:text-zinc-300 transition">
                      <X size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="rounded-xl border border-white/[0.08] bg-[#14151c] overflow-hidden">
                {/* Table header */}
                <div className="flex items-center gap-3 px-3 py-2 border-b border-white/[0.06] text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  <button type="button" onClick={handleSelectAll} className="text-zinc-400 hover:text-cyan-400 transition shrink-0">
                    {selectedIds.size === pagedStickers.length && pagedStickers.length > 0
                      ? <CheckSquare size={14} />
                      : <Square size={14} />}
                  </button>
                  <span className="w-10 shrink-0">Icon</span>
                  <span className="flex-1">Name</span>
                  <span className="w-20 shrink-0">Category</span>
                  <span className="w-20 shrink-0">Source</span>
                  <span className="w-16 shrink-0">Status</span>
                  <span className="w-16 shrink-0 text-right">Actions</span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-white/[0.04] max-h-[42vh] overflow-y-auto">
                  {pagedStickers.length === 0 ? (
                    <div className="py-10 text-center text-xs text-zinc-500">No assets match the current filters.</div>
                  ) : (
                    pagedStickers.map((sticker) => (
                      <div key={sticker.id}
                        className={`flex items-center gap-3 px-3 py-2 hover:bg-white/[0.02] transition ${
                          selectedIds.has(sticker.id) ? "bg-cyan-500/[0.04]" : ""
                        }`}>
                        <button type="button"
                          onClick={() => {
                            const next = new Set(selectedIds);
                            if (next.has(sticker.id)) next.delete(sticker.id); else next.add(sticker.id);
                            setSelectedIds(next);
                          }}
                          className="text-zinc-500 hover:text-cyan-400 transition shrink-0">
                          {selectedIds.has(sticker.id) ? <CheckSquare size={14} className="text-cyan-400" /> : <Square size={14} />}
                        </button>

                        <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg border border-white/[0.08] bg-black/40 p-1">
                          <img src={sticker.fileUrl} alt={sticker.name} className="h-8 w-8 object-contain" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-white truncate">{sticker.name}</div>
                          <div className="text-[10px] text-zinc-500 truncate">{sticker.license}{sticker.attributionRequired ? " · attribution req." : ""}</div>
                        </div>

                        <span className="w-20 shrink-0 text-[11px] text-zinc-400 capitalize truncate">{sticker.category}</span>

                        <span className="w-20 shrink-0 text-[11px] text-zinc-500 truncate"
                          title={sticker.source}>{sticker.source.split(" ").slice(0, 2).join(" ")}</span>

                        <span className={`w-16 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase text-center ${
                          sticker.status === "published" ? "bg-emerald-500/15 text-emerald-400" :
                          sticker.status === "draft" ? "bg-amber-500/15 text-amber-400" :
                          "bg-rose-500/15 text-rose-400"
                        }`}>{sticker.status}</span>

                        <div className="w-16 shrink-0 flex items-center justify-end gap-1">
                          <button type="button" onClick={() => handleEditClick(sticker)}
                            className="rounded-lg p-1 text-zinc-500 hover:text-cyan-400 hover:bg-white/[0.06] transition"
                            title="Edit"><Edit2 size={12} /></button>
                          <button type="button" onClick={() => handleDeleteClick(sticker.id)}
                            className="rounded-lg p-1 text-zinc-500 hover:text-rose-400 hover:bg-white/[0.06] transition"
                            title="Delete"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pagination */}
              {totalManagePages > 1 && (
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Page {managePage + 1} of {totalManagePages}</span>
                  <div className="flex gap-1.5">
                    <button type="button" disabled={managePage === 0} onClick={() => setManagePage(p => p - 1)}
                      className="rounded-lg p-1.5 hover:bg-white/[0.06] disabled:opacity-30 transition">
                      <ChevronLeft size={14} />
                    </button>
                    <button type="button" disabled={managePage >= totalManagePages - 1} onClick={() => setManagePage(p => p + 1)}
                      className="rounded-lg p-1.5 hover:bg-white/[0.06] disabled:opacity-30 transition">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ TAB 4: SOURCES REGISTRY ═══ */}
          {activeTab === "sources" && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-400">
                Verified source registry. Only enabled sources with commercial redistribution rights are used during ingestion.
              </p>
              <div className="space-y-2">
                {STICKER_SOURCES.map((src) => (
                  <div key={src.id}
                    className={`rounded-xl border p-4 transition ${
                      src.enabled
                        ? "border-white/[0.1] bg-[#14151c]"
                        : "border-rose-500/20 bg-rose-500/[0.03] opacity-70"
                    }`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                        src.enabled ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400" : "border-rose-500/20 bg-rose-500/10 text-rose-400"
                      }`}>
                        {src.enabled ? <Globe size={16} /> : <Lock size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-white">{src.name}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                            src.enabled ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                          }`}>{src.enabled ? "ENABLED" : "DISABLED"}</span>
                          {src.commercialUse && (
                            <span className="rounded-full bg-cyan-500/15 text-cyan-400 px-2 py-0.5 text-[9px] font-semibold">Commercial ✓</span>
                          )}
                          {src.redistribution && (
                            <span className="rounded-full bg-indigo-500/15 text-indigo-400 px-2 py-0.5 text-[9px] font-semibold">Redistribution ✓</span>
                          )}
                          {src.attributionRequired && (
                            <span className="rounded-full bg-amber-500/15 text-amber-400 px-2 py-0.5 text-[9px] font-semibold">Attribution Required</span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-1">{src.description}</div>
                        <div className="flex items-center gap-4 mt-2 text-[10px]">
                          <span className="text-zinc-500">
                            License: <span className="text-zinc-300 font-medium">{src.license}</span>
                          </span>
                          <a href={src.licenseUrl} target="_blank" rel="noopener noreferrer"
                            className="text-cyan-500 hover:text-cyan-300 transition">
                            View License →
                          </a>
                          <a href={src.url} target="_blank" rel="noopener noreferrer"
                            className="text-zinc-500 hover:text-zinc-300 transition">
                            Source →
                          </a>
                        </div>
                        {src.attributionText && (
                          <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.05] px-3 py-2 text-[10px] text-amber-300/80 font-mono">
                            {src.attributionText}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
