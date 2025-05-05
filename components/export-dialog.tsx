"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { exportToPDF, exportToDOCX, exportToTXT, exportToMarkdown, exportToHTML } from "@/lib/export-utils"
import type { Note } from "@/lib/types"
import { FileDown, Loader2 } from "lucide-react"

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  notes: Note[]
  selectedNotes?: string[] // Сонгогдсон тэмдэглэлүүдийн ID
}

export function ExportDialog({ isOpen, onClose, notes, selectedNotes }: ExportDialogProps) {
  const [fileName, setFileName] = useState("my-notes")
  const [format, setFormat] = useState<"pdf" | "docx" | "txt" | "md" | "html">("pdf")
  const [loading, setLoading] = useState(false)
  const [exportAll, setExportAll] = useState(selectedNotes ? false : true)

  // Экспортлох тэмдэглэлүүдийг тодорхойлох
  const notesToExport = exportAll ? notes : notes.filter((note) => selectedNotes?.includes(note.id))

  const handleExport = async () => {
    if (notesToExport.length === 0) {
      return
    }

    setLoading(true)

    try {
      switch (format) {
        case "pdf":
          await exportToPDF(notesToExport, fileName)
          break
        case "docx":
          await exportToDOCX(notesToExport, fileName)
          break
        case "txt":
          exportToTXT(notesToExport, fileName)
          break
        case "md":
          exportToMarkdown(notesToExport, fileName)
          break
        case "html":
          exportToHTML(notesToExport, fileName)
          break
      }

      onClose()
    } catch (error) {
      console.error("Error exporting notes:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Тэмдэглэл экспортлох</DialogTitle>
          <DialogDescription>Тэмдэглэлүүдийг өөр форматаар экспортлох</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fileName" className="text-right">
              Файлын нэр
            </Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Формат</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as any)} className="col-span-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf">PDF</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="docx" id="docx" />
                <Label htmlFor="docx">Word (DOCX)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="txt" id="txt" />
                <Label htmlFor="txt">Текст (TXT)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="md" id="md" />
                <Label htmlFor="md">Markdown (MD)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="html" id="html" />
                <Label htmlFor="html">HTML</Label>
              </div>
            </RadioGroup>
          </div>

          {selectedNotes && selectedNotes.length > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Тэмдэглэл</Label>
              <div className="col-span-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="exportAll" checked={exportAll} onCheckedChange={(checked) => setExportAll(!!checked)} />
                  <Label htmlFor="exportAll">Бүх тэмдэглэлийг экспортлох ({notes.length})</Label>
                </div>
                {!exportAll && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Сонгогдсон {selectedNotes.length} тэмдэглэлийг экспортлох
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Цуцлах
          </Button>
          <Button onClick={handleExport} disabled={loading || notesToExport.length === 0}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Экспортлож байна...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Экспортлох
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
