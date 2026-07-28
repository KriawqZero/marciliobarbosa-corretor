import { INDEXNOW_KEY } from '@/lib/indexnow'

/// Arquivo de verificação do IndexNow. O buscador busca esta URL e compara o
/// conteúdo com a chave enviada no POST; é assim que ele confirma que quem
/// notificou controla o domínio.
///
/// Dinâmica de propósito: a chave vem do ambiente do servidor. Se fosse
/// estática, o valor seria congelado no build — e um deploy feito sem a
/// variável serviria um arquivo vazio para sempre.
export const dynamic = 'force-dynamic'

export function GET() {
  if (!INDEXNOW_KEY) {
    return new Response('IndexNow não configurado.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  return new Response(INDEXNOW_KEY, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
      'X-Robots-Tag': 'noindex',
    },
  })
}
