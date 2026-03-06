import connectDb from "@/lib/db"
import { NextResponse } from "next/server"
import { Course } from "@/models/Course"
import Enrollment from "@/models/Enrollment"
import Progress from "@/models/Progress"
import { getSession } from "@/utils/session"
import User from "@/models/User"
import "@/models/Chapter"
import "@/models/Lesson"
export async function POST(req: Request) {
    try {
        await connectDb()
        const session = await getSession();
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
            user: session?.userId,
            course: course._id,
        })

        if (existing) {
            return NextResponse.json({
                success: true,
                message: "Already enrolled",
            })
        }
        const progress = await Progress.create({
            user: session?.userId,
            course: course._id,
            completedLessons: []
        })

        const enrollment = await Enrollment.create({
            user: session?.userId,
            course: course._id,
            progress: progress._id,
        })

        // update user
        await User.findByIdAndUpdate(session?.userId, {
            $push: { enrolledCourses: enrollment._id }
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
        const session = await getSession();
        const enrollments = await Enrollment.find({
            user: session?.userId,
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
                        select: "name bio",
                    },
                    {
                        path: "chapters",
                        populate: {
                            path: "lessons",
                        },
                    },
                ],
            })
            .lean();

        const progressList = await Progress.find({
            user: session?.userId,
        }).lean();
        const progressMap = new Map();

        progressList.forEach((p: any) => {
            progressMap.set(p.course.toString(), p)
        })
        // 3️⃣ Format data with real progress calculation

        const formatted = enrollments.map((enrollment: any) => {

            const courseId = enrollment.course._id.toString()

            const progressDoc = progressMap.get(courseId)

            const percentage = progressDoc?.percentage || 0

            return {
                _id: enrollment._id.toString(),

                course: {
                    _id: courseId,
                    title: enrollment.course.title,
                    slug: enrollment.course.slug,
                    description: enrollment.course.description,
                    thumbnail: enrollment.course.thumbnail,
                    price: enrollment.course.price,
                    level: enrollment.course.level,
                    duration: enrollment.course.duration,
                    instructor: enrollment.course.instructor,
                    categories: enrollment.course.categories,
                    chapters: enrollment.course.chapters,
                },

                progress: {
                    _id: progressDoc?._id || null,
                    percentage,
                    completedLessons: progressDoc?.completedLessons || [],
                    isCompleted: percentage === 100,
                    completedAt: progressDoc?.completedAt || null,
                },

                enrolledAt: enrollment.enrolledAt,
                status: enrollment.status,
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