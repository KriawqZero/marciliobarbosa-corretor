'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { PropertyImage } from '@/types'
import { cn } from '@/lib/utils'

interface GalleryThumbnailsProps {
  images: PropertyImage[]
  activeIndex: number
  onSelect: (index: number) => void
  /** 'page' fica sobre fundo branco; 'lightbox' fica sobre fundo preto. */
  variant?: 'page' | 'lightbox'
}

const THUMB_SIZE = {
  page: 'h-16 w-24 sm:h-20 sm:w-28',
  lightbox: 'h-14 w-20',
}

// Degradê da borda: precisa combinar com o fundo de cada contexto para
// parecer que as miniaturas somem, e não que existe uma faixa colorida.
const FADE_FROM = {
  page: 'from-white',
  lightbox: 'from-black',
}

const NAV_BUTTON = {
  page: 'bg-cinza-50 text-cinza-600 hover:bg-cinza-200 border border-cinza-200',
  lightbox: 'bg-black/60 text-white ring-1 ring-white/25 hover:bg-black/80',
}

export function GalleryThumbnails({
  images,
  activeIndex,
  onSelect,
  variant = 'page',
}: GalleryThumbnailsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const syncScrollState = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    // 1px de folga: navegadores arredondam scrollLeft em telas com zoom/DPR
    // fracionário e a seta ficaria habilitada sem ter para onde rolar.
    setCanScrollLeft(el.scrollLeft > 1)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  // Mantém a miniatura ativa visível quando a foto muda por outro caminho
  // (setas do lightbox, teclado, swipe).
  useEffect(() => {
    const el = scrollerRef.current
    const thumb = el?.children[activeIndex] as HTMLElement | undefined
    if (!el || !thumb) return

    const target = thumb.offsetLeft - (el.clientWidth - thumb.clientWidth) / 2
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // scrollTo no container, e não scrollIntoView, que arrastaria a página
    // inteira na vertical junto.
    el.scrollTo({ left: target, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [activeIndex])

  useEffect(() => {
    syncScrollState()
    const el = scrollerRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(syncScrollState)
    observer.observe(el)
    return () => observer.disconnect()
  }, [syncScrollState, images.length])

  const scrollByPage = (direction: -1 | 1) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    // `contain: inline-size` faz a largura desta faixa depender só do espaço
    // disponível, nunca das miniaturas. Sem isso, o item de grid da página
    // (`min-width: auto`, em imovel/[slug]/page.tsx) cresce até caber todas as
    // fotos e estoura a largura da página inteira no celular.
    <div className="flex items-center gap-2 [contain:inline-size]">
      <button
        type="button"
        onClick={() => scrollByPage(-1)}
        disabled={!canScrollLeft}
        className={cn(
          'hidden h-8 w-8 shrink-0 items-center justify-center rounded-full transition sm:flex',
          'disabled:cursor-not-allowed disabled:opacity-30',
          NAV_BUTTON[variant]
        )}
        // Cada miniatura já é um ponto de tabulação; estas setas só duplicariam
        // a navegação por teclado.
        tabIndex={-1}
        aria-hidden="true"
      >
        <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <div className="relative min-w-0 flex-1">
        <div
          ref={scrollerRef}
          onScroll={syncScrollState}
          className="flex snap-x gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => (
            <button
              type="button"
              key={`${img.src}-${i}`}
              onClick={() => onSelect(i)}
              aria-label={`Ver foto ${i + 1} de ${images.length}`}
              aria-current={i === activeIndex}
              className={cn(
                'relative shrink-0 snap-start overflow-hidden rounded-lg border-2 transition',
                THUMB_SIZE[variant],
                i === activeIndex
                  ? 'border-azul-escuro opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <Image
                src={img.src}
                alt={img.alt || `Foto ${i + 1}`}
                fill
                sizes="(max-width: 640px) 96px, 128px"
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {canScrollLeft && (
          <div
            className={cn(
              'pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r to-transparent',
              FADE_FROM[variant]
            )}
          />
        )}
        {canScrollRight && (
          <div
            className={cn(
              'pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l to-transparent',
              FADE_FROM[variant]
            )}
          />
        )}
      </div>

      <button
        type="button"
        onClick={() => scrollByPage(1)}
        disabled={!canScrollRight}
        className={cn(
          'hidden h-8 w-8 shrink-0 items-center justify-center rounded-full transition sm:flex',
          'disabled:cursor-not-allowed disabled:opacity-30',
          NAV_BUTTON[variant]
        )}
        tabIndex={-1}
        aria-hidden="true"
      >
        <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  )
}
