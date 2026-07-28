import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@/components/layout/container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { PropertyGallery } from '@/components/property/property-gallery'
import { PropertyFeatures } from '@/components/property/property-features'
import { PropertyDescription } from '@/components/property/property-description'
import { PropertyPrice } from '@/components/property/property-price'
import { PropertyContactBox } from '@/components/property/property-contact-box'
import { RelatedProperties } from '@/components/property/related-properties'
import { ShareButtons } from '@/components/property/share-buttons'
import { PurposeBadge, StatusBadge, OpportunityBadge } from '@/components/property/property-badge'
import { getPropertyBySlug } from '@/data/services/properties'
import {
  formatPrice,
  formatArea,
  formatDateLong,
  isRealNeighborhood,
} from '@/lib/format'
import { SITE_NAME, PROPERTY_TYPE_LABEL } from '@/lib/constants'
import { buildMetadata, getAbsoluteUrl } from '@/lib/metadata'
import { JsonLd } from '@/components/shared/json-ld'
import { buildGraph, buildPropertyJsonLd } from '@/lib/jsonld'
import { buildPropertyWhatsAppMessage } from '@/lib/whatsapp'

/// Ficha servida do cache, revalidada a cada 10 minutos.
///
/// Estas páginas vinham com `cache-control: private, no-cache, no-store` — cada
/// visita, inclusive a do robô, abria consulta ao banco e renderizava tudo de
/// novo. Um anúncio muda pouco depois de publicado, e o servidor fica em Miami:
/// o tempo de resposta pesa mais para quem acessa do interior de MS.
export const revalidate = 600

/// A lista vazia não é descuido: é o que liga o ISR sem custo no build.
///
/// `revalidate` sozinho não basta — foi medido: uma rota com parâmetro dinâmico
/// e sem `generateStaticParams` continua sendo renderizada por requisição, com
/// `no-store`. Declarar a função opta a rota pelo pipeline estático; devolver
/// nada faz o build não pré-renderizar ficha nenhuma, então continua rodando
/// sem `DATABASE_URL`. Com `dynamicParams` no padrão, cada ficha é gerada na
/// primeira visita e servida do cache nas seguintes.
///
/// Cadastro e edição chamam `revalidatePath`, então a janela de 10 minutos só
/// cobre alteração feita direto no banco.
export function generateStaticParams() {
  return []
}

interface PageProps {
  params: Promise<{ slug: string }>
}

/// O tipo do imóvel no banco e a categoria na URL têm nomes diferentes
/// (`casa` → `/imoveis/casas`). Mapa explícito para os links internos não
/// dependerem de pluralização automática.
const CATEGORY_BY_TYPE: Record<string, string> = {
  casa: 'casas',
  apartamento: 'apartamentos',
  terreno: 'terrenos',
  rural: 'rural',
  comercial: 'comercial',
}

const TYPE_PLURAL: Record<string, string> = {
  casa: 'casas',
  apartamento: 'apartamentos',
  terreno: 'terrenos',
  rural: 'áreas rurais',
  comercial: 'imóveis comerciais',
}

