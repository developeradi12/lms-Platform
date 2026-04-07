import { NextResponse } from "next/server"
import connectDb from "@/lib/db"
import Order from "@/models/Order"
import { getSession } from "@/utils/session"

export const revalidate = 60 //  cache for performance

export async function GET(req: Request) {
  try {
    await connectDb()

    //  Auth check
    const session = await getSession()
    const userId = session?.userId
    const role = session?.role

    if (!userId || role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    //  Query params (for filters)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") // SUCCESS / FAILED
    const page = Number(searchParams.get("page") || 1)
    const limit = Number(searchParams.get("limit") || 10)

    const skip = (page - 1) * limit

    //  Build filter
    const filter: any = {}
    if (status) filter.status = status

    //  Fetch Orders
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("course", "title price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    //  Total count (for pagination)
    const total = await Order.countDocuments(filter)

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    })

  } catch (error) {
    console.log("ADMIN ORDERS ERROR:", error)

    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}