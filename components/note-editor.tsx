"use client"

import { useState, useEffect } from "react"
import { ref, push, update, remove } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ExportDialog } from "@/components/export-dialog"
import type { Note } from "@/lib/types"
import { Bookmark, BookmarkX, Trash2, FileDown } from "lucide-react"

interface NoteEditorProps {
  courseId: string
  lessonId: string
  contentId?: string
  initialNote?: Note
  onSave?: () => void
  onCancel?: () => void
  onDelete?: () => void
}

const NOTE_COLORS = [
  { value: "default", label: "Хэвийн", class: "bg-background" },
  { value: "blue", label: "Цэнхэр", class: "bg-blue-50 dark:bg-blue-900/20" },
  { value: "green", label: "Ногоон", class: "bg-green-50 dark:bg-green-900/20" },
  { value: "yellow", label: "Шар", class: "bg-yellow-50 dark:bg-yellow-900/20" },
  { value: "red", label: "Улаан", class: "bg-red-50 dark:bg-red-900/20" },
  { value: "purple", label: "Ягаан", class: "bg-purple-50 dark:bg-purple-900/20" },
]

export function NoteEditor({
  courseId,
  lessonId,
  contentId,
  initialNote,
  onSave,
  onCancel,
  onDelete,
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialNote?.title || "")
  const [text, setText] = useState(initialNote?.text || "")
  const [color, setColor] = useState(initialNote?.color || "default")
  const [isBookmarked, setIsBookmarked] = useState(initialNote?.isBookmarked || false)
  const [loading, setLoading] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

  const { db, user } = useFirebase()
  const { toast } = useToast()

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title)
      setText(initialNote.text)
      setColor(initialNote.color || "default")
      setIsBookmarked(initialNote.isBookmarked || false)
    }
  }, [initialNote])

  const handleSave = async () => {
    if (!db || !user) {
      toast({
        title: "Анхааруулга",
        description: "Тэмдэглэл хадгалахын тулд нэвтэрнэ үү",
      })
      return
    }

    if (!title.trim()) {
      toast({
        title: "Анхааруулга",
        description: "Тэмдэглэлийн гарчиг оруулна уу",
      })
      return
    }

    try {
      setLoading(true)

      const now = Date.now()
      // Создаем базовый объект заметки без contentId
      const noteData: Partial<Note> = {
        userId: user.uid,
        courseId,
        lessonId,
        title: title.trim(),
        text: text.trim(),
        color,
        isBookmarked,
        updatedAt: now,
      }

      // Добавляем contentId только если он определен
      if (contentId) {
        noteData.contentId = contentId
      }

      if (initialNote) {
        // Update existing note
        const noteRef = ref(db, `notes/${user.uid}/${initialNote.id}`)
        await update(noteRef, noteData)

        toast({
          title: "Амжилттай",
          description: "Тэмдэглэл шинэчлэгдлээ",
        })
      } else {
        // Create new note
        const notesRef = ref(db, `notes/${user.uid}`)
        const newNoteRef = push(notesRef)

        await update(newNoteRef, {
          ...noteData,
          id: newNoteRef.key,
          createdAt: now,
        })

        toast({
          title: "Амжилттай",
          description: "Тэмдэглэл нэмэгдлээ",
        })
      }

      if (onSave) {
        onSave()
      }
    } catch (error) {
      console.error("Error saving note:", error)
      toast({
        title: "Алдаа",
        description: "Тэмдэглэл хадгалахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!db || !user || !initialNote) return

    try {
      setLoading(true)
      const noteRef = ref(db, `notes/${user.uid}/${initialNote.id}`)
      await remove(noteRef)

      toast({
        title: "Амжилттай",
        description: "Тэмдэглэл устгагдлаа",
      })

      if (onDelete) {
        onDelete()
      }
    } catch (error) {
      console.error("Error deleting note:", error)
      toast({
        title: "Алдаа",
        description: "Тэмдэглэл устгахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const getColorClass = () => {
    const colorObj = NOTE_COLORS.find((c) => c.value === color)
    return colorObj ? colorObj.class : "bg-background"
  }

  const handleExportClick = () => {
    setIsExportDialogOpen(true)
  }

  return (
    <>
      <Card className={getColorClass()}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex justify-between items-center">
            <span>{initialNote ? "Тэмдэглэл засах" : "Шинэ тэмдэглэл"}</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={handleExportClick} className="h-8 w-8" title="Экспортлох">
                <FileDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleBookmark}
                className="h-8 w-8"
                title={isBookmarked ? "Тэмдэглэгээг арилгах" : "Тэмдэглэх"}
              >
                {isBookmarked ? <BookmarkX className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              </Button>
              {initialNote && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                  title="Устгах"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input placeholder="Тэмдэглэлийн гарчиг" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Тэмдэглэлийн агуулга..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger>
                <SelectValue placeholder="Өнгө сонгох" />
              </SelectTrigger>
              <SelectContent>
                {NOTE_COLORS.map((colorOption) => (
                  <SelectItem key={colorOption.value} value={colorOption.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border ${colorOption.class}`}></div>
                      <span>{colorOption.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Цуцлах
          </Button>
          <Button onClick={handleSave} disabled={loading || !title.trim()}>
            {loading ? "Хадгалж байна..." : initialNote ? "Шинэчлэх" : "Хадгалах"}
          </Button>
        </CardFooter>
      </Card>

      {initialNote && (
        <ExportDialog isOpen={isExportDialogOpen} onClose={() => setIsExportDialogOpen(false)} notes={[initialNote]} />
      )}
    </>
  )
}
