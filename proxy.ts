import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const accessToken = req.cookies.get("accessToken")?.value


  // ─── Public routes — skip all checks ───────────────────────────
  const isAuthRoute = ["/login", "/sign_up", "/verify-otp"]
    .some(p => pathname.startsWith(p))
  const isAdminPage = pathname.startsWith("/admin")
  const isAdminApi = pathname.startsWith("/api/admin")   // ✅ was missing
  const isDashboardPage = pathname.startsWith("/dashboard")

  // ─── Auth pages — if already logged in, redirect away ──────────
  if (isAuthRoute) {
    if (!accessToken) return NextResponse.next() // not logged in → show login

    try {
      const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET!)
      const { payload } = await jwtVerify(accessToken, secret)
      // console.log("Token valid, payload:", payload)
      // Already logged in — send to the right place
      if (payload.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url))
      }
      return NextResponse.redirect(new URL("/dashboard", req.url))
    } catch {
      // Token expired — let them see login
      return NextResponse.next()
    }
  }
  if (!isAdminPage && !isDashboardPage) {
    return NextResponse.next()
  }

  // ─── No token at all — send to login ───────────────────────────
  if (!accessToken) {
    if (isAdminApi) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // ─── Admin routes — verify token + check role ──────────────────
  if (isAdminPage || isAdminApi) {
    try {
      const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET!)
      const { payload } = await jwtVerify(accessToken, secret)
      if (payload.role !== "ADMIN") {
        if (isAdminApi) {
          return NextResponse.json(
            { success: false, message: "Forbidden" },
            { status: 403 }
          )
        }
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    } catch {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // ─── Dashboard routes — token existence is enough ──────────────
  // Full verification happens inside each API route handler
  return NextResponse.next()
}


export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}