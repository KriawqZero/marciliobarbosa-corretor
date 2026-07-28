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

/// Data da alteração mais recente entre um conjunto de imóveis.
function latestUpdate(properties: Property[]): Date | null {
  let latest = 0
  for (const property of properties) {
    const updated = new Date(property.updatedAt).getTime()
    if (Number.isFinite(updated) && updated > latest) latest = updated
  }
  return latest > 0 ? new Date(latest) : null
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

  /// `lastmod` só vale se for verdade. Antes, home, `/imoveis` e as 20 páginas
  /// de categoria compartilhavam o mesmo carimbo, ao milissegundo — o que
  /// denuncia data de build, e não de conteúdo. O buscador aprende a ignorar o
  /// campo quando ele se repete assim.
  ///
  /// Agora cada página declara a alteração mais recente entre os imóveis que
  /// ela realmente lista.
  const catalogLastModified = latestUpdate(properties) ?? new Date()

  /// `changefreq` e `priority` foram removidos: o Google declarou em 2020 que
  /// ignora os dois, e `priority` relativo dentro do próprio site nunca teve
  /// efeito. Sobram `loc`, `lastmod` e as imagens — que são lidos.
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: catalogLastModified },
    { url: `${SITE_URL}/imoveis`, lastModified: catalogLastModified },
    { url: `${SITE_URL}/sobre`, lastModified: new Date('2026-07-28') },
    { url: `${SITE_URL}/contato`, lastModified: new Date('2026-07-28') },
    { url: `${SITE_URL}/privacidade`, lastModified: new Date('2026-07-28') },
  ]

  const categoryPages: MetadataRoute.Sitemap = []

  for (const slug of VALID_CATEGORIES) {
    const category = CATEGORIES[slug]
    const items = properties.filter((property) =>
      matchesFilter(property, category.filter),
    )

    /// Categoria vazia fica de fora: sitemap é recomendação de leitura, e
    /// apontar para página em branco gasta a cota do robô.
    if (items.length === 0) continue

    /// Faceta que devolve exatamente a mesma lista da categoria de onde nasceu
    /// também fica de fora — ela já aponta a canônica para lá. Manter as duas
    /// no sitemap seria pedir a indexação de conteúdo que o próprio site
    /// declara duplicado.
    if (category.parent) {
      const parentItems = properties.filter((property) =>
        matchesFilter(property, CATEGORIES[category.parent!].filter),
      )
      if (parentItems.length === items.length) continue
    }

    categoryPages.push({
      url: `${SITE_URL}/imoveis/${slug}`,
      lastModified: latestUpdate(items) ?? catalogLastModified,
    })
  }

  const propertyPages: MetadataRoute.Sitemap = properties.map((property) => ({
    url: `${SITE_URL}/imovel/${property.slug}`,
    lastModified: new Date(property.updatedAt),
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
