import { useCallback, useEffect, useRef, useState } from "react";
import { releaseAudio } from "./bus";
import { useExclusiveAudio } from "./useExclusiveAudio";

// Spotify iFrame API - the sanctioned way to control an embed (play/pause +
// playback events) so Spotify joins the one-track-at-a-time bus.
// https://developer.spotify.com/documentation/embeds/references/iframe-api

interface PlaybackUpdate {
  data: { isPaused: boolean; isBuffering: boolean; duration: number; position: number; playingURI?: string };
}
export interface SpotifyController {
  play(): void;
  pause(): void;
  resume(): void;
  togglePlay(): void;
  loadUri(uri: string): void;
  destroy(): void;
  addListener(ev: "ready", cb: () => void): void;
  addListener(ev: "playback_update", cb: (e: PlaybackUpdate) => void): void;
}
interface SpotifyIFrameAPI {
  createController(
    el: HTMLElement,
    opts: { uri: string; width?: number | string; height?: number | string },
    cb: (c: SpotifyController) => void
  ): void;
}

let apiPromise: Promise<SpotifyIFrameAPI> | null = null;

export function loadSpotifyApi(): Promise<SpotifyIFrameAPI> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<SpotifyIFrameAPI>((resolve, reject) => {
    const w = window as unknown as { onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void };
    const timer = window.setTimeout(() => reject(new Error("Spotify iFrame API timed out")), 15000);
    w.onSpotifyIframeApiReady = (api) => {
      window.clearTimeout(timer);
      resolve(api);
    };
    const s = document.createElement("script");
    s.src = "https://open.spotify.com/embed/iframe-api/v1";
    s.async = true;
    s.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("Spotify iFrame API failed to load"));
    };
    document.head.appendChild(s);
  });
  apiPromise.catch(() => {
    apiPromise = null;
  });
  return apiPromise;
}

function safe(fn: () => void) {
  try {
    fn();
  } catch (err) {
    console.warn("[spotify] embed call failed", err);
  }
}

/** Decks registered by owner so a click handler can start one synchronously. */
export const spotifyDecks = new Map<string, { play: () => void; pause: () => void }>();

export type DeckStatus = "idle" | "loading" | "ready" | "failed";

/**
 * Mount a controllable Spotify embed into hostRef. Joins the audio bus:
 * when it starts, everything else stops; when anything else starts, it pauses.
 */
export function useSpotifyEmbed(opts: { owner: string; label: string; uri: string; height: number; enabled?: boolean }) {
  const { owner, label, uri, height, enabled = true } = opts;
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<SpotifyController | null>(null);
  const readyRef = useRef(false);
  const wantPlay = useRef(false);
  const playingRef = useRef(false);
  const uriRef = useRef(uri);
  const [status, setStatus] = useState<DeckStatus>(enabled ? "loading" : "idle");
  const [playing, setPlaying] = useState(false);

  const claim = useExclusiveAudio(
    owner,
    () => {
      // only pause an embed that is (or is about to be) playing - pausing an
      // untouched embed throws "no list was loaded" inside Spotify's API
      const active = playingRef.current || wantPlay.current;
      wantPlay.current = false;
      if (active && readyRef.current) safe(() => ctrlRef.current?.pause());
    },
    label
  );

  useEffect(() => {
    if (!enabled) return;
    let dead = false;
    const hostAtMount = hostRef.current;
    setStatus("loading");
    loadSpotifyApi()
      .then((api) => {
        const host = hostRef.current;
        if (dead || !host) return;
        const el = document.createElement("div");
        host.appendChild(el);
        const createdUri = uriRef.current;
        api.createController(el, { uri: createdUri, width: "100%", height }, (c) => {
          if (dead) {
            c.destroy();
            return;
          }
          ctrlRef.current = c;
          c.addListener("ready", () => {
            if (dead) return;
            const firstReady = !readyRef.current;
            readyRef.current = true;
            setStatus("ready");
            if (firstReady && uriRef.current !== createdUri) c.loadUri(uriRef.current);
            if (wantPlay.current) c.play();
          });
          c.addListener("playback_update", (e) => {
            const isPlaying = !e.data.isPaused;
            if (isPlaying && !playingRef.current) {
              wantPlay.current = false;
              claim(); // a tap inside the embed also silences everything else
            }
            if (!isPlaying && playingRef.current) releaseAudio(owner);
            playingRef.current = isPlaying;
            setPlaying(isPlaying);
          });
        });
      })
      .catch(() => {
        if (!dead) setStatus("failed");
      });
    return () => {
      dead = true;
      readyRef.current = false;
      try {
        ctrlRef.current?.destroy();
      } catch {
        /* already gone */
      }
      ctrlRef.current = null;
      if (hostAtMount) hostAtMount.innerHTML = "";
      if (playingRef.current) releaseAudio(owner);
      playingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, height, owner]);

  useEffect(() => {
    if (uri === uriRef.current) return;
    uriRef.current = uri;
    if (ctrlRef.current && readyRef.current) ctrlRef.current.loadUri(uri);
  }, [uri]);

  const play = useCallback(() => {
    claim(); // stop everything else BEFORE Spotify makes a sound
    wantPlay.current = true;
    if (ctrlRef.current && readyRef.current) safe(() => ctrlRef.current?.play());
  }, [claim]);

  const pause = useCallback(() => {
    const active = playingRef.current || wantPlay.current;
    wantPlay.current = false;
    if (active && ctrlRef.current && readyRef.current) safe(() => ctrlRef.current?.pause());
  }, []);

  useEffect(() => {
    spotifyDecks.set(owner, { play, pause });
    return () => {
      spotifyDecks.delete(owner);
    };
  }, [owner, play, pause]);

  return { hostRef, status, playing, play, pause };
}
