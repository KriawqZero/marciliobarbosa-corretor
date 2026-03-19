import type { Property } from '@/types'
import { formatArea } from '@/lib/format'

interface PropertyFeaturesProps {
  property: Property
}

function FeatureItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string | number
  label: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-cinza-200 bg-cinza-50 p-4">
      <span className="text-azul-escuro">{icon}</span>
      <div>
        <p className="text-lg font-bold text-cinza-900">{value}</p>
        <p className="text-xs text-cinza-600">{label}</p>
      </div>
    </div>
  )
}

export function PropertyFeatures({ property }: PropertyFeaturesProps) {
  const features = []

  if (property.bedrooms != null && property.bedrooms > 0) {
    features.push({
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" />
        </svg>
      ),
      value: property.bedrooms,
      label: property.bedrooms === 1 ? 'Quarto' : 'Quartos',
    })
  }

  if (property.bathrooms != null && property.bathrooms > 0) {
    features.push({
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
          <line x1="10" x2="8" y1="5" y2="7" /><line x1="2" x2="22" y1="12" y2="12" />
          <line x1="7" x2="7" y1="19" y2="21" /><line x1="17" x2="17" y1="19" y2="21" />
        </svg>
      ),
      value: property.bathrooms,
      label: property.bathrooms === 1 ? 'Banheiro' : 'Banheiros',
    })
  }

  if (property.parkingSpaces != null && property.parkingSpaces > 0) {
    features.push({
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="22" height="18" rx="2" />
          <path d="M7 9h4a2 2 0 0 1 0 4H7V7h5" />
        </svg>
      ),
      value: property.parkingSpaces,
      label: property.parkingSpaces === 1 ? 'Vaga' : 'Vagas',
    })
  }

  features.push({
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
    value: formatArea(property.totalArea),
    label: 'Área total',
  })

  if (property.builtArea != null) {
    features.push({
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      value: formatArea(property.builtArea),
      label: 'Área construída',
    })
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {features.map((feat, i) => (
        <FeatureItem key={i} {...feat} />
      ))}
    </div>
  )
}
