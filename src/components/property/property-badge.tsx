import { Badge } from '@/components/ui/badge'
import type { PropertyPurpose, PropertyStatus } from '@/types'

export function PurposeBadge({ purpose }: { purpose: PropertyPurpose }) {
  return (
    <Badge variant={purpose === 'venda' ? 'venda' : 'aluguel'}>
      {purpose === 'venda' ? 'Venda' : 'Aluguel'}
    </Badge>
  )
}

export function StatusBadge({ status }: { status: PropertyStatus }) {
  if (status === 'disponivel') return null

  const labels: Record<Exclude<PropertyStatus, 'disponivel'>, string> = {
    reservado: 'Reservado',
    vendido: 'Vendido',
    alugado: 'Alugado',
  }

  return (
    <Badge
      variant="default"
      className="bg-vermelho text-white"
    >
      {labels[status]}
    </Badge>
  )
}

export function OpportunityBadge() {
  return <Badge variant="oportunidade">Oportunidade</Badge>
}
