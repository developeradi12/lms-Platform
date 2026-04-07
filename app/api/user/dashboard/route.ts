import { NextResponse } from "next/server"
import connectDb from "@/lib/db"
import Order from "@/models/Order"
import Enrollment from "@/models/Enrollment"
import { getSession } from "@/utils/session"
import "@/models/Course"
import mongoose from "mongoose"

export const revalidate = 60 // cache

export async function GET() {
  try {
    await connectDb()

    //  Auth
    const session = await getSession()
    const userId = session?.userId
    // console.log(userId);

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }
    const userObjectId = new mongoose.Types.ObjectId(userId)
    //  Parallel queries
    const [
      orders,
      enrollments,
      totalSpentData
    ] = await Promise.all([

      //  Orders
      Order.find({ user: userId, status: "SUCCESS" })
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .lean(),

      //  Enrollments
      Enrollment.find({ user: userObjectId })
        .populate("course", "title")
        .lean(),

      //  Total Spending
      Order.aggregate([
        { $match: { user: userObjectId, status: "SUCCESS" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }
          }
        }
      ])
    ])

    const totalSpent = totalSpentData[0]?.total || 0

    //  Stats
    const enrolledCourses = enrollments.length

    const completedCourses = enrollments.filter(
      (e: any) => e.progress === 100
    ).length

    const totalHours = Math.round(
      enrollments.reduce(
        (acc: number, e: any) => acc + (e.totalDuration || 0),
        0
      ) / 60
    )

    //  Monthly Spending Chart
    const monthlySpending = await Order.aggregate([
      { $match: { user: userObjectId, status: "SUCCESS" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ])

    const monthNames = [
      "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]

    const spendingChart = Array.from({ length: 12 }, (_, i) => {
      const found = monthlySpending.find(
        (item: any) => item._id === i + 1
      )

      return {
        month: monthNames[i + 1],
        amount: found?.total || 0
      }
    })

    return NextResponse.json({
      stats: {
        enrolledCourses,
        completedCourses,
        totalHours,
        totalSpent
      },
      orders,
      enrollments,
      spendingChart
    })

  } catch (error) {
    console.log("USER DASHBOARD ERROR:", error)

    return NextResponse.json(
      { message: "Dashboard error" },
      { status: 500 }
    )
  }
}