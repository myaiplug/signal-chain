import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { releaseAudio } from "../audio/bus";
import { useExclusiveAudio } from "../audio/useExclusiveAudio";
import { STORE_URL } from "../data/artists";
import { BUNDLE_TIERS, type Beat, calculateBundlePrice } from "../data/beats";

interface BeatDetailPageProps {
  beat: Beat;
  onClose: () => void;
}

export function BeatDetailPage({ beat, onClose }: BeatDetailPageProps) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(beat.duration);
  const [volume, setVolume] = useState(0.7);
  const [selectedTier, setSelectedTier] = useState<'single' | 'bundle5' | 'bundle10'>('single');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const owner = `beat-${beat.id}`;
  const claim = useExclusiveAudio(owner, () => {
    audioRef.current?.pause();
    setPlaying(false);
  }, beat.title.toUpperCase());

  useEffect(() => {
    const audio = new Audio(beat.file);
    audio.preload = "metadata";
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener("ended", () => {
      setPlaying(false);
      releaseAudio(`beat-${beat.id}`);
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [beat.file]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const initAudioGraph = async () => {
    if (audioCtxRef.current) return;

    const audio = audioRef.current;
    if (!audio) return;

    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    audioCtxRef.current = ctx;

    const src = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    const gain = ctx.createGain();
    gain.gain.value = volume;

    src.connect(analyser);
    analyser.connect(gain);
    gain.connect(ctx.destination);

    const draw = () => {
      if (!analyserRef.current || !canvasRef.current) return;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      const canvas = canvasRef.current;
      const ctx2d = canvas.getContext("2d");
      if (!ctx2d) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx2d.clearRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      const gradient = ctx2d.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, "#00ffaa");
      gradient.addColorStop(0.5, "#00d4ff");
      gradient.addColorStop(1, "#9eff00");

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.8;
        ctx2d.fillStyle = gradient;
        ctx2d.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      releaseAudio(owner);
    } else {
      claim();
      if (audioCtxRef.current?.state === "suspended") {
        await audioCtxRef.current.resume();
      }
      try {
        await audio.play();
      } catch {
        releaseAudio(owner);
        return;
      }
      setPlaying(true);
      if (!audioCtxRef.current) {
        await initAudioGraph();
      }
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAddToCart = (tier: 'single' | 'bundle5' | 'bundle10') => {
    setSelectedTier(tier);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="beat-title"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f0a] via-[#03080a] to-[#0a0f0a]" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-[#0a120a]/80 border border-[#1a5048]/30 rounded-2xl backdrop-blur-xl"
      >
        <div className="p-6 pb-0">
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#1a5048] mb-2 block">
                THE BEAT MOB CATALOG
              </span>
              <h1 id="beat-title" className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                {beat.title}
              </h1>
              <div className="flex flex-wrap gap-3 mt-3 text-sm">
                <span className="px-3 py-1 bg-[#1a5048]/20 border border-[#1a5048]/30 rounded-full text-[#1a5048]">
                  {beat.bpm} BPM
                </span>
                <span className="px-3 py-1 bg-[#1a5048]/20 border border-[#1a5048]/30 rounded-full text-[#1a5048]">
                  {beat.key}
                </span>
                <span className="px-3 py-1 bg-[#1a5048]/20 border border-[#1a5048]/30 rounded-full text-[#1a5048]">
                  {beat.genre}
                </span>
                {beat.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-[#1a5048]/10 border border-[#1a5048]/20 rounded-full text-[#1a5048]/70 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/50 hover:text-white"
              aria-label="Close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-[#0a120a]/60 border border-[#1a5048]/20 rounded-xl p-5">
                <h2 className="font-mono text-[10px] tracking-[0.2em] text-[#1a5048] mb-4">
                  AUDIO PLAYER
                </h2>
                <div className="space-y-4">
                  <div className="relative h-32 bg-black/50 rounded-lg border border-[#1a5048]/20 overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-full"
                      width={800}
                      height={128}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <button
                        onClick={togglePlay}
                        className="w-16 h-16 rounded-full bg-[#1a5048]/30 border border-[#1a5048]/50 flex items-center justify-center hover:bg-[#1a5048]/50 transition-all duration-200"
                        aria-label={playing ? "Pause" : "Play"}
                      >
                        {playing ? (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                          </svg>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-2">
                            <path d="M5 3v18l15-9z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {playing && (
                      <div className="absolute inset-0 pointer-events-none" style={{
                        background: "linear-gradient(90deg, transparent, rgba(0,255,170,0.03), transparent)",
                        animation: "shimmer 2s infinite"
                      }} />
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative h-2 bg-[#03080a] rounded-full border border-[#1a5048]/20 cursor-pointer" onClick={seek}>
                      <div
                        className="h-full bg-gradient-to-r from-[#00ffaa] to-[#00d4ff] rounded-full transition-all duration-70"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 hover:opacity-100 transition-opacity"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs text-[#1a5048] w-10 text-right">
                      {formatTime(currentTime)}
                    </span>
                    <span className="font-mono text-xs text-[#1a5048]/50 w-10">
                      {formatTime(duration)}
                    </span>
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#1a5048]/70">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M19 3l6 6-6 6" />
                      </svg>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-24 accent-[#1a5048]"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-[#0a120a]/60 border border-[#1a5048]/20 rounded-xl p-5">
                <h2 className="font-mono text-[10px] tracking-[0.2em] text-[#1a5048] mb-4">
                  TECHNICAL SPECS
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="INTEGRATED LUFS" value={`${beat.lufs} LUFS`} />
                  <StatCard label="TRUE PEAK" value={`${beat.truePeak} dBTP`} />
                  <StatCard label="DYNAMIC RANGE" value={`${beat.dynamicRange} dB`} />
                  <StatCard label="DURATION" value={`${Math.floor(beat.duration / 60)}:${(beat.duration % 60).toString().padStart(2, '0')}`} />
                  <StatCard label="FILE SIZE" value={`${beat.sizeMB} MB`} />
                  <StatCard label="FORMAT" value={beat.file.split('.').pop()?.toUpperCase() || 'WAV'} />
                  <StatCard label="LICENSE" value={beat.license.toUpperCase()} />
                  <StatCard label="PRODUCED BY" value={beat.producedBy} />
                </div>
              </section>

              <section className="bg-[#0a120a]/60 border border-[#1a5048]/20 rounded-xl p-5">
                <h2 className="font-mono text-[10px] tracking-[0.2em] text-[#1a5048] mb-4">
                  STEMS & MULTITRACKS
                </h2>
                {beat.stemFiles ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(beat.stemFiles).map(([stem, file]) => (
                      <StemCard key={stem} stem={stem} file={file} />
                    ))}
                  </div>
                ) : (
                  <p className="text-[#1a5048]/50 text-sm">
                    Stem files not available for this beat. Contact for custom stem separation via LIMINAL STEMSPLIT.
                  </p>
                )}
              </section>

              <section className="bg-[#0a120a]/60 border border-[#1a5048]/20 rounded-xl p-5">
                <h2 className="font-mono text-[10px] tracking-[0.2em] text-[#1a5048] mb-4">
                  DESCRIPTION
                </h2>
                <p className="text-white/80 leading-relaxed">{beat.description}</p>
                <div className="mt-4 pt-4 border-t border-[#1a5048]/20 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-[#1a5048]/50 block mb-1">RELEASE DATE</span>
                    <span className="text-white">{beat.releaseDate}</span>
                  </div>
                  <div>
                    <span className="text-[#1a5048]/50 block mb-1">LICENSE TYPE</span>
                    <span className="text-white capitalize">{beat.license}</span>
                  </div>
                  <div>
                    <span className="text-[#1a5048]/50 block mb-1">PRODUCER</span>
                    <span className="text-white">{beat.producedBy}</span>
                  </div>
                  <div>
                    <span className="text-[#1a5048]/50 block mb-1">CATALOG ID</span>
                    <span className="text-white font-mono">{beat.id}</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-24 space-y-6"
              >
                <section className="bg-gradient-to-br from-[#1a5048]/20 to-[#0a120a] border border-[#1a5048]/30 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{ background: "linear-gradient(135deg, #00ffaa 0%, #00d4ff 100%)" }} />
                  <h2 className="font-mono text-[10px] tracking-[0.2em] text-[#1a5048] mb-4 relative z-10">
                    PURCHASE OPTIONS
                  </h2>
                  <div className="relative z-10 space-y-3">
                    {BUNDLE_TIERS.map(tier => {
                      const isSelected = selectedTier === tier.id;
                      const priceInfo = calculateBundlePrice([beat.id], tier.id);
                      return (
                        <motion.button
                          key={tier.id}
                          onClick={() => handleAddToCart(tier.id as any)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                            isSelected
                              ? "border-2 border-[#00ffaa] bg-[#00ffaa]/10"
                              : "border border-[#1a5048]/20 hover:border-[#1a5048]/50 bg-[#0a120a]/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-white text-lg">{tier.name}</span>
                                {tier.badge && (
                                  <span className="px-2 py-0.5 text-[9px] font-mono bg-[#00ffaa] text-black rounded">
                                    {tier.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[#1a5048]/80 text-sm">{tier.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-white text-xl">
                                ${priceInfo.total.toFixed(2)}
                              </div>
                              {priceInfo.savings > 0 && (
                                <div className="text-[#00ffaa] text-xs font-mono">
                                  SAVE ${priceInfo.savings.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                          {tier.id === 'bundle10' && priceInfo.freeCount > 0 && (
                            <div className="mt-2 pt-2 border-t border-[#1a5048]/20 text-[#00ffaa] text-sm font-mono">
                              + {priceInfo.freeCount} FREE BEATS INCLUDED
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  <a
                    href={STORE_URL}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="detail-buy-link"
                    className="w-full mt-6 py-4 bg-gradient-to-r from-[#00ffaa] to-[#00d4ff] text-black font-bold text-lg rounded-xl hover:from-[#00d4ff] hover:to-[#9eff00] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    BUY AT THE BEAT MOB STORE ↗
                  </a>
                </section>

                <section className="bg-[#0a120a]/60 border border-[#1a5048]/20 rounded-xl p-5">
                  <h2 className="font-mono text-[10px] tracking-[0.2em] text-[#1a5048] mb-4">
                    QUICK ACTIONS
                  </h2>
                  <div className="space-y-3">
                    <button className="w-full py-3 px-4 bg-[#0a120a] border border-[#1a5048]/20 rounded-lg text-white text-sm hover:border-[#1a5048]/50 transition-colors flex items-center justify-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      DOWNLOAD PREVIEW (MP3)
                    </button>
                    <button className="w-full py-3 px-4 bg-[#0a120a] border border-[#1a5048]/20 rounded-lg text-white text-sm hover:border-[#1a5048]/50 transition-colors flex items-center justify-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                      </svg>
                      OPEN IN LIMINAL STEMSPLIT
                    </button>
                    <button className="w-full py-3 px-4 bg-[#0a120a] border border-[#1a5048]/20 rounded-lg text-white text-sm hover:border-[#1a5048]/50 transition-colors flex items-center justify-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      SHARE WITH COLLABORATORS
                    </button>
                  </div>
                </section>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#03080a] border border-[#1a5048]/20 rounded-lg p-4">
      <div className="font-mono text-[9px] tracking-[0.15em] text-[#1a5048]/60 mb-1">
        {label}
      </div>
      <div className="font-mono text-lg text-white">{value}</div>
    </div>
  );
}

function StemCard({ stem }: { stem: string; file: string }) {
  const colors: Record<string, string> = {
    drums: "#c4a574",
    bass: "#c45cff",
    melody: "#e84cff",
    vocals: "#c9ff4d",
  };
  const color = colors[stem] || "#1a5048";
  const label = stem.charAt(0).toUpperCase() + stem.slice(1);

  return (
    <div className="bg-[#03080a] border border-[#1a5048]/20 rounded-lg p-4 text-center group">
      <div
        className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
        style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)`, border: `1px solid ${color}44` }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className="text-[${color}]">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="19" y1="9" x2="19" y2="15" />
          <line x1="22" y1="9" x2="22" y2="15" />
        </svg>
      </div>
      <div className="font-mono text-xs text-white">{label}</div>
      <div className="font-mono text-[9px] text-[#1a5048]/50 mt-1">{stem.toUpperCase()}</div>
    </div>
  );
}