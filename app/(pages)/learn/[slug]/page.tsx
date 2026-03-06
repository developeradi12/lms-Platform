import { Course } from "@/models/Course";
import LearnClient from "./LearnClient";
import connectDb from "@/lib/db";
import Progress from "@/models/Progress";

import "@/models/Lesson";
import "@/models/Chapter";

import { getSession } from "@/utils/session";
import { serializeCourseDetails } from "@/lib/serializers";

type ProgressDoc = {
  completedLessons?: string[];
  lastAccessedLesson?: string;
};

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {

  await connectDb();

  const { slug } = await params;
  const session = await getSession();

  // 🔹 Fetch Course
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

  // 🔹 Fetch Progress
  const progress: any = session?.userId
    ? await Progress.findOne({
      user: session.userId,
      course: courseData._id,
    }).lean()
    : null;

  const completedLessonIds =
    progress?.completedLessons?.map((id: any) => id.toString()) ?? [];

  const lastAccessedLesson =
    progress?.lastAccessedLesson?.toString() ?? null;

  // 🔹 Merge Progress into Course
  const courseWithProgress = {
    ...courseData,

    progress: {
      completedLessons: completedLessonIds,
      lastAccessedLesson,
      percentage: progress?.percentage ?? 0,
    },

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