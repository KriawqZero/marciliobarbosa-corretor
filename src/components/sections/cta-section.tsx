import { Container } from '@/components/layout/container'
import { WhatsAppButton } from '@/components/shared/whatsapp-button'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-azul-escuro py-16 lg:py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-azul-escuro via-azul-escuro to-azul-medio" />
      <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-dourado/10 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-azul-medio/30 blur-2xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-dourado/40 to-transparent" />
      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-dourado">
            Atendimento personalizado
          </p>
          <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            Procurando algo específico?
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/70">
            Fale diretamente comigo. Atendimento rápido e personalizado para encontrar o imóvel ideal.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <WhatsAppButton size="lg" />
            <Button href="/contato" variant="ghost" size="lg" className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20">
              Enviar mensagem
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
