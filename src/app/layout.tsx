import type { Metadata, Viewport } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { WhatsAppCTA } from '@/components/shared/whatsapp-cta'
import { JsonLd } from '@/components/shared/json-ld'
import { SITE_NAME, BROKER_NAME } from '@/lib/constants'
import { INDEXABLE_ROBOTS, SITE_URL } from '@/lib/metadata'
import { buildBrokerJsonLd, buildGraph, buildWebSiteJsonLd } from '@/lib/jsonld'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })
const fraunces = Fraunces({ subsets: ['latin'], display: 'swap', variable: '--font-heading' })

/// O layout deliberadamente não declara `alternates.canonical`: canônica é uma
/// afirmação por página, e um valor herdado aqui apontaria todas as páginas que
/// esquecessem de definir a sua para a home.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  robots: INDEXABLE_ROBOTS,
  openGraph: {
    siteName: SITE_NAME,
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  title: {
    default: `${SITE_NAME} — Imóveis em Corumbá e Ladário-MS`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `${BROKER_NAME} em Corumbá-MS e Ladário-MS. Casas, terrenos, apartamentos e oportunidades com atendimento personalizado via WhatsApp.`,
  applicationName: SITE_NAME,
  authors: [{ name: BROKER_NAME }],
  creator: BROKER_NAME,
  publisher: BROKER_NAME,
  category: 'real estate',
  // Ícones vêm de `src/app/icon.png` e `src/app/apple-icon.png` (convenção do App
  // Router): o Next injeta as tags com URL versionada e cache longo.
  //
  // Os códigos de verificação saem do ambiente porque são por propriedade: quem
  // reivindica o domínio no Search Console/Bing cola o token no `.env` e não
  // precisa mexer em código.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
  other: {
    'geo.region': 'BR-MS',
    'geo.placename': 'Corumbá',
    // O Safari transforma sequências de números em links de telefone, o que
    // quebrava o preço ("R$ 380.000" virava link) e sujava o texto indexado.
    'format-detection': 'telephone=no',
  },
}

export const viewport: Viewport = {
  themeColor: '#0F2B46',
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Handshake antecipado com o domínio de mídia: as fotos dos imóveis são
            o maior recurso da página e o LCP na maioria das telas. */}
        <link
          rel="preconnect"
          href="https://media.marciliobarbosacorretor.com.br"
          crossOrigin=""
        />
        <link
          rel="dns-prefetch"
          href="https://media.marciliobarbosacorretor.com.br"
        />
        {/* Declarado no `<head>` e não em `alternates.types` porque o Next
            substitui o objeto `alternates` inteiro quando a página define a
            própria canônica — e aí o feed sumiria de quase todo o site. */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Imóveis recentes — Marcilio Barbosa Corretor"
          href="/feed.xml"
        />
        {/* Um único grafo em todas as páginas descreve quem é o corretor e o
            site. As páginas internas só referenciam por `@id`. */}
        <JsonLd data={buildGraph(buildBrokerJsonLd(), buildWebSiteJsonLd())} />
      </head>
      <body className={`${inter.className} ${fraunces.variable} antialiased`}>
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-azul-escuro focus:shadow-lg"
        >
          Pular para o conteúdo
        </a>
        <Header />
        <main id="conteudo" className="min-h-[calc(100vh-4rem)] pt-16">
          {children}
        </main>
        <Footer />
        <WhatsAppCTA />
      </body>
    </html>
  )
}
