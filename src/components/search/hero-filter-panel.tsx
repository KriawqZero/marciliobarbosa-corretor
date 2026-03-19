'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const purposeOptions = [
  { value: '', label: 'Finalidade' },
  { value: 'venda', label: 'Comprar' },
  { value: 'aluguel', label: 'Alugar' },
]

const typeOptions = [
  { value: '', label: 'Tipo de imóvel' },
  { value: 'casa', label: 'Casa' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'rural', label: 'Rural' },
]

const bedroomOptions = [
  { value: '', label: 'Quartos' },
  { value: '1', label: '1+ quarto' },
  { value: '2', label: '2+ quartos' },
  { value: '3', label: '3+ quartos' },
  { value: '4', label: '4+ quartos' },
]

const cityOptions = [
  { value: '', label: 'Cidade' },
  { value: 'corumba', label: 'Corumbá' },
  { value: 'ladario', label: 'Ladário' },
]

export function HeroFilterPanel() {
  const router = useRouter()
  const [finalidade, setFinalidade] = useState('')
  const [tipo, setTipo] = useState('')
  const [quartos, setQuartos] = useState('')
  const [cidade, setCidade] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (finalidade) params.set('finalidade', finalidade)
    if (tipo) params.set('tipo', tipo)
    if (quartos) params.set('quartos', quartos)
    if (cidade) params.set('cidade', cidade)
    const qs = params.toString()
    router.push(`/imoveis${qs ? `?${qs}` : ''}`)
  }

  const selectClasses =
    'w-full rounded-lg border border-cinza-200 bg-white px-4 py-3 text-sm text-cinza-900 outline-none transition-all focus:border-azul-medio focus:ring-2 focus:ring-azul-medio/20 appearance-none cursor-pointer'

  return (
    <div className="rounded-xl bg-white/95 p-6 shadow-[var(--shadow-lg)] backdrop-blur-sm lg:p-8">
      <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-azul-medio">
        Encontre seu imóvel
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          className={selectClasses}
          value={finalidade}
          onChange={(e) => setFinalidade(e.target.value)}
        >
          {purposeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className={selectClasses}
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className={selectClasses}
          value={quartos}
          onChange={(e) => setQuartos(e.target.value)}
        >
          {bedroomOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className={selectClasses}
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
        >
          {cityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSearch}
        className="mt-4 w-full cursor-pointer rounded-lg bg-dourado px-6 py-3.5 text-base font-bold text-white transition-all hover:brightness-110 hover:shadow-[var(--shadow-gold)]"
      >
        <span className="flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          Ver imóveis
        </span>
      </button>
    </div>
  )
}
