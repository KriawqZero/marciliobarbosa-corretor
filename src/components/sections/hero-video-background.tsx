'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

const DESKTOP_VIDEO_ID = '6laCK5zUweY'
const PLAYER_ORIGIN = 'https://www.youtube-nocookie.com'

/// `onStateChange` do player: 1 = tocando. Só nesse estado o vídeo é revelado.
const PLAYER_STATE_PLAYING = 1
/// Se o player não avisar que começou a tocar nesse prazo, paramos de perguntar
/// e o hero segue com o gradiente. Melhor um fundo bonito do que um player meio
/// carregado por cima do texto.
const HANDSHAKE_TIMEOUT_MS = 10000
const HANDSHAKE_INTERVAL_MS = 400

function buildEmbedUrl(videoId: string, origin: string): string {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '0',
    loop: '1',
    playlist: videoId,
    playsinline: '1',
    modestbranding: '1',
    rel: '0',
    fs: '0',
    disablekb: '1',
    iv_load_policy: '3',
    // Habilita as mensagens de estado do player, para sabermos quando revelar.
    enablejsapi: '1',
    origin,
  })
  return `${PLAYER_ORIGIN}/embed/${videoId}?${params.toString()}`
}

function extractPlayerState(data: unknown): number | undefined {
  if (typeof data !== 'object' || data === null) return undefined
  const message = data as { event?: string; info?: unknown }
  if (message.event === 'onStateChange' && typeof message.info === 'number') {
    return message.info
  }
  if (typeof message.info === 'object' && message.info !== null) {
    const info = message.info as { playerState?: unknown }
    if (typeof info.playerState === 'number') return info.playerState
  }
  return undefined
}

export function HeroVideoBackground() {
  // `null` = ainda não decidimos montar, ou decidimos não montar.
  const [videoId, setVideoId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const frameRef = useRef<HTMLIFrameElement>(null)

  // Decide se e quando montar o iframe — sempre depois do primeiro paint. O vídeo
  // é decoração e não deve competir com o conteúdo da página.
  //
  // Medição em celular (375×812): a home baixava 2.376.963 bytes, dos quais
  // ~1.597.306 (67%) eram do player do YouTube — só o `base.js` são 476 KB, mais
  // 600 KB de segmento de vídeo. As páginas sem o embed pesam ~772 KB. O público
  // deste site acessa majoritariamente do celular, no interior de MS, com rede
  // instável: 1,6 MB de decoração disputa banda com a foto que forma o LCP.
  //
  // Por isso o vídeo passa a ser exclusivo do desktop, e ainda assim só quando a
  // rede declara ser rápida. Não virou "clique para tocar": um botão de play num
  // fundo decorativo pede uma ação que ninguém faz, e o resultado prático seria
  // o vídeo nunca tocar para ninguém. O gradiente do hero é o estado normal em
  // celular — e ele já era o estado de fallback, então nada regride visualmente.
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    // Antes o CSS apenas escondia o vídeo nesse caso — mas o iframe já tinha
    // baixado ~1,7 MB. Agora nem monta.
    if (prefersReducedMotion) return

    // Abaixo de 1024px nunca carrega: é onde está a maior parte do tráfego e
    // onde o custo dói.
    if (!window.matchMedia('(min-width: 1024px)').matches) return

    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string }
      }
    ).connection
    if (connection?.saveData) return
    // `effectiveType` mede a velocidade observada, não a tecnologia: um 4G ruim
    // se declara `3g`. Quando o navegador não informa, seguimos em frente.
    if (
      connection?.effectiveType &&
      connection.effectiveType !== '4g'
    ) {
      return
    }

    const start = () => setVideoId(DESKTOP_VIDEO_ID)

    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(start, { timeout: 4000 })
      return () => window.cancelIdleCallback?.(handle)
    }

    const handle = window.setTimeout(start, 1500)
    return () => window.clearTimeout(handle)
  }, [])

  const embedUrl = useMemo(
    () => (videoId ? buildEmbedUrl(videoId, window.location.origin) : null),
    [videoId],
  )

  // Handshake com o player: o iframe só aparece quando ele confirma que está
  // tocando. Enquanto isso o visitante vê o gradiente do hero — e não o retângulo
  // preto do iframe nem o anel de carregamento do YouTube sobre o texto.
  useEffect(() => {
    if (!videoId) return

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== PLAYER_ORIGIN) return
      let payload: unknown = event.data
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload)
        } catch {
          return
        }
      }
      const state = extractPlayerState(payload)
      if (state === undefined) return
      setIsPlaying(state === PLAYER_STATE_PLAYING)
    }

    window.addEventListener('message', handleMessage)

    const ping = window.setInterval(() => {
      frameRef.current?.contentWindow?.postMessage(
        JSON.stringify({
          event: 'listening',
          id: 'hero-video',
          channel: 'widget',
        }),
        PLAYER_ORIGIN,
      )
    }, HANDSHAKE_INTERVAL_MS)

    const giveUp = window.setTimeout(
      () => window.clearInterval(ping),
      HANDSHAKE_TIMEOUT_MS,
    )

    return () => {
      window.removeEventListener('message', handleMessage)
      window.clearInterval(ping)
      window.clearTimeout(giveUp)
    }
  }, [videoId])

  if (!videoId || !embedUrl) return null

  return (
    <div
      className="hero-youtube-bg"
      data-playing={isPlaying ? 'true' : 'false'}
      aria-hidden="true"
    >
      <iframe
        ref={frameRef}
        className="hero-youtube-iframe hero-youtube-iframe-landscape"
        src={embedUrl}
        title="Vídeo de fundo"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="autoplay"
        tabIndex={-1}
      />
    </div>
  )
}
