"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ref, get, remove, update, push, set } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { PlusCircle, Pencil, Trash2, Search, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { BlogPost } from "@/lib/types"

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    author: "",
    category: "",
    tags: "",
  })

  const { db } = useFirebase()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
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
        post.author.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query)),
    )

    setFilteredPosts(filtered)
  }, [searchQuery, posts])

  const fetchBlogPosts = async () => {
    if (!db) return

    try {
      setLoading(true)
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
      } else {
        setPosts([])
        setFilteredPosts([])
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Блогийн мэдээллийг ачаалахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      author: "",
      category: "",
      tags: "",
    })
  }

  const handleAddPost = async () => {
    if (!db) return

    try {
      const { title, content, excerpt, author, category, tags } = formData

      if (!title || !content || !excerpt || !author) {
        toast({
          title: "Мэдээлэл дутуу байна",
          description: "Гарчиг, агуулга, хураангуй болон зохиогчийн нэр заавал оруулна уу",
          variant: "destructive",
        })
        return
      }

      const newPost: Omit<BlogPost, "id"> = {
        title,
        content,
        excerpt,
        author,
        category: category || "Ерөнхий",
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      const blogRef = ref(db, "blog")
      const newPostRef = push(blogRef)
      await set(newPostRef, newPost)

      toast({
        title: "Амжилттай",
        description: "Шинэ блог нэмэгдлээ",
      })

      resetForm()
      setIsAddDialogOpen(false)
      fetchBlogPosts()
    } catch (error) {
      console.error("Error adding blog post:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Блог нэмэхэд алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  const handleEditPost = async () => {
    if (!db || !currentPost) return

    try {
      const { title, content, excerpt, author, category, tags } = formData

      if (!title || !content || !excerpt || !author) {
        toast({
          title: "Мэдээлэл дутуу байна",
          description: "Гарчиг, агуулга, хураангуй болон зохиогчийн нэр заавал оруулна уу",
          variant: "destructive",
        })
        return
      }

      const updatedPost = {
        title,
        content,
        excerpt,
        author,
        category: category || "Ерөнхий",
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
        updatedAt: Date.now(),
      }

      const postRef = ref(db, `blog/${currentPost.id}`)
      await update(postRef, updatedPost)

      toast({
        title: "Амжилттай",
        description: "Блог шинэчлэгдлээ",
      })

      setIsEditDialogOpen(false)
      fetchBlogPosts()
    } catch (error) {
      console.error("Error updating blog post:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Блог шинэчлэхэд алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!db) return

    try {
      const postRef = ref(db, `blog/${postId}`)
      await remove(postRef)

      toast({
        title: "Амжилттай",
        description: "Блог устгагдлаа",
      })

      fetchBlogPosts()
    } catch (error) {
      console.error("Error deleting blog post:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Блог устгахад алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (post: BlogPost) => {
    setCurrentPost(post)
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      author: post.author,
      category: post.category,
      tags: post.tags.join(", "),
    })
    setIsEditDialogOpen(true)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
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

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Блогийн удирдлага</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Шинэ блог нэмэх
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Шинэ блог нэмэх</DialogTitle>
              <DialogDescription>Маркетингийн мэдээ, тренд хэсэгт шинэ блог нэмнэ</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="title">Гарчиг</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Блогийн гарчиг"
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="excerpt">Хураангуй</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Блогийн хураангуй (1-2 өгүүлбэр)"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="content">Агуулга</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Блогийн агуулга"
                  rows={10}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="author">Зохиогч</Label>
                  <Input
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="Зохиогчийн нэр"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="category">Ангилал</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Блогийн ангилал"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="tags">Түлхүүр үгс (таслалаар тусгаарлана)</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Жишээ: маркетинг, сошиал медиа, бренд"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Цуцлах
              </Button>
              <Button onClick={handleAddPost}>Нэмэх</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Блогийн жагсаалт</CardTitle>
          <CardDescription>Нийт {posts.length} блог бүртгэгдсэн байна</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Хайх..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Блог олдсонгүй</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Гарчиг</TableHead>
                    <TableHead>Зохиогч</TableHead>
                    <TableHead>Ангилал</TableHead>
                    <TableHead>Огноо</TableHead>
                    <TableHead className="text-right">Үйлдэл</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>{post.author}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{post.category}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(post.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => router.push(`/blog/${post.id}`)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Харах</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(post)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Засах</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Устгах</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Блог устгах</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Та "{post.title}" блогийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeletePost(post.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Устгах
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Блог засах</DialogTitle>
            <DialogDescription>Блогийн мэдээллийг шинэчлэх</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="edit-title">Гарчиг</Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Блогийн гарчиг"
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="edit-excerpt">Хураангуй</Label>
              <Textarea
                id="edit-excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                placeholder="Блогийн хураангуй (1-2 өгүүлбэр)"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="edit-content">Агуулга</Label>
              <Textarea
                id="edit-content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Блогийн агуулга"
                rows={10}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="edit-author">Зохиогч</Label>
                <Input
                  id="edit-author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Зохиогчийн нэр"
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="edit-category">Ангилал</Label>
                <Input
                  id="edit-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Блогийн ангилал"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="edit-tags">Түлхүүр үгс (таслалаар тусгаарлана)</Label>
              <Input
                id="edit-tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Жишээ: маркетинг, сошиал медиа, бренд"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button onClick={handleEditPost}>Хадгалах</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
