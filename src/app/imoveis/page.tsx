import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Container } from '@/components/layout/container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { PropertyGrid } from '@/components/property/property-grid'
import { FilterBar } from '@/components/search/filter-bar'
import { SortSelect } from '@/components/search/sort-select'
import { PropertyGridSkeleton } from '@/components/shared/loading-skeleton'
import { JsonLd } from '@/components/shared/json-ld'
import { RelatedCategories } from '@/components/sections/related-categories'
import { getPropertiesPaged } from '@/data/services/properties'
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
import { SITE_NAME } from '@/lib/constants'
import {
  buildListingCanonical,
  hasListingFilters,
  parsePageParam,
} from '@/lib/utils'

const PAGE_SIZE = 12
const BASE_PATH = '/imoveis'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams
  const page = parsePageParam(params.page)
  const filtered = hasListingFilters(params)

  /// O título precisa dizer em que página está. Sem isso, todas as páginas da
  /// paginação chegam ao buscador com o mesmo título e ele agrupa como
  /// duplicadas, indexando só uma.
  const pageSuffix = page > 1 ? ` — Página ${page}` : ''

  return buildMetadata({
    path: BASE_PATH,
    title: `Imóveis em Corumbá e Ladário-MS${pageSuffix}`,
    description:
      'Imóveis à venda e para alugar em Corumbá-MS e Ladário-MS: casas, apartamentos, terrenos, pontos comerciais e áreas rurais. Fotos, preços e contato direto com o corretor.',
    alternates: {
      canonical: buildListingCanonical(BASE_PATH, page),
    },
    robots: filtered ? NOINDEX_FOLLOW_ROBOTS : undefined,
    openGraph: {
      title: `Imóveis em Corumbá e Ladário-MS${pageSuffix} | ${SITE_NAME}`,
      description:
        'Catálogo atualizado de imóveis em Corumbá e Ladário, com atendimento direto pelo WhatsApp.',
      images: [
        {
          url: LISTINGS_SOCIAL_IMAGE,
          width: 1200,
          height: 800,
          alt: 'Imóveis em Corumbá e Ladário-MS',
        },
      ],
    },
    twitter: {
      title: `Imóveis em Corumbá e Ladário-MS | ${SITE_NAME}`,
      description:
        'Casas, terrenos, apartamentos e mais opções para compra e aluguel.',
      images: [LISTINGS_SOCIAL_IMAGE],
    },
  })
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

async function PropertyList({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const filter = buildFilter(searchParams)
  const page = parsePageParam(searchParams.page)

  const ordem = Array.isArray(searchParams.ordem) ? searchParams.ordem[0] : searchParams.ordem
  const order = ordem === 'preco_asc' || ordem === 'preco_desc' ? ordem : undefined

  const paged = await getPropertiesPaged(filter, { page, limit: PAGE_SIZE, order })
  const temFiltro = Object.keys(filter).length > 0

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-cinza-600">
          <span className="font-semibold text-cinza-900">{paged.total}</span>{' '}
          {paged.total === 1 ? 'imóvel' : 'imóveis'}
          {temFiltro ? ' com estes filtros' : ' disponíveis'}
        </p>
        <Suspense>
          <SortSelect />
        </Suspense>
      </div>

      <PropertyGrid properties={paged.items} />
      <Pagination
        basePath={BASE_PATH}
        searchParams={searchParams}
        page={paged.page}
        pages={paged.pages}
        hasPrev={paged.hasPrev}
        hasNext={paged.hasNext}
      />

      {/* Só a listagem sem filtro entra no grafo. Uma lista estruturada de um
          recorte que já está marcado como noindex daria ao buscador um dado
          que a própria página diz para ignorar. */}
      {!hasListingFilters(searchParams) && (
        <JsonLd
          data={buildGraph(
            buildCollectionPageJsonLd({
              path: BASE_PATH,
              name: 'Imóveis em Corumbá e Ladário-MS',
              description:
                'Catálogo de imóveis à venda e para alugar em Corumbá-MS e Ladário-MS.',
            }),
            buildItemListJsonLd(paged.items, {
              path: BASE_PATH,
              page: paged.page,
              limit: PAGE_SIZE,
            }),
          )}
        />
      )}
    </>
  )
}

export default async function ImoveisPage({ searchParams }: PageProps) {
  const params = await searchParams

  return (
    <section className="py-8 lg:py-12">
      <Container>
        <Breadcrumbs items={[{ label: 'Imóveis' }]} />

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-cinza-900 sm:text-3xl">
            Imóveis em Corumbá e Ladário
          </h1>
          <p className="mt-1 text-cinza-600">
            Casas, apartamentos, terrenos, pontos comerciais e áreas rurais para
            comprar ou alugar, com atendimento direto do corretor.
          </p>
        </div>

        <div className="mb-8">
          <Suspense>
            <FilterBar />
          </Suspense>
        </div>

        <Suspense fallback={<PropertyGridSkeleton />}>
          <PropertyList searchParams={params} />
        </Suspense>

        {/* Porta de entrada das páginas de busca combinada. Elas não estão no
            menu; sem um bloco assim, só existiriam no sitemap — e página que
            nenhuma outra referencia é lida pelo buscador como pouco
            importante. */}
        <RelatedCategories
          current="/imoveis"
          title="Buscas mais procuradas"
          slugs={[
            'casas-a-venda-em-corumba',
            'terrenos-a-venda-em-corumba',
            'casas-para-alugar-em-corumba',
            'apartamentos-em-corumba',
            'imoveis-a-venda-em-corumba',
            'imoveis-para-alugar-em-corumba',
            'casas-a-venda-em-ladario',
            'terrenos-em-ladario',
            'imoveis-a-venda-em-ladario',
            'chacaras-e-sitios-em-corumba',
            'pontos-comerciais-em-corumba',
          ]}
        />
      </Container>
    </section>
  )
}
