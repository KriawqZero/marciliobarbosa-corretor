import type { Property, PropertyFilter, CategoryMeta } from '@/types'
import { mockProperties } from '@/data/mocks/properties'
import { CATEGORIES } from '@/lib/constants'

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

export async function getProperties(
  filter?: PropertyFilter,
): Promise<Property[]> {
  if (!filter) return mockProperties.filter((p) => p.status === 'disponivel')
  return mockProperties.filter(
    (p) => p.status === 'disponivel' && matchesFilter(p, filter),
  )
}

export async function getPropertyBySlug(
  slug: string,
): Promise<Property | null> {
  return mockProperties.find((p) => p.slug === slug) ?? null
}

export async function getFeaturedProperties(): Promise<Property[]> {
  return mockProperties.filter(
    (p) => p.featured && p.status === 'disponivel',
  )
}

export async function getSpecialOpportunities(): Promise<Property[]> {
  return mockProperties.filter(
    (p) => p.specialOpportunity && p.status === 'disponivel',
  )
}

export async function getRelatedProperties(
  property: Property,
  limit = 3,
): Promise<Property[]> {
  return mockProperties
    .filter(
      (p) =>
        p.id !== property.id &&
        p.status === 'disponivel' &&
        (p.citySlug === property.citySlug || p.type === property.type),
    )
    .slice(0, limit)
}

export async function getPropertyCategories(): Promise<CategoryMeta[]> {
  return Object.values(CATEGORIES)
}

export async function getPropertiesCount(
  filter?: PropertyFilter,
): Promise<number> {
  const props = await getProperties(filter)
  return props.length
}
