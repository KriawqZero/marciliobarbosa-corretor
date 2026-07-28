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
///
/// O retorno distingue as três formas de falhar, porque um `401` seco para
/// todas custou uma tarde de depuração: senha vazia (o `$VAR` do shell que não
/// estava exportado vira string vazia e o header sai como "Bearer " sozinho),
/// senha errada, e servidor sem a variável configurada — caso em que nenhuma
/// senha do mundo funcionaria e o problema não está em quem chamou.
///
/// Nada disso vaza a senha nem confirma acerto parcial: são estados da
/// requisição e da configuração, não pistas sobre o valor.
type AuthFailure = 'sem-header' | 'token-vazio' | 'senha-incorreta' | 'servidor-sem-senha'

function checkAuth(req: Request): AuthFailure | null {
  const expected = env.API_PASSWORD
  if (typeof expected !== 'string' || expected.length === 0) {
    return 'servidor-sem-senha'
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return 'sem-header'

  /// O espaço depois de "Bearer" é opcional no casamento porque o cliente HTTP
  /// apara o espaço final: quem manda `Bearer $VAR` com a variável vazia acaba
  /// enviando literalmente "Bearer", e esse é o caso que mais confunde.
  const token = /^Bearer\s*(.*)$/i.exec(authHeader)?.[1]?.trim()
  if (token === undefined) return 'sem-header'
  if (token.length === 0) return 'token-vazio'

  return token === expected ? null : 'senha-incorreta'
}

const AUTH_MESSAGES: Record<AuthFailure, { status: number; error: string }> = {
  'sem-header': {
    status: 401,
    error:
      'Falta o cabeçalho de autorização. Use: -H "Authorization: Bearer SUA_SENHA".',
  },
  'token-vazio': {
    status: 401,
    error:
      'O cabeçalho chegou sem senha depois de "Bearer". Se você usou $API_PASSWORD no comando, a variável não está definida no seu terminal e virou string vazia — cole o valor literal entre aspas simples.',
  },
  'senha-incorreta': {
    status: 401,
    error: 'Senha incorreta. Confira a variável API_PASSWORD no ambiente do servidor.',
  },
  'servidor-sem-senha': {
    status: 503,
    error:
      'API_PASSWORD não está configurada no servidor, então nenhuma senha seria aceita. Defina a variável de ambiente e faça um novo deploy.',
  },
}

export async function POST(req: Request) {
  const failure = checkAuth(req)
  if (failure) {
    const { status, error } = AUTH_MESSAGES[failure]
    return NextResponse.json({ error }, { status })
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
