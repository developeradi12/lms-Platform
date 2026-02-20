import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import connectDb  from "@/lib/db"
import { Course } from "@/models/Course"
import { savePublicUpload } from "@/lib/uploadFile"


export async function GET() {
    try {
        await connectDb()
        const cookieStore = await cookies()
        const accessToken = cookieStore.get("accessToken")?.value

        if (!accessToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const courses = await Course.aggregate([
            {
                //$lookup is used inside Aggregation Pipeline to perform a JOIN between two collections
                //✅ Stage 1 — $lookup (Join Chapters) Joins chapters with each course.
                $lookup: {
                    from: "chapters",
                    localField: "_id",
                    foreignField: "course",
                    as: "chapters",
                },
            },
            {
                $addFields: {
                    chaptersCount: { $size: "$chapters" },
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
                //it return like that "category": [ { "name": "Web Dev" } ]
            },
            {
                $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true  //If a course has NO category: Without it → course disappears
                }
            }, // it convert this category: [{ name: "Web Dev"}]   
            // into this category: { name: "Web Dev"}
            {
                $lookup: {
                    from: "users",
                    localField: "instructor",
                    foreignField: "_id",
                    as: "instructor",
                },
            },
            { $unwind: { path: "$instructor", preserveNullAndEmptyArrays: true } },
            { $sort: { createdAt: -1 } },
        ])


        // const courses = await Course.find().populate("category").populate("instructor").sort({ createdAt: -1 }).lean()
        // const coursesWithCounts = await Promise.all(
        //     courses.map(async (course) => {
        //         const chaptersCount = await Chapter.countDocuments({ course: course._id })
        //         return { ...course, chaptersCount }
        //     })
        // )    //issue it does N queries so total queries 1+n it too slow 
        return NextResponse.json({ success: true, courses }, { status: 200 })
    } catch (error) {
      console.log(error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        )
    }
}



export async function POST(req: Request) {
  try {
    await connectDb()

    /* ---------------- AUTH ---------------- */

    const cookieStore = await cookies()
    const token = cookieStore.get("accessToken")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }
    const decoded: any = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    )

    const instructorId = decoded?.userId

    if (!instructorId || !mongoose.Types.ObjectId.isValid(instructorId)) {
      return NextResponse.json(
        { success: false, message: "Invalid instructor" },
        { status: 401 }
      )
    }

    /* ---------------- FORM DATA ---------------- */

    const formData = await req.formData()

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const price = Number(formData.get("price"))
    const durationValue = formData.get("duration")
    const duration = durationValue ? Number(durationValue) : 0
    const level = formData.get("level") as
      | "BEGINNER"
      | "INTERMEDIATE"
      | "ADVANCED"

    const isPublished = formData.get("isPublished") === "true"

    //  MULTI CATEGORY SUPPORT
    const categories = formData.getAll("categories") as string[]

    //  ARRAY FIELDS
    const tags = formData.getAll("tags") as string[]
    const prerequisites = formData.getAll("prerequisites") as string[]

    /* ---------------- THUMBNAIL ---------------- */

    const thumbnailFile = formData.get("thumbnail") as File | null
    let thumbnailPath = ""

    if (thumbnailFile && thumbnailFile.size > 0) {
      if (thumbnailFile.size > 2 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: "Image must be under 2MB" },
          { status: 400 }
        )
      }

      thumbnailPath = await savePublicUpload(
        thumbnailFile,
        { folder: "courses" }
      )
    }

    /* ---------------- CREATE COURSE ---------------- */

    const course = await Course.create({
      title,
      description,
      categories,
      price,
      duration,
      level,
      isPublished,
      thumbnail: thumbnailPath,
      instructor: instructorId,
      chapters: [],
      tags,
      prerequisites,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Course created",
        course,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("COURSE CREATE ERROR:", error)

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    )
  }
}
