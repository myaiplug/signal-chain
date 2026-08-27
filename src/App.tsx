import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import { engine } from "./audio/engine";
import { onAudioClaimed, claimAudio } from "./audio/bus";
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

export default function App() {
  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(false);
  const [tapeStopped, setTapeStopped] = useState(false);
  const lenis = useRef<Lenis | null>(null);

  // audio exclusivity: ambient soundtrack stops when any other player starts
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

  const handleTapeStop = () => {
    setTapeStopped(true);
  };

  const handleEnter = (m: boolean) => {
    setMuted(m);
    setEntered(true);
    if (!m) {
      // beats are already tagged - go straight into the soundtrack
      engine.start().then(() => claimAudio("ambient"));
    }
  };

  const handleRewind = () => {
    setTapeStopped(false);
    lenis.current?.scrollTo(0, { duration: 1.4 });
  };

  return (
    <div className="grain scanlines min-h-screen bg-[#03080a]">
      <div
        id="cursor-dot"
        style={{ display: entered ? "block" : "none" }}
      />
      <SpectrumBackdrop />

      <div
        id="page-warp"
        className="relative z-10 transition-all duration-700"
        style={
          tapeStopped
            ? { transform: "perspective(1200px) rotateX(7deg) scale(0.96)", filter: "brightness(0.75) saturate(0.7)" }
            : {}
        }
      >
        <AnimatePresence>{!entered && <PowerOnOverlay onEnter={handleEnter} />}</AnimatePresence>

        {entered && (
          <>
            <TransportBar muted={muted} />
            <main>
              <InputSection />
              <CatalogSection />
              <RackSection />
              <AIBaySection />
              <VaultSection />
              <BeatStore />
              <MasteringSection />
            </main>
            <TapeStopLever onTapeStop={handleTapeStop} onRewind={handleRewind} />

            <footer className="relative z-10 border-t border-[#1a504855] px-6 py-8 pb-24 text-center font-mono text-[9px] tracking-[0.3em] text-[#1a5048]">
              THE SIGNAL CHAIN · BRIAN JUTZ · {new Date().getFullYear()} · EVERY SOUND ON THIS PAGE WAS SYNTHESIZED LIVE IN YOUR BROWSER
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
