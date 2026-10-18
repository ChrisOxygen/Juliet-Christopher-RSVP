"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { wedding } from "@/lib/wedding";

// Background soundtrack played from public/audio, loops quietly. Browsers only
// allow sound after a tap, so a full-screen welcome gate asks guests to open the
// invitation; that tap starts the music.

const SRC = "/audio/golibe-flavour.MP3";
const LEVEL = 0.2; // volume (0 to 1). Keep it gentle.
const FADE_IN_MS = 4000;
const FADE_OUT_MS = 600;

type Mode = "off" | "playing" | "muted";

export default function MusicPlayer() {
  const [mode, setMode] = useState<Mode>("off");
  const [entered, setEntered] = useState(false);
  const [gateGone, setGateGone] = useState(false);
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
    a.preload = "auto";
    a.volume = 0;
    audio.current = a;

    // If the browser happens to allow autoplay, skip the gate.
    void begin().then((ok) => ok && setEntered(true));

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
      window.clearInterval(fadeTimer.current);
      document.removeEventListener("visibilitychange", onVisibility);
      a.pause();
      a.src = "";
      audio.current = null;
    };
  }, [begin, pause]);

  // Keep the page from scrolling behind the gate.
  useEffect(() => {
    document.body.style.overflow = entered ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [entered]);

  function enter() {
    userMuted.current = false;
    void begin(); // must run inside the tap so the browser allows sound
    setEntered(true);
  }

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
    <>
    {!gateGone && (
      <div
        role="dialog"
        aria-label="Welcome"
        onTransitionEnd={() => entered && setGateGone(true)}
        className={`fixed inset-0 z-[60] flex flex-col items-center justify-end overflow-hidden bg-burgundy-deep text-ivory transition-opacity duration-700 ${
          entered ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <Image
          src="/IMG_8732.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_0%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-burgundy-deep via-burgundy-deep/60 to-transparent" />
        <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6 pb-12 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-ivory/90">
            You are invited to the wedding of
          </p>
          <h1 className="mt-3 font-script text-5xl leading-tight sm:text-6xl">
            {wedding.bride} <span className="text-gold">&amp;</span>
            <br />
            {wedding.groom}
          </h1>
          <p className="mt-3 text-sm uppercase tracking-[0.2em] text-ivory/90">
            {wedding.dateLabelShort}
          </p>
          <div className="gold-rule my-5 w-40" />
          <button
            type="button"
            data-music-toggle
            onClick={enter}
            className="rounded-full border border-gold bg-ivory/10 px-8 py-3 text-lg uppercase tracking-[0.25em] text-ivory backdrop-blur-sm transition hover:bg-ivory/20 active:scale-[0.98]"
          >
            Open invitation
          </button>
        </div>
      </div>
    )}
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
    </>
  );
}
