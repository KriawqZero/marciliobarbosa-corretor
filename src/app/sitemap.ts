import type { MetadataRoute } from 'next'
import { getProperties } from '@/data/services/properties'
import { CATEGORIES, VALID_CATEGORIES } from '@/lib/constants'
import { SITE_URL, getAbsoluteUrl } from '@/lib/metadata'
import type { Property, PropertyFilter } from '@/types'

/// Mesma regra de filtragem do banco, aplicada em memória. As categorias usam
/// só estes quatro campos; os outros do `PropertyFilter` vêm da URL e nunca de
/// uma categoria.
function matchesFilter(property: Property, filter: PropertyFilter): boolean {
  if (filter.purpose && property.purpose !== filter.purpose) return false
  if (filter.type && property.type !== filter.type) return false
  if (filter.citySlug && property.citySlug !== filter.citySlug) return false
  if (
    filter.specialOpportunity !== undefined &&
    property.specialOpportunity !== filter.specialOpportunity
  ) {
    return false
  }
  return true
}

/// Gerado a cada requisição, de propósito.
///
/// Com cache, o sitemap ficaria congelado no estado do banco no momento do
/// build — e um build sem acesso ao banco publicaria um sitemap vazio, que é o
/// pior resultado possível: o buscador conclui que o site não tem páginas. O
/// sitemap é buscado poucas vezes por dia; a consulta extra é barata perto
/// desse risco.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /// Um sitemap não pode derrubar o deploy: se o banco estiver fora do ar, é
  /// melhor entregar as páginas fixas do que devolver 500 ao Googlebot — erro
  /// repetido no sitemap faz o buscador reduzir a frequência de rastreio.
  const properties = await getProperties().catch(() => [])

  /// `lastModified` das páginas fixas acompanha o imóvel mais recente: o
  /// conteúdo delas é o catálogo. Carimbar `new Date()` faria o sitemap
  /// declarar mudança a cada leitura, e o buscador aprende a ignorar o campo.
  const latestChange = properties.reduce<Date>((latest, property) => {
    const updated = new Date(property.updatedAt)
    return updated > latest ? updated : latest
  }, new Date(0))

  const catalogLastModified =
    latestChange.getTime() > 0 ? latestChange : new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: catalogLastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/imoveis`,
      lastModified: catalogLastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/sobre`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contato`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]

  /// Só entram as categorias que têm ao menos um imóvel.
  ///
  /// Sitemap é uma recomendação de leitura: listar página vazia gasta a cota do
  /// robô e ensina que o sitemap deste site aponta para lugar sem conteúdo. A
  /// contagem sai da lista já carregada acima — nenhuma consulta a mais.
  const categoryPages: MetadataRoute.Sitemap = VALID_CATEGORIES.filter((slug) =>
    properties.some((property) => matchesFilter(property, CATEGORIES[slug].filter)),
  ).map((slug) => ({
    url: `${SITE_URL}/imoveis/${slug}`,
    lastModified: catalogLastModified,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const propertyPages: MetadataRoute.Sitemap = properties.map((property) => ({
    url: `${SITE_URL}/imovel/${property.slug}`,
    lastModified: new Date(property.updatedAt),
    changeFrequency: 'weekly' as const,
    /// Oportunidade especial ganha prioridade relativa: são os anúncios que o
    /// corretor mais quer girar e os que saem mais rápido do acervo.
    priority: property.specialOpportunity ? 0.9 : 0.7,
    /// Sitemap de imagens. É o caminho oficial para as fotos entrarem no Google
    /// Imagens, que num site de imóveis traz busca por aparência do imóvel e
    /// não só por texto. As fotos ficam em outro domínio (`media.`), então sem
    /// esta declaração o rastreador teria que descobri-las só pelo HTML.
    images: (property.gallery?.length
      ? property.gallery.map((image) => image.src)
      : [property.coverImage]
    )
      .filter(Boolean)
      .map((src) => getAbsoluteUrl(src)),
  }))

  return [...staticPages, ...categoryPages, ...propertyPages]
}
