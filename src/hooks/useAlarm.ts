"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getCookie, setCookie } from "@/lib/cookies";

const ALARM_PREF_KEY = "accord_timer_alarm_enabled";

export function useAlarm() {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const beepIntervalRef = useRef<number | null>(null);

  // Load user preference on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = getCookie(ALARM_PREF_KEY);
      if (stored !== null) {
        setEnabled(stored === "true");
      }
    }
  }, []);

  // Save preference helper
  const setAlarmEnabled = useCallback((value: boolean) => {
    setEnabled(value);
    if (typeof window !== "undefined") {
      setCookie(ALARM_PREF_KEY, String(value));
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (beepIntervalRef.current) {
        window.clearInterval(beepIntervalRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  // Prime/resume the AudioContext (run this on user interaction to bypass browser autoplay blocks)
  const primeAudioContext = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume().catch(console.error);
    }
  }, []);

  const playSingleBeep = useCallback((ctx: AudioContext) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      // We can use a combination of frequencies for a richer chime,
      // but a classic double-tone or pure 880Hz (A5) is great for alert.
      osc.frequency.setValueAtTime(880, ctx.currentTime);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.error("Error playing alarm beep:", e);
    }
  }, []);

  const play = useCallback(() => {
    if (!enabled) return;
    primeAudioContext();

    const ctx = audioContextRef.current;
    if (!ctx) return;

    if (isPlaying) return;

    setIsPlaying(true);
    
    // Play immediately
    playSingleBeep(ctx);

    // Beep every 800ms
    beepIntervalRef.current = window.setInterval(() => {
      if (ctx.state === "suspended") {
        ctx.resume().catch(console.error);
      }
      playSingleBeep(ctx);
    }, 800);
  }, [enabled, isPlaying, primeAudioContext, playSingleBeep]);

  const stop = useCallback(() => {
    if (beepIntervalRef.current) {
      window.clearInterval(beepIntervalRef.current);
      beepIntervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  return {
    isEnabled: enabled,
    setEnabled: setAlarmEnabled,
    isPlaying,
    play,
    stop,
    primeAudioContext,
  };
}
