"use client"

import { useEffect, useState } from "react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { ref, get, query, orderByChild, equalTo, limitToFirst } from "firebase/database"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Clock, Users } from "lucide-react"
import { useRouter } from "next/navigation"

interface FeaturedCoursesProps {
  limit?: number
  currentCourseId?: string
}

interface Course {
  id: string
  title: string
  description: string
  price: number
  category: string
  imageUrl?: string
  thumbnail?: string
  rating?: number
  reviewCount?: number
  students?: number
  duration?: string
  isFeatured?: boolean
}

export function FeaturedCourses({ limit = 3, currentCourseId }: FeaturedCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const { db } = useFirebase()
  const router = useRouter()

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      if (!db) return

      try {
        setLoading(true)
        // Query for featured courses
        const coursesQuery = query(
          ref(db, "courses"),
          orderByChild("isFeatured"),
          equalTo(true),
          limitToFirst(limit + 5), // Get more to filter current course if needed
        )

        const snapshot = await get(coursesQuery)

        if (snapshot.exists()) {
          const coursesData = snapshot.val()
          const coursesArray = Object.entries(coursesData)
            .map(([id, data]) => ({
              id,
              ...(data as any),
            }))
            .filter((course) => !currentCourseId || course.id !== currentCourseId)
            .slice(0, limit)

          setCourses(coursesArray)
        }
      } catch (error) {
        console.error("Error fetching featured courses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedCourses()
  }, [db, limit, currentCourseId])

  const handleCourseClick = (courseId: string) => {
    router.push(`/courses/${courseId}`)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(limit)].map((_, i) => (
          <Card key={i} className="overflow-hidden border-0 shadow-md">
            <div className="animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <Card className="overflow-hidden border-0 shadow-md">
        <CardContent className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">Онцлох хичээлүүд олдсонгүй.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Card
          key={course.id}
          className="overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-lg cursor-pointer"
          onClick={() => handleCourseClick(course.id)}
        >
          <div className="aspect-video relative">
            <img
              src={
                course.imageUrl ||
                course.thumbnail ||
                `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(course.title) || "/placeholder.svg"}`
              }
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3">
              <Badge className="bg-primary">{course.category}</Badge>
            </div>
            <Badge className="absolute top-3 left-3 bg-amber-500">Онцлох</Badge>
          </div>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2 line-clamp-2">{course.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span>
                  {(course.rating || 0).toFixed(1)} ({course.reviewCount || 0})
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-500 mr-1" />
                <span>{course.duration || "Тодорхойгүй"}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-gray-500 mr-1" />
                <span>{course.students || 0}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
            <div className="font-bold text-lg">₮{course.price.toLocaleString()}</div>
            <Button variant="ghost" size="sm">
              Дэлгэрэнгүй
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
