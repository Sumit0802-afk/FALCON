import type { AppProps } from "next/app";
import "@/styles/globals.css";
import FalconAtmosphere from "@/components/FalconAtmosphere";

export default function App({
  Component,
  pageProps,
}: AppProps) {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat text-white"
      style={{
        backgroundImage: "url('/site-bg.jpg')",
        backgroundAttachment: "fixed",
      }}
    >

      {/* GLOBAL FALCON ATMOSPHERE */}
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        <FalconAtmosphere />
      </div>

      {/* ALL PAGE CONTENT */}
      <div className="relative z-[10] min-h-screen">
        <Component {...pageProps} />
      </div>

    </div>
  );
}