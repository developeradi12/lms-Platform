
import connectDb from "@/lib/db"
import User from "@/models/User"
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {

    await connectDb();
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const body = await req.json()
    const { name, email, role } = body


    if (!name || !email || !role) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      )
    }
    const { id } = await context.params

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true }
    ).select("-password")

    return NextResponse.json(
      { success: true, user: updatedUser, message: "User updated successfully" },
      { status: 200 }
    )
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 }
    )
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb()
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params;  // ✅ no await
    // console.log("from server", id)
    const user = await User.findById(id).select("-password")
      .populate({
        path: "wishlist",
        select: "title price thumbnail"
      })
    // .populate({
    //   path: "orders",
    //   select: "title price thumbnail"
    // })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch user" },
      { status: 500 }
    )
  }
}