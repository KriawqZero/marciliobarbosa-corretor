/// Opções de busca compartilhadas entre o painel do hero e a barra de filtros da
/// listagem. Antes cada um mantinha a própria cópia das mesmas listas, e elas já
/// tinham divergido nos rótulos ("Comprar" x "Venda").

export interface SearchOption {
  value: string
  label: string
}

export const PURPOSE_OPTIONS: SearchOption[] = [
  { value: '', label: 'Comprar ou alugar' },
  { value: 'venda', label: 'Comprar' },
  { value: 'aluguel', label: 'Alugar' },
]

export const TYPE_OPTIONS: SearchOption[] = [
  { value: '', label: 'Todos os tipos' },
  { value: 'casa', label: 'Casa' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'rural', label: 'Rural' },
]

export const CITY_OPTIONS: SearchOption[] = [
  { value: '', label: 'Todas as cidades' },
  { value: 'corumba', label: 'Corumbá' },
  { value: 'ladario', label: 'Ladário' },
]

export const BEDROOM_OPTIONS: SearchOption[] = [
  { value: '', label: 'Quartos' },
  { value: '1', label: '1+ quarto' },
  { value: '2', label: '2+ quartos' },
  { value: '3', label: '3+ quartos' },
  { value: '4', label: '4+ quartos' },
]

export const SORT_OPTIONS: SearchOption[] = [
  { value: '', label: 'Mais recentes' },
  { value: 'preco_asc', label: 'Menor preço' },
  { value: 'preco_desc', label: 'Maior preço' },
]
