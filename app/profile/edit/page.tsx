"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { ref as dbRef, get, update } from "firebase/database"
import { updateProfile } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowLeft,
  Loader2,
  Save,
  User,
  Upload,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
} from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfileEditPage() {
  const { user, auth, db } = useFirebase()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    phone: "",
    profileImageBase64: "", // Store base64 image in database
    socialMedia: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
      youtube: "",
      website: "",
    },
  })

  // Generate avatar URL for Firebase Auth (not the actual image)
  const generateAvatarUrl = (name) => {
    const initials = name ? name.charAt(0).toUpperCase() : "U"
    // Using DiceBear API to generate avatar
    return `https://api.dicebear.com/7.x/initials/svg?seed=${initials}`
  }

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !db) {
        setLoading(false)
        return
      }

      try {
        // Fetch user data from Firebase Realtime Database
        const userRef = dbRef(db, `users/${user.uid}`)
        const snapshot = await get(userRef)

        if (snapshot.exists()) {
          const userData = snapshot.val()
          setFormData({
            displayName: userData.displayName || user.displayName || "",
            bio: userData.bio || "",
            phone: userData.phone || "",
            profileImageBase64: userData.profileImageBase64 || "",
            socialMedia: userData.socialMedia || {
              facebook: "",
              twitter: "",
              instagram: "",
              linkedin: "",
              youtube: "",
              website: "",
            },
          })
        } else {
          // If no user data exists in the database, use auth user data
          setFormData({
            displayName: user.displayName || "",
            bio: "",
            phone: "",
            profileImageBase64: "",
            socialMedia: {
              facebook: "",
              twitter: "",
              instagram: "",
              linkedin: "",
              youtube: "",
              website: "",
            },
          })
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast({
          title: "Алдаа",
          description: "Хэрэглэгчийн мэдээлэл авахад алдаа гарлаа",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user, db, toast])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [name]: value,
      },
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file size (limit to 1MB for database storage)
    if (file.size > 1 * 1024 * 1024) {
      toast({
        title: "Алдаа",
        description: "Зургийн хэмжээ 1MB-ээс хэтрэхгүй байх ёстой",
        variant: "destructive",
      })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Алдаа",
        description: "Зөвхөн зураг оруулах боломжтой",
        variant: "destructive",
      })
      return
    }

    try {
      setUploadingImage(true)

      // Convert image to base64
      const base64 = await convertImageToBase64(file)

      // Resize and compress the image
      const compressedBase64 = await resizeAndCompressImage(base64, 300, 300, 0.7)

      // Update the form data
      setFormData((prev) => ({ ...prev, profileImageBase64: compressedBase64 }))

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
      setUploadingImage(false)
    }
  }

  // Convert file to base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file)
    })
  }

  // Resize and compress image
  const resizeAndCompressImage = (base64, maxWidth, maxHeight, quality) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = base64
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }

        // Create canvas and resize
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height

        // Draw and compress
        const ctx = canvas.getContext("2d")
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to base64 with compression
        resolve(canvas.toDataURL("image/jpeg", quality))
      }
      img.onerror = reject
    })
  }

  // Validate social media URLs
  const validateSocialMediaUrls = () => {
    const { socialMedia } = formData
    const errors = []

    // Helper function to validate URL format
    const isValidUrl = (url) => {
      if (!url) return true // Empty URLs are valid (optional fields)
      try {
        new URL(url)
        return true
      } catch (e) {
        return false
      }
    }

    // Check each social media URL
    if (socialMedia.facebook && !isValidUrl(socialMedia.facebook)) {
      errors.push("Facebook URL буруу форматтай байна")
    }
    if (socialMedia.twitter && !isValidUrl(socialMedia.twitter)) {
      errors.push("Twitter URL буруу форматтай байна")
    }
    if (socialMedia.instagram && !isValidUrl(socialMedia.instagram)) {
      errors.push("Instagram URL буруу форматтай байна")
    }
    if (socialMedia.linkedin && !isValidUrl(socialMedia.linkedin)) {
      errors.push("LinkedIn URL буруу форматтай байна")
    }
    if (socialMedia.youtube && !isValidUrl(socialMedia.youtube)) {
      errors.push("YouTube URL буруу форматтай байна")
    }
    if (socialMedia.website && !isValidUrl(socialMedia.website)) {
      errors.push("Вэбсайт URL буруу форматтай байна")
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user || !auth || !db) {
      toast({
        title: "Алдаа",
        description: "Та нэвтрээгүй байна",
        variant: "destructive",
      })
      return
    }

    // Validate social media URLs
    const urlErrors = validateSocialMediaUrls()
    if (urlErrors.length > 0) {
      toast({
        title: "Алдаа",
        description: urlErrors.join(", "),
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      // Generate avatar URL for Firebase Auth
      const avatarUrl = generateAvatarUrl(formData.displayName)

      // Update user profile in Firebase Authentication with avatar URL
      await updateProfile(user, {
        displayName: formData.displayName,
        photoURL: avatarUrl, // Use generated avatar URL, not the base64 image
      })

      // Update user data in Firebase Realtime Database
      const userRef = dbRef(db, `users/${user.uid}`)
      await update(userRef, {
        displayName: formData.displayName,
        bio: formData.bio,
        phone: formData.phone,
        profileImageBase64: formData.profileImageBase64, // Store base64 image in database
        photoURL: avatarUrl, // Also store the avatar URL
        socialMedia: formData.socialMedia, // Store social media links
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Амжилттай",
        description: "Таны профайл амжилттай шинэчлэгдлээ",
      })

      // Redirect to profile page
      router.push("/profile")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Алдаа",
        description: `Профайл шинэчлэхэд алдаа гарлаа: ${error.message || "Тодорхойгүй алдаа"}`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Нэвтрээгүй байна</h1>
        <p className="mb-8">Профайл засах хуудсыг харахын тулд нэвтэрнэ үү.</p>
        <Link href="/auth/login">
          <Button size="lg">Нэвтрэх</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="icon" asChild className="mr-4">
            <Link href="/profile">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Профайл засах</h1>
        </div>

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Ачааллаж байна...</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Хувийн мэдээлэл</CardTitle>
                <CardDescription>Профайлын мэдээллээ шинэчилнэ үү</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="personal">Хувийн мэдээлэл</TabsTrigger>
                    <TabsTrigger value="social">Нийгмийн сүлжээ</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-6 mt-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-1/3">
                        <div className="flex flex-col items-center space-y-4">
                          <Avatar className="w-32 h-32">
                            {formData.profileImageBase64 ? (
                              <AvatarImage src={formData.profileImageBase64 || "/placeholder.svg"} />
                            ) : (
                              <AvatarFallback className="bg-primary/10 text-primary text-4xl">
                                {formData.displayName?.charAt(0) || user.email?.charAt(0) || <User />}
                              </AvatarFallback>
                            )}
                          </Avatar>

                          <div className="w-full">
                            <Label htmlFor="photo" className="block mb-2 text-center">
                              Профайл зураг
                            </Label>
                            <div className="relative">
                              <Input
                                id="photo"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => document.getElementById("photo").click()}
                                disabled={uploadingImage}
                              >
                                {uploadingImage ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Оруулж байна...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Зураг оруулах
                                  </>
                                )}
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                              Зөвлөмж: 1MB-ээс бага хэмжээтэй зураг
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="w-full md:w-2/3 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="displayName">Нэр</Label>
                          <Input
                            id="displayName"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            placeholder="Таны нэр"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">И-мэйл</Label>
                          <Input id="email" type="email" value={user.email || ""} disabled className="bg-muted" />
                          <p className="text-xs text-muted-foreground">И-мэйл хаягийг өөрчлөх боломжгүй</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Утасны дугаар</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Утасны дугаар"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="bio">Тайлбар</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Өөрийн тухай товч танилцуулга"
                        rows={4}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="social" className="space-y-4 mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Facebook className="h-5 w-5 text-blue-600" />
                        <div className="w-full space-y-2">
                          <Label htmlFor="facebook">Facebook</Label>
                          <Input
                            id="facebook"
                            name="facebook"
                            value={formData.socialMedia.facebook}
                            onChange={handleSocialMediaChange}
                            placeholder="https://facebook.com/username"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Twitter className="h-5 w-5 text-blue-400" />
                        <div className="w-full space-y-2">
                          <Label htmlFor="twitter">Twitter / X</Label>
                          <Input
                            id="twitter"
                            name="twitter"
                            value={formData.socialMedia.twitter}
                            onChange={handleSocialMediaChange}
                            placeholder="https://twitter.com/username"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Instagram className="h-5 w-5 text-pink-600" />
                        <div className="w-full space-y-2">
                          <Label htmlFor="instagram">Instagram</Label>
                          <Input
                            id="instagram"
                            name="instagram"
                            value={formData.socialMedia.instagram}
                            onChange={handleSocialMediaChange}
                            placeholder="https://instagram.com/username"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Linkedin className="h-5 w-5 text-blue-700" />
                        <div className="w-full space-y-2">
                          <Label htmlFor="linkedin">LinkedIn</Label>
                          <Input
                            id="linkedin"
                            name="linkedin"
                            value={formData.socialMedia.linkedin}
                            onChange={handleSocialMediaChange}
                            placeholder="https://linkedin.com/in/username"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Youtube className="h-5 w-5 text-red-600" />
                        <div className="w-full space-y-2">
                          <Label htmlFor="youtube">YouTube</Label>
                          <Input
                            id="youtube"
                            name="youtube"
                            value={formData.socialMedia.youtube}
                            onChange={handleSocialMediaChange}
                            placeholder="https://youtube.com/c/channelname"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Globe className="h-5 w-5 text-gray-600" />
                        <div className="w-full space-y-2">
                          <Label htmlFor="website">Вэбсайт</Label>
                          <Input
                            id="website"
                            name="website"
                            value={formData.socialMedia.website}
                            onChange={handleSocialMediaChange}
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <p className="text-sm text-muted-foreground">
                        Нийгмийн сүлжээний хаягуудаа оруулснаар таны профайл дээр харагдах болно. Хоосон үлдээсэн
                        талбарууд харагдахгүй.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" asChild>
                  <Link href="/profile">Цуцлах</Link>
                </Button>
                <Button type="submit" disabled={saving || uploadingImage}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Хадгалж байна...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Хадгалах
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>
    </div>
  )
}
