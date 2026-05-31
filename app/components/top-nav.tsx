"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function TopNav() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold">
          SafeReport v2
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/casos" className="hover:underline">
            Casos
          </Link>
          <Link href="/casos/novo" className="hover:underline">
            Novo caso
          </Link>
          {session?.user ? (
            <Button variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>
              Sair
            </Button>
          ) : (
            <Link href="/login" className="hover:underline">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
