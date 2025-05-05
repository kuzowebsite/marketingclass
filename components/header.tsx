"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { BookOpen, User, ShoppingCart, Award, Bell, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart/cart-provider"
import { ref, get } from "firebase/database"
import { useSiteSettings } from "@/lib/site-settings"
import { MobileMenu } from "@/components/mobile-menu"
import { useMobile } from "@/hooks/use-mobile"

export function Header() {
  const { user, signOut, db } = useFirebase()
  const router = useRouter()
  const { cartItems = [] } = useCart() || {}
  const { settings, loading } = useSiteSettings()
  const [scrolled, setScrolled] = useState(false)
  const [notifications, setNotifications] = useState(3) // Example notification count
  const [isAdmin, setIsAdmin] = useState(false)
  const { isMobile } = useMobile()
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user && db) {
        try {
          const userRef = ref(db, `users/${user.uid}`)
          const snapshot = await get(userRef)

          if (snapshot.exists()) {
            const userData = snapshot.val()
            setIsAdmin(userData.isAdmin || false)
          }
        } catch (error) {
          console.error("Error checking admin status:", error)
        }
      }
    }

    checkAdminStatus()
  }, [user, db])

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !db) return

      try {
        const userRef = ref(db, `users/${user.uid}`)
        const snapshot = await get(userRef)

        if (snapshot.exists()) {
          setUserData(snapshot.val())
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()
  }, [user, db])

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/login")
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm" : "bg-white dark:bg-gray-900"
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            {loading ? (
              <>
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              </>
            ) : (
              <>
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl || "/placeholder.svg"}
                    alt={settings.siteName}
                    className="h-8 w-auto object-contain"
                    onError={(e) => {
                      console.log("Logo image error, using fallback")
                      e.currentTarget.src = "/abstract-logo.png"
                      e.currentTarget.onerror = null
                    }}
                  />
                ) : (
                  <BookOpen className="h-8 w-8 text-primary" />
                )}
                <span className="text-xl font-bold tracking-tight">{settings.siteName}</span>
              </>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary transition-colors"
            >
              {settings.navigation?.home || "Нүүр"}
            </Link>
            <Link
              href="/courses"
              className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary transition-colors"
            >
              {settings.navigation?.courses || "Хичээлүүд"}
            </Link>
            <Link
              href="/organization"
              className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary transition-colors"
            >
              {settings.navigation?.organizations || "Байгууллага"}
            </Link>
            <Link
              href="/individual"
              className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary transition-colors"
            >
              {settings.navigation?.individual || "Хувь хүн"}
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary transition-colors"
            >
              {settings.navigation?.blog || "Блог"}
            </Link>
            <Link
              href="/leaderboard"
              className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary transition-colors"
            >
              {settings.navigation?.leaderboard || "Шилдэг сурагчагчид"}
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {user ? (
              <>
                {/* Admin button for admin users */}
                {isAdmin && !isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/admin")}
                    className="relative text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/20"
                    title="Админ хэсэг"
                  >
                    <Shield className="h-5 w-5" />
                  </Button>
                )}

                {/* Cart with badge - only on desktop */}
                {!isMobile && (
                  <Link href="/cart" className="relative">
                    <ShoppingCart className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                    {cartItems?.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                        {cartItems.length}
                      </Badge>
                    )}
                  </Link>
                )}

                {/* Notifications - only on desktop */}
                {!isMobile && (
                  <Link href="/reminders" className="relative">
                    <Bell className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                    {notifications && notifications > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                        {notifications}
                      </Badge>
                    )}
                  </Link>
                )}

                {/* User dropdown - only on desktop */}
                {!isMobile && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={userData?.profileImageBase64 || user?.photoURL || ""}
                            alt={user.displayName || "User"}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{user.displayName || "User"}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Профайл</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/notes" className="cursor-pointer">
                          <BookOpen className="mr-2 h-4 w-4" />
                          <span>Миний тэмдэглэл</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/leaderboard" className="cursor-pointer">
                          <Award className="mr-2 h-4 w-4" />
                          <span>Амжилтууд</span>
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="cursor-pointer">
                              <Shield className="mr-2 h-4 w-4 text-purple-600" />
                              <span className="text-purple-600">Админ хэсэг</span>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="cursor-pointer text-red-500 focus:text-red-500"
                      >
                        Гарах
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" onClick={() => router.push("/auth/login")}>
                  {settings.buttons?.login || "Нэвтрэх"}
                </Button>
                <Button onClick={() => router.push("/auth/register")}>
                  {settings.buttons?.signUp || "Бүртгүүлэх"}
                </Button>
              </div>
            )}

            {/* Mobile menu */}
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
