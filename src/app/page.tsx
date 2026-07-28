import type { Metadata } from 'next'
import { HeroSection } from '@/components/sections/hero-section'
import { RecentProperties } from '@/components/sections/recent-properties'
import { BrokerStrip } from '@/components/sections/broker-strip'
import { buildMetadata, DEFAULT_SOCIAL_IMAGE } from '@/lib/metadata'
import {
  getRecentProperties,
  getCatalogCounts,
} from '@/data/services/properties'
import {
  BROKER_NAME,
  BROKER_PHONE_DISPLAY,
  BROKER_EMAIL,
  SITE_NAME,
} from '@/lib/constants'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = buildMetadata({
  path: '/',
  title: `${SITE_NAME} — Imoveis em Corumba e Ladario`,
  description:
    'Imoveis em Corumba-MS e Ladario-MS com atendimento direto no WhatsApp. Casas, apartamentos, terrenos e oportunidades especiais para compra e aluguel.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${SITE_NAME} — Imoveis em Corumba e Ladario`,
    description:
      'Confira imoveis selecionados em Corumba e Ladario com atendimento rapido e personalizado.',
    images: [
      {
        url: DEFAULT_SOCIAL_IMAGE,
        width: 1200,
        height: 1200,
        alt: `${BROKER_NAME} - corretor de imoveis em Corumba e Ladario`,
      },
    ],
  },
  twitter: {
    title: `${SITE_NAME} — Imoveis em Corumba e Ladario`,
    description:
      'Casas, terrenos, apartamentos e oportunidades especiais com atendimento via WhatsApp.',
    images: [DEFAULT_SOCIAL_IMAGE],
  },
})

export default async function Home() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://marciliobarbosacorretor.com.br'

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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'RealEstateAgent',
            name: BROKER_NAME,
            url: siteUrl,
            telephone: BROKER_PHONE_DISPLAY,
            email: BROKER_EMAIL,
            areaServed: [
              {
                '@type': 'City',
                name: 'Corumbá',
                address: {
                  '@type': 'PostalAddress',
                  addressRegion: 'MS',
                  addressCountry: 'BR',
                },
              },
              {
                '@type': 'City',
                name: 'Ladário',
                address: {
                  '@type': 'PostalAddress',
                  addressRegion: 'MS',
                  addressCountry: 'BR',
                },
              },
            ],
          }),
        }}
      />
    </>
  )
}
