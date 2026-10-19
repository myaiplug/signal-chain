import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExclusiveAudio } from "../audio/useExclusiveAudio";
import { releaseAudio } from "../audio/bus";
import { STORE_URL } from "../data/artists";

const BASE = import.meta.env.BASE_URL || "/";
const asset = (p: string) => BASE + p;


interface VaultTrack {
  file: string;
  name: string;
  bpm: number | null;
}

const VAULT_TRACKS: VaultTrack[] = [
  { file: "vault/01-first-quarter-servin.mp3", name: "FIRST QUARTER (SERVIN)", bpm: null },
  { file: "vault/02-motion.mp3", name: "MOTION", bpm: null },
  { file: "vault/03-built-different.mp3", name: "BUILT DIFFERENT", bpm: null },
  { file: "vault/04-after-hours.mp3", name: "AFTER HOURS", bpm: null },
  { file: "vault/05-no-backup-plan-152.mp3", name: "NO BACKUP PLAN", bpm: 152 },
  { file: "vault/06-long-way-down.mp3", name: "LONG WAY DOWN", bpm: null },
  { file: "vault/07-applied-pressure.mp3", name: "APPLIED PRESSURE", bpm: null },
  { file: "vault/08-risk-taker-161.mp3", name: "RISK TAKER", bpm: 161 },
  { file: "vault/09-sick-n-tired-129.mp3", name: "SICK N TIRED", bpm: 129 },
  { file: "vault/10-southside-business.mp3", name: "SOUTHSIDE BUSINESS", bpm: null },
  { file: "vault/11-street-code.mp3", name: "STREET CODE", bpm: null },
  { file: "vault/12-time-is-money-129.mp3", name: "TIME IS MONEY", bpm: 129 },
  { file: "vault/13-whatchu-know-bout-it.mp3", name: "WHATCHU KNOW BOUT IT", bpm: null },
];

export function VaultSection() {
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const claim = useExclusiveAudio("vault", () => {
    audioRef.current?.pause();
    setPlayingIdx(null);
  }, "THE COLLECTIVE VAULT");

  const toggle = (idx: number) => {
    if (!audioRef.current) {
      const fresh = new Audio();
      fresh.addEventListener("ended", () => {
        setPlayingIdx(null);
        releaseAudio("vault");
      });
      audioRef.current = fresh;
    }
    const el = audioRef.current;
    if (playingIdx === idx) {
      el.pause();
      setPlayingIdx(null);
      releaseAudio("vault");
      return;
    }
    claim(); // stop everything else first, THEN start
    el.src = asset(VAULT_TRACKS[idx].file);
    el.play().catch(() => {
      setPlayingIdx(null);
      releaseAudio("vault");
    });
    setPlayingIdx(idx);
  };

  return (
    <section className="relative min-h-[100svh] px-4 py-28 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <div className="font-mono text-[10px] tracking-[0.5em] text-[#9eff00]">03 · THE VAULT</div>
          <h2 className="mt-3 font-display text-4xl font-700 tracking-tight text-[#dffee6] sm:text-6xl">
            THE COLLECTIVE
            <span className="block text-[#9eff00]">VAULT · VOL. 1</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md font-mono text-[10px] leading-relaxed text-[#7aafa0]">
            13 trap instrumentals. Produced, mixed, mastered, tagged and
            shipped. This is the product - previews are 40-second tagged cuts.
          </p>
        </div>

        <div className="panel relative mx-auto max-w-2xl p-5 sm:p-7">
          <div className="absolute left-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>
          <div className="absolute right-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>

          <div className="space-y-1">
            {VAULT_TRACKS.map((t, i) => {
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
                    isPlaying ? "border-[#9eff00] bg-[#0a1400]" : "border-transparent hover:border-[#1a5048] hover:bg-[#062028]"
                  }`}
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[9px] ${isPlaying ? "border-[#9eff00] text-[#9eff00]" : "border-[#1a5048] text-[#7aafa0] group-hover:text-[#dffee6]"}`}>
                    {isPlaying ? "❚❚" : i + 1}
                  </span>
                  <span className={`flex-1 truncate font-mono text-[10px] tracking-[0.15em] ${isPlaying ? "text-[#9eff00]" : "text-[#dffee6]"}`}>
                    {t.name}
                  </span>
                  {isPlaying && (
                    <span className="flex h-4 items-end gap-[2px]">
                      {[0.5, 0.9, 0.6, 1, 0.7].map((h, j) => (
                        <motion.span
                          key={j}
                          className="w-[3px] rounded-sm bg-[#9eff00]"
                          animate={{ height: [`${h * 30}%`, `${h * 100}%`, `${h * 45}%`] }}
                          transition={{ duration: 0.7 + j * 0.1, repeat: Infinity, ease: "easeInOut" }}
                        />
                      ))}
                    </span>
                  )}
                  <span className="w-12 text-right font-mono text-[8px] tabular-nums text-[#1a5048]">
                    {t.bpm ? `${t.bpm} BPM` : "TRAP"}
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
                className="mt-3 text-center font-mono text-[8px] tracking-[0.35em] text-[#9eff00]"
              >
                TAGGED 40 SEC PREVIEW · FULL VERSION + STEMS IN THE PACK
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <motion.a
              href={STORE_URL}
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="w-full cursor-pointer rounded-xl border-2 border-[#9eff00] bg-[#1a3000] px-8 py-3.5 text-center font-mono text-xs font-bold tracking-[0.3em] text-[#dffee6] sm:w-auto"
              style={{ boxShadow: "0 0 30px rgba(158,255,0,0.2)" }}
            >
              GET THE VAULT AT THE BEAT MOB STORE ↗
            </motion.a>
          </div>
          <p className="mt-4 text-center font-mono text-[8px] tracking-[0.25em] text-[#1a5048]">
            WAV + STEMS · UNLIMITED COMMERCIAL USE · PRODUCED BY THE BEAT MOB
          </p>
        </div>
      </div>
    </section>
  );
}
