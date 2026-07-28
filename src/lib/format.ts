/// O cadastro grava `'A definir'` quando o bairro não é informado — é rótulo de
/// ausência, não um bairro. Sem esta checagem o site publica "Casa à venda em A
/// definir, Corumbá-MS" no título do resultado de busca e no endereço do
/// JSON-LD, que é pior do que simplesmente não citar o bairro.
export function isRealNeighborhood(
  name: string | null | undefined,
): name is string {
  if (!name) return false
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
  return normalized.length > 0 && normalized !== 'a definir'
}

// ---------------------------------------------------------------------------
// Bairros
//
// O mesmo bairro chega escrito de várias formas no cadastro: "Centro",
// "Centro Corumbá", "Centro de Corumbá", "Aeroporto", "Bairro Aeroporto",
// "Guatós, Corumbá/MS". Para o site eram bairros diferentes, e a página de
// categoria listava todos eles na mesma frase.
//
// A limpeza é deliberadamente conservadora. "Nova Corumbá" é um bairro real:
// cortar a cidade grudada no fim toda vez transformaria esse nome em "Nova".
// Por isso a cidade só é removida quando vem separada por vírgula, hífen, barra
// ou pelas palavras "de"/"em" — casos em que é claramente complemento de
// endereço, e não parte do nome.
//
// O caso ambíguo ("Centro Corumbá", cidade colada por um espaço só) é resolvido
// por comparação, não por regra: o corte só vale se o que sobra já existir como
// bairro no acervo. "Centro" existe, então junta; "Nova" não existe, então
// "Nova Corumbá" fica como está.
// ---------------------------------------------------------------------------

/// Cidade precedida de separador ou de "de"/"em" — complemento de endereço.
const CITY_AFTER_SEPARATOR =
  /(?:[,\-–—/]+\s*|\s+(?:de|em)\s+)(?:corumbá|corumba|ladário|ladario)(?:\s*[-/,]?\s*ms)?$/i
/// Cidade colada por um espaço só. Ambígua: tratada na etapa de comparação.
const CITY_AFTER_SPACE = /\s+(?:corumba|ladario)$/
const NEIGHBORHOOD_PREFIX = /^(?:bairro|b\.|bº)\s+/i

/// Nome do bairro sem o ruído, preservando acento e caixa. É o que aparece no
/// site. Se a limpeza esvaziar o texto — nome que era só a cidade — devolve o
/// original: melhor um nome estranho que nenhum.
export function cleanNeighborhoodName(name: string): string {
  const cleaned = name
    .replace(/\s+/g, ' ')
    .trim()
    .replace(NEIGHBORHOOD_PREFIX, '')
    .replace(CITY_AFTER_SEPARATOR, '')
    .replace(/[\s,\-–—/]+ms$/i, '')
    .trim()

  return cleaned.length > 0 ? cleaned : name.trim()
}

/// Forma comparável: sem acento, sem caixa, sem espaço repetido.
export function neighborhoodKey(name: string): string {
  return cleanNeighborhoodName(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/// Entre grafias do mesmo bairro, escolhe a que aparece no site.
///
/// Prefere a mais curta — "Centro" no lugar de "Centro Corumbá". Empate de
/// tamanho é decidido pela que tem mais palavras com inicial maiúscula, que é o
/// que separa "Popular Nova" de "Popular nova". O critério alfabético no fim só
/// existe para o resultado nunca depender da ordem de cadastro.
export function pickNeighborhoodSpelling(names: string[]): string {
  const capitalizedWords = (name: string) =>
    name.split(/\s+/).filter((word) => /^\p{Lu}/u.test(word)).length

  return [...names].sort((a, b) => {
    if (a.length !== b.length) return a.length - b.length
    const score = capitalizedWords(b) - capitalizedWords(a)
    if (score !== 0) return score
    return a.localeCompare(b, 'pt-BR')
  })[0]
}

/// Junta as grafias equivalentes e devolve a lista limpa, em ordem alfabética.
export function dedupeNeighborhoods(names: string[]): string[] {
  const groups = new Map<string, string[]>()

  for (const name of names) {
    if (!isRealNeighborhood(name)) continue
    const clean = cleanNeighborhoodName(name)
    const key = neighborhoodKey(clean)
    if (!key) continue
    groups.set(key, [...(groups.get(key) ?? []), clean])
  }

  /// Segunda passada, para o caso ambíguo: "centro corumba" só é absorvido por
  /// "centro" porque "centro" está na lista.
  for (const [key, grouped] of [...groups]) {
    const base = key.replace(CITY_AFTER_SPACE, '')
    if (base === key || !groups.has(base)) continue
    groups.set(base, [...groups.get(base)!, ...grouped])
    groups.delete(key)
  }

  return Array.from(groups.values())
    .map(pickNeighborhoodSpelling)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

/// Grafia a adotar para um bairro recém-digitado, dadas as que já existem.
/// Devolve `null` quando é bairro novo — aí vale o nome limpo do próprio input.
export function matchExistingNeighborhood(
  input: string,
  existing: string[],
): string | null {
  const target = neighborhoodKey(input)
  if (!target) return null

  const escolher = (chave: string) => {
    const equivalentes = existing.filter(
      (name) => isRealNeighborhood(name) && neighborhoodKey(name) === chave,
    )
    return equivalentes.length > 0
      ? pickNeighborhoodSpelling(equivalentes.map(cleanNeighborhoodName))
      : null
  }

  const exato = escolher(target)
  if (exato) return exato

  const base = target.replace(CITY_AFTER_SPACE, '')
  return base === target ? null : escolher(base)
}

export function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function formatArea(value: number): string {
  if (value >= 10000) {
    const hectares = value / 10000
    return `${hectares.toLocaleString('pt-BR')} ha`
  }
  return `${value.toLocaleString('pt-BR')} m²`
}

export function formatPriceWithSuffix(
  price: number,
  suffix?: string,
): string {
  const formatted = formatPrice(price)
  return suffix ? `${formatted}${suffix}` : formatted
}

/// Corumbá e Ladário ficam em America/Campo_Grande. Fixar o fuso evita que a
/// data publicada mude de dia conforme onde o servidor está rodando.
const LISTING_TIME_ZONE = 'America/Campo_Grande'

/// Curta, para caber discreta no card: "21/05/2026".
export function formatDateShort(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: LISTING_TIME_ZONE,
  }).format(new Date(iso))
}

/// Por extenso, para a página do imóvel: "21 de maio de 2026".
export function formatDateLong(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: LISTING_TIME_ZONE,
  }).format(new Date(iso))
}

/// Palavras que não acrescentam nada quando a nota só repete o preço:
/// "Valor: R$ 560.000,00", "Preço de venda R$ 70.000", "Valor estimado ...".
const PRICE_NOTE_FILLER =
  /\b(valor|valores|preco|preço|precos|preços|de|do|da|por|em|estimado|estimada|total|venda|aluguel|locacao|locação|imovel|imóvel|reais|r\$|rs)\b/gi

/// A geração automática de texto vem repetindo o preço na nota, que então
/// aparece duas vezes seguidas no card e na página do imóvel. Esconde a nota
/// quando, tirando números e palavras de ligação, não sobra informação.
export function isRedundantPriceNote(note: string | undefined): boolean {
  if (!note) return true

  const remaining = note
    .replace(/[\d.,]/g, ' ')
    .replace(PRICE_NOTE_FILLER, ' ')
    .replace(/[^\p{L}]/gu, ' ')
    .trim()

  return remaining.length < 4
}
