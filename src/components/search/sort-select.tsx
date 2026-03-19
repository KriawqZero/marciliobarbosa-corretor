'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const sortOptions = [
  { value: '', label: 'Mais recentes' },
  { value: 'preco_asc', label: 'Menor preço' },
  { value: 'preco_desc', label: 'Maior preço' },
]

export function SortSelect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('ordem', value)
    } else {
      params.delete('ordem')
    }
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`)
  }

  return (
    <select
      className="rounded-lg border border-cinza-200 bg-white px-3 py-2 text-sm text-cinza-900 outline-none transition-colors focus:border-azul-medio"
      value={searchParams.get('ordem') || ''}
      onChange={(e) => handleChange(e.target.value)}
    >
      {sortOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
