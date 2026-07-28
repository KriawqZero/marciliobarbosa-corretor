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

/// ---------------------------------------------------------------------------
/// Dados de negócio local (ficha do Google / JSON-LD)
///
/// Tudo que estiver vazio aqui é simplesmente omitido do JSON-LD — schema
/// incompleto é melhor que schema com campo inventado, que o Google trata como
/// dado errado. Preencher estes campos é o que permite o site disputar o painel
/// lateral e o resultado de mapa em buscas como "corretor de imóveis Corumbá".
/// ---------------------------------------------------------------------------

/// Logradouro e número do atendimento. Ex.: 'Rua Marechal Antônio Maria
/// Coelho, 1234'. Ainda em branco: sem o número, meio endereço no JSON-LD é
/// pior que nenhum, porque o buscador tenta casar com um ponto no mapa e erra.
export const BROKER_STREET_ADDRESS = ''
export const BROKER_POSTAL_CODE = '79304-070'
/// Coordenadas do ponto de atendimento, como string decimal.
export const BROKER_LATITUDE = '-19.0249553'
export const BROKER_LONGITUDE = '-57.6424487'
/// Perfis oficiais. Alimentam `sameAs`: é assim que o buscador confirma que o
/// site e os perfis são a mesma pessoa. URLs limpas, sem parâmetro de sessão ou
/// de tema — o buscador trata cada variação como endereço diferente.
export const BROKER_SOCIAL_PROFILES: string[] = [
  'https://www.facebook.com/marcilio.barbosa.169',
  'https://www.instagram.com/barbosamarcilio17159',
]
/// Horário de atendimento no formato schema.org. É o que produz o "Aberto
/// agora" no resultado de busca.
export const BROKER_OPENING_HOURS: Array<{
  days: string[]
  opens: string
  closes: string
}> = [
  {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '07:00',
    closes: '17:00',
  },
]
/// Ano em que começou a atuar como corretor.
export const BROKER_FOUNDING_YEAR = '2016'

/// Faixa de preço praticada, na notação que o Google entende ($ a $$$$).
export const BROKER_PRICE_RANGE = '$$'

/// Coordenadas e CEP base das cidades atendidas. São dados públicos das sedes
/// municipais e servem para o `areaServed` e para o endereço dos anúncios, que
/// não têm logradouro cadastrado.
export const CITY_GEO: Record<
  string,
  { name: string; latitude: number; longitude: number; postalCode: string }
> = {
  corumba: {
    name: 'Corumbá',
    latitude: -19.0078,
    longitude: -57.6547,
    postalCode: '79300-000',
  },
  ladario: {
    name: 'Ladário',
    latitude: -19.0047,
    longitude: -57.6017,
    postalCode: '79370-000',
  },
}

