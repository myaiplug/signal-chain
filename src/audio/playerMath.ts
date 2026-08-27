// Literal port of coproducer-web/js/player-math.js
export function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}
export function equalPowerGains(t: number) {
  const x = clamp01(t);
  return { a: Math.cos((x * Math.PI) / 2), b: Math.sin((x * Math.PI) / 2) };
}
export function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
export function offsetFromClick(x: number, width: number, duration: number) {
  if (!width || !duration) return 0;
  return clamp01(x / width) * duration;
}
