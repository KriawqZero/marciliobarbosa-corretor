import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { HeroFilterPanel } from '@/components/search/hero-filter-panel'
import { getWhatsAppLink } from '@/lib/whatsapp'
import { HeroVideoBackground } from '@/components/sections/hero-video-background'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-azul-escuro py-16 sm:py-20 lg:py-32">
      <div className="absolute inset-0">
        {/* Fallback leve para acessibilidade/compatibilidade */}
        <div className="hero-youtube-fallback absolute inset-0 bg-gradient-to-br from-azul-escuro via-azul-escuro/95 to-azul-medio" />
        <div className="hero-youtube-fallback absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(44,95,138,0.4),transparent_70%)]" />

        {/* Background de vídeo (sem controles) */}
        <HeroVideoBackground />

        {/* Escurece o vídeo para manter contraste do texto */}
        <div className="hero-youtube-overlay" aria-hidden="true" />
      </div>

      <Container className="relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-dourado">
              Corumbá &amp; Ladário — MS
            </p>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Encontre o imóvel ideal com quem conhece a região
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/70">
              Casas, terrenos, apartamentos e oportunidades exclusivas no coração do Pantanal. Atendimento personalizado do início ao fim.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                href={getWhatsAppLink()}
                variant="whatsapp"
                size="lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Falar no WhatsApp
              </Button>
              <Button href="/sobre" variant="ghost" size="lg" className="text-white/80 hover:text-white hover:bg-white/10">
                Conheça o corretor
              </Button>
            </div>
          </div>
          <div className="lg:pl-4">
            <HeroFilterPanel />
          </div>
        </div>
      </Container>
    </section>
  )
}
