import { NextResponse } from "next/server";

import { getAuthSession } from "@/app/lib/auth";
import { caseInputSchema } from "@/app/lib/case-schema";
import { getEnv } from "@/app/lib/env";
import { logError } from "@/app/lib/logger";
import { prisma } from "@/app/lib/prisma";
import { withSignedAttachmentUrls } from "@/app/lib/signed-url";
import { supabaseAdmin } from "@/app/lib/supabase-server";

async function findOwnedCase(caseId: string, userId: string) {
  return prisma.caso.findFirst({
    where: { id: caseId, userId },
    include: { anexos: true },
  });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await findOwnedCase(id, session.user.id);

  if (!existing) {
    return NextResponse.json({ error: "Caso não encontrado." }, { status: 404 });
  }

  const anexos = await withSignedAttachmentUrls(existing.anexos);

  return NextResponse.json({
    ...existing,
    anexos,
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await findOwnedCase(id, session.user.id);

  if (!existing) {
    return NextResponse.json({ error: "Caso não encontrado." }, { status: 404 });
  }

  const body = await request.json();
  const parsed = caseInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const data = parsed.data;

  const updated = await prisma.caso.update({
    where: { id },
    data: {
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

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await findOwnedCase(id, session.user.id);

  if (!existing) {
    return NextResponse.json({ error: "Caso não encontrado." }, { status: 404 });
  }

  const storagePaths = existing.anexos.map((anexo) => anexo.caminho);

  if (storagePaths.length > 0) {
    const bucket = getEnv("SUPABASE_STORAGE_BUCKET");
    const { error } = await supabaseAdmin.storage.from(bucket).remove(storagePaths);

    if (error) {
      logError("case_delete_storage_cleanup_failed", error, { caseId: id, storagePaths });
      return NextResponse.json({ error: "Não foi possível remover os anexos." }, { status: 500 });
    }
  }

  await prisma.caso.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
