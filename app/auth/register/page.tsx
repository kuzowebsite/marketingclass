"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { GraduationCap, UserPlus, Mail, Lock, User } from "lucide-react"
import { ref, set } from "firebase/database"
import { useSiteSettings } from "@/lib/site-settings"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { auth, db } = useFirebase()
  const router = useRouter()
  const { toast } = useToast()
  const { settings } = useSiteSettings()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!auth || !db) {
      toast({
        title: "Алдаа",
        description: "Системд алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Алдаа",
        description: "Нууц үг таарахгүй байна.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: name,
      })

      // Create user in database
      await set(ref(db, `users/${userCredential.user.uid}`), {
        uid: userCredential.user.uid,
        email: email,
        displayName: name,
        createdAt: Date.now(),
        isAdmin: false,
        purchasedCourses: [],
        bookmarkedCourses: [],
        points: 0,
      })

      toast({
        title: "Амжилттай",
        description: "Таны бүртгэл амжилттай үүслээ.",
      })

      // Redirect to home page after successful registration
      router.push("/")
    } catch (error: any) {
      let message = "Бүртгэл үүсгэхэд алдаа гарлаа. Дахин оролдоно уу."
      if (error.code === "auth/email-already-in-use") {
        message = "Энэ и-мэйл хаяг бүртгэлтэй байна."
      } else if (error.code === "auth/weak-password") {
        message = "Нууц үг хэтэрхий богино байна."
      }
      toast({
        title: "Алдаа",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container min-h-[calc(100vh-200px)] py-12 flex items-center justify-center bg-gray-50 dark:bg-gray-900/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl || "/placeholder.svg"}
                alt={settings.siteName}
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/abstract-logo.png"
                  e.currentTarget.onerror = null
                }}
              />
            ) : (
              <GraduationCap className="h-8 w-8 text-teal-600 dark:text-teal-500" />
            )}
            <span className="font-bold text-2xl">{settings.siteName}</span>
          </Link>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <UserPlus className="h-6 w-6 text-teal-600 dark:text-teal-500" />
            </div>
            <CardTitle className="text-2xl text-center">Бүртгүүлэх</CardTitle>
            <CardDescription className="text-center">{settings.siteName} системд бүртгүүлнэ үү</CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Нэр</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Таны нэр"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-11 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">И-мэйл</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
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
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Нууц үг баталгаажуулах</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 pl-10"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-base bg-teal-600 hover:bg-teal-700" disabled={loading}>
                {loading ? "Бүртгэж байна..." : "Бүртгүүлэх"}
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-0">
              <div className="text-center text-sm">
                Бүртгэлтэй юу?{" "}
                <Link href="/auth/login" className="text-teal-600 hover:underline font-semibold">
                  Нэвтрэх
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
