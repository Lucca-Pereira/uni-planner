import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: one subject by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  const subject = await prisma.subject.findUnique({ where: { id } });

  if (!subject) {
    return new Response("Not found", { status: 404 });
  }

  return Response.json(subject);
}

// PUT: update (rename, recolor, etc.)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  const data = await req.json();

  const updated = await prisma.subject.update({
    where: { id },
    data: {
      name: data.name,
      color: data.color ?? undefined,
    },
  });

  return Response.json(updated);
}

// DELETE: remove subject
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);

  await prisma.subject.delete({ where: { id } });

  return new Response("Deleted", { status: 200 });
}