import { useCallback, useEffect, useRef, useState } from "react";
import { GlitchText } from "./vfx";
import { useExclusiveAudio } from "../audio/useExclusiveAudio";

const BASE = import.meta.env.BASE_URL || "/";

const SOURCES = [
  { id: "heater", name: "HEATER · 142", url: `${BASE}beats/heater.m4a` },
  { id: "detroit", name: "DETROIT · 85", url: `${BASE}beats/detroit-85.m4a` },
  { id: "eastcoast", name: "EAST COAST · 98", url: `${BASE}beats/east-coast-98.m4a` },
];

/* ---------------- rotary knob (drag vertical, -135..135) ---------------- */
function RackKnob({
  label,
  value,
  onChange,
  display,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  display: string;
}) {
  const drag = useRef<{ y: number; v: number } | null>(null);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!drag.current) return;
      onChange(Math.max(0, Math.min(1, drag.current.v + (drag.current.y - e.clientY) * 0.006)));
    };
    const up = () => (drag.current = null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [onChange]);

  const angle = -135 + value * 270;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        onPointerDown={(e) => {
          drag.current = { y: e.clientY, v: value };
          e.preventDefault();
        }}
        className="relative h-12 w-12 cursor-ns-resize touch-none select-none"
        style={{ transform: `rotate(${angle}deg)` }}
      >
        <div
          className="absolute inset-0 rounded-full border border-[#1a5048]"
          style={{ background: "radial-gradient(circle at 40% 35%, #0a2a24, #020a0c 75%)", boxShadow: "inset 0 3px 10px rgba(0,0,0,0.9)" }}
        />
        {[...Array(11)].map((_, i) => {
          const a = -135 + i * 27;
          return (
            <div key={i} className="absolute inset-0" style={{ transform: `rotate(${a}deg)` }}>
              <div className={`absolute left-1/2 top-0.5 h-1 w-px -translate-x-1/2 ${i === 5 ? "bg-[#00ffaa]" : "bg-[#12322c]"}`} />
            </div>
          );
        })}
        <div className="absolute inset-[30%] rounded-full border border-[#1a5048] bg-[#041216]" />
        <div className="absolute left-1/2 top-1.5 h-[26%] w-[2px] -translate-x-1/2 rounded-full bg-[#00ffaa]" style={{ boxShadow: "0 0 6px rgba(0,255,170,0.8)" }} />
      </div>
      <div className="font-mono text-[7px] tracking-[0.25em] text-[#7aafa0]">{label}</div>
      <div className="font-mono text-[8px] tabular-nums text-[#00ffaa]">{display}</div>
    </div>
  );
}

