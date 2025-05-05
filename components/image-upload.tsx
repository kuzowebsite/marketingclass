"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, ImageIcon, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ImageUploadProps {
  onImageUploaded: (imageData: string) => void
  currentImageUrl?: string
  label?: string
  className?: string
  folder?: string
}

export function ImageUpload({
  onImageUploaded,
  currentImageUrl,
  label = "Зураг оруулах",
  className,
  folder = "images",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Алдаа",
        description: "Зөвхөн зураг оруулах боломжтой",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Алдаа",
        description: "Зургийн хэмжээ 2MB-с хэтрэхгүй байх ёстой",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)
      setProgress(10)

      // Convert the image to base64
      const base64Data = await convertFileToBase64(file, (progress) => {
        setProgress(Math.round(progress * 90) + 10) // Scale progress from 10-100%
      })

      setProgress(100)

      // Create preview
      setPreviewUrl(base64Data)

      // Pass the base64 data to the parent component
      onImageUploaded(base64Data)

      toast({
        title: "Амжилттай",
        description: "Зураг амжилттай оруулагдлаа",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Алдаа",
        description: "Зураг оруулахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const convertFileToBase64 = (file: File, onProgress?: (progress: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onloadstart = () => {
        if (onProgress) onProgress(0)
      }

      reader.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = event.loaded / event.total
          onProgress(progress)
        }
      }

      reader.onload = () => {
        if (onProgress) onProgress(1)
        resolve(reader.result as string)
      }

      reader.onerror = () => {
        reject(new Error("Failed to read file"))
      }

      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onImageUploaded("")
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {previewUrl && (
          <Button variant="destructive" size="sm" onClick={handleRemoveImage} type="button">
            <Trash2 className="h-4 w-4 mr-1" /> Устгах
          </Button>
        )}
      </div>

      {previewUrl ? (
        <div className="relative mt-2">
          <img
            src={previewUrl || "/placeholder.svg"}
            alt="Uploaded preview"
            className="max-h-40 rounded-md object-contain border p-1"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div
            className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Зураг сонгохын тулд энд дарна уу</p>
            <p className="text-xs text-muted-foreground mt-1">эсвэл файлаа чирч оруулна уу</p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Компьютероос зураг сонгох
          </Button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={uploading}
      />

      {uploading && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">Оруулж байна... {progress}%</p>
        </div>
      )}
    </div>
  )
}
