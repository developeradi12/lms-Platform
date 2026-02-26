import connectDb from "@/lib/db"
import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/getAuthUser"
import { Course } from "@/models/Course"
import Enrollment from "@/models/Enrollment"
import Progress from "@/models/Progress"

export async function POST(req: Request) {
    try {
        await connectDb()

        // 🔐 Get logged in user
        const user = await getAuthUser()
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            )
        }

        const { slug } = await req.json()

        if (!slug) {
            return NextResponse.json(
                { success: false, message: "Course slug required" },
                { status: 400 }
            )
        }

        // 🔍 Find course
        const course = await Course.findOne({ slug })
        if (!course) {
            return NextResponse.json(
                { success: false, message: "Course not found" },
                { status: 404 }
            )
        }

        // 💰 Free course check
        if (course.price > 0) {
            return NextResponse.json(
                { success: false, message: "Payment required" },
                { status: 403 }
            )
        }

        // 🚫 Check if already enrolled
        const existing = await Enrollment.findOne({
            user: user._id,
            course: course._id,
        })

        if (existing) {
            return NextResponse.json({
                success: true,
                message: "Already enrolled",
            })
        }

        // ✅ Create enrollment
        await Enrollment.create({
            user: user._id,
            course: course._id,
            progress: 0,
            enrolledAt: new Date(),
        })

        return NextResponse.json(
            { success: true, message: "Enrollment successful" },
            { status: 201 }
        )
    } catch (error) {
        console.error("ENROLL ERROR:", error)
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        await connectDb()

        const user = await getAuthUser()
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            )
        }

        const enrollments = await Enrollment.find({
            user: user._id,
            status: "ACTIVE",
        })
            .populate({
                path: "course",
                populate: [
                    {
                        path: "categories",
                        select: "name",
                    },
                    {
                        path: "instructor",
                        select: "name",
                    },
                ],
            })
            .lean()


        // 2️⃣ Get progress records
        const progressRecords = await Progress.find({
            user: user._id
        }).lean()

        // 3️⃣ Format data with real progress calculation

        const formatted = enrollments.map((enrollment: any) => {
            return {
                _id: enrollment.course._id,
                title: enrollment.course.title,
                slug: enrollment.course.slug,
                categories: enrollment.course.categories,
                level: enrollment.course.level,
                instructor:
                    enrollment.course.instructor?.name || "Unknown",
                totalLessons: enrollment.course.totalLessons,
                totalDuration: enrollment.course.duration,
                thumbnail: enrollment.course.thumbnail,

                // ✅ Directly use enrollment progress
                progress: enrollment.progress || 0,
            }
        })

        return NextResponse.json({
            success: true,
            data: formatted,
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        )
    }
}