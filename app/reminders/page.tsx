"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Plus, Bell, Trash2, X, CalendarPlus2Icon as CalendarIcon2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { ref, push, set, get, update, remove } from "firebase/database"
import Link from "next/link"

interface Reminder {
  id: string
  title: string
  description: string
  date: string
  completed: boolean
}

export default function RemindersPage() {
  const { user, db } = useFirebase()
  const router = useRouter()
  const { toast } = useToast()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingReminder, setIsAddingReminder] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (user && db) {
      fetchReminders()
    } else {
      setLoading(false)
    }
  }, [user, db])

  const fetchReminders = async () => {
    if (!user || !db) return

    try {
      setLoading(true)
      const remindersRef = ref(db, `users/${user.uid}/reminders`)
      const snapshot = await get(remindersRef)

      if (snapshot.exists()) {
        const remindersData = snapshot.val()
        const remindersList = Object.keys(remindersData).map((key) => ({
          id: key,
          ...remindersData[key],
        }))

        // Sort by date (newest first) and then by completion status
        remindersList.sort((a, b) => {
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1
          }
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        })

        setReminders(remindersList)
      } else {
        setReminders([])
      }
    } catch (error) {
      console.error("Error fetching reminders:", error)
      toast({
        title: "Алдаа",
        description: "Сануулгуудыг ачаалахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddReminder = async () => {
    if (!user || !db) {
      toast({
        title: "Анхааруулга",
        description: "Сануулга үүсгэхийн тулд нэвтэрнэ үү",
      })
      router.push("/auth/login?callbackUrl=/reminders")
      return
    }

    if (!title || !date) {
      toast({
        title: "Анхааруулга",
        description: "Гарчиг болон огноог оруулна уу",
      })
      return
    }

    try {
      const remindersRef = ref(db, `users/${user.uid}/reminders`)
      const newReminderRef = push(remindersRef)

      const newReminder = {
        title,
        description,
        date: date?.toISOString(),
        completed: false,
      }

      await set(newReminderRef, newReminder)

      toast({
        title: "Амжилттай",
        description: "Сануулга амжилттай үүсгэгдлээ",
      })

      setTitle("")
      setDescription("")
      setDate(new Date())
      setIsAddingReminder(false)
      fetchReminders()
    } catch (error) {
      console.error("Error adding reminder:", error)
      toast({
        title: "Алдаа",
        description: "Сануулга үүсгэхэд алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  const handleToggleComplete = async (id: string, currentStatus: boolean) => {
    if (!user || !db) return

    try {
      const reminderRef = ref(db, `users/${user.uid}/reminders/${id}`)
      await update(reminderRef, { completed: !currentStatus })

      toast({
        title: "Амжилттай",
        description: !currentStatus ? "Сануулга дууссан гэж тэмдэглэгдлээ" : "Сануулга идэвхтэй болголоо",
      })

      fetchReminders()
    } catch (error) {
      console.error("Error updating reminder:", error)
      toast({
        title: "Алдаа",
        description: "Сануулгын төлөвийг өөрчлөхөд алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReminder = async (id: string) => {
    if (!user || !db) return

    try {
      const reminderRef = ref(db, `users/${user.uid}/reminders/${id}`)
      await remove(reminderRef)

      toast({
        title: "Амжилттай",
        description: "Сануулга амжилттай устгагдлаа",
      })

      fetchReminders()
    } catch (error) {
      console.error("Error deleting reminder:", error)
      toast({
        title: "Алдаа",
        description: "Сануулга устгахад алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  // If not client-side yet, show loading state
  if (!isClient) {
    return (
      <div className="container py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // If no user is logged in, show login prompt
  if (!user) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Сануулгууд</h1>
        <div className="text-center py-12">
          <Bell className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-medium mb-4">Сануулгуудаа харахын тулд нэвтэрнэ үү</h2>
          <Button asChild>
            <Link href="/auth/login?callbackUrl=/reminders">Нэвтрэх</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Сануулгууд</h1>
        <Button onClick={() => setIsAddingReminder(!isAddingReminder)}>
          {isAddingReminder ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Цуцлах
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Шинэ сануулга
            </>
          )}
        </Button>
      </div>

      {isAddingReminder && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Шинэ сануулга үүсгэх</CardTitle>
            <CardDescription>Хичээл эсвэл ажлаа санахад тусална</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Гарчиг
              </label>
              <Input
                id="title"
                placeholder="Сануулгын гарчиг"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Тайлбар
              </label>
              <Textarea
                id="description"
                placeholder="Сануулгын тайлбар"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">
                Огноо
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Огноо сонгох</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleAddReminder}>
              <Plus className="mr-2 h-4 w-4" />
              Сануулга үүсгэх
            </Button>
          </CardFooter>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-medium mb-2">Сануулга байхгүй байна</h2>
          <p className="text-gray-500 mb-6">Шинэ сануулга үүсгэж хичээл эсвэл ажлаа санахад тусална</p>
          <Button onClick={() => setIsAddingReminder(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Шинэ сануулга үүсгэх
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reminders.map((reminder) => (
            <Card key={reminder.id} className={reminder.completed ? "opacity-70" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{reminder.title}</CardTitle>
                  <Badge variant={reminder.completed ? "outline" : "default"}>
                    {reminder.completed ? "Дууссан" : "Идэвхтэй"}
                  </Badge>
                </div>
                <CardDescription className="flex items-center mt-1">
                  <CalendarIcon2 className="h-3 w-3 mr-1" />
                  {format(new Date(reminder.date), "PPP")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">{reminder.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center">
                  <Checkbox
                    id={`complete-${reminder.id}`}
                    checked={reminder.completed}
                    onCheckedChange={() => handleToggleComplete(reminder.id, reminder.completed)}
                  />
                  <label htmlFor={`complete-${reminder.id}`} className="ml-2 text-sm">
                    {reminder.completed ? "Дууссан" : "Дуусгах"}
                  </label>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteReminder(reminder.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
