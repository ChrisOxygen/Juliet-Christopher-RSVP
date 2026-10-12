import { z } from "zod";

export const rsvpSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  guest_count: z.number().int().min(1).max(10),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .transform((v) => (v ? v : undefined)),
  message: z
    .string()
    .trim()
    .max(500, "Please keep your message under 500 characters")
    .optional()
    .transform((v) => (v ? v : undefined)),
  // Honeypot: real guests never fill this in.
  website: z.string().max(0).optional(),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;
