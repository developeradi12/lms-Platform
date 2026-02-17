import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import connectDb from "@/lib/db"
import User from "@/models/User"
import { jwtVerify } from "jose"

export async function POST(req: Request) {
  try {
    await connectDb();

    // cookie se refreshToken nikalna
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get("refreshToken")?.value

    // DB se refreshToken remove (optional but best)
    if (refreshToken) {
      try {
        const secret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET!)
        const { payload }: any = await jwtVerify(refreshToken, secret)
        await User.findByIdAndUpdate(payload.userId, { refreshToken: null })
      } catch (err: any) {
        console.log("Error during logout:", err.message)
      }
    }

    const res = NextResponse.json({ success: true, message: "Logged out" })

    res.cookies.set("accessToken", "", { maxAge: 0, path: "/" })
    res.cookies.set("refreshToken", "", { maxAge: 0, path: "/" })

    return res;
  } catch {
    const res = NextResponse.json({ success: true, message: "Logged out" })
    res.cookies.set("accessToken", "", { maxAge: 0, path: "/" })
    res.cookies.set("refreshToken", "", { maxAge: 0, path: "/" })
    return res
  }
}