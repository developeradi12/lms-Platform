import connectDb from "@/lib/db"
import Lesson from "@/models/Lesson"
import mongoose from "mongoose"
import { NextResponse } from "next/server"

type Params = {
  params: Promise<{ lessonId: string }>
}

// ✅ GET: single lesson
export async function GET(req: Request, { params }: Params) {
  try {
    await connectDb()
    const  {lessonId}  = await params
    console.log("GET lessonId", lessonId)
    const lesson = await Lesson.findOne({slug:lessonId}).lean()
      console.log("found lesson", lesson)
    if (!lesson) {
      return NextResponse.json(
        { success: false, message: "Lesson not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, lesson }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch lesson" },
      { status: 500 }
    )
  }
}

// ✅ PATCH: update lesson
export async function PATCH(req: Request, { params }: Params) {
  try {
    await connectDb()

    const { lessonId } = await params
   
    const body = await req.json()
    const { title,description, videoUrl, duration, order, isFreePreview } = body

    const updated = await Lesson.findOneAndUpdate(
      { slug: lessonId },
      {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(description !== undefined ? { description: description.trim() } : {}),
        ...(videoUrl !== undefined ? { videoUrl: videoUrl || "" } : {}),
        ...(duration !== undefined ? { duration: Number(duration) || 0 } : {}),
        ...(order !== undefined ? { order: Number(order) || 0 } : {}),
        ...(isFreePreview !== undefined
          ? { isFreePreview: Boolean(isFreePreview) }
          : {}),
      },
      { new: true }
    )

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Lesson not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Lesson updated",
      lesson: updated,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Update failed" },
      { status: 500 }
    )
  }
}

// ✅ DELETE: delete lesson
export async function DELETE(req: Request, { params }: Params) {
  try {
    await connectDb()

    const { lessonId } = await params

    const deleted = await Lesson.findOneAndDelete({ slug: lessonId })

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Lesson not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Lesson deleted",
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Delete failed" },
      { status: 500 }
    )
  }
}
