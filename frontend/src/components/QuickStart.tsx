import { useState, type CSSProperties } from "react";
import { useRouter } from "next/router";
import {
  FolderOpen, Image as ImageIcon, LayoutTemplate, Loader2, Mail, MailOpen, Presentation, Scaling, Smartphone, Sparkles, Square,
  type LucideIcon,
} from "lucide-react";
import { PAGE_PRESETS, PageSize } from "@/types";

interface QuickStartProps {
  /** Starts a blank design at the given size and opens the editor */
  onCreate: (size: PageSize) => Promise<void> | void;
  /** Opens the size picker */
  onCustomSize: () => void;
}

type Action =
  | { kind: "link"; href: string }
  | { kind: "size"; width: number; height: number; name: string }
  | { kind: "custom" };

interface Shortcut {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  color: string;
  action: Action;
}

// Only things Falcon can actually do: each one opens a working page or starts a real design
const SHORTCUTS: Shortcut[] = [
  { id: "templates", label: "Templates", hint: "Browse the library of poster and presentation templates", icon: LayoutTemplate, color: "#4DA3FF", action: { kind: "link", href: "/library" } },
  { id: "ai", label: "AI Studio", hint: "Describe an idea and let Falcon plan the design", icon: Sparkles, color: "#A78BFA", action: { kind: "link", href: "/ai-studio" } },
  { id: "social", label: "Social post", hint: "Square post, 1080 × 1080", icon: Square, color: "#F472B6", action: { kind: "size", width: 1080, height: 1080, name: "Instagram Post (Square)" } },
  { id: "story", label: "Story", hint: "Vertical story, 1080 × 1920", icon: Smartphone, color: "#FB923C", action: { kind: "size", width: 1080, height: 1920, name: "Story / Vertical Poster" } },
  { id: "poster", label: "Poster", hint: "Portrait poster, 1080 × 1440", icon: ImageIcon, color: "#22D3EE", action: { kind: "size", width: 1080, height: 1440, name: "Portrait Poster" } },
  { id: "presentation", label: "Presentation", hint: "Widescreen slide or banner, 1920 × 1080", icon: Presentation, color: "#FBBF24", action: { kind: "size", width: 1920, height: 1080, name: "Presentation / Banner (16:9)" } },
  { id: "email", label: "Email", hint: "Design an email in the Email Designer", icon: Mail, color: "#34D399", action: { kind: "link", href: "/email-designer" } },
  { id: "email-templates", label: "Email templates", hint: "Start from a ready-made email", icon: MailOpen, color: "#2DD4BF", action: { kind: "link", href: "/email-templates" } },
  { id: "custom", label: "Custom size", hint: "Choose your own layout", icon: Scaling, color: "#E5E7EB", action: { kind: "custom" } },
  { id: "projects", label: "My projects", hint: "Open a design you already started", icon: FolderOpen, color: "#818CF8", action: { kind: "link", href: "/projects" } },
];

/** Uses the editor's own preset for a size when there is one, so the layout name matches */
function presetFor(action: { width: number; height: number; name: string }): PageSize {
  return (
    PAGE_PRESETS.find((p) => p.width === action.width && p.height === action.height) ||
    { name: action.name, width: action.width, height: action.height }
  );
}

/** Row of shortcuts under the hero buttons: each starts a design or opens a tool. */
export default function QuickStart({ onCreate, onCustomSize }: QuickStartProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (shortcut: Shortcut) => {
    if (busy) return;
    const { action } = shortcut;
    if (action.kind === "custom") return onCustomSize();
    setBusy(shortcut.id);
    try {
      if (action.kind === "link") await router.push(action.href);
      else await onCreate(presetFor(action));
    } finally {
      setBusy(null);
    }
  };

  return (
    <nav aria-label="Start something new" className="falcon-quick mt-7 w-full max-w-[1040px]">
      <div className="falcon-quick-row no-scrollbar flex gap-1 overflow-x-auto px-2 pb-1 pt-3 sm:flex-wrap sm:justify-center sm:gap-x-2 sm:gap-y-5 sm:overflow-visible">
        {SHORTCUTS.map((shortcut, index) => {
          const Icon = shortcut.icon;
          const working = busy === shortcut.id;
          return (
            <button
              key={shortcut.id}
              type="button"
              title={shortcut.hint}
              disabled={!!busy && !working}
              onClick={() => run(shortcut)}
              style={{ "--qs": shortcut.color, "--qs-i": index } as CSSProperties}
              className="falcon-quick-item group flex w-[88px] shrink-0 flex-col items-center gap-2.5 rounded-2xl px-0.5 py-1 text-center outline-none disabled:opacity-40 sm:w-[98px]"
            >
              <span className="falcon-quick-orb relative flex h-14 w-14 items-center justify-center rounded-full">
                <span className="falcon-quick-ring" aria-hidden="true" />
                <span className="falcon-quick-clip" aria-hidden="true"><span className="falcon-quick-shine" /></span>
                {working
                  ? <Loader2 size={20} className="relative z-10 animate-spin" />
                  : <Icon size={21} strokeWidth={1.9} className="falcon-quick-icon relative z-10" />}
              </span>
              <span className="falcon-quick-label whitespace-nowrap text-[11.5px] font-medium leading-tight">{working ? "Opening…" : shortcut.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
