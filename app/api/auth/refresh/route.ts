// app/api/auth/refresh/route.ts

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import connectDb from "@/lib/db"
import User from "@/models/User"
import { signAccessToken, verifyRefreshToken } from "@/utils/jwt"

export async function POST() {
  try {
    await connectDb()

    const cookieStore = await cookies()
    const refreshToken = cookieStore.get("refreshToken")?.value

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token provided" },
        { status: 401 }
      );
    }
    const payload = await verifyRefreshToken(refreshToken)
    const user = await User.findById(payload.userId).select("+refreshToken");
    if (!user || user.refreshToken !== refreshToken) {
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 403 }
      );
    }

    // Generate new access token
    const newAccessToken = await signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    const res = NextResponse.json({ success: true })

    res.cookies.set("accessToken", newAccessToken, {
      httpOnly: true, // Protects from XSS attacks
      secure: process.env.NODE_ENV === "production",  //Cookie will be sent ONLY over HTTPS
      sameSite: "strict", //This prevents CSRF attacks.
      path: "/",
      maxAge: 60 * 15,
    })

    return res
  } catch {
    return (
      NextResponse.json(
        { success: false, message: "Session expired" },
        { status: 401 }
      )
    )
  }
}