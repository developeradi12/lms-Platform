import connectDb from "@/lib/db"
import User from "@/models/User"
import { verifyResetToken } from "@/utils/jwt"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    await connectDb()

    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password required" },
        { status: 400 }
      )
    }
    //  Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    //  Verify token
    let email: string

    try {
      const decoded = await verifyResetToken(token)
      email = decoded.email
    } catch (err: any) {
      console.error("Token verification failed:", err.message)

      return NextResponse.json(
        { message: err.message },
        { status: 400 }
      )
    }

    //  Find user
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