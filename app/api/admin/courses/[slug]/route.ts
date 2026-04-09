import { NextResponse } from "next/server"
import connectDb from "@/lib/db"
import { Course } from "@/models/Course"
import "@/models/User"
import "@/models/Chapter"
import "@/models/Lesson"
import path from "path"
import fs from "fs/promises";
import { cookies } from "next/headers"
import { getSession } from "@/utils/session"
import mongoose from "mongoose"
import Chapter from "@/models/Chapter"
import Lesson from "@/models/Lesson"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDb()
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params;
    // console.log(slug);

    const course = await Course.findOne({ slug })
      .populate("categories", "name")
      .populate("instructor", "name")
      .populate({
        path: "chapters",
        select: "title lessons",
        populate: {
          path: "lessons",
          select: "title duration videoUrl ",
        },
      })
      .lean();

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, course }, { status: 200 })
  } catch (error: any) {
    // console.log("GET COURSES ERROR:", error)

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDb()
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params;

    const course = await Course.findOne({ slug })

    if (!course) {
      return NextResponse.json(
        { message: "Not found" },
        { status: 404 }
      )
    }
    const formData = await req.formData()


    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const price = Number(formData.get("price"))
    const duration = Number(formData.get("duration") || 0)
    const level = formData.get("level") as string
    const isPublished = formData.get("isPublished") === "true"

    const metaTitle = formData.get("metaTitle") as string
    const metaDescription = formData.get("metaDescription") as string

    const categories = JSON.parse(formData.get("categories") as string || "[]")
    const tags = JSON.parse(formData.get("tags") as string || "[]")
    const prerequisites = JSON.parse(
      formData.get("prerequisites") as string || "[]"
    )

    const thumbnailFile = formData.get("thumbnail") as File | null

    let thumbnailPath = course.thumbnail;//keep old image
    // replace image
    if (thumbnailFile && thumbnailFile.size > 0) {

      // delete old image
      if (course.thumbnail) {
        const oldPath = path.join(
          process.cwd(),
          "public",
          course.thumbnail
        )

        await fs.unlink(oldPath).catch(() => { })
      }

      const bytes = await thumbnailFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const fileName = `${Date.now()}-${thumbnailFile.name}`

      const uploadDir = path.join(
        process.cwd(),
        "public/uploads"
      )

      await fs.mkdir(uploadDir, { recursive: true })

      await fs.writeFile(
        path.join(uploadDir, fileName),
        buffer
      )

      thumbnailPath = `/uploads/${fileName}`
    }
    const updated = await Course.findOneAndUpdate({ slug },
      {
        title,
        description,
        categories,
        price,
        duration,
        level,
        tags,
        prerequisites,
        metaTitle,
        metaDescription,
        isPublished,
        thumbnail: thumbnailPath,
      },
      {
        new: true,
        runValidators: true,
      },)


    return NextResponse.json(
      { success: true, message: "Course updated", course: updated },
      { status: 200 }
    )
  } catch (error: any) {
    // console.log("erorr", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await mongoose.startSession();
  try {
    await connectDb();
    session.startTransaction();

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params;

    // 1️ Find course
    const course = await Course.findOne({ slug }).session(session);

    if (!course) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }
    //  Delete all chapters of this course
    const chapters = await Chapter.find({ course: course._id }).session(session);

    const chapterIds = chapters.map((ch) => ch._id);

    // 3️ Delete all lessons inside those chapters
    await Lesson.deleteMany({ chapter: { $in: chapterIds } }).session(session);

    // 4️ Delete chapters
    await Chapter.deleteMany({ course: course._id }).session(session);

    // 5️ Delete course
    await Course.deleteOne({ _id: course._id }).session(session);

    //  Commit transaction
    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      { success: true, message: "Course + Chapters + Lessons deleted" },
      { status: 200 }
    );
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
