import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PUT update event
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  const data = await req.json();

  const updated = await prisma.event.update({
    where: { id },
    data: {
      title: data.title,
      start: new Date(data.start),
      end: new Date(data.end),
      type: data.type,
      subjectId: data.subjectId,
    },
    include: { subject: true },
  });

  return Response.json(updated);
}

// DELETE event
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  await prisma.event.delete({ where: { id } });
  return new Response("Deleted", { status: 200 });
}
