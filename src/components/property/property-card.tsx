import Image from 'next/image'
import Link from 'next/link'
import type { Property } from '@/types'
import { formatArea, formatPriceWithSuffix } from '@/lib/format'
import { PurposeBadge, OpportunityBadge } from './property-badge'

interface PropertyCardProps {
  property: Property
}

function BedIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" />
    </svg>
  )
}

function BathIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
      <line x1="10" x2="8" y1="5" y2="7" /><line x1="2" x2="22" y1="12" y2="12" />
      <line x1="7" x2="7" y1="19" y2="21" /><line x1="17" x2="17" y1="19" y2="21" />
    </svg>
  )
}

function AreaIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  )
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link
      href={`/imovel/${property.slug}`}
      className="group block overflow-hidden rounded-xl border border-cinza-200 bg-white shadow-[var(--shadow-sm)] transition-all duration-300 hover:shadow-[var(--shadow-lg)] hover:-translate-y-1"
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <Image
          src={property.coverImage}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <PurposeBadge purpose={property.purpose} />
          {property.specialOpportunity && <OpportunityBadge />}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent px-4 pb-3 pt-10">
          <span className="block text-xl font-bold text-white drop-shadow-sm">
            {formatPriceWithSuffix(property.price, property.priceSuffix)}
          </span>
          {property.priceNote && (
            <span className="text-xs font-medium text-green-700 font-semibold">{property.priceNote}</span>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-semibold text-cinza-900 group-hover:text-azul-escuro">
            {property.title}
          </h3>
        </div>
        <p className="mb-3 text-sm text-cinza-600">
          {property.city} — {property.neighborhood}
        </p>

        <div className="flex flex-wrap gap-3 border-t border-cinza-200 pt-3 text-cinza-600">
          {property.bedrooms != null && property.bedrooms > 0 && (
            <div className="flex items-center gap-1">
              <BedIcon />
              <span className="text-xs font-medium">{property.bedrooms} qts</span>
            </div>
          )}
          {property.bathrooms != null && property.bathrooms > 0 && (
            <div className="flex items-center gap-1">
              <BathIcon />
              <span className="text-xs font-medium">{property.bathrooms} ban</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <AreaIcon />
            <span className="text-xs font-medium">{formatArea(property.totalArea)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
