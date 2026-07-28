'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import {
  PURPOSE_OPTIONS,
  TYPE_OPTIONS,
  CITY_OPTIONS,
  BEDROOM_OPTIONS,
} from '@/components/search/search-options'

const selectClasses =
  'rounded-lg border border-cinza-200 bg-white px-3 py-2 text-sm text-cinza-900 outline-none transition-colors focus:border-azul-medio'

const FILTER_KEYS = ['finalidade', 'tipo', 'quartos', 'cidade', 'busca'] as const
type FilterKey = (typeof FILTER_KEYS)[number]

function labelFor(key: FilterKey, value: string): string {
  switch (key) {
    case 'finalidade':
      return PURPOSE_OPTIONS.find((o) => o.value === value)?.label ?? value
    case 'tipo':
      return TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value
    case 'cidade':
      return CITY_OPTIONS.find((o) => o.value === value)?.label ?? value
    case 'quartos':
      return BEDROOM_OPTIONS.find((o) => o.value === value)?.label ?? value
    case 'busca':
      return `“${value}”`
  }
}

export function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const buscaAtual = searchParams.get('busca') ?? ''
  const [busca, setBusca] = useState(buscaAtual)

  // Ressincroniza quando a URL muda por fora do campo (voltar no navegador,
  // remover um chip, "limpar tudo").
  useEffect(() => {
    setBusca(buscaAtual)
  }, [buscaAtual])

  const pushWith = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      mutate(params)
      // Trocar filtros deve voltar para a primeira página.
      params.delete('page')
      const qs = params.toString()
      router.push(`${pathname}${qs ? `?${qs}` : ''}`)
    },
    [pathname, router, searchParams],
  )

  const handleChange = (name: string, value: string) =>
    pushWith((params) => {
      if (value) params.set(name, value)
      else params.delete(name)
    })

  const activeFilters = FILTER_KEYS.flatMap((key) => {
    const value = searchParams.get(key)
    return value ? [{ key, label: labelFor(key, value) }] : []
  })

  return (
    <div className="w-full space-y-3">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          handleChange('busca', busca.trim())
        }}
        className="flex gap-2"
      >
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por bairro ou título"
          aria-label="Buscar por bairro ou título"
          className="min-w-0 flex-1 rounded-lg border border-cinza-200 bg-white px-4 py-2 text-sm text-cinza-900 outline-none transition-colors placeholder:text-cinza-600/60 focus:border-azul-medio sm:max-w-xs"
        />
        <button
          type="submit"
          className="cursor-pointer rounded-lg bg-azul-escuro px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-azul-medio"
        >
          Buscar
        </button>
      </form>

      <div className="flex flex-wrap gap-3">
        <select
          className={selectClasses}
          aria-label="Finalidade"
          value={searchParams.get('finalidade') || ''}
          onChange={(e) => handleChange('finalidade', e.target.value)}
        >
          {PURPOSE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className={selectClasses}
          aria-label="Tipo de imóvel"
          value={searchParams.get('tipo') || ''}
          onChange={(e) => handleChange('tipo', e.target.value)}
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className={selectClasses}
          aria-label="Quartos"
          value={searchParams.get('quartos') || ''}
          onChange={(e) => handleChange('quartos', e.target.value)}
        >
          {BEDROOM_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className={selectClasses}
          aria-label="Cidade"
          value={searchParams.get('cidade') || ''}
          onChange={(e) => handleChange('cidade', e.target.value)}
        >
          {CITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => handleChange(filter.key, '')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-azul-escuro/20 bg-azul-escuro/5 px-3 py-1 text-xs font-medium text-azul-escuro transition-colors hover:border-azul-escuro/40"
            >
              {filter.label}
              <span aria-hidden="true">✕</span>
              <span className="sr-only">Remover filtro</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() =>
              pushWith((params) => FILTER_KEYS.forEach((k) => params.delete(k)))
            }
            className="cursor-pointer text-xs font-semibold text-cinza-600 underline-offset-4 hover:text-azul-escuro hover:underline"
          >
            Limpar tudo
          </button>
        </div>
      )}
    </div>
  )
}
