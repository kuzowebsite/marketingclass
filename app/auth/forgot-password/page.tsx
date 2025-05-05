"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { sendPasswordResetEmail } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { auth } = useFirebase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setSuccess(`"${email}" хаяг руу нууц үг шинэчлэх холбоос илгээгдлээ.`)
      setEmail("")
    } catch (err: any) {
      console.error("Password reset error:", err)
      if (err.code === "auth/user-not-found") {
        setError("Бүртгэлтэй хэрэглэгч олдсонгүй.")
      } else if (err.code === "auth/invalid-email") {
        setError("Имэйл хаяг буруу байна.")
      } else if (err.code === "auth/too-many-requests") {
        setError("Хэт олон удаа оролдлоо. Түр хүлээнэ үү.")
      } else {
        setError(`Нууц үг сэргээх үед алдаа гарлаа: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Нууц үг сэргээх</CardTitle>
          <CardDescription className="text-center">Бүртгэлтэй имэйл хаягаа оруулна уу</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert
              variant="default"
              className="border-green-500 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100"
            >
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Нууц үг сэргээх холбоос илгээх
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Нэвтрэх хуудас руу буцах
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
