import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { engine } from "../audio/engine";
import { currentAudio, onNowPlaying } from "../audio/bus";
import { TOOL_LINKS } from "../data/artists";

export function TransportBar() {
  const [np, setNp] = useState(currentAudio());
  useEffect(() => onNowPlaying(setNp), []);
  const [lufs, setLufs] = useState(-60);
  const [peak, setPeak] = useState(-60);
  const [corr, setCorr] = useState(1);
  const [time, setTime] = useState("00:00:00");
  const raf = useRef(0);
  const start = useRef(Date.now());

  useEffect(() => {
    const tick = () => {
      setLufs(engine.getLufs());
      setPeak(engine.getPeak());
      setCorr(engine.getCorrelation());
      const s = Math.floor((Date.now() - start.current) / 1000);
      const m = Math.floor(s / 60);
      const h = Math.floor(m / 60);
      setTime(
        `${String(h).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`
      );
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const lufsPct = Math.max(0, Math.min(100, ((lufs + 60) / 60) * 100));
  const safe = lufs > -15 && lufs < -8;

  return (
    <motion.div
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 120, damping: 18 }}
      className="fixed left-1/2 top-3 z-[80] flex w-[min(94vw,880px)] -translate-x-1/2 items-center gap-3 rounded-xl border border-[#1a5048] bg-[#041216]/85 px-4 py-2.5 font-mono text-[10px] backdrop-blur-md"
      style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(223,255,230,0.05)" }}
    >
      <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="shrink-0 font-display text-[11px] font-700 tracking-[0.18em] text-[#dffee6]">
        TBM <span className="text-[#00ffaa]">×</span> B33
      </a>
      <div className="h-4 w-px bg-[#1a5048]" />
      <div className="flex min-w-0 items-center gap-2" data-testid="now-playing">
        <span className={`led ${np ? "on" : ""}`} />
        <span className="truncate tracking-[0.25em] text-[#7aafa0]">
          {np ? `NOW PLAYING · ${np.label || "TRACK"}` : "IDLE · ONE TRACK AT A TIME"}
        </span>
      </div>

      <div className="hidden h-4 w-px bg-[#1a5048] sm:block" />

      <div className={`hidden items-center gap-2 ${engine.playing ? "sm:flex" : ""}`}>
        <span className="text-[#1a5048]">LUFS</span>
        <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-[#020a0c]">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-150 ${safe ? "bg-[#00ffaa]" : "bg-[#ffb000]"}`}
            style={{ width: `${lufsPct}%` }}
          />
          <div className="absolute inset-y-0 left-[75%] w-px bg-[#ff4d4d80]" />
        </div>
        <span className={`w-14 tabular-nums ${safe ? "text-[#00ffaa]" : "text-[#ffb000]"}`}>
          {lufs.toFixed(1)}
        </span>
      </div>

      <div className={`hidden items-center gap-2 ${engine.playing ? "lg:flex" : ""}`}>
        <span className="text-[#1a5048]">PK</span>
        <span className="w-12 tabular-nums text-[#7aafa0]">{peak.toFixed(1)}</span>
        <span className="text-[#1a5048]">CORR</span>
        <span className={`w-10 tabular-nums ${corr > 0.3 ? "text-[#00d4ff]" : "text-[#ff4d4d]"}`}>
          {corr.toFixed(2)}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden tabular-nums text-[#7aafa0] sm:inline">{time}</span>
        <a
          href={TOOL_LINKS.store}
          target="_blank"
          rel="noreferrer"
          className="whitespace-nowrap rounded border border-[#00ffaa66] px-2 py-0.5 text-[9px] tracking-[0.2em] text-[#00ffaa] transition-colors hover:bg-[#003828]"
        >
          STORE ↗
        </a>
      </div>
    </motion.div>
  );
}
