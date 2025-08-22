import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { calendarClient } from "@/lib/google";

// Types for safety
interface GCalEvent {
  id?: string;
  summary?: string | null;
  description?: string | null;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  extendedProperties?: { private?: Record<string, string> } | null;
}

function extractTypeAndSubject(e: GCalEvent): { type?: string; subject?: string } {
  // Prefer machine-readable extended properties
  const ext = e.extendedProperties?.private || {};
  const type = (ext as any).type as string | undefined;
  const subject = (ext as any).subject as string | undefined;
  if (type || subject) return { type, subject };

  // Fallback: parse from description like: "Type:Class | Subject:Math"
  const desc = e.description || "";
  const typeMatch = desc.match(/Type:\s*([^|\n]+)/i)?.[1]?.trim();
  const subjMatch = desc.match(/Subject:\s*([^|\n]+)/i)?.[1]?.trim();
  return { type: typeMatch, subject: subjMatch };
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = (session as any).accessToken as string;
  const calendar = calendarClient(accessToken);

  try {
    const now = new Date();
    const res = await calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: "startTime",
    });

    const items = (res.data.items || []) as GCalEvent[];

    const events = items.map((e) => {
      const { type, subject } = extractTypeAndSubject(e);
      return {
        id: e.id || "",
        summary: e.summary || undefined,
        start: e.start,
        end: e.end,
        type,
        subject,
      };
    });

    // Return shape expected by the client: { events: [...] }
    return NextResponse.json({ events });
  } catch (err: any) {
    console.error("❌ Google Calendar fetch error:", err.response?.data || err);
    return NextResponse.json(
      { error: "Failed to fetch events", details: err.response?.data || err.message },
      { status: 500 }
    );
  }
}
