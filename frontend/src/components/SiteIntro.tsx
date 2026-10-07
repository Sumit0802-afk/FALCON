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
  "M26 120 C40 116 54 75 62 44 C66 26 64 12 56 14 C46 16 50 44 54 71 C57 102 58 130 52 146 C46 160 28 156 31 144 C34 132 52 122 66 118 C74 116 80 113 84 111 C96 104 109 80 126 80 C111 73 94 86 94 102 C94 116 106 122 116 118 C126 113 131 98 131 82 C131 93 129 111 136 118 C144 122 153 116 161 107 C173 91 186 56 188 36 C191 20 178 16 176 30 C171 56 171 93 176 111 C178 120 188 122 198 111 C208 100 220 77 238 80 C223 75 210 89 210 102 C210 116 223 122 235 118 C245 113 253 107 258 100 C263 91 272 80 285 82 C272 75 260 89 260 102 C260 116 272 122 282 118 C295 113 297 93 287 82 C295 89 307 89 317 82 C322 80 327 82 327 93 C327 104 327 113 327 118 C327 102 339 80 354 80 C369 80 369 98 367 109 C364 120 374 122 387 113 C394 107 401 100 409 93";

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
        <svg viewBox="0 0 440 175" role="img" aria-label="falcon">
          <defs>
            <linearGradient id="fin-g" gradientUnits="userSpaceOnUse" x1="18" x2="410" y1="0" y2="0">
              <stop offset="0" stopColor="#1b9aa6" />
              <stop offset=".17" stopColor="#6fd68c" />
              <stop offset=".32" stopColor="#ffd23f" />
              <stop offset=".5" stopColor="#ff8a3d" />
              <stop offset=".63" stopColor="#e8403a" />
              <stop offset=".8" stopColor="#9b59d0" />
              <stop offset="1" stopColor="#4a7bf0" />
            </linearGradient>
          </defs>
          <path className="fin-p" pathLength={1} fill="none" stroke="url(#fin-g)" strokeWidth={7.5} strokeLinecap="round" strokeLinejoin="round" d={SCRIPT_PATH} />
          <path className="fin-b" pathLength={1} fill="none" stroke="url(#fin-g)" strokeWidth={7.5} strokeLinecap="round" d="M34 88 C46 86 60 84 78 82" />
        </svg>
      </div>
    </>
  );
}
