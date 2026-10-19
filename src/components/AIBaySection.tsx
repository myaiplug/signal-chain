import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExclusiveAudio } from "../audio/useExclusiveAudio";
import { releaseAudio } from "../audio/bus";

const BASE = import.meta.env.BASE_URL || "/";
const asset = (p: string) => BASE + p;

interface Beat {
  file: string;
  name: string;
  bpm: number;
  style: string;
}

// Real locally-generated instrumentals - D:\Audio\Personal\AI Beats\AI LOCAL GEN 2080SUPER
const BEATS: Beat[] = [
  { file: "beats/midnight-shadow-140bpm.m4a", name: "MIDNIGHT SHADOW", bpm: 140, style: "A MINOR TRAP" },
  { file: "beats/south-atlanta-130-v1.m4a", name: "SOUTH ATLANTA V1", bpm: 130, style: "ATLANTA" },
  { file: "beats/south-atlanta-130-v2.m4a", name: "SOUTH ATLANTA V2", bpm: 130, style: "ATLANTA" },
  { file: "beats/south-atlanta-130-v3.m4a", name: "SOUTH ATLANTA V3", bpm: 130, style: "ATLANTA" },
  { file: "beats/trap-heavy-142-v1.m4a", name: "TRAP HEAVY V1", bpm: 142, style: "HEAVY TRAP" },
  { file: "beats/trap-heavy-142-v3.m4a", name: "TRAP HEAVY V3", bpm: 142, style: "HEAVY TRAP" },
  { file: "beats/trap-heavy-142-v5.m4a", name: "TRAP HEAVY V5", bpm: 142, style: "HEAVY TRAP" },
  { file: "beats/south-memphis-78.m4a", name: "SOUTH MEMPHIS", bpm: 78, style: "MEMPHIS" },
  { file: "beats/south-memphis-78-alt.m4a", name: "SOUTH MEMPHIS ALT", bpm: 78, style: "MEMPHIS" },
  { file: "beats/detroit-85.m4a", name: "DETROIT", bpm: 85, style: "DETROIT" },
  { file: "beats/east-coast-98.m4a", name: "EAST COAST MODERN", bpm: 98, style: "BOOM BAP" },
  { file: "beats/modern-hiphop-105.m4a", name: "MODERN HIP HOP", bpm: 105, style: "RADIO READY" },
  { file: "beats/west-coast-96.m4a", name: "WEST COAST", bpm: 96, style: "WEST COAST" },
  { file: "beats/musicgen-southern-trap.m4a", name: "MUSICGEN SOUTHERN", bpm: 0, style: "MUSICGEN MEDIUM" },
  { file: "beats/audioldm2-southern-trap.m4a", name: "AUDIOLDM2 SOUTHERN", bpm: 0, style: "AUDIOLDM2" },
  { file: "beats/musicgen-hard-trap.m4a", name: "MUSICGEN HARD", bpm: 0, style: "MUSICGEN SMALL" },
  { file: "beats/musicgen-master.m4a", name: "MUSICGEN MASTER", bpm: 0, style: "MUSICGEN" },
  { file: "beats/heater.m4a", name: "HEATER", bpm: 0, style: "LOCAL GEN" },
  { file: "beats/cross-bang.m4a", name: "CROSS BANG", bpm: 0, style: "LOCAL GEN" },
  { file: "beats/this-one-slaps.m4a", name: "THIS ONE SLAPS", bpm: 0, style: "LOCAL GEN" },
  { file: "beats/play-4-bahb.m4a", name: "PLAY 4 BAHB", bpm: 0, style: "LOCAL GEN" },
];

type Phase = "idle" | "growing" | "playing";

