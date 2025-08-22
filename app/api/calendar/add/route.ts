import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { calendarClient } from "@/lib/google";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = (session as any).accessToken as string;
  const calendar = calendarClient(accessToken);

  const body = await req.json();
  const { title, start, end, type, subject } = body as {
    title?: string; start?: string; end?: string; type?: string; subject?: string;
  };

  if (!title || !start || !end || !type || !subject) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const event = {
    summary: title,
    description: `Type:${type} | Subject:${subject}`, // human-friendly in Google Calendar
    start: { dateTime: start, timeZone: "Europe/Madrid" },
    end: { dateTime: end, timeZone: "Europe/Madrid" },
    extendedProperties: { private: { type, subject } }, // machine-friendly
  } as const;

  try {
    const res = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event as any,
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error("❌ Google Calendar insert error:", err.response?.data || err);
    return NextResponse.json(
      { error: "Failed to add event", details: err.response?.data || err.message },
      { status: 500 }
    );
  }
}
