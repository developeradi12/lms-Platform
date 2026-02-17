import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import connectDb from "@/lib/db"
import User from "@/models/User"
import { jwtVerify } from "jose"
import { signAccessToken } from "@/utils/jwt"

export async function POST(req: Request) {
    try {
        await connectDb()

        // 1) cookie se refresh token read

        // old version 
        //   const cookieHeader = req.headers.get("cookie") || ""
        // const refreshToken = cookieHeader
        //     .split("; ")
        //     .find((row) => row.startsWith("refreshToken="))
        //     ?.split("=")[1] 


        // new version to fetch token from cookie 
        const cookieStore = await cookies()
        const refreshToken = cookieStore.get("refreshToken")?.value


        if (!refreshToken) {
            return NextResponse.json(
                { success: false, message: "Refresh token missing" },
                { status: 401 }
            )
        }

        // 2) verify refresh token
        let payload: any
        try {
            const secret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET!)
            const verified = await jwtVerify(refreshToken, secret)
            payload = verified.payload
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid refresh token" },
                { status: 401 }
            )
        }

        // 3) DB se user find + refresh token match
        const user = await User.findById(payload.userId)

        if (!user || user.refreshToken !== refreshToken) {
            return NextResponse.json(
                { success: false, message: "Refresh token mismatch" },
                { status: 401 }
            )
        }

        // Create new access token
        const newAccessToken = await signAccessToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        })

        const res = NextResponse.json(
            { success: true, message: "Access token refreshed" },
            { status: 200 }
        )

        res.cookies.set("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 15,
        })

        return res
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err.message || "Server error" },
            { status: 500 }
        )
    }
}