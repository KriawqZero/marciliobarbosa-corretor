import { BROKER_PHONE, WHATSAPP_DEFAULT_MESSAGE } from './constants'

export function getWhatsAppLink(message?: string): string {
  const text = encodeURIComponent(message || WHATSAPP_DEFAULT_MESSAGE)
  return `https://wa.me/${BROKER_PHONE}?text=${text}`
}

export function getWhatsAppPropertyLink(whatsappMessage: string): string {
  return getWhatsAppLink(whatsappMessage)
}

/// Mensagem do WhatsApp de um imóvel, garantindo que o corretor saiba de qual.
///
/// A mensagem gravada no cadastro é gerada por IA e nem sempre cita o imóvel —
/// várias caem no texto genérico ("Gostaria de mais informações sobre imóveis
/// disponíveis"). Quem recebia não sabia o que a pessoa estava olhando, e a
/// primeira resposta virava "qual imóvel?", que é onde a conversa esfria.
///
/// A customização do corretor é preservada quando ela cita o imóvel. Quando não
/// cita, entra o texto padrão. Em qualquer caso o link do anúncio é anexado:
/// é o que resolve a dúvida em um toque, mesmo com título parecido entre dois
/// imóveis.
export function buildPropertyWhatsAppMessage({
  title,
  url,
  storedMessage,
}: {
  title: string
  url: string
  storedMessage?: string
}): string {
  const stored = storedMessage?.trim() ?? ''
  const citaOImovel =
    stored.length > 0 && stored.toLowerCase().includes(title.toLowerCase())

  const base = citaOImovel
    ? stored
    : `Olá! Tenho interesse no imóvel "${title}". Podemos conversar?`

  return base.includes(url) ? base : `${base}\n\n${url}`
}
