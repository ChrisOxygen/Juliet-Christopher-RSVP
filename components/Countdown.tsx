"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export default function Countdown({ target }: { target: string }) {
  const end = new Date(target).getTime();
  // null until mounted, so server and client render the same HTML.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const left = now === null ? null : end - now;

  if (left !== null && left <= 0) {
    return (
      <p className="mt-5 font-serif text-xl italic text-burgundy">
        Today is the day. Join us as we celebrate!
      </p>
    );
  }

  const t = parts(left ?? 0);
  const units = [
    { label: "Days", value: t.days },
    { label: "Hours", value: t.hours },
    { label: "Mins", value: t.minutes },
    { label: "Secs", value: t.seconds },
  ];

  return (
    <div className="mt-5" role="timer" aria-label="Time until the wedding">
      <p className="mb-2 whitespace-nowrap text-xs uppercase tracking-[0.12em] text-burgundy/80 min-[360px]:text-sm min-[360px]:tracking-[0.2em]">Counting down to our big day</p>
      <div className="flex justify-center gap-2 sm:gap-3">
        {units.map((u) => (
          <div
            key={u.label}
            className="min-w-14 rounded-xl border border-gold/50 bg-white/60 px-2 py-1.5 sm:min-w-16"
          >
            <p className="font-serif text-2xl font-semibold tabular-nums text-burgundy sm:text-3xl">
              {left === null ? "--" : String(u.value).padStart(u.label === "Days" ? 1 : 2, "0")}
            </p>
            <p className="text-[11px] uppercase tracking-widest text-burgundy/70">{u.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
