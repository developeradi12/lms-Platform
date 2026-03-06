import { NextResponse } from "next/server"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY!,
  key_secret: process.env.RAZORPAY_SECRET!,
})

export async function POST(req: Request) {
  try {
    const { amount } = await req.json()

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json(order)

  } catch (error) {
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 }
    )
  }
}