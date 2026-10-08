import { useEffect, useRef, useState } from "react";

/** Remembered for the browser session, so the intro plays once per visit and not on every return to the homepage */
const SEEN_KEY = "falcon_intro_seen";

/** The word is written in about 1.9s; it is then held for a moment before the page appears */
const HOLD_MS = 3000;

/*
 * Every rule is scoped to #falcon-intro and every animation name starts with
 * "fin-", so the intro cannot restyle the page under it.
 */
const INTRO_CSS = `
html[data-falcon-intro-seen] #falcon-intro{display:none}
#falcon-intro{position:fixed;inset:0;z-index:100000;display:grid;place-items:center;background:#000;cursor:pointer;transition:opacity .6s;box-sizing:border-box;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}
#falcon-intro.done{opacity:0;pointer-events:none}
#falcon-intro svg{width:min(92vw,600px);height:auto;overflow:visible;filter:drop-shadow(0 0 6px rgba(170,120,255,.4))}
#falcon-intro .fin-s{fill:none;stroke:url(#fin-g);stroke-width:8;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1 1;stroke-dashoffset:1;animation:fin-w var(--d) var(--t) cubic-bezier(.45,.05,.3,1) forwards}
#falcon-intro .fin-s.fin-t{stroke-width:5.5}
@keyframes fin-w{to{stroke-dashoffset:0}}
#falcon-intro .fin-eye{fill:url(#fin-g);transform-box:fill-box;transform-origin:center;transform:scale(0);animation:fin-pop .2s 1.45s cubic-bezier(.3,1.7,.5,1) forwards}
#falcon-intro .fin-eye.fin-b{animation-delay:1.52s}
@keyframes fin-pop{to{transform:scale(1)}}
#falcon-intro .fin-sp{fill:#fff;opacity:0;transform-box:fill-box;transform-origin:center;animation:fin-tw .4s 1}
@keyframes fin-tw{0%,100%{opacity:0;transform:scale(0) rotate(0)}50%{opacity:1;transform:scale(1) rotate(90deg)}}
@media (prefers-reduced-motion:reduce){#falcon-intro .fin-s{animation:none;stroke-dashoffset:0}#falcon-intro .fin-eye{animation:none;transform:none}#falcon-intro .fin-sp{animation:none;opacity:0}}
`;

/** Hides the intro before the first paint when it has already played this session */
const SEEN_SCRIPT = `try{if(sessionStorage.getItem(${JSON.stringify(SEEN_KEY)}))document.documentElement.setAttribute("data-falcon-intro-seen","")}catch(e){}`;

/** The pen strokes in the order they are written: the path, when it starts and how long it takes */
const STROKES: { d: string; start: string; time: string; thin?: boolean }[] = [
  { d: "M66 28 C66 14 56 8 46 12 C36 16 36 30 35 48 C33 82 32 122 28 144 C25 160 18 166 12 164 C7 162 8 154 10 150", start: ".05s", time: ".35s" },
  { d: "M15 104 C24 100 34 98 42 96 C50 94 56 92 60 90", start: ".4s", time: ".15s" },
  { d: "M96 108 C84 102 66 106 56 124 C48 140 50 160 64 162 C78 164 90 140 96 108 C98 130 98 150 104 160 C110 164 116 150 122 132 C134 100 152 50 164 28 C170 16 160 10 154 26 C146 48 142 100 138 130 C134 150 132 164 142 164 C150 164 160 150 166 138 C174 124 194 104 212 110 C200 106 182 116 182 136 C182 156 198 164 212 160 C220 156 230 148 234 136 C236 118 246 106 262 106 C278 106 290 120 290 134 C290 152 278 162 262 162 C246 162 234 152 234 138", start: ".5s", time: ".7s" },
  { d: "M293 112 C302 108 306 130 306 162 C308 140 316 108 332 108 C348 108 350 138 346 160 C344 168 350 170 358 162", start: "1.2s", time: ".25s" },
  // The smile inside the o, drawn after its eyes have appeared
  { d: "M250 140 C254 150 270 150 274 140", start: "1.6s", time: ".25s", thin: true },
];

