export default function BlogDetailLoading() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <div className="h-10 w-40 bg-muted rounded animate-pulse mb-6"></div>

        <div className="space-y-4 mb-8">
          <div className="h-10 bg-muted rounded animate-pulse w-3/4"></div>

          <div className="flex gap-4">
            <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
            <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
          </div>

          <div className="h-80 bg-muted rounded animate-pulse w-full"></div>

          <div className="flex gap-2">
            <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
            <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
            <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-6 bg-muted rounded animate-pulse w-full"></div>
          <div className="h-6 bg-muted rounded animate-pulse w-full"></div>
          <div className="h-6 bg-muted rounded animate-pulse w-5/6"></div>
          <div className="h-6 bg-muted rounded animate-pulse w-full"></div>
          <div className="h-6 bg-muted rounded animate-pulse w-4/5"></div>
          <div className="h-6 bg-muted rounded animate-pulse w-full"></div>
          <div className="h-6 bg-muted rounded animate-pulse w-3/4"></div>
        </div>
      </div>
    </div>
  )
}
