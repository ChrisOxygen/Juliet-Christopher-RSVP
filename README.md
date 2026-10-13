# Juliet & Christopher: Wedding RSVP

A one-page website where wedding guests confirm they are coming. Each response is saved as a new row in a Notion database, so you read the guest list in Notion. There is no admin dashboard and no other database.

Built with Next.js 15, React 19, Tailwind CSS 4 and Zod.

## What it does

- Shows the invitation details: the couple's names, the date, both families, the ceremony and reception venues and times, and the colours of the day.
- Shows an RSVP form with these fields:
  - **Full name** (required)
  - **Number attending**, including the guest (1 to 10)
  - **Phone / WhatsApp** (optional)
  - **Message to the couple** (optional)
- Treats every submission as attending. There is no "decline" option.
- Saves each submission to Notion and then shows a thank-you message.
- Closes the form after the RSVP deadline and shows the RSVP phone number instead. The deadline is checked in the browser page and again on the server.
- On desktop, the invitation text is on the left and the form is on the right. On mobile, the form comes first and the full details follow below it.

### Protection against spam

- A hidden honeypot field catches bots. Their submissions look successful but are not saved.
- Each IP address is limited to 8 submissions per 10 minutes. The counter is kept in memory per server instance and resets on restart.
- The server validates every submission (name 2 to 100 characters, 1 to 10 guests, phone up to 20 characters, message up to 500 characters).

The app does not stop the same person from submitting twice. Sort the Notion table by `Name` to spot duplicates.

## Setup

### 1. Create the Notion database

Create a database (a full-page table) with these columns. The names must match exactly:

| Column    | Type   |
| --------- | ------ |
| `Name`    | Title  |
| `Guests`  | Number |
| `Phone`   | Phone  |
| `Message` | Text   |

You can also add a `Created time` column for a timestamp. Notion fills it in by itself.

### 2. Connect Notion

1. Go to notion.so/profile/integrations and create an internal integration. Copy its secret.
2. Open the database, click "..." in the top right, choose Connections, and add the integration.
3. Copy the database ID. It is the 32 characters in the database's URL, before `?v=`. An ID from a page that merely contains the table will not work.

### 3. Add the environment variables

Copy `.env.example` to `.env.local` and fill in:

- `NOTION_TOKEN`: the integration secret
- `NOTION_DATABASE_ID`: the database ID
- `N8N_WEBHOOK_URL` (optional): a webhook that is called with each new RSVP, for example to send a WhatsApp message through n8n. A failed webhook never blocks the guest.

### 4. Run it

```bash
npm install
npm run dev
```

The site runs at http://localhost:3000.

## Deploy

Push the repository to GitHub, import it into Vercel, and add the same environment variables there. Attach your custom domain before printing the QR code, because the code points to that address and cannot change.

## QR code

```bash
npm run qr -- https://your-domain.com
```

This creates `rsvp-qr.png` (for print) and `rsvp-qr.svg`, in burgundy on ivory. Both are ignored by Git.

## Editing the content

- Names, families, venues, times, colours, RSVP phone number and deadline are in [lib/wedding.ts](lib/wedding.ts). The deadline is `deadlineISO`, currently 15 November 2026 (end of day, Lagos time). Update `deadlineLabel` to match.
- The page layout is in [app/page.tsx](app/page.tsx).
- The form is in [components/RsvpForm.tsx](components/RsvpForm.tsx), and its validation rules are in [lib/schema.ts](lib/schema.ts).
- The Notion save is in [lib/notion.ts](lib/notion.ts), called from [app/api/rsvp/route.ts](app/api/rsvp/route.ts).
- Colours and fonts are set in [app/globals.css](app/globals.css) and [app/layout.tsx](app/layout.tsx).

## Project structure

```
app/            Page, layout, styles and the /api/rsvp endpoint
components/     RSVP form and the decorative rings
lib/            Wedding details, validation schema, Notion client
scripts/qr.mjs  QR code generator
```
