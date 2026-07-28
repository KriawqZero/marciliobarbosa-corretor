import { SITE_URL, getAbsoluteUrl } from './metadata'

/// IndexNow: protocolo aberto em que o site avisa o buscador que uma URL mudou,
/// em vez de esperar o rastreamento passar por ali. Um único POST notifica
/// Bing, Yandex, Seznam, Naver e Yep de uma vez.
///
/// É o que responde à pergunta "como indexar no DuckDuckGo": o DuckDuckGo não
/// tem envio próprio e monta o índice sobre o do Bing, então o caminho real é
/// avisar o Bing. O Google não participa do protocolo — lá a atualização
/// continua vindo do sitemap e do Search Console.
/// Caminho em minúsculas, como na especificação. `api.indexnow.org` é o
/// endereço genérico: entregar aqui repassa para todos os buscadores
/// participantes, em vez de exigir um POST por buscador.
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

/// A chave prova que quem enviou controla o domínio: o buscador baixa o arquivo
/// de chave e compara com o que veio no POST.
///
/// A especificação limita a chave a 8–128 caracteres entre a-z, A-Z, 0-9 e
/// hífen. `openssl rand -hex 16` produz um valor válido.
export const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? ''

/// O arquivo fica na raiz do site. Isso importa: quando a localização é
/// declarada via `keyLocation`, a especificação limita as URLs notificáveis às
/// que começam no diretório do arquivo. Na raiz, o site inteiro é coberto.
export const INDEXNOW_KEY_PATH = '/indexnow-key.txt'

export interface IndexNowResult {
  submitted: number
  status: number | null
  skipped?: string
}

/// Envia URLs para o IndexNow. Nunca lança: uma falha de notificação não pode
/// derrubar o cadastro de um imóvel — o sitemap continua sendo a fonte de
/// verdade e o buscador chega lá de qualquer forma, só mais devagar.
export async function pingIndexNow(paths: string[]): Promise<IndexNowResult> {
  if (!INDEXNOW_KEY) {
    return { submitted: 0, status: null, skipped: 'INDEXNOW_KEY não configurada' }
  }

  /// Localhost e domínios de preview não podem ser enviados: a chave é validada
  /// contra o host, e envio inválido repetido derruba a reputação do domínio no
  /// protocolo.
  if (!SITE_URL.startsWith('https://')) {
    return { submitted: 0, status: null, skipped: 'SITE_URL não é https' }
  }

  const host = new URL(SITE_URL).host
  const urlList = Array.from(new Set(paths)).map((path) => getAbsoluteUrl(path))

  if (urlList.length === 0) return { submitted: 0, status: null }

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        /// O protocolo aceita a chave hospedada em qualquer caminho desde que
        /// declarada aqui. Evita precisar de uma rota dinâmica na raiz só para
        /// servir `/{chave}.txt`, que capturaria URLs de imóveis por engano.
        keyLocation: getAbsoluteUrl(INDEXNOW_KEY_PATH),
        urlList,
      }),
      cache: 'no-store',
    })

    return { submitted: urlList.length, status: response.status }
  } catch (error) {
    console.error('[indexnow] falha ao notificar', error)
    return { submitted: 0, status: null, skipped: 'erro de rede' }
  }
}
