import { ARTISTS, type Artist } from "./artists";

// The opener: one of the four artists, picked at random on every arrival.
// It never repeats the previous visit's pick, so a reload always changes it.
// (?opener=<id> forces one - handy for sharing a specific artist.)
const KEY = "tbm:last-opener";

function pickOpener(): Artist {
  try {
    const forced = new URLSearchParams(window.location.search).get("opener");
    const hit = ARTISTS.find((a) => a.id === forced);
    if (hit) return hit;
  } catch {
    /* no URL access */
  }
  let last: string | null = null;
  try {
    last = window.localStorage.getItem(KEY);
  } catch {
    /* storage blocked */
  }
  const pool = ARTISTS.filter((a) => a.id !== last);
  const pick = pool[Math.floor(Math.random() * pool.length)] ?? ARTISTS[0];
  try {
    window.localStorage.setItem(KEY, pick.id);
  } catch {
    /* storage blocked */
  }
  return pick;
}

// evaluated once per page load (module scope), never twice under StrictMode
export const OPENER: Artist = pickOpener();
