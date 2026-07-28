'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  PURPOSE_OPTIONS,
  TYPE_OPTIONS,
  CITY_OPTIONS,
} from '@/components/search/search-options'

const selectClasses =
  'w-full cursor-pointer appearance-none rounded-lg border border-cinza-200 bg-white px-4 py-3 text-base text-cinza-900 outline-none transition-colors focus:border-azul-medio focus:ring-2 focus:ring-azul-medio/20'

export function HeroSearch() {
  const router = useRouter()
  const [finalidade, setFinalidade] = useState('')
  const [cidade, setCidade] = useState('')
  const [tipo, setTipo] = useState('')
  const [busca, setBusca] = useState('')

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (finalidade) params.set('finalidade', finalidade)
    if (cidade) params.set('cidade', cidade)
    if (tipo) params.set('tipo', tipo)
    const termo = busca.trim()
    if (termo) params.set('busca', termo)
    const qs = params.toString()
    router.push(`/imoveis${qs ? `?${qs}` : ''}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl bg-white p-5 shadow-[var(--shadow-lg)] sm:p-6"
      role="search"
      aria-label="Buscar imóveis"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="sr-only">Finalidade</span>
          <select
            className={selectClasses}
            value={finalidade}
            onChange={(e) => setFinalidade(e.target.value)}
          >
            {PURPOSE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Cidade</span>
          <select
            className={selectClasses}
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
          >
            {CITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="sr-only">Tipo de imóvel</span>
          <select
            className={selectClasses}
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-3 block">
        <span className="sr-only">Buscar por bairro ou título</span>
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por bairro, ex.: Dom Bosco"
          className="w-full rounded-lg border border-cinza-200 bg-white px-4 py-3 text-base text-cinza-900 outline-none transition-colors placeholder:text-cinza-600/60 focus:border-azul-medio focus:ring-2 focus:ring-azul-medio/20"
        />
      </label>

      <button
        type="submit"
        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-azul-escuro px-6 py-3.5 text-base font-bold text-white transition-colors hover:bg-azul-medio"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        Ver imóveis
      </button>
    </form>
  )
}
