import connectDb from "@/lib/db"
import { notFound } from "next/navigation"
import { Course } from "@/models/Course"
import "@/models/Chapter"
import "@/models/Lesson"
import CourseDetailsClient from "../_components/CourseDetailsClient"

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  await connectDb()

  const slug = (await params).courseId

  const courseDoc = await Course.findOne({ slug })
    .select("title slug description thumbnail price level chapters category instructor createdAt")
    .populate({
      path: "chapters",
      select: "title description lessons",
      populate: {
        path: "lessons",
        select: "title duration isFreePreview videoUrl",
      },
    })
    .populate({ path: "category", select: "name slug" })
    .populate({ path: "instructor", select: "firstName lastName name" })
    .lean()

  if (!courseDoc) return notFound()

  const course = JSON.parse(JSON.stringify(courseDoc))

  return <CourseDetailsClient course={course} />
}