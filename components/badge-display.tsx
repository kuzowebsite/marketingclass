import type React from "react"
import type { Badge as BadgeType } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, BookOpen, Star, Trophy, Zap, Medal } from "lucide-react"

interface BadgeDisplayProps {
  badge: BadgeType
  size?: "sm" | "md" | "lg"
}

const BadgeIcons: Record<string, React.ReactNode> = {
  "course-complete": <BookOpen className="h-full w-full" />,
  "first-course": <Star className="h-full w-full" />,
  "five-courses": <Trophy className="h-full w-full" />,
  "ten-courses": <Award className="h-full w-full" />,
  "perfect-quiz": <Zap className="h-full w-full" />,
  "referral-champion": <Medal className="h-full w-full" />,
}

export function BadgeDisplay({ badge, size = "md" }: BadgeDisplayProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  const iconSize = sizeClasses[size]
  const icon = BadgeIcons[badge.icon] || <Award className="h-full w-full" />

  return (
    <div className="flex flex-col items-center">
      <div className={`${iconSize} rounded-full bg-primary/10 text-primary p-2 flex items-center justify-center`}>
        {icon}
      </div>
      <div className="mt-2 text-center">
        <p className="font-medium text-sm">{badge.name}</p>
        {size !== "sm" && <p className="text-xs text-muted-foreground">{badge.description}</p>}
      </div>
    </div>
  )
}

export function BadgeGrid({ badges }: { badges: BadgeType[] }) {
  if (!badges || badges.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Одоогоор шагнал байхгүй байна</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {badges.map((badge) => (
        <Card key={badge.id} className="overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 text-primary p-3 flex items-center justify-center">
                {BadgeIcons[badge.icon] || <Award className="h-full w-full" />}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2 text-center">
            <CardTitle className="text-base">{badge.name}</CardTitle>
            <CardDescription className="text-xs mt-1">{badge.description}</CardDescription>
            <p className="text-xs text-muted-foreground mt-2">{new Date(badge.earnedAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
