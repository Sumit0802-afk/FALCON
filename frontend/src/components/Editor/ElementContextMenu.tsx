import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignStartHorizontal,
  AlignVerticalJustifyCenter,
  ArrowDownToLine,
  ArrowUpToLine,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardPaste,
  Copy,
  CopyPlus,
  Group,
  Layers,
  Lock,
  Trash2,
  Unlock,
  Ungroup,
} from "lucide-react";

export type AlignTarget = "left" | "center" | "right" | "top" | "middle" | "bottom";

interface ElementContextMenuProps {
  /** Where the menu opens, in window pixels */
  x: number;
  y: number;
  locked: boolean;
  isGroup: boolean;
  canGroup: boolean;
  canPaste: boolean;
  onClose: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleLock: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onBringToFront: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onSendToBack: () => void;
  onAlign: (target: AlignTarget) => void;
}

type Submenu = "layer" | "align" | null;

const ALIGNS: { id: AlignTarget; label: string; icon: React.ReactNode }[] = [
  { id: "left", label: "Left", icon: <AlignHorizontalJustifyStart size={16} /> },
  { id: "center", label: "Center", icon: <AlignHorizontalJustifyCenter size={16} /> },
  { id: "right", label: "Right", icon: <AlignHorizontalJustifyEnd size={16} /> },
  { id: "top", label: "Top", icon: <AlignStartHorizontal size={16} /> },
  { id: "middle", label: "Middle", icon: <AlignCenterHorizontal size={16} /> },
  { id: "bottom", label: "Bottom", icon: <AlignEndHorizontal size={16} /> },
];

const PANEL = "rounded-2xl border border-white/[0.1] bg-[#121722] p-1.5 text-[13px] text-zinc-200 shadow-2xl shadow-black/60";
const ROW = "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

export function ElementContextMenu(props: ElementContextMenuProps) {
  const { x, y, locked, isGroup, canGroup, canPaste, onClose } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [sub, setSub] = useState<Submenu>(null);
  const [pos, setPos] = useState({ left: x, top: y });

  // Keeps the menu inside the window, opening upwards or leftwards when it would run off
  useLayoutEffect(() => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    setPos({
      left: Math.max(8, Math.min(x, window.innerWidth - box.width - 8)),
      top: Math.max(8, Math.min(y, window.innerHeight - box.height - 8)),
    });
  }, [x, y]);

  useEffect(() => {
    const close = () => onClose();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("resize", close);
    window.addEventListener("blur", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("blur", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const run = (action: () => void) => () => {
    action();
    onClose();
  };

  // Submenus open to the right unless there is no room
  const flip = pos.left + 230 + 220 > (typeof window === "undefined" ? 0 : window.innerWidth);
  const subPlace = flip ? "right-full mr-1" : "left-full ml-1";

  return (
    <>
      <div
        className="fixed inset-0 z-[9998]"
        onPointerDown={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
      <div
        ref={ref}
        role="menu"
        className={`fixed z-[9999] w-[230px] select-none ${PANEL}`}
        style={{ left: pos.left, top: pos.top }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <button type="button" role="menuitem" className={ROW} onClick={run(props.onCopy)} onMouseEnter={() => setSub(null)}>
          <Copy size={16} />
          <span className="flex-1">Copy</span>
          <kbd className="rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[11px] text-zinc-400">Ctrl+C</kbd>
        </button>
        <button type="button" role="menuitem" className={ROW} disabled={!canPaste} onClick={run(props.onPaste)} onMouseEnter={() => setSub(null)}>
          <ClipboardPaste size={16} />
          <span className="flex-1">Paste</span>
          <kbd className="rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[11px] text-zinc-400">Ctrl+V</kbd>
        </button>
        <button type="button" role="menuitem" className={ROW} onClick={run(props.onDuplicate)} onMouseEnter={() => setSub(null)}>
          <CopyPlus size={16} />
          <span className="flex-1">Duplicate</span>
          <kbd className="rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[11px] text-zinc-400">Ctrl+D</kbd>
        </button>
        <button type="button" role="menuitem" className={`${ROW} hover:text-red-300`} onClick={run(props.onDelete)} onMouseEnter={() => setSub(null)}>
          <Trash2 size={16} />
          <span className="flex-1">Delete</span>
          <kbd className="rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[11px] text-zinc-400">Del</kbd>
        </button>

        <div className="my-1.5 h-px bg-white/[0.08]" />

        <div className="relative" onMouseEnter={() => setSub("layer")}>
          <button type="button" role="menuitem" aria-haspopup="menu" className={ROW} onClick={() => setSub(sub === "layer" ? null : "layer")}>
            <Layers size={16} />
            <span className="flex-1">Layer</span>
            <ChevronRight size={14} className="text-zinc-500" />
          </button>
          {sub === "layer" && (
            <div role="menu" className={`absolute top-0 w-[220px] ${subPlace} ${PANEL}`}>
              <button type="button" role="menuitem" className={ROW} onClick={run(props.onBringToFront)}>
                <ArrowUpToLine size={16} />
                <span className="flex-1">Bring to front</span>
              </button>
              <button type="button" role="menuitem" className={ROW} onClick={run(props.onBringForward)}>
                <ChevronUp size={16} />
                <span className="flex-1">Bring forward</span>
              </button>
              <button type="button" role="menuitem" className={ROW} onClick={run(props.onSendBackward)}>
                <ChevronDown size={16} />
                <span className="flex-1">Send backward</span>
              </button>
              <button type="button" role="menuitem" className={ROW} onClick={run(props.onSendToBack)}>
                <ArrowDownToLine size={16} />
                <span className="flex-1">Send to back</span>
              </button>
            </div>
          )}
        </div>

        <div className="relative" onMouseEnter={() => setSub("align")}>
          <button type="button" role="menuitem" aria-haspopup="menu" className={ROW} disabled={locked} onClick={() => setSub(sub === "align" ? null : "align")}>
            <AlignVerticalJustifyCenter size={16} />
            <span className="flex-1">Align to page</span>
            <ChevronRight size={14} className="text-zinc-500" />
          </button>
          {sub === "align" && !locked && (
            <div role="menu" className={`absolute top-0 w-[200px] ${subPlace} ${PANEL}`}>
              {ALIGNS.map((item) => (
                <button key={item.id} type="button" role="menuitem" className={ROW} onClick={run(() => props.onAlign(item.id))}>
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="my-1.5 h-px bg-white/[0.08]" />

        {(canGroup || isGroup) && (
          <button type="button" role="menuitem" className={ROW} onClick={run(isGroup ? props.onUngroup : props.onGroup)} onMouseEnter={() => setSub(null)}>
            {isGroup ? <Ungroup size={16} /> : <Group size={16} />}
            <span className="flex-1">{isGroup ? "Ungroup" : "Group"}</span>
            <kbd className="rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[11px] text-zinc-400">{isGroup ? "Ctrl+Shift+G" : "Ctrl+G"}</kbd>
          </button>
        )}
        <button type="button" role="menuitem" className={ROW} onClick={run(props.onToggleLock)} onMouseEnter={() => setSub(null)}>
          {locked ? <Unlock size={16} /> : <Lock size={16} />}
          <span className="flex-1">{locked ? "Unlock" : "Lock"}</span>
        </button>
      </div>
    </>
  );
}
