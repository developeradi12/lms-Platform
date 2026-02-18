import { NextResponse } from "next/server"
import connectDb from "@/lib/db"
import { Course } from "@/models/Course"
import "@/models/User"
import "@/models/Chapter"
import "@/models/Lesson"
import path from "path"
import fs from "fs/promises";
import { cookies } from "next/headers"

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
    console.log(slug);

    const course = await Course.findOne({ slug })
      .populate("category", "name")
      .populate("instructor", "name")
      .populate({
        path: "chapters",
        select: "title lessons",
        populate: {
          path: "lessons",
          select: "title duration",
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
    console.log("GET COURSES ERROR:", error)

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
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params;
    // console.log("course slug", slug);
    const course = await Course.findOne({ slug })
    // console.log("course", course);
    if (!course) {
      return NextResponse.json(
        { message: "Not found" },
        { status: 404 }
      )
    }
    const formData = await req.formData()


    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const price = Number(formData.get("price"));
    const durationValue = formData.get("duration")
    const isPublished = formData.get("isPublished") === "true";
    const duration = durationValue ? Number(durationValue) : 0
    const thumbnailFile = formData.get("thumbnail") as File | null;
    let thumbnailPath = course.thumbnail;//keep old image
    // replace image
    if (thumbnailFile && thumbnailFile.size > 0) {

      // delete old image
      if (course.image) {
        const oldPath = path.join(
          process.cwd(),
          "public",
          course.image
        )

        fs.unlink(oldPath).catch(() => { })
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
        category,
        isPublished,
        price,
        duration,
        thumbnail: thumbnailPath,
      },
      {
        new: true,
        runValidators: true,
      },)


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
    console.log("erorr", error);
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
  try {
    await connectDb()
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const slug = await params;
    console.log("delete id", slug);
    const deleted = await Course.findOneAndDelete(slug)

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
