"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function DeleteCaseButton({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function onDelete() {
    const confirmed = window.confirm("Tem certeza que deseja excluir este caso?");
    if (!confirmed) return;

    setIsDeleting(true);

    const response = await fetch(`/api/casos/${caseId}`, {
      method: "DELETE",
    });

    setIsDeleting(false);

    if (!response.ok) {
      window.alert("Não foi possível excluir o caso.");
      return;
    }

    router.push("/casos");
    router.refresh();
  }

  return (
    <Button variant="destructive" onClick={onDelete} disabled={isDeleting}>
      {isDeleting ? "Excluindo..." : "Excluir caso"}
    </Button>
  );
}
