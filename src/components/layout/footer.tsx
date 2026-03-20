import Image from 'next/image'
import Link from 'next/link'
import { Container } from './container'
import {
  BROKER_PHONE_DISPLAY,
  BROKER_EMAIL,
  BROKER_CRECI,
  SITE_NAME,
} from '@/lib/constants'
import { getWhatsAppLink } from '@/lib/whatsapp'

export function Footer() {
  return (
    <footer className="bg-azul-escuro text-white/90">
      <Container className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image
            src="/LogoMarcilioBarbosaCorretor/Logo%20Marcilio%20Barbosa%20(1).svg"
            alt="Marcilio Barbosa Corretor"
            width={220}
            height={40}
            className="mb-4 h-10 w-auto"
          />
          <p className="mb-2 text-sm text-white/70">
            Corretor de imóveis em Corumbá-MS e Ladário-MS. Atendimento
            personalizado para compra, venda e aluguel.
          </p>
          <p className="text-xs text-white/50">{BROKER_CRECI}</p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            Links Rápidos
          </h4>
          <nav className="flex flex-col gap-2">
            <Link
              href="/"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Início
            </Link>
            <Link
              href="/imoveis"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Todos os Imóveis
            </Link>
            <Link
              href="/imoveis/venda"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Imóveis à Venda
            </Link>
            <Link
              href="/imoveis/aluguel"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Imóveis para Alugar
            </Link>
            <Link
              href="/sobre"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Sobre
            </Link>
            <Link
              href="/contato"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Contato
            </Link>
          </nav>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            Cidades Atendidas
          </h4>
          <nav className="flex flex-col gap-2">
            <Link
              href="/imoveis/corumba"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Corumbá-MS
            </Link>
            <Link
              href="/imoveis/ladario"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Ladário-MS
            </Link>
          </nav>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            Contato
          </h4>
          <div className="flex flex-col gap-2">
            <a
              href={`tel:+${BROKER_PHONE_DISPLAY.replace(/\D/g, '')}`}
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              {BROKER_PHONE_DISPLAY}
            </a>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              WhatsApp
            </a>
            <a
              href={`mailto:${BROKER_EMAIL}`}
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              {BROKER_EMAIL}
            </a>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 sm:flex-row">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} {SITE_NAME}. Todos os direitos
            reservados.
          </p>
          <p className="text-xs text-white/50">
            Desenvolvido por{' '}
            <a
              href="https://marciliortiz.dev.br"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-white"
            >
              Marcilio Ortiz
            </a>
          </p>
        </Container>
      </div>
    </footer>
  )
}
