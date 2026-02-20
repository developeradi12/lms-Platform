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

/**
 * ✅ MIDDLEWARE (Correct Export)
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get("accessToken")?.value
  const refreshToken = request.cookies.get("refreshToken")?.value

  let user: null | { id: any; email: any; role: string } = null

  // 1️⃣ Verify access token
  if (accessToken) {
    try {
      user = await verifyToken(accessToken)
    } catch (err) {
      // Access token invalid → try refresh
      if (refreshToken) {
        try {
          const refreshRes = await fetch(
            `${request.nextUrl.origin}/api/auth/refresh`,
            {
              method: "POST",
              headers: {
                Cookie: `refreshToken=${refreshToken}`,
                "Content-Type": "application/json",
              },
            }
          )

          if (refreshRes.ok) {
            const response = NextResponse.next()

            const setCookieHeaders = refreshRes.headers.getSetCookie()

            setCookieHeaders.forEach((cookie) => {
              response.headers.append("Set-Cookie", cookie)
            })

            return response
          }
        } catch (refreshErr) {
          console.error("Silent refresh failed")
        }
      }

      user = null
    }
  }

  /**
   * 2️⃣ PROTECT ADMIN ROUTES
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
   * 3️⃣ PROTECT USER DASHBOARD
   */
  if (pathname.startsWith(USER_ROUTE)) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  /**
   * 4️⃣ Prevent logged-in users from login/signup
   */
  if (user && AUTH_ROUTES.includes(pathname)) {
    if (user.role === "ADMIN") {
      return NextResponse.redirect(
        new URL("/admin/dashboard", request.url)
      )
    }

    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

/**
 * ⚡ MATCHER
 */
export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/courses/:courseId/learn",
    "/login",
    "/sign_up",
  ],
}
// Proxy      →  Are you logged in?
// API        →  Who are you?
// DB         →  Are you allowed?
