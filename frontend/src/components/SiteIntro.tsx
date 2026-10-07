import { useEffect, useRef, useState } from "react";
import Head from "next/head";

/** Remembered for the browser session, so the intro plays once per visit and not on every return to the homepage */
const SEEN_KEY = "falcon_intro_seen";

const LOGO = "/intro/falcon-mark.webp";
const LOGO_FULL = "/intro/falcon-mark-full.png";

/*
 * Every rule is scoped to #falcon-intro and every animation name starts with
 * "fin-", so the intro cannot restyle the page under it.
 */
const INTRO_CSS = `
html[data-falcon-intro-seen] #falcon-intro{display:none}
#falcon-intro{--blue:#3b6cf5;--dark:#08070b;--ink:#111;position:fixed;inset:0;z-index:100000;transition:opacity .6s;background:#000;font-family:Poppins,"Segoe UI",system-ui,sans-serif;box-sizing:border-box}
#falcon-intro *{box-sizing:border-box;margin:0}
#falcon-intro.done{opacity:0;pointer-events:none}
#falcon-intro .stage{position:absolute;inset:0}
#falcon-intro .sc{position:absolute;inset:0;display:grid;place-items:center;text-align:center;overflow:hidden}
#falcon-intro .sc.fin{animation:fin-fi .5s ease-out both}
@keyframes fin-fi{from{opacity:0}to{opacity:1}}
#falcon-intro .light{background:radial-gradient(ellipse at 50% 45%,#fff 25%,#d9d9de 100%);color:var(--ink)}
#falcon-intro .dark{background:var(--dark);color:#fff}
#falcon-intro .row{display:flex;align-items:center;justify-content:center;gap:.35em;font-size:clamp(1.4rem,6.2vw,2.6rem);font-weight:500;white-space:nowrap}
#falcon-intro .row .w{display:inline-block;opacity:0;animation:fin-up .45s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes fin-up{from{opacity:0;transform:translateY(.6em)}to{opacity:1;transform:none}}
#falcon-intro .lg{height:1.6em;width:1.6em;object-fit:contain;mix-blend-mode:screen}
#falcon-intro .rev{display:inline-block;clip-path:inset(0 100% 0 0);animation:fin-revl .8s .1s cubic-bezier(.6,0,.2,1) forwards}
@keyframes fin-revl{to{clip-path:inset(0 0 0 0)}}
#falcon-intro .hiw{position:relative;display:inline-block;line-height:1.15;font-size:clamp(1.8rem,7vw,2.6rem);font-weight:600;animation:fin-grow 1.1s 1.2s cubic-bezier(.4,0,.2,1) forwards}
@keyframes fin-grow{to{font-size:clamp(3.6rem,17vw,6rem)}}
#falcon-intro .hi{opacity:0;animation:fin-fi .3s 1.2s forwards}
#falcon-intro .hiw i,#falcon-intro .lbl{opacity:0;animation:fin-fi .3s 1.2s forwards}
#falcon-intro .gh{position:absolute;left:-100vw;width:300vw;height:1px;background:#cfcfd4}
#falcon-intro .gh.a{top:0}
#falcon-intro .gh.b{bottom:0}
#falcon-intro .gv{position:absolute;top:-100vh;height:300vh;width:1px;background:#cfcfd4}
#falcon-intro .gv.a{left:0}
#falcon-intro .gv.b{right:0}
#falcon-intro .lbl{position:absolute;left:100%;top:-14px;font:500 9px/1 Poppins,sans-serif;color:#999;white-space:nowrap;margin-left:6px}
#falcon-intro .cur{position:absolute;right:-12px;bottom:-20px;width:30px;height:30px;filter:drop-shadow(0 3px 4px rgba(20,30,100,.35));animation:fin-fly 1.2s cubic-bezier(.45,0,.2,1) both}
@keyframes fin-fly{0%{transform:translate(45vw,-55vh) rotate(-28deg)}55%{transform:translate(12vw,-14vh) rotate(12deg)}100%{transform:none}}
#falcon-intro .dot{position:absolute;width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#8aaaff,#2a4fd6);box-shadow:0 0 12px rgba(59,108,245,.5);animation:fin-dotfly 1.1s .6s both}
@keyframes fin-dotfly{0%{left:28%;top:80%;opacity:0}15%{opacity:1}55%{left:20%;top:32%}85%{left:49%;top:24%;opacity:1}100%{left:49%;top:24%;opacity:0}}
#falcon-intro .yt{font-size:clamp(1.8rem,7vw,2.8rem);font-weight:400}
#falcon-intro .yt.it{font-style:italic;font-weight:700}
#falcon-intro .yt.b{font-weight:700}
#falcon-intro .yt.sm{font-size:clamp(1.1rem,4.4vw,1.6rem);font-weight:500;font-style:normal}
#falcon-intro .wd{display:inline-block;overflow:hidden;height:1.5em;line-height:1.5em;vertical-align:bottom}
#falcon-intro .wd span{display:inline-block;color:#4a86f0;font-style:italic;animation:fin-sl .45s cubic-bezier(.2,.8,.2,1) both}
@keyframes fin-sl{from{transform:translateY(100%)}to{transform:none}}
#falcon-intro .end{width:min(46vw,230px);height:min(46vw,230px);object-fit:contain;animation:fin-es 1s both}
@keyframes fin-es{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}
#falcon-intro .skip{position:absolute;right:1rem;top:calc(env(safe-area-inset-top,0px) + 1rem);z-index:5;background:none;border:1px solid #fff;color:#fff;mix-blend-mode:difference;padding:.45rem .9rem;border-radius:99px;font:inherit;font-size:.8rem;cursor:pointer}
#falcon-intro .skip:focus-visible{outline:2px solid var(--blue);outline-offset:3px}
@media (prefers-reduced-motion:reduce){#falcon-intro .sc.fin,#falcon-intro .cur,#falcon-intro .dot,#falcon-intro .hiw,#falcon-intro .hi,#falcon-intro .end,#falcon-intro .rev,#falcon-intro .row .w{animation-duration:.01s!important;animation-delay:0s!important}}
`;

