import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/layout/container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { PropertyGallery } from '@/components/property/property-gallery'
import { PropertyFeatures } from '@/components/property/property-features'
import { PropertyDescription } from '@/components/property/property-description'
import { PropertyPrice } from '@/components/property/property-price'
import { PropertyContactBox } from '@/components/property/property-contact-box'
import { RelatedProperties } from '@/components/property/related-properties'
import { ShareButtons } from '@/components/property/share-buttons'
import { PurposeBadge, StatusBadge, OpportunityBadge } from '@/components/property/property-badge'
import { getPropertyBySlug } from '@/data/services/properties'
import { formatPrice } from '@/lib/format'
import { SITE_NAME } from '@/lib/constants'
import { buildMetadata, getAbsoluteUrl } from '@/lib/metadata'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const property = await getPropertyBySlug(slug)
  if (!property) return {}

  const price = formatPrice(property.price)
  const title = `${property.title} em ${property.city} | ${price}`
  const url = `/imovel/${property.slug}`
  const socialDescription = `${property.shortDescription} Veja fotos, caracteristicas e fale direto no WhatsApp para mais informacoes.`
  const imageUrl = property.gallery?.[0]?.src || property.coverImage
  const shouldIndex = property.status === 'disponivel' || property.status === 'reservado'

  return buildMetadata({
    path: url,
    title,
    description: socialDescription,
    alternates: {
      canonical: url,
    },
    robots: {
      index: shouldIndex,
      follow: true,
      googleBot: {
        index: shouldIndex,
        follow: true,
      },
    },
    openGraph: {
      title: `${property.title} | ${price} | ${SITE_NAME}`,
      description: socialDescription,
      url: getAbsoluteUrl(url),
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: property.gallery?.[0]?.width || 1200,
          height: property.gallery?.[0]?.height || 800,
          alt: `${property.title} - ${property.neighborhood}, ${property.city}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${property.title} | ${price}`,
      description: socialDescription,
      images: [imageUrl],
    },
  })
}

export default async function ImovelPage({ params }: PageProps) {
  const { slug } = await params
  const property = await getPropertyBySlug(slug)

  if (!property) notFound()

  const url = getAbsoluteUrl(`/imovel/${property.slug}`)
  const price = formatPrice(property.price)

  const purposeLabel = property.purpose === 'venda' ? 'Venda' : 'Aluguel'

  return (
    <section className="pb-24 pt-8 lg:pb-12">
      <Container>
        <Breadcrumbs
          items={[
            { label: 'Imóveis', href: '/imoveis' },
            {
              label: purposeLabel,
              href: `/imoveis/${property.purpose === 'venda' ? 'venda' : 'aluguel'}`,
            },
            { label: property.title },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <PurposeBadge purpose={property.purpose} />
              <StatusBadge status={property.status} />
              {property.specialOpportunity && <OpportunityBadge />}
            </div>

            <h1 className="text-2xl font-bold text-cinza-900 sm:text-3xl">
              {property.title}
            </h1>
            <p className="mt-1 text-cinza-600">
              {property.city} — {property.neighborhood}
            </p>

            <PropertyPrice
              price={property.price}
              priceSuffix={property.priceSuffix}
              priceNote={property.priceNote}
              size="lg"
              className="mt-4"
            />

            <div className="mt-4">
              <ShareButtons title={property.title} price={price} url={url} />
            </div>

            <div className="mt-6">
              <PropertyGallery
                images={property.gallery}
                title={property.title}
              />
            </div>

            <div className="mt-8">
              <h2 className="mb-4 text-xl font-bold text-cinza-900">
                Características
              </h2>
              <PropertyFeatures property={property} />
            </div>

            <div className="mt-8">
              <PropertyDescription
                description={property.longDescription}
                tags={property.tags}
              />
            </div>

            <div className="mt-8 rounded-lg bg-cinza-50 p-4">
              <h3 className="mb-1 text-sm font-semibold text-cinza-900">
                Localização
              </h3>
              <p className="text-sm text-cinza-600">
                {property.neighborhood}, {property.city} — MS
              </p>
            </div>
          </div>

          <PropertyContactBox whatsappMessage={property.whatsappMessage} />
        </div>

        <RelatedProperties property={property} />
      </Container>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'RealEstateListing',
            name: property.title,
            description: property.shortDescription,
            url: url,
            image: property.coverImage,
            offers: {
              '@type': 'Offer',
              price: property.price,
              priceCurrency: 'BRL',
              availability:
                property.status === 'disponivel'
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/SoldOut',
            },
            address: {
              '@type': 'PostalAddress',
              addressLocality: property.city,
              addressRegion: 'MS',
              addressCountry: 'BR',
            },
          }),
        }}
      />
    </section>
  )
}
