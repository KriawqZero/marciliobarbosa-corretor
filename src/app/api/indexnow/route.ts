import { NextResponse } from 'next/server'
import { env } from 'process'
import { getProperties } from '@/data/services/properties'
import { pingIndexNow } from '@/lib/indexnow'
import { VALID_CATEGORIES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

/// Reenvio manual do site inteiro para o IndexNow.
///
/// O envio automático já acontece a cada cadastro/edição de imóvel. Esta rota
/// existe para os casos em que isso não basta: primeira publicação do site,
/// troca de domínio, ou quando a chave só foi configurada depois que o acervo
/// já estava no ar.
///
/// Protegida pela mesma senha das outras rotas de escrita — não porque exponha
/// dado sensível, mas porque envio em excesso é penalizado pelo protocolo.
function isAuthorized(req: Request): boolean {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return false
  return authHeader.slice('Bearer '.length) === env.API_PASSWORD
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const properties = await getProperties().catch(() => [])

    const paths = [
      '/',
      '/imoveis',
      '/sobre',
      '/contato',
      ...VALID_CATEGORIES.map((categoria) => `/imoveis/${categoria}`),
      ...properties.map((property) => `/imovel/${property.slug}`),
    ]

    const result = await pingIndexNow(paths)

    return NextResponse.json({
      ...result,
      /// 200 e 202 significam aceito. 403 é chave inválida, 422 é host que não
      /// bate com a chave — os dois erros que aparecem quando a variável de
      /// ambiente e o domínio publicado não combinam.
      ok: result.status === 200 || result.status === 202,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Erro ao notificar o IndexNow.' },
      { status: 500 },
    )
  }
}
