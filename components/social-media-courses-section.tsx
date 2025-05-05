"use client"

import { useEffect, useState } from "react"
import { ref, get } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import type { Course } from "@/lib/types"
import Link from "next/link"
import SocialMediaCourseCard from "./social-media-course-card"
import { useCart } from "@/lib/cart/cart-provider"
import { useToast } from "@/components/ui/use-toast"

export function SocialMediaCoursesSection() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const { db } = useFirebase()
  const { addToCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    const fetchCourses = async () => {
      if (!db) return

      try {
        setLoading(true)
        const coursesRef = ref(db, "courses")
        const snapshot = await get(coursesRef)

        if (snapshot.exists()) {
          const coursesData = snapshot.val() as Record<string, Course>
          const coursesArray: Course[] = Object.values(coursesData)

          // Зөвхөн сошиал медиа хичээлүүдийг шүүх
          const socialMediaCourses = coursesArray.filter(
            (course) =>
              course.category &&
              (course.category.includes("YouTube") ||
                course.category.includes("Instagram") ||
                course.category.includes("Facebook") ||
                course.category.includes("TikTok") ||
                course.category.includes("LinkedIn") ||
                course.category.includes("Twitter") ||
                course.category.includes("Сошиал")),
          )

          setCourses(socialMediaCourses)
        }
      } catch (error) {
        console.error("Хичээлүүд татахад алдаа гарлаа:", error)
        toast({
          title: "Алдаа",
          description: "Хичээлүүд ачаалахад алдаа гарлаа",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [db, toast])

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
      <div className="text-center py-4">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Ачааллаж байна...</p>
      </div>
    )
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Сошиал медиа маркетинг</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Сошиал медиа маркетингийн чиглэлээр мэргэжлийн түвшинд суралцах боломж
            </p>
          </div>
          <Link href="/courses?category=social-media">
            <Button variant="ghost" className="mt-4 md:mt-0">
              Бүгдийг үзэх <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.length > 0 ? (
            courses
              .slice(0, 3)
              .map((course) => <SocialMediaCourseCard key={course.id} course={course} onAddToCart={handleAddToCart} />)
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Сошиал медиа чиглэлийн хичээлүүд олдсонгүй</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
