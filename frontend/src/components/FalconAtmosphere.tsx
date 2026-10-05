import React from "react";

export default function FalconAtmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#000000]">
      {/* =========================================================
          UPLOADED BACKGROUND TEXTURE
      ========================================================== */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/site-bg.jpg')",
          backgroundAttachment: "fixed",
        }}
      />
    </div>
  );
}