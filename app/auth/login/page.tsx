"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import GoogleIcon from "@/components/logos/google-icon"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const router = useRouter()
  const { signIn, signInWithGoogle, signInWithFacebook, signInWithTwitter } = useFirebase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await signIn(email, password)
      router.push("/")
    } catch (err: any) {
      console.error("Login error:", err)
      if (err.code === "auth/invalid-credential") {
        setError("Имэйл эсвэл нууц үг буруу байна.")
      } else if (err.code === "auth/user-not-found") {
        setError("Бүртгэлтэй хэрэглэгч олдсонгүй.")
      } else if (err.code === "auth/too-many-requests") {
        setError("Хэт олон удаа оролдлоо. Түр хүлээнэ үү.")
      } else {
        setError(`Нэвтрэх үед алдаа гарлаа: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string, method: () => Promise<any>) => {
    setError(null)
    setSocialLoading(provider)

    try {
      await method()
      router.push("/")
    } catch (err: any) {
      console.error(`${provider} login error:`, err)
      if (err.code === "auth/popup-closed-by-user") {
        setError("Нэвтрэх цонхыг хаасан байна.")
      } else if (err.code === "auth/cancelled-popup-request") {
        // This is normal when multiple popups are attempted, no need to show error
        console.log("Popup request cancelled")
      } else if (err.code === "auth/popup-blocked") {
        setError("Popup цонх хаагдсан байна. Popup зөвшөөрөгдсөн эсэхийг шалгана уу.")
      } else if (err.code === "auth/unauthorized-domain") {
        setError("Энэ домэйн Firebase-д бүртгэгдээгүй байна. Админтай холбогдоно уу.")
      } else {
        setError(`${provider}-ээр нэвтрэх үед алдаа гарлаа: ${err.message}`)
      }
    } finally {
      setSocialLoading(null)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Нэвтрэх</CardTitle>
          <CardDescription className="text-center">Та өөрийн бүртгэлээр нэвтэрнэ үү</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Имэйл</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Нууц үг</Label>
                <Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Нууц үг мартсан?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Нэвтрэх
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Эсвэл</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Button
              variant="outline"
              type="button"
              disabled={!!socialLoading}
              onClick={() => handleSocialLogin("Google", signInWithGoogle)}
              className="flex items-center justify-center gap-2"
            >
              {socialLoading === "Google" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon width={20} height={20} />
              )}
              Google-ээр нэвтрэх
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={!!socialLoading}
              onClick={() => handleSocialLogin("Facebook", signInWithFacebook)}
            >
              {socialLoading === "Facebook" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z"
                  />
                </svg>
              )}
              Facebook-ээр нэвтрэх
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Бүртгэлгүй бол{" "}
            <Link href="/auth/register" className="font-medium text-primary hover:underline">
              Бүртгүүлэх
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
