import { NextResponse } from "next/server";

import { getAuthSession } from "@/app/lib/auth";
import { caseInputSchema } from "@/app/lib/case-schema";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const cases = await prisma.caso.findMany({
    where: { userId: session.user.id },
    include: { anexos: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(cases);
}

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = caseInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const data = parsed.data;

  const created = await prisma.caso.create({
    data: {
      userId: session.user.id,
      username: data.username,
      urlPerfil: data.urlPerfil,
      urlsPosts: data.urlsPosts,
      tipoViolacao: data.tipoViolacao,
      gravidade: data.gravidade,
      dataEncontro: data.dataEncontro,
      descricao: data.descricao || null,
      status: data.status,
      dataEnvio: data.dataEnvio ?? null,
      observacoes: data.observacoes || null,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
