import type { Metadata } from 'next'
import { Container } from '@/components/layout/container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ContactSection } from '@/components/shared/contact-section'
import { JsonLd } from '@/components/shared/json-ld'
import { buildContactPageJsonLd, buildGraph } from '@/lib/jsonld'
import { BROKER_NAME, BROKER_PHONE_DISPLAY } from '@/lib/constants'
import { buildMetadata } from '@/lib/metadata'

/// Era a única página sem canônica, sem imagem social e fora do `buildMetadata`
/// — ou seja, sem as diretivas de robots do resto do site. Compartilhada no
/// WhatsApp, aparecia sem foto nenhuma.
export const metadata: Metadata = buildMetadata({
  path: '/contato',
  title: {
    absolute: `Contato — ${BROKER_NAME}, Corretor em Corumbá-MS`,
  },
  description: `Fale com ${BROKER_NAME}, corretor de imóveis em Corumbá-MS e Ladário-MS. Atendimento por WhatsApp ${BROKER_PHONE_DISPLAY}, telefone e e-mail.`,
  keywords: [
    'contato corretor de imóveis Corumbá',
    'telefone corretor Corumbá MS',
    'WhatsApp corretor Corumbá',
    'corretor Ladário MS contato',
  ],
  alternates: {
    canonical: '/contato',
  },
})

export default function ContatoPage() {
  return (
    <section className="py-8 lg:py-12">
      <Container>
        <Breadcrumbs items={[{ label: 'Contato' }]} />

        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-cinza-900 sm:text-3xl">
              Entre em Contato
            </h1>
            <p className="mt-2 text-cinza-600">
              Estou à disposição para ajudar você a encontrar o imóvel ideal.
              Escolha o canal de sua preferência.
            </p>
          </div>

          <ContactSection />

          <div className="mt-12 rounded-xl border border-cinza-200 bg-white p-6 lg:p-8">
            <h2 className="mb-6 text-xl font-bold text-cinza-900">
              Envie uma mensagem
            </h2>
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1 block text-sm font-medium text-cinza-900"
                  >
                    Nome
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Seu nome"
                    className="w-full rounded-lg border border-cinza-200 px-4 py-3 text-sm outline-none transition-colors placeholder:text-cinza-600/50 focus:border-azul-medio"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1 block text-sm font-medium text-cinza-900"
                  >
                    Telefone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="(67) 99999-9999"
                    className="w-full rounded-lg border border-cinza-200 px-4 py-3 text-sm outline-none transition-colors placeholder:text-cinza-600/50 focus:border-azul-medio"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="mb-1 block text-sm font-medium text-cinza-900"
                >
                  Mensagem
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Como posso te ajudar?"
                  className="w-full rounded-lg border border-cinza-200 px-4 py-3 text-sm outline-none transition-colors placeholder:text-cinza-600/50 focus:border-azul-medio"
                />
              </div>
              <p className="text-xs text-cinza-600">
                O formulário será ativado em breve. Enquanto isso, entre em
                contato pelo WhatsApp para atendimento imediato.
              </p>
            </form>
          </div>
        </div>
      </Container>

      <JsonLd data={buildGraph(buildContactPageJsonLd())} />
    </section>
  )
}
