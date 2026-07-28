import type { Metadata } from 'next'
import Image from 'next/image'
import { Container } from '@/components/layout/container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { CTASection } from '@/components/sections/cta-section'
import { JsonLd } from '@/components/shared/json-ld'
import { buildAboutPageJsonLd, buildGraph } from '@/lib/jsonld'
import {
  BROKER_NAME,
  BROKER_CRECI,
  BROKER_FOUNDING_YEAR,
} from '@/lib/constants'
import { buildMetadata, DEFAULT_SOCIAL_IMAGE } from '@/lib/metadata'

export const metadata: Metadata = buildMetadata({
  path: '/sobre',
  title: {
    absolute: `Sobre ${BROKER_NAME} — Corretor de Imóveis em Corumbá-MS`,
  },
  description: `Conheça ${BROKER_NAME}, corretor de imóveis registrado (${BROKER_CRECI}) em Corumbá-MS e Ladário-MS. Experiência local, atendimento personalizado e apoio na documentação e no financiamento.`,
  alternates: {
    canonical: '/sobre',
  },
  openGraph: {
    title: `Sobre ${BROKER_NAME} — Corretor de imóveis em Corumbá e Ladário`,
    description:
      'Atendimento imobiliário com foco em Corumbá e Ladário: transparência, agilidade e conhecimento da região.',
    type: 'profile',
    images: [
      {
        url: DEFAULT_SOCIAL_IMAGE,
        width: 1200,
        height: 1200,
        alt: `Foto de ${BROKER_NAME}, corretor de imóveis em Corumbá-MS`,
      },
    ],
  },
  twitter: {
    title: `Sobre ${BROKER_NAME} — Corretor de imóveis`,
    description:
      'Conheça o corretor e o trabalho imobiliário em Corumbá e Ladário.',
    images: [DEFAULT_SOCIAL_IMAGE],
  },
})

export default function SobrePage() {
  return (
    <>
      <section className="py-8 lg:py-12">
        <Container>
          <Breadcrumbs items={[{ label: 'Sobre' }]} />

          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-8">
              <div className="relative mb-4 h-32 w-32 flex-shrink-0 overflow-hidden rounded-full bg-azul-escuro sm:mb-0">
                <Image
                  src="/marcilio.jpg"
                  alt={`${BROKER_NAME}, corretor de imóveis em Corumbá-MS e Ladário-MS`}
                  fill
                  sizes="(max-width: 768px) 100vw, 128px"
                  className="object-cover"
                  priority
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-cinza-900 sm:text-3xl">
                  {BROKER_NAME}
                </h1>
                <p className="mt-1 text-azul-medio font-medium">
                  Corretor de Imóveis — {BROKER_CRECI}
                </p>
              </div>
            </div>

            <div className="space-y-6 leading-relaxed text-cinza-600">
              <p>
                Sou corretor de imóveis registrado no{' '}
                <strong className="text-cinza-900">{BROKER_CRECI}</strong> e atuo
                desde <strong className="text-cinza-900">{BROKER_FOUNDING_YEAR}</strong>{' '}
                em <strong className="text-cinza-900">Corumbá-MS</strong> e{' '}
                <strong className="text-cinza-900">Ladário-MS</strong>, duas cidades
                irmãs no coração do Pantanal Sul-Mato-Grossense. Atendo quem quer
                comprar, vender ou alugar na região.
              </p>

              <p>
                O que mais aparece por aqui é casa e terreno em Corumbá — e é
                onde tenho mais opção para mostrar. Apartamento é estoque
                pequeno na cidade e sai rápido; área rural e ponto comercial
                aparecem de tempos em tempos, e costumam ser negócio pontual.
                Se você procura algo que não está no site, me chame: nem tudo
                que passa pela minha mão chega a ser anunciado.
              </p>

              <h2 className="text-xl font-bold text-cinza-900 pt-4">
                Como funciona o atendimento
              </h2>

              <p>
                Não tem formulário longo nem cadastro para ver preço. Você abre
                o anúncio, clica no WhatsApp e fala comigo — não com um call
                center, não com um robô. Combinamos a visita no horário que der
                para você, inclusive sábado de manhã.
              </p>

              <p>
                Depois que você escolhe o imóvel, o trabalho continua: eu
                acompanho a proposta, a conferência da documentação e, quando é
                o caso, o processo de financiamento junto ao banco. É a parte
                que mais trava negócio na prática — documento de inventário
                pendente, imóvel que não passa na avaliação, terreno sem
                registro atualizado. Vale conversar antes de sair visitando,
                principalmente se for financiar: saber quanto o banco aprova
                muda a lista de imóveis que faz sentido ver.
              </p>

              <h2 className="text-xl font-bold text-cinza-900 pt-4">
                Por que trabalhar comigo?
              </h2>

              <ul className="space-y-3">
                {[
                  'Conhecimento profundo do mercado local de Corumbá e Ladário',
                  'Atendimento rápido e personalizado via WhatsApp',
                  'Transparência em todas as negociações',
                  'Auxílio com documentação e financiamento',
                  'Portfólio diversificado: casas, terrenos, apartamentos, comercial e rural',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 text-verde">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h2 className="text-xl font-bold text-cinza-900 pt-4">
                Sobre a região
              </h2>

              <p>
                Corumbá, conhecida como Capital do Pantanal, é uma cidade
                histórica e culturalmente rica, localizada na fronteira com a
                Bolívia. Ladário, cidade vizinha, é conhecida por ser base da
                Marinha do Brasil e por sua qualidade de vida tranquila.
                Juntas, oferecem um mercado imobiliário com excelente
                custo-benefício e oportunidades únicas.
              </p>
            </div>
          </div>
        </Container>
      </section>
      <CTASection />

      {/* Liga a pessoa (o corretor) à entidade de negócio declarada no layout.
          É o par que faz o buscador entender "Marcilio Barbosa" como um
          profissional real com registro, e não como uma marca genérica. */}
      <JsonLd data={buildGraph(buildAboutPageJsonLd())} />
    </>
  )
}
