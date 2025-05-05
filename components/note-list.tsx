"use client"

import { useState, useEffect } from "react"
import { ref, get } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { NoteEditor } from "@/components/note-editor"
import { ExportDialog } from "@/components/export-dialog"
import type { Note } from "@/lib/types"
import { Search, Plus, Bookmark, Calendar, Edit, ArrowUpDown, FileDown } from "lucide-react"

interface NoteListProps {
  courseId?: string
  lessonId?: string
  contentId?: string
  showAddButton?: boolean
  compact?: boolean
  limit?: number
}

const NOTE_COLORS = {
  default: "bg-background",
  blue: "bg-blue-50 dark:bg-blue-900/20",
  green: "bg-green-50 dark:bg-green-900/20",
  yellow: "bg-yellow-50 dark:bg-yellow-900/20",
  red: "bg-red-50 dark:bg-red-900/20",
  purple: "bg-purple-50 dark:bg-purple-900/20",
}

export function NoteList({
  courseId,
  lessonId,
  contentId,
  showAddButton = true,
  compact = false,
  limit,
}: NoteListProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "title">("newest")
  const [selectedNotes, setSelectedNotes] = useState<string[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

  const { db, user } = useFirebase()
  const { toast } = useToast()

  useEffect(() => {
    const fetchNotes = async () => {
      if (!db || !user) {
        setLoading(false)
        return
      }

      try {
        const notesRef = ref(db, `notes/${user.uid}`)
        const snapshot = await get(notesRef)

        if (snapshot.exists()) {
          const notesData = snapshot.val() as Record<string, Note>
          let userNotes = Object.values(notesData)

          // Filter by course, lesson, content if provided
          if (courseId) {
            userNotes = userNotes.filter((note) => note.courseId === courseId)
          }
          if (lessonId) {
            userNotes = userNotes.filter((note) => note.lessonId === lessonId)
          }
          if (contentId) {
            userNotes = userNotes.filter((note) => note.contentId === contentId)
          }

          setNotes(userNotes)
          setFilteredNotes(userNotes)
        } else {
          setNotes([])
          setFilteredNotes([])
        }
      } catch (error) {
        console.error("Error fetching notes:", error)
        toast({
          title: "Алдаа",
          description: "Тэмдэглэлүүд ачаалахад алдаа гарлаа",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
  }, [db, user, courseId, lessonId, contentId, toast])

  useEffect(() => {
    // Filter notes based on search query
    if (searchQuery.trim() === "") {
      setFilteredNotes(notes)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = notes.filter(
        (note) => note.title.toLowerCase().includes(query) || note.text.toLowerCase().includes(query),
      )
      setFilteredNotes(filtered)
    }

    // Sort notes
    const sorted = [...filteredNotes]
    switch (sortOrder) {
      case "newest":
        sorted.sort((a, b) => b.createdAt - a.createdAt)
        break
      case "oldest":
        sorted.sort((a, b) => a.createdAt - b.createdAt)
        break
      case "title":
        sorted.sort((a, b) => a.title.localeCompare(b.title))
        break
    }
    setFilteredNotes(sorted)
  }, [notes, searchQuery, sortOrder])

  const handleAddNote = () => {
    setIsAddingNote(true)
    setEditingNote(null)
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setIsAddingNote(false)
  }

  const handleSaveNote = async () => {
    setIsAddingNote(false)
    setEditingNote(null)

    // Refresh notes
    if (!db || !user) return

    try {
      const notesRef = ref(db, `notes/${user.uid}`)
      const snapshot = await get(notesRef)

      if (snapshot.exists()) {
        const notesData = snapshot.val() as Record<string, Note>
        let userNotes = Object.values(notesData)

        // Filter by course, lesson, content if provided
        if (courseId) {
          userNotes = userNotes.filter((note) => note.courseId === courseId)
        }
        if (lessonId) {
          userNotes = userNotes.filter((note) => note.lessonId === lessonId)
        }
        if (contentId) {
          userNotes = userNotes.filter((note) => note.contentId === contentId)
        }

        setNotes(userNotes)
        setFilteredNotes(userNotes)
      }
    } catch (error) {
      console.error("Error refreshing notes:", error)
    }
  }

  const handleCancelNote = () => {
    setIsAddingNote(false)
    setEditingNote(null)
  }

  const handleDeleteNote = async () => {
    setEditingNote(null)

    // Refresh notes
    if (!db || !user) return

    try {
      const notesRef = ref(db, `notes/${user.uid}`)
      const snapshot = await get(notesRef)

      if (snapshot.exists()) {
        const notesData = snapshot.val() as Record<string, Note>
        let userNotes = Object.values(notesData)

        // Filter by course, lesson, content if provided
        if (courseId) {
          userNotes = userNotes.filter((note) => note.courseId === courseId)
        }
        if (lessonId) {
          userNotes = userNotes.filter((note) => note.lessonId === lessonId)
        }
        if (contentId) {
          userNotes = userNotes.filter((note) => note.contentId === contentId)
        }

        setNotes(userNotes)
        setFilteredNotes(userNotes)
      } else {
        setNotes([])
        setFilteredNotes([])
      }
    } catch (error) {
      console.error("Error refreshing notes:", error)
    }
  }

  const toggleSortOrder = () => {
    if (sortOrder === "newest") {
      setSortOrder("oldest")
    } else if (sortOrder === "oldest") {
      setSortOrder("title")
    } else {
      setSortOrder("newest")
    }
  }

  const getSortLabel = () => {
    switch (sortOrder) {
      case "newest":
        return "Шинэ эхэндээ"
      case "oldest":
        return "Хуучин эхэндээ"
      case "title":
        return "Гарчгаар"
    }
  }

  const getColorClass = (color?: string) => {
    return color && NOTE_COLORS[color as keyof typeof NOTE_COLORS]
      ? NOTE_COLORS[color as keyof typeof NOTE_COLORS]
      : NOTE_COLORS.default
  }

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedNotes([])
  }

  const toggleNoteSelection = (noteId: string) => {
    if (selectedNotes.includes(noteId)) {
      setSelectedNotes(selectedNotes.filter((id) => id !== noteId))
    } else {
      setSelectedNotes([...selectedNotes, noteId])
    }
  }

  const handleExportClick = () => {
    setIsExportDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Ачааллаж байна...</p>
      </div>
    )
  }

  if (isAddingNote) {
    return (
      <NoteEditor
        courseId={courseId || ""}
        lessonId={lessonId || ""}
        contentId={contentId}
        onSave={handleSaveNote}
        onCancel={handleCancelNote}
      />
    )
  }

  if (editingNote) {
    return (
      <NoteEditor
        courseId={courseId || ""}
        lessonId={lessonId || ""}
        contentId={contentId}
        initialNote={editingNote}
        onSave={handleSaveNote}
        onCancel={handleCancelNote}
        onDelete={handleDeleteNote}
      />
    )
  }

  const displayNotes = limit ? filteredNotes.slice(0, limit) : filteredNotes

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Тэмдэглэл хайх..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={toggleSortOrder}>
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {getSortLabel()}
          </Button>
          <Button variant="outline" onClick={toggleSelectionMode}>
            {isSelectionMode ? "Сонголтыг цуцлах" : "Сонгох"}
          </Button>
          {isSelectionMode && selectedNotes.length > 0 && (
            <Button onClick={handleExportClick}>
              <FileDown className="h-4 w-4 mr-2" />
              Экспортлох ({selectedNotes.length})
            </Button>
          )}
          {!isSelectionMode && (
            <Button onClick={handleExportClick}>
              <FileDown className="h-4 w-4 mr-2" />
              Экспортлох
            </Button>
          )}
          {showAddButton && (
            <Button onClick={handleAddNote}>
              <Plus className="h-4 w-4 mr-2" />
              Тэмдэглэл нэмэх
            </Button>
          )}
        </div>
      )}

      {compact && showAddButton && (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={handleExportClick}>
            <FileDown className="h-4 w-4 mr-2" />
            Экспортлох
          </Button>
          <Button size="sm" variant="outline" onClick={handleAddNote}>
            <Plus className="h-4 w-4 mr-2" />
            Тэмдэглэл нэмэх
          </Button>
        </div>
      )}

      {displayNotes.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-muted-foreground">Тэмдэглэл олдсонгүй</p>
          {showAddButton && (
            <Button onClick={handleAddNote} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Тэмдэглэл нэмэх
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayNotes.map((note) => (
            <Card key={note.id} className={`${getColorClass(note.color)}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  {isSelectionMode ? (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedNotes.includes(note.id)}
                        onCheckedChange={() => toggleNoteSelection(note.id)}
                        id={`select-${note.id}`}
                      />
                      <CardTitle className="text-lg">{note.title}</CardTitle>
                    </div>
                  ) : (
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                  )}
                  {note.isBookmarked && <Bookmark className="h-4 w-4 text-primary" />}
                </div>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {new Date(note.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className={`whitespace-pre-wrap ${compact ? "line-clamp-3" : ""}`}>{note.text}</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => handleEditNote(note)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Засах
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {limit && filteredNotes.length > limit && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" asChild>
            <a href="/notes">Бүх тэмдэглэл үзэх</a>
          </Button>
        </div>
      )}

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        notes={notes}
        selectedNotes={isSelectionMode ? selectedNotes : undefined}
      />
    </div>
  )
}
