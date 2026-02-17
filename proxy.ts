import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

/**
 * ROUTE RULES
 */
const ADMIN_ROUTE = "/admin"
const USER_ROUTE = "/dashboard"
const AUTH_ROUTES = ["/login", "/sign_up"]

/**
 * JWT Verify Helper
 */
async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET)

  const { payload } = await jwtVerify(token, secret)

  return {
    id: payload?.id,
    email: payload?.email,
    role: String(payload?.role || "").toUpperCase(),
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // access token middleware me
  const accessToken = request.cookies.get("accessToken")?.value

  let user: null | { id: any; email: any; role: string } = null

  // 1) If token exists → verify
  if (accessToken) {
    try {
      user = await verifyToken(accessToken)
    } catch (err) {
      // invalid/expired token
      user = null
    }
  }

  /**
   * 2) PROTECT ADMIN ROUTES
   */
  if (pathname.startsWith(ADMIN_ROUTE)) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    if (user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  /**
   * 3) PROTECT USER DASHBOARD ROUTES
   */
  if (pathname.startsWith(USER_ROUTE)) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  /**
   * 4) Prevent logged-in users visiting login/signup
   */
  if (user && AUTH_ROUTES.includes(pathname)) {
    if (user.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }

    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

/**
 * ⚡ MATCHER (PERFORMANCE)
 */
export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/login",
    "/sign_up",
  ],
}


// Proxy      →  Are you logged in?
// API        →  Who are you?
// DB         →  Are you allowed?