export function AIBaySection() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [prompt, setPrompt] = useState("");
  const [current, setCurrent] = useState<Beat | null>(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const growRef = useRef(0);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => () => window.clearInterval(growRef.current), []);

  // waveform visualizer fed by the real beat
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || phase !== "playing") return;
    const ctx2d = cv.getContext("2d")!;
    const draw = () => {
      const w = (cv.width = cv.offsetWidth * devicePixelRatio);
      const h = (cv.height = cv.offsetHeight * devicePixelRatio);
      ctx2d.clearRect(0, 0, w, h);
      const an = analyserRef.current;
      if (an) {
        const data = new Uint8Array(an.frequencyBinCount);
        an.getByteFrequencyData(data);
        const bars = 64;
        const bw = w / bars;
        for (let i = 0; i < bars; i++) {
          const v = data[Math.floor((i / bars) * data.length * 0.7)] / 255;
          const bh = Math.max(2, v * h * 0.9);
          ctx2d.fillStyle = `rgba(0, ${180 + Math.floor(v * 75)}, 170, ${0.35 + v * 0.65})`;
          ctx2d.fillRect(i * bw + 1, h - bh, bw - 2, bh);
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, current]);

  const ensureAudio = () => {
    if (!audioRef.current) {
      const el = new Audio();
      el.crossOrigin = "anonymous";
      el.addEventListener("ended", () => {
        setPhase("idle");
        releaseAudio("aibay");
      });
      audioRef.current = el;
    }
    const el = audioRef.current;
    if (!analyserRef.current) {
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const src = ctx.createMediaElementSource(el);
      const an = ctx.createAnalyser();
      an.fftSize = 256;
      src.connect(an);
      an.connect(ctx.destination);
      analyserRef.current = an;
    }
    return el;
  };

  const pickBeat = (): Beat => {
    const q = prompt.trim().toLowerCase();
    if (q) {
      const matches = BEATS.filter(
        (b) => b.name.toLowerCase().includes(q) || b.style.toLowerCase().includes(q) || String(b.bpm) === q
      );
      if (matches.length) return matches[Math.floor(Math.random() * matches.length)];
    }
    return BEATS[Math.floor(Math.random() * BEATS.length)];
  };

  const claim = useExclusiveAudio("aibay", () => {
    // another player took over: stop the beat AND any pending "grow" so it
    // can't start late on top of what the visitor just picked
    window.clearInterval(growRef.current);
    audioRef.current?.pause();
    setPhase("idle");
  }, "AI BAY");

  const generate = () => {
    if (phase === "growing") return;
    audioRef.current?.pause();
    // build/resume the audio graph inside the click (user gesture)
    ensureAudio();
    ctxRef.current?.resume().catch(() => {});
    const beat = pickBeat();
    setCurrent(beat);
    setPhase("growing");
    setProgress(0);
    // progress is tracked locally - the old version started playback from
    // inside a setState updater, which React may run twice (double trigger)
    let p = 0;
    window.clearInterval(growRef.current);
    growRef.current = window.setInterval(() => {
      p += 4 + Math.random() * 5;
      if (p < 100) {
        setProgress(p);
        return;
      }
      window.clearInterval(growRef.current);
      setProgress(100);
      const el = ensureAudio();
      claim();
      el.src = asset(beat.file);
      setPhase("playing");
      el.play().catch(() => {
        setPhase("idle");
        releaseAudio("aibay");
      });
    }, 55);
  };

  return (
    <section className="relative min-h-[100svh] px-4 py-28 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-14 text-center">
          <div className="font-mono text-[10px] tracking-[0.5em] text-[#00d4ff]">03 · THE AI BAY</div>
          <h2 className="mt-3 font-display text-4xl font-700 tracking-tight text-[#dffee6] sm:text-6xl">
            PROMPT. GROW. LISTEN.
          </h2>
          <p className="mx-auto mt-4 max-w-lg font-mono text-[10px] leading-relaxed text-[#7aafa0]">
            Every beat here was generated locally on my own rig - MusicGen and
            AudioLDM2 on a 2080 SUPER. No cloud, no credits, no queue. Then
            produced, arranged and mastered by me.
          </p>
        </div>

        <div className="panel relative mx-auto max-w-3xl p-6 sm:p-8">
          <div className="absolute left-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>
          <div className="absolute right-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>

          <div className="flex flex-wrap gap-2">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
              placeholder="try: memphis, 142, west coast, trap..."
              className="panel-inset min-w-0 flex-1 px-4 py-3 font-mono text-sm text-[#dffee6] placeholder-[#1a5048] outline-none focus:border-[#00ffaa]"
            />
            <motion.button
              onClick={generate}
              whileTap={{ scale: 0.94 }}
              className="cursor-pointer rounded-lg border border-[#00ffaa] bg-[#003828] px-6 py-3 font-mono text-xs font-bold tracking-[0.25em] text-[#dffee6]"
              style={{ boxShadow: "0 0 20px rgba(0,255,170,0.2)" }}
            >
              GROW
            </motion.button>
          </div>

          {/* the growth chamber */}
          <div className="panel-inset relative mt-5 h-48 overflow-hidden">
            <AnimatePresence mode="wait">
              {phase === "idle" && (
                <motion.div key="idle" exit={{ opacity: 0 }} className="flex h-full flex-col items-center justify-center gap-3">
                  <div className="font-mono text-[10px] tracking-[0.4em] text-[#1a5048]">AWAITING PROMPT</div>
                  <div className="flex flex-wrap justify-center gap-1.5 px-6">
                    {BEATS.slice(0, 8).map((b) => (
                      <span key={b.file} className="rounded border border-[#12322c] px-2 py-0.5 font-mono text-[8px] text-[#7aafa0]">
                        {b.name}
                      </span>
                    ))}
                    <span className="rounded border border-[#1a5048] px-2 py-0.5 font-mono text-[8px] text-[#00ffaa]">+{BEATS.length - 8} MORE</span>
                  </div>
                </motion.div>
              )}
              {phase === "growing" && (
                <motion.div key="growing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
                  <div className="absolute inset-0 opacity-60">
                    <canvas ref={canvasRef} className="h-full w-full" />
                  </div>
                  <motion.div
                    className="absolute inset-y-0 w-24"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(0,255,170,0.25), transparent)",
                      left: `${progress}%`,
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-black/60">
                    <div className="h-full bg-[#00ffaa] transition-[width] duration-100" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="absolute right-3 top-3 font-mono text-[9px] tabular-nums text-[#00ffaa]">
                    LOCAL INFERENCE {Math.floor(progress)}%
                  </div>
                  <div className="absolute left-3 top-3 font-mono text-[9px] tracking-[0.25em] text-[#dffee6]">
                    {current?.name}
                  </div>
                </motion.div>
              )}
              {phase === "playing" && current && (
                <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
                  <canvas ref={canvasRef} className="h-full w-full" />
                  <div className="absolute left-3 top-3">
                    <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-[#00ffaa]">{current.name}</div>
                    <div className="font-mono text-[8px] tracking-[0.2em] text-[#7aafa0]">
                      {current.bpm ? `${current.bpm} BPM · ` : ""}{current.style} · LOCAL GEN 2080SUPER
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 font-mono text-[8px] tracking-[0.25em] text-[#7aafa0]">
                    <span className="led on" /> PLAYING · REAL GENERATION
                    <button
                      onClick={generate}
                      className="ml-2 cursor-pointer rounded border border-[#1a5048] px-2 py-0.5 text-[#00ffaa] hover:border-[#00ffaa]"
                    >
                      NEXT →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-4 text-center font-mono text-[9px] leading-relaxed text-[#7aafa0]">
            Type a vibe or BPM to filter the catalog, or hit GROW for a random
            cut. AI instrumentals, AI vocals, full AI songs - human engineering
            on top.
          </p>
        </div>
      </div>
    </section>
  );
}
