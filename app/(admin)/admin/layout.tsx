"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import AdminHeader from "@/components/admin/admin-header"
import AdminFooter from "@/components/admin/admin-footer"
import { usePathname, useRouter } from "next/navigation"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { ref, get, set } from "firebase/database"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isInitialized, db } = useFirebase()

  // Check if current path is admin users section
  const isAdminUsersSection = pathname?.includes("/admin/users")

  // Check if we're in development mode or test mode
  const isDevelopmentOrTestMode =
    process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ADMIN_TEST === "true"

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

  // Check if user is admin and redirect if not
  useEffect(() => {
    const checkAdmin = async () => {
      // Хөгжүүлэлтийн горимд автоматаар нэвтрэх
      if (isDevelopmentOrTestMode) {
        console.log("Development mode: bypassing admin authentication")

        // Create test admin user if in development mode
        if (db) {
          await createTestAdminUser()
        }

        setIsLoading(false)
        return
      }

      if (isInitialized) {
        if (!user) {
          router.push("/auth/admin-login?error=not-logged-in")
        } else {
          try {
            // Хэрэглэгчийн мэдээллийг database-ээс авах
            if (!db) {
              console.error("Database not initialized")
              router.push("/auth/admin-login?error=db-not-initialized")
              return
            }

            const userRef = ref(db, `users/${user.uid}`)
            const snapshot = await get(userRef)

            if (snapshot.exists()) {
              const userData = snapshot.val()
              if (userData.isAdmin) {
                setIsLoading(false)
              } else {
                router.push("/auth/admin-login?error=not-admin")
              }
            } else {
              router.push("/auth/admin-login?error=user-not-found")
            }
          } catch (error) {
            console.error("Error checking admin status:", error)
            router.push("/auth/admin-login?error=server")
          }
        }
      }
    }

    checkAdmin()
  }, [user, isInitialized, router, db, isDevelopmentOrTestMode])

  // Initialize the sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("adminSidebarOpen")
    if (savedState !== null) {
      setIsSidebarOpen(savedState === "true")
    } else {
      // Default state based on screen size if not set
      if (typeof window !== "undefined") {
        setIsSidebarOpen(window.innerWidth >= 768)
      }
    }
  }, [])

  // Persist sidebar state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("adminSidebarOpen", String(isSidebarOpen))
    }
  }, [isSidebarOpen])

  // Handle responsive behavior - close on small screens when navigating
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        const isSmallScreen = window.innerWidth < 768
        if (isSmallScreen && isSidebarOpen) {
          setIsSidebarOpen(false)
        } else if (!isSmallScreen && !isSidebarOpen) {
          setIsSidebarOpen(true)
        }
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [isSidebarOpen])

  // Toggle sidebar function that persists
  const toggleSidebar = () => {
    const newState = !isSidebarOpen
    setIsSidebarOpen(newState)
    if (typeof window !== "undefined") {
      localStorage.setItem("adminSidebarOpen", String(newState))
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Ачааллаж байна...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">
      {/* Overlay for mobile when sidebar is open */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 lg:hidden ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar container - fixed position for mobile, static for desktop */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:transition-none lg:transform-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <AdminSidebar isOpen={true} setIsOpen={toggleSidebar} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Only show header if NOT in admin users section */}
        {!isAdminUsersSection && <AdminHeader isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}

        <main
          className={`flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900 ${isAdminUsersSection ? "pt-0" : ""}`}
        >
          <div className="container mx-auto max-w-7xl">{children}</div>
        </main>

        {/* Only show footer if NOT in admin users section */}
        {!isAdminUsersSection && <AdminFooter />}
      </div>
    </div>
  )
}
