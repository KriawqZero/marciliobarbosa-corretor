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
