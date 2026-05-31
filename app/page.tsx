"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCasos } from "@/hooks/useCasos";
import { VIOLATION_LABELS } from "@/types";

export default function DashboardPage() {
  const { casos, loading } = useCasos();

  const stats = useMemo(() => {
    const total = casos.length;
    const byStatus = {
      pendente: casos.filter((c) => c.status === "pendente").length,
      enviado: casos.filter((c) => c.status === "enviado").length,
      resolvido: casos.filter((c) => c.status === "resolvido").length,
    };

    const byType = Object.keys(VIOLATION_LABELS).map((key) => ({
      key,
      count: casos.filter((c) => c.violationType === key).length,
    }));

    const sentDiffs = casos
      .filter((c) => c.sentAt)
      .map((c) => {
        const created = new Date(c.createdAt).getTime();
        const sent = new Date(c.sentAt as string).getTime();
        return Math.max(0, sent - created) / (1000 * 60 * 60 * 24);
      });

    const avgDaysToSend = sentDiffs.length ? (sentDiffs.reduce((a, b) => a + b, 0) / sentDiffs.length).toFixed(1) : "-";

    const recent = [...casos].slice(0, 5);
    return { total, byStatus, byType, avgDaysToSend, recent };
  }, [casos]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Link href="/casos/novo" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
            Novo caso
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardHeader><CardTitle>Total de casos</CardTitle></CardHeader><CardContent>{loading ? "..." : stats.total}</CardContent></Card>
          <Card><CardHeader><CardTitle>Pendentes</CardTitle></CardHeader><CardContent>{stats.byStatus.pendente}</CardContent></Card>
          <Card><CardHeader><CardTitle>Enviados</CardTitle></CardHeader><CardContent>{stats.byStatus.enviado}</CardContent></Card>
          <Card><CardHeader><CardTitle>Tempo médio até envio</CardTitle></CardHeader><CardContent>{stats.avgDaysToSend} dias</CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Casos por tipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.byType.map((item) => (
              <div key={item.key} className="flex justify-between text-sm">
                <span>{VIOLATION_LABELS[item.key as keyof typeof VIOLATION_LABELS]}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Casos recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recent.length ? (
              <ul className="space-y-2 text-sm">
                {stats.recent.map((caso) => (
                  <li key={caso.id} className="flex justify-between rounded border p-2">
                    <span>@{caso.username}</span>
                    <Link href={`/casos/${caso.id}`} className="underline">Abrir</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Nenhum caso cadastrado.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
