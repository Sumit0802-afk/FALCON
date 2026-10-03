import React from "react";
import { ElementCategoryId } from "@/data/elementsData";

interface CategoryBadgeIconProps {
  categoryId: ElementCategoryId;
  className?: string;
  size?: number;
}

export function CategoryBadgeIcon({
  categoryId,
  className = "",
  size = 72,
}: CategoryBadgeIconProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* ── Shapes Gradients ── */}
          <linearGradient id="shFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="shBack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#99f6e4" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>

          {/* ── Graphics Gradients ── */}
          <linearGradient id="gfFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="gfBack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>

          {/* ── 3D Gradients ── */}
          <linearGradient id="tdFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e879f9" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="tdBack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5d0fe" />
            <stop offset="100%" stopColor="#6b21a8" />
          </linearGradient>

          {/* ── Animations Gradients ── */}
          <linearGradient id="anFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="60%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <linearGradient id="anBack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bbf7d0" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          {/* ── Photos Gradients ── */}
          <linearGradient id="phFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="phBack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>

          {/* ── Frames Gradients ── */}
          <linearGradient id="frFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="frBack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* ── Grids Gradients ── */}
          <linearGradient id="grFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="50%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#c026d3" />
          </linearGradient>
          <linearGradient id="grBack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbcfe8" />
            <stop offset="100%" stopColor="#9d174d" />
          </linearGradient>

          {/* ── Forms Gradients ── */}
          <linearGradient id="fmFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="60%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
          <linearGradient id="fmBack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>

          {/* ── Mockups Gradients ── */}
          <linearGradient id="mkFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0e7490" />
          </linearGradient>
          <linearGradient id="mkBack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#155e75" />
          </linearGradient>

          {/* ── Charts Gradients ── */}
          <linearGradient id="chFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="chBack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c7d2fe" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>

          {/* ── Sheets Gradients ── */}
          <linearGradient id="shsFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id="shsBack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>

          {/* ── Tables Gradients ── */}
          <linearGradient id="tbFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>
          <linearGradient id="tbBack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#9a3412" />
          </linearGradient>
        </defs>

        {/* ══════════════════ 1. SHAPES ══════════════════ */}
        {categoryId === "shapes" && (
          <g>
            {/* Back squircle */}
            <rect x="18" y="10" width="70" height="70" rx="22" fill="url(#shBack)" opacity="0.85" />
            {/* Front squircle */}
            <rect x="12" y="16" width="70" height="70" rx="22" fill="url(#shFront)" />
            {/* Pentagon */}
            <polygon points="34,28 47,38 42,54 26,54 21,38" fill="#a7f3d0" />
            {/* Pink Triangle */}
            <polygon points="63,33 76,55 50,55" fill="#f472b6" />
            {/* Row of 5 dark dots */}
            <circle cx="27" cy="67" r="2.8" fill="#0f172a" />
            <circle cx="36" cy="67" r="2.8" fill="#0f172a" />
            <circle cx="45" cy="67" r="2.8" fill="#0f172a" />
            <circle cx="54" cy="67" r="2.8" fill="#0f172a" />
            <circle cx="63" cy="67" r="2.8" fill="#0f172a" />
          </g>
        )}

        {/* ══════════════════ 2. GRAPHICS ══════════════════ */}
        {categoryId === "graphics" && (
          <g>
            {/* Back squircle */}
            <rect x="18" y="10" width="70" height="70" rx="22" fill="url(#gfBack)" opacity="0.85" />
            {/* Front squircle */}
            <rect x="12" y="16" width="70" height="70" rx="22" fill="url(#gfFront)" />
            {/* Sunflower Petals */}
            <g fill="#fde047" stroke="#eab308" strokeWidth="0.8">
              <ellipse cx="47" cy="34" rx="5" ry="12" />
              <ellipse cx="47" cy="68" rx="5" ry="12" />
              <ellipse cx="30" cy="51" rx="12" ry="5" />
              <ellipse cx="64" cy="51" rx="12" ry="5" />
              <ellipse cx="35" cy="39" rx="5" ry="12" transform="rotate(-45 35 39)" />
              <ellipse cx="59" cy="63" rx="5" ry="12" transform="rotate(-45 59 63)" />
              <ellipse cx="59" cy="39" rx="5" ry="12" transform="rotate(45 59 39)" />
              <ellipse cx="35" cy="63" rx="5" ry="12" transform="rotate(45 35 63)" />
            </g>
            {/* Sunflower Center */}
            <circle cx="47" cy="51" r="14" fill="#78350f" stroke="#fbbf24" strokeWidth="1.5" />
            {/* Green Stem/Leaves */}
            <path d="M47,68 Q47,76 43,80" stroke="#10b981" strokeWidth="3" strokeLinecap="round" fill="none" />
            <ellipse cx="36" cy="74" rx="6" ry="3" fill="#10b981" transform="rotate(-20 36 74)" />
            <ellipse cx="54" cy="73" rx="6" ry="3" fill="#10b981" transform="rotate(20 54 73)" />
          </g>
        )}

        {/* ══════════════════ 3. 3D ══════════════════ */}
        {categoryId === "3d" && (
          <g>
            {/* Back squircle */}
            <rect x="18" y="10" width="70" height="70" rx="22" fill="url(#tdBack)" opacity="0.85" />
            {/* Front squircle */}
            <rect x="12" y="16" width="70" height="70" rx="22" fill="url(#tdFront)" />
            {/* Perspective wireframe grid */}
            <g stroke="#ffffff" strokeWidth="0.8" opacity="0.55">
              <line x1="22" y1="62" x2="47" y2="76" />
              <line x1="47" y1="76" x2="72" y2="62" />
              <line x1="28" y1="56" x2="47" y2="68" />
              <line x1="47" y1="68" x2="66" y2="56" />
              <line x1="36" y1="50" x2="47" y2="57" />
              <line x1="47" y1="57" x2="58" y2="50" />
              <line x1="30" y1="67" x2="42" y2="52" />
              <line x1="40" y1="72" x2="52" y2="57" />
              <line x1="55" y1="72" x2="43" y2="57" />
              <line x1="64" y1="67" x2="52" y2="52" />
            </g>
            {/* 3D Isometric Cube */}
            <g transform="translate(0, -6)">
              {/* Top face */}
              <polygon points="47,30 65,40 47,50 29,40" fill="#60a5fa" />
              {/* Left face */}
              <polygon points="29,40 47,50 47,68 29,58" fill="#3b82f6" />
              {/* Right face */}
              <polygon points="47,50 65,40 65,58 47,68" fill="#1d4ed8" />
            </g>
          </g>
        )}

        {/* ══════════════════ 4. ANIMATIONS ══════════════════ */}
        {categoryId === "animations" && (
          <g>
            {/* Back squircle */}
            <rect x="18" y="10" width="70" height="70" rx="22" fill="url(#anBack)" opacity="0.85" />
            {/* Front squircle */}
            <rect x="12" y="16" width="70" height="70" rx="22" fill="url(#anFront)" />
            {/* Yellow Smiley Face Badge */}
            <circle cx="47" cy="51" r="23" fill="#facc15" stroke="#eab308" strokeWidth="1.5" />
            {/* Eyes */}
            <ellipse cx="39" cy="46" rx="2.5" ry="3.8" fill="#581c87" />
            <ellipse cx="55" cy="46" rx="2.5" ry="3.8" fill="#581c87" />
            {/* Smile */}
            <path d="M37,55 C41,63 53,63 57,55" fill="none" stroke="#581c87" strokeWidth="3" strokeLinecap="round" />
            {/* Peel corner effect */}
            <path d="M59,60 Q65,60 69,57 Q69,67 59,71 Z" fill="#ffffff" filter="drop-shadow(-1px -1px 2px rgba(0,0,0,0.25))" />
          </g>
        )}

        {/* ══════════════════ 5. PHOTOS ══════════════════ */}
        {categoryId === "photos" && (
          <g>
            {/* Back squircle */}
            <rect x="18" y="10" width="70" height="70" rx="22" fill="url(#phBack)" opacity="0.85" />
            {/* Front squircle */}
            <rect x="12" y="16" width="70" height="70" rx="22" fill="url(#phFront)" />
            {/* Photo Card with White Border */}
            <rect x="25" y="27" width="44" height="48" rx="5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
            {/* Image content inside photo */}
            <g clipPath="url(#photoClip)">
              <clipPath id="photoClip">
                <rect x="27" y="29" width="40" height="44" rx="3.5" />
              </clipPath>
              {/* Sky background */}
              <rect x="27" y="29" width="40" height="44" fill="#38bdf8" />
              {/* Fluffy white clouds */}
              <circle cx="34" cy="38" r="7" fill="#ffffff" opacity="0.8" />
              <circle cx="44" cy="36" r="9" fill="#ffffff" opacity="0.8" />
              <circle cx="56" cy="39" r="6" fill="#ffffff" opacity="0.8" />
              {/* Woman silhouette / portrait looking up */}
              <circle cx="48" cy="47" r="6.5" fill="#fed7aa" />
              {/* Hair */}
              <path d="M42,48 C42,42 46,39 52,40 C57,41 57,46 56,53 C52,50 45,51 42,48 Z" fill="#78350f" />
              {/* Body / Shirt */}
              <path d="M37,70 C37,59 44,56 48,56 C52,56 59,59 59,70 Z" fill="#ffffff" />
            </g>
          </g>
        )}

        {/* ══════════════════ 6. FRAMES ══════════════════ */}
        {categoryId === "frames" && (
          <g>
            {/* Back squircle */}
            <rect x="18" y="10" width="70" height="70" rx="22" fill="url(#frBack)" opacity="0.85" />
            {/* Front squircle */}
            <rect x="12" y="16" width="70" height="70" rx="22" fill="url(#frFront)" />
            {/* Canva Landscape Cloud Mask */}
            <g clipPath="url(#frameCloudClip)">
              <clipPath id="frameCloudClip">
                <path d="M37,42 C33,42 30,45 30,49 C27,49 25,52 25,55 C25,59 28,62 32,62 L62,62 C66,62 69,59 69,55 C69,52 67,49 64,49 C64,44 60,40 55,40 C53,40 51,41 49,42 C47,38 42,38 39,41 C38,41 37,42 37,42 Z" />
              </clipPath>
              {/* Sky inside cloud */}
              <rect x="22" y="32" width="50" height="35" fill="#7dd3fc" />
              <circle cx="38" cy="46" r="5" fill="#ffffff" opacity="0.7" />
              {/* Green Rolling Hills */}
              <path d="M22,54 Q35,48 48,53 Q60,49 72,57 L72,66 L22,66 Z" fill="#22c55e" />
              <path d="M22,57 Q42,52 62,56 L72,66 L22,66 Z" fill="#15803d" opacity="0.6" />
            </g>
            {/* White outline around cloud frame */}
            <path
              d="M37,42 C33,42 30,45 30,49 C27,49 25,52 25,55 C25,59 28,62 32,62 L62,62 C66,62 69,59 69,55 C69,52 67,49 64,49 C64,44 60,40 55,40 C53,40 51,41 49,42 C47,38 42,38 39,41 C38,41 37,42 37,42 Z"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* ══════════════════ 7. GRIDS ══════════════════ */}
        {categoryId === "grids" && (
          <g>
            {/* Back squircle */}
            <rect x="18" y="10" width="70" height="70" rx="22" fill="url(#grBack)" opacity="0.85" />
            {/* Front squircle */}
            <rect x="12" y="16" width="70" height="70" rx="22" fill="url(#grFront)" />
            {/* White Grid Container with 4 cells */}
            <rect x="25" y="29" width="44" height="44" rx="4" fill="#ffffff" />
            {/* Cell 1: top-left */}
            <rect x="27" y="31" width="19" height="19" rx="2" fill="#7dd3fc" />
            <path d="M27,44 Q36,39 46,45 L46,50 L27,50 Z" fill="#4ade80" />
            {/* Cell 2: top-right */}
            <rect x="48" y="31" width="19" height="19" rx="2" fill="#7dd3fc" />
            <path d="M48,43 Q58,38 67,44 L67,50 L48,50 Z" fill="#22c55e" />
            {/* Cell 3: bottom-left */}
            <rect x="27" y="52" width="19" height="19" rx="2" fill="#7dd3fc" />
            <path d="M27,65 Q37,60 46,66 L46,71 L27,71 Z" fill="#16a34a" />
            {/* Cell 4: bottom-right */}
            <rect x="48" y="52" width="19" height="19" rx="2" fill="#7dd3fc" />
            <path d="M48,64 Q57,59 67,65 L67,71 L48,71 Z" fill="#15803d" />
          </g>
        )}

        {/* ══════════════════ 8. FORMS ══════════════════ */}
        {categoryId === "forms" && (
          <g>
            {/* Back squircle */}
            <rect x="18" y="10" width="70" height="70" rx="22" fill="url(#fmBack)" opacity="0.85" />
            {/* Front squircle */}
            <rect x="12" y="16" width="70" height="70" rx="22" fill="url(#fmFront)" />
            {/* Top Toggle Switch (light green pill with round dot) */}
            <rect x="25" y="33" width="44" height="20" rx="10" fill="#a7f3d0" />
            <circle cx="35" cy="43" r="7" fill="#059669" />
            {/* Bottom Button with Checkmark (darker green pill with white tick) */}
            <rect x="25" y="58" width="44" height="20" rx="10" fill="#047857" />
            <path d="M38,68 L44,73 L55,63" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

        {/* ══════════════════ 9. MOCKUPS ══════════════════ */}
        {categoryId === "mockups" && (
          <g>
            {/* Back squircle */}
            <rect x="18" y="10" width="70" height="70" rx="22" fill="url(#mkBack)" opacity="0.85" />
            {/* Front squircle */}
            <rect x="12" y="16" width="70" height="70" rx="22" fill="url(#mkFront)" />
            {/* White T-Shirt Mockup */}
            <path
              d="M37,34 C42,39 52,39 57,34 L71,44 L64,56 L58,52 L58,74 L36,74 L36,52 L30,56 L23,44 Z"
              fill="#ffffff"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
            />
            {/* Collar */}
            <path d="M37,34 C42,40 52,40 57,34" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
            {/* Graphic print on chest */}
            <rect x="41" y="47" width="12" height="12" rx="1.5" fill="#38bdf8" />
            <path d="M41,56 Q47,52 53,57 L53,59 L41,59 Z" fill="#22c55e" />
          </g>
        )}

        {/* ══════════════════ 10. CHARTS ══════════════════ */}
        {categoryId === "charts" && (
          <g>
            {/* Back squircle */}
            <rect x="18" y="10" width="70" height="70" rx="22" fill="url(#chBack)" opacity="0.85" />
            {/* Front squircle */}
            <rect x="12" y="16" width="70" height="70" rx="22" fill="url(#chFront)" />
            {/* Chart White Card */}
            <rect x="25" y="29" width="44" height="44" rx="5" fill="#ffffff" />
            {/* Grid line */}
            <line x1="28" y1="42" x2="66" y2="42" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="2,2" />
            <line x1="28" y1="56" x2="66" y2="56" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="2,2" />
            <line x1="47" y1="30" x2="47" y2="72" stroke="#64748b" strokeWidth="0.8" strokeDasharray="2,2" />
            {/* Area Curve 1 (Violet) */}
            <path d="M28,64 Q37,45 47,52 T66,38 L66,70 L28,70 Z" fill="#c084fc" opacity="0.65" />
            <path d="M28,64 Q37,45 47,52 T66,38" fill="none" stroke="#a855f7" strokeWidth="1.8" />
            {/* Area Curve 2 (Cyan) */}
            <path d="M28,58 Q37,62 47,40 T66,48 L66,70 L28,70 Z" fill="#67e8f9" opacity="0.55" />
            <path d="M28,58 Q37,62 47,40 T66,48" fill="none" stroke="#06b6d4" strokeWidth="1.8" />
            {/* Dots */}
            <circle cx="47" cy="52" r="2.2" fill="#7c3aed" stroke="#ffffff" strokeWidth="1" />
            <circle cx="47" cy="40" r="2.2" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
          </g>
        )}

        {/* ══════════════════ 11. SHEETS ══════════════════ */}
        {categoryId === "sheets" && (
          <g>
            {/* Back squircle */}
            <rect x="18" y="10" width="70" height="70" rx="22" fill="url(#shsBack)" opacity="0.85" />
            {/* Front squircle */}
            <rect x="12" y="16" width="70" height="70" rx="22" fill="url(#shsFront)" />
            {/* Spreadsheet Card */}
            <rect x="25" y="29" width="44" height="46" rx="5" fill="#f1f5f9" />
            {/* Top Bar with f(x) */}
            <rect x="25" y="29" width="44" height="12" rx="4" fill="#3b82f6" />
            <text x="31" y="38" fontFamily="Inter, sans-serif" fontSize="7" fontWeight="bold" fill="#ffffff">
              f(x)
            </text>
            {/* Vertical column divider */}
            <line x1="47" y1="41" x2="47" y2="75" stroke="#cbd5e1" strokeWidth="1" />
            {/* Horizontal row dividers */}
            <line x1="25" y1="52" x2="69" y2="52" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="25" y1="63" x2="69" y2="63" stroke="#cbd5e1" strokeWidth="1" />
            {/* Cells pill fills */}
            <rect x="50" y="44" width="16" height="5" rx="1.5" fill="#93c5fd" />
            <rect x="50" y="55" width="16" height="5" rx="1.5" fill="#93c5fd" />
            <rect x="50" y="66" width="16" height="5" rx="1.5" fill="#93c5fd" />
          </g>
        )}

        {/* ══════════════════ 12. TABLES ══════════════════ */}
        {categoryId === "tables" && (
          <g>
            {/* Back squircle */}
            <rect x="18" y="10" width="70" height="70" rx="22" fill="url(#tbBack)" opacity="0.85" />
            {/* Front squircle */}
            <rect x="12" y="16" width="70" height="70" rx="22" fill="url(#tbFront)" />
            {/* Table Matrix Card */}
            <rect x="26" y="30" width="44" height="42" rx="5" fill="#ffffff" stroke="#f97316" strokeWidth="1.5" />
            {/* Orange Header Row */}
            <rect x="26" y="30" width="44" height="11" rx="4" fill="#ea580c" />
            {/* Vertical column divider */}
            <line x1="48" y1="30" x2="48" y2="72" stroke="#f97316" strokeWidth="1.2" />
            {/* Horizontal row dividers */}
            <line x1="26" y1="51" x2="70" y2="51" stroke="#fed7aa" strokeWidth="1" />
            <line x1="26" y1="62" x2="70" y2="62" stroke="#fed7aa" strokeWidth="1" />
          </g>
        )}
      </svg>
    </div>
  );
}
