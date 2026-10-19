import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GlitchText } from "./vfx";
import { useExclusiveAudio } from "../audio/useExclusiveAudio";

const BASE = import.meta.env.BASE_URL || "/";

/**
 * LIVE INTERFACE DEMO - the actual FanTune skeuomorphic skin demo,
 * self-hosted from coproducer-web-era assets, framed as rack hardware.
 */
export function InterfaceDemo() {
  const [live, setLive] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  // the embedded FanTune demo has its own Web Audio player: bridge it to the
  // bus over postMessage (same origin) so it obeys one-track-at-a-time too
  const claim = useExclusiveAudio("fantune", () => {
    frameRef.current?.contentWindow?.postMessage({ type: "tbm-audio", action: "pause" }, window.location.origin);
  }, "FANTUNE DEMO");

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.source !== frameRef.current?.contentWindow) return;
      if (e.data?.type === "tbm-audio" && e.data.action === "claim") claim();
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [claim]);

  return (
    <div className="panel relative overflow-hidden p-6">
      <div className="absolute left-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>
      <div className="absolute right-3 top-3 flex gap-1.5"><div className="screw" /><div className="screw" /></div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[8px] tracking-[0.4em] text-[#7aafa0]">FANTUNE · SKEUOMORPHIC PLUGIN SKIN</div>
          <div className="mt-1 font-display text-xl font-700 text-[#dffee6]">
            <GlitchText text="MY INTERFACE. LIVE." />
          </div>
          <p className="mt-1 max-w-lg font-mono text-[9px] leading-relaxed text-[#7aafa0]">
            Not a screenshot - this is the actual FanTune web demo running
            embedded. Knobs, racks, VU needles - the whole hardware language I
            design in, born as a JUCE LookAndFeel and rebuilt for the browser.
          </p>
        </div>
        <a href="https://myaiplug.github.io/fantune-skin/" target="_blank" rel="noreferrer" className="font-mono text-[9px] tracking-[0.3em] text-[#00ffaa] hover:underline">
          OPEN FULL SKIN →
        </a>
      </div>

      <div className="panel-inset relative mt-5 overflow-hidden">
        {!live ? (
          <button
            onClick={() => setLive(true)}
            className="group relative block w-full cursor-pointer"
          >
            <img
              src={`${BASE}interface/plugin_hero.webp`}
              alt="FanTune interface"
              className="h-[380px] w-full object-cover object-top opacity-80 transition-all duration-700 group-hover:scale-[1.03] group-hover:opacity-100 sm:h-[460px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020a0c] via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-xl border border-[#00ffaa] bg-[#003828]/90 px-8 py-4 font-mono text-xs font-bold tracking-[0.3em] text-[#dffee6] backdrop-blur"
                style={{ boxShadow: "0 0 40px rgba(0,255,170,0.3)" }}
              >
                ▶ POWER THE INTERFACE
              </motion.span>
            </div>
          </button>
        ) : (
          <motion.iframe
            ref={frameRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={`${BASE}interface/index.html`}
            title="FanTune interface demo"
            className="h-[560px] w-full border-0 bg-[#020a0c]"
            sandbox="allow-scripts allow-same-origin"
          />
        )}
      </div>
    </div>
  );
}
