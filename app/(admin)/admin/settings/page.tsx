"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { ref, get, set } from "firebase/database"
import { Skeleton } from "@/components/ui/skeleton"
import AdminHeader from "@/components/admin/admin-header"
import AdminFooter from "@/components/admin/admin-footer"
import type { Testimonial } from "@/lib/types"
import type { Course } from "@/lib/types"
import { ImageUpload } from "@/components/image-upload"

export default function SettingsPage() {
  const { toast } = useToast()
  const { db, connectionStatus } = useFirebase()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Site settings
  const [siteName, setSiteName] = useState("")
  const [siteDescription, setSiteDescription] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [address, setAddress] = useState("")

  // Social media
  const [facebook, setFacebook] = useState("")
  const [instagram, setInstagram] = useState("")
  const [twitter, setTwitter] = useState("")
  const [youtube, setYoutube] = useState("")
  const [linkedin, setLinkedin] = useState("")

  // Features
  const [enableBlog, setEnableBlog] = useState(true)
  const [enableTestimonials, setEnableTestimonials] = useState(true)
  const [enableChat, setEnableChat] = useState(true)
  const [enableWishlist, setEnableWishlist] = useState(true)
  const [enableLeaderboard, setEnableLeaderboard] = useState(true)

  // Payment settings
  const [currency, setCurrency] = useState("MNT")
  const [enableBank, setEnableBank] = useState(true)
  const [enableCard, setEnableCard] = useState(true)
  const [enableQPay, setEnableQPay] = useState(true)
  const [bankDetails, setBankDetails] = useState("")

  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [newTestimonial, setNewTestimonial] = useState<Partial<Testimonial>>({
    name: "",
    role: "",
    company: "",
    testimonial: "",
    avatar: "",
    rating: 5,
    isActive: true,
  })
  const [editingTestimonial, setEditingTestimonial] = useState<string | null>(null)
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false)

  // State for featured courses
  const [featuredCourses, setFeaturedCourses] = useState<string[]>([])
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)

  // Fetch testimonials
  const fetchTestimonials = async () => {
    if (!db) return

    try {
      const settingsRef = ref(db, "settings")
      const snapshot = await get(settingsRef)

      if (snapshot.exists()) {
        const data = snapshot.val()
        if (data.testimonials) {
          setTestimonials(data.testimonials)
        }
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      toast({
        title: "Алдаа",
        description: "Суралцагчдын сэтгэгдэл дуудахад алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  // Fetch courses
  const fetchCourses = async () => {
    if (!db) return

    setLoadingCourses(true)
    try {
      // Fetch all courses
      const coursesRef = ref(db, "courses")
      const snapshot = await get(coursesRef)

      if (snapshot.exists()) {
        const coursesData = snapshot.val()
        const courses: Course[] = []

        Object.entries(coursesData).forEach(([id, data]) => {
          courses.push({
            id,
            ...(data as any),
          })
        })

        setAvailableCourses(courses)
      }

      // Fetch featured courses from settings
      const settingsRef = ref(db, "settings")
      const settingsSnapshot = await get(settingsRef)

      if (settingsSnapshot.exists()) {
        const data = settingsSnapshot.val()
        if (data.featuredCourses) {
          setFeaturedCourses(data.featuredCourses)
        }
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast({
        title: "Алдаа",
        description: "Хичээлүүд дуудахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setLoadingCourses(false)
    }
  }

  useEffect(() => {
    const loadSettings = async () => {
      if (connectionStatus !== "connected" || !db) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const settingsRef = ref(db, "settings")
        const snapshot = await get(settingsRef)

        if (snapshot.exists()) {
          const data = snapshot.val()

          // Site settings
          setSiteName(data.siteName || "")
          setSiteDescription(data.siteDescription || "")
          setLogoUrl(data.logoUrl || "")
          setContactEmail(data.contactEmail || "")
          setContactPhone(data.contactPhone || "")
          setAddress(data.address || "")

          // Social media
          setFacebook(data.facebook || "")
          setInstagram(data.instagram || "")
          setTwitter(data.twitter || "")
          setYoutube(data.youtube || "")
          setLinkedin(data.linkedin || "")

          // Features
          setEnableBlog(data.enableBlog !== false)
          setEnableTestimonials(data.enableTestimonials !== false)
          setEnableChat(data.enableChat !== false)
          setEnableWishlist(data.enableWishlist !== false)
          setEnableLeaderboard(data.enableLeaderboard !== false)

          // Payment settings
          setCurrency(data.currency || "MNT")
          setEnableBank(data.enableBank !== false)
          setEnableCard(data.enableCard !== false)
          setEnableQPay(data.enableQPay !== false)
          setBankDetails(data.bankDetails || "")
        }
      } catch (error) {
        console.error("Error loading settings:", error)
        toast({
          title: "Алдаа гарлаа",
          description: "Тохиргоог ачаалахад алдаа гарлаа. Дахин оролдоно уу.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [db, connectionStatus, toast])

  useEffect(() => {
    if (db) {
      fetchTestimonials()
      fetchCourses()
    }
  }, [db])

  // Handle logo upload
  const handleLogoUploaded = (imageData: string) => {
    setLogoUrl(imageData)
  }

  // Add testimonial
  const handleAddTestimonial = async () => {
    if (!db) return

    try {
      const newId = Date.now().toString()
      const newTestimonialData: Testimonial = {
        id: newId,
        name: newTestimonial.name || "",
        role: newTestimonial.role || "",
        company: newTestimonial.company || "",
        testimonial: newTestimonial.testimonial || "",
        avatar: newTestimonial.avatar || "",
        rating: newTestimonial.rating || 5,
        isActive: newTestimonial.isActive !== undefined ? newTestimonial.isActive : true,
        createdAt: Date.now(),
      }

      const updatedTestimonials = [...testimonials, newTestimonialData]

      // Update settings in database
      const settingsRef = ref(db, "settings")
      const snapshot = await get(settingsRef)

      if (snapshot.exists()) {
        const currentSettings = snapshot.val()
        await set(settingsRef, {
          ...currentSettings,
          testimonials: updatedTestimonials,
        })

        setTestimonials(updatedTestimonials)
        setNewTestimonial({
          name: "",
          role: "",
          company: "",
          testimonial: "",
          avatar: "",
          rating: 5,
          isActive: true,
        })
        setIsAddingTestimonial(false)

        toast({
          title: "Амжилттай",
          description: "Суралцагчийн сэтгэгдэл нэмэгдлээ",
        })
      }
    } catch (error) {
      console.error("Error adding testimonial:", error)
      toast({
        title: "Алдаа",
        description: "Суралцагчийн сэтгэгдэл нэмэхэд алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  // Update testimonial
  const handleUpdateTestimonial = async (id: string) => {
    if (!db) return

    try {
      const updatedTestimonials = testimonials.map((t) => (t.id === id ? { ...t, ...newTestimonial, id } : t))

      // Update settings in database
      const settingsRef = ref(db, "settings")
      const snapshot = await get(settingsRef)

      if (snapshot.exists()) {
        const currentSettings = snapshot.val()
        await set(settingsRef, {
          ...currentSettings,
          testimonials: updatedTestimonials,
        })

        setTestimonials(updatedTestimonials)
        setEditingTestimonial(null)
        setNewTestimonial({
          name: "",
          role: "",
          company: "",
          testimonial: "",
          avatar: "",
          rating: 5,
          isActive: true,
        })

        toast({
          title: "Амжилттай",
          description: "Суралцагчийн сэтгэгдэл шинэчлэгдлээ",
        })
      }
    } catch (error) {
      console.error("Error updating testimonial:", error)
      toast({
        title: "Алдаа",
        description: "Суралцагчийн сэтгэгдэл шинэчлэхэд алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  // Delete testimonial
  const handleDeleteTestimonial = async (id: string) => {
    if (!db) return

    try {
      const updatedTestimonials = testimonials.filter((t) => t.id !== id)

      // Update settings in database
      const settingsRef = ref(db, "settings")
      const snapshot = await get(settingsRef)

      if (snapshot.exists()) {
        const currentSettings = snapshot.val()
        await set(settingsRef, {
          ...currentSettings,
          testimonials: updatedTestimonials,
        })

        setTestimonials(updatedTestimonials)

        toast({
          title: "Амжилттай",
          description: "Суралцагчийн сэтгэгдэл устгагдлаа",
        })
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error)
      toast({
        title: "Алдаа",
        description: "Суралцагчийн сэтгэгдэл устгахад алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  // Toggle testimonial status
  const handleToggleTestimonialStatus = async (id: string) => {
    if (!db) return

    try {
      const updatedTestimonials = testimonials.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t))

      // Update settings in database
      const settingsRef = ref(db, "settings")
      const snapshot = await get(settingsRef)

      if (snapshot.exists()) {
        const currentSettings = snapshot.val()
        await set(settingsRef, {
          ...currentSettings,
          testimonials: updatedTestimonials,
        })

        setTestimonials(updatedTestimonials)

        toast({
          title: "Амжилттай",
          description: "Суралцагчийн сэтгэгдлийн төлөв шинэчлэгдлээ",
        })
      }
    } catch (error) {
      console.error("Error toggling testimonial status:", error)
      toast({
        title: "Алдаа",
        description: "Суралцагчийн сэтгэгдлийн төлөв шинэчлэхэд алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  // Toggle featured course
  const handleToggleFeaturedCourse = async (courseId: string) => {
    if (!db) return

    try {
      let updatedFeaturedCourses: string[]

      if (featuredCourses.includes(courseId)) {
        // Remove from featured
        updatedFeaturedCourses = featuredCourses.filter((id) => id !== courseId)
      } else {
        // Add to featured
        updatedFeaturedCourses = [...featuredCourses, courseId]
      }

      // Update settings in database
      const settingsRef = ref(db, "settings")
      const snapshot = await get(settingsRef)

      if (snapshot.exists()) {
        const currentSettings = snapshot.val()
        await set(settingsRef, {
          ...currentSettings,
          featuredCourses: updatedFeaturedCourses,
        })

        setFeaturedCourses(updatedFeaturedCourses)

        toast({
          title: "Амжилттай",
          description: featuredCourses.includes(courseId)
            ? "Хичээл онцлох жагсаалтаас хасагдлаа"
            : "Хичээл онцлох жагсаалтад нэмэгдлээ",
        })
      }
    } catch (error) {
      console.error("Error updating featured courses:", error)
      toast({
        title: "Алдаа",
        description: "Онцлох хичээлүүдийг шинэчлэхэд алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  // saveSettings функцийг шинэчлэх
  const saveSettings = async () => {
    if (connectionStatus !== "connected" || !db) {
      toast({
        title: "Холболт байхгүй байна",
        description: "Firebase-тэй холбогдоогүй байна. Дахин оролдоно уу.",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      const settingsRef = ref(db, "siteSettings") // siteSettings гэсэн замд хадгална

      const settingsData = {
        // Site settings
        siteName,
        siteDescription,
        logoUrl, // Make sure logoUrl is included
        contactEmail,
        contactPhone,
        address,

        // Social media
        facebook,
        instagram,
        twitter,
        youtube,
        linkedin,

        // Features
        enableBlog,
        enableTestimonials,
        enableChat,
        enableWishlist,
        enableLeaderboard,

        // Payment settings
        currency,
        enableBank,
        enableCard,
        enableQPay,
        bankDetails,

        // Add updated timestamp
        updatedAt: new Date().toISOString(),
      }

      console.log("Saving settings:", settingsData) // Debug: Хадгалж буй өгөгдлийг шалгах
      await set(settingsRef, settingsData)

      toast({
        title: "Амжилттай хадгаллаа",
        description: "Сайтын тохиргоог амжилттай хадгаллаа.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Тохиргоог хадгалахад алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (connectionStatus !== "connected") {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Firebase-тэй холбогдож чадсангүй</h2>
            <p className="mb-4">Дахин холбогдохыг оролдоно уу.</p>
          </div>
        </div>
        <AdminFooter />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Сайтын тохиргоо</h1>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Ерөнхий</TabsTrigger>
            <TabsTrigger value="social">Сошиал медиа</TabsTrigger>
            <TabsTrigger value="features">Боломжууд</TabsTrigger>
            <TabsTrigger value="payment">Төлбөр</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Ерөнхий мэдээлэл</CardTitle>
                <CardDescription>Сайтын үндсэн мэдээллийг тохируулна.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[120px]" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Сайтын нэр</Label>
                      <Input
                        id="siteName"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        placeholder="MarketingClass.mn"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteDescription">Сайтын тайлбар</Label>
                      <Textarea
                        id="siteDescription"
                        value={siteDescription}
                        onChange={(e) => setSiteDescription(e.target.value)}
                        placeholder="Маркетингийн сургалтын платформ"
                        rows={4}
                      />
                    </div>

                    {/* Сайтын лого оруулах хэсэг */}
                    <div className="space-y-2">
                      <Label>Сайтын лого</Label>
                      <ImageUpload
                        label="Сайтын лого оруулах"
                        currentImageUrl={logoUrl}
                        onImageUploaded={handleLogoUploaded}
                        folder="logos"
                      />
                      {logoUrl && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground mb-1">Одоогийн лого:</p>
                          <div className="border rounded-md p-2 w-40 h-auto">
                            <img
                              src={logoUrl || "/placeholder.svg"}
                              alt="Сайтын лого"
                              className="max-h-20 object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Холбоо барих имэйл</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="info@marketingclass.mn"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Холбоо барих утас</Label>
                      <Input
                        id="contactPhone"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+976 99112233"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Хаяг</Label>
                      <Textarea
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Улаанбаатар хот, Сүхбаатар дүүрэг"
                        rows={3}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Сошиал медиа</CardTitle>
                <CardDescription>Сошиал медиа хаягуудаа тохируулна.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                        placeholder="https://facebook.com/marketingclass.mn"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="https://instagram.com/marketingclass.mn"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        placeholder="https://twitter.com/marketingclass"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtube">YouTube</Label>
                      <Input
                        id="youtube"
                        value={youtube}
                        onChange={(e) => setYoutube(e.target.value)}
                        placeholder="https://youtube.com/c/marketingclass"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/company/marketingclass"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Боломжууд</CardTitle>
                <CardDescription>Сайтын боломжуудыг идэвхжүүлэх эсвэл идэвхгүй болгох.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  <>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-[180px]" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableBlog">Блог</Label>
                        <p className="text-sm text-muted-foreground">Блогийн хэсгийг идэвхжүүлэх</p>
                      </div>
                      <Switch id="enableBlog" checked={enableBlog} onCheckedChange={setEnableBlog} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableTestimonials">Сэтгэгдлүүд</Label>
                        <p className="text-sm text-muted-foreground">Хэрэглэгчдийн сэтгэгдлийн хэсгийг идэвхжүүлэх</p>
                      </div>
                      <Switch
                        id="enableTestimonials"
                        checked={enableTestimonials}
                        onCheckedChange={setEnableTestimonials}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableChat">Чат</Label>
                        <p className="text-sm text-muted-foreground">Хэрэглэгчдийн чатын боломжийг идэвхжүүлэх</p>
                      </div>
                      <Switch id="enableChat" checked={enableChat} onCheckedChange={setEnableChat} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableWishlist">Хүслийн жагсаалт</Label>
                        <p className="text-sm text-muted-foreground">Хүслийн жагсаалтын боломжийг идэвхжүүлэх</p>
                      </div>
                      <Switch id="enableWishlist" checked={enableWishlist} onCheckedChange={setEnableWishlist} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableLeaderboard">Тэргүүлэгчдийн самбар</Label>
                        <p className="text-sm text-muted-foreground">Тэргүүлэгчдийн самбарыг идэвхжүүлэх</p>
                      </div>
                      <Switch
                        id="enableLeaderboard"
                        checked={enableLeaderboard}
                        onCheckedChange={setEnableLeaderboard}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Төлбөрийн тохиргоо</CardTitle>
                <CardDescription>Төлбөрийн аргуудыг тохируулна.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  <>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Валют</Label>
                      <Input
                        id="currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        placeholder="MNT"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableBank">Банкаар шилжүүлэх</Label>
                        <p className="text-sm text-muted-foreground">Банкаар шилжүүлэх төлбөрийн аргыг идэвхжүүлэх</p>
                      </div>
                      <Switch id="enableBank" checked={enableBank} onCheckedChange={setEnableBank} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableCard">Картаар төлөх</Label>
                        <p className="text-sm text-muted-foreground">Картаар төлөх төлбөрийн аргыг идэвхжүүлэх</p>
                      </div>
                      <Switch id="enableCard" checked={enableCard} onCheckedChange={setEnableCard} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableQPay">QPay</Label>
                        <p className="text-sm text-muted-foreground">QPay төлбөрийн аргыг идэвхжүүлэх</p>
                      </div>
                      <Switch id="enableQPay" checked={enableQPay} onCheckedChange={setEnableQPay} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankDetails">Банкны мэдээлэл</Label>
                      <Textarea
                        id="bankDetails"
                        value={bankDetails}
                        onChange={(e) => setBankDetails(e.target.value)}
                        placeholder="Банкны нэр: Голомт банк&#10;Дансны дугаар: 1234567890&#10;Хүлээн авагч: Маркетинг Класс ХХК"
                        rows={5}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <AdminFooter />
    </div>
  )
}
