import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { env } from 'process';

type AIGenerateContext = {
  type?: string;
  purpose?: string;
  city?: string;
  neighborhood?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parkingSpaces?: number | null;
  totalArea?: number | null;
  builtArea?: number | null;
  price?: number | null;
};

type AIGeneratePayload = {
  notes: string;
  context?: AIGenerateContext;
};

function isAuthorized(req: Request): boolean {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.slice('Bearer '.length);
  return token === env.API_PASSWORD;
}

const EXAMPLE_1_INPUT =
  'sobrado alto padrao no aeroporto, 4 quartos 2 suites, piscina 20 mil litros, area gourmet, acabamento excelente, aceita financiamento e veiculo';
const EXAMPLE_1_OUTPUT = {
  title: 'Sobrado de alto padrao com piscina a venda no bairro Aeroporto',
  shortDescription:
    'Sobrado de alto padrao com piscina, area gourmet e excelente acabamento no bairro Aeroporto.',
  longDescription:
    'Sobrado residencial de alto padrao a venda no bairro Aeroporto, em Corumba/MS. O imovel possui ampla metragem, ambientes confortaveis e excelente acabamento. Conta com 4 quartos, sendo 2 suites, banheiro social, sala aconchegante e cozinha moderna, alem de area gourmet com churrasqueira. A area externa inclui piscina com hidromassagem de aproximadamente 20 mil litros, quintal com bom aproveitamento e espaco para convivio em familia. E uma opcao ideal para quem busca conforto, qualidade e localizacao valorizada na cidade. Mais informacoes no nosso site e atendimento direto via WhatsApp.',
  tags: ['casa', 'sobrado', 'alto padrao', 'piscina', 'aeroporto', 'corumba', 'area gourmet'],
  priceNote: 'Aceita financiamento e veiculo como parte do pagamento',
};

const EXAMPLE_2_INPUT =
  'casa com piscina no bairro aeroporto, 3 quartos 1 suite, sala 2 ambientes, cozinha planejada, varanda gourmet, garagem para 3 carros, salao comercial amplo, aceita financiamento';
const EXAMPLE_2_OUTPUT = {
  title: 'Casa com piscina a venda no bairro Aeroporto',
  shortDescription: 'Casa ampla com piscina, salao comercial e espaco gourmet no bairro Aeroporto.',
  longDescription:
    'Excelente casa a venda no bairro Aeroporto, em Corumba/MS, com planta funcional e varios diferenciais. O imovel conta com 3 quartos, sendo 1 suite, banheiro social, sala ampla com dois ambientes e cozinha planejada com bom padrao de acabamento. Na area externa, possui varanda gourmet, piscina de grande capacidade, area de servico e garagem para mais de 3 carros. Um dos destaques e o salao comercial amplo, que permite uso para mercado, conveniencia ou outro negocio. Uma oportunidade completa para morar bem e ainda ter potencial comercial em regiao valorizada.',
  tags: ['casa', 'piscina', 'aeroporto', 'corumba', 'financiamento', 'varanda gourmet', 'salao comercial'],
  priceNote: 'Aceita financiamento bancario',
};

function safeJsonParse(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY nao configurada no servidor.' },
        { status: 500 }
      );
    }

    //console.log('req', await req.json());
    const body = (await req.json()) as AIGeneratePayload;
    const notes = body?.notes?.trim();
    if (!notes) {
      return NextResponse.json({ error: 'Campo `notes` obrigatorio.' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Voce e redator de anuncios imobiliarios para uma corretora local de Corumba-MS e Ladario-MS. ' +
            'Gere sempre JSON valido com as chaves: title, shortDescription, longDescription, tags, priceNote. ' +
            'Regras: title entre 8 e 16 palavras; shortDescription com 1 frase objetiva; longDescription entre 140 e 260 palavras; ' +
            'tags deve ser array com 5 a 10 tags em minusculas e sem hashtag; priceNote pode ser string ou null. ' +
            'Mantenha tom profissional, direto, comercial e local. Nao invente dados que nao estejam nas notas/contexto.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            notes: EXAMPLE_1_INPUT,
            context: {
              type: 'casa',
              purpose: 'venda',
              city: 'corumba',
              neighborhood: 'Aeroporto',
              bedrooms: 4,
              bathrooms: 3,
            },
            output: EXAMPLE_1_OUTPUT,
          }),
        },
        {
          role: 'user',
          content: JSON.stringify({
            notes: EXAMPLE_2_INPUT,
            context: {
              type: 'casa',
              purpose: 'venda',
              city: 'corumba',
              neighborhood: 'Aeroporto',
              bedrooms: 3,
              bathrooms: 2,
              parkingSpaces: 3,
            },
            output: EXAMPLE_2_OUTPUT,
          }),
        },
        {
          role: 'user',
          content: JSON.stringify({
            notes,
            context: body.context ?? null,
            instruction:
              'Agora gere o JSON final seguindo o mesmo estilo dos exemplos. Lembre de incluir "Mais informacoes no nosso site" apenas quando fizer sentido no fim da descricao longa.',
          }),
        },
      ],
    });
    
    const rawContent = response.choices[0]?.message?.content ?? '{}';
    const parsed = safeJsonParse(rawContent) as
      | {
          title?: string;
          shortDescription?: string;
          longDescription?: string;
          tags?: string[];
          priceNote?: string | null;
        }
      | null;

    if (!parsed) {
      return NextResponse.json(
        { error: 'Falha ao processar resposta da IA.' },
        { status: 502 }
      );
    }

    const title = typeof parsed.title === 'string' ? parsed.title.trim() : '';
    const shortDescription =
      typeof parsed.shortDescription === 'string' ? parsed.shortDescription.trim() : '';
    const longDescription =
      typeof parsed.longDescription === 'string' ? parsed.longDescription.trim() : '';
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags
          .filter((item) => typeof item === 'string')
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean)
      : [];
    const priceNote =
      parsed.priceNote === null || typeof parsed.priceNote === 'string'
        ? parsed.priceNote
        : null;

    if (!title || !shortDescription || !longDescription) {
      return NextResponse.json(
        { error: 'Resposta da IA incompleta. Tente novamente.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      title,
      shortDescription,
      longDescription,
      tags,
      priceNote,
    });
  } catch (error) {
    console.error('Erro ao gerar conteudo com IA.', error);
    return NextResponse.json(
      {
        error: 'Erro ao gerar conteudo com IA.',
        detail: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
