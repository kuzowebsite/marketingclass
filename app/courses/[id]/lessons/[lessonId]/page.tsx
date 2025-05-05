"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ref, get, update, set } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import type { Course, Lesson, Content, User as UserType, Badge as BadgeType } from "@/lib/types"
import { ChevronLeft, ChevronRight, CheckCircle, MessageSquare, Calendar, Award, StickyNote } from "lucide-react"
import { isDocument } from "@/lib/firebase/base64-utils"
import { ChatSystem } from "@/components/chat-system"
import { ReminderForm } from "@/components/reminder-form"
import { QuizSystem } from "@/components/quiz-system"
import { NoteList } from "@/components/note-list"

export default function LessonPage() {
  const { id, lessonId } = useParams<{ id: string; lessonId: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPurchased, setIsPurchased] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [nextLessonId, setNextLessonId] = useState<string | null>(null)
  const [prevLessonId, setPrevLessonId] = useState<string | null>(null)
  const [quizResult, setQuizResult] = useState<any>(null)
  const [activeContentId, setActiveContentId] = useState<string | null>(null)

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

        // Find current lesson
        const currentLesson = courseData.lessons.find((l) => l.id === lessonId)
        if (!currentLesson) {
          toast({
            title: "Алдаа",
            description: "Хичээлийн хэсэг олдсонгүй",
            variant: "destructive",
          })
          router.push(`/courses/${id}`)
          return
        }
        setLesson(currentLesson)

        // Set active content ID to the first content
        if (currentLesson.contents && currentLesson.contents.length > 0) {
          setActiveContentId(currentLesson.contents[0].id)
        }

        // Find next and previous lessons
        const sortedLessons = [...courseData.lessons].sort((a, b) => a.order - b.order)
        const currentIndex = sortedLessons.findIndex((l) => l.id === lessonId)

        if (currentIndex > 0) {
          setPrevLessonId(sortedLessons[currentIndex - 1].id)
        } else {
          setPrevLessonId(null)
        }

        if (currentIndex < sortedLessons.length - 1) {
          setNextLessonId(sortedLessons[currentIndex + 1].id)
        } else {
          setNextLessonId(null)
        }

        // Check if user has purchased the course
        if (user) {
          const userRef = ref(db, `users/${user.uid}`)
          const userSnapshot = await get(userRef)

          if (userSnapshot.exists()) {
            const userData = userSnapshot.val() as UserType

            // Check if course is purchased
            if (userData.purchasedCourses && userData.purchasedCourses.includes(id)) {
              setIsPurchased(true)

              // Check if lesson is completed
              if (userData.progress && userData.progress[id] && userData.progress[id][lessonId]) {
                setIsCompleted(true)
              }

              // Get quiz result if exists
              if (userData.quizResults && userData.quizResults[id] && userData.quizResults[id][lessonId]) {
                setQuizResult(userData.quizResults[id][lessonId])
              }
            } else {
              console.log("User has not purchased this course")
              setIsPurchased(false)
            }
          }
        }

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
  }, [db, id, lessonId, router, toast, user])

  const markAsCompleted = async () => {
    if (!db || !user || !course || !lesson) return

    try {
      // Update user progress
      const userProgressRef = ref(db, `users/${user.uid}/progress/${id}/${lessonId}`)
      await set(userProgressRef, true)

      setIsCompleted(true)

      // Check if all lessons are completed
      const userRef = ref(db, `users/${user.uid}`)
      const userSnapshot = await get(userRef)

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val() as UserType
        const progress = userData.progress?.[id] || {}

        // Count completed lessons
        const completedLessons = Object.values(progress).filter(Boolean).length
        const totalLessons = course.lessons.length

        // If all lessons are completed, award badge
        if (completedLessons === totalLessons) {
          // Award course completion badge
          const userBadgesRef = ref(db, `users/${user.uid}/badges`)

          const courseCompleteBadge: BadgeType = {
            id: `course-complete-${id}`,
            name: "Курс дууссан",
            description: `${course.title} курсыг амжилттай дуусгасан`,
            icon: "course-complete",
            earnedAt: Date.now(),
          }

          await update(userBadgesRef, {
            [`course-complete-${id}`]: courseCompleteBadge,
          })

          // Check if this is the first completed course
          if (!userData.badges || !Object.values(userData.badges).some((b) => b.icon === "first-course")) {
            const firstCourseBadge: BadgeType = {
              id: `first-course-${Date.now()}`,
              name: "Анхны курс",
              description: "Анхны курсаа амжилттай дуусгасан",
              icon: "first-course",
              earnedAt: Date.now(),
            }

            await update(userBadgesRef, {
              [`first-course-${Date.now()}`]: firstCourseBadge,
            })
          }

          // Check for 5 courses completed
          // Assuming 'courses' is available in the global scope or imported elsewhere
          const completedCourses =
            userData.purchasedCourses?.filter((courseId) => {
              const courseProgress = userData.progress?.[courseId] || {}
              // Assuming 'courses' is an array of course objects
              const courseObj = (window as any).courses?.find((c) => c.id === courseId)
              return courseObj && Object.keys(courseProgress).length === courseObj.lessons.length
            }) || []

          if (
            completedCourses.length === 5 &&
            (!userData.badges || !Object.values(userData.badges).some((b) => b.icon === "five-courses"))
          ) {
            const fiveCoursesBadge: BadgeType = {
              id: `five-courses-${Date.now()}`,
              name: "5 курс",
              description: "5 курс амжилттай дуусгасан",
              icon: "five-courses",
              earnedAt: Date.now(),
            }

            await update(userBadgesRef, {
              [`five-courses-${Date.now()}`]: fiveCoursesBadge,
            })
          }

          // Update user points
          const currentPoints = userData.points || 0
          await update(userRef, {
            points: currentPoints + 100, // 100 points for completing a course
          })

          toast({
            title: "Амжилттай",
            description: "Та курсыг бүрэн дуусгаж, шагнал авлаа!",
          })
        } else {
          toast({
            title: "Амжилттай",
            description: "Хичээл амжилттай дууслаа",
          })
        }
      }

      // If there's a next lesson, navigate to it
      if (nextLessonId) {
        router.push(`/courses/${id}/lessons/${nextLessonId}`)
      }
    } catch (error) {
      console.error("Error updating progress:", error)
      toast({
        title: "Алдаа",
        description: "Хичээлийн төлөв шинэчлэхэд алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  const renderContent = (content: Content) => {
    switch (content.type) {
      case "text":
        return (
          <div className="prose max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap">{content.data}</p>
          </div>
        )
      case "image":
        return (
          <div className="my-4">
            <img src={content.data || "/placeholder.svg"} alt={content.title} className="max-w-full rounded-md" />
          </div>
        )
      case "video":
        return (
          <div className="my-4">
            <video src={content.data} controls className="max-w-full rounded-md" title={content.title}>
              Your browser does not support the video tag.
            </video>
          </div>
        )
      case "file":
        return (
          <div className="my-4 p-4 border rounded-md">
            <h3 className="font-medium mb-2">{content.title}</h3>
            {isDocument(content.data) ? (
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm text-muted-foreground">Файлыг үзэх боломжтой, гэхдээ татах боломжгүй.</p>
                <iframe src={content.data} className="w-full h-[500px] mt-2 border rounded-md" title={content.title} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Файлын төрөл дэмжигдэхгүй байна.</p>
            )}
          </div>
        )
      default:
        return <p>Контент олдсонгүй</p>
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

  if (!isPurchased) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl font-bold">Хандалт хаалттай</h1>
        <p className="mt-2 text-muted-foreground">Энэ хичээлийг үзэхийн тулд худалдаж авна уу.</p>
        <Button asChild className="mt-4">
          <a href={`/courses/${id}`}>Хичээлийн тухай</a>
        </Button>
      </div>
    )
  }

  if (!lesson || !course) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl font-bold">Хичээл олдсонгүй</h1>
        <Button asChild className="mt-4">
          <a href={`/courses/${id}`}>Хичээл рүү буцах</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="flex flex-col gap-8">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <a href={`/courses/${id}`} className="hover:underline">
              {course.title}
            </a>
            <span>/</span>
            <span>{lesson.title}</span>
          </div>
          <h1 className="text-3xl font-bold mt-2">{lesson.title}</h1>
          <p className="text-muted-foreground mt-1">{lesson.description}</p>
        </div>

        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">Хичээл</TabsTrigger>
            <TabsTrigger value="notes">
              <StickyNote className="h-4 w-4 mr-2" />
              Тэмдэглэл
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Асуулт & Хариулт
            </TabsTrigger>
            <TabsTrigger value="reminder">
              <Calendar className="h-4 w-4 mr-2" />
              Сануулга
            </TabsTrigger>
            {lesson.quiz && (
              <TabsTrigger value="quiz">
                <Award className="h-4 w-4 mr-2" />
                Тест
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="content" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-8">
                  {lesson.contents
                    .sort((a, b) => a.order - b.order)
                    .map((content) => (
                      <div
                        key={content.id}
                        className="space-y-2"
                        id={content.id}
                        onClick={() => setActiveContentId(content.id)}
                      >
                        <h2 className="text-xl font-bold">{content.title}</h2>
                        <Separator />
                        <div className="mt-4">{renderContent(content)}</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center mt-6">
              <div>
                {prevLessonId && (
                  <Button variant="outline" onClick={() => router.push(`/courses/${id}/lessons/${prevLessonId}`)}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Өмнөх хичээл
                  </Button>
                )}
              </div>
              <div className="flex gap-4">
                {!isCompleted ? (
                  <Button onClick={markAsCompleted}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Хичээл дууссан
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Дууссан
                  </Button>
                )}
                {nextLessonId && (
                  <Button onClick={() => router.push(`/courses/${id}/lessons/${nextLessonId}`)}>
                    Дараагийн хичээл
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <NoteList
                  courseId={id}
                  lessonId={lessonId}
                  contentId={activeContentId || undefined}
                  showAddButton={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <ChatSystem courseId={id} lessonId={lessonId} />
          </TabsContent>

          <TabsContent value="reminder" className="mt-6">
            <ReminderForm courseId={id} lessonId={lessonId} />
          </TabsContent>

          {lesson.quiz && (
            <TabsContent value="quiz" className="mt-6">
              <QuizSystem quiz={lesson.quiz} courseId={id} lessonId={lessonId} existingResult={quizResult} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
