import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { getAuthSession } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { statusLabels, violationLabels } from "@/app/types";

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [total, byStatus, byType] = await Promise.all([
    prisma.caso.count({ where: { userId: session.user.id } }),
    prisma.caso.groupBy({ by: ["status"], where: { userId: session.user.id }, _count: true }),
    prisma.caso.groupBy({ by: ["tipoViolacao"], where: { userId: session.user.id }, _count: true }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-zinc-500">Total de casos</p>
          <p className="text-3xl font-semibold">{total}</p>
        </Card>
        <Card>
          <p className="mb-2 text-sm text-zinc-500">Por status</p>
          <ul className="space-y-1 text-sm">
            {byStatus.map((item) => (
              <li key={item.status}>
                {statusLabels[item.status]}: {item._count}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <p className="mb-2 text-sm text-zinc-500">Por tipo</p>
          <ul className="space-y-1 text-sm">
            {byType.map((item) => (
              <li key={item.tipoViolacao}>
                {violationLabels[item.tipoViolacao]}: {item._count}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
