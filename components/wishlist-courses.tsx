"use client"

import { useEffect, useState } from "react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { ref, get, update } from "firebase/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, ShoppingCart, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/lib/cart/cart-provider"
import type { Course } from "@/lib/types"

export default function WishlistCourses() {
  const { user, db } = useFirebase()
  const [bookmarkedCourses, setBookmarkedCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchBookmarkedCourses = async () => {
      if (!user || !db) {
        setLoading(false)
        return
      }

      try {
        // Get user's bookmarked course IDs
        const userRef = ref(db, `users/${user.uid}`)
        const userSnapshot = await get(userRef)

        if (!userSnapshot.exists()) {
          setLoading(false)
          return
        }

        const userData = userSnapshot.val()
        const bookmarkedIds = userData.bookmarkedCourses || []

        if (!bookmarkedIds.length) {
          setBookmarkedCourses([])
          setLoading(false)
          return
        }

        // Fetch each course details
        const courses: Course[] = []

        for (const courseId of bookmarkedIds) {
          const courseRef = ref(db, `courses/${courseId}`)
          const courseSnapshot = await get(courseRef)

          if (courseSnapshot.exists()) {
            const courseData = courseSnapshot.val()
            courses.push({
              ...courseData,
              id: courseId,
            })
          }
        }

        setBookmarkedCourses(courses)
      } catch (error) {
        console.error("Error fetching bookmarked courses:", error)
        toast({
          title: "Алдаа",
          description: "Хүслийн жагсаалтыг ачаалахад алдаа гарлаа",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBookmarkedCourses()
  }, [user, db, toast])

  const removeFromWishlist = async (courseId: string) => {
    if (!user || !db) return

    try {
      // Get current bookmarked courses
      const userRef = ref(db, `users/${user.uid}`)
      const userSnapshot = await get(userRef)

      if (!userSnapshot.exists()) return

      const userData = userSnapshot.val()
      const bookmarkedIds = userData.bookmarkedCourses || []

      // Remove the course ID
      const updatedBookmarks = bookmarkedIds.filter((id: string) => id !== courseId)

      // Update in database
      await update(ref(db, `users/${user.uid}`), {
        bookmarkedCourses: updatedBookmarks,
      })

      // Update local state
      setBookmarkedCourses((prev) => prev.filter((course) => course.id !== courseId))

      toast({
        title: "Амжилттай",
        description: "Хичээл хүслийн жагсаалтаас хасагдлаа",
      })
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      toast({
        title: "Алдаа",
        description: "Хүслийн жагсаалтаас хасахад алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  const handleAddToCart = (course: Course) => {
    addToCart({
      id: course.id,
      title: course.title,
      price: course.price,
      type: course.type,
      category: course.category,
    })

    toast({
      title: "Амжилттай",
      description: "Хичээл сагсанд нэмэгдлээ",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-24 w-24 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Хүслийн жагсаалт</CardTitle>
        <CardDescription>Таны хадгалсан хичээлүүд</CardDescription>
      </CardHeader>
      <CardContent>
        {bookmarkedCourses.length > 0 ? (
          <div className="space-y-4">
            {bookmarkedCourses.map((course) => (
              <div key={course.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
                <div className="h-24 w-full sm:w-24 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-medium">{course.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {course.description?.substring(0, 100)}...
                  </p>
                  <div className="flex items-center mt-2">
                    <p className="font-medium">{course.price.toLocaleString()}₮</p>
                    {course.discount && (
                      <p className="text-sm text-gray-500 line-through ml-2">
                        {(course.price / (1 - course.discount / 100)).toLocaleString()}₮
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleAddToCart(course)}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Сагсанд нэмэх
                    </Button>

                    <Button variant="ghost" size="sm" onClick={() => removeFromWishlist(course.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Хасах
                    </Button>

                    <Link href={`/courses/${course.id}`}>
                      <Button variant="link" size="sm" className="text-blue-600 dark:text-blue-400">
                        Дэлгэрэнгүй
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Таны хүслийн жагсаалт хоосон байна.</p>
            <Link href="/courses">
              <Button>Хичээлүүд харах</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
