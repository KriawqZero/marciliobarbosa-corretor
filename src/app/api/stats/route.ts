import { NextResponse } from 'next/server';
import { env } from 'process';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
});

function isAuthorized(req: Request): boolean {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.slice('Bearer '.length);
  return token === env.API_PASSWORD;
}

export async function GET(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalProperties,
      statusCounts,
      typeCounts,
      purposeCounts,
      featured,
      specialOpportunity,
      leadsTotal,
      leads7,
      leads30,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.property.groupBy({
        by: ['type'],
        _count: { _all: true },
      }),
      prisma.property.groupBy({
        by: ['purpose'],
        _count: { _all: true },
      }),
      prisma.property.count({ where: { featured: true } }),
      prisma.property.count({ where: { specialOpportunity: true } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: last7Days } } }),
      prisma.lead.count({ where: { createdAt: { gte: last30Days } } }),
    ]);

    return NextResponse.json({
      properties: {
        total: totalProperties,
        byStatus: {
          disponivel: statusCounts.find((item) => item.status === 'disponivel')?._count._all ?? 0,
          reservado: statusCounts.find((item) => item.status === 'reservado')?._count._all ?? 0,
          vendido: statusCounts.find((item) => item.status === 'vendido')?._count._all ?? 0,
          alugado: statusCounts.find((item) => item.status === 'alugado')?._count._all ?? 0,
        },
        byType: {
          casa: typeCounts.find((item) => item.type === 'casa')?._count._all ?? 0,
          apartamento: typeCounts.find((item) => item.type === 'apartamento')?._count._all ?? 0,
          terreno: typeCounts.find((item) => item.type === 'terreno')?._count._all ?? 0,
          rural: typeCounts.find((item) => item.type === 'rural')?._count._all ?? 0,
          comercial: typeCounts.find((item) => item.type === 'comercial')?._count._all ?? 0,
        },
        byPurpose: {
          venda: purposeCounts.find((item) => item.purpose === 'venda')?._count._all ?? 0,
          aluguel: purposeCounts.find((item) => item.purpose === 'aluguel')?._count._all ?? 0,
        },
        featured,
        specialOpportunity,
      },
      leads: {
        total: leadsTotal,
        last7Days: leads7,
        last30Days: leads30,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erro ao buscar estatisticas.',
        detail: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
