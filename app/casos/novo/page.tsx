"use client";

import { useRouter } from "next/navigation";
import { CasoForm } from "@/components/casos/caso-form";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCasos } from "@/hooks/useCasos";
import type { Caso } from "@/types";

export default function NovoCasoPage() {
  const router = useRouter();
  const { createCaso } = useCasos();

  const handleSubmit = async (data: Omit<Caso, "id" | "createdAt" | "updatedAt">) => {
    const id = await createCaso(data);
    router.push(`/casos/${id}`);
  };

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Novo caso de denúncia</CardTitle>
        </CardHeader>
        <CardContent>
          <CasoForm onSubmit={handleSubmit} submitLabel="Criar caso" />
        </CardContent>
      </Card>
    </AppShell>
  );
}
