type NewRsvp = {
  name: string;
  guest_count: number;
  phone?: string;
  message?: string;
};

// Database columns expected in Notion:
// Name (title), Guests (number), Phone (phone), Message (text).
// Add a "Created time" column in Notion if you want a timestamp.
export async function saveRsvpToNotion({ name, guest_count, phone, message }: NewRsvp) {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!token || !databaseId) {
    throw new Error("Missing NOTION_TOKEN or NOTION_DATABASE_ID");
  }

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        Name: { title: [{ text: { content: name } }] },
        Guests: { number: guest_count },
        Phone: { phone_number: phone ?? null },
        Message: { rich_text: message ? [{ text: { content: message } }] : [] },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Notion ${res.status}: ${await res.text()}`);
  }
}
