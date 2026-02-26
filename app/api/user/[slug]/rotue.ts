import { NextRequest, NextResponse } from "next/server"
import connectDb from "@/lib/db"
import User from "@/models/User"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDb()

    const user = await User.findById(params.id)
      .populate("enrolledCourses")
      .populate("wishlist")
      .lean()

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}