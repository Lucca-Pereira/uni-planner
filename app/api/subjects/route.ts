import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const subjects = await prisma.subject.findMany();
  return Response.json(subjects);
}

export async function POST(req: Request) {
  const data = await req.json();
  const newSubject = await prisma.subject.create({
    data: {
      name: data.name,
      color: data.color,
    },
  });
  return Response.json(newSubject);
}