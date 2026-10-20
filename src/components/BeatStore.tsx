import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BEATS, BUNDLE_TIERS, PRICED_BEATS, type Beat, cartTotal } from "../data/beats";
import { BeatDetailPage } from "./BeatDetailPage";
import { STORE_URL } from "../data/artists";
import { releaseAudio } from "../audio/bus";
import { useExclusiveAudio } from "../audio/useExclusiveAudio";

type Filter = "all" | "trap" | "boom bap" | "phonk" | "drill" | "west coast" | "atlanta";

const GENRES: { key: Filter; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "trap", label: "TRAP" },
  { key: "boom bap", label: "BOOM BAP" },
  { key: "phonk", label: "PHONK" },
  { key: "drill", label: "DRILL" },
  { key: "west coast", label: "WEST COAST" },
  { key: "atlanta", label: "ATLANTA" },
];

export function BeatStore() {
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [activeGenre, setActiveGenre] = useState<Filter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<string[]>([]);

  const filteredBeats = BEATS.filter((b) => {
    const matchesGenre =
      activeGenre === "all" ||
      b.genre.toLowerCase().includes(activeGenre) ||
      b.tags.some((t) => t.toLowerCase().includes(activeGenre));
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q) ||
      b.tags.some((t) => t.toLowerCase().includes(q)) ||
      b.key.toLowerCase().includes(q) ||
      String(b.bpm).includes(q);
    return matchesGenre && matchesSearch;
  });

  const toggleCartItem = (id: string) => {
    setCartItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <section className="relative z-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Header */}
        <div className="mb-12">
          <span className="font-mono text-[10px] tracking-[0.3em] text-[#1a5048] block mb-3">
            THE BEAT MOB CATALOG
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
            BEATS FOR SALE
          </h2>
          <p className="font-mono text-sm text-[#1a5048]/70 max-w-2xl">
            18 production-ready beats. Every track mixed, mastered, and ready for vocals.
            <br />
            Same prices as the Beat Mob store discount rack: $1.99 a beat, or all 16 for $19.99.
          </p>
        </div>

        {/* Bundle Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {BUNDLE_TIERS.map((tier) => (
            <motion.div
              key={tier.id}
              whileHover={{ scale: 1.02, y: -2 }}
              className="relative bg-[#0a120a]/80 border border-[#1a5048]/20 rounded-xl p-5 cursor-pointer group overflow-hidden"
              onClick={() => { if (tier.id === "all") setCartItems(PRICED_BEATS().map((b) => b.id)); }}
              data-testid={`tier-${tier.id}`}
            >
              {tier.badge && (
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#00ffaa] text-black text-[9px] font-mono font-bold rounded">
                  {tier.badge}
                </div>
              )}
              <div className="font-mono text-[10px] tracking-[0.2em] text-[#1a5048] mb-2">
                {tier.label}
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                ${tier.price.toFixed(2)}
              </div>
              <div className="text-sm text-[#1a5048]/80 mb-3">{tier.description}</div>
              <div className="font-mono text-xs text-[#00ffaa] opacity-0 group-hover:opacity-100 transition-opacity">
                {tier.id === "all" ? "TAP TO SELECT ALL 16" : "PICK ANY BEAT BELOW"}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex flex-wrap gap-2 flex-1">
            {GENRES.map((g) => (
              <button
                key={g.key}
                onClick={() => setActiveGenre(g.key)}
                className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider transition-all duration-200 ${
                  activeGenre === g.key
                    ? "bg-[#1a5048] text-white border border-[#1a5048]"
                    : "bg-transparent text-[#1a5048]/70 border border-[#1a5048]/20 hover:border-[#1a5048]/50 hover:text-white"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1a5048]/50"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, genre, key, BPM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-[#0a120a]/60 border border-[#1a5048]/20 rounded-full text-white placeholder-[#1a5048]/40 text-xs font-mono focus:outline-none focus:border-[#1a5048]/50 transition-colors"
            />
          </div>
        </div>

        {/* Results count */}
        <div className="font-mono text-[10px] tracking-[0.2em] text-[#1a5048]/50 mb-6">
          {filteredBeats.length} BEATS FOUND
          {cartItems.length > 0 && (
            <span className="ml-4 text-[#00ffaa]">
              {cartItems.length} IN CART
            </span>
          )}
        </div>

        {/* Beat Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBeats.map((beat, i) => (
            <BeatCard
              key={beat.id}
              beat={beat}
              index={i}
              isSelected={cartItems.includes(beat.id)}
              onToggleCart={() => toggleCartItem(beat.id)}
              onOpenDetail={() => setSelectedBeat(beat)}
            />
          ))}
        </div>

        {filteredBeats.length === 0 && (
          <div className="text-center py-20">
            <div className="text-[#1a5048]/40 font-mono text-sm">NO BEATS MATCH YOUR SEARCH</div>
            <button
              onClick={() => {
                setActiveGenre("all");
                setSearchQuery("");
              }}
              className="mt-4 text-[#1a5048] text-xs font-mono hover:text-white transition-colors"
            >
              CLEAR FILTERS
            </button>
          </div>
        )}

        {/* Sticky Cart Bar */}
        <AnimatePresence>
          {cartItems.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a120a]/95 backdrop-blur-xl border-t border-[#1a5048]/30"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#1a5048]/20 border border-[#1a5048]/30 flex items-center justify-center flex-shrink-0">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1a5048"
                      strokeWidth="2"
                    >
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-bold text-sm truncate">
                      {cartItems.length} {cartItems.length === 1 ? "beat" : "beats"} selected
                    </div>
                    <div className="font-mono text-[#1a5048]/60 text-[10px]">
                      {cartItems.length >= PRICED_BEATS().length
                        ? "FULL RACK — ALL 16 FOR $19.99"
                        : "$1.99 A BEAT · ALL 16 FOR $19.99"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => setCartItems([])}
                    className="px-4 py-2 text-[#1a5048]/60 text-xs font-mono hover:text-white transition-colors"
                  >
                    CLEAR
                  </button>
                  <a
                    href={STORE_URL}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="checkout-link"
                    className="px-6 py-2.5 bg-gradient-to-r from-[#00ffaa] to-[#00d4ff] text-black font-bold text-sm rounded-xl hover:from-[#00d4ff] hover:to-[#9eff00] transition-all duration-300 flex items-center gap-2"
                  >
                    CHECKOUT
                    <span className="font-mono text-[10px] opacity-70">
                      ${cartTotal(cartItems).toFixed(2)}
                    </span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Beat Detail Modal */}
      <AnimatePresence>
        {selectedBeat && (
          <BeatDetailPage
            beat={selectedBeat}
            onClose={() => setSelectedBeat(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function BeatCard({
  beat,
  index,
  isSelected,
  onToggleCart,
  onOpenDetail,
}: {
  beat: Beat;
  index: number;
  isSelected: boolean;
  onToggleCart: () => void;
  onOpenDetail: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [previewDuration, setPreviewDuration] = useState(0);
  const owner = `preview-${beat.id}`;
  // the old card claimed the bus but never listened to it, so previews
  // stacked on top of each other and on top of every other player
  const claim = useExclusiveAudio(owner, () => {
    audioRef.current?.pause();
    setPlaying(false);
  }, beat.title.toUpperCase());

  useEffect(() => {
    const audio = new Audio(beat.file);
    audio.preload = "metadata";
    audioRef.current = audio;
    audio.addEventListener("loadedmetadata", () => {
      setPreviewDuration(audio.duration);
    });
    audio.addEventListener("ended", () => {
      setPlaying(false);
      releaseAudio(owner);
    });
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [beat.file]);

  const handlePreview = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      releaseAudio(owner);
    } else {
      audio.currentTime = 0;
      audio.volume = 0.7;
      claim();
      setPlaying(true);
      try {
        await audio.play();
      } catch {
        setPlaying(false);
        releaseAudio(owner);
      }
    }
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCart();
  };

  const formatTime = (s: number) => {
    if (!s) return "--:--";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const isWav = beat.file.endsWith(".wav");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.5) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpenDetail}
      className="group relative bg-[#0a120a]/80 border border-[#1a5048]/20 rounded-xl overflow-hidden cursor-pointer hover:border-[#1a5048]/40 transition-all duration-300"
    >
      {/* Visualizer / Waveform Area */}
      <div className="relative h-40 bg-[#03080a] overflow-hidden border-b border-[#1a5048]/10">
        {/* Cover art: same image the Beat Mob store discount rack uses */}
        {beat.cover && (
          <>
            <img
              src={beat.cover}
              alt={beat.title}
              loading="lazy"
              decoding="async"
              data-testid="beat-cover"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#03080a]/80 via-transparent to-transparent" />
          </>
        )}
        {/* Abstract waveform bars */}
        <div className={`absolute inset-0 flex items-end justify-center gap-[2px] px-4 pb-2${beat.cover ? " h-1/3 top-auto opacity-70" : ""}`}>
          {Array.from({ length: 48 }).map((_, i) => {
            const seed = (beat.bpm * (i + 1) * 7 + beat.title.charCodeAt(0)) % 100;
            const height = 15 + seed * 0.75;
            const isPlayHead = playing && i < 30;
            return (
              <div
                key={i}
                className="flex-1 rounded-t-sm transition-all duration-300"
                style={{
                  height: `${height}%`,
                  backgroundColor: isPlayHead
                    ? "#00ffaa"
                    : hovered
                    ? "#1a5048"
                    : "#1a504833",
                  opacity: playing && i >= 30 ? 0.3 : 1,
                }}
              />
            );
          })}
        </div>

        {/* Genre badge */}
        <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm border border-[#1a5048]/20 rounded text-[8px] font-mono text-[#1a5048] tracking-wider">
          {beat.genre.split(" ")[0].toUpperCase()}
        </div>

        {/* Format badge */}
        {isWav && (
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#1a5048]/20 backdrop-blur-sm border border-[#1a5048]/30 rounded text-[8px] font-mono text-[#1a5048] tracking-wider">
            WAV
          </div>
        )}

        {/* Play button overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered || playing ? 1 : 0 }}
          className="absolute inset-0 flex items-center justify-center bg-black/20"
        >
          <button
            onClick={handlePreview}
            aria-label={playing ? `Pause ${beat.title} preview` : `Play ${beat.title} preview`}
            data-testid="preview-btn"
            className="w-14 h-14 rounded-full bg-[#1a5048]/40 backdrop-blur-sm border border-[#1a5048]/60 flex items-center justify-center hover:bg-[#1a5048]/60 transition-all"
          >
            {playing ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="ml-1">
                <path d="M5 3v18l15-9z" />
              </svg>
            )}
          </button>
        </motion.div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-white font-bold text-base leading-tight truncate">{beat.title}</h3>
          {beat.price.single !== null && <button
            onClick={handleAdd}
            data-testid="add-to-cart"
            aria-label={isSelected ? `Remove ${beat.title} from selection` : `Add ${beat.title} to selection`}
            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
              isSelected
                ? "bg-[#00ffaa] text-black"
                : "bg-[#1a5048]/10 border border-[#1a5048]/20 text-[#1a5048] hover:bg-[#1a5048]/20"
            }`}
          >
            {isSelected ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
          </button>}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="font-mono text-[10px] text-[#1a5048]">{beat.bpm} BPM</span>
          <span className="w-1 h-1 bg-[#1a5048]/30 rounded-full" />
          <span className="font-mono text-[10px] text-[#1a5048]">{beat.key}</span>
          <span className="w-1 h-1 bg-[#1a5048]/30 rounded-full" />
          <span className="font-mono text-[10px] text-[#1a5048]">{formatTime(previewDuration)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="font-mono text-sm text-white font-bold" data-testid="beat-price">
            {beat.price.single !== null ? `$${beat.price.single.toFixed(2)}` : <span className="text-[#7aafa0] text-[10px] tracking-[0.2em]">PREVIEW</span>}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[9px] text-[#1a5048]/50">
              {beat.sizeMB} MB
            </span>
            <span className="w-1 h-1 bg-[#1a5048]/30 rounded-full" />
            <span className="font-mono text-[9px] text-[#1a5048]/50 uppercase">
              {beat.license}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}