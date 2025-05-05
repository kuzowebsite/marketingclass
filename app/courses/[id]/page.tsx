"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ref, get, update } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Lock } from "@/components/ui/lock"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BadgeDisplay } from "@/components/badge-display"
import CourseDetailHeader from "@/components/course-detail-header"
import { InstructorProfile } from "@/components/instructor-profile"
import { CourseReview } from "@/components/course-review"
import { RelatedCourses } from "@/components/related-courses"
import { WishlistButton } from "@/components/wishlist-button"
import { Clock, BookOpen, Award, Users, Calendar, CheckCircle } from "lucide-react"
import type { Course, User as UserType } from "@/lib/types"

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPurchased, setIsPurchased] = useState(false)
  const [progress, setProgress] = useState<Record<string, boolean>>({})
  const [completedLessons, setCompletedLessons] = useState(0)
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([])

  const { db, user } = useFirebase()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      if (!db) return

      try {
        // Fetch course
        const courseRef = ref(db, `courses/${id}`)
        const courseSnapshot = await get(courseRef)

        if (!courseSnapshot.exists()) {
          toast({
            title: "Алдаа",
            description: "Хичээл олдсонгүй",
            variant: "destructive",
          })
          router.push("/courses")
          return
        }

        const courseData = courseSnapshot.val() as Course
        setCourse(courseData)

        // Update course view count
        if (courseData.viewCount !== undefined) {
          update(courseRef, {
            viewCount: courseData.viewCount + 1,
            lastViewedAt: Date.now(),
          })
        } else {
          update(courseRef, {
            viewCount: 1,
            lastViewedAt: Date.now(),
          })
        }

        // Check if user has purchased the course
        if (user) {
          const userRef = ref(db, `users/${user.uid}`)
          const userSnapshot = await get(userRef)

          if (userSnapshot.exists()) {
            const userData = userSnapshot.val() as UserType

            // Check if course is purchased
            if (userData.purchasedCourses && userData.purchasedCourses.includes(id)) {
              console.log("User has purchased this course")
              setIsPurchased(true)

              // Get progress
              if (userData.progress && userData.progress[id]) {
                setProgress(userData.progress[id])
                const completed = Object.values(userData.progress[id]).filter(Boolean).length
                setCompletedLessons(completed)
              }
            } else {
              console.log("User has NOT purchased this course")
              setIsPurchased(false)
            }
          }
        }

        // Fetch related courses
        if (courseData.category) {
          const coursesRef = ref(db, "courses")
          const coursesSnapshot = await get(coursesRef)

          if (coursesSnapshot.exists()) {
            const coursesData = coursesSnapshot.val()
            const relatedCoursesData = Object.values(coursesData)
              .filter((c: any) => c.id !== id && c.category === courseData.category && c.status === "published")
              .slice(0, 3) as Course[]

            setRelatedCourses(relatedCoursesData)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Алдаа",
          description: "Мэдээлэл ачаалахад алдаа гарлаа",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [db, id, router, toast, user])

  const handlePurchase = () => {
    if (!user) {
      toast({
        title: "Нэвтрэх шаардлагатай",
        description: "Хичээл худалдаж авахын тулд нэвтэрнэ үү",
      })
      router.push(`/auth/login?redirect=/courses/${id}`)
      return
    }

    router.push(`/payment/${id}`)
  }

  const calculateProgress = () => {
    if (!course || !course.lessons || course.lessons.length === 0) return 0
    return Math.round((completedLessons / course.lessons.length) * 100)
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

  if (!course) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl font-bold">Хичээл олдсонгүй</h1>
        <Button asChild className="mt-4">
          <a href="/courses">Хичээлүүд рүү буцах</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CourseDetailHeader course={course} />

          <Tabs defaultValue="overview" className="mt-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Тойм</TabsTrigger>
              <TabsTrigger value="curriculum">Хөтөлбөр</TabsTrigger>
              <TabsTrigger value="reviews">Сэтгэгдэл</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Хичээлийн тухай</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap">{course.description}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                      <Clock className="h-6 w-6 text-primary mb-2" />
                      <p className="text-sm font-medium">Үргэлжлэх хугацаа</p>
                      <p className="text-lg font-bold">{course.duration || "N/A"}</p>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                      <BookOpen className="h-6 w-6 text-primary mb-2" />
                      <p className="text-sm font-medium">Хичээлийн тоо</p>
                      <p className="text-lg font-bold">{course.lessons?.length || 0}</p>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                      <Award className="h-6 w-6 text-primary mb-2" />
                      <p className="text-sm font-medium">Түвшин</p>
                      <p className="text-lg font-bold">{course.level || "Бүх түвшин"}</p>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                      <Users className="h-6 w-6 text-primary mb-2" />
                      <p className="text-sm font-medium">Суралцагчид</p>
                      <p className="text-lg font-bold">{course.enrollmentCount || 0}</p>
                    </div>
                  </div>

                  {course.requirements && (
                    <div className="mt-8">
                      <h3 className="text-lg font-bold mb-2">Шаардлага</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {course.requirements.map((req, index) => (
                          <li key={index}>{typeof req === "object" && req.text ? req.text : req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {course.outcomes && (
                    <div className="mt-8">
                      <h3 className="text-lg font-bold mb-2">Юу сурах вэ?</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {course.outcomes.map((outcome, index) => (
                          <li key={index}>{typeof outcome === "object" && outcome.text ? outcome.text : outcome}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {course.targetAudience && (
                    <div className="mt-8">
                      <h3 className="text-lg font-bold mb-2">Хэнд зориулагдсан</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {course.targetAudience.map((audience, index) => (
                          <li key={index}>
                            {typeof audience === "object" && audience.text ? audience.text : audience}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {course.instructor && <InstructorProfile instructor={course.instructor} />}

              {course.badges && course.badges.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Авах боломжтой шагналууд</CardTitle>
                    <CardDescription>Энэ хичээлийг дуусгаснаар авах боломжтой шагналууд</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      {course.badges.map((badge) => (
                        <BadgeDisplay key={badge.id} badge={badge} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="curriculum" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Хичээлийн хөтөлбөр</CardTitle>
                  <CardDescription>
                    Нийт {course.lessons?.length || 0} хичээл · {course.duration || "N/A"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {course.lessons && course.lessons.length > 0 ? (
                      course.lessons
                        .sort((a, b) => a.order - b.order)
                        .map((lesson) => (
                          <div key={lesson.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {isPurchased ? (
                                  progress[lesson.id] ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                                  )
                                ) : (
                                  <Lock className="h-5 w-5" />
                                )}
                                <h3 className="font-medium">{lesson.title}</h3>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{lesson.duration || "N/A"}</Badge>
                                {isPurchased ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push(`/courses/${id}/lessons/${lesson.id}`)}
                                  >
                                    {progress[lesson.id] ? "Дахин үзэх" : "Үзэх"}
                                  </Button>
                                ) : (
                                  <Button variant="ghost" size="sm" disabled>
                                    Түгжээтэй
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{lesson.description}</p>
                          </div>
                        ))
                    ) : (
                      <p>Хичээлийн хөтөлбөр олдсонгүй</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <CourseReview courseId={id} rating={course.rating} reviewCount={course.reviewCount} />
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                <img
                  src={course.thumbnail || "/placeholder.svg?height=400&width=600&query=course"}
                  alt={course.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <CardTitle className="text-2xl">{course.price ? `${course.price}₮` : "Үнэгүй"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isPurchased ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Дууссан хичээл:</span>
                      <span>
                        {completedLessons} / {course.lessons?.length || 0}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${calculateProgress()}%` }}></div>
                    </div>
                    <p className="text-xs text-right">{calculateProgress()}% дууссан</p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/courses/${id}/lessons/${course.lessons?.[0]?.id}`)}
                  >
                    {completedLessons > 0 ? "Үргэлжлүүлэх" : "Эхлэх"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span>Хичээлийн тоо</span>
                    <span>{course.lessons?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Үргэлжлэх хугацаа</span>
                    <span>{course.duration || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Түвшин</span>
                    <span>{course.level || "Бүх түвшин"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Хүчинтэй хугацаа</span>
                    <span>{course.accessPeriod || "Хязгааргүй"}</span>
                  </div>
                  <Separator />
                  <Button className="w-full" onClick={handlePurchase}>
                    Худалдаж авах
                  </Button>
                  <WishlistButton courseId={id} />
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="w-full">
                <h3 className="font-medium mb-2">Хамрах сэдвүүд</h3>
                <div className="flex flex-wrap gap-2">
                  {course.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {typeof tag === "object" && tag.text ? tag.text : tag}
                    </Badge>
                  ))}
                </div>
              </div>
              {course.lastUpdated && (
                <div className="flex items-center text-sm text-muted-foreground w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Сүүлд шинэчилсэн: {new Date(course.lastUpdated).toLocaleDateString()}
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      {relatedCourses.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Төстэй хичээлүүд</h2>
          <RelatedCourses courses={relatedCourses} />
        </div>
      )}
    </div>
  )
}
