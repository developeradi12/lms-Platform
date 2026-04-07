import connectDb from "@/lib/db"
import Category from "@/models/Category"
import { Course } from "@/models/Course"
import Enrollment from "@/models/Enrollment";
import Order from "@/models/Order";
import User from "@/models/User"
import { getSession } from "@/utils/session";
import { NextResponse } from "next/server";

// export async function GET() {
//   try {
//     /*Note
//      * countDocuments() works correctly even with millions of 
//        records because MongoDB counts directly at the database level.

//     *  For best performance on large data, make sure filtered fields
//         (like role) are indexed, otherwise it may become slow */
//     await connectDb();
//     const session = await getSession()
//     const userId = session?.userId
//     if (!userId) {
//       return NextResponse.json(
//         { message: "Unauthorized" },
//         { status: 401 }
//       )
//     }

//     //stats
//     const totalCourses = await Course.countDocuments()
//     const totalStudents = await User.countDocuments({ role: "STUDENT" })
//     const totalCategories = await Category.countDocuments()

//     // Total Revenue
//     const revenueData = await Order.aggregate([
//       { $match: { status: "SUCCESS" } },
//       {
//         $group: {
//           _id: null,
//           total: { $sum: "$amount" }
//         }
//       }
//     ])

//     const totalRevenue = revenueData[0]?.total || 0

//     // Monthly Revenue
//     const monthlyRevenue = await Order.aggregate([
//       { $match: { status: "SUCCESS" } },
//       {
//         $group: {
//           _id: { $month: "$createdAt" },
//           revenue: { $sum: "$amount" }
//         }
//       },
//       { $sort: { "_id": 1 } }
//     ])

//     const monthNames = [
//       "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
//     ]

//     const fullYearData = Array.from({ length: 12 }, (_, i) => {
//       const found = monthlyRevenue.find(
//         (item: any) => item._id === i + 1
//       )
//       return {
//         month: monthNames[i + 1],
//         revenue: found?.revenue || 0
//       }
//     })
//     const recentEnrollments = await Enrollment.find()
//       .populate("user", "name email")
//       .populate("course", "title")
//       .sort({ createdAt: -1 })
//       .limit(5)

//     const topSellingCourses = await Order.aggregate([
//       { $match: { status: "SUCCESS" } },
//       {
//         $group: {
//           _id: "$course",
//           totalSales: { $sum: 1 },
//           revenue: { $sum: "$amount" }
//         }
//       },
//       { $sort: { totalSales: -1 } },
//       { $limit: 5 },
//       {
//         $lookup: {
//           from: "courses",
//           localField: "_id",
//           foreignField: "_id",
//           as: "course"
//         }
//       },
//       { $unwind: "$course" }
//     ])
//     return NextResponse.json({
//       stats: {
//         totalCourses,
//         totalStudents,
//         totalCategories,
//         totalRevenue
//       },
//       revenueChart: fullYearData,
//       recentEnrollments,
//       topSellingCourses
//     })

//   } catch (error) {
//     return Response.json(
//       { message: "Dashboard Error", error },
//       { status: 500 }
//     )
//   }
// }


export async function GET() {
  try {
    await connectDb()

    // 🔐 Auth
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // ⚡ Run independent queries in parallel
    const [
      totalCourses,
      totalStudents,
      totalCategories,
      revenueData,
      monthlyRevenue,
      recentEnrollments,
      topSellingCourses
    ] = await Promise.all([

      //  Stats
      Course.countDocuments(),
      User.countDocuments({ role: "STUDENT" }),
      Category.countDocuments(),

      //  Total Revenue
      Order.aggregate([
        { $match: { status: "SUCCESS" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }
          }
        }
      ]),

      //  Monthly Revenue
      Order.aggregate([
        { $match: { status: "SUCCESS" } },
        {
          $group: {
            _id: { $month: "$createdAt" },
            revenue: { $sum: "$amount" }
          }
        }
      ]),

      //  Recent Enrollments
      Enrollment.find()
        .populate("user", "name email")
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // 🏆 Top Selling Courses
      Order.aggregate([
        { $match: { status: "SUCCESS" } },
        {
          $group: {
            _id: "$course",
            totalSales: { $sum: 1 },
            revenue: { $sum: "$amount" }
          }
        },
        { $sort: { totalSales: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "courses",
            localField: "_id",
            foreignField: "_id",
            as: "course"
          }
        },
        { $unwind: "$course" },
        {
          $project: {
            totalSales: 1,
            revenue: 1,
            "course.title": 1
          }
        }
      ])
    ])

    const totalRevenue = revenueData[0]?.total || 0

    //  Fill missing months
    const monthNames = [
      "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]

    const fullYearData = Array.from({ length: 12 }, (_, i) => {
      const found = monthlyRevenue.find(
        (item: any) => item._id === i + 1
      )
      return {
        month: monthNames[i + 1],
        revenue: found?.revenue || 0
      }
    })

    return NextResponse.json({
      stats: {
        totalCourses,
        totalStudents,
        totalCategories,
        totalRevenue
      },
      revenueChart: fullYearData,
      recentEnrollments,
      topSellingCourses
    })

  } catch (error) {
    // console.log("DASHBOARD ERROR:", error)

    return NextResponse.json(
      { message: "Dashboard Error" },
      { status: 500 }
    )
  }
}