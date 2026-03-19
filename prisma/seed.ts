import { PrismaClient } from '../src/generated/prisma/client'
import { PropertyPurpose, PropertyType, PropertyCity, PropertyStatus } from '../src/generated/prisma/enums'
import { PrismaPg } from '@prisma/adapter-pg'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL não está definida no .env')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL }),
})

const properties = [
  {
    slug: 'casa-3-quartos-centro-corumba',
    title: 'Casa espaçosa com 3 quartos no Centro',
    purpose: PropertyPurpose.venda,
    type: PropertyType.casa,
    city: PropertyCity.corumba,
    citySlug: 'corumba',
    neighborhood: 'Centro',
    price: 380000,
    priceSuffix: null,
    priceNote: 'Aceita financiamento',
    shortDescription:
      'Casa bem localizada no Centro de Corumbá, com 3 quartos, quintal amplo e garagem para 2 carros.',
    longDescription:
      'Excelente casa no coração de Corumbá, próxima a comércios, escolas e serviços. Possui 3 quartos sendo 1 suíte, sala ampla, cozinha planejada, área de serviço coberta, quintal com churrasqueira e garagem para 2 veículos. Imóvel bem conservado, pronto para morar. Documentação em dia. Aceita financiamento bancário.',
    bedrooms: 3,
    bathrooms: 2,
    parkingSpaces: 2,
    totalArea: 300,
    builtArea: 180,
    coverImageUrl:
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=800&fit=crop&q=80',
    featured: true,
    specialOpportunity: false,
    tags: ['financiamento', 'quintal', 'churrasqueira', 'suíte'],
    status: PropertyStatus.disponivel,
    whatsappMessage:
      'Olá! Tenho interesse na casa de 3 quartos no Centro de Corumbá (Ref: 1). Podemos conversar?',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=800&fit=crop&q=80',
        alt: 'Fachada da casa',
        width: 1200,
        height: 800,
        sortOrder: 0,
      },
      {
        src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=800&fit=crop&q=80',
        alt: 'Sala de estar',
        width: 1200,
        height: 800,
        sortOrder: 1,
      },
      {
        src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=800&fit=crop&q=80',
        alt: 'Cozinha planejada',
        width: 1200,
        height: 800,
        sortOrder: 2,
      },
      {
        src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop&q=80',
        alt: 'Quintal com churrasqueira',
        width: 1200,
        height: 800,
        sortOrder: 3,
      },
    ],
  },
  {
    slug: 'casa-2-quartos-popular-ladario-aluguel',
    title: 'Casa 2 quartos para alugar no Popular',
    purpose: PropertyPurpose.aluguel,
    type: PropertyType.casa,
    city: PropertyCity.ladario,
    citySlug: 'ladario',
    neighborhood: 'Popular',
    price: 1200,
    priceSuffix: '/mês',
    priceNote: null,
    shortDescription:
      'Casa simples e bem cuidada com 2 quartos em Ladário, ideal para família pequena.',
    longDescription:
      'Casa para aluguel no bairro Popular em Ladário. Possui 2 quartos, sala, cozinha, banheiro e área de serviço. Imóvel em bom estado, rua tranquila, próximo a ponto de ônibus e mercados. Sem vaga de garagem coberta, mas com espaço frontal. Valor de aluguel R$ 1.200/mês. Sem fiador — aceita seguro fiança ou depósito caução.',
    bedrooms: 2,
    bathrooms: 1,
    parkingSpaces: 0,
    totalArea: 150,
    builtArea: 80,
    coverImageUrl:
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&h=800&fit=crop&q=80',
    featured: false,
    specialOpportunity: false,
    tags: ['aluguel', 'sem fiador', 'família'],
    status: PropertyStatus.disponivel,
    whatsappMessage:
      'Olá! Tenho interesse na casa para alugar no bairro Popular em Ladário (Ref: 2). Podemos conversar?',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&h=800&fit=crop&q=80',
        alt: 'Fachada da casa',
        width: 1200,
        height: 800,
        sortOrder: 0,
      },
      {
        src: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop&q=80',
        alt: 'Sala',
        width: 1200,
        height: 800,
        sortOrder: 1,
      },
      {
        src: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&h=800&fit=crop&q=80',
        alt: 'Quarto principal',
        width: 1200,
        height: 800,
        sortOrder: 2,
      },
    ],
  },
  {
    slug: 'terreno-360m2-nova-corumba',
    title: 'Terreno 360m² no Nova Corumbá',
    purpose: PropertyPurpose.venda,
    type: PropertyType.terreno,
    city: PropertyCity.corumba,
    citySlug: 'corumba',
    neighborhood: 'Nova Corumbá',
    price: 95000,
    priceSuffix: null,
    priceNote: 'Aceita parcelamento direto',
    shortDescription:
      'Terreno plano de 360m² em loteamento regularizado, pronto para construir.',
    longDescription:
      'Terreno de 360m² (12x30) no loteamento Nova Corumbá, totalmente plano e pronto para construir. Loteamento com ruas abertas, água e energia disponíveis. Documentação regularizada. Ótima opção para quem quer construir a casa própria. Aceita parcelamento direto com o proprietário em até 24x. Região em crescimento com novos comércios e residências.',
    bedrooms: null,
    bathrooms: null,
    parkingSpaces: null,
    totalArea: 360,
    builtArea: null,
    coverImageUrl:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80',
    featured: false,
    specialOpportunity: false,
    tags: ['terreno', 'plano', 'loteamento', 'parcelamento'],
    status: PropertyStatus.disponivel,
    whatsappMessage:
      'Olá! Tenho interesse no terreno de 360m² no Nova Corumbá (Ref: 3). Podemos conversar?',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80',
        alt: 'Vista frontal do terreno',
        width: 1200,
        height: 800,
        sortOrder: 0,
      },
      {
        src: 'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=1200&h=800&fit=crop&q=80',
        alt: 'Vista lateral',
        width: 1200,
        height: 800,
        sortOrder: 1,
      },
    ],
  },
  {
    slug: 'apartamento-2-quartos-cristo-redentor-corumba',
    title: 'Apartamento 2 quartos no Cristo Redentor',
    purpose: PropertyPurpose.venda,
    type: PropertyType.apartamento,
    city: PropertyCity.corumba,
    citySlug: 'corumba',
    neighborhood: 'Cristo Redentor',
    price: 250000,
    priceSuffix: null,
    priceNote: 'Aceita financiamento pela Caixa',
    shortDescription:
      'Apartamento no 2° andar com 2 quartos, varanda e vaga de garagem coberta.',
    longDescription:
      'Apartamento bem localizado no bairro Cristo Redentor, 2° andar, com 2 quartos, sala com varanda, cozinha americana, banheiro social e área de serviço. Condomínio com portaria e vaga de garagem coberta. Próximo a supermercados e farmácias. Documentação pronta para financiamento pela Caixa Econômica. Condomínio de R$ 280/mês.',
    bedrooms: 2,
    bathrooms: 1,
    parkingSpaces: 1,
    totalArea: 65,
    builtArea: 58,
    coverImageUrl:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop&q=80',
    featured: true,
    specialOpportunity: false,
    tags: ['financiamento', 'varanda', 'garagem coberta', 'portaria'],
    status: PropertyStatus.disponivel,
    whatsappMessage:
      'Olá! Tenho interesse no apartamento de 2 quartos no Cristo Redentor (Ref: 4). Podemos conversar?',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop&q=80',
        alt: 'Fachada do prédio',
        width: 1200,
        height: 800,
        sortOrder: 0,
      },
      {
        src: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop&q=80',
        alt: 'Sala com varanda',
        width: 1200,
        height: 800,
        sortOrder: 1,
      },
      {
        src: 'https://images.unsplash.com/photo-1484154218962-a197022541e9?w=1200&h=800&fit=crop&q=80',
        alt: 'Cozinha americana',
        width: 1200,
        height: 800,
        sortOrder: 2,
      },
      {
        src: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&h=800&fit=crop&q=80',
        alt: 'Quarto principal',
        width: 1200,
        height: 800,
        sortOrder: 3,
      },
    ],
  },
  {
    slug: 'ponto-comercial-mercado-centro-corumba',
    title: 'Mercado completo em funcionamento no Centro',
    purpose: PropertyPurpose.venda,
    type: PropertyType.comercial,
    city: PropertyCity.corumba,
    citySlug: 'corumba',
    neighborhood: 'Centro',
    price: 750000,
    priceSuffix: null,
    priceNote: 'Inclui estoque e equipamentos',
    shortDescription:
      'Mercado de bairro em pleno funcionamento, com clientela formada e estrutura completa.',
    longDescription:
      'Oportunidade única: mercado de bairro no Centro de Corumbá, em funcionamento há mais de 15 anos, com clientela fiel e faturamento comprovado. Inclui imóvel próprio (terreno de 400m², área construída de 250m²), todos os equipamentos (freezers, gôndolas, balcões, caixa registradora), estoque inicial e ponto consolidado. Ideal para quem busca um negócio pronto para operar. Motivo da venda: aposentadoria do proprietário. Valor negociável para pagamento à vista.',
    bedrooms: null,
    bathrooms: 2,
    parkingSpaces: 3,
    totalArea: 400,
    builtArea: 250,
    coverImageUrl:
      'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&h=800&fit=crop&q=80',
    featured: true,
    specialOpportunity: true,
    tags: ['oportunidade', 'negócio pronto', 'ponto comercial', 'mercado'],
    status: PropertyStatus.disponivel,
    whatsappMessage:
      'Olá! Tenho interesse no mercado à venda no Centro de Corumbá (Ref: 5). Gostaria de mais informações.',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&h=800&fit=crop&q=80',
        alt: 'Fachada do mercado',
        width: 1200,
        height: 800,
        sortOrder: 0,
      },
      {
        src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop&q=80',
        alt: 'Interior - área de vendas',
        width: 1200,
        height: 800,
        sortOrder: 1,
      },
      {
        src: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=800&fit=crop&q=80',
        alt: 'Depósito',
        width: 1200,
        height: 800,
        sortOrder: 2,
      },
      {
        src: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1200&h=800&fit=crop&q=80',
        alt: 'Estacionamento',
        width: 1200,
        height: 800,
        sortOrder: 3,
      },
    ],
  },
  {
    slug: 'area-rural-10-hectares-zona-rural-corumba',
    title: 'Área rural de 10 hectares com acesso por estrada',
    purpose: PropertyPurpose.venda,
    type: PropertyType.rural,
    city: PropertyCity.corumba,
    citySlug: 'corumba',
    neighborhood: 'Zona Rural - Estrada do Tamengo',
    price: 280000,
    priceSuffix: null,
    priceNote: 'Estuda propostas',
    shortDescription:
      'Área rural de 10 hectares com pastagem formada e acesso por estrada cascalhada.',
    longDescription:
      'Propriedade rural de 10 hectares (100.000 m²) localizada na região da Estrada do Tamengo, com acesso por estrada cascalhada em boas condições. Área com pastagem formada, cerca de arame, água de poço artesiano e energia elétrica disponível na divisa. Terreno levemente ondulado, sem alagamento. Ideal para pecuária de pequeno porte, chácara ou investimento. Documentação com georreferenciamento. Proprietário estuda propostas.',
    bedrooms: null,
    bathrooms: null,
    parkingSpaces: null,
    totalArea: 100000,
    builtArea: null,
    coverImageUrl:
      'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=1200&h=800&fit=crop&q=80',
    featured: false,
    specialOpportunity: false,
    tags: ['rural', 'pecuária', 'investimento', 'poço artesiano'],
    status: PropertyStatus.disponivel,
    whatsappMessage:
      'Olá! Tenho interesse na área rural de 10 hectares na região do Tamengo (Ref: 6). Podemos conversar?',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=1200&h=800&fit=crop&q=80',
        alt: 'Vista geral da área',
        width: 1200,
        height: 800,
        sortOrder: 0,
      },
      {
        src: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=800&fit=crop&q=80',
        alt: 'Pastagem formada',
        width: 1200,
        height: 800,
        sortOrder: 1,
      },
    ],
  },
]

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  for (const property of properties) {
    const { images, ...propertyData } = property

    await prisma.property.upsert({
      where: { slug: property.slug },
      update: {},
      create: {
        ...propertyData,
        images: {
          create: images,
        },
      },
    })

    console.log(`✅ Imóvel "${property.title}" inserido/atualizado`)
  }

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
