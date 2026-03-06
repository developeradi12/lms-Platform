import Enrollment from "@/models/Enrollment"
import { Enrollments, EnrollmentSerialized } from "@/types/enrollment"

import "@/models/Course"
import "@/models/Progress"
import "@/models/User"
export async function getUserEnrollments(userId: string): Promise<Enrollments[]> {

  //find enrollments
  const enrollments = await Enrollment.find({ user: userId })
    .populate({
      path: "course",
      populate: [
        { path: "instructor", select: "name firstName lastName" },
        { path: "categories", select: "name slug" },
      ],
    })
    .populate({
      path: "progress",
      select: "completedLessons percentage updatedAt lastAccessedLesson",
    })
    .lean<EnrollmentSerialized[]>();

  if (!enrollments.length) return []

  const result: Enrollments[] = [];

  
  for (const enrollment of enrollments) {
    const course = enrollment.course;
    const progressDoc = enrollment.progress;

    if (!course) continue; // skip invalid safely

    const completedLessons =
      progressDoc?.completedLessons?.length || 0;

    result.push({
      enrollmentId: enrollment._id.toString(),
      courseId: course._id.toString(),
      title: course.title,
      slug: course.slug,
      thumbnail: course.thumbnail,
      instructor: course.instructor ?? null,
      completedLesson: completedLessons,
      totalDuration: course.duration,
      price: course.price,
      progress: progressDoc?.percentage ?? 0,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      lastUpdated: progressDoc?.lastAccessedLesson ?? null,
    });
  }

  return result;
}