import connectDb from "@/lib/db"
import Lesson from "@/models/Lesson"
import Chapter from "@/models/Chapter"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { Course } from "@/models/Course"
import mongoose from "mongoose"
import path from "path"
import { promises as fs } from "fs"
import { uploadFile } from "@/utils/uploadFile"

type Params = {
  params: Promise<{ chapterId: string }>
}

export async function GET(req: Request, { params }: Params) {
  try {
    await connectDb()
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { chapterId } = await params
    // console.log("GET chapterId", chapterId)
    const chapter = await Chapter.findOne({ slug: chapterId });
    // console.log("found chapter", chapter)
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
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get chapter slug from params 
    const { chapterId } = await params

    const chapter = await Chapter.findOne({ slug: chapterId });
    // console.log("chapter", chapter);

    // Check if chapter exists
    // const chapter = await Chapter.findOne({ slug: chapterSlug }).select("_id").lean()
    if (!chapter) {
      return NextResponse.json(
        { success: false, message: "Chapter not found" },
        { status: 404 }
      )
    }

    // Parse form data
    const formData = await req.formData()

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const videoUrl = formData.get("videoUrl") as string
    const duration = Number(formData.get("duration"))
    const isFreePreview = formData.get("isFreePreview") === "true"

    // files
    const files = formData.getAll("files") as File[]
    const types = formData.getAll("types") as string[]
    
    const resources = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const type = types[i]

      try {
        const fileUrl = await uploadFile(file, "lessons")

        resources.push({
          title: file.name,
          fileUrl,
          type,
        })
      } catch (err: any) {
        return NextResponse.json(
          { success: false, message: err.message },
          { status: 400 }
        )
      }
    }
    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      )
    }

    // Get last lesson order
    const LastLesson = await Lesson.findOne({ chapter: chapter._id }).sort({ order: -1 })
    // console.log("LastLesson", LastLesson);

    const finalOrder = (LastLesson?.order ?? 0) + 1

    // Create new lesson
    const lesson = await Lesson.create(
      [
        {
          title: title.trim(),
          chapter: chapter._id,
          description: description?.trim() || "",
          videoUrl: videoUrl?.trim() || "",
          duration: Number(duration) || 0,
          order: finalOrder,
          isPreview: Boolean(isFreePreview),
          resources,
        },
      ],
    )

    // Push lesson into chapter's lessons array
    await Chapter.updateOne(
      { _id: chapter._id },
      { $push: { lessons: lesson[0]._id } },
    )
    const course = await Course.findById(chapter.course)

    if (course) {
      course.totalLessons += 1
      await course.save({})
    }
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