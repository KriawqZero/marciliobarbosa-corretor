import type { Property } from '@/types'
import {
  BROKER_CRECI,
  BROKER_EMAIL,
  BROKER_FOUNDING_YEAR,
  BROKER_LATITUDE,
  BROKER_LONGITUDE,
  BROKER_NAME,
  BROKER_OPENING_HOURS,
  BROKER_PHONE_TEL,
  BROKER_POSTAL_CODE,
  BROKER_PRICE_RANGE,
  BROKER_SOCIAL_PROFILES,
  BROKER_STREET_ADDRESS,
  CITY_GEO,
  PROPERTY_TYPE_LABEL,
  SITE_NAME,
} from './constants'
import { SITE_URL, getAbsoluteUrl } from './metadata'

/// Identificadores estáveis do grafo. Usar `@id` em vez de repetir o bloco
/// inteiro do corretor em cada página é o que faz o buscador entender que é
/// sempre a mesma entidade, em vez de dezenas de negócios homônimos.
export const ORGANIZATION_ID = `${SITE_URL}/#corretor`
export const WEBSITE_ID = `${SITE_URL}/#website`

type JsonLdObject = Record<string, unknown>

/// Remove chaves vazias em profundidade. Um `streetAddress: ''` no JSON-LD é
/// pior que a ausência do campo: o buscador lê como endereço em branco.
function pruneEmpty<T>(value: T): T {
  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => pruneEmpty(item))
      .filter((item) => item !== undefined)
    return cleaned as unknown as T
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as JsonLdObject)
      .map(([key, val]) => [key, pruneEmpty(val)] as const)
      .filter(([, val]) => {
        if (val === undefined || val === null || val === '') return false
        if (Array.isArray(val) && val.length === 0) return false
        if (
          typeof val === 'object' &&
          !Array.isArray(val) &&
          Object.keys(val as JsonLdObject).length === 0
        ) {
          return false
        }
        return true
      })
    return Object.fromEntries(entries) as T
  }

  return value
}

function cityAddress(citySlug: string, cityName: string): JsonLdObject {
  const geo = CITY_GEO[citySlug]
  return {
    '@type': 'PostalAddress',
    addressLocality: cityName,
    addressRegion: 'MS',
    postalCode: geo?.postalCode,
    addressCountry: 'BR',
  }
}

/// O corretor como entidade de negócio local. É este bloco que alimenta o
/// painel lateral do Google e as respostas de assistentes de IA sobre "corretor
/// de imóveis em Corumbá".
export function buildBrokerJsonLd(): JsonLdObject {
  const hasOffice = Boolean(BROKER_STREET_ADDRESS)

  return pruneEmpty({
    '@type': 'RealEstateAgent',
    '@id': ORGANIZATION_ID,
    name: BROKER_NAME,
    /// Só declara nome alternativo se ele de fato for outro; repetir o mesmo
    /// texto em `name` e `alternateName` não acrescenta nada ao buscador.
    alternateName: SITE_NAME === BROKER_NAME ? undefined : SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      /// Caminho com escape: o arquivo tem espaços e parênteses no nome, e uma
      /// URL crua aqui quebra o download da imagem pelo rastreador.
      url: getAbsoluteUrl(
        '/LogoMarcilioBarbosaCorretor/Logo%20Marcilio%20Barbosa%20(1).svg',
      ),
    },
    image: getAbsoluteUrl('/marcilio.jpg'),
    telephone: BROKER_PHONE_TEL,
    email: BROKER_EMAIL,
    priceRange: BROKER_PRICE_RANGE,
    currenciesAccepted: 'BRL',
    description: `Corretor de imóveis com atuação em Corumbá-MS e Ladário-MS. Compra, venda e locação de casas, apartamentos, terrenos, imóveis comerciais e áreas rurais. ${BROKER_CRECI}.`,
    foundingDate: BROKER_FOUNDING_YEAR,
    knowsLanguage: 'pt-BR',
    sameAs: BROKER_SOCIAL_PROFILES,
    /// Registro profissional: é o sinal de credibilidade que diferencia um
    /// corretor de um anunciante qualquer.
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Registro profissional',
      name: BROKER_CRECI,
      recognizedBy: {
        '@type': 'Organization',
        name: 'CRECI-MS — Conselho Regional de Corretores de Imóveis de Mato Grosso do Sul',
      },
    },
    address: hasOffice
      ? {
          '@type': 'PostalAddress',
          streetAddress: BROKER_STREET_ADDRESS,
          addressLocality: 'Corumbá',
          addressRegion: 'MS',
          postalCode: BROKER_POSTAL_CODE,
          addressCountry: 'BR',
        }
      : undefined,
    geo:
      BROKER_LATITUDE && BROKER_LONGITUDE
        ? {
            '@type': 'GeoCoordinates',
            latitude: BROKER_LATITUDE,
            longitude: BROKER_LONGITUDE,
          }
        : undefined,
    openingHoursSpecification: BROKER_OPENING_HOURS.map((slot) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: slot.days,
      opens: slot.opens,
      closes: slot.closes,
    })),
    areaServed: Object.entries(CITY_GEO).map(([, geo]) => ({
      '@type': 'City',
      name: geo.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: geo.name,
        addressRegion: 'MS',
        addressCountry: 'BR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: geo.latitude,
        longitude: geo.longitude,
      },
    })),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Atendimento ao cliente',
      telephone: BROKER_PHONE_TEL,
      email: BROKER_EMAIL,
      areaServed: 'BR',
      availableLanguage: ['Portuguese'],
    },
  })
}

