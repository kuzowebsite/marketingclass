import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingCoursePage() {
  return (
    <div className="container py-12">
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-48" />
      </div>

      <div className="space-y-8">
        <Skeleton className="h-12 w-full max-w-md" />

        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
