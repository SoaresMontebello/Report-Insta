"use client";

import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/casos/status-badge";
import { VIOLATION_LABELS } from "@/types";
import type { Caso } from "@/types";

export function CasoTable({ casos }: { casos: Caso[] }) {
  if (!casos.length) {
    return <p className="text-sm text-slate-500">Nenhum caso encontrado.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Gravidade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {casos.map((caso) => (
            <TableRow key={caso.id}>
              <TableCell>@{caso.username}</TableCell>
              <TableCell>{VIOLATION_LABELS[caso.violationType]}</TableCell>
              <TableCell>{caso.severity}</TableCell>
              <TableCell>
                <StatusBadge status={caso.status} />
              </TableCell>
              <TableCell>{caso.dateFound}</TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/casos/${caso.id}`}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm hover:bg-slate-100"
                >
                  Abrir
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