/// O site em si. `potentialAction` habilita a caixa de busca do site dentro do
/// resultado do Google quando o domínio ganha autoridade suficiente.
export function buildWebSiteJsonLd(): JsonLdObject {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: 'pt-BR',
    publisher: { '@id': ORGANIZATION_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/imoveis?busca={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export interface BreadcrumbEntry {
  label: string
  href?: string
}

/// A trilha de navegação vira aquela linha "Início > Imóveis > Venda" abaixo do
/// título no resultado de busca, no lugar da URL crua.
export function buildBreadcrumbJsonLd(items: BreadcrumbEntry[]): JsonLdObject {
  const all: BreadcrumbEntry[] = [{ label: 'Início', href: '/' }, ...items]

  return {
    '@type': 'BreadcrumbList',
    itemListElement: all.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: getAbsoluteUrl(item.href) } : {}),
    })),
  }
}

/// Lista de resultados de uma página de catálogo. Dá ao buscador a ordem e a
/// identidade dos imóveis daquela página em vez de um bloco de HTML anônimo.
export function buildItemListJsonLd(
  properties: Property[],
  { path, page = 1, limit = 12 }: { path: string; page?: number; limit?: number },
): JsonLdObject {
  return {
    '@type': 'ItemList',
    '@id': `${getAbsoluteUrl(path)}#lista`,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: properties.length,
    itemListElement: properties.map((property, index) => ({
      '@type': 'ListItem',
      position: (page - 1) * limit + index + 1,
      url: getAbsoluteUrl(`/imovel/${property.slug}`),
      name: property.title,
    })),
  }
}

const RESIDENCE_TYPE: Record<string, string> = {
  casa: 'SingleFamilyResidence',
  apartamento: 'Apartment',
  terreno: 'Place',
  rural: 'Place',
  comercial: 'Place',
}

const BUSINESS_FUNCTION: Record<string, string> = {
  venda: 'http://purl.org/goodrelations/v1#Sell',
  aluguel: 'http://purl.org/goodrelations/v1#LeaseOut',
}

function availabilityFor(status: Property['status']): string {
  switch (status) {
    case 'disponivel':
      return 'https://schema.org/InStock'
    case 'reservado':
      return 'https://schema.org/LimitedAvailability'
    default:
      return 'https://schema.org/SoldOut'
  }
}

/// Google exige `priceValidUntil` em oferta para não rebaixar o dado como
/// desatualizado. Um ano a partir da última alteração é a janela realista de um
/// anúncio imobiliário; toda edição do imóvel empurra a data para frente.
function priceValidUntil(updatedAt: string): string {
  const base = new Date(updatedAt)
  const valid = new Date(base)
  valid.setFullYear(valid.getFullYear() + 1)
  return valid.toISOString().slice(0, 10)
}

