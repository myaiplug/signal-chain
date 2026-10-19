import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { GlitchText, Orb } from "./vfx";
import type { Artist } from "../data/artists";
import { TOOL_LINKS } from "../data/artists";
import { useSpotifyEmbed } from "../audio/spotify";

const BASE = import.meta.env.BASE_URL || "/";

/** Decorative waveform line along the bottom of the hero */
function WaveCanvas({ className = "", opacity = 0.9 }: { className?: string; opacity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx2d = cv.getContext("2d")!;
    let raf = 0;
    const N = 1024;
    const draw = () => {
      const w = (cv.width = cv.offsetWidth * devicePixelRatio);
      const h = (cv.height = cv.offsetHeight * devicePixelRatio);
      ctx2d.clearRect(0, 0, w, h);
      const now = performance.now() / 1000;
      ctx2d.strokeStyle = "#00ffaa";
      ctx2d.lineWidth = 1.5 * devicePixelRatio;
      ctx2d.shadowColor = "rgba(0,255,170,0.6)";
      ctx2d.shadowBlur = 12;
      ctx2d.beginPath();
      for (let i = 0; i < N; i++) {
        const x = (i / N) * w;
        const v = 0.035 * Math.sin(i * 0.036 + now * 1.4) * Math.sin(i * 0.008 + now * 0.5);
        const y = h / 2 + v * h * 0.42;
        if (i === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
      }
      ctx2d.stroke();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className={className} style={{ opacity }} />;
}

type HeroProps = { opener: Artist; deckOwner: string; entered: boolean; withSound: boolean };

/** The opener deck - the randomly picked artist's Spotify player, front and center. */
function OpenerDeck({ opener, deckOwner, entered, withSound }: HeroProps) {
  const deck = useSpotifyEmbed({ owner: deckOwner, label: opener.name, uri: `spotify:artist:${opener.spotifyId}`, height: 152 });
  const [nudge, setNudge] = useState(false);

  // if the browser held the audio back, ask for one tap - no autoplay tricks
  useEffect(() => {
    if (!entered || !withSound || deck.playing) {
      setNudge(false);
      return;
    }
    const t = window.setTimeout(() => setNudge(true), 4000);
    return () => window.clearTimeout(t);
  }, [entered, withSound, deck.playing]);

  const soft = opener.glow.replace(/0\.3\d?\)/, "0.12)");

  return (
    <div
      className="panel relative w-full max-w-[520px] p-4 sm:p-5"
      style={{ boxShadow: `0 30px 80px rgba(0,0,0,0.55), 0 0 60px ${soft}` }}
      data-testid="opener-deck"
      data-opener={opener.id}
      data-playing={deck.playing ? "1" : "0"}
      data-status={deck.status}
    >
      <div className="absolute left-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>
      <div className="absolute right-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>
      <div className="mb-4 mt-2 flex items-center gap-4 px-1">
        <div className="relative h-14 w-14 shrink-0">
          <div
            className={`absolute -inset-1 rounded-full border border-dashed ${deck.playing ? "reel-spinning" : ""}`}
            style={{ borderColor: `${opener.accent}88` }}
          />
          <img
            src={`${BASE}img/${opener.id}.jpg`}
            alt={opener.name}
            className="h-14 w-14 rounded-full border-2 object-cover"
            style={{ borderColor: opener.accent }}
          />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2 font-mono text-[8px] tracking-[0.35em]" style={{ color: opener.accent }}>
            <span className={`led ${deck.playing ? "on" : ""}`} style={deck.playing ? { background: opener.accent, boxShadow: `0 0 8px ${opener.glow}` } : {}} />
            {deck.playing ? "NOW PLAYING" : "ON DECK"} · TONIGHT'S OPENER
          </div>
          <div className="mt-1 truncate font-display text-xl font-600 text-[#dffee6]">{opener.name}</div>
          <div className="truncate font-mono text-[9px] tracking-[0.2em] text-[#7aafa0]">{opener.role}</div>
        </div>
        <button
          onClick={() => (deck.playing ? deck.pause() : deck.play())}
          disabled={deck.status !== "ready"}
          aria-label={deck.playing ? `Pause ${opener.name}` : `Play ${opener.name}`}
          data-testid="opener-toggle"
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border font-mono text-xs transition-transform hover:scale-105 active:scale-95 disabled:cursor-wait disabled:opacity-40"
          style={{ borderColor: opener.accent, color: opener.accent, boxShadow: `0 0 18px ${soft}` }}
        >
          {deck.playing ? "❚❚" : "▶"}
        </button>
      </div>
      <div className="spotify-chassis panel-inset relative min-h-[160px] overflow-hidden p-1">
        {deck.status === "failed" ? (
          <iframe
            title={`${opener.name} on Spotify`}
            src={`https://open.spotify.com/embed/artist/${opener.spotifyId}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
        ) : (
          <div ref={deck.hostRef} className="h-[152px] w-full" />
        )}
        {deck.status === "loading" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[9px] tracking-[0.35em] text-[#1a5048]">
            LOADING THE REEL…
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 px-1 font-mono text-[8px] tracking-[0.25em] text-[#1a5048]">
        <span className={nudge ? "animate-pulse text-[#dffee6]" : ""} data-testid="opener-hint">
          {nudge ? "YOUR BROWSER HELD THE AUDIO · TAP ▶ TO START" : "SHUFFLED ON EVERY VISIT · ONE TRACK AT A TIME"}
        </span>
        <a
          href={`https://open.spotify.com/artist/${opener.spotifyId}`}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-[#7aafa0] hover:text-[#00ffaa]"
        >
          SPOTIFY ↗
        </a>
      </div>
    </div>
  );
}

export function InputSection(props: HeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yTitle = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const show = props.entered;

  return (
    <section ref={ref} className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pb-24 pt-24 sm:px-6 sm:pt-28">
      <Orb className="-left-40 top-1/4" size={480} dur={22} />
      <Orb className="-right-32 bottom-1/4" size={380} color="rgba(0,212,255,0.06)" dur={26} />
      <Orb className="left-1/3 -top-32" size={300} color="rgba(158,255,0,0.05)" dur={19} />
      <motion.div
        style={{ y: yTitle, opacity }}
        className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12"
      >
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.div
            initial={{ opacity: 0 }}
            animate={show ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="mb-6 font-mono text-[10px] tracking-[0.5em] text-[#7aafa0]"
          >
            BRIAN JUTZ · PRODUCER · ENGINEER<span className="hidden sm:inline"> · TOOLMAKER</span>
          </motion.div>
          <h1 className="font-display font-700 leading-[0.92] tracking-tighter">
            <motion.span
              className="block whitespace-nowrap text-[clamp(2.5rem,10.5vw,4.4rem)] text-[#dffee6] lg:text-[4.35rem] xl:text-[4.9rem]"
              initial={{ opacity: 0, y: 60 }}
              animate={show ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.35, type: "spring", stiffness: 60, damping: 16 }}
            >
              THE BEAT MOB
            </motion.span>
            <motion.span
              className="mt-2 flex items-baseline justify-center gap-3 whitespace-nowrap text-[clamp(1.9rem,8.6vw,3.6rem)] lg:justify-start lg:text-[3.6rem] xl:text-[4rem]"
              initial={{ opacity: 0, y: 60 }}
              animate={show ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, type: "spring", stiffness: 60, damping: 16 }}
            >
              <span className="font-300 text-[#7aafa0]">×</span>
              <span className="text-[#00ffaa] text-glow">
                <GlitchText text="bTHIRTYthreezy" />
              </span>
            </motion.span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={show ? { opacity: 1 } : {}}
            transition={{ delay: 0.9 }}
            className="mt-6 max-w-lg font-mono text-[11px] leading-relaxed text-[#7aafa0] sm:mt-8 sm:text-xs"
          >
            10 years of production. 7 years of audio software. The Beat Mob
            catalog and the bTHIRTYthreezy solo project - beats, records and
            the tools behind them, built in-house and released on Spotify.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={show ? { opacity: 1 } : {}}
            transition={{ delay: 1.05 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8 lg:justify-start"
          >
            <a
              href={TOOL_LINKS.store}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-[#00ffaa] bg-[#003828] px-6 py-3 font-mono text-[10px] font-bold tracking-[0.3em] text-[#dffee6] transition-transform hover:scale-105"
              style={{ boxShadow: "0 0 24px rgba(0,255,170,0.18)" }}
            >
              SHOP THE BEAT MOB STORE ↗
            </a>
            <a
              href="#catalog"
              className="rounded-xl border border-[#1a5048] px-6 py-3 font-mono text-[10px] tracking-[0.3em] text-[#7aafa0] transition-colors hover:border-[#00ffaa66] hover:text-[#dffee6]"
            >
              THE ROSTER ↓
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, type: "spring", stiffness: 70, damping: 18 }}
          className="flex justify-center lg:justify-end"
        >
          <OpenerDeck {...props} />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={show ? { opacity: 1 } : {}}
        transition={{ delay: 1.3 }}
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[9px] tracking-[0.4em] text-[#1a5048]"
      >
        SCROLL
        <motion.div
          animate={{ scaleY: [1, 2.2, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="h-6 w-px bg-[#00ffaa]"
        />
      </motion.div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40">
        <WaveCanvas className="h-full w-full" opacity={0.55} />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#03080a] to-transparent" />
      </div>
    </section>
  );
}
