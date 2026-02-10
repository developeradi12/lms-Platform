import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

/** * ROUTE RULES */
const ADMIN_ROUTE = "/admin"
const USER_DASHBOARD = "/dashboard"
const ADMIN_DASHBOARD = "/admin/dashboard"
const AUTH_ROUTES = ["/login", "/sign_up"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("refreshToken")?.value
  let role = null

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET)

      const { payload } = await jwtVerify(token, secret)
       console.log("payload",payload);
      role = payload.role
    } catch {
      // invalid token
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }
  // Protect admin routes
  if (pathname.startsWith(ADMIN_ROUTE)) {
    if (!token || role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url))
    }

  }

  // Prevent logged-in users visiting login/signup
  if (token && AUTH_ROUTES.includes(pathname)) {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL(ADMIN_DASHBOARD, request.url))
    }

    return NextResponse.redirect(new URL(USER_DASHBOARD, request.url))
  }

  return NextResponse.next()
}
/**
 * ⚡ MATCHER (IMPORTANT FOR PERFORMANCE)
 */
export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
    "/sign_up",
  ],
}



// Proxy      →  Are you logged in?
// API        →  Who are you?
// DB         →  Are you allowed?