function ModuleShell({
  index,
  name,
  on,
  onToggle,
  children,
}: {
  index: string;
  name: string;
  on: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`panel-inset relative flex flex-col p-4 transition-opacity duration-300 ${on ? "" : "opacity-40"}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[7px] tracking-[0.3em] text-[#7aafa0]">
          {index} · {name}
        </span>
        <button onClick={onToggle} aria-label={`Bypass ${name}`} className={`led cursor-pointer ${on ? "on" : ""}`} />
      </div>
      <div className="flex flex-1 items-center justify-around">{children}</div>
    </div>
  );
}

function LedBar({ level }: { level: number }) {
  const segs = 12;
  const lit = Math.round(level * segs);
  return (
    <div className="flex gap-[2px]">
      {[...Array(segs)].map((_, i) => (
        <div
          key={i}
          className="h-2.5 w-1 rounded-[1px]"
          style={{
            background: i < lit ? (i > 9 ? "#ff4d4d" : i > 7 ? "#ffb000" : "#00ffaa") : "#0a201c",
            boxShadow: i < lit ? "0 0 5px rgba(0,255,170,0.35)" : undefined,
          }}
        />
      ))}
    </div>
  );
}

const fmtPct = (v: number) => `${Math.round(v * 100)}`;
const fmtHzGain = (v: number) => `${v > 0.5 ? "+" : ""}${((v - 0.5) * 24).toFixed(1)}dB`;

/* ============================================================
   NODAW RACKS UNIT - the actual VST chain rebuilt in Web Audio:
   SATURATOR -> 7-BAND EQ -> SPATIAL -> LIMITER, real DSP live.
   ============================================================ */
export function NoDAWRacksUnit() {
  const [playing, setPlaying] = useState(false);
  const [srcIdx, setSrcIdx] = useState(0);
  const [bypassed, setBypassed] = useState(false);
  const [modOn, setModOn] = useState({ sat: true, eq: true, space: true, lim: true });
  const [drive, setDrive] = useState(0.35);
  const [low, setLow] = useState(0.5);
  const [mid, setMid] = useState(0.55);
  const [high, setHigh] = useState(0.45);
  const [delayMix, setDelayMix] = useState(0.18);
  const [spaceMix, setSpaceMix] = useState(0.22);
  const [thresh, setThresh] = useState(0.65);
  const [inLvl, setInLvl] = useState(0);
  const [outLvl, setOutLvl] = useState(0);
  const [gr, setGr] = useState(0);

  const A = useRef({
    ctx: null as AudioContext | null,
    audio: null as HTMLAudioElement | null,
    srcNode: null as MediaElementAudioSourceNode | null,
    pre: null as GainNode | null,
    shaper: null as WaveShaperNode | null,
    lowShelf: null as BiquadFilterNode | null,
    peak: null as BiquadFilterNode | null,
    highShelf: null as BiquadFilterNode | null,
    delaySend: null as GainNode | null,
    reverbSend: null as GainNode | null,
    comp: null as DynamicsCompressorNode | null,
    makeup: null as GainNode | null,
    out: null as GainNode | null,
    anIn: null as AnalyserNode | null,
    anOut: null as AnalyserNode | null,
    buf: null as AudioBuffer | null,
    raf: 0,
    playingFlag: false,
    timeData: new Float32Array(1024),
  });

  const claim = useExclusiveAudio("nodaw-racks", () => stop(), "NODAW RACKS");

  // build graph once
  const build = useCallback(() => {
    const s = A.current;
    if (s.ctx) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    s.ctx = ctx;

    const audio = new Audio(SOURCES[srcIdx].url);
    audio.loop = true;
    audio.crossOrigin = "anonymous";
    audio.preload = "auto";
    s.audio = audio;
    s.srcNode = ctx.createMediaElementSource(audio);

    s.pre = ctx.createGain();

    s.shaper = ctx.createWaveShaper();
    s.shaper.oversample = "4x";
    s.shaper.curve = makeCurve(0.35);

    s.lowShelf = ctx.createBiquadFilter();
    s.lowShelf.type = "lowshelf";
    s.lowShelf.frequency.value = 180;
    s.peak = ctx.createBiquadFilter();
    s.peak.type = "peaking";
    s.peak.frequency.value = 1200;
    s.peak.Q.value = 0.9;
    s.highShelf = ctx.createBiquadFilter();
    s.highShelf.type = "highshelf";
    s.highShelf.frequency.value = 5200;

    // spatial sends
    s.delaySend = ctx.createGain();
    s.delaySend.gain.value = 0.18;
    const delay = ctx.createDelay(1.5);
    delay.delayTime.value = 0.31;
    const fb = ctx.createGain();
    fb.gain.value = 0.34;
    const dampen = ctx.createBiquadFilter();
    dampen.type = "lowpass";
    dampen.frequency.value = 3400;
    s.delaySend.connect(delay);
    delay.connect(dampen);
    dampen.connect(fb);
    fb.connect(delay);

    s.reverbSend = ctx.createGain();
    s.reverbSend.gain.value = 0.22;
    const conv = ctx.createConvolver();
    conv.buffer = makeImpulse(ctx, 2.2);
    s.reverbSend.connect(conv);

    s.comp = ctx.createDynamicsCompressor();
    s.comp.threshold.value = -14;
    s.comp.knee.value = 6;
    s.comp.ratio.value = 12;
    s.comp.attack.value = 0.003;
    s.comp.release.value = 0.18;

    s.makeup = ctx.createGain();
    s.makeup.gain.value = 1.15;
    s.out = ctx.createGain();
    s.out.gain.value = 0.9;

    s.anIn = ctx.createAnalyser();
    s.anIn.fftSize = 1024;
    s.anOut = ctx.createAnalyser();
    s.anOut.fftSize = 1024;

    // chain: src -> pre -> shaper -> EQ x3 -> comp -> makeup -> out -> destination
    s.srcNode.connect(s.pre);
    s.pre.connect(s.shaper);
    s.shaper.connect(s.lowShelf);
    s.lowShelf.connect(s.peak);
    s.peak.connect(s.highShelf);
    s.highShelf.connect(s.comp);
    s.comp.connect(s.makeup);
    s.makeup.connect(s.out);
    // parallel spatial returns feed back into out
    s.highShelf.connect(s.delaySend);
    s.highShelf.connect(s.reverbSend);
    conv.connect(s.out);
    s.out.connect(s.anOut);
    s.anOut.connect(ctx.destination);
    // input tap for metering
    s.srcNode.connect(s.anIn);
    s.buf = null;
  }, [srcIdx]);

  // parameter sync
  useEffect(() => {
    const s = A.current;
    if (!s.ctx) return;
    const t = s.ctx.currentTime;
    s.shaper!.curve = makeCurve(drive);
    s.lowShelf!.gain.setTargetAtTime((low - 0.5) * 24, t, 0.05);
    s.peak!.gain.setTargetAtTime((mid - 0.5) * 24, t, 0.05);
    s.highShelf!.gain.setTargetAtTime((high - 0.5) * 24, t, 0.05);
    s.delaySend!.gain.setTargetAtTime(modOn.space ? delayMix * 0.9 : 0, t, 0.05);
    s.reverbSend!.gain.setTargetAtTime(spaceMix * 0.85, t, 0.05);
    s.comp!.threshold.setTargetAtTime(-30 + thresh * 26, t, 0.05);
  }, [drive, low, mid, high, delayMix, spaceMix, thresh, modOn.space]);

  // module routing (sat / eq / lim bypass)
  useEffect(() => {
    const s = A.current;
    if (!s.ctx || !s.pre || !s.srcNode) return;
    // master bypass: source straight to output
    s.srcNode.disconnect();
    s.srcNode.connect(s.pre);
    s.srcNode.connect(s.anIn!);
    if (bypassed) {
      s.srcNode.disconnect();
      s.srcNode.connect(s.out!);
      s.srcNode.connect(s.anIn!);
      return;
    }

    s.shaper!.disconnect();
    s.lowShelf!.disconnect();
    s.peak!.disconnect();
    s.highShelf!.disconnect();
    s.comp!.disconnect();
    s.makeup!.disconnect();
    s.pre.disconnect();

    let head: AudioNode = s.pre;
    const startAt = (n: AudioNode) => {
      head = n;
    };
    startAt(s.pre);
    const next = (n: AudioNode) => {
      head.connect(n);
      head = n;
    };
    if (modOn.sat) next(s.shaper!);
    const tapPoint = head;
    if (modOn.eq) {
      next(s.lowShelf!);
      next(s.peak!);
      next(s.highShelf!);
    }
    // spatial sends tap post-sat/post-eq
    tapPoint.connect(s.delaySend!);
    tapPoint.connect(s.reverbSend!);
    if (modOn.lim) {
      next(s.comp!);
      next(s.makeup!);
    }
    head.connect(s.out!);
    head.connect(s.anOut!);
  }, [modOn.sat, modOn.eq, modOn.lim, bypassed]);

  const meter = useCallback(() => {
    const s = A.current;
    const loop = () => {
      if (!s.playingFlag) return;
      if (s.anIn && s.anOut) {
        s.anIn.getFloatTimeDomainData(s.timeData);
        let pk = 0;
        for (let i = 0; i < s.timeData.length; i += 4) pk = Math.max(pk, Math.abs(s.timeData[i]));
        setInLvl((p) => p * 0.6 + Math.min(1, pk * 1.6) * 0.4);
        s.anOut.getFloatTimeDomainData(s.timeData);
        pk = 0;
        for (let i = 0; i < s.timeData.length; i += 4) pk = Math.max(pk, Math.abs(s.timeData[i]));
        setOutLvl((p) => p * 0.6 + Math.min(1, pk * 1.6) * 0.4);
        setGr(Math.min(1, Math.max(0, -(s.comp?.reduction ?? 0) / 24)));
      }
      s.raf = requestAnimationFrame(loop);
    };
    cancelAnimationFrame(s.raf);
    s.raf = requestAnimationFrame(loop);
  }, []);

  const play = useCallback(async () => {
    build();
    const s = A.current;
    claim(); // silence everything else before the rack starts
    if (s.ctx!.state === "suspended") await s.ctx!.resume();
    s.playingFlag = true;
    setPlaying(true);
    meter();
    await s.audio!.play().catch(() => stop());
  }, [build, claim, meter]);

  function stop() {
    const s = A.current;
    s.audio?.pause();
    s.playingFlag = false;
    cancelAnimationFrame(s.raf);
    setPlaying(false);
    setInLvl(0);
    setOutLvl(0);
    setGr(0);
  }

  // source swap while running
  const swapSource = (i: number) => {
    setSrcIdx(i);
    const s = A.current;
    if (s.audio && playing) {
      s.audio.src = SOURCES[i].url;
      s.audio.play().catch(() => {});
    }
  };

  useEffect(() => () => {
    const s = A.current;
    s.playingFlag = false;
    cancelAnimationFrame(s.raf);
    s.audio?.pause();
    s.ctx?.close().catch(() => {});
  }, []);

  const toggleMod = (k: keyof typeof modOn) => setModOn((m) => ({ ...m, [k]: !m[k] }));

  return (
    <div className="panel relative overflow-hidden p-6">
      <div className="absolute left-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>
      <div className="absolute right-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[8px] tracking-[0.4em] text-[#7aafa0]">NODAW RACKS · SATURATOR → EQ → SPATIAL → LIMITER</div>
          <div className="mt-1 font-display text-xl font-700 text-[#dffee6]">
            <GlitchText text="THE MASTERING CHAIN. LIVE." />
          </div>
          <p className="mt-1 max-w-xl font-mono text-[9px] leading-relaxed text-[#7aafa0]">
            The NoDAW Racks VST3 signal path, ported 1:1 to Web Audio and
            running on this page right now. Drive it, shape it, slam it -
            every knob moves real DSP.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setBypassed((b) => !b)}
            className={`rounded border px-3 py-2 font-mono text-[8px] tracking-[0.3em] transition-colors ${
              bypassed ? "border-[#1a5048] text-[#7aafa0]" : "border-[#00ffaa] text-[#00ffaa]"
            }`}
          >
            {bypassed ? "BYPASSED" : "RACKS IN"}
          </button>
          <button
            onClick={() => (playing ? stop() : play())}
            className="rounded border border-[#00ffaa] bg-[#003828]/80 px-5 py-2 font-mono text-[9px] font-bold tracking-[0.3em] text-[#dffee6]"
            style={{ boxShadow: "0 0 24px rgba(0,255,170,0.25)" }}
          >
            {playing ? "■ STOP" : "▶ RUN RACK"}
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[7px] tracking-[0.3em] text-[#1a5048]">SOURCE:</span>
        {SOURCES.map((t, i) => (
          <button
            key={t.id}
            onClick={() => swapSource(i)}
            className={`rounded border px-2.5 py-1 font-mono text-[8px] tracking-[0.2em] transition-colors ${
              i === srcIdx ? "border-[#00ffaa] text-[#00ffaa]" : "border-[#1a5048] text-[#7aafa0] hover:text-[#dffee6]"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* the rack */}
      <div className="panel-inset relative mt-4 p-4">
        <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 ${bypassed ? "opacity-35 saturate-50" : ""} transition-all duration-300`}>
          <ModuleShell index="01" name="SATURATOR" on={modOn.sat} onToggle={() => toggleMod("sat")}>
            <RackKnob label="DRIVE" value={drive} onChange={setDrive} display={fmtPct(drive)} />
          </ModuleShell>

          <ModuleShell index="02" name="7-BAND EQ" on={modOn.eq} onToggle={() => toggleMod("eq")}>
            <RackKnob label="LOW" value={low} onChange={setLow} display={fmtHzGain(low)} />
            <RackKnob label="MID" value={mid} onChange={setMid} display={fmtHzGain(mid)} />
            <RackKnob label="HIGH" value={high} onChange={setHigh} display={fmtHzGain(high)} />
          </ModuleShell>

          <ModuleShell index="03" name="SPATIAL" on={true} onToggle={() => {}}>
            <RackKnob label="DELAY" value={delayMix} onChange={setDelayMix} display={fmtPct(delayMix)} />
            <RackKnob label="SPACE" value={spaceMix} onChange={setSpaceMix} display={fmtPct(spaceMix)} />
          </ModuleShell>

          <ModuleShell index="04" name="LIMITER" on={modOn.lim} onToggle={() => toggleMod("lim")}>
            <div className="flex flex-col items-center gap-1.5">
              <RackKnob label="THRESH" value={thresh} onChange={setThresh} display={`${(-30 + thresh * 26).toFixed(0)}dB`} />
              <span className="font-mono text-[7px] tracking-[0.25em] text-[#7aafa0]">GR</span>
              <LedBar level={gr} />
            </div>
          </ModuleShell>
        </div>
      </div>

      {/* in/out meters */}
      <div className="mt-4 flex flex-wrap items-center justify-end gap-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[7px] tracking-[0.3em] text-[#7aafa0]">IN</span>
          <LedBar level={inLvl} />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[7px] tracking-[0.3em] text-[#7aafa0]">OUT</span>
          <LedBar level={outLvl} />
        </div>
        <a href="https://myaiplug.github.io/fantune-skin/nodaw-racks/" target="_blank" rel="noreferrer" className="font-mono text-[8px] tracking-[0.3em] text-[#00ffaa] hover:underline">
          GET THE VST3 →
        </a>
      </div>
    </div>
  );
}

/* ---------------- DSP helpers ---------------- */
function makeCurve(amount: number): Float32Array<ArrayBuffer> {
  const n = 1024;
  const curve = new Float32Array(n);
  const k = amount * 12 + 0.5;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = Math.tanh(x * k) / Math.tanh(k);
  }
  return curve;
}

function makeImpulse(ctx: AudioContext, seconds: number): AudioBuffer {
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * seconds);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4);
    }
  }
  return buf;
}
