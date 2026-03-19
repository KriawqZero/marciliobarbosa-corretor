import type { Property } from '@/types'
import { SectionHeading } from '@/components/shared/section-heading'
import { PropertyCard } from './property-card'
import { getRelatedProperties } from '@/data/services/properties'

interface RelatedPropertiesProps {
  property: Property
}

export async function RelatedProperties({ property }: RelatedPropertiesProps) {
  const related = await getRelatedProperties(property)

  if (related.length === 0) return null

  return (
    <section className="mt-12 border-t border-cinza-200 pt-12">
      <SectionHeading
        title="Imóveis Semelhantes"
        subtitle="Outros imóveis que podem te interessar"
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </section>
  )
}
