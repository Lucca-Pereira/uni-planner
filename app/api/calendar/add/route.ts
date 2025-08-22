import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { calendarClient } from "@/lib/google";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // ✅ Auth check
    const session = await getServerSession(authOptions);
    if (!session || !(session as any).accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = (session as any).accessToken as string;
    const calendar = calendarClient(accessToken);

    // ✅ Parse body
    const { title, start, end, type, subjectId } = await req.json();

    if (!title || !start || !end || !type || !subjectId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Get subject from DB
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // ✅ Store in DB
    const newEvent = await prisma.event.create({
      data: {
        title,
        start,
        end,
        type,
        subject: { connect: { id: subjectId } },
      },
      include: { subject: true },
    });

    // ✅ Push to Google Calendar
    const event = {
      summary: title,
      description: `Type:${type} | Subject:${subject.name}`,
      start: { dateTime: start, timeZone: "Europe/Madrid" },
      end: { dateTime: end, timeZone: "Europe/Madrid" },
      extendedProperties: {
        private: { type, subject: subject.name, subjectId: subjectId.toString() },
      },
    };

    await calendar.events.insert({
      calendarId: "primary",
      requestBody: event as any,
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (err: any) {
    console.error("❌ calendar/add error:", err);
    return NextResponse.json(
      { error: "Failed to add event", details: err.message },
      { status: 500 }
    );
  }
}