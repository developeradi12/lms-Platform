import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(req: Request) {

  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  } = await req.json()

  const body = razorpayOrderId + "|" + razorpayPaymentId

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET!)
    .update(body)
    .digest("hex")

  const isValid = expectedSignature === razorpaySignature

  if (isValid) {
    return NextResponse.json({
      success: true,
      message: "Payment verified"
    })
  }

  return NextResponse.json(
    { success: false },
    { status: 400 }
  )
}