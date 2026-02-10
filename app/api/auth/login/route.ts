import { NextResponse } from "next/server"
import connectDb from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import { signAccessToken, signRefreshToken } from "@/utils/jwt"

export async function POST(req: Request) {
  try {
    await connectDb()

    const body = await req.json()
    const { email, password } = body

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      )
    }

    // find user
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      )
    }

    //  compare password
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      )
    }

    const accessToken = signAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    })

    const refreshToken = signRefreshToken({
      userId: user._id,
      role: user.role,
    })

    // store refresh token in DB
    user.refreshToken = refreshToken
    await user.save()

    //  response
    const res = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    )

    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    })


    //  set refresh token cookie
    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return res
  } catch (error: any) {
    console.log("LOGIN ERROR:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}
