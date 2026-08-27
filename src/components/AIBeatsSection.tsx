import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExclusiveAudio } from "../audio/useExclusiveAudio";

const BASE = import.meta.env.BASE_URL || "/";
const asset = (p: string) => BASE + p;

interface AIBeat {
  file: string;
  name: string;
  bpm: number;
  key: string;
  model: string;
}

const AI_BEATS: AIBeat[] = [
  { file: "beats/ai-midnight-shadow.mp3", name: "MIDNIGHT SHADOW", bpm: 140, key: "Am", model: "MusicGen" },
  { file: "beats/ai-trap-heavy-142.wav", name: "TRAP HEAVY 142", bpm: 142, key: "F#m", model: "MusicGen" },
  { file: "beats/ai-west-coast-96.wav", name: "WEST COAST 96", bpm: 96, key: "Gm", model: "MusicGen" },
];

export function AIBeatsSection() {
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const claim = useExclusiveAudio("ai-beats", () => {
    audioRef.current?.pause();
    setPlayingIdx(null);
  });

  const toggle = (idx: number) => {
    if (!audioRef.current) audioRef.current = new Audio();
    const el = audioRef.current;
    if (playingIdx === idx) {
      el.pause();
      setPlayingIdx(null);
      return;
    }
    el.src = asset(AI_BEATS[idx].file);
    el.play().then(() => claim()).catch(() => {});
    setPlayingIdx(idx);
  };

  return (
    <section className="relative min-h-[100svh] px-4 py-28 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <div className="font-mono text-[10px] tracking-[0.5em] text-[#d000ff]">AI · LOCAL GEN</div>
          <h2 className="mt-3 font-display text-4xl font-700 tracking-tight text-[#dffee6] sm:text-6xl">
            AI BEATS
            <span className="block text-[#d000ff]">2080SUPER SESSION</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md font-mono text-[10px] leading-relaxed text-[#7aafa0]">
            Locally generated on RTX 2080 SUPER. MusicGen + AudioLDM2. Raw exports - no post.
          </p>
        </div>

        <div className="panel relative mx-auto max-w-2xl p-5 sm:p-7">
          <div className="absolute left-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>
          <div className="absolute right-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>

          <div className="space-y-1">
            {AI_BEATS.map((t, i) => {
              const isPlaying = playingIdx === i;
              return (
                <motion.button
                  key={t.file}
                  onClick={() => toggle(i)}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className={`group flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                    isPlaying ? "border-[#d000ff] bg-[#1a0a1f]" : "border-transparent hover:border-[#1a5048] hover:bg-[#062028]"
                  }`}
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[9px] ${isPlaying ? "border-[#d000ff] text-[#d000ff]" : "border-[#1a5048] text-[#7aafa0] group-hover:text-[#dffee6]"}`}>
                    {isPlaying ? "❚❚" : i + 1}
                  </span>
                  <div className="flex-1 truncate">
                    <span className={`block font-mono text-[10px] tracking-[0.15em] ${isPlaying ? "text-[#d000ff]" : "text-[#dffee6]"}`}>
                      {t.name}
                    </span>
                    <span className="block font-mono text-[8px] tracking-[0.1em] text-[#7aafa0]">
                      {t.bpm} BPM · {t.key} · {t.model}
                    </span>
                  </div>
                  {isPlaying && (
                    <span className="flex h-4 items-end gap-[2px]">
                      {[0.5, 0.9, 0.6, 1, 0.7].map((h, j) => (
                        <motion.span
                          key={j}
                          className="w-[3px] rounded-sm bg-[#d000ff]"
                          animate={{ height: [`${h * 30}%`, `${h * 100}%`, `${h * 45}%`] }}
                          transition={{ duration: 0.7 + j * 0.1, repeat: Infinity, ease: "easeInOut" }}
                        />
                      ))}
                    </span>
                  )}
                  <span className="w-16 text-right font-mono text-[8px] tabular-nums text-[#1a5048]">
                    {t.bpm} BPM
                  </span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {playingIdx !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-center font-mono text-[8px] tracking-[0.35em] text-[#d000ff]"
              >
                AI GENERATED · RTX 2080 SUPER · RAW EXPORTS
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}