import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAuthSession } from "@/app/lib/auth";
import { formatDate } from "@/app/lib/utils";
import { prisma } from "@/app/lib/prisma";
import { statusLabels, violationLabels } from "@/app/types";

export default async function CasesPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const cases = await prisma.caso.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { anexos: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Casos</h1>
        <Link href="/casos/novo">
          <Button>Novo caso</Button>
        </Link>
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-100">
            <tr>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Data</th>
              <th className="px-4 py-2">Anexos</th>
              <th className="px-4 py-2">Ação</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((item) => (
              <tr key={item.id} className="border-t border-zinc-200">
                <td className="px-4 py-2">@{item.username}</td>
                <td className="px-4 py-2">{violationLabels[item.tipoViolacao]}</td>
                <td className="px-4 py-2">
                  <Badge>{statusLabels[item.status]}</Badge>
                </td>
                <td className="px-4 py-2">{formatDate(item.dataEncontro)}</td>
                <td className="px-4 py-2">{item._count.anexos}</td>
                <td className="px-4 py-2">
                  <Link href={`/casos/${item.id}`} className="underline">
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
            {cases.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-zinc-500" colSpan={6}>
                  Nenhum caso cadastrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
