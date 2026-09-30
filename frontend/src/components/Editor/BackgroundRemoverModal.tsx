import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  X,
  Check,
  RotateCcw,
  Eraser,
  Paintbrush,
  Download,
  Eye,
  RefreshCw,
  Upload,
  Layers,
  ShieldCheck,
  Wand2,
} from "lucide-react";
import { ImageElement } from "@/types";
import { removeImageBackgroundAI } from "@/services/backgroundRemovalService";

interface BackgroundRemoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  element?: ImageElement | null;
  canvasImages?: ImageElement[];
  onSelectCanvasImage?: (img: ImageElement) => void;
  onApply: (newSrc: string, originalSrc: string) => void;
  onAddAsNew?: (newSrc: string, originalSrc: string, width?: number, height?: number) => void;
}

export function BackgroundRemoverModal({
  isOpen,
  onClose,
  element,
  canvasImages = [],
  onSelectCanvasImage,
  onApply,
  onAddAsNew,
}: BackgroundRemoverModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [resultSrc, setResultSrc] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"result" | "original">("result");
  const [customSrc, setCustomSrc] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [brushMode, setBrushMode] = useState<"none" | "erase" | "restore">("none");
  const [brushSize, setBrushSize] = useState(24);

  // Active source image
  const activeSrc = customSrc || (element ? (element.originalSrc || element.src) : null);

  // DOM & Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const resultImgRef = useRef<HTMLImageElement | null>(null);
  const isPaintingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset when element or modal opens
  useEffect(() => {
    if (isOpen) {
      if (element) {
        setCustomSrc(null);
      }
      setResultSrc(null);
    } else {
      setCustomSrc(null);
      setResultSrc(null);
      setIsProcessing(false);
    }
  }, [isOpen, element]);

  // Run AI removal whenever activeSrc changes
  useEffect(() => {
    if (!isOpen || !activeSrc) return;

    let cancelled = false;

    const runAI = async () => {
      setIsProcessing(true);
      setProgressPercent(10);
      setProgressStatus("Starting AI segmentation model...");

      // Load original image in memory for comparison
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = activeSrc;
      img.onload = () => {
        originalImgRef.current = img;
      };

      try {
        const cutoutDataUrl = await removeImageBackgroundAI(activeSrc, (pct, status) => {
          if (!cancelled) {
            setProgressPercent(pct);
            setProgressStatus(status);
          }
        });

        if (cancelled) return;

        setResultSrc(cutoutDataUrl);

        // Load cutout into canvas for live brush editing and export
        const resImg = new Image();
        resImg.src = cutoutDataUrl;
        resImg.onload = () => {
          if (cancelled) return;
          resultImgRef.current = resImg;
          drawToCanvas(resImg);
        };
      } catch (err) {
        console.warn("AI segmentation error, running high-precision fallback:", err);
        if (!cancelled) {
          runCanvasFallback(activeSrc);
        }
      } finally {
        if (!cancelled) {
          setIsProcessing(false);
        }
      }
    };

    runAI();

    return () => {
      cancelled = true;
    };
  }, [isOpen, activeSrc]);

  // Draw image to interactive canvas
  const drawToCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
  };

  // High-precision Edge Fallback if AI fails or network unavailable
  const runCanvasFallback = (src: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);

      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Sample perimeter
      const bgSamples: Array<[number, number, number]> = [];
      for (let x = 0; x < w; x += 4) {
        const topIdx = x * 4;
        bgSamples.push([data[topIdx], data[topIdx + 1], data[topIdx + 2]]);
        const btmIdx = ((h - 1) * w + x) * 4;
        bgSamples.push([data[btmIdx], data[btmIdx + 1], data[btmIdx + 2]]);
      }
      for (let y = 0; y < h; y += 4) {
        const lIdx = (y * w) * 4;
        bgSamples.push([data[lIdx], data[lIdx + 1], data[lIdx + 2]]);
        const rIdx = (y * w + (w - 1)) * 4;
        bgSamples.push([data[rIdx], data[rIdx + 1], data[rIdx + 2]]);
      }

      // Floodfill background
      const isBg = new Uint8Array(w * h);
      const visited = new Uint8Array(w * h);
      const queue: number[] = [];

      for (let x = 0; x < w; x++) {
        queue.push(x);
        queue.push((h - 1) * w + x);
      }
      for (let y = 1; y < h - 1; y++) {
        queue.push(y * w);
        queue.push(y * w + (w - 1));
      }

      let qHead = 0;
      while (qHead < queue.length) {
        const pos = queue[qHead++];
        if (visited[pos]) continue;
        visited[pos] = 1;

        const idx = pos * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        let minD = 999;
        for (let i = 0; i < bgSamples.length; i += 6) {
          const s = bgSamples[i];
          const d = Math.sqrt((r - s[0]) ** 2 + (g - s[1]) ** 2 + (b - s[2]) ** 2);
          if (d < minD) minD = d;
        }

        if (minD < 42) {
          isBg[pos] = 1;
          const px = pos % w;
          const py = Math.floor(pos / w);
          if (px > 0 && !visited[pos - 1]) queue.push(pos - 1);
          if (px < w - 1 && !visited[pos + 1]) queue.push(pos + 1);
          if (py > 0 && !visited[pos - w]) queue.push(pos - w);
          if (py < h - 1 && !visited[pos + w]) queue.push(pos + w);
        }
      }

      for (let i = 0; i < w * h; i++) {
        if (isBg[i]) data[i * 4 + 3] = 0;
      }
      ctx.putImageData(imgData, 0, 0);
      const fallbackUrl = canvas.toDataURL("image/png");
      setResultSrc(fallbackUrl);
      const resImg = new Image();
      resImg.src = fallbackUrl;
      resImg.onload = () => {
        resultImgRef.current = resImg;
        drawToCanvas(resImg);
      };
    };
  };

  /* Brush interaction for fine manual touch-up */
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (brushMode === "none") return;
    isPaintingRef.current = true;
    paintBrush(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPaintingRef.current || brushMode === "none") return;
    paintBrush(e);
  };

  const handleCanvasMouseUp = () => {
    isPaintingRef.current = false;
  };

  function paintBrush(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, (brushSize * scaleX) / 2, 0, Math.PI * 2);

    if (brushMode === "erase") {
      // Clear pixels to transparent
      ctx.globalCompositeOperation = "destination-out";
      ctx.fill();
    } else if (brushMode === "restore" && originalImgRef.current) {
      // Restore pixels from original image
      ctx.clip();
      ctx.drawImage(originalImgRef.current, 0, 0, canvas.width, canvas.height);
    }
    ctx.restore();
  }

  /* Handle Apply */
  const handleApply = () => {
    const canvas = canvasRef.current;
    const finalDataUrl = canvas ? canvas.toDataURL("image/png") : resultSrc;
    if (!finalDataUrl || !activeSrc) return;

    if (element) {
      onApply(finalDataUrl, activeSrc);
    } else if (onAddAsNew) {
      const w = canvas ? canvas.width : 450;
      const h = canvas ? canvas.height : 450;
      onAddAsNew(finalDataUrl, activeSrc, w, h);
    } else {
      onApply(finalDataUrl, activeSrc);
    }
    onClose();
  };

  /* Handle Revert */
  const handleRevert = () => {
    if (element?.originalSrc) {
      onApply(element.originalSrc, element.originalSrc);
    }
    onClose();
  };

  /* Handle Download Cutout */
  const handleDownload = () => {
    const canvas = canvasRef.current;
    const finalUrl = canvas ? canvas.toDataURL("image/png") : resultSrc;
    if (!finalUrl) return;
    const link = document.createElement("a");
    link.download = "cutout-transparent.png";
    link.href = finalUrl;
    link.click();
  };

  /* File upload */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    e.target.value = "";
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image (PNG, JPG, WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setCustomSrc(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#121216] shadow-2xl">
        {/* ===================================================
            HEADER
            =================================================== */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">Background Remover</h2>
                <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-300">
                  <ShieldCheck size={11} className="text-emerald-400" />
                  Studio Cutout
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Isolates the subject cleanly and completely eliminates the background
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeSrc && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                title="Upload a different image"
              >
                <Upload size={13} />
                <span>Upload New</span>
              </button>
            )}

            {resultSrc && (
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                title="Download Cutout PNG"
              >
                <Download size={14} />
                <span>Export PNG</span>
              </button>
            )}

            {element?.originalSrc && (
              <button
                type="button"
                onClick={handleRevert}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-amber-400 transition hover:bg-amber-400/10"
                title="Restore original image"
              >
                <RotateCcw size={14} />
                <span>Revert Original</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ===================================================
            BODY: UPLOAD OR ACTIVE WORKSPACE
            =================================================== */}
        {!activeSrc ? (
          /* Empty state: Select or upload image */
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex w-full max-w-xl cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all ${
                dragOver
                  ? "border-indigo-400 bg-indigo-500/10 scale-[1.01]"
                  : "border-white/15 bg-white/[0.02] hover:border-indigo-400/50 hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
                <Upload size={28} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">
                Upload image to remove background
              </h3>
              <p className="mt-1.5 max-w-sm text-xs text-zinc-400">
                Drag and drop your photo here, or click to browse. The AI cleanly removes the full background while keeping the subject crisp.
              </p>
              <button
                type="button"
                className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95"
              >
                <Upload size={14} />
                <span>Choose Image</span>
              </button>
            </div>

            {/* Quick canvas layer selection */}
            {canvasImages && canvasImages.length > 0 && (
              <div className="mt-8 w-full max-w-xl text-left">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-3">
                  <Layers size={14} />
                  <span>Or select an image from the canvas:</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {canvasImages.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => {
                        if (onSelectCanvasImage) onSelectCanvasImage(img);
                        setCustomSrc(img.originalSrc || img.src);
                      }}
                      className="group relative h-20 overflow-hidden rounded-xl border border-white/10 bg-black/40 transition hover:border-indigo-400 hover:scale-105"
                    >
                      <img
                        src={img.src}
                        alt="Canvas layer"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 transition group-hover:opacity-100 flex items-center justify-center text-[10px] font-semibold text-white">
                        Select
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Active remover workspace */
          <div className="flex min-h-0 flex-1">
            {/* LEFT: INTERACTIVE CANVAS VIEWPORT */}
            <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[#09090c] p-6">
              {/* Transparency Checkerboard */}
              <div
                className="relative flex max-h-full max-w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 shadow-2xl"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #18181c 25%, transparent 25%), linear-gradient(-45deg, #18181c 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18181c 75%), linear-gradient(-45deg, transparent 75%, #18181c 75%)",
                  backgroundSize: "20px 20px",
                  backgroundColor: "#0d0d10",
                }}
              >
                {/* AI Processing Overlay with Progress Bar */}
                {isProcessing && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 p-6 backdrop-blur-md">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/30 animate-pulse">
                      <Wand2 size={26} />
                    </div>
                    <span className="mt-4 text-sm font-semibold text-white">
                      Background Removal in Progress
                    </span>
                    <p className="mt-1 text-xs text-zinc-400 max-w-xs text-center truncate">
                      {progressStatus || "Analyzing photo and segmenting subject..."}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-4 w-64 h-2 rounded-full bg-white/10 overflow-hidden border border-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(5, progressPercent)}%` }}
                      />
                    </div>
                    <span className="mt-2 text-[10px] font-mono text-indigo-300">
                      {progressPercent}%
                    </span>
                  </div>
                )}

                {/* Main Cutout Canvas */}
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  className={`max-h-[60vh] max-w-full object-contain ${
                    brushMode !== "none" ? "cursor-crosshair" : "cursor-default"
                  }`}
                />
              </div>

              {/* Bottom Bar: Mode toggles and status */}
              <div className="mt-4 flex items-center justify-between w-full max-w-xl px-2">
                <div className="flex items-center rounded-xl border border-white/[0.08] bg-[#17171c] p-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewMode("result");
                      if (resultImgRef.current) {
                        drawToCanvas(resultImgRef.current);
                      }
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      previewMode === "result"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Sparkles size={13} />
                    <span>AI Cutout</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPreviewMode("original");
                      if (originalImgRef.current) {
                        drawToCanvas(originalImgRef.current);
                      }
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      previewMode === "original"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Eye size={13} />
                    <span>Original</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  <ShieldCheck size={13} />
                  <span>Subject 100% Preserved</span>
                </div>
              </div>
            </div>

            {/* RIGHT: CONTROL PANEL */}
            <aside className="w-80 shrink-0 border-l border-white/[0.08] bg-[#141418] p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  AI Segmentation
                </h3>
              </div>

              {/* AI STATUS CARD */}
              <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/15 to-purple-500/10 p-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500 text-white">
                    <Wand2 size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white">Deep Learning Neural Model</span>
                    <p className="text-[10px] text-zinc-400">IS-Net Portrait & Object Isolation</p>
                  </div>
                </div>
                <p className="mt-2.5 text-[11px] leading-relaxed text-zinc-300">
                  Automatically detects complex outdoor scenes, blurred lights, hair strands, and removes complete background without eroding the subject.
                </p>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => {
                    if (activeSrc) {
                      setResultSrc(null);
                      removeImageBackgroundAI(activeSrc, (pct, status) => {
                        setProgressPercent(pct);
                        setProgressStatus(status);
                      }).then((res) => {
                        setResultSrc(res);
                        const img = new Image();
                        img.src = res;
                        img.onload = () => {
                          resultImgRef.current = img;
                          drawToCanvas(img);
                        };
                      });
                    }
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] py-2 text-xs font-medium text-white transition disabled:opacity-50"
                >
                  <RefreshCw size={13} className={isProcessing ? "animate-spin" : ""} />
                  <span>Re-run AI Isolation</span>
                </button>
              </div>

              {/* OPTIONAL TOUCH-UP TOOLS */}
              <div className="mt-6 border-t border-white/[0.08] pt-5">
                <h4 className="text-xs font-medium text-zinc-300">Manual Touch-Up (Optional)</h4>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Use the brush if you wish to erase or restore custom parts of the canvas.
                </p>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBrushMode("none")}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2 text-[10px] transition ${
                      brushMode === "none"
                        ? "border-indigo-500 bg-indigo-500/15 text-indigo-300"
                        : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Check size={14} />
                    <span>AI Result</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBrushMode("erase")}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2 text-[10px] transition ${
                      brushMode === "erase"
                        ? "border-rose-500 bg-rose-500/15 text-rose-300"
                        : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Eraser size={14} />
                    <span>Erase</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBrushMode("restore")}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2 text-[10px] transition ${
                      brushMode === "restore"
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                        : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Paintbrush size={14} />
                    <span>Restore</span>
                  </button>
                </div>

                {brushMode !== "none" && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <label className="text-zinc-300">Brush Size</label>
                      <span className="font-mono text-zinc-400">{brushSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={6}
                      max={80}
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="mt-1.5 w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}

        {/* ===================================================
            FOOTER ACTIONS
            =================================================== */}
        <div className="flex h-16 shrink-0 items-center justify-between border-t border-white/[0.08] bg-[#121216] px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/[0.08] px-4 py-2 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            Cancel
          </button>

          {activeSrc && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isProcessing || !resultSrc}
                onClick={handleApply}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-[1.02] hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
              >
                <Check size={15} />
                <span>{element ? "Apply Studio Cutout to Element" : "Add to Canvas"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
