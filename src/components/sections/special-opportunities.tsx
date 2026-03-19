import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/layout/container'
import { SectionHeading } from '@/components/shared/section-heading'
import { WhatsAppButton } from '@/components/shared/whatsapp-button'
import { OpportunityBadge } from '@/components/property/property-badge'
import { PropertyPrice } from '@/components/property/property-price'
import { getSpecialOpportunities } from '@/data/services/properties'

export async function SpecialOpportunities() {
  const opportunities = await getSpecialOpportunities()

  if (opportunities.length === 0) return null

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <SectionHeading
          title="Oportunidades Especiais"
          subtitle="Negócios únicos que merecem sua atenção"
        />
        <div className="space-y-8">
          {opportunities.map((property) => (
            <div
              key={property.id}
              className="overflow-hidden rounded-xl border border-dourado-claro bg-white shadow-[var(--shadow-md)] transition-shadow hover:shadow-[var(--shadow-gold)]"
            >
              <div className="grid md:grid-cols-2">
                <Link
                  href={`/imovel/${property.slug}`}
                  className="group relative aspect-video overflow-hidden md:aspect-auto md:min-h-[340px]"
                >
                  <Image
                    src={property.coverImage}
                    alt={property.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </Link>
                <div className="flex flex-col justify-center p-6 lg:p-10">
                  <div className="inline-flex">
                    <OpportunityBadge />
                  </div>
                  <Link href={`/imovel/${property.slug}`}>
                    <h3 className="mt-4 text-xl font-bold text-cinza-900 transition-colors hover:text-azul-escuro sm:text-2xl lg:text-3xl">
                      {property.title}
                    </h3>
                  </Link>
                  <p className="mt-2 text-sm text-cinza-600">
                    {property.city} — {property.neighborhood}
                  </p>
                  <PropertyPrice
                    price={property.price}
                    priceSuffix={property.priceSuffix}
                    priceNote={property.priceNote}
                    size="lg"
                    className="mt-5"
                  />
                  <p className="mt-4 text-sm leading-relaxed text-cinza-600">
                    {property.shortDescription}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <WhatsAppButton message={property.whatsappMessage} size="lg" />
                    <Link
                      href={`/imovel/${property.slug}`}
                      className="inline-flex items-center gap-1 rounded-lg border-2 border-azul-escuro px-6 py-3 text-base font-semibold text-azul-escuro transition-colors hover:bg-azul-escuro hover:text-white"
                    >
                      Ver detalhes
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
