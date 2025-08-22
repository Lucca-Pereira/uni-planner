import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all events (with subject included)
export async function GET() {
  const events = await prisma.event.findMany({
    include: { subject: true },
  });
  return Response.json(events);
}

// POST create new event (linked to subjectId)
export async function POST(req: Request) {
  const data = await req.json();

  if (!data.title || !data.start || !data.end || !data.subjectId || !data.type) {
    return new Response("Missing required fields", { status: 400 });
  }

  const newEvent = await prisma.event.create({
    data: {
      title: data.title,
      start: new Date(data.start),
      end: new Date(data.end),
      type: data.type,
      subjectId: data.subjectId,
    },
    include: { subject: true },
  });

  return Response.json(newEvent);
}
