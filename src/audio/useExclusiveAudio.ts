import { useEffect, useRef } from "react";
import { claimAudio, onAudioClaimed } from "./bus";

/**
 * Register a player under an owner id. Returns claim() to call on play -
 * every other registered player (and the ambient soundtrack) stops.
 */
export function useExclusiveAudio(owner: string, pause: () => void) {
  const pauseRef = useRef(pause);
  pauseRef.current = pause;

  useEffect(() => {
    return onAudioClaimed((claimed) => {
      if (claimed !== owner) pauseRef.current();
    });
  }, [owner]);

  return useRef(() => claimAudio(owner)).current;
}
