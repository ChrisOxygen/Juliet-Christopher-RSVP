import RsvpForm from "@/components/RsvpForm";
import { Rings } from "@/components/Decor";
import { wedding } from "@/lib/wedding";

// Evaluate the RSVP deadline on every request, not at build time.
export const dynamic = "force-dynamic";

export default function Home() {
  const closed = Date.now() > new Date(wedding.deadlineISO).getTime();

  return (
    <main className="relative mx-auto max-w-6xl overflow-hidden px-4 pb-12 pt-8 lg:flex lg:min-h-dvh lg:items-center lg:py-6">
      <Rings className="pointer-events-none fixed right-5 top-6 hidden w-20 opacity-70 min-[1360px]:block" />
      <Rings className="pointer-events-none fixed bottom-6 left-5 hidden w-20 opacity-70 min-[1360px]:block" />

      {/* Mobile: header -> form -> details. Desktop: details left, form right. */}
      <div className="relative mx-auto grid w-full max-w-xl gap-8 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-14 lg:[grid-template-areas:'head_form'_'details_form']">
        <header className="rise text-center lg:[grid-area:head] lg:self-end lg:pt-2">
          <h1 className="font-script text-[2.6rem] leading-[1.05] min-[360px]:text-5xl text-burgundy sm:text-6xl lg:text-7xl">
            {wedding.bride} <span className="text-gold">&amp;</span>
            <br />
            {wedding.groom}
          </h1>
          <p className="mt-4 inline-block border border-burgundy/60 bg-ivory/70 px-4 py-2 text-sm uppercase tracking-widest text-burgundy sm:text-base">
            {wedding.dateLabel}
          </p>
        </header>

        <section
          className="rise rounded-3xl border border-gold/50 bg-white/70 p-6 shadow-lg backdrop-blur-sm sm:p-8 lg:[grid-area:form] lg:self-center lg:p-7"
          style={{ animationDelay: "0.15s" }}
        >
          <h2 className="text-center font-serif text-3xl font-semibold italic text-burgundy sm:text-4xl">Kindly RSVP</h2>
          {!closed && (
            <p className="mb-4 mt-1 text-center text-base opacity-80">Please respond by {wedding.deadlineLabel}</p>
          )}
          <div className="gold-rule mb-5" />
          <RsvpForm closed={closed} />
          <p className="mt-5 text-center text-base italic text-burgundy">
            Prefer to call? RSVP:{" "}
            <a href={`tel:${wedding.rsvpPhone}`} className="underline decoration-gold">
              {wedding.rsvpPhone}
            </a>
          </p>
        </section>

        <section className="rise text-center lg:[grid-area:details] lg:self-start" style={{ animationDelay: "0.3s" }}>
          <div className="gold-rule mx-auto mb-4 w-56" />
          <p className="font-serif text-lg italic">The families of</p>
          {wedding.families.map((f, i) => (
            <div key={f.head}>
              <p className="mt-1 text-lg font-bold uppercase tracking-wide text-burgundy">{f.head}</p>
              <p className="mx-auto max-w-sm text-base leading-snug">{f.from}</p>
              {i === 0 && <p className="my-1 font-script text-3xl text-gold">&amp;</p>}
            </div>
          ))}

          <p className="mx-auto mt-4 max-w-sm text-base leading-snug">
            Joyfully request the honor of your presence at the wedding celebration of their beloved children
          </p>
          <div className="gold-rule mx-auto my-4 w-56" />

          <div className="space-y-3">
            {wedding.events.map((e) => (
              <p key={e.title} className="text-base leading-snug">
                <span className="font-bold uppercase text-burgundy">{e.title}:</span> {e.venue}
                <br />
                <span className="font-semibold">Time: {e.time}</span>
              </p>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2" aria-label="Colors of the day">
            {wedding.colors.map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="h-5 w-5 rounded-full border border-gold/40"
                style={{ background: c.hex }}
              />
            ))}
          </div>
          <p className="mt-2 text-sm">
            <span className="font-bold text-burgundy">Colors of the day:</span>{" "}
            {wedding.colors.map((c) => c.name).join(", ")}
          </p>
        </section>
      </div>
    </main>
  );
}
