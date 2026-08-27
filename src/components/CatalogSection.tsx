import { useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ARTISTS, type Artist } from "../data/artists";
import { engine } from "../audio/engine";
import { TiltPanel, GlitchText } from "./vfx";

const BASE = import.meta.env.BASE_URL || "/";

function Reel({ artist, active, onClick }: { artist: Artist; active: boolean; onClick: () => void }) {
  const spinning = active && engine.playing;
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -10, rotate: -1 }}
      whileTap={{ scale: 0.96 }}
      className="group relative flex w-full cursor-pointer flex-col items-center gap-4"
    >
      {/* the reel */}
      <div
        className="relative aspect-square w-full max-w-[190px] rounded-full border-2 transition-all duration-500"
        style={{
          borderColor: active ? artist.accent : "#1a5048",
          background: "radial-gradient(circle at 50% 50%, #062028 30%, #020a0c 70%)",
          boxShadow: active
            ? `0 0 40px ${artist.glow}, inset 0 0 30px rgba(0,0,0,0.8)`
            : "inset 0 0 30px rgba(0,0,0,0.8)",
        }}
      >
        <div className={`absolute inset-3 rounded-full border border-dashed ${spinning ? "reel-spinning" : ""}`} style={{ borderColor: active ? `${artist.accent}55` : "#1a504855" }}>
          <div className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2" style={{ background: active ? artist.accent : "#1a5048" }} />
          <div className="absolute left-1/2 bottom-0 h-3 w-px -translate-x-1/2" style={{ background: active ? artist.accent : "#1a5048" }} />
          <div className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2" style={{ background: active ? artist.accent : "#1a5048" }} />
          <div className="absolute right-0 top-1/2 h-px w-3 -translate-y-1/2" style={{ background: active ? artist.accent : "#1a5048" }} />
        </div>
        {/* artist photo window */}
        <div className="absolute inset-[26%] overflow-hidden rounded-full border border-[#1a5048]">
          <img
            src={`${BASE}img/${artist.id}.jpg`}
            alt={artist.name}
            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-125"
            style={{ filter: active ? "saturate(1.1)" : "grayscale(0.85) brightness(0.75)" }}
          />
          <div className="absolute inset-0" style={{ background: active ? `${artist.accent}14` : "rgba(3,8,10,0.45)" }} />
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded border border-[#1a5048] bg-[#020a0c] px-2 py-0.5 font-mono text-[8px] tracking-[0.25em] text-[#7aafa0]">
          {artist.reelLabel}
        </div>
      </div>
      <div className="text-center">
        <div className="font-mono text-[8px] tracking-[0.35em]" style={{ color: active ? artist.accent : "#1a5048" }}>
          {artist.tag}
        </div>
        <div className={`mt-1 font-display text-sm font-600 tracking-wide transition-colors ${active ? "text-[#dffee6]" : "text-[#7aafa0] group-hover:text-[#dffee6]"}`}>
          {artist.name}
        </div>
      </div>
    </motion.button>
  );
}

export function CatalogSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Artist>(ARTISTS[0]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const shelfY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={ref} className="relative min-h-[100svh] px-4 py-28 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 flex items-end justify-between">
          <div>
            <div className="font-mono text-[10px] tracking-[0.5em] text-[#00ffaa]">01 · THE CATALOG</div>
          <h2 className="mt-3 font-display text-4xl font-700 tracking-tight text-[#dffee6] sm:text-6xl">
            <GlitchText text="PULL A REEL." />
          </h2>
          </div>
          <p className="hidden max-w-xs text-right font-mono text-[10px] leading-relaxed text-[#7aafa0] sm:block">
            Four identities, all engineered end-to-end. Real records, real
            streams. Load a tape to hear it.
          </p>
        </div>

        {/* reel shelf */}
        <motion.div style={{ y: shelfY }} className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-6">
          {ARTISTS.map((a) => (
            <Reel key={a.id} artist={a} active={selected.id === a.id} onClick={() => setSelected(a)} />
          ))}
        </motion.div>

        {/* the machine chassis with spotify inside */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="mx-auto mt-16 max-w-3xl"
          >
            <TiltPanel className="panel p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-3">
                <span className="led on" style={{ background: selected.accent, boxShadow: `0 0 8px ${selected.glow}` }} />
                <div>
                  <div className="font-display text-lg font-600 text-[#dffee6]">{selected.name}</div>
                  <div className="font-mono text-[9px] tracking-[0.3em] text-[#7aafa0]">{selected.role}</div>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => <div key={i} className="screw" />)}
              </div>
            </div>
            <p className="mb-4 px-1 font-mono text-[10px] leading-relaxed text-[#7aafa0]">{selected.blurb}</p>
            <div
              className="spotify-chassis panel-inset relative overflow-hidden p-2"
              style={{ boxShadow: `inset 0 0 40px ${selected.glow.replace("0.35", "0.12").replace("0.3", "0.1")}, inset 0 4px 18px rgba(0,0,0,0.8)` }}
            >
              <iframe
                title={`${selected.name} on Spotify`}
                src={`https://open.spotify.com/embed/artist/${selected.spotifyId}?utm_source=generator&theme=0`}
                width="100%"
                height="352"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
            </TiltPanel>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
