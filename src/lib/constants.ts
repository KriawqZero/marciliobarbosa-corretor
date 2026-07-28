import type { CategoryMeta, PropertyFilter } from '@/types'

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

/// Tag do cache de dados do catálogo (`unstable_cache` em
/// `data/services/properties.ts`). Vive aqui — e não lá — porque arquivos
/// `'use server'` só podem exportar funções assíncronas, e `revalidate.ts`
/// também precisa dela para invalidar tudo após uma escrita.
export const PROPERTIES_CACHE_TAG = 'properties'

export const CITIES = ['Corumbá', 'Ladário'] as const

/// ---------------------------------------------------------------------------
/// Dados de negócio local (ficha do Google / JSON-LD)
///
/// Tudo que estiver vazio aqui é simplesmente omitido do JSON-LD — schema
/// incompleto é melhor que schema com campo inventado, que o Google trata como
/// dado errado. Preencher estes campos é o que permite o site disputar o painel
/// lateral e o resultado de mapa em buscas como "corretor de imóveis Corumbá".
/// ---------------------------------------------------------------------------

/// Logradouro e número do atendimento.
export const BROKER_STREET_ADDRESS = 'Rua Marechal Antônio Maria Coelho, 3213'
export const BROKER_POSTAL_CODE = '79311-030'
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
  { days: ['Saturday'], opens: '07:00', closes: '12:00' },
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
    intro: [
      'Tudo que está à venda em Corumbá-MS e Ladário-MS: casas, apartamentos, terrenos, pontos comerciais e áreas rurais. Os valores estão em cada anúncio, junto com as fotos e as características do imóvel.',
      'Além de mostrar o imóvel, eu acompanho a negociação até o fim: documentação, proposta e, quando for o caso, o processo de financiamento. Se você ainda não sabe quanto consegue financiar, me chame no WhatsApp que a gente vê isso antes de sair visitando.',
    ],
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
    intro: [
      'Imóveis para alugar em Corumbá-MS e Ladário-MS. Os valores mostrados são mensais, e cada anúncio traz o bairro, o tamanho e as fotos do imóvel.',
      'A locação na região gira rápido e boa parte nem chega a ser anunciada. Se não encontrar o que procura aqui, me chame no WhatsApp dizendo o bairro e o valor que cabe no seu orçamento — eu procuro e aviso você.',
    ],
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
    intro: [
      'Casas em Corumbá-MS e Ladário-MS, para comprar ou alugar. Cada anúncio traz o bairro, o número de quartos e banheiros, a área do terreno e da construção, as vagas de garagem e as fotos do imóvel — para você já chegar na conversa sabendo o que vai ver.',
      'O atendimento é direto comigo, sem intermediário e sem cadastro: você escolhe a casa, clica no WhatsApp e a gente marca a visita. Se o que você procura não estiver na lista, me chame mesmo assim — parte das casas da região é negociada antes de chegar ao site.',
    ],
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
    intro: [
      'Terrenos e lotes em Corumbá-MS e Ladário-MS, com a metragem e o bairro de cada um. Serve tanto para quem vai construir a própria casa quanto para quem procura terreno como investimento na região.',
      'Antes de fechar, eu ajudo a conferir a documentação e a situação do lote. Me chame no WhatsApp dizendo a região e o tamanho que você procura, e eu aviso quando aparecer algo no perfil.',
    ],
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
    intro: [
      'Corumbá é a maior cidade do Pantanal Sul-Mato-Grossense e faz fronteira com a Bolívia. Aqui estão os imóveis que tenho disponíveis na cidade: casas, apartamentos, terrenos, pontos comerciais e áreas rurais, para compra e para locação.',
      'Sou corretor registrado e moro na região — conheço os bairros, o que costuma valorizar e o que costuma demorar a vender. Se você está vindo de fora, me chame no WhatsApp que eu explico como funciona o mercado local antes de você decidir.',
    ],
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
    intro: [
      'Ladário fica colada em Corumbá e é conhecida pela base da Marinha do Brasil. É uma cidade mais tranquila, e costuma ter imóvel com preço mais acessível que o da vizinha — o que atrai quem trabalha em Corumbá mas prefere morar com menos movimento.',
      'Aqui estão os imóveis que tenho em Ladário. Atendo as duas cidades, então se você está aberto às duas, vale olhar também a página de Corumbá.',
    ],
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

