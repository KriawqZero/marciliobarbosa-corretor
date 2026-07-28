import Link from 'next/link'
import { Container } from '@/components/layout/container'
import { HeroSearch } from '@/components/search/hero-search'
import { HeroVideoBackground } from '@/components/sections/hero-video-background'
import type { CatalogCounts } from '@/data/services/properties'
import { BROKER_CRECI, BROKER_FOUNDING_YEAR } from '@/lib/constants'

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-dourado"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

/// Atalhos do hero. Substituem a grade de 6 cards de categoria que ocupava ~640px
/// no celular. A contagem vem do banco: a home não promete o que não existe.
const SHORTCUTS: Array<{ slug: string; label: string; from: 'type' | 'city'; key: string }> = [
  { slug: 'casas', label: 'Casas', from: 'type', key: 'casa' },
  { slug: 'terrenos', label: 'Terrenos', from: 'type', key: 'terreno' },
  { slug: 'apartamentos', label: 'Apartamentos', from: 'type', key: 'apartamento' },
  { slug: 'comercial', label: 'Comercial', from: 'type', key: 'comercial' },
  { slug: 'rural', label: 'Rural', from: 'type', key: 'rural' },
  { slug: 'corumba', label: 'Corumbá', from: 'city', key: 'corumba' },
  { slug: 'ladario', label: 'Ladário', from: 'city', key: 'ladario' },
]

export function HeroSection({ counts }: { counts: CatalogCounts }) {
  const subtitle =
    counts.total > 0
      ? `${counts.total} ${counts.total === 1 ? 'imóvel disponível' : 'imóveis disponíveis'} em Corumbá e Ladário. Atendimento direto com o corretor.`
      : 'Atendimento direto com o corretor em Corumbá e Ladário.'

  return (
    <section className="relative -mt-16 overflow-hidden bg-azul-escuro pb-14 pt-24 sm:pb-16 sm:pt-28 lg:min-h-[42rem] lg:pb-24 lg:pt-36">
      <div className="absolute inset-0">
        {/* Camada base: é isto que aparece se o vídeo não tocar. */}
        <div className="hero-youtube-fallback absolute inset-0 bg-gradient-to-br from-azul-escuro via-azul-escuro/95 to-azul-medio" />
        <div className="hero-youtube-fallback absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(44,95,138,0.4),transparent_70%)]" />

        <HeroVideoBackground />

        <div className="hero-youtube-overlay" aria-hidden="true" />
      </div>

      <Container className="relative z-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_26rem] lg:gap-16">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-dourado">
              Corumbá &amp; Ladário — MS
            </p>
            <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Imóveis em Corumbá e Ladário
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-white/75">
              {subtitle}
            </p>

            {/* Credibilidade acima da dobra.
                O registro no CRECI e os anos de atuação existiam só no rodapé e
                dentro do JSON-LD — o buscador enxergava, o visitante não. Numa
                busca por "corretor de imóveis em Corumbá", que é onde este site
                compete de igual para igual com os portais, esse é justamente o
                argumento que decide. */}
            <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <CheckIcon />
                Corretor registrado — {BROKER_CRECI}
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon />
                Atuando desde {BROKER_FOUNDING_YEAR}
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon />
                Atendimento direto, sem cadastro
              </li>
            </ul>

            <ul className="mt-7 flex flex-wrap gap-2">
              {SHORTCUTS.map((shortcut) => {
                const count =
                  shortcut.from === 'type'
                    ? (counts.byType[shortcut.key] ?? 0)
                    : (counts.byCity[shortcut.key] ?? 0)
                const isEmpty = count === 0

                return (
                  <li key={shortcut.slug}>
                    <Link
                      href={`/imoveis/${shortcut.slug}`}
                      className={
                        isEmpty
                          ? 'inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 text-sm text-white/45 transition-colors hover:border-white/30 hover:text-white/70'
                          : 'inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3.5 py-1.5 text-sm font-medium text-white/90 transition-colors hover:border-white hover:bg-white/10 hover:text-white'
                      }
                    >
                      {shortcut.label}
                      <span className="text-xs tabular-nums opacity-70">
                        {count}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
            <HeroSearch />
          </div>
        </div>
      </Container>
    </section>
  )
}
