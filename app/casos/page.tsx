"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CasoTable } from "@/components/casos/caso-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCasos } from "@/hooks/useCasos";
import { VIOLATION_LABELS } from "@/types";

const PAGE_SIZE = 10;

export default function CasosPage() {
  const { casos, loading, exportJson } = useCasos();
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return casos.filter((caso) => {
      if (statusFilter !== "all" && caso.status !== statusFilter) return false;
      if (typeFilter !== "all" && caso.violationType !== typeFilter) return false;
      if (severityFilter !== "all" && String(caso.severity) !== severityFilter) return false;
      if (query && !caso.username.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [casos, query, severityFilter, statusFilter, typeFilter]);

  const maxPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const doExport = async () => {
    const content = await exportJson();
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `safereport-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Casos de denúncia</CardTitle>
          <Button onClick={() => void doExport()} type="button">Exportar JSON</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Input placeholder="Buscar por username" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Todos status</option>
              <option value="pendente">Pendente</option>
              <option value="enviado">Enviado</option>
              <option value="resolvido">Resolvido</option>
            </Select>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">Todos tipos</option>
              {Object.entries(VIOLATION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
            <Select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              <option value="all">Todas gravidades</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
          </div>

          {loading ? <p>Carregando...</p> : <CasoTable casos={paged} />}

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} type="button">Anterior</Button>
            <span className="text-sm">Página {page} de {maxPage}</span>
            <Button variant="outline" onClick={() => setPage((p) => Math.min(maxPage, p + 1))} disabled={page >= maxPage} type="button">Próxima</Button>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
