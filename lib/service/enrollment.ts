import Enrollment from "@/models/Enrollment"
import Progress from "@/models/Progress"

export async function getUserEnrollments(userId: string) {
  const enrollments = await Enrollment.find({ user: userId })
    .populate({
      path: "course",
      populate: [
        { path: "instructor", select: "name firstName lastName" },
        { path: "categories", select: "name slug" },
      ],
    })
    .lean()

  if (!enrollments.length) return []

  const courseIds = enrollments.map(
    (e: any) => e.course?._id
  )

  const progressDocs = await Progress.find({
    user: userId,
    course: { $in: courseIds },
  }).lean()

  const progressMap = new Map(
    progressDocs.map((p: any) => [
      p.course.toString(),
      p.completedLessons?.length || 0,
    ])
  )

  return enrollments
    .map((enrollment: any) => {
      const course = enrollment.course
      if (!course) return null

      const completedLessons =
        progressMap.get(course._id.toString()) || 0

      const totalLessons = course.totalLessons || 0

      const progress = totalLessons
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0

      const instructorName =
        course.instructor?.name ||
        `${course.instructor?.firstName || ""} ${course.instructor?.lastName || ""}`.trim()

      return {
        _id: course._id,
        title: course.title,
        slug: course.slug,
        thumbnail: course.thumbnail,
        instructor: instructorName,
        totalLessons,
        totalDuration: course.duration,
        price: course.price,
        progress,
      }
    })
    .filter(Boolean)
}