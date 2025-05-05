"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { useSiteSettings } from "@/lib/site-settings"
import { Menu, X, Home, BookOpen, Users, User, Newspaper, Award, ShoppingCart, Bell, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart/cart-provider"
import { ref, get } from "firebase/database"
import { useMobile } from "@/hooks/use-mobile"

export function MobileMenu() {
  const { user, signOut, db } = useFirebase()
  const router = useRouter()
  const { cartItems = [] } = useCart() || {}
  const { settings } = useSiteSettings()
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [notifications] = useState(3) // Example notification count
  const { isMobile } = useMobile()

  // Only show on mobile
  if (!isMobile) {
    return null
  }

  // Check if user is admin
  if (user && db) {
    const checkAdminStatus = async () => {
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

    checkAdminStatus()
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/login")
    setIsOpen(false)
  }

  const menuItems = [
    { name: settings.navigation?.home || "Нүүр", href: "/", icon: <Home className="h-5 w-5" /> },
    { name: settings.navigation?.courses || "Хичээлүүд", href: "/courses", icon: <BookOpen className="h-5 w-5" /> },
    {
      name: settings.navigation?.organizations || "Байгууллага",
      href: "/organization",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: settings.navigation?.individual || "Хувь хүн",
      href: "/individual",
      icon: <User className="h-5 w-5" />,
    },
    { name: settings.navigation?.blog || "Блог", href: "/blog", icon: <Newspaper className="h-5 w-5" /> },
    {
      name: settings.navigation?.leaderboard || "Шилдэг сурагчагчид",
      href: "/leaderboard",
      icon: <Award className="h-5 w-5" />,
    },
  ]

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85%] sm:w-[385px] p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center justify-between">
              <span>Цэс</span>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </SheetTitle>
          </SheetHeader>

          {/* User info if logged in */}
          {user && (
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.displayName || "User"}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4">
                  <Link href="/cart" className="flex items-center space-x-1 text-sm" onClick={() => setIsOpen(false)}>
                    <ShoppingCart className="h-4 w-4" />
                    <span>Сагс</span>
                    {cartItems?.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {cartItems.length}
                      </Badge>
                    )}
                  </Link>

                  <Link
                    href="/reminders"
                    className="flex items-center space-x-1 text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <Bell className="h-4 w-4" />
                    <span>Мэдэгдэл</span>
                    {notifications > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {notifications}
                      </Badge>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-auto py-2">
            <nav className="space-y-1 px-2">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm hover:bg-accent"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}

              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900/20"
                  onClick={() => setIsOpen(false)}
                >
                  <Shield className="h-5 w-5" />
                  <span>Админ хэсэг</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Footer actions */}
          <div className="p-4 border-t">
            {user ? (
              <Button variant="destructive" className="w-full" onClick={handleSignOut}>
                Гарах
              </Button>
            ) : (
              <div className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    router.push("/auth/login")
                    setIsOpen(false)
                  }}
                >
                  {settings.buttons?.login || "Нэвтрэх"}
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    router.push("/auth/register")
                    setIsOpen(false)
                  }}
                >
                  {settings.buttons?.signUp || "Бүртгүүлэх"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
