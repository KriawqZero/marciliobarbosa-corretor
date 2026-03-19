import Link from 'next/link'
import { Container } from '@/components/layout/container'
import { SectionHeading } from '@/components/shared/section-heading'

const categories = [
  {
    slug: 'casas',
    label: 'Casas',
    description: 'Casas para todos os perfis',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    slug: 'apartamentos',
    label: 'Apartamentos',
    description: 'Conforto no centro urbano',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" />
        <path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" />
        <path d="M8 10h.01" /><path d="M8 14h.01" />
      </svg>
    ),
  },
  {
    slug: 'terrenos',
    label: 'Terrenos',
    description: 'Construa do seu jeito',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" /><path d="M9 21V9" />
      </svg>
    ),
  },
  {
    slug: 'comercial',
    label: 'Comercial',
    description: 'Pontos e salas comerciais',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
        <path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" />
      </svg>
    ),
  },
  {
    slug: 'aluguel',
    label: 'Aluguel',
    description: 'Imóveis para locação',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 18V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12" />
        <path d="M3 14h18" /><path d="M12 4v10" />
        <circle cx="12" cy="18" r="2" />
      </svg>
    ),
  },
  {
    slug: 'rural',
    label: 'Áreas Rurais',
    description: 'Chácaras, sítios e mais',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 22V2L7 7v15" />
        <path d="M17 13l5 4v5" />
        <path d="M2 22h20" />
        <path d="M7 8v1" /><path d="M7 12v1" /><path d="M7 16v1" />
      </svg>
    ),
  },
]

export function CategoryCards() {
  return (
    <section className="py-16 lg:py-24">
      <Container>
        <SectionHeading
          title="Busque por categoria"
          subtitle="Encontre o imóvel ideal para você"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/imoveis/${cat.slug}`}
              className="group flex flex-col items-center gap-2 rounded-xl border border-cinza-200 bg-white p-5 text-center shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-dourado hover:shadow-[var(--shadow-md)]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-azul-escuro/5 text-azul-escuro transition-colors group-hover:bg-azul-escuro group-hover:text-white">
                {cat.icon}
              </span>
              <span className="text-sm font-bold text-cinza-900">
                {cat.label}
              </span>
              <span className="text-xs leading-tight text-cinza-600">
                {cat.description}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
