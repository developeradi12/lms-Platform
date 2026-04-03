import { NextResponse } from "next/server"
import crypto from "crypto"
import Enrollment from "@/models/Enrollment"
import { getSession } from "@/utils/session"
import connectDb from "@/lib/db"

export async function POST(req: Request) {
  try {
    await connectDb()
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      courseId
    } = await req.json()

    const body = razorpayOrderId + "|" + razorpayPaymentId

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET!)
      .update(body)
      .digest("hex")

    const isValid = expectedSignature === razorpaySignature

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      )
    }
    const payload = await getSession()
    const Id = payload?.userId

    //  Prevent duplicate enrollment
    const already = await Enrollment.findOne({
      user: Id,
      course: courseId,
    })
    if (!already) {
      await Enrollment.create({
        user: Id,
        course: courseId,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified & enrolled",
    })
  } catch (error: any) {
    console.log("VERIFY ERROR:", error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}