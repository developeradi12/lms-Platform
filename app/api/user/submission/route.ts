import { NextResponse } from "next/server"
import connectDb from "@/lib/db"
import Submission from "@/models/Submission"
import { getSession } from "@/utils/session"
import { uploadFile } from "@/utils/uploadFile"

export async function POST(req: Request) {
  try {
    await connectDb()

    const user = await getSession()
    const userId = user?.userId

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await req.formData()

    const file = formData.get("file") as File | null
    const lessonTitle = formData.get("lessonTitle") as string | null
    const courseId = formData.get("courseId") as string | null
    const description = formData.get("description") as string | null

    // at least something must be present
    if (!file && !lessonTitle) {
      return NextResponse.json(
        { message: "Provide at least file or lesson info" },
        { status: 400 }
      )
    }

    if (!courseId) {
      return NextResponse.json(
        { message: "Course is required" },
        { status: 400 }
      )
    }

    const fileUrl = file
      ? await uploadFile(file, "submissions")
      : ""

    //  create submission
    const submission = await Submission.create({
      user: userId,
      lessonTitle: lessonTitle || "",
      course: courseId,
      fileUrl,
      description: description || "",
      status: "PENDING",
    })

    return NextResponse.json({
      success: true,
      message: "Assignment submitted",
      submission,
    })

  } catch (error: any) {
    console.error("SUBMISSION ERROR:", error)

    return NextResponse.json(
      { message: error.message || "Upload failed" },
      { status: 500 }
    )
  }
}


export async function GET() {
  try {
    await connectDb()

    const user = await getSession()
    const userId = user?.userId

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const submissions = await Submission.find({ user: userId })
      .populate("course", "title")
      .sort({ createdAt: -1 })
      .lean()

    // frontend friendly format
    const formatted = submissions.map((s: any) => ({
      _id: s._id,
      courseTitle: s.course?.title || "No Course",
      lessonTitle: s.lessonTitle || "-",
      fileUrl: s.fileUrl,
      status: s.status,
      createdAt: s.createdAt,
    }))

    return NextResponse.json({
      success: true,
      assignments: formatted,
    })

  } catch (error: any) {
    console.error("FETCH SUBMISSIONS ERROR:", error)

    return NextResponse.json(
      { message: error.message || "Fetch failed" },
      { status: 500 }
    )
  }
}