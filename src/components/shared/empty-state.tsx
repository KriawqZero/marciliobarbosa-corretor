import { WhatsAppButton } from './whatsapp-button'

interface EmptyStateProps {
  title?: string
  description?: string
}

export function EmptyState({
  title = 'Nenhum imóvel encontrado',
  description = 'Não encontramos imóveis com os filtros selecionados. Que tal falar diretamente conosco?',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mb-4 text-cinza-200"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      <h3 className="mb-2 text-lg font-semibold text-cinza-900">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-cinza-600">{description}</p>
      <WhatsAppButton size="sm" />
    </div>
  )
}
