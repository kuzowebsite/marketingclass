import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GraduationCap } from "lucide-react"

interface InstructorProps {
  instructor: {
    id: string
    name: string
    title?: string
    bio?: string
    imageUrl?: string
    avatar?: string
  }
}

export function InstructorProfile({ instructor }: InstructorProps) {
  const avatarUrl = instructor.imageUrl || instructor.avatar || "/placeholder.svg"
  const instructorTitle = instructor.title || "Багш"
  const instructorBio = instructor.bio || "Багшийн мэдээлэл оруулаагүй байна."

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={instructor.name} />
              <AvatarFallback>
                <GraduationCap className="h-12 w-12 text-gray-400" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">{instructor.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{instructorTitle}</p>
            <p className="text-gray-700 dark:text-gray-300">{instructorBio}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
