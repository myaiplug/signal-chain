import { useEffect, useRef } from "react";
import { claimAudio, onAudioClaimed } from "./bus";

/**
 * Register a player under an owner id. Returns claim() - call it right
 * BEFORE starting playback: every other registered player stops first.
 */
export function useExclusiveAudio(owner: string, pause: () => void, label = "") {
  const pauseRef = useRef(pause);
  pauseRef.current = pause;
  const labelRef = useRef(label);
  labelRef.current = label;

  useEffect(() => {
    return onAudioClaimed((claimed) => {
      if (claimed !== owner) pauseRef.current();
    });
  }, [owner]);

  const ownerRef = useRef(owner);
  ownerRef.current = owner;
  return useRef(() => claimAudio(ownerRef.current, labelRef.current)).current;
}
