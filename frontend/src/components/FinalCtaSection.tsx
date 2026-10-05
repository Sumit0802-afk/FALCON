import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

const PARTICLES = [
  { x: 12, y: 18, s: 1, o: 0.35, d: 0, f: 0.35, toward: false },
  { x: 22, y: 72, s: 1.2, o: 0.45, d: 1.1, f: 0.5, toward: true },
  { x: 8, y: 48, s: 0.8, o: 0.25, d: 2.4, f: 0.2, toward: false },
  { x: 31, y: 28, s: 1, o: 0.55, d: 0.6, f: 0.4, toward: true },
  { x: 18, y: 86, s: 1.1, o: 0.3, d: 3.2, f: 0.28, toward: false },
  { x: 68, y: 16, s: 1, o: 0.4, d: 1.8, f: 0.45, toward: false },
  { x: 78, y: 38, s: 1.3, o: 0.5, d: 0.4, f: 0.55, toward: true },
  { x: 88, y: 22, s: 0.9, o: 0.28, d: 2.8, f: 0.22, toward: false },
  { x: 84, y: 68, s: 1.1, o: 0.42, d: 1.5, f: 0.38, toward: true },
  { x: 74, y: 84, s: 0.85, o: 0.32, d: 3.6, f: 0.25, toward: false },
  { x: 52, y: 10, s: 1, o: 0.38, d: 2.1, f: 0.3, toward: false },
  { x: 46, y: 90, s: 1.15, o: 0.36, d: 0.9, f: 0.32, toward: true },
  { x: 40, y: 20, s: 0.75, o: 0.22, d: 4.1, f: 0.18, toward: false },
  { x: 58, y: 78, s: 1, o: 0.48, d: 2.6, f: 0.42, toward: true },
  { x: 6, y: 32, s: 0.9, o: 0.3, d: 1.3, f: 0.26, toward: false },
  { x: 93, y: 54, s: 1.05, o: 0.4, d: 3.0, f: 0.36, toward: false },
];

const RINGS = [18, 28, 40, 54, 68, 82, 96];