/// Descrição usada no resultado de busca e nas prévias de link.
///
/// A descrição curta do cadastro sozinha rende trechos genéricos ("Casa em
/// Corumbá."). Aqui ela é completada com os atributos que a pessoa realmente
/// digitou na busca — quartos, área, bairro — dentro dos ~160 caracteres que o
/// buscador exibe.
function buildDescription(property: {
  shortDescription: string
  bedrooms?: number | null
  bathrooms?: number | null
  totalArea: number
  builtArea?: number | null
  neighborhood: string
  city: string
  purpose: string
  type: string
}): string {
  const typeLabel = PROPERTY_TYPE_LABEL[property.type] ?? 'Imóvel'
  const purposeLabel = property.purpose === 'venda' ? 'à venda' : 'para alugar'

  const attributes = [
    property.bedrooms ? `${property.bedrooms} quartos` : null,
    property.bathrooms ? `${property.bathrooms} banheiros` : null,
    formatArea(property.builtArea || property.totalArea),
  ].filter(Boolean)

  /// Sem bairro cadastrado a frase cai para a cidade. Escrever "no bairro A
  /// definir" é pior que não citar bairro nenhum: aparece assim no resultado de
  /// busca e passa a impressão de anúncio incompleto.
  const local = isRealNeighborhood(property.neighborhood)
    ? `no bairro ${property.neighborhood}, ${property.city}-MS`
    : `em ${property.city}-MS`

  return `${typeLabel} ${purposeLabel} ${local}: ${attributes.join(', ')}. ${property.shortDescription} Fale direto com o corretor pelo WhatsApp.`.slice(
    0,
    300,
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const property = await getPropertyBySlug(slug).catch(() => null)

  /// `notFound()` aqui, e não só no componente da página.
  ///
  /// A página renderiza em streaming: quando `notFound()` era chamado lá
  /// dentro, o cabeçalho HTTP já tinha sido enviado com status 200 e o Next não
  /// tinha mais como corrigi-lo. O resultado era um "soft 404" — a tela dizia
  /// "Página não encontrada" mas a resposta afirmava 200 OK, e o buscador
  /// indexava cada URL errada ou removida como página válida.
  ///
  /// A geração de metadados acontece antes do primeiro envio, então interromper
  /// daqui produz o 404 de verdade.
  if (!property) notFound()

  const price = formatPrice(property.price)
  const typeLabel = PROPERTY_TYPE_LABEL[property.type] ?? 'Imóvel'
  const purposeLabel = property.purpose === 'venda' ? 'à venda' : 'para alugar'

  /// O title carrega tipo + finalidade + bairro + cidade + preço, que é a forma
  /// como a busca local é digitada ("casa à venda no Centro Corumbá"). O nome do
  /// site é acrescentado pelo template do layout.
  /// `absolute`: o anúncio já gasta o espaço útil do title com tipo, bairro,
  /// cidade e preço. Somar a marca no fim só empurraria o preço para além do
  /// que o buscador exibe.
  const localTitle = isRealNeighborhood(property.neighborhood)
    ? `${property.neighborhood}, ${property.city}-MS`
    : `${property.city}-MS`
  const title = {
    absolute: `${typeLabel} ${purposeLabel} em ${localTitle} — ${price}`,
  }
  const url = `/imovel/${property.slug}`
  const description = buildDescription(property)
  const cover = property.gallery?.[0]
  const imageUrl = getAbsoluteUrl(cover?.src || property.coverImage)

  /// Vendido/alugado sai do índice: manter um anúncio encerrado ranqueando gera
  /// visita frustrada e sinal negativo. `follow` continua ligado para o robô
  /// seguir daqui para os imóveis relacionados, que estão ativos.
  const shouldIndex =
    property.status === 'disponivel' || property.status === 'reservado'

  return buildMetadata({
    path: url,
    title,
    description,
    keywords: [
      `${typeLabel} ${purposeLabel} ${property.city}`,
      ...(isRealNeighborhood(property.neighborhood)
        ? [`imóvel ${property.neighborhood} ${property.city}`]
        : []),
      `${typeLabel} ${property.city} MS`,
      ...property.tags,
    ],
    robots: shouldIndex ? undefined : { index: false, follow: true },
    openGraph: {
      title: `${property.title} — ${price} | ${SITE_NAME}`,
      description,
      url: getAbsoluteUrl(url),
      /// `article` em vez de `website`: dá ao anúncio data de publicação e de
      /// alteração nas prévias, que é o que sinaliza anúncio recente.
      type: 'article',
      publishedTime: property.createdAt,
      modifiedTime: property.updatedAt,
      images: [
        {
          url: imageUrl,
          width: cover?.width || 1200,
          height: cover?.height || 800,
          alt: `${property.title} — ${localTitle}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${property.title} — ${price}`,
      description,
      images: [imageUrl],
    },
  })
}

export default async function ImovelPage({ params }: PageProps) {
  const { slug } = await params
  const property = await getPropertyBySlug(slug)

  if (!property) notFound()

  const url = getAbsoluteUrl(`/imovel/${property.slug}`)
  const price = formatPrice(property.price)

  const purposeLabel = property.purpose === 'venda' ? 'Venda' : 'Aluguel'

  return (
    <section className="pb-24 pt-8 lg:pb-12">
      <Container>
        <Breadcrumbs
          items={[
            { label: 'Imóveis', href: '/imoveis' },
            {
              label: purposeLabel,
              href: `/imoveis/${property.purpose === 'venda' ? 'venda' : 'aluguel'}`,
            },
            { label: property.title },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <PurposeBadge purpose={property.purpose} />
              <StatusBadge status={property.status} />
              {property.specialOpportunity && <OpportunityBadge />}
            </div>

            <h1 className="text-2xl font-bold text-cinza-900 sm:text-3xl">
              {property.title}
            </h1>
            <p className="mt-1 text-cinza-600">
              {property.city}
              {isRealNeighborhood(property.neighborhood) &&
                ` — ${property.neighborhood}`}
            </p>
            <p className="mt-1 text-xs text-cinza-600/80">
              Publicado em{' '}
              <time dateTime={property.createdAt}>
                {formatDateLong(property.createdAt)}
              </time>
              {property.updatedAt.slice(0, 10) !==
                property.createdAt.slice(0, 10) && (
                <>
                  {' · atualizado em '}
                  <time dateTime={property.updatedAt}>
                    {formatDateLong(property.updatedAt)}
                  </time>
                </>
              )}
            </p>

            <PropertyPrice
              price={property.price}
              priceSuffix={property.priceSuffix}
              priceNote={property.priceNote}
              size="lg"
              className="mt-4"
            />

            <div className="mt-4">
              <ShareButtons title={property.title} price={price} url={url} />
            </div>

            <div className="mt-6">
              <PropertyGallery
                images={property.gallery}
                title={property.title}
              />
            </div>

            <div className="mt-8">
              <h2 className="mb-4 text-xl font-bold text-cinza-900">
                Características
              </h2>
              <PropertyFeatures property={property} />
            </div>

            <div className="mt-8">
              <PropertyDescription
                description={property.longDescription}
                tags={property.tags}
              />
            </div>

            <div className="mt-8 rounded-lg bg-cinza-50 p-4">
              <h2 className="mb-1 text-sm font-semibold text-cinza-900">
                Localização
              </h2>
              <p className="text-sm text-cinza-600">
                {isRealNeighborhood(property.neighborhood) &&
                  `${property.neighborhood}, `}
                {property.city} — MS
              </p>
              {/* Links internos para a cidade e o tipo. Servem ao visitante que
                  quer ver opções parecidas e, ao mesmo tempo, distribuem
                  autoridade da página do imóvel para as páginas de catálogo,
                  que são as que disputam as buscas genéricas da região. */}
              <p className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-sm">
                <Link
                  href={`/imoveis/${property.citySlug}`}
                  className="font-medium text-azul-escuro underline-offset-4 hover:underline"
                >
                  Ver todos os imóveis em {property.city}
                </Link>
                <span className="text-cinza-600">·</span>
                <Link
                  href={`/imoveis/${CATEGORY_BY_TYPE[property.type]}`}
                  className="font-medium text-azul-escuro underline-offset-4 hover:underline"
                >
                  Ver mais {TYPE_PLURAL[property.type]}
                </Link>
              </p>
            </div>
          </div>

          <PropertyContactBox
            whatsappMessage={buildPropertyWhatsAppMessage({
              title: property.title,
              url,
              storedMessage: property.whatsappMessage,
            })}
          />
        </div>

        <RelatedProperties property={property} />
      </Container>

      {/* Anúncio completo em dados estruturados: oferta, disponibilidade,
          endereço, metragem, quartos, banheiros, comodidades e galeria. É o que
          permite o buscador (e os assistentes de IA) responderem "casa de 3
          quartos até R$ 300 mil em Corumbá" com este imóvel. */}
      <JsonLd data={buildGraph(buildPropertyJsonLd(property))} />
    </section>
  )
}
