import React, { useState, useRef, useEffect, useCallback } from "react";
import { X } from "lucide-react";

/* =========================================================
   UTILITIES
   ========================================================= */

function hexToHsv(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let hue = 0;
  const sat = max === 0 ? 0 : d / max;
  const val = max;
  if (d !== 0) {
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
  }
  return [hue, sat, val];
}

function hsvToHex(h: number, s: number, v: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  const toHex = (n: number) =>
    Math.round(n * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(f(5))}${toHex(f(3))}${toHex(f(1))}`;
}

function hsvToHueHex(h: number): string {
  return hsvToHex(h, 1, 1);
}

/* =========================================================
   DESIGN SWATCHES (common palette)
   ========================================================= */

const PALETTE_SWATCHES = [
  "#ffffff", "#f8f9fa", "#e9ecef", "#dee2e6", "#adb5bd", "#6c757d",
  "#495057", "#343a40", "#212529", "#000000",
  "#ff6b6b", "#ee5a24", "#f9ca24", "#6ab04c", "#22a6b3",
  "#4834d4", "#be2edd", "#130f40", "#30336b", "#f0932b",
  "#ff9ff3", "#ffeaa7", "#dfe6e9", "#74b9ff", "#a29bfe",
  "#fd79a8", "#55efc4", "#00cec9", "#0984e3", "#6c5ce7",
];

/* =========================================================
   2D GRADIENT PICKER (Saturation × Value)
   ========================================================= */

function SatValPicker({
  hue,
  sat,
  val,
  onChange,
}: {
  hue: number;
  sat: number;
  val: number;
  onChange: (s: number, v: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas;

    // White → HueColor horizontal gradient
    const hColor = hsvToHueHex(hue);
    const gradH = ctx.createLinearGradient(0, 0, width, 0);
    gradH.addColorStop(0, "#fff");
    gradH.addColorStop(1, hColor);
    ctx.fillStyle = gradH;
    ctx.fillRect(0, 0, width, height);

    // Transparent → Black vertical gradient
    const gradV = ctx.createLinearGradient(0, 0, 0, height);
    gradV.addColorStop(0, "transparent");
    gradV.addColorStop(1, "#000");
    ctx.fillStyle = gradV;
    ctx.fillRect(0, 0, width, height);
  }, [hue]);

  useEffect(() => {
    draw();
  }, [draw]);

  function pickAt(e: React.MouseEvent | React.PointerEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const cy = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    onChange(cx / rect.width, 1 - cy / rect.height);
  }

  return (
    <div className="relative w-full" style={{ height: 140 }}>
      <canvas
        ref={canvasRef}
        width={300}
        height={140}
        className="absolute inset-0 h-full w-full rounded-lg cursor-crosshair"
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          pickAt(e);
        }}
        onPointerMove={(e) => {
          if (dragging.current) pickAt(e);
        }}
        onPointerUp={() => { dragging.current = false; }}
      />
      {/* Thumb */}
      <div
        className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
        style={{
          left: `${sat * 100}%`,
          top: `${(1 - val) * 100}%`,
          backgroundColor: hsvToHex(hue, sat, val),
        }}
      />
    </div>
  );
}

/* =========================================================
   HUE SLIDER
   ========================================================= */

function HueSlider({ hue, onChange }: { hue: number; onChange: (h: number) => void }) {
  return (
    <div className="relative flex items-center">
      <div
        className="relative h-3 w-full rounded-full"
        style={{
          background:
            "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
        }}
      >
        <input
          type="range"
          min={0}
          max={359}
          value={hue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        {/* Thumb */}
        <div
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
          style={{
            left: `${(hue / 359) * 100}%`,
            backgroundColor: hsvToHueHex(hue),
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COLOR PICKER POPOVER
   ========================================================= */

interface ColorPickerPopoverProps {
  color: string;
  onChange: (hex: string) => void;
  onClose: () => void;
  /** Extra swatches from the design (passed in from parent) */
  designColors?: string[];
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export function ColorPickerPopover({
  color,
  onChange,
  onClose,
  designColors = [],
  anchorRef,
}: ColorPickerPopoverProps) {
  const safeColor = /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#ffffff";
  const [hue, satInit, valInit] = hexToHsv(safeColor);
  const [hsv, setHsv] = useState<[number, number, number]>([hue, satInit, valInit]);
  const [hexInput, setHexInput] = useState(safeColor.slice(1).toUpperCase());
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync internal state when color prop changes from outside
  useEffect(() => {
    if (/^#[0-9a-fA-F]{6}$/.test(color)) {
      const [h, s, v] = hexToHsv(color);
      setHsv([h, s, v]);
      setHexInput(color.slice(1).toUpperCase());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);

  // Close on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !(anchorRef?.current?.contains(e.target as Node))
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [anchorRef, onClose]);

  function commit(h: number, s: number, v: number) {
    const hex = hsvToHex(h, s, v);
    onChange(hex);
    setHexInput(hex.slice(1).toUpperCase());
  }

  function handleHexInput(raw: string) {
    const val = raw.replace(/[^0-9a-fA-F]/g, "").toUpperCase().slice(0, 6);
    setHexInput(val);
    if (val.length === 6) {
      const hex = `#${val}`;
      const [h, s, v] = hexToHsv(hex);
      setHsv([h, s, v]);
      onChange(hex);
    }
  }

  const currentHex = hsvToHex(hsv[0], hsv[1], hsv[2]);

  // Dedupe design colors
  const extraSwatches = [...new Set(designColors)]
    .filter((c) => /^#[0-9a-fA-F]{6}$/i.test(c))
    .slice(0, 14);

  return (
    <div
      ref={popoverRef}
      className="absolute z-[200] w-[260px] rounded-2xl border border-white/[0.1] bg-[#1c1d21] p-3 shadow-2xl"
      style={{ top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-white">Color</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-zinc-500 hover:text-white transition"
        >
          <X size={13} />
        </button>
      </div>

      {/* 2D Gradient Picker */}
      <SatValPicker
        hue={hsv[0]}
        sat={hsv[1]}
        val={hsv[2]}
        onChange={(s, v) => {
          setHsv([hsv[0], s, v]);
          commit(hsv[0], s, v);
        }}
      />

      <div className="mt-3 space-y-3">
        {/* Hue Slider */}
        <HueSlider
          hue={hsv[0]}
          onChange={(h) => {
            setHsv([h, hsv[1], hsv[2]]);
            commit(h, hsv[1], hsv[2]);
          }}
        />

        {/* Hex Input + current swatch */}
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 shrink-0 rounded-lg border border-white/[0.15] shadow-sm"
            style={{ backgroundColor: currentHex }}
          />
          <div className="flex flex-1 items-center overflow-hidden rounded-lg border border-white/[0.1] bg-[#25262b]">
            <span className="pl-2.5 text-xs text-zinc-500">#</span>
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexInput(e.target.value)}
              maxLength={6}
              className="flex-1 bg-transparent py-1.5 pr-2.5 text-xs font-mono text-white outline-none"
              placeholder="FFFFFF"
            />
          </div>
        </div>
      </div>

      {/* Design colors (if any) */}
      {extraSwatches.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[10px] font-medium text-zinc-500">Colors in this design</p>
          <div className="flex flex-wrap gap-1.5">
            {extraSwatches.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onChange(c);
                  const [h, s, v] = hexToHsv(c);
                  setHsv([h, s, v]);
                  setHexInput(c.slice(1).toUpperCase());
                }}
                className="h-6 w-6 rounded-full border-2 transition hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: c === currentHex ? "#fff" : "transparent",
                }}
                title={c}
              />
            ))}
          </div>
        </div>
      )}

      {/* Palette swatches */}
      <div className="mt-3">
        <p className="mb-1.5 text-[10px] font-medium text-zinc-500">Color palette</p>
        <div className="flex flex-wrap gap-1.5">
          {PALETTE_SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                onChange(c);
                const [h, s, v] = hexToHsv(c);
                setHsv([h, s, v]);
                setHexInput(c.slice(1).toUpperCase());
              }}
              className="h-6 w-6 rounded-full border-2 transition hover:scale-110"
              style={{
                backgroundColor: c,
                borderColor: c === currentHex ? "#fff" : "rgba(255,255,255,0.08)",
              }}
              title={c}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
