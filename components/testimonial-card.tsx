import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

interface TestimonialCardProps {
  id: string
  name: string
  role: string
  content: string
  rating: number
  imageUrl?: string
  date?: string
}

export default function TestimonialCard({ name, role, content, rating, imageUrl, date }: TestimonialCardProps) {
  return (
    <Card className="h-full overflow-hidden border border-gray-200 dark:border-gray-800 transition-all hover:shadow-md">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center mb-4">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={imageUrl || "/placeholder.svg?height=40&width=40&query=person"} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium text-sm">{name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">{role}</p>
          </div>
        </div>

        <div className="flex mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
            />
          ))}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow">{content}</p>

        {date && <div className="mt-4 text-xs text-gray-400">{date}</div>}
      </CardContent>
    </Card>
  )
}
