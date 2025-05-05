"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { ref, get, update } from "firebase/database"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface WishlistButtonProps {
  courseId: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export const WishlistButton = ({ courseId, variant = "outline", size = "icon", className }: WishlistButtonProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)
  const { db, user } = useFirebase()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!db || !user) {
        setLoading(false)
        return
      }

      try {
        const userRef = ref(db, `users/${user.uid}`)
        const snapshot = await get(userRef)

        if (snapshot.exists()) {
          const userData = snapshot.val()
          const bookmarkedCourses = userData.bookmarkedCourses || []
          setIsBookmarked(bookmarkedCourses.includes(courseId))
        }
      } catch (error) {
        console.error("Error checking bookmark status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkBookmarkStatus()
  }, [db, user, courseId])

  const toggleBookmark = async () => {
    if (!user) {
      toast({
        title: "Анхааруулга",
        description: "Та эхлээд нэвтэрнэ үү",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (!db) return

    try {
      setLoading(true)
      const userRef = ref(db, `users/${user.uid}`)
      const snapshot = await get(userRef)

      if (snapshot.exists()) {
        const userData = snapshot.val()
        let bookmarkedCourses = userData.bookmarkedCourses || []

        if (isBookmarked) {
          // Remove from wishlist
          bookmarkedCourses = bookmarkedCourses.filter((id: string) => id !== courseId)
        } else {
          // Add to wishlist
          if (!bookmarkedCourses.includes(courseId)) {
            bookmarkedCourses.push(courseId)
          }
        }

        // Update database
        await update(userRef, { bookmarkedCourses })

        // Update UI
        setIsBookmarked(!isBookmarked)

        toast({
          title: isBookmarked ? "Хүсэлт хасагдлаа" : "Хүсэлт нэмэгдлээ",
          description: isBookmarked ? "Хичээл хүслийн жагсаалтаас хасагдлаа" : "Хичээл хүслийн жагсаалтад нэмэгдлээ",
        })
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error)
      toast({
        title: "Алдаа",
        description: "Хүсэлд нэмэхэд алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={(e) => {
        e.stopPropagation()
        toggleBookmark()
      }}
      disabled={loading}
      aria-label={isBookmarked ? "Хүслээс хасах" : "Хүсэлд нэмэх"}
      className={className}
    >
      {isBookmarked ? <Bookmark className="h-4 w-4 fill-primary text-primary" /> : <Bookmark className="h-4 w-4" />}
    </Button>
  )
}
