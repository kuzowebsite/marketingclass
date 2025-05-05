"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { GraduationCap, Shield, KeyRound, ArrowLeft, AlertTriangle, Mail, Eye, EyeOff } from "lucide-react"
import { ref, get, set } from "firebase/database"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSiteSettings } from "@/lib/site-settings"
import { Checkbox } from "@/components/ui/checkbox"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isTestMode, setIsTestMode] = useState(false)
  const { auth, db, user: currentUser, loading: authLoading, connectionStatus } = useFirebase()
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get("error")
  const callbackUrl = searchParams?.get("callbackUrl") || "/admin"
  const { settings, loading: settingsLoading } = useSiteSettings()
  const testParam = searchParams.get("test")
  const isDev = process.env.NODE_ENV === "development"

  // Check for saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("adminEmail")
    const savedRememberMe = localStorage.getItem("adminRememberMe") === "true"

    if (savedEmail && savedRememberMe) {
      setEmail(savedEmail)
      setRememberMe(true)
    }

    // Check if test mode is enabled via environment variable or URL parameter or development mode
    if (process.env.NEXT_PUBLIC_ADMIN_TEST === "true" || testParam === "true" || isDev) {
      setIsTestMode(true)
      console.log("Admin test mode is enabled")

      // In development mode, set default test credentials
      if (isDev && !savedEmail) {
        setEmail("admin@marketingclass.mn")
        setPassword("admin123")
      }
    }
  }, [testParam, isDev])

  useEffect(() => {
    // Handle error from URL parameters
    if (errorParam) {
      switch (errorParam) {
        case "not-admin":
          setError("Танд админ эрх байхгүй байна. Зөвхөн админ эрхтэй хэрэглэгчид нэвтрэх боломжтой.")
          break
        case "not-found":
          setError("Хэрэглэгчийн мэдээлэл олдсонгүй.")
          break
        case "server":
          setError("Системд алдаа гарлаа. Дахин оролдоно уу.")
          break
        default:
          setError(null)
      }
    }
  }, [errorParam])

  useEffect(() => {
    // Comment out the auto-redirect in development mode
    // if (isDev) {
    //   console.log("Development mode: automatically redirecting to admin dashboard")
    //   router.push("/admin")
    //   return
    // }

    // Check if Firebase is initialized
    if (connectionStatus === "disconnected") {
      setDebugInfo("Firebase холболт амжилтгүй. Хуудсыг дахин ачаална уу.")
      return
    } else if (connectionStatus === "connecting") {
      setDebugInfo("Firebase холболт хийгдэж байна...")
      return
    } else {
      setDebugInfo(null)
    }

    // If user is already logged in, check if they're an admin
    const checkAdminStatus = async () => {
      if (authLoading) return

      if (currentUser && db) {
        try {
          const userRef = ref(db, `users/${currentUser.uid}`)
          const snapshot = await get(userRef)

          if (snapshot.exists()) {
            const userData = snapshot.val()
            if (userData.isAdmin) {
              // User is already logged in as admin, redirect to admin dashboard
              console.log("User is already logged in as admin, redirecting to admin dashboard")
              router.push("/admin")
            }
          }
        } catch (error) {
          console.error("Error checking admin status:", error)
          setDebugInfo(`Админ статус шалгахад алдаа гарлаа: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
    }

    checkAdminStatus()
  }, [currentUser, db, router, authLoading, connectionStatus, isDev])

  // Function to create a test admin user in the database
  const createTestAdminUser = async () => {
    if (!db) return false

    try {
      // Check if test admin already exists
      const testAdminRef = ref(db, "users/test-admin-user")
      const snapshot = await get(testAdminRef)

      if (!snapshot.exists()) {
        // Create a test admin user
        await set(testAdminRef, {
          email: "admin@marketingclass.mn",
          displayName: "Test Admin",
          isAdmin: true,
          createdAt: new Date().toISOString(),
          provider: "test",
        })
        console.log("Test admin user created")
      }

      return true
    } catch (error) {
      console.error("Error creating test admin user:", error)
      return false
    }
  }

  const handleTestLogin = async () => {
    // This is a test login that bypasses Firebase authentication
    setLoading(true)

    try {
      // Create test admin user if it doesn't exist
      const success = await createTestAdminUser()

      if (!success) {
        setError("Тест админ хэрэглэгч үүсгэхэд алдаа гарлаа.")
        setLoading(false)
        return
      }

      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem("adminEmail", email)
        localStorage.setItem("adminRememberMe", "true")
      } else {
        localStorage.removeItem("adminEmail")
        localStorage.removeItem("adminRememberMe")
      }

      toast({
        title: "Тест горимд нэвтэрлээ",
        description: "Тест админ эрхээр амжилттай нэвтэрлээ.",
      })

      // Redirect to admin dashboard
      router.push("/admin")
    } catch (error) {
      console.error("Test login error:", error)
      setError("Тест нэвтрэлтэд алдаа гарлаа.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDebugInfo(null)

    // Check if test mode is enabled and using test credentials
    if (
      (isTestMode || process.env.NEXT_PUBLIC_ADMIN_TEST === "true" || testParam === "true" || isDev) &&
      email === "admin@marketingclass.mn" &&
      password === "admin123"
    ) {
      await handleTestLogin()
      return
    }

    if (!auth) {
      setError("Firebase authentication инициализаци хийгдээгүй байна. Хуудсыг дахин ачаална уу.")
      return
    }

    if (!db) {
      setError("Firebase database инициализаци хийгдээгүй байна. Хуудсыг дахин ачаална уу.")
      return
    }

    try {
      setLoading(true)

      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      // Check if user is admin
      const userRef = ref(db, `users/${userCredential.user.uid}`)
      const snapshot = await get(userRef)

      if (snapshot.exists()) {
        const userData = snapshot.val()

        if (userData.isAdmin) {
          // Save email if remember me is checked
          if (rememberMe) {
            localStorage.setItem("adminEmail", email)
            localStorage.setItem("adminRememberMe", "true")
          } else {
            localStorage.removeItem("adminEmail")
            localStorage.removeItem("adminRememberMe")
          }

          toast({
            title: "Амжилттай",
            description: "Админ эрхээр амжилттай нэвтэрлээ.",
          })
          router.push(callbackUrl)
        } else {
          setError("Танд админ эрх байхгүй байна. Зөвхөн админ эрхтэй хэрэглэгчид нэвтрэх боломжтой.")
        }
      } else {
        // User exists in authentication but not in database
        setError("Хэрэглэгчийн мэдээлэл өгөгдлийн санд олдсонгүй.")
      }
    } catch (error: any) {
      let message = "Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу."

      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        message = "И-мэйл эсвэл нууц үг буруу байна. Дахин оролдоно уу."
      } else if (error.code === "auth/too-many-requests") {
        message = "Хэт олон удаа буруу оролдлого хийсэн тул түр хүлээнэ үү."
      } else if (error.code === "auth/network-request-failed") {
        message = "Сүлжээний алдаа гарлаа. Интернэт холболтоо шалгана уу."
      }

      console.error("Login error:", error.code, error.message)
      setError(message)

      if (isTestMode || process.env.NEXT_PUBLIC_ADMIN_TEST === "true" || testParam === "true" || isDev) {
        setDebugInfo(`Алдааны код: ${error.code}, Мессеж: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Development mode login form (simplified but functional)
  if (isDev) {
    return (
      <div className="container min-h-[calc(100vh-200px)] py-12 flex items-center justify-center bg-gray-50 dark:bg-gray-900/30">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-6 bg-blue-50 dark:bg-blue-900/20 rounded-t-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-500" />
              </div>
              <CardTitle className="text-2xl text-center">Хөгжүүлэгчийн горим</CardTitle>
              <CardDescription className="text-center">Хөгжүүлэгчийн горимд админ эрхээр нэвтрэх</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="email">И-мэйл</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@marketingclass.mn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Нууц үг</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
                <AlertTitle className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Хөгжүүлэгчийн горим идэвхтэй
                </AlertTitle>
                <AlertDescription className="text-xs">
                  Хөгжүүлэгчийн горимд админ хэсэгт шууд нэвтрэх боломжтой. Доорх товчийг дарна уу.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                onClick={handleLogin}
                className="w-full h-11 text-base bg-blue-600/80 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Нэвтэрч байна..." : "Админаар нэвтрэх"}
              </Button>
              <div className="flex items-center justify-center">
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" />
                  Нүүр хуудас руу буцах
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container min-h-[calc(100vh-200px)] py-12 flex items-center justify-center bg-gray-50 dark:bg-gray-900/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
            {settingsLoading ? (
              <>
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              </>
            ) : (
              <>
                {settings?.logoUrl ? (
                  <img
                    src={settings.logoUrl || "/placeholder.svg"}
                    alt={settings?.siteName || "MarketingClass.mn"}
                    className="h-8 w-auto object-contain"
                    onError={(e) => {
                      console.log("Logo image error, using fallback")
                      e.currentTarget.src = "/abstract-logo.png"
                      e.currentTarget.onerror = null
                    }}
                  />
                ) : (
                  <GraduationCap className="h-8 w-8 text-purple-600 dark:text-purple-500" />
                )}
                <span className="font-bold text-2xl">{settings?.siteName || "MarketingClass.mn"}</span>
              </>
            )}
          </Link>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-6 bg-purple-50 dark:bg-purple-900/20 rounded-t-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-500" />
            </div>
            <CardTitle className="text-2xl text-center">Админ нэвтрэх</CardTitle>
            <CardDescription className="text-center">Зөвхөн админ эрхтэй хэрэглэгчид нэвтрэх боломжтой</CardDescription>
          </CardHeader>

          {error && (
            <div className="px-6 pt-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Нэвтрэх боломжгүй</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {debugInfo && (
            <div className="px-6 pt-3">
              <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
                <AlertTitle className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Диагностик мэдээлэл
                </AlertTitle>
                <AlertDescription className="text-xs font-mono break-all">{debugInfo}</AlertDescription>
              </Alert>
            </div>
          )}

          {(isTestMode || process.env.NEXT_PUBLIC_ADMIN_TEST === "true" || testParam === "true") && (
            <div className="px-6 pt-3">
              <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
                <AlertTitle className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Тест горим идэвхтэй
                </AlertTitle>
                <AlertDescription className="text-xs">
                  Тест горимд admin@marketingclass.mn / admin123 ашиглан нэвтэрч болно.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="email">И-мэйл</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@marketingclass.mn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Нууц үг</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Намайг сана
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full h-11 text-base bg-purple-600 hover:bg-purple-700"
                disabled={loading}
              >
                {loading ? "Нэвтэрч байна..." : "Админаар нэвтрэх"}
              </Button>

              <div className="flex items-center justify-center">
                <Link
                  href="/auth/login"
                  className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Энгийн нэвтрэх хуудас руу буцах
                </Link>
              </div>

              <div className="flex items-center justify-center">
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" />
                  Нүүр хуудас руу буцах
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
