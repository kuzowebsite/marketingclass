import type React from "react"
import { ModernHeader } from "@/components/ui-redesign/modern-header"
import { ModernFooter } from "@/components/ui-redesign/modern-footer"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ModernHeader />
      <main className="min-h-screen">{children}</main>
      <ModernFooter />
      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </>
  )
}
