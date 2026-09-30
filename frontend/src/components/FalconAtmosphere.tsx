import React from "react";

export default function FalconAtmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#000000]">
      {/* =========================================================
          NEXT.JS SIGNATURE PITCH BLACK BASE
      ========================================================== */}
      <div className="absolute inset-0 bg-[#000000]" />

      {/* =========================================================
          NEXT.JS SIGNATURE SUBTLE HAIRLINE GEOMETRIC GRID
      ========================================================== */}
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 50% at 50% 0%, #000 35%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 50% at 50% 0%, #000 35%, transparent 100%)",
        }}
      />

      {/* =========================================================
          NEXT.JS APEX CONE GLOW (TOP-CENTER LIGHT SOURCE)
      ========================================================== */}
      <div
        className="absolute left-1/2 top-[-100px] h-[550px] w-[900px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(120, 119, 198, 0.14) 0%, rgba(56, 189, 248, 0.08) 35%, transparent 70%)",
        }}
      />

      {/* =========================================================
          SUBTLE SECONDARY AMBIENT LIGHT
      ========================================================== */}
      <div
        className="absolute left-1/2 top-[45%] h-[500px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px] opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(56, 189, 248, 0.05) 0%, rgba(99, 102, 241, 0.04) 40%, transparent 75%)",
        }}
      />
    </div>
  );
}