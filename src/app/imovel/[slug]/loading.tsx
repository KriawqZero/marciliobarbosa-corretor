import { Container } from '@/components/layout/container'
import { Skeleton } from '@/components/shared/loading-skeleton'

export default function ImovelLoading() {
  return (
    <section className="py-8">
      <Container>
        <Skeleton className="mb-6 h-4 w-80" />
        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          <div>
            <Skeleton className="mb-2 h-6 w-20" />
            <Skeleton className="mb-1 h-8 w-3/4" />
            <Skeleton className="mb-4 h-4 w-48" />
            <Skeleton className="mb-6 h-10 w-40" />
            <Skeleton className="aspect-video w-full" />
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
            <Skeleton className="mt-8 h-48 w-full" />
          </div>
          <div className="hidden lg:block">
            <Skeleton className="h-64" />
          </div>
        </div>
      </Container>
    </section>
  )
}