/// ---------------------------------------------------------------------------
/// Páginas de busca combinada
///
/// Quase ninguém pesquisa "casas". Pesquisa "casa à venda em Corumbá MS". Essa
/// combinação existia só como filtro na URL (`/imoveis/casas?finalidade=venda`),
/// e filtro é marcado como não-indexável de propósito — senão cada combinação
/// vira uma página rasa disputando espaço com as outras.
///
/// A saída é escolher à mão as combinações que valem uma página de verdade, com
/// endereço limpo, título próprio e texto próprio. São páginas normais de
/// categoria: entram no sitemap, na trilha de navegação e nos dados
/// estruturados sem nenhum código novo.
///
/// Combinação sem nenhum imóvel não é indexada (ver `src/app/imoveis/
/// [categoria]/page.tsx`): a página continua no ar para quem chega nela, mas só
/// se apresenta ao buscador quando tem o que mostrar. Cresceu o acervo, a
/// página se liga sozinha.
/// ---------------------------------------------------------------------------

interface ComboSpec {
  slug: string
  title: string
  seoTitle: string
  seoDescription: string
  keywords: string[]
  filter: PropertyFilter
  parent: string
  intro: string[]
}

const CITY_LABEL: Record<string, string> = {
  corumba: 'Corumbá',
  ladario: 'Ladário',
}

