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
  /// Título/descrição usados só na aba do navegador e no resultado de busca.
  /// Separados de `title`/`description` porque o H1 da página precisa ser curto
  /// e o title do buscador precisa carregar cidade e intenção ("à venda em
  /// Corumbá-MS"), que ficariam pesados no cabeçalho visual.
  seoTitle?: string
  seoDescription?: string
  keywords?: string[]
  /// Texto de abertura da página, em parágrafos. Uma página de catálogo sem
  /// texto próprio é só uma grade de fotos: não há o que ler nem o que
  /// ranquear. Estes parágrafos são a única parte da página que fala a língua
  /// de quem está pesquisando.
  intro?: string[]
  /// Categoria derivada de outra (ex.: "casas à venda em Corumbá" nasce de
  /// "casas"). Serve para montar a trilha de navegação e os links internos.
  parent?: string
  /// Mensagem quando a categoria não tem nenhum imóvel. As categorias vazias
  /// continuam visíveis, então a página precisa explicar e dar uma saída.
  emptyTitle?: string
  emptyDescription?: string
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
