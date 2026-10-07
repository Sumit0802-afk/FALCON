import { useEffect, useRef, useState } from "react";

/** Remembered for the browser session, so the intro plays once per visit and not on every return to the homepage */
const SEEN_KEY = "falcon_intro_seen";

/** The word is written in 1.6s and settles by 2s; it is then held for a moment before the page appears */
const HOLD_MS = 2900;

/*
 * Every rule is scoped to #falcon-intro and every animation name starts with
 * "fin-", so the intro cannot restyle the page under it.
 */
const INTRO_CSS = `
html[data-falcon-intro-seen] #falcon-intro{display:none}
#falcon-intro{position:fixed;inset:0;z-index:100000;display:grid;place-items:center;background:#0a0a0c;cursor:pointer;transition:opacity .6s;box-sizing:border-box;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}
#falcon-intro.done{opacity:0;pointer-events:none}
#falcon-intro svg{width:min(90vw,560px);height:auto;overflow:visible;filter:drop-shadow(0 8px 14px rgba(90,80,160,.22))}
#falcon-intro .fin-p{stroke-dasharray:1 1;stroke-dashoffset:1;animation:fin-w 1.5s .1s cubic-bezier(.5,.05,.3,1) forwards,fin-up .4s 1.6s ease-out forwards}
#falcon-intro .fin-b{stroke-dasharray:1 1;stroke-dashoffset:1;animation:fin-w .25s .5s ease-out forwards,fin-up .4s 1.6s ease-out forwards}
@keyframes fin-w{to{stroke-dashoffset:0}}
@keyframes fin-up{to{transform:translateY(-3px)}}
@media (prefers-reduced-motion:reduce){#falcon-intro .fin-p,#falcon-intro .fin-b{animation:none;stroke-dashoffset:0}}
`;

/** Hides the intro before the first paint when it has already played this session */
const SEEN_SCRIPT = `try{if(sessionStorage.getItem(${JSON.stringify(SEEN_KEY)}))document.documentElement.setAttribute("data-falcon-intro-seen","")}catch(e){}`;

const SCRIPT_PATH =
  "M26 120 C40 116 54 80 62 44 C66 26 64 12 56 14 C46 16 50 44 54 76 C57 104 58 130 52 146 C46 160 28 156 31 144 C34 132 52 122 66 118 C74 116 80 114 84 112 C94 102 104 82 120 80 C138 78 142 104 126 114 C112 122 98 110 104 94 C108 84 120 78 134 78 C138 78 138 100 138 112 C140 120 150 122 158 108 C168 84 178 44 184 28 C188 16 176 14 174 32 C170 60 166 96 174 116 C179 126 190 120 198 106 C204 92 214 80 226 80 C214 80 204 92 204 102 C204 116 220 122 234 108 C242 92 252 82 266 82 C284 82 288 106 274 114 C260 122 244 110 250 96 C254 86 266 82 280 82 C290 82 296 84 302 80 C306 80 308 100 308 114 C310 100 318 80 332 80 C348 80 346 104 342 114 C340 122 350 122 360 112 C366 106 370 102 374 98";

/**
 * The opening animation of the site: the word "falcon" written out in one
 * coloured stroke, which then fades to the page. It plays once per browser
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
        <svg viewBox="0 0 400 175" role="img" aria-label="falcon">
          <defs>
            <linearGradient id="fin-g" gradientUnits="userSpaceOnUse" x1="18" x2="374" y1="0" y2="0">
              <stop offset="0" stopColor="#1b9aa6" />
              <stop offset=".17" stopColor="#6fd68c" />
              <stop offset=".32" stopColor="#ffd23f" />
              <stop offset=".5" stopColor="#ff8a3d" />
              <stop offset=".63" stopColor="#e8403a" />
              <stop offset=".8" stopColor="#9b59d0" />
              <stop offset="1" stopColor="#4a7bf0" />
            </linearGradient>
          </defs>
          <path className="fin-p" pathLength={1} fill="none" stroke="url(#fin-g)" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" d={SCRIPT_PATH} />
          <path className="fin-b" pathLength={1} fill="none" stroke="url(#fin-g)" strokeWidth={9} strokeLinecap="round" d="M34 90 C46 88 60 86 78 84" />
        </svg>
      </div>
    </>
  );
}
