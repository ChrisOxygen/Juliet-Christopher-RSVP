"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Background soundtrack played from public/audio. Starts on the first visitor
// interaction if the browser blocks autoplay, and loops quietly.

const SRC = "/audio/ada-ada-instrumental.MP3";
const LEVEL = 0.2; // volume (0 to 1). Keep it gentle.
const FADE_IN_MS = 4000;
const FADE_OUT_MS = 600;
const START_DELAY_MS = 3000;

type Mode = "off" | "playing" | "muted";

export default function MusicPlayer() {
  const [mode, setMode] = useState<Mode>("off");
  const audio = useRef<HTMLAudioElement | null>(null);
  const fadeTimer = useRef<number | undefined>(undefined);
  const userMuted = useRef(false);
  const resumeOnShow = useRef(false);

  const fadeTo = useCallback((target: number, ms: number, done?: () => void) => {
    const a = audio.current;
    if (!a) return;
    window.clearInterval(fadeTimer.current);
    const from = a.volume;
    const start = performance.now();
    fadeTimer.current = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / ms);
      a.volume = from + (target - from) * t;
      if (t >= 1) {
        window.clearInterval(fadeTimer.current);
        done?.();
      }
    }, 50);
  }, []);

  const begin = useCallback(async (): Promise<boolean> => {
    const a = audio.current;
    if (!a) return false;
    try {
      if (a.paused) a.volume = 0;
      await a.play();
    } catch {
      return false; // autoplay blocked
    }
    fadeTo(LEVEL, FADE_IN_MS);
    setMode("playing");
    return true;
  }, [fadeTo]);

  const pause = useCallback(() => {
    const a = audio.current;
    if (!a || a.paused) return;
    fadeTo(0, FADE_OUT_MS, () => a.pause());
  }, [fadeTo]);

  useEffect(() => {
    const a = new Audio(SRC);
    a.loop = true;
    a.preload = "none";
    a.volume = 0;
    audio.current = a;

    let startTimer: number | undefined;

    // The first tap, click or key press starts the music if the timed start was refused.
    const events = ["click", "touchend", "pointerup", "keydown"] as const;
    const removeGesture = () => events.forEach((ev) => window.removeEventListener(ev, onGesture));
    function onGesture(ev: Event) {
      if ((ev.target as Element | null)?.closest?.("[data-music-toggle]")) return;
      if (userMuted.current) return;
      void begin().then((ok) => ok && removeGesture());
    }
    events.forEach((ev) => window.addEventListener(ev, onGesture));

    const arm = () => {
      startTimer = window.setTimeout(() => {
        if (!userMuted.current) void begin();
      }, START_DELAY_MS);
    };
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });

    const onVisibility = () => {
      if (document.hidden) {
        resumeOnShow.current = !a.paused;
        pause();
      } else if (resumeOnShow.current && !userMuted.current) {
        resumeOnShow.current = false;
        void begin();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearTimeout(startTimer);
      window.clearInterval(fadeTimer.current);
      window.removeEventListener("load", arm);
      removeGesture();
      document.removeEventListener("visibilitychange", onVisibility);
      a.pause();
      a.src = "";
      audio.current = null;
    };
  }, [begin, pause]);

  function toggle() {
    if (mode === "playing") {
      userMuted.current = true;
      pause();
      setMode("muted");
    } else {
      userMuted.current = false;
      void begin();
    }
  }

  const playing = mode === "playing";

  return (
    <button
      type="button"
      data-music-toggle
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Mute background music" : "Play background music"}
      title={playing ? "Mute music" : "Play music"}
      className={`fixed bottom-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-gold/60 bg-ivory/90 text-burgundy shadow-md backdrop-blur-sm transition hover:border-burgundy ${
        mode === "off" ? "animate-pulse" : ""
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" fillOpacity="0.15" />
        {playing ? (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </>
        ) : (
          <>
            <path d="m16 9 5 6" />
            <path d="m21 9-5 6" />
          </>
        )}
      </svg>
    </button>
  );
}
