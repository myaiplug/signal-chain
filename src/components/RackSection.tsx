import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { engine } from "../audio/engine";
import { MODULES, TOOL_LINKS } from "../data/artists";
import { SyrupLab, RealABUnit, RealStemUnit } from "./RealDemos";
import { TiltPanel, GlitchText } from "./vfx";
import { InterfaceDemo } from "./InterfaceDemo";
import { NoDAWRacksUnit } from "./NoDAWRacksUnit";

const BASE = import.meta.env.BASE_URL || "/";

/* ---------------- SCREW DIAL UNIT (site-wide soundtrack pitch) ---------------- */
function ScrewDialUnit() {
  const [angle, setAngle] = useState(0);
  const [on, setOn] = useState(engine.playing);

  // reflect the real state (it stops when any other track starts)
  useEffect(() => {
    const iv = window.setInterval(() => setOn(engine.playing), 300);
    return () => window.clearInterval(iv);
  }, []);

  const toggleSoundtrack = () => {
    if (engine.playing) engine.pause();
    else engine.start();
    window.setTimeout(() => setOn(engine.playing), 80);
  };
  const dialRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; startAngle: number } | null>(null);

  const applyAngle = (a: number) => {
    const clamped = Math.max(-135, Math.min(135, a));
    setAngle(clamped);
    const pitch = 1 + (clamped / 135) * 0.42;
    engine.glidePitch(clamped < 0 ? 0.6 + ((clamped + 135) / 135) * 0.4 : pitch);
  };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!drag.current) return;
      applyAngle(drag.current.startAngle + (drag.current.startY - e.clientY) * 0.9);
    };
    const up = () => (drag.current = null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const pct = ((angle + 135) / 270) * 100;

  return (
    <div className="panel relative flex flex-col items-center p-6">
      <div className="absolute left-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>
      <div className="absolute right-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>
      <div className="font-mono text-[8px] tracking-[0.4em] text-[#7aafa0]">SCREWAI · PITCH DRIVE</div>
      <div className="mt-2 font-display text-xl font-700 tracking-tight text-[#dffee6]">THE SCREW</div>
      <button
        onClick={toggleSoundtrack}
        data-testid="soundtrack-toggle"
        className={`relative z-10 mt-3 cursor-pointer rounded-lg border px-3 py-1.5 font-mono text-[8px] tracking-[0.3em] transition-colors ${on ? "border-[#00ffaa] bg-[#003828] text-[#dffee6]" : "border-[#1a5048] text-[#7aafa0] hover:border-[#00ffaa66]"}`}
      >
        {on ? "❚❚ HOUSE SOUNDTRACK" : "▶ HOUSE SOUNDTRACK"}
      </button>

      <div
        ref={dialRef}
        onPointerDown={(e) => {
          drag.current = { startY: e.clientY, startAngle: angle };
          e.preventDefault();
        }}
        className="relative mt-6 aspect-square w-44 cursor-grab touch-none select-none active:cursor-grabbing"
        style={{ transform: `rotate(${angle}deg)` }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-[#1a5048]" style={{ background: "radial-gradient(circle at 40% 35%, #0a2a24, #020a0c 75%)", boxShadow: "inset 0 6px 24px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.5)" }} />
        {[...Array(11)].map((_, i) => {
          const a = -135 + i * 27;
          return (
            <div key={i} className="absolute inset-0" style={{ transform: `rotate(${a}deg)` }}>
              <div className={`absolute left-1/2 top-1 h-2 w-px -translate-x-1/2 ${i === 5 ? "bg-[#00ffaa]" : "bg-[#1a5048]"}`} />
            </div>
          );
        })}
        <div className="absolute left-1/2 top-2 h-[38%] w-[3px] -translate-x-1/2 rounded-full bg-[#00ffaa]" style={{ boxShadow: "0 0 12px rgba(0,255,170,0.8)" }} />
        <div className="absolute inset-[38%] rounded-full border border-[#1a5048] bg-[#041216]">
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] text-[#00ffaa]">
            {engine.pitchFactor.toFixed(2)}x
          </div>
        </div>
      </div>

      <div className="mt-6 w-full">
        <div className="relative h-1 w-full rounded bg-[#020a0c]">
          <div className="absolute inset-y-0 left-1/2 w-px bg-[#1a5048]" />
          <div className="absolute inset-y-0 rounded bg-[#00ffaa]" style={{ left: `${Math.min(50, pct)}%`, width: `${Math.abs(pct - 50)}%` }} />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[8px] tracking-[0.3em] text-[#1a5048]">
          <span>SCREWED</span><span>NEUTRAL</span><span>SPUN</span>
        </div>
      </div>
      <p className="mt-4 text-center font-mono text-[9px] leading-relaxed text-[#7aafa0]">
        Start the house soundtrack (Applied Pressure, from The Beat Mob
        vault), then drag the dial - it pitches and slows live. Turntable
        DSP, the core idea behind ScrewAI.
      </p>
      <a href={TOOL_LINKS.screwai} target="_blank" rel="noreferrer" className="mt-4 font-mono text-[9px] tracking-[0.3em] text-[#00ffaa] underline-offset-4 hover:underline">
        OPEN FULL APP →
      </a>
    </div>
  );
}

/* ---------------- compact modules ---------------- */
function MiniModules() {
  const [active, setActive] = useState<Record<string, boolean>>({});

  const toggleModule = (id: string) => {
    const next = !active[id];
    setActive((s) => ({ ...s, [id]: next }));
    if (id === "retune") engine.glidePitch(next ? 432 / 440 : 1);
    if (id === "halfscrew") engine.glidePitch(next ? 0.5 : 1);
    if (id === "warper") engine.setWarp(next);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {MODULES.map((m) => (
        <motion.div key={m.id} whileHover={{ y: -8, rotateX: 3, rotateY: -3 }} className="panel group relative flex flex-col overflow-hidden p-5 transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(0,255,170,0.12)]">
          <div className="relative -mx-5 -mt-5 mb-4 h-24 overflow-hidden border-b border-[#1a5048]">
            <img
              src={`${BASE}img/product-${m.id === "warper" || m.id === "retune" || m.id === "fantune" ? "screwai" : m.id === "halfscrew" ? "liminal" : "coproducer"}.png`}
              alt=""
              className="h-full w-full object-cover opacity-40 transition-all duration-500 group-hover:scale-110 group-hover:opacity-70"
              style={{ filter: "saturate(0.7) hue-rotate(90deg)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#041216] to-transparent" />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[8px] tracking-[0.35em] text-[#7aafa0]">{m.kind}</span>
            <button
              onClick={() => toggleModule(m.id)}
              className={`led cursor-pointer ${active[m.id] ? "on" : ""}`}
              aria-label={`Toggle ${m.name}`}
            />
          </div>
          <div className="mt-3 font-display text-base font-600 text-[#dffee6]">{m.name}</div>
          <p className="mt-2 flex-1 font-mono text-[9px] leading-relaxed text-[#7aafa0]">{m.desc}</p>
          <a href={m.url} target="_blank" rel="noreferrer" className="mt-4 font-mono text-[8px] tracking-[0.3em] text-[#00ffaa] hover:underline">
            LAUNCH MODULE →
          </a>
        </motion.div>
      ))}
    </div>
  );
}

export function RackSection() {
  return (
    <section className="relative min-h-[100svh] px-4 py-28 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14">
          <div className="font-mono text-[10px] tracking-[0.5em] text-[#00ffaa]">02 · THE RACK</div>
          <h2 className="mt-3 font-display text-4xl font-700 tracking-tight text-[#dffee6] sm:text-6xl">
            <GlitchText text="GEAR I BUILT." />{" "}
            <span className="text-[#7aafa0]">IT RUNS ON THIS PAGE.</span>
          </h2>
          <p className="mt-4 max-w-xl font-mono text-[10px] leading-relaxed text-[#7aafa0]">
            The units below are the literal demo code from my repos - real
            bounces, real separated stems, real measurements. Not mockups.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <TiltPanel><ScrewDialUnit /></TiltPanel>
          <TiltPanel><RealStemUnit /></TiltPanel>
          <TiltPanel><RealABUnit /></TiltPanel>
        </div>

        <div className="mt-5">
          <TiltPanel max={4}><SyrupLab /></TiltPanel>
        </div>

        <div className="mt-5">
          <InterfaceDemo />
        </div>

        <div className="mt-5">
          <TiltPanel max={4}>
            <NoDAWRacksUnit />
          </TiltPanel>
        </div>

        <div className="mt-5">
          <MiniModules />
        </div>
      </div>
    </section>
  );
}
