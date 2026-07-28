import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/layout/container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { PropertyGrid } from '@/components/property/property-grid'
import { FilterBar } from '@/components/search/filter-bar'
import { SortSelect } from '@/components/search/sort-select'
import { PropertyGridSkeleton } from '@/components/shared/loading-skeleton'
import { JsonLd } from '@/components/shared/json-ld'
import { getPropertiesPaged } from '@/data/services/properties'
import { CATEGORIES, VALID_CATEGORIES, SITE_NAME } from '@/lib/constants'
import {
  buildListingCanonical,
  hasListingFilters,
  isValidCategory,
  parsePageParam,
} from '@/lib/utils'
import type { PropertyFilter, PropertyPurpose, PropertyType } from '@/types'
import { Pagination } from '@/components/shared/pagination'
import {
  buildMetadata,
  LISTINGS_SOCIAL_IMAGE,
  NOINDEX_FOLLOW_ROBOTS,
} from '@/lib/metadata'
import {
  buildCollectionPageJsonLd,
  buildGraph,
  buildItemListJsonLd,
} from '@/lib/jsonld'

const PAGE_SIZE = 12

interface PageProps {
  params: Promise<{ categoria: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

/// Deixa o Next conhecer as categorias válidas em tempo de build. Ganha duas
/// coisas: a categoria inexistente vira 404 sem consultar o banco, e as páginas
/// reais começam a responder mais rápido — velocidade de resposta é sinal de
/// qualidade para o buscador e para o visitante no celular.
export function generateStaticParams() {
  return VALID_CATEGORIES.map((categoria) => ({ categoria }))
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { categoria } = await params
  if (!isValidCategory(categoria)) {
    return buildMetadata({
      title: 'Categoria não encontrada',
      robots: { index: false, follow: true },
    })
  }

  const cat = CATEGORIES[categoria]
  const search = await searchParams
  const page = parsePageParam(search.page)
  const filtered = hasListingFilters(search)
  const basePath = `/imoveis/${categoria}`
  const pageSuffix = page > 1 ? ` — Página ${page}` : ''

  const title = `${cat.seoTitle ?? cat.title}${pageSuffix}`
  const description = cat.seoDescription ?? cat.description

  return buildMetadata({
    path: basePath,
    title,
    description,
    keywords: cat.keywords,
    alternates: {
      canonical: buildListingCanonical(basePath, page),
    },
    robots: filtered ? NOINDEX_FOLLOW_ROBOTS : undefined,
    openGraph: {
      title: `${cat.seoTitle ?? cat.title} | ${SITE_NAME}`,
      description,
      images: [
        {
          url: LISTINGS_SOCIAL_IMAGE,
          width: 1200,
          height: 800,
          alt: cat.seoTitle ?? cat.title,
        },
      ],
    },
    twitter: {
      title: `${cat.seoTitle ?? cat.title} | ${SITE_NAME}`,
      description,
      images: [LISTINGS_SOCIAL_IMAGE],
    },
  })
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
  categoria,
  baseFilter,
  searchParams,
  basePath,
  emptyTitle,
  emptyDescription,
}: {
  categoria: string
  baseFilter: PropertyFilter
  searchParams: Record<string, string | string[] | undefined>
  basePath: string
  emptyTitle?: string
  emptyDescription?: string
}) {
  const filter = buildFilterFromParams(baseFilter, searchParams)
  const page = parsePageParam(searchParams.page)

  const ordem = Array.isArray(searchParams.ordem) ? searchParams.ordem[0] : searchParams.ordem
  const order = ordem === 'preco_asc' || ordem === 'preco_desc' ? ordem : undefined

  const paged = await getPropertiesPaged(filter, { page, limit: PAGE_SIZE, order })
  const cat = CATEGORIES[categoria]

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-cinza-600">
          <span className="font-semibold text-cinza-900">{paged.total}</span>{' '}
          {paged.total === 1 ? 'imóvel' : 'imóveis'}
        </p>
        <Suspense>
          <SortSelect />
        </Suspense>
      </div>

      <PropertyGrid
        properties={paged.items}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
      <Pagination
        basePath={basePath}
        searchParams={searchParams}
        page={paged.page}
        pages={paged.pages}
        hasPrev={paged.hasPrev}
        hasNext={paged.hasNext}
      />

      {!hasListingFilters(searchParams) && (
        <JsonLd
          data={buildGraph(
            buildCollectionPageJsonLd({
              path: basePath,
              name: cat.seoTitle ?? cat.title,
              description: cat.seoDescription ?? cat.description,
            }),
            buildItemListJsonLd(paged.items, {
              path: basePath,
              page: paged.page,
              limit: PAGE_SIZE,
            }),
          )}
        />
      )}
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

        <div className="mb-8">
          <Suspense>
            <FilterBar />
          </Suspense>
        </div>

        <Suspense fallback={<PropertyGridSkeleton />}>
          <CategoryPropertyList
            categoria={categoria}
            baseFilter={cat.filter}
            searchParams={search}
            basePath={`/imoveis/${categoria}`}
            emptyTitle={cat.emptyTitle}
            emptyDescription={cat.emptyDescription}
          />
        </Suspense>
      </Container>
    </section>
  )
}
