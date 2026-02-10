import { NextResponse } from "next/server"
import connectDb from "@/lib/db"
import Course from "@/models/Course"
import mongoose from "mongoose"
import "@/models/Category"
import "@/models/User"
import "@/models/Chapter"
import "@/models/Lesson"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb()
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid course id" },
        { status: 400 }
      )
    }

    const course = await Course.findById(id)
      .populate("category")
      .populate("instructor")
      .populate({
        path: "chapters",
        select: "title lessons",
        populate: {
          path: "lessons",
          select: "title duration",
        },
      })
      
        if(!course) {
          return NextResponse.json(
            { success: false, message: "Course not found" },
            { status: 404 }
          )
        }

    return NextResponse.json({ success: true, course }, { status: 200 })
      } catch (error: any) {
        console.log("GET COURSES ERROR:", error)

        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        )
      }
  }

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      await connectDb()
      const { id } = await params

      const body = await req.json()

      const updated = await Course.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      })

      if (!updated) {
        return NextResponse.json(
          { success: false, message: "Course not found" },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { success: true, message: "Course updated", course: updated },
        { status: 200 }
      )
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }
  }

  export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      await connectDb()
      const { id } = await params

      const deleted = await Course.findByIdAndDelete(id)

      if (!deleted) {
        return NextResponse.json(
          { success: false, message: "Course not found" },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { success: true, message: "Course deleted" },
        { status: 200 }
      )
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }
  }
