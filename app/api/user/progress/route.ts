import connectDb from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Lesson from "@/models/Lesson";
import Progress from "@/models/Progress";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import Chapter from "@/models/Chapter";
import { getSession } from "@/utils/session";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await getSession();

    const { lessonId, watchedSeconds } =
      await req.json();

    const lesson = await Lesson.findById(lessonId).populate({
      path: "chapter",
      populate: {
        path: "course",
      },
    })
    if (!lesson || !lesson.chapter) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    const courseId = lesson.chapter.course


    // 2️⃣ Check enrollment
    const enrollment = await Enrollment.findOne({
      user: session?.userId,
      course: courseId,
      status: "ACTIVE",
    })
    if (!enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in course" },
        { status: 403 }
      )
    }

    const totalSeconds = lesson.duration * 60
    const watchedPercent = (watchedSeconds / totalSeconds) * 100
    const isCompleted = watchedPercent >= 90

    // 4️⃣ Update progress
    await Progress.findOneAndUpdate(
      { user: session?.userId, lesson: lessonId },
      {
        user: session?.userId,
        lesson: lessonId,
        course: courseId,
        $max: { watchedSeconds },
        isCompleted,
        ...(isCompleted && { completedAt: new Date() }),
      },
      { upsert: true, new: true }
    )
    // Count total lesson
    const chapters = await Chapter.find({ course: courseId }).select("_id")
    const chapterIds = chapters.map(ch => ch._id)

    const totalLessons = await Lesson.countDocuments({
      chapter: { $in: chapterIds },
    })

    const completedLessons = await Progress.countDocuments({
      user: session?.userId,
      course: courseId,
      isCompleted: true,
    })

    const percentage = Math.round(
      (completedLessons / totalLessons) * 100
    )

    // 6️⃣ Update enrollment progress
    await Enrollment.findOneAndUpdate(
      { user: session?.userId, course: courseId },
      { progress: percentage }
    )

    return NextResponse.json({
      success: true,
      lessonCompleted: isCompleted,
      courseProgress: percentage,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
/* Creates progress if not exists
 Updates watchedSeconds
  Marks lesson complete
 Recalculates course %
 Updates Enrollment */