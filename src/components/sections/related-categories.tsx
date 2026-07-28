import Link from 'next/link'
import { CATEGORIES } from '@/lib/constants'

interface RelatedCategoriesProps {
  /// Slug da categoria atual, para não linkar a página para ela mesma.
  current: string
  title?: string
  /// Slugs a exibir. Quem chama escolhe; aqui só filtramos o que não existe.
  slugs: string[]
}

/// Bloco de links entre páginas de catálogo.
///
/// Serve ao visitante que chegou pela busca numa página específica ("terrenos à
/// venda em Corumbá") e quer olhar o vizinho sem voltar ao menu.
///
/// E serve ao rastreamento: uma página só é encontrada e considerada relevante
/// se outras páginas do site apontarem para ela. As páginas de busca combinada
/// não estão no menu — sem um bloco assim, existiriam apenas no sitemap, que é
/// o sinal mais fraco que há.
export function RelatedCategories({
  current,
  title = 'Buscas relacionadas',
  slugs,
}: RelatedCategoriesProps) {
  const items = slugs
    .filter((slug) => slug !== current && CATEGORIES[slug])
    .map((slug) => CATEGORIES[slug])

  if (items.length === 0) return null

  return (
    <nav aria-labelledby="buscas-relacionadas" className="mt-12 border-t border-cinza-200 pt-8">
      <h2
        id="buscas-relacionadas"
        className="mb-4 text-sm font-semibold uppercase tracking-wider text-cinza-900"
      >
        {title}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((cat) => (
          <li key={cat.slug}>
            <Link
              href={`/imoveis/${cat.slug}`}
              className="inline-flex rounded-full border border-cinza-200 px-3.5 py-1.5 text-sm text-cinza-600 transition-colors hover:border-azul-medio hover:text-azul-escuro"
            >
              {cat.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
