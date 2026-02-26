// app/api/wishlist/route.ts

import { NextResponse } from "next/server"
import connectDb from "@/lib/db"
import User from "@/models/User"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"

export async function GET() {
  try {
    await connectDb()

    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET!)
    const { payload } = await jwtVerify(accessToken, secret)

    const user = await User.findById(payload.userId).populate("wishlist")

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      wishlist: user.wishlist,
    })
  } catch {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}