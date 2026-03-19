import { NextResponse } from 'next/server';
import { env } from 'process';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/generated/prisma/client';
import { LeadChannel } from '@/generated/prisma/enums';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
});

function isAuthorized(req: Request): boolean {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.slice('Bearer '.length);
  return token === env.API_PASSWORD;
}

function isValidEnumValue<T extends Record<string, string>>(
  enumObject: T,
  value: unknown
): value is T[keyof T] {
  return typeof value === 'string' && Object.values(enumObject).includes(value);
}

export async function GET(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = Math.max(Number(url.searchParams.get('page') || '1'), 1);
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || '20'), 1), 100);
    const channel = url.searchParams.get('channel');
    const propertyId = url.searchParams.get('propertyId');
    const search = url.searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (isValidEnumValue(LeadChannel, channel)) {
      where.channel = channel;
    }
    if (propertyId) {
      where.propertyId = propertyId;
    }
    if (search?.trim()) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, leads] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              slug: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const pages = Math.ceil(total / limit);
    return NextResponse.json({
      total,
      page,
      limit,
      pages,
      hasPrev: page > 1,
      hasNext: page < pages,
      leads,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erro ao buscar leads.',
        detail: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
