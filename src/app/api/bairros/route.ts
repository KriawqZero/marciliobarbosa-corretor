import { NextResponse } from 'next/server'
import { getUsedNeighborhoods } from '@/data/services/properties'

export const dynamic = 'force-dynamic'

/// Bairros já usados no acervo, para o cadastro virar escolha em vez de
/// digitação.
///
/// Digitar o bairro em todo imóvel é chato e, pior, produz variação: "Centro",
/// "centro", "Bairro Centro" viram três bairros diferentes para o site — o que
/// quebra o resumo das páginas de categoria e a busca por bairro.
///
/// A lista sai do próprio banco, e não de um cadastro fixo de bairros de
/// Corumbá e Ladário. Duas razões: nenhum nome inventado entra, e a lista
/// melhora sozinha conforme o acervo cresce.
///
/// Público e só de leitura: são nomes de bairro que já aparecem nas páginas.
/// `citySlug` é opcional; sem ele, retorna os bairros das duas cidades.
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const cidade = url.searchParams.get('cidade')?.trim()

    /// Só aceita as cidades que existem: qualquer outro valor viraria uma
    /// consulta que sempre volta vazia e o app leria como "não há bairros".
    if (cidade && cidade !== 'corumba' && cidade !== 'ladario') {
      return NextResponse.json(
        { error: 'Cidade inválida. Use `corumba` ou `ladario`.' },
        { status: 400 },
      )
    }

    const neighborhoods = await getUsedNeighborhoods(cidade || undefined)

    return NextResponse.json(
      { cidade: cidade || null, total: neighborhoods.length, neighborhoods },
      { headers: { 'X-Robots-Tag': 'noindex' } },
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Erro ao listar bairros.' },
      { status: 500 },
    )
  }
}
