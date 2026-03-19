import type { Property, PropertyFilter, CategoryMeta, PaginatedProperties } from '@/types'
import { mockProperties } from '@/data/mocks/properties'
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

function matchesFilter(property: Property, filter: PropertyFilter): boolean {
  if (filter.purpose && property.purpose !== filter.purpose) return false
  if (filter.type && property.type !== filter.type) return false
  if (filter.citySlug && property.citySlug !== filter.citySlug) return false
  if (filter.minPrice && property.price < filter.minPrice) return false
  if (filter.maxPrice && property.price > filter.maxPrice) return false
  if (filter.bedrooms && (!property.bedrooms || property.bedrooms < filter.bedrooms))
    return false
  if (filter.featured !== undefined && property.featured !== filter.featured)
    return false
  if (
    filter.specialOpportunity !== undefined &&
    property.specialOpportunity !== filter.specialOpportunity
  )
    return false
  if (filter.status && property.status !== filter.status) return false
  if (filter.search) {
    const q = filter.search.toLowerCase()
    const searchable = [
      property.title,
      property.shortDescription,
      property.neighborhood,
      property.city,
      ...property.tags,
    ]
      .join(' ')
      .toLowerCase()
    if (!searchable.includes(q)) return false
  }
  return true
}

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
  if (!prisma) {
    if (!filter) return mockProperties.filter((p) => p.status === 'disponivel')
    return mockProperties.filter(
      (p) => p.status === 'disponivel' && matchesFilter(p, filter),
    )
  }

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
  if (!prisma) return mockProperties.find((p) => p.slug === slug) ?? null

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
  if (!prisma) {
    return mockProperties.filter((p) => p.featured && p.status === 'disponivel')
  }

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

export async function getSpecialOpportunities(): Promise<Property[]> {
  if (!prisma) {
    return mockProperties.filter(
      (p) => p.specialOpportunity && p.status === 'disponivel',
    )
  }

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
  if (!prisma) {
    return mockProperties
      .filter(
        (p) =>
          p.id !== property.id &&
          p.status === 'disponivel' &&
          (p.citySlug === property.citySlug || p.type === property.type),
      )
      .slice(0, limit)
  }

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

  if (!prisma) {
    // Paginação para fallback/mock
    const props = filter
      ? mockProperties.filter((p) => p.status === 'disponivel' && matchesFilter(p, filter))
      : mockProperties.filter((p) => p.status === 'disponivel')

    const sorted =
      options?.order === 'preco_asc'
        ? [...props].sort((a, b) => a.price - b.price)
        : options?.order === 'preco_desc'
          ? [...props].sort((a, b) => b.price - a.price)
          : props

    const total = sorted.length
    const pages = Math.ceil(total / limit)
    const start = (page - 1) * limit
    const items = sorted.slice(start, start + limit)

    return {
      items,
      page,
      limit,
      total,
      pages,
      hasPrev: page > 1,
      hasNext: page < pages,
    }
  }

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
