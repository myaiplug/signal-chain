import { motion } from "framer-motion";
import type { Artist } from "../data/artists";

const BASE = import.meta.env.BASE_URL || "/";

export function PowerOnOverlay({ opener, onEnter }: { opener: Artist; onEnter: (withSound: boolean) => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#03080a]"
      exit={{ opacity: 0, filter: "blur(12px)" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      role="dialog"
      aria-label="Enter the site"
    >
      {/* opener-tinted glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${opener.glow.replace(/0\.3\d?\)/, "0.10)")}, transparent 65%)`, filter: "blur(30px)" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.8 }}
        className="relative flex flex-col items-center px-6 text-center"
      >
        <div className="mb-7 flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-[#7aafa0]">
          <span className="led on" /> BRIAN JUTZ PRESENTS
        </div>
        <h1 className="font-display font-700 leading-[0.9] tracking-tight text-[#dffee6]">
          <span className="block text-5xl sm:text-7xl">THE BEAT MOB</span>
          <span className="mt-3 flex items-center justify-center gap-4 text-3xl sm:text-5xl">
            <span className="font-300 text-[#7aafa0]">×</span>
            <span className="text-[#00ffaa] text-glow">bTHIRTYthreezy</span>
          </span>
        </h1>

        {/* the randomly picked opener */}
        <div
          className="mt-10 flex items-center gap-4 rounded-2xl border bg-[#041216]/80 py-3 pl-3 pr-6 text-left backdrop-blur"
          style={{ borderColor: `${opener.accent}55`, boxShadow: `0 0 40px ${opener.glow.replace(/0\.3\d?\)/, "0.12)")}` }}
          data-testid="opener-card"
          data-opener={opener.id}
        >
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2" style={{ borderColor: opener.accent }}>
            <img src={`${BASE}img/${opener.id}.jpg`} alt="" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="font-mono text-[8px] tracking-[0.4em]" style={{ color: opener.accent }}>
              TONIGHT'S OPENER · SHUFFLED EACH VISIT
            </div>
            <div className="mt-1 font-display text-lg font-600 text-[#dffee6]">{opener.name}</div>
            <div className="font-mono text-[9px] tracking-[0.2em] text-[#7aafa0]">TOP TRACKS ON SPOTIFY</div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <button
            onClick={() => onEnter(true)}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#00ffaa] bg-[#003828] px-10 py-4 font-mono text-sm font-bold tracking-[0.3em] text-[#dffee6] transition-transform duration-300 hover:scale-[1.04] active:scale-95"
            style={{ boxShadow: "0 0 30px rgba(0,255,170,0.25), inset 0 0 20px rgba(0,255,170,0.08)" }}
          >
            <span className="relative z-10">▶ ENTER &amp; PLAY</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#00ffaa33] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>
          <button
            onClick={() => onEnter(false)}
            className="cursor-pointer rounded-xl border border-[#1a5048] px-6 py-4 font-mono text-[10px] tracking-[0.3em] text-[#7aafa0] transition-colors hover:border-[#00ffaa66] hover:text-[#dffee6]"
          >
            ENTER QUIETLY
          </button>
        </div>
        <p className="mt-6 max-w-sm font-mono text-[10px] leading-relaxed text-[#7aafa0]">
          One track at a time. Start anything on the page and the rest stops.
        </p>
        <div className="mt-12 font-mono text-[9px] tracking-[0.35em] text-[#1a5048]">
          THE BEAT MOB · bTHIRTYthreezy · GREEN THUMBZ · CEASA MATIC
        </div>
      </motion.div>
    </motion.div>
  );
}
