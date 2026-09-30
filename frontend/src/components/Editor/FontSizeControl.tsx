import React, { useState, useEffect, useRef } from "react";
import { Minus, Plus, ChevronDown } from "lucide-react";

interface FontSizeControlProps {
  fontSize: number;
  onChange: (newSize: number, opts?: { commit?: boolean }) => void;
}

const PRESET_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 80, 96, 120, 144];

export function FontSizeControl({ fontSize, onChange }: FontSizeControlProps) {
  const [inputValue, setInputValue] = useState(String(fontSize));
  const [isDragging, setIsDragging] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ startX: number; startSize: number; moved: boolean } | null>(null);

  // Sync state with incoming prop when input is not focused
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setInputValue(String(fontSize));
    }
  }, [fontSize]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const commitValue = (val: string) => {
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      const clamped = Math.max(6, Math.min(320, parsed));
      setInputValue(String(clamped));
      onChange(clamped, { commit: true });
    } else {
      setInputValue(String(fontSize));
    }
  };

  // Pointer drag scrubbing logic
  const handlePointerDown = (e: React.PointerEvent<HTMLInputElement>) => {
    if (e.button !== 0) return;

    // If input is already active and focused for typing, let normal cursor/text selection happen
    if (document.activeElement === inputRef.current) {
      return;
    }

    dragStartRef.current = {
      startX: e.clientX,
      startSize: fontSize,
      moved: false,
    };

    let latestSize = fontSize;

    const onPointerMove = (ev: PointerEvent) => {
      if (!dragStartRef.current) return;
      const dx = ev.clientX - dragStartRef.current.startX;

      if (Math.abs(dx) > 2) {
        dragStartRef.current.moved = true;
        setIsDragging(true);
      }

      if (dragStartRef.current.moved) {
        // Sensitivity: 1px move = 0.5 font units, or 1.5 if Shift held
        const speed = ev.shiftKey ? 1.5 : 0.6;
        const computed = Math.max(
          6,
          Math.min(320, Math.round(dragStartRef.current.startSize + dx * speed))
        );
        latestSize = computed;
        setInputValue(String(computed));
        onChange(computed, { commit: false });
      }
    };

    const onPointerUp = () => {
      const state = dragStartRef.current;
      dragStartRef.current = null;
      setIsDragging(false);

      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);

      if (state && state.moved) {
        onChange(latestSize, { commit: true });
      } else {
        // Simple click without dragging: focus and highlight text for typing
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  return (
    <div className="relative flex items-center rounded-xl bg-white/[0.05] border border-white/[0.08] px-1 py-0.5 shadow-inner">
      {/* Decrease button */}
      <button
        type="button"
        onClick={() => {
          const next = Math.max(6, fontSize - 2);
          onChange(next, { commit: true });
        }}
        className="h-6 w-6 rounded-lg text-zinc-400 hover:bg-white/[0.08] hover:text-white flex items-center justify-center transition active:scale-95"
        title="Decrease font size (Ctrl -)"
      >
        <Minus size={12} />
      </button>

      {/* Editable / Scrubbable Input Box */}
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          onPointerDown={handlePointerDown}
          onChange={(e) => {
            const cleaned = e.target.value.replace(/[^0-9]/g, "");
            setInputValue(cleaned);
          }}
          onBlur={() => commitValue(inputValue)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              inputRef.current?.blur();
            } else if (e.key === "Escape") {
              e.preventDefault();
              setInputValue(String(fontSize));
              inputRef.current?.blur();
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              const step = e.shiftKey ? 10 : 1;
              const next = Math.min(320, fontSize + step);
              setInputValue(String(next));
              onChange(next, { commit: true });
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              const step = e.shiftKey ? 10 : 1;
              const next = Math.max(6, fontSize - step);
              setInputValue(String(next));
              onChange(next, { commit: true });
            }
          }}
          className={`h-6 w-10 text-center text-xs font-mono font-medium text-white bg-transparent rounded outline-none border border-transparent transition ${
            isDragging
              ? "cursor-ew-resize bg-indigo-500/20 border-indigo-400 select-none"
              : "hover:bg-white/[0.06] hover:border-white/20 focus:bg-black/80 focus:border-indigo-500 cursor-ew-resize"
          }`}
          title="Drag left/right to resize font, or click to type number"
        />

        {/* Scrubbing indicator hint on hover */}
        {!isDragging && (
          <div className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/90 px-1.5 py-0.5 text-[9px] font-medium text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-md border border-white/10">
            Drag or Type
          </div>
        )}
      </div>

      {/* Increase button */}
      <button
        type="button"
        onClick={() => {
          const next = Math.min(320, fontSize + 2);
          onChange(next, { commit: true });
        }}
        className="h-6 w-6 rounded-lg text-zinc-400 hover:bg-white/[0.08] hover:text-white flex items-center justify-center transition active:scale-95"
        title="Increase font size (Ctrl +)"
      >
        <Plus size={12} />
      </button>

      {/* Preset sizes dropdown toggle */}
      <button
        type="button"
        onClick={() => setDropdownOpen((v) => !v)}
        className="h-6 w-4 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.08] flex items-center justify-center transition ml-0.5"
        title="Choose font size preset"
      >
        <ChevronDown size={10} className={`transition-transform duration-150 ${dropdownOpen ? "rotate-180 text-indigo-400" : ""}`} />
      </button>

      {/* Preset Sizes Menu */}
      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-1/2 top-full mt-2 -translate-x-1/2 z-50 w-24 max-h-56 overflow-y-auto rounded-xl border border-white/[0.1] bg-[#1a1b1e]/98 p-1 shadow-2xl backdrop-blur-xl scrollbar-thin scrollbar-thumb-zinc-700"
        >
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-white/[0.06] mb-1">
            Presets
          </div>
          <div className="grid grid-cols-1 gap-0.5">
            {PRESET_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  onChange(size, { commit: true });
                  setInputValue(String(size));
                  setDropdownOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-xs font-mono font-medium transition ${
                  fontSize === size
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <span>{size}</span>
                {fontSize === size && <span className="text-[10px] text-indigo-200">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
