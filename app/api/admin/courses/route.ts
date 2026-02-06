import { NextResponse } from "next/server"
import connectDb from "@/lib/db"
import Course from "@/models/Course"


export async function GET() {
    try {
        await connectDb()

        const courses = await Course.find().populate("category").populate("instructor").sort({ createdAt: -1 })
        return NextResponse.json({ success: true, courses }, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    try {
        await connectDb()

        const body = await req.json()
        const course = await Course.create(body)

        return NextResponse.json(
            { success: true, message: "Course created", course },
            { status: 201 }
        )
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}