export function buildPropertyJsonLd(property: Property): JsonLdObject {
  const path = `/imovel/${property.slug}`
  const url = getAbsoluteUrl(path)
  const typeLabel = PROPERTY_TYPE_LABEL[property.type] ?? 'Imóvel'
  const address = cityAddress(property.citySlug, property.city)
  const geo = CITY_GEO[property.citySlug]

  const images = (
    property.gallery?.length
      ? property.gallery.map((image) => image.src)
      : [property.coverImage]
  )
    .filter(Boolean)
    .map((src) => getAbsoluteUrl(src))

  /// Comodidades declaradas: as tags do imóvel viram atributos consultáveis em
  /// vez de texto solto na descrição.
  const amenities = [
    ...property.tags.map((tag) => ({
      '@type': 'LocationFeatureSpecification',
      name: tag,
      value: true,
    })),
    ...(property.parkingSpaces && property.parkingSpaces > 0
      ? [
          {
            '@type': 'LocationFeatureSpecification',
            name: 'Vagas de garagem',
            value: property.parkingSpaces,
          },
        ]
      : []),
  ]

  const accommodation: JsonLdObject = {
    '@type': RESIDENCE_TYPE[property.type] ?? 'Place',
    '@id': `${url}#imovel`,
    name: property.title,
    description: property.shortDescription,
    url,
    image: images,
    address,
    geo: geo
      ? {
          '@type': 'GeoCoordinates',
          latitude: geo.latitude,
          longitude: geo.longitude,
        }
      : undefined,
    /// Área construída é `floorSize`; a área do lote é `additionalProperty`,
    /// porque schema.org não define um campo de terreno para residências.
    floorSize: property.builtArea
      ? {
          '@type': 'QuantitativeValue',
          value: property.builtArea,
          unitCode: 'MTK',
        }
      : undefined,
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Área total do terreno',
        value: property.totalArea,
        unitCode: 'MTK',
      },
      {
        '@type': 'PropertyValue',
        name: 'Bairro',
        value: property.neighborhood,
      },
      {
        '@type': 'PropertyValue',
        name: 'Tipo de imóvel',
        value: typeLabel,
      },
    ],
    numberOfBedrooms: property.bedrooms || undefined,
    numberOfBathroomsTotal: property.bathrooms || undefined,
    numberOfRooms: property.bedrooms || undefined,
    amenityFeature: amenities,
  }

  const offer: JsonLdObject = {
    '@type': 'Offer',
    '@id': `${url}#oferta`,
    url,
    price: property.price,
    priceCurrency: 'BRL',
    availability: availabilityFor(property.status),
    businessFunction: BUSINESS_FUNCTION[property.purpose],
    validFrom: property.createdAt,
    priceValidUntil: priceValidUntil(property.updatedAt),
    seller: { '@id': ORGANIZATION_ID },
    itemOffered: { '@id': `${url}#imovel` },
    areaServed: {
      '@type': 'City',
      name: property.city,
    },
    /// No aluguel o valor é mensal. Sem esta especificação o buscador lê
    /// "R$ 1.800" como preço de compra do imóvel.
    priceSpecification:
      property.purpose === 'aluguel'
        ? {
            '@type': 'UnitPriceSpecification',
            price: property.price,
            priceCurrency: 'BRL',
            unitCode: 'MON',
            unitText: 'por mês',
          }
        : undefined,
  }

  return pruneEmpty({
    '@type': 'RealEstateListing',
    '@id': `${url}#anuncio`,
    url,
    name: `${property.title} — ${property.neighborhood}, ${property.city}-MS`,
    headline: property.title,
    description: property.shortDescription,
    inLanguage: 'pt-BR',
    image: images,
    datePosted: property.createdAt,
    dateModified: property.updatedAt,
    isPartOf: { '@id': WEBSITE_ID },
    provider: { '@id': ORGANIZATION_ID },
    about: accommodation,
    /// Referência por `@id`, não cópia: o imóvel já está descrito inteiro em
    /// `about`. Repetir o objeto dobrava o tamanho do JSON-LD em cada página
    /// sem dizer nada de novo ao buscador.
    mainEntity: { '@id': `${url}#imovel` },
    offers: offer,
    /// Localidade do anúncio no nível da página: usado por buscas com
    /// intenção geográfica ("casa à venda perto de mim").
    spatialCoverage: {
      '@type': 'City',
      name: property.city,
      address,
    },
  })
}

/// Página institucional do corretor, ligada à mesma entidade de negócio.
export function buildAboutPageJsonLd(): JsonLdObject {
  return pruneEmpty({
    '@type': 'AboutPage',
    '@id': `${SITE_URL}/sobre#pagina`,
    url: `${SITE_URL}/sobre`,
    name: `Sobre ${BROKER_NAME}`,
    inLanguage: 'pt-BR',
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
    mainEntity: {
      '@type': 'Person',
      '@id': `${SITE_URL}/sobre#pessoa`,
      name: BROKER_NAME,
      jobTitle: 'Corretor de Imóveis',
      image: getAbsoluteUrl('/marcilio.jpg'),
      telephone: BROKER_PHONE_TEL,
      email: BROKER_EMAIL,
      knowsLanguage: 'pt-BR',
      sameAs: BROKER_SOCIAL_PROFILES,
      worksFor: { '@id': ORGANIZATION_ID },
      areaServed: Object.values(CITY_GEO).map((geo) => ({
        '@type': 'City',
        name: geo.name,
      })),
    },
  })
}

export function buildContactPageJsonLd(): JsonLdObject {
  return {
    '@type': 'ContactPage',
    '@id': `${SITE_URL}/contato#pagina`,
    url: `${SITE_URL}/contato`,
    name: `Contato — ${BROKER_NAME}`,
    inLanguage: 'pt-BR',
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
  }
}

/// Página de catálogo (todos os imóveis / categoria).
export function buildCollectionPageJsonLd({
  path,
  name,
  description,
}: {
  path: string
  name: string
  description: string
}): JsonLdObject {
  return {
    '@type': 'CollectionPage',
    '@id': `${getAbsoluteUrl(path)}#pagina`,
    url: getAbsoluteUrl(path),
    name,
    description,
    inLanguage: 'pt-BR',
    isPartOf: { '@id': WEBSITE_ID },
    provider: { '@id': ORGANIZATION_ID },
  }
}

/// Monta o documento final. Um único `@graph` por página, em vez de vários
/// blocos soltos, é o formato que o Google recomenda e o que permite os `@id`
/// se referenciarem entre si.
export function buildGraph(...nodes: JsonLdObject[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  }
}