const SPARKLE = "M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8Z";

/** Little stars that twinkle once as the word is finished: where, how large and when */
const SPARKLES: { x: number; y: number; scale: number; delay: string }[] = [
  { x: 356, y: 100, scale: 1, delay: "1.4s" },
  { x: 226, y: 92, scale: 0.8, delay: "1.5s" },
  { x: 10, y: 22, scale: 0.9, delay: "1.55s" },
  { x: 300, y: 70, scale: 0.7, delay: "1.6s" },
];

/**
 * The opening animation of the site: the word "falcon" written by hand in a
 * moving rainbow stroke, with a smiling face in its o. It then fades to the page. It plays once per browser
 * session and a click or key press skips it.
 */
export default function SiteIntro() {
  const root = useRef<HTMLDivElement>(null);
  const finish = useRef<() => void>(() => undefined);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const intro = root.current;
    if (!intro) return;

    let seen = false;
    try {
      seen = !!sessionStorage.getItem(SEEN_KEY);
    } catch {
      // Storage can be blocked; the intro then simply plays
    }
    if (seen) {
      setGone(true);
      return;
    }

    let closed = false;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const hide = () => {
      if (closed) return;
      closed = true;
      clearTimeout(timer);
      document.body.style.overflow = overflow;
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // Not remembered; it will play again next time
      }
      intro.classList.add("done");
      setTimeout(() => {
        document.documentElement.setAttribute("data-falcon-intro-seen", "");
        setGone(true);
      }, 650);
    };
    finish.current = hide;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(hide, still ? 1200 : HOLD_MS);
    const onKey = () => hide();
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, []);

  if (gone) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: INTRO_CSS }} />
      <script dangerouslySetInnerHTML={{ __html: SEEN_SCRIPT }} />
      {/* The intro keeps its own colours, so the site's theme leaves it alone */}
      <div id="falcon-intro" ref={root} role="dialog" aria-label="Welcome" data-theme-keep="" onClick={() => finish.current()}>
        <svg viewBox="0 0 380 190" role="img" aria-label="falcon">
          <defs>
            <linearGradient id="fin-g" gradientUnits="userSpaceOnUse" x1="10" x2="358" y1="0" y2="0" spreadMethod="repeat">
              <stop offset="0" stopColor="#19c3d1" />
              <stop offset=".15" stopColor="#6fe39a" />
              <stop offset=".3" stopColor="#ffd84a" />
              <stop offset=".45" stopColor="#ff9a3d" />
              <stop offset=".6" stopColor="#ff4d6d" />
              <stop offset=".75" stopColor="#c35cff" />
              <stop offset=".88" stopColor="#5b8cff" />
              <stop offset="1" stopColor="#19c3d1" />
              {/* The colours slide along the word once while it is being written */}
              <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="348 0" dur="2s" repeatCount="1" />
            </linearGradient>
          </defs>
          {STROKES.map((stroke) => (
            <path
              key={stroke.d}
              className={stroke.thin ? "fin-s fin-t" : "fin-s"}
              pathLength={1}
              d={stroke.d}
              style={{ "--t": stroke.start, "--d": stroke.time } as React.CSSProperties}
            />
          ))}
          <circle className="fin-eye" cx={253} cy={125} r={3.6} />
          <circle className="fin-eye fin-b" cx={271} cy={125} r={3.6} />
          {SPARKLES.map((sparkle) => (
            <g key={sparkle.delay} transform={`translate(${sparkle.x} ${sparkle.y}) scale(${sparkle.scale})`}>
              <path className="fin-sp" d={SPARKLE} style={{ animationDelay: sparkle.delay }} />
            </g>
          ))}
        </svg>
      </div>
    </>
  );
}
