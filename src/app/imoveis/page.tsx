import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Container } from '@/components/layout/container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { PropertyGrid } from '@/components/property/property-grid'
import { FilterBar } from '@/components/search/filter-bar'
import { SortSelect } from '@/components/search/sort-select'
import { PropertyGridSkeleton } from '@/components/shared/loading-skeleton'
import { getProperties } from '@/data/services/properties'
import type { PropertyFilter, PropertyPurpose, PropertyType } from '@/types'

export const metadata: Metadata = {
  title: 'Imóveis em Corumbá e Ladário',
  description:
    'Encontre casas, terrenos, apartamentos e imóveis comerciais em Corumbá-MS e Ladário-MS. Venda e aluguel com atendimento personalizado.',
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function buildFilter(params: Record<string, string | string[] | undefined>): PropertyFilter {
  const filter: PropertyFilter = {}
  if (params.finalidade) filter.purpose = params.finalidade as PropertyPurpose
  if (params.tipo) filter.type = params.tipo as PropertyType
  if (params.quartos) filter.bedrooms = Number(params.quartos)
  if (params.cidade) filter.citySlug = params.cidade as string
  if (params.busca) filter.search = params.busca as string
  return filter
}

function sortProperties(
  properties: Awaited<ReturnType<typeof getProperties>>,
  ordem?: string,
) {
  if (ordem === 'preco_asc') return [...properties].sort((a, b) => a.price - b.price)
  if (ordem === 'preco_desc') return [...properties].sort((a, b) => b.price - a.price)
  return properties
}

async function PropertyList({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const filter = buildFilter(searchParams)
  const properties = await getProperties(filter)
  const sorted = sortProperties(properties, searchParams.ordem as string | undefined)
  return <PropertyGrid properties={sorted} />
}

export default async function ImoveisPage({ searchParams }: PageProps) {
  const params = await searchParams

  return (
    <section className="py-8 lg:py-12">
      <Container>
        <Breadcrumbs items={[{ label: 'Imóveis' }]} />

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-cinza-900 sm:text-3xl">
            Todos os Imóveis
          </h1>
          <p className="mt-1 text-cinza-600">
            Imóveis disponíveis em Corumbá e Ladário
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Suspense>
            <FilterBar />
          </Suspense>
          <Suspense>
            <SortSelect />
          </Suspense>
        </div>

        <Suspense fallback={<PropertyGridSkeleton />}>
          <PropertyList searchParams={params} />
        </Suspense>
      </Container>
    </section>
  )
}
