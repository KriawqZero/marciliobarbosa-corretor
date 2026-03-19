import Link from 'next/link'
import { Container } from '@/components/layout/container'
import { SectionHeading } from '@/components/shared/section-heading'
import { getPropertiesCount } from '@/data/services/properties'

export async function CitySection() {
  const corumbaCount = await getPropertiesCount({ citySlug: 'corumba' })
  const ladarioCount = await getPropertiesCount({ citySlug: 'ladario' })

  const cities = [
    {
      name: 'Corumbá',
      slug: 'corumba',
      count: corumbaCount,
      description: 'Portal do Pantanal, rica em cultura e história',
    },
    {
      name: 'Ladário',
      slug: 'ladario',
      count: ladarioCount,
      description: 'Cidade acolhedora às margens do Rio Paraguai',
    },
  ]

  return (
    <section className="bg-cinza-50 py-16 lg:py-24">
      <Container>
        <SectionHeading
          title="Cidades Atendidas"
          subtitle="Atuação em Corumbá e Ladário, no coração do Pantanal"
        />
        <div className="grid gap-6 sm:grid-cols-2">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/imoveis/${city.slug}`}
              className="group relative overflow-hidden rounded-xl bg-azul-escuro p-8 text-white shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-xl)] lg:p-10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-azul-escuro via-azul-escuro to-azul-medio" />
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-dourado/10 blur-2xl" />
              <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-azul-medio/30 blur-xl" />
              <div className="relative">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-dourado/80">
                  Mato Grosso do Sul
                </p>
                <h3 className="text-2xl font-bold lg:text-3xl">{city.name}</h3>
                <p className="mt-2 text-white/60">{city.description}</p>
                <p className="mt-5 text-xl font-bold text-dourado">
                  {city.count} {city.count === 1 ? 'imóvel disponível' : 'imóveis disponíveis'}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 transition-all group-hover:border-white/50 group-hover:bg-white/10 group-hover:text-white">
                  Ver imóveis
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
