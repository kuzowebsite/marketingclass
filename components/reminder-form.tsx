"use client"

import type React from "react"

import { useState } from "react"
import { ref, push, set } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Reminder } from "@/lib/types"

interface ReminderFormProps {
  courseId: string
  lessonId?: string
  onSuccess?: () => void
}

export function ReminderForm({ courseId, lessonId, onSuccess }: ReminderFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  const { db, user } = useFirebase()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!db || !user) {
      toast({
        title: "Анхааруулга",
        description: "Сануулга үүсгэхийн тулд нэвтэрнэ үү",
      })
      return
    }

    if (!title || !date) {
      toast({
        title: "Анхааруулга",
        description: "Гарчиг болон огноо оруулна уу",
      })
      return
    }

    try {
      setLoading(true)

      const reminderRef = ref(db, `reminders/${user.uid}`)
      const newReminderRef = push(reminderRef)

      const reminderData: Reminder = {
        id: newReminderRef.key!,
        userId: user.uid,
        courseId,
        lessonId,
        title,
        description,
        scheduledFor: date.getTime(),
        isCompleted: false,
        createdAt: Date.now(),
      }

      await set(newReminderRef, reminderData)

      toast({
        title: "Амжилттай",
        description: "Сануулга амжилттай үүслээ",
      })

      setTitle("")
      setDescription("")
      setDate(undefined)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error creating reminder:", error)
      toast({
        title: "Алдаа",
        description: "Сануулга үүсгэхэд алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Хичээлийн сануулга үүсгэх</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Гарчиг</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Сануулгын гарчиг"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Тайлбар (заавал биш)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Сануулгын тайлбар"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Огноо</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Огноо сонгох"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Үүсгэж байна..." : "Сануулга үүсгэх"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
