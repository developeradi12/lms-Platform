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
      return logoutResponse()
    }
    const payload = await verifyRefreshToken(refreshToken)
    console.log("payload", payload);
    const user = await User.findById(payload.userId)

    if (!user || user.refreshToken !== refreshToken) {
      return logoutResponse()
    }

    // Generate new access token
    const newAccessToken = await signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    const res = NextResponse.json({ success: true })

    res.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 2,
    })

    return res
  } catch {
    return logoutResponse()
  }
}

/**
 * 🔥 Logout Helper
 */
function logoutResponse() {
  const res = NextResponse.json(
    { success: false, message: "Session expired" },
    { status: 401 }
  )

  res.cookies.set("accessToken", "", { maxAge: 0, path: "/" })
  res.cookies.set("refreshToken", "", { maxAge: 0, path: "/" })

  return res
}