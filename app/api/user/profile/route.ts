import connectDb from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import User from "@/models/User";

export async function GET() {
    try {
        await connectDb();
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value

        if (!accessToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const decoded: any = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!)
        // console.log(decoded);
        const user = await User.findById(decoded.userId).select({
            name: 1,
            email: 1,
            role: 1,
            createdAt: 1,
            password: 0 // Explicitly force password out
        });
        // console.log(user);
        return NextResponse.json({ user })
    } catch (error) {
        return NextResponse.json({ message: "Server error" }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        await connectDb()

        const token = (await cookies()).get("accessToken")?.value
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

        const decoded: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!)

        const body = await req.json()

        const updatedUser = await User.findByIdAndUpdate(
            decoded.userId,
            {
                name: body.name,
                email: body.email,
            },
            { new: true }
        ).select("name email  role createdAt")

        return NextResponse.json({ message: "Profile updated", user: updatedUser })
    } catch (error) {
        return NextResponse.json({ message: "Server error" }, { status: 500 })
    }
}