"use client";

import { useState } from "react";
import { wedding } from "@/lib/wedding";

type Status = "idle" | "submitting" | "done" | "error";

export default function RsvpForm({ closed }: { closed: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [doneName, setDoneName] = useState("");

  if (closed) {
    return (
      <>
      <h2 className="text-center font-serif text-3xl font-semibold italic text-burgundy sm:text-4xl">
        Kindly RSVP
      </h2>
        <div className="gold-rule my-5" />
      <p className="text-center text-lg">
        RSVPs are now closed. Please call{" "}
        <a
          className="font-semibold underline decoration-gold"
          href={`tel:${wedding.rsvpPhone}`}
        >
          {wedding.rsvpPhone}
        </a>
        .
      </p>
      </>
    );
  }

  if (status === "done") {
    return (
      <div className="rise flex flex-1 flex-col items-center justify-center py-6 text-center">
        <p className="font-script text-5xl text-burgundy">
          Thank you, {doneName.split(" ")[0]}!
        </p>
        <div className="gold-rule mx-auto my-5 w-40" />
        <p className="text-lg">
          We are overjoyed that you will celebrate with us. See you on the 23rd
          of December.
        </p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          invited_by: f.get("invited_by"),
          guest_count: Number(f.get("guest_count") ?? 1),
          phone: f.get("phone"),
          message: f.get("message"),
          website: f.get("website"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setDoneName(String(f.get("name")));
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  const input =
    "w-full rounded-xl border border-gold/50 bg-white/80 px-4 py-2.5 text-lg text-burgundy-deep placeholder:text-burgundy/40 outline-none transition focus:border-burgundy focus:ring-2 focus:ring-blush/40";
  const label =
    "mb-1.5 block text-sm uppercase tracking-[0.18em] text-burgundy";

  return (
    <>
      <h2 className="text-center font-serif text-3xl font-semibold italic text-burgundy sm:text-4xl">
        Kindly RSVP
      </h2>
      <p className="mb-4 mt-1 whitespace-nowrap text-center text-sm font-semibold text-burgundy">
        Please respond by {wedding.deadlineLabel}
      </p>
      <div className="gold-rule mb-5" />
    <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4" noValidate>
      <div>
        <label htmlFor="name" className={label}>
          Full name
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          placeholder="Your name"
          className={input}
        />
      </div>

      <div>
        <label htmlFor="invited_by" className={label}>
          Invited by
        </label>
        <input
          id="invited_by"
          name="invited_by"
          required
          placeholder="Example: Mrs. John Ogbonna or Miss Deborah John"
          className={input}
        />
      </div>

      <div>
        <label htmlFor="guest_count" className={label}>
          Number attending (including you)
        </label>
        <select
          id="guest_count"
          name="guest_count"
          defaultValue="1"
          className={input}
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="phone" className={label}>
          Phone / WhatsApp{" "}
          <span className="normal-case tracking-normal opacity-60">
            (optional)
          </span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          placeholder="0803 000 0000"
          className={input}
        />
      </div>

      <div className="flex flex-1 flex-col">
        <label htmlFor="message" className={label}>
          Message to the couple{" "}
          <span className="normal-case tracking-normal opacity-60">
            (optional)
          </span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          maxLength={500}
          placeholder="Words of love..."
          className={`${input} min-h-28 flex-1 resize-none`}
        />
      </div>

      {/* Honeypot */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-blush-soft px-4 py-2 text-center text-burgundy-deep"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-xl bg-gradient-to-b from-burgundy to-burgundy-deep px-6 py-3.5 text-lg tracking-[0.2em] text-ivory uppercase shadow-lg transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
      >
        {status === "submitting" ? "Sending..." : "Send RSVP"}
      </button>
    </form>
      <p className="mt-5 text-center text-base italic text-burgundy">
        Prefer to call? RSVP:{" "}
        <a href={`tel:${wedding.rsvpPhone}`} className="underline decoration-gold">
          {wedding.rsvpPhone}
        </a>
      </p>
    </>
  );
}
