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
import {
  getCategoryFacets,
  getPropertiesCount,
  getPropertiesPaged,
} from '@/data/services/properties'
import { CATEGORIES, CITY_GEO, SITE_NAME } from '@/lib/constants'
import { CategoryIntro } from '@/components/sections/category-intro'
import { RelatedCategories } from '@/components/sections/related-categories'
import {
  buildListingCanonical,
  getRelatedCategorySlugs,
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

/// Categoria inexistente é barrada em `src/middleware.ts`, antes de a resposta
/// começar a ser enviada — é lá que ainda dá para devolver 404 de verdade.
/// Esta rota lê `searchParams`, então é sempre dinâmica: `generateStaticParams`
/// e `dynamicParams` não teriam efeito aqui.

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { categoria } = await params
  /// Rede de segurança: o middleware já barrou o que chegaria aqui inválido.
  if (!isValidCategory(categoria)) notFound()

  const cat = CATEGORIES[categoria]
  const search = await searchParams
  const page = parsePageParam(search.page)
  const filtered = hasListingFilters(search)
  const basePath = `/imoveis/${categoria}`
  const pageSuffix = page > 1 ? ` — Página ${page}` : ''

  const title = `${cat.seoTitle ?? cat.title}${pageSuffix}`
  const description = cat.seoDescription ?? cat.description

  /// Categoria sem nenhum imóvel não se apresenta ao buscador.
  ///
  /// Uma página de catálogo vazia é conteúdo raso: promete "casas à venda em
  /// Corumbá" e entrega uma lista em branco. Indexada, atrai visita que sai na
  /// hora — e visita que sai na hora é o sinal que derruba a página. Ela
  /// continua no ar para quem chega por link ou pelo menu, com o convite para
  /// chamar no WhatsApp; só não entra no índice.
  ///
  /// Quando o primeiro imóvel do perfil for cadastrado, a página se liga
  /// sozinha na revalidação.
  const total = await getPropertiesCount(cat.filter).catch(() => 0)

  /// Faceta que não recorta nada aponta para a página de onde nasceu.
  ///
  /// Como o acervo hoje é quase todo de venda, "casas à venda em Corumbá"
  /// devolve exatamente a mesma lista de "casas em Corumbá" — duas URLs
  /// indexadas com o mesmo conteúdo byte a byte, competindo entre si pela
  /// mesma busca. O filtro funciona; é o inventário que não tem o outro lado.
  ///
  /// Comparar as contagens resolve sozinho e nos dois sentidos: o filtro da
  /// faceta é sempre mais estreito que o da origem, então contagem igual
  /// significa conjunto igual. No dia em que entrar a primeira casa para
  /// alugar em Corumbá, as contagens divergem e as duas páginas voltam a
  /// existir por conta própria.
  const parentSlug = cat.parent
  const parentTotal = parentSlug
    ? await getPropertiesCount(CATEGORIES[parentSlug].filter).catch(() => -1)
    : -1
  const isRedundant = parentSlug !== undefined && total === parentTotal

  const canonical = isRedundant
    ? `/imoveis/${parentSlug}`
    : buildListingCanonical(basePath, page)

  return buildMetadata({
    path: basePath,
    title,
    description,
    alternates: {
      canonical,
    },
    robots:
      filtered || total === 0 || isRedundant
        ? NOINDEX_FOLLOW_ROBOTS
        : undefined,
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

/// Texto de abertura com o resumo do acervo. Fica em componente próprio para
/// não segurar a grade: a consulta do resumo roda em paralelo com a da lista.
async function CategoryHeader({ categoria }: { categoria: string }) {
  const cat = CATEGORIES[categoria]
  const facets = await getCategoryFacets(cat.filter).catch(() => ({
    total: 0,
    minPrice: null,
    maxPrice: null,
    neighborhoods: [],
  }))

  const cidade = cat.filter.citySlug
    ? `em ${CITY_GEO[cat.filter.citySlug]?.name ?? 'Corumbá'}-MS`
    : 'em Corumbá-MS e Ladário-MS'

  return (
    <CategoryIntro paragraphs={cat.intro} facets={facets} location={cidade} />
  )
}

export default async function CategoriaPage({ params, searchParams }: PageProps) {
  const { categoria } = await params
  const search = await searchParams

  if (!isValidCategory(categoria)) notFound()

  const cat = CATEGORIES[categoria]

  /// Trilha com o nível intermediário quando a categoria nasce de outra:
  /// "Início > Imóveis > Casas em Corumbá > Casas à venda em Corumbá". Diz ao
  /// visitante e ao buscador onde a página está dentro do catálogo.
  const parent = cat.parent ? CATEGORIES[cat.parent] : undefined

  return (
    <section className="py-8 lg:py-12">
      <Container>
        <Breadcrumbs
          items={[
            { label: 'Imóveis', href: '/imoveis' },
            ...(parent
              ? [{ label: parent.title, href: `/imoveis/${parent.slug}` }]
              : []),
            { label: cat.title },
          ]}
        />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-cinza-900 sm:text-3xl">
            {cat.title}
          </h1>
        </div>

        <Suspense>
          <CategoryHeader categoria={categoria} />
        </Suspense>

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

        <RelatedCategories
          current={categoria}
          slugs={getRelatedCategorySlugs(categoria)}
        />
      </Container>
    </section>
  )
}