/// Rótulo legível de cada tipo de imóvel. Usado em title, descrição e JSON-LD
/// para o texto indexado dizer "Casa"/"Terreno" em vez do slug do banco.
export const PROPERTY_TYPE_LABEL: Record<string, string> = {
  casa: 'Casa',
  apartamento: 'Apartamento',
  terreno: 'Terreno',
  rural: 'Área rural',
  comercial: 'Imóvel comercial',
}

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
    seoTitle: 'Imóveis à Venda em Corumbá e Ladário - MS',
    seoDescription:
      'Casas, terrenos, apartamentos e imóveis comerciais à venda em Corumbá-MS e Ladário-MS. Veja fotos, preços e fale direto com o corretor pelo WhatsApp.',
    keywords: [
      'imóveis à venda Corumbá',
      'imóveis à venda Ladário',
      'comprar imóvel Corumbá MS',
      'casas à venda Corumbá',
    ],
    filter: { purpose: 'venda' },
    emptyTitle: 'Ainda não tenho imóveis à venda publicados',
    emptyDescription:
      'Me chame no WhatsApp: tenho opções que ainda não entraram no site.',
  },
  aluguel: {
    slug: 'aluguel',
    title: 'Imóveis para Alugar',
    description: 'Imóveis disponíveis para aluguel em Corumbá e Ladário',
    seoTitle: 'Imóveis para Alugar em Corumbá e Ladário - MS',
    seoDescription:
      'Casas, apartamentos e pontos comerciais para alugar em Corumbá-MS e Ladário-MS. Valores atualizados e atendimento direto com o corretor no WhatsApp.',
    keywords: [
      'aluguel Corumbá MS',
      'casas para alugar Corumbá',
      'apartamento para alugar Ladário',
      'imóveis para locação Corumbá',
    ],
    filter: { purpose: 'aluguel' },
    emptyTitle: 'Ainda não tenho imóveis para alugar publicados',
    emptyDescription:
      'A locação varia bastante e nem tudo chega ao site. Me chame no WhatsApp que eu procuro para você.',
  },
  casas: {
    slug: 'casas',
    title: 'Casas',
    description: 'Casas disponíveis em Corumbá e Ladário',
    seoTitle: 'Casas à Venda e para Alugar em Corumbá e Ladário - MS',
    seoDescription:
      'Casas em Corumbá-MS e Ladário-MS para comprar ou alugar. Veja quartos, área, bairro e fotos de cada casa e fale com o corretor pelo WhatsApp.',
    keywords: [
      'casas à venda Corumbá MS',
      'casas para alugar Corumbá',
      'casa Ladário MS',
      'comprar casa Corumbá',
    ],
    filter: { type: 'casa' },
    emptyTitle: 'Ainda não tenho casas publicadas',
    emptyDescription:
      'Me chame no WhatsApp e diga o bairro e a faixa de preço que você procura.',
  },
  terrenos: {
    slug: 'terrenos',
    title: 'Terrenos',
    description: 'Terrenos à venda em Corumbá e Ladário',
    seoTitle: 'Terrenos e Lotes à Venda em Corumbá e Ladário - MS',
    seoDescription:
      'Terrenos e lotes à venda em Corumbá-MS e Ladário-MS. Veja metragem, bairro e valor de cada terreno e fale direto com o corretor no WhatsApp.',
    keywords: [
      'terrenos à venda Corumbá',
      'lotes Corumbá MS',
      'terreno Ladário MS',
      'comprar terreno Corumbá',
    ],
    filter: { type: 'terreno' },
    emptyTitle: 'Ainda não tenho terrenos publicados',
    emptyDescription:
      'Me chame no WhatsApp e diga a região e o tamanho que você procura.',
  },
  apartamentos: {
    slug: 'apartamentos',
    title: 'Apartamentos',
    description: 'Apartamentos disponíveis em Corumbá e Ladário',
    seoTitle: 'Apartamentos à Venda e para Alugar em Corumbá - MS',
    seoDescription:
      'Apartamentos em Corumbá-MS e Ladário-MS para comprar ou alugar. Veja quartos, área útil, bairro e fotos, e fale com o corretor pelo WhatsApp.',
    keywords: [
      'apartamentos Corumbá MS',
      'apartamento à venda Corumbá',
      'apartamento para alugar Corumbá',
      'apartamento Ladário',
    ],
    filter: { type: 'apartamento' },
    emptyTitle: 'Ainda não tenho apartamentos publicados',
    emptyDescription:
      'O estoque de apartamentos em Corumbá é pequeno e roda rápido. Me chame no WhatsApp que eu aviso assim que aparecer um.',
  },
  comercial: {
    slug: 'comercial',
    title: 'Imóveis Comerciais',
    description: 'Pontos comerciais e oportunidades de negócio',
    seoTitle: 'Imóveis Comerciais e Pontos Comerciais em Corumbá - MS',
    seoDescription:
      'Salas, lojas, galpões e pontos comerciais à venda e para alugar em Corumbá-MS e Ladário-MS. Fale com o corretor pelo WhatsApp e agende uma visita.',
    keywords: [
      'ponto comercial Corumbá',
      'sala comercial Corumbá MS',
      'loja para alugar Corumbá',
      'galpão Corumbá MS',
    ],
    filter: { type: 'comercial' },
    emptyTitle: 'Ainda não tenho imóveis comerciais publicados',
    emptyDescription:
      'Me chame no WhatsApp e conte que tipo de ponto você procura.',
  },
  rural: {
    slug: 'rural',
    title: 'Áreas Rurais',
    description: 'Chácaras, sítios e áreas rurais na região',
    seoTitle: 'Chácaras, Sítios e Áreas Rurais em Corumbá e Ladário - MS',
    seoDescription:
      'Chácaras, sítios e áreas rurais à venda na região de Corumbá-MS e Ladário-MS, no Pantanal. Veja hectares, localização e fale com o corretor no WhatsApp.',
    keywords: [
      'chácara Corumbá MS',
      'sítio à venda Corumbá',
      'área rural Pantanal',
      'fazenda Corumbá MS',
    ],
    filter: { type: 'rural' },
    emptyTitle: 'Ainda não tenho áreas rurais publicadas',
    emptyDescription:
      'Chácaras e sítios costumam ser negociados fora do site. Me chame no WhatsApp.',
  },
  corumba: {
    slug: 'corumba',
    title: 'Imóveis em Corumbá',
    description: 'Todos os imóveis disponíveis em Corumbá-MS',
    seoTitle: 'Imóveis em Corumbá - MS: Casas, Terrenos e Apartamentos',
    seoDescription:
      'Imóveis em Corumbá-MS para comprar e alugar: casas, terrenos, apartamentos, pontos comerciais e áreas rurais. Corretor local com atendimento no WhatsApp.',
    keywords: [
      'imóveis Corumbá MS',
      'corretor de imóveis Corumbá',
      'imobiliária Corumbá MS',
      'casas Corumbá',
    ],
    filter: { citySlug: 'corumba' },
    emptyTitle: 'Ainda não tenho imóveis publicados em Corumbá',
    emptyDescription:
      'Me chame no WhatsApp e diga o que você procura.',
  },
  ladario: {
    slug: 'ladario',
    title: 'Imóveis em Ladário',
    description: 'Todos os imóveis disponíveis em Ladário-MS',
    seoTitle: 'Imóveis em Ladário - MS: Casas, Terrenos e Apartamentos',
    seoDescription:
      'Imóveis em Ladário-MS para comprar e alugar: casas, terrenos, apartamentos e áreas rurais. Corretor local com atendimento direto pelo WhatsApp.',
    keywords: [
      'imóveis Ladário MS',
      'corretor de imóveis Ladário',
      'casas Ladário MS',
      'terreno Ladário',
    ],
    filter: { citySlug: 'ladario' },
    emptyTitle: 'Ainda não tenho imóveis publicados em Ladário',
    emptyDescription:
      'Me chame no WhatsApp e diga o que você procura em Ladário.',
  },
  oportunidades: {
    slug: 'oportunidades',
    title: 'Oportunidades Especiais',
    description: 'Oportunidades únicas de negócio na região',
    seoTitle: 'Oportunidades de Imóveis e Negócios em Corumbá e Ladário',
    seoDescription:
      'Imóveis e negócios com condição especial em Corumbá-MS e Ladário-MS: lojas, mercados, pontos em funcionamento e imóveis abaixo do valor de mercado.',
    keywords: [
      'oportunidade imóvel Corumbá',
      'negócio à venda Corumbá MS',
      'passar ponto Corumbá',
      'imóvel abaixo do mercado Corumbá',
    ],
    filter: { specialOpportunity: true },
    emptyTitle: 'Nenhuma oportunidade especial no momento',
    emptyDescription:
      'São negócios pontuais e saem rápido. Me chame no WhatsApp para saber das próximas.',
  },
}

export const VALID_CATEGORIES = Object.keys(CATEGORIES)