/** Hides the intro before the first paint when it has already played this session */
const SEEN_SCRIPT = `try{if(sessionStorage.getItem(${JSON.stringify(SEEN_KEY)}))document.documentElement.setAttribute("data-falcon-intro-seen","")}catch(e){}`;

const CURSOR = '<svg class="cur" viewBox="0 0 24 24"><defs><linearGradient id="fin-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a6cf0"/><stop offset="1" stop-color="#1b2f9a"/></linearGradient></defs><path d="M3 2l0 18 5-4.5 3.5 6.5 3-1.6-3.5-6.4 7 0z" fill="url(#fin-g)"/></svg>';

/**
 * The opening animation of the site: a short sequence of screens that ends on
 * the Falcon mark and then fades to the page. It plays once per browser
 * session and can be skipped.
 */
export default function SiteIntro() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const finish = useRef<() => void>(() => undefined);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const intro = root.current;
    const st = stage.current;
    if (!intro || !st) return;

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

    const timers: ReturnType<typeof setTimeout>[] = [];
    let frame = 0;
    let closed = false;
    const at = (ms: number, run: () => void) => { timers.push(setTimeout(run, ms)); };

    /** Shows one screen, removing the one before it once any cross-fade is over */
    const go = (cls: string, html: string): HTMLDivElement => {
      const node = document.createElement("div");
      const fades = /fin/.test(cls);
      node.className = `sc ${cls}`;
      node.innerHTML = html;
      const previous = Array.from(st.children);
      st.appendChild(node);
      timers.push(setTimeout(() => previous.forEach((p) => p.remove()), fades ? 520 : 0));
      return node;
    };
    const words = (text: string, delay: number) =>
      text.split(" ").map((word, i) => `<span class="w" style="animation-delay:${(delay + i * 0.1).toFixed(2)}s">${word}</span>`).join("");
    const setWord = (word: string) => {
      const slot = st.querySelector(".wd");
      if (slot) slot.innerHTML = `<span>${word}</span>`;
    };
    const endLogo = (cls: string) => go(cls, `<img class="end" src="${LOGO_FULL}" alt="Falcon">`);

    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const hide = () => {
      if (closed) return;
      closed = true;
      timers.forEach(clearTimeout);
      cancelAnimationFrame(frame);
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

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      endLogo("light");
      at(1500, hide);
    } else {
      const first = go("light", `<div class="hiw"><i class="gh a"></i><i class="gh b"></i><i class="gv a"></i><i class="gv b"></i><span class="lbl"></span><span class="hi">Hi</span>${CURSOR}</div>`);
      const box = first.querySelector<HTMLElement>(".hiw");
      const label = first.querySelector<HTMLElement>(".lbl");
      // The little size readout follows the word as it grows, like a design tool's selection box
      const tick = () => {
        if (!box || !label || !document.body.contains(box)) return;
        const r = box.getBoundingClientRect();
        label.textContent = `${Math.round(r.width)} × ${Math.round(r.height)}`;
        frame = requestAnimationFrame(tick);
      };
      tick();

      at(2200, () => go("dark", `<div class="row">${words("This is Falcon", 0)}<img class="lg w" style="animation-delay:.4s" src="${LOGO}" alt=""></div>`));
      at(2900, () => go("dark", `<div class="row"><img class="lg" src="${LOGO}" alt=""><span class="rev">Design with intelligence</span></div>`));
      at(3700, () => {
        const your = go("light fin", '<div class="dot"></div><div class="yt">Your</div>').querySelector<HTMLElement>(".yt");
        if (!your) return;
        at(700, () => { your.className = "yt it"; });
        at(1000, () => { your.className = "yt b"; });
        at(1600, () => { your.className = "yt sm"; your.textContent = "Smart"; });
      });
      at(5700, () => go("dark fin", '<div class="row"><span>Smart</span><span class="wd"><span>Design</span></span></div>'));
      at(6400, () => setWord("Workflow"));
      at(7200, () => setWord("Ideas"));
      at(7900, () => setWord("Decisions"));
      at(8800, () => endLogo("light fin"));
      at(10400, () => go("dark fin", ""));
      at(11000, hide);
    }

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(frame);
      document.body.style.overflow = overflow;
    };
  }, []);

  if (gone) return null;

  return (
    <>
      <Head>
        <link rel="preload" as="image" href={LOGO} />
        <link rel="preload" as="image" href={LOGO_FULL} />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;1,500;1,700&display=swap" rel="stylesheet" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: INTRO_CSS }} />
      <script dangerouslySetInnerHTML={{ __html: SEEN_SCRIPT }} />
      {/* The intro has its own light and dark screens, so the site's theme leaves it alone */}
      <div id="falcon-intro" ref={root} role="dialog" aria-label="Welcome" data-theme-keep="">
        <button type="button" className="skip" onClick={() => finish.current()}>Skip</button>
        <div className="stage" ref={stage} />
      </div>
    </>
  );
}
