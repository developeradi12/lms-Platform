import connectDb from "@/lib/db"
import { notFound } from "next/navigation"
import { Course } from "@/models/Course"
import "@/models/Chapter"
import "@/models/Lesson"
import "@/models/Category"
import CourseDetailsClient from "../_components/CourseDetailsClient"
import { cookies } from "next/headers"
import User from "@/models/User"
import jwt from "jsonwebtoken"
import { Course as CourseType } from "@/types/course"


type PopulatedCourse = CourseType & {
  categories: Array<{ name: string; slug: string }>;
  chapters: Array<{
    _id: string;
    title: string;
    lessons: Array<{
      _id: string;
      title: string;
      videoUrl?: string;
      isFreePreview: boolean;
    }>;
  }>;
};
export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  await connectDb()
  const slug = (await params).courseId

  const courseDoc = await (Course.findOne({ slug })
    .populate({
      path: "chapters",
      select: "title description lessons",
      populate: {
        path: "lessons",
        select: "title duration isFreePreview videoUrl",
      },
    })
    .populate({ path: "categories", select: "name slug" })
    .populate({ path: "instructor", select: "firstName lastName name" })
    .lean() as Promise<PopulatedCourse | null>);

  if (!courseDoc) return notFound()

  const cookieStore = await cookies()
  const token = cookieStore.get("accessToken")?.value
  let isEnrolled = false;
  if (token) {
    try {
      const decoded: any = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      )
      console.log(decoded);
      const user = await User.findById(decoded.userId).select("enrolledCourses")
      if (user && user.enrolledCourses) {
        isEnrolled = user.enrolledCourses.some(
          (id: any) => id.toString() === courseDoc._id.toString())
        console.log("Is Enrolled Result:", isEnrolled);
      }
    } catch (error) {
      console.log("JWT Error:", error)
    }
  }
  // If not enrolled, strip videoUrls from lessons that aren't previews
  (courseDoc.chapters as PopulatedCourse['chapters']).forEach((chapter: any) => {
    chapter.lessons.forEach((lesson: any) => {
      if (!isEnrolled && !lesson.isFreePreview) {
        lesson.videoUrl = null; // Hide the URL from the client bundle
      }
    });
  });
  const course = JSON.parse(JSON.stringify(courseDoc))

  return <CourseDetailsClient course={course} isEnrolled={isEnrolled} />
}