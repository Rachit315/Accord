"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getCookie, setCookie, deleteCookie } from "@/lib/cookies";

const TIMER_STATE_KEY = "accord_timer_state";

export interface TimerState {
  duration: number;
  isRunning: boolean;
  startTime: number | null;
  endTime: number | null;
  pausedTimeLeft: number;
}

const defaultState: TimerState = {
  duration: 0,
  isRunning: false,
  startTime: null,
  endTime: null,
  pausedTimeLeft: 0,
};

export function useTimer(onComplete?: () => void) {
  const [state, setState] = useState<TimerState>(defaultState);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef<(() => void) | undefined>(onComplete);

  // Keep callback ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Load state from cookie on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedStr = getCookie(TIMER_STATE_KEY);
    if (storedStr) {
      try {
        const stored: TimerState = JSON.parse(storedStr);
        const now = Date.now();

        if (stored.isRunning && stored.endTime) {
          if (now >= stored.endTime) {
            // Completed in background
            setState({
              ...stored,
              isRunning: false,
            });
            setTimeLeft(0);
            setIsCompleted(true);
            
            // Trigger completion callback on next tick
            setTimeout(() => {
              if (onCompleteRef.current) {
                onCompleteRef.current();
              }
            }, 0);
            
            setCookie(
              TIMER_STATE_KEY,
              JSON.stringify({ ...stored, isRunning: false, pausedTimeLeft: 0 }),
              { maxAge: 86400 }
            );
          } else {
            // Still running
            setState(stored);
            const remaining = Math.max(0, Math.round((stored.endTime - now) / 1000));
            setTimeLeft(remaining);
          }
        } else {
          // Paused or not running
          setState(stored);
          setTimeLeft(stored.pausedTimeLeft);
        }
      } catch (e) {
        console.error("Failed to parse timer state from cookie:", e);
      }
    }
  }, []);

  // Save state to cookie whenever it changes
  const saveState = useCallback((newState: TimerState) => {
    if (typeof window === "undefined") return;
    setCookie(TIMER_STATE_KEY, JSON.stringify(newState), { maxAge: 86400 });
  }, []);

  // Clear ticking interval
  const clearInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Active ticking logic
  const tick = useCallback(() => {
    setState((prev) => {
      if (!prev.isRunning || !prev.endTime) {
        clearInterval();
        return prev;
      }

      const now = Date.now();
      const remaining = Math.max(0, Math.round((prev.endTime - now) / 1000));

      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval();
        setIsCompleted(true);
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
        
        const finalState = {
          ...prev,
          isRunning: false,
          pausedTimeLeft: 0,
        };
        saveState(finalState);
        return finalState;
      }

      return prev;
    });
  }, [clearInterval, saveState]);

  // Handle ticking interval setup when running status changes
  useEffect(() => {
    if (state.isRunning) {
      clearInterval();
      intervalRef.current = window.setInterval(tick, 200); // Check frequently to prevent drift
    } else {
      clearInterval();
    }
    return () => clearInterval();
  }, [state.isRunning, tick, clearInterval]);

  const start = useCallback((durationSeconds: number) => {
    if (durationSeconds <= 0) return;
    
    clearInterval();
    setIsCompleted(false);

    const now = Date.now();
    const endTime = now + durationSeconds * 1000;
    
    const newState: TimerState = {
      duration: durationSeconds,
      isRunning: true,
      startTime: now,
      endTime,
      pausedTimeLeft: durationSeconds,
    };

    setState(newState);
    setTimeLeft(durationSeconds);
    saveState(newState);
  }, [clearInterval, saveState]);

  const pause = useCallback(() => {
    if (!state.isRunning || !state.endTime) return;

    clearInterval();

    const now = Date.now();
    const remaining = Math.max(0, Math.round((state.endTime - now) / 1000));

    const newState: TimerState = {
      ...state,
      isRunning: false,
      endTime: null,
      pausedTimeLeft: remaining,
    };

    setState(newState);
    setTimeLeft(remaining);
    saveState(newState);
  }, [state, clearInterval, saveState]);

  const resume = useCallback(() => {
    if (state.isRunning || state.pausedTimeLeft <= 0) return;

    clearInterval();
    setIsCompleted(false);

    const now = Date.now();
    const endTime = now + state.pausedTimeLeft * 1000;

    const newState: TimerState = {
      ...state,
      isRunning: true,
      startTime: now,
      endTime,
    };

    setState(newState);
    saveState(newState);
  }, [state, clearInterval, saveState]);

  const reset = useCallback(() => {
    clearInterval();
    setIsCompleted(false);
    setTimeLeft(0);
    setState(defaultState);
    if (typeof window !== "undefined") {
      deleteCookie(TIMER_STATE_KEY);
    }
  }, [clearInterval]);

  return {
    timeLeft,
    duration: state.duration,
    isRunning: state.isRunning,
    isCompleted,
    start,
    pause,
    resume,
    reset,
  };
}
