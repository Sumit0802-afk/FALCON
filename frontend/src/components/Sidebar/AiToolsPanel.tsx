import React from "react";
import { ChevronRight, Eraser, MessageSquare, Sparkles, Wand2 } from "lucide-react";

interface AiToolsPanelProps {
  onOpenCoach: () => void;
  onOpenStudio: () => void;
  onOpenBgRemover: () => void;
  onMagicWrite: () => void;
  theme?: "dark" | "light";
}

/** The AI Tools tab: one place to reach each of the editor's AI features */
export function AiToolsPanel({ onOpenCoach, onOpenStudio, onOpenBgRemover, onMagicWrite, theme = "dark" }: AiToolsPanelProps) {
  const isDark = theme === "dark";
  const tools = [
    { icon: MessageSquare, title: "AI Coach", text: "Feedback on the design you have open, and what to improve", run: onOpenCoach },
    { icon: Wand2, title: "AI Write", text: "Draft or rewrite the text of your design", run: onMagicWrite },
    { icon: Eraser, title: "Background Remover", text: "Cut the subject out of a photo", run: onOpenBgRemover },
    { icon: Sparkles, title: "AI Studio", text: "Generate a design from a description", run: onOpenStudio },
  ];

  return (
    <aside className={`flex h-full w-[340px] shrink-0 flex-col border-r ${isDark ? "border-white/[0.08] bg-[#0c1017] text-white" : "border-slate-200 bg-white text-slate-900"}`}>
      <div className={`border-b p-4 ${isDark ? "border-white/[0.07]" : "border-slate-200"}`}>
        <h2 className="text-sm font-semibold">AI Tools</h2>
        <p className={`mt-1 text-[11px] ${isDark ? "text-zinc-500" : "text-slate-500"}`}>Help with ideas, wording and images</p>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {tools.map((tool) => (
          <button
            key={tool.title}
            type="button"
            onClick={tool.run}
            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${isDark ? "border-white/[0.08] bg-white/[0.02] hover:border-cyan-400/50 hover:bg-white/[0.05]" : "border-slate-200 hover:border-cyan-500"}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
              <tool.icon size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold">{tool.title}</span>
              <span className={`mt-0.5 block text-[11px] leading-snug ${isDark ? "text-zinc-500" : "text-slate-500"}`}>{tool.text}</span>
            </span>
            <ChevronRight size={14} className={isDark ? "text-zinc-600" : "text-slate-400"} />
          </button>
        ))}
      </div>
    </aside>
  );
}
