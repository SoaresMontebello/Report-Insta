import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="h-5 w-5" />
            SafeReport
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/">Dashboard</Link>
            <Link href="/casos">Casos</Link>
            <Link href="/casos/novo">Novo caso</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
