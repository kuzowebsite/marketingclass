import { Skeleton } from "@/components/ui/skeleton"

export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero Section Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-background pt-16 pb-20">
        <div className="container relative z-10">
          <div className="text-center max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-full max-w-md mx-auto mb-8" />

            <div className="mt-8 flex justify-center">
              <Skeleton className="h-10 w-full max-w-md" />
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="space-y-16">
          {/* Top 3 users skeleton */}
          <div>
            <Skeleton className="h-8 w-48 mb-8" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
              {[0, 1, 2].map((index) => (
                <div key={index} className="border-2 rounded-lg p-6">
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-12 w-12 rounded-full mb-4" />
                    <Skeleton className="h-24 w-24 rounded-full mb-4" />
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-24 mb-6" />

                    <div className="grid grid-cols-3 gap-2 w-full mb-4">
                      <Skeleton className="h-16 rounded-lg" />
                      <Skeleton className="h-16 rounded-lg" />
                      <Skeleton className="h-16 rounded-lg" />
                    </div>

                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-2 w-full mb-4" />

                    <div className="flex gap-1 flex-wrap justify-center">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rest of the leaderboard skeleton */}
          <div>
            <Skeleton className="h-8 w-48 mb-8" />

            <div className="border rounded-lg overflow-hidden">
              <div className="p-6 bg-muted/50">
                <Skeleton className="h-6 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>

              <div className="divide-y divide-border">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-6 w-16 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Call to action skeleton */}
          <div className="rounded-2xl p-8 bg-gradient-to-r from-primary/20 to-primary/5">
            <div className="text-center">
              <Skeleton className="h-8 w-96 mx-auto mb-4" />
              <Skeleton className="h-4 w-full max-w-2xl mx-auto mb-6" />
              <Skeleton className="h-12 w-48 mx-auto rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
