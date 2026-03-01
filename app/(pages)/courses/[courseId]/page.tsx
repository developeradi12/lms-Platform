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

import { LeanUserWishlist } from "@/types/user"
import { getSession } from "@/utils/session"
import { CourseDocument } from "@/types/db"

// 🔹 Define populated course type using your type system
type PopulatedCourseDocument = Omit<
  CourseDocument,
  "instructor" | "categories" | "chapters"
> & {
  instructor: {
    _id: any
    name?: string
  }

  categories: {
    _id: any
    name: string
    slug: string
  }[]

  chapters: {
    _id: any
    title: string
    lessons: {
      _id: any
      title: string
      videoUrl?: string
      isFreePreview: boolean
    }[]
  }[]
}

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
    .lean<PopulatedCourseDocument>()

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
      .lean<LeanUserWishlist>()

    isWishlisted =
      user?.wishlist?.some(
        (id: any) => id.toString() === courseDoc._id.toString()
      ) ?? false
  }

  // 🔐 Secure lesson videos
  if (!isEnrolled) {
    courseDoc.chapters.forEach((chapter: any) => {
      chapter.lessons.forEach((lesson: any) => {
        if (!lesson.isFreePreview) {
          lesson.videoUrl = null
        }
      })
    })
  }

  // 🔹 Serialize for Client Component (RSC safe)
  const course = {
  _id: String(courseDoc._id),
  title: courseDoc.title,
  slug: courseDoc.slug,
  description: courseDoc.description,
  thumbnail: courseDoc.thumbnail,
  price: courseDoc.price,
  level: courseDoc.level,
  duration: courseDoc.duration,
  averageRating: courseDoc.averageRating,
  totalEnrollments: courseDoc.totalEnrollments,
  createdAt: courseDoc.createdAt.toISOString(),
  updatedAt: courseDoc.updatedAt.toISOString(),

  instructor: courseDoc.instructor
    ? {
        _id: String(courseDoc.instructor._id),
        firstName: courseDoc.instructor.name,
      }
    : null,

  categories: courseDoc.categories.map((cat: any) => ({
    name: cat.name,
    slug: cat.slug,
  })),

  chapters: courseDoc.chapters.map((chapter: any) => ({
    _id: String(chapter._id),
    title: chapter.title,
    lessons: chapter.lessons.map((lesson: any) => ({
      _id: String(lesson._id),
      title: lesson.title,
      videoUrl: lesson.videoUrl ?? null,
      isFreePreview: lesson.isFreePreview,
    })),
  })),
}

  return (
    <CourseDetailsClient
      course={course}
      isEnrolled={isEnrolled}
      isWishlisted={isWishlisted}
      isLoggedIn={isLoggedIn}
    />
  )
}