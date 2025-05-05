"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ref, get, update } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { fileToBase64 } from "@/lib/firebase/base64-utils"
import type { Course, Lesson, Content, CourseLevel } from "@/lib/types"
import { Plus, Trash2, Upload, ArrowLeft, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
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

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const courseId = params.id
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [course, setCourse] = useState<Course | null>(null)

  // Basic course information
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [type, setType] = useState<"organization" | "individual">("organization")
  const [category, setCategory] = useState("")
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [level, setLevel] = useState<CourseLevel>("beginner")
  const [language, setLanguage] = useState("Монгол")
  const [featured, setFeatured] = useState(false)
  const [discount, setDiscount] = useState("")
  const [tags, setTags] = useState("")

  // Requirements and outcomes
  const [requirements, setRequirements] = useState<string[]>([""])
  const [outcomes, setOutcomes] = useState<string[]>([""])

  // Instructor information
  const [instructorName, setInstructorName] = useState("")
  const [instructorBio, setInstructorBio] = useState("")
  const [instructorExpertise, setInstructorExpertise] = useState("")
  const [instructorAvatar, setInstructorAvatar] = useState<string | null>(null)

  // Lessons
  const [lessons, setLessons] = useState<Partial<Lesson>[]>([
    { id: "lesson-" + Date.now(), title: "", description: "", contents: [], order: 0 },
  ])

  const { user, db } = useFirebase()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !db) {
        setLoading(false)
        router.push("/auth/login")
        return
      }

      try {
        const userRef = ref(db, `users/${user.uid}`)
        const snapshot = await get(userRef)

        if (snapshot.exists()) {
          const userData = snapshot.val()
          if (userData.isAdmin) {
            setIsAdmin(true)
            fetchCourse()
          } else {
            toast({
              title: "Хандалт хаалттай",
              description: "Танд админ эрх байхгүй байна",
              variant: "destructive",
            })
            router.push("/")
          }
        } else {
          router.push("/")
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [db, router, toast, user, courseId])

  const fetchCourse = async () => {
    if (!db) return

    try {
      setLoading(true)
      const courseRef = ref(db, `courses/${courseId}`)
      const snapshot = await get(courseRef)

      if (snapshot.exists()) {
        const courseData = snapshot.val() as Course
        setCourse(courseData)

        // Set form values
        setTitle(courseData.title)
        setDescription(courseData.description)
        setPrice(courseData.price.toString())
        setType(courseData.type)
        setCategory(courseData.category)
        setThumbnail(courseData.thumbnail || null)
        setLevel(courseData.level || "beginner")
        setLanguage(courseData.language || "Монгол")
        setFeatured(courseData.featured || false)
        setDiscount(courseData.discount ? courseData.discount.toString() : "")
        setTags(courseData.tags ? courseData.tags.join(", ") : "")

        // Set requirements
        if (courseData.requirements && courseData.requirements.length > 0) {
          setRequirements(courseData.requirements.map((req) => req.text))
        }

        // Set outcomes
        if (courseData.outcomes && courseData.outcomes.length > 0) {
          setOutcomes(courseData.outcomes.map((outcome) => outcome.text))
        }

        // Set instructor
        if (courseData.instructor) {
          setInstructorName(courseData.instructor.name)
          setInstructorBio(courseData.instructor.bio)
          setInstructorExpertise(courseData.instructor.expertise.join(", "))
          setInstructorAvatar(courseData.instructor.avatar || null)
        }

        // Set lessons
        if (courseData.lessons && courseData.lessons.length > 0) {
          setLessons(courseData.lessons)
        }
      } else {
        toast({
          title: "Алдаа",
          description: "Хичээл олдсонгүй",
          variant: "destructive",
        })
        router.push("/admin/courses")
      }
    } catch (error) {
      console.error("Error fetching course:", error)
      toast({
        title: "Алдаа",
        description: "Хичээл ачааллахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const base64 = await fileToBase64(file)
        setThumbnail(base64)
      } catch (error) {
        console.error("Error converting file to base64:", error)
        toast({
          title: "Алдаа",
          description: "Зураг хөрвүүлэхэд алдаа гарлаа",
          variant: "destructive",
        })
      }
    }
  }

  const handleInstructorAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const base64 = await fileToBase64(file)
        setInstructorAvatar(base64)
      } catch (error) {
        console.error("Error converting file to base64:", error)
        toast({
          title: "Алдаа",
          description: "Зураг хөрвүүлэхэд алдаа гарлаа",
          variant: "destructive",
        })
      }
    }
  }

  const addRequirement = () => {
    setRequirements([...requirements, ""])
  }

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...requirements]
    newRequirements[index] = value
    setRequirements(newRequirements)
  }

  const removeRequirement = (index: number) => {
    const newRequirements = [...requirements]
    newRequirements.splice(index, 1)
    setRequirements(newRequirements)
  }

  const addOutcome = () => {
    setOutcomes([...outcomes, ""])
  }

  const updateOutcome = (index: number, value: string) => {
    const newOutcomes = [...outcomes]
    newOutcomes[index] = value
    setOutcomes(newOutcomes)
  }

  const removeOutcome = (index: number) => {
    const newOutcomes = [...outcomes]
    newOutcomes.splice(index, 1)
    setOutcomes(newOutcomes)
  }

  const addLesson = () => {
    setLessons([
      ...lessons,
      {
        id: "lesson-" + Date.now(),
        title: "",
        description: "",
        contents: [],
        order: lessons.length,
      },
    ])
  }

  const removeLesson = (index: number) => {
    const newLessons = [...lessons]
    newLessons.splice(index, 1)
    // Update order for remaining lessons
    newLessons.forEach((lesson, idx) => {
      lesson.order = idx
    })
    setLessons(newLessons)
  }

  const updateLesson = (index: number, field: keyof Lesson, value: any) => {
    const newLessons = [...lessons]
    newLessons[index] = { ...newLessons[index], [field]: value }
    setLessons(newLessons)
  }

  const addContent = (lessonIndex: number) => {
    const newLessons = [...lessons]
    const newContent: Partial<Content> = {
      id: "content-" + Date.now(),
      title: "",
      type: "text",
      data: "",
      order: newLessons[lessonIndex].contents?.length || 0,
    }

    newLessons[lessonIndex].contents = [...(newLessons[lessonIndex].contents || []), newContent]

    setLessons(newLessons)
  }

  const removeContent = (lessonIndex: number, contentIndex: number) => {
    const newLessons = [...lessons]
    newLessons[lessonIndex].contents?.splice(contentIndex, 1)

    // Update order for remaining contents
    newLessons[lessonIndex].contents?.forEach((content, idx) => {
      content.order = idx
    })

    setLessons(newLessons)
  }

  const updateContent = (lessonIndex: number, contentIndex: number, field: keyof Content, value: any) => {
    const newLessons = [...lessons]
    if (newLessons[lessonIndex].contents && newLessons[lessonIndex].contents![contentIndex]) {
      newLessons[lessonIndex].contents![contentIndex] = {
        ...newLessons[lessonIndex].contents![contentIndex],
        [field]: value,
      }
      setLessons(newLessons)
    }
  }

  const handleContentFileChange = async (
    lessonIndex: number,
    contentIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const base64 = await fileToBase64(file)
        updateContent(lessonIndex, contentIndex, "data", base64)
        updateContent(lessonIndex, contentIndex, "mimeType", file.type)
      } catch (error) {
        console.error("Error converting file to base64:", error)
        toast({
          title: "Алдаа",
          description: "Файл хөрвүүлэхэд алдаа гарлаа",
          variant: "destructive",
        })
      }
    }
  }

  const validateForm = () => {
    // Basic validation
    if (!title || !description || !price || !category) {
      toast({
        title: "Анхааруулга",
        description: "Үндсэн мэдээллийн бүх талбарыг бөглөнө үү",
        variant: "destructive",
      })
      return false
    }

    // Validate lessons
    for (const lesson of lessons) {
      if (!lesson.title || !lesson.description) {
        toast({
          title: "Анхааруулга",
          description: "Бүх хичээлийн мэдээллийг бөглөнө үү",
          variant: "destructive",
        })
        return false
      }

      // Validate contents
      if (!lesson.contents || lesson.contents.length === 0) {
        toast({
          title: "Анхааруулга",
          description: `"${lesson.title}" хичээлд контент нэмнэ үү`,
          variant: "destructive",
        })
        return false
      }

      for (const content of lesson.contents) {
        if (!content.title || !content.data) {
          toast({
            title: "Анхааруулга",
            description: `"${lesson.title}" хичээлийн бүх контентын мэдээллийг бөглөнө үү`,
            variant: "destructive",
          })
          return false
        }
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!db) {
      toast({
        title: "Алдаа",
        description: "Системд алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      })
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)

      // Format requirements and outcomes
      const formattedRequirements = requirements
        .filter((req) => req.trim() !== "")
        .map((text, index) => ({
          id: `req-${index}`,
          text,
        }))

      const formattedOutcomes = outcomes
        .filter((outcome) => outcome.trim() !== "")
        .map((text, index) => ({
          id: `outcome-${index}`,
          text,
        }))

      // Format instructor
      const instructor = instructorName
        ? {
            id: course?.instructor?.id || `instructor-${Date.now()}`,
            name: instructorName,
            bio: instructorBio,
            avatar: instructorAvatar || "",
            expertise: instructorExpertise.split(",").map((item) => item.trim()),
          }
        : undefined

      // Calculate total duration
      const totalDuration = lessons.reduce((total, lesson) => {
        return total + (lesson.duration || 0)
      }, 0)

      const courseData: Partial<Course> = {
        title,
        description,
        price: Number.parseFloat(price),
        type,
        category,
        lessons: lessons as Lesson[],
        thumbnail: thumbnail || "",
        updatedAt: Date.now(),
        level,
        language,
        featured,
        discount: discount ? Number.parseFloat(discount) : undefined,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : undefined,
        requirements: formattedRequirements.length > 0 ? formattedRequirements : undefined,
        outcomes: formattedOutcomes.length > 0 ? formattedOutcomes : undefined,
        instructor,
        totalDuration: totalDuration > 0 ? totalDuration : undefined,
      }

      const courseRef = ref(db, `courses/${courseId}`)
      await update(courseRef, courseData)

      toast({
        title: "Амжилттай",
        description: "Хичээл амжилттай шинэчлэгдлээ",
      })

      router.push("/admin/courses")
    } catch (error) {
      console.error("Error updating course:", error)
      toast({
        title: "Алдаа",
        description: "Хичээл шинэчлэхэд алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4">Хичээлийн мэдээлэл ачааллаж байна...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="container py-12">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.push("/admin/courses")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Хичээл засах</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="basic">Үндсэн мэдээлэл</TabsTrigger>
            <TabsTrigger value="details">Нэмэлт мэдээлэл</TabsTrigger>
            <TabsTrigger value="instructor">Багш</TabsTrigger>
            <TabsTrigger value="lessons">Хичээлүүд</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Хичээлийн үндсэн мэдээлэл</CardTitle>
                <CardDescription>Хичээлийн үндсэн мэдээллийг оруулна уу</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Гарчиг</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Хичээлийн нэр"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Тайлбар</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Хичээлийн тайлбар"
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Үнэ (₮)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Үнэ"
                      min="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Төрөл</Label>
                    <Select value={type} onValueChange={(value) => setType(value as "organization" | "individual")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Төрөл сонгох" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="organization">Байгууллага</SelectItem>
                        <SelectItem value="individual">Хувь хүн</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Ангилал</Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Жишээ: YouTube, Facebook"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Зураг</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("thumbnail")?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Зураг сонгох
                    </Button>
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                    {thumbnail && (
                      <div className="relative w-24 h-24">
                        <img
                          src={thumbnail || "/placeholder.svg"}
                          alt="Thumbnail"
                          className="w-full h-full object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => setThumbnail(null)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Additional Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Нэмэлт мэдээлэл</CardTitle>
                <CardDescription>Хичээлийн нэмэлт мэдээллийг оруулна уу</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="level">Түвшин</Label>
                    <Select value={level} onValueChange={(value) => setLevel(value as CourseLevel)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Түвшин сонгох" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Анхан шат</SelectItem>
                        <SelectItem value="intermediate">Дунд шат</SelectItem>
                        <SelectItem value="advanced">Ахисан шат</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Хэл</Label>
                    <Input
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      placeholder="Хэл"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount">Хөнгөлөлт (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="Хөнгөлөлт"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Шошго (таслалаар тусгаарлана)</Label>
                    <Input
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="marketing, social media, facebook"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
                  <Label htmlFor="featured">Онцлох хичээл</Label>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Шаардлагууд</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
                      <Plus className="mr-2 h-4 w-4" />
                      Шаардлага нэмэх
                    </Button>
                  </div>

                  {requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={requirement}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        placeholder="Хичээлийн шаардлага"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeRequirement(index)}
                        disabled={requirements.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Үр дүн</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addOutcome}>
                      <Plus className="mr-2 h-4 w-4" />
                      Үр дүн нэмэх
                    </Button>
                  </div>

                  {outcomes.map((outcome, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={outcome}
                        onChange={(e) => updateOutcome(index, e.target.value)}
                        placeholder="Хичээлийн үр дүн"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeOutcome(index)}
                        disabled={outcomes.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Instructor Tab */}
          <TabsContent value="instructor">
            <Card>
              <CardHeader>
                <CardTitle>Багшийн мэдээлэл</CardTitle>
                <CardDescription>Хичээл заах багшийн мэдээллийг оруулна уу</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instructorName">Нэр</Label>
                  <Input
                    id="instructorName"
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    placeholder="Багшийн нэр"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructorBio">Намтар</Label>
                  <Textarea
                    id="instructorBio"
                    value={instructorBio}
                    onChange={(e) => setInstructorBio(e.target.value)}
                    placeholder="Багшийн намтар"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructorExpertise">Мэргэшил (таслалаар тусгаарлана)</Label>
                  <Input
                    id="instructorExpertise"
                    value={instructorExpertise}
                    onChange={(e) => setInstructorExpertise(e.target.value)}
                    placeholder="Marketing, Social Media, Content Creation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructorAvatar">Зураг</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("instructorAvatar")?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Зураг сонгох
                    </Button>
                    <Input
                      id="instructorAvatar"
                      type="file"
                      accept="image/*"
                      onChange={handleInstructorAvatarChange}
                      className="hidden"
                    />
                    {instructorAvatar && (
                      <div className="relative w-24 h-24">
                        <img
                          src={instructorAvatar || "/placeholder.svg"}
                          alt="Instructor Avatar"
                          className="w-full h-full object-cover rounded-full"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => setInstructorAvatar(null)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lessons Tab */}
          <TabsContent value="lessons">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Хичээлүүд</h2>
                <Button type="button" onClick={addLesson}>
                  <Plus className="mr-2 h-4 w-4" />
                  Хичээл нэмэх
                </Button>
              </div>

              {lessons.map((lesson, lessonIndex) => (
                <Card key={lesson.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Хичээл {lessonIndex + 1}</CardTitle>
                      {lessons.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeLesson(lessonIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`lesson-title-${lessonIndex}`}>Гарчиг</Label>
                        <Input
                          id={`lesson-title-${lessonIndex}`}
                          value={lesson.title}
                          onChange={(e) => updateLesson(lessonIndex, "title", e.target.value)}
                          placeholder="Хичээлийн нэр"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`lesson-duration-${lessonIndex}`}>Үргэлжлэх хугацаа (минут)</Label>
                        <Input
                          id={`lesson-duration-${lessonIndex}`}
                          type="number"
                          value={lesson.duration || ""}
                          onChange={(e) => updateLesson(lessonIndex, "duration", Number(e.target.value))}
                          placeholder="Хугацаа"
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`lesson-description-${lessonIndex}`}>Тайлбар</Label>
                      <Textarea
                        id={`lesson-description-${lessonIndex}`}
                        value={lesson.description}
                        onChange={(e) => updateLesson(lessonIndex, "description", e.target.value)}
                        placeholder="Хичээлийн тайлбар"
                        rows={2}
                        required
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-md font-medium">Контент</h3>
                        <Button type="button" variant="outline" size="sm" onClick={() => addContent(lessonIndex)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Контент нэмэх
                        </Button>
                      </div>

                      {lesson.contents?.map((content, contentIndex) => (
                        <div key={content.id} className="border rounded-md p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Контент {contentIndex + 1}</h4>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => removeContent(lessonIndex, contentIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`content-title-${lessonIndex}-${contentIndex}`}>Гарчиг</Label>
                            <Input
                              id={`content-title-${lessonIndex}-${contentIndex}`}
                              value={content.title}
                              onChange={(e) => updateContent(lessonIndex, contentIndex, "title", e.target.value)}
                              placeholder="Контентын нэр"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`content-type-${lessonIndex}-${contentIndex}`}>Төрөл</Label>
                            <Select
                              value={content.type}
                              onValueChange={(value) => updateContent(lessonIndex, contentIndex, "type", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Төрөл сонгох" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Текст</SelectItem>
                                <SelectItem value="image">Зураг</SelectItem>
                                <SelectItem value="video">Видео</SelectItem>
                                <SelectItem value="file">Файл</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {content.type === "text" ? (
                            <div className="space-y-2">
                              <Label htmlFor={`content-data-${lessonIndex}-${contentIndex}`}>Агуулга</Label>
                              <Textarea
                                id={`content-data-${lessonIndex}-${contentIndex}`}
                                value={content.data}
                                onChange={(e) => updateContent(lessonIndex, contentIndex, "data", e.target.value)}
                                placeholder="Текст агуулга"
                                rows={4}
                                required
                              />
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Label htmlFor={`content-file-${lessonIndex}-${contentIndex}`}>Файл</Label>
                              <div className="flex items-center gap-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    document.getElementById(`content-file-${lessonIndex}-${contentIndex}`)?.click()
                                  }
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  Файл сонгох
                                </Button>
                                <Input
                                  id={`content-file-${lessonIndex}-${contentIndex}`}
                                  type="file"
                                  accept={
                                    content.type === "image" ? "image/*" : content.type === "video" ? "video/*" : "*/*"
                                  }
                                  onChange={(e) => handleContentFileChange(lessonIndex, contentIndex, e)}
                                  className="hidden"
                                />
                                {content.data && (
                                  <div className="text-sm text-muted-foreground">
                                    {content.type === "image" && "Зураг сонгогдсон"}
                                    {content.type === "video" && "Видео сонгогдсон"}
                                    {content.type === "file" && "Файл сонгогдсон"}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {(!lesson.contents || lesson.contents.length === 0) && (
                        <div className="text-center py-4 border rounded-md">
                          <p className="text-muted-foreground">Контент байхгүй байна</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => addContent(lessonIndex)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Контент нэмэх
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                Устгах
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Хичээл устгах</AlertDialogTitle>
                <AlertDialogDescription>
                  Та энэ хичээлийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={async () => {
                    if (!db) return
                    try {
                      const courseRef = ref(db, `courses/${courseId}`)
                      await update(courseRef, null)
                      toast({
                        title: "Амжилттай",
                        description: "Хичээл амжилттай устгагдлаа",
                      })
                      router.push("/admin/courses")
                    } catch (error) {
                      console.error("Error deleting course:", error)
                      toast({
                        title: "Алдаа",
                        description: "Хичээл устгахад алдаа гарлаа",
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  Устгах
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button type="button" variant="outline" onClick={() => router.push("/admin/courses")}>
            Цуцлах
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </div>
      </form>
    </div>
  )
}
