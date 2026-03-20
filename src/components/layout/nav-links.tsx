'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface NavLinksProps {
  inverted?: boolean
}

export function NavLinks({ inverted = false }: NavLinksProps) {
  const pathname = usePathname()

  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {NAV_LINKS.map((link) => {
        const isActive =
          link.href === '/'
            ? pathname === '/'
            : pathname.startsWith(link.href)

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              inverted
                ? isActive
                  ? 'bg-white/14 text-white'
                  : 'text-white/78 hover:bg-white/10 hover:text-white'
                : isActive
                  ? 'bg-azul-escuro/5 text-azul-escuro'
                  : 'text-cinza-600 hover:bg-cinza-50 hover:text-azul-escuro',
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
