import React from "react";

/** The tools on the editor's rail that have a badge */
export type RailBadgeId =
  | "templates"
  | "elements"
  | "text"
  | "uploads"
  | "photos"
  | "portrait"
  | "qr"
  | "backgrounds"
  | "brand-kit"
  | "layers"
  | "ai";

interface RailBadgeIconProps {
  id: RailBadgeId;
  size?: number;
  className?: string;
}

/** Front squircle (three stops) and the lighter one peeking out behind it (two stops) */
const COLORS: Record<RailBadgeId, { front: [string, string, string]; back: [string, string] }> = {
  templates: { front: ["#a78bfa", "#8b5cf6", "#6d28d9"], back: ["#ddd6fe", "#5b21b6"] },
  elements: { front: ["#2dd4bf", "#06b6d4", "#0284c7"], back: ["#99f6e4", "#0d9488"] },
  text: { front: ["#fb7185", "#f43f5e", "#be123c"], back: ["#fecdd3", "#9f1239"] },
  uploads: { front: ["#38bdf8", "#0ea5e9", "#0369a1"], back: ["#bae6fd", "#075985"] },
  photos: { front: ["#60a5fa", "#3b82f6", "#1d4ed8"], back: ["#bfdbfe", "#1e40af"] },
  portrait: { front: ["#e879f9", "#a855f7", "#7c3aed"], back: ["#f5d0fe", "#6b21a8"] },
  qr: { front: ["#34d399", "#10b981", "#047857"], back: ["#a7f3d0", "#065f46"] },
  backgrounds: { front: ["#fbbf24", "#f97316", "#ea580c"], back: ["#fed7aa", "#c2410c"] },
  "brand-kit": { front: ["#f472b6", "#e11d48", "#c026d3"], back: ["#fbcfe8", "#9d174d"] },
  layers: { front: ["#818cf8", "#6366f1", "#4338ca"], back: ["#c7d2fe", "#3730a3"] },
  ai: { front: ["#22d3ee", "#06b6d4", "#7c3aed"], back: ["#a5f3fc", "#5b21b6"] },
};

/**
 * A tool's badge on the editor rail, drawn the same way as the category badges
 * in the Elements panel: two stacked squircles with a small picture on top.
 */
