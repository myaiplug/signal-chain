import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";

/* ---------------- 3D TILT + GLARE ---------------- */
export function TiltPanel({
  children,
  className = "",
  max = 7,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, on: false });

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      setT({ rx: (0.5 - py) * max * 2, ry: (px - 0.5) * max * 2, gx: px * 100, gy: py * 100, on: true });
    },
    [max]
  );

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => setT((s) => ({ ...s, rx: 0, ry: 0, on: false }))}
      className={`relative transition-transform duration-200 ease-out will-change-transform ${className}`}
      style={{
        transform: `perspective(900px) rotateX(${t.rx}deg) rotateY(${t.ry}deg) scale(${t.on ? 1.015 : 1})`,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
      {glare && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity: t.on ? 1 : 0,
            background: `radial-gradient(circle at ${t.gx}% ${t.gy}%, rgba(0,255,170,0.09), transparent 55%)`,
          }}
        />
      )}
    </div>
  );
}

/* ---------------- GLITCH / SCRAMBLE TEXT ---------------- */
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@";
export function GlitchText({ text, className = "" }: { text: string; className?: string }) {
  const [out, setOut] = useState(text);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!hover) {
      setOut(text);
      return;
    }
    let frame = 0;
    const iv = window.setInterval(() => {
      frame++;
      setOut(
        text
          .split("")
          .map((ch, i) => {
            if (ch === " ") return " ";
            if (i < frame * 1.5) return text[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );
      if (frame * 1.5 >= text.length) window.clearInterval(iv);
    }, 40);
    return () => window.clearInterval(iv);
  }, [hover, text]);

  return (
    <span
      className={`inline-block cursor-default select-none ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={hover ? { textShadow: "2px 0 #ff4d4d66, -2px 0 #00d4ff66" } : undefined}
    >
      {out}
    </span>
  );
}

/* ---------------- ANIMATED COUNTER ---------------- */
export function CountUp({ to, duration = 2.2, className = "", suffix = "" }: { to: number; duration?: number; className?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const tick = () => {
            const k = Math.min(1, (performance.now() - t0) / (duration * 1000));
            const e = 1 - Math.pow(1 - k, 4);
            setVal(Math.round(to * e));
            if (k < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ---------------- SHEEN SWEEP (attach to buttons/cards) ---------------- */
export function Sheen({ children, className = "", color = "rgba(0,255,170,0.18)" }: { children: React.ReactNode; className?: string; color?: string }) {
  return (
    <span className={`group/sheen relative block overflow-hidden ${className}`}>
      {children}
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-700 ease-out group-hover/sheen:translate-x-full"
        style={{ background: `linear-gradient(105deg, transparent 30%, ${color} 50%, transparent 70%)` }}
      />
    </span>
  );
}

/* ---------------- FLOATING ORB (ambient motion) ---------------- */
export function Orb({ className = "", size = 420, color = "rgba(0,255,170,0.07)", dur = 18 }: { className?: string; size?: number; color?: string; dur?: number }) {
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        filter: "blur(40px)",
      }}
      animate={{ x: [0, 60, -30, 0], y: [0, -40, 30, 0], scale: [1, 1.15, 0.95, 1] }}
      transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
