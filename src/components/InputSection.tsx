import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { engine } from "../audio/engine";
import { GlitchText, Orb } from "./vfx";

/** Live waveform canvas fed by the engine's analyser */
export function WaveCanvas({ className = "", opacity = 0.9 }: { className?: string; opacity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx2d = cv.getContext("2d")!;
    let raf = 0;
    const draw = () => {
      const w = (cv.width = cv.offsetWidth * devicePixelRatio);
      const h = (cv.height = cv.offsetHeight * devicePixelRatio);
      ctx2d.clearRect(0, 0, w, h);
      const data = engine.getWaveform();
      ctx2d.strokeStyle = "#00ffaa";
      ctx2d.lineWidth = 1.5 * devicePixelRatio;
      ctx2d.shadowColor = "rgba(0,255,170,0.6)";
      ctx2d.shadowBlur = 12;
      ctx2d.beginPath();
      for (let i = 0; i < data.length; i++) {
        const x = (i / data.length) * w;
        const y = h / 2 + data[i] * h * 0.42;
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

/** Fixed full-viewport spectrum backdrop */
export function SpectrumBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx2d = cv.getContext("2d")!;
    let raf = 0;
    const draw = () => {
      const w = (cv.width = cv.offsetWidth * devicePixelRatio);
      const h = (cv.height = cv.offsetHeight * devicePixelRatio);
      ctx2d.clearRect(0, 0, w, h);
      const spec = engine.getSpectrum();
      const bins = 72;
      const bw = w / bins;
      for (let i = 0; i < bins; i++) {
        const v = spec[Math.floor((i / bins) * 240)] / 255;
        const bh = v * h * 0.5;
        const grad = ctx2d.createLinearGradient(0, h, 0, h - bh);
        grad.addColorStop(0, "rgba(0,255,170,0.14)");
        grad.addColorStop(1, "rgba(0,212,255,0.02)");
        ctx2d.fillStyle = grad;
        ctx2d.fillRect(i * bw + 1, h - bh, bw - 2, bh);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      style={{ opacity: 0.5 }}
    />
  );
}

export function InputSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yTitle = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6">
      <Orb className="-left-40 top-1/4" size={480} dur={22} />
      <Orb className="-right-32 bottom-1/4" size={380} color="rgba(0,212,255,0.06)" dur={26} />
      <Orb className="left-1/3 -top-32" size={300} color="rgba(158,255,0,0.05)" dur={19} />
      <motion.div style={{ y: yTitle, opacity }} className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 font-mono text-[10px] tracking-[0.5em] text-[#7aafa0]"
        >
          INPUT · YOU ARE THE SIGNAL
        </motion.div>
        <h1 className="font-display text-[13vw] font-700 leading-[0.92] tracking-tighter sm:text-8xl">
          <motion.span
            className="block text-[#dffee6]"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 60, damping: 16 }}
          >
            EVERY SIGNAL
          </motion.span>
          <motion.span
            className="block text-[#00ffaa] text-glow"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 60, damping: 16 }}
          >
            <GlitchText text="NEEDS A CHAIN" />
          </motion.span>
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 max-w-lg font-mono text-xs leading-relaxed text-[#7aafa0]"
        >
          10 years of production. 7 years of audio software. AI instrumentals,
          AI vocals, real records on Spotify. This page runs on my own DSP -
          everything you hear is being processed live in your browser.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-10 flex flex-col items-center gap-2 font-mono text-[9px] tracking-[0.4em] text-[#1a5048]"
        >
          SCROLL TO ENTER THE RACK
          <motion.div
            animate={{ scaleY: [1, 2.2, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="h-6 w-px bg-[#00ffaa]"
          />
        </motion.div>
      </motion.div>

      {/* raw ugly waveform at bottom */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40">
        <WaveCanvas className="h-full w-full" opacity={0.55} />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#03080a] to-transparent" />
      </div>
    </section>
  );
}
