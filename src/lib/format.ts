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
