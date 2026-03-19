import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/layout/container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { PropertyGrid } from '@/components/property/property-grid'
import { FilterBar } from '@/components/search/filter-bar'
import { SortSelect } from '@/components/search/sort-select'
import { PropertyGridSkeleton } from '@/components/shared/loading-skeleton'
import { getProperties } from '@/data/services/properties'
import { CATEGORIES } from '@/lib/constants'
import { isValidCategory } from '@/lib/utils'
import type { PropertyFilter, PropertyPurpose, PropertyType } from '@/types'

interface PageProps {
  params: Promise<{ categoria: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria } = await params
  if (!isValidCategory(categoria)) return {}

  const cat = CATEGORIES[categoria]
  return {
    title: cat.title,
    description: cat.description,
  }
}

function buildFilterFromParams(
  baseFilter: PropertyFilter,
  params: Record<string, string | string[] | undefined>,
): PropertyFilter {
  const filter: PropertyFilter = { ...baseFilter }
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

async function CategoryPropertyList({
  baseFilter,
  searchParams,
}: {
  baseFilter: PropertyFilter
  searchParams: Record<string, string | string[] | undefined>
}) {
  const filter = buildFilterFromParams(baseFilter, searchParams)
  const properties = await getProperties(filter)
  const sorted = sortProperties(properties, searchParams.ordem as string | undefined)
  return <PropertyGrid properties={sorted} />
}

export default async function CategoriaPage({ params, searchParams }: PageProps) {
  const { categoria } = await params
  const search = await searchParams

  if (!isValidCategory(categoria)) notFound()

  const cat = CATEGORIES[categoria]

  return (
    <section className="py-8 lg:py-12">
      <Container>
        <Breadcrumbs
          items={[
            { label: 'Imóveis', href: '/imoveis' },
            { label: cat.title },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-cinza-900 sm:text-3xl">
            {cat.title}
          </h1>
          <p className="mt-1 text-cinza-600">{cat.description}</p>
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
          <CategoryPropertyList baseFilter={cat.filter} searchParams={search} />
        </Suspense>
      </Container>
    </section>
  )
}
