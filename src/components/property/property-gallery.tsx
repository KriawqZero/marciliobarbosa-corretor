'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { PropertyImage } from '@/types'

interface PropertyGalleryProps {
  images: PropertyImage[]
  title: string
}

const THUMBNAIL_WINDOW = 2

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [thumbStart, setThumbStart] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (images.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-cinza-50">
        <p className="text-cinza-600">Sem imagens disponíveis</p>
      </div>
    )
  }

  const activeImage = images[activeIndex]

  // Update the thumbnail window when the activeIndex moves outside it
  // (do not let the window go out of range)
  function updateThumbWindow(nextIndex: number) {
    if (images.length <= THUMBNAIL_WINDOW) return
    if (nextIndex < thumbStart) {
      setThumbStart(nextIndex)
    } else if (nextIndex >= thumbStart + THUMBNAIL_WINDOW) {
      setThumbStart(nextIndex - THUMBNAIL_WINDOW + 1)
    }
  }

  const handleSetActiveIndex = (i: number) => {
    setActiveIndex(i)
    updateThumbWindow(i)
  }

  // Make sure the thumbnail window scrolls properly when navigating outside
  // If changing pictures (for example, via lightbox navigation), keep thumbnails in sync
  const handlePrev = () => {
    const nextIndex = (activeIndex - 1 + images.length) % images.length
    setActiveIndex(nextIndex)
    updateThumbWindow(nextIndex)
  }

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % images.length
    setActiveIndex(nextIndex)
    updateThumbWindow(nextIndex)
  }

  let thumbnails = images
  let showThumbNav = false
  let thumbWindowStart = thumbStart

  // If there are more than THUMBNAIL_WINDOW thumbnails, slice a window
  if (images.length > THUMBNAIL_WINDOW) {
    showThumbNav = true
    // Ensure thumbStart is always a valid value
    if (thumbStart > images.length - THUMBNAIL_WINDOW) {
      thumbWindowStart = images.length - THUMBNAIL_WINDOW
    }
    if (thumbStart < 0) {
      thumbWindowStart = 0
    }
    thumbnails = images.slice(thumbWindowStart, thumbWindowStart + THUMBNAIL_WINDOW)
  }

  return (
    <>
      <div className="space-y-3">
        <button
          onClick={() => setLightboxOpen(true)}
          className="relative aspect-video w-full cursor-zoom-in overflow-hidden rounded-xl"
        >
          <Image
            src={activeImage.src}
            alt={activeImage.alt || title}
            fill
            sizes="(max-width: 768px) 100vw, 70vw"
            className="object-cover"
            priority
          />
        </button>

        {images.length > 1 && (
          <div className="flex items-center gap-2 pb-2">
            {showThumbNav && (
              <button
                onClick={() => {
                  const newStart = Math.max(thumbWindowStart - 1, 0)
                  setThumbStart(newStart)
                }}
                disabled={thumbWindowStart === 0}
                className={`h-8 w-8 flex items-center justify-center rounded-full bg-cinza-100 text-cinza-500 hover:bg-cinza-200 transition disabled:opacity-40 disabled:cursor-not-allowed mr-1`}
                aria-label="Thumbnails anteriores"
                tabIndex={-1}
              >
                <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            )}
            <div className="flex gap-2 overflow-hidden">
              {thumbnails.map((img, i) => {
                // The real image index in the images array
                const realIndex = showThumbNav ? (thumbWindowStart + i) : i
                return (
                  <button
                    key={realIndex}
                    onClick={() => handleSetActiveIndex(realIndex)}
                    className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      realIndex === activeIndex
                        ? 'border-azul-escuro'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt || `Foto ${realIndex + 1}`}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </button>
                )
              })}
            </div>
            {showThumbNav && (
              <button
                onClick={() => {
                  const newStart = Math.min(
                    thumbWindowStart + 1,
                    images.length - THUMBNAIL_WINDOW
                  )
                  setThumbStart(newStart)
                }}
                disabled={thumbWindowStart >= images.length - THUMBNAIL_WINDOW}
                className={`h-8 w-8 flex items-center justify-center rounded-full bg-cinza-100 text-cinza-500 hover:bg-cinza-200 transition disabled:opacity-40 disabled:cursor-not-allowed ml-1`}
                aria-label="Thumbnails seguintes"
                tabIndex={-1}
              >
                <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrev()
                }}
                className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Anterior"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Próxima"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </>
          )}

          <div
            className="relative max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeImage.src}
              alt={activeImage.alt || title}
              width={activeImage.width}
              height={activeImage.height}
              className="max-h-[85vh] w-auto rounded-lg object-contain"
            />
          </div>

          <div className="absolute bottom-4 text-sm text-white/70">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}
