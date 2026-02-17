import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import connectDb from "@/lib/db"
import User from "@/models/User"
import { jwtVerify } from "jose"

export async function GET(req: NextRequest) {
  try {
    await connectDb()

    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const accessSecret = new TextEncoder().encode(
      process.env.ACCESS_TOKEN_SECRET!
    )

    const { payload }: any = await jwtVerify(accessToken, accessSecret)

    const user = await User.findById(payload.userId).select("name role email")
    
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }


    return NextResponse.json(
      {
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    )
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}