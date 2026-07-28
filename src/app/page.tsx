import type { Metadata } from 'next'
import { Suspense } from 'react'
import { HeroSection } from '@/components/sections/hero-section'
import { CategoryCards } from '@/components/sections/category-cards'
import { FeaturedProperties } from '@/components/sections/featured-properties'
import { SpecialOpportunities } from '@/components/sections/special-opportunities'
import { CitySection } from '@/components/sections/city-section'
import { InstitutionalSection } from '@/components/sections/institutional-section'
import { CTASection } from '@/components/sections/cta-section'
import { buildMetadata, DEFAULT_SOCIAL_IMAGE } from '@/lib/metadata'
import {
  getFeaturedProperties,
  getSpecialOpportunities,
  getPropertiesCount,
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

// Carregadores: buscam os dados e entregam para os componentes de apresentação,
// que permanecem puros. Ficam atrás de `Suspense` para que o hero — que é
// estático — não espere por banco nenhum.
async function FeaturedPropertiesSlot() {
  const properties = await getFeaturedProperties()
  return <FeaturedProperties properties={properties} />
}

async function SpecialOpportunitiesSlot() {
  const opportunities = await getSpecialOpportunities()
  return <SpecialOpportunities opportunities={opportunities} />
}

async function CitySlot() {
  const [corumbaCount, ladarioCount] = await Promise.all([
    getPropertiesCount({ citySlug: 'corumba' }),
    getPropertiesCount({ citySlug: 'ladario' }),
  ])
  return <CitySection corumbaCount={corumbaCount} ladarioCount={ladarioCount} />
}

export default function Home() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://marciliobarbosacorretor.com.br'

  return (
    <>
      {/* Hero e categorias não dependem de dados: renderizam no primeiro paint
          e nunca se movem. Era a troca do esqueleto de página inteira pelo
          conteúdo real que gerava o CLS de 0,172 (medido). */}
      <HeroSection />
      <CategoryCards />
      <Suspense fallback={null}>
        <FeaturedPropertiesSlot />
      </Suspense>
      <Suspense fallback={null}>
        <SpecialOpportunitiesSlot />
      </Suspense>
      <Suspense fallback={null}>
        <CitySlot />
      </Suspense>
      <InstitutionalSection />
      <CTASection />

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
