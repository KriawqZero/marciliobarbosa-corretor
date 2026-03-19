'use client'

import { useEffect, useMemo, useState } from 'react'

const DESKTOP_VIDEO_ID = '6laCK5zUweY'
const MOBILE_SHORT_ID = 'Zvo2KDr7iDc'

function buildEmbedUrl(videoId: string) {
  // `youtube-nocookie` ajuda a reduzir rastreio; `mute=1` garante áudio desligado.
  // `loop` depende do embed, mas em geral funciona com `playlist=<id>`.
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&modestbranding=1&rel=0&showinfo=0&fs=0&iv_load_policy=3`
}

export function HeroVideoBackground() {
  // Evita carregar o iframe “errado” durante SSR/hidratação.
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    // Mantém simples: troca só quando a largura cruza o breakpoint do Tailwind.
    const media = window.matchMedia('(max-width: 767px)')
    const onChange = () => setIsMobile(media.matches)
    onChange()

    // Safari/antigos: addListener fallback.
    if ('addEventListener' in media) {
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    }

    const legacyMedia = media as unknown as {
      addListener?: (listener: () => void) => void
      removeListener?: (listener: () => void) => void
    }

    legacyMedia.addListener?.(onChange)
    return () => legacyMedia.removeListener?.(onChange)
  }, [])

  // Mantém hooks invariáveis; se ainda não sabemos a largura, tratamos como desktop (mas não renderizamos).
  const videoId = isMobile ? MOBILE_SHORT_ID : DESKTOP_VIDEO_ID
  const embedUrl = useMemo(() => buildEmbedUrl(videoId), [videoId])

  if (isMobile === null) return null

  return (
    <div className="hero-youtube-bg" aria-hidden="true">
      <iframe
        className={isMobile ? 'hero-youtube-iframe hero-youtube-iframe-portrait' : 'hero-youtube-iframe hero-youtube-iframe-landscape'}
        src={embedUrl}
        title="Vídeo ao fundo"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="autoplay"
      />
    </div>
  )
}

