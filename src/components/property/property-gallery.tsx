'use client'

import { type TouchEvent, useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { PropertyImage } from '@/types'
import { cn } from '@/lib/utils'
import { GalleryThumbnails } from './gallery-thumbnails'

interface PropertyGalleryProps {
  images: PropertyImage[]
  title: string
}

/** Deslocamento horizontal mínimo, em px, para o arrasto valer como troca de foto. */
const SWIPE_THRESHOLD = 50

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [isMainLoading, setIsMainLoading] = useState(true)
  const [isLightboxLoading, setIsLightboxLoading] = useState(true)

  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const swipedRef = useRef(false)

  const total = images.length

  // Navegação circular. Com uma foto só não há para onde ir — e reiniciar os
  // spinners aqui deixaria o "carregando" preso, porque a imagem não recarrega.
  const step = useCallback(
    (delta: -1 | 1) => {
      if (total <= 1) return
      setActiveIndex((prev) => (prev + delta + total) % total)
      setIsMainLoading(true)
      setIsLightboxLoading(true)
    },
    [total]
  )

  const closeLightbox = useCallback(() => setLightboxOpen(false), [])

  // Teclado: Esc fecha, setas navegam.
  useEffect(() => {
    if (!lightboxOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setLightboxOpen(false)
      } else if (event.key === 'ArrowLeft') {
        step(-1)
      } else if (event.key === 'ArrowRight') {
        step(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, step])

  // Trava a rolagem da página atrás do modo tela cheia.
  useEffect(() => {
    if (!lightboxOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [lightboxOpen])

  if (total === 0) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-cinza-50">
        <p className="text-cinza-600">Sem imagens disponíveis</p>
      </div>
    )
  }

  const activeImage = images[activeIndex]
  const hasMultiple = total > 1

  function openLightbox() {
    setIsLightboxLoading(true)
    setLightboxOpen(true)
  }

  function selectIndex(index: number) {
    if (index === activeIndex) return
    setIsMainLoading(true)
    setIsLightboxLoading(true)
    setActiveIndex(index)
  }

  function handleTouchStart(event: TouchEvent) {
    const touch = event.changedTouches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  function handleTouchEnd(event: TouchEvent) {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start) return

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - start.x
    const deltaY = touch.clientY - start.y

    // Só conta como swipe se o movimento for claramente horizontal; assim um
    // arrasto vertical não troca a foto sem querer.
    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) <= Math.abs(deltaY)) return

    swipedRef.current = true
    step(deltaX < 0 ? 1 : -1)
  }

  // O clique no fundo fecha, mas o "click" que o navegador dispara ao final de
  // um swipe não pode fechar junto.
  function handleBackdropClick() {
    if (swipedRef.current) {
      swipedRef.current = false
      return
    }
    closeLightbox()
  }

  return (
    <>
      <div className="space-y-3">
        <button
          onClick={openLightbox}
          className="relative aspect-video w-full cursor-zoom-in overflow-hidden rounded-xl bg-cinza-50"
          aria-label={hasMultiple ? `Ampliar fotos (${total} no total)` : 'Ampliar foto'}
        >
          {isMainLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-cinza-50/30">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-azul-escuro/20 border-t-azul-escuro"></div>
            </div>
          )}
          <Image
            src={activeImage.src}
            alt={activeImage.alt || title}
            fill
            sizes="(max-width: 768px) 100vw, 70vw"
            className={cn(
              'object-cover transition-opacity duration-300',
              isMainLoading ? 'opacity-40' : 'opacity-100'
            )}
            priority
            onLoad={() => setIsMainLoading(false)}
          />

          {hasMultiple && (
            <span className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              {activeIndex + 1} / {total}
            </span>
          )}
        </button>

        {hasMultiple && (
          <div className="pb-2">
            <GalleryThumbnails
              images={images}
              activeIndex={activeIndex}
              onSelect={selectIndex}
              variant="page"
            />
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galeria de fotos: ${title}`}
          className="fixed inset-0 z-[100] flex flex-col bg-black/95"
          onClick={handleBackdropClick}
        >
          {/* Escurece o topo para o X continuar legível sobre fotos claras. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-black/70 to-transparent" />

          <button
            onClick={(e) => {
              e.stopPropagation()
              closeLightbox()
            }}
            className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-black/80"
            aria-label="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {hasMultiple && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  step(-1)
                }}
                className="absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-black/80 sm:flex"
                aria-label="Anterior"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  step(1)
                }}
                className="absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-black/80 sm:flex"
                aria-label="Próxima"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </>
          )}

          {/* min-h-0 deixa a foto encolher para caber; a barra de baixo nunca a cobre. */}
          <div
            className="relative flex min-h-0 flex-1 items-center justify-center p-4"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {isLightboxLoading && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
              </div>
            )}
            <Image
              src={activeImage.src}
              alt={activeImage.alt || title}
              width={activeImage.width}
              height={activeImage.height}
              // Sem `sizes`, o navegador escolhe a variante pela largura
              // intrínseca da foto (3060px nas fotos deste acervo) e baixa a
              // maior do srcset.
              sizes="90vw"
              quality={85}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'max-h-full w-auto max-w-full rounded-lg object-contain transition-opacity duration-300',
                isLightboxLoading ? 'opacity-40' : 'opacity-100'
              )}
              onLoad={() => setIsLightboxLoading(false)}
            />
          </div>

          {hasMultiple && (
            <div
              className="relative z-20 shrink-0 border-t border-white/10 bg-black/40 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* No celular a navegação vive aqui embaixo, longe da foto e na
                  zona do polegar. No desktop ficam as setas laterais. */}
              <div className="mb-3 flex items-center justify-center gap-6 sm:hidden">
                <button
                  onClick={() => step(-1)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/25 transition active:bg-white/20"
                  aria-label="Anterior"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <span className="min-w-[4.5rem] text-center text-sm font-medium text-white">
                  {activeIndex + 1} / {total}
                </span>
                <button
                  onClick={() => step(1)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/25 transition active:bg-white/20"
                  aria-label="Próxima"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>

              <div className="mb-3 hidden text-center text-sm text-white/70 sm:block">
                {activeIndex + 1} / {total}
              </div>

              <GalleryThumbnails
                images={images}
                activeIndex={activeIndex}
                onSelect={selectIndex}
                variant="lightbox"
              />
            </div>
          )}
        </div>
      )}
    </>
  )
}
