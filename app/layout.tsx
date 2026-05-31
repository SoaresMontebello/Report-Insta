import type { Metadata } from "next";

import { Providers } from "@/app/components/providers";
import { TopNav } from "@/app/components/top-nav";
import { validateRequiredEnv } from "@/app/lib/env";

import "./globals.css";

validateRequiredEnv({ ignore: ["NEXTAUTH_SECRET"] });

export const metadata: Metadata = {
  title: "SafeReport v2",
  description: "Organização ética de denúncias sem automação.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="bg-zinc-50 text-zinc-900">
        <Providers>
          <TopNav />
          <main className="mx-auto w-full max-w-6xl p-4">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