export function RailBadgeIcon({ id, size = 34, className = "" }: RailBadgeIconProps) {
  const color = COLORS[id];
  const front = `railFront-${id}`;
  const back = `railBack-${id}`;
  const clip = `railClip-${id}`;

  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_3px_8px_rgba(0,0,0,0.35)]" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id={front} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color.front[0]} />
            <stop offset="50%" stopColor={color.front[1]} />
            <stop offset="100%" stopColor={color.front[2]} />
          </linearGradient>
          <linearGradient id={back} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color.back[0]} />
            <stop offset="100%" stopColor={color.back[1]} />
          </linearGradient>
        </defs>

        <rect x="18" y="10" width="70" height="70" rx="22" fill={`url(#${back})`} opacity="0.85" />
        <rect x="12" y="16" width="70" height="70" rx="22" fill={`url(#${front})`} />

        {/* A page laid out in blocks */}
        {id === "templates" && (
          <g>
            <rect x="25" y="29" width="44" height="44" rx="5" fill="#ffffff" />
            <rect x="29" y="33" width="36" height="13" rx="2.5" fill="#f472b6" />
            <rect x="29" y="50" width="15" height="19" rx="2.5" fill="#38bdf8" />
            <rect x="48" y="50" width="17" height="7" rx="2" fill="#c4b5fd" />
            <rect x="48" y="61" width="17" height="8" rx="2" fill="#fbbf24" />
          </g>
        )}

        {/* A circle, a triangle and a square */}
        {id === "elements" && (
          <g>
            <polygon points="47,27 60,49 34,49" fill="#f472b6" />
            <rect x="26" y="54" width="19" height="19" rx="4" fill="#fde047" />
            <circle cx="59" cy="63.5" r="10" fill="#a7f3d0" />
          </g>
        )}

        {/* A capital T with a text cursor beside it */}
        {id === "text" && (
          <g>
            <path d="M27,31 H61 V40 H49 V72 H39 V40 H27 Z" fill="#ffffff" />
            <rect x="65" y="34" width="4" height="38" rx="2" fill="#fde047" />
          </g>
        )}

        {/* A cloud with an arrow going up into it */}
        {id === "uploads" && (
          <g>
            <path d="M34,64 C27,64 23,59 23,54 C23,48 28,44 33,44 C35,36 41,32 48,32 C56,32 62,37 63,44 C68,45 71,49 71,54 C71,60 66,64 60,64 Z" fill="#ffffff" />
            <path d="M47,74 V50" stroke="#0369a1" strokeWidth="5" strokeLinecap="round" />
            <path d="M38,57 L47,48 L56,57" fill="none" stroke="#0369a1" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

        {/* A photo print: sky, sun and hills */}
        {id === "photos" && (
          <g>
            <rect x="24" y="30" width="46" height="42" rx="5" fill="#ffffff" />
            <clipPath id={clip}>
              <rect x="27" y="33" width="40" height="36" rx="3" />
            </clipPath>
            <g clipPath={`url(#${clip})`}>
              <rect x="27" y="33" width="40" height="36" fill="#7dd3fc" />
              <circle cx="56" cy="43" r="5" fill="#fde047" />
              <path d="M27,62 L40,48 L50,59 L57,53 L67,63 V69 H27 Z" fill="#22c55e" />
              <path d="M27,66 Q45,58 67,67 V69 H27 Z" fill="#15803d" opacity="0.7" />
            </g>
          </g>
        )}

        {/* A person in a round frame */}
        {id === "portrait" && (
          <g>
            <circle cx="47" cy="51" r="24" fill="#ffffff" />
            <clipPath id={clip}>
              <circle cx="47" cy="51" r="21" />
            </clipPath>
            <g clipPath={`url(#${clip})`}>
              <rect x="26" y="30" width="42" height="42" fill="#fde68a" />
              <path d="M30,76 C30,63 38,58 47,58 C56,58 64,63 64,76 Z" fill="#7c3aed" />
              <circle cx="47" cy="46" r="9" fill="#fed7aa" />
              <path d="M37,46 C36,37 42,33 48,34 C55,34 58,39 57,46 C53,42 44,41 37,46 Z" fill="#78350f" />
            </g>
          </g>
        )}

        {/* A code's three corner squares and a few modules */}
        {id === "qr" && (
          <g>
            <rect x="25" y="29" width="44" height="44" rx="5" fill="#ffffff" />
            <g fill="#064e3b">
              <rect x="29" y="33" width="14" height="14" rx="2.5" />
              <rect x="51" y="33" width="14" height="14" rx="2.5" />
              <rect x="29" y="55" width="14" height="14" rx="2.5" />
              <rect x="51" y="55" width="6" height="6" rx="1" />
              <rect x="59" y="63" width="6" height="6" rx="1" />
              <rect x="59" y="55" width="6" height="4" rx="1" />
              <rect x="51" y="64" width="5" height="5" rx="1" />
            </g>
            <g fill="#ffffff">
              <rect x="33" y="37" width="6" height="6" rx="1" />
              <rect x="55" y="37" width="6" height="6" rx="1" />
              <rect x="33" y="59" width="6" height="6" rx="1" />
            </g>
          </g>
        )}

        {/* A backdrop: a sunset over water */}
        {id === "backgrounds" && (
          <g>
            <rect x="24" y="30" width="46" height="42" rx="6" fill="#ffffff" />
            <clipPath id={clip}>
              <rect x="27" y="33" width="40" height="36" rx="4" />
            </clipPath>
            <g clipPath={`url(#${clip})`}>
              <rect x="27" y="33" width="40" height="36" fill="#fde047" />
              <rect x="27" y="33" width="40" height="12" fill="#fb7185" opacity="0.75" />
              <circle cx="47" cy="55" r="9" fill="#ffffff" />
              <rect x="27" y="55" width="40" height="14" fill="#7c3aed" />
              <rect x="33" y="59" width="28" height="2" rx="1" fill="#c4b5fd" />
              <rect x="38" y="64" width="18" height="2" rx="1" fill="#c4b5fd" />
            </g>
          </g>
        )}

        {/* A bookmark with the brand's colours beside it */}
        {id === "brand-kit" && (
          <g>
            <path d="M27,30 H51 V73 L39,64 L27,73 Z" fill="#ffffff" />
            <path d="M39,38 l2.6,5.4 l5.9,0.8 l-4.3,4.1 l1,5.9 l-5.2,-2.8 l-5.2,2.8 l1,-5.9 l-4.3,-4.1 l5.9,-0.8 Z" fill="#e11d48" />
            <circle cx="62" cy="36" r="6" fill="#fde047" />
            <circle cx="62" cy="51" r="6" fill="#67e8f9" />
            <circle cx="62" cy="66" r="6" fill="#a7f3d0" />
          </g>
        )}

        {/* Three sheets stacked */}
        {id === "layers" && (
          <g>
            <polygon points="47,48 72,60 47,72 22,60" fill="#312e81" opacity="0.55" />
            <polygon points="47,39 72,51 47,63 22,51" fill="#a5b4fc" />
            <polygon points="47,29 72,41 47,53 22,41" fill="#ffffff" />
          </g>
        )}

        {/* Sparkles */}
        {id === "ai" && (
          <g fill="#ffffff">
            <path d="M43,30 l5,13 l13,5 l-13,5 l-5,13 l-5,-13 l-13,-5 l13,-5 Z" />
            <path d="M63,54 l3,7 l7,3 l-7,3 l-3,7 l-3,-7 l-7,-3 l7,-3 Z" fill="#fde047" />
            <circle cx="64" cy="35" r="3.5" fill="#fde047" />
          </g>
        )}
      </svg>
    </span>
  );
}
