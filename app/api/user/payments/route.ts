import { NextResponse } from "next/server"
import connectDb from "@/lib/db"
import Order from "@/models/Order"
import { getSession } from "@/utils/session"

export async function GET() {
  try {
    await connectDb()

    const session = await getSession()
    const userId = session?.userId

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const orders = await Order.find({ user: userId })
      .populate("course", "title price")
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ orders })

  } catch (error) {
    console.log("ORDERS ERROR:", error)

    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}