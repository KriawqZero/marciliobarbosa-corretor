import { getRecentProperties } from '@/data/services/properties'
import { SITE_NAME, BROKER_EMAIL, BROKER_NAME } from '@/lib/constants'
import { SITE_URL, getAbsoluteUrl } from '@/lib/metadata'
import { formatPrice } from '@/lib/format'

/// Feed RSS dos imóveis mais recentes.
///
/// Não é fator de ranqueamento, mas é um canal de descoberta barato: leitores
/// de feed, agregadores e vários rastreadores (inclusive os de busca com IA)
/// consomem RSS para saber o que mudou sem varrer o site inteiro.
///
/// Dinâmico pelo mesmo motivo do sitemap: um build sem banco publicaria um feed
/// vazio congelado. O cache de borda fica por conta do `Cache-Control` abaixo.
export const dynamic = 'force-dynamic'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const properties = await getRecentProperties(30).catch(() => [])

  const items = properties
    .map((property) => {
      const url = getAbsoluteUrl(`/imovel/${property.slug}`)
      const title = `${property.title} — ${property.neighborhood}, ${property.city}-MS — ${formatPrice(property.price)}`

      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${new Date(property.createdAt).toUTCString()}</pubDate>
      <description>${escapeXml(property.shortDescription)}</description>
      <category>${escapeXml(property.purpose === 'venda' ? 'Venda' : 'Aluguel')}</category>
      <category>${escapeXml(property.city)}</category>
      <enclosure url="${escapeXml(getAbsoluteUrl(property.coverImage))}" type="image/jpeg" />
    </item>`
    })
    .join('\n')

  const lastBuildDate =
    properties.length > 0
      ? new Date(properties[0].createdAt).toUTCString()
      : new Date().toUTCString()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${SITE_NAME} — Imóveis em Corumbá e Ladário-MS`)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(`Imóveis publicados por ${BROKER_NAME} em Corumbá-MS e Ladário-MS.`)}</description>
    <language>pt-BR</language>
    <managingEditor>${escapeXml(`${BROKER_EMAIL} (${BROKER_NAME})`)}</managingEditor>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
