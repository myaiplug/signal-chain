import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import { engine } from "./audio/engine";
import { onAudioClaimed } from "./audio/bus";
import { spotifyDecks } from "./audio/spotify";
import { OPENER } from "./data/intro";
import { TOOL_LINKS } from "./data/artists";
import { PowerOnOverlay } from "./components/PowerOnOverlay";
import { TransportBar } from "./components/TransportBar";
import { InputSection, SpectrumBackdrop } from "./components/InputSection";
import { CatalogSection } from "./components/CatalogSection";
import { RackSection } from "./components/RackSection";
import { AIBaySection } from "./components/AIBaySection";
import { VaultSection } from "./components/VaultSection";
import { BeatStore } from "./components/BeatStore";
import { MasteringSection } from "./components/MasteringSection";
import { TapeStopLever } from "./components/TapeStopLever";

const HERO_DECK = "spotify-hero";

export default function App() {
  const [entered, setEntered] = useState(false);
  const [withSound, setWithSound] = useState(false);
  const [tapeStopped, setTapeStopped] = useState(false);
  const lenis = useRef<Lenis | null>(null);

  // the house soundtrack (Web Audio engine) stops whenever anything else claims the speakers
  useEffect(() => {
    return onAudioClaimed((owner) => {
      if (owner !== "ambient") engine.pause();
    });
  }, []);

  // buttery smooth scroll
  useEffect(() => {
    if (!entered) return;
    const l = new Lenis({ lerp: 0.08, wheelMultiplier: 1.05 });
    lenis.current = l;
    let raf = 0;
    const loop = (t: number) => {
      l.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      l.destroy();
    };
  }, [entered]);

  // spectrum-reactive cursor
  useEffect(() => {
    if (!entered) return;
    const dot = document.getElementById("cursor-dot");
    if (!dot) return;
    const move = (e: PointerEvent) => {
      const spec = engine.getSpectrum();
      const energy = spec.slice(0, 60).reduce((a, b) => a + b, 0) / (60 * 255);
      const size = 10 + energy * 26;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.margin = `-${size / 2}px 0 0 -${size / 2}px`;
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [entered]);

  // ONE entry point, ONE track: the click on the overlay is the user gesture
  // that starts the randomly picked opener in the hero deck. Nothing else
  // auto-starts (the old build also fired the house soundtrack here, so the
  // opener and any Spotify play would stack on top of it).
  const handleEnter = (sound: boolean) => {
    if (entered) return;
    setWithSound(sound);
    setEntered(true);
    if (sound) spotifyDecks.get(HERO_DECK)?.play();
  };

  const handleRewind = () => {
    setTapeStopped(false);
    lenis.current?.scrollTo(0, { duration: 1.4 });
  };

  return (
    <div className="grain scanlines min-h-screen bg-[#03080a]">
      <div id="cursor-dot" style={{ display: entered ? "block" : "none" }} />
      <SpectrumBackdrop />
      {/* fixed UI lives OUTSIDE #page-warp: its will-change makes it the
          containing block for position:fixed, which made the bar scroll away */}
      <AnimatePresence>{!entered && <PowerOnOverlay opener={OPENER} onEnter={handleEnter} />}</AnimatePresence>
      {entered && <TransportBar />}
      {entered && <TapeStopLever onTapeStop={() => setTapeStopped(true)} onRewind={handleRewind} />}

      <div
        id="page-warp"
        className="relative z-10 transition-all duration-700"
        style={
          tapeStopped
            ? { transform: "perspective(1200px) rotateX(7deg) scale(0.96)", filter: "brightness(0.75) saturate(0.7)" }
            : {}
        }
      >
        <main>
          {/* the hero is mounted behind the overlay so the opener's player is
              already loaded when the visitor taps ENTER */}
          <InputSection opener={OPENER} deckOwner={HERO_DECK} entered={entered} withSound={withSound} />
          {entered && (
            <>
              <CatalogSection initial={OPENER} />
              <RackSection />
              <AIBaySection />
              <VaultSection />
              <BeatStore />
              <MasteringSection />
            </>
          )}
        </main>
        {entered && (
          <>
            <footer className="relative z-10 border-t border-[#1a504855] px-6 py-10 pb-24 text-center font-mono text-[9px] tracking-[0.3em] text-[#1a5048]">
              <div className="font-display text-sm font-600 tracking-[0.2em] text-[#7aafa0]">
                THE BEAT MOB <span className="text-[#00ffaa]">×</span> bTHIRTYthreezy
              </div>
              <div className="mt-3">
                BRIAN JUTZ · {new Date().getFullYear()} ·{" "}
                <a href={TOOL_LINKS.store} target="_blank" rel="noreferrer" className="text-[#7aafa0] hover:text-[#00ffaa]">
                  THE BEAT MOB STORE
                </a>{" "}
                · <a href={`mailto:${TOOL_LINKS.email}`} className="text-[#7aafa0] hover:text-[#00ffaa]">{TOOL_LINKS.email.toUpperCase()}</a>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
