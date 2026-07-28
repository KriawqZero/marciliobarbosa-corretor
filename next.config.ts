import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.marciliobarbosacorretor.com.br',
      },
    ],
    // Padrão do Next 16 é só WebP. AVIF rende ~30-40% a menos nas fotos deste
    // acervo; o custo é CPU na primeira otimização de cada variante, amortizado
    // pelo `minimumCacheTTL` abaixo.
    formats: ['image/avif', 'image/webp'],
    // Obrigatório no Next 16: sem a lista, só `q=75` é aceito. 85 é usado no
    // lightbox, onde a foto é o conteúdo.
    qualities: [70, 75, 85],
    // Padrão herdado do `max-age` do Cloudflare era 4h, o que fazia o otimizador
    // reprocessar a mesma foto várias vezes por dia. Foto de imóvel não muda.
    minimumCacheTTL: 2592000, // 30 dias
    // 3840 saiu: nenhum layout do site precisa dessa largura, e o lightbox
    // acabava puxando a maior variante possível.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2560],
    imageSizes: [96, 128, 256, 384],
  },
  // Header de servidor não acrescenta nada e expõe a stack.
  poweredByHeader: false,
  // Barra no fim da URL gera duas URLs para a mesma página (`/imoveis` e
  // `/imoveis/`). Fixar a forma sem barra e redirecionar a outra evita que o
  // buscador trate as duas como conteúdo duplicado.
  trailingSlash: false,
  async headers() {
    return [
      {
        // A API já está bloqueada no robots.txt, mas robots.txt só impede o
        // rastreamento — uma URL de API linkada de fora ainda podia ser
        // indexada sem ser lida. `X-Robots-Tag` é a instrução que remove de
        // vez, porque viaja na própria resposta.
        source: '/api/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}

export default nextConfig
