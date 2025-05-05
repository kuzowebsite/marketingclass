import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isDev = process.env.NODE_ENV === "development"

  // Public paths that don't require authentication
  const isPublicPath =
    path === "/auth/login" ||
    path === "/auth/register" ||
    path === "/auth/forgot-password" ||
    path === "/" ||
    path.startsWith("/blog") ||
    (path.startsWith("/courses") && !path.includes("/lessons")) ||
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/site-info") ||
    path.startsWith("/database-info")

  // Admin paths that require admin authentication
  const isAdminPath = path.startsWith("/admin") || path === "/auth/admin-login"

  // Get the token from cookies
  const token = request.cookies.get("authToken")?.value
  const isAdminToken = request.cookies.get("isAdmin")?.value === "true"

  // In development mode, allow access to admin pages without authentication
  if (isDev && (path === "/auth/admin-login" || path.startsWith("/admin"))) {
    console.log("Development mode: bypassing admin authentication")
    return NextResponse.next()
  }

  // If the user is on an admin path and doesn't have an admin token, redirect to admin login
  if (isAdminPath && (!token || !isAdminToken)) {
    // Don't redirect if already on admin login page
    if (path === "/auth/admin-login") {
      return NextResponse.next()
    }

    // Redirect to admin login with callback URL
    const url = new URL("/auth/admin-login", request.url)
    url.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(url)
  }

  // If the user is on a protected path and doesn't have a token, redirect to login
  if (!isPublicPath && !token) {
    // Don't redirect if already on login page
    if (path === "/auth/login" || path === "/auth/register" || path === "/auth/forgot-password") {
      return NextResponse.next()
    }

    // Redirect to login with callback URL
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(url)
  }

  // If the user is on a login page and has a token, redirect to home
  if ((path === "/auth/login" || path === "/auth/register" || path === "/auth/forgot-password") && token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If the user is on admin login and has an admin token, redirect to admin dashboard
  if (path === "/auth/admin-login" && token && isAdminToken) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
