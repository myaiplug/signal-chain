import { TOOL_LINKS } from "../data/artists";
import { STREAM_STATS, TOTAL_PLAYS } from "../data/stats";
import { CountUp, GlitchText } from "./vfx";

export function MasteringSection() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 py-28">
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
            href={TOOL_LINKS.store}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-[#00ffaa66] px-6 py-3 font-mono text-[10px] tracking-[0.3em] text-[#00ffaa] transition-colors hover:border-[#00ffaa] hover:bg-[#003828]"
          >
            THE BEAT MOB STORE ↗
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
