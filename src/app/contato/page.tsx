import type { Metadata } from 'next'
import { Container } from '@/components/layout/container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ContactSection } from '@/components/shared/contact-section'
import { BROKER_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Entre em Contato',
  description: `Entre em contato com ${BROKER_NAME}, corretor de imóveis em Corumbá e Ladário. Atendimento via WhatsApp, telefone e e-mail.`,
}

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
    </section>
  )
}
