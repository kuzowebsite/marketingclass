"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { useEffect, useState } from "react"
import { ref, get } from "firebase/database"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Edit,
  LogOut,
  Award,
  BookOpen,
  Calendar,
  ShoppingBag,
  Bookmark,
  Lock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
  UserIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import WishlistCourses from "@/components/wishlist-courses"
import PaymentHistory from "@/components/payment-history"
import type { Course } from "@/lib/types"

export default function ProfilePage() {
  const { user, db, signOut } = useFirebase()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [purchasedCourses, setPurchasedCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !db) {
        setLoading(false)
        return
      }

      try {
        // Use ref and get for Realtime Database instead of doc and getDoc
        const userRef = ref(db, `users/${user.uid}`)
        const userSnapshot = await get(userRef)

        if (userSnapshot.exists()) {
          setUserData(userSnapshot.val())
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user, db])

  useEffect(() => {
    const fetchPurchasedCourses = async () => {
      if (!db || !userData || !userData.purchasedCourses || userData.purchasedCourses.length === 0) {
        return
      }

      try {
        setCoursesLoading(true)
        const courses: Course[] = []

        // Fetch each course by ID
        for (const courseId of userData.purchasedCourses) {
          const courseRef = ref(db, `courses/${courseId}`)
          const courseSnapshot = await get(courseRef)

          if (courseSnapshot.exists()) {
            const courseData = courseSnapshot.val()
            courses.push({
              ...courseData,
              id: courseId,
              progress: userData.progress?.[courseId]
                ? (Object.values(userData.progress[courseId]).filter(Boolean).length / courseData.lessons.length) * 100
                : 0,
            })
          }
        }

        setPurchasedCourses(courses)
      } catch (error) {
        console.error("Error fetching purchased courses:", error)
      } finally {
        setCoursesLoading(false)
      }
    }

    fetchPurchasedCourses()
  }, [db, userData])

  // Helper function to check if user has any social media links
  const hasSocialMedia = () => {
    if (!userData || !userData.socialMedia) return false

    const { facebook, twitter, instagram, linkedin, youtube, website } = userData.socialMedia
    return facebook || twitter || instagram || linkedin || youtube || website
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // If not client-side yet, show loading state
  if (!isClient) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="w-full md:w-2/3">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <UserIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Нэвтрээгүй байна</h1>
        <p className="mb-8">Профайл хуудсыг харахын тулд нэвтэрнэ үү.</p>
        <Link href="/auth/login?callbackUrl=/profile">
          <Button size="lg">Нэвтрэх</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={userData?.profileImageBase64 || userData?.photoURL || user?.photoURL || undefined}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-800">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{user.displayName || "Хэрэглэгч"}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Гишүүнчлэл</p>
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200">
                    {userData?.subscription || "Үндсэн"}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Бүртгүүлсэн огноо</p>
                  <p className="text-sm">
                    {userData?.createdAt
                      ? new Date(userData.createdAt).toLocaleDateString()
                      : new Date(user.metadata.creationTime || Date.now()).toLocaleDateString()}
                  </p>
                </div>

                {userData?.bio && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Тайлбар</p>
                    <p className="text-sm">{userData.bio}</p>
                  </div>
                )}

                {hasSocialMedia() && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Нийгмийн сүлжээ</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {userData.socialMedia?.facebook && (
                        <a
                          href={userData.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        >
                          <Facebook className="h-4 w-4" />
                          <span className="sr-only">Facebook</span>
                        </a>
                      )}
                      {userData.socialMedia?.twitter && (
                        <a
                          href={userData.socialMedia.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-400 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        >
                          <Twitter className="h-4 w-4" />
                          <span className="sr-only">Twitter</span>
                        </a>
                      )}
                      {userData.socialMedia?.instagram && (
                        <a
                          href={userData.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors"
                        >
                          <Instagram className="h-4 w-4" />
                          <span className="sr-only">Instagram</span>
                        </a>
                      )}
                      {userData.socialMedia?.linkedin && (
                        <a
                          href={userData.socialMedia.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-500 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        >
                          <Linkedin className="h-4 w-4" />
                          <span className="sr-only">LinkedIn</span>
                        </a>
                      )}
                      {userData.socialMedia?.youtube && (
                        <a
                          href={userData.socialMedia.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                        >
                          <Youtube className="h-4 w-4" />
                          <span className="sr-only">YouTube</span>
                        </a>
                      )}
                      {userData.socialMedia?.website && (
                        <a
                          href={userData.socialMedia.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Globe className="h-4 w-4" />
                          <span className="sr-only">Website</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex flex-col gap-2">
                  <Link href="/profile/edit">
                    <Button variant="outline" className="w-full justify-start">
                      <Edit className="mr-2 h-4 w-4" />
                      Профайл засах
                    </Button>
                  </Link>
                  <Link href="/profile/change-password">
                    <Button variant="outline" className="w-full justify-start">
                      <Lock className="mr-2 h-4 w-4" />
                      Нууц үг солих
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start text-red-500" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Гарах
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-2/3">
          <Tabs defaultValue="courses">
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="courses" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Хичээлүүд</span>
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-1">
                <Bookmark className="h-4 w-4" />
                <span className="hidden sm:inline">Хүсэл</span>
              </TabsTrigger>
              <TabsTrigger value="badges" className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline">Медалиуд</span>
              </TabsTrigger>
              <TabsTrigger value="reminders" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Сануулгууд</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-1">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Захиалгууд</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <CardTitle>Миний хичээлүүд</CardTitle>
                  <CardDescription>Таны худалдаж авсан болон бүртгүүлсэн хичээлүүд</CardDescription>
                </CardHeader>
                <CardContent>
                  {coursesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <Skeleton className="h-16 w-16 rounded" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-3 w-20" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : purchasedCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {purchasedCourses.map((course) => (
                        <Card key={course.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="h-16 w-16 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
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
                              <div>
                                <h3 className="font-medium">{course.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {course.progress ? `${Math.round(course.progress)}% гүйцэтгэсэн` : "Эхлээгүй"}
                                </p>
                                <Link href={`/courses/${course.id}`}>
                                  <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400">
                                    Үргэлжлүүлэх
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">Танд одоогоор хичээл байхгүй байна.</p>
                      <Link href="/courses">
                        <Button>Хичээлүүд харах</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wishlist">
              <WishlistCourses />
            </TabsContent>

            <TabsContent value="badges">
              <Card>
                <CardHeader>
                  <CardTitle>Миний медалиуд</CardTitle>
                  <CardDescription>Таны хүлээн авсан медалиуд ба гэрчилгээнүүд</CardDescription>
                </CardHeader>
                <CardContent>
                  {userData?.badges && Object.values(userData.badges).length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {Object.values(userData.badges).map((badge: any, index: number) => (
                        <div key={index} className="flex flex-col items-center p-4 border rounded-lg">
                          <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
                            <Award className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="font-medium text-center">{badge.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{badge.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">Танд одоогоор медаль байхгүй байна.</p>
                      <p className="text-sm text-gray-400">Хичээлүүдийг дуусгаж медаль цуглуулаарай.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reminders">
              <Card>
                <CardHeader>
                  <CardTitle>Миний сануулгууд</CardTitle>
                  <CardDescription>Таны үүсгэсэн сануулгууд</CardDescription>
                </CardHeader>
                <CardContent>
                  {userData?.reminders && userData.reminders.length > 0 ? (
                    <div className="space-y-4">
                      {userData.reminders.map((reminder: any, index: number) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{reminder.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{reminder.description}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(reminder.date).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant={reminder.completed ? "outline" : "default"}>
                                {reminder.completed ? "Дууссан" : "Идэвхтэй"}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">Танд одоогоор сануулга байхгүй байна.</p>
                      <Link href="/reminders/new">
                        <Button>Сануулга үүсгэх</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Миний захиалгууд</CardTitle>
                  <CardDescription>Таны хийсэн худалдан авалтууд</CardDescription>
                </CardHeader>
                <CardContent>
                  <PaymentHistory limit={5} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
