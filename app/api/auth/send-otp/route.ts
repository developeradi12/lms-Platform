import connectDb from "@/lib/db";
import Otp from "@/models/Otp";
import User from "@/models/User";
import { sendOtpMail } from "@/utils/mailer";
import { generateOtp, hashOtp } from "@/utils/otp";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    await connectDb();

    const body = await req.json();
    const { email } = body;

    if (!email?.trim()) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      )
    }
    // If user already exists & verified
    const existing = await User.findOne({ email,purpose:"SIGNUP" })
    if (existing && existing.isVerified) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 }
      )
    }

    // 1) Generate OTP
    const otp = generateOtp();

    // 2) Hash OTP
    const hashedOtp = await hashOtp(otp);


    // 3) Expiry (5 min)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    // 4) Purana OTP delete (same email)
    await Otp.deleteMany({ email }) //deleteMany safer hai (agar kabhi duplicate create ho gaye).

    // 5) Save OTP
    await Otp.create({
      email,
      otp: hashedOtp,
      purpose: "SIGNUP",
      expiresAt,
    })

    // 6) Send Mail
    await sendOtpMail(email, otp);
    return NextResponse.json(
      { success: true, message: "OTP sent successfully" },
      { status: 200 }
    )
  } catch (error: any) {
    console.log("SEND OTP ERROR:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}