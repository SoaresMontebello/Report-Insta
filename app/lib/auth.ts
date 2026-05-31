import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { getEnv } from "@/app/lib/env";
import {
  clearLoginFailures,
  createLoginRateLimitKey,
  isLoginRateLimited,
  registerLoginFailure,
} from "@/app/lib/login-rate-limit";
import { logWarn } from "@/app/lib/logger";
import { prisma } from "@/app/lib/prisma";

function readHeaderValue(
  request: { headers?: Headers | Record<string, string | string[] | undefined> } | undefined,
  name: string,
) {
  const headers = request?.headers;

  if (!headers) {
    return undefined;
  }

  if (headers instanceof Headers) {
    return headers.get(name) ?? undefined;
  }

  const value = headers[name];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function getClientIp(
  request: { headers?: Headers | Record<string, string | string[] | undefined> } | undefined,
) {
  const realIp = readHeaderValue(request, "x-real-ip");

  if (realIp) {
    return realIp.trim();
  }

  const forwardedFor = readHeaderValue(request, "x-forwarded-for");

  if (!forwardedFor) {
    return undefined;
  }

  return forwardedFor.split(",")[0]?.trim();
}

export const authOptions: NextAuthOptions = {
  secret: getEnv("NEXTAUTH_SECRET"),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();
        const rateLimitKey = createLoginRateLimitKey(normalizedEmail, getClientIp(request));

        if (isLoginRateLimited(rateLimitKey)) {
          logWarn("login_rate_limited", { email: normalizedEmail });
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) {
          registerLoginFailure(rateLimitKey);
          return null;
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValidPassword) {
          registerLoginFailure(rateLimitKey);
          return null;
        }

        clearLoginFailures(rateLimitKey);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
};

export function getAuthSession() {
  return getServerSession(authOptions);
}
