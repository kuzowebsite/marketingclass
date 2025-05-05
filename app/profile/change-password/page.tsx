"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2, Lock, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ChangePasswordPage() {
  const { user } = useFirebase()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = { ...errors }

    // Validate current password
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Одоогийн нууц үгээ оруулна уу"
      isValid = false
    }

    // Validate new password
    if (!formData.newPassword) {
      newErrors.newPassword = "Шинэ нууц үгээ оруулна уу"
      isValid = false
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой"
      isValid = false
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Нууц үгээ давтан оруулна уу"
      isValid = false
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Нууц үг таарахгүй байна"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!user) {
      toast({
        title: "Алдаа",
        description: "Та нэвтрээгүй байна",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, formData.currentPassword)

      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, formData.newPassword)

      toast({
        title: "Амжилттай",
        description: "Таны нууц үг амжилттай шинэчлэгдлээ",
      })

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      // Redirect to profile page
      router.push("/profile")
    } catch (error) {
      console.error("Error changing password:", error)

      // Handle specific errors
      if (error.code === "auth/wrong-password") {
        setErrors((prev) => ({
          ...prev,
          currentPassword: "Одоогийн нууц үг буруу байна",
        }))
      } else if (error.code === "auth/too-many-requests") {
        toast({
          title: "Алдаа",
          description: "Хэт олон удаа буруу оролдлого хийсэн байна. Түр хүлээнэ үү.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Алдаа",
          description: `Нууц үг солиход алдаа гарлаа: ${error.message || "Тодорхойгүй алдаа"}`,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = (password) => {
    if (!password) return { score: 0, text: "", color: "" }

    let score = 0

    // Length check
    if (password.length >= 8) score += 1
    if (password.length >= 10) score += 1

    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1 // Has uppercase
    if (/[a-z]/.test(password)) score += 1 // Has lowercase
    if (/[0-9]/.test(password)) score += 1 // Has number
    if (/[^A-Za-z0-9]/.test(password)) score += 1 // Has special char

    // Return score info
    const strengthMap = [
      { text: "Маш сул", color: "bg-red-500" },
      { text: "Сул", color: "bg-red-400" },
      { text: "Дунд", color: "bg-yellow-500" },
      { text: "Сайн", color: "bg-green-400" },
      { text: "Маш сайн", color: "bg-green-500" },
    ]

    const index = Math.min(Math.floor(score / 2), 4)
    return {
      score,
      text: strengthMap[index].text,
      color: strengthMap[index].color,
    }
  }

  const strength = passwordStrength(formData.newPassword)

  if (!user) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Нэвтрээгүй байна</h1>
        <p className="mb-8">Нууц үг солих хуудсыг харахын тулд нэвтэрнэ үү.</p>
        <Link href="/auth/login">
          <Button size="lg">Нэвтрэх</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="icon" asChild className="mr-4">
            <Link href="/profile">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Нууц үг солих</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Нууц үг солих</CardTitle>
              <CardDescription>Аюулгүй байдлын үүднээс нууц үгээ тогтмол солих нь зүйтэй</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.providerData[0]?.providerId !== "password" && (
                <Alert className="mb-4">
                  <Lock className="h-4 w-4" />
                  <AlertTitle>Нууц үг солих боломжгүй</AlertTitle>
                  <AlertDescription>
                    Та нийгмийн сүлжээгээр нэвтэрсэн тул нууц үг солих боломжгүй байна.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Одоогийн нууц үг</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Одоогийн нууц үг"
                    disabled={user.providerData[0]?.providerId !== "password" || loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    disabled={user.providerData[0]?.providerId !== "password" || loading}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.currentPassword && <p className="text-sm text-red-500 mt-1">{errors.currentPassword}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Шинэ нууц үг</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Шинэ нууц үг"
                    disabled={user.providerData[0]?.providerId !== "password" || loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={user.providerData[0]?.providerId !== "password" || loading}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.newPassword && <p className="text-sm text-red-500 mt-1">{errors.newPassword}</p>}

                {formData.newPassword && (
                  <div className="mt-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs">Нууц үгийн хүч:</span>
                      <span className="text-xs">{strength.text}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${strength.color}`}
                        style={{ width: `${(strength.score / 6) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Том, жижиг үсэг, тоо, тусгай тэмдэгт хослуулсан нууц үг хамгийн найдвартай.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Шинэ нууц үг давтах</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Шинэ нууц үг давтах"
                    disabled={user.providerData[0]?.providerId !== "password" || loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={user.providerData[0]?.providerId !== "password" || loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" asChild disabled={loading}>
                <Link href="/profile">Цуцлах</Link>
              </Button>
              <Button type="submit" disabled={user.providerData[0]?.providerId !== "password" || loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Хадгалж байна...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Нууц үг солих
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}
