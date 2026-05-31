"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CasoForm } from "@/components/casos/caso-form";
import { StatusBadge } from "@/components/casos/status-badge";
import { TemplateModal } from "@/components/casos/template-modal";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCasos } from "@/hooks/useCasos";
import type { Caso } from "@/types";
import { VIOLATION_LABELS } from "@/types";

export default function CasoDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { getCasoById, updateCaso, deleteCaso } = useCasos();
  const [caso, setCaso] = useState<Caso | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    void getCasoById(id).then((data) => setCaso(data ?? null));
  }, [getCasoById, id]);

  if (Number.isNaN(id) || id < 1) {
    return <AppShell><p>ID inválido.</p></AppShell>;
  }

  if (!caso) {
    return <AppShell><p>Carregando caso...</p></AppShell>;
  }

  const handleDelete = async () => {
    const confirmed = window.confirm("Tem certeza que deseja excluir este caso?");
    if (!confirmed) return;
    await deleteCaso(id);
    router.push("/casos");
  };

  const handleMarkSent = async () => {
    await updateCaso(id, { status: "enviado", sentAt: new Date().toISOString() });
    const updated = await getCasoById(id);
    setCaso(updated ?? null);
  };

  const handleUpdate = async (data: Omit<Caso, "id" | "createdAt" | "updatedAt">) => {
    await updateCaso(id, data);
    const updated = await getCasoById(id);
    setCaso(updated ?? null);
    setEditing(false);
  };

  return (
    <AppShell>
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>Caso #{caso.id} — @{caso.username}</CardTitle>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={caso.status} />
            <TemplateModal caso={caso} />
            {caso.status !== "enviado" && (
              <Button variant="outline" onClick={() => void handleMarkSent()} type="button">Marcar denúncia enviada</Button>
            )}
            <Button variant="outline" type="button" onClick={() => setEditing((prev) => !prev)}>
              {editing ? "Cancelar edição" : "Editar"}
            </Button>
            <Button variant="destructive" onClick={() => void handleDelete()} type="button">Excluir</Button>
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <CasoForm initialData={caso} onSubmit={handleUpdate} submitLabel="Salvar alterações" />
          ) : (
            <Tabs defaultValue="dados">
              <TabsList>
                <TabsTrigger value="dados">Dados</TabsTrigger>
                <TabsTrigger value="evidencias">Evidências</TabsTrigger>
              </TabsList>
              <TabsContent value="dados">
                <div className="space-y-3 text-sm">
                  <p><strong>Tipo:</strong> {VIOLATION_LABELS[caso.violationType]}</p>
                  <p><strong>Gravidade:</strong> {caso.severity}</p>
                  <p><strong>Data encontrada:</strong> {caso.dateFound}</p>
                  <p><strong>URL do perfil:</strong> <a className="underline" href={caso.profileUrl} target="_blank" rel="noreferrer">{caso.profileUrl}</a></p>
                  <div>
                    <strong>Posts:</strong>
                    <ul className="ml-5 list-disc">
                      {caso.postUrls.map((url) => (
                        <li key={url}><a className="underline" href={url} target="_blank" rel="noreferrer">{url}</a></li>
                      ))}
                    </ul>
                  </div>
                  <p><strong>Descrição:</strong> {caso.shortDescription || "-"}</p>
                  <p><strong>Notas internas:</strong> {caso.internalNotes || "-"}</p>
                  <p><strong>Enviado em:</strong> {caso.sentAt ? new Date(caso.sentAt).toLocaleDateString("pt-BR") : "-"}</p>
                  <p><strong>Observações pós-envio:</strong> {caso.sentObservations || "-"}</p>
                </div>
              </TabsContent>
              <TabsContent value="evidencias">
                {caso.evidenceImages.length ? (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {caso.evidenceImages.map((image, idx) => (
                      <div key={`${image.name}-${idx}`} className="rounded border p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.dataUrl} alt={image.name} className="h-28 w-full rounded object-cover" />
                        <p className="mt-1 truncate text-xs">{image.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Sem evidências de imagem.</p>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
      <div className="mt-4">
        <Link href="/casos" className="text-sm underline">← Voltar para lista</Link>
      </div>
    </AppShell>
  );
}
