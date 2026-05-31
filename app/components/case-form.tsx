"use client";

import { StatusCaso, TipoViolacao } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { statusLabels, type CasoWithAnexos, violationLabels } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  initialData?: CasoWithAnexos;
};

export function CaseForm({ initialData }: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postsRaw, setPostsRaw] = useState(initialData?.urlsPosts.join("\n") ?? "");

  const toOptional = (value: FormDataEntryValue | null) => {
    const normalized = String(value ?? "").trim();
    return normalized.length > 0 ? normalized : null;
  };

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsSaving(true);

    const payload = {
      username: String(formData.get("username") ?? ""),
      urlPerfil: String(formData.get("urlPerfil") ?? ""),
      urlsPosts: postsRaw
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      tipoViolacao: String(formData.get("tipoViolacao") ?? TipoViolacao.OUTRO),
      gravidade: Number(formData.get("gravidade") ?? 1),
      dataEncontro: String(formData.get("dataEncontro") ?? new Date().toISOString()),
      descricao: toOptional(formData.get("descricao")),
      status: String(formData.get("status") ?? StatusCaso.PENDENTE),
      dataEnvio: toOptional(formData.get("dataEnvio")),
      observacoes: toOptional(formData.get("observacoes")),
    };

    const endpoint = initialData ? `/api/casos/${initialData.id}` : "/api/casos";

    const response = await fetch(endpoint, {
      method: initialData ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error || "Não foi possível salvar o caso.");
      setIsSaving(false);
      return;
    }

    const data = await response.json();
    router.push(`/casos/${data.id ?? initialData?.id}`);
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" defaultValue={initialData?.username} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="urlPerfil">URL do perfil</Label>
          <Input id="urlPerfil" name="urlPerfil" type="url" defaultValue={initialData?.urlPerfil} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="urlsPosts">URLs dos posts (uma por linha)</Label>
        <Textarea
          id="urlsPosts"
          name="urlsPosts"
          value={postsRaw}
          onChange={(event) => setPostsRaw(event.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="tipoViolacao">Tipo de violação</Label>
          <select
            id="tipoViolacao"
            name="tipoViolacao"
            defaultValue={initialData?.tipoViolacao ?? TipoViolacao.OUTRO}
            className="h-10 w-full rounded-md border border-zinc-300 px-3"
          >
            {Object.entries(violationLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gravidade">Gravidade (1-5)</Label>
          <Input
            id="gravidade"
            name="gravidade"
            type="number"
            min={1}
            max={5}
            defaultValue={initialData?.gravidade ?? 3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataEncontro">Data do encontro</Label>
          <Input
            id="dataEncontro"
            name="dataEncontro"
            type="date"
            defaultValue={(initialData?.dataEncontro || new Date().toISOString()).slice(0, 10)}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={initialData?.status ?? StatusCaso.PENDENTE}
            className="h-10 w-full rounded-md border border-zinc-300 px-3"
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataEnvio">Data de envio (opcional)</Label>
          <Input
            id="dataEnvio"
            name="dataEnvio"
            type="date"
            defaultValue={initialData?.dataEnvio?.slice(0, 10) ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" name="descricao" defaultValue={initialData?.descricao ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" name="observacoes" defaultValue={initialData?.observacoes ?? ""} />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Salvando..." : initialData ? "Atualizar caso" : "Criar caso"}
      </Button>
    </form>
  );
}
