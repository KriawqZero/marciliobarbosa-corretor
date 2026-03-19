export function getWhatsAppShareUrl(
  title: string,
  price: string,
  url: string,
): string {
  const text = encodeURIComponent(`Veja este imóvel: ${title} - ${price} ${url}`)
  return `https://wa.me/?text=${text}`
}

export function getFacebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
}

export function getTwitterShareUrl(
  title: string,
  price: string,
  url: string,
): string {
  const text = encodeURIComponent(`${title} - ${price}`)
  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`
}

export function getPropertyUrl(slug: string): string {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${siteUrl}/imovel/${slug}`
}
