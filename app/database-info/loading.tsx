import { Skeleton } from "@/components/ui/skeleton"
import { Database } from "lucide-react"

export default function Loading() {
  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Database className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-3xl font-bold">Өгөгдлийн сангийн мэдээлэл</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-[600px] w-full" />
    </div>
  )
}
