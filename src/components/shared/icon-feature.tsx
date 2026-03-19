import { cn } from '@/lib/utils'

interface IconFeatureProps {
  icon: React.ReactNode
  value: string | number
  label: string
  className?: string
}

export function IconFeature({ icon, value, label, className }: IconFeatureProps) {
  return (
    <div className={cn('flex items-center gap-1.5 text-cinza-600', className)}>
      <span className="flex-shrink-0">{icon}</span>
      <span className="text-sm font-medium text-cinza-900">{value}</span>
      <span className="text-xs text-cinza-600">{label}</span>
    </div>
  )
}
