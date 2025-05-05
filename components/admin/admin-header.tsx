"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Search, Bell, Menu, User, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useMobile } from "@/hooks/use-mobile"
import { ref, get } from "firebase/database"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define the props interface
export interface AdminHeaderProps {
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

export default function AdminHeader({ isSidebarOpen, toggleSidebar }: AdminHeaderProps) {
  const { user, db } = useFirebase()
  const { isMobile } = useMobile()
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState(3) // Example notification count
  const [userData, setUserData] = useState<any>(null)
  const pathname = usePathname()

  // Check if current path is admin users section
  const isAdminUsersSection = pathname?.includes("/admin/users")

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  // If we're in the admin users section, don't render the header
  if (isAdminUsersSection) {
    return null
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        {/* Mobile menu */}
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <AdminSidebar isOpen={isSidebarOpen} setIsOpen={toggleSidebar} />
            </SheetContent>
          </Sheet>
        )}

        {/* Search */}
        <div className="flex-1 md:grow-0">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Хайх..."
              className="w-full md:w-[200px] lg:w-[300px] pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                variant="destructive"
              >
                {notifications}
              </Badge>
            )}
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={userData?.profileImageBase64 || user?.photoURL || ""}
                    alt={user?.displayName || "Admin"}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "A"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Миний бүртгэл</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Профайл</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Тохиргоо</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 focus:text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Гарах</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
