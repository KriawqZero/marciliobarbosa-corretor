import type { Metadata } from 'next'
import { HeroSection } from '@/components/sections/hero-section'
import { RecentProperties } from '@/components/sections/recent-properties'
import { BrokerStrip } from '@/components/sections/broker-strip'
import { JsonLd } from '@/components/shared/json-ld'
import {
  buildGraph,
  buildItemListJsonLd,
  ORGANIZATION_ID,
  WEBSITE_ID,
} from '@/lib/jsonld'
import {
  buildMetadata,
  DEFAULT_SOCIAL_IMAGE,
  SITE_URL,
  getAbsoluteUrl,
} from '@/lib/metadata'
import {
  getRecentProperties,
  getCatalogCounts,
} from '@/data/services/properties'
import { BROKER_NAME, SITE_NAME } from '@/lib/constants'

/// A home continua renderizando por requisição.
///
/// Servi-la de cache com ISR (`revalidate`) reduziria o tempo de resposta, que
/// é sinal de ranqueamento — mas obrigaria o build a ter acesso ao banco, já
/// que o Next pré-renderiza a página nessa hora. Enquanto o build roda sem
/// `DATABASE_URL`, ISR aqui quebra o deploy. Trocar exige garantir o banco no
/// ambiente de build; é uma decisão de infraestrutura, não de SEO, e por isso
/// fica registrada e não aplicada.
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = buildMetadata({
  path: '/',
  /// `absolute` porque o layout acrescenta " | Corretor Marcilio Barbosa" a
  /// qualquer título simples — e o nome do corretor já está aqui. Sem isto o
  /// resultado de busca da home exibia a marca duas vezes.
  ///
  /// Acentuação restaurada: o title é o texto que a pessoa lê no resultado, e
  /// "Imoveis em Corumba" passa impressão de site descuidado, além de não bater
  /// com o termo digitado, que vem acentuado.
  title: {
    absolute: `${BROKER_NAME} — Corretor de Imóveis em Corumbá e Ladário-MS`,
  },
  description:
    'Corretor de imóveis em Corumbá-MS e Ladário-MS. Casas, apartamentos, terrenos, pontos comerciais e áreas rurais para comprar ou alugar, com atendimento direto pelo WhatsApp.',
  keywords: [
    'corretor de imóveis Corumbá',
    'corretor de imóveis Ladário',
    'imóveis Corumbá MS',
    'imobiliária Corumbá MS',
    'casas à venda Corumbá',
    'terrenos Corumbá MS',
    'aluguel Corumbá MS',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${SITE_NAME} — Imóveis em Corumbá e Ladário-MS`,
    description:
      'Imóveis selecionados em Corumbá e Ladário, com atendimento rápido e direto com o corretor.',
    images: [
      {
        url: DEFAULT_SOCIAL_IMAGE,
        width: 1200,
        height: 1200,
        alt: `${BROKER_NAME} — corretor de imóveis em Corumbá e Ladário-MS`,
      },
    ],
  },
  twitter: {
    title: `${SITE_NAME} — Imóveis em Corumbá e Ladário-MS`,
    description:
      'Casas, terrenos, apartamentos e oportunidades especiais com atendimento via WhatsApp.',
    images: [DEFAULT_SOCIAL_IMAGE],
  },
})

export default async function Home() {
  // Uma espera só, em paralelo, e a página inteira pinta de uma vez. Sem
  // esqueleto de página inteira e sem seções chegando depois — as duas coisas
  // que produziam deslocamento de layout.
  const [recent, counts] = await Promise.all([
    getRecentProperties(6),
    getCatalogCounts(),
  ])

  return (
    <>
      <HeroSection counts={counts} />
      <RecentProperties properties={recent} total={counts.total} />
      <BrokerStrip />

      {/* O bloco do corretor saiu daqui: agora vive no layout, com `@id`, e
          vale para o site inteiro. Aqui fica só o que é específico da home —
          a lista dos imóveis em destaque. */}
      <JsonLd
        data={buildGraph(
          {
            '@type': 'WebPage',
            '@id': `${SITE_URL}/#pagina`,
            url: `${SITE_URL}/`,
            name: `Corretor de Imóveis em Corumbá e Ladário-MS — ${BROKER_NAME}`,
            inLanguage: 'pt-BR',
            isPartOf: { '@id': WEBSITE_ID },
            about: { '@id': ORGANIZATION_ID },
            primaryImageOfPage: getAbsoluteUrl('/marcilio.jpg'),
          },
          buildItemListJsonLd(recent, { path: '/', limit: recent.length || 1 }),
        )}
      />
    </>
  )
}
