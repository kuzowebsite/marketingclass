"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { ref, get } from "firebase/database"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, Plus, Edit, Trash2, Clock, Users } from "lucide-react"
import type { Course } from "@/lib/types"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const { db } = useFirebase()
  const router = useRouter()

  useEffect(() => {
    const fetchCourses = async () => {
      if (!db) return

      try {
        const coursesRef = ref(db, "courses")
        const snapshot = await get(coursesRef)

        if (snapshot.exists()) {
          const coursesData = snapshot.val()
          const coursesArray = Object.keys(coursesData).map((key) => ({
            id: key,
            ...coursesData[key],
          }))
          setCourses(coursesArray)
          setFilteredCourses(coursesArray)
        }
      } catch (error) {
        console.error("Error fetching courses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [db])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCourses(courses)
    } else {
      const filtered = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredCourses(filtered)
    }
  }, [searchTerm, courses])

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Хичээлүүдийн мэдээлэл ачааллаж байна...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">Хичээлүүд</h1>
        <Button onClick={() => router.push("/admin/courses/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Шинэ хичээл нэмэх
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Хичээл хайх..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden flex flex-col">
              <div className="aspect-video relative overflow-hidden bg-gray-100">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground opacity-20" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="default" className={course.type === "organization" ? "bg-blue-600" : "bg-green-600"}>
                    {course.type === "organization" ? "Байгууллага" : "Хувь хүн"}
                  </Badge>
                </div>
              </div>

              <CardContent className="flex-grow p-6">
                <h3 className="font-medium text-lg mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{course.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">{course.category}</Badge>
                  {course.featured && <Badge variant="secondary">Онцлох</Badge>}
                  {course.level && (
                    <Badge variant="outline" className="capitalize">
                      {course.level === "beginner"
                        ? "Анхан шат"
                        : course.level === "intermediate"
                          ? "Дунд шат"
                          : "Гүнзгий"}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.totalDuration ? `${course.totalDuration} мин` : "Тодорхойгүй"}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.viewCount || 0} үзэлт
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => router.push(`/admin/courses/${course.id}`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Засах
                </Button>
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Устгах
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
            <h3 className="mt-4 text-lg font-medium">Хичээл олдсонгүй</h3>
            <p className="text-muted-foreground">Хайлтын үр дүнд тохирох хичээл олдсонгүй.</p>
          </div>
        )}
      </div>
    </div>
  )
}
