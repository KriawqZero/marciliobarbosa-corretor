import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/layout/container'
import { BROKER_NAME, BROKER_CRECI } from '@/lib/constants'

/// Versão enxuta da antiga seção institucional: prova de que existe uma pessoa
/// real atrás do site, sem repetir a página /sobre inteira na home.
export function BrokerStrip() {
  return (
    <section className="border-t border-cinza-200 bg-cinza-50 py-10 lg:py-14">
      <Container>
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-azul-escuro">
            <Image
              src="/marcilio.jpg"
              alt={BROKER_NAME}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>

          <div className="flex-1">
            <p className="font-heading text-lg font-bold text-cinza-900">
              {BROKER_NAME}
            </p>
            <p className="text-sm text-cinza-600">
              Corretor de imóveis em Corumbá e Ladário — {BROKER_CRECI}
            </p>
          </div>

          <Link
            href="/sobre"
            className="inline-flex items-center gap-1 text-sm font-semibold text-azul-escuro underline-offset-4 hover:underline"
          >
            Conheça o corretor
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </Container>
    </section>
  )
}
