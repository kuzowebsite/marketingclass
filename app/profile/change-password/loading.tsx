export default function ChangePasswordLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 mr-4 bg-muted rounded-md animate-pulse"></div>
          <div className="h-8 w-40 bg-muted rounded-md animate-pulse"></div>
        </div>

        <div className="border rounded-lg shadow-sm">
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="h-5 w-32 bg-muted rounded-md animate-pulse"></div>
              <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
            </div>

            <div className="space-y-2">
              <div className="h-5 w-32 bg-muted rounded-md animate-pulse"></div>
              <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
            </div>

            <div className="space-y-2">
              <div className="h-5 w-32 bg-muted rounded-md animate-pulse"></div>
              <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
            </div>
          </div>

          <div className="p-6 border-t flex justify-between">
            <div className="h-10 w-24 bg-muted rounded-md animate-pulse"></div>
            <div className="h-10 w-32 bg-muted rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
