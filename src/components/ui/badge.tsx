import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'venda' | 'aluguel' | 'destaque' | 'oportunidade' | 'status'

interface BadgeProps {
  variant?: BadgeVariant
  className?: string
  children: React.ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-cinza-200 text-cinza-900',
  venda: 'bg-azul-escuro text-white',
  aluguel: 'bg-azul-medio text-white',
  destaque: 'bg-dourado text-white',
  oportunidade: 'bg-dourado-claro text-dourado font-semibold',
  status: 'bg-verde text-white',
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
