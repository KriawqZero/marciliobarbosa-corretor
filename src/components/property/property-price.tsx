import { formatPriceWithSuffix } from '@/lib/format'
import { cn } from '@/lib/utils'

interface PropertyPriceProps {
  price: number
  priceSuffix?: string
  priceNote?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl sm:text-3xl',
}

export function PropertyPrice({
  price,
  priceSuffix,
  priceNote,
  size = 'md',
  className,
}: PropertyPriceProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <span className={cn('font-bold text-azul-escuro', sizeStyles[size])}>
        {formatPriceWithSuffix(price, priceSuffix)}
      </span>
      {priceNote && (
        <span className="text-xs font-medium text-verde">{priceNote}</span>
      )}
    </div>
  )
}
