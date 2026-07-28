import Image from 'next/image'
import Link from 'next/link'
import { Container } from './container'
import {
  BROKER_PHONE_DISPLAY,
  BROKER_PHONE_TEL,
  BROKER_EMAIL,
  BROKER_CRECI,
  BROKER_FOUNDING_YEAR,
  BROKER_NAME,
  BROKER_SOCIAL_PROFILES,
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
            // Dimensões intrínsecas do SVG (viewBox 878.28x152.97). Com 220x40 o
            // navegador reservava uma caixa de proporção errada e a largura
            // mudava quando o arquivo chegava.
            width={878}
            height={153}
            className="mb-4 h-10 w-auto"
          />
          <p className="mb-2 text-sm text-white/70">
            Corretor de imóveis em Corumbá-MS e Ladário-MS. Atendimento
            personalizado para compra, venda e aluguel.
          </p>
          <p className="text-xs text-white/50">
            {BROKER_CRECI} · Atuando desde {BROKER_FOUNDING_YEAR}
          </p>

          {/* Os perfis existiam apenas dentro do `sameAs` do JSON-LD: o
              buscador enxergava, o visitante não. Link visível também é o que
              faz o perfil receber visita a partir do site. */}
          {BROKER_SOCIAL_PROFILES.length > 0 && (
            <div className="mt-4 flex items-center gap-3">
              {BROKER_SOCIAL_PROFILES.map((url) => {
                const network = url.includes('instagram')
                  ? 'Instagram'
                  : url.includes('facebook')
                    ? 'Facebook'
                    : 'Perfil'
                return (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    aria-label={`${network} de ${BROKER_NAME}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-white hover:text-white"
                  >
                    {network === 'Instagram' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect width="20" height="20" x="2" y="2" rx="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12z" />
                      </svg>
                    )}
                  </a>
                )
              })}
            </div>
          )}
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
              href={`tel:${BROKER_PHONE_TEL}`}
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
            reservados. ·{' '}
            <Link
              href="/privacidade"
              className="underline underline-offset-2 transition-colors hover:text-white"
            >
              Política de Privacidade
            </Link>
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
