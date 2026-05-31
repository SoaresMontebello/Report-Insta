import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { logError } from "@/app/lib/logger";

function handleMissingAuthSecret(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Configuração de autenticação ausente." }, { status: 503 });
  }

  return NextResponse.redirect(new URL("/login", req.url));
}

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    logError("middleware_missing_nextauth_secret", new Error("NEXTAUTH_SECRET is missing"), {
      path: req.nextUrl.pathname,
    });
    return handleMissingAuthSecret(req);
  }

  const token = await getToken({ req, secret });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/casos/:path*", "/api/casos/:path*", "/api/upload/:path*"],
};
