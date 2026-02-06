
import connectDb from "@/lib/db"
import User from "@/models/User"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {

    await connectDb();
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
    const  {id } = await params ;  // ✅ no await
    console.log("from server", id)
    const user = await User.findById(id).select("-password")

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