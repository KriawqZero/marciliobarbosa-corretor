import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { BROKER_NAME } from '@/lib/constants'

const benefits = [
  {
    title: 'Conhecimento local',
    description: 'Conheço cada bairro, rua e oportunidade da região.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: 'Atendimento humano',
    description: 'Acompanhamento personalizado do início ao fim.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'Negociação segura',
    description: 'Transparência e segurança em cada transação.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
]

export function InstitutionalSection() {
  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2 lg:gap-16">
          <div className="relative">
            <div className="absolute -left-4 top-0 h-full w-1 rounded-full bg-gradient-to-b from-dourado to-azul-medio" />
            <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-xl bg-cinza-50 shadow-[var(--shadow-md)]">
              <div className="text-center">
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-azul-escuro text-4xl font-bold text-white shadow-[var(--shadow-lg)]">
                  MB
                </div>
                <p className="mt-4 text-sm text-cinza-600">Foto do corretor</p>
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-dourado">
              Sobre o corretor
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-cinza-900 sm:text-3xl lg:text-4xl">
              {BROKER_NAME}
            </h2>
            <p className="mt-2 text-sm font-medium text-azul-medio">
              Corretor de Imóveis
            </p>
            <p className="mt-4 leading-relaxed text-cinza-600">
              Com experiência no mercado imobiliário de Corumbá e Ladário,
              ofereço atendimento personalizado para quem busca comprar, vender
              ou alugar imóveis na região.
            </p>

            <div className="mt-6 space-y-4">
              {benefits.map((b) => (
                <div key={b.title} className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-azul-escuro/5 text-azul-escuro">
                    {b.icon}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-cinza-900">{b.title}</p>
                    <p className="text-sm text-cinza-600">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Button href="/sobre" variant="secondary">
                Conheça mais
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
