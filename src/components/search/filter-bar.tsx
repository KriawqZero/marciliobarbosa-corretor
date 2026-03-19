'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

const purposeOptions = [
  { value: '', label: 'Todos' },
  { value: 'venda', label: 'Venda' },
  { value: 'aluguel', label: 'Aluguel' },
]

const typeOptions = [
  { value: '', label: 'Todos os tipos' },
  { value: 'casa', label: 'Casa' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'rural', label: 'Rural' },
]

const bedroomOptions = [
  { value: '', label: 'Quartos' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
]

const cityOptions = [
  { value: '', label: 'Todas as cidades' },
  { value: 'corumba', label: 'Corumbá' },
  { value: 'ladario', label: 'Ladário' },
]

export function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams],
  )

  const handleChange = (name: string, value: string) => {
    const qs = createQueryString(name, value)
    router.push(`${pathname}${qs ? `?${qs}` : ''}`)
  }

  const selectClasses =
    'rounded-lg border border-cinza-200 bg-white px-3 py-2 text-sm text-cinza-900 outline-none transition-colors focus:border-azul-medio'

  return (
    <div className="flex flex-wrap gap-3">
      <select
        className={selectClasses}
        value={searchParams.get('finalidade') || ''}
        onChange={(e) => handleChange('finalidade', e.target.value)}
      >
        {purposeOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        className={selectClasses}
        value={searchParams.get('tipo') || ''}
        onChange={(e) => handleChange('tipo', e.target.value)}
      >
        {typeOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        className={selectClasses}
        value={searchParams.get('quartos') || ''}
        onChange={(e) => handleChange('quartos', e.target.value)}
      >
        {bedroomOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        className={selectClasses}
        value={searchParams.get('cidade') || ''}
        onChange={(e) => handleChange('cidade', e.target.value)}
      >
        {cityOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
