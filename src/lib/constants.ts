import type { CategoryMeta } from '@/types'

export const SITE_NAME = 'Corretor Marcilio Barbosa'
export const BROKER_NAME = 'Corretor Marcilio Barbosa'
export const BROKER_PHONE = '5567996294660'
export const BROKER_PHONE_DISPLAY = '(67) 99629-4660'
/// Formato E.164 para `tel:`. Derivar de BROKER_PHONE_DISPLAY perde o DDI 55.
export const BROKER_PHONE_TEL = `+${BROKER_PHONE}`
export const BROKER_EMAIL = 'barbosasmarcilio@gmail.com'
export const BROKER_CRECI = 'CRECI/MS 17.159'

export const WHATSAPP_DEFAULT_MESSAGE =
  'Olá! Gostaria de mais informações sobre imóveis disponíveis em Corumbá e Ladário.'

export const CITIES = ['Corumbá', 'Ladário'] as const

export const NAV_LINKS = [
  { href: '/', label: 'Início' },
  { href: '/imoveis', label: 'Imóveis' },
  { href: '/imoveis/venda', label: 'Venda' },
  { href: '/imoveis/aluguel', label: 'Aluguel' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/contato', label: 'Contato' },
] as const

export const CATEGORIES: Record<string, CategoryMeta> = {
  venda: {
    slug: 'venda',
    title: 'Imóveis à Venda',
    description: 'Casas, terrenos e apartamentos à venda em Corumbá e Ladário',
    filter: { purpose: 'venda' },
    emptyTitle: 'Ainda não tenho imóveis à venda publicados',
    emptyDescription:
      'Me chame no WhatsApp: tenho opções que ainda não entraram no site.',
  },
  aluguel: {
    slug: 'aluguel',
    title: 'Imóveis para Alugar',
    description: 'Imóveis disponíveis para aluguel em Corumbá e Ladário',
    filter: { purpose: 'aluguel' },
    emptyTitle: 'Ainda não tenho imóveis para alugar publicados',
    emptyDescription:
      'A locação varia bastante e nem tudo chega ao site. Me chame no WhatsApp que eu procuro para você.',
  },
  casas: {
    slug: 'casas',
    title: 'Casas',
    description: 'Casas disponíveis em Corumbá e Ladário',
    filter: { type: 'casa' },
    emptyTitle: 'Ainda não tenho casas publicadas',
    emptyDescription:
      'Me chame no WhatsApp e diga o bairro e a faixa de preço que você procura.',
  },
  terrenos: {
    slug: 'terrenos',
    title: 'Terrenos',
    description: 'Terrenos à venda em Corumbá e Ladário',
    filter: { type: 'terreno' },
    emptyTitle: 'Ainda não tenho terrenos publicados',
    emptyDescription:
      'Me chame no WhatsApp e diga a região e o tamanho que você procura.',
  },
  apartamentos: {
    slug: 'apartamentos',
    title: 'Apartamentos',
    description: 'Apartamentos disponíveis em Corumbá e Ladário',
    filter: { type: 'apartamento' },
    emptyTitle: 'Ainda não tenho apartamentos publicados',
    emptyDescription:
      'O estoque de apartamentos em Corumbá é pequeno e roda rápido. Me chame no WhatsApp que eu aviso assim que aparecer um.',
  },
  comercial: {
    slug: 'comercial',
    title: 'Imóveis Comerciais',
    description: 'Pontos comerciais e oportunidades de negócio',
    filter: { type: 'comercial' },
    emptyTitle: 'Ainda não tenho imóveis comerciais publicados',
    emptyDescription:
      'Me chame no WhatsApp e conte que tipo de ponto você procura.',
  },
  rural: {
    slug: 'rural',
    title: 'Áreas Rurais',
    description: 'Chácaras, sítios e áreas rurais na região',
    filter: { type: 'rural' },
    emptyTitle: 'Ainda não tenho áreas rurais publicadas',
    emptyDescription:
      'Chácaras e sítios costumam ser negociados fora do site. Me chame no WhatsApp.',
  },
  corumba: {
    slug: 'corumba',
    title: 'Imóveis em Corumbá',
    description: 'Todos os imóveis disponíveis em Corumbá-MS',
    filter: { citySlug: 'corumba' },
    emptyTitle: 'Ainda não tenho imóveis publicados em Corumbá',
    emptyDescription:
      'Me chame no WhatsApp e diga o que você procura.',
  },
  ladario: {
    slug: 'ladario',
    title: 'Imóveis em Ladário',
    description: 'Todos os imóveis disponíveis em Ladário-MS',
    filter: { citySlug: 'ladario' },
    emptyTitle: 'Ainda não tenho imóveis publicados em Ladário',
    emptyDescription:
      'Me chame no WhatsApp e diga o que você procura em Ladário.',
  },
  oportunidades: {
    slug: 'oportunidades',
    title: 'Oportunidades Especiais',
    description: 'Oportunidades únicas de negócio na região',
    filter: { specialOpportunity: true },
    emptyTitle: 'Nenhuma oportunidade especial no momento',
    emptyDescription:
      'São negócios pontuais e saem rápido. Me chame no WhatsApp para saber das próximas.',
  },
}

export const VALID_CATEGORIES = Object.keys(CATEGORIES)
