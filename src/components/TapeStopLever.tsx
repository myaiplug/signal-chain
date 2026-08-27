import { useState } from "react";
import { motion } from "framer-motion";
import { engine } from "../audio/engine";

/**
 * THE TAPE STOP - signature moment.
 * Pull the lever: audio + page motion wind down like a turntable losing power.
 * Then REWIND snaps back to the top with a pitch-up ramp.
 */
export function TapeStopLever({ onTapeStop, onRewind }: { onTapeStop: () => void; onRewind: () => void }) {
  const [state, setState] = useState<"run" | "stopped">("run");

  const pull = () => {
    if (state === "stopped") return;
    setState("stopped");
    engine.tapeStop();
    onTapeStop();
  };

  const rewind = () => {
    setState("run");
    engine.powerBackUp();
    onRewind();
  };

  return (
    <motion.div
      initial={{ x: 120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1.4, type: "spring", stiffness: 100, damping: 16 }}
      className="fixed bottom-5 right-5 z-[85] flex flex-col items-center gap-2"
    >
      <div className="rounded-lg border border-[#1a5048] bg-[#041216]/90 px-3 py-2 text-center font-mono text-[8px] tracking-[0.35em] text-[#7aafa0] backdrop-blur">
        {state === "run" ? "TRANSPORT · RUN" : "TRANSPORT · STOPPED"}
      </div>
      {state === "run" ? (
        <motion.button
          onClick={pull}
          whileHover={{ y: 4 }}
          whileTap={{ y: 14, scaleY: 0.85 }}
          className="cursor-pointer rounded-xl border-2 border-[#ff4d4d] bg-[#2a0505] px-6 py-3 font-mono text-xs font-bold tracking-[0.3em] text-[#ff4d4d] transition-colors hover:bg-[#3d0808]"
          style={{ boxShadow: "0 0 24px rgba(255,77,77,0.25), inset 0 2px 0 rgba(255,255,255,0.06)" }}
        >
          TAPE STOP
        </motion.button>
      ) : (
        <motion.button
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          onClick={rewind}
          className="cursor-pointer rounded-xl border-2 border-[#00ffaa] bg-[#003828] px-6 py-3 font-mono text-xs font-bold tracking-[0.3em] text-[#dffee6]"
          style={{ boxShadow: "0 0 24px rgba(0,255,170,0.35)" }}
        >
          ◀◀ REWIND
        </motion.button>
      )}
    </motion.div>
  );
}
