import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;

  const isAdminRoute = pathname.startsWith("/admin");
  const isProtected =
    pathname.startsWith("/dashboard") || isAdminRoute;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/sign_up");

  const isApiAuth = pathname.startsWith("/api/auth");

  //  Allow auth APIs always
  if (isApiAuth) {
    return NextResponse.next();
  }

  //  No token → block protected
  if (isProtected && !accessToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  let userRole: string | null = null;

  if (accessToken) {
    try {
      const secret = new TextEncoder().encode(
        process.env.ACCESS_TOKEN_SECRET!
      );

      const { payload } = await jwtVerify(accessToken, secret);

      userRole = payload.role as string;
    } catch (err) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  //  Block login/signup if already logged in
  if (isAuthPage && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  //   ADMIN PROTECTION
  if (isAdminRoute && userRole !== "ADMIN") {
  return NextResponse.redirect(new URL("/dashboard", req.url));
}

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};