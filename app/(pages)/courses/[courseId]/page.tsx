import connectDb from "@/lib/db"
import { notFound } from "next/navigation"
import { Course } from "@/models/Course"
import "@/models/Chapter"
import "@/models/Lesson"
import "@/models/Category"
import "@/models/User"
import Enrollment from "@/models/Enrollment"
import User from "@/models/User"
import CourseDetailsClient from "../_components/CourseDetailsClient"


import { getSession } from "@/utils/session"

import { serializeCourseDetails } from "@/lib/serializers"
import { CourseDetailsSerialized } from "@/types/course"
import { UserSerialize } from "@/types/user"

      
export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  await connectDb()

  const slug = (await params).courseId

  // 🔹 Fetch course
  const courseDoc = await Course.findOne({ slug })
    .populate({
      path: "chapters",
      select: "title lessons",
      options: { lean: true },
      populate: {
        path: "lessons",
        select: "title duration isFreePreview videoUrl",
        options: { lean: true }
      },
    })
    .populate({ path: "categories", select: "name slug", options: { lean: true } })
    .populate({ path: "instructor", select: "firstName lastName name", options: { lean: true } })
    .lean<CourseDetailsSerialized>()

  if (!courseDoc) return notFound()

  // 🔹 Get session instead of manual JWT
  const session = await getSession()

  const isLoggedIn = !!session
  const userId = session?.userId ?? null

  // 🔹 Enrollment check
  let isEnrolled = false

  if (userId) {
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseDoc._id,
      status: "ACTIVE",
    }).lean()

    isEnrolled = !!enrollment
  }

  // 🔹 Wishlist check
  let isWishlisted = false

  if (userId) {
    const user = await User.findById(userId)
      .select("wishlist")
      .lean<UserSerialize>()
    
    isWishlisted =
      user?.wishlist?.some(
        (id: any) => id.toString() === courseDoc._id.toString()
      ) ?? false
  }

  //  Secure lesson videos
  if (!isEnrolled) {
    courseDoc.chapters.forEach((chapter: any) => {
      chapter.lessons.forEach((lesson: any) => {
        if (!lesson.isFreePreview) {
          lesson.videoUrl = null
        }
      })
    })
  }

const course = serializeCourseDetails(courseDoc)

  return (
    <CourseDetailsClient
      course={course}
      isEnrolled={isEnrolled}
      isWishlisted={isWishlisted}
      isLoggedIn={isLoggedIn}
    />
  )
}