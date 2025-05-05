import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/lib/theme/theme-provider"
import { FirebaseProvider } from "@/lib/firebase/firebase-provider"
import FirebaseConnectionStatus from "@/components/firebase-connection-status"
import { CartProvider } from "@/lib/cart/cart-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MarketingClass.mn",
  description: "Маркетингийн сургалтын платформ",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if the current path is an admin path
  const isAdminPath = (children as any)?.props?.childProp?.segment === "(admin)"

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <FirebaseProvider>
            <CartProvider>
              <FirebaseConnectionStatus />
              {!isAdminPath && <Header />}
              <main className="min-h-screen">{children}</main>
              {!isAdminPath && (
                <>
                  <Footer />
                  <div className="md:hidden">
                    <MobileBottomNav />
                  </div>
                </>
              )}
            </CartProvider>
          </FirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
