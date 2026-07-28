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
