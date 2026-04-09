import connectDb from "@/lib/db"
import Lesson from "@/models/Lesson"
import { deleteFile } from "@/utils/deleteFile"
import { uploadFile } from "@/utils/uploadFile"
import mongoose from "mongoose"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

type Params = {
  params: Promise<{ lessonId: string }>
}

//  GET: single lesson
export async function GET(req: Request, { params }: Params) {
  try {
    await connectDb()
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { lessonId } = await params
    // console.log("GET lessonId", lessonId)
    const lesson = await Lesson.findOne({ slug: lessonId }).lean()
    // console.log("found lesson", lesson)
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

//  PATCH: update lesson
export async function PATCH(req: Request, { params }: Params) {
  try {
    await connectDb()
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { lessonId } = await params

    const formData = await req.formData()

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const videoUrl = formData.get("videoUrl") as string
    const duration = Number(formData.get("duration"))
    const isFreePreview = formData.get("isFreePreview") === "true"

    const files = formData.getAll("files") as File[]
    const types = formData.getAll("types") as string[]
    const existingRaw = formData.getAll("existing") as string[]


    const oldLesson = await Lesson.findOne({ slug: lessonId })

    if (!oldLesson) {
      return NextResponse.json({ message: "Lesson not found" }, { status: 404 })
    }

    let existingResources: any[] = []

    for (const item of existingRaw) {
      try {
        const oldFilesSet = new Set(
          oldLesson.resources.map((r: any) => r.fileUrl)
        )

        existingResources = existingResources.filter((r) =>
          oldFilesSet.has(r.fileUrl)
        )
      } catch { }
    }

    let newResources: any[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const type = types[i] === "ASSIGNMENT" ? "ASSIGNMENT" : "NOTE"

      const fileUrl = await uploadFile(file, "lessons")

      newResources.push({
        title: file.name,
        fileUrl,
        type,
      })
    }

    const oldFiles = oldLesson.resources.map((r: any) => r.fileUrl)
    const keptFiles = existingResources.map((r: any) => r.fileUrl)

    const toDelete = oldFiles.filter((f: string) => !keptFiles.includes(f))

    for (const file of toDelete) {
      try {
        await deleteFile(file)
      } catch (err) {
        console.log("Delete failed:", file)
      }
    }

    const finalResources = [...existingResources, ...newResources];
    const updated = await Lesson.findOneAndUpdate(
      { slug: lessonId },
      {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(description !== undefined ? { description: description.trim() } : {}),
        ...(videoUrl !== undefined ? { videoUrl: videoUrl || "" } : {}),
        ...(duration !== undefined ? { duration: Number(duration) || 0 } : {}),
        ...(isFreePreview !== undefined
          ? { isFreePreview: Boolean(isFreePreview) }
          : {}),
        resources: finalResources,
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

//  DELETE: delete lesson
export async function DELETE(req: Request, { params }: Params) {
  try {
    await connectDb()
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { lessonId } = await params

    const lesson = await Lesson.findOne({ slug: lessonId })

    if (!lesson) {
      return NextResponse.json({ message: "Lesson not found" }, { status: 404 })
    }
    //delete all files
    for (const res of lesson.resources) {
      await deleteFile(res.fileUrl)
    }
    //delte lesson
    await Lesson.deleteOne({ slug: lessonId })

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
