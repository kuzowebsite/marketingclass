"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, User } from "lucide-react"
import { ref, get } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import type { Comment } from "@/lib/types"

interface CourseReviewProps {
  courseId: string
  rating?: number
  reviewCount?: number
}

export function CourseReview({ courseId, rating = 0, reviewCount = 0 }: CourseReviewProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const { db } = useFirebase()

  useEffect(() => {
    const fetchComments = async () => {
      if (!db) return

      try {
        setLoading(true)
        const commentsRef = ref(db, `comments/${courseId}`)
        const snapshot = await get(commentsRef)

        if (snapshot.exists()) {
          const commentsData = snapshot.val()
          const commentsArray = Object.values(commentsData) as Comment[]
          setComments(commentsArray.sort((a, b) => b.createdAt - a.createdAt))
        } else {
          setComments([])
        }
      } catch (error) {
        console.error("Error fetching comments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [db, courseId])

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Сэтгэгдлүүд</h3>
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(rating)}</div>
              <span className="text-sm font-medium">
                {rating.toFixed(1)} ({reviewCount} сэтгэгдэл)
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Сэтгэгдлүүдийг ачааллаж байна...</p>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.userAvatar || "/placeholder.svg"} alt={comment.userName} />
                      <AvatarFallback>
                        <User className="h-5 w-5 text-gray-400" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{comment.userName}</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 mb-2">{renderStars(comment.rating || 0)}</div>
                      <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>

                      {comment.imageUrl && (
                        <div className="mt-3">
                          <img
                            src={comment.imageUrl || "/placeholder.svg"}
                            alt="Сэтгэгдлийн зураг"
                            className="max-h-40 rounded-md object-contain"
                            onClick={() => window.open(comment.imageUrl, "_blank")}
                            style={{ cursor: "pointer" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 py-4">Одоогоор сэтгэгдэл байхгүй байна.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
