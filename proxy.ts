import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const accessToken = req.cookies.get("accessToken")?.value

  const protectedRoutes = ["/dashboard", "/admin"]
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (!isProtected) return NextResponse.next()

  // Only check existence
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Do NOT verify here
  return NextResponse.next()
}
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};