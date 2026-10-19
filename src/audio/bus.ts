// Audio-exclusivity bus: ONE track plays at a time, site-wide.
// Every player (HTML audio, Spotify embeds) calls claimAudio(owner) *before* it starts making sound. Every other
// registered player hears the claim and stops itself.
type Listener = (owner: string) => void;
type NowPlayingListener = (np: { owner: string; label: string } | null) => void;

const listeners = new Set<Listener>();
const npListeners = new Set<NowPlayingListener>();
let current: { owner: string; label: string } | null = null;

export function claimAudio(owner: string, label = "") {
  current = { owner, label };
  listeners.forEach((l) => {
    try {
      l(owner);
    } catch (err) {
      console.warn("[audio-bus] listener failed", err);
    }
  });
  npListeners.forEach((l) => l(current));
}

/** Call when a player stops on its own so the transport can show IDLE. */
export function releaseAudio(owner: string) {
  if (current?.owner !== owner) return;
  current = null;
  npListeners.forEach((l) => l(null));
}

export function currentAudio() {
  return current;
}

export function onAudioClaimed(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function onNowPlaying(listener: NowPlayingListener) {
  npListeners.add(listener);
  return () => {
    npListeners.delete(listener);
  };
}

if (typeof window !== "undefined") {
  // test/debug hook (read-only view of who owns the speakers)
  (window as unknown as { __tbmAudio: unknown }).__tbmAudio = { currentAudio };
}
