import type { CategoryMeta } from '@/types'

export const SITE_NAME = 'Marcilio Barbosa Imóveis'
export const BROKER_NAME = 'Marcilio Barbosa'
export const BROKER_PHONE = '55679996294660'
export const BROKER_PHONE_DISPLAY = '(67) 99629-4660'
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
  },
  aluguel: {
    slug: 'aluguel',
    title: 'Imóveis para Alugar',
    description: 'Imóveis disponíveis para aluguel em Corumbá e Ladário',
    filter: { purpose: 'aluguel' },
  },
  casas: {
    slug: 'casas',
    title: 'Casas',
    description: 'Casas disponíveis em Corumbá e Ladário',
    filter: { type: 'casa' },
  },
  terrenos: {
    slug: 'terrenos',
    title: 'Terrenos',
    description: 'Terrenos à venda em Corumbá e Ladário',
    filter: { type: 'terreno' },
  },
  apartamentos: {
    slug: 'apartamentos',
    title: 'Apartamentos',
    description: 'Apartamentos disponíveis em Corumbá e Ladário',
    filter: { type: 'apartamento' },
  },
  comercial: {
    slug: 'comercial',
    title: 'Imóveis Comerciais',
    description: 'Pontos comerciais e oportunidades de negócio',
    filter: { type: 'comercial' },
  },
  rural: {
    slug: 'rural',
    title: 'Áreas Rurais',
    description: 'Chácaras, sítios e áreas rurais na região',
    filter: { type: 'rural' },
  },
  corumba: {
    slug: 'corumba',
    title: 'Imóveis em Corumbá',
    description: 'Todos os imóveis disponíveis em Corumbá-MS',
    filter: { citySlug: 'corumba' },
  },
  ladario: {
    slug: 'ladario',
    title: 'Imóveis em Ladário',
    description: 'Todos os imóveis disponíveis em Ladário-MS',
    filter: { citySlug: 'ladario' },
  },
  oportunidades: {
    slug: 'oportunidades',
    title: 'Oportunidades Especiais',
    description: 'Oportunidades únicas de negócio na região',
    filter: { specialOpportunity: true },
  },
}

export const VALID_CATEGORIES = Object.keys(CATEGORIES)
