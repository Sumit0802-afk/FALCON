import React, { useId } from "react";
import type { LucideIcon } from "lucide-react";

/** Front squircle (three stops) and the lighter one peeking out behind it (two stops) */
const TONES = {
  violet: { front: ["#a78bfa", "#8b5cf6", "#6d28d9"], back: ["#ddd6fe", "#5b21b6"] },
  teal: { front: ["#2dd4bf", "#06b6d4", "#0284c7"], back: ["#99f6e4", "#0d9488"] },
  rose: { front: ["#fb7185", "#f43f5e", "#be123c"], back: ["#fecdd3", "#9f1239"] },
  sky: { front: ["#38bdf8", "#0ea5e9", "#0369a1"], back: ["#bae6fd", "#075985"] },
  blue: { front: ["#60a5fa", "#3b82f6", "#1d4ed8"], back: ["#bfdbfe", "#1e40af"] },
  purple: { front: ["#e879f9", "#a855f7", "#7c3aed"], back: ["#f5d0fe", "#6b21a8"] },
  green: { front: ["#34d399", "#10b981", "#047857"], back: ["#a7f3d0", "#065f46"] },
  orange: { front: ["#fbbf24", "#f97316", "#ea580c"], back: ["#fed7aa", "#c2410c"] },
  pink: { front: ["#f472b6", "#e11d48", "#c026d3"], back: ["#fbcfe8", "#9d174d"] },
  indigo: { front: ["#818cf8", "#6366f1", "#4338ca"], back: ["#c7d2fe", "#3730a3"] },
  amber: { front: ["#fcd34d", "#f59e0b", "#b45309"], back: ["#fde68a", "#92400e"] },
  slate: { front: ["#94a3b8", "#64748b", "#334155"], back: ["#e2e8f0", "#1e293b"] },
} as const;

export type BadgeTone = keyof typeof TONES;

interface BadgeIconProps {
  icon: LucideIcon;
  tone?: BadgeTone;
  /** The whole badge, in pixels */
  size?: number;
  className?: string;
}

/**
 * An icon as a badge, drawn the way the Elements panel draws its categories
 * and the editor rail draws its tools: two stacked squircles in one colour,
 * with the icon in white on the front one.
 */
export function BadgeIcon({ icon: Icon, tone = "teal", size = 36, className = "" }: BadgeIconProps) {
  const color = TONES[tone];
  // Each badge has its own gradients, so one hidden badge cannot blank the others
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");

  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_3px_8px_rgba(0,0,0,0.35)]" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id={`bf${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color.front[0]} />
            <stop offset="50%" stopColor={color.front[1]} />
            <stop offset="100%" stopColor={color.front[2]} />
          </linearGradient>
          <linearGradient id={`bb${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color.back[0]} />
            <stop offset="100%" stopColor={color.back[1]} />
          </linearGradient>
        </defs>
        <rect x="18" y="10" width="70" height="70" rx="22" fill={`url(#bb${id})`} opacity="0.85" />
        <rect x="12" y="16" width="70" height="70" rx="22" fill={`url(#bf${id})`} />
      </svg>
      {/* Centred on the front squircle, which sits a little left of and below the middle */}
      <Icon
        size={Math.round(size * 0.42)}
        strokeWidth={2.4}
        color="#ffffff"
        aria-hidden="true"
        className="absolute left-[47%] top-[51%] -translate-x-1/2 -translate-y-1/2"
      />
    </span>
  );
}
