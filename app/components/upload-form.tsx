"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UploadForm({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    setIsLoading(true);

    formData.append("caseId", caseId);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error || "Falha no upload.");
      setIsLoading(false);
      return;
    }

    router.refresh();
    setIsLoading(false);
  }

  return (
    <form action={onSubmit} className="space-y-3 rounded-md border border-zinc-200 p-4">
      <Input name="file" type="file" accept="image/png,image/jpeg,image/webp" required />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Enviando..." : "Enviar imagem"}
      </Button>
    </form>
  );
}
