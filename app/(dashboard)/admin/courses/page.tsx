import {  serializeCourses } from "@/lib/serializers";
import AdminCoursesClient from "./AdminCourseClient"

import connectDb from "@/lib/db";
import { Course } from "@/models/Course";

export default async function AdminCoursesPage() {
  await connectDb()

  const courses = await Course.find()
  .populate({
    path: "instructor",
    select: "name",
  })
  .lean()
  const serialized = serializeCourses(courses)

  return <AdminCoursesClient initialCourses={serialized} />
}