import { redirect } from "next/navigation";

import { CaseForm } from "@/app/components/case-form";
import { getAuthSession } from "@/app/lib/auth";

export default async function NewCasePage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Novo caso</h1>
      <CaseForm />
    </div>
  );
}
