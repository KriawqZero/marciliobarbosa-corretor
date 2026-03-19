import { NextResponse } from "next/server";

// Only import next/server utilities and db/prisma/utilities at top level, NEVER secrets here
// Assume prisma client is available at src/server/db/prisma and NOT globally in app/api

import { env } from "process";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcrypt";

// Caution: Use singleton or equivalent if your project wraps PrismaClient, but for this example we'll init directly.
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
});

// Strong typing for input
type CreateUserInput = {
  email: string;
  password: string;
  role?: "user" | "admin";
};

export async function POST(req: Request) {
  try {
    const data: CreateUserInput = await req.json();

    const authHeader = req.headers.get("Authorization");
    let apiPassword: string | null = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      apiPassword = authHeader.slice("Bearer ".length);
    }

    if (apiPassword !== env.API_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Simple input validation
    if (
      typeof data?.email !== "string" ||
      !data.email.includes("@") ||
      typeof data?.password !== "string" ||
      data.password.length < 8
    ) {
      return NextResponse.json(
        { error: "E-mail inválido ou senha muito curta (mínimo 8 caracteres)." },
        { status: 400 }
      );
    }

    // Check for existing user
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "Usuário já cadastrado." }, { status: 409 });
    }

    // Hash the password securely
    const passwordHash = await hash(data.password, Number(env.BCRYPT_SALT_ROUNDS));

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role, // Default to "user"
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar usuário.", detail: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
