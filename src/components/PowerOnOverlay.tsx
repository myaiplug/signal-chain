import { motion } from "framer-motion";

export function PowerOnOverlay({ onEnter }: { onEnter: (muted: boolean) => void }) {
  const enter = (muted: boolean) => {
    onEnter(muted);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#03080a]"
      exit={{ opacity: 0, filter: "blur(12px)" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="flex flex-col items-center px-6 text-center"
      >
        <div className="mb-6 flex items-center gap-3 font-mono text-[10px] tracking-[0.4em] text-[#7aafa0]">
          <span className="led on" /> RACK POWERED · STANDBY
        </div>
        <h1 className="font-display text-5xl font-700 leading-none tracking-tight text-[#dffee6] sm:text-7xl">
          THE SIGNAL
          <span className="block text-[#00ffaa] text-glow">CHAIN</span>
        </h1>
        <p className="mt-6 max-w-md font-mono text-xs leading-relaxed text-[#7aafa0]">
          An interactive audio experience. You are the input. The rack does the
          rest. Best with sound on.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <button
            onClick={() => enter(false)}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#00ffaa] bg-[#003828] px-10 py-4 font-mono text-sm font-bold tracking-[0.3em] text-[#dffee6] transition-transform duration-300 hover:scale-[1.04] active:scale-95"
            style={{ boxShadow: "0 0 30px rgba(0,255,170,0.25), inset 0 0 20px rgba(0,255,170,0.08)" }}
          >
            <span className="relative z-10">POWER ON</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#00ffaa33] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>
          <button
            onClick={() => enter(true)}
            className="cursor-pointer rounded-xl border border-[#1a5048] px-6 py-4 font-mono text-[10px] tracking-[0.3em] text-[#7aafa0] transition-colors hover:border-[#00ffaa66] hover:text-[#dffee6]"
          >
            ENTER MUTED
          </button>
        </div>
        <div className="mt-14 font-mono text-[9px] tracking-[0.35em] text-[#1a5048]">
          BRIAN JUTZ · THE BEAT MOB · NODAW · SCREWAI
        </div>
      </motion.div>
    </motion.div>
  );
}
