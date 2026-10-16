import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const OPEN_EVENT = "falcon:watch-demo";

// The number changes with each new recording, so a browser does not keep playing the last one
const VIDEO = "/demo/falcon-demo.mp4?v=4";
const POSTER = "/demo/falcon-demo-poster.jpg?v=4";

/** Opens the demo video from any "Watch demo" button on a page that shows <DemoVideo /> */
export function openDemoVideo(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(OPEN_EVENT));
}

/**
 * The player behind the "Watch demo" buttons: a tour of Falcon recorded from
 * the site itself. It is placed once on a page and opened with openDemoVideo().
 */
export default function DemoVideo() {
  const [open, setOpen] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, show);
    return () => window.removeEventListener(OPEN_EVENT, show);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeButton.current?.focus();
    // Browsers may refuse to start a video on their own; the controls are there either way
    video.current?.play().catch(() => undefined);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Falcon demo video"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="relative w-full max-w-[1080px]">

        <button
          ref={closeButton}
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close the demo video"
          className="absolute -top-12 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.06] text-zinc-300 transition hover:bg-white/[0.12] hover:text-white"
        >
          <X size={16} />
        </button>

        {/* The recording keeps its own colours, so the site's light theme leaves it alone */}
        <div data-theme-keep="" className="overflow-hidden rounded-2xl border border-white/[0.12] bg-black shadow-[0_30px_120px_rgba(0,0,0,0.7)]">
          <video
            ref={video}
            src={VIDEO}
            poster={POSTER}
            controls
            playsInline
            preload="metadata"
            className="block aspect-video w-full bg-black"
          >
            Your browser cannot play this video. <a href={VIDEO}>Download the Falcon demo</a>.
          </video>
        </div>

        <p className="mt-4 text-center text-[12px] text-zinc-500">
          A two-minute tour: signing in, templates, the email designer, AI Studio making a whole presentation, the editor, Brand Kit and QR codes.
        </p>

      </div>
    </div>
  );
}
