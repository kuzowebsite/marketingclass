"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ref, get } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, User, Tag, Share2 } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import type { BlogPost } from "@/lib/types"
import Link from "next/link"
import { MobileSectionHeader } from "@/components/mobile-section-header"

export default function BlogDetailPage() {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const params = useParams()
  const router = useRouter()
  const { db } = useFirebase()
  const { isMobile } = useMobile()
  const postId = params.id as string

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!db || !postId) return

      try {
        setLoading(true)
        const postRef = ref(db, `blog/${postId}`)
        const snapshot = await get(postRef)

        if (snapshot.exists()) {
          const postData = snapshot.val() as BlogPost
          setPost({ ...postData, id: postId })

          // Холбоотой блогуудыг авах
          const blogRef = ref(db, "blog")
          const allPostsSnapshot = await get(blogRef)

          if (allPostsSnapshot.exists()) {
            const allPosts = allPostsSnapshot.val() as Record<string, BlogPost>
            const allPostsArray = Object.entries(allPosts)
              .map(([id, post]) => ({ ...post, id }))
              .filter((p) => p.id !== postId)

            // Ижил категоритой эсвэл ижил таг-тай блогуудыг олох
            const related = allPostsArray
              .filter((p) => p.category === postData.category || p.tags.some((tag) => postData.tags.includes(tag)))
              .sort(() => 0.5 - Math.random()) // Санамсаргүйгээр эрэмбэлэх
              .slice(0, 3) // Зөвхөн 3 блог авах

            setRelatedPosts(related)
          }
        } else {
          router.push("/blog")
        }
      } catch (error) {
        console.error("Error fetching blog post:", error)
        router.push("/blog")
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPost()
  }, [db, postId, router])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title || "Блог",
          text: post?.excerpt || "",
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Хуваалцах боломжгүй бол clipboard-д хуулах
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          alert("Холбоос хуулагдлаа!")
        })
        .catch((err) => {
          console.error("Clipboard error:", err)
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

  if (!post) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Блог олдсонгүй</h1>
          <Button asChild>
            <Link href="/blog">Блогийн жагсаалт руу буцах</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Мобайл харагдац
  if (isMobile) {
    return (
      <div className="pb-16">
        {/* Толгой хэсэг */}
        <div className="sticky top-0 z-40 bg-background border-b px-4 py-3 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.push("/blog")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium ml-2 line-clamp-1">{post.title}</h1>
          <Button variant="ghost" size="icon" className="ml-auto" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Зураг */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={post.coverImage || `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(post.title)}`}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Мэдээлэл */}
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold mb-2">{post.title}</h1>

          <div className="flex items-center gap-3 mb-4 text-muted-foreground text-xs">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              <span>{post.author}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Агуулга */}
          <div className="prose prose-sm max-w-none dark:prose-invert mt-4">
            {post.content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Холбоотой блогууд */}
        {relatedPosts.length > 0 && (
          <div className="px-4 mt-8">
            <MobileSectionHeader title="Холбоотой нийтлэлүүд" description="Таньд бас сонирхолтой байж магадгүй" />

            <div className="grid grid-cols-1 gap-4">
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.id} className="overflow-hidden border-0 shadow-sm">
                  <Link href={`/blog/${relatedPost.id}`} className="block">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span>{formatDate(relatedPost.createdAt)}</span>
                        <span>•</span>
                        <span>{relatedPost.author}</span>
                      </div>
                      <h3 className="font-medium text-sm line-clamp-2 mb-1">{relatedPost.title}</h3>
                      <p className="text-muted-foreground text-xs line-clamp-2">{relatedPost.excerpt}</p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Desktop харагдац
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/blog")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Блогийн жагсаалт руу буцах
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <User className="h-4 w-4 mr-2" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center ml-auto">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Хуваалцах
              </Button>
            </div>
          </div>

          {post.coverImage && (
            <div className="relative h-80 overflow-hidden rounded-lg mb-8">
              <img
                src={post.coverImage || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            {post.content.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Холбоотой блогууд */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">Холбоотой нийтлэлүүд</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.id}>
                  <CardContent className="p-6">
                    <div className="text-sm text-muted-foreground mb-2">{formatDate(relatedPost.createdAt)}</div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{relatedPost.title}</h3>
                    <p className="text-muted-foreground line-clamp-3 mb-4">{relatedPost.excerpt}</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/blog/${relatedPost.id}`}>Дэлгэрэнгүй</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
