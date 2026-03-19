import { Container } from '@/components/layout/container'
import { Skeleton, PropertyGridSkeleton } from '@/components/shared/loading-skeleton'

export default function ImoveisLoading() {
  return (
    <section className="py-8 lg:py-12">
      <Container>
        <Skeleton className="mb-6 h-4 w-48" />
        <Skeleton className="mb-2 h-8 w-64" />
        <Skeleton className="mb-8 h-4 w-80" />
        <div className="mb-8 flex gap-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-40" />
        </div>
        <PropertyGridSkeleton />
      </Container>
    </section>
  )
}
