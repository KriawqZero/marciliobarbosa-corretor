import { BROKER_PHONE, WHATSAPP_DEFAULT_MESSAGE } from './constants'

export function getWhatsAppLink(message?: string): string {
  const text = encodeURIComponent(message || WHATSAPP_DEFAULT_MESSAGE)
  return `https://wa.me/${BROKER_PHONE}?text=${text}`
}

export function getWhatsAppPropertyLink(whatsappMessage: string): string {
  return getWhatsAppLink(whatsappMessage)
}
