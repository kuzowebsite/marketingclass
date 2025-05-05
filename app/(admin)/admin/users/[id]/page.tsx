"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { ref, get, update } from "firebase/database"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Award,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  Pencil,
  Save,
  Loader2,
} from "lucide-react"
import type { User as UserType } from "@/lib/types"
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"

export default function UserProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const { db } = useFirebase()
  const { toast } = useToast()

  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phone: "",
    bio: "",
    isAdmin: false,
    isVerified: false,
    isBlocked: false,
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      if (!db || !id) return

      try {
        const userRef = ref(db, `users/${id}`)
        const snapshot = await get(userRef)

        if (snapshot.exists()) {
          const userData = { uid: id as string, ...snapshot.val() } as UserType
          setUser(userData)
          setFormData({
            displayName: userData.displayName || "",
            email: userData.email || "",
            phone: userData.phone || "",
            bio: userData.bio || "",
            isAdmin: userData.isAdmin || false,
            isVerified: userData.isVerified || false,
            isBlocked: userData.isBlocked || false,
          })
        } else {
          toast({
            title: "Хэрэглэгч олдсонгүй",
            description: "Таны хайсан хэрэглэгч олдсонгүй",
            variant: "destructive",
          })
          router.push("/admin/users")
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        toast({
          title: "Алдаа гарлаа",
          description: "Хэрэглэгчийн мэдээлэл авахад алдаа гарлаа",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [db, id, router, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSave = async () => {
    if (!db || !id) return

    setSaving(true)

    try {
      const userRef = ref(db, `users/${id}`)
      await update(userRef, {
        displayName: formData.displayName,
        phone: formData.phone,
        bio: formData.bio,
        isAdmin: formData.isAdmin,
        isVerified: formData.isVerified,
        isBlocked: formData.isBlocked,
      })

      toast({
        title: "Амжилттай хадгаллаа",
        description: "Хэрэглэгчийн мэдээлэл амжилттай шинэчлэгдлээ",
      })

      // Update local state
      setUser((prev) => (prev ? { ...prev, ...formData } : null))
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Хэрэглэгчийн мэдээлэл шинэчлэхэд алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
    setPasswordError("")
    setPasswordSuccess("")
  }

  const handlePasswordReset = async () => {
    // Reset messages
    setPasswordError("")
    setPasswordSuccess("")

    // Validate passwords
    if (!passwordData.currentPassword) {
      setPasswordError("Одоогийн нууц үгээ оруулна уу")
      return
    }

    if (!passwordData.newPassword) {
      setPasswordError("Шинэ нууц үгээ оруулна уу")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Шинэ нууц үг таарахгүй байна")
      return
    }

    setSaving(true)

    try {
      const auth = getAuth()
      const currentUser = auth.currentUser

      if (!currentUser || !currentUser.email) {
        setPasswordError("Хэрэглэгч нэвтрээгүй байна")
        return
      }

      // Reauthenticate user before changing password
      const credential = EmailAuthProvider.credential(currentUser.email, passwordData.currentPassword)

      await reauthenticateWithCredential(currentUser, credential)
      await updatePassword(currentUser, passwordData.newPassword)

      setPasswordSuccess("Нууц үг амжилттай шинэчлэгдлээ")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setShowPasswordForm(false)

      toast({
        title: "Амжилттай",
        description: "Нууц үг амжилттай шинэчлэгдлээ",
      })
    } catch (error: any) {
      console.error("Error updating password:", error)

      if (error.code === "auth/wrong-password") {
        setPasswordError("Одоогийн нууц үг буруу байна")
      } else if (error.code === "auth/too-many-requests") {
        setPasswordError("Хэт олон удаа оролдлоо. Түр хүлээнэ үү")
      } else {
        setPasswordError("Нууц үг шинэчлэхэд алдаа гарлаа: " + error.message)
      }

      toast({
        title: "Алдаа гарлаа",
        description: "Нууц үг шинэчлэхэд алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4">Хэрэглэгчийн мэдээлэл ачааллаж байна...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/users")} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Хэрэглэгч олдсонгүй</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-16 w-16 text-muted-foreground opacity-20" />
            <h2 className="mt-4 text-2xl font-bold">Хэрэглэгч олдсонгүй</h2>
            <p className="mt-2 text-muted-foreground">Таны хайсан хэрэглэгч олдсонгүй.</p>
            <Button className="mt-6" onClick={() => router.push("/admin/users")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Хэрэглэгчид рүү буцах
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="outline" size="icon" onClick={() => router.push("/admin/users")} className="mr-4">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Хэрэглэгчийн профайл</h1>
          <p className="text-muted-foreground">
            {user.displayName || "Нэргүй хэрэглэгч"} - {user.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                {user.photoURL ? (
                  <img
                    src={user.photoURL || "/placeholder.svg"}
                    alt={user.displayName || "User"}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-purple-600" />
                )}
              </div>
              <CardTitle>{user.displayName || "Нэргүй хэрэглэгч"}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Имэйл</span>
                  </div>
                  <span className="text-sm font-medium">{user.email}</span>
                </div>

                {user.phone && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Утас</span>
                    </div>
                    <span className="text-sm font-medium">{user.phone}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Бүртгүүлсэн</span>
                  </div>
                  <span className="text-sm font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Тодорхойгүй"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Сүүлд идэвхтэй</span>
                  </div>
                  <span className="text-sm font-medium">
                    {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Тодорхойгүй"}
                  </span>
                </div>

                <Separator />

                <div className="flex flex-wrap gap-2">
                  {user.isAdmin && (
                    <Badge className="bg-purple-600">
                      <Shield className="h-3 w-3 mr-1" />
                      Админ
                    </Badge>
                  )}
                  {user.isVerified && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Баталгаажсан
                    </Badge>
                  )}
                  {user.isBlocked && (
                    <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                      <XCircle className="h-3 w-3 mr-1" />
                      Хориглогдсон
                    </Badge>
                  )}
                </div>

                {user.points && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Оноо</span>
                    </div>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                      {user.points} оноо
                    </Badge>
                  </div>
                )}

                {user.purchasedCourses && user.purchasedCourses.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Хичээлүүд</span>
                    </div>
                    <Badge variant="outline">{user.purchasedCourses.length} хичээл</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Профайл</TabsTrigger>
              <TabsTrigger value="courses">Хичээлүүд</TabsTrigger>
              <TabsTrigger value="activity">Үйл ажиллагаа</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Pencil className="h-4 w-4 mr-2" />
                    Профайл засах
                  </CardTitle>
                  <CardDescription>Хэрэглэгчийн мэдээллийг шинэчлэх</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Нэр</Label>
                      <Input
                        id="displayName"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Имэйл</Label>
                      <Input id="email" name="email" value={formData.email} disabled className="bg-muted" />
                      <p className="text-xs text-muted-foreground">Имэйл хаягийг өөрчлөх боломжгүй</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Утасны дугаар</Label>
                      <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Тайлбар</Label>
                    <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} rows={4} />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Хэрэглэгчийн статус</h3>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="isAdmin">Админ эрх</Label>
                        <p className="text-sm text-muted-foreground">
                          Админ эрхтэй хэрэглэгч нь системийн бүх хэсэгт хандах эрхтэй
                        </p>
                      </div>
                      <Switch
                        id="isAdmin"
                        checked={formData.isAdmin}
                        onCheckedChange={(checked) => handleSwitchChange("isAdmin", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="isVerified">Баталгаажсан</Label>
                        <p className="text-sm text-muted-foreground">
                          Баталгаажсан хэрэглэгч нь бүх үйлчилгээг ашиглах боломжтой
                        </p>
                      </div>
                      <Switch
                        id="isVerified"
                        checked={formData.isVerified}
                        onCheckedChange={(checked) => handleSwitchChange("isVerified", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="isBlocked" className="text-red-500">
                          Хориглох
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Хориглогдсон хэрэглэгч нь системд нэвтрэх боломжгүй болно
                        </p>
                      </div>
                      <Switch
                        id="isBlocked"
                        checked={formData.isBlocked}
                        onCheckedChange={(checked) => handleSwitchChange("isBlocked", checked)}
                      />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Нууц үг</h3>

                    {!showPasswordForm ? (
                      <Button variant="outline" onClick={() => setShowPasswordForm(true)} className="w-full">
                        Нууц үг солих
                      </Button>
                    ) : (
                      <div className="space-y-4 border p-4 rounded-md">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Одоогийн нууц үг</Label>
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="newPassword">Шинэ нууц үг</Label>
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Шинэ нууц үг давтах</Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                          />
                        </div>

                        {passwordError && <div className="text-sm text-red-500 mt-2">{passwordError}</div>}

                        {passwordSuccess && <div className="text-sm text-green-500 mt-2">{passwordSuccess}</div>}

                        <div className="flex justify-between mt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowPasswordForm(false)
                              setPasswordData({
                                currentPassword: "",
                                newPassword: "",
                                confirmPassword: "",
                              })
                              setPasswordError("")
                              setPasswordSuccess("")
                            }}
                          >
                            Цуцлах
                          </Button>
                          <Button onClick={handlePasswordReset} disabled={saving}>
                            {saving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Хадгалж байна...
                              </>
                            ) : (
                              "Нууц үг шинэчлэх"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => router.push("/admin/users")}>
                    Цуцлах
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
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
            </TabsContent>

            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <CardTitle>Хичээлүүд</CardTitle>
                  <CardDescription>Хэрэглэгчийн худалдан авсан хичээлүүд</CardDescription>
                </CardHeader>
                <CardContent>
                  {user.purchasedCourses && user.purchasedCourses.length > 0 ? (
                    <div className="space-y-4">
                      {user.purchasedCourses.map((courseId, index) => (
                        <div key={courseId} className="flex items-center justify-between p-4 border rounded-md">
                          <div>
                            <h4 className="font-medium">Хичээл #{index + 1}</h4>
                            <p className="text-sm text-muted-foreground">ID: {courseId}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Дэлгэрэнгүй
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                      <h3 className="mt-4 text-lg font-medium">Хичээл байхгүй байна</h3>
                      <p className="text-muted-foreground">
                        Энэ хэрэглэгч одоогоор ямар ч хичээл худалдаж аваагүй байна.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Үйл ажиллагаа</CardTitle>
                  <CardDescription>Хэрэглэгчийн сүүлийн үйл ажиллагаа</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                    <h3 className="mt-4 text-lg font-medium">Үйл ажиллагааны түүх байхгүй байна</h3>
                    <p className="text-muted-foreground">
                      Энэ хэрэглэгчийн үйл ажиллагааны түүх одоогоор хоосон байна.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
