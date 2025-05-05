"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ref, get, update, remove } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import type { Reminder, Course } from "@/lib/types"
import { Calendar, CheckCircle, Trash2 } from "lucide-react"
import { format } from "date-fns"

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [courses, setCourses] = useState<Record<string, Course>>({})
  const [loading, setLoading] = useState(true)

  const { db, user } = useFirebase()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchReminders = async () => {
      if (!db || !user) {
        router.push("/auth/login")
        return
      }

      try {
        // Fetch reminders
        const remindersRef = ref(db, `reminders/${user.uid}`)
        const remindersSnapshot = await get(remindersRef)

        if (remindersSnapshot.exists()) {
          const reminderData = remindersSnapshot.val() as Record<string, Reminder>
          setReminders(Object.values(reminderData).sort((a, b) => a.scheduledFor - b.scheduledFor))

          // Fetch course data for each reminder
          const courseIds = new Set<string>()
          Object.values(reminderData).forEach((reminder) => {
            courseIds.add(reminder.courseId)
          })

          const coursesData: Record<string, Course> = {}
          for (const courseId of courseIds) {
            const courseRef = ref(db, `courses/${courseId}`)
            const courseSnapshot = await get(courseRef)

            if (courseSnapshot.exists()) {
              coursesData[courseId] = courseSnapshot.val() as Course
            }
          }

          setCourses(coursesData)
        }
      } catch (error) {
        console.error("Error fetching reminders:", error)
        toast({
          title: "Алдаа",
          description: "Сануулгууд ачаалахад алдаа гарлаа",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReminders()
  }, [db, router, toast, user])

  const markAsCompleted = async (reminderId: string) => {
    if (!db || !user) return

    try {
      const reminderRef = ref(db, `reminders/${user.uid}/${reminderId}`)
      await update(reminderRef, { isCompleted: true })

      setReminders((prev) => prev.filter((r) => r.id !== reminderId))

      toast({
        title: "Амжилттай",
        description: "Сануулга дууссан гэж тэмдэглэгдлээ",
      })
    } catch (error) {
      console.error("Error updating reminder:", error)
      toast({
        title: "Алдаа",
        description: "Сануулга шинэчлэхэд алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  const deleteReminder = async (reminderId: string) => {
    if (!db || !user) return

    try {
      const reminderRef = ref(db, `reminders/${user.uid}/${reminderId}`)
      await remove(reminderRef)

      setReminders((prev) => prev.filter((r) => r.id !== reminderId))

      toast({
        title: "Амжилттай",
        description: "Сануулга устгагдлаа",
      })
    } catch (error) {
      console.error("Error deleting reminder:", error)
      toast({
        title: "Алдаа",
        description: "Сануулга устгахад алдаа гарлаа",
        variant: "destructive",
      })
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

  const upcomingReminders = reminders.filter((r) => r.scheduledFor > Date.now() && !r.isCompleted)
  const pastReminders = reminders.filter((r) => r.scheduledFor <= Date.now() && !r.isCompleted)

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold">Хичээлийн сануулгууд</h1>
      <p className="text-muted-foreground mt-2">Хичээлээ дуусгах зорилго тавьж, сануулга үүсгээрэй</p>

      <Tabs defaultValue="upcoming" className="mt-8">
        <TabsList>
          <TabsTrigger value="upcoming">Удахгүй ирэх ({upcomingReminders.length})</TabsTrigger>
          <TabsTrigger value="past">Хугацаа хэтэрсэн ({pastReminders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingReminders.length === 0 ? (
            <div className="text-center py-12 border rounded-md">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Удахгүй ирэх сануулга байхгүй байна</p>
              <Button asChild className="mt-4">
                <a href="/courses">Хичээл үзэх</a>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingReminders.map((reminder) => (
                <Card key={reminder.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{reminder.title}</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => markAsCompleted(reminder.id)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteReminder(reminder.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {courses[reminder.courseId]?.title || "Хичээл"}
                      {reminder.lessonId &&
                        courses[reminder.courseId]?.lessons.find((l) => l.id === reminder.lessonId) &&
                        ` / ${courses[reminder.courseId].lessons.find((l) => l.id === reminder.lessonId)!.title}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reminder.description && (
                      <p className="text-sm text-muted-foreground mb-2">{reminder.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(reminder.scheduledFor), "PPP")}</span>
                    </div>
                    {reminder.lessonId && (
                      <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                        <a href={`/courses/${reminder.courseId}/lessons/${reminder.lessonId}`}>Хичээл үзэх</a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastReminders.length === 0 ? (
            <div className="text-center py-12 border rounded-md">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Хугацаа хэтэрсэн сануулга байхгүй байна</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastReminders.map((reminder) => (
                <Card key={reminder.id} className="border-red-200 dark:border-red-800">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{reminder.title}</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => markAsCompleted(reminder.id)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteReminder(reminder.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {courses[reminder.courseId]?.title || "Хичээл"}
                      {reminder.lessonId &&
                        courses[reminder.courseId]?.lessons.find((l) => l.id === reminder.lessonId) &&
                        ` / ${courses[reminder.courseId].lessons.find((l) => l.id === reminder.lessonId)!.title}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reminder.description && (
                      <p className="text-sm text-muted-foreground mb-2">{reminder.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-red-500">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(reminder.scheduledFor), "PPP")} (Хугацаа хэтэрсэн)</span>
                    </div>
                    {reminder.lessonId && (
                      <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                        <a href={`/courses/${reminder.courseId}/lessons/${reminder.lessonId}`}>Хичээл үзэх</a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
