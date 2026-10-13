"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Soft synthesized wedding ambience: slow warm chords with the odd gentle bell,
// generated with the Web Audio API so no audio file is needed.

const LEVEL = 0.22; // master volume (0 to 1). Keep it gentle.
const FADE_IN_SECONDS = 6;
const CHORD_SECONDS = 8;
const START_DELAY_MS = 2000;

// D maj7, B min7, G maj7, A add9 (a calm I-vi-IV-V loop).
const CHORDS = [
  [146.83, 220.0, 293.66, 369.99, 554.37],
  [123.47, 185.0, 246.94, 293.66, 369.99],
  [98.0, 196.0, 246.94, 293.66, 369.99],
  [110.0, 164.81, 220.0, 277.18, 329.63],
];
const BELLS = [587.33, 659.25, 739.99, 880.0, 987.77, 1108.73];

type Engine = {
  ctx: AudioContext;
  master: GainNode;
  bus: GainNode;
  chordIndex: number;
  chordTimer?: number;
  bellTimer?: number;
  suspendTimer?: number;
  running: boolean;
};

type Mode = "off" | "playing" | "muted";

function reverbImpulse(ctx: AudioContext) {
  const seconds = 3.5;
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
    }
  }
  return buffer;
}

function createEngine(): Engine {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0;
  const bus = ctx.createGain();
  const dry = ctx.createGain();
  dry.gain.value = 0.5;
  const wet = ctx.createGain();
  wet.gain.value = 0.6;
  const reverb = ctx.createConvolver();
  reverb.buffer = reverbImpulse(ctx);
  const limiter = ctx.createDynamicsCompressor();

  bus.connect(dry).connect(master);
  bus.connect(reverb).connect(wet).connect(master);
  master.connect(limiter).connect(ctx.destination);

  return { ctx, master, bus, chordIndex: 0, running: false };
}

function playChord(e: Engine, freqs: number[]) {
  const { ctx, bus } = e;
  const t = ctx.currentTime;
  freqs.forEach((f, i) => {
    [-4, 4].forEach((cents) => {
      const osc = ctx.createOscillator();
      osc.type = i < 2 ? "sine" : "triangle";
      osc.frequency.value = f;
      osc.detune.value = cents;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1400;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.03, t + CHORD_SECONDS * 0.4);
      gain.gain.linearRampToValueAtTime(0, t + CHORD_SECONDS + 2);
      osc.connect(filter).connect(gain).connect(bus);
      osc.start(t);
      osc.stop(t + CHORD_SECONDS + 2.1);
    });
  });
}

function playBell(e: Engine, freq: number) {
  const { ctx, bus } = e;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = freq;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.05, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 4);
  osc.connect(gain).connect(bus);
  osc.start(t);
  osc.stop(t + 4.1);
}

function schedule(e: Engine) {
  const chord = () => playChord(e, CHORDS[e.chordIndex++ % CHORDS.length]);
  const bell = () => {
    playBell(e, BELLS[Math.floor(Math.random() * BELLS.length)]);
    e.bellTimer = window.setTimeout(bell, 3000 + Math.random() * 4000);
  };
  chord();
  e.chordTimer = window.setInterval(chord, CHORD_SECONDS * 1000);
  e.bellTimer = window.setTimeout(bell, 3000);
}

function unschedule(e: Engine) {
  window.clearInterval(e.chordTimer);
  window.clearTimeout(e.bellTimer);
}

function fadeTo(e: Engine, level: number, seconds: number) {
  const now = e.ctx.currentTime;
  const g = e.master.gain;
  g.cancelScheduledValues(now);
  g.setValueAtTime(g.value, now);
  g.linearRampToValueAtTime(level, now + seconds);
}

export default function MusicPlayer() {
  const [mode, setMode] = useState<Mode>("off");
  const engine = useRef<Engine | null>(null);
  const userMuted = useRef(false);
  const resumeOnShow = useRef(false);

  const begin = useCallback(async (): Promise<boolean> => {
    const e = (engine.current ??= createEngine());
    window.clearTimeout(e.suspendTimer);
    // Browsers may leave resume() pending when autoplay is blocked, so don't wait forever.
    await Promise.race([
      e.ctx.resume().catch(() => {}),
      new Promise((r) => setTimeout(r, 400)),
    ]);
    if (e.ctx.state !== "running") return false;
    if (!e.running) {
      e.running = true;
      schedule(e);
    }
    fadeTo(e, LEVEL, FADE_IN_SECONDS);
    setMode("playing");
    return true;
  }, []);

  const pause = useCallback(() => {
    const e = engine.current;
    if (!e || !e.running) return;
    e.running = false;
    unschedule(e);
    fadeTo(e, 0, 0.8);
    e.suspendTimer = window.setTimeout(() => void e.ctx.suspend(), 900);
  }, []);

  useEffect(() => {
    let startTimer: number | undefined;

    // Autoplay is often blocked until the visitor interacts, so the first
    // tap, click or key press starts the music if the timed start was refused.
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
        resumeOnShow.current = engine.current?.running ?? false;
        pause();
      } else if (resumeOnShow.current && !userMuted.current) {
        resumeOnShow.current = false;
        void begin();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearTimeout(startTimer);
      window.removeEventListener("load", arm);
      removeGesture();
      document.removeEventListener("visibilitychange", onVisibility);
      const e = engine.current;
      if (e) {
        unschedule(e);
        window.clearTimeout(e.suspendTimer);
        void e.ctx.close();
        engine.current = null;
      }
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
