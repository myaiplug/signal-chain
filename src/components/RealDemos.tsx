import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  AB_TRACKS,
  SCREW_TRACKS,
  STRAINS,
  STEM_SESSION,
  type AbTrack,
  type Strain,
} from "../data/demos";
import { equalPowerGains, formatTime } from "../audio/playerMath";
import { useExclusiveAudio } from "../audio/useExclusiveAudio";
import { TOOL_LINKS } from "../data/artists";

/* ============================================================
   SCREWAI SYRUP LAB - literal port of coproducer-web screw-demo.js
   Real audio, 17 strains, playbackRate A/B, offset-preserving swaps.
   ============================================================ */
export function SyrupLab() {
  const [track, setTrack] = useState(SCREW_TRACKS[0]);
  const [strain, setStrain] = useState(STRAINS[0]);
  const [side, setSide] = useState<"a" | "b">("a");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState("0:00 / 0:00");
  const [loading, setLoading] = useState(true);

  const ref = useRef({
    ctx: null as AudioContext | null,
    buf: null as AudioBuffer | null,
    src: null as AudioBufferSourceNode | null,
    gain: null as GainNode | null,
    offset: 0,
    startedAt: 0,
    playing: false,
    raf: 0,
  });

  const rate = side === "a" ? 1 : strain.slowdown;
  const duration = () => (ref.current.buf ? ref.current.buf.duration / rate : 0);

  const tickUi = useCallback(() => {
    const s = ref.current;
    const d = duration();
    const t = s.playing && s.ctx ? Math.min(d, Math.max(0, s.ctx.currentTime - s.startedAt)) : s.offset;
    setProgress(d ? (t / d) * 100 : 0);
    setTime(`${formatTime(t)} / ${formatTime(d)}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rate]);

  const stopSource = () => {
    try {
      ref.current.src?.stop();
    } catch {
      /* */
    }
    ref.current.src = null;
    cancelAnimationFrame(ref.current.raf);
  };

  const arm = useCallback(() => {
    cancelAnimationFrame(ref.current.raf);
    const loop = () => {
      tickUi();
      const s = ref.current;
      if (s.playing) {
        const d = duration();
        const t = s.ctx ? Math.min(d, Math.max(0, s.ctx.currentTime - s.startedAt)) : s.offset;
        if (t >= d - 0.02) {
          s.offset = 0;
          s.playing = false;
          setPlaying(false);
          stopSource();
          tickUi();
          return;
        }
        ref.current.raf = requestAnimationFrame(loop);
      }
    };
    ref.current.raf = requestAnimationFrame(loop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickUi]);

  const play = useCallback(async () => {
    const s = ref.current;
    if (!s.buf) return;
    if (!s.ctx) s.ctx = new AudioContext();
    if (s.ctx.state === "suspended") await s.ctx.resume();
    stopSource();
    if (!s.gain) {
      s.gain = s.ctx.createGain();
      s.gain.connect(s.ctx.destination);
    }
    const src = s.ctx.createBufferSource();
    src.buffer = s.buf;
    src.playbackRate.value = rate;
    src.connect(s.gain);
    src.start(0, Math.max(0, Math.min(s.buf.duration - 0.01, s.offset * rate)));
    s.src = src;
    s.startedAt = s.ctx.currentTime - s.offset;
    s.playing = true;
    setPlaying(true);
    claim();
    arm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rate, arm]);

  const pause = useCallback(() => {
    const s = ref.current;
    if (!s.playing) return;
    s.offset = s.ctx ? Math.min(duration(), Math.max(0, s.ctx.currentTime - s.startedAt)) : s.offset;
    stopSource();
    s.playing = false;
    setPlaying(false);
    tickUi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickUi]);

  // load track
  useEffect(() => {
    let dead = false;
    setLoading(true);
    (async () => {
      const s = ref.current;
      const res = await fetch(track.file);
      const raw = await res.arrayBuffer();
      if (dead) return;
      if (!s.ctx) s.ctx = new AudioContext();
      s.buf = await s.ctx.decodeAudioData(raw.slice(0));
      s.offset = 0;
      setLoading(false);
      tickUi();
    })();
    return () => {
      dead = true;
      stopSource();
      ref.current.playing = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.id]);

  const claim = useExclusiveAudio("syrup", pause);

  const toggle = () => (playing ? pause() : play());

  const swapSide = (next: "a" | "b") => {
    const s = ref.current;
    const pos = duration() ? s.offset / duration() : 0;
    const was = s.playing;
    pause();
    s.offset = pos * (s.buf ? s.buf.duration / (next === "a" ? 1 : strain.slowdown) : 0);
    setSide(next);
    if (was) setTimeout(() => play(), 30);
  };

  const pickStrain = (next: Strain) => {
    const s = ref.current;
    const pos = duration() ? s.offset / duration() : 0;
    setStrain(next);
    if (side === "b") {
      const was = s.playing;
      pause();
      s.offset = pos * (s.buf ? s.buf.duration / next.slowdown : 0);
      if (was) setTimeout(() => play(), 30);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const s = ref.current;
    const was = s.playing;
    pause();
    s.offset = p * duration();
    tickUi();
    if (was) play();
  };

  const vialFill = (s: Strain) => 42 + Math.round((1 - s.slowdown) * 55);

  return (
    <div className="panel relative p-6">
      <div className="absolute left-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>
      <div className="absolute right-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[8px] tracking-[0.4em] text-[#7aafa0]">SCREWAI · SYRUP LAB · LITERAL PORT</div>
          <div className="mt-1 font-display text-xl font-700 text-[#dffee6]">17 CODEINE FLAVORS. DRAG. DROP. RENDER.</div>
        </div>
        <a href={TOOL_LINKS.screwai} target="_blank" rel="noreferrer" className="font-mono text-[9px] tracking-[0.3em] text-[#00ffaa] hover:underline">
          OPEN SCREWAI APP →
        </a>
      </div>

      {/* track picker */}
      <div className="mt-4 flex flex-wrap gap-2">
        {SCREW_TRACKS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTrack(t)}
            className={`cursor-pointer rounded-lg border px-3 py-1.5 font-mono text-[9px] tracking-[0.2em] transition-colors ${
              track.id === t.id ? "border-[#00ffaa] bg-[#003828] text-[#dffee6]" : "border-[#1a5048] text-[#7aafa0] hover:text-[#dffee6]"
            }`}
          >
            {t.title.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_240px]">
        {/* player */}
        <div className="panel-inset p-4">
          <div className="font-mono text-[10px] tracking-[0.25em] text-[#dffee6]">{track.title.toUpperCase()}</div>
          <p className="mt-1 font-mono text-[9px] text-[#7aafa0]">{track.blurb}</p>

          <div className="mt-3 flex items-center gap-3">
            <motion.button
              onClick={toggle}
              whileTap={{ scale: 0.92 }}
              disabled={loading}
              className="cursor-pointer rounded-lg border border-[#00ffaa] bg-[#003828] px-5 py-2 font-mono text-[10px] font-bold tracking-[0.25em] text-[#dffee6] disabled:opacity-40"
            >
              {loading ? "LOADING" : playing ? "PAUSE" : "PLAY"}
            </motion.button>
            <div className="flex gap-1.5">
              <button
                onClick={() => swapSide("a")}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-left transition-colors ${side === "a" ? "border-[#00ffaa] bg-[#062028]" : "border-[#1a5048] hover:border-[#00ffaa66]"}`}
              >
                <span className="block font-mono text-[9px] font-bold tracking-[0.2em] text-[#dffee6]">A ORIGINAL</span>
                <span className="block font-mono text-[8px] text-[#7aafa0]">clean bounce</span>
              </button>
              <button
                onClick={() => swapSide("b")}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-left transition-colors ${side === "b" ? "border-[#00ffaa] bg-[#062028]" : "border-[#1a5048] hover:border-[#00ffaa66]"}`}
              >
                <span className="block font-mono text-[9px] font-bold tracking-[0.2em]" style={{ color: side === "b" ? strain.color : "#dffee6" }}>B SYRUP</span>
                <span className="block font-mono text-[8px] text-[#7aafa0]">{strain.slowdown.toFixed(2)}x strain</span>
              </button>
            </div>
          </div>

          <div className="mt-4 cursor-pointer py-2" onClick={seek}>
            <div className="h-1.5 w-full rounded-full bg-black/60">
              <div className="h-full rounded-full bg-[#00ffaa]" style={{ width: `${progress}%`, boxShadow: "0 0 8px rgba(0,255,170,0.6)" }} />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[9px] tabular-nums text-[#7aafa0]">
              <span>{time}</span>
              <span>{side === "a" ? "ORIGINAL" : `${strain.name.toUpperCase()} · ${strain.slowdown.toFixed(2)}x`}</span>
            </div>
          </div>
        </div>

        {/* strain rack */}
        <div className="panel-inset max-h-[300px] overflow-y-auto p-3">
          <div className="mb-2 flex justify-between font-mono text-[8px] tracking-[0.3em] text-[#1a5048]">
            <span>STRAIN LIBRARY</span>
            <span>17 BOTTLES</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {STRAINS.map((s) => {
              const on = strain.id === s.id && side === "b";
              return (
                <button
                  key={s.id}
                  onClick={() => pickStrain(s)}
                  title={`${s.name} - ${s.slowdown.toFixed(2)}x`}
                  className={`group relative flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-2 transition-all ${
                    on ? "border-transparent" : "border-[#12322c] hover:border-[#1a5048]"
                  }`}
                  style={on ? { boxShadow: `0 0 14px ${s.color}66`, borderColor: s.color } : {}}
                >
                  <span
                    className="relative block h-9 w-4 overflow-hidden rounded-b-sm rounded-t border border-black/60"
                    style={{ background: "#020a0c" }}
                  >
                    <span
                      className="absolute inset-x-0 bottom-0 transition-all group-hover:brightness-125"
                      style={{ height: `${vialFill(s)}%`, background: s.color, opacity: on ? 1 : 0.55 }}
                    />
                  </span>
                  <span className={`w-full truncate text-center font-mono text-[6.5px] tracking-wide ${on ? "text-[#dffee6]" : "text-[#7aafa0]"}`}>
                    {s.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CO-PRODUCER A/B - literal port of home-ab.js + player.js
   Real before/after bounces + real measured metric rows.
   ============================================================ */
export function RealABUnit() {
  const [track, setTrack] = useState<AbTrack>(AB_TRACKS[0]);
  const [side, setSide] = useState<"before" | "after">("after");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState("0:00 / 0:00");
  const [loading, setLoading] = useState(true);

  const ref = useRef({
    ctx: null as AudioContext | null,
    bufA: null as AudioBuffer | null,
    bufB: null as AudioBuffer | null,
    srcA: null as AudioBufferSourceNode | null,
    srcB: null as AudioBufferSourceNode | null,
    gainA: null as GainNode | null,
    gainB: null as GainNode | null,
    offset: 0,
    startedAt: 0,
    playing: false,
    raf: 0,
  });

  const currentBuf = () => (side === "before" ? ref.current.bufA : ref.current.bufB);
  const duration = () => currentBuf()?.duration ?? 0;

  const tickUi = useCallback(() => {
    const s = ref.current;
    const d = duration();
    const t = s.playing && s.ctx ? Math.min(d, Math.max(0, s.ctx.currentTime - s.startedAt)) : s.offset;
    setProgress(d ? (t / d) * 100 : 0);
    setTime(`${formatTime(t)} / ${formatTime(d)}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side]);

  const stopAll = () => {
    try { ref.current.srcA?.stop(); } catch { /* */ }
    try { ref.current.srcB?.stop(); } catch { /* */ }
    ref.current.srcA = ref.current.srcB = null;
    cancelAnimationFrame(ref.current.raf);
  };

  const arm = useCallback(() => {
    cancelAnimationFrame(ref.current.raf);
    const loop = () => {
      tickUi();
      const s = ref.current;
      if (s.playing) {
        const d = duration();
        const t = s.ctx ? Math.min(d, Math.max(0, s.ctx.currentTime - s.startedAt)) : s.offset;
        if (t >= d - 0.02) {
          s.offset = 0;
          s.playing = false;
          setPlaying(false);
          stopAll();
          tickUi();
          return;
        }
        ref.current.raf = requestAnimationFrame(loop);
      }
    };
    ref.current.raf = requestAnimationFrame(loop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickUi]);

  const play = useCallback(async () => {
    const s = ref.current;
    if (!s.bufA || !s.bufB) return;
    if (!s.ctx) s.ctx = new AudioContext();
    if (s.ctx.state === "suspended") await s.ctx.resume();
    stopAll();
    if (!s.gainA || !s.gainB) {
      s.gainA = s.ctx.createGain();
      s.gainB = s.ctx.createGain();
      s.gainA.connect(s.ctx.destination);
      s.gainB.connect(s.ctx.destination);
    }
    const gainA = s.gainA;
    const gainB = s.gainB;
    const g = equalPowerGains(side === "before" ? 0 : 1);
    gainA.gain.value = g.a;
    gainB.gain.value = g.b;
    const srcA = s.ctx.createBufferSource();
    srcA.buffer = s.bufA;
    srcA.connect(gainA);
    const srcB = s.ctx.createBufferSource();
    srcB.buffer = s.bufB;
    srcB.connect(gainB);
    const at = Math.max(0, Math.min(s.bufA.duration - 0.01, s.offset));
    srcA.start(0, at);
    srcB.start(0, at);
    s.srcA = srcA;
    s.srcB = srcB;
    s.startedAt = s.ctx.currentTime - s.offset;
    s.playing = true;
    setPlaying(true);
    claim();
    arm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side, arm]);

  const pause = useCallback(() => {
    const s = ref.current;
    if (!s.playing) return;
    s.offset = s.ctx ? Math.min(duration(), Math.max(0, s.ctx.currentTime - s.startedAt)) : s.offset;
    stopAll();
    s.playing = false;
    setPlaying(false);
    tickUi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickUi]);

  useEffect(() => {
    let dead = false;
    setLoading(true);
    (async () => {
      const s = ref.current;
      if (!s.ctx) s.ctx = new AudioContext();
      const [ra, rb] = await Promise.all([fetch(track.beforeFile), fetch(track.afterFile)]);
      if (dead) return;
      const [ba, bb] = await Promise.all([ra.arrayBuffer(), rb.arrayBuffer()]);
      if (dead) return;
      s.bufA = await s.ctx.decodeAudioData(ba.slice(0));
      s.bufB = await s.ctx.decodeAudioData(bb.slice(0));
      s.offset = 0;
      setLoading(false);
      tickUi();
    })();
    return () => {
      dead = true;
      stopAll();
      ref.current.playing = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.id]);

  const claim = useExclusiveAudio("ab", pause);

  const swapSide = (next: "before" | "after") => {
    const s = ref.current;
    const was = s.playing;
    pause();
    setSide(next);
    if (was) setTimeout(() => play(), 30);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const s = ref.current;
    const was = s.playing;
    pause();
    s.offset = p * duration();
    tickUi();
    if (was) play();
  };

  const gate = (metric: string, v: number | string) => {
    const m = metric.toLowerCase();
    const n = Number(v);
    if (m === "score") return n >= 90 ? "#00ffaa" : "#ff4d4d";
    if (m.includes("lufs")) return Math.abs(n - -14) <= 1.5 ? "#00ffaa" : "#ffb000";
    if (m.includes("true peak")) return n <= -0.85 ? "#00ffaa" : "#ff4d4d";
    if (m.includes("clipped")) return n === 0 ? "#00ffaa" : "#ff4d4d";
    if (m === "rating") return String(v).toLowerCase().includes("release ready") ? "#00ffaa" : "#ffb000";
    return "#7aafa0";
  };

  return (
    <div className="panel relative p-6">
      <div className="absolute right-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[8px] tracking-[0.4em] text-[#7aafa0]">CO-PRODUCER · REPAIR A/B · REAL MEASUREMENTS</div>
          <div className="mt-1 font-display text-xl font-700 text-[#dffee6]">{track.title}</div>
          <p className="mt-1 font-mono text-[9px] text-[#7aafa0]">{track.problem}</p>
        </div>
        <a href={TOOL_LINKS.coproducer} target="_blank" rel="noreferrer" className="font-mono text-[9px] tracking-[0.3em] text-[#00ffaa] hover:underline">
          OPEN CO-PRODUCER →
        </a>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {AB_TRACKS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTrack(t)}
            className={`cursor-pointer rounded-lg border px-3 py-1.5 font-mono text-[9px] tracking-[0.2em] transition-colors ${
              track.id === t.id ? "border-[#00ffaa] bg-[#003828] text-[#dffee6]" : "border-[#1a5048] text-[#7aafa0] hover:text-[#dffee6]"
            }`}
          >
            {t.title.toUpperCase()} <span className="text-[#00ffaa]">{t.before.score}→{t.after.score}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="panel-inset p-4">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => (playing ? pause() : play())}
              whileTap={{ scale: 0.92 }}
              disabled={loading}
              className="cursor-pointer rounded-lg border border-[#00ffaa] bg-[#003828] px-5 py-2 font-mono text-[10px] font-bold tracking-[0.25em] text-[#dffee6] disabled:opacity-40"
            >
              {loading ? "LOADING" : playing ? "PAUSE" : "PLAY"}
            </motion.button>
            <div className="flex gap-1.5">
              <button
                onClick={() => swapSide("before")}
                className={`cursor-pointer rounded-lg border px-3 py-2 font-mono text-[9px] font-bold tracking-[0.2em] transition-colors ${side === "before" ? "border-[#ff4d4d] bg-[#2a0505] text-[#ff4d4d]" : "border-[#1a5048] text-[#7aafa0] hover:border-[#ff4d4d66]"}`}
              >
                BEFORE · {track.before.score}
              </button>
              <button
                onClick={() => swapSide("after")}
                className={`cursor-pointer rounded-lg border px-3 py-2 font-mono text-[9px] font-bold tracking-[0.2em] transition-colors ${side === "after" ? "border-[#00ffaa] bg-[#003828] text-[#00ffaa]" : "border-[#1a5048] text-[#7aafa0] hover:border-[#00ffaa66]"}`}
              >
                AFTER · {track.after.score}
              </button>
            </div>
          </div>
          <div className="mt-4 cursor-pointer py-2" onClick={seek}>
            <div className="h-1.5 w-full rounded-full bg-black/60">
              <div className="h-full rounded-full bg-[#00d4ff]" style={{ width: `${progress}%`, boxShadow: "0 0 8px rgba(0,212,255,0.6)" }} />
            </div>
            <div className="mt-1.5 font-mono text-[9px] tabular-nums text-[#7aafa0]">{time}</div>
          </div>
          <p className="font-mono text-[8px] leading-relaxed text-[#1a5048]">
            EQUAL-POWER A/B CROSSFADE · SAME TRANSPORT POSITION · REAL BOUNCES
          </p>
        </div>

        {/* real metric table */}
        <div className="panel-inset overflow-hidden p-0">
          <table className="w-full font-mono text-[8.5px]">
            <thead>
              <tr className="border-b border-[#12322c] text-[#1a5048]">
                <th className="px-2 py-1.5 text-left font-normal tracking-[0.2em]">METRIC</th>
                <th className="px-2 py-1.5 text-right font-normal">BEFORE</th>
                <th className="px-2 py-1.5 text-right font-normal">AFTER</th>
              </tr>
            </thead>
            <tbody>
              {track.rows.map((r) => (
                <tr key={r.metric} className="border-b border-[#0a1a18] last:border-0">
                  <td className="px-2 py-1 text-[#7aafa0]">{r.metric}</td>
                  <td className="px-2 py-1 text-right tabular-nums" style={{ color: gate(r.metric, r.before) }}>{String(r.before)}</td>
                  <td className="px-2 py-1 text-right tabular-nums" style={{ color: gate(r.metric, r.after) }}>{String(r.after)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   LIMINAL STEM SPLIT - real separated stems (gamma session)
   from coproducer-web/blog/stems - mute/solo real stem files.
   ============================================================ */
export function RealStemUnit() {
  const [muted, setMuted] = useState<Set<string>>(new Set());
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [solo, setSolo] = useState<string | null>(null);

  const stemsRef = useRef<
    { id: string; label: string; color: string; gain: GainNode; src: AudioBufferSourceNode | null; buf: AudioBuffer | null }[]
  >([]);
  const ctxRef = useRef<AudioContext | null>(null);
  const startedRef = useRef(0);
  const offsetRef = useRef(0);

  // decode all stems
  useEffect(() => {
    let dead = false;
    (async () => {
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const loaded: typeof stemsRef.current = [];
      for (const st of STEM_SESSION.stems) {
        const res = await fetch(st.file);
        const raw = await res.arrayBuffer();
        if (dead) return;
        const buf = await ctx.decodeAudioData(raw.slice(0));
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        loaded.push({ id: st.id, label: st.label, color: st.color, gain, src: null, buf });
      }
      stemsRef.current = loaded;
      setLoading(false);
    })();
    return () => {
      dead = true;
      ctxRef.current?.close();
    };
  }, []);

  const applyGains = (m: Set<string>, soloId: string | null) => {
    for (const s of stemsRef.current) {
      const audible = soloId ? s.id === soloId : !m.has(s.id);
      s.gain.gain.setTargetAtTime(audible ? 1 : 0, ctxRef.current!.currentTime, 0.03);
    }
  };

  const stopAll = () => {
    for (const s of stemsRef.current) {
      try { s.src?.stop(); } catch { /* */ }
      s.src = null;
    }
  };

  const claim = useExclusiveAudio("stems", () => {
    const ctx = ctxRef.current;
    if (ctx) offsetRef.current = Math.max(0, ctx.currentTime - startedRef.current);
    stopAll();
    setPlaying(false);
  });

  const play = async () => {
    const ctx = ctxRef.current!;
    if (ctx.state === "suspended") await ctx.resume();
    stopAll();
    const at = Math.max(0, offsetRef.current);
    for (const s of stemsRef.current) {
      const src = ctx.createBufferSource();
      src.buffer = s.buf;
      src.connect(s.gain);
      src.start(0, at);
      s.src = src;
    }
    startedRef.current = ctx.currentTime - offsetRef.current;
    setPlaying(true);
    claim();
  };

  const pause = () => {
    const ctx = ctxRef.current!;
    offsetRef.current = Math.max(0, ctx.currentTime - startedRef.current);
    stopAll();
    setPlaying(false);
  };

  const toggle = async () => (playing ? pause() : play());

  const toggleMute = (id: string) => {
    const next = new Set(muted);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setMuted(next);
    setSolo(null);
    applyGains(next, null);
  };

  const toggleSolo = (id: string) => {
    const next = solo === id ? null : id;
    setSolo(next);
    applyGains(muted, next);
  };

  return (
    <div className="panel relative p-6">
      <div className="absolute left-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[8px] tracking-[0.4em] text-[#7aafa0]">LIMINAL · REAL SEPARATED STEMS</div>
          <div className="mt-1 font-display text-xl font-700 text-[#dffee6]">
            {STEM_SESSION.title.toUpperCase()} <span className="text-[#7aafa0]">· 4 STEMS</span>
          </div>
        </div>
        <a href={TOOL_LINKS.stemsplit} target="_blank" rel="noreferrer" className="font-mono text-[9px] tracking-[0.3em] text-[#00d4ff] hover:underline">
          OPEN LIMINAL →
        </a>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <motion.button
          onClick={toggle}
          whileTap={{ scale: 0.92 }}
          disabled={loading}
          className="cursor-pointer rounded-lg border border-[#00d4ff] bg-[#041a28] px-5 py-2 font-mono text-[10px] font-bold tracking-[0.25em] text-[#dffee6] disabled:opacity-40"
        >
          {loading ? "SEPARATING" : playing ? "PAUSE" : "PLAY STEMS"}
        </motion.button>
        <span className="font-mono text-[8px] tracking-[0.25em] text-[#1a5048]">MUTE = CLICK LABEL · SOLO = S BUTTON</span>
      </div>

      <div className="panel-inset mt-4 space-y-2 p-3">
        {STEM_SESSION.stems.map((st, i) => {
          const isMuted = muted.has(st.id) || (solo !== null && solo !== st.id);
          const wave = [0.5, 0.8, 0.35, 0.65, 0.9, 0.45, 0.7, 0.55, 0.85, 0.4, 0.6, 0.75];
          return (
            <motion.div
              key={st.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 rounded-md px-1 py-1"
            >
              <button onClick={() => toggleMute(st.id)} className="cursor-pointer" aria-label={`Mute ${st.label}`}>
                <span className="led block" style={!isMuted ? { background: st.color, boxShadow: `0 0 8px ${st.color}` } : {}} />
              </button>
              <span className={`w-14 font-mono text-[10px] tracking-[0.15em] ${isMuted ? "text-[#1a5048] line-through" : "text-[#dffee6]"}`}>
                {st.label.toUpperCase()}
              </span>
              <div className="flex h-6 flex-1 items-center gap-[2px]">
                {wave.map((h, j) => (
                  <motion.div
                    key={j}
                    className="flex-1 rounded-sm"
                    style={{ background: st.color, opacity: isMuted ? 0.12 : 0.75 }}
                    animate={
                      playing && !isMuted
                        ? { height: [`${h * 40}%`, `${h * 100}%`, `${h * 55}%`, `${h * 90}%`, `${h * 40}%`] }
                        : { height: `${h * 60}%` }
                    }
                    transition={playing && !isMuted ? { duration: 0.9 + j * 0.07, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
                  />
                ))}
              </div>
              <button
                onClick={() => toggleSolo(st.id)}
                className={`cursor-pointer rounded border px-1.5 py-0.5 font-mono text-[8px] font-bold ${
                  solo === st.id ? "border-[#ffb000] bg-[#2a1e05] text-[#ffb000]" : "border-[#1a5048] text-[#7aafa0] hover:text-[#dffee6]"
                }`}
              >
                S
              </button>
            </motion.div>
          );
        })}
      </div>
      <p className="mt-3 font-mono text-[9px] leading-relaxed text-[#7aafa0]">
        Real neural separation output - vocals, drums, bass, other. Mute and
        solo lanes while it plays. This is what Liminal StemSplit ships.
      </p>
    </div>
  );
}
