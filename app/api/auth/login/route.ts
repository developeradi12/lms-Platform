import { NextRequest, NextResponse } from "next/server"
import connectDb from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import { signAccessToken, signRefreshToken } from "@/utils/jwt"

export async function POST(req: NextRequest) {
  try {

    // Step-01 : Connet to DB
    await connectDb()

    // Step-02 : Get the data
    const { email, password } = await req.json()

    // Step-03 : Verify data
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email & password required" },
        { status: 400 }
      )
    }
    const user = await User.findOne({ email }).select("+password +refreshToken")

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      )
    }

    const ok = await bcrypt.compare(password, user.password)

    if (!ok) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      )
    }

    const accessToken = await signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    const refreshToken = await signRefreshToken({
      userId: user._id.toString(),
      role: user.role,
    })

    // Store refresh token in DB
    user.refreshToken = refreshToken
    await user.save()

    const res = NextResponse.json(
      {
        success: true, message: "Login success",
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    )

    // Cookies (Secure)
    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15,
    })

    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return res
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    )
  }
}