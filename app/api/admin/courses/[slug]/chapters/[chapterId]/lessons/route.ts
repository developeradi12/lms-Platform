import connectDb from "@/lib/db"
import Lesson from "@/models/Lesson"
import Chapter from "@/models/Chapter"
import mongoose from "mongoose"
import { NextResponse } from "next/server"

type Params = {
  params: Promise<{ chapterId: string }>
}

export async function GET(req: Request, { params }: Params) {
  try {
    await connectDb()

    const { chapterId } = await params
    console.log("GET chapterId", chapterId)
    const chapter = await Chapter.findOne({slug:chapterId});
    console.log("found chapter", chapter)
    const lessons = await Lesson.find({ chapter: chapter?._id })
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
export async function POST(req: Request, { params }: Params) {
  try {
    await connectDb()

    // Get chapter slug from params 
    const { chapterId } = await params
    
    const chapter = await Chapter.findOne({slug:chapterId});
    console.log("chapter",chapter);
       
    // Check if chapter exists
    // const chapter = await Chapter.findOne({ slug: chapterSlug }).select("_id").lean()
    if (!chapter) {
      return NextResponse.json(
        { success: false, message: "Chapter not found" },
        { status: 404 }
      )
    }

    // Parse JSON body
    const body = await req.json()
    const { title, description, videoUrl, duration, isFreePreview } = body

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      )
    }

    // Get last lesson order
   const LastLesson = await Lesson.findOne({ chapter: chapter._id }).sort({ order: -1 })
    console.log("LastLesson",LastLesson);

    const finalOrder = (LastLesson?.order ?? 0) + 1

    // Create new lesson
    const lesson = await Lesson.create({
      title: title.trim(),
      chapter: chapter._id,
      description: description?.trim() || "",
      videoUrl: videoUrl?.trim() || "",
      duration: Number(duration) || 0,
      order: finalOrder,
      isFreePreview: Boolean(isFreePreview),
    })

    // Push lesson into chapter's lessons array
    await Chapter.updateOne(
      { _id: chapter._id },
      { $push: { lessons: lesson._id } }
    )

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