const COMBOS: ComboSpec[] = [
  // ---- finalidade × cidade ----
  {
    slug: 'imoveis-a-venda-em-corumba',
    title: 'Imóveis à Venda em Corumbá',
    seoTitle: 'Imóveis à Venda em Corumbá - MS',
    seoDescription:
      'Imóveis à venda em Corumbá-MS: casas, apartamentos, terrenos, pontos comerciais e áreas rurais. Fotos, valores e contato direto com o corretor no WhatsApp.',
    keywords: ['imóveis à venda Corumbá MS', 'comprar imóvel Corumbá', 'imóveis Corumbá MS'],
    filter: { purpose: 'venda', citySlug: 'corumba' },
    parent: 'corumba',
    intro: [
      'Todos os imóveis que tenho à venda em Corumbá-MS, reunidos numa página só. Cada anúncio mostra o valor, o bairro, o tamanho e as fotos.',
      'Sou corretor registrado e atendo Corumbá e Ladário. Acompanho a negociação do início ao fim, incluindo documentação e financiamento quando for o caso.',
    ],
  },
  {
    slug: 'imoveis-a-venda-em-ladario',
    title: 'Imóveis à Venda em Ladário',
    seoTitle: 'Imóveis à Venda em Ladário - MS',
    seoDescription:
      'Imóveis à venda em Ladário-MS: casas, terrenos, apartamentos e áreas rurais. Veja fotos e valores e fale direto com o corretor pelo WhatsApp.',
    keywords: ['imóveis à venda Ladário MS', 'comprar imóvel Ladário', 'imóveis Ladário'],
    filter: { purpose: 'venda', citySlug: 'ladario' },
    parent: 'ladario',
    intro: [
      'Imóveis à venda em Ladário-MS. A cidade fica ao lado de Corumbá e costuma ter preço mais acessível, o que atrai quem trabalha em Corumbá e prefere morar com menos movimento.',
      'Atendo as duas cidades. Se estiver aberto às duas, vale olhar também os imóveis à venda em Corumbá.',
    ],
  },
  {
    slug: 'imoveis-para-alugar-em-corumba',
    title: 'Imóveis para Alugar em Corumbá',
    seoTitle: 'Imóveis para Alugar em Corumbá - MS',
    seoDescription:
      'Imóveis para alugar em Corumbá-MS: casas, apartamentos e pontos comerciais. Valores mensais atualizados e atendimento direto com o corretor no WhatsApp.',
    keywords: ['aluguel Corumbá MS', 'imóveis para alugar Corumbá', 'alugar casa Corumbá'],
    filter: { purpose: 'aluguel', citySlug: 'corumba' },
    parent: 'corumba',
    intro: [
      'Imóveis para alugar em Corumbá-MS, com o valor mensal em cada anúncio.',
      'A locação em Corumbá gira rápido e boa parte nem chega a ser anunciada. Se não achar o que procura, me chame no WhatsApp com o bairro e o valor que cabe no seu orçamento.',
    ],
  },
  {
    slug: 'imoveis-para-alugar-em-ladario',
    title: 'Imóveis para Alugar em Ladário',
    seoTitle: 'Imóveis para Alugar em Ladário - MS',
    seoDescription:
      'Imóveis para alugar em Ladário-MS: casas, apartamentos e pontos comerciais, com valores mensais e contato direto com o corretor pelo WhatsApp.',
    keywords: ['aluguel Ladário MS', 'imóveis para alugar Ladário', 'alugar casa Ladário'],
    filter: { purpose: 'aluguel', citySlug: 'ladario' },
    parent: 'ladario',
    intro: [
      'Imóveis para alugar em Ladário-MS, com o valor mensal em cada anúncio.',
      'Atendo Ladário e Corumbá. Me chame no WhatsApp dizendo o bairro e o orçamento que eu procuro para você.',
    ],
  },

  // ---- tipo × cidade ----
  {
    slug: 'casas-em-corumba',
    title: 'Casas em Corumbá',
    seoTitle: 'Casas em Corumbá - MS: à Venda e para Alugar',
    seoDescription:
      'Casas em Corumbá-MS para comprar ou alugar. Veja quartos, banheiros, área, bairro e fotos de cada casa, e fale direto com o corretor pelo WhatsApp.',
    keywords: ['casas em Corumbá MS', 'casa Corumbá', 'casas Corumbá'],
    filter: { type: 'casa', citySlug: 'corumba' },
    parent: 'corumba',
    intro: [
      'Casas em Corumbá-MS, para compra e para locação. Cada anúncio traz o bairro, os quartos e banheiros, a área do terreno e da construção, as vagas de garagem e as fotos.',
      'Se você já sabe se quer comprar ou alugar, use as páginas específicas de casas à venda ou casas para alugar em Corumbá, logo abaixo desta lista.',
    ],
  },
  {
    slug: 'casas-em-ladario',
    title: 'Casas em Ladário',
    seoTitle: 'Casas em Ladário - MS: à Venda e para Alugar',
    seoDescription:
      'Casas em Ladário-MS para comprar ou alugar. Quartos, área, bairro e fotos de cada casa, com atendimento direto do corretor pelo WhatsApp.',
    keywords: ['casas em Ladário MS', 'casa Ladário', 'casas Ladário'],
    filter: { type: 'casa', citySlug: 'ladario' },
    parent: 'ladario',
    intro: [
      'Casas em Ladário-MS, para compra e para locação, com bairro, tamanho e fotos em cada anúncio.',
      'Ladário costuma ter casa com preço mais acessível que Corumbá, e as duas cidades são vizinhas. Se o deslocamento não for problema, vale comparar com as casas em Corumbá.',
    ],
  },
  {
    slug: 'terrenos-em-corumba',
    title: 'Terrenos em Corumbá',
    seoTitle: 'Terrenos e Lotes à Venda em Corumbá - MS',
    seoDescription:
      'Terrenos e lotes à venda em Corumbá-MS, com metragem, bairro e valor. Para construir ou investir. Fale direto com o corretor pelo WhatsApp.',
    keywords: ['terrenos em Corumbá MS', 'lotes Corumbá', 'comprar terreno Corumbá'],
    filter: { type: 'terreno', citySlug: 'corumba' },
    parent: 'corumba',
    intro: [
      'Terrenos e lotes em Corumbá-MS, com a metragem e o bairro de cada um. Serve para quem vai construir e para quem procura terreno como investimento.',
      'Antes de fechar, eu ajudo a conferir a documentação e a situação do lote. Me chame no WhatsApp com a região e o tamanho que você procura.',
    ],
  },
  {
    slug: 'terrenos-em-ladario',
    title: 'Terrenos em Ladário',
    seoTitle: 'Terrenos e Lotes à Venda em Ladário - MS',
    seoDescription:
      'Terrenos e lotes à venda em Ladário-MS, com metragem, bairro e valor. Ideais para construir. Atendimento direto com o corretor no WhatsApp.',
    keywords: ['terrenos em Ladário MS', 'lotes Ladário', 'comprar terreno Ladário'],
    filter: { type: 'terreno', citySlug: 'ladario' },
    parent: 'ladario',
    intro: [
      'Terrenos e lotes em Ladário-MS, com metragem e bairro em cada anúncio.',
      'Ajudo a conferir a documentação antes de fechar. Me chame no WhatsApp dizendo a região e o tamanho que procura.',
    ],
  },
  {
    slug: 'apartamentos-em-corumba',
    title: 'Apartamentos em Corumbá',
    seoTitle: 'Apartamentos em Corumbá - MS: à Venda e para Alugar',
    seoDescription:
      'Apartamentos em Corumbá-MS para comprar ou alugar. Veja quartos, área útil, bairro e fotos, e fale direto com o corretor pelo WhatsApp.',
    keywords: ['apartamentos em Corumbá MS', 'apartamento Corumbá', 'apto Corumbá'],
    filter: { type: 'apartamento', citySlug: 'corumba' },
    parent: 'corumba',
    intro: [
      'Apartamentos em Corumbá-MS, para compra e para locação, com quartos, área e bairro em cada anúncio.',
      'O estoque de apartamento em Corumbá é pequeno e roda rápido. Se não achar o que procura, me chame no WhatsApp que eu aviso assim que aparecer um no seu perfil.',
    ],
  },
  {
    slug: 'chacaras-e-sitios-em-corumba',
    title: 'Chácaras e Sítios em Corumbá',
    seoTitle: 'Chácaras e Sítios à Venda em Corumbá - MS',
    seoDescription:
      'Chácaras, sítios e áreas rurais à venda na região de Corumbá-MS, no Pantanal. Veja hectares e localização e fale com o corretor pelo WhatsApp.',
    keywords: ['chácara Corumbá MS', 'sítio Corumbá', 'área rural Corumbá', 'chácaras Pantanal'],
    filter: { type: 'rural', citySlug: 'corumba' },
    parent: 'rural',
    intro: [
      'Chácaras, sítios e áreas rurais na região de Corumbá-MS, com a área de cada um em hectares ou metros quadrados.',
      'Imóvel rural costuma ter particularidade de documentação e de acesso. Me chame no WhatsApp antes de visitar que eu explico o que conferir em cada caso.',
    ],
  },
  {
    slug: 'pontos-comerciais-em-corumba',
    title: 'Pontos Comerciais em Corumbá',
    seoTitle: 'Pontos Comerciais e Salas à Venda ou Alugar em Corumbá - MS',
    seoDescription:
      'Salas, lojas, galpões e pontos comerciais em Corumbá-MS, à venda e para alugar. Veja localização e valores e fale com o corretor pelo WhatsApp.',
    keywords: ['ponto comercial Corumbá', 'sala comercial Corumbá MS', 'loja Corumbá', 'galpão Corumbá'],
    filter: { type: 'comercial', citySlug: 'corumba' },
    parent: 'comercial',
    intro: [
      'Salas, lojas, galpões e pontos comerciais em Corumbá-MS, para venda e para locação.',
      'De vez em quando aparece também negócio em funcionamento — loja, mercado ou depósito com estrutura montada. Esses costumam sair rápido; vale olhar a página de oportunidades.',
    ],
  },

  // ---- tipo × finalidade × cidade (maior intenção de compra) ----
  {
    slug: 'casas-a-venda-em-corumba',
    title: 'Casas à Venda em Corumbá',
    seoTitle: 'Casas à Venda em Corumbá - MS',
    seoDescription:
      'Casas à venda em Corumbá-MS: veja quartos, banheiros, área, bairro, fotos e valor de cada casa. Aceita financiamento. Fale com o corretor no WhatsApp.',
    keywords: ['casas à venda Corumbá MS', 'comprar casa Corumbá', 'casa à venda Corumbá'],
    filter: { type: 'casa', purpose: 'venda', citySlug: 'corumba' },
    parent: 'casas-em-corumba',
    intro: [
      'Casas à venda em Corumbá-MS. Cada anúncio traz o valor, o bairro, os quartos e banheiros, a área e as fotos da casa.',
      'Acompanho a compra do início ao fim: proposta, documentação e financiamento. Se você ainda não sabe quanto consegue financiar, me chame no WhatsApp que a gente vê isso antes de sair visitando.',
    ],
  },
  {
    slug: 'casas-a-venda-em-ladario',
    title: 'Casas à Venda em Ladário',
    seoTitle: 'Casas à Venda em Ladário - MS',
    seoDescription:
      'Casas à venda em Ladário-MS: quartos, área, bairro, fotos e valor de cada casa, com atendimento direto do corretor pelo WhatsApp.',
    keywords: ['casas à venda Ladário MS', 'comprar casa Ladário', 'casa à venda Ladário'],
    filter: { type: 'casa', purpose: 'venda', citySlug: 'ladario' },
    parent: 'casas-em-ladario',
    intro: [
      'Casas à venda em Ladário-MS, com valor, bairro, tamanho e fotos em cada anúncio.',
      'Acompanho documentação e financiamento. Se o deslocamento até Corumbá não for problema, vale comparar também com as casas à venda em Corumbá.',
    ],
  },
  {
    slug: 'casas-para-alugar-em-corumba',
    title: 'Casas para Alugar em Corumbá',
    seoTitle: 'Casas para Alugar em Corumbá - MS',
    seoDescription:
      'Casas para alugar em Corumbá-MS, com valor mensal, bairro, quartos e fotos. Atendimento direto com o corretor pelo WhatsApp.',
    keywords: ['casas para alugar Corumbá', 'alugar casa Corumbá MS', 'casa aluguel Corumbá'],
    filter: { type: 'casa', purpose: 'aluguel', citySlug: 'corumba' },
    parent: 'casas-em-corumba',
    intro: [
      'Casas para alugar em Corumbá-MS. Os valores mostrados são mensais.',
      'A locação de casa em Corumbá sai rápido e nem tudo chega ao site. Me chame no WhatsApp com o bairro e o valor que cabe no seu orçamento que eu procuro para você.',
    ],
  },
  {
    slug: 'terrenos-a-venda-em-corumba',
    title: 'Terrenos à Venda em Corumbá',
    seoTitle: 'Terrenos à Venda em Corumbá - MS',
    seoDescription:
      'Terrenos à venda em Corumbá-MS, com metragem, bairro e valor de cada lote. Para construir ou investir. Fale com o corretor pelo WhatsApp.',
    keywords: ['terrenos à venda Corumbá MS', 'comprar terreno Corumbá', 'lote à venda Corumbá'],
    filter: { type: 'terreno', purpose: 'venda', citySlug: 'corumba' },
    parent: 'terrenos-em-corumba',
    intro: [
      'Terrenos à venda em Corumbá-MS, com a metragem, o bairro e o valor de cada lote.',
      'Ajudo a conferir a documentação e a situação do terreno antes de fechar. Me chame no WhatsApp com a região e o tamanho que você procura.',
    ],
  },
]

for (const combo of COMBOS) {
  const cidade = combo.filter.citySlug
    ? CITY_LABEL[combo.filter.citySlug]
    : 'Corumbá e Ladário'

  CATEGORIES[combo.slug] = {
    slug: combo.slug,
    title: combo.title,
    description: combo.seoDescription,
    seoTitle: combo.seoTitle,
    seoDescription: combo.seoDescription,
    keywords: combo.keywords,
    filter: combo.filter,
    parent: combo.parent,
    intro: combo.intro,
    emptyTitle: `Ainda não tenho nada publicado nesta busca`,
    emptyDescription: `Nem tudo que tenho em ${cidade} chega ao site. Me chame no WhatsApp e diga o que procura — eu verifico e te aviso.`,
  }
}

export const VALID_CATEGORIES = Object.keys(CATEGORIES)

/// Slugs das combinações, para os blocos de links internos.
export const COMBO_CATEGORIES = COMBOS.map((combo) => combo.slug)
