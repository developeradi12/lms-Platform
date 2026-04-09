import connectDb from "@/lib/db"
import { NextResponse } from "next/server"
import { Course } from "@/models/Course"
import Enrollment from "@/models/Enrollment"
import Progress from "@/models/Progress"
import { getSession } from "@/utils/session"
import User from "@/models/User"
import "@/models/Chapter"
import "@/models/Lesson"
import mongoose from "mongoose"
import Order from "@/models/Order"

export async function POST(req: Request) {
  const sessionDB = await mongoose.startSession()

  try {
    await connectDb()
    sessionDB.startTransaction()

    const session = await getSession()
    const { slug } = await req.json()

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Course slug required" },
        { status: 400 }
      )
    }

    // Find course
    const course = await Course.findOne({ slug }).session(sessionDB)
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      )
    }

    if (course.price > 0) {
      return NextResponse.json(
        { success: false, message: "Payment required" },
        { status: 403 }
      )
    }

    //  Check existing enrollment
    const existing = await Enrollment.findOne({
      user: session?.userId,
      course: course._id,
    }).session(sessionDB)

    if (existing) {
      await sessionDB.commitTransaction()
      return NextResponse.json({
        success: true,
        message: "Already enrolled",
      })
    }

    //  Create enrollment
    const enrollment = await Enrollment.create(
      [
        {
          user: session?.userId,
          course: course._id,
        },
      ],
      { session: sessionDB }
    )

    //  Create order
    const order = await Order.create(
      [
        {
          user: session?.userId,
          course: course._id,
          amount: course.price,
          currency: "INR",
          status: "SUCCESS",
          paymentId: `FREE-${enrollment[0]._id}`,
          orderId: `ORDER-${enrollment[0]._id}`,
        },
      ],
      { session: sessionDB }
    )

    //  Update user (single query)
    await User.findByIdAndUpdate(
      session?.userId,
      {
        $push: {
          enrolledCourses: enrollment[0]._id,
          orders: order[0]._id,
        },
      },
      { session: sessionDB }
    )

    //  Update course count
    await Course.findByIdAndUpdate(
      course._id,
      { $inc: { totalEnrollments: 1 } },
      { session: sessionDB }
    )

    await sessionDB.commitTransaction()

    return NextResponse.json(
      { success: true, message: "Enrollment successful" },
      { status: 201 }
    )
  } catch (error) {
    await sessionDB.abortTransaction()
    console.error("ENROLL ERROR:", error)

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    )
  } finally {
    sessionDB.endSession()
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