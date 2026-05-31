import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/app/lib/prisma";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().trim().max(120).optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parseResult = registerSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { email, password, name } = parseResult.data;

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existingUser) {
    return NextResponse.json({ error: "Usuário já existe." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      passwordHash,
      name,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
