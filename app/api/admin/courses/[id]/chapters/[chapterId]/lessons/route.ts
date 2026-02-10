import connectDb from "@/lib/db"
import Lesson from "@/models/Lesson"
import Chapter from "@/models/Chapter"
import mongoose from "mongoose"
import { NextResponse } from "next/server"

type Params = {
  params: Promise<{ chapterId: string }>
}

// ✅ GET: all lessons of chapter
export async function GET(req: Request, { params }: Params) {
  try {
    await connectDb()

    const { chapterId } = await params

    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return NextResponse.json(
        { success: false, message: "Invalid chapterId" },
        { status: 400 }
      )
    }

    const lessons = await Lesson.find({ chapter: chapterId })
      .sort({ order: 1, createdAt: 1 })
      .lean()

    return NextResponse.json({ success: true, lessons }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch lessons" },
      { status: 500 }
    )
  }
}

// ✅ POST: create lesson inside chapter
export async function POST(req: Request, { params }: Params) {
  try {
    await connectDb()

    const { chapterId } = await params

    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return NextResponse.json(
        { success: false, message: "Invalid chapterId" },
        { status: 400 }
      )
    }

    // (Optional) check chapter exists
    const chapterExists = await Chapter.findById(chapterId).select("_id").lean()
    if (!chapterExists) {
      return NextResponse.json(
        { success: false, message: "Chapter not found" },
        { status: 404 }
      )
    }

    // ✅ For now JSON body (URL based)
    // If you want upload: replace this with req.formData()
    const body = await req.json()
    const { title, description, videoUrl, duration, isFreePreview } = body

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      )
    }
    const lastLesson = await Lesson.findOne({ chapter: chapterId })
      .sort({ order: -1 })
      .select("order")

    const finalOrder = (lastLesson?.order ?? 0) + 1
    const lesson = await Lesson.create({
      title: title.trim(),
      chapter: chapterId,
      description:description,
      videoUrl: videoUrl || "",
      duration: Number(duration) || 0,
      order: finalOrder,
      isFreePreview: Boolean(isFreePreview),
    })
    await Chapter.findByIdAndUpdate(chapterId, {
      $push: { lessons: lesson._id },
    })


    return NextResponse.json(
      { success: true, message: "Lesson created", lesson },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create lesson" },
      { status: 500 }
    )
  }
}
