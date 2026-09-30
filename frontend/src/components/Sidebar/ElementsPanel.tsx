import React from "react";
import { Shapes, Square, Circle, Minus } from "lucide-react";
import { ElementType } from "@/types";

interface ElementsPanelProps {
  onAddShape: (type: "rectangle" | "ellipse" | "line") => void;
}

export function ElementsPanel({ onAddShape }: ElementsPanelProps) {
  const shapes: { type: "rectangle" | "ellipse" | "line"; label: string; icon: React.ReactNode }[] = [
    {
      type: "rectangle",
      label: "Rectangle",
      icon: <Square size={26} className="text-indigo-400" />,
    },
    {
      type: "ellipse",
      label: "Circle / Ellipse",
      icon: <Circle size={26} className="text-indigo-400" />,
    },
    {
      type: "line",
      label: "Line",
      icon: <Minus size={26} className="text-indigo-400" />,
    },
  ];

  return (
    <aside className="flex h-full w-[310px] shrink-0 flex-col border-r border-white/[0.07] bg-[#0c0c0e] text-white select-none">
      <div className="border-b border-white/[0.07] bg-[#111114] p-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <Shapes size={16} />
          </div>
          <div>
            <h2 className="text-xs font-semibold tracking-wide text-white">Elements</h2>
            <p className="text-[10px] text-zinc-500">Add basic shapes and lines</p>
          </div>
        </div>
      </div>

      <div className="p-3.5 space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          {shapes.map((s) => (
            <button
              key={s.type}
              type="button"
              onClick={() => onAddShape(s.type)}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-[#141417] p-4 text-center transition hover:border-indigo-500/40 hover:bg-[#191920]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/[0.03]">
                {s.icon}
              </div>
              <span className="text-xs font-medium text-zinc-300">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
