import type { Metadata } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { WhatsAppCTA } from '@/components/shared/whatsapp-cta'
import { SITE_NAME, BROKER_NAME } from '@/lib/constants'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })
const fraunces = Fraunces({ subsets: ['latin'], display: 'swap', variable: '--font-heading' })

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Imóveis em Corumbá e Ladário`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `${BROKER_NAME}, corretor de imóveis em Corumbá-MS e Ladário-MS. Casas, terrenos, apartamentos e oportunidades. Atendimento personalizado via WhatsApp.`,
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ),
  openGraph: {
    siteName: SITE_NAME,
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  other: {
    'geo.region': 'BR-MS',
    'geo.placename': 'Corumbá',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} ${fraunces.variable} antialiased`}>
        <Header />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <Footer />
        <WhatsAppCTA />
      </body>
    </html>
  )
}
