import { Course } from "@/models/Course";
import LearnClient from "./LearnClient";
import connectDb from "@/lib/db";
import Progress from "@/models/Progress";

import "@/models/Lesson";
import "@/models/Chapter";

import { getSession } from "@/utils/session";
import { serializeCourseDetails } from "@/lib/serializers";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connectDb();
  const { slug } = await params;
  const session = await getSession();

  // 🔹 Fetch Course (Fully Populated)
  const courseData: any = await Course.findOne({ slug })
    .populate({
      path: "chapters",
      populate: { path: "lessons" },
    })
    .populate("instructor", "name bio")
    .populate("categories", "name slug")
    .lean();

  if (!courseData) {
    throw new Error("Course not found");
  }

  // 🔹 Fetch User Progress
  const progress = session?.userId
    ? await Progress.find({
        user: session.userId,
        course: courseData._id,
      }).lean()
    : [];

  const completedLessonIds = progress.map((p) =>
    p.lesson.toString()
  );

  // 🔹 Merge Progress into Lessons
  const courseWithProgress = {
    ...courseData,
    chapters: courseData.chapters.map((chapter: any) => ({
      ...chapter,
      lessons: chapter.lessons.map((lesson: any) => ({
        ...lesson,
        isComplete: completedLessonIds.includes(
          lesson._id.toString()
        ),
      })),
    })),
  };

  const serializedCourse = serializeCourseDetails(courseWithProgress);

  return <LearnClient course={serializedCourse} />;
}