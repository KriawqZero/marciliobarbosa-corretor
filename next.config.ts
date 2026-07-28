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
  async rewrites() {
    // A especificação do IndexNow recomenda a chave em `/{chave}.txt` na raiz.
    // Servir só `/indexnow-key.txt` e declarar `keyLocation` também é válido,
    // mas exigiria uma rota curinga na raiz — que capturaria as URLs dos
    // imóveis. Este atalho entrega as duas formas sem esse risco.
    //
    // O valor é lido no build; se a variável não existir lá, o atalho não é
    // criado e a notificação continua funcionando pelo `keyLocation`.
    const key = process.env.INDEXNOW_KEY
    if (!key || !/^[A-Za-z0-9-]{8,128}$/.test(key)) return []

    return [{ source: `/${key}.txt`, destination: '/indexnow-key.txt' }]
  },
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
      {
        // Cabeçalhos de segurança na origem. Não são fator de ranqueamento,
        // mas aparecem em toda auditoria e são baratos.
        source: '/:path*',
        headers: [
          {
            // Obriga HTTPS por dois anos, inclusive nos subdomínios. Só é
            // seguro porque o site inteiro (e `media.`) já roda em HTTPS.
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Impede o navegador de "adivinhar" o tipo do arquivo: um upload
          // com extensão trocada deixa de poder ser executado como script.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Bloqueia o site dentro de iframe de terceiros (clickjacking).
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Envia a URL completa como referenciador só dentro do próprio site;
          // para fora, apenas o domínio.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // O site não usa câmera, microfone nem localização. Declarar isso
          // impede que um script de terceiro peça.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // Imagens fixas do `public/`: a foto do corretor é a imagem de
        // compartilhamento (WhatsApp, Facebook) e vinha com `max-age=0`, então
        // era rebaixada a cada prévia de link. O nome do arquivo nunca muda,
        // então cache longo é seguro — se a foto for trocada, troca-se o nome.
        source: '/:file(marcilio\\.jpg|a\\.jpg|placeholder-imovel\\.svg)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
    ]
  },
}

export default nextConfig
