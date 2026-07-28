'use server';
import { unstable_cache } from 'next/cache'
import type { Property, PropertyFilter, CategoryMeta, PaginatedProperties } from '@/types'
import { CATEGORIES, PROPERTIES_CACHE_TAG } from '@/lib/constants'
import { isRealNeighborhood } from '@/lib/format'
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

/// Todas as leituras públicas do catálogo passam pelo cache de dados do Next.
///
/// As páginas continuam `force-dynamic` (ver comentário na home sobre o build
/// sem banco), mas cada visita fazia todas as consultas de novo mesmo sem nada
/// ter mudado — e imóvel muda poucas vezes por semana, não por requisição. Com
/// o cache, o banco só é consultado quando uma entrada expira ou é invalidada.
///
/// A tag única cobre o catálogo inteiro: qualquer escrita derruba todas as
/// entradas de uma vez via `revalidateTag` em `revalidatePropertyRoutes`. O
/// `revalidate` de 10 minutos é rede de segurança para mudanças feitas fora do
/// app (direto no banco), que não passam pelo fluxo de revalidação.
///
/// Os argumentos de cada função entram na chave do cache automaticamente, por
/// isso filtros e paginação diferentes não se misturam.
const CACHE_OPTIONS = { tags: [PROPERTIES_CACHE_TAG], revalidate: 600 }

const getPropertiesCached = unstable_cache(
  async (filter?: PropertyFilter) => {
    const where = buildPrismaWhere(filter)
    const properties = await prisma!.property.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    })

    return properties.map(serializeProperty)
  },
  ['properties-list'],
  CACHE_OPTIONS,
)

export async function getProperties(
  filter?: PropertyFilter,
): Promise<Property[]> {
  if (!prisma) return Promise.reject(new Error('Database not configured'))
  return getPropertiesCached(filter)
}

const getPropertyBySlugCached = unstable_cache(
  async (slug: string) => {
    const property = await prisma!.property.findFirst({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
      },
    })

    if (!property) return null
    return serializeProperty(property)
  },
  ['property-by-slug'],
  CACHE_OPTIONS,
)

export async function getPropertyBySlug(
  slug: string,
): Promise<Property | null> {
  if (!prisma) return Promise.reject(new Error('Database not configured'))
  return getPropertyBySlugCached(slug)
}

const getFeaturedPropertiesCached = unstable_cache(
  async () => {
    const properties = await prisma!.property.findMany({
      where: { featured: true, status: PropertyStatus.disponivel },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: [{ createdAt: 'desc' }],
      take: 50,
    })

    return properties.map(serializeProperty)
  },
  ['featured-properties'],
  CACHE_OPTIONS,
)

export async function getFeaturedProperties(): Promise<Property[]> {
  if (!prisma) return Promise.reject(new Error('Database not configured'))
  return getFeaturedPropertiesCached()
}

const getRecentPropertiesCached = unstable_cache(
  async (limit: number) => {
    const properties = await prisma!.property.findMany({
      where: { status: PropertyStatus.disponivel },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: [{ createdAt: 'desc' }],
      take: limit,
    })

    return properties.map(serializeProperty)
  },
  ['recent-properties'],
  CACHE_OPTIONS,
)

/// Imóveis mais recentes disponíveis. Substitui o conceito de "destaque" na home:
/// não depende de ninguém lembrar de marcar nada no app.
export async function getRecentProperties(limit = 6): Promise<Property[]> {
  if (!prisma) return Promise.reject(new Error('Database not configured'))
  return getRecentPropertiesCached(limit)
}

export interface CatalogCounts {
  total: number
  byType: Record<string, number>
  byCity: Record<string, number>
}

const getCatalogCountsCached = unstable_cache(
  async () => {
    const where = { status: PropertyStatus.disponivel }

    const [total, byTypeRows, byCityRows] = await Promise.all([
      prisma!.property.count({ where }),
      prisma!.property.groupBy({ by: ['type'], where, _count: { _all: true } }),
      prisma!.property.groupBy({
        by: ['citySlug'],
        where,
        _count: { _all: true },
      }),
    ])

    const byType: Record<string, number> = {}
    for (const row of byTypeRows) byType[row.type] = row._count._all

    const byCity: Record<string, number> = {}
    for (const row of byCityRows) byCity[row.citySlug] = row._count._all

    return { total, byType, byCity }
  },
  ['catalog-counts'],
  CACHE_OPTIONS,
)

/// Contagens reais do catálogo, para a home não prometer o que não existe.
export async function getCatalogCounts(): Promise<CatalogCounts> {
  if (!prisma) return Promise.reject(new Error('Database not configured'))
  return getCatalogCountsCached()
}

const getSpecialOpportunitiesCached = unstable_cache(
  async () => {
    const properties = await prisma!.property.findMany({
      where: { specialOpportunity: true, status: PropertyStatus.disponivel },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: [{ createdAt: 'desc' }],
      take: 50,
    })

    return properties.map(serializeProperty)
  },
  ['special-opportunities'],
  CACHE_OPTIONS,
)

