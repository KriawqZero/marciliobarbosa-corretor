import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { WhatsAppButton } from '@/components/shared/whatsapp-button'

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
        </div>
      </Container>
    </section>
  )
}
