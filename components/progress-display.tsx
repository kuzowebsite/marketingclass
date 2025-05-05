import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Course, User } from "@/lib/types"

interface CourseProgressProps {
  course: Course
  progress: Record<string, boolean> | undefined
}

export function CourseProgress({ course, progress }: CourseProgressProps) {
  const totalLessons = course.lessons.length
  const completedLessons = progress ? Object.values(progress).filter(Boolean).length : 0
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{course.title}</CardTitle>
        <CardDescription>
          {completedLessons} / {totalLessons} хичээл
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">{progressPercentage.toFixed(0)}% дууссан</p>
      </CardContent>
    </Card>
  )
}

interface OverallProgressProps {
  user: User
  courses: Course[]
}

export function OverallProgress({ user, courses }: OverallProgressProps) {
  const purchasedCourses = courses.filter((course) => user.purchasedCourses?.includes(course.id))

  const totalLessons = purchasedCourses.reduce((sum, course) => sum + course.lessons.length, 0)

  let completedLessons = 0

  if (user.progress) {
    for (const courseId in user.progress) {
      completedLessons += Object.values(user.progress[courseId]).filter(Boolean).length
    }
  }

  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Нийт ахиц дэвшил</CardTitle>
        <CardDescription>
          {completedLessons} / {totalLessons} хичээл
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={progressPercentage} className="h-3" />
        <div className="flex justify-between mt-2">
          <p className="text-sm">{progressPercentage.toFixed(0)}% дууссан</p>
          <p className="text-sm">{purchasedCourses.length} курс</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Add a simple progress display component for the course detail page
export function SimpleProgress({
  completed,
  total,
  percentage,
}: { completed: number; total: number; percentage: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Дууссан хичээл:</span>
        <span>
          {completed} / {total}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      <p className="text-xs text-right">{percentage.toFixed(0)}% дууссан</p>
    </div>
  )
}
