import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/layout/container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { PropertyGrid } from '@/components/property/property-grid'
import { FilterBar } from '@/components/search/filter-bar'
import { SortSelect } from '@/components/search/sort-select'
import { PropertyGridSkeleton } from '@/components/shared/loading-skeleton'
import { getPropertiesPaged } from '@/data/services/properties'
import { CATEGORIES } from '@/lib/constants'
import { isValidCategory } from '@/lib/utils'
import type { PropertyFilter, PropertyPurpose, PropertyType } from '@/types'
import { Pagination } from '@/components/shared/pagination'

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

async function CategoryPropertyList({
  baseFilter,
  searchParams,
  basePath,
}: {
  baseFilter: PropertyFilter
  searchParams: Record<string, string | string[] | undefined>
  basePath: string
}) {
  const filter = buildFilterFromParams(baseFilter, searchParams)
  const rawPage = searchParams.page
  const page =
    typeof rawPage === 'string' && Number.isFinite(Number(rawPage))
      ? Math.max(1, Math.floor(Number(rawPage)))
      : 1

  const ordem = Array.isArray(searchParams.ordem) ? searchParams.ordem[0] : searchParams.ordem
  const order = ordem === 'preco_asc' || ordem === 'preco_desc' ? ordem : undefined

  const paged = await getPropertiesPaged(filter, { page, limit: 12, order })

  return (
    <>
      <PropertyGrid properties={paged.items} />
      <Pagination
        basePath={basePath}
        searchParams={searchParams}
        page={paged.page}
        pages={paged.pages}
        hasPrev={paged.hasPrev}
        hasNext={paged.hasNext}
      />
    </>
  )
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
          <CategoryPropertyList
            baseFilter={cat.filter}
            searchParams={search}
            basePath={`/imoveis/${categoria}`}
          />
        </Suspense>
      </Container>
    </section>
  )
}
