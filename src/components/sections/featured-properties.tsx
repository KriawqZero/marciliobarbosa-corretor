import { Container } from '@/components/layout/container'
import { SectionHeading } from '@/components/shared/section-heading'
import { PropertyCard } from '@/components/property/property-card'
import { Button } from '@/components/ui/button'
import type { Property } from '@/types'

export function FeaturedProperties({ properties }: { properties: Property[] }) {
  if (properties.length === 0) return null

  return (
    <section className="bg-cinza-50 py-16 lg:py-24">
      <Container>
        <SectionHeading
          title="Imóveis em Destaque"
          subtitle="As melhores opções selecionadas para você"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.slice(0, 6).map((property, index) => (
            <PropertyCard
              key={property.id}
              property={property}
              priority={index === 0}
            />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button href="/imoveis" variant="secondary" size="lg">
            Ver todos os imóveis
          </Button>
        </div>
      </Container>
    </section>
  )
}
