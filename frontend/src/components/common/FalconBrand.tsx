import React from "react";

interface FalconBrandProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showName?: boolean;
  showLogo?: boolean;
  stacked?: boolean;
  className?: string;
  nameClassName?: string;
  glow?: boolean;
  logoColor?: "white" | "cyan";
  theme?: "dark" | "light";
}

export function FalconBrand({
  size = "md",
  showName = true,
  showLogo = true,
  stacked = false,
  className = "",
  nameClassName = "",
  glow = true,
  logoColor = "white",
}: FalconBrandProps) {
  const sizeMap = {
    xs: { logo: "h-6 w-6", text: "text-xs tracking-wider", gap: "gap-1.5" },
    sm: { logo: "h-7 w-7", text: "text-xs tracking-wider font-extrabold", gap: "gap-2" },
    md: { logo: "h-8 w-8", text: "text-sm font-black tracking-wider", gap: "gap-2.5" },
    lg: { logo: "h-11 w-11", text: "text-base font-black tracking-widest", gap: "gap-3" },
    xl: { logo: "h-14 w-14", text: "text-xl font-black tracking-widest", gap: "gap-3.5" },
  };

  const currentSize = sizeMap[size];

  const logoSrc =
    logoColor === "white"
      ? "/falcon-logo-white.png"
      : "/falcon-logo.png";

  const glowStyle = glow
    ? logoColor === "white"
      ? "drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]"
      : "drop-shadow-[0_0_12px_rgba(6,182,212,0.45)]"
    : "";

  return (
    <div
      className={`inline-flex items-center ${
        stacked ? "flex-col justify-center text-center" : "flex-row"
      } ${currentSize.gap} ${className}`}
    >
      {showLogo && (
        <img
          src={logoSrc}
          alt="Falcon Logo"
          className={`${currentSize.logo} object-contain transition-transform duration-200 select-none ${glowStyle}`}
        />
      )}
      {showName && (
        <span
          className={`font-sans font-black uppercase select-none transition-colors ${currentSize.text} ${
            nameClassName || "text-cyan-400"
          }`}
        >
          FALCON
        </span>
      )}
    </div>
  );
}

export default FalconBrand;
