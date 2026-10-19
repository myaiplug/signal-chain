import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import { spotifyDecks } from "./audio/spotify";
import { OPENER } from "./data/intro";
import { TOOL_LINKS } from "./data/artists";
import { PowerOnOverlay } from "./components/PowerOnOverlay";
import { TransportBar } from "./components/TransportBar";
import { InputSection } from "./components/InputSection";
import { CatalogSection } from "./components/CatalogSection";
import { AIBaySection } from "./components/AIBaySection";
import { VaultSection } from "./components/VaultSection";
import { BeatStore } from "./components/BeatStore";
import { MasteringSection } from "./components/MasteringSection";

const HERO_DECK = "spotify-hero";

export default function App() {
  const [entered, setEntered] = useState(false);
  const [withSound, setWithSound] = useState(false);

  // buttery smooth scroll
  useEffect(() => {
    if (!entered) return;
    const l = new Lenis({ lerp: 0.08, wheelMultiplier: 1.05 });
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

  // glowing cursor dot
  useEffect(() => {
    if (!entered) return;
    const dot = document.getElementById("cursor-dot");
    if (!dot) return;
    const size = 12;
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.margin = `-${size / 2}px 0 0 -${size / 2}px`;
    const move = (e: PointerEvent) => {
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [entered]);

  // ONE entry point, ONE track: the click on the overlay is the user gesture
  // that starts the randomly picked opener in the hero deck. Nothing else
  // auto-starts.
  const handleEnter = (sound: boolean) => {
    if (entered) return;
    setWithSound(sound);
    setEntered(true);
    if (sound) spotifyDecks.get(HERO_DECK)?.play();
  };

  return (
    <div className="grain scanlines min-h-screen bg-[#03080a]">
      <div id="cursor-dot" style={{ display: entered ? "block" : "none" }} />
      {/* fixed UI lives OUTSIDE the page wrapper so position:fixed stays fixed */}
      <AnimatePresence>{!entered && <PowerOnOverlay opener={OPENER} onEnter={handleEnter} />}</AnimatePresence>
      {entered && <TransportBar />}

      <div id="page" className="relative z-10">
        <main>
          {/* the hero is mounted behind the overlay so the opener's player is
              already loaded when the visitor taps ENTER */}
          <InputSection opener={OPENER} deckOwner={HERO_DECK} entered={entered} withSound={withSound} />
          {entered && (
            <>
              <CatalogSection initial={OPENER} />
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
