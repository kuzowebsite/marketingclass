import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 mr-4 bg-muted rounded-md animate-pulse"></div>
          <div className="h-8 w-48 bg-muted rounded-md animate-pulse"></div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Ачааллаж байна...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
