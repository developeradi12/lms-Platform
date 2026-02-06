import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import connectDb from "@/lib/db"
import User from "@/models/User"
import jwt from "jsonwebtoken"
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
        const refreshToken = (await cookies()).get("refreshToken")?.value


        if (!refreshToken) {
            return NextResponse.json(
                { success: false, message: "Refresh token missing" },
                { status: 401 }
            )
        }

        // 2) verify refresh token
        let decoded: any
        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!)
        } catch (error) {
            return NextResponse.json(
                { success: false, message: "Invalid or expired refresh token" },
                { status: 401 }
            )
        }

        // 3) DB se user find + refresh token match
        const user = await User.findById(decoded.userId)

        if (!user || user.refreshToken !== refreshToken) {
            return NextResponse.json(
                { success: false, message: "Refresh token mismatch" },
                { status: 401 }
            )
        }

        // 4) new access token generate
        const newAccessToken = signAccessToken({
            userId: user._id,
            email: user.email,
            role: user.role,
        })

        return NextResponse.json(
            {
                success: true,
                message: "Access token refreshed",
                accessToken: newAccessToken,
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.log("REFRESH TOKEN ERROR:", error)
        return NextResponse.json(
            { success: false, message: error.message || "Internal Server Error" },
            { status: 500 }
        )
    }
}
