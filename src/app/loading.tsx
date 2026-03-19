import { Container } from '@/components/layout/container'
import { Skeleton, PropertyGridSkeleton } from '@/components/shared/loading-skeleton'

export default function HomeLoading() {
  return (
    <>
      <Skeleton className="h-[400px] w-full rounded-none" />
      <Container className="py-16">
        <Skeleton className="mx-auto mb-8 h-8 w-64" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </Container>
      <div className="bg-cinza-50 py-16">
        <Container>
          <Skeleton className="mx-auto mb-8 h-8 w-48" />
          <PropertyGridSkeleton count={3} />
        </Container>
      </div>
    </>
  )
}
