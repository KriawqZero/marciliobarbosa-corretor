import Link from 'next/link'
import { Container } from '@/components/layout/container'
import { PropertyCard } from '@/components/property/property-card'
import type { Property } from '@/types'

interface RecentPropertiesProps {
  properties: Property[]
  total: number
}

export function RecentProperties({ properties, total }: RecentPropertiesProps) {
  if (properties.length === 0) return null

  const restantes = total - properties.length

  return (
    <section className="py-12 lg:py-20">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-cinza-900 sm:text-3xl">
              Imóveis disponíveis
            </h2>
            <p className="mt-1 text-cinza-600">
              Os mais recentes cadastrados em Corumbá e Ladário
            </p>
          </div>
          <Link
            href="/imoveis"
            className="inline-flex items-center gap-1 text-sm font-semibold text-azul-escuro underline-offset-4 hover:underline"
          >
            Ver todos
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property, index) => (
            <PropertyCard
              key={property.id}
              property={property}
              priority={index === 0}
            />
          ))}
        </div>

        {restantes > 0 && (
          <div className="mt-10 text-center">
            <Link
              href="/imoveis"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-azul-escuro px-8 py-3.5 text-base font-semibold text-azul-escuro transition-colors hover:bg-azul-escuro hover:text-white"
            >
              Ver os {total} imóveis
            </Link>
          </div>
        )}
      </Container>
    </section>
  )
}
