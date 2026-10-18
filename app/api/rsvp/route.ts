import { NextResponse } from "next/server";
import { rsvpSchema } from "@/lib/schema";
import { saveRsvpToNotion } from "@/lib/notion";
import { wedding } from "@/lib/wedding";

export const runtime = "nodejs";

// Light in-memory rate limit (per server instance) to blunt spam.
const hits = new Map<string, { count: number; reset: number }>();
function limited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + 10 * 60 * 1000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 8;
}

export async function POST(req: Request) {
  if (Date.now() > new Date(wedding.deadlineISO).getTime()) {
    return NextResponse.json(
      { error: "RSVPs are now closed. Please call us on " + wedding.rsvpPhone },
      { status: 403 },
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details" },
      { status: 400 },
    );
  }

  const { name, invited_by, guest_count, phone, message, website } = parsed.data;

  // Honeypot tripped: pretend success so bots move on.
  if (website) return NextResponse.json({ ok: true });

  try {
    await saveRsvpToNotion({ name, invited_by, guest_count, phone, message });
  } catch (error) {
    console.error("RSVP save to Notion failed", error);
    return NextResponse.json({ error: "Could not save your RSVP. Please try again." }, { status: 500 });
  }

  // Optional: ping n8n -> WhatsApp. Never block the guest on this.
  const hook = process.env.N8N_WEBHOOK_URL;
  if (hook) {
    fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, invited_by, guest_count, phone, message }),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
