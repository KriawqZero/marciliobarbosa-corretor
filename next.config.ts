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
}

export default nextConfig
