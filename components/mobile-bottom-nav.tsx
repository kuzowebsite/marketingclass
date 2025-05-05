"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { useCart } from "@/lib/cart/cart-provider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Home, BookOpen, User, ShoppingCart, Menu } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

export function MobileBottomNav() {
  const pathname = usePathname()
  const { user } = useFirebase()
  const { cartItems } = useCart()
  const { isMobile } = useMobile()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  // Hide bottom nav on admin pages or non-mobile devices
  if (pathname.startsWith("/admin") || !isMobile) {
    return null
  }

  const navItems = [
    {
      name: "Нүүр",
      href: "/",
      icon: <Home className="h-5 w-5" />,
      active: pathname === "/",
    },
    {
      name: "Хичээлүүд",
      href: "/courses",
      icon: <BookOpen className="h-5 w-5" />,
      active: pathname === "/courses" || pathname.startsWith("/courses/"),
    },
    {
      name: "Сагс",
      href: "/cart",
      icon: (
        <div className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartItems && cartItems.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
              {cartItems.length}
            </Badge>
          )}
        </div>
      ),
      active: pathname === "/cart",
    },
    {
      name: "Профайл",
      href: user ? "/profile" : "/auth/login",
      icon: <User className="h-5 w-5" />,
      active: pathname === "/profile" || pathname === "/auth/login",
    },
    {
      name: "Цэс",
      href: "#",
      icon: <Menu className="h-5 w-5" />,
      active: false,
      isMenu: true,
    },
  ]

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border py-2 px-4 transition-transform duration-300",
        isVisible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="flex items-center justify-between">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs",
              item.active ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
