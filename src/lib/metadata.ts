import type { Metadata } from 'next'
import { SITE_NAME, BROKER_NAME } from './constants'

/// Sem barra no fim: todo `${SITE_URL}${path}` depende disso para não gerar
/// `https://site.com//imoveis`, que o buscador trata como URL diferente.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://marciliobarbosacorretor.com.br'
).replace(/\/+$/, '')

export const DEFAULT_SOCIAL_IMAGE = '/marcilio.jpg'
export const LISTINGS_SOCIAL_IMAGE = '/a.jpg'

/// Diretiva de robots aplicada a toda página indexável.
///
/// `max-image-preview: large` é a mais importante do conjunto para este site:
/// sem ela o Google exibe a miniatura pequena (ou nenhuma) ao lado do
/// resultado. Num site de imóveis, a foto grande no resultado é metade do
/// clique. `max-snippet: -1` libera o tamanho do trecho de texto, o que ajuda a
/// descrição do imóvel a aparecer inteira.
export const INDEXABLE_ROBOTS: NonNullable<Metadata['robots']> = {
  index: true,
  follow: true,
  'max-image-preview': 'large',
  'max-snippet': -1,
  'max-video-preview': -1,
  googleBot: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
}

/// Para páginas que existem para o visitante mas não devem entrar no índice:
/// resultados filtrados, ordenados e busca. `follow` fica ligado para o robô
/// continuar caminhando dali até as páginas de imóvel, que são as que importam.
export const NOINDEX_FOLLOW_ROBOTS: NonNullable<Metadata['robots']> = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
}

const DEFAULT_OG_IMAGE = {
  url: DEFAULT_SOCIAL_IMAGE,
  width: 1200,
  height: 1200,
  alt: `${BROKER_NAME} — corretor de imóveis em Corumbá e Ladário-MS`,
}

/// Mescla robots preservando o que a página pediu. Sem isto, uma página que só
/// quer dizer `index: false` acabava descartando `max-image-preview` junto.
function mergeRobots(override: Metadata['robots']): Metadata['robots'] {
  if (!override) return INDEXABLE_ROBOTS
  if (typeof override === 'string') return override

  const base = INDEXABLE_ROBOTS as Record<string, unknown>
  const googleBotOverride =
    typeof override.googleBot === 'object' && override.googleBot !== null
      ? override.googleBot
      : undefined

  return {
    ...base,
    ...override,
    googleBot: {
      ...(base.googleBot as Record<string, unknown>),
      ...(typeof override.googleBot === 'string'
        ? {}
        : (googleBotOverride ?? {})),
    },
  } as Metadata['robots']
}

export function buildMetadata(overrides: Metadata & { path?: string }): Metadata {
  const { path, ...rest } = overrides
  const url = path ? `${SITE_URL}${path}` : SITE_URL

  return {
    ...rest,
    metadataBase: new URL(SITE_URL),
    robots: mergeRobots(rest.robots),
    alternates: {
      canonical: path ?? '/',
      ...rest.alternates,
    },
    openGraph: {
      siteName: SITE_NAME,
      locale: 'pt_BR',
      type: 'website',
      url,
      images: [DEFAULT_OG_IMAGE],
      ...rest.openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      images: [DEFAULT_SOCIAL_IMAGE],
      ...rest.twitter,
    },
    other: {
      'geo.region': 'BR-MS',
      'geo.placename': 'Corumbá',
      ...rest.other,
    },
  }
}

export function getAbsoluteUrl(path: string): string {
  if (!path) return SITE_URL
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
