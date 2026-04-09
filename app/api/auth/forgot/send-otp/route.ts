import connectDb from "@/lib/db"
import Otp from "@/models/Otp"
import User from "@/models/User"
import { sendOtpMail } from "@/utils/mailer"
import { generateOtp, hashOtp } from "@/utils/otp"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    await connectDb()

    const { email } = await req.json()

    if (!email?.trim()) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      )
    }

    //  MUST exist for forgot password
    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    //  cooldown (ANTI-SPAM)
    const recentOtp = await Otp.findOne({
      email,
      purpose: "FORGOT_PASSWORD",
    })

    if (recentOtp && recentOtp.updatedAt > new Date(Date.now() - 30 * 1000)) {
      return NextResponse.json(
        { success: false, message: "Wait 30s before retry" },
        { status: 429 }
      )
    }

    //  generate OTP
    const otp = generateOtp()
    const hashedOtp = await hashOtp(otp)

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    //  delete ONLY forgot OTP
    await Otp.deleteMany({
      email,
      purpose: "FORGOT_PASSWORD",
    })

    //  save OTP
    await Otp.create({
      email,
      otp: hashedOtp,
      purpose: "FORGOT_PASSWORD",
      expiresAt,
    })

    //  send mail
    await sendOtpMail(email, otp)

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    })

  } catch (error: any) {
    console.log("FORGOT OTP ERROR:", error)

    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}


