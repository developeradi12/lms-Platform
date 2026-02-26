// app/api/wishlist/toggle/route.ts

import { NextResponse } from "next/server"
import connectDb from "@/lib/db"
import User from "@/models/User"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    await connectDb()

    const { courseId } = await req.json()

    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET!)
    const { payload } = await jwtVerify(accessToken, secret)

    const user = await User.findById(payload.userId)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const isExist = user.wishlist.includes(courseId)

    if (isExist) {
      user.wishlist.pull(courseId)
    } else {
      user.wishlist.push(courseId)
    }

    await user.save()

    return NextResponse.json({
      success: true,
      added: !isExist,
    })
  } catch (err) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}