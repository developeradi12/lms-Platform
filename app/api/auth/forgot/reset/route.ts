import connectDb from "@/lib/db"
import User from "@/models/User"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    await connectDb()

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email & password required" },
        { status: 400 }
      )
    }

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    //  update password (hash handled in schema)
    user.password = password
    await user.save()

    return NextResponse.json({
      success: true,
      message: "Password reset successful",
    })

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    )
  }
}