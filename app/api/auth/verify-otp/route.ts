import connectDb from "@/lib/db"
import Otp from "@/models/Otp"
import User from "@/models/User"
import { signAccessToken, signRefreshToken } from "@/utils/jwt"
import { verifyOtp } from "@/utils/otp"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    await connectDb()

    const body = await req.json()
    const { name, email, password, otp } = body

    if (!name?.trim() || !email?.trim() || !password?.trim() || !otp?.trim()) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      )
    }
    if (otp.length !== 6) {
      return NextResponse.json(
        { success: false, message: "OTP must be 6 digits" },
        { status: 400 }
      )
    }

    // 1) find otp doc
    const otpDoc = await Otp.findOne({ email })

    if (!otpDoc) {
      return NextResponse.json(
        { success: false, message: "OTP not found or expired" },
        { status: 404 }
      )
    }
    // 2) expiry check
    if (otpDoc.expiresAt < new Date()) {
      await Otp.deleteOne({ email })
      return NextResponse.json(
        { success: false, message: "OTP expired" },
        { status: 400 }
      )
    }

    // 3) compare otp
    const isValid = await verifyOtp(otp, otpDoc.otp)

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      )
    }

    // 4) OTP delete (one time use)
    await Otp.deleteOne({ email })

    // 5) find/create user
    let user = await User.findOne({ email })

    if (!user) {
      user = await User.create({
        name,
        email,
        password, // should be hashed in pre-save middleware
        role: "STUDENT",
      })
    }

    // 6) create tokens
    const accessToken = signAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    })

    const refreshToken = signRefreshToken({
      userId: user._id,
      role:user.role
    })

    // 7) store refresh token in DB
    user.refreshToken = refreshToken
    await user.save()

    // 8) set refresh token cookie
    const res = NextResponse.json(
      {
        success: true,
       message: "Signup successful",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
      },
      { status: 200 }
    )

    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return res
  } catch (error: any) {
    console.log("VERIFY OTP ERROR:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}