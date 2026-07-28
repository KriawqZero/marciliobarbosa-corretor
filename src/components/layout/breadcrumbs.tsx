import Link from 'next/link'
import { JsonLd } from '@/components/shared/json-ld'
import { buildBreadcrumbJsonLd, buildGraph } from '@/lib/jsonld'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <>
      <nav aria-label="Trilha de navegação" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-cinza-600">
          <li>
            <Link href="/" className="transition-colors hover:text-azul-escuro">
              Início
            </Link>
          </li>
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
              {item.href ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-azul-escuro"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-medium text-cinza-900">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* A trilha estruturada acompanha a visual: é ela que substitui a URL crua
          por "Início > Imóveis > Casas" no resultado de busca. Emitir aqui, e
          não em cada página, garante que as duas nunca divirjam. */}
      <JsonLd data={buildGraph(buildBreadcrumbJsonLd(items))} />
    </>
  )
}
