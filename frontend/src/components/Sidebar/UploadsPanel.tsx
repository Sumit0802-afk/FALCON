import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Film,
  Music,
  FileText,
  Plus,
  Search,
  X,
  Folder,
  FolderPlus,
  Heart,
  Clock,
  Trash2,
  Edit2,
  Copy,
  ChevronRight,
  MoreVertical,
  AlertCircle,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { Asset, AssetFolder } from "@/types/asset";
import { assetService } from "@/services/assetService";

interface UploadItemProgress {
  id: string;
  file: File;
  name: string;
  progress: number;
  status: "uploading" | "completed" | "error" | "cancelled";
  errorMessage?: string;
  abortController?: AbortController;
}

interface UploadsPanelProps {
  onAddImageToCanvas: (src: string, name?: string) => void;
  onAddVideoToCanvas?: (src: string, name?: string) => void;
}

type UploadTab = "my-uploads" | "recent" | "favorites" | "folders";

export function UploadsPanel({
  onAddImageToCanvas,
  onAddVideoToCanvas,
}: UploadsPanelProps) {
  const [activeTab, setActiveTab] = useState<UploadTab>("my-uploads");
  const [uploads, setUploads] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<AssetFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadItemProgress[]>([]);
  
  // Modals & Menu States
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [activeMenuAssetId, setActiveMenuAssetId] = useState<string | null>(null);
  const [moveModalAsset, setMoveModalAsset] = useState<Asset | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load assets & folders on mount
  const refreshData = () => {
    setUploads(assetService.getUploads());
    setFolders(assetService.getFolders());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Filtered assets based on tab, folder, and search
  const filteredAssets = useMemo(() => {
    let list = [...uploads];

    if (activeTab === "favorites") {
      const favIds = new Set(assetService.getFavoriteIds());
      list = list.filter((a) => favIds.has(a.id));
    } else if (activeTab === "recent") {
      const recentIds = assetService.getRecentIds();
      const orderMap = new Map(recentIds.map((id, idx) => [id, idx]));
      list = list
        .filter((a) => orderMap.has(a.id))
        .sort((a, b) => orderMap.get(a.id)! - orderMap.get(b.id)!);
    } else if (activeTab === "folders" && selectedFolderId) {
      list = list.filter((a) => a.folderId === selectedFolderId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [uploads, activeTab, selectedFolderId, searchQuery]);

  // Handle files selected via file input or drag-and-drop
  const handleFiles = (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (!files.length) return;

    files.forEach((file) => {
      startUpload(file);
    });
  };

  const startUpload = (file: File) => {
    const uploadId = `upl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const abortCtrl = new AbortController();

    const newProgressItem: UploadItemProgress = {
      id: uploadId,
      file,
      name: file.name,
      progress: 15,
      status: "uploading",
      abortController: abortCtrl,
    };

    setUploadQueue((prev) => [newProgressItem, ...prev]);

    // Validation
    const allowed = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/svg+xml",
      "image/gif",
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/ogg",
      "application/pdf",
    ];

    if (!allowed.includes(file.type.toLowerCase())) {
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === uploadId
            ? { ...item, status: "error", errorMessage: "Unsupported format" }
            : item
        )
      );
      return;
    }

    // Read and upload file
    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 70);
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === uploadId ? { ...item, progress: Math.max(item.progress, pct) } : item
          )
        );
      }
    };

    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      if (!base64Data) return;

      try {
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === uploadId ? { ...item, progress: 85 } : item
          )
        );

        const response = await fetch("/api/uploads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            base64Data,
            folderId: selectedFolderId,
          }),
          signal: abortCtrl.signal,
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Upload failed");
        }

        const data = await response.json();
        const createdAsset = data.asset as Asset;

        // Persist to local asset service
        assetService.addUpload(createdAsset);
        refreshData();

        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === uploadId ? { ...item, progress: 100, status: "completed" } : item
          )
        );

        // Remove from queue after delay
        setTimeout(() => {
          setUploadQueue((prev) => prev.filter((item) => item.id !== uploadId));
        }, 2200);
      } catch (err: any) {
        if (err.name === "AbortError") {
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.id === uploadId ? { ...item, status: "cancelled", errorMessage: "Cancelled" } : item
            )
          );
        } else {
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.id === uploadId
                ? { ...item, status: "error", errorMessage: err.message || "Failed" }
                : item
            )
          );
        }
      }
    };

    reader.readAsDataURL(file);
  };

  const cancelUpload = (id: string) => {
    const item = uploadQueue.find((q) => q.id === id);
    if (item?.abortController) {
      item.abortController.abort();
    }
    setUploadQueue((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "cancelled" } : q))
    );
  };

  const retryUpload = (item: UploadItemProgress) => {
    setUploadQueue((prev) => prev.filter((q) => q.id !== item.id));
    startUpload(item.file);
  };

  // Drag and Drop Zone
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Asset Actions
  const handleAddAssetToCanvas = (asset: Asset) => {
    assetService.recordRecent(asset.id);
    if (asset.type === "video" && onAddVideoToCanvas) {
      onAddVideoToCanvas(asset.fileUrl, asset.name);
    } else {
      onAddImageToCanvas(asset.fileUrl, asset.name);
    }
  };

  const handleDeleteAsset = (id: string) => {
    assetService.deleteAsset(id);
    refreshData();
    setActiveMenuAssetId(null);
  };

  const handleToggleFav = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    assetService.toggleFavorite(id);
    refreshData();
  };

  const handleDuplicate = (id: string) => {
    assetService.duplicateAsset(id);
    refreshData();
    setActiveMenuAssetId(null);
  };

  const handleStartRename = (asset: Asset) => {
    setEditingAssetId(asset.id);
    setRenameValue(asset.name);
    setActiveMenuAssetId(null);
  };

  const handleSaveRename = (id: string) => {
    if (renameValue.trim()) {
      assetService.updateAsset(id, { name: renameValue.trim() });
      refreshData();
    }
    setEditingAssetId(null);
  };

  // Folder Actions
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    assetService.createFolder(newFolderName.trim());
    setNewFolderName("");
    setIsCreatingFolder(false);
    refreshData();
  };

  const handleDeleteFolder = (folderId: string) => {
    assetService.deleteFolder(folderId);
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }
    refreshData();
  };

  const handleMoveAssetToFolder = (targetFolderId: string | null) => {
    if (moveModalAsset) {
      assetService.moveToFolder(moveModalAsset.id, targetFolderId);
      setMoveModalAsset(null);
      refreshData();
    }
  };

  return (
    <aside
      className="flex h-full w-[340px] shrink-0 flex-col border-r border-white/[0.08] bg-[#0c0c0e] text-white select-none relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/mp4,video/quicktime,video/webm,audio/mpeg,audio/wav,application/pdf"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
        className="hidden"
      />

      {/* DRAG & DROP OVERLAY */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-cyan-950/80 backdrop-blur-sm border-2 border-dashed border-cyan-400 p-6 text-center animate-in fade-in duration-150">
          <UploadCloud size={48} className="text-cyan-400 mb-3 animate-bounce" />
          <h3 className="text-sm font-semibold text-white">Drop files to upload</h3>
          <p className="text-[11px] text-cyan-200 mt-1">PNG, JPG, WEBP, SVG, MP4, MP3, WAV, PDF</p>
        </div>
      )}

      {/* HEADER */}
      <div className="border-b border-white/[0.08] bg-[#111114] p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <UploadCloud size={18} />
            </div>
            <div>
              <h2 className="text-xs font-semibold tracking-wide text-white">Asset Uploads</h2>
              <p className="text-[10px] text-zinc-400">Images, videos, audio & media</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400 active:scale-95"
          >
            <Plus size={14} />
            <span>Upload</span>
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your uploads..."
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

        {/* SUB-TABS: My Uploads / Recent / Favorites / Folders */}
        <div className="flex items-center gap-1 rounded-lg bg-[#18191f] p-1 border border-white/[0.04]">
          <button
            type="button"
            onClick={() => {
              setActiveTab("my-uploads");
              setSelectedFolderId(null);
            }}
            className={`flex-1 rounded-md py-1 text-[11px] font-medium transition ${
              activeTab === "my-uploads"
                ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("recent")}
            className={`flex-1 rounded-md py-1 text-[11px] font-medium transition ${
              activeTab === "recent"
                ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Recent
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("favorites")}
            className={`flex-1 rounded-md py-1 text-[11px] font-medium transition ${
              activeTab === "favorites"
                ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Favorites
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("folders")}
            className={`flex-1 rounded-md py-1 text-[11px] font-medium transition ${
              activeTab === "folders"
                ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Folders
          </button>
        </div>
      </div>

      {/* UPLOAD PROGRESS QUEUE */}
      {uploadQueue.length > 0 && (
        <div className="border-b border-white/[0.08] bg-[#121318] p-3 space-y-2 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between text-[11px] font-medium text-zinc-300">
            <span>Uploading {uploadQueue.length} item(s)...</span>
          </div>
          {uploadQueue.map((item) => (
            <div key={item.id} className="rounded-lg border border-white/[0.06] bg-[#181920] p-2 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="truncate max-w-[180px] font-medium text-zinc-200">{item.name}</span>
                <div className="flex items-center gap-1.5">
                  {item.status === "uploading" && (
                    <span className="text-cyan-400 font-mono">{item.progress}%</span>
                  )}
                  {item.status === "completed" && (
                    <CheckCircle size={13} className="text-emerald-400" />
                  )}
                  {item.status === "error" && (
                    <div className="flex items-center gap-1 text-rose-400">
                      <AlertCircle size={13} />
                      <button
                        type="button"
                        onClick={() => retryUpload(item)}
                        className="hover:underline text-cyan-400"
                        title="Retry"
                      >
                        <RefreshCw size={11} />
                      </button>
                    </div>
                  )}
                  {item.status === "uploading" && (
                    <button
                      type="button"
                      onClick={() => cancelUpload(item.id)}
                      className="text-zinc-500 hover:text-rose-400"
                      title="Cancel"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-200 ${
                    item.status === "error"
                      ? "bg-rose-500"
                      : item.status === "completed"
                      ? "bg-emerald-500"
                      : "bg-cyan-400"
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FOLDERS VIEW (When activeTab === "folders") */}
      {activeTab === "folders" && (
        <div className="border-b border-white/[0.08] bg-[#101115] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Folders ({folders.length})
            </span>
            <button
              type="button"
              onClick={() => setIsCreatingFolder(true)}
              className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
            >
              <FolderPlus size={13} />
              <span>New</span>
            </button>
          </div>

          {/* New folder input */}
          {isCreatingFolder && (
            <div className="flex items-center gap-1.5 mt-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name..."
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                className="flex-1 rounded-md border border-cyan-500/50 bg-[#16171b] px-2 py-1 text-xs text-white outline-none"
              />
              <button
                type="button"
                onClick={handleCreateFolder}
                className="rounded bg-cyan-500 px-2 py-1 text-xs font-semibold text-slate-950"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingFolder(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Folders List */}
          <div className="flex flex-col gap-1 max-h-36 overflow-y-auto no-scrollbar">
            {folders.map((f) => {
              const isSelected = selectedFolderId === f.id;
              const count = uploads.filter((a) => a.folderId === f.id).length;
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFolderId(isSelected ? null : f.id)}
                  className={`group flex items-center justify-between rounded-lg px-2.5 py-1.5 cursor-pointer text-xs transition ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-zinc-300 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Folder size={14} className={isSelected ? "text-cyan-400" : "text-zinc-400"} />
                    <span className="truncate">{f.name}</span>
                    <span className="text-[10px] text-zinc-500">({count})</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(f.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ASSET GRID / CONTENT */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-zinc-800">
        <div className="flex items-center justify-between mb-2.5 text-[11px] text-zinc-400">
          <span>
            {activeTab === "folders" && selectedFolderId
              ? `Assets in folder (${filteredAssets.length})`
              : `${filteredAssets.length} Assets`}
          </span>
          {selectedFolderId && (
            <button
              type="button"
              onClick={() => setSelectedFolderId(null)}
              className="text-cyan-400 hover:underline text-[10px]"
            >
              View all
            </button>
          )}
        </div>

        {filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] p-8 text-center mt-4">
            <UploadCloud size={32} className="text-zinc-600 mb-2.5" />
            <p className="text-xs font-semibold text-zinc-300">No assets found</p>
            <p className="text-[10px] text-zinc-500 mt-1 max-w-[200px]">
              Drag and drop your photos, videos, or audio here, or click upload.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] px-3 py-1.5 text-xs text-cyan-400 font-medium transition"
            >
              Browse files
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredAssets.map((asset) => {
              const isFavorite = assetService.getFavoriteIds().includes(asset.id);
              const isMenuOpen = activeMenuAssetId === asset.id;

              return (
                <div
                  key={asset.id}
                  className="group relative flex flex-col overflow-hidden rounded-lg border border-white/[0.08] bg-[#14151a] transition hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-950/20"
                >
                  {/* Thumbnail / Media Surface */}
                  <div
                    onClick={() => handleAddAssetToCanvas(asset)}
                    className="relative aspect-square w-full cursor-pointer overflow-hidden bg-black/40 flex items-center justify-center"
                  >
                    {asset.type === "video" ? (
                      <>
                        {asset.thumbnailUrl ? (
                          <img
                            src={asset.thumbnailUrl}
                            alt={asset.name}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-zinc-900">
                            <Film size={28} className="text-cyan-400" />
                          </div>
                        )}
                        <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1 py-0.5 text-[9px] font-mono text-cyan-300 flex items-center gap-1">
                          <Film size={9} />
                          <span>Video</span>
                        </span>
                      </>
                    ) : asset.type === "audio" ? (
                      <div className="flex flex-col items-center justify-center p-3 text-center">
                        <Music size={28} className="text-cyan-400 mb-1" />
                        <span className="text-[10px] text-zinc-400 line-clamp-1">{asset.name}</span>
                      </div>
                    ) : asset.type === "pdf" ? (
                      <div className="flex flex-col items-center justify-center p-3 text-center">
                        <FileText size={28} className="text-rose-400 mb-1" />
                        <span className="text-[10px] text-zinc-400 line-clamp-1">PDF Doc</span>
                      </div>
                    ) : (
                      <img
                        src={asset.fileUrl}
                        alt={asset.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    )}

                    {/* Hover Quick Add Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-slate-950 shadow-md">
                        <Plus size={16} strokeWidth={2.5} />
                      </div>
                    </div>

                    {/* Top Action Buttons (Fav & Menu) */}
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-20">
                      <button
                        type="button"
                        onClick={(e) => handleToggleFav(e, asset.id)}
                        className={`flex h-6 w-6 items-center justify-center rounded-full backdrop-blur-md transition ${
                          isFavorite
                            ? "bg-rose-500 text-white"
                            : "bg-black/60 text-white/70 opacity-0 group-hover:opacity-100 hover:text-white"
                        }`}
                        title={isFavorite ? "Remove favorite" : "Add to favorites"}
                      >
                        <Heart size={11} fill={isFavorite ? "currentColor" : "none"} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuAssetId(isMenuOpen ? null : asset.id);
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/70 opacity-0 group-hover:opacity-100 hover:text-white backdrop-blur-md transition"
                        title="More options"
                      >
                        <MoreVertical size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Context Menu Dropdown */}
                  {isMenuOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-1 top-8 z-30 w-36 rounded-lg border border-white/[0.1] bg-[#1a1b22] py-1 shadow-2xl backdrop-blur-md text-[11px]"
                    >
                      <button
                        type="button"
                        onClick={() => handleAddAssetToCanvas(asset)}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                      >
                        <Plus size={12} />
                        <span>Add to Canvas</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartRename(asset)}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                      >
                        <Edit2 size={12} />
                        <span>Rename</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMoveModalAsset(asset);
                          setActiveMenuAssetId(null);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                      >
                        <Folder size={12} />
                        <span>Move to Folder</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(asset.id)}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                      >
                        <Copy size={12} />
                        <span>Duplicate</span>
                      </button>
                      <div className="my-1 border-t border-white/[0.08]" />
                      <button
                        type="button"
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-rose-400 hover:bg-rose-500/20"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}

                  {/* Bottom details / inline rename */}
                  <div className="p-1.5 bg-[#121317]">
                    {editingAssetId === asset.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveRename(asset.id)}
                          autoFocus
                          className="w-full rounded border border-cyan-500/50 bg-[#16171b] px-1 py-0.5 text-[10px] text-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(asset.id)}
                          className="text-[10px] text-cyan-400 hover:underline"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="truncate text-zinc-300 font-medium" title={asset.name}>
                          {asset.name}
                        </span>
                        <span className="uppercase text-[8px] text-zinc-500 font-mono">
                          {asset.type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MOVE TO FOLDER MODAL */}
      {moveModalAsset && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full rounded-xl border border-white/[0.1] bg-[#16171d] p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-white">Move to Folder</h4>
              <button
                type="button"
                onClick={() => setMoveModalAsset(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 truncate">
              Select destination for &quot;{moveModalAsset.name}&quot;:
            </p>
            <div className="max-h-40 overflow-y-auto space-y-1">
              <button
                type="button"
                onClick={() => handleMoveAssetToFolder(null)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.08]"
              >
                <Folder size={14} className="text-zinc-500" />
                <span>Root (No Folder)</span>
              </button>
              {folders.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleMoveAssetToFolder(f.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.08]"
                >
                  <Folder size={14} className="text-cyan-400" />
                  <span>{f.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
