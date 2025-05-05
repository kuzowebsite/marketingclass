"use client"

import { useState, useEffect } from "react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Star, Trash, Edit, Plus, Check, X, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { TestimonialsService } from "@/lib/testimonials-service"
import { ImageUpload } from "@/components/image-upload"
import AdminHeader from "@/components/admin/admin-header"
import AdminFooter from "@/components/admin/admin-footer"
import type { Testimonial } from "@/lib/types"

export default function TestimonialsPage() {
  const { toast } = useToast()
  const { app } = useFirebase()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false)
  const [isEditingTestimonial, setIsEditingTestimonial] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [company, setCompany] = useState("")
  const [testimonialText, setTestimonialText] = useState("")
  const [rating, setRating] = useState(5)
  const [avatar, setAvatar] = useState("")
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    fetchTestimonials()
  }, [app])

  const fetchTestimonials = async () => {
    if (!app) return

    try {
      setLoading(true)
      const fetchedTestimonials = await TestimonialsService.getTestimonials(app)
      setTestimonials(fetchedTestimonials)
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      toast({
        title: "Алдаа",
        description: "Сэтгэгдлүүдийг ачаалахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName("")
    setRole("")
    setCompany("")
    setTestimonialText("")
    setRating(5)
    setAvatar("")
    setIsActive(true)
  }

  const handleAddTestimonial = async () => {
    if (!app) return

    if (!name || !role || !company || !testimonialText) {
      toast({
        title: "Талбаруудыг бөглөнө үү",
        description: "Бүх шаардлагатай талбаруудыг бөглөнө үү",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const newTestimonial: Omit<Testimonial, "id"> = {
        name,
        role,
        company,
        testimonial: testimonialText,
        rating,
        avatar,
        isActive,
        createdAt: Date.now(),
      }

      await TestimonialsService.addTestimonial(app, newTestimonial)
      toast({
        title: "Амжилттай",
        description: "Сэтгэгдэл амжилттай нэмэгдлээ",
      })
      resetForm()
      setIsAddingTestimonial(false)
      fetchTestimonials()
    } catch (error) {
      console.error("Error adding testimonial:", error)
      toast({
        title: "Алдаа",
        description: "Сэтгэгдэл нэмэхэд алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setIsEditingTestimonial(testimonial.id)
    setName(testimonial.name)
    setRole(testimonial.role)
    setCompany(testimonial.company)
    setTestimonialText(testimonial.testimonial)
    setRating(testimonial.rating)
    setAvatar(testimonial.avatar || "")
    setIsActive(testimonial.isActive)
  }

  const handleUpdateTestimonial = async () => {
    if (!app || !isEditingTestimonial) return

    if (!name || !role || !company || !testimonialText) {
      toast({
        title: "Талбаруудыг бөглөнө үү",
        description: "Бүх шаардлагатай талбаруудыг бөглөнө үү",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const updatedTestimonial: Testimonial = {
        id: isEditingTestimonial,
        name,
        role,
        company,
        testimonial: testimonialText,
        rating,
        avatar,
        isActive,
        createdAt: testimonials.find((t) => t.id === isEditingTestimonial)?.createdAt || Date.now(),
      }

      await TestimonialsService.updateTestimonial(app, updatedTestimonial)
      toast({
        title: "Амжилттай",
        description: "Сэтгэгдэл амжилттай шинэчлэгдлээ",
      })
      resetForm()
      setIsEditingTestimonial(null)
      fetchTestimonials()
    } catch (error) {
      console.error("Error updating testimonial:", error)
      toast({
        title: "Алдаа",
        description: "Сэтгэгдэл шинэчлэхэд алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTestimonial = async (id: string) => {
    if (!app) return

    if (!confirm("Та энэ сэтгэгдлийг устгахдаа итгэлтэй байна уу?")) {
      return
    }

    try {
      await TestimonialsService.deleteTestimonial(app, id)
      toast({
        title: "Амжилттай",
        description: "Сэтгэгдэл амжилттай устгагдлаа",
      })
      fetchTestimonials()
    } catch (error) {
      console.error("Error deleting testimonial:", error)
      toast({
        title: "Алдаа",
        description: "Сэтгэгдэл устгахад алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (!app) return

    try {
      await TestimonialsService.toggleTestimonialStatus(app, id, !currentStatus)
      toast({
        title: "Амжилттай",
        description: `Сэтгэгдэл ${!currentStatus ? "идэвхжүүллээ" : "идэвхгүй болголоо"}`,
      })
      fetchTestimonials()
    } catch (error) {
      console.error("Error toggling testimonial status:", error)
      toast({
        title: "Алдаа",
        description: "Сэтгэгдлийн төлөвийг өөрчлөхөд алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  const handleImageUploaded = (imageUrl: string) => {
    setAvatar(imageUrl)
  }

  const renderForm = () => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{isEditingTestimonial ? "Сэтгэгдэл засах" : "Шинэ сэтгэгдэл нэмэх"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Нэр</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Б. Болормаа" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Албан тушаал</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Маркетингийн менежер"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Компани</Label>
          <Input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Digital Solutions LLC"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="testimonial">Сэтгэгдэл</Label>
          <Textarea
            id="testimonial"
            value={testimonialText}
            onChange={(e) => setTestimonialText(e.target.value)}
            placeholder="Энэ сургалт надад маш их тусалсан..."
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label>Үнэлгээ</Label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-6 w-6 cursor-pointer ${
                  star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Зураг</Label>
          <ImageUpload
            label="Зураг оруулах"
            currentImageUrl={avatar}
            onImageUploaded={handleImageUploaded}
            folder="testimonials"
          />
          {avatar && (
            <div className="mt-2">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatar || "/placeholder.svg"} alt="Preview" />
                <AvatarFallback>{name.substring(0, 2)}</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
          <Label htmlFor="isActive">Идэвхтэй</Label>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={isEditingTestimonial ? handleUpdateTestimonial : handleAddTestimonial}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Хадгалж байна...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {isEditingTestimonial ? "Шинэчлэх" : "Нэмэх"}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              resetForm()
              setIsEditingTestimonial(null)
              setIsAddingTestimonial(false)
            }}
          >
            <X className="mr-2 h-4 w-4" />
            Цуцлах
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-10">
      <AdminHeader />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Сэтгэгдлүүд</h1>
          {!isAddingTestimonial && !isEditingTestimonial && (
            <Button onClick={() => setIsAddingTestimonial(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Шинэ сэтгэгдэл
            </Button>
          )}
        </div>

        {(isAddingTestimonial || isEditingTestimonial) && renderForm()}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="ml-4">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Одоогоор сэтгэгдэл байхгүй байна.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className={!testimonial.isActive ? "opacity-60" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Avatar>
                        {testimonial.avatar ? (
                          <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                        ) : (
                          <AvatarFallback>{testimonial.name.substring(0, 2)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="ml-4">
                        <h3 className="font-semibold">{testimonial.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {testimonial.role}, {testimonial.company}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditTestimonial(testimonial)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTestimonial(testimonial.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="mb-4 text-gray-700 dark:text-gray-300">{testimonial.testimonial}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < testimonial.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`active-${testimonial.id}`}
                        checked={testimonial.isActive}
                        onCheckedChange={() => handleToggleStatus(testimonial.id, testimonial.isActive)}
                      />
                      <Label htmlFor={`active-${testimonial.id}`} className="text-sm">
                        {testimonial.isActive ? "Идэвхтэй" : "Идэвхгүй"}
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <AdminFooter />
    </div>
  )
}