export default function FinalCtaSection({ onEnter }: { onEnter: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const ctaWrapRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const magneticReady = useRef(false);
  const raf = useRef(0);
  const [inView, setInView] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduce || !inView) {
      magneticReady.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      magneticReady.current = true;
    }, 1500);
    return () => window.clearTimeout(t);
  }, [reduce, inView]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.28 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const updateScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const visible = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height * 0.35)));
      const leaving = rect.top < 0 ? Math.min(1, Math.abs(rect.top) / (rect.height * 0.45)) : 0;
      el.style.setProperty("--fx-progress", String(visible));
      el.style.setProperty("--fx-leave", String(leaving));
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);
    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, []);

  useEffect(() => {
    if (reduce) return;
    const el = sectionRef.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      target.current.x = Math.max(-1, Math.min(1, nx));
      target.current.y = Math.max(-1, Math.min(1, ny));

      const cta = ctaWrapRef.current;
      if (cta && magneticReady.current) {
        const cr = cta.getBoundingClientRect();
        const cx = cr.left + cr.width / 2;
        const cy = cr.top + cr.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        const pull = dist < 180 ? (1 - dist / 180) * 8 : 0;
        cta.style.transform = `translate3d(${(dx / (dist || 1)) * pull}px, ${(dy / (dist || 1)) * pull}px, 0)`;
      }
    };

    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.06;
      current.current.y += (target.current.y - current.current.y) * 0.06;
      const x = current.current.x;
      const y = current.current.y;
      if (coreRef.current) {
        coreRef.current.style.transform = `translate3d(${x * 14}px, ${y * 10}px, 0)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(calc(-50% + ${x * 22}px), calc(-50% + ${y * 16}px), 0)`;
      }
      el.style.setProperty("--fx-mx", String(x));
      el.style.setProperty("--fx-my", String(y));
      raf.current = requestAnimationFrame(tick);
    };

    el.addEventListener("pointermove", onMove);
    const onLeave = () => {
      target.current.x = 0;
      target.current.y = 0;
      if (ctaWrapRef.current) ctaWrapRef.current.style.transform = "";
    };
    el.addEventListener("pointerleave", onLeave);
    raf.current = requestAnimationFrame(tick);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, [reduce]);

  const active = reduce || inView;

  return (
    <section
      ref={sectionRef}
      className={`fx-final relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#050505]${active ? " is-inview" : ""}`}
    >
      <div className="fx-final-veil pointer-events-none absolute inset-0" />
      <div className="fx-final-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 falcon-noise" />

      <div
        ref={glowRef}
        className="fx-final-glow pointer-events-none absolute left-1/2 top-1/2 h-[min(70vw,520px)] w-[min(70vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full"
      />

      <div
        ref={coreRef}
        className="fx-final-core pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <svg
          className="h-[min(92vw,720px)] w-[min(92vw,720px)] overflow-visible"
          viewBox="0 0 200 200"
        >
          <defs>
            <radialGradient id="fxCoreFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.07" />
              <stop offset="55%" stopColor="#2F81FF" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#050505" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="22" fill="url(#fxCoreFill)" />
          {RINGS.map((r, i) => (
            <circle
              key={r}
              className={`fx-final-ring fx-final-ring-${i}`}
              cx="100"
              cy="100"
              r={r}
              fill="none"
              stroke={i % 2 === 0 ? "rgba(34,211,238,0.16)" : "rgba(47,129,255,0.12)"}
              strokeWidth={i === 3 ? 0.45 : 0.32}
            />
          ))}
          <line x1="42" y1="58" x2="68" y2="48" stroke="rgba(34,211,238,0.18)" strokeWidth="0.28" />
          <line x1="148" y1="62" x2="158" y2="88" stroke="rgba(47,129,255,0.16)" strokeWidth="0.28" />
          <line x1="54" y1="146" x2="78" y2="154" stroke="rgba(34,211,238,0.14)" strokeWidth="0.28" />
          <g className="fx-final-orbit fx-final-orbit-a">
            <circle cx="168" cy="100" r="1.15" fill="#22D3EE" opacity="0.7" />
            <circle cx="32" cy="100" r="0.85" fill="#4DA3FF" opacity="0.5" />
          </g>
          <g className="fx-final-orbit fx-final-orbit-b">
            <circle cx="100" cy="46" r="1" fill="#22D3EE" opacity="0.65" />
            <circle cx="100" cy="154" r="0.8" fill="#2F81FF" opacity="0.5" />
          </g>
          <circle cx="68" cy="48" r="1.05" fill="#22D3EE" opacity="0.55" />
          <circle cx="148" cy="62" r="0.9" fill="#4DA3FF" opacity="0.5" />
          <circle cx="54" cy="146" r="0.8" fill="#22D3EE" opacity="0.4" />
          <circle cx="132" cy="150" r="0.7" fill="#2F81FF" opacity="0.45" />
        </svg>
      </div>

      <div className="fx-final-particles pointer-events-none absolute inset-0">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className={`fx-final-particle absolute rounded-full bg-[#22D3EE]${p.toward ? " toward" : ""}${i >= 8 ? " hidden md:block" : ""}`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.s,
              height: p.s,
              opacity: p.o,
              animationDelay: `${p.d}s`,
              ["--fx-pf" as string]: String(p.f),
              ["--tx" as string]: String(50 - p.x),
              ["--ty" as string]: String(50 - p.y),
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex w-[90%] max-w-[920px] flex-col items-center px-4 text-center">
        <div className="fx-final-label mb-6 flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE] shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
          <span className="font-mono text-[9px] font-medium uppercase tracking-[0.38em] text-[#8B8F98]">
            THE NEXT CREATIVE SYSTEM
          </span>
        </div>

        <h2 className="fx-final-headline m-0">
          <span className="fx-final-line1 block font-bold text-white">Design with</span>
          <span className="fx-final-line2 block font-medium">intelligence.</span>
        </h2>

        <p className="fx-final-support mx-auto mt-6 max-w-[600px] text-[15px] leading-[1.75] tracking-[0.01em] text-[#B4B8C0] md:text-[16px]">
          Start with an idea. Build a system. Make every design feel intentional.
        </p>

        <div ref={ctaWrapRef} className="fx-final-cta-wrap mt-8">
          <button type="button" onClick={onEnter} className="fx-final-cta">
            <span>Enter Falcon Studio</span>
            <ArrowRight size={16} className="fx-final-cta-arrow" />
          </button>
        </div>
      </div>

      <div className="fx-final-status pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-6 sm:bottom-8">
        <div className="flex flex-col items-center gap-1 font-mono text-[8px] uppercase tracking-[0.28em] text-white/25 sm:flex-row sm:gap-4">
          <span>FALCON / INTELLIGENCE CORE</span>
          <span className="hidden h-px w-6 bg-white/15 sm:block" />
          <span className="flex items-center gap-1.5">
            SYSTEM STATUS:
            <span className="text-[#22D3EE]/70">ACTIVE</span>
          </span>
        </div>
      </div>
    </section>
  );
}
