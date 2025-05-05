"use client"

import { useEffect, useState } from "react"
import { ref, get } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { BlogPost } from "@/lib/types"
import Link from "next/link"
import { Search, Calendar, User, ArrowRight, Tag } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { MobileBlogCard } from "@/components/mobile-blog-card"
import { MobileSectionHeader } from "@/components/mobile-section-header"
import { Badge } from "@/components/ui/badge"

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { db } = useFirebase()
  const { isMobile } = useMobile()

  useEffect(() => {
    const fetchBlogPosts = async () => {
      if (!db) return

      try {
        const blogRef = ref(db, "blog")
        const snapshot = await get(blogRef)

        if (snapshot.exists()) {
          const blogData = snapshot.val() as Record<string, BlogPost>
          const blogPosts = Object.entries(blogData)
            .map(([id, post]) => ({
              ...post,
              id,
            }))
            .sort((a, b) => b.createdAt - a.createdAt)

          setPosts(blogPosts)
          setFilteredPosts(blogPosts)
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [db])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPosts(posts)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query)),
    )

    setFilteredPosts(filtered)
  }, [searchQuery, posts])

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

  // Мобайл харагдац
  if (isMobile) {
    return (
      <div className="pb-16">
        {/* Хайлтын хэсэг */}
        <div className="sticky top-0 z-40 bg-background border-b px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Блог хайх..."
              className="pl-9 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Гарчиг */}
        <div className="px-4 pt-4">
          <MobileSectionHeader
            title="Маркетингийн мэдээ, тренд"
            description="Орчин үеийн маркетингийн тренд, зөвлөмж, жишээ кейс"
            badge="Блог"
            badgeColor="blue"
          />
        </div>

        {/* Онцлох нийтлэл */}
        {posts.filter((post) => post.featured).length > 0 && (
          <div className="px-4 mb-6">
            <h3 className="text-sm font-medium mb-3">Онцлох нийтлэл</h3>
            <Link href={`/blog/${posts.find((post) => post.featured)?.id || ""}`} className="block">
              <Card className="overflow-hidden border-0 shadow-md">
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={
                      posts.find((post) => post.featured)?.coverImage ||
                      `/placeholder.svg?height=200&width=400&query=featured blog post` ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={posts.find((post) => post.featured)?.title || "Онцлох нийтлэл"}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 left-2 bg-primary">Онцлох</Badge>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h2 className="text-white font-bold text-lg line-clamp-2">
                      {posts.find((post) => post.featured)?.title}
                    </h2>
                    <div className="flex items-center gap-3 mt-2 text-white/80 text-xs">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>
                          {new Date(posts.find((post) => post.featured)?.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <span>{posts.find((post) => post.featured)?.author}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        )}

        {/* Блог жагсаалт */}
        <div className="px-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 border rounded-md">
              <p className="text-muted-foreground">Мэдээлэл олдсонгүй</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredPosts.map((post) => (
                <MobileBlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* Категориуд */}
        <div className="px-4 mt-8">
          <h3 className="text-sm font-medium mb-3">Категориуд</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(posts.flatMap((post) => post.tags))).map((tag) => (
              <Button key={tag} variant="outline" size="sm" className="text-xs h-8" onClick={() => setSearchQuery(tag)}>
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Desktop харагдац
  return (
    <div className="container py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Маркетингийн мэдээ, тренд</h1>
        <p className="text-muted-foreground mt-2">Орчин үеийн маркетингийн тренд, зөвлөмж, жишээ кейс</p>
      </div>

      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Хайх..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Мэдээлэл олдсонгүй</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="flex flex-col h-full">
              <CardHeader className="pb-3">
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <CardDescription>
                  {new Date(post.createdAt).toLocaleDateString()} • {post.author}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="mt-auto pt-3">
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/blog/${post.id}`} className="flex items-center justify-center">
                    Дэлгэрэнгүй
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
