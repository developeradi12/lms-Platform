import { NextResponse } from "next/server"
import crypto from "crypto"
import Enrollment from "@/models/Enrollment"
import { getSession } from "@/utils/session"
import connectDb from "@/lib/db"

import { Course } from "@/models/Course"
import Order from "@/models/Order"
import User from "@/models/User"

export async function POST(req: Request) {
  try {
    await connectDb()
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      courseId
    } = await req.json()

    const body = razorpayOrderId + "|" + razorpayPaymentId

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET!)
      .update(body)
      .digest("hex")

    const isValid = expectedSignature === razorpaySignature

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      )
    }
    const payload = await getSession()
    const Id = payload?.userId


    //fetch course 
    const course = await Course.findById(courseId)
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      )
    }

    const amount = course.price

    //  Prevent Duplicate Orders
    const existingOrder = await Order.findOne({
      paymentId: razorpayPaymentId
    })
    if (!existingOrder) {
      //  Create Order 
      await Order.create({
        user: Id,
        course: courseId,
        amount: amount,
        paymentId: razorpayPaymentId,
        orderId: razorpayOrderId,
        status: "SUCCESS",
      })
    }

    //  Prevent duplicate enrollment
    const already = await Enrollment.findOne({
      user: Id,
      course: courseId,
    })
    if (!already) {
      const enrollment = await Enrollment.create({
        user: Id,
        course: courseId,
      })

      await Course.findByIdAndUpdate(
        //Increment only when NEW enrollment
        courseId,
        { $inc: { totalEnrollments: 1 } }
      )

      // push enrollment into user
      await User.findByIdAndUpdate(Id, {
        $push: {
          enrolledCourses: enrollment._id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified & enrolled",
    })
  } catch (error: any) {
    console.log("VERIFY ERROR:", error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}