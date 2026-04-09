import connectDb from "@/lib/db"
import Otp from "@/models/Otp"
import { signAccessToken, signResetToken } from "@/utils/jwt"
import { verifyOtp } from "@/utils/otp"
import { NextResponse } from "next/server"


export async function POST(req: Request) {
  try {
    await connectDb()

    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP required" },
        { status: 400 }
      )
    }

    const otpDoc = await Otp.findOne({
      email,
      purpose: "FORGOT_PASSWORD",
    })

    if (!otpDoc) {
      return NextResponse.json(
        { message: "OTP not found" },
        { status: 404 }
      )
    }

    if (otpDoc.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpDoc._id })
      return NextResponse.json(
        { message: "OTP expired" },
        { status: 400 }
      )
    }

    const isValid = await verifyOtp(otp, otpDoc.otp)

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      )
    }

    //  delete OTP
    await Otp.deleteOne({ _id: otpDoc._id })

    //  generate RESET TOKEN (NOT access token)
    const resetToken = await signResetToken({ email })

    return NextResponse.json({
      success: true,
      resetToken,
    })

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    )
  }
}