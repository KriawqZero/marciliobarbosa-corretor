import type { Metadata } from 'next'
import { SITE_NAME } from './constants'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export function buildMetadata(overrides: Metadata & { path?: string }): Metadata {
  const { path, ...rest } = overrides
  const url = path ? `${siteUrl}${path}` : siteUrl

  return {
    ...rest,
    metadataBase: new URL(siteUrl),
    openGraph: {
      siteName: SITE_NAME,
      locale: 'pt_BR',
      type: 'website',
      url,
      ...rest.openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      ...rest.twitter,
    },
    other: {
      'geo.region': 'BR-MS',
      'geo.placename': 'Corumbá',
      ...rest.other,
    },
  }
}
