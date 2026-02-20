import connectDb from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import User from "@/models/User";
import { Course } from "@/models/Course";
import Enrollment from "@/models/Enrollment";

export async function POST(req: Request) {
    try {
        await connectDb();
        const token = (await cookies()).get("accessToken")?.value

        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const decoded: any = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET!
        )
        
        const user = await User.findById(decoded.userId)
        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            )
        }
        const { slug } = await req.json()

        const course = await Course.findOne({ slug })

        if (!course) {
            return NextResponse.json(
                { message: "Course not found" },
                { status: 404 }
            )
        }
        if (course.price > 0) {
            return NextResponse.json(
                { message: "Payment required" },
                { status: 403 }
            )
        }

        const existing = await Enrollment.findOne({
            user: user._id,
            course: course._id,
        })

        if (existing) {
            return NextResponse.json(
                { message: "Already enrolled" },
                { status: 200 }
            )
        }

        const enrollment = await Enrollment.create({
            user: user._id,
            course: course._id,
            enrolledAt: new Date(),
        })

       const  check =   await User.findByIdAndUpdate(user._id, {
            $addToSet: { enrolledCourses: course._id }// Prevents duplicates automatically
        })
        console.log("check",check);

        return NextResponse.json(
            { message: "Enrollment successful" },
            { status: 201 }
        )
    } catch (error) {
        console.error("ENROLL ERROR:", error)
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        )
    }
}