export interface PropertyImage {
  src: string
  alt: string
  width: number
  height: number
}

export interface Property {
  id: string
  slug: string
  title: string
  purpose: 'venda' | 'aluguel'
  type: 'casa' | 'apartamento' | 'terreno' | 'rural' | 'comercial'
  city: 'Corumbá' | 'Ladário'
  citySlug: 'corumba' | 'ladario'
  neighborhood: string
  price: number
  priceSuffix?: string
  priceNote?: string
  shortDescription: string
  longDescription: string
  bedrooms?: number | null
  bathrooms?: number | null
  parkingSpaces?: number | null
  totalArea: number
  builtArea?: number | null
  coverImage: string
  gallery: PropertyImage[]
  featured: boolean
  specialOpportunity: boolean
  tags: string[]
  status: 'disponivel' | 'reservado' | 'vendido' | 'alugado'
  whatsappMessage: string
  createdAt: string
  updatedAt: string
}

export type PropertyPurpose = Property['purpose']
export type PropertyType = Property['type']
export type PropertyCity = Property['city']
export type PropertyStatus = Property['status']

export interface PropertyFilter {
  purpose?: PropertyPurpose
  type?: PropertyType
  citySlug?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  featured?: boolean
  specialOpportunity?: boolean
  status?: PropertyStatus
  search?: string
}

export interface CategoryMeta {
  slug: string
  title: string
  description: string
  filter: PropertyFilter
}

export interface PaginatedResult<T> {
  items: T[]
  page: number
  limit: number
  total: number
  pages: number
  hasPrev: boolean
  hasNext: boolean
}

export type PaginatedProperties = PaginatedResult<Property>
