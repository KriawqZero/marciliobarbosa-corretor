'use server';
import type { Property, PropertyFilter, CategoryMeta, PaginatedProperties } from '@/types'
import { CATEGORIES } from '@/lib/constants'
import { env } from 'process'
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  PropertyCity,
  PropertyPurpose,
  PropertyStatus,
  PropertyType,
} from '@/generated/prisma/enums'

const prisma =
  typeof env.DATABASE_URL === 'string' && env.DATABASE_URL.length > 0
    ? new PrismaClient({
        adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
      })
    : null

function cityToLabel(city: PropertyCity): Property['city'] {
  switch (city) {
    case PropertyCity.corumba:
      return 'Corumbá'
    case PropertyCity.ladario:
      return 'Ladário'
    default:
      return 'Corumbá'
  }
}

type PrismaPropertyImage = {
  src: string
  alt: string
  width: number
  height: number
}

type PrismaPropertyWithImages = {
  id: string
  slug: string
  title: string
  purpose: PropertyPurpose
  type: PropertyType
  city: PropertyCity
  citySlug: string
  neighborhood: string
  price: number
  priceSuffix: string | null
  priceNote: string | null
  shortDescription: string
  longDescription: string
  bedrooms: number | null
  bathrooms: number | null
  parkingSpaces: number | null
  totalArea: number
  builtArea: number | null
  coverImageUrl: string
  featured: boolean
  specialOpportunity: boolean
  tags: string[]
  status: PropertyStatus
  whatsappMessage: string
  createdAt: Date
  updatedAt: Date
  images: PrismaPropertyImage[]
}

function serializeProperty(property: PrismaPropertyWithImages): Property {
  return {
    id: String(property.id),
    slug: property.slug,
    title: property.title,
    purpose: property.purpose,
    type: property.type,
    city: cityToLabel(property.city as PropertyCity),
    citySlug: property.citySlug as 'corumba' | 'ladario',
    neighborhood: property.neighborhood,
    price: Number(property.price),
    priceSuffix: property.priceSuffix ?? undefined,
    priceNote: property.priceNote ?? undefined,
    shortDescription: property.shortDescription,
    longDescription: property.longDescription,
    bedrooms: property.bedrooms ?? null,
    bathrooms: property.bathrooms ?? null,
    parkingSpaces: property.parkingSpaces ?? null,
    totalArea: Number(property.totalArea),
    builtArea: property.builtArea ?? null,
    coverImage: property.coverImageUrl,
    gallery: (property.images ?? []).map((img) => ({
      src: img.src,
      alt: img.alt,
      width: Number(img.width),
      height: Number(img.height),
    })),
    featured: Boolean(property.featured),
    specialOpportunity: Boolean(property.specialOpportunity),
    tags: Array.isArray(property.tags) ? property.tags : [],
    status: property.status,
    whatsappMessage: property.whatsappMessage,
    createdAt: property.createdAt instanceof Date
      ? property.createdAt.toISOString()
      : String(property.createdAt),
    updatedAt: property.updatedAt instanceof Date
      ? property.updatedAt.toISOString()
      : String(property.updatedAt),
  }
}

function buildPrismaWhere(filter?: PropertyFilter) {
  const where: Record<string, unknown> = {
    status: PropertyStatus.disponivel,
  }

  if (!filter) return where

  if (filter.purpose) where.purpose = filter.purpose as PropertyPurpose
  if (filter.type) where.type = filter.type as PropertyType
  if (filter.citySlug) where.citySlug = filter.citySlug

  if (filter.featured !== undefined) where.featured = filter.featured
  if (filter.specialOpportunity !== undefined)
    where.specialOpportunity = filter.specialOpportunity

  if (filter.minPrice || filter.maxPrice) {
    where.price = {
      ...(filter.minPrice ? { gte: filter.minPrice } : {}),
      ...(filter.maxPrice ? { lte: filter.maxPrice } : {}),
    }
  }

  if (typeof filter.bedrooms === 'number' && filter.bedrooms > 0) {
    where.bedrooms = { gte: filter.bedrooms }
  }

  if (filter.search) {
    const q = filter.search.toLowerCase()
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { neighborhood: { contains: q, mode: 'insensitive' } },
      { shortDescription: { contains: q, mode: 'insensitive' } },
      { tags: { hasSome: [q] } },
    ]
  }

  return where
}

export async function getProperties(
  filter?: PropertyFilter,
): Promise<Property[]> {
  if (!prisma) return Promise.reject(new Error('Database not configured'))

  const where = buildPrismaWhere(filter)
  const properties = await prisma.property.findMany({
    where,
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
    },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  })

  return properties.map(serializeProperty)
}

export async function getPropertyBySlug(
  slug: string,
): Promise<Property | null> {
  if (!prisma) return Promise.reject(new Error('Database not configured'))

  const property = await prisma.property.findFirst({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!property) return null
  return serializeProperty(property)
}

export async function getFeaturedProperties(): Promise<Property[]> {
  if (!prisma) return Promise.reject(new Error('Database not configured'))

  const properties = await prisma.property.findMany({
    where: { featured: true, status: PropertyStatus.disponivel },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
    },
    orderBy: [{ createdAt: 'desc' }],
    take: 50,
  })

  return properties.map(serializeProperty)
}

