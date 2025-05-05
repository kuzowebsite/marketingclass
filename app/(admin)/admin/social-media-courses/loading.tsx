export default function Loading() {
  return (
    <div className="container py-12">
      <div className="rounded-lg border shadow-sm p-6 mb-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
      </div>

      <div className="rounded-lg border shadow-sm p-6">
        <div className="h-6 w-full bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
