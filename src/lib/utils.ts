import { CATEGORIES, VALID_CATEGORIES } from './constants'

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function isValidCategory(slug: string): boolean {
  return VALID_CATEGORIES.includes(slug)
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

/// Parâmetros que estreitam ou reordenam a listagem. Cada combinação deles gera
/// uma URL diferente com um subconjunto do mesmo conteúdo — cinco filtros
/// combináveis já produzem centenas de páginas quase idênticas. Deixar isso
/// aberto ao rastreamento consome a cota do robô em páginas rasas em vez das
/// páginas de imóvel, e ainda faz as versões filtradas competirem com a
/// categoria pela mesma consulta.
const FILTER_PARAMS = ['finalidade', 'tipo', 'quartos', 'cidade', 'busca', 'ordem']

export function hasListingFilters(
  params: Record<string, string | string[] | undefined>,
): boolean {
  return FILTER_PARAMS.some((key) => {
    const value = params[key]
    if (value === undefined) return false
    return Array.isArray(value) ? value.length > 0 : value.length > 0
  })
}

/// Página atual da listagem, saneada. Valor inválido cai para 1 em vez de
/// produzir uma canônica com `?page=NaN`.
export function parsePageParam(
  value: string | string[] | undefined,
): number {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return 1
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed < 1) return 1
  return Math.floor(parsed)
}

/// Categorias vizinhas de uma categoria.
///
/// "Vizinha" é a que divide cidade ou tipo de imóvel com a atual — quem está
/// vendo terrenos à venda em Corumbá provavelmente também consideraria terrenos
/// em Ladário, ou casas em Corumbá. A ordem coloca primeiro a categoria de onde
/// esta nasceu e as irmãs dela, que são as mais próximas.
export function getRelatedCategorySlugs(slug: string, limit = 8): string[] {
  const current = CATEGORIES[slug]
  if (!current) return []

  const scored = Object.values(CATEGORIES)
    .filter((cat) => cat.slug !== slug)
    .map((cat) => {
      let score = 0
      if (current.parent && cat.slug === current.parent) score += 100
      if (current.parent && cat.parent === current.parent) score += 50
      if (cat.parent === slug) score += 40
      if (cat.filter.citySlug && cat.filter.citySlug === current.filter.citySlug)
        score += 10
      if (cat.filter.type && cat.filter.type === current.filter.type) score += 10
      if (cat.filter.purpose && cat.filter.purpose === current.filter.purpose)
        score += 3
      return { slug: cat.slug, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map((entry) => entry.slug)
}

/// Canônica de uma página de catálogo.
///
/// Só a paginação entra na URL canônica. Página 2 aponta para si mesma, e não
/// para a página 1: apontar tudo para a primeira página faz o buscador
/// descartar da indexação os imóveis que só aparecem no fim da lista.
export function buildListingCanonical(basePath: string, page: number): string {
  return page > 1 ? `${basePath}?page=${page}` : basePath
}
