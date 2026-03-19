import Link from 'next/link'

type PaginationProps = {
  basePath: string
  searchParams: Record<string, string | string[] | undefined>
  page: number
  pages: number
  hasPrev: boolean
  hasNext: boolean
}

function buildHref(
  basePath: string,
  searchParams: Record<string, string | string[] | undefined>,
  page: number,
): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue
    const normalized = Array.isArray(value) ? value[value.length - 1] : value
    if (!normalized) continue
    params.set(key, normalized)
  }

  if (page <= 1) params.delete('page')
  else params.set('page', String(page))

  const qs = params.toString()
  return `${basePath}${qs ? `?${qs}` : ''}`
}

export function Pagination({
  basePath,
  searchParams,
  page,
  pages,
  hasPrev,
  hasNext,
}: PaginationProps) {
  if (pages <= 1) return null

  const windowSize = 2
  const start = Math.max(1, page - windowSize)
  const end = Math.min(pages, page + windowSize)

  const numbers: number[] = []
  for (let p = start; p <= end; p++) numbers.push(p)

  return (
    <nav aria-label="Paginação" className="mt-10 flex flex-col gap-4 sm:mt-12">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-cinza-600">
          Página <span className="font-semibold text-cinza-900">{page}</span> de{' '}
          <span className="font-semibold text-cinza-900">{pages}</span>
        </div>

        <div className="flex items-center gap-3">
          {hasPrev && (
            <Link
              href={buildHref(basePath, searchParams, page - 1)}
              className="rounded-lg border border-cinza-200 bg-white px-4 py-2 text-sm font-semibold text-cinza-900 transition-colors hover:border-azul-medio hover:text-azul-escuro"
            >
              Anterior
            </Link>
          )}
          {hasNext && (
            <Link
              href={buildHref(basePath, searchParams, page + 1)}
              className="rounded-lg border border-cinza-200 bg-white px-4 py-2 text-sm font-semibold text-cinza-900 transition-colors hover:border-azul-medio hover:text-azul-escuro"
            >
              Próxima
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {start > 1 && (
          <>
            <Link
              href={buildHref(basePath, searchParams, 1)}
              className="rounded-lg border border-cinza-200 bg-white px-3 py-2 text-sm font-semibold text-cinza-900 transition-colors hover:border-azul-medio hover:text-azul-escuro"
            >
              1
            </Link>
            <span className="px-1 text-cinza-600">…</span>
          </>
        )}

        {numbers.map((p) => (
          <Link
            key={p}
            href={buildHref(basePath, searchParams, p)}
            aria-current={p === page ? 'page' : undefined}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
              p === page
                ? 'border-azul-escuro bg-azul-escuro text-white'
                : 'border-cinza-200 bg-white text-cinza-900 hover:border-azul-medio hover:text-azul-escuro'
            }`}
          >
            {p}
          </Link>
        ))}

        {end < pages && (
          <>
            <span className="px-1 text-cinza-600">…</span>
            <Link
              href={buildHref(basePath, searchParams, pages)}
              className="rounded-lg border border-cinza-200 bg-white px-3 py-2 text-sm font-semibold text-cinza-900 transition-colors hover:border-azul-medio hover:text-azul-escuro"
            >
              {pages}
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

