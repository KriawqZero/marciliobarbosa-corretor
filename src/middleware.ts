import { NextResponse, type NextRequest } from 'next/server'
import { VALID_CATEGORIES } from '@/lib/constants'

/// A página de categoria lê `searchParams` (filtros, ordenação, paginação), o
/// que a torna dinâmica: a resposta começa a ser enviada antes de o componente
/// rodar, e aí o `notFound()` não consegue mais mudar o status — a URL inválida
/// respondia 200 com a tela de erro dentro, o que o buscador registra como
/// "soft 404" e indexa como página válida.
///
/// O middleware roda antes de qualquer envio. Como a lista de categorias é
/// código estático, dá para conferir aqui sem tocar no banco.
export function middleware(request: NextRequest) {
  const match = request.nextUrl.pathname.match(/^\/imoveis\/([^/]+)\/?$/)
  if (!match) return NextResponse.next()

  const categoria = decodeURIComponent(match[1])
  if (VALID_CATEGORIES.includes(categoria)) return NextResponse.next()

  /// Reescreve para a rota 404 do próprio app, preservando o status: a pessoa
  /// vê a página de erro do site, com os atalhos, e o buscador recebe 404.
  return NextResponse.rewrite(new URL('/404', request.url), { status: 404 })
}

export const config = {
  matcher: '/imoveis/:categoria',
}
