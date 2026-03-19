import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  className?: string
  align?: 'left' | 'center'
}

export function SectionHeading({
  title,
  subtitle,
  className,
  align = 'center',
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-10 lg:mb-14',
        align === 'center' && 'text-center',
        className,
      )}
    >
      <div
        className={cn(
          'mb-3 h-0.5 w-10 rounded-full bg-dourado',
          align === 'center' && 'mx-auto',
        )}
      />
      <h2 className="text-2xl font-bold tracking-tight text-cinza-900 sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base text-cinza-600 sm:text-lg">{subtitle}</p>
      )}
    </div>
  )
}
