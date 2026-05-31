import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { allowedMimeTypes, MAX_UPLOAD_SIZE_BYTES } from "@/app/lib/case-schema";
import { getAuthSession } from "@/app/lib/auth";
import { getEnv } from "@/app/lib/env";
import { prisma } from "@/app/lib/prisma";
import { supabaseAdmin } from "@/app/lib/supabase-server";

const mimeToExt: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const caseId = formData.get("caseId");

  if (!(file instanceof File) || typeof caseId !== "string") {
    return NextResponse.json({ error: "Dados de upload inválidos." }, { status: 400 });
  }

  if (!allowedMimeTypes.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de arquivo não permitido." }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return NextResponse.json({ error: "Arquivo excede limite de 5MB." }, { status: 400 });
  }

  const ownedCase = await prisma.caso.findFirst({
    where: {
      id: caseId,
      userId: session.user.id,
    },
  });

  if (!ownedCase) {
    return NextResponse.json({ error: "Caso não encontrado." }, { status: 404 });
  }

  const ext = mimeToExt[file.type] ?? "bin";
  const bucket = getEnv("SUPABASE_STORAGE_BUCKET");
  const path = `${session.user.id}/${caseId}/${randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: "Falha no upload." }, { status: 502 });
  }

  const created = await prisma.anexo.create({
    data: {
      casoId: caseId,
      caminho: path,
      nome: file.name,
      mimeType: file.type,
      tamanho: file.size,
    },
  });

  const signed = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, 60 * 10);

  return NextResponse.json(
    {
      ...created,
      signedUrl: signed.error ? null : signed.data.signedUrl,
    },
    { status: 201 },
  );
}
