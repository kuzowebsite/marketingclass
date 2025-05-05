"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ref, get, remove } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Search, MoreVertical, Edit, Trash, Eye } from "lucide-react"
import type { Course } from "@/lib/types"

export default function SocialMediaCoursesPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)

  const { user, db } = useFirebase()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !db) {
        setLoading(false)
        router.push("/auth/login")
        return
      }

      try {
        const userRef = ref(db, `users/${user.uid}`)
        const snapshot = await get(userRef)

        if (snapshot.exists()) {
          const userData = snapshot.val()
          if (userData.isAdmin) {
            setIsAdmin(true)
            fetchCourses()
          } else {
            toast({
              title: "Хандалт хаалттай",
              description: "Танд админ эрх байхгүй байна",
              variant: "destructive",
            })
            router.push("/")
          }
        } else {
          router.push("/")
        }
      } catch (error) {
        console.error("Админ эрх шалгахад алдаа гарлаа:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [db, router, toast, user])

  const fetchCourses = async () => {
    if (!db) return

    try {
      setLoading(true)
      const coursesRef = ref(db, "courses")
      const snapshot = await get(coursesRef)

      if (snapshot.exists()) {
        const coursesData = snapshot.val()
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
        setFilteredCourses(socialMediaCourses)
      }
    } catch (error) {
      console.error("Хичээлүүд татахад алдаа гарлаа:", error)
      toast({
        title: "Алдаа",
        description: "Хичээлүүд татахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)

    if (query.trim() === "") {
      setFilteredCourses(courses)
    } else {
      const filtered = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.category.toLowerCase().includes(query),
      )
      setFilteredCourses(filtered)
    }
  }

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!db || !courseToDelete) return

    try {
      const courseRef = ref(db, `courses/${courseToDelete.id}`)
      await remove(courseRef)

      toast({
        title: "Амжилттай",
        description: "Хичээл амжилттай устгагдлаа",
      })

      // Жагсаалтаас устгасан хичээлийг хасах
      setCourses(courses.filter((c) => c.id !== courseToDelete.id))
      setFilteredCourses(filteredCourses.filter((c) => c.id !== courseToDelete.id))
    } catch (error) {
      console.error("Хичээл устгахад алдаа гарлаа:", error)
      toast({
        title: "Алдаа",
        description: "Хичээл устгахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setCourseToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Ачааллаж байна...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="container py-12">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <CardTitle>Сошиал медиа хичээлүүд</CardTitle>
            <CardDescription>Сошиал медиа маркетингийн хичээлүүдийг удирдах</CardDescription>
          </div>
          <Button onClick={() => router.push("/admin/courses/new?type=social")}>
            <Plus className="mr-2 h-4 w-4" />
            Шинэ хичээл нэмэх
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input placeholder="Хичээл хайх..." className="pl-10" value={searchQuery} onChange={handleSearch} />
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Хичээл олдсонгүй</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Нэр</TableHead>
                    <TableHead>Ангилал</TableHead>
                    <TableHead>Үнэ</TableHead>
                    <TableHead>Хичээлүүд</TableHead>
                    <TableHead>Үүсгэсэн</TableHead>
                    <TableHead className="text-right">Үйлдэл</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>{course.category}</TableCell>
                      <TableCell>{course.price.toLocaleString()}₮</TableCell>
                      <TableCell>{course.lessons?.length || 0}</TableCell>
                      <TableCell>{new Date(course.createdAt).toLocaleDateString("mn-MN")}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/courses/${course.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Харах
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/courses/${course.id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Засах
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(course)}>
                              <Trash className="mr-2 h-4 w-4" />
                              Устгах
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Устгах диалог */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Хичээл устгах</DialogTitle>
            <DialogDescription>
              Та "{courseToDelete?.title}" хичээлийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Устгах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
