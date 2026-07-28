import { formatPrice } from '@/lib/format'
import type { CategoryFacets } from '@/data/services/properties'

interface CategoryIntroProps {
  paragraphs?: string[]
  facets: CategoryFacets
  /// Onde ficam os imóveis desta categoria, já escrito para caber na frase.
  /// Ex.: "em Corumbá-MS". O que a página lista já está no H1 logo acima, então
  /// repetir aqui produzia frase dobrada ("imóveis em imóveis em Corumbá").
  location: string
}

/// Lista os bairros de forma legível: "Centro, Popular e Nova Corumbá".
function listNeighborhoods(names: string[]): string {
  if (names.length === 1) return names[0]
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`
}

/// Abertura da página de categoria.
///
/// Duas partes com funções diferentes. Os parágrafos fixos explicam o que a
/// página é e como funciona o atendimento — é o texto que dá à página algo para
/// ranquear além de uma grade de fotos. O resumo é gerado do acervo real, então
/// muda a cada imóvel cadastrado: é ele que impede que páginas parecidas
/// ("casas em Corumbá" e "casas à venda em Corumbá") fiquem com texto idêntico,
/// e responde de cara a pergunta de quem chegou pela busca — quantos tem, de
/// quanto a quanto, e em que bairros.
export function CategoryIntro({
  paragraphs,
  facets,
  location,
}: CategoryIntroProps) {
  const hasSummary = facets.total > 0 && facets.minPrice !== null

  /// Quando todos custam o mesmo (ou só existe um), "de R$ X a R$ X" soa
  /// quebrado. Aí a frase é escrita no singular.
  const priceSentence =
    facets.minPrice !== null && facets.maxPrice !== null
      ? facets.minPrice === facets.maxPrice
        ? `por ${formatPrice(facets.minPrice)}`
        : `de ${formatPrice(facets.minPrice)} a ${formatPrice(facets.maxPrice)}`
      : null

  /// Acima de seis bairros a frase vira uma lista cansativa e para de
  /// informar. Corta e diz quantos ficaram de fora.
  const shown = facets.neighborhoods.slice(0, 6)
  const rest = facets.neighborhoods.length - shown.length

  if (!paragraphs?.length && !hasSummary) return null

  return (
    <div className="mb-8 max-w-3xl space-y-3 text-cinza-600">
      {hasSummary && (
        <p className="text-cinza-900">
          <span className="font-semibold">
            {facets.total} {facets.total === 1 ? 'imóvel' : 'imóveis'}
          </span>{' '}
          {facets.total === 1 ? 'disponível' : 'disponíveis'} {location}
          {priceSentence ? `, ${priceSentence}` : ''}
          {shown.length > 0 && (
            <>
              {', '}
              {shown.length === 1 ? 'no bairro ' : 'nos bairros '}
              {listNeighborhoods(shown)}
              {rest > 0 && ` e mais ${rest}`}
            </>
          )}
          .
        </p>
      )}

      {paragraphs?.map((text, i) => (
        <p key={i} className="leading-relaxed">
          {text}
        </p>
      ))}
    </div>
  )
}
