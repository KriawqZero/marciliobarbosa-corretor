import type { MetadataRoute } from 'next'
import { SITE_NAME, BROKER_NAME } from '@/lib/constants'

/// Manifesto do app. Não é fator de ranqueamento direto, mas é um dos itens que
/// o Lighthouse cobra na aba de boas práticas e o que permite o site ser
/// adicionado à tela inicial do celular — que é de onde vem a maior parte do
/// tráfego deste site.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Imóveis em Corumbá e Ladário-MS`,
    short_name: 'Marcilio Barbosa',
    description: `${BROKER_NAME}: casas, apartamentos, terrenos e áreas rurais em Corumbá-MS e Ladário-MS.`,
    lang: 'pt-BR',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0F2B46',
    categories: ['business', 'lifestyle', 'shopping'],
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
