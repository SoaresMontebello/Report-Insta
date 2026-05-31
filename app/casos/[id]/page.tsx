import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CaseForm } from "@/app/components/case-form";
import { CopyTemplateButton } from "@/app/components/copy-template-button";
import { DeleteCaseButton } from "@/app/components/delete-case-button";
import { UploadForm } from "@/app/components/upload-form";
import { Card } from "@/components/ui/card";
import { getAuthSession } from "@/app/lib/auth";
import { formatDate } from "@/app/lib/utils";
import { prisma } from "@/app/lib/prisma";
import { withSignedAttachmentUrls } from "@/app/lib/signed-url";
import { generateReportTemplate } from "@/app/lib/templates";

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const current = await prisma.caso.findFirst({
    where: { id, userId: session.user.id },
    include: { anexos: true },
  });

  if (!current) {
    notFound();
  }

  const template = generateReportTemplate(current.tipoViolacao, {
    username: current.username,
    urlPerfil: current.urlPerfil,
    urlsPosts: current.urlsPosts,
    descricao: current.descricao,
    dataEncontro: formatDate(current.dataEncontro),
  });

  const anexos = await withSignedAttachmentUrls(current.anexos);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Caso @{current.username}</h1>
        <Link href="/casos" className="text-sm underline">
          Voltar
        </Link>
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Texto de denúncia</h2>
        <pre className="mb-3 whitespace-pre-wrap rounded-md bg-zinc-100 p-3 text-sm">{template}</pre>
        <div className="flex flex-wrap gap-2">
          <CopyTemplateButton text={template} />
          <DeleteCaseButton caseId={current.id} />
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Editar dados</h2>
          <CaseForm
            initialData={{
              ...current,
              dataEncontro: current.dataEncontro.toISOString(),
              dataEnvio: current.dataEnvio?.toISOString() ?? null,
              createdAt: current.createdAt.toISOString(),
              updatedAt: current.updatedAt.toISOString(),
              anexos: current.anexos.map((anexo) => ({
                id: anexo.id,
                nome: anexo.nome,
                mimeType: anexo.mimeType,
                tamanho: anexo.tamanho,
                createdAt: anexo.createdAt.toISOString(),
              })),
            }}
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Anexos</h2>
          <UploadForm caseId={current.id} />
          <ul className="space-y-2">
            {anexos.map((anexo) => (
              <li key={anexo.id} className="rounded-md border border-zinc-200 bg-white p-3 text-sm">
                <p className="font-medium">{anexo.nome}</p>
                <p className="text-zinc-600">{Math.round(anexo.tamanho / 1024)} KB</p>
                <p className="text-zinc-600">{formatDate(anexo.createdAt)}</p>
                {anexo.signedUrl ? (
                  <div className="mt-2 space-y-1">
                    <a href={anexo.signedUrl} target="_blank" rel="noreferrer" className="underline">
                      Abrir/download (URL assinada)
                    </a>
                  </div>
                ) : (
                  <p className="text-red-600">Falha ao gerar URL assinada.</p>
                )}
              </li>
            ))}
            {current.anexos.length === 0 ? (
              <li className="rounded-md border border-zinc-200 bg-white p-3 text-sm text-zinc-500">
                Nenhum anexo enviado.
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
