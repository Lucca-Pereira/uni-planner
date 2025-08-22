import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all events
export async function GET() {
  const events = await prisma.event.findMany({
    include: { subject: true }, // include subject info
  });
  return Response.json(events);
}

// POST create new event
export async function POST(req: Request) {
  const data = await req.json();
  const newEvent = await prisma.event.create({
    data: {
      title: data.title,
      date: new Date(data.date),
      subjectId: data.subjectId, // 👈 must be an existing subject
    },
    include: { subject: true },
  });
  return Response.json(newEvent);
}