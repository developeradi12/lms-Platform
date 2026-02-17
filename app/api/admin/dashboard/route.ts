import Category from "@/models/Category"
import {Course} from "@/models/Course"
import User from "@/models/User"
// import Order from "@/models/Order"

export async function GET() {
  try {
    /*Note
     * countDocuments() works correctly even with millions of 
       records because MongoDB counts directly at the database level.
      
    *  For best performance on large data, make sure filtered fields
        (like role) are indexed, otherwise it may become slow */
    const totalCourses = await Course.countDocuments()
    const totalStudents = await User.countDocuments({ role: "STUDENT" })
    const totalCategories = await Category.countDocuments()

    // Total Revenue
    // const revenueData = await Order.aggregate([
    //   { $match: { status: "completed" } },
    //   {
    //     $group: {
    //       _id: null,
    //       total: { $sum: "$amount" }
    //     }
    //   }
    // ])

    // const totalRevenue = revenueData[0]?.total || 0

    // Monthly Revenue
    // const monthlyRevenue = await Order.aggregate([
    //   { $match: { status: "completed" } },
    //   {
    //     $group: {
    //       _id: { $month: "$createdAt" },
    //       revenue: { $sum: "$amount" }
    //     }
    //   },
    //   { $sort: { "_id": 1 } }
    // ])

    const monthNames = [
      "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]

    // const formattedChart = monthlyRevenue.map((item: any) => ({
    //   month: monthNames[item._id],
    //   revenue: item.revenue
    // }))

    return Response.json({
      stats: {
        totalCourses,
        totalStudents,
        totalCategories,
        // totalRevenue
      },
    //   revenueChart: formattedChart
    })

  } catch (error) {
    return Response.json(
      { message: "Dashboard Error", error },
      { status: 500 }
    )
  }
}
