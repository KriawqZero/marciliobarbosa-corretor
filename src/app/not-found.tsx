import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { WhatsAppButton } from '@/components/shared/whatsapp-button'

/// O Next já devolve status 404, que é o sinal que importa. O `noindex` é a
/// garantia extra para o caso de a página 404 ser servida com 200 por algum
/// proxy ou CDN no caminho — situação em que o buscador indexaria "Página não
/// encontrada" como se fosse conteúdo do site.
export const metadata: Metadata = {
  title: 'Página não encontrada',
  robots: { index: false, follow: true },
}

/// Atalhos a partir do erro. Uma 404 sem saída é beco: a pessoa volta para o
/// buscador, e essa volta rápida é lida como resultado ruim.
const ATALHOS = [
  { href: '/imoveis/venda', label: 'Imóveis à venda' },
  { href: '/imoveis/aluguel', label: 'Imóveis para alugar' },
  { href: '/imoveis/corumba', label: 'Imóveis em Corumbá' },
  { href: '/imoveis/ladario', label: 'Imóveis em Ladário' },
]

export default function NotFound() {
  return (
    <section className="py-24 lg:py-32">
      <Container>
        <div className="mx-auto max-w-lg text-center">
          <p className="text-6xl font-bold text-azul-escuro">404</p>
          <h1 className="mt-4 text-2xl font-bold text-cinza-900 sm:text-3xl">
            Página não encontrada
          </h1>
          <p className="mt-3 text-cinza-600">
            A página que você procura não existe ou foi removida. Que tal
            explorar nossos imóveis disponíveis?
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button href="/">Voltar ao início</Button>
            <Button href="/imoveis" variant="secondary">
              Ver imóveis
            </Button>
          </div>
          <div className="mt-6">
            <WhatsAppButton size="sm" />
          </div>

          <div className="mt-10 border-t border-cinza-200 pt-6">
            <p className="mb-3 text-sm font-semibold text-cinza-900">
              Ou vá direto para:
            </p>
            <ul className="flex flex-wrap justify-center gap-2">
              {ATALHOS.map((atalho) => (
                <li key={atalho.href}>
                  <Link
                    href={atalho.href}
                    className="inline-flex rounded-full border border-cinza-200 px-3.5 py-1.5 text-sm text-cinza-600 transition-colors hover:border-azul-medio hover:text-azul-escuro"
                  >
                    {atalho.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  )
}
