"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  BookOpen,
  Users,
  ShoppingCart,
  Settings,
  MessageSquare,
  Bell,
  Award,
  FileText,
  Instagram,
  Home,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { ref, get } from "firebase/database"
import { signOut } from "firebase/auth"

interface SidebarLink {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
}

interface AdminSidebarProps {
  isOpen?: boolean
  setIsOpen?: (open: boolean) => void
}

export function AdminSidebar({ isOpen = true, setIsOpen }: AdminSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { user, db, auth } = useFirebase()
  const [userData, setUserData] = useState<any>(null)

  // Ensure sidebar state persists across page navigations
  useEffect(() => {
    const savedState = localStorage.getItem("adminSidebarCollapsed")
    if (savedState !== null) {
      setCollapsed(savedState === "true")
    }
  }, [])

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("adminSidebarCollapsed", collapsed.toString())
    }
  }, [collapsed])

  // Add this useEffect to fetch user data
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

  const toggleSidebar = () => {
    if (setIsOpen) {
      setIsOpen(!isOpen)
    }
  }

  const toggleCollapse = () => {
    setCollapsed(!collapsed)
  }

  const isActive = (path: string) => {
    if (path === "/admin" && pathname === "/admin") {
      return true
    }
    if (path !== "/admin" && pathname.startsWith(path)) {
      return true
    }
    return false
  }

  const mainLinks: SidebarLink[] = [
    { href: "/admin", label: "Хянах самбар", icon: <Home className="h-5 w-5" /> },
    { href: "/admin/courses", label: "Хичээлүүд", icon: <BookOpen className="h-5 w-5" /> },
    { href: "/admin/social-media-courses", label: "Сошиал медиа", icon: <Instagram className="h-5 w-5" /> },
    { href: "/admin/users", label: "Хэрэглэгчид", icon: <Users className="h-5 w-5" /> },
    { href: "/admin/orders", label: "Захиалгууд", icon: <ShoppingCart className="h-5 w-5" /> },
  ]

  const contentLinks: SidebarLink[] = [
    { href: "/admin/blog", label: "Блог", icon: <FileText className="h-5 w-5" /> },
    { href: "/admin/testimonials", label: "Сэтгэгдлүүд", icon: <MessageSquare className="h-5 w-5" /> },
    { href: "/admin/badges", label: "Тэмдэгтүүд", icon: <Award className="h-5 w-5" /> },
  ]

  const systemLinks: SidebarLink[] = [
    { href: "/admin/statistics", label: "Статистик", icon: <BarChart3 className="h-5 w-5" /> },
    { href: "/admin/notifications", label: "Мэдэгдлүүд", icon: <Bell className="h-5 w-5" />, badge: 5 },
    { href: "/admin/settings", label: "Тохиргоо", icon: <Settings className="h-5 w-5" /> },
  ]

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-950 border-r dark:border-gray-800 h-screen flex flex-col shadow-lg transition-all duration-300",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-800 bg-primary/5">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="bg-primary rounded-md w-8 h-8 flex items-center justify-center">
            <span className="text-white font-bold">A</span>
          </div>
          {!collapsed && <h1 className="text-xl font-bold">Админ</h1>}
        </Link>
        <Button variant="ghost" size="icon" onClick={toggleCollapse} className="text-gray-500">
          {collapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          )}
        </Button>
      </div>

      {!collapsed && (
        <div className="p-4 border-b dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={userData?.profileImageBase64 || userData?.photoURL || "/admin-interface.png"}
                alt={userData?.displayName || "Admin"}
              />
              <AvatarFallback>
                {userData?.displayName ? userData.displayName.charAt(0).toUpperCase() : "A"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{userData?.displayName || "Админ хэрэглэгч"}</p>
              <p className="text-xs text-muted-foreground">{userData?.email || "admin@example.com"}</p>
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="py-4 px-2">
          {!collapsed && <p className="text-xs font-semibold text-muted-foreground px-2 py-2">ҮНДСЭН ЦЭС</p>}
          <div className="space-y-1 mt-1">
            {mainLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive(link.href) ? "secondary" : "ghost"}
                  className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start font-medium")}
                >
                  <span className={cn("", collapsed ? "" : "mr-3")}>{link.icon}</span>
                  {!collapsed && <span>{link.label}</span>}
                  {!collapsed && link.badge && (
                    <span className="ml-auto bg-primary text-white text-xs rounded-full px-2 py-0.5">{link.badge}</span>
                  )}
                </Button>
              </Link>
            ))}
          </div>

          <Separator className="my-4" />

          {!collapsed && <p className="text-xs font-semibold text-muted-foreground px-2 py-2">КОНТЕНТ</p>}
          <div className="space-y-1 mt-1">
            {contentLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive(link.href) ? "secondary" : "ghost"}
                  className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start font-medium")}
                >
                  <span className={cn("", collapsed ? "" : "mr-3")}>{link.icon}</span>
                  {!collapsed && <span>{link.label}</span>}
                  {!collapsed && link.badge && (
                    <span className="ml-auto bg-primary text-white text-xs rounded-full px-2 py-0.5">{link.badge}</span>
                  )}
                </Button>
              </Link>
            ))}
          </div>

          <Separator className="my-4" />

          {!collapsed && <p className="text-xs font-semibold text-muted-foreground px-2 py-2">СИСТЕМ</p>}
          <div className="space-y-1 mt-1">
            {systemLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive(link.href) ? "secondary" : "ghost"}
                  className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start font-medium")}
                >
                  <span className={cn("", collapsed ? "" : "mr-3")}>{link.icon}</span>
                  {!collapsed && <span>{link.label}</span>}
                  {!collapsed && link.badge && (
                    <span className="ml-auto bg-primary text-white text-xs rounded-full px-2 py-0.5">{link.badge}</span>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </ScrollArea>

      <div className="p-3 border-t dark:border-gray-800 mt-auto">
        <Button
          variant="outline"
          className={cn(
            "w-full border-red-200 dark:border-red-950 hover:bg-red-50 dark:hover:bg-red-950/20",
            collapsed ? "justify-center px-2" : "justify-start text-red-500 hover:text-red-600",
          )}
          onClick={async () => {
            try {
              if (auth) {
                await signOut(auth)
                window.location.href = "/auth/admin-login"
              }
            } catch (error) {
              console.error("Logout error:", error)
            }
          }}
        >
          <LogOut className={cn("h-5 w-5", collapsed ? "" : "mr-3 text-red-500")} />
          {!collapsed && <span>Гарах</span>}
        </Button>
      </div>
    </div>
  )
}
