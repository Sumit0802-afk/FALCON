import { useEffect, useRef, useState } from "react";

/** Remembered for the browser session, so the intro plays once per visit and not on every return to the homepage */
const SEEN_KEY = "falcon_intro_seen";

/** The word is written in about 2.2s; it is then held for a moment before the page appears */
const HOLD_MS = 3400;

/*
 * Every rule is scoped to #falcon-intro and every animation name starts with
 * "fin-", so the intro cannot restyle the page under it.
 */
const INTRO_CSS = `
html[data-falcon-intro-seen] #falcon-intro{display:none}
#falcon-intro{position:fixed;inset:0;z-index:100000;display:grid;place-items:center;background:#0a0a0c;cursor:pointer;transition:opacity .6s;box-sizing:border-box;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}
#falcon-intro.done{opacity:0;pointer-events:none}
#falcon-intro svg{width:min(90vw,560px);height:auto;overflow:visible;filter:drop-shadow(0 8px 14px rgba(90,80,160,.22))}
#falcon-intro .fin-s{stroke-dasharray:1 1;stroke-dashoffset:1;opacity:0;animation:fin-w ease-in-out forwards}
#falcon-intro .fin-word{animation:fin-up .4s 2.25s ease-out forwards}
@keyframes fin-w{from{opacity:1}to{stroke-dashoffset:0;opacity:1}}
@keyframes fin-up{to{transform:translateY(-3px)}}
@media (prefers-reduced-motion:reduce){#falcon-intro .fin-s,#falcon-intro .fin-word{animation:none;stroke-dashoffset:0;opacity:1}}
`;

/** Hides the intro before the first paint when it has already played this session */
const SEEN_SCRIPT = `try{if(sessionStorage.getItem(${JSON.stringify(SEEN_KEY)}))document.documentElement.setAttribute("data-falcon-intro-seen","")}catch(e){}`;

/**
 * The word in separate pen strokes, in the order a hand writes them:
 * the path, when it starts and how long it takes, in seconds.
 */
const STROKES: [string, number, number][] = [
  ["M83 55 C90 40 94 22 88 16 C82 10 74 18 70 30 C62 56 54 86 49 101 C44 122 40 150 33 170 C29 180 18 178 17 164 C16 152 20 142 24 135", 0.1, 0.5],
  ["M34 102 C50 99 70 95 88 92", 0.62, 0.16],
  ["M112 108 C104 92 86 98 82 124 C79 146 86 160 96 154 C106 148 114 124 119 96 C116 118 112 140 111 158", 0.82, 0.36],
  ["M157 44 C152 80 144 125 138 157", 1.22, 0.16],
  ["M196 104 C192 94 180 98 174 116 C167 136 170 157 182 157 C190 157 196 153 200 149", 1.42, 0.22],
  ["M232 108 C220 100 210 116 210 134 C210 150 220 159 230 155 C242 150 248 127 240 112 C234 102 224 108 226 118", 1.68, 0.26],
  ["M270 157 C270 136 272 112 277 104 C282 98 285 120 285 152 C288 126 300 100 314 100 C328 100 338 114 342 130 C345 142 348 152 349 158", 1.98, 0.3],
];

/**
 * The opening animation of the site: the word "falcon" written by hand, letter
 * by letter, which then fades to the page. It plays once per browser
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
            <linearGradient id="fin-g" gradientUnits="userSpaceOnUse" x1="14" x2="360" y1="0" y2="0">
              <stop offset="0" stopColor="#1b9aa6" />
              <stop offset=".17" stopColor="#6fd68c" />
              <stop offset=".32" stopColor="#ffd23f" />
              <stop offset=".5" stopColor="#ff8a3d" />
              <stop offset=".63" stopColor="#e8403a" />
              <stop offset=".8" stopColor="#9b59d0" />
              <stop offset="1" stopColor="#4a7bf0" />
            </linearGradient>
          </defs>
          <g className="fin-word" fill="none" stroke="url(#fin-g)" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
            {STROKES.map(([d, delay, duration]) => (
              <path key={d} className="fin-s" pathLength={1} d={d} style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s` }} />
            ))}
          </g>
        </svg>
      </div>
    </>
  );
}
