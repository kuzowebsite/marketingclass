import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CourseLoading() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent">
        <div className="container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-3">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>

              <Skeleton className="h-12 w-3/4 mb-3" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-5/6" />

              {/* Course Meta */}
              <div className="flex flex-wrap items-center gap-6 mt-6">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-36" />
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3 mt-6">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>

              {/* Action Buttons - Mobile */}
              <div className="flex flex-wrap gap-3 mt-6 lg:hidden">
                <Skeleton className="h-10 flex-1 rounded-md" />
                <Skeleton className="h-10 w-10 rounded-md" />
                <Skeleton className="h-10 w-10 rounded-md" />
              </div>
            </div>

            {/* Course Card - Desktop */}
            <div className="hidden lg:block">
              <Card className="overflow-hidden border-0 shadow-lg">
                <Skeleton className="aspect-video w-full" />
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>

                  <div className="space-y-4 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-5 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-12 w-full rounded-md" />
                    <div className="flex gap-2">
                      <Skeleton className="h-10 flex-1 rounded-md" />
                      <Skeleton className="h-10 w-10 rounded-md" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Preview - Mobile */}
      <div className="lg:hidden container py-6">
        <Card className="overflow-hidden border-0 shadow-md">
          <Skeleton className="aspect-video w-full" />
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start mb-6 bg-transparent border-b rounded-none h-auto p-0">
            <TabsTrigger value="overview" className="rounded-none px-4 py-3 bg-transparent">
              Тойм
            </TabsTrigger>
            <TabsTrigger value="lessons" className="rounded-none px-4 py-3 bg-transparent">
              Хичээлүүд
            </TabsTrigger>
            <TabsTrigger value="instructor" className="rounded-none px-4 py-3 bg-transparent">
              Багш
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-none px-4 py-3 bg-transparent">
              Сэтгэгдлүүд
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Overview Tab Content */}
              <div className="space-y-8">
                {/* Course Stats */}
                <Card className="overflow-hidden border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* What You'll Learn */}
                <Card className="overflow-hidden border-0 shadow-md">
                  <CardHeader>
                    <Skeleton className="h-7 w-40" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                          <Skeleton className="h-5 w-full" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Requirements */}
                <Card className="overflow-hidden border-0 shadow-md">
                  <CardHeader>
                    <Skeleton className="h-7 w-40" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Skeleton className="h-2 w-2 rounded-full flex-shrink-0 mt-2" />
                          <Skeleton className="h-5 w-full" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Related Courses */}
            <div className="space-y-6">
              <Card className="overflow-hidden border-0 shadow-md">
                <CardHeader>
                  <Skeleton className="h-6 w-40 mb-1" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-16 w-24 rounded-md flex-shrink-0" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-full mb-2" />
                          <Skeleton className="h-3 w-24 mb-2" />
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-12 rounded-full" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent dark:from-primary/30 dark:via-primary/20 dark:to-transparent">
        <div className="container py-12">
          <div className="max-w-3xl mx-auto text-center">
            <Skeleton className="h-10 w-2/3 mx-auto mb-4" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-5/6 mx-auto" />
            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              <Skeleton className="h-12 w-40 rounded-md" />
              <Skeleton className="h-12 w-48 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
