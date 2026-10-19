import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { engine } from "../audio/engine";
import { TOOL_LINKS } from "../data/artists";
import { STREAM_STATS, TOTAL_PLAYS } from "../data/stats";
import { CountUp, GlitchText } from "./vfx";

export function MasteringSection() {
  const [locked, setLocked] = useState(false);
  const [lufs, setLufs] = useState(-60);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const l = engine.getLufs();
      setLufs(l);
      // "lock" when the section is in view and level is in streaming range
      const r = ref.current?.getBoundingClientRect();
      const inView = r && r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.4;
      setLocked(!!inView && l > -15 && l < -8 && engine.playing);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section ref={ref} className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 py-28">
      <div className="w-full max-w-3xl text-center">
        <div className="font-mono text-[10px] tracking-[0.5em] text-[#9eff00]">04 · MASTERING</div>
        <h2 className="mt-3 font-display text-4xl font-700 tracking-tight text-[#dffee6] sm:text-6xl">
          <GlitchText text="YOUR RECORD, MASTERED." />
        </h2>

        {/* the stream-proof counter */}
        <div className="panel relative mx-auto mt-12 w-full max-w-2xl p-6 sm:p-8">
          <div className="absolute left-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>
          <div className="absolute right-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>
          <div className="text-center font-mono text-[9px] tracking-[0.45em] text-[#7aafa0]">
            VERIFIED PLAY COUNT · ALL PLATFORMS · ALL PROJECTS
          </div>
          <div className="mt-4 text-center font-display text-6xl font-700 tracking-tight text-[#00ffaa] text-glow sm:text-7xl">
            <CountUp to={TOTAL_PLAYS} suffix="+" />
          </div>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Object.entries(STREAM_STATS).map(([key, s]) => (
              <div key={key} className="panel-inset p-3 text-center">
                <div className="font-mono text-[8px] tracking-[0.3em] text-[#1a5048]">{s.label}</div>
                <div className="mt-1 font-mono text-lg font-bold tabular-nums text-[#dffee6]">
                  <CountUp to={s.plays} duration={1.8} />
                </div>
                <div className="mt-1 font-mono text-[7px] leading-relaxed tracking-[0.15em] text-[#7aafa0]">{s.note}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 text-center font-mono text-[8px] tracking-[0.25em] text-[#1a5048]">
            SPOTIFY · APPLE MUSIC · YOUTUBE · AUDIOMACK · DATPIFF ERA COUNTED
          </div>
        </div>

        {/* the stamp */}
        <motion.div
          className="panel relative mx-auto mt-12 max-w-xl p-8"
          animate={locked ? { boxShadow: ["0 0 20px rgba(0,255,170,0.15)", "0 0 60px rgba(0,255,170,0.4)", "0 0 20px rgba(0,255,170,0.15)"] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="absolute left-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>
          <div className="absolute right-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>
          <div className="absolute bottom-3 left-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>
          <div className="absolute bottom-3 right-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>

          <motion.div
            initial={{ scale: 2.2, opacity: 0, rotate: -18 }}
            whileInView={{ scale: 1, opacity: 1, rotate: -6 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className="mx-auto inline-block rounded-xl border-2 border-[#00ffaa] px-6 py-3 font-mono text-sm font-bold tracking-[0.3em] text-[#00ffaa]"
            style={{ boxShadow: "0 0 30px rgba(0,255,170,0.25), inset 0 0 20px rgba(0,255,170,0.08)" }}
          >
            {locked ? "MASTERED · -14 LUFS LOCK" : "AWAITING LOCK"}
          </motion.div>

          <div className="mt-8 grid grid-cols-3 gap-3 font-mono text-[9px]">
            <div className="panel-inset p-3">
              <div className="text-[#1a5048]">LOUDNESS</div>
              <div className="mt-1 text-base tabular-nums text-[#00ffaa]">{lufs.toFixed(1)}</div>
            </div>
            <div className="panel-inset p-3">
              <div className="text-[#1a5048]">TRUE PEAK</div>
              <div className="mt-1 text-base tabular-nums text-[#00ffaa]">-1.0</div>
            </div>
            <div className="panel-inset p-3">
              <div className="text-[#1a5048]">QC</div>
              <div className="mt-1 text-base text-[#00ffaa]">PASSED</div>
            </div>
          </div>

          <p className="mt-8 font-mono text-[10px] leading-relaxed text-[#7aafa0]">
            Every master leaving this rack hits broadcast streaming spec:
            -14 LUFS integrated, -1 dBTP, zero phase cancellation. Ten years
            of records prove it.
          </p>
        </motion.div>

        {/* credits */}
        <div className="mt-16 font-mono text-[9px] leading-loose tracking-[0.25em] text-[#1a5048]">
          <div>PRODUCED · MIXED · MASTERED · CODED BY BRIAN JUTZ</div>
          <div className="mt-2 text-[#7aafa0]">
            THE BEAT MOB · GREEN THUMBZ · bTHIRTYthreezy · CEASA MATIC
          </div>
          <div className="mt-2">
            NODAW · SCREWAI · LIMINAL STEMSPLIT · CO-PRODUCER
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href={TOOL_LINKS.github}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-[#1a5048] px-6 py-3 font-mono text-[10px] tracking-[0.3em] text-[#7aafa0] transition-colors hover:border-[#00ffaa] hover:text-[#00ffaa]"
          >
            GITHUB
          </a>
          <a
            href={`mailto:${TOOL_LINKS.email}`}
            className="rounded-xl border border-[#00ffaa] bg-[#003828] px-6 py-3 font-mono text-[10px] font-bold tracking-[0.3em] text-[#dffee6] transition-transform hover:scale-105"
          >
            HIRE THE MOB
          </a>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 overflow-hidden border-t border-[#1a504855] py-2">
        <div className="marquee-track font-mono text-[9px] tracking-[0.4em] text-[#1a5048]">
          {[...Array(2)].map((_, k) => (
            <span key={k} className="pr-8">
              THE BEAT MOB × bTHIRTYthreezy · -14 LUFS · TRUE PEAK SAFE · PHASE COHERENT ·
              THE BEAT MOB × bTHIRTYthreezy · -14 LUFS · TRUE PEAK SAFE · PHASE COHERENT ·
              THE BEAT MOB × bTHIRTYthreezy · -14 LUFS · TRUE PEAK SAFE · PHASE COHERENT ·
              &nbsp;
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