export async function getSpecialOpportunities(): Promise<Property[]> {
  if (!prisma) return Promise.reject(new Error('Database not configured'))
  return getSpecialOpportunitiesCached()
}

/// Recebe só os campos que entram na consulta — não o `Property` inteiro —
/// para a chave do cache ficar pequena e estável.
const getRelatedPropertiesCached = unstable_cache(
  async (
    id: string,
    citySlug: Property['citySlug'],
    type: Property['type'],
    limit: number,
  ) => {
    const related = await prisma!.property.findMany({
      where: {
        id: { not: id },
        status: PropertyStatus.disponivel,
        OR: [{ citySlug }, { type: type as PropertyType }],
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: [{ createdAt: 'desc' }],
      take: limit,
    })

    return related.map(serializeProperty)
  },
  ['related-properties'],
  CACHE_OPTIONS,
)

export async function getRelatedProperties(
  property: Property,
  limit = 3,
): Promise<Property[]> {
  if (!prisma) return Promise.reject(new Error('Database not configured'))
  return getRelatedPropertiesCached(
    property.id,
    property.citySlug,
    property.type,
    limit,
  )
}

export async function getPropertyCategories(): Promise<CategoryMeta[]> {
  return Object.values(CATEGORIES)
}

const getPropertiesCountCached = unstable_cache(
  async (filter?: PropertyFilter) => {
    const where = buildPrismaWhere(filter)
    return prisma!.property.count({ where })
  },
  ['properties-count'],
  CACHE_OPTIONS,
)

export async function getPropertiesCount(
  filter?: PropertyFilter,
): Promise<number> {
  if (!prisma) {
    const props = await getProperties(filter)
    return props.length
  }

  return getPropertiesCountCached(filter)
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
/// Uma consulta só, trazendo apenas as duas colunas necessárias, e passando
/// pelo mesmo cache das demais leituras do catálogo.
const getCategoryFacetsCached = unstable_cache(
  async (filter?: PropertyFilter): Promise<CategoryFacets> => {
    const rows = await prisma!.property.findMany({
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
          .filter(isRealNeighborhood),
      ),
    ).sort((a, b) => a.localeCompare(b, 'pt-BR'))

    return {
      total: rows.length,
      minPrice: prices.length > 0 ? Math.min(...prices) : null,
      maxPrice: prices.length > 0 ? Math.max(...prices) : null,
      neighborhoods,
    }
  },
  ['category-facets'],
  CACHE_OPTIONS,
)

export async function getCategoryFacets(
  filter?: PropertyFilter,
): Promise<CategoryFacets> {
  if (!prisma) return Promise.reject(new Error('Database not configured'))
  return getCategoryFacetsCached(filter)
}

/// Bairros já usados no acervo, para a lista de sugestões do cadastro.
///
/// A lista sai do próprio banco, e não de um cadastro fixo de bairros: assim
/// não há nome inventado, e ela melhora sozinha conforme os imóveis são
/// cadastrados.
const getUsedNeighborhoodsCached = unstable_cache(
  async (citySlug?: string): Promise<string[]> => {
    const rows = await prisma!.property.findMany({
      where: citySlug ? { citySlug } : undefined,
      select: { neighborhood: true },
      distinct: ['neighborhood'],
    })

    return rows
      .map((row) => row.neighborhood?.trim())
      .filter(isRealNeighborhood)
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
  },
  ['used-neighborhoods'],
  CACHE_OPTIONS,
)

export async function getUsedNeighborhoods(
  citySlug?: string,
): Promise<string[]> {
  if (!prisma) return Promise.reject(new Error('Database not configured'))
  return getUsedNeighborhoodsCached(citySlug)
}

const getPropertiesPagedCached = unstable_cache(
  async (
    filter: PropertyFilter | undefined,
    page: number,
    limit: number,
    order?: 'preco_asc' | 'preco_desc',
  ) => {
    const where = buildPrismaWhere(filter)
    const [total, properties] = await Promise.all([
      prisma!.property.count({ where }),
      prisma!.property.findMany({
        where,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
        },
        orderBy:
          order === 'preco_asc'
            ? [{ price: 'asc' }]
            : order === 'preco_desc'
              ? [{ price: 'desc' }]
              : [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    return { total, items: properties.map(serializeProperty) }
  },
  ['properties-paged'],
  CACHE_OPTIONS,
)

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

  const { total, items } = await getPropertiesPagedCached(
    filter,
    page,
    limit,
    options?.order,
  )

  const pages = Math.ceil(total / limit)
  const hasPrev = page > 1
  const hasNext = page < pages

  return {
    items,
    page,
    limit,
    total,
    pages,
    hasPrev,
    hasNext,
  }
}
