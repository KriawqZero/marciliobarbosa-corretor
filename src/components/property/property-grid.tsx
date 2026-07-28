import type { Property } from '@/types'
import { PropertyCard } from './property-card'
import { EmptyState } from '@/components/shared/empty-state'

interface PropertyGridProps {
  properties: Property[]
}

export function PropertyGrid({ properties }: PropertyGridProps) {
  if (properties.length === 0) return <EmptyState />

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property, index) => (
        <PropertyCard
          key={property.id}
          property={property}
          priority={index === 0}
        />
      ))}
    </div>
  )
}
