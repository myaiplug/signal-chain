// Tiny audio-exclusivity bus: when any player starts, every other player stops.
type Listener = (owner: string) => void;
const listeners = new Set<Listener>();

export function claimAudio(owner: string) {
  listeners.forEach((l) => l(owner));
}

export function onAudioClaimed(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