/// Imóveis mais recentes disponíveis. Substitui o conceito de "destaque" na home:
/// não depende de ninguém lembrar de marcar nada no app.
export async function getRecentProperties(limit = 6): Promise<Property[]> {
  if (!prisma) return Promise.reject(new Error('Database not configured'))

  const properties = await prisma.property.findMany({
    where: { status: PropertyStatus.disponivel },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
    },
    orderBy: [{ createdAt: 'desc' }],
    take: limit,
  })

  return properties.map(serializeProperty)
}

export interface CatalogCounts {
  total: number
  byType: Record<string, number>
  byCity: Record<string, number>
}

/// Contagens reais do catálogo, para a home não prometer o que não existe.
export async function getCatalogCounts(): Promise<CatalogCounts> {
  if (!prisma) return Promise.reject(new Error('Database not configured'))

  const where = { status: PropertyStatus.disponivel }

  const [total, byTypeRows, byCityRows] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.groupBy({ by: ['type'], where, _count: { _all: true } }),
    prisma.property.groupBy({ by: ['citySlug'], where, _count: { _all: true } }),
  ])

  const byType: Record<string, number> = {}
  for (const row of byTypeRows) byType[row.type] = row._count._all

  const byCity: Record<string, number> = {}
  for (const row of byCityRows) byCity[row.citySlug] = row._count._all

  return { total, byType, byCity }
}

export async function getSpecialOpportunities(): Promise<Property[]> {
  if (!prisma) return Promise.reject(new Error('Database not configured'))

  const properties = await prisma.property.findMany({
    where: { specialOpportunity: true, status: PropertyStatus.disponivel },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
    },
    orderBy: [{ createdAt: 'desc' }],
    take: 50,
  })

  return properties.map(serializeProperty)
}

export async function getRelatedProperties(
  property: Property,
  limit = 3,
): Promise<Property[]> {
  if (!prisma) return Promise.reject(new Error('Database not configured'))

  const related = await prisma.property.findMany({
    where: {
      id: { not: property.id },
      status: PropertyStatus.disponivel,
      OR: [{ citySlug: property.citySlug }, { type: property.type }],
    },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
    },
    orderBy: [{ createdAt: 'desc' }],
    take: limit,
  })

  return related.map(serializeProperty)
}

export async function getPropertyCategories(): Promise<CategoryMeta[]> {
  return Object.values(CATEGORIES)
}

export async function getPropertiesCount(
  filter?: PropertyFilter,
): Promise<number> {
  if (!prisma) {
    const props = await getProperties(filter)
    return props.length
  }

  const where = buildPrismaWhere(filter)
  return prisma.property.count({ where })
}

export interface CategoryFacets {
  total: number
  minPrice: number | null
  maxPrice: number | null
  neighborhoods: string[]
}

/// Resumo de uma categoria: quantos imóveis, de que faixa de preço e em quais
/// bairros.
///
/// Serve a duas coisas ao mesmo tempo. Para o visitante, é a resposta imediata
/// à pergunta "tem o que eu procuro e cabe no meu bolso?". Para o buscador, é o
/// único texto da página que muda conforme o acervo — sem ele, páginas de
/// categoria parecidas ficam com conteúdo quase idêntico entre si.
///
/// Uma consulta só, trazendo apenas as duas colunas necessárias.
export async function getCategoryFacets(
  filter?: PropertyFilter,
): Promise<CategoryFacets> {
  if (!prisma) return Promise.reject(new Error('Database not configured'))

  const rows = await prisma.property.findMany({
    where: buildPrismaWhere(filter),
    select: { price: true, neighborhood: true },
  })

  if (rows.length === 0) {
    return { total: 0, minPrice: null, maxPrice: null, neighborhoods: [] }
  }

  const prices = rows.map((row) => Number(row.price)).filter(Number.isFinite)
  const neighborhoods = Array.from(
    new Set(
      rows
        .map((row) => row.neighborhood?.trim())
        .filter((name): name is string => Boolean(name) && name !== 'A definir'),
    ),
  ).sort((a, b) => a.localeCompare(b, 'pt-BR'))

  return {
    total: rows.length,
    minPrice: prices.length > 0 ? Math.min(...prices) : null,
    maxPrice: prices.length > 0 ? Math.max(...prices) : null,
    neighborhoods,
  }
}

export async function getPropertiesPaged(
  filter: PropertyFilter | undefined,
  options?: {
    page?: number
    limit?: number
    order?: 'preco_asc' | 'preco_desc'
  },
): Promise<PaginatedProperties> {
  const page = options?.page && options.page > 0 ? options.page : 1
  const limit = options?.limit && options.limit > 0 ? options.limit : 12

  if (!prisma) return Promise.reject(new Error('Database not configured'))
  
  const where = buildPrismaWhere(filter)
  const [total, properties] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy:
        options?.order === 'preco_asc'
          ? [{ price: 'asc' }]
          : options?.order === 'preco_desc'
            ? [{ price: 'desc' }]
            : [{ featured: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  const pages = Math.ceil(total / limit)
  const hasPrev = page > 1
  const hasNext = page < pages

  return {
    items: properties.map(serializeProperty),
    page,
    limit,
    total,
    pages,
    hasPrev,
    hasNext,
  }
}
