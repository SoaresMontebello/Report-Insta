import { Badge } from "@/components/ui/badge";
import type { StatusCaso } from "@/types";

const variants: Record<StatusCaso, "secondary" | "warning" | "success"> = {
  pendente: "warning",
  enviado: "secondary",
  resolvido: "success",
};

const labels: Record<StatusCaso, string> = {
  pendente: "Pendente",
  enviado: "Enviado",
  resolvido: "Resolvido",
};

export function StatusBadge({ status }: { status: StatusCaso }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
