import type { Metadata } from 'next'
import { Container } from '@/components/layout/container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { CTASection } from '@/components/sections/cta-section'
import { BROKER_NAME, BROKER_CRECI } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Sobre ${BROKER_NAME}`,
  description: `Conheça ${BROKER_NAME}, corretor de imóveis com experiência no mercado de Corumbá-MS e Ladário-MS. Atendimento personalizado e conhecimento da região.`,
}

export default function SobrePage() {
  return (
    <>
      <section className="py-8 lg:py-12">
        <Container>
          <Breadcrumbs items={[{ label: 'Sobre' }]} />

          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-8">
              <div className="mb-4 flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-full bg-azul-escuro text-4xl font-bold text-white sm:mb-0">
                MB
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
                Sou corretor de imóveis atuando em <strong className="text-cinza-900">Corumbá-MS</strong> e{' '}
                <strong className="text-cinza-900">Ladário-MS</strong>, duas cidades
                irmãs no coração do Pantanal Sul-Mato-Grossense. Com experiência
                no mercado imobiliário local, ofereço atendimento personalizado
                para quem busca comprar, vender ou alugar imóveis na região.
              </p>

              <p>
                Conheço profundamente cada bairro, cada oportunidade e as
                particularidades do mercado de Corumbá e Ladário. Meu objetivo é
                ajudar você a encontrar o imóvel ideal — seja uma casa para sua
                família, um terreno para construir, um apartamento prático ou uma
                oportunidade de negócio.
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
    </>
  )
